<?php
/**
 * Test Checkout Database Tables
 * Check if all required tables exist for checkout process
 */

// Test database connection with production credentials
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

echo "🔍 Testing Checkout Database Tables...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n\n";
    
    // Required tables for checkout
    $requiredTables = [
        'users',
        'products', 
        'orders',
        'order_items',
        'shipping_addresses',
        'payment_info',
        'order_status_history',
        'addresses',
        'categories',
        'banners'
    ];
    
    $missingTables = [];
    $existingTables = [];
    
    foreach ($requiredTables as $table) {
        try {
            $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            $result = $stmt->fetch();
            
            if ($result) {
                $existingTables[] = $table;
                echo "✅ Table '$table' exists\n";
                
                // Check table structure for critical tables
                if (in_array($table, ['orders', 'order_items', 'shipping_addresses', 'payment_info'])) {
                    $stmt = $pdo->prepare("DESCRIBE $table");
                    $stmt->execute();
                    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    echo "   Columns: " . implode(', ', $columns) . "\n";
                }
            } else {
                $missingTables[] = $table;
                echo "❌ Table '$table' MISSING\n";
            }
        } catch (PDOException $e) {
            $missingTables[] = $table;
            echo "❌ Error checking table '$table': " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n📊 SUMMARY:\n";
    echo "✅ Existing tables: " . count($existingTables) . "\n";
    echo "❌ Missing tables: " . count($missingTables) . "\n";
    
    if (count($missingTables) > 0) {
        echo "\n🚨 MISSING TABLES:\n";
        foreach ($missingTables as $table) {
            echo "- $table\n";
        }
        echo "\n🔧 SOLUTION: Run setup_hostinger_database.php to create missing tables\n";
    } else {
        echo "\n✅ All required tables exist!\n";
        
        // Test checkout process simulation
        echo "\n🧪 Testing checkout process...\n";
        
        try {
            // Test orders table structure
            $stmt = $pdo->prepare("SELECT * FROM orders LIMIT 1");
            $stmt->execute();
            echo "✅ Orders table accessible\n";
        } catch (PDOException $e) {
            echo "❌ Orders table error: " . $e->getMessage() . "\n";
        }
        
        try {
            // Test order_items table structure  
            $stmt = $pdo->prepare("SELECT * FROM order_items LIMIT 1");
            $stmt->execute();
            echo "✅ Order items table accessible\n";
        } catch (PDOException $e) {
            echo "❌ Order items table error: " . $e->getMessage() . "\n";
        }
        
        try {
            // Test shipping_addresses table structure
            $stmt = $pdo->prepare("SELECT * FROM shipping_addresses LIMIT 1");
            $stmt->execute();
            echo "✅ Shipping addresses table accessible\n";
        } catch (PDOException $e) {
            echo "❌ Shipping addresses table error: " . $e->getMessage() . "\n";
        }
        
        try {
            // Test payment_info table structure
            $stmt = $pdo->prepare("SELECT * FROM payment_info LIMIT 1");
            $stmt->execute();
            echo "✅ Payment info table accessible\n";
        } catch (PDOException $e) {
            echo "❌ Payment info table error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✅ Checkout database test completed!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "🔧 Please check your database credentials in Hostinger control panel.\n";
}
?>
