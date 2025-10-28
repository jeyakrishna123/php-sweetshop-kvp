<?php
/**
 * Debug Products - Check why products not fetching
 */

echo "🔍 DEBUGGING PRODUCT FETCHING\n";
echo "============================\n\n";

try {
    // Test database connection
    echo "1. Testing database connection...\n";
    require_once __DIR__ . '/backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connected\n\n";

    // Check if products table exists and has data
    echo "2. Checking products table...\n";
    $stmt = $db->prepare("SHOW TABLES LIKE 'products'");
    $stmt->execute();
    $table = $stmt->fetch();
    if ($table) {
        echo "✅ Products table exists\n";
    } else {
        echo "❌ Products table does not exist\n";
        exit;
    }

    // Check products count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "📊 Total products in database: " . $result['count'] . "\n\n";

    if ($result['count'] == 0) {
        echo "❌ NO PRODUCTS FOUND IN DATABASE!\n";
        echo "This is why products are not showing.\n\n";
        
        echo "3. Checking categories table...\n";
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM categories");
        $stmt->execute();
        $catResult = $stmt->fetch();
        echo "📊 Total categories: " . $catResult['count'] . "\n\n";
        
        if ($catResult['count'] == 0) {
            echo "❌ NO CATEGORIES FOUND!\n";
            echo "You need to add categories first, then products.\n\n";
        }
        
        echo "💡 SOLUTION: Add some products to the database\n";
        echo "Run: php hostinger_upload/COMPLETE_DATABASE_SETUP.php\n";
        exit;
    }

    // Check active products
    echo "3. Checking active products...\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
    $stmt->execute();
    $activeResult = $stmt->fetch();
    echo "📊 Active products: " . $activeResult['count'] . "\n\n";

    // Show sample products
    echo "4. Sample products from database:\n";
    $stmt = $db->prepare("
        SELECT p.id, p.name, p.price, p.is_active, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LIMIT 5
    ");
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    foreach ($products as $product) {
        echo "- ID: {$product['id']}, Name: {$product['name']}, Price: {$product['price']}, Active: {$product['is_active']}, Category: {$product['category_name']}\n";
    }
    echo "\n";

    // Test the actual API query
    echo "5. Testing API query...\n";
    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT 5
    ");
    $stmt->execute();
    $apiProducts = $stmt->fetchAll();
    
    echo "📊 API query returned: " . count($apiProducts) . " products\n";
    foreach ($apiProducts as $product) {
        echo "- {$product['name']} (Active: {$product['is_active']})\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
