<?php
/**
 * Test the bestseller fix - check if featured products appear as bestsellers
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php-backend/config/database.php';

echo "🔍 TESTING BESTSELLER FIX\n";
echo str_repeat("=", 80) . "\n\n";

$db = Database::getInstance()->getConnection();

// 1. Check current state
echo "📊 CURRENT DATABASE STATE:\n";
echo str_repeat("-", 80) . "\n";

$stmt = $db->query("
    SELECT id, name, featured, sold_count, average_rating, is_active
    FROM products
    WHERE is_active = 1
    ORDER BY featured DESC, sold_count DESC
    LIMIT 10
");
$products = $stmt->fetchAll();

echo sprintf("%-4s | %-40s | Featured | Sold | Rating\n", "ID", "Name");
echo str_repeat("-", 80) . "\n";
foreach ($products as $p) {
    echo sprintf("%-4d | %-40s | %-8s | %-4d | %.2f\n",
        $p['id'],
        substr($p['name'], 0, 40),
        $p['featured'] ? 'YES' : 'NO',
        $p['sold_count'],
        $p['average_rating']
    );
}

echo "\n";

// 2. Test the getBestsellers query directly
echo "🏆 TESTING BESTSELLER QUERY:\n";
echo str_repeat("-", 80) . "\n";

$stmt = $db->prepare("
    SELECT id, name, slug, description, price, original_price, discount_percentage,
           category, images, thumbnail, average_rating, num_reviews, sold_count, featured
    FROM products
    WHERE is_active = 1 AND (featured = 1 OR sold_count > 0)
    ORDER BY featured DESC, sold_count DESC, average_rating DESC
    LIMIT 6
");
$stmt->execute();
$bestsellers = $stmt->fetchAll();

echo "Found " . count($bestsellers) . " bestseller(s):\n\n";

if (count($bestsellers) > 0) {
    echo sprintf("%-4s | %-40s | Featured | Sold | Rating\n", "ID", "Name");
    echo str_repeat("-", 80) . "\n";
    foreach ($bestsellers as $p) {
        echo sprintf("%-4d | %-40s | %-8s | %-4d | %.2f\n",
            $p['id'],
            substr($p['name'], 0, 40),
            $p['featured'] ? 'YES' : 'NO',
            $p['sold_count'],
            $p['average_rating']
        );
    }
} else {
    echo "❌ NO BESTSELLERS FOUND!\n";
    echo "This means no products have featured=1 OR sold_count>0\n";
}

echo "\n";

// 3. Check if we need to set some products as featured for testing
$featuredCount = $db->query("SELECT COUNT(*) as count FROM products WHERE featured = 1 AND is_active = 1")->fetch()['count'];
echo "📈 FEATURED PRODUCTS COUNT: $featuredCount\n\n";

if ($featuredCount == 0) {
    echo "⚠️  WARNING: No products are marked as featured!\n";
    echo "To test bestsellers, you need to either:\n";
    echo "  1. Create a new product and check the 'Bestseller' checkbox\n";
    echo "  2. Edit an existing product and check the 'Bestseller' or 'Featured' checkbox\n";
    echo "  3. Run this command to mark Product ID 27 as featured:\n";
    echo "     UPDATE products SET featured = 1 WHERE id = 27;\n\n";

    // Offer to auto-fix for testing
    echo "Would you like to automatically mark Product ID 27 as featured for testing? (This is safe)\n";
    echo "Run this separately: UPDATE products SET featured = 1 WHERE id = 27;\n";
} else {
    echo "✅ Good! You have $featuredCount featured product(s). They should appear as bestsellers.\n";
}

echo "\n" . str_repeat("=", 80) . "\n";
echo "✅ TEST COMPLETE\n";
echo "\nNext steps:\n";
echo "1. If no bestsellers found, create a new product with 'Bestseller' checkbox checked\n";
echo "2. Check the homepage to see if bestsellers appear in 'India Loves' section\n";
echo "3. Verify that the backend fix is working correctly\n";
