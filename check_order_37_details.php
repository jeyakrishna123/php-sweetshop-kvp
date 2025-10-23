<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 Checking Order #37 details...\n\n";

// Get order with all related data
$stmt = $db->prepare("
    SELECT o.*, 
           u.name as user_name, u.email as user_email, u.phone as user_phone,
           sa.name as shipping_name, sa.phone as shipping_phone, sa.address, sa.city, sa.state, sa.pincode,
           pi.status as payment_status, pi.method as payment_method
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
    LEFT JOIN payment_info pi ON o.id = pi.order_id
    WHERE o.id = 37
");
$stmt->execute();
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if ($order) {
    echo "Order Details:\n";
    echo "ID: " . $order['id'] . "\n";
    echo "Tracking: " . $order['tracking_number'] . "\n";
    echo "User ID: " . $order['user_id'] . "\n";
    echo "User Name: " . ($order['user_name'] ?? 'NULL') . "\n";
    echo "User Email: " . ($order['user_email'] ?? 'NULL') . "\n";
    echo "User Phone: " . ($order['user_phone'] ?? 'NULL') . "\n";
    echo "Shipping Name: " . ($order['shipping_name'] ?? 'NULL') . "\n";
    echo "Shipping Phone: " . ($order['shipping_phone'] ?? 'NULL') . "\n";
    echo "City: " . ($order['city'] ?? 'NULL') . "\n";
    echo "State: " . ($order['state'] ?? 'NULL') . "\n";
    echo "Payment Status: " . ($order['payment_status'] ?? 'NULL') . "\n";
    echo "Payment Method: " . ($order['payment_method'] ?? 'NULL') . "\n";
    echo "Created: " . $order['created_at'] . "\n";
    echo "Total: ₹" . $order['total_price'] . "\n\n";
} else {
    echo "Order #37 not found!\n\n";
}

// Get order items
echo "📦 Order Items:\n\n";
$itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = 37");
$itemStmt->execute();
$items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

if (!empty($items)) {
    foreach ($items as $item) {
        echo "- Product ID: " . $item['product_id'] . "\n";
        echo "  Name: " . $item['name'] . "\n";
        echo "  Quantity: " . $item['quantity'] . "\n";
        echo "  Price: ₹" . $item['price'] . "\n";
        echo "  Image: " . ($item['image'] ?? 'NULL') . "\n";
        echo "---\n";
    }
} else {
    echo "No items found for this order!\n";
}

// Check shipping_addresses table
echo "\n🏠 Shipping Address Records:\n";
$saStmt = $db->query("SELECT * FROM shipping_addresses WHERE order_id = 37");
$shippingAddresses = $saStmt->fetchAll(PDO::FETCH_ASSOC);
echo "Count: " . count($shippingAddresses) . "\n";
if (!empty($shippingAddresses)) {
    print_r($shippingAddresses[0]);
}

// Check payment_info table
echo "\n💳 Payment Info Records:\n";
$piStmt = $db->query("SELECT * FROM payment_info WHERE order_id = 37");
$paymentInfo = $piStmt->fetchAll(PDO::FETCH_ASSOC);
echo "Count: " . count($paymentInfo) . "\n";
if (!empty($paymentInfo)) {
    print_r($paymentInfo[0]);
}
