<?php
require_once __DIR__ . '/backend/config/database.php';

echo "🔍 CHECKING PRODUCTS TABLE SCHEMA\n";
echo "==================================\n\n";

try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful!\n\n";
    
    // Check products table structure
    echo "📋 Products table columns:\n";
    $stmt = $db->query("DESCRIBE products");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
    }
    
    echo "\n📊 Products count: ";
    $stmt = $db->query("SELECT COUNT(*) FROM products");
    $count = $stmt->fetchColumn();
    echo $count . "\n";
    
    if ($count > 0) {
        echo "\n📝 Sample product data:\n";
        $stmt = $db->query("SELECT id, name, price, stock, is_bestseller FROM products LIMIT 3");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($products as $product) {
            echo "- ID: {$product['id']}, Name: {$product['name']}, Price: {$product['price']}, Stock: {$product['stock']}, Bestseller: {$product['is_bestseller']}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
