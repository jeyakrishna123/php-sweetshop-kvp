<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 Complete Order #37 Data:\n\n";

// Order Items
echo "📦 Order Items:\n";
$stmt = $db->query("SELECT * FROM order_items WHERE order_id = 37");
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Count: " . count($items) . "\n\n";
foreach ($items as $item) {
    echo "- ID: " . $item['id'] . "\n";
    echo "  Product ID: " . $item['product_id'] . "\n";
    echo "  Name: " . $item['name'] . "\n";
    echo "  Quantity: " . $item['quantity'] . "\n";
    echo "  Price: ₹" . $item['price'] . "\n";
    echo "---\n";
}

// Payment Info
echo "\n💳 Payment Info:\n";
$stmt = $db->query("SELECT * FROM payment_info WHERE order_id = 37");
$payment = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Count: " . count($payment) . "\n";
if (!empty($payment)) {
    print_r($payment[0]);
}

// Full order with joins
echo "\n📋 Full Order Data (as API returns):\n";
$stmt = $db->prepare("
    SELECT o.*, 
           u.name as user_name, u.email as user_email, u.phone as user_phone,
           sa.name as shipping_name, sa.phone as shipping_phone, sa.city, sa.state,
           pi.status as payment_status, pi.method as payment_method
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
    LEFT JOIN payment_info pi ON o.id = pi.order_id
    WHERE o.id = 37
");
$stmt->execute();
$order = $stmt->fetch(PDO::FETCH_ASSOC);

echo "User Name: " . ($order['user_name'] ?? 'NULL') . "\n";
echo "User Email: " . ($order['user_email'] ?? 'NULL') . "\n";
echo "User Phone: " . ($order['user_phone'] ?? 'NULL') . "\n";
echo "Shipping Name: " . ($order['shipping_name'] ?? 'NULL') . "\n";
echo "Shipping Phone: " . ($order['shipping_phone'] ?? 'NULL') . "\n";
echo "Payment Status: " . ($order['payment_status'] ?? 'NULL') . "\n";
echo "Payment Method: " . ($order['payment_method'] ?? 'NULL') . "\n";
echo "Created At: " . $order['created_at'] . "\n";
