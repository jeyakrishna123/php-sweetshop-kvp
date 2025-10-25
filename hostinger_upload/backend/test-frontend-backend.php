<?php
/**
 * TEST FRONTEND & BACKEND COMMUNICATION
 * This will simulate the exact requests your React frontend makes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$testResults = [
    'timestamp' => date('c'),
    'frontend_simulation' => 'testing',
    'backend_responses' => 'testing'
];

// SIMULATE EXACT FRONTEND REQUESTS
$testResults['frontend_requests'] = simulateFrontendRequests();

// TEST BACKEND RESPONSES
$testResults['backend_responses'] = testBackendResponses();

// OVERALL STATUS
$allTests = array_merge(
    array_column($testResults['frontend_requests'], 'status'),
    array_column($testResults['backend_responses'], 'status')
);

if (in_array('error', $allTests)) {
    $testResults['overall_status'] = 'error';
} elseif (in_array('warning', $allTests)) {
    $testResults['overall_status'] = 'warning';
} else {
    $testResults['overall_status'] = 'success';
}

echo json_encode($testResults, JSON_PRETTY_PRINT);

function simulateFrontendRequests() {
    $requests = [];
    
    // Simulate the exact requests your React frontend makes
    $frontendRequests = [
        [
            'name' => 'Products API',
            'url' => '/api/php-backend/api/products',
            'method' => 'GET',
            'params' => ['page' => 1, 'limit' => 12, 'category' => 'Bento Cakes']
        ],
        [
            'name' => 'Categories API',
            'url' => '/api/php-backend/api/categories',
            'method' => 'GET',
            'params' => []
        ],
        [
            'name' => 'Featured Products',
            'url' => '/api/php-backend/api/products/featured',
            'method' => 'GET',
            'params' => ['limit' => 8]
        ],
        [
            'name' => 'Categories All',
            'url' => '/api/php-backend/api/categories/all',
            'method' => 'GET',
            'params' => []
        ]
    ];
    
    foreach ($frontendRequests as $request) {
        $result = testRequest($request);
        $requests[] = $result;
    }
    
    return $requests;
}

function testRequest($request) {
    $result = [
        'name' => $request['name'],
        'url' => $request['url'],
        'method' => $request['method'],
        'status' => 'testing'
    ];
    
    try {
        // Set up the request
        $originalUri = $_SERVER['REQUEST_URI'];
        $originalMethod = $_SERVER['REQUEST_METHOD'];
        $originalGet = $_GET;
        
        $_SERVER['REQUEST_URI'] = $request['url'];
        $_SERVER['REQUEST_METHOD'] = $request['method'];
        $_GET = $request['params'];
        
        // Capture output
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        // Restore original values
        $_SERVER['REQUEST_URI'] = $originalUri;
        $_SERVER['REQUEST_METHOD'] = $originalMethod;
        $_GET = $originalGet;
        
        if (!empty($output)) {
            $jsonOutput = json_decode($output, true);
            if ($jsonOutput) {
                $result['status'] = 'success';
                $result['response_type'] = 'json';
                $result['response_length'] = strlen($output);
                $result['has_data'] = isset($jsonOutput['data']) || isset($jsonOutput['products']);
                $result['data_count'] = count($jsonOutput['data'] ?? $jsonOutput['products'] ?? []);
            } else {
                $result['status'] = 'warning';
                $result['response_type'] = 'text';
                $result['response_length'] = strlen($output);
                $result['message'] = 'Response is not valid JSON';
            }
        } else {
            $result['status'] = 'error';
            $result['message'] = 'No response from endpoint';
        }
        
    } catch (Exception $e) {
        $result['status'] = 'error';
        $result['error'] = $e->getMessage();
    }
    
    return $result;
}

function testBackendResponses() {
    $responses = [];
    
    // Test direct backend access
    $backendTests = [
        [
            'name' => 'Main Backend',
            'url' => 'https://skbakers.com/api/php-backend/',
            'description' => 'Test main backend endpoint'
        ],
        [
            'name' => 'Products Endpoint',
            'url' => 'https://skbakers.com/api/php-backend/api/products',
            'description' => 'Test products API'
        ],
        [
            'name' => 'Categories Endpoint',
            'url' => 'https://skbakers.com/api/php-backend/api/categories',
            'description' => 'Test categories API'
        ]
    ];
    
    foreach ($backendTests as $test) {
        $result = [
            'name' => $test['name'],
            'url' => $test['url'],
            'description' => $test['description'],
            'status' => 'testing'
        ];
        
        try {
            // Use cURL to test actual HTTP requests
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $test['url']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                $result['status'] = 'error';
                $result['error'] = $error;
            } elseif ($httpCode == 200 && !empty($response)) {
                $result['status'] = 'success';
                $result['http_code'] = $httpCode;
                $result['response_length'] = strlen($response);
                
                $jsonResponse = json_decode($response, true);
                if ($jsonResponse) {
                    $result['response_type'] = 'json';
                    $result['has_data'] = isset($jsonResponse['data']) || isset($jsonResponse['products']);
                } else {
                    $result['response_type'] = 'text';
                }
            } else {
                $result['status'] = 'error';
                $result['http_code'] = $httpCode;
                $result['message'] = 'HTTP error or empty response';
            }
            
        } catch (Exception $e) {
            $result['status'] = 'error';
            $result['error'] = $e->getMessage();
        }
        
        $responses[] = $result;
    }
    
    return $responses;
}
?>
