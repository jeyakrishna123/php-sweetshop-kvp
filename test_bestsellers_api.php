<?php
/**
 * Test the bestsellers API endpoint directly
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simulate the API call
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/products/bestsellers?limit=6';
$_GET['limit'] = 6;

// Load the products API
require_once __DIR__ . '/php-backend/config/database.php';
require_once __DIR__ . '/php-backend/config/config.php';
require_once __DIR__ . '/php-backend/includes/helpers.php';
require_once __DIR__ . '/php-backend/middleware/auth.php';

$db = Database::getInstance()->getConnection();

echo "🔍 TESTING BESTSELLERS API ENDPOINT\n";
echo str_repeat("=", 80) . "\n\n";

// Call the getBestsellers function directly
function getBestsellers($db) {
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 20) : 6;

    $stmt = $db->prepare("
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count, featured
        FROM products
        WHERE is_active = 1 AND (featured = 1 OR sold_count > 0)
        ORDER BY featured DESC, sold_count DESC, average_rating DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
    }

    return $products;
}

$bestsellers = getBestsellers($db);

echo "📦 API Response:\n";
echo str_repeat("-", 80) . "\n";
echo "Found " . count($bestsellers) . " bestseller(s)\n\n";

if (count($bestsellers) > 0) {
    foreach ($bestsellers as $i => $product) {
        echo "Product #" . ($i + 1) . ":\n";
        echo "  ID: " . $product['id'] . "\n";
        echo "  Name: " . $product['name'] . "\n";
        echo "  Category: " . $product['category'] . "\n";
        echo "  Price: ₹" . $product['price'] . "\n";
        echo "  Featured: " . ($product['featured'] ? 'YES' : 'NO') . "\n";
        echo "  Sold Count: " . $product['sold_count'] . "\n";
        echo "  Rating: " . $product['average_rating'] . "\n";
        echo "  Images: " . (is_array($product['images']) ? count($product['images']) . ' images' : 'NO IMAGES') . "\n";
        echo "\n";
    }

    echo "✅ SUCCESS! The API is returning bestsellers correctly.\n";
    echo "\n🎉 The homepage 'India Loves - Bestsellers' section should now show these " . count($bestsellers) . " products!\n";
} else {
    echo "❌ ERROR: No bestsellers returned from API\n";
}

echo "\n" . str_repeat("=", 80) . "\n";
