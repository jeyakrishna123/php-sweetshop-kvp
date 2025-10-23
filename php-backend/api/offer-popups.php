<?php
/**
 * Offer Popups API Endpoints
 * Routes: /api/offer-popups/*
 */

// Start output buffering to prevent warnings from breaking JSON response
ob_start();

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
            // Handle /api/offer-popups/{id}/toggle or /api/offer-popups/{id}
            $popupId = $endpoint;

            // Check if this is a toggle request (e.g., mock-popup-123/toggle)
            if (isset($pathParts[3]) && $pathParts[3] === 'toggle') {
                // Extract ID from previous path part
                if (isset($pathParts[2])) {
                    $popupId = $pathParts[2];
                }
                if ($method === 'PATCH') {
                    toggleOfferPopup($db, $popupId);
                } else {
                    sendError('Method not allowed for toggle endpoint', [], 405);
                }
            }
            // Handle both /api/php-backend/api/offer-popups/{id}/toggle
            elseif (isset($pathParts[5]) && $pathParts[5] === 'toggle') {
                // Extract ID from previous path part
                if (isset($pathParts[4])) {
                    $popupId = $pathParts[4];
                }
                if ($method === 'PATCH') {
                    toggleOfferPopup($db, $popupId);
                } else {
                    sendError('Method not allowed for toggle endpoint', [], 405);
                }
            }
            // Regular ID-based operations
            elseif (!empty($popupId)) {
                if ($method === 'GET') {
                    getOfferPopupById($db, $popupId);
                } elseif ($method === 'PUT') {
                    updateOfferPopup($db, $popupId);
                } elseif ($method === 'DELETE') {
                    deleteOfferPopup($db, $popupId);
                } else {
                    sendError('Method not allowed', [], 405);
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
    // Handle mock IDs (non-numeric) - return 404 as they don't exist in database
    if (!is_numeric($popupId)) {
        error_log("⚠️ Non-numeric popup ID requested: $popupId (mock data)");
        sendError('Popup not found in database (mock ID)', [], 404);
        return;
    }

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
    error_log("🔍 createOfferPopup called");

    try {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
        error_log("✅ Auth passed");
    } catch (Exception $e) {
        error_log("❌ Auth failed: " . $e->getMessage());
        throw $e;
    }

    $data = getRequestBody();
    error_log("📥 Request body: " . json_encode($data));

    // Make title optional - use couponCode as title if title not provided
    $couponCode = isset($data['couponCode']) ? sanitizeInput($data['couponCode']) : null;
    $title = isset($data['title']) ? sanitizeInput($data['title']) : ($couponCode ? "Offer: $couponCode" : 'Special Offer');

    error_log("✅ Validation passed - using title: $title");

    $description = isset($data['description']) ? sanitizeInput($data['description']) : null;
    $imageUrl = isset($data['imageUrl']) ? sanitizeInput($data['imageUrl']) : null;
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

    error_log("📝 Executing INSERT with values: " . json_encode([
        'title' => $title,
        'description' => $description,
        'imageUrl' => $imageUrl,
        'couponCode' => $couponCode,
        'discountPercentage' => $discountPercentage,
        'buttonText' => $buttonText,
        'buttonLink' => $buttonLink,
        'isActive' => $isActive,
        'showOnHomepage' => $showOnHomepage,
        'startDate' => $startDate,
        'endDate' => $endDate
    ]));

    try {
        $result = $stmt->execute([$title, $description, $imageUrl, $couponCode, $discountPercentage,
                           $buttonText, $buttonLink, $isActive, $showOnHomepage, $startDate, $endDate]);

        if ($result) {
            $popupId = $db->lastInsertId();
            error_log("✅ Popup created with ID: $popupId");

            // Get created popup
            $stmt = $db->prepare("SELECT * FROM offer_popups WHERE id = ?");
            $stmt->execute([$popupId]);
            $popup = $stmt->fetch();

            sendSuccess('Offer popup created successfully', ['popup' => $popup], 201);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("❌ INSERT failed: " . json_encode($errorInfo));
            sendError('Failed to create offer popup', ['db_error' => $errorInfo], 500);
        }
    } catch (PDOException $e) {
        error_log("❌ Database exception: " . $e->getMessage());
        sendError('Database error', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Update offer popup (Admin only)
 */
function updateOfferPopup($db, $popupId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Handle mock IDs - they don't exist in database
    if (!is_numeric($popupId)) {
        error_log("⚠️ Cannot update non-numeric popup ID: $popupId (mock data)");
        sendError('Cannot update mock popup in database', [], 404);
        return;
    }

    $data = getRequestBody();

    // Check if popup exists
    $stmt = $db->prepare("SELECT id FROM offer_popups WHERE id = ?");
    $stmt->execute([$popupId]);
    if (!$stmt->fetch()) {
        sendError('Offer popup not found', [], 404);
        return;
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
 * Toggle offer popup status (Admin only)
 */
function toggleOfferPopup($db, $popupId) {
    error_log("🔄 toggleOfferPopup called for ID: $popupId");

    try {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
    } catch (Exception $e) {
        error_log("❌ Auth failed: " . $e->getMessage());
        throw $e;
    }

    // Handle mock IDs - frontend manages these locally
    if (!is_numeric($popupId)) {
        error_log("⚠️ Toggle request for non-numeric popup ID: $popupId (mock data)");
        // Return success since frontend manages mock popups in localStorage
        sendSuccess('Mock popup status toggled (managed by frontend)', [
            'id' => $popupId,
            'message' => 'Frontend localStorage handles this popup'
        ]);
        return;
    }

    // Check if popup exists
    $stmt = $db->prepare("SELECT id, is_active FROM offer_popups WHERE id = ?");
    $stmt->execute([$popupId]);
    $popup = $stmt->fetch();

    if (!$popup) {
        sendError('Offer popup not found', [], 404);
        return;
    }

    // Toggle the is_active status
    $newStatus = $popup['is_active'] ? 0 : 1;
    $stmt = $db->prepare("UPDATE offer_popups SET is_active = ? WHERE id = ?");

    if ($stmt->execute([$newStatus, $popupId])) {
        error_log("✅ Popup $popupId toggled to " . ($newStatus ? 'active' : 'inactive'));
        sendSuccess('Offer popup status toggled successfully', [
            'id' => $popupId,
            'isActive' => (bool)$newStatus
        ]);
    } else {
        sendError('Failed to toggle offer popup status', [], 500);
    }
}

/**
 * Delete offer popup (Admin only)
 */
function deleteOfferPopup($db, $popupId) {
    error_log("🗑️ deleteOfferPopup called for ID: $popupId");

    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Handle mock IDs - frontend manages these locally
    if (!is_numeric($popupId)) {
        error_log("⚠️ Delete request for non-numeric popup ID: $popupId (mock data)");
        // Return success since frontend manages mock popups in localStorage
        sendSuccess('Mock popup deleted (managed by frontend)', [
            'id' => $popupId,
            'message' => 'Frontend localStorage handles this popup'
        ]);
        return;
    }

    // Check if popup exists
    $stmt = $db->prepare("SELECT id FROM offer_popups WHERE id = ?");
    $stmt->execute([$popupId]);
    if (!$stmt->fetch()) {
        sendError('Offer popup not found', [], 404);
        return;
    }

    // Delete popup
    $stmt = $db->prepare("DELETE FROM offer_popups WHERE id = ?");
    if ($stmt->execute([$popupId])) {
        error_log("✅ Popup $popupId deleted successfully");
        sendSuccess('Offer popup deleted successfully');
    } else {
        sendError('Failed to delete offer popup', [], 500);
    }
}
