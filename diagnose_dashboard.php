<?php
/**
 * Complete Dashboard Diagnostic Tool
 * Checks everything related to dashboard statistics
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "\n";
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║     ADMIN DASHBOARD DIAGNOSTIC TOOL                    ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
    echo "\n";

    // 1. Check Products
    echo "📦 PRODUCTS\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $totalProducts = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeProducts = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 0 OR is_active IS NULL");
    $inactiveProducts = $stmt->fetch()['total'];

    echo "Total in Database: $totalProducts\n";
    echo "Active (is_active=1): $activeProducts\n";
    echo "Inactive (is_active=0 or NULL): $inactiveProducts\n";

    if ($activeProducts === 0 && $totalProducts > 0) {
        echo "\n⚠️  WARNING: You have products but they're marked as inactive!\n";
        echo "   Dashboard query: SELECT COUNT(*) FROM products WHERE is_active = 1\n";
        echo "   This returns: 0\n\n";
        echo "💡 FIX: Run 'php activate_all_products.php'\n";
    } elseif ($activeProducts > 0) {
        echo "\n✅ Products are active. Dashboard should show: $activeProducts\n";
    } else {
        echo "\n❌ No products in database. Run 'php seed_sample_data.php'\n";
    }

    // 2. Check Users
    echo "\n\n👥 USERS\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'admin'");
    $adminUsers = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    $normalUsers = $stmt->fetch()['total'];

    echo "Total Users: $totalUsers\n";
    echo "Admin Users: $adminUsers\n";
    echo "Normal Users: $normalUsers\n";

    if ($totalUsers === 0) {
        echo "\n❌ No users in database. Run 'php seed_sample_data.php'\n";
    } else {
        echo "\n✅ Dashboard should show: $totalUsers users\n";
    }

    // 3. Check Orders
    echo "\n\n📦 ORDERS\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
    FROM orders");
    $ordersByStatus = $stmt->fetch();

    echo "Total Orders: $totalOrders\n";
    echo "Pending: " . ($ordersByStatus['pending'] ?? 0) . "\n";
    echo "Processing: " . ($ordersByStatus['processing'] ?? 0) . "\n";
    echo "Shipped: " . ($ordersByStatus['shipped'] ?? 0) . "\n";
    echo "Delivered: " . ($ordersByStatus['delivered'] ?? 0) . "\n";

    if ($totalOrders === 0) {
        echo "\n❌ No orders in database. Run 'php seed_sample_data.php'\n";
    } else {
        echo "\n✅ Dashboard should show: $totalOrders orders\n";
    }

    // 4. Check Revenue
    echo "\n\n💰 REVENUE\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $totalRevenue = $stmt->fetch()['total'] ?? 0;

    echo "Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n";

    if ($totalRevenue === 0) {
        echo "\n❌ No revenue (no completed orders). Run 'php seed_sample_data.php'\n";
    } else {
        echo "\n✅ Dashboard should show: ₹" . number_format($totalRevenue, 2) . "\n";
    }

    // 5. Check Inventory
    echo "\n\n📊 INVENTORY\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $lowStock = $stmt->fetch()['total'];

    $stmt = $db->query("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $outOfStock = $stmt->fetch()['total'];

    echo "Low Stock (≤5 units): $lowStock\n";
    echo "Out of Stock (0 units): $outOfStock\n";

    // 6. Simulate Dashboard API Response
    echo "\n\n🎯 EXPECTED DASHBOARD API RESPONSE\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "GET /api/admin/dashboard?dateRange=all\n\n";
    echo "{\n";
    echo "  \"success\": true,\n";
    echo "  \"stats\": {\n";
    echo "    \"totalUsers\": $totalUsers,\n";
    echo "    \"totalProducts\": $activeProducts,\n";
    echo "    \"totalOrders\": $totalOrders,\n";
    echo "    \"totalRevenue\": $totalRevenue,\n";
    echo "    \"pendingOrders\": " . ($ordersByStatus['pending'] ?? 0) . ",\n";
    echo "    \"processingOrders\": " . ($ordersByStatus['processing'] ?? 0) . ",\n";
    echo "    \"shippedOrders\": " . ($ordersByStatus['shipped'] ?? 0) . ",\n";
    echo "    \"deliveredOrders\": " . ($ordersByStatus['delivered'] ?? 0) . ",\n";
    echo "    \"lowStockProducts\": $lowStock,\n";
    echo "    \"outOfStockProducts\": $outOfStock\n";
    echo "  }\n";
    echo "}\n";

    // 7. Overall Status
    echo "\n\n📋 OVERALL STATUS\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $issues = [];

    if ($activeProducts === 0 && $totalProducts > 0) {
        $issues[] = "❌ Products exist but marked as inactive";
    } elseif ($totalProducts === 0) {
        $issues[] = "❌ No products in database";
    }

    if ($totalUsers === 0) {
        $issues[] = "❌ No users in database";
    }

    if ($totalOrders === 0) {
        $issues[] = "❌ No orders in database";
    }

    if (empty($issues)) {
        echo "✅ Database has data - Dashboard should show numbers!\n\n";
        echo "If dashboard still shows zeros:\n";
        echo "1. ✅ Check backend is running: php -S localhost:8000 -t php-backend/\n";
        echo "2. ✅ Check you're logged in as admin\n";
        echo "3. ✅ Check browser console (F12) for errors\n";
        echo "4. ✅ Test API directly: http://localhost:8000/api/admin/dashboard\n";
    } else {
        echo "⚠️  Issues Found:\n";
        foreach ($issues as $issue) {
            echo "   $issue\n";
        }
        echo "\n💡 SOLUTIONS:\n";

        if ($activeProducts === 0 && $totalProducts > 0) {
            echo "   • Activate products: php activate_all_products.php\n";
        }

        if ($totalProducts === 0 || $totalUsers === 0 || $totalOrders === 0) {
            echo "   • Add sample data: php seed_sample_data.php\n";
        }
    }

    echo "\n";
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║     END OF DIAGNOSTIC                                  ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
    echo "\n";

} catch (Exception $e) {
    echo "\n❌ Database Error: " . $e->getMessage() . "\n";
    echo "\nCheck your database configuration in php-backend/config/database.php\n\n";
}
