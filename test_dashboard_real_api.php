<?php
/**
 * Test Real Dashboard API
 * This script tests the actual API endpoint via HTTP
 */

// You'll need to replace this with a valid admin token
$token = "your_admin_token_here"; // Get this from localStorage after logging in

$baseUrl = "http://localhost:8000/api/admin/dashboard";

// Test 1: All-time data
echo "=== TEST 1: All-time Dashboard Data ===\n";
$url1 = $baseUrl;
$response1 = makeApiCall($url1, $token);
displayResponse($response1);

// Test 2: Today's data
echo "\n=== TEST 2: Today's Data ===\n";
$url2 = $baseUrl . "?dateRange=today";
$response2 = makeApiCall($url2, $token);
displayResponse($response2);

// Test 3: This Week's data
echo "\n=== TEST 3: This Week's Data ===\n";
$url3 = $baseUrl . "?dateRange=week";
$response3 = makeApiCall($url3, $token);
displayResponse($response3);

function makeApiCall($url, $token) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    return [
        'httpCode' => $httpCode,
        'response' => $response
    ];
}

function displayResponse($result) {
    echo "HTTP Code: {$result['httpCode']}\n";

    $data = json_decode($result['response'], true);
    if ($data && isset($data['stats'])) {
        echo "✓ Total Products: " . ($data['stats']['totalProducts'] ?? 'N/A') . "\n";
        echo "✓ Total Orders: " . ($data['stats']['totalOrders'] ?? 'N/A') . "\n";
        echo "✓ Total Users: " . ($data['stats']['totalUsers'] ?? 'N/A') . "\n";
        echo "✓ Total Revenue: ₹" . ($data['stats']['totalRevenue'] ?? 'N/A') . "\n";
        echo "✓ Pending Orders: " . ($data['stats']['pendingOrders'] ?? 'N/A') . "\n";
        echo "✓ Processing Orders: " . ($data['stats']['processingOrders'] ?? 'N/A') . "\n";
        echo "✓ Shipped Orders: " . ($data['stats']['shippedOrders'] ?? 'N/A') . "\n";
        echo "✓ Delivered Orders: " . ($data['stats']['deliveredOrders'] ?? 'N/A') . "\n";
    } else {
        echo "Raw Response:\n";
        echo $result['response'] . "\n";
    }
}

echo "\n\n=== INSTRUCTIONS ===\n";
echo "1. Log in to the admin panel in your browser\n";
echo "2. Open browser console and run: localStorage.getItem('token')\n";
echo "3. Copy the token and replace 'your_admin_token_here' in this script\n";
echo "4. Run the script again to see the actual API responses\n";
