<?php
/**
 * Test Dashboard with Mock Auth
 * This simulates an authenticated admin request
 */

// Set up environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/admin/dashboard';
$_GET['dateRange'] = 'all';

// Mock authentication by setting a session or bypassing auth
// We'll need to temporarily modify the auth check

echo "=== TESTING DASHBOARD API (BYPASSING AUTH) ===\n\n";

// Include required files
require_once __DIR__ . '/php-backend/config/database.php';
require_once __DIR__ . '/php-backend/config/config.php';
require_once __DIR__ . '/php-backend/includes/helpers.php';

// Get database connection
$db = Database::getInstance()->getConnection();

// Manually call the dashboard function logic
try {
    // Get total users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];
    echo "Total Users Query: SELECT COUNT(*) FROM users\n";
    echo "Result: {$totalUsers}\n\n";

    // Get total products
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['total'];
    echo "Total Products Query: SELECT COUNT(*) FROM products WHERE is_active = 1\n";
    echo "Result: {$totalProducts}\n\n";

    // Get total orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE 1=1");
    $stmt->execute();
    $totalOrders = $stmt->fetch()['total'];
    echo "Total Orders Query: SELECT COUNT(*) FROM orders\n";
    echo "Result: {$totalOrders}\n\n";

    // Get total revenue
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute();
    $totalRevenue = $stmt->fetch()['total'] ?? 0;
    echo "Total Revenue Query: SELECT SUM(total_price) FROM orders WHERE status IN (...)\n";
    echo "Result: ₹{$totalRevenue}\n\n";

    // Get pending orders
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM orders
        WHERE status = 'pending'
    ");
    $stmt->execute();
    $pendingOrders = $stmt->fetch()['total'];
    echo "Pending Orders: {$pendingOrders}\n";

    // Get processing orders
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM orders
        WHERE status = 'processing'
    ");
    $stmt->execute();
    $processingOrders = $stmt->fetch()['total'];
    echo "Processing Orders: {$processingOrders}\n";

    // Get shipped orders
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM orders
        WHERE status = 'shipped'
    ");
    $stmt->execute();
    $shippedOrders = $stmt->fetch()['total'];
    echo "Shipped Orders: {$shippedOrders}\n";

    // Get delivered orders
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM orders
        WHERE status = 'delivered'
    ");
    $stmt->execute();
    $deliveredOrders = $stmt->fetch()['total'];
    echo "Delivered Orders: {$deliveredOrders}\n\n";

    // Get low stock products
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $stmt->execute();
    $lowStockProducts = $stmt->fetch()['total'];
    echo "Low Stock Products: {$lowStockProducts}\n";

    // Get out of stock products
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $stmt->execute();
    $outOfStockProducts = $stmt->fetch()['total'];
    echo "Out of Stock Products: {$outOfStockProducts}\n\n";

    // Create the response structure
    $response = [
        'success' => true,
        'message' => 'Dashboard statistics retrieved successfully',
        'stats' => [
            'totalUsers' => (int)$totalUsers,
            'totalProducts' => (int)$totalProducts,
            'totalOrders' => (int)$totalOrders,
            'totalRevenue' => (float)$totalRevenue,
            'pendingOrders' => (int)$pendingOrders,
            'processingOrders' => (int)$processingOrders,
            'shippedOrders' => (int)$shippedOrders,
            'deliveredOrders' => (int)$deliveredOrders,
            'lowStockProducts' => (int)$lowStockProducts,
            'outOfStockProducts' => (int)$outOfStockProducts
        ]
    ];

    echo "=== JSON RESPONSE ===\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
