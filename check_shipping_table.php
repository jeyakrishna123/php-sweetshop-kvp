<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "📊 Shipping Addresses Table Structure:\n\n";
$stmt = $db->query('DESCRIBE shipping_addresses');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($columns as $col) {
    echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
}

echo "\n📦 Records for Order #37:\n";
$stmt = $db->query("SELECT * FROM shipping_addresses WHERE order_id = 37");
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Count: " . count($records) . "\n";
if (!empty($records)) {
    print_r($records[0]);
}
