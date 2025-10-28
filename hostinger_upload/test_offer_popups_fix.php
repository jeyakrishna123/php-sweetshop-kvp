<?php
echo "🧪 TESTING OFFER POPUPS FIX\n";
echo "===========================\n\n";

// Test the offer-popups API
$url = 'https://skbakers.com/api/offer-popups?status=active&limit=1';

echo "1. Testing offer-popups API...\n";
echo "URL: $url\n\n";

$context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'method' => 'GET'
    ]
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    echo "❌ Cannot connect to offer-popups API\n";
    echo "This means the backend files are not uploaded to Hostinger yet.\n";
} else {
    $data = json_decode($response, true);
    if ($data && isset($data['success'])) {
        echo "✅ Offer-popups API working!\n";
        echo "Message: " . $data['message'] . "\n";
        echo "Popups found: " . count($data['data']['popups']) . "\n";
    } else {
        echo "❌ Offer-popups API error:\n";
        echo "Response: " . $response . "\n";
    }
}

echo "\n🎯 DIAGNOSIS:\n";
echo "If you see 'Cannot connect', upload the backend files to Hostinger.\n";
echo "If you see 'API working', the fix is working correctly.\n";
?>
