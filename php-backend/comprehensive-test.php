<?php
/**
 * Comprehensive API & Database Test Suite
 * Tests all endpoints and MySQL data fetching
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$results = [
    'timestamp' => date('c'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'php_version' => phpversion(),
    'tests' => []
];

// Test 1: Basic PHP Environment
$results['tests']['php_environment'] = [
    'status' => 'success',
    'php_version' => phpversion(),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'upload_max_filesize' => ini_get('upload_max_filesize')
];

// Test 2: File Structure
$requiredFiles = [
    'index.php',
    'config/config.php',
    'config/database.php',
    'api/products.php',
    'api/auth.php',
    'api/orders.php',
    'api/users.php',
    'api/categories.php',
    'api/reviews.php',
    'api/wishlist.php',
    'api/banners.php',
    'api/admin.php',
    'api/offer-popups.php',
    'api/coupons.php',
    'includes/helpers.php',
    'middleware/cors.php',
    'middleware/auth.php',
    'vendor/jwt/JWT.php'
];

$fileResults = [];
foreach ($requiredFiles as $file) {
    $path = __DIR__ . '/' . $file;
    $fileResults[$file] = file_exists($path);
}
$results['tests']['file_structure'] = [
    'status' => in_array(false, $fileResults) ? 'warning' : 'success',
    'files' => $fileResults,
    'missing_files' => array_keys(array_filter($fileResults, function($exists) { return !$exists; }))
];

// Test 3: Database Connection
try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::getInstance()->getConnection();
    $results['tests']['database_connection'] = [
        'status' => 'success',
        'message' => 'Database connected successfully'
    ];
} catch (Exception $e) {
    $results['tests']['database_connection'] = [
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ];
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit();
}

// Test 4: Database Tables
$requiredTables = [
    'users', 'products', 'categories', 'orders', 'order_items', 
    'reviews', 'wishlist', 'banners', 'coupons', 'offer_popups',
    'admin_users', 'product_images', 'user_addresses', 'payment_methods',
    'shipping_methods', 'discounts', 'inventory'
];

$tableResults = [];
$db = Database::getInstance()->getConnection();

foreach ($requiredTables as $table) {
    try {
        $stmt = $db->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        $exists = $stmt->fetch() !== false;
        $tableResults[$table] = $exists;
        
        if ($exists) {
            // Get row count
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM `$table`");
            $stmt->execute();
            $count = $stmt->fetch()['count'];
            $tableResults[$table . '_count'] = $count;
        }
    } catch (Exception $e) {
        $tableResults[$table] = false;
        $tableResults[$table . '_error'] = $e->getMessage();
    }
}

$results['tests']['database_tables'] = [
    'status' => in_array(false, array_slice($tableResults, 0, count($requiredTables))) ? 'warning' : 'success',
    'tables' => $tableResults
];

// Test 5: Sample Data Check
$sampleDataResults = [];

// Check products
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
    $stmt->execute();
    $productCount = $stmt->fetch()['count'];
    $sampleDataResults['active_products'] = $productCount;
    
    if ($productCount > 0) {
        $stmt = $db->prepare("SELECT id, name, price, category FROM products WHERE is_active = 1 LIMIT 3");
        $stmt->execute();
        $sampleDataResults['sample_products'] = $stmt->fetchAll();
    }
} catch (Exception $e) {
    $sampleDataResults['products_error'] = $e->getMessage();
}

// Check categories
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM categories");
    $stmt->execute();
    $categoryCount = $stmt->fetch()['count'];
    $sampleDataResults['categories'] = $categoryCount;
} catch (Exception $e) {
    $sampleDataResults['categories_error'] = $e->getMessage();
}

// Check users
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $userCount = $stmt->fetch()['count'];
    $sampleDataResults['users'] = $userCount;
} catch (Exception $e) {
    $sampleDataResults['users_error'] = $e->getMessage();
}

$results['tests']['sample_data'] = [
    'status' => ($sampleDataResults['active_products'] ?? 0) > 0 ? 'success' : 'warning',
    'data' => $sampleDataResults
];

// Test 6: API Endpoints Test
$apiTests = [];

// Test main router
try {
    $originalUri = $_SERVER['REQUEST_URI'];
    $originalMethod = $_SERVER['REQUEST_METHOD'];
    
    $_SERVER['REQUEST_URI'] = '/api/php-backend/';
    $_SERVER['REQUEST_METHOD'] = 'GET';
    
    ob_start();
    include __DIR__ . '/index.php';
    $mainApiOutput = ob_get_clean();
    
    $_SERVER['REQUEST_URI'] = $originalUri;
    $_SERVER['REQUEST_METHOD'] = $originalMethod;
    
    $apiTests['main_router'] = [
        'status' => !empty($mainApiOutput) ? 'success' : 'error',
        'response_length' => strlen($mainApiOutput)
    ];
} catch (Exception $e) {
    $apiTests['main_router'] = [
        'status' => 'error',
        'error' => $e->getMessage()
    ];
}

// Test products API
try {
    $originalUri = $_SERVER['REQUEST_URI'];
    $originalMethod = $_SERVER['REQUEST_METHOD'];
    
    $_SERVER['REQUEST_URI'] = '/api/php-backend/api/products';
    $_SERVER['REQUEST_METHOD'] = 'GET';
    
    ob_start();
    include __DIR__ . '/index.php';
    $productsApiOutput = ob_get_clean();
    
    $_SERVER['REQUEST_URI'] = $originalUri;
    $_SERVER['REQUEST_METHOD'] = $originalMethod;
    
    $apiTests['products_api'] = [
        'status' => !empty($productsApiOutput) ? 'success' : 'error',
        'response_length' => strlen($productsApiOutput)
    ];
} catch (Exception $e) {
    $apiTests['products_api'] = [
        'status' => 'error',
        'error' => $e->getMessage()
    ];
}

$results['tests']['api_endpoints'] = [
    'status' => in_array('error', array_column($apiTests, 'status')) ? 'error' : 'success',
    'endpoints' => $apiTests
];

// Test 7: CORS Configuration
try {
    require_once __DIR__ . '/config/config.php';
    $results['tests']['cors_config'] = [
        'status' => 'success',
        'allowed_origins' => ALLOWED_ORIGINS ?? [],
        'jwt_secret_set' => !empty(JWT_SECRET)
    ];
} catch (Exception $e) {
    $results['tests']['cors_config'] = [
        'status' => 'error',
        'error' => $e->getMessage()
    ];
}

// Test 8: .htaccess Configuration
$htaccessStatus = 'error';
$htaccessMessage = '';

if (file_exists(__DIR__ . '/.htaccess')) {
    $htaccess = file_get_contents(__DIR__ . '/.htaccess');
    if (strpos($htaccess, 'RewriteEngine On') !== false) {
        $htaccessStatus = 'success';
        $htaccessMessage = 'URL rewriting enabled';
    } else {
        $htaccessMessage = 'URL rewriting not configured';
    }
} else {
    $htaccessMessage = '.htaccess file missing';
}

$results['tests']['htaccess'] = [
    'status' => $htaccessStatus,
    'message' => $htaccessMessage
];

// Test 9: Direct API Call Simulation
$directApiTest = [];

// Simulate direct products API call
try {
    // Set up environment for products API
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_GET = ['page' => 1, 'limit' => 5]; // Test with small limit
    
    ob_start();
    include __DIR__ . '/api/products.php';
    $directOutput = ob_get_clean();
    
    $directApiTest['direct_products'] = [
        'status' => !empty($directOutput) ? 'success' : 'error',
        'response_length' => strlen($directOutput),
        'has_json' => json_decode($directOutput) !== null
    ];
} catch (Exception $e) {
    $directApiTest['direct_products'] = [
        'status' => 'error',
        'error' => $e->getMessage()
    ];
}

$results['tests']['direct_api'] = [
    'status' => in_array('error', array_column($directApiTest, 'status')) ? 'error' : 'success',
    'tests' => $directApiTest
];

// Overall Status
$allStatuses = array_column($results['tests'], 'status');
$overallStatus = 'success';
if (in_array('error', $allStatuses)) {
    $overallStatus = 'error';
} elseif (in_array('warning', $allStatuses)) {
    $overallStatus = 'warning';
}

$results['overall_status'] = $overallStatus;
$results['summary'] = [
    'total_tests' => count($results['tests']),
    'successful' => count(array_filter($allStatuses, function($status) { return $status === 'success'; })),
    'warnings' => count(array_filter($allStatuses, function($status) { return $status === 'warning'; })),
    'errors' => count(array_filter($allStatuses, function($status) { return $status === 'error'; }))
];

echo json_encode($results, JSON_PRETTY_PRINT);
?>
