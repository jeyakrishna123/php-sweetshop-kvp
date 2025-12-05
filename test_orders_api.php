<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 Checking shipping_addresses table...\n";
$stmt = $db->query("SHOW TABLES LIKE 'shipping_addresses'");
if ($stmt->rowCount() > 0) {
    echo "✅ Table exists\n";
    $count = $db->query("SELECT COUNT(*) FROM shipping_addresses")->fetchColumn();
    echo "   Records: $count\n\n";
} else {
    echo "❌ Table does NOT exist\n\n";
}

echo "🔍 Checking payment_info table...\n";
$stmt = $db->query("SHOW TABLES LIKE 'payment_info'");
if ($stmt->rowCount() > 0) {
    echo "✅ Table exists\n";
    $count = $db->query("SELECT COUNT(*) FROM payment_info")->fetchColumn();
    echo "   Records: $count\n\n";
} else {
    echo "❌ Table does NOT exist\n\n";
}

echo "🔍 Checking orders without joins...\n";
$stmt = $db->query("SELECT COUNT(*) FROM orders");
echo "Total orders: " . $stmt->fetchColumn() . "\n\n";

echo "🔍 Testing the actual getAllOrders query...\n";
try {
    $stmt = $db->prepare("
        SELECT o.*, u.name as user_name, u.email as user_email,
               sa.name as shipping_name, sa.phone, sa.city, sa.state,
               pi.status as payment_status, pi.method as payment_method
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
        LEFT JOIN payment_info pi ON o.id = pi.order_id
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "✅ Query executed successfully\n";
    echo "   Orders returned: " . count($orders) . "\n";
    if (count($orders) > 0) {
        echo "\nFirst order:\n";
        print_r($orders[0]);
    }
} catch (Exception $e) {
    echo "❌ Query failed: " . $e->getMessage() . "\n";
}
