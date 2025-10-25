<?php
/**
 * Test Fixed APIs
 * Quick test to verify the API fixes are working
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$tests = [];

// Test 1: Main API
$tests['main_api'] = testAPI('/api/php-backend/');

// Test 2: Products API
$tests['products_api'] = testAPI('/api/php-backend/api/products');

// Test 3: Categories API
$tests['categories_api'] = testAPI('/api/php-backend/api/categories');

// Test 4: Categories All API
$tests['categories_all_api'] = testAPI('/api/php-backend/api/categories/all');

echo json_encode($tests, JSON_PRETTY_PRINT);

function testAPI($path) {
    $result = [
        'path' => $path,
        'status' => 'testing'
    ];
    
    try {
        $originalUri = $_SERVER['REQUEST_URI'];
        $_SERVER['REQUEST_URI'] = $path;
        
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        $_SERVER['REQUEST_URI'] = $originalUri;
        
        if (!empty($output)) {
            $json = json_decode($output, true);
            if ($json) {
                $result['status'] = 'success';
                $result['response_type'] = 'json';
                $result['has_data'] = isset($json['data']) || isset($json['categories']) || isset($json['products']);
                $result['message'] = $json['message'] ?? 'No message';
            } else {
                $result['status'] = 'warning';
                $result['response_type'] = 'text';
            }
            $result['response_length'] = strlen($output);
        } else {
            $result['status'] = 'error';
            $result['message'] = 'No response';
        }
        
    } catch (Exception $e) {
        $result['status'] = 'error';
        $result['error'] = $e->getMessage();
    }
    
    return $result;
}
?>
