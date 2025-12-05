<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "💳 Payment Info Table Structure:\n\n";
$stmt = $db->query('DESCRIBE payment_info');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $col) {
    echo "- " . $col['Field'] . " (" . $col['Type'] . ") " . ($col['Null'] == 'YES' ? 'NULL' : 'NOT NULL') . "\n";
}

echo "\n💳 Payment info for Order #37:\n";
$stmt = $db->query("SELECT * FROM payment_info WHERE order_id = 37");
$payment = $stmt->fetch(PDO::FETCH_ASSOC);
if ($payment) {
    foreach ($payment as $key => $value) {
        $displayValue = $value === null ? 'NULL' : ($value === '' ? '(empty string)' : $value);
        echo "$key: $displayValue\n";
    }
}
