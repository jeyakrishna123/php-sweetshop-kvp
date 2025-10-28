<?php
echo "🧪 TESTING BACKEND UPLOAD STATUS\n";
echo "================================\n\n";

// Test if backend files exist on Hostinger
$baseUrl = 'https://skbakers.com';

$endpoints = [
    'Auth Register' => '/api/auth/register',
    'Products' => '/api/products',
    'Categories' => '/api/categories/all',
    'Bestsellers' => '/api/products/bestsellers'
];

foreach ($endpoints as $name => $endpoint) {
    echo "🧪 Testing $name...\n";
    $url = $baseUrl . $endpoint;
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'method' => 'GET'
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ $name: Cannot connect (Backend not uploaded)\n";
    } else {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "✅ $name: Working (Backend uploaded)\n";
        } else {
            echo "❌ $name: Error response (Backend uploaded but has issues)\n";
            echo "Response: " . substr($response, 0, 100) . "...\n";
        }
    }
    echo "\n";
}

echo "🎯 DIAGNOSIS:\n";
echo "If you see 'Cannot connect' errors, the backend files are NOT uploaded to Hostinger.\n";
echo "If you see 'Error response', the backend is uploaded but has configuration issues.\n";
echo "If you see 'Working', the backend is properly uploaded and configured.\n";
?>
