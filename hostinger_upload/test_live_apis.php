<?php
echo "🌐 TESTING LIVE HOSTINGER APIs\n";
echo "==============================\n\n";

// Test API endpoints directly
$baseUrl = 'https://skbakers.com/api';

$endpoints = [
    'Products' => '/products',
    'Bestsellers' => '/products/bestsellers',
    'Categories' => '/categories/all',
    'Menu' => '/menu/active'
];

foreach ($endpoints as $name => $endpoint) {
    echo "🧪 Testing $name API...\n";
    $url = $baseUrl . $endpoint;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($response === false) {
        echo "❌ $name API failed: $curlError\n";
    } else {
        $data = json_decode($response, true);
        if ($httpCode === 200 && $data && isset($data['success'])) {
            $count = 0;
            if (isset($data['data']['data'])) {
                $count = count($data['data']['data']);
            } elseif (isset($data['data']['products'])) {
                $count = count($data['data']['products']);
            } elseif (isset($data['data']['categories'])) {
                $count = count($data['data']['categories']);
            } elseif (isset($data['data'])) {
                $count = count($data['data']);
            }
            echo "✅ $name API working: $count items\n";
        } else {
            echo "❌ $name API error (HTTP $httpCode): " . substr($response, 0, 200) . "...\n";
        }
    }
    echo "\n";
}

echo "🎯 API TEST COMPLETE\n";
echo "If you see errors, the backend files need to be uploaded to Hostinger.\n";
?>
