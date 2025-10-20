<?php
/**
 * Debug script to test the actual bestsellers API endpoint
 * This simulates what the frontend is calling
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/php-backend/config/database.php';
require_once __DIR__ . '/php-backend/config/config.php';
require_once __DIR__ . '/php-backend/includes/helpers.php';

$db = Database::getInstance()->getConnection();

echo "Testing bestsellers API endpoint...\n\n";

// Test 1: Check database directly
echo "TEST 1: Database Query\n";
echo str_repeat("=", 80) . "\n";

$stmt = $db->prepare("
    SELECT id, name, slug, description, price, original_price, discount_percentage,
           category, images, thumbnail, average_rating, num_reviews, sold_count, featured, is_active
    FROM products
    WHERE is_active = 1 AND (featured = 1 OR sold_count > 0)
    ORDER BY featured DESC, sold_count DESC, average_rating DESC
    LIMIT 6
");
$stmt->execute();
$products = $stmt->fetchAll();

echo "Found: " . count($products) . " products\n\n";

foreach ($products as $p) {
    echo "ID {$p['id']}: {$p['name']}\n";
    echo "  Featured: {$p['featured']}, Sold: {$p['sold_count']}, Active: {$p['is_active']}\n";
    echo "  Images: " . substr($p['images'], 0, 50) . "...\n\n";
}

// Test 2: Test the actual API response format
echo "\nTEST 2: API Response Format\n";
echo str_repeat("=", 80) . "\n";

foreach ($products as &$product) {
    $product['images'] = json_decode($product['images'], true);
}

$response = [
    'success' => true,
    'message' => 'Bestsellers retrieved successfully',
    'products' => $products
];

echo "API Response:\n";
echo json_encode($response, JSON_PRETTY_PRINT);

echo "\n\nTEST 3: Frontend Expected Format\n";
echo str_repeat("=", 80) . "\n";
echo "Frontend expects: response.data.products\n";
echo "Frontend checks: response.data.success\n";
echo "Products array length: " . count($products) . "\n";
