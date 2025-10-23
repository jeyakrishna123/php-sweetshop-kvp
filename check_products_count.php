<?php
/**
 * Check Product Count in Database
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "🔍 Checking Products Count\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // Total products (all)
    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $totalAll = $stmt->fetch()['total'];
    echo "📦 Total Products (all): $totalAll\n";

    // Active products
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $totalActive = $stmt->fetch()['total'];
    echo "✅ Active Products (is_active = 1): $totalActive\n";

    // Inactive products
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 0");
    $totalInactive = $stmt->fetch()['total'];
    echo "❌ Inactive Products (is_active = 0): $totalInactive\n";

    // Products with NULL is_active
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active IS NULL");
    $totalNull = $stmt->fetch()['total'];
    echo "⚠️  Products with NULL is_active: $totalNull\n";

    echo "\n📋 Product Details:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT id, name, is_active, stock FROM products LIMIT 10");
    while ($row = $stmt->fetch()) {
        $status = $row['is_active'] === 1 ? '✅' : ($row['is_active'] === 0 ? '❌' : '⚠️ NULL');
        echo sprintf("  %s [ID: %d] %s (Stock: %d, Active: %s)\n",
            $status,
            $row['id'],
            $row['name'],
            $row['stock'],
            var_export($row['is_active'], true)
        );
    }

    echo "\n🎯 Dashboard Query Result:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    // Simulate dashboard query
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $dashboardCount = $stmt->fetch()['total'];
    echo "Dashboard should show: $dashboardCount products\n";

    echo "\n";

    if ($totalAll > 0 && $dashboardCount === 0) {
        echo "⚠️  ISSUE FOUND:\n";
        echo "   You have $totalAll products in database,\n";
        echo "   but dashboard shows 0 because they're marked as inactive!\n\n";
        echo "💡 SOLUTION:\n";
        echo "   Run this SQL to activate all products:\n";
        echo "   UPDATE products SET is_active = 1;\n\n";
        echo "   Or run: php activate_all_products.php\n";
    } elseif ($dashboardCount > 0) {
        echo "✅ Dashboard query looks correct! Should show $dashboardCount products.\n";
        echo "   If dashboard still shows 0, the issue is with:\n";
        echo "   - Backend server not running (php -S localhost:8000 -t php-backend/)\n";
        echo "   - API not being called correctly\n";
        echo "   - Frontend-backend connection issue\n";
    } else {
        echo "ℹ️  Database is empty. Run: php seed_sample_data.php\n";
    }

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}
