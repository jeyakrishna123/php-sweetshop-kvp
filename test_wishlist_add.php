<?php
/**
 * Test script to debug wishlist add functionality
 */

require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

// Test 1: Check if products exist
echo "=== TEST 1: Check Products ===\n";
$stmt = $db->prepare("SELECT id, name, is_active FROM products LIMIT 5");
$stmt->execute();
$products = $stmt->fetchAll();

echo "Found " . count($products) . " products:\n";
foreach ($products as $product) {
    echo "  ID: {$product['id']}, Name: {$product['name']}, Active: {$product['is_active']}\n";
}

// Test 2: Check if users exist
echo "\n=== TEST 2: Check Users ===\n";
$stmt = $db->prepare("SELECT id, name, email FROM users LIMIT 3");
$stmt->execute();
$users = $stmt->fetchAll();

echo "Found " . count($users) . " users:\n";
foreach ($users as $user) {
    echo "  ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}\n";
}

// Test 3: Check wishlist table structure
echo "\n=== TEST 3: Wishlist Table Structure ===\n";
$stmt = $db->query("DESCRIBE wishlist");
$columns = $stmt->fetchAll();

echo "Wishlist table columns:\n";
foreach ($columns as $column) {
    echo "  {$column['Field']} ({$column['Type']}) - Null: {$column['Null']}, Key: {$column['Key']}\n";
}

// Test 4: Check existing wishlist entries
echo "\n=== TEST 4: Existing Wishlist Entries ===\n";
$stmt = $db->prepare("SELECT w.*, u.name as user_name, p.name as product_name
                      FROM wishlist w
                      LEFT JOIN users u ON w.user_id = u.id
                      LEFT JOIN products p ON w.product_id = p.id
                      LIMIT 5");
$stmt->execute();
$wishlistItems = $stmt->fetchAll();

echo "Found " . count($wishlistItems) . " wishlist entries:\n";
foreach ($wishlistItems as $item) {
    echo "  User: {$item['user_name']}, Product: {$item['product_name']}\n";
}

echo "\n=== All tests complete ===\n";
