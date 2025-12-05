<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "📊 Checking recent orders in database...\n\n";

// Get all orders
$stmt = $db->query('SELECT id, user_id, total_price, status, payment_method, created_at FROM orders ORDER BY id DESC LIMIT 10');
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total orders found: " . count($orders) . "\n\n";

foreach ($orders as $order) {
    echo "Order ID: " . $order['id'] . "\n";
    echo "User ID: " . $order['user_id'] . "\n";
    echo "Total: ₹" . $order['total_price'] . "\n";
    echo "Status: " . $order['status'] . "\n";
    echo "Payment: " . $order['payment_method'] . "\n";
    echo "Created: " . $order['created_at'] . "\n";
    echo "---\n";
}

// Get order items for latest order
if (!empty($orders)) {
    $latestOrderId = $orders[0]['id'];
    echo "\n📦 Items in Order #$latestOrderId:\n\n";

    $itemStmt = $db->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $itemStmt->execute([$latestOrderId]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($items as $item) {
        echo "- " . $item['name'] . " x" . $item['quantity'] . " @ ₹" . $item['price'] . "\n";
    }
}
