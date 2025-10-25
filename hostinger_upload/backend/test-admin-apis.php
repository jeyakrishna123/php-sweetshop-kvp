<?php
/**
 * Test Admin Dashboard APIs
 * This script tests all admin dashboard endpoints
 */

// Test URLs for admin APIs
$baseUrl = 'https://skbakers.com/api/php-backend/api/admin';

$adminEndpoints = [
    'Dashboard Stats' => '/dashboard',
    'Analytics' => '/analytics', 
    'Order Stats' => '/order-stats',
    'User Stats' => '/user-stats',
    'All Users' => '/users',
    'All Customers' => '/customers',
    'Reports' => '/reports',
    'Generate Report' => '/reports/generate',
    'Inventory Status' => '/inventory'
];

echo "🔍 TESTING ADMIN DASHBOARD APIs\n";
echo "================================\n\n";

foreach ($adminEndpoints as $name => $endpoint) {
    $url = $baseUrl . $endpoint;
    echo "Testing: $name\n";
    echo "URL: $url\n";
    
    // Test the endpoint
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ CURL Error: $error\n";
    } elseif ($httpCode === 200) {
        echo "✅ SUCCESS (HTTP $httpCode)\n";
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "   Response: " . ($data['success'] ? 'Success' : 'Failed') . "\n";
        }
    } elseif ($httpCode === 404) {
        echo "❌ NOT FOUND (HTTP $httpCode)\n";
    } elseif ($httpCode === 401) {
        echo "🔒 UNAUTHORIZED (HTTP $httpCode) - Authentication required\n";
    } else {
        echo "⚠️  HTTP $httpCode\n";
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['message'])) {
                echo "   Error: " . $data['message'] . "\n";
            }
        }
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
}

echo "🎯 ADMIN API TEST COMPLETE!\n";
echo "All admin endpoints should return 200 (success) or 401 (auth required)\n";
echo "404 errors indicate routing issues that need fixing.\n";
?>
