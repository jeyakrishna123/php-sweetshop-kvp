<?php
/**
 * Check Dashboard Counts
 * This script verifies the actual counts in the database
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "=== DATABASE COUNTS CHECK ===\n\n";

    // Check active products
    $stmt = $db->query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    $activeProducts = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Active Products: {$activeProducts}\n";

    // Check total orders
    $stmt = $db->query('SELECT COUNT(*) as count FROM orders');
    $totalOrders = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Total Orders: {$totalOrders}\n";

    // Check total users
    $stmt = $db->query('SELECT COUNT(*) as count FROM users');
    $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Total Users: {$totalUsers}\n";

    // Check orders by status
    echo "\n=== ORDERS BY STATUS ===\n";
    $stmt = $db->query("
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
    ");
    $orderStatuses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($orderStatuses as $status) {
        echo "  {$status['status']}: {$status['count']}\n";
    }

    // Check revenue
    $stmt = $db->query("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    echo "\n✓ Total Revenue: ₹{$totalRevenue}\n";

    // Check low stock products
    $stmt = $db->query("
        SELECT COUNT(*) as count
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $lowStock = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Low Stock Products: {$lowStock}\n";

    // Check out of stock products
    $stmt = $db->query("
        SELECT COUNT(*) as count
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $outOfStock = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Out of Stock Products: {$outOfStock}\n";

    echo "\n=== DATABASE CHECK COMPLETE ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
