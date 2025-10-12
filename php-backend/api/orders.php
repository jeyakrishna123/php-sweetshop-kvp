<?php
/**
 * Orders API Endpoints
 * Routes: /api/orders/*
 */

// session_start(); // Already started in index.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

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
                getAllOrders($db);
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
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    // Validate required fields
    $errors = validateRequired($data, ['orderItems', 'shippingAddress', 'paymentInfo', 'totalPrice']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
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

        // Insert order items
        $itemStmt = $db->prepare("
            INSERT INTO order_items (
                order_id, product_id, name, quantity, price, original_price,
                discount, image, sku, weight
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($data['orderItems'] as $item) {
            $itemStmt->execute([
                $orderId,
                $item['product'],
                $item['name'],
                $item['quantity'],
                $item['price'],
                $item['originalPrice'] ?? null,
                $item['discount'] ?? 0,
                $item['image'],
                $item['sku'] ?? null,
                $item['weight'] ?? null
            ]);

            // Update product stock and sold count
            $productStmt = $db->prepare("
                UPDATE products
                SET stock = GREATEST(0, stock - ?), sold_count = sold_count + ?
                WHERE id = ?
            ");
            $productStmt->execute([$item['quantity'], $item['quantity'], $item['product']]);
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

        // Insert payment info
        $payment = $data['paymentInfo'];
        $paymentStmt = $db->prepare("
            INSERT INTO payment_info (
                order_id, payment_id, status, method, transaction_id
            ) VALUES (?, ?, ?, ?, ?)
        ");
        $paymentStmt->execute([
            $orderId,
            $payment['id'],
            $payment['status'] ?? 'pending',
            $payment['method'],
            $payment['transactionId'] ?? null
        ]);

        // Insert status history
        $historyStmt = $db->prepare("
            INSERT INTO order_status_history (order_id, status, note)
            VALUES (?, ?, ?)
        ");
        $historyStmt->execute([$orderId, 'pending', 'Order created']);

        // Update user statistics
        $userStmt = $db->prepare("
            UPDATE users
            SET total_orders = total_orders + 1,
                total_spent = total_spent + ?,
                last_order_date = NOW()
            WHERE id = ?
        ");
        $userStmt->execute([$data['totalPrice'], $authUser->id]);

        $db->commit();

        sendSuccess('Order created successfully', [
            'orderId' => $orderId,
            'trackingNumber' => $trackingNumber
        ], 201);

    } catch (Exception $e) {
        $db->rollBack();
        sendError('Failed to create order', ['error' => $e->getMessage()], 500);
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
    AuthMiddleware::requireAdmin();
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
    $authUser = AuthMiddleware::requireAdmin();
    $data = getRequestBody();

    $db->beginTransaction();

    try {
        // Build update query
        $fields = [];
        $params = [];

        if (isset($data['status'])) {
            $fields[] = "status = ?";
            $params[] = sanitizeInput($data['status']);

            // Add to status history
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
