<?php
/**
 * Complete Dashboard Fix
 * This script fixes all common dashboard issues in one go
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "\n";
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║     COMPLETE DASHBOARD FIX                             ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
    echo "\n";

    $issuesFixed = 0;

    // 1. Check and fix products
    echo "🔧 Step 1: Checking Products...\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $totalProducts = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeProducts = $stmt->fetch()['total'];

    echo "Total products in database: $totalProducts\n";
    echo "Active products (is_active=1): $activeProducts\n";

    if ($totalProducts > 0 && $activeProducts === 0) {
        echo "\n⚠️  Products exist but are marked as inactive!\n";
        echo "   Activating all products...\n";

        $stmt = $db->exec("UPDATE products SET is_active = 1 WHERE is_active != 1 OR is_active IS NULL");
        $issuesFixed++;

        $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
        $activeProducts = $stmt->fetch()['total'];

        echo "✅ Activated $activeProducts products\n";
    } elseif ($activeProducts > 0) {
        echo "✅ Products are already active\n";
    } else {
        echo "⚠️  No products in database - will add sample data\n";
    }

    // 2. Check users
    echo "\n🔧 Step 2: Checking Users...\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];

    echo "Total users: $totalUsers\n";

    if ($totalUsers === 0) {
        echo "⚠️  No users in database - will add sample data\n";
    } else {
        echo "✅ Users exist\n";
    }

    // 3. Check orders
    echo "\n🔧 Step 3: Checking Orders...\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $stmt->fetch()['total'];

    echo "Total orders: $totalOrders\n";

    if ($totalOrders === 0) {
        echo "⚠️  No orders in database - will add sample data\n";
    } else {
        echo "✅ Orders exist\n";
    }

    // 4. Add sample data if needed
    if ($totalProducts === 0 || $totalUsers === 0 || $totalOrders === 0) {
        echo "\n🌱 Step 4: Adding Sample Data...\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "Running seed_sample_data.php...\n\n";

        include __DIR__ . '/seed_sample_data.php';
        $issuesFixed++;
    }

    // 5. Show final statistics
    echo "\n\n📊 FINAL DASHBOARD STATISTICS:\n";
    echo "╔════════════════════════════════════════════════════════╗\n";

    // Refresh counts
    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $finalUsers = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $finalProducts = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $finalOrders = $stmt->fetch()['total'];

    $stmt = $db->query("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $finalRevenue = $stmt->fetch()['total'] ?? 0;

    printf("║  Total Products:  %-37s ║\n", $finalProducts);
    printf("║  Total Users:     %-37s ║\n", $finalUsers);
    printf("║  Total Orders:    %-37s ║\n", $finalOrders);
    printf("║  Total Revenue:   %-37s ║\n", '₹' . number_format($finalRevenue, 2));

    echo "╚════════════════════════════════════════════════════════╝\n";

    // 6. Summary
    echo "\n✅ FIX COMPLETE!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    if ($issuesFixed > 0) {
        echo "Fixed $issuesFixed issue(s)\n\n";
    }

    echo "Dashboard should now show:\n";
    echo "  • Total Products: $finalProducts\n";
    echo "  • Total Users: $finalUsers\n";
    echo "  • Total Orders: $finalOrders\n";
    echo "  • Total Revenue: ₹" . number_format($finalRevenue, 2) . "\n\n";

    echo "🎯 Next Steps:\n";
    echo "1. Make sure backend is running:\n";
    echo "   php -S localhost:8000 -t php-backend/\n\n";
    echo "2. Refresh your browser at: http://localhost:5173/admin\n\n";
    echo "3. The dashboard will now load with 'All Time' filter by default\n";
    echo "   (showing all data instead of just today)\n\n";

    echo "If still showing zeros:\n";
    echo "  • Press F12 → Console tab\n";
    echo "  • Look for '✅ Dashboard data received:'\n";
    echo "  • Check what data is shown\n";
    echo "  • Take a screenshot and share\n\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n\n";
}
