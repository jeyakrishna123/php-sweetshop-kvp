<?php
/**
 * Test API Response - Check what getAllProducts returns
 */

// Simulate API call
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/products?limit=1000';
$_GET['limit'] = 1000;

// Mock authentication - simulate admin user
class MockAuth {
    public static $mockUser = null;

    public static function setMockUser($user) {
        self::$mockUser = $user;
    }
}

// Include the products API file
ob_start();
include __DIR__ . '/php-backend/api/products.php';
$output = ob_get_clean();

// Parse the JSON response
$response = json_decode($output, true);

if ($response) {
    echo "📊 API RESPONSE ANALYSIS:\n";
    echo str_repeat("=", 80) . "\n\n";

    echo "Response structure:\n";
    echo "  success: " . ($response['success'] ? 'true' : 'false') . "\n";
    echo "  message: " . $response['message'] . "\n\n";

    if (isset($response['data']['data'])) {
        $products = $response['data']['data'];
        echo "Products found: " . count($products) . "\n";
        echo "Total items: " . ($response['data']['pagination']['totalItems'] ?? 'N/A') . "\n";
        echo "Current page: " . ($response['data']['pagination']['currentPage'] ?? 'N/A') . "\n";
        echo "Items per page: " . ($response['data']['pagination']['itemsPerPage'] ?? 'N/A') . "\n\n";

        echo "First 5 products:\n";
        foreach (array_slice($products, 0, 5) as $i => $product) {
            echo sprintf(
                "  %d. ID: %-3d | %-40s | %s\n",
                $i + 1,
                $product['id'],
                substr($product['name'], 0, 40),
                $product['category']
            );
        }
    } else {
        echo "⚠️ No products data in response!\n";
        echo "Response data keys: " . implode(', ', array_keys($response['data'] ?? [])) . "\n";
    }
} else {
    echo "❌ Failed to parse JSON response\n";
    echo "Raw output:\n";
    echo $output . "\n";
}
