<?php
/**
 * Test Order Creation with Image Handling
 * Run this script to test if orders can be created with missing images
 */

require_once __DIR__ . '/php-backend/config/database.php';
require_once __DIR__ . '/php-backend/config/config.php';
require_once __DIR__ . '/php-backend/includes/helpers.php';

echo "=== Testing Order Creation with Image Handling ===\n\n";

// Get database connection
$db = Database::getInstance()->getConnection();

// Test 1: Check order_items table schema
echo "1. Checking order_items table schema...\n";
$stmt = $db->query("DESCRIBE order_items");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "   order_items columns:\n";
foreach ($columns as $column) {
    if ($column['Field'] === 'image') {
        echo "   - image: {$column['Type']}, Null: {$column['Null']}, Default: {$column['Default']}\n";

        if ($column['Null'] === 'NO') {
            echo "   ❌ ERROR: image column does NOT allow NULL!\n";
            echo "   🔧 Run this SQL to fix:\n";
            echo "      ALTER TABLE order_items MODIFY COLUMN image VARCHAR(500) NULL;\n\n";
        } else {
            echo "   ✅ image column allows NULL\n\n";
        }
    }
}

// Test 2: Check if products table exists and has products
echo "2. Checking products table...\n";
try {
    $stmt = $db->query("SELECT COUNT(*) as count FROM products");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   ✅ Found {$result['count']} products in database\n\n";
} catch (Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n\n";
}

// Test 3: Get a sample product to test image fields
echo "3. Checking product image fields...\n";
try {
    $stmt = $db->query("SELECT id, name, thumbnail, images FROM products LIMIT 1");
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        echo "   Sample Product: {$product['name']} (ID: {$product['id']})\n";
        echo "   - thumbnail: " . ($product['thumbnail'] ?: 'NULL') . "\n";
        echo "   - images: " . ($product['images'] ?: 'NULL') . "\n";

        if ($product['images']) {
            $imagesArray = json_decode($product['images'], true);
            if (is_array($imagesArray) && !empty($imagesArray)) {
                echo "   - First image from array: {$imagesArray[0]}\n";
            }
        }
        echo "\n";
    } else {
        echo "   ⚠️  No products found in database\n\n";
    }
} catch (Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n\n";
}

// Test 4: Test inserting an order item with NULL image (if allowed)
echo "4. Testing order item insertion with different image values...\n";

// First, check if we can insert with NULL
try {
    // Create a test order first
    $stmt = $db->prepare("
        INSERT INTO orders (user_id, tracking_number, status, total_price)
        VALUES (?, ?, ?, ?)
    ");
    $testTrackingNumber = 'TEST-' . time();
    $stmt->execute([1, $testTrackingNumber, 'pending', 100]);
    $testOrderId = $db->lastInsertId();

    echo "   Created test order ID: $testOrderId\n";

    // Test inserting with NULL image
    echo "   Testing NULL image...\n";
    try {
        $stmt = $db->prepare("
            INSERT INTO order_items (order_id, product_id, name, quantity, price, image)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$testOrderId, 1, 'Test Product', 1, 100, null]);
        echo "   ✅ Successfully inserted order item with NULL image\n";
    } catch (Exception $e) {
        echo "   ❌ FAILED to insert with NULL image: " . $e->getMessage() . "\n";
        echo "   🔧 You MUST run the SQL fix: ALTER TABLE order_items MODIFY COLUMN image VARCHAR(500) NULL;\n";
    }

    // Test inserting with placeholder
    echo "   Testing placeholder image...\n";
    try {
        $stmt = $db->prepare("
            INSERT INTO order_items (order_id, product_id, name, quantity, price, image)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$testOrderId, 1, 'Test Product 2', 1, 100, '/images/placeholder-product.jpg']);
        echo "   ✅ Successfully inserted order item with placeholder image\n";
    } catch (Exception $e) {
        echo "   ❌ FAILED to insert with placeholder: " . $e->getMessage() . "\n";
    }

    // Clean up test data
    echo "   Cleaning up test data...\n";
    $db->prepare("DELETE FROM order_items WHERE order_id = ?")->execute([$testOrderId]);
    $db->prepare("DELETE FROM orders WHERE id = ?")->execute([$testOrderId]);
    echo "   ✅ Test data cleaned up\n\n";

} catch (Exception $e) {
    echo "   ❌ ERROR during test: " . $e->getMessage() . "\n\n";
}

echo "=== Test Complete ===\n\n";

echo "SUMMARY:\n";
echo "1. If 'image column does NOT allow NULL', run the SQL fix\n";
echo "2. Refresh your frontend (Ctrl+Shift+R or Cmd+Shift+R)\n";
echo "3. Try checkout again\n\n";

echo "SQL Fix Command:\n";
echo "ALTER TABLE order_items MODIFY COLUMN image VARCHAR(500) NULL;\n";
