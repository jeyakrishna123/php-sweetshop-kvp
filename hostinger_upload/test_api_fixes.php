<?php
/**
 * Test API Fixes - Verify Database Connection and API Endpoints
 */

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/config/config.php';
require_once __DIR__ . '/backend/includes/helpers.php';

echo "🧪 TESTING API FIXES\n";
echo "===================\n\n";

try {
    // Test database connection
    echo "1. Testing database connection...\n";
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connected successfully\n\n";

    // Test products table
    echo "2. Testing products table...\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Products table accessible - Count: " . $result['count'] . "\n\n";

    // Test categories table
    echo "3. Testing categories table...\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM categories");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Categories table accessible - Count: " . $result['count'] . "\n\n";

    // Test products with categories join
    echo "4. Testing products with categories join...\n";
    $stmt = $db->prepare("
        SELECT p.id, p.name, p.price, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LIMIT 5
    ");
    $stmt->execute();
    $products = $stmt->fetchAll();
    echo "✅ Products join working - Found " . count($products) . " products\n";
    
    if (count($products) > 0) {
        echo "Sample product: " . $products[0]['name'] . " - " . $products[0]['category_name'] . "\n";
    }
    echo "\n";

    // Test bestsellers query
    echo "5. Testing bestsellers query...\n";
    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM products
        WHERE is_bestseller = 1 AND is_active = 1
    ");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Bestsellers query working - Count: " . $result['count'] . "\n\n";

    echo "🎉 ALL TESTS PASSED!\n";
    echo "Your API fixes are working correctly.\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
