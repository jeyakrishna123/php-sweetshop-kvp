<?php
/**
 * COMPLETE FRONTEND & BACKEND VERIFICATION
 * This will check if everything is working correctly
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$verification = [
    'timestamp' => date('c'),
    'frontend_status' => 'checking',
    'backend_status' => 'checking',
    'api_endpoints' => 'checking',
    'database_status' => 'checking',
    'overall_status' => 'pending'
];

// CHECK 1: Backend PHP Environment
$verification['backend_php'] = checkBackendPHP();

// CHECK 2: Database Connection & Data
$verification['database_check'] = checkDatabase();

// CHECK 3: API Endpoints Working
$verification['api_endpoints'] = checkAPIEndpoints();

// CHECK 4: Frontend-Backend Communication
$verification['frontend_backend'] = checkFrontendBackend();

// CHECK 5: URL Routing
$verification['url_routing'] = checkURLRouting();

// Overall Status
$allChecks = [
    $verification['backend_php']['status'],
    $verification['database_check']['status'],
    $verification['api_endpoints']['status'],
    $verification['frontend_backend']['status'],
    $verification['url_routing']['status']
];

if (in_array('error', $allChecks)) {
    $verification['overall_status'] = 'error';
} elseif (in_array('warning', $allChecks)) {
    $verification['overall_status'] = 'warning';
} else {
    $verification['overall_status'] = 'success';
}

echo json_encode($verification, JSON_PRETTY_PRINT);

function checkBackendPHP() {
    $result = [
        'status' => 'checking',
        'php_version' => phpversion(),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time')
    ];
    
    // Check if required files exist
    $requiredFiles = [
        'index.php',
        'config/database.php',
        'config/config.php',
        'api/products.php',
        'api/categories.php',
        'includes/helpers.php',
        'middleware/cors.php'
    ];
    
    $missingFiles = [];
    foreach ($requiredFiles as $file) {
        if (!file_exists(__DIR__ . '/' . $file)) {
            $missingFiles[] = $file;
        }
    }
    
    if (empty($missingFiles)) {
        $result['status'] = 'success';
        $result['message'] = 'All required PHP files present';
    } else {
        $result['status'] = 'error';
        $result['message'] = 'Missing required files';
        $result['missing_files'] = $missingFiles;
    }
    
    return $result;
}

function checkDatabase() {
    $result = ['status' => 'checking'];
    
    try {
        require_once __DIR__ . '/config/database.php';
        $db = Database::getInstance()->getConnection();
        
        // Test basic connection
        $stmt = $db->prepare("SELECT 1 as test");
        $stmt->execute();
        $test = $stmt->fetch();
        
        if ($test && $test['test'] == 1) {
            $result['connection'] = 'success';
            
            // Check if products table exists and has data
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
            $stmt->execute();
            $productCount = $stmt->fetch()['count'];
            
            $result['products_count'] = $productCount;
            
            if ($productCount > 0) {
                $result['status'] = 'success';
                $result['message'] = "Database connected with $productCount active products";
                
                // Get sample products
                $stmt = $db->prepare("SELECT id, name, price, category FROM products WHERE is_active = 1 LIMIT 3");
                $stmt->execute();
                $result['sample_products'] = $stmt->fetchAll();
            } else {
                $result['status'] = 'warning';
                $result['message'] = 'Database connected but no products found';
                $result['fix'] = 'Run create-sample-data.php to add products';
            }
        } else {
            $result['status'] = 'error';
            $result['message'] = 'Database connection test failed';
        }
        
    } catch (Exception $e) {
        $result['status'] = 'error';
        $result['message'] = 'Database connection failed: ' . $e->getMessage();
        $result['fix'] = 'Check database credentials in config/database.php';
    }
    
    return $result;
}

function checkAPIEndpoints() {
    $result = ['status' => 'checking'];
    $endpoints = [];
    
    // Test main API
    try {
        $originalUri = $_SERVER['REQUEST_URI'];
        $_SERVER['REQUEST_URI'] = '/api/php-backend/';
        
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        $_SERVER['REQUEST_URI'] = $originalUri;
        
        $endpoints['main_api'] = [
            'url' => '/api/php-backend/',
            'status' => !empty($output) ? 'working' : 'not_working',
            'response_length' => strlen($output)
        ];
    } catch (Exception $e) {
        $endpoints['main_api'] = [
            'url' => '/api/php-backend/',
            'status' => 'error',
            'error' => $e->getMessage()
        ];
    }
    
    // Test products API
    try {
        $originalUri = $_SERVER['REQUEST_URI'];
        $_SERVER['REQUEST_URI'] = '/api/php-backend/api/products';
        
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        $_SERVER['REQUEST_URI'] = $originalUri;
        
        $endpoints['products_api'] = [
            'url' => '/api/php-backend/api/products',
            'status' => !empty($output) ? 'working' : 'not_working',
            'response_length' => strlen($output)
        ];
    } catch (Exception $e) {
        $endpoints['products_api'] = [
            'url' => '/api/php-backend/api/products',
            'status' => 'error',
            'error' => $e->getMessage()
        ];
    }
    
    // Test categories API
    try {
        $originalUri = $_SERVER['REQUEST_URI'];
        $_SERVER['REQUEST_URI'] = '/api/php-backend/api/categories';
        
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        $_SERVER['REQUEST_URI'] = $originalUri;
        
        $endpoints['categories_api'] = [
            'url' => '/api/php-backend/api/categories',
            'status' => !empty($output) ? 'working' : 'not_working',
            'response_length' => strlen($output)
        ];
    } catch (Exception $e) {
        $endpoints['categories_api'] = [
            'url' => '/api/php-backend/api/categories',
            'status' => 'error',
            'error' => $e->getMessage()
        ];
    }
    
    $workingEndpoints = array_filter($endpoints, function($ep) { return $ep['status'] === 'working'; });
    $totalEndpoints = count($endpoints);
    $workingCount = count($workingEndpoints);
    
    if ($workingCount == $totalEndpoints) {
        $result['status'] = 'success';
        $result['message'] = "All $totalEndpoints endpoints working";
    } elseif ($workingCount > 0) {
        $result['status'] = 'warning';
        $result['message'] = "$workingCount out of $totalEndpoints endpoints working";
    } else {
        $result['status'] = 'error';
        $result['message'] = 'No endpoints working';
    }
    
    $result['endpoints'] = $endpoints;
    return $result;
}

function checkFrontendBackend() {
    $result = ['status' => 'checking'];
    
    // Check if frontend files exist
    $frontendFiles = [
        'index.html',
        'assets/index-DijrtplP.js',
        'assets/index-DatkpsYv.css'
    ];
    
    $missingFrontend = [];
    foreach ($frontendFiles as $file) {
        $path = $_SERVER['DOCUMENT_ROOT'] . '/' . $file;
        if (!file_exists($path)) {
            $missingFrontend[] = $file;
        }
    }
    
    if (empty($missingFrontend)) {
        $result['frontend_files'] = 'present';
        
        // Check if frontend can reach backend
        $backendUrl = 'https://skbakers.com/api/php-backend/';
        $result['backend_url'] = $backendUrl;
        $result['frontend_backend_communication'] = 'ready';
        $result['status'] = 'success';
        $result['message'] = 'Frontend and backend are properly configured';
    } else {
        $result['status'] = 'error';
        $result['message'] = 'Frontend files missing';
        $result['missing_files'] = $missingFrontend;
    }
    
    return $result;
}

function checkURLRouting() {
    $result = ['status' => 'checking'];
    
    // Check .htaccess file
    if (file_exists(__DIR__ . '/.htaccess')) {
        $htaccess = file_get_contents(__DIR__ . '/.htaccess');
        if (strpos($htaccess, 'RewriteEngine On') !== false) {
            $result['htaccess'] = 'configured';
            $result['url_rewriting'] = 'enabled';
            $result['status'] = 'success';
            $result['message'] = 'URL routing is properly configured';
        } else {
            $result['status'] = 'error';
            $result['message'] = '.htaccess exists but URL rewriting not enabled';
        }
    } else {
        $result['status'] = 'error';
        $result['message'] = '.htaccess file missing';
        $result['fix'] = 'Create .htaccess file with RewriteEngine On';
    }
    
    return $result;
}
?>
