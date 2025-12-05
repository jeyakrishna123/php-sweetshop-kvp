<?php
/**
 * Payment API Endpoints
 * Routes: /api/payment/*
 */

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

// Handle both /api/payment and /api/php-backend/api/payment
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'payment') {
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case 'methods':
            if ($method === 'GET') {
                getPaymentMethods();
            }
            break;

        case 'create-session':
            if ($method === 'POST') {
                createPaymentSession($db);
            }
            break;

        case 'process':
            if ($method === 'POST') {
                processPayment($db);
            }
            break;

        case 'verify':
            if ($method === 'POST') {
                verifyPayment($db);
            }
            break;

        default:
            sendError('Endpoint not found', [], 404);
    }
} catch (Exception $e) {
    error_log("❌ Payment API Error: " . $e->getMessage());
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get available payment methods
 */
function getPaymentMethods() {
    // Return available payment methods for the e-commerce site
    $paymentMethods = [
        [
            'id' => 'cod',
            'name' => 'Cash on Delivery',
            'description' => 'Pay when you receive your order',
            'icon' => '💵',
            'enabled' => true,
            'fee' => 0,
            'minAmount' => 0,
            'maxAmount' => 50000
        ],
        [
            'id' => 'upi',
            'name' => 'UPI Payment',
            'description' => 'Pay using UPI ID (Google Pay, PhonePe, Paytm)',
            'icon' => '📱',
            'enabled' => true,
            'fee' => 0,
            'minAmount' => 1,
            'maxAmount' => 100000,
            'requiresInput' => true,
            'inputLabel' => 'Enter your UPI ID',
            'inputPlaceholder' => 'yourname@upi'
        ],
        [
            'id' => 'card',
            'name' => 'Credit/Debit Card',
            'description' => 'Pay securely with your card',
            'icon' => '💳',
            'enabled' => false, // Not implemented yet
            'fee' => 0,
            'minAmount' => 1,
            'maxAmount' => 500000
        ],
        [
            'id' => 'netbanking',
            'name' => 'Net Banking',
            'description' => 'Pay using your bank account',
            'icon' => '🏦',
            'enabled' => false, // Not implemented yet
            'fee' => 0,
            'minAmount' => 1,
            'maxAmount' => 500000
        ],
        [
            'id' => 'wallet',
            'name' => 'Digital Wallet',
            'description' => 'Pay using Paytm, PhonePe, etc.',
            'icon' => '👛',
            'enabled' => false, // Not implemented yet
            'fee' => 0,
            'minAmount' => 1,
            'maxAmount' => 100000
        ]
    ];

    // Return payment methods directly in data object for frontend compatibility
    sendResponse([
        'success' => true,
        'message' => 'Payment methods retrieved successfully',
        'paymentMethods' => $paymentMethods,
        'defaultMethod' => 'cod',
        'timestamp' => date('c')
    ]);
}

/**
 * Create payment session and order
 */
function createPaymentSession($db) {
    error_log("💳 CREATE PAYMENT SESSION - Request received");

    // Check if user is authenticated
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $authUser = null;

    if (!empty($token)) {
        try {
            $authUser = AuthMiddleware::authenticate();
        } catch (Exception $e) {
            // Continue without auth for guest checkout
            error_log("⚠️ No auth token, proceeding with guest checkout");
        }
    }

    $data = getRequestBody();
    error_log("💳 CREATE PAYMENT SESSION - Data: " . json_encode($data));

    // Validate required fields
    $errors = validateRequired($data, ['cartItems', 'totalAmount', 'shippingAddress', 'paymentMethod']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $paymentMethod = sanitizeInput($data['paymentMethod']);
    $totalAmount = floatval($data['totalAmount']);
    $cartItems = $data['cartItems'];
    $shippingAddress = $data['shippingAddress'];
    $userId = $authUser ? $authUser->id : ($data['userId'] ?? null);

    $db->beginTransaction();

    try {
        // Generate tracking number
        $trackingNumber = 'TRK-' . time() . '-' . strtoupper(substr(md5(rand()), 0, 6));

        error_log("💳 Creating order with tracking: $trackingNumber");

        // Calculate order amounts
        $itemsPrice = $totalAmount;
        $taxPrice = $itemsPrice * 0.18; // 18% GST
        $shippingPrice = $totalAmount >= 500 ? 0 : 50;
        $finalTotal = $itemsPrice + $taxPrice + $shippingPrice;

        // Create order
        $stmt = $db->prepare("
            INSERT INTO orders (
                user_id, tracking_number, status, items_price, tax_price,
                shipping_price, total_price, currency, shipping_method
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $trackingNumber,
            'pending',
            $itemsPrice,
            $taxPrice,
            $shippingPrice,
            $finalTotal,
            'INR',
            'standard'
        ]);

        $orderId = $db->lastInsertId();
        error_log("✅ Order created with ID: $orderId");

        // Insert order items
        $itemStmt = $db->prepare("
            INSERT INTO order_items (
                order_id, product_id, name, quantity, price, image
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");

        foreach ($cartItems as $item) {
            $itemImage = $item['image'] ?? $item['thumbnail'] ?? '/images/placeholder.jpg';

            $itemStmt->execute([
                $orderId,
                $item['_id'] ?? $item['product'],
                $item['name'],
                $item['quantity'],
                $item['price'],
                $itemImage
            ]);
        }

        // Insert shipping address
        $addrStmt = $db->prepare("
            INSERT INTO shipping_addresses (
                order_id, name, phone, address, city, state, postal_code, country
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $addrStmt->execute([
            $orderId,
            $shippingAddress['name'] ?? 'Customer',
            $shippingAddress['phone'] ?? '',
            $shippingAddress['address'] ?? '',
            $shippingAddress['city'] ?? '',
            $shippingAddress['state'] ?? '',
            $shippingAddress['postalCode'] ?? '',
            $shippingAddress['country'] ?? 'India'
        ]);

        // Handle different payment methods
        $paymentResponse = [];

        switch ($paymentMethod) {
            case 'cod':
                // Cash on Delivery
                $paymentId = 'COD-' . $orderId;

                $paymentStmt = $db->prepare("
                    INSERT INTO payment_info (
                        order_id, payment_id, status, method
                    ) VALUES (?, ?, ?, ?)
                ");
                $paymentStmt->execute([$orderId, $paymentId, 'pending', 'Cash On Delivery']);

                $paymentResponse = [
                    'success' => true,
                    'orderId' => $orderId,
                    'trackingNumber' => $trackingNumber,
                    'paymentMethod' => 'cod',
                    'message' => 'Order placed successfully. Pay on delivery.',
                    'order' => [
                        'id' => $orderId,
                        'tracking_number' => $trackingNumber,
                        'total_price' => $finalTotal,
                        'status' => 'pending'
                    ]
                ];
                break;

            case 'upi':
                // UPI Payment
                $merchantUPI = 'merchant@upi'; // Replace with actual merchant UPI
                $paymentId = 'UPI-' . $orderId;

                $paymentStmt = $db->prepare("
                    INSERT INTO payment_info (
                        order_id, payment_id, status, method
                    ) VALUES (?, ?, ?, ?)
                ");
                $paymentStmt->execute([$orderId, $paymentId, 'pending', 'UPI']);

                // Generate UPI payment link
                $upiLink = "upi://pay?pa=$merchantUPI&pn=SK Bakers&am=$finalTotal&cu=INR&tn=Order-$trackingNumber";

                $paymentResponse = [
                    'success' => true,
                    'orderId' => $orderId,
                    'trackingNumber' => $trackingNumber,
                    'paymentMethod' => 'upi',
                    'amount' => $finalTotal,
                    'upiId' => $merchantUPI,
                    'upiLink' => $upiLink,
                    'message' => 'Please complete UPI payment',
                    'order' => [
                        'id' => $orderId,
                        'tracking_number' => $trackingNumber,
                        'total_price' => $finalTotal,
                        'status' => 'pending'
                    ]
                ];
                break;

            default:
                throw new Exception("Payment method '$paymentMethod' not supported yet");
        }

        // Add status history
        $historyStmt = $db->prepare("
            INSERT INTO order_status_history (order_id, status, note)
            VALUES (?, ?, ?)
        ");
        $historyStmt->execute([$orderId, 'pending', "Order created via $paymentMethod"]);

        $db->commit();

        error_log("✅ Payment session created successfully for order: $orderId");

        sendResponse($paymentResponse);

    } catch (Exception $e) {
        $db->rollBack();
        error_log("❌ CREATE PAYMENT SESSION - Error: " . $e->getMessage());
        sendError('Failed to create payment session', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Verify payment
 */
function verifyPayment($db) {
    error_log("✅ VERIFY PAYMENT - Request received");

    $authUser = AuthMiddleware::optionalAuth();
    $data = getRequestBody();

    error_log("✅ VERIFY PAYMENT - Data: " . json_encode($data));

    $errors = validateRequired($data, ['orderId', 'paymentId', 'paymentMethod']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $orderId = $data['orderId'];
    $paymentId = sanitizeInput($data['paymentId']);
    $paymentMethod = sanitizeInput($data['paymentMethod']);

    $db->beginTransaction();

    try {
        // Update payment status
        $stmt = $db->prepare("
            UPDATE payment_info
            SET status = 'completed', transaction_id = ?
            WHERE order_id = ?
        ");
        $stmt->execute([$paymentId, $orderId]);

        // Update order status
        $stmt = $db->prepare("
            UPDATE orders
            SET status = 'confirmed', payment_status = 'paid'
            WHERE id = ?
        ");
        $stmt->execute([$orderId]);

        // Add to history
        $stmt = $db->prepare("
            INSERT INTO order_status_history (order_id, status, note)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$orderId, 'confirmed', "Payment verified via $paymentMethod"]);

        $db->commit();

        error_log("✅ Payment verified for order: $orderId");

        sendSuccess('Payment verified successfully', [
            'orderId' => $orderId,
            'paymentStatus' => 'paid',
            'orderStatus' => 'confirmed'
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        error_log("❌ VERIFY PAYMENT - Error: " . $e->getMessage());
        sendError('Payment verification failed', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Process payment
 */
function processPayment($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    // Validate required fields
    $errors = validateRequired($data, ['orderId', 'paymentMethod', 'amount']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $orderId = $data['orderId'];
    $paymentMethod = sanitizeInput($data['paymentMethod']);
    $amount = floatval($data['amount']);

    // Get order details
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
    $stmt->execute([$orderId, $authUser->id]);
    $order = $stmt->fetch();

    if (!$order) {
        sendError('Order not found', [], 404);
    }

    // Check if order is already paid
    if ($order['payment_status'] === 'paid') {
        sendError('Order already paid', [], 400);
    }

    $db->beginTransaction();

    try {
        // Update payment info based on method
        switch ($paymentMethod) {
            case 'cod':
                // COD payment - mark as pending
                $stmt = $db->prepare("
                    UPDATE payment_info
                    SET status = 'pending', method = 'Cash On Delivery'
                    WHERE order_id = ?
                ");
                $stmt->execute([$orderId]);

                $paymentStatus = 'pending';
                $message = 'Order placed successfully. Pay on delivery.';
                break;

            case 'upi':
                // UPI payment
                $upiId = sanitizeInput($data['upiId'] ?? '');

                if (empty($upiId)) {
                    throw new Exception('UPI ID is required');
                }

                $stmt = $db->prepare("
                    UPDATE payment_info
                    SET status = 'completed', method = 'UPI', transaction_id = ?
                    WHERE order_id = ?
                ");
                $stmt->execute([$upiId, $orderId]);

                $paymentStatus = 'paid';
                $message = 'Payment successful via UPI';
                break;

            default:
                throw new Exception('Invalid payment method');
        }

        // Update order payment status
        $stmt = $db->prepare("UPDATE orders SET payment_status = ? WHERE id = ?");
        $stmt->execute([$paymentStatus, $orderId]);

        // Add to order history
        $stmt = $db->prepare("
            INSERT INTO order_status_history (order_id, status, note)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            $orderId,
            $order['status'],
            "Payment method: $paymentMethod"
        ]);

        $db->commit();

        sendSuccess($message, [
            'orderId' => $orderId,
            'paymentStatus' => $paymentStatus,
            'paymentMethod' => $paymentMethod
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        error_log("❌ Payment processing error: " . $e->getMessage());
        sendError('Payment processing failed', ['error' => $e->getMessage()], 500);
    }
}
