<?php
/**
 * Test API After Adding Products
 */

echo "🧪 TESTING API AFTER ADDING PRODUCTS\n";
echo "=====================================\n\n";

// Test the API endpoint
$apiUrl = 'https://skbakers.com/api/products';

echo "Testing: $apiUrl\n";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json',
        'timeout' => 10
    ]
]);

$response = @file_get_contents($apiUrl, false, $context);

if ($response === false) {
    echo "❌ Failed to fetch API response\n";
} else {
    echo "✅ API Response received\n";
    
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "✅ API Success: " . $data['message'] . "\n";
        
        if (isset($data['data']['data'])) {
            $products = $data['data']['data'];
            echo "📊 Products returned: " . count($products) . "\n";
            
            if (count($products) > 0) {
                echo "🎉 SUCCESS! Products are now fetching from database!\n\n";
                echo "Sample products:\n";
                foreach (array_slice($products, 0, 3) as $product) {
                    echo "- {$product['name']} - ₹{$product['price']}\n";
                }
            } else {
                echo "❌ Still no products in response\n";
            }
        }
    } else {
        echo "❌ API Error: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
}

echo "\n🎯 NEXT STEPS:\n";
echo "1. Run: php hostinger_upload/add_products_to_db.php\n";
echo "2. Then test: https://skbakers.com/api/products\n";
echo "3. You should see products in the response!\n";
?>
