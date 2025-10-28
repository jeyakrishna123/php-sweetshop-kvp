<?php
echo "🌐 SIMPLE API TEST\n";
echo "=================\n\n";

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
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'method' => 'GET'
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ $name API failed: Cannot connect\n";
    } else {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
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
            echo "❌ $name API error: " . substr($response, 0, 100) . "...\n";
        }
    }
    echo "\n";
}

echo "🎯 TEST COMPLETE\n";
?>