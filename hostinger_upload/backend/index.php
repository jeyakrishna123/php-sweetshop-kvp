<?php
/**
 * Main Entry Point for PHP Backend
 * API Router
 */

require_once __DIR__ . '/config/config.php';

// Initialize global error handler FIRST
require_once __DIR__ . '/includes/ErrorHandler.php';
ErrorHandler::init();

// Start session AFTER config is loaded
session_start();
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

// Get request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Parse URL
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));



// Remove empty parts
$pathParts = array_filter($pathParts);

// Check if this is an API request - handle both /api/php-backend/api/ and /api/
$resource = '';
if (isset($pathParts[0]) && $pathParts[0] === 'api') {
    if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api') {
        // Handle /api/php-backend/api/products
        $resource = isset($pathParts[3]) ? $pathParts[3] : '';
    } else {
        // Handle /api/products
        $resource = isset($pathParts[1]) ? $pathParts[1] : '';
    }
}

if (empty($resource)) {
    // Root endpoint - return API info
    sendSuccess('SK Bakers E-Commerce API is running', [
        'version' => '1.0',
        'environment' => 'production',
        'timestamp' => date('c'),
        'request_uri' => $requestUri,
        'path_parts' => $pathParts,
        'method' => $method,
        'features' => [
            'MySQL Database',
            'Enhanced Security',
            'JWT Authentication',
            'RESTful API',
            'File Uploads',
            'Admin Panel',
            'Compatible with Hostinger'
        ]
    ]);
}

// Route to appropriate API file
switch ($resource) {
    case 'auth':
        require_once __DIR__ . '/api/auth.php';
        break;

    case 'products':
        require_once __DIR__ . '/api/products.php';
        break;

    case 'orders':
        require_once __DIR__ . '/api/orders.php';
        break;

    case 'users':
        require_once __DIR__ . '/api/users.php';
        break;

    case 'categories':
        require_once __DIR__ . '/api/categories.php';
        break;

    case 'reviews':
        require_once __DIR__ . '/api/reviews.php';
        break;

    case 'wishlist':
        require_once __DIR__ . '/api/wishlist.php';
        break;

    case 'banners':
        require_once __DIR__ . '/api/banners.php';
        break;

    case 'admin':
        require_once __DIR__ . '/api/admin.php';
        break;

    case 'offer-popups':
        require_once __DIR__ . '/api/offer-popups.php';
        break;

    case 'coupons':
        require_once __DIR__ . '/api/coupons.php';
        break;

    case 'menu':
        require_once __DIR__ . '/api/menu.php';
        break;

    case 'contacts':
        require_once __DIR__ . '/api/contacts.php';
        break;

    case 'inventory':
        require_once __DIR__ . '/api/inventory.php';
        break;

    case 'analytics':
        require_once __DIR__ . '/api/analytics.php';
        break;

    case 'hide-sections':
        require_once __DIR__ . '/api/hide-sections.php';
        break;

    case 'team':
        require_once __DIR__ . '/api/team.php';
        break;

    case 'upload':
        require_once __DIR__ . '/api/upload.php';
        break;

    case 'payment':
        require_once __DIR__ . '/api/payment.php';
        break;

    case 'forgot-password':
    case 'reset-password':
    case 'verify-otp':
    case 'refresh-token':
        require_once __DIR__ . '/api/auth.php'; // All auth endpoints handled in auth.php
        break;

    case 'health':
        // Health check endpoint
        sendSuccess('Server is healthy', [
            'status' => 'healthy',
            'timestamp' => date('c'),
            'uptime' => sys_getloadavg(),
            'database' => 'connected'
        ]);
        break;

    default:
        sendError('Resource not found', ['resource' => $resource], 404);
}
