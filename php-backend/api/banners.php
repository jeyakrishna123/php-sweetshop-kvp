<?php
/**
 * Banners API Endpoints
 * Routes: /api/banners/*
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

// Get path after /api/banners/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/banners and /api/php-backend/api/banners
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'banners') {
    // Handle /api/php-backend/api/banners
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/banners
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
                        getAllBanners($db);
                    } else {
                        getActiveBanners($db);
                    }
                } catch (Exception $e) {
                    getActiveBanners($db);
                }
            } elseif ($method === 'POST') {
                createBanner($db);
            }
            break;

        case 'active':
            if ($method === 'GET') {
                getActiveBanners($db);
            }
            break;

        case 'reorder':
            if ($method === 'POST') {
                reorderBanners($db);
            }
            break;

        default:
            $bannerId = $endpoint;
            if (is_numeric($bannerId)) {
                if ($method === 'GET') {
                    getBannerById($db, $bannerId);
                } elseif ($method === 'PUT') {
                    updateBanner($db, $bannerId);
                } elseif ($method === 'DELETE') {
                    deleteBanner($db, $bannerId);
                } elseif ($method === 'PATCH') {
                    if (isset($pathParts[3]) && $pathParts[3] === 'toggle') {
                        toggleBanner($db, $bannerId);
                    }
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get active banners
 */
function getActiveBanners($db) {
    $stmt = $db->prepare("
        SELECT id, title, subtitle, image_url, mobile_image_url, desktop_image_url,
               link, button_text, is_active, sort_order, start_date, end_date
        FROM banners
        WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute();
    $banners = $stmt->fetchAll();

    sendSuccess('Active banners retrieved successfully', ['banners' => $banners]);
}

/**
 * Get all banners (Admin only)
 */
function getAllBanners($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT id, title, subtitle, image_url, mobile_image_url, desktop_image_url,
               link, button_text, is_active, sort_order, start_date, end_date,
               created_at, updated_at
        FROM banners
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute();
    $banners = $stmt->fetchAll();

    sendSuccess('All banners retrieved successfully', [
        'banners' => $banners,
        'count' => count($banners)
    ]);
}

/**
 * Get single banner by ID
 */
function getBannerById($db, $bannerId) {
    $stmt = $db->prepare("
        SELECT id, title, subtitle, image_url, mobile_image_url, desktop_image_url,
               link, button_text, is_active, sort_order, start_date, end_date,
               created_at, updated_at
        FROM banners
        WHERE id = ?
    ");
    $stmt->execute([$bannerId]);
    $banner = $stmt->fetch();

    if (!$banner) {
        sendError('Banner not found', [], 404);
    }

    sendSuccess('Banner retrieved successfully', ['banner' => $banner]);
}

/**
 * Create new banner (Admin only)
 */
function createBanner($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    $errors = validateRequired($data, ['title', 'imageUrl']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $title = sanitizeInput($data['title']);
    $subtitle = isset($data['subtitle']) ? sanitizeInput($data['subtitle']) : null;
    $imageUrl = sanitizeInput($data['imageUrl']);
    $mobileImageUrl = isset($data['mobileImageUrl']) ? sanitizeInput($data['mobileImageUrl']) : null;
    $desktopImageUrl = isset($data['desktopImageUrl']) ? sanitizeInput($data['desktopImageUrl']) : null;
    $link = isset($data['link']) ? sanitizeInput($data['link']) : null;
    $buttonText = isset($data['buttonText']) ? sanitizeInput($data['buttonText']) : null;
    $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
    $sortOrder = isset($data['sortOrder']) ? (int)$data['sortOrder'] : 0;
    $startDate = isset($data['startDate']) ? $data['startDate'] : null;
    $endDate = isset($data['endDate']) ? $data['endDate'] : null;

    $stmt = $db->prepare("
        INSERT INTO banners (title, subtitle, image_url, mobile_image_url, desktop_image_url,
                           link, button_text, is_active, sort_order, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$title, $subtitle, $imageUrl, $mobileImageUrl, $desktopImageUrl,
                       $link, $buttonText, $isActive, $sortOrder, $startDate, $endDate])) {
        $bannerId = $db->lastInsertId();

        // Get created banner
        $stmt = $db->prepare("SELECT * FROM banners WHERE id = ?");
        $stmt->execute([$bannerId]);
        $banner = $stmt->fetch();

        sendSuccess('Banner created successfully', ['banner' => $banner], 201);
    } else {
        sendError('Failed to create banner', [], 500);
    }
}

/**
 * Update banner (Admin only)
 */
function updateBanner($db, $bannerId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    // Check if banner exists
    $stmt = $db->prepare("SELECT id FROM banners WHERE id = ?");
    $stmt->execute([$bannerId]);
    if (!$stmt->fetch()) {
        sendError('Banner not found', [], 404);
    }

    // Build update query dynamically
    $updates = [];
    $params = [];

    if (isset($data['title'])) {
        $updates[] = "title = ?";
        $params[] = sanitizeInput($data['title']);
    }
    if (isset($data['subtitle'])) {
        $updates[] = "subtitle = ?";
        $params[] = sanitizeInput($data['subtitle']);
    }
    if (isset($data['imageUrl'])) {
        $updates[] = "image_url = ?";
        $params[] = sanitizeInput($data['imageUrl']);
    }
    if (isset($data['mobileImageUrl'])) {
        $updates[] = "mobile_image_url = ?";
        $params[] = sanitizeInput($data['mobileImageUrl']);
    }
    if (isset($data['desktopImageUrl'])) {
        $updates[] = "desktop_image_url = ?";
        $params[] = sanitizeInput($data['desktopImageUrl']);
    }
    if (isset($data['link'])) {
        $updates[] = "link = ?";
        $params[] = sanitizeInput($data['link']);
    }
    if (isset($data['buttonText'])) {
        $updates[] = "button_text = ?";
        $params[] = sanitizeInput($data['buttonText']);
    }
    if (isset($data['isActive'])) {
        $updates[] = "is_active = ?";
        $params[] = (int)$data['isActive'];
    }
    if (isset($data['sortOrder'])) {
        $updates[] = "sort_order = ?";
        $params[] = (int)$data['sortOrder'];
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

    $params[] = $bannerId;
    $sql = "UPDATE banners SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        // Get updated banner
        $stmt = $db->prepare("SELECT * FROM banners WHERE id = ?");
        $stmt->execute([$bannerId]);
        $banner = $stmt->fetch();

        sendSuccess('Banner updated successfully', ['banner' => $banner]);
    } else {
        sendError('Failed to update banner', [], 500);
    }
}

/**
 * Delete banner (Admin only)
 */
function deleteBanner($db, $bannerId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if banner exists
    $stmt = $db->prepare("SELECT id FROM banners WHERE id = ?");
    $stmt->execute([$bannerId]);
    if (!$stmt->fetch()) {
        sendError('Banner not found', [], 404);
    }

    // Delete banner
    $stmt = $db->prepare("DELETE FROM banners WHERE id = ?");
    if ($stmt->execute([$bannerId])) {
        sendSuccess('Banner deleted successfully');
    } else {
        sendError('Failed to delete banner', [], 500);
    }
}

/**
 * Toggle banner active status (Admin only)
 */
function toggleBanner($db, $bannerId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Get current status
    $stmt = $db->prepare("SELECT is_active FROM banners WHERE id = ?");
    $stmt->execute([$bannerId]);
    $banner = $stmt->fetch();

    if (!$banner) {
        sendError('Banner not found', [], 404);
    }

    $newStatus = $banner['is_active'] ? 0 : 1;

    // Toggle status
    $stmt = $db->prepare("UPDATE banners SET is_active = ? WHERE id = ?");
    if ($stmt->execute([$newStatus, $bannerId])) {
        sendSuccess('Banner status toggled successfully', [
            'is_active' => $newStatus
        ]);
    } else {
        sendError('Failed to toggle banner status', [], 500);
    }
}

/**
 * Reorder banners (Admin only)
 */
function reorderBanners($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    if (!isset($data['bannerIds']) || !is_array($data['bannerIds'])) {
        sendError('bannerIds array is required', [], 400);
    }

    $bannerIds = $data['bannerIds'];

    // Update sort order for each banner
    $stmt = $db->prepare("UPDATE banners SET sort_order = ? WHERE id = ?");
    foreach ($bannerIds as $index => $bannerId) {
        $stmt->execute([$index, $bannerId]);
    }

    sendSuccess('Banners reordered successfully');
}
