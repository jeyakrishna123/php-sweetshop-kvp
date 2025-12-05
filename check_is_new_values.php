<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 Checking is_new values for recent products...\n\n";

$stmt = $db->query('SELECT id, name, is_new, is_active FROM products ORDER BY created_at DESC LIMIT 10');
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($products as $product) {
    $isNewIcon = $product['is_new'] ? '✅' : '❌';
    $isActiveIcon = $product['is_active'] ? '✅' : '❌';
    echo "ID: " . $product['id'] . " | " . $product['name'] . "\n";
    echo "  is_new: " . $isNewIcon . " (" . $product['is_new'] . ")\n";
    echo "  is_active: " . $isActiveIcon . " (" . $product['is_active'] . ")\n";
    echo "---\n";
}
