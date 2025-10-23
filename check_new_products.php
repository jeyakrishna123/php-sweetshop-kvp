<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 Checking for isNew/is_new field in products table...\n\n";

// Check table structure
$stmt = $db->query('DESCRIBE products');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

$hasIsNew = false;
foreach ($columns as $col) {
    if ($col['Field'] === 'is_new' || $col['Field'] === 'isNew') {
        echo "✅ Found column: " . $col['Field'] . " (" . $col['Type'] . ")\n";
        $hasIsNew = true;
    }
}

if (!$hasIsNew) {
    echo "❌ No is_new or isNew column found\n";
}

echo "\n📦 Recent products (created in last 30 days):\n\n";
$stmt = $db->query("SELECT id, name, created_at, DATEDIFF(NOW(), created_at) as days_old FROM products ORDER BY created_at DESC LIMIT 10");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($products as $product) {
    echo "ID: " . $product['id'] . "\n";
    echo "Name: " . $product['name'] . "\n";
    echo "Created: " . $product['created_at'] . "\n";
    echo "Days old: " . $product['days_old'] . " days\n";
    echo "---\n";
}
