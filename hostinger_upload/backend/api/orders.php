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
            // Check for send-bill or send-bill-pdf endpoint: /api/orders/{id}/send-bill or /api/orders/{id}/send-bill-pdf
            // This must be checked BEFORE the numeric endpoint check
            if (isset($pathParts) && is_array($pathParts)) {
                $ordersIndex = array_search("orders", $pathParts);
                if ($ordersIndex !== false && isset($pathParts[$ordersIndex + 1]) && is_numeric($pathParts[$ordersIndex + 1])) {
                    $orderId = (int)$pathParts[$ordersIndex + 1];
                    // Check if next part is "send-bill" or "send-bill-pdf"
                    if (isset($pathParts[$ordersIndex + 2])) {
                        $action = $pathParts[$ordersIndex + 2];
                        if ($action === 'send-bill') {
                            error_log("✅ ORDERS API - Routing to sendBillEmail() for order ID: $orderId");
                            if ($method === 'POST') {
                                sendBillEmail($db, $orderId);
                                exit;
                            } else {
                                ob_clean();
                                error_log("❌ ORDERS API - Method not allowed for send-bill: $method");
                                sendError('Method not allowed. Use POST for send-bill', [], 405);
                                exit;
                            }
                        } elseif ($action === 'send-bill-pdf') {
                            error_log("✅ ORDERS API - Routing to sendBillEmailWithPDF() for order ID: $orderId");
                            error_log("✅ ORDERS API - Full path: " . json_encode($pathParts));
                            error_log("✅ ORDERS API - Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
                            error_log("✅ ORDERS API - Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'N/A'));
                            error_log("✅ ORDERS API - Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'N/A'));
                            
                            if ($method === 'POST') {
                                // Clear any output before processing
                                ob_clean();
                                
                                // Send immediate response header to prevent timeout
                                header('Content-Type: application/json');
                                
                                // Call the function
                                sendBillEmailWithPDF($db, $orderId);
                                exit;
                            } else {
                                ob_clean();
                                error_log("❌ ORDERS API - Method not allowed for send-bill-pdf: $method");
                                sendError('Method not allowed. Use POST for send-bill-pdf', [], 405);
                                exit;
                            }
                        }
                    }
                }
            }
            
            // Handle numeric endpoint (order ID)
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
                error_log("❌ ORDERS API - Available endpoints: '', 'all', numeric ID, numeric ID/send-bill, or numeric ID/send-bill-pdf");
                sendError('Endpoint not found', [
                    'endpoint' => $endpoint,
                    'path' => $path,
                    'available' => ['', 'all', 'numeric_id', 'numeric_id/send-bill', 'numeric_id/send-bill-pdf']
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
        // Get customer email and name for notification, plus order total and order number
        // Check if order_number column exists
        $orderNumberColumnExists = false;
        try {
            $checkCol = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
            $orderNumberColumnExists = $checkCol->rowCount() > 0;
        } catch (Exception $e) {
            // Column check failed, assume it doesn't exist
        }
        
        if ($orderNumberColumnExists) {
            $customerStmt = $db->prepare("
                SELECT u.email, u.name, o.tracking_number, o.total_price, o.items_price, o.tax_price, o.shipping_price,
                       COALESCE(o.order_number, o.id) as display_order_id
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            ");
        } else {
            $customerStmt = $db->prepare("
                SELECT u.email, u.name, o.tracking_number, o.total_price, o.items_price, o.tax_price, o.shipping_price,
                       o.id as display_order_id
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            ");
        }
        $customerStmt->execute([$id]);
        $customer = $customerStmt->fetch();
        
        // Get the display order ID (order_number if exists, otherwise id)
        $displayOrderId = isset($customer['display_order_id']) ? $customer['display_order_id'] : $id;
        
        // Get order items for email
        $itemsStmt = $db->prepare("
            SELECT oi.name, oi.quantity, oi.price, oi.image, oi.original_price, oi.discount
            FROM order_items oi
            WHERE oi.order_id = ?
            ORDER BY oi.id
        ");
        $itemsStmt->execute([$id]);
        $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

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
                // Use EmailService (same as working OTP flow) instead of sendOrderStatusEmail
                $emailServiceLoaded = false;
                if (file_exists(__DIR__ . "/../includes/EmailService.php")) {
                    require_once __DIR__ . "/../includes/EmailService.php";
                    $emailServiceLoaded = class_exists('EmailService');
                }
                
                if ($emailServiceLoaded) {
                    // Use EmailService (same method as OTP emails)
                    $emailService = new EmailService();
                    
                    // Create email subject and body
                    $subject = "Order Status Update - Order #$id";
                    
                    // Status descriptions
                    $statusMessages = [
                        'pending' => 'Your order has been received and is pending confirmation.',
                        'processing' => 'Your order is being processed and will be shipped soon.',
                        'shipped' => 'Your order has been shipped and is on its way to you!',
                        'delivered' => 'Your order has been delivered. Thank you for your purchase!',
                        'cancelled' => 'Your order has been cancelled.'
                    ];
                    
                    $statusMessage = $statusMessages[$newStatus] ?? 'Your order status has been updated.';
                    
                    // Create HTML email body with product details - Professional Design
                    $body = "
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset='UTF-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; }
                            .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px 30px; text-align: center; }
                            .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
                            .header p { font-size: 16px; opacity: 0.95; }
                            .content { padding: 40px 30px; background-color: #ffffff; }
                            .greeting { font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 16px; }
                            .intro-text { color: #4a5568; font-size: 16px; margin-bottom: 30px; }
                            .status-section { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #dc2626; }
                            .order-id { font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 12px; }
                            .status-badge { display: inline-block; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; margin: 12px 0; }
                            .status-pending { background: #fef3c7; color: #92400e; border: 2px solid #fde68a; }
                            .status-processing { background: #dbeafe; color: #1e40af; border: 2px solid #93c5fd; }
                            .status-shipped { background: #e9d5ff; color: #6b21a8; border: 2px solid #c084fc; }
                            .status-delivered { background: #d1fae5; color: #065f46; border: 2px solid #6ee7b7; }
                            .status-cancelled { background: #fee2e2; color: #991b1b; border: 2px solid #fca5a5; }
                            .status-message { color: #4a5568; font-size: 15px; margin-top: 12px; line-height: 1.8; }
                            .tracking-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #3b82f6; }
                            .tracking-info strong { color: #1e40af; }
                            .section-title { font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
                            .order-items { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0; margin-bottom: 25px; overflow: hidden; }
                            .product-item { display: flex; padding: 20px; border-bottom: 1px solid #e2e8f0; align-items: center; background: #ffffff; transition: background 0.2s; }
                            .product-item:last-child { border-bottom: none; }
                            .product-item:hover { background: #f7fafc; }
                            .product-image { width: 90px; height: 90px; object-fit: cover; border-radius: 10px; margin-right: 18px; border: 2px solid #e2e8f0; background: #f7fafc; }
                            .product-info { flex: 1; }
                            .product-name { font-weight: 700; color: #1a202c; margin-bottom: 8px; font-size: 16px; }
                            .product-quantity { color: #718096; font-size: 14px; }
                            .product-price { font-weight: 700; color: #059669; font-size: 18px; text-align: right; }
                            .order-summary { background: linear-gradient(135deg, #f7fafb 0%, #ffffff 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; }
                            .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
                            .summary-row:last-child { border-bottom: none; font-weight: 700; font-size: 20px; color: #1a202c; padding-top: 15px; margin-top: 10px; border-top: 2px solid #e2e8f0; }
                            .summary-label { color: #4a5568; }
                            .summary-value { color: #1a202c; font-weight: 600; }
                            .summary-total { color: #dc2626; font-size: 22px; }
                            .footer { background: #1a202c; color: #cbd5e0; padding: 30px; text-align: center; }
                            .footer p { margin: 8px 0; font-size: 14px; }
                            .footer .company-name { color: #ffffff; font-weight: 600; font-size: 16px; }
                            .footer .copyright { color: #a0aec0; font-size: 12px; }
                            .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 30px 0; }
                        </style>
                    </head>
                    <body>
                        <div class='email-wrapper'>
                            <div class='header'>
                                <h1>🎂 " . FROM_NAME . "</h1>
                                <p>Order Status Update</p>
                            </div>
                            <div class='content'>
                                <div class='greeting'>Hello " . htmlspecialchars($customer['name']) . "!</div>
                                <p class='intro-text'>We're excited to update you on your order status.</p>

                                <div class='status-section'>
                                    <div class='order-id'>Order ID: <span style='color: #dc2626;'>#" . htmlspecialchars($displayOrderId) . "</span></div>
                                    <div>
                                        <strong style='color: #4a5568; font-size: 14px;'>Status:</strong>
                                        <div style='margin-top: 8px;'>
                                            <span class='status-badge status-$newStatus'>" . strtoupper($newStatus) . "</span>
                                        </div>
                                    </div>
                                    <p class='status-message'>$statusMessage</p>";
                    
                    if ($trackingNumber) {
                        $body .= "
                                    <div class='tracking-info'>
                                        <strong>📦 Tracking Number:</strong> $trackingNumber
                                    </div>";
                    }
                    
                    $body .= "
                                </div>
                                
                                <div class='divider'></div>
                                
                                <div class='order-items'>
                                    <div style='padding: 20px; background: linear-gradient(135deg, #f7fafb 0%, #edf2f7 100%); border-bottom: 2px solid #e2e8f0;'>
                                        <div class='section-title' style='margin: 0; padding: 0; border: none;'>🛍️ Order Items</div>
                                    </div>";
                    
                    // Add product items
                    $subtotal = 0;
                    foreach ($orderItems as $item) {
                        $itemName = htmlspecialchars($item['name']);
                        $itemQuantity = (int)$item['quantity'];
                        $itemPrice = (float)$item['price'];
                        $itemTotal = $itemQuantity * $itemPrice;
                        $subtotal += $itemTotal;
                        
                        // Get product image URL
                        $itemImage = '';
                        if (!empty($item['image'])) {
                            $itemImage = getImageUrl($item['image']);
                        } else {
                            $itemImage = BASE_URL . '/backend/uploads/products/default-product.png';
                        }
                        
                        $body .= "
                                    <div class='product-item'>
                                        <img src='$itemImage' alt='$itemName' class='product-image' onerror=\"this.src='" . BASE_URL . "/backend/uploads/products/default-product.png'\">
                                        <div class='product-info'>
                                            <div class='product-name'>$itemName</div>
                                            <div class='product-quantity'>📦 Quantity: <strong>$itemQuantity</strong> × ₹" . number_format($itemPrice, 2) . "</div>
                                        </div>
                                        <div class='product-price'>₹" . number_format($itemTotal, 2) . "</div>
                                    </div>";
                    }
                    
                    $body .= "
                                </div>
                                
                                <div class='order-summary'>
                                    <div class='section-title' style='margin-top: 0;'>💰 Order Summary</div>";
                    
                    // Calculate totals - use database values or calculated from items
                    $calculatedSubtotal = $subtotal;
                    // Use database values if available, otherwise use calculated values
                    $tax = isset($customer['tax_price']) ? (float)$customer['tax_price'] : 0;
                    $shipping = isset($customer['shipping_price']) ? (float)$customer['shipping_price'] : 0;
                    $total = isset($customer['total_price']) ? (float)$customer['total_price'] : ($calculatedSubtotal + $tax + $shipping);
                    // Use items_price from database if available, otherwise use calculated subtotal
                    $subtotal = isset($customer['items_price']) ? (float)$customer['items_price'] : $calculatedSubtotal;
                    
                    $body .= "
                                    <div class='summary-row'>
                                        <span class='summary-label'>Subtotal:</span>
                                        <span class='summary-value'>₹" . number_format($subtotal, 2) . "</span>
                                    </div>";
                    
                    if ($tax > 0) {
                        $body .= "
                                    <div class='summary-row'>
                                        <span class='summary-label'>Tax:</span>
                                        <span class='summary-value'>₹" . number_format($tax, 2) . "</span>
                                    </div>";
                    }
                    
                    if ($shipping > 0) {
                        $body .= "
                                    <div class='summary-row'>
                                        <span class='summary-label'>Shipping:</span>
                                        <span class='summary-value'>₹" . number_format($shipping, 2) . "</span>
                                    </div>";
                    }
                    
                    $body .= "
                                    <div class='summary-row'>
                                        <span class='summary-label'>Total Amount:</span>
                                        <span class='summary-value summary-total'>₹" . number_format($total, 2) . "</span>
                                    </div>
                                </div>

                                <div style='background: #eff6ff; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6; margin-top: 30px;'>
                                    <p style='color: #1e40af; font-size: 15px; margin: 0; line-height: 1.8;'>
                                        <strong>💬 Need Help?</strong><br>
                                        If you have any questions about your order, please don't hesitate to contact us. We're here to help!
                                    </p>
                                </div>

                                <div class='footer'>
                                    <p class='company-name'>" . FROM_NAME . "</p>
                                    <p>Thank you for choosing us!</p>
                                    <p class='copyright'>&copy; " . date('Y') . " " . FROM_NAME . ". All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>";
                    
                    // Send email using EmailService (same as OTP flow)
                    $emailSent = $emailService->sendEmail($customer['email'], $subject, $body, true);
                    
                    if ($emailSent) {
                        error_log("✅ Order status email sent successfully to: {$customer['email']} via EmailService");
                    } else {
                        error_log("❌ Failed to send order status email to: {$customer['email']} via EmailService");
                    }
                } else {
                    // Fallback to original sendOrderStatusEmail function
                    error_log("⚠️ EmailService not available, using fallback sendOrderStatusEmail");
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

/**
 * Send bill email to customer
 * Route: POST /api/orders/{id}/send-bill
 */
function sendBillEmail($db, $id) {
    // Log function call
    error_log("📧 sendBillEmail called for order ID: $id");
    error_log("📧 Request method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));
    error_log("📧 Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'UNKNOWN'));
    
    // Authenticate admin
    try {
        $authUser = AuthMiddleware::requireAdmin();
        error_log("✅ Admin authenticated: " . ($authUser->email ?? 'unknown'));
    } catch (Exception $authError) {
        error_log("❌ Admin authentication failed: " . $authError->getMessage());
        sendError('Admin authentication required', ['error' => $authError->getMessage()], 401);
        return;
    }
    
    try {
        // Check if order_number column exists
        $orderNumberColumnExists = false;
        try {
            $checkCol = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
            $orderNumberColumnExists = $checkCol->rowCount() > 0;
        } catch (Exception $e) {
            // Column check failed, assume it doesn't exist
        }
        
        // Get order details with customer info
        if ($orderNumberColumnExists) {
            $orderStmt = $db->prepare("
                SELECT o.*, 
                       COALESCE(o.order_number, o.id) as display_order_id,
                       u.email, u.name as customer_name,
                       sa.name as shipping_name, sa.phone, sa.address, sa.city, sa.state, sa.postal_code, sa.country
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
                WHERE o.id = ?
            ");
        } else {
            $orderStmt = $db->prepare("
                SELECT o.*, 
                       o.id as display_order_id,
                       u.email, u.name as customer_name,
                       sa.name as shipping_name, sa.phone, sa.address, sa.city, sa.state, sa.postal_code, sa.country
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
                WHERE o.id = ?
            ");
        }
        $orderStmt->execute([$id]);
        $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            sendError('Order not found', [], 404);
            return;
        }
        
        // Get order items
        $itemsStmt = $db->prepare("
            SELECT oi.*, p.name as product_name, p.thumbnail, p.images
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            ORDER BY oi.id
        ");
        $itemsStmt->execute([$id]);
        $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($orderItems)) {
            sendError('Order has no items', [], 400);
            return;
        }
        
        // Process each item to get the best image (same logic as getAllOrders)
        foreach ($orderItems as &$item) {
            $productImage = null;
            
            // Priority 1: Use image from order_items table (stored during order creation)
            if (!empty($item['image']) && strpos($item['image'], 'placeholder') === false) {
                $productImage = $item['image'];
            }
            // Priority 2: Try thumbnail from products table
            elseif (!empty($item['thumbnail'])) {
                $productImage = $item['thumbnail'];
            }
            // Priority 3: Try first image from images array
            elseif (!empty($item['images'])) {
                $imagesArray = json_decode($item['images'], true);
                if (is_array($imagesArray) && !empty($imagesArray)) {
                    $productImage = $imagesArray[0];
                }
            }
            
            // Fallback to placeholder if still no image
            if (empty($productImage)) {
                $productImage = '/backend/uploads/products/default-product.png';
            }
            
            // Convert image URLs to production URLs
            if ($productImage) {
                $productImage = getImageUrl($productImage);
            }
            
            // Set both fields for compatibility
            $item['product_image'] = $productImage;
            $item['image'] = $productImage; // Always set image field for frontend compatibility
            
            // Remove raw images field (not needed)
            unset($item['images']);
            unset($item['thumbnail']);
        }
        unset($item); // Break reference
        
        // Get customer email
        $customerEmail = $order['email'] ?? null;
        if (!$customerEmail) {
            sendError('Customer email not found', [], 400);
            return;
        }
        
        // Get display order ID
        $displayOrderId = isset($order['display_order_id']) ? $order['display_order_id'] : $id;
        
        // Format date
        $orderDate = date('d/m/Y', strtotime($order['created_at']));
        
        // Calculate totals
        $subtotal = (float)($order['items_price'] ?? 0);
        $discount = (float)($order['discount_amount'] ?? 0);
        $taxableValue = $subtotal - $discount;
        $cgst = (float)($order['tax_price'] ?? 0) / 2;
        $sgst = (float)($order['tax_price'] ?? 0) / 2;
        $shipping = (float)($order['shipping_price'] ?? 0);
        $total = (float)($order['total_price'] ?? 0);
        
        // Logo URL - use absolute URL with fallback options
        // Try multiple possible logo paths
        $logoPaths = [
            BASE_URL . '/billlogo.webp',
            BASE_URL . '/sk-bakers-logo.png',
            BASE_URL . '/frontend/billlogo.webp',
            BASE_URL . '/frontend/sk-bakers-logo.png',
            'https://skbakers.com/billlogo.webp',
            'https://skbakers.com/sk-bakers-logo.png'
        ];
        
        // Use the first path (most likely to exist)
        $logoUrl = $logoPaths[0];
        
        // Try to embed logo as base64 if file exists locally (for better email compatibility)
        $localLogoPath = __DIR__ . '/../../frontend/billlogo.webp';
        if (file_exists($localLogoPath)) {
            $logoData = file_get_contents($localLogoPath);
            $logoMimeType = 'image/webp';
            $logoBase64 = base64_encode($logoData);
            $logoUrl = 'data:' . $logoMimeType . ';base64,' . $logoBase64;
        } else {
            // Fallback to absolute URL
            $logoUrl = BASE_URL . '/billlogo.webp';
        }
        
        // Generate bill HTML
        $billHtml = generateBillHtml($order, $orderItems, $displayOrderId, $orderDate, $logoUrl, $subtotal, $discount, $taxableValue, $cgst, $sgst, $shipping, $total);
        
        // Load EmailService
        $emailServiceLoaded = false;
        if (file_exists(__DIR__ . "/../includes/EmailService.php")) {
            require_once __DIR__ . "/../includes/EmailService.php";
            $emailServiceLoaded = class_exists('EmailService');
        }
        
        if (!$emailServiceLoaded) {
            sendError('Email service not available', [], 500);
            return;
        }
        
        // Send email
        $emailService = new EmailService();
        $subject = "Bill of Supply - Order #" . $displayOrderId . " - SK Bakers";
        $emailBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Bill of Supply - SK Bakers</title>
            <style>
                @media only screen and (max-width: 600px) {
                    .email-container { padding: 15px !important; }
                    .bill-container { padding: 10px !important; }
                }
            </style>
        </head>
        <body style='font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;'>
            <div class='email-container' style='max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                <!-- Header with Logo -->
                <div style='text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;'>
                    <div style='margin-bottom: 15px;'>
                        <img src='" . htmlspecialchars($logoUrl) . "' alt='SK BAKERS Logo' style='max-width: 200px; max-height: 120px; height: auto; width: auto; display: block; margin: 0 auto;' onerror=\"this.style.display='none'; this.nextElementSibling.style.display='block';\">
                        <div style='display: none; font-size: 32px; font-weight: bold; color: #dc2626; padding: 20px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; margin: 0 auto; width: fit-content;'>SK BAKERS</div>
                    </div>
                    <h1 style='color: #dc2626; margin: 10px 0 5px; font-size: 28px; font-weight: bold;'>SK Bakers</h1>
                    <p style='color: #666; margin: 5px 0; font-size: 16px; font-weight: 600;'>PREMIUM BAKERY & CONFECTIONERY</p>
                </div>
                
                <!-- Greeting -->
                <p style='font-size: 16px; margin-bottom: 20px; color: #111827;'>Dear " . htmlspecialchars($order['customer_name'] ?? 'Valued Customer') . ",</p>
                
                <p style='font-size: 16px; margin-bottom: 20px; color: #374151;'>Thank you for your order! We are pleased to provide you with your Bill of Supply for your recent purchase.</p>
                
                <!-- Order Summary Box -->
                <div style='background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;'>
                    <h2 style='color: #111827; margin-top: 0; margin-bottom: 15px; font-size: 20px;'>Order Summary</h2>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 10px;'>
                        <div>
                            <p style='margin: 5px 0; color: #6b7280; font-size: 14px;'><strong style='color: #374151;'>Order Number:</strong></p>
                            <p style='margin: 5px 0; color: #111827; font-size: 18px; font-weight: bold;'>#" . htmlspecialchars($displayOrderId) . "</p>
                        </div>
                        <div>
                            <p style='margin: 5px 0; color: #6b7280; font-size: 14px;'><strong style='color: #374151;'>Order Date:</strong></p>
                            <p style='margin: 5px 0; color: #111827; font-size: 18px; font-weight: bold;'>" . htmlspecialchars($orderDate) . "</p>
                        </div>
                        <div style='grid-column: 1 / -1; margin-top: 10px; padding-top: 15px; border-top: 1px solid #d1d5db;'>
                            <p style='margin: 5px 0; color: #6b7280; font-size: 14px;'><strong style='color: #374151;'>Total Amount:</strong></p>
                            <p style='margin: 5px 0; color: #dc2626; font-size: 24px; font-weight: bold;'>₹" . number_format($total, 2) . "</p>
                        </div>
                    </div>
                </div>
                
                <!-- Bill of Supply -->
                <div style='margin: 30px 0;'>
                    <h2 style='color: #111827; margin-bottom: 15px; font-size: 22px; text-align: center;'>Bill of Supply</h2>
                    <div style='margin: 0;'>
                        " . preg_replace('/<!DOCTYPE html>.*?<body[^>]*>/is', '', preg_replace('/<\/body>.*?<\/html>/is', '', $billHtml)) . "
                    </div>
                </div>
                
                <!-- Contact Information -->
                <div style='background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;'>
                    <p style='font-size: 14px; color: #374151; margin: 5px 0;'><strong>Need Help?</strong></p>
                    <p style='font-size: 14px; color: #6b7280; margin: 10px 0;'>
                        If you have any questions about your order, please don't hesitate to contact us:
                    </p>
                    <p style='font-size: 14px; color: #6b7280; margin: 5px 0;'>
                        📧 Email: <a href='mailto:" . FROM_EMAIL . "' style='color: #dc2626; text-decoration: none; font-weight: bold;'>" . FROM_EMAIL . "</a>
                    </p>
                    <p style='font-size: 14px; color: #6b7280; margin: 5px 0;'>
                        📞 Phone: <a href='tel:08220957243' style='color: #dc2626; text-decoration: none; font-weight: bold;'>082209 57243</a>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;'>
                    <p style='font-size: 14px; color: #6b7280; margin: 5px 0;'>
                        Thank you for choosing <strong style='color: #dc2626;'>SK Bakers</strong>!
                    </p>
                    <p style='font-size: 12px; color: #9ca3af; margin: 10px 0 0;'>
                        &copy; " . date('Y') . " SK Bakers. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Log email attempt
        error_log("📧 Attempting to send bill email to: $customerEmail for order #$displayOrderId");
        
        $emailSent = $emailService->sendEmail($customerEmail, $subject, $emailBody, true);
        
        if ($emailSent) {
            error_log("✅ Bill email sent successfully to: $customerEmail for order #$displayOrderId");
            sendSuccess('Bill email sent successfully to customer', [
                'email' => $customerEmail,
                'order_id' => $displayOrderId
            ]);
        } else {
            error_log("❌ Failed to send bill email to: $customerEmail for order #$displayOrderId");
            error_log("❌ EmailService returned false - check SMTP configuration and logs");
            sendError('Failed to send bill email. Please check email configuration.', [
                'email' => $customerEmail,
                'order_id' => $displayOrderId,
                'message' => 'Email service returned false. Check server logs for details.'
            ], 500);
        }
    } catch (Exception $e) {
        error_log("❌ sendBillEmail exception: " . $e->getMessage());
        error_log("❌ sendBillEmail file: " . $e->getFile() . " line: " . $e->getLine());
        error_log("❌ Stack trace: " . $e->getTraceAsString());
        sendError('Failed to send bill email', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    } catch (Throwable $e) {
        error_log("❌ sendBillEmail fatal error: " . $e->getMessage());
        error_log("❌ sendBillEmail file: " . $e->getFile() . " line: " . $e->getLine());
        error_log("❌ Stack trace: " . $e->getTraceAsString());
        sendError('Failed to send bill email', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}

/**
 * Send bill email with PDF attachment to customer
 * Route: POST /api/orders/{id}/send-bill-pdf
 */
function sendBillEmailWithPDF($db, $id) {
    // CRITICAL: Clear output buffer and set headers immediately
    // This prevents timeout issues and ensures response is sent
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Set JSON header immediately
    header('Content-Type: application/json; charset=utf-8');
    
    // CRITICAL: Increase execution time for large PDF processing
    // Set to 5 minutes (300 seconds) to handle large PDFs
    @set_time_limit(300);
    @ini_set('max_execution_time', 300);
    @ini_set('max_input_time', 300);
    
    // Increase memory limit for large PDF processing
    @ini_set('memory_limit', '256M');
    
    // Increase POST size limit for large PDFs
    @ini_set('post_max_size', '20M');
    
    // Ensure ID is an integer
    $id = (int)$id;
    
    error_log("📧 sendBillEmailWithPDF called for order ID: $id");
    error_log("📧 sendBillEmailWithPDF - Request method: " . ($_SERVER['REQUEST_METHOD'] ?? 'N/A'));
    error_log("📧 sendBillEmailWithPDF - Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'N/A'));
    error_log("📧 sendBillEmailWithPDF - Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'N/A'));
    error_log("📧 sendBillEmailWithPDF - PHP max_execution_time: " . ini_get('max_execution_time'));
    error_log("📧 sendBillEmailWithPDF - PHP memory_limit: " . ini_get('memory_limit'));
    error_log("📧 sendBillEmailWithPDF - PHP post_max_size: " . ini_get('post_max_size'));
    error_log("📧 sendBillEmailWithPDF - Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
    error_log("📧 sendBillEmailWithPDF - Request started at: " . date('Y-m-d H:i:s'));
    
    // Authenticate admin
    try {
        $authUser = AuthMiddleware::requireAdmin();
        error_log("✅ Admin authenticated: " . ($authUser->email ?? 'unknown'));
    } catch (Exception $authError) {
        error_log("❌ Admin authentication failed: " . $authError->getMessage());
        sendError('Admin authentication required', ['error' => $authError->getMessage()], 401);
        return;
    }
    
    try {
        // Get JSON input
        $rawInput = file_get_contents('php://input');
        $rawInputLength = strlen($rawInput);
        error_log("📧 sendBillEmailWithPDF - Raw input length: " . $rawInputLength);
        error_log("📧 sendBillEmailWithPDF - Content-Type header: " . ($_SERVER['CONTENT_TYPE'] ?? 'NOT SET'));
        error_log("📧 sendBillEmailWithPDF - Content-Length header: " . ($_SERVER['CONTENT_LENGTH'] ?? 'NOT SET'));
        
        // Check if input is too large (might indicate truncation)
        $maxPostSize = ini_get('post_max_size');
        $maxPostSizeBytes = convertSizeToBytes($maxPostSize);
        if ($rawInputLength > $maxPostSizeBytes * 0.9) {
            error_log("⚠️ sendBillEmailWithPDF - Input size (" . $rawInputLength . ") is close to post_max_size limit (" . $maxPostSizeBytes . ")");
        }
        
        if (empty($rawInput)) {
            error_log("❌ sendBillEmailWithPDF - Request body is empty");
            error_log("❌ sendBillEmailWithPDF - This could mean:");
            error_log("   1. Request body was not sent");
            error_log("   2. post_max_size is too small (current: " . ini_get('post_max_size') . ")");
            error_log("   3. Request was truncated");
            sendError('Request body is required', [
                'error' => 'Request body is empty',
                'hint' => 'Check post_max_size setting (current: ' . ini_get('post_max_size') . ')',
                'content_length_header' => $_SERVER['CONTENT_LENGTH'] ?? 'NOT SET',
                'post_max_size' => ini_get('post_max_size')
            ], 400);
            return;
        }
        
        $input = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("❌ sendBillEmailWithPDF - JSON decode error: " . json_last_error_msg());
            error_log("❌ sendBillEmailWithPDF - Raw input preview (first 500 chars): " . substr($rawInput, 0, 500));
            error_log("❌ sendBillEmailWithPDF - Raw input preview (last 200 chars): " . substr($rawInput, -200));
            sendError('Invalid JSON in request body', [
                'error' => json_last_error_msg(),
                'input_length' => $rawInputLength,
                'hint' => 'JSON might be truncated or malformed'
            ], 400);
            return;
        }
        
        error_log("📧 sendBillEmailWithPDF - JSON decoded successfully");
        error_log("📧 sendBillEmailWithPDF - Input keys: " . implode(', ', array_keys($input ?? [])));
        
        if (!isset($input['pdf']) || empty($input['pdf'])) {
            error_log("❌ sendBillEmailWithPDF - PDF data is missing in input");
            sendError('PDF data is required', [], 400);
            return;
        }
        
        $pdfBase64 = $input['pdf'];
        $pdfFilename = $input['filename'] ?? 'Bill_of_Supply.pdf';
        
        error_log("📧 sendBillEmailWithPDF - PDF filename: $pdfFilename");
        error_log("📧 sendBillEmailWithPDF - PDF base64 length: " . strlen($pdfBase64));
        
        // Validate PDF data
        if (!is_string($pdfBase64) || strlen($pdfBase64) < 100) {
            error_log("❌ sendBillEmailWithPDF - Invalid PDF data (too short or not string). Length: " . strlen($pdfBase64));
            sendError('Invalid PDF data provided', [], 400);
            return;
        }
        
        // Remove data URI prefix if present
        $pdfBase64 = preg_replace('/^data:application\/pdf;base64,/', '', $pdfBase64);
        
        // Validate base64 format
        if (!preg_match('/^[A-Za-z0-9+\/]*={0,2}$/', $pdfBase64)) {
            error_log("❌ sendBillEmailWithPDF - PDF data is not valid base64");
            error_log("❌ sendBillEmailWithPDF - First 50 chars: " . substr($pdfBase64, 0, 50));
            sendError('PDF data is not valid base64 format', [], 400);
            return;
        }
        
        error_log("✅ sendBillEmailWithPDF - PDF data validated successfully");
        
        // Check if order_number column exists
        $orderNumberColumnExists = false;
        try {
            $checkCol = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
            $orderNumberColumnExists = $checkCol->rowCount() > 0;
        } catch (Exception $e) {
            // Column check failed, assume it doesn't exist
        }
        
        // Get order details with customer info
        if ($orderNumberColumnExists) {
            $orderStmt = $db->prepare("
                SELECT o.*, 
                       COALESCE(o.order_number, o.id) as display_order_id,
                       u.email, u.name as customer_name,
                       sa.name as shipping_name, sa.phone, sa.address, sa.city, sa.state, sa.postal_code, sa.country
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
                WHERE o.id = ?
            ");
        } else {
            $orderStmt = $db->prepare("
                SELECT o.*, 
                       o.id as display_order_id,
                       u.email, u.name as customer_name,
                       sa.name as shipping_name, sa.phone, sa.address, sa.city, sa.state, sa.postal_code, sa.country
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
                WHERE o.id = ?
            ");
        }
        $orderStmt->execute([$id]);
        $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            error_log("❌ sendBillEmailWithPDF - Order not found for ID: $id");
            sendError('Order not found', ['order_id' => $id], 404);
            return;
        }
        
        error_log("📧 sendBillEmailWithPDF - Order found: ID=" . ($order['id'] ?? 'N/A') . ", User ID=" . ($order['user_id'] ?? 'N/A'));
        error_log("📧 sendBillEmailWithPDF - Order data keys: " . implode(', ', array_keys($order)));
        
        // Get customer email - check multiple possible fields
        $customerEmail = $order['email'] ?? $order['user_email'] ?? null;
        error_log("📧 sendBillEmailWithPDF - Customer email from order query: " . ($customerEmail ?? 'NULL'));
        
        // If email not found, try to get it from users table using user_id
        if (!$customerEmail && !empty($order['user_id'])) {
            error_log("📧 sendBillEmailWithPDF - Email not in order data, fetching from users table for user_id: " . $order['user_id']);
            try {
                $userStmt = $db->prepare("SELECT email, name FROM users WHERE id = ?");
                $userStmt->execute([$order['user_id']]);
                $user = $userStmt->fetch(PDO::FETCH_ASSOC);
                if ($user && !empty($user['email'])) {
                    $customerEmail = $user['email'];
                    error_log("✅ sendBillEmailWithPDF - Found email from users table: $customerEmail");
                    // Update order array with email for consistency
                    $order['email'] = $customerEmail;
                    if (empty($order['customer_name']) && !empty($user['name'])) {
                        $order['customer_name'] = $user['name'];
                    }
                } else {
                    error_log("❌ sendBillEmailWithPDF - User not found or email is empty for user_id: " . $order['user_id']);
                }
            } catch (Exception $userError) {
                error_log("❌ sendBillEmailWithPDF - Error fetching user email: " . $userError->getMessage());
            }
        }
        
        if (!$customerEmail) {
            error_log("❌ sendBillEmailWithPDF - Customer email not found after all attempts");
            error_log("❌ sendBillEmailWithPDF - Order user_id: " . ($order['user_id'] ?? 'NULL'));
            sendError('Customer email not found', [
                'order_id' => $id,
                'user_id' => $order['user_id'] ?? 'N/A',
                'hint' => 'Customer email is required to send the bill. Please ensure the order has an associated user with a valid email address.'
            ], 400);
            return;
        }
        
        error_log("✅ sendBillEmailWithPDF - Customer email confirmed: $customerEmail");
        
        // Get display order ID
        $displayOrderId = isset($order['display_order_id']) ? $order['display_order_id'] : $id;
        
        // Format date
        $orderDate = date('d/m/Y', strtotime($order['created_at']));
        
        // Load EmailService
        $emailServiceLoaded = false;
        if (file_exists(__DIR__ . "/../includes/EmailService.php")) {
            require_once __DIR__ . "/../includes/EmailService.php";
            $emailServiceLoaded = class_exists('EmailService');
        }
        
        if (!$emailServiceLoaded) {
            sendError('Email service not available', [], 500);
            return;
        }
        
        // Prepare email content
        $emailService = new EmailService();
        $subject = "Bill of Supply - Order #" . $displayOrderId . " - SK Bakers";
        
        // Create email body
        $customerName = $order['customer_name'] ?? 'Valued Customer';
        $total = (float)($order['total_price'] ?? 0);
        
        $emailBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Bill of Supply - SK Bakers</title>
        </head>
        <body style='font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;'>
            <div style='max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                <div style='text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;'>
                    <h1 style='color: #dc2626; margin: 10px 0 5px; font-size: 28px; font-weight: bold;'>SK Bakers</h1>
                    <p style='color: #666; margin: 5px 0; font-size: 16px; font-weight: 600;'>PREMIUM BAKERY & CONFECTIONERY</p>
                </div>
                
                <p style='font-size: 16px; margin-bottom: 20px; color: #111827;'>Dear " . htmlspecialchars($customerName) . ",</p>
                
                <p style='font-size: 16px; margin-bottom: 20px; color: #374151;'>Thank you for your order! Please find your Bill of Supply attached as a PDF document.</p>
                
                <div style='background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;'>
                    <h2 style='color: #111827; margin-top: 0; margin-bottom: 15px; font-size: 20px;'>Order Summary</h2>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 10px;'>
                        <div>
                            <p style='margin: 5px 0; color: #6b7280; font-size: 14px;'><strong style='color: #374151;'>Order Number:</strong></p>
                            <p style='margin: 5px 0; color: #111827; font-size: 18px; font-weight: bold;'>#" . htmlspecialchars($displayOrderId) . "</p>
                        </div>
                        <div>
                            <p style='margin: 5px 0; color: #6b7280; font-size: 14px;'><strong style='color: #374151;'>Order Date:</strong></p>
                            <p style='margin: 5px 0; color: #111827; font-size: 18px; font-weight: bold;'>" . htmlspecialchars($orderDate) . "</p>
                        </div>
                        <div style='grid-column: 1 / -1; margin-top: 10px; padding-top: 15px; border-top: 1px solid #d1d5db;'>
                            <p style='margin: 5px 0; color: #6b7280; font-size: 14px;'><strong style='color: #374151;'>Total Amount:</strong></p>
                            <p style='margin: 5px 0; color: #dc2626; font-size: 24px; font-weight: bold;'>₹" . number_format($total, 2) . "</p>
                        </div>
                    </div>
                </div>
                
                <div style='background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;'>
                    <p style='font-size: 14px; color: #374151; margin: 5px 0;'><strong>Need Help?</strong></p>
                    <p style='font-size: 14px; color: #6b7280; margin: 10px 0;'>
                        If you have any questions about your order, please don't hesitate to contact us:
                    </p>
                    <p style='font-size: 14px; color: #6b7280; margin: 5px 0;'>
                        📧 Email: <a href='mailto:" . FROM_EMAIL . "' style='color: #dc2626; text-decoration: none; font-weight: bold;'>" . FROM_EMAIL . "</a>
                    </p>
                    <p style='font-size: 14px; color: #6b7280; margin: 5px 0;'>
                        📞 Phone: <a href='tel:08220957243' style='color: #dc2626; text-decoration: none; font-weight: bold;'>082209 57243</a>
                    </p>
                </div>
                
                <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;'>
                    <p style='font-size: 14px; color: #6b7280; margin: 5px 0;'>
                        Thank you for choosing <strong style='color: #dc2626;'>SK Bakers</strong>!
                    </p>
                    <p style='font-size: 12px; color: #9ca3af; margin: 10px 0 0;'>
                        &copy; " . date('Y') . " SK Bakers. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Log PDF data info for debugging
        $pdfDataLength = strlen($pdfBase64);
        error_log("📧 sendBillEmailWithPDF - PDF data length: $pdfDataLength bytes");
        error_log("📧 sendBillEmailWithPDF - PDF filename: $pdfFilename");
        error_log("📧 sendBillEmailWithPDF - Customer email: $customerEmail");
        
        // Send email with PDF attachment
        error_log("📧 sendBillEmailWithPDF - About to send email");
        error_log("📧 sendBillEmailWithPDF - EmailService class exists: " . (class_exists('EmailService') ? 'YES' : 'NO'));
        error_log("📧 sendBillEmailWithPDF - EmailService instance created: " . (isset($emailService) ? 'YES' : 'NO'));
        error_log("📧 sendBillEmailWithPDF - Customer email: $customerEmail");
        error_log("📧 sendBillEmailWithPDF - Subject: $subject");
        error_log("📧 sendBillEmailWithPDF - PDF filename: $pdfFilename");
        error_log("📧 sendBillEmailWithPDF - PDF base64 length: " . strlen($pdfBase64));
        
        // Verify EmailService methods exist
        if (isset($emailService)) {
            error_log("📧 sendBillEmailWithPDF - sendEmailWithAttachment method exists: " . (method_exists($emailService, 'sendEmailWithAttachment') ? 'YES' : 'NO'));
        }
        
        try {
            // Log before sending
            $emailStartTime = microtime(true);
            error_log("📧 sendBillEmailWithPDF - Calling sendEmailWithAttachment() at: " . date('Y-m-d H:i:s'));
            error_log("📧 sendBillEmailWithPDF - Parameters: to=$customerEmail, subject=$subject, pdfSize=" . strlen($pdfBase64) . " bytes");
            
            // CRITICAL: Verify emailService is valid before calling
            if (!isset($emailService) || !is_object($emailService)) {
                error_log("❌ sendBillEmailWithPDF - EmailService is not initialized!");
                sendError('Email service is not available', [
                    'error' => 'EmailService instance is not valid',
                    'email' => $customerEmail,
                    'order_id' => $displayOrderId
                ], 500);
                return;
            }
            
            if (!method_exists($emailService, 'sendEmailWithAttachment')) {
                error_log("❌ sendBillEmailWithPDF - sendEmailWithAttachment method does not exist!");
                sendError('Email service method not available', [
                    'error' => 'sendEmailWithAttachment method not found',
                    'email' => $customerEmail,
                    'order_id' => $displayOrderId
                ], 500);
                return;
            }
            
            $emailSent = $emailService->sendEmailWithAttachment(
                $customerEmail,
                $subject,
                $emailBody,
                $pdfBase64,
                $pdfFilename,
                true // isBase64
            );
            
            $emailDuration = round(microtime(true) - $emailStartTime, 2);
            error_log("📧 sendBillEmailWithPDF - Email send completed in {$emailDuration} seconds");
            error_log("📧 sendBillEmailWithPDF - Email send result: " . ($emailSent ? 'SUCCESS' : 'FAILED'));
            
            // Get last error if available
            $emailError = $emailService->getLastError();
            if ($emailError) {
                error_log("📧 sendBillEmailWithPDF - EmailService last error: $emailError");
            }
            
            if ($emailSent) {
                error_log("✅ Bill email with PDF sent successfully to: $customerEmail for order #$displayOrderId");
                error_log("✅ Total processing time: " . (time() - strtotime(date('Y-m-d H:i:s'))) . " seconds");
                sendSuccess('Bill email with PDF sent successfully to customer', [
                    'email' => $customerEmail,
                    'order_id' => $displayOrderId,
                    'filename' => $pdfFilename,
                    'processing_time' => $emailDuration . 's'
                ]);
            } else {
                error_log("❌ Failed to send bill email with PDF to: $customerEmail for order #$displayOrderId");
                error_log("❌ EmailService returned false - check SMTP configuration and logs");
                
                // Get PHPMailer error if available
                $phpmailerError = $emailError ?? 'No detailed error available';
                if ($phpmailerError) {
                    error_log("❌ PHPMailer Error: $phpmailerError");
                }
                
                // Try to get more detailed error information
                $errorDetails = [
                    'email' => $customerEmail,
                    'order_id' => $displayOrderId,
                    'message' => 'Email service returned false. Check server logs for details.',
                    'hint' => 'Verify SMTP settings in config.php and ensure PHPMailer is installed',
                    'phpmailer_error' => $phpmailerError
                ];
                
                // Check if PHPMailer is available
                if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                    $errorDetails['phpmailer_status'] = 'not_installed';
                    $errorDetails['hint'] = 'PHPMailer is not installed. Install it via Composer or manually.';
                    error_log("❌ PHPMailer class not found - install via: composer require phpmailer/phpmailer");
                } else {
                    $errorDetails['phpmailer_status'] = 'installed';
                    error_log("✅ PHPMailer is installed");
                }
                
                // Check SMTP configuration
                $smtpHost = defined('SMTP_HOST') ? SMTP_HOST : 'not_configured';
                $smtpPort = defined('SMTP_PORT') ? SMTP_PORT : 'not_configured';
                $smtpUser = defined('SMTP_USERNAME') ? (empty(SMTP_USERNAME) ? 'empty' : 'configured') : 'not_configured';
                $smtpPass = defined('SMTP_PASSWORD') ? (empty(SMTP_PASSWORD) ? 'empty' : 'configured') : 'not_configured';
                
                error_log("📧 SMTP Config - Host: " . ($smtpHost !== 'not_configured' ? $smtpHost : 'NOT SET'));
                error_log("📧 SMTP Config - Port: " . ($smtpPort !== 'not_configured' ? $smtpPort : 'NOT SET'));
                error_log("📧 SMTP Config - Username: " . ($smtpUser === 'configured' ? 'SET' : ($smtpUser === 'empty' ? 'EMPTY' : 'NOT SET')));
                error_log("📧 SMTP Config - Password: " . ($smtpPass === 'configured' ? 'SET' : ($smtpPass === 'empty' ? 'EMPTY' : 'NOT SET')));
                
                $errorDetails['smtp_config'] = [
                    'host' => $smtpHost !== 'not_configured' ? 'configured' : 'not_configured',
                    'port' => $smtpPort !== 'not_configured' ? 'configured' : 'not_configured',
                    'username' => $smtpUser,
                    'password' => $smtpPass
                ];
                
                // Add troubleshooting hints
                $troubleshooting = [];
                if ($errorDetails['phpmailer_status'] === 'not_installed') {
                    $troubleshooting[] = 'Install PHPMailer: composer require phpmailer/phpmailer';
                }
                if ($smtpPass === 'empty' || $smtpPass === 'not_configured') {
                    $troubleshooting[] = 'Check SMTP_PASSWORD in config.php';
                }
                if ($smtpUser === 'empty' || $smtpUser === 'not_configured') {
                    $troubleshooting[] = 'Check SMTP_USERNAME in config.php';
                }
                if (!empty($troubleshooting)) {
                    $errorDetails['troubleshooting'] = $troubleshooting;
                }
                
                // Build a detailed error message
                $errorMsg = 'Failed to send bill email with PDF';
                if ($phpmailerError) {
                    $errorMsg .= ': ' . (strlen($phpmailerError) > 100 ? substr($phpmailerError, 0, 100) . '...' : $phpmailerError);
                } elseif ($errorDetails['phpmailer_status'] === 'not_installed') {
                    $errorMsg .= ': PHPMailer is not installed';
                } else {
                    $errorMsg .= ': Email service returned false. Check SMTP configuration.';
                }
                
                sendError($errorMsg, $errorDetails, 500);
            }
        } catch (Exception $emailException) {
            error_log("❌ sendBillEmailWithPDF - Exception during email send: " . $emailException->getMessage());
            error_log("❌ sendBillEmailWithPDF - Exception trace: " . $emailException->getTraceAsString());
            
            // Get last error from email service if available
            $lastEmailError = null;
            if (isset($emailService) && method_exists($emailService, 'getLastError')) {
                $lastEmailError = $emailService->getLastError();
            }
            
            $errorDetails = [
                'error' => $emailException->getMessage(),
                'email' => $customerEmail ?? 'N/A',
                'order_id' => $displayOrderId ?? $id
            ];
            
            if ($lastEmailError) {
                $errorDetails['phpmailer_error'] = $lastEmailError;
                $errorMsg = 'Failed to send bill email with PDF: ' . (strlen($lastEmailError) > 100 ? substr($lastEmailError, 0, 100) . '...' : $lastEmailError);
            } else {
                $errorMsg = 'Failed to send bill email with PDF: ' . $emailException->getMessage();
            }
            
            sendError($errorMsg, $errorDetails, 500);
            return;
        }
    } catch (Exception $e) {
        ob_clean(); // Clear any output
        error_log("❌ sendBillEmailWithPDF exception: " . $e->getMessage());
        error_log("❌ sendBillEmailWithPDF file: " . $e->getFile() . " line: " . $e->getLine());
        error_log("❌ Stack trace: " . $e->getTraceAsString());
        $errorMsg = 'Failed to send bill email with PDF: ' . $e->getMessage();
        sendError($errorMsg, [
            'error' => $e->getMessage(),
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
            'type' => get_class($e)
        ], 500);
        return;
    } catch (Throwable $e) {
        ob_clean(); // Clear any output
        error_log("❌ sendBillEmailWithPDF fatal error: " . $e->getMessage());
        error_log("❌ sendBillEmailWithPDF file: " . $e->getFile() . " line: " . $e->getLine());
        error_log("❌ Stack trace: " . $e->getTraceAsString());
        $errorMsg = 'Failed to send bill email with PDF: ' . $e->getMessage();
        sendError($errorMsg, [
            'error' => $e->getMessage(),
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
            'type' => get_class($e)
        ], 500);
        return;
    }
}

/**
 * Generate bill HTML for email
 */
function generateBillHtml($order, $orderItems, $displayOrderId, $orderDate, $logoUrl, $subtotal, $discount, $taxableValue, $cgst, $sgst, $shipping, $total) {
    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            @media print {
                @page {
                    size: A4;
                    margin: 10mm;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
                .no-print {
                    display: none !important;
                }
                .page-break {
                    page-break-before: always;
                }
                table {
                    page-break-inside: avoid;
                }
                tr {
                    page-break-inside: avoid;
                }
            }
            * {
                box-sizing: border-box;
            }
            body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 0;
                background: white;
            }
            .bill-container {
                border: 2px solid #1f2937;
                padding: 20px;
                background: white;
                max-width: 210mm;
                margin: 0 auto;
            }
            .header-section {
                border-bottom: 2px solid #1f2937;
                padding-bottom: 15px;
                margin-bottom: 15px;
            }
            .contact-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                gap: 10px;
            }
            .contact-box {
                border: 1px solid #d1d5db;
                padding: 8px 12px;
                background: #f9fafb;
                flex: 1;
            }
            .contact-box p {
                margin: 0;
                font-size: 12px;
                font-weight: bold;
                color: #374151;
            }
            .logo-section {
                text-align: center;
                border: 1px solid #1f2937;
                padding: 15px;
                background: #f9fafb;
                margin-top: 10px;
            }
            .logo-section img {
                max-width: 200px;
                max-height: 120px;
                height: auto;
                width: auto;
                display: block;
                margin: 0 auto 10px;
            }
            .company-name {
                font-size: 14px;
                font-weight: bold;
                color: #374151;
                margin: 5px 0;
            }
            .company-address {
                font-size: 11px;
                color: #6b7280;
                margin: 5px 0;
                line-height: 1.4;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
            }
            .detail-box {
                border: 1px solid #d1d5db;
                padding: 12px;
                background: white;
            }
            .detail-box h3 {
                font-size: 13px;
                font-weight: bold;
                color: #111827;
                margin: 0 0 10px 0;
                border-bottom: 1px solid #9ca3af;
                padding-bottom: 8px;
                text-align: center;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 11px;
            }
            .detail-row:last-child {
                margin-bottom: 0;
            }
            .detail-label {
                font-weight: bold;
                color: #374151;
            }
            .detail-value {
                color: #111827;
                text-align: right;
            }
            .products-section {
                border: 1px solid #d1d5db;
                margin-bottom: 15px;
            }
            .products-header {
                background: #1f2937;
                padding: 8px;
            }
            .products-header h3 {
                font-size: 13px;
                font-weight: bold;
                color: white;
                margin: 0;
            }
            .products-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            .products-table thead tr {
                background: #f3f4f6;
                border-bottom: 1px solid #9ca3af;
            }
            .products-table th {
                padding: 8px;
                font-weight: bold;
                color: #111827;
                border-right: 1px solid #d1d5db;
                text-align: left;
            }
            .products-table th:first-child {
                width: 5%;
                text-align: center;
            }
            .products-table th:nth-child(2) {
                width: 40%;
            }
            .products-table th:nth-child(3) {
                width: 10%;
                text-align: center;
            }
            .products-table th:nth-child(4) {
                width: 8%;
                text-align: center;
            }
            .products-table th:nth-child(5) {
                width: 15%;
                text-align: right;
            }
            .products-table th:last-child {
                width: 12%;
                text-align: right;
                color: white;
                background: #1f2937;
            }
            .products-table td {
                padding: 8px;
                border-right: 1px solid #d1d5db;
                border-bottom: 1px solid #e5e7eb;
            }
            .products-table tbody tr:nth-child(even) {
                background: #f9fafb;
            }
            .products-table tbody tr:nth-child(odd) {
                background: white;
            }
            .product-cell {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .product-cell img {
                width: 48px;
                height: 48px;
                object-fit: cover;
                border: 1px solid #d1d5db;
                flex-shrink: 0;
            }
            .product-info {
                flex: 1;
                min-width: 0;
            }
            .product-name {
                margin: 0;
                font-weight: bold;
                color: #111827;
                font-size: 11px;
            }
            .product-category {
                margin: 0;
                color: #6b7280;
                font-size: 10px;
            }
            .text-center {
                text-align: center;
            }
            .text-right {
                text-align: right;
            }
            .summary-row {
                background: #f3f4f6;
                border-top: 2px solid #9ca3af;
            }
            .summary-row td {
                padding: 8px;
                border-right: 1px solid #d1d5db;
                font-weight: bold;
                color: #111827;
            }
            .grand-total-row {
                background: #1f2937;
                color: white;
                border-top: 2px solid #1f2937;
            }
            .grand-total-row td {
                padding: 12px;
                border-right: 1px solid #374151;
                font-weight: bold;
                font-size: 13px;
            }
            .grand-total-row td:last-child {
                font-size: 16px;
            }
        </style>
    </head>
    <body>
    <div class='bill-container'>
        <!-- Header -->
        <div class='header-section'>
            <div class='contact-info'>
                <div class='contact-box'>
                    <p>Phone: 082209 57243</p>
                </div>
                <div class='contact-box'>
                    <p>Website: www.skbakers.com</p>
                </div>
            </div>
            
            <div class='logo-section'>
                <img src='" . htmlspecialchars($logoUrl) . "' alt='SK BAKERS Logo' onerror=\"this.style.display='none'; this.nextElementSibling.style.display='block';\">
                <div style='display: none; font-size: 24px; font-weight: bold; color: #dc2626; padding: 20px; background: #fee2e2; border-radius: 8px;'>SK BAKERS</div>
                <p class='company-name'>PREMIUM BAKERY & CONFECTIONERY</p>
                <p class='company-address'>
                    Groundfloor, Gateway plaza, opposite hdfc bank, Srinivasa Nagar, Inam Maniyachi, Kovilpatti, Tamil Nadu 628502
                </p>
            </div>
        </div>
        
        <!-- Invoice Details -->
        <div class='details-grid'>
            <!-- Recipient Details -->
            <div class='detail-box'>
                <h3>RECIPIENT DETAILS</h3>
                <div class='detail-row'>
                    <span class='detail-label'>Name:</span>
                    <span class='detail-value'>" . htmlspecialchars($order['shipping_name'] ?? $order['customer_name'] ?? 'N/A') . "</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Address:</span>
                    <span class='detail-value'>" . htmlspecialchars(($order['address'] ?? 'N/A') . ', ' . ($order['city'] ?? '') . ', ' . ($order['postal_code'] ?? '') . ', ' . ($order['country'] ?? 'India')) . "</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>State:</span>
                    <span class='detail-value'>" . htmlspecialchars($order['state'] ?? 'Delhi') . " (07)</span>
                </div>
            </div>
            
            <!-- Invoice Details -->
            <div class='detail-box'>
                <h3>INVOICE DETAILS</h3>
                <div class='detail-row'>
                    <span class='detail-label'>Inv. No.:</span>
                    <span class='detail-value'>" . htmlspecialchars($displayOrderId) . "</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Date:</span>
                    <span class='detail-value'>" . htmlspecialchars($orderDate) . "</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Transport:</span>
                    <span class='detail-value'>Road</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Place of Supply:</span>
                    <span class='detail-value'>Delhi (07)</span>
                </div>
            </div>
        </div>
        
        <!-- Products Table -->
        <div class='products-section'>
            <div class='products-header'>
                <h3>PRODUCT DETAILS</h3>
            </div>
            <table class='products-table'>
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Product Details</th>
                        <th>HSN</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>";
    
    $sno = 1;
    foreach ($orderItems as $item) {
        $itemName = htmlspecialchars($item['name'] ?? $item['product_name'] ?? 'Product');
        $itemImage = getImageUrl($item['image'] ?? $item['product_image'] ?? '');
        if (!$itemImage) {
            $itemImage = BASE_URL . '/backend/uploads/products/default-product.png';
        }
        $itemQuantity = (int)($item['quantity'] ?? 1);
        $itemPrice = (float)($item['price'] ?? 0);
        $itemTotal = $itemQuantity * $itemPrice;
        
        $html .= "
                    <tr>
                        <td class='text-center' style='font-weight: bold; color: #111827;'>$sno</td>
                        <td>
                            <div class='product-cell'>
                                <img src='" . htmlspecialchars($itemImage) . "' alt='$itemName' onerror=\"this.style.display='none';\">
                                <div class='product-info'>
                                    <p class='product-name'>$itemName</p>
                                    <p class='product-category'>Bakery Items</p>
                                </div>
                            </div>
                        </td>
                        <td class='text-center' style='font-weight: bold; color: #111827;'>3604</td>
                        <td class='text-center' style='font-weight: bold; color: #111827;'>$itemQuantity</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($itemPrice, 2) . "</td>
                        <td class='text-right' style='font-weight: bold; color: #111827; background: #f3f4f6;'>₹" . number_format($itemTotal, 2) . "</td>
                    </tr>";
        $sno++;
    }
    
    $html .= "
                    <!-- Summary Rows -->
                    <tr class='summary-row'>
                        <td colspan='5' style='font-weight: bold; color: #111827;'>TOTAL</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($subtotal, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan='5' style='color: #374151;'>Commission</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹0.00</td>
                    </tr>
                    <tr>
                        <td colspan='5' style='color: #374151;'>Discount</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($discount, 2) . "</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #d1d5db;'>
                        <td colspan='5' style='font-weight: bold; color: #111827;'>Taxable Value</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($taxableValue, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan='5' style='color: #374151;'>CGST @ 9%</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($cgst, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan='5' style='color: #374151;'>SGST @ 9%</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($sgst, 2) . "</td>
                    </tr>
                    <tr>
                        <td colspan='5' style='color: #374151;'>IGST @ 18%</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹0.00</td>
                    </tr>
                    <tr>
                        <td colspan='5' style='color: #374151;'>Freight</td>
                        <td class='text-right' style='font-weight: bold; color: #111827;'>₹" . number_format($shipping, 2) . "</td>
                    </tr>
                    <tr class='grand-total-row'>
                        <td colspan='5'>GRAND TOTAL</td>
                        <td class='text-right'>₹" . number_format($total, 2) . "</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Total in Words -->
        <div style='margin-top: 15px; padding: 10px; background: #f9fafb; border: 1px solid #d1d5db;'>
            <p style='margin: 0; font-size: 11px; color: #111827; font-weight: bold;'>
                Rupees in words: " . numberToWords($total) . " Only
            </p>
        </div>
        
        <!-- Terms & Conditions -->
        <div style='margin-top: 15px; padding: 10px; background: #1f2937; border: 1px solid #1f2937;'>
            <h3 style='margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: white;'>TERMS & CONDITIONS</h3>
            <ul style='margin: 0; padding-left: 20px; font-size: 10px; color: #cbd5e0; line-height: 1.6;'>
                <li>All bakery items are prepared fresh and should be consumed within the recommended time frame.</li>
                <li>Items should be stored in a cool, dry place away from direct sunlight.</li>
                <li>Any disputes are subject to the jurisdiction of the local courts.</li>
            </ul>
        </div>
    </div>
    </body>
    </html>
    ";
    
    return $html;
}

/**
 * Convert number to words (Indian numbering system)
 */
function numberToWords($number) {
    $ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    $number = (int)round($number);
    
    if ($number == 0) {
        return 'Zero';
    }
    
    if ($number < 20) {
        return $ones[$number];
    }
    
    if ($number < 100) {
        $ten = (int)($number / 10);
        $one = $number % 10;
        return $tens[$ten] . ($one > 0 ? ' ' . $ones[$one] : '');
    }
    
    if ($number < 1000) {
        $hundred = (int)($number / 100);
        $remainder = $number % 100;
        $result = $ones[$hundred] . ' Hundred';
        if ($remainder > 0) {
            $result .= ' ' . numberToWords($remainder);
        }
        return $result;
    }
    
    if ($number < 100000) {
        $thousand = (int)($number / 1000);
        $remainder = $number % 1000;
        $result = numberToWords($thousand) . ' Thousand';
        if ($remainder > 0) {
            $result .= ' ' . numberToWords($remainder);
        }
        return $result;
    }
    
    if ($number < 10000000) {
        $lakh = (int)($number / 100000);
        $remainder = $number % 100000;
        $result = numberToWords($lakh) . ' Lakh';
        if ($remainder > 0) {
            $result .= ' ' . numberToWords($remainder);
        }
        return $result;
    }
    
    $crore = (int)($number / 10000000);
    $remainder = $number % 10000000;
    $result = numberToWords($crore) . ' Crore';
    if ($remainder > 0) {
        $result .= ' ' . numberToWords($remainder);
    }
    return $result;
}

