<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "=== Checking Order #37 ===\n\n";

// Check order details
$stmt = $db->prepare("SELECT * FROM orders WHERE id = 37");
$stmt->execute();
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if ($order) {
    echo "Order found:\n";
    echo json_encode($order, JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "Order #37 not found!\n\n";
}

// Check shipping address
$stmt = $db->prepare("SELECT * FROM shipping_addresses WHERE order_id = 37");
$stmt->execute();
$address = $stmt->fetch(PDO::FETCH_ASSOC);

if ($address) {
    echo "Shipping Address:\n";
    echo json_encode($address, JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "No shipping address found for order #37\n\n";
}

// Check payment info
$stmt = $db->prepare("SELECT * FROM payment_info WHERE order_id = 37");
$stmt->execute();
$payment = $stmt->fetch(PDO::FETCH_ASSOC);

if ($payment) {
    echo "Payment Info:\n";
    echo json_encode($payment, JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "No payment info found for order #37\n\n";
}

// Check order items
$stmt = $db->prepare("SELECT * FROM order_items WHERE order_id = 37");
$stmt->execute();
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($items) {
    echo "Order Items (" . count($items) . "):\n";
    echo json_encode($items, JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "No items found for order #37\n\n";
}

// Check user info
if ($order && $order['user_id']) {
    $stmt = $db->prepare("SELECT id, name, email, phone FROM users WHERE id = ?");
    $stmt->execute([$order['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "User Info:\n";
        echo json_encode($user, JSON_PRETTY_PRINT) . "\n\n";
    } else {
        echo "User not found for user_id: {$order['user_id']}\n\n";
    }
}
