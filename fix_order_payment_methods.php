<?php
/**
 * Fix Payment Methods for Existing Orders
 * This script updates all orders with empty payment methods to "Cash On Delivery"
 */

require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "=== Fixing Payment Methods for Existing Orders ===\n\n";

// Find all orders with empty payment methods
$stmt = $db->query("
    SELECT pi.id, pi.order_id, pi.method, o.tracking_number
    FROM payment_info pi
    JOIN orders o ON pi.order_id = o.id
    WHERE pi.method IS NULL OR pi.method = ''
");

$emptyPayments = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($emptyPayments)) {
    echo "✅ No orders with empty payment methods found!\n";
    exit(0);
}

echo "Found " . count($emptyPayments) . " orders with empty payment methods:\n\n";

foreach ($emptyPayments as $payment) {
    echo "Order #{$payment['order_id']} (Tracking: {$payment['tracking_number']}) - Payment ID: {$payment['id']}\n";
}

echo "\n";

// Update all empty payment methods to "Cash On Delivery"
$updateStmt = $db->prepare("
    UPDATE payment_info
    SET method = 'Cash On Delivery'
    WHERE method IS NULL OR method = ''
");

try {
    $updateStmt->execute();
    $updatedCount = $updateStmt->rowCount();

    echo "✅ Successfully updated $updatedCount payment methods to 'Cash On Delivery'\n\n";

    // Verify the fix
    $verifyStmt = $db->query("
        SELECT pi.id, pi.order_id, pi.method, o.tracking_number
        FROM payment_info pi
        JOIN orders o ON pi.order_id = o.id
        WHERE pi.order_id IN (" . implode(',', array_column($emptyPayments, 'order_id')) . ")
    ");

    $updated = $verifyStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Verification:\n";
    foreach ($updated as $payment) {
        echo "✅ Order #{$payment['order_id']} - Method: {$payment['method']}\n";
    }

} catch (Exception $e) {
    echo "❌ Error updating payment methods: " . $e->getMessage() . "\n";
}
