<?php
require_once 'php-backend/config/database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->query('SELECT id, name, category, is_active, created_at FROM products ORDER BY created_at DESC');
$products = $stmt->fetchAll();

echo "📊 ALL PRODUCTS IN DATABASE:\n";
echo str_repeat("=", 80) . "\n\n";
echo sprintf("Total products: %d\n\n", count($products));

foreach ($products as $product) {
    $status = $product['is_active'] ? '✅ ACTIVE' : '❌ INACTIVE';
    echo sprintf(
        "ID: %-3d | %s | %-40s | %-20s | %s\n",
        $product['id'],
        $status,
        substr($product['name'], 0, 40),
        $product['category'],
        $product['created_at']
    );
}
