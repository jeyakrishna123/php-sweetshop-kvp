<?php
/**
 * Test Dashboard Data - Check if database has data
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "=== DATABASE DIAGNOSTIC ===\n\n";

    // Check products
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products");
    $stmt->execute();
    $productCount = $stmt->fetch()['total'];
    echo "📦 Total Products: $productCount\n";

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $activeProductCount = $stmt->fetch()['total'];
    echo "✅ Active Products: $activeProductCount\n\n";

    // Check users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $userCount = $stmt->fetch()['total'];
    echo "👥 Total Users: $userCount\n";

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'admin'");
    $stmt->execute();
    $adminCount = $stmt->fetch()['total'];
    echo "🔑 Admin Users: $adminCount\n\n";

    // Check orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
    $stmt->execute();
    $orderCount = $stmt->fetch()['total'];
    echo "📋 Total Orders: $orderCount\n";

    if ($orderCount > 0) {
        // Check orders by status
        $stmt = $db->prepare("
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        ");
        $stmt->execute();
        $ordersByStatus = $stmt->fetchAll();

        echo "\nOrders by Status:\n";
        foreach ($ordersByStatus as $row) {
            echo "  - {$row['status']}: {$row['count']}\n";
        }

        // Check revenue
        $stmt = $db->prepare("
            SELECT SUM(total_price) as total
            FROM orders
            WHERE status IN ('delivered', 'shipped', 'processing')
        ");
        $stmt->execute();
        $revenue = $stmt->fetch()['total'] ?? 0;
        echo "\n💰 Total Revenue: ₹" . number_format($revenue, 2) . "\n";
    }

    // Check low stock and out of stock
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $stmt->execute();
    $lowStock = $stmt->fetch()['total'];
    echo "\n⚠️ Low Stock Products (≤5 units): $lowStock\n";

    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $stmt->execute();
    $outOfStock = $stmt->fetch()['total'];
    echo "❌ Out of Stock Products: $outOfStock\n";

    // Check sample products
    echo "\n=== SAMPLE PRODUCTS ===\n";
    $stmt = $db->prepare("SELECT id, name, stock, is_active FROM products LIMIT 5");
    $stmt->execute();
    $sampleProducts = $stmt->fetchAll();

    foreach ($sampleProducts as $product) {
        $activeStatus = $product['is_active'] ? '✅' : '❌';
        echo "{$product['id']}: {$product['name']} | Stock: {$product['stock']} | Active: $activeStatus\n";
    }

    echo "\n=== DATABASE CONNECTION SUCCESSFUL ===\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
