<?php
/**
 * INSTANT FIX - Activate All Products
 * Double-click this file to run it
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "\n";
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║           INSTANT DASHBOARD FIX                        ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
    echo "\n";

    // Check current status
    echo "🔍 Checking current status...\n\n";

    $stmt = $db->query("
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN is_active = 0 OR is_active IS NULL THEN 1 ELSE 0 END) as inactive
        FROM products
    ");
    $status = $stmt->fetch();

    echo "Products in database:\n";
    echo "  Total: {$status['total']}\n";
    echo "  Active (is_active=1): {$status['active']}\n";
    echo "  Inactive (is_active=0 or NULL): {$status['inactive']}\n\n";

    if ($status['inactive'] > 0) {
        echo "⚠️  PROBLEM DETECTED!\n";
        echo "   Dashboard shows: {$status['active']} products\n";
        echo "   But you have: {$status['total']} products\n\n";

        echo "🔧 FIXING NOW...\n";

        // Fix it
        $stmt = $db->exec("UPDATE products SET is_active = 1 WHERE is_active != 1 OR is_active IS NULL");

        echo "✅ FIXED!\n\n";

        // Check again
        $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
        $activeNow = $stmt->fetch()['total'];

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "✅ SUCCESS!\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        echo "Dashboard will now show: $activeNow products\n\n";

    } else {
        echo "✅ All products are already active!\n";
        echo "   Dashboard should show: {$status['active']} products\n\n";
    }

    // Check users
    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $users = $stmt->fetch()['total'];

    // Check orders
    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $orders = $stmt->fetch()['total'];

    // Check revenue
    $stmt = $db->query("SELECT SUM(total_price) as total FROM orders WHERE status IN ('delivered', 'shipped', 'processing')");
    $revenue = $stmt->fetch()['total'] ?? 0;

    echo "📊 Expected Dashboard Values:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "  Total Products: " . ($status['total']) . "\n";
    echo "  Total Users: $users\n";
    echo "  Total Orders: $orders\n";
    echo "  Total Revenue: ₹" . number_format($revenue, 2) . "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    if ($orders == 0) {
        echo "⚠️  No orders in database!\n";
        echo "   Run 'php seed_sample_data.php' to add sample orders\n\n";
    }

    echo "🎯 NEXT STEP:\n";
    echo "   Refresh your browser: http://localhost:5173/admin\n";
    echo "   Dashboard should now show correct numbers!\n\n";

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n\n";
    echo "Make sure:\n";
    echo "1. Database credentials are correct in php-backend/config/database.php\n";
    echo "2. Database server is running\n\n";
}

echo "Press Enter to close...";
fgets(STDIN);
