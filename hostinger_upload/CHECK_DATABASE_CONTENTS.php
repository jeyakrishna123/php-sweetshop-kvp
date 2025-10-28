<?php
/**
 * CHECK DATABASE CONTENTS - See what's actually in the database
 */

// Database connection
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connected!\n\n";
    
    // Check products table
    echo "🔍 CHECKING PRODUCTS TABLE:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM products");
    $total = $stmt->fetch()['total'];
    echo "📊 Total products: $total\n\n";
    
    if ($total > 0) {
        echo "📋 PRODUCTS IN DATABASE:\n";
        $stmt = $pdo->query("SELECT id, name, slug, price, is_active, is_featured, is_bestseller, is_new FROM products ORDER BY id LIMIT 10");
        $products = $stmt->fetchAll();
        
        foreach ($products as $product) {
            echo "ID: {$product['id']} | Name: {$product['name']} | Slug: {$product['slug']} | Price: ₹{$product['price']} | Active: {$product['is_active']} | Featured: {$product['is_featured']} | Bestseller: {$product['is_bestseller']} | New: {$product['is_new']}\n";
        }
        
        if ($total > 10) {
            echo "... and " . ($total - 10) . " more products\n";
        }
    } else {
        echo "✅ Products table is empty\n";
    }
    
    echo "\n🔍 CHECKING CATEGORIES TABLE:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM categories");
    $total = $stmt->fetch()['total'];
    echo "📊 Total categories: $total\n";
    
    if ($total > 0) {
        $stmt = $pdo->query("SELECT id, name, slug FROM categories LIMIT 5");
        $categories = $stmt->fetchAll();
        foreach ($categories as $category) {
            echo "ID: {$category['id']} | Name: {$category['name']} | Slug: {$category['slug']}\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
