<?php
/**
 * Offer Popups API Endpoints
 * Routes: /api/offer-popups/*
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

// Get path after /api/offer-popups/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/offer-popups and /api/php-backend/api/offer-popups
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'offer-popups') {
    // Handle /api/php-backend/api/offer-popups
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/offer-popups
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case '':
            if ($method === 'GET') {
                // Check if user is admin
                try {
                    $authUser = AuthMiddleware::authenticate(false);
                    if ($authUser && $authUser->role === 'admin') {
                        getAllOfferPopups($db);
                    } else {
                        getActiveOfferPopups($db);
                    }
                } catch (Exception $e) {
                    getActiveOfferPopups($db);
                }
            } elseif ($method === 'POST') {
                createOfferPopup($db);
            }
            break;

        case 'active':
            if ($method === 'GET') {
                getActiveOfferPopups($db);
            }
            break;

        default:
            $popupId = $endpoint;
            if (is_numeric($popupId)) {
                if ($method === 'GET') {
                    getOfferPopupById($db, $popupId);
                } elseif ($method === 'PUT') {
                    updateOfferPopup($db, $popupId);
                } elseif ($method === 'DELETE') {
                    deleteOfferPopup($db, $popupId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get active offer popups
 */
function getActiveOfferPopups($db) {
    $stmt = $db->prepare("
        SELECT id, title, description, image_url, coupon_code, discount_percentage,
               button_text, button_link, is_active, show_on_homepage
        FROM offer_popups
        WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $popups = $stmt->fetchAll();

    sendSuccess('Active offer popups retrieved successfully', ['popups' => $popups]);
}

/**
 * Get all offer popups (Admin only)
 */
function getAllOfferPopups($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT * FROM offer_popups
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $popups = $stmt->fetchAll();

    sendSuccess('All offer popups retrieved successfully', [
        'popups' => $popups,
        'count' => count($popups)
    ]);
}

/**
 * Get single offer popup by ID
 */
function getOfferPopupById($db, $popupId) {
    $stmt = $db->prepare("SELECT * FROM offer_popups WHERE id = ?");
    $stmt->execute([$popupId]);
    $popup = $stmt->fetch();

    if (!$popup) {
        sendError('Offer popup not found', [], 404);
    }

    sendSuccess('Offer popup retrieved successfully', ['popup' => $popup]);
}

/**
 * Create new offer popup (Admin only)
 */
function createOfferPopup($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    $errors = validateRequired($data, ['title']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $title = sanitizeInput($data['title']);
    $description = isset($data['description']) ? sanitizeInput($data['description']) : null;
    $imageUrl = isset($data['imageUrl']) ? sanitizeInput($data['imageUrl']) : null;
    $couponCode = isset($data['couponCode']) ? sanitizeInput($data['couponCode']) : null;
    $discountPercentage = isset($data['discountPercentage']) ? (float)$data['discountPercentage'] : null;
    $buttonText = isset($data['buttonText']) ? sanitizeInput($data['buttonText']) : 'Shop Now';
    $buttonLink = isset($data['buttonLink']) ? sanitizeInput($data['buttonLink']) : null;
    $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
    $showOnHomepage = isset($data['showOnHomepage']) ? (int)$data['showOnHomepage'] : 1;
    $startDate = isset($data['startDate']) ? $data['startDate'] : null;
    $endDate = isset($data['endDate']) ? $data['endDate'] : null;

    $stmt = $db->prepare("
        INSERT INTO offer_popups (title, description, image_url, coupon_code, discount_percentage,
                                button_text, button_link, is_active, show_on_homepage, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$title, $description, $imageUrl, $couponCode, $discountPercentage,
                       $buttonText, $buttonLink, $isActive, $showOnHomepage, $startDate, $endDate])) {
        $popupId = $db->lastInsertId();

        // Get created popup
        $stmt = $db->prepare("SELECT * FROM offer_popups WHERE id = ?");
        $stmt->execute([$popupId]);
        $popup = $stmt->fetch();

        sendSuccess('Offer popup created successfully', ['popup' => $popup], 201);
    } else {
        sendError('Failed to create offer popup', [], 500);
    }
}

/**
 * Update offer popup (Admin only)
 */
function updateOfferPopup($db, $popupId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    // Check if popup exists
    $stmt = $db->prepare("SELECT id FROM offer_popups WHERE id = ?");
    $stmt->execute([$popupId]);
    if (!$stmt->fetch()) {
        sendError('Offer popup not found', [], 404);
    }

    // Build update query dynamically
    $updates = [];
    $params = [];

    if (isset($data['title'])) {
        $updates[] = "title = ?";
        $params[] = sanitizeInput($data['title']);
    }
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = sanitizeInput($data['description']);
    }
    if (isset($data['imageUrl'])) {
        $updates[] = "image_url = ?";
        $params[] = sanitizeInput($data['imageUrl']);
    }
    if (isset($data['couponCode'])) {
        $updates[] = "coupon_code = ?";
        $params[] = sanitizeInput($data['couponCode']);
    }
    if (isset($data['discountPercentage'])) {
        $updates[] = "discount_percentage = ?";
        $params[] = (float)$data['discountPercentage'];
    }
    if (isset($data['buttonText'])) {
        $updates[] = "button_text = ?";
        $params[] = sanitizeInput($data['buttonText']);
    }
    if (isset($data['buttonLink'])) {
        $updates[] = "button_link = ?";
        $params[] = sanitizeInput($data['buttonLink']);
    }
    if (isset($data['isActive'])) {
        $updates[] = "is_active = ?";
        $params[] = (int)$data['isActive'];
    }
    if (isset($data['showOnHomepage'])) {
        $updates[] = "show_on_homepage = ?";
        $params[] = (int)$data['showOnHomepage'];
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

    $params[] = $popupId;
    $sql = "UPDATE offer_popups SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        // Get updated popup
        $stmt = $db->prepare("SELECT * FROM offer_popups WHERE id = ?");
        $stmt->execute([$popupId]);
        $popup = $stmt->fetch();

        sendSuccess('Offer popup updated successfully', ['popup' => $popup]);
    } else {
        sendError('Failed to update offer popup', [], 500);
    }
}

/**
 * Delete offer popup (Admin only)
 */
function deleteOfferPopup($db, $popupId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if popup exists
    $stmt = $db->prepare("SELECT id FROM offer_popups WHERE id = ?");
    $stmt->execute([$popupId]);
    if (!$stmt->fetch()) {
        sendError('Offer popup not found', [], 404);
    }

    // Delete popup
    $stmt = $db->prepare("DELETE FROM offer_popups WHERE id = ?");
    if ($stmt->execute([$popupId])) {
        sendSuccess('Offer popup deleted successfully');
    } else {
        sendError('Failed to delete offer popup', [], 500);
    }
}
