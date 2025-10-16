<?php
/**
 * Upload API Endpoints
 * Routes: /api/upload/*
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];

// Get path after /api/upload/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/upload and /api/php-backend/api/upload
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'upload') {
    // Handle /api/php-backend/api/upload
    $uploadType = isset($pathParts[4]) ? $pathParts[4] : null;
} else {
    // Handle /api/upload
    $uploadType = isset($pathParts[2]) ? $pathParts[2] : null;
}

try {
    // All upload endpoints require authentication
    error_log("🔍 Upload API called - Method: " . $method . ", Type: " . $uploadType);
    
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    if ($method === 'POST') {
        switch ($uploadType) {
            case 'menu-image':
                error_log("🔍 Calling uploadMenuImage");
                uploadMenuImage();
                break;
            case 'product-image':
                uploadProductImage();
                break;
            case 'banner-image':
                uploadBannerImage();
                break;
            default:
                sendError('Invalid upload type', [], 400);
        }
    } else {
        sendError('Method not allowed', [], 405);
    }
} catch (Exception $e) {
    sendError('Upload failed', ['error' => $e->getMessage()], 500);
}

/**
 * Upload menu image
 */
function uploadMenuImage() {
    error_log("🔍 uploadMenuImage called");
    error_log("🔍 FILES: " . json_encode($_FILES));
    error_log("🔍 POST: " . json_encode($_POST));
    
    if (!isset($_FILES['image'])) {
        error_log("❌ No image file provided");
        sendError('No image file provided', [], 400);
        return;
    }

    $file = $_FILES['image'];

    // Validate image
    $errors = validateImageUpload($file);
    if (!empty($errors)) {
        sendError('Invalid image file', $errors, 400);
        return;
    }

    // Upload image to menu-items directory
    $imagePath = uploadImage($file, 'menu-items');

    if ($imagePath) {
        // Return the full URL for the image
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $fullImageUrl = $protocol . '://' . $host . $imagePath;

        error_log("✅ Image upload successful: " . $fullImageUrl);
        sendSuccess('Image uploaded successfully', [
            'imageUrl' => $fullImageUrl
        ], 201);
    } else {
        error_log("❌ Image upload failed - no path returned");
        sendError('Failed to upload image', [], 500);
    }
}

/**
 * Upload product image
 */
function uploadProductImage() {
    if (!isset($_FILES['image'])) {
        sendError('No image file provided', [], 400);
        return;
    }

    $file = $_FILES['image'];

    // Validate image
    $errors = validateImageUpload($file);
    if (!empty($errors)) {
        sendError('Invalid image file', $errors, 400);
        return;
    }

    // Upload image to products directory
    $imagePath = uploadImage($file, 'products');

    if ($imagePath) {
        sendSuccess('Image uploaded successfully', [
            'imageUrl' => $imagePath,
            'fullUrl' => 'http://' . $_SERVER['HTTP_HOST'] . $imagePath
        ], 201);
    } else {
        sendError('Failed to upload image', [], 500);
    }
}

/**
 * Upload banner image
 */
function uploadBannerImage() {
    if (!isset($_FILES['image'])) {
        sendError('No image file provided', [], 400);
        return;
    }

    $file = $_FILES['image'];

    // Validate image
    $errors = validateImageUpload($file);
    if (!empty($errors)) {
        sendError('Invalid image file', $errors, 400);
        return;
    }

    // Upload image to banners directory
    $imagePath = uploadImage($file, 'banners');

    if ($imagePath) {
        sendSuccess('Image uploaded successfully', [
            'imageUrl' => $imagePath,
            'fullUrl' => 'http://' . $_SERVER['HTTP_HOST'] . $imagePath
        ], 201);
    } else {
        sendError('Failed to upload image', [], 500);
    }
}
?>
