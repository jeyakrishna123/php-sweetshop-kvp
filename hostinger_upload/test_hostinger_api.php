<?php
/**
 * Test Hostinger API - Check if products API works on production
 */

echo "🌐 TESTING HOSTINGER API\n";
echo "=======================\n\n";

// Test the products API endpoint
$apiUrl = 'https://skbakers.com/api/products';

echo "1. Testing API endpoint: $apiUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ CURL Error: $error\n";
} else {
    echo "✅ API Response received\n";
    echo "Response length: " . strlen($response) . " characters\n";
    
    $data = json_decode($response, true);
    if ($data) {
        echo "✅ Valid JSON response\n";
        if (isset($data['success']) && $data['success']) {
            echo "✅ API Success: " . $data['message'] . "\n";
            if (isset($data['data']['data'])) {
                $products = $data['data']['data'];
                echo "📊 Products returned: " . count($products) . "\n";
                if (count($products) > 0) {
                    echo "Sample product: " . $products[0]['name'] . "\n";
                }
            }
        } else {
            echo "❌ API Error: " . ($data['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Invalid JSON response\n";
        echo "Raw response: " . substr($response, 0, 200) . "...\n";
    }
}

echo "\n2. Testing bestsellers API...\n";
$bestsellersUrl = 'https://skbakers.com/api/products/bestsellers';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $bestsellersUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ CURL Error: $error\n";
} else {
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "✅ Bestsellers API working\n";
        if (isset($data['data']['products'])) {
            echo "📊 Bestsellers returned: " . count($data['data']['products']) . "\n";
        }
    } else {
        echo "❌ Bestsellers API error\n";
    }
}

echo "\n🎯 CONCLUSION:\n";
echo "If you see products here, the API is working on Hostinger.\n";
echo "If you see errors, there are issues with the Hostinger setup.\n";
?>
