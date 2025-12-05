<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "📊 Checking orders table structure...\n\n";

// Get table structure
$stmt = $db->query('DESCRIBE orders');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Orders table columns:\n";
foreach ($columns as $col) {
    echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
}

echo "\n📦 Checking recent orders...\n\n";

// Get all orders with only existing columns
$stmt = $db->query('SELECT * FROM orders ORDER BY id DESC LIMIT 5');
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total orders found: " . count($orders) . "\n\n";

foreach ($orders as $order) {
    echo "Order #" . $order['id'] . ":\n";
    echo json_encode($order, JSON_PRETTY_PRINT) . "\n";
    echo "---\n\n";
}
