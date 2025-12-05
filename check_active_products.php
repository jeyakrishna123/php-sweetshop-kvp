<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 Checking product activity status...\\n\\n";

$stmt = $db->query('SELECT COUNT(*) as total, SUM(is_active) as active_count FROM products');
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Total products: " . $result['total'] . "\n";
echo "Active products: " . ($result['active_count'] ?? 0) . "\n";
echo "Inactive products: " . ($result['total'] - ($result['active_count'] ?? 0)) . "\n\n";

// Show first 10 products with their status
echo "📦 First 10 products:\n\n";
$stmt = $db->query('SELECT id, name, is_active FROM products LIMIT 10');
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($products as $product) {
    $status = $product['is_active'] ? '✅ ACTIVE' : '❌ INACTIVE';
    echo "ID: " . $product['id'] . " | " . $product['name'] . " | " . $status . "\n";
}
