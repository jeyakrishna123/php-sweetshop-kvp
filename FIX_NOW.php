<?php
/**
 * IMMEDIATE FIX - Run this NOW to fix dashboard
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "\n=======================================================\n";
    echo "           FIXING DASHBOARD NOW\n";
    echo "=======================================================\n\n";

    // STEP 1: Check current status
    echo "BEFORE FIX:\n";
    echo "---------------------------------------------------\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $total = $stmt->fetch()['total'];
    echo "Total products in database: $total\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $active = $stmt->fetch()['total'];
    echo "Products with is_active=1: $active\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 0 OR is_active IS NULL");
    $inactive = $stmt->fetch()['total'];
    echo "Products with is_active=0 or NULL: $inactive\n\n";

    // STEP 2: FIX IT NOW
    if ($inactive > 0) {
        echo "FIXING...\n";
        echo "---------------------------------------------------\n";
        echo "Activating $inactive products...\n";

        $db->exec("UPDATE products SET is_active = 1");

        echo "✅ DONE!\n\n";
    } else {
        echo "All products already active!\n\n";
    }

    // STEP 3: Verify fix
    echo "AFTER FIX:\n";
    echo "---------------------------------------------------\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeNow = $stmt->fetch()['total'];
    echo "Products with is_active=1: $activeNow\n\n";

    // STEP 4: Get dashboard stats
    echo "=======================================================\n";
    echo "           DASHBOARD WILL NOW SHOW:\n";
    echo "=======================================================\n\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $users = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $orders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT SUM(total_price) as total FROM orders WHERE status IN ('delivered', 'shipped', 'processing')");
    $revenue = $stmt->fetch()['total'] ?? 0;

    echo "Total Products: $activeNow\n";
    echo "Total Users: $users\n";
    echo "Total Orders: $orders\n";
    echo "Total Revenue: ₹" . number_format($revenue, 2) . "\n\n";

    echo "=======================================================\n";
    echo "✅ FIX COMPLETE!\n";
    echo "=======================================================\n\n";

    echo "NEXT STEP:\n";
    echo "Go to your browser and refresh the admin dashboard\n";
    echo "Press Ctrl+Shift+R to hard refresh\n\n";

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n\n";
}
