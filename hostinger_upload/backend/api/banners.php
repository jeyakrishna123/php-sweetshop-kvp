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
    try {
        // Check if banners table exists, create if not
        $db->exec("
            CREATE TABLE IF NOT EXISTS banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT,
                image_url VARCHAR(500),
                mobile_image_url VARCHAR(500),
                desktop_image_url VARCHAR(500),
                link VARCHAR(500),
                button_text VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                start_date DATETIME NULL,
                end_date DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_is_active (is_active),
                INDEX idx_sort_order (sort_order),
                INDEX idx_dates (start_date, end_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        $stmt = $db->prepare("
            SELECT id as _id, title, subtitle, image_url as imageUrl, mobile_image_url as mobileImageUrl,
                   desktop_image_url as desktopImageUrl, link as linkUrl, button_text as buttonText,
                   is_active as isActive, sort_order as displayOrder, start_date as startDate,
                   end_date as endDate, created_at as createdAt, updated_at as updatedAt
            FROM banners
            WHERE is_active = 1
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY sort_order ASC, created_at DESC
        ");
        $stmt->execute();
        $banners = $stmt->fetchAll();

        // Convert image URLs to production URLs - Only convert if not null/empty
        foreach ($banners as &$banner) {
            // Only convert non-empty image URLs to production URLs
            if (!empty($banner['imageUrl'])) {
                $banner['imageUrl'] = getImageUrl($banner['imageUrl']);
            } else {
                $banner['imageUrl'] = null; // Ensure null for empty values
            }
            if (!empty($banner['mobileImageUrl'])) {
                $banner['mobileImageUrl'] = getImageUrl($banner['mobileImageUrl']);
            } else {
                $banner['mobileImageUrl'] = null;
            }
            if (!empty($banner['desktopImageUrl'])) {
                $banner['desktopImageUrl'] = getImageUrl($banner['desktopImageUrl']);
            } else {
                $banner['desktopImageUrl'] = null;
            }
        }

        sendSuccess('Active banners retrieved successfully', ['banners' => $banners]);
    } catch (Exception $e) {
        error_log("❌ GET ACTIVE BANNERS - Error: " . $e->getMessage());
        sendError('Failed to retrieve banners', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Get all banners (Admin only)
 */
function getAllBanners($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT id as _id, title, subtitle, image_url as imageUrl, mobile_image_url as mobileImageUrl,
               desktop_image_url as desktopImageUrl, link as linkUrl, button_text as buttonText,
               is_active as isActive, sort_order as displayOrder, start_date as startDate,
               end_date as endDate, created_at as createdAt, updated_at as updatedAt
        FROM banners
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute();
    $banners = $stmt->fetchAll();

        // Convert image URLs to production URLs - Only convert if not null/empty
        foreach ($banners as &$banner) {
            // Only convert non-empty image URLs to production URLs
            if (!empty($banner['imageUrl'])) {
                $banner['imageUrl'] = getImageUrl($banner['imageUrl']);
            } else {
                $banner['imageUrl'] = null; // Ensure null for empty values
            }
            if (!empty($banner['mobileImageUrl'])) {
                $banner['mobileImageUrl'] = getImageUrl($banner['mobileImageUrl']);
            } else {
                $banner['mobileImageUrl'] = null;
            }
            if (!empty($banner['desktopImageUrl'])) {
                $banner['desktopImageUrl'] = getImageUrl($banner['desktopImageUrl']);
            } else {
                $banner['desktopImageUrl'] = null;
            }
        }

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
    
        // Convert image URLs to production URLs - Only convert if not null/empty
        if (!empty($banner['image_url'])) {
            $banner['image_url'] = getImageUrl($banner['image_url']);
        } else {
            $banner['image_url'] = null;
        }
        if (!empty($banner['mobile_image_url'])) {
            $banner['mobile_image_url'] = getImageUrl($banner['mobile_image_url']);
        } else {
            $banner['mobile_image_url'] = null;
        }
        if (!empty($banner['desktop_image_url'])) {
            $banner['desktop_image_url'] = getImageUrl($banner['desktop_image_url']);
        } else {
            $banner['desktop_image_url'] = null;
        }

    sendSuccess('Banner retrieved successfully', ['banner' => $banner]);
}

/**
 * Create new banner (Admin only)
 */
function createBanner($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Handle multipart/form-data
    $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
    $description = isset($_POST['description']) ? sanitizeInput($_POST['description']) : null;
    $linkUrl = isset($_POST['linkUrl']) ? sanitizeInput($_POST['linkUrl']) : null;
    $isActive = isset($_POST['isActive']) && $_POST['isActive'] === 'true' ? 1 : 0;
    $displayOrder = isset($_POST['displayOrder']) ? (int)$_POST['displayOrder'] : 0;
    $deviceType = isset($_POST['deviceType']) ? sanitizeInput($_POST['deviceType']) : 'both';

    // Validate required fields
    if (!$title) {
        sendError('Title is required', [], 400);
    }

    // Handle image uploads
    $mobileImageUrl = null;
    $desktopImageUrl = null;
    $imageUrl = null; // Main image URL

    // Process mobile image if uploaded
    if (isset($_FILES['mobileImage']) && $_FILES['mobileImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../uploads/banners/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = strtolower(pathinfo($_FILES['mobileImage']['name'], PATHINFO_EXTENSION));
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['mobileImage']['tmp_name'], $filepath)) {
            // Use relative path that will be converted to full URL by getImageUrl
            $mobileImageUrl = '/backend/uploads/banners/' . $filename;
            error_log("✅ Mobile image uploaded: $mobileImageUrl");
        }
    }

    // Process desktop image if uploaded
    if (isset($_FILES['desktopImage']) && $_FILES['desktopImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../uploads/banners/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = strtolower(pathinfo($_FILES['desktopImage']['name'], PATHINFO_EXTENSION));
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['desktopImage']['tmp_name'], $filepath)) {
            // Use relative path that will be converted to full URL by getImageUrl
            $desktopImageUrl = '/backend/uploads/banners/' . $filename;
            error_log("✅ Desktop image uploaded: $desktopImageUrl");
        }
    }

    // Set main image URL (prefer desktop, fallback to mobile)
    $imageUrl = $desktopImageUrl ?: $mobileImageUrl;

    // Validate at least one image is uploaded
    if (!$imageUrl) {
        sendError('At least one banner image is required', [], 400);
    }

    $stmt = $db->prepare("
        INSERT INTO banners (title, subtitle, image_url, mobile_image_url, desktop_image_url,
                           link, button_text, is_active, sort_order, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$title, $description, $imageUrl, $mobileImageUrl, $desktopImageUrl,
                       $linkUrl, null, $isActive, $displayOrder, null, null])) {
        $bannerId = $db->lastInsertId();

        // Get created banner with camelCase fields
        $stmt = $db->prepare("
            SELECT id as _id, title, subtitle, image_url as imageUrl, mobile_image_url as mobileImageUrl,
                   desktop_image_url as desktopImageUrl, link as linkUrl, button_text as buttonText,
                   is_active as isActive, sort_order as displayOrder, start_date as startDate,
                   end_date as endDate, created_at as createdAt, updated_at as updatedAt
            FROM banners WHERE id = ?
        ");
        $stmt->execute([$bannerId]);
        $banner = $stmt->fetch();
        
        // Convert image URLs to production URLs - Only convert if not null/empty
        if (!empty($banner['imageUrl'])) {
            $banner['imageUrl'] = getImageUrl($banner['imageUrl']);
        } else {
            $banner['imageUrl'] = null;
        }
        if (!empty($banner['mobileImageUrl'])) {
            $banner['mobileImageUrl'] = getImageUrl($banner['mobileImageUrl']);
        } else {
            $banner['mobileImageUrl'] = null;
        }
        if (!empty($banner['desktopImageUrl'])) {
            $banner['desktopImageUrl'] = getImageUrl($banner['desktopImageUrl']);
        } else {
            $banner['desktopImageUrl'] = null;
        }

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
        // Get updated banner with camelCase fields
        $stmt = $db->prepare("
            SELECT id as _id, title, subtitle, image_url as imageUrl, mobile_image_url as mobileImageUrl,
                   desktop_image_url as desktopImageUrl, link as linkUrl, button_text as buttonText,
                   is_active as isActive, sort_order as displayOrder, start_date as startDate,
                   end_date as endDate, created_at as createdAt, updated_at as updatedAt
            FROM banners WHERE id = ?
        ");
        $stmt->execute([$bannerId]);
        $banner = $stmt->fetch();
        
        // Convert image URLs to production URLs - Only convert if not null/empty
        if (!empty($banner['imageUrl'])) {
            $banner['imageUrl'] = getImageUrl($banner['imageUrl']);
        } else {
            $banner['imageUrl'] = null;
        }
        if (!empty($banner['mobileImageUrl'])) {
            $banner['mobileImageUrl'] = getImageUrl($banner['mobileImageUrl']);
        } else {
            $banner['mobileImageUrl'] = null;
        }
        if (!empty($banner['desktopImageUrl'])) {
            $banner['desktopImageUrl'] = getImageUrl($banner['desktopImageUrl']);
        } else {
            $banner['desktopImageUrl'] = null;
        }

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
