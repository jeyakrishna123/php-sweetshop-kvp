<?php
echo "🧪 TESTING API ENDPOINTS\n";
echo "========================\n\n";

// Test 1: Products API
echo "1. Testing /api/products...\n";
$url = 'https://skbakers.com/api/products';
$response = @file_get_contents($url);
if ($response === false) {
    echo "❌ Failed to fetch products API\n";
} else {
    $data = json_decode($response, true);
    if ($data && isset($data['success'])) {
        echo "✅ Products API working: " . $data['message'] . "\n";
        echo "📊 Found " . (isset($data['data']['data']) ? count($data['data']['data']) : 0) . " products\n";
    } else {
        echo "❌ Products API error: " . $response . "\n";
    }
}

echo "\n";

// Test 2: Bestsellers API
echo "2. Testing /api/products/bestsellers...\n";
$url = 'https://skbakers.com/api/products/bestsellers';
$response = @file_get_contents($url);
if ($response === false) {
    echo "❌ Failed to fetch bestsellers API\n";
} else {
    $data = json_decode($response, true);
    if ($data && isset($data['success'])) {
        echo "✅ Bestsellers API working: " . $data['message'] . "\n";
        echo "📊 Found " . (isset($data['data']['products']) ? count($data['data']['products']) : 0) . " bestsellers\n";
    } else {
        echo "❌ Bestsellers API error: " . $response . "\n";
    }
}

echo "\n";

// Test 3: Categories API
echo "3. Testing /api/categories/all...\n";
$url = 'https://skbakers.com/api/categories/all';
$response = @file_get_contents($url);
if ($response === false) {
    echo "❌ Failed to fetch categories API\n";
} else {
    $data = json_decode($response, true);
    if ($data && isset($data['success'])) {
        echo "✅ Categories API working: " . $data['message'] . "\n";
        echo "📊 Found " . (isset($data['data']['categories']) ? count($data['data']['categories']) : 0) . " categories\n";
    } else {
        echo "❌ Categories API error: " . $response . "\n";
    }
}

echo "\n🎯 DIAGNOSIS COMPLETE\n";
?>
