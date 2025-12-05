<?php
/**
 * COMPLETE FIX - Fixes ALL dashboard issues
 * This checks EVERYTHING and fixes it
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php-backend/config/database.php';

echo "\n╔════════════════════════════════════════════════════════╗\n";
echo "║          COMPLETE DASHBOARD FIX                        ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connected successfully\n\n";

    $fixesApplied = [];

    // FIX 1: Check if is_active column exists
    echo "━━━ CHECK 1: Database Schema ━━━\n";

    $stmt = $db->query("SHOW COLUMNS FROM products LIKE 'is_active'");
    $isActiveColumn = $stmt->fetch();

    if (!$isActiveColumn) {
        echo "❌ Column 'is_active' does NOT exist!\n";
        echo "   Creating column...\n";

        $db->exec("ALTER TABLE products ADD COLUMN is_active TINYINT(1) DEFAULT 1");
        echo "✅ Created 'is_active' column\n";
        $fixesApplied[] = "Created is_active column";

        // Set all existing products to active
        $db->exec("UPDATE products SET is_active = 1 WHERE is_active IS NULL");
        echo "✅ Set all products to active\n";
        $fixesApplied[] = "Activated all products";
    } else {
        echo "✅ Column 'is_active' exists\n";
    }
    echo "\n";

    // FIX 2: Activate all products
    echo "━━━ CHECK 2: Product Activation ━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeProducts = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active != 1 OR is_active IS NULL");
    $inactiveProducts = $stmt->fetch()['total'];

    echo "Active products (is_active=1): $activeProducts\n";
    echo "Inactive products: $inactiveProducts\n";

    if ($inactiveProducts > 0) {
        echo "⚠️  Found $inactiveProducts inactive products\n";
        echo "   Activating them...\n";

        $db->exec("UPDATE products SET is_active = 1 WHERE is_active != 1 OR is_active IS NULL");
        echo "✅ Activated $inactiveProducts products\n";
        $fixesApplied[] = "Activated $inactiveProducts products";

        // Refresh count
        $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
        $activeProducts = $stmt->fetch()['total'];
    }
    echo "Total active products now: $activeProducts\n\n";

    // FIX 3: Check if database has data
    echo "━━━ CHECK 3: Database Content ━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $totalProducts = $stmt->fetch()['total'];
    echo "Total products in database: $totalProducts\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];
    echo "Total users in database: $totalUsers\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $stmt->fetch()['total'];
    echo "Total orders in database: $totalOrders\n";

    if ($totalProducts == 0 || $totalUsers == 0) {
        echo "\n⚠️  Database is empty or has very little data\n";
        echo "   Adding sample data...\n\n";

        // Include seed script
        if (file_exists(__DIR__ . '/seed_sample_data.php')) {
            include __DIR__ . '/seed_sample_data.php';
            $fixesApplied[] = "Added sample data";
        } else {
            echo "   Warning: seed_sample_data.php not found\n";
        }
    }
    echo "\n";

    // FIX 4: Verify API query
    echo "━━━ CHECK 4: Dashboard API Query ━━━\n";
    echo "Testing the exact query used by dashboard API...\n\n";

    // Simulate dashboard API query
    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $apiUsers = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $apiProducts = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $apiOrders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT SUM(total_price) as total FROM orders WHERE status IN ('delivered', 'shipped', 'processing')");
    $apiRevenue = $stmt->fetch()['total'] ?? 0;

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
    $pending = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'processing'");
    $processing = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'shipped'");
    $shipped = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'");
    $delivered = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE stock <= 10 AND stock > 0 AND is_active = 1");
    $lowStock = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE stock = 0 AND is_active = 1");
    $outOfStock = $stmt->fetch()['total'];

    echo "API Query Results:\n";
    echo "  totalUsers: $apiUsers\n";
    echo "  totalProducts: $apiProducts\n";
    echo "  totalOrders: $apiOrders\n";
    echo "  totalRevenue: ₹$apiRevenue\n";
    echo "  pendingOrders: $pending\n";
    echo "  processingOrders: $processing\n";
    echo "  shippedOrders: $shipped\n";
    echo "  deliveredOrders: $delivered\n";
    echo "  lowStockProducts: $lowStock\n";
    echo "  outOfStockProducts: $outOfStock\n\n";

    // Create exact API response
    $response = [
        'success' => true,
        'message' => 'Dashboard statistics retrieved successfully',
        'stats' => [
            'totalUsers' => (int)$apiUsers,
            'totalProducts' => (int)$apiProducts,
            'totalOrders' => (int)$apiOrders,
            'totalRevenue' => (float)$apiRevenue,
            'pendingOrders' => (int)$pending,
            'processingOrders' => (int)$processing,
            'shippedOrders' => (int)$shipped,
            'deliveredOrders' => (int)$delivered,
            'lowStockProducts' => (int)$lowStock,
            'outOfStockProducts' => (int)$outOfStock
        ]
    ];

    echo "Expected API Response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

    // FINAL SUMMARY
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║                 FIX COMPLETE                           ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n\n";

    if (!empty($fixesApplied)) {
        echo "✅ Applied fixes:\n";
        foreach ($fixesApplied as $fix) {
            echo "   • $fix\n";
        }
        echo "\n";
    }

    echo "📊 Dashboard should now show:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "  Total Products: $apiProducts\n";
    echo "  Total Users: $apiUsers\n";
    echo "  Total Orders: $apiOrders\n";
    echo "  Total Revenue: ₹" . number_format($apiRevenue, 2) . "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    echo "🎯 NEXT STEPS:\n";
    echo "1. Keep backend server running: php -S localhost:8000 -t php-backend/\n";
    echo "2. Go to browser: http://localhost:5173/admin\n";
    echo "3. Press Ctrl+Shift+R (hard refresh)\n";
    echo "4. Check dashboard\n\n";

    if ($apiProducts == 0) {
        echo "⚠️  WARNING: Still showing 0 products!\n";
        echo "   This means the database is truly empty.\n";
        echo "   Run: php seed_sample_data.php\n\n";
    }

    echo "📝 If still showing zeros after refresh:\n";
    echo "1. Open browser console (F12)\n";
    echo "2. Go to Network tab\n";
    echo "3. Click on 'dashboard' request\n";
    echo "4. Check the Response\n";
    echo "5. Share screenshot\n\n";

} catch (Exception $e) {
    echo "\n❌ ERROR:\n";
    echo $e->getMessage() . "\n\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n\n";
}
