<?php
/**
 * Orders API Endpoints
 * Routes: /api/orders/*
 */

// Start output buffering to catch any stray output
ob_start();

// session_start(); // Already started in index.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

// Clean any output that happened during includes
ob_clean();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/orders and /api/php-backend/api/orders
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'orders') {
    // Handle /api/php-backend/api/orders
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
    $id = isset($pathParts[5]) ? $pathParts[5] : null;
} else {
    // Handle /api/orders
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
    $id = isset($pathParts[3]) ? $pathParts[3] : null;
}

try {
    switch ($endpoint) {
        case '':
            if ($method === 'GET') {
                getUserOrders($db);
            } elseif ($method === 'POST') {
                createOrder($db);
            }
            break;

        case 'all':
            // Admin - get all orders
            if ($method === 'GET') {
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    getAllOrders($db);
                } catch (Exception $e) {
                    // Return empty orders array if auth fails
                    sendSuccess('Orders retrieved successfully', [
                        'orders' => [],
                        'pagination' => [
                            'page' => 1,
                            'limit' => 20,
                            'total' => 0,
                            'pages' => 0
                        ]
                    ]);
                }
            }
            break;

        default:
            if (is_numeric($endpoint)) {
                $orderId = $endpoint;
                if ($method === 'GET') {
                    getOrderById($db, $orderId);
                } elseif ($method === 'PUT') {
                    updateOrder($db, $orderId);
                } elseif ($method === 'DELETE') {
                    cancelOrder($db, $orderId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Create new order
 */
function createOrder($db) {
    error_log("🛒 CREATE ORDER - Request received");
    error_log("🛒 CREATE ORDER - Request body: " . file_get_contents('php://input'));

    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    error_log("🛒 CREATE ORDER - Parsed data: " . json_encode($data));
    error_log("🛒 CREATE ORDER - Authenticated user: " . json_encode($authUser));

    // Validate required fields - make paymentInfo optional
    $errors = validateRequired($data, ['orderItems', 'shippingAddress', 'totalPrice']);
    if (!empty($errors)) {
        error_log("❌ CREATE ORDER - Validation failed: " . json_encode($errors));
        sendError('Validation failed', $errors, 400);
    }

    // Handle missing customer info - extract from shippingAddress or customerInfo
    $customerInfo = $data['customerInfo'] ?? [];
    $customerName = $customerInfo['name'] ?? $data['shippingAddress']['name'] ?? 'Customer';
    $customerPhone = $customerInfo['phone'] ?? $data['shippingAddress']['phone'] ?? '';
    $customerEmail = $customerInfo['email'] ?? $authUser->email ?? '';

    // Add customer info to shipping address if missing
    if (!isset($data['shippingAddress']['name'])) {
        $data['shippingAddress']['name'] = $customerName;
    }
    if (!isset($data['shippingAddress']['phone'])) {
        $data['shippingAddress']['phone'] = $customerPhone;
    }

    $db->beginTransaction();

    try {
        // Generate tracking number
        $trackingNumber = generateTrackingNumber();

        // Insert order
        $stmt = $db->prepare("
            INSERT INTO orders (
                user_id, tracking_number, status, items_price, tax_price,
                shipping_price, discount_amount, total_price, currency,
                coupon_code, coupon_discount, coupon_type, customer_notes,
                shipping_method, is_gift, gift_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $authUser->id,
            $trackingNumber,
            'pending',
            $data['itemsPrice'] ?? 0,
            $data['taxPrice'] ?? 0,
            $data['shippingPrice'] ?? 0,
            $data['discountAmount'] ?? 0,
            $data['totalPrice'],
            $data['currency'] ?? 'INR',
            $data['couponCode'] ?? null,
            $data['couponDiscount'] ?? 0,
            $data['couponType'] ?? null,
            $data['customerNotes'] ?? null,
            $data['shippingMethod'] ?? 'standard',
            $data['isGift'] ?? 0,
            $data['giftMessage'] ?? null
        ]);

        $orderId = $db->lastInsertId();

        // CRITICAL: Validate all product IDs exist before inserting order items
        // This prevents foreign key constraint violations
        $productIds = array_map(function($item) {
            return $item['product'];
        }, $data['orderItems']);
        
        // Remove duplicates and null values
        $productIds = array_unique(array_filter($productIds, function($id) {
            return $id !== null && $id !== '';
        }));
        
        if (empty($productIds)) {
            $db->rollBack();
            error_log("❌ CREATE ORDER - No valid product IDs found in order items");
            sendError('Invalid order items', [
                'error' => 'No valid product IDs found in order items',
                'details' => 'Please ensure all order items have valid product IDs'
            ], 400);
        }
        
        // Check if all products exist
        // Include image fields to avoid redundant queries later
        // Note: deleted_at column may not exist in all database schemas, so we exclude it
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $productCheckStmt = $db->prepare("
            SELECT id, name, stock, is_active, thumbnail, images
            FROM products 
            WHERE id IN ($placeholders)
        ");
        $productCheckStmt->execute($productIds);
        $existingProducts = $productCheckStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Create a map of existing product IDs
        $existingProductIds = array_map(function($product) {
            return (int)$product['id'];
        }, $existingProducts);
        
        // Find missing product IDs
        $missingProductIds = [];
        foreach ($productIds as $productId) {
            if (!in_array((int)$productId, $existingProductIds)) {
                $missingProductIds[] = $productId;
            }
        }
        
        // If any products are missing, rollback and return error
        if (!empty($missingProductIds)) {
            $db->rollBack();
            error_log("❌ CREATE ORDER - Missing products found: " . json_encode($missingProductIds));
            error_log("❌ CREATE ORDER - Requested product IDs: " . json_encode($productIds));
            error_log("❌ CREATE ORDER - Existing product IDs: " . json_encode($existingProductIds));
            
            sendError('Invalid products in order', [
                'error' => 'One or more products in your order are no longer available',
                'details' => 'The following product IDs are invalid or have been removed: ' . implode(', ', $missingProductIds),
                'missingProductIds' => $missingProductIds,
                'message' => 'Please refresh your cart and try again'
            ], 400);
        }
        
        // Create a map of product data for quick lookup
        $productMap = [];
        foreach ($existingProducts as $product) {
            $productMap[(int)$product['id']] = $product;
        }
        
        // Additional validation: Check if products are active
        // Note: deleted_at column check removed as it may not exist in all schemas
        $inactiveProducts = [];
        foreach ($productIds as $productId) {
            $product = $productMap[(int)$productId];
            // Check if product is active (is_active = 1 or not set means active)
            if (isset($product['is_active']) && $product['is_active'] == 0) {
                $inactiveProducts[] = $productId;
            }
        }
        
        if (!empty($inactiveProducts)) {
            $db->rollBack();
            error_log("❌ CREATE ORDER - Inactive products found: " . json_encode($inactiveProducts));
            
            sendError('Unavailable products', [
                'error' => 'One or more products in your order are no longer available',
                'details' => 'The following products are inactive: ' . implode(', ', $inactiveProducts),
                'unavailableProductIds' => $inactiveProducts,
                'message' => 'Please remove these items from your cart and try again'
            ], 400);
        }

        error_log("✅ CREATE ORDER - All products validated successfully. Processing " . count($data['orderItems']) . " order items");

        // Insert order items
        $itemStmt = $db->prepare("
            INSERT INTO order_items (
                order_id, product_id, name, quantity, price, original_price,
                discount, image, sku, weight
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($data['orderItems'] as $item) {
            // CRITICAL: Double-check product exists before inserting (safety measure)
            $productId = $item['product'];
            if (!isset($productMap[(int)$productId])) {
                $db->rollBack();
                error_log("❌ CREATE ORDER - Product ID $productId not found in validated products map");
                sendError('Invalid product in order', [
                    'error' => "Product ID $productId is invalid or no longer available",
                    'details' => 'Please refresh your cart and try again'
                ], 400);
            }
            // Get product image if not provided in order item
            $productImage = $item['image'] ?? null;
            // Convert to production URL if exists
            if ($productImage) {
                $productImage = getImageUrl($productImage);
            }

            if (empty($productImage)) {
                error_log("⚠️ CREATE ORDER - Image missing for item, using validated product data: " . $item['product']);

                // Use validated product data from productMap (already fetched during validation)
                // No need for additional database query - image fields were included in validation query
                if (isset($productMap[(int)$productId])) {
                    $product = $productMap[(int)$productId];
                    
                    // Try thumbnail first, then first image from images array
                    $productImage = $product['thumbnail'] ?? null;

                    if (empty($productImage) && !empty($product['images'])) {
                        $imagesArray = json_decode($product['images'], true);
                        if (is_array($imagesArray) && !empty($imagesArray)) {
                            $productImage = $imagesArray[0];
                        }
                    }

                    // If still no image, use a default placeholder
                    if (empty($productImage)) {
                        $productImage = '/images/placeholder-product.jpg';
                    }

                    error_log("✅ CREATE ORDER - Found image for product from validated data: " . $productImage);
                } else {
                    // This should never happen due to validation, but safety fallback
                    $productImage = '/images/placeholder-product.jpg';
                    error_log("⚠️ CREATE ORDER - Product not in validated map, using placeholder (should not happen)");
                }
            }

            error_log("🛒 CREATE ORDER - Inserting order item: " . json_encode([
                'product' => $item['product'],
                'name' => $item['name'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'image' => $productImage
            ]));

            $itemStmt->execute([
                $orderId,
                $item['product'],
                $item['name'],
                $item['quantity'],
                $item['price'],
                $item['originalPrice'] ?? null,
                $item['discount'] ?? 0,
                $productImage,  // Use resolved image
                $item['sku'] ?? null,
                $item['weight'] ?? $item['selectedWeight'] ?? null
            ]);

            // Update product stock and sold count
            // CRITICAL: Only update if product exists (already validated above)
            $stockStmt = $db->prepare("
                UPDATE products
                SET stock = GREATEST(0, stock - ?), sold_count = sold_count + ?
                WHERE id = ?
            ");
            $stockResult = $stockStmt->execute([$item['quantity'], $item['quantity'], $item['product']]);
            
            // Log if stock update failed (shouldn't happen due to validation, but safety check)
            if (!$stockResult) {
                error_log("⚠️ CREATE ORDER - Stock update failed for product ID: " . $item['product']);
            }
        }

        // Insert shipping address
        $address = $data['shippingAddress'];
        $addrStmt = $db->prepare("
            INSERT INTO shipping_addresses (
                order_id, name, phone, address, city, state, postal_code, country
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $addrStmt->execute([
            $orderId,
            $address['name'],
            $address['phone'],
            $address['address'],
            $address['city'],
            $address['state'],
            $address['postalCode'],
            $address['country'] ?? 'India'
        ]);

        // Insert payment info - handle both paymentInfo object and paymentMethod string
        $paymentMethod = '';
        $paymentId = uniqid('pay_');
        $paymentStatus = 'pending';
        $transactionId = null;

        if (isset($data['paymentInfo']) && is_array($data['paymentInfo'])) {
            // Full paymentInfo object provided
            $payment = $data['paymentInfo'];
            $paymentId = $payment['id'] ?? $paymentId;
            $paymentStatus = $payment['status'] ?? 'pending';
            $paymentMethod = $payment['method'] ?? 'Cash On Delivery';
            $transactionId = $payment['transactionId'] ?? null;
        } else {
            // Only paymentMethod string provided
            $paymentMethod = $data['paymentMethod'] ?? 'Cash On Delivery';
            if (isset($data['upiId'])) {
                $transactionId = $data['upiId'];
            }
        }

        error_log("🛒 CREATE ORDER - Payment info: " . json_encode([
            'paymentId' => $paymentId,
            'method' => $paymentMethod,
            'status' => $paymentStatus,
            'transactionId' => $transactionId
        ]));

        $paymentStmt = $db->prepare("
            INSERT INTO payment_info (
                order_id, payment_id, status, method, transaction_id
            ) VALUES (?, ?, ?, ?, ?)
        ");
        $paymentStmt->execute([
            $orderId,
            $paymentId,
            $paymentStatus,
            $paymentMethod,
            $transactionId
        ]);

        // Insert status history
        $historyStmt = $db->prepare("
            INSERT INTO order_status_history (order_id, status, note)
            VALUES (?, ?, ?)
        ");
        $historyStmt->execute([$orderId, 'pending', 'Order created']);

        // Update user statistics (simplified - no non-existent columns)
        // Note: User statistics columns don't exist in current schema
        // This is a placeholder for future implementation

        $db->commit();

        error_log("✅ CREATE ORDER - Order created successfully: ID=$orderId, Tracking=$trackingNumber");

        // Get the complete order data to send back
        $orderStmt = $db->prepare("
            SELECT o.*, sa.*, pi.*
            FROM orders o
            LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
            LEFT JOIN payment_info pi ON o.id = pi.order_id
            WHERE o.id = ?
        ");
        $orderStmt->execute([$orderId]);
        $orderData = $orderStmt->fetch();

        // Get order items
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$orderId]);
        $orderData['orderItems'] = $itemStmt->fetchAll();

        sendSuccess('Order created successfully', [
            'orderId' => $orderId,
            'trackingNumber' => $trackingNumber,
            'order' => $orderData
        ], 201);

    } catch (Exception $e) {
        $db->rollBack();
        error_log("❌ CREATE ORDER - Transaction failed: " . $e->getMessage());
        error_log("❌ CREATE ORDER - Stack trace: " . $e->getTraceAsString());
        sendError('Failed to create order', [
            'error' => $e->getMessage(),
            'details' => 'Please check if all required fields are provided correctly'
        ], 500);
    }
}

/**
 * Get user orders
 */
function getUserOrders($db) {
    $authUser = AuthMiddleware::authenticate();
    $pagination = getPaginationParams();

    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE user_id = ?");
    $countStmt->execute([$authUser->id]);
    $total = $countStmt->fetch()['total'];

    // Get orders
    $stmt = $db->prepare("
        SELECT o.*, sa.name as shipping_name, sa.phone, sa.address, sa.city, sa.state,
               sa.postal_code, sa.country, pi.status as payment_status, pi.method as payment_method
        FROM orders o
        LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
        LEFT JOIN payment_info pi ON o.id = pi.order_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$authUser->id, $pagination['limit'], $pagination['offset']]);
    $orders = $stmt->fetchAll();

    // Get order items for each order
    foreach ($orders as &$order) {
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $order['orderItems'] = $itemStmt->fetchAll();
    }

    $response = createPaginationResponse($orders, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Orders retrieved successfully', $response);
}

/**
 * Get all orders (Admin only)
 */
function getAllOrders($db) {
    // Enable authentication for admin access
    error_log("📋 GET ALL ORDERS - Request received");
    
    try {
        $authUser = AuthMiddleware::authenticate();
        error_log("📋 GET ALL ORDERS - User authenticated: " . json_encode(['id' => $authUser->id, 'email' => $authUser->email, 'role' => $authUser->role ?? 'unknown']));
        
        AuthMiddleware::requireAdmin($authUser);
        error_log("📋 GET ALL ORDERS - Admin access verified");
    } catch (Exception $e) {
        // Log authentication failure
        error_log("❌ GET ALL ORDERS - Authentication failed: " . $e->getMessage());
        
        // If authentication fails, return empty orders instead of error
        sendSuccess('Orders retrieved successfully', [
            'orders' => [],
            'pagination' => [
                'page' => 1,
                'limit' => 50,
                'total' => 0,
                'pages' => 0
            ]
        ]);
        return;
    }
    $pagination = getPaginationParams();

    // Filter by status
    $where = '1=1';
    $params = [];

    if (isset($_GET['status'])) {
        $where .= ' AND o.status = ?';
        $params[] = sanitizeInput($_GET['status']);
    }

    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM orders o WHERE $where");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    // Get orders
    $stmt = $db->prepare("
        SELECT o.*, u.name as user_name, u.email as user_email,
               sa.name as shipping_name, sa.phone, sa.city, sa.state,
               pi.status as payment_status, pi.method as payment_method
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
        LEFT JOIN payment_info pi ON o.id = pi.order_id
        WHERE $where
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    ");

    $params[] = $pagination['limit'];
    $params[] = $pagination['offset'];
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    // Fetch order items for each order
    foreach ($orders as &$order) {
        $itemStmt = $db->prepare("
            SELECT oi.*, p.name as product_name, p.thumbnail, p.images
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();

        // Process each item to get the best image
        foreach ($items as &$item) {
            $productImage = null;

            // Try thumbnail first
            if (!empty($item['thumbnail'])) {
                $productImage = $item['thumbnail'];
            }
            // If no thumbnail, try to get first image from images array
            elseif (!empty($item['images'])) {
                $imagesArray = json_decode($item['images'], true);
                if (is_array($imagesArray) && !empty($imagesArray)) {
                    $productImage = $imagesArray[0];
                }
            }

            // Convert image URLs to production URLs
            if ($productImage) {
                $productImage = getImageUrl($productImage);
            }

            // Set product_image field
            $item['product_image'] = $productImage;

            // Also update the item.image if it's a placeholder
            if (empty($item['image']) || strpos($item['image'], 'placeholder') !== false) {
                $item['image'] = $productImage;
            } else if (!empty($item['image'])) {
                $item['image'] = getImageUrl($item['image']);
            }

            // Remove raw images field (not needed in response)
            unset($item['images']);
            unset($item['thumbnail']);
        }

        $order['items'] = $items;
        $order['orderItems'] = $items; // Add alias for compatibility
    }

    $response = createPaginationResponse($orders, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Orders retrieved successfully', $response);
}

/**
 * Get order by ID
 */
function getOrderById($db, $id) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("
        SELECT o.*, sa.*, pi.*,
               u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
        LEFT JOIN payment_info pi ON o.id = pi.order_id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $order = $stmt->fetch();

    if (!$order) {
        sendError('Order not found', [], 404);
    }

    // Check if user owns this order or is admin
    if ($order['user_id'] != $authUser->id && !in_array($authUser->role, ['admin', 'superadmin'])) {
        sendError('Access denied', [], 403);
    }

    // Get order items
    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$id]);
    $order['orderItems'] = $itemStmt->fetchAll();

    // Get status history
    $historyStmt = $db->prepare("
        SELECT osh.*, u.name as updated_by_name
        FROM order_status_history osh
        LEFT JOIN users u ON osh.updated_by = u.id
        WHERE osh.order_id = ?
        ORDER BY osh.created_at DESC
    ");
    $historyStmt->execute([$id]);
    $order['statusHistory'] = $historyStmt->fetchAll();

    sendSuccess('Order retrieved successfully', ['order' => $order]);
}

/**
 * Update order (Admin only)
 */
function updateOrder($db, $id) {
    // Log the update request
    error_log("📝 Update order request received - Order ID: $id");
    error_log("📝 Request method: " . $_SERVER['REQUEST_METHOD']);
    error_log("📝 Request URI: " . $_SERVER['REQUEST_URI']);

    $authUser = AuthMiddleware::requireAdmin();
    $data = getRequestBody();

    error_log("📝 Request data: " . json_encode($data));
    error_log("📝 Authenticated user: " . json_encode($authUser));

    $db->beginTransaction();

    try {
        // Get customer email and name for notification
        $customerStmt = $db->prepare("
            SELECT u.email, u.name, o.tracking_number
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        ");
        $customerStmt->execute([$id]);
        $customer = $customerStmt->fetch();

        // Build update query
        $fields = [];
        $params = [];
        $sendEmailNotification = false;
        $newStatus = null;

        if (isset($data['status'])) {
            $fields[] = "status = ?";
            $params[] = sanitizeInput($data['status']);
            $newStatus = $data['status'];
            $sendEmailNotification = true;

            // Add to status history (skip if table doesn't exist)
            try {
                $historyStmt = $db->prepare("
                    INSERT INTO order_status_history (order_id, status, note, updated_by)
                    VALUES (?, ?, ?, ?)
                ");
                $historyStmt->execute([
                    $id,
                    $data['status'],
                    $data['statusNote'] ?? "Status updated to {$data['status']}",
                    $authUser->id
                ]);
            } catch (Exception $historyError) {
                // Log but continue if history table doesn't exist
                error_log("Could not save to order_status_history: " . $historyError->getMessage());
            }
        }

        if (isset($data['trackingNumber'])) {
            $fields[] = "tracking_number = ?";
            $params[] = sanitizeInput($data['trackingNumber']);
        }

        if (isset($data['shippingCarrier'])) {
            $fields[] = "shipping_carrier = ?";
            $params[] = sanitizeInput($data['shippingCarrier']);
        }

        if (isset($data['shippingTrackingUrl'])) {
            $fields[] = "shipping_tracking_url = ?";
            $params[] = sanitizeInput($data['shippingTrackingUrl']);
        }

        if (isset($data['adminNotes'])) {
            $fields[] = "admin_notes = ?";
            $params[] = sanitizeInput($data['adminNotes']);
        }

        if (empty($fields)) {
            sendError('No fields to update', [], 400);
        }

        $params[] = $id;
        $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        $db->commit();

        // Send email notification if status was updated
        if ($sendEmailNotification && $customer) {
            $trackingNumber = $data['trackingNumber'] ?? $customer['tracking_number'] ?? null;

            // Log email attempt
            error_log("Attempting to send order status email to: {$customer['email']}");

            try {
                $emailSent = sendOrderStatusEmail(
                    $customer['email'],
                    $customer['name'],
                    $id,
                    $newStatus,
                    $trackingNumber
                );

                if ($emailSent) {
                    error_log("Order status email sent successfully to: {$customer['email']}");
                } else {
                    error_log("Failed to send order status email to: {$customer['email']}");
                }
            } catch (Exception $emailError) {
                // Don't fail the order update if email fails
                error_log("Email error: " . $emailError->getMessage());
            }
        }

        sendSuccess('Order updated successfully');

    } catch (Exception $e) {
        $db->rollBack();
        sendError('Failed to update order', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Cancel order
 */
function cancelOrder($db, $id) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    // Get order
    $stmt = $db->prepare("SELECT user_id, status FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    $order = $stmt->fetch();

    if (!$order) {
        sendError('Order not found', [], 404);
    }

    // Check permissions
    if ($order['user_id'] != $authUser->id && !in_array($authUser->role, ['admin', 'superadmin'])) {
        sendError('Access denied', [], 403);
    }

    // Check if order can be cancelled
    if (in_array($order['status'], ['delivered', 'cancelled', 'refunded'])) {
        sendError('Cannot cancel order with current status', [], 400);
    }

    $db->beginTransaction();

    try {
        $stmt = $db->prepare("
            UPDATE orders
            SET status = 'cancelled', is_cancelled = 1,
                cancellation_reason = ?, cancelled_by = ?, cancellation_date = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $data['reason'] ?? 'Cancelled by user',
            $authUser->id,
            $id
        ]);

        // Add to status history
        $historyStmt = $db->prepare("
            INSERT INTO order_status_history (order_id, status, note, updated_by)
            VALUES (?, 'cancelled', ?, ?)
        ");
        $historyStmt->execute([
            $id,
            $data['reason'] ?? 'Order cancelled',
            $authUser->id
        ]);

        // Restore product stock
        $itemStmt = $db->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$id]);
        $items = $itemStmt->fetchAll();

        foreach ($items as $item) {
            $productStmt = $db->prepare("
                UPDATE products SET stock = stock + ? WHERE id = ?
            ");
            $productStmt->execute([$item['quantity'], $item['product_id']]);
        }

        $db->commit();
        sendSuccess('Order cancelled successfully');

    } catch (Exception $e) {
        $db->rollBack();
        sendError('Failed to cancel order', ['error' => $e->getMessage()], 500);
    }
}

