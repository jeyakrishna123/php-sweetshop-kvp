<?php
/**
 * Coupons API Endpoints
 * Routes: /api/coupons/*
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

// Get path after /api/coupons/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/coupons and /api/php-backend/api/coupons
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'coupons') {
    // Handle /api/php-backend/api/coupons
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/coupons
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case '':
            if ($method === 'GET') {
                getAllCoupons($db);
            } elseif ($method === 'POST') {
                createCoupon($db);
            }
            break;

        case 'validate':
            if ($method === 'POST') {
                validateCoupon($db);
            }
            break;

        case 'apply':
            if ($method === 'POST') {
                applyCoupon($db);
            }
            break;

        default:
            $couponId = $endpoint;
            if (is_numeric($couponId)) {
                if ($method === 'GET') {
                    getCouponById($db, $couponId);
                } elseif ($method === 'PUT') {
                    updateCoupon($db, $couponId);
                } elseif ($method === 'DELETE') {
                    deleteCoupon($db, $couponId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get all coupons (Admin only)
 */
function getAllCoupons($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("SELECT * FROM coupons ORDER BY created_at DESC");
    $stmt->execute();
    $coupons = $stmt->fetchAll();

    sendSuccess('Coupons retrieved successfully', [
        'coupons' => $coupons,
        'count' => count($coupons)
    ]);
}

/**
 * Get single coupon by ID (Admin only)
 */
function getCouponById($db, $couponId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("SELECT * FROM coupons WHERE id = ?");
    $stmt->execute([$couponId]);
    $coupon = $stmt->fetch();

    if (!$coupon) {
        sendError('Coupon not found', [], 404);
    }

    sendSuccess('Coupon retrieved successfully', ['coupon' => $coupon]);
}

/**
 * Create new coupon (Admin only)
 */
function createCoupon($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    $errors = validateRequired($data, ['code', 'type', 'value']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $code = strtoupper(sanitizeInput($data['code']));
    $description = isset($data['description']) ? sanitizeInput($data['description']) : null;
    $type = sanitizeInput($data['type']); // percentage or fixed
    $value = (float)$data['value'];
    $minOrderAmount = isset($data['minOrderAmount']) ? (float)$data['minOrderAmount'] : 0;
    $maxDiscount = isset($data['maxDiscount']) ? (float)$data['maxDiscount'] : null;
    $usageLimit = isset($data['usageLimit']) ? (int)$data['usageLimit'] : null;
    $userLimit = isset($data['userLimit']) ? (int)$data['userLimit'] : null;
    $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
    $startDate = isset($data['startDate']) ? $data['startDate'] : null;
    $endDate = isset($data['endDate']) ? $data['endDate'] : null;

    // Validate type
    if (!in_array($type, ['percentage', 'fixed'])) {
        sendError('Invalid coupon type', [], 400);
    }

    // Check if coupon code already exists
    $stmt = $db->prepare("SELECT id FROM coupons WHERE code = ?");
    $stmt->execute([$code]);
    if ($stmt->fetch()) {
        sendError('Coupon code already exists', [], 409);
    }

    $stmt = $db->prepare("
        INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount,
                           usage_limit, user_limit, is_active, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$code, $description, $type, $value, $minOrderAmount, $maxDiscount,
                       $usageLimit, $userLimit, $isActive, $startDate, $endDate])) {
        $couponId = $db->lastInsertId();

        // Get created coupon
        $stmt = $db->prepare("SELECT * FROM coupons WHERE id = ?");
        $stmt->execute([$couponId]);
        $coupon = $stmt->fetch();

        sendSuccess('Coupon created successfully', ['coupon' => $coupon], 201);
    } else {
        sendError('Failed to create coupon', [], 500);
    }
}

/**
 * Update coupon (Admin only)
 */
function updateCoupon($db, $couponId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    // Check if coupon exists
    $stmt = $db->prepare("SELECT id FROM coupons WHERE id = ?");
    $stmt->execute([$couponId]);
    if (!$stmt->fetch()) {
        sendError('Coupon not found', [], 404);
    }

    // Build update query dynamically
    $updates = [];
    $params = [];

    if (isset($data['code'])) {
        $updates[] = "code = ?";
        $params[] = strtoupper(sanitizeInput($data['code']));
    }
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = sanitizeInput($data['description']);
    }
    if (isset($data['type'])) {
        $updates[] = "type = ?";
        $params[] = sanitizeInput($data['type']);
    }
    if (isset($data['value'])) {
        $updates[] = "value = ?";
        $params[] = (float)$data['value'];
    }
    if (isset($data['minOrderAmount'])) {
        $updates[] = "min_order_amount = ?";
        $params[] = (float)$data['minOrderAmount'];
    }
    if (isset($data['maxDiscount'])) {
        $updates[] = "max_discount = ?";
        $params[] = (float)$data['maxDiscount'];
    }
    if (isset($data['usageLimit'])) {
        $updates[] = "usage_limit = ?";
        $params[] = (int)$data['usageLimit'];
    }
    if (isset($data['userLimit'])) {
        $updates[] = "user_limit = ?";
        $params[] = (int)$data['userLimit'];
    }
    if (isset($data['isActive'])) {
        $updates[] = "is_active = ?";
        $params[] = (int)$data['isActive'];
    }
    if (isset($data['startDate'])) {
        $updates[] = "start_date = ?";
        $params[] = $data['startDate'];
    }
    if (isset($data['endDate'])) {
        $updates[] = "end_date = ?";
        $params[] = $data['endDate'];
    }

    if (empty($updates)) {
        sendError('No fields to update', [], 400);
    }

    $params[] = $couponId;
    $sql = "UPDATE coupons SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        // Get updated coupon
        $stmt = $db->prepare("SELECT * FROM coupons WHERE id = ?");
        $stmt->execute([$couponId]);
        $coupon = $stmt->fetch();

        sendSuccess('Coupon updated successfully', ['coupon' => $coupon]);
    } else {
        sendError('Failed to update coupon', [], 500);
    }
}

/**
 * Delete coupon (Admin only)
 */
function deleteCoupon($db, $couponId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if coupon exists
    $stmt = $db->prepare("SELECT id FROM coupons WHERE id = ?");
    $stmt->execute([$couponId]);
    if (!$stmt->fetch()) {
        sendError('Coupon not found', [], 404);
    }

    // Delete coupon
    $stmt = $db->prepare("DELETE FROM coupons WHERE id = ?");
    if ($stmt->execute([$couponId])) {
        sendSuccess('Coupon deleted successfully');
    } else {
        sendError('Failed to delete coupon', [], 500);
    }
}

/**
 * Validate coupon code
 */
function validateCoupon($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['code']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $code = strtoupper(sanitizeInput($data['code']));
    $orderAmount = isset($data['orderAmount']) ? (float)$data['orderAmount'] : 0;

    // Get coupon
    $stmt = $db->prepare("
        SELECT * FROM coupons
        WHERE code = ? AND is_active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    ");
    $stmt->execute([$code]);
    $coupon = $stmt->fetch();

    if (!$coupon) {
        sendError('Invalid or expired coupon code', [], 404);
    }

    // Check usage limit
    if ($coupon['usage_limit'] && $coupon['usage_count'] >= $coupon['usage_limit']) {
        sendError('Coupon usage limit reached', [], 400);
    }

    // Check minimum order amount
    if ($orderAmount < $coupon['min_order_amount']) {
        sendError("Minimum order amount is {$coupon['min_order_amount']}", [], 400);
    }

    // Calculate discount
    $discount = 0;
    if ($coupon['type'] === 'percentage') {
        $discount = ($orderAmount * $coupon['value']) / 100;
        if ($coupon['max_discount'] && $discount > $coupon['max_discount']) {
            $discount = $coupon['max_discount'];
        }
    } else {
        $discount = $coupon['value'];
    }

    sendSuccess('Coupon is valid', [
        'coupon' => [
            'code' => $coupon['code'],
            'type' => $coupon['type'],
            'value' => $coupon['value'],
            'discount' => $discount
        ]
    ]);
}

/**
 * Apply coupon to order
 */
function applyCoupon($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $errors = validateRequired($data, ['code', 'orderAmount']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $code = strtoupper(sanitizeInput($data['code']));
    $orderAmount = (float)$data['orderAmount'];

    // Get coupon
    $stmt = $db->prepare("
        SELECT * FROM coupons
        WHERE code = ? AND is_active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    ");
    $stmt->execute([$code]);
    $coupon = $stmt->fetch();

    if (!$coupon) {
        sendError('Invalid or expired coupon code', [], 404);
    }

    // Check usage limit
    if ($coupon['usage_limit'] && $coupon['usage_count'] >= $coupon['usage_limit']) {
        sendError('Coupon usage limit reached', [], 400);
    }

    // Check minimum order amount
    if ($orderAmount < $coupon['min_order_amount']) {
        sendError("Minimum order amount is {$coupon['min_order_amount']}", [], 400);
    }

    // Calculate discount
    $discount = 0;
    if ($coupon['type'] === 'percentage') {
        $discount = ($orderAmount * $coupon['value']) / 100;
        if ($coupon['max_discount'] && $discount > $coupon['max_discount']) {
            $discount = $coupon['max_discount'];
        }
    } else {
        $discount = $coupon['value'];
    }

    $finalAmount = max(0, $orderAmount - $discount);

    sendSuccess('Coupon applied successfully', [
        'coupon' => [
            'code' => $coupon['code'],
            'type' => $coupon['type'],
            'value' => $coupon['value']
        ],
        'orderAmount' => $orderAmount,
        'discount' => $discount,
        'finalAmount' => $finalAmount
    ]);
}
