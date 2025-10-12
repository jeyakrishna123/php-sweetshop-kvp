<?php
/**
 * Test All API Endpoints
 * Individual endpoint testing
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$testResults = [];

// Test 1: Main API Root
$testResults['main_api'] = testEndpoint('/', 'GET');

// Test 2: Products API
$testResults['products'] = testEndpoint('/api/products', 'GET');
$testResults['products_featured'] = testEndpoint('/api/products/featured', 'GET');

// Test 3: Categories API
$testResults['categories'] = testEndpoint('/api/categories', 'GET');

// Test 4: Auth API
$testResults['auth_register'] = testEndpoint('/api/auth/register', 'POST', ['name' => 'Test User', 'email' => 'test@example.com', 'password' => 'password123']);
$testResults['auth_login'] = testEndpoint('/api/auth/login', 'POST', ['email' => 'test@example.com', 'password' => 'password123']);

// Test 5: Health Check
$testResults['health'] = testEndpoint('/api/health', 'GET');

// Test 6: Banners API
$testResults['banners'] = testEndpoint('/api/banners', 'GET');

// Test 7: Coupons API
$testResults['coupons'] = testEndpoint('/api/coupons', 'GET');

echo json_encode($testResults, JSON_PRETTY_PRINT);

function testEndpoint($path, $method, $data = null) {
    $result = [
        'endpoint' => $path,
        'method' => $method,
        'status' => 'pending'
    ];
    
    try {
        // Set up environment
        $originalUri = $_SERVER['REQUEST_URI'];
        $originalMethod = $_SERVER['REQUEST_METHOD'];
        $originalGet = $_GET;
        $originalPost = $_POST;
        
        $_SERVER['REQUEST_URI'] = '/api/php-backend' . $path;
        $_SERVER['REQUEST_METHOD'] = $method;
        
        if ($data && $method === 'POST') {
            $_POST = $data;
        }
        
        // Capture output
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        // Restore environment
        $_SERVER['REQUEST_URI'] = $originalUri;
        $_SERVER['REQUEST_METHOD'] = $originalMethod;
        $_GET = $originalGet;
        $_POST = $originalPost;
        
        $result['status'] = !empty($output) ? 'success' : 'error';
        $result['response_length'] = strlen($output);
        $result['has_json'] = json_decode($output) !== null;
        
        if (json_decode($output)) {
            $result['response'] = json_decode($output, true);
        }
        
    } catch (Exception $e) {
        $result['status'] = 'error';
        $result['error'] = $e->getMessage();
    }
    
    return $result;
}
?>
