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

$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($requestUri, PHP_URL_PATH) ?? '';
$pathParts = array_filter(explode('/', trim($path, '/')));
$pathParts = array_values($pathParts); // Re-index array

// Log for debugging
error_log("🔍 ORDERS API - Full URI: $requestUri");
error_log("🔍 ORDERS API - Path: $path");
error_log("🔍 ORDERS API - Path Parts: " . json_encode($pathParts));

// Handle multiple path formats:
// /api/orders
// /api/orders/all
// /api/php-backend/api/orders
// /backend/api/orders
$endpoint = '';
$id = null;

if (isset($pathParts[0]) && $pathParts[0] === 'api' && isset($pathParts[1]) && $pathParts[1] === 'orders') {
    // Handle /api/orders or /api/orders/all
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
    $id = isset($pathParts[3]) ? $pathParts[3] : null;
} elseif (isset($pathParts[0]) && $pathParts[0] === 'php-backend' && isset($pathParts[1]) && $pathParts[1] === 'api' && isset($pathParts[2]) && $pathParts[2] === 'orders') {
    // Handle /api/php-backend/api/orders
    $endpoint = isset($pathParts[3]) ? $pathParts[3] : '';
    $id = isset($pathParts[4]) ? $pathParts[4] : null;
} elseif (isset($pathParts[0]) && $pathParts[0] === 'backend' && isset($pathParts[1]) && $pathParts[1] === 'api' && isset($pathParts[2]) && $pathParts[2] === 'orders') {
    // Handle /backend/api/orders
    $endpoint = isset($pathParts[3]) ? $pathParts[3] : '';
    $id = isset($pathParts[4]) ? $pathParts[4] : null;
} else {
    // Fallback: try to find "orders" in path
    $ordersIndex = array_search("orders", $pathParts);
    if ($ordersIndex !== false && isset($pathParts[$ordersIndex + 1])) {
        $endpoint = $pathParts[$ordersIndex + 1];
        $id = isset($pathParts[$ordersIndex + 2]) ? $pathParts[$ordersIndex + 2] : null;
    }
}

error_log("🔍 ORDERS API - Extracted endpoint: '$endpoint', id: " . ($id ?? 'null'));

try {
    switch ($endpoint) {
        case '':
        case null:
            if ($method === 'GET') {
                getUserOrders($db);
            } elseif ($method === 'POST') {
                createOrder($db);
            } else {
                ob_clean();
                sendError('Method not allowed', [], 405);
            }
            break;

        case 'all':
            // Admin - get all orders
            if ($method === 'GET') {
                error_log("✅ ORDERS API - Routing to getAllOrders() for /api/orders/all");
                try {
                    // Authentication is handled inside getAllOrders() function
                    // If auth fails there, it will return empty orders
                    // This allows better error logging
                    getAllOrders($db);
                } catch (Throwable $e) {
                    ob_clean(); // Clear any output
                    error_log("❌ GET ALL ORDERS - Route handler error: " . $e->getMessage());
                    error_log("❌ GET ALL ORDERS - Stack trace: " . $e->getTraceAsString());
                    
                    sendError('Failed to retrieve orders', [
                        'error' => 'Server error occurred',
                        'details' => 'Please try again later'
                    ], 500);
                }
            } else {
                ob_clean();
                sendError('Method not allowed', [], 405);
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
                } else {
                    ob_clean();
                    sendError('Method not allowed', [], 405);
                }
            } else {
                ob_clean();
                error_log("❌ ORDERS API - Endpoint not found: '$endpoint'");
                error_log("❌ ORDERS API - Full path: $path");
                error_log("❌ ORDERS API - Path parts: " . json_encode($pathParts));
                error_log("❌ ORDERS API - Available endpoints: '', 'all', or numeric ID");
                sendError('Endpoint not found', [
                    'endpoint' => $endpoint,
                    'path' => $path,
                    'available' => ['', 'all', 'numeric_id']
                ], 404);
            }
    }
} catch (Exception $e) {
    ob_clean();
    error_log("❌ ORDERS API - Exception: " . $e->getMessage());
    error_log("❌ ORDERS API - Stack trace: " . $e->getTraceAsString());
    sendError('Server error', ['error' => $e->getMessage()], 500);
} catch (Throwable $e) {
    ob_clean();
    error_log("❌ ORDERS API - Fatal error: " . $e->getMessage());
    sendError('Server error', ['error' => 'An unexpected error occurred'], 500);
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
        // Generate unique 6-digit order ID (generated once, never regenerated)
        $uniqueOrderId = generateUniqueOrderId($db);
        
        // Validate it's exactly 6 digits
        if (strlen($uniqueOrderId) !== 6 || !is_numeric($uniqueOrderId)) {
            error_log("⚠️ Invalid order ID generated, regenerating: $uniqueOrderId");
            // Regenerate if invalid
            $uniqueOrderId = generateUniqueOrderId($db);
        }
        
        error_log("✅ Final unique 6-digit order ID: $uniqueOrderId");
        
        // Generate tracking number
        $trackingNumber = generateTrackingNumber();

        // Insert order record (order_number will be set after insertion)
        $stmt = $db->prepare("
            INSERT INTO orders (
                user_id, tracking_number, status, items_price, tax_price,
                shipping_price, discount_amount, total_price, currency,
                coupon_code, coupon_discount, coupon_type, customer_notes,
                shipping_method, is_gift, gift_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $authUser ? $authUser->id : null,  // Allow NULL user_id for guest checkout
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
        
        // Update order with unique 6-digit order number if column exists
        // Try to add order_number column if it doesn't exist (with error handling)
        // CRITICAL: This order number is generated once and NEVER regenerated
        $columnExists = false;
        try {
            $checkStmt = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
            $columnExists = $checkStmt && $checkStmt->rowCount() > 0;
            
            if (!$columnExists) {
                try {
                    // Add column with UNIQUE constraint to prevent duplicates
                    // NULL allowed initially to handle existing orders, but we always set it for new orders
                    $alterStmt = $db->prepare("ALTER TABLE orders ADD COLUMN order_number VARCHAR(10) UNIQUE NULL AFTER id");
                    $alterStmt->execute();
                    error_log("✅ Added order_number column to orders table");
                    $columnExists = true;
                } catch (PDOException $alterE) {
                    // Check if column already exists by different error message
                    if (strpos($alterE->getMessage(), 'Duplicate column name') !== false || 
                        strpos($alterE->getMessage(), 'already exists') !== false ||
                        strpos($alterE->getMessage(), 'Duplicate key name') !== false) {
                        $columnExists = true;
                        error_log("✅ order_number column already exists");
                    } else {
                        error_log("⚠️ Could not add order_number column: " . $alterE->getMessage());
                        // Continue without the column - order will still be created
                    }
                }
            } else {
                error_log("✅ order_number column already exists");
            }
        } catch (PDOException $e) {
            // If we can't check, assume column doesn't exist
            error_log("⚠️ Could not check for order_number column: " . $e->getMessage());
            $columnExists = false;
        }
        
        // CRITICAL: Update the order with unique 6-digit order number (only if column exists)
        // This is set once and NEVER changed
        if ($columnExists) {
            try {
                // Check if order_number is already set (should never happen, but safety check)
                $checkStmt = $db->prepare("SELECT order_number FROM orders WHERE id = ?");
                $checkStmt->execute([$orderId]);
                $existingOrderNumber = $checkStmt->fetchColumn();
                
                if (empty($existingOrderNumber)) {
                    // Only set if not already set (prevents regeneration)
                    // Format as 6-digit string before storing
                    $formattedUniqueId = str_pad((string)$uniqueOrderId, 6, '0', STR_PAD_LEFT);
                    $updateStmt = $db->prepare("UPDATE orders SET order_number = ? WHERE id = ? AND (order_number IS NULL OR order_number = '')");
                    $updateStmt->execute([$formattedUniqueId, $orderId]);
                    
                    if ($updateStmt->rowCount() > 0) {
                        error_log("✅ Set unique 6-digit order_number: $formattedUniqueId for order ID: $orderId");
                        // Update the variable to use formatted version
                        $uniqueOrderId = $formattedUniqueId;
                    } else {
                        // Order number might already be set, fetch it
                        $checkStmt->execute([$orderId]);
                        $existingOrderNumber = $checkStmt->fetchColumn();
                        if (!empty($existingOrderNumber)) {
                            $uniqueOrderId = $existingOrderNumber; // Use existing number
                            error_log("✅ Using existing order_number: $uniqueOrderId for order ID: $orderId");
                        } else {
                            error_log("⚠️ Could not set order_number for order ID: $orderId");
                        }
                    }
                } else {
                    // Order number already exists, use it (never regenerate)
                    $uniqueOrderId = $existingOrderNumber;
                    error_log("✅ Order already has order_number: $uniqueOrderId (not regenerating)");
                }
            } catch (PDOException $e) {
                error_log("⚠️ Could not update order_number: " . $e->getMessage());
                // Continue anyway - we'll use order ID as fallback
                // Don't fail the entire order creation if this fails
            }
        } else {
            error_log("⚠️ order_number column not available, order will use ID: $orderId");
            // Store the uniqueOrderId in the response anyway, even if column doesn't exist
            // Frontend can still use it
        }

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

            // Handle weight field - convert selectedWeight object to string if needed
            $weightValue = null;
            if (!empty($item['weight'])) {
                $weightValue = $item['weight'];
            } elseif (!empty($item['selectedWeight'])) {
                // If selectedWeight is an object, extract the weight value
                if (is_array($item['selectedWeight'])) {
                    $weightValue = $item['selectedWeight']['weight'] ?? $item['selectedWeight']['value'] ?? json_encode($item['selectedWeight']);
                } elseif (is_object($item['selectedWeight'])) {
                    $weightValue = $item['selectedWeight']->weight ?? $item['selectedWeight']->value ?? json_encode($item['selectedWeight']);
                } else {
                    $weightValue = $item['selectedWeight'];
                }
            }

            error_log("🛒 CREATE ORDER - Inserting order item: " . json_encode([
                'product' => $item['product'],
                'name' => $item['name'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'original_price' => $item['originalPrice'] ?? null,
                'discount' => $item['discount'] ?? 0,
                'sku' => $item['sku'] ?? null,
                'weight' => $weightValue,
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
                $weightValue  // Properly formatted weight value
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

        error_log("✅ CREATE ORDER - Order created successfully: ID=$orderId, OrderNumber=$uniqueOrderId (6-digit, never regenerated), Tracking=$trackingNumber");
        error_log("✅ CREATE ORDER - Order details: " . json_encode([
            'order_id' => $orderId,
            'order_number' => $uniqueOrderId, // 6-digit unique order ID (generated once, never regenerated)
            'tracking_number' => $trackingNumber,
            'user_id' => $authUser ? ($authUser->id ?? 'NULL') : 'NULL',
            'total_price' => $data['totalPrice'] ?? 'N/A',
            'items_count' => count($data['orderItems'] ?? []),
            'status' => 'pending'
        ]));

        // Get the complete order data to send back
        $orderStmt = $db->prepare("
            SELECT o.*, sa.*, pi.*
            FROM orders o
            LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
            LEFT JOIN payment_info pi ON o.id = pi.order_id
            WHERE o.id = ?
        ");
        $orderStmt->execute([$orderId]);
        $orderData = $orderStmt->fetch(PDO::FETCH_ASSOC);
        
        // Get order items
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$orderId]);
        $orderData['orderItems'] = $itemStmt->fetchAll();

        // CRITICAL: Always use the generated 6-digit unique order ID in response
        // Format as 6 digits with leading zeros (ensure it's a string)
        $formattedOrderNumber = str_pad((string)$uniqueOrderId, 6, '0', STR_PAD_LEFT);
        
        // Override database values to ensure 6-digit format
        $orderData['order_number'] = $formattedOrderNumber;
        $orderData['display_order_id'] = $formattedOrderNumber;
        
        error_log("🛒 CREATE ORDER - Order ID: $orderId, 6-digit Order Number: $formattedOrderNumber");
        error_log("🛒 CREATE ORDER - Returning order with 6-digit orderNumber: " . $formattedOrderNumber);
        
        sendSuccess('Order created successfully', [
            'orderId' => $orderId,
            'orderNumber' => $formattedOrderNumber, // 6-digit unique order ID (generated once, never regenerated)
            'displayOrderId' => $formattedOrderNumber, // For frontend display
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
        SELECT o.*,
               COALESCE(o.order_number, o.id) as order_number,
               COALESCE(o.order_number, CONCAT('', o.id)) as display_order_id,
               sa.name as shipping_name, sa.phone, sa.address, sa.city, sa.state,
               sa.postal_code, sa.country, pi.status as payment_status, pi.method as payment_method
        FROM orders o
        LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
        LEFT JOIN payment_info pi ON o.id = pi.order_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$authUser->id, $pagination['limit'], $pagination['offset']]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get order items for each order and ensure order_number is set
        foreach ($orders as &$order) {
            // Ensure order_number is available for frontend
            if (empty($order['order_number'])) {
                $order['order_number'] = $order['id'];
                $order['display_order_id'] = $order['id'];
            }
            
            $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$order['id']]);
            $order['orderItems'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        }

    $response = createPaginationResponse($orders, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Orders retrieved successfully', $response);
}

/**
 * Get all orders (Admin only)
 */
function getAllOrders($db) {
    // Start output buffering to prevent any premature output
    ob_start();
    
    // Enable authentication for admin access
    error_log("📋 GET ALL ORDERS - Request received");
    error_log("📋 GET ALL ORDERS - Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
    error_log("📋 GET ALL ORDERS - Request method: " . ($_SERVER['REQUEST_METHOD'] ?? 'N/A'));
    error_log("📋 GET ALL ORDERS - Authorization header: " . (isset($_SERVER['HTTP_AUTHORIZATION']) ? 'Present' : 'Missing'));
    
    try {
        $authUser = AuthMiddleware::authenticate();
        error_log("📋 GET ALL ORDERS - User authenticated: " . json_encode(['id' => $authUser->id, 'email' => $authUser->email, 'role' => $authUser->role ?? 'unknown']));
        
        AuthMiddleware::requireAdmin($authUser);
        error_log("📋 GET ALL ORDERS - Admin access verified");
    } catch (Exception $e) {
        ob_clean(); // Clear any output
        // Log authentication failure with full details
        error_log("❌ GET ALL ORDERS - Authentication failed: " . $e->getMessage());
        error_log("❌ GET ALL ORDERS - Exception class: " . get_class($e));
        error_log("❌ GET ALL ORDERS - Stack trace: " . $e->getTraceAsString());
        
        // Return empty orders but with proper structure
        $emptyResponse = [
            'data' => [],
            'orders' => [],
            'pagination' => [
                'page' => 1,
                'limit' => 50,
                'total' => 0,
                'totalItems' => 0,
                'totalPages' => 0,
                'currentPage' => 1,
                'itemsPerPage' => 50,
                'hasNextPage' => false,
                'hasPrevPage' => false
            ]
        ];
        
        sendSuccess('Orders retrieved successfully', $emptyResponse);
        return;
    }
    
    try {
        $pagination = getPaginationParams();
        error_log("📋 GET ALL ORDERS - Pagination: " . json_encode($pagination));

        // Check if order_number column exists
        $columnExists = false;
        try {
            $checkStmt = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
            $columnExists = $checkStmt && $checkStmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("⚠️ GET ALL ORDERS - Could not check for order_number column: " . $e->getMessage());
            $columnExists = false;
        }

        // Filter by status
        $where = '1=1';
        $params = [];

        if (isset($_GET['status']) && $_GET['status'] !== 'all' && $_GET['status'] !== '') {
            $where .= ' AND o.status = ?';
            $params[] = sanitizeInput($_GET['status']);
            error_log("📋 GET ALL ORDERS - Filtering by status: " . $_GET['status']);
        }

        // Get total count
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM orders o WHERE $where");
        $countStmt->execute($params);
        $totalResult = $countStmt->fetch(PDO::FETCH_ASSOC);
        $total = $totalResult['total'] ?? 0;
        error_log("📋 GET ALL ORDERS - Total orders in database: $total");

        // Build query based on whether order_number column exists
        if ($columnExists) {
            // Get orders with order_number column
            // CRITICAL: Don't use COALESCE with id - we want NULL if order_number doesn't exist
            // Frontend will generate 6-digit number from id if needed
            $stmt = $db->prepare("
                SELECT 
                    o.id, 
                    o.order_number,
                    o.order_number as display_order_id,
                    o.tracking_number, o.status, o.items_price, o.tax_price,
                    o.shipping_price, o.discount_amount, o.total_price, o.currency,
                    o.coupon_code, o.coupon_discount, o.coupon_type, o.customer_notes,
                    o.shipping_method, o.is_gift, o.gift_message,
                    o.created_at, o.updated_at,
                    o.user_id,
                    COALESCE(u.name, sa.name, 'Guest User') as user_name,
                    COALESCE(u.email, 'N/A') as user_email,
                    sa.name as shipping_name, sa.phone, sa.city, sa.state, sa.address, sa.postal_code, sa.country,
                    pi.status as payment_status, pi.method as payment_method, pi.payment_id, pi.transaction_id
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
                LEFT JOIN payment_info pi ON o.id = pi.order_id
                WHERE $where
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            ");
        } else {
            // Get orders without order_number column (fallback)
            // Return NULL for order_number so frontend can generate 6-digit from id
            $stmt = $db->prepare("
                SELECT 
                    o.id, 
                    NULL as order_number,
                    NULL as display_order_id,
                    o.tracking_number, o.status, o.items_price, o.tax_price,
                    o.shipping_price, o.discount_amount, o.total_price, o.currency,
                    o.coupon_code, o.coupon_discount, o.coupon_type, o.customer_notes,
                    o.shipping_method, o.is_gift, o.gift_message,
                    o.created_at, o.updated_at,
                    o.user_id,
                    COALESCE(u.name, sa.name, 'Guest User') as user_name,
                    COALESCE(u.email, 'N/A') as user_email,
                    sa.name as shipping_name, sa.phone, sa.city, sa.state, sa.address, sa.postal_code, sa.country,
                    pi.status as payment_status, pi.method as payment_method, pi.payment_id, pi.transaction_id
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
                LEFT JOIN payment_info pi ON o.id = pi.order_id
                WHERE $where
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            ");
        }

        $params[] = $pagination['limit'];
        $params[] = $pagination['offset'];
        $stmt->execute($params);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("📋 GET ALL ORDERS - Fetched " . count($orders) . " orders from database");
        
        if (count($orders) === 0 && $total > 0) {
            error_log("⚠️ GET ALL ORDERS - WARNING: Database has $total orders but query returned 0. Check pagination or filters.");
        }
    } catch (PDOException $e) {
        ob_clean(); // Clear any output
        error_log("❌ GET ALL ORDERS - Database error: " . $e->getMessage());
        error_log("❌ GET ALL ORDERS - SQL Error Info: " . json_encode($e->errorInfo ?? []));
        
        // Return error response
        sendError('Failed to retrieve orders', [
            'error' => 'Database error occurred',
            'details' => 'Please try again later or contact support'
        ], 500);
        return;
    } catch (Exception $e) {
        ob_clean(); // Clear any output
        error_log("❌ GET ALL ORDERS - Unexpected error: " . $e->getMessage());
        error_log("❌ GET ALL ORDERS - Stack trace: " . $e->getTraceAsString());
        
        // Return error response
        sendError('Failed to retrieve orders', [
            'error' => $e->getMessage(),
            'details' => 'An unexpected error occurred'
        ], 500);
        return;
    }
    
    try {

        // Fetch order items for each order
        foreach ($orders as &$order) {
            try {
                $itemStmt = $db->prepare("
                    SELECT oi.*, p.name as product_name, p.thumbnail, p.images
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ");
                $itemStmt->execute([$order['id']]);
                $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

                error_log("📦 GET ALL ORDERS - Order ID {$order['id']}: Found " . count($items) . " items");
            } catch (PDOException $e) {
                error_log("⚠️ GET ALL ORDERS - Error fetching items for order {$order['id']}: " . $e->getMessage());
                $items = []; // Continue with empty items array
            }

            // Process each item to get the best image and ensure all fields are present
            foreach ($items as &$item) {
                // Log raw item data for debugging
                error_log("📦 GET ALL ORDERS - Raw item: " . json_encode([
                    'id' => $item['id'] ?? 'N/A',
                    'product_id' => $item['product_id'] ?? 'N/A',
                    'name' => $item['name'] ?? 'N/A',
                    'quantity' => $item['quantity'] ?? 'N/A',
                    'price' => $item['price'] ?? 'N/A',
                    'image' => $item['image'] ?? 'N/A',
                    'weight' => $item['weight'] ?? 'N/A'
                ]));

                $productImage = null;

                // Priority 1: Use image from order_items table (stored during order creation)
                if (!empty($item['image']) && strpos($item['image'], 'placeholder') === false) {
                    $productImage = $item['image'];
                    error_log("📦 GET ALL ORDERS - Using stored order item image: " . $productImage);
                }
                // Priority 2: Try thumbnail from products table
                elseif (!empty($item['thumbnail'])) {
                    $productImage = $item['thumbnail'];
                    error_log("📦 GET ALL ORDERS - Using product thumbnail: " . $productImage);
                }
                // Priority 3: Try first image from images array
                elseif (!empty($item['images'])) {
                    $imagesArray = json_decode($item['images'], true);
                    if (is_array($imagesArray) && !empty($imagesArray)) {
                        $productImage = $imagesArray[0];
                        error_log("📦 GET ALL ORDERS - Using product images array first: " . $productImage);
                    }
                }

                // Fallback to placeholder if still no image
                if (empty($productImage)) {
                    $productImage = '/images/placeholder-product.jpg';
                    error_log("📦 GET ALL ORDERS - Using placeholder image");
                }

                // Convert image URLs to production URLs
                if ($productImage) {
                    $productImage = getImageUrl($productImage);
                }

                // Ensure all required fields are present and properly formatted
                $item['product_image'] = $productImage;
                $item['image'] = $productImage; // Always set image field for frontend compatibility
                
                // Format weight field for frontend (convert to object if it's a string/number)
                if (!empty($item['weight'])) {
                    // If weight is already an object, keep it; otherwise convert to object format
                    if (is_string($item['weight']) && strpos($item['weight'], '{') === 0) {
                        $weightData = json_decode($item['weight'], true);
                        if ($weightData) {
                            $item['selectedWeight'] = $weightData;
                        } else {
                            $item['selectedWeight'] = ['weight' => $item['weight']];
                        }
                    } elseif (is_numeric($item['weight'])) {
                        $item['selectedWeight'] = ['weight' => (float)$item['weight']];
                    } else {
                        $item['selectedWeight'] = ['weight' => $item['weight']];
                    }
                }

                // Ensure numeric fields are properly typed
                $item['quantity'] = (int)($item['quantity'] ?? 0);
                $item['price'] = (float)($item['price'] ?? 0);
                $item['original_price'] = isset($item['original_price']) ? (float)$item['original_price'] : null;
                $item['discount'] = isset($item['discount']) ? (float)$item['discount'] : 0;

                // Remove raw images field (not needed in response)
                unset($item['images']);
                unset($item['thumbnail']);
                
                // Log processed item
                error_log("📦 GET ALL ORDERS - Processed item: " . json_encode([
                    'id' => $item['id'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'image' => $item['image'],
                    'has_weight' => !empty($item['selectedWeight'])
                ]));
            }

                $order['items'] = $items;
                $order['orderItems'] = $items; // Add alias for compatibility
                
        // Ensure order_number is set for each order (always 6 digits)
        // For existing orders without order_number, generate a consistent 6-digit number
        $orderIdNum = isset($order['id']) ? (int)$order['id'] : 0;
        
        // Check if order_number is valid (exists, is numeric, and is 6 digits)
        // CRITICAL: Also check that it's not the same as the auto-increment id (which would be 1-2 digits)
        $orderNumberStr = isset($order['order_number']) ? (string)$order['order_number'] : '';
        $orderIdStr = isset($order['id']) ? (string)$order['id'] : '';
        
        $hasValidOrderNumber = !empty($orderNumberStr) && 
                               is_numeric($orderNumberStr) && 
                               strlen($orderNumberStr) == 6 &&
                               $orderNumberStr != $orderIdStr && // Not the same as auto-increment id
                               (int)$orderNumberStr >= 100000 && 
                               (int)$orderNumberStr <= 999999; // Must be in 6-digit range
        
        if (!$hasValidOrderNumber && $orderIdNum > 0) {
            // Generate a consistent 6-digit number from order ID (for existing orders)
            // Formula: (order_id * 12345) % 900000 + 100000 ensures 6 digits
            $generatedNumber = (($orderIdNum * 12345) % 900000) + 100000;
            
            // Ensure it's within 6-digit range (100000-999999)
            if ($generatedNumber > 999999) {
                $generatedNumber = ($generatedNumber % 900000) + 100000;
            }
            if ($generatedNumber < 100000) {
                $generatedNumber = $generatedNumber + 100000;
            }
            
            $order['order_number'] = str_pad((string)$generatedNumber, 6, '0', STR_PAD_LEFT);
            $order['display_order_id'] = $order['order_number'];
            
            // Try to save it to database if column exists (non-blocking)
            if (isset($columnExists) && $columnExists && !empty($order['id'])) {
                try {
                    $updateStmt = $db->prepare("UPDATE orders SET order_number = ? WHERE id = ? AND (order_number IS NULL OR order_number = '' OR CAST(order_number AS UNSIGNED) = id)");
                    $updateStmt->execute([$order['order_number'], $order['id']]);
                    if ($updateStmt->rowCount() > 0) {
                        error_log("✅ Backfilled order_number for order ID {$order['id']}: {$order['order_number']}");
                    }
                } catch (PDOException $e) {
                    // Non-critical, continue - order will still display with generated number
                    error_log("⚠️ Could not backfill order_number: " . $e->getMessage());
                }
            }
        } else if ($hasValidOrderNumber) {
            // Ensure it's formatted as 6 digits with leading zeros (as string)
            $orderNumValue = (int)$order['order_number'];
            // Double-check it's in valid range
            if ($orderNumValue >= 100000 && $orderNumValue <= 999999) {
                $order['order_number'] = str_pad((string)$orderNumValue, 6, '0', STR_PAD_LEFT);
                $order['display_order_id'] = $order['order_number'];
            } else {
                // Invalid range, regenerate
                $generatedNumber = (($orderIdNum * 12345) % 900000) + 100000;
                if ($generatedNumber > 999999) {
                    $generatedNumber = ($generatedNumber % 900000) + 100000;
                }
                $order['order_number'] = str_pad((string)$generatedNumber, 6, '0', STR_PAD_LEFT);
                $order['display_order_id'] = $order['order_number'];
            }
        } else {
            // Fallback if order ID is missing
            $order['order_number'] = '000000';
            $order['display_order_id'] = '000000';
        }
            }

        error_log("📋 GET ALL ORDERS - Processed " . count($orders) . " orders with items");
    
        // Log sample order for debugging
        if (count($orders) > 0) {
            $sampleOrder = $orders[0];
            error_log("📋 GET ALL ORDERS - Sample order: " . json_encode([
                'id' => $sampleOrder['id'] ?? 'N/A',
                'tracking_number' => $sampleOrder['tracking_number'] ?? 'N/A',
                'status' => $sampleOrder['status'] ?? 'N/A',
                'total_price' => $sampleOrder['total_price'] ?? 'N/A',
                'user_name' => $sampleOrder['user_name'] ?? 'N/A',
                'user_id' => $sampleOrder['user_id'] ?? 'NULL',
                'items_count' => count($sampleOrder['orderItems'] ?? [])
            ]));
        } else {
            error_log("⚠️ GET ALL ORDERS - No orders found. Checking database directly...");
            // Debug query to see if orders exist at all
            $debugStmt = $db->prepare("SELECT COUNT(*) as cnt FROM orders");
            $debugStmt->execute();
            $debugResult = $debugStmt->fetch(PDO::FETCH_ASSOC);
            error_log("📋 GET ALL ORDERS - Direct count query result: " . ($debugResult['cnt'] ?? 0) . " orders in database");
        }

        // Build response in the format frontend expects
        $response = createPaginationResponse($orders, $total, $pagination['page'], $pagination['limit']);
        
        // CRITICAL: Also add 'orders' key at root level for compatibility
        // Frontend expects: response.data.data OR response.data.orders
        $response['orders'] = $orders;
        
        error_log("📋 GET ALL ORDERS - Sending response with " . count($orders) . " orders, total: $total");
        error_log("📋 GET ALL ORDERS - Response structure: " . json_encode([
            'data_count' => count($response['data'] ?? []),
            'orders_count' => count($response['orders'] ?? []),
            'total' => $response['pagination']['totalItems'] ?? 0
        ]));
        
        ob_clean(); // Clear any output before sending response
        sendSuccess('Orders retrieved successfully', $response);
        
    } catch (Exception $e) {
        ob_clean(); // Clear any output
        error_log("❌ GET ALL ORDERS - Final catch error: " . $e->getMessage());
        error_log("❌ GET ALL ORDERS - Stack trace: " . $e->getTraceAsString());
        
        sendError('Failed to retrieve orders', [
            'error' => $e->getMessage(),
            'details' => 'An unexpected error occurred while fetching orders'
        ], 500);
    }
}

/**
 * Get order by ID
 */
function getOrderById($db, $id) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("
        SELECT o.*,
               COALESCE(o.order_number, o.id) as order_number,
               COALESCE(o.order_number, CONCAT('', o.id)) as display_order_id,
               sa.*, pi.*,
               u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
        LEFT JOIN payment_info pi ON o.id = pi.order_id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        sendError('Order not found', [], 404);
    }

    // Check if user owns this order or is admin
    if ($order['user_id'] != $authUser->id && !in_array($authUser->role, ['admin', 'superadmin'])) {
        sendError('Access denied', [], 403);
    }

    // Ensure order_number is set
    if (empty($order['order_number'])) {
        $order['order_number'] = $order['id'];
        $order['display_order_id'] = $order['id'];
    }

    // Get order items
    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$id]);
    $order['orderItems'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

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

