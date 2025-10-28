<?php
/**
 * Test Specific Checkout Database Operations
 * Test the exact database operations that happen during checkout
 */

// Test database connection with production credentials
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

echo "🔍 Testing Checkout Database Operations...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n\n";
    
    // Test 1: Check if orders table has all required columns
    echo "🧪 Testing Orders Table Structure...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE orders");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'user_id', 'tracking_number', 'status', 'items_price', 
            'tax_price', 'shipping_price', 'discount_amount', 'total_price', 
            'currency', 'coupon_code', 'coupon_discount', 'coupon_type', 
            'customer_notes', 'shipping_method', 'is_gift', 'gift_message'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Orders table has all required columns\n";
        } else {
            echo "❌ Orders table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking orders table: " . $e->getMessage() . "\n";
    }
    
    // Test 2: Check if order_items table has all required columns
    echo "\n🧪 Testing Order Items Table Structure...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE order_items");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'order_id', 'product_id', 'name', 'quantity', 'price', 
            'original_price', 'discount', 'image', 'sku', 'weight'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Order items table has all required columns\n";
        } else {
            echo "❌ Order items table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking order_items table: " . $e->getMessage() . "\n";
    }
    
    // Test 3: Check if shipping_addresses table exists and has required columns
    echo "\n🧪 Testing Shipping Addresses Table...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE shipping_addresses");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'order_id', 'name', 'phone', 'address', 'city', 
            'state', 'postal_code', 'country'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Shipping addresses table has all required columns\n";
        } else {
            echo "❌ Shipping addresses table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking shipping_addresses table: " . $e->getMessage() . "\n";
    }
    
    // Test 4: Check if payment_info table exists and has required columns
    echo "\n🧪 Testing Payment Info Table...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE payment_info");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'order_id', 'payment_id', 'status', 'method', 'transaction_id'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Payment info table has all required columns\n";
        } else {
            echo "❌ Payment info table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking payment_info table: " . $e->getMessage() . "\n";
    }
    
    // Test 5: Check if order_status_history table exists
    echo "\n🧪 Testing Order Status History Table...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE order_status_history");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'order_id', 'status', 'note', 'created_at'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Order status history table has all required columns\n";
        } else {
            echo "❌ Order status history table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking order_status_history table: " . $e->getMessage() . "\n";
    }
    
    // Test 6: Check if users table has required columns for checkout
    echo "\n🧪 Testing Users Table for Checkout...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE users");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'total_orders', 'total_spent', 'last_order_date'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Users table has all required columns for checkout\n";
        } else {
            echo "❌ Users table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking users table: " . $e->getMessage() . "\n";
    }
    
    // Test 7: Check if products table has required columns for checkout
    echo "\n🧪 Testing Products Table for Checkout...\n";
    try {
        $stmt = $pdo->prepare("DESCRIBE products");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $requiredColumns = [
            'id', 'stock', 'sold_count', 'thumbnail', 'images'
        ];
        
        $existingColumns = array_column($columns, 'Field');
        $missingColumns = array_diff($requiredColumns, $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Products table has all required columns for checkout\n";
        } else {
            echo "❌ Products table missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error checking products table: " . $e->getMessage() . "\n";
    }
    
    echo "\n✅ Checkout database test completed!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "🔧 Please check your database credentials in Hostinger control panel.\n";
}
?>
