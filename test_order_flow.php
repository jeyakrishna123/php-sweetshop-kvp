<?php
/**
 * Test script to verify order creation and retrieval flow
 * Run this to check if orders are being created and retrieved correctly
 */

require_once __DIR__ . '/hostinger_upload/backend/config/database.php';
require_once __DIR__ . '/hostinger_upload/backend/includes/helpers.php';

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();

    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit();
    }

    $results = [];

    // 1. Check total orders in database
    $countStmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    $results['total_orders_in_db'] = $totalOrders;

    // 2. Get last 5 orders
    $ordersStmt = $db->query("
        SELECT id, tracking_number, status, total_price, created_at, user_id
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $recentOrders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    $results['recent_orders'] = $recentOrders;

    // 3. Check order items for first order
    if (!empty($recentOrders)) {
        $firstOrderId = $recentOrders[0]['id'];
        $itemsStmt = $db->prepare("SELECT COUNT(*) as total FROM order_items WHERE order_id = ?");
        $itemsStmt->execute([$firstOrderId]);
        $itemsCount = $itemsStmt->fetch(PDO::FETCH_ASSOC)['total'];
        $results['first_order_items_count'] = $itemsCount;
        $results['first_order_id'] = $firstOrderId;
    }

    // 4. Check if orders have shipping addresses
    $shippingStmt = $db->query("
        SELECT COUNT(*) as total FROM shipping_addresses
    ");
    $shippingCount = $shippingStmt->fetch(PDO::FETCH_ASSOC)['total'];
    $results['shipping_addresses_count'] = $shippingCount;

    // 5. Check if orders have payment info
    $paymentStmt = $db->query("
        SELECT COUNT(*) as total FROM payment_info
    ");
    $paymentCount = $paymentStmt->fetch(PDO::FETCH_ASSOC)['total'];
    $results['payment_info_count'] = $paymentCount;

    echo json_encode([
        'success' => true,
        'message' => 'Order flow check completed',
        'results' => $results
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
