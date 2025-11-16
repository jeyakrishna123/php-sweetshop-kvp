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
    error_log("❌ TOP LEVEL EXCEPTION: " . $e->getMessage());
    error_log("❌ Exception in file: " . $e->getFile() . " on line " . $e->getLine());
    error_log("❌ Stack trace: " . $e->getTraceAsString());
    sendError('Server error', [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], 500);
}

/**
 * Get active offer popups
 */
function getActiveOfferPopups($db) {
    $stmt = $db->prepare("
        SELECT id, title, description, image_url, coupon_code, discount_percentage,
               button_text, button_link, is_active, show_on_homepage, start_date, end_date,
               trigger_type, show_on_pages, show_delay, max_shows_per_session
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
    error_log("📥 Request body received: " . json_encode(array_keys($data)));

    // Make title optional - use couponCode as title if title not provided
    $couponCode = isset($data['couponCode']) && trim($data['couponCode']) !== ''
        ? sanitizeInput($data['couponCode'])
        : null;

    $title = isset($data['title']) && trim($data['title']) !== ''
        ? sanitizeInput($data['title'])
        : ($couponCode ? "Offer: $couponCode" : 'Special Offer');

    error_log("✅ Title: $title, CouponCode: " . ($couponCode ?? 'null'));

    $description = isset($data['description']) ? sanitizeInput($data['description']) : null;
    $discountPercentage = isset($data['discountPercentage']) ? (float)$data['discountPercentage'] : null;
    $buttonText = isset($data['buttonText']) ? sanitizeInput($data['buttonText']) : 'Shop Now';
    $buttonLink = isset($data['buttonLink']) ? sanitizeInput($data['buttonLink']) : null;
    $isActive = isset($data['isActive']) ? (int)$data['isActive'] : 1;
    
    // Handle both showOnHomepage and showOnInitialPage (frontend sends showOnInitialPage)
    $showOnHomepage = 1; // Default
    if (isset($data['showOnHomepage'])) {
        $showOnHomepage = (int)$data['showOnHomepage'];
    } elseif (isset($data['showOnInitialPage'])) {
        $showOnHomepage = (int)$data['showOnInitialPage'];
    }
    
    $startDate = isset($data['startDate']) ? $data['startDate'] : null;
    $endDate = isset($data['endDate']) ? $data['endDate'] : null;

    // Handle new advanced fields
    $triggerType = isset($data['triggerType']) ? sanitizeInput($data['triggerType']) : 'page_load';
    $showOnPages = isset($data['showOnPages']) && is_array($data['showOnPages']) ? json_encode($data['showOnPages']) : null;
    $showDelay = isset($data['showDelay']) ? (int)$data['showDelay'] : 2000;
    $maxShowsPerSession = isset($data['maxShowsPerSession']) ? (int)$data['maxShowsPerSession'] : 1;

    // Validate required fields
    if (empty($title) || trim($title) === '') {
        error_log("❌ Title is required but empty");
        sendError('Title is required', ['field' => 'title'], 400);
        return;
    }

    // Handle Base64 image - save to file
    $imageUrl = null;
    if (isset($data['imageUrl']) && !empty($data['imageUrl'])) {
        $imageData = $data['imageUrl'];

        // Check if it's a Base64 image
        if (strpos($imageData, 'data:image/') === 0) {
            error_log("📷 Processing Base64 image...");

            // Extract Base64 data
            $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $imageData);
            $decodedImage = base64_decode($imageData, true); // Use strict mode

            if ($decodedImage === false) {
                error_log("❌ Failed to decode Base64 image - invalid base64 string");
                sendError('Invalid image data: Base64 decoding failed', [], 400);
                return;
            }

            // Validate decoded image is not empty
            if (empty($decodedImage)) {
                error_log("❌ Decoded image is empty");
                sendError('Invalid image data: Decoded image is empty', [], 400);
                return;
            }

            try {
                // Create upload directory
                $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR . 'offer-popups/' : __DIR__ . '/../uploads/offer-popups/';
                if (!is_dir($uploadDir)) {
                    if (!mkdir($uploadDir, 0755, true)) {
                        error_log("❌ Failed to create upload directory: $uploadDir");
                        sendError('Failed to create upload directory', [], 500);
                        return;
                    }
                    error_log("✅ Created upload directory: $uploadDir");
                }

                // Generate unique filename
                $filename = 'offer_' . uniqid() . '_' . time() . '.webp';
                $filepath = $uploadDir . $filename;

                // Save file
                $bytesWritten = file_put_contents($filepath, $decodedImage);
                if ($bytesWritten === false || $bytesWritten === 0) {
                    error_log("❌ Failed to save image file to: $filepath");
                    sendError('Failed to save image file', [], 500);
                    return;
                }
                
                $imageUrl = '/backend/uploads/offer-popups/' . $filename;
                error_log("✅ Image saved successfully: $imageUrl ($bytesWritten bytes)");
            } catch (Exception $e) {
                error_log("❌ Exception while saving image: " . $e->getMessage());
                sendError('Failed to save image: ' . $e->getMessage(), [], 500);
                return;
            }
        } else {
            // It's already a URL
            $imageUrl = sanitizeInput($imageData);
            error_log("✅ Using existing image URL: $imageUrl");
        }
    } else {
        error_log("⚠️ No imageUrl provided in request");
        // Image is optional, but log a warning
    }

    $stmt = $db->prepare("
        INSERT INTO offer_popups (title, description, image_url, coupon_code, discount_percentage,
                                button_text, button_link, is_active, show_on_homepage, start_date, end_date,
                                trigger_type, show_on_pages, show_delay, max_shows_per_session)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $params = [$title, $description, $imageUrl, $couponCode, $discountPercentage,
               $buttonText, $buttonLink, $isActive, $showOnHomepage, $startDate, $endDate,
               $triggerType, $showOnPages, $showDelay, $maxShowsPerSession];

    error_log("📝 INSERT params: " . json_encode([
        'title' => $title,
        'description' => $description ? substr($description, 0, 50) . '...' : 'null',
        'imageUrl' => $imageUrl ? substr($imageUrl, 0, 50) . '...' : 'null',
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
        // Validate title length (database has VARCHAR(200))
        if (strlen($title) > 200) {
            $title = substr($title, 0, 200);
            error_log("⚠️ Title truncated to 200 characters");
        }

        $result = $stmt->execute($params);

        if ($result === false) {
            $errorInfo = $stmt->errorInfo();
            error_log("❌ INSERT failed: " . json_encode($errorInfo));
            error_log("❌ SQL State: " . ($errorInfo[0] ?? 'unknown'));
            error_log("❌ Error Code: " . ($errorInfo[1] ?? 'unknown'));
            error_log("❌ Error Message: " . ($errorInfo[2] ?? 'unknown'));
            sendError('Failed to create offer popup: ' . ($errorInfo[2] ?? 'Database error'), ['db_error' => $errorInfo], 500);
            return;
        }

        $popupId = $db->lastInsertId();
        if (!$popupId) {
            error_log("❌ Failed to get last insert ID");
            sendError('Failed to create offer popup: Could not retrieve popup ID', [], 500);
            return;
        }

        error_log("✅ Popup created with ID: $popupId");

        // Get created popup
        $stmt = $db->prepare("SELECT * FROM offer_popups WHERE id = ?");
        $stmt->execute([$popupId]);
        $popup = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$popup) {
            error_log("⚠️ Popup created but could not retrieve it");
            sendError('Popup created but could not retrieve details', [], 500);
            return;
        }

        sendSuccess('Offer popup created successfully', ['popup' => $popup], 201);
    } catch (PDOException $e) {
        $errorInfo = $e->errorInfo ?? [];
        error_log("❌ Database exception: " . $e->getMessage());
        error_log("❌ SQL State: " . ($errorInfo[0] ?? $e->getCode()));
        error_log("❌ Error Code: " . ($errorInfo[1] ?? 'N/A'));
        sendError('Database error: ' . $e->getMessage(), ['error' => $e->getMessage(), 'code' => $e->getCode()], 500);
    } catch (Exception $e) {
        error_log("❌ General exception: " . $e->getMessage());
        error_log("❌ Stack trace: " . $e->getTraceAsString());
        sendError('Server error: ' . $e->getMessage(), ['error' => $e->getMessage()], 500);
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
    if (isset($data['imageUrl']) && !empty($data['imageUrl'])) {
        $imageData = $data['imageUrl'];

        // Check if it's a Base64 image
        if (strpos($imageData, 'data:image/') === 0) {
            error_log("📷 Processing Base64 image for update...");

            // Extract Base64 data
            $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $imageData);
            $decodedImage = base64_decode($imageData);

            if ($decodedImage !== false) {
                // Create upload directory
                $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR . 'offer-popups/' : __DIR__ . '/../uploads/offer-popups/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Generate unique filename
                $filename = 'offer_' . uniqid() . '_' . time() . '.webp';
                $filepath = $uploadDir . $filename;

                // Save file
                if (file_put_contents($filepath, $decodedImage)) {
                    $updates[] = "image_url = ?";
                    $params[] = '/backend/uploads/offer-popups/' . $filename;
                    error_log("✅ Image updated: /backend/uploads/offer-popups/$filename");
                } else {
                    error_log("❌ Failed to save image file during update");
                }
            }
        } else {
            // It's already a URL
            $updates[] = "image_url = ?";
            $params[] = sanitizeInput($imageData);
        }
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
    // Handle both showOnHomepage and showOnInitialPage (frontend sends showOnInitialPage)
    if (isset($data['showOnHomepage'])) {
        $updates[] = "show_on_homepage = ?";
        $params[] = (int)$data['showOnHomepage'];
    } elseif (isset($data['showOnInitialPage'])) {
        $updates[] = "show_on_homepage = ?";
        $params[] = (int)$data['showOnInitialPage'];
    }
    if (isset($data['startDate'])) {
        $updates[] = "start_date = ?";
        $params[] = $data['startDate'];
    }
    if (isset($data['endDate'])) {
        $updates[] = "end_date = ?";
        $params[] = $data['endDate'];
    }
    // Handle new advanced fields
    if (isset($data['triggerType'])) {
        $updates[] = "trigger_type = ?";
        $params[] = sanitizeInput($data['triggerType']);
    }
    if (isset($data['showOnPages'])) {
        $updates[] = "show_on_pages = ?";
        $params[] = is_array($data['showOnPages']) ? json_encode($data['showOnPages']) : null;
    }
    if (isset($data['showDelay'])) {
        $updates[] = "show_delay = ?";
        $params[] = (int)$data['showDelay'];
    }
    if (isset($data['maxShowsPerSession'])) {
        $updates[] = "max_shows_per_session = ?";
        $params[] = (int)$data['maxShowsPerSession'];
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
