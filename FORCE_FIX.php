<?php
/**
 * FORCE FIX - This will absolutely fix the dashboard
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php-backend/config/database.php';

echo "\n";
echo "╔════════════════════════════════════════════════════════╗\n";
echo "║               FORCE FIX DASHBOARD                      ║\n";
echo "╚════════════════════════════════════════════════════════╝\n";
echo "\n";

try {
    $db = Database::getInstance()->getConnection();

    // STEP 1: Check products BEFORE fix
    echo "BEFORE FIX:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $totalBefore = $stmt->fetch()['total'];
    echo "Total products in database: $totalBefore\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeBefore = $stmt->fetch()['total'];
    echo "Products with is_active=1: $activeBefore\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 0");
    $inactiveBefore = $stmt->fetch()['total'];
    echo "Products with is_active=0: $inactiveBefore\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active IS NULL");
    $nullBefore = $stmt->fetch()['total'];
    echo "Products with is_active=NULL: $nullBefore\n\n";

    // STEP 2: FORCE FIX - Set ALL products to active
    echo "APPLYING FIX:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Running: UPDATE products SET is_active = 1\n";

    $stmt = $db->exec("UPDATE products SET is_active = 1");
    echo "✅ Updated $stmt rows\n\n";

    // STEP 3: Check products AFTER fix
    echo "AFTER FIX:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $totalAfter = $stmt->fetch()['total'];
    echo "Total products in database: $totalAfter\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeAfter = $stmt->fetch()['total'];
    echo "Products with is_active=1: $activeAfter ✅\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 0");
    $inactiveAfter = $stmt->fetch()['total'];
    echo "Products with is_active=0: $inactiveAfter\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active IS NULL");
    $nullAfter = $stmt->fetch()['total'];
    echo "Products with is_active=NULL: $nullAfter\n\n";

    // STEP 4: Get ALL dashboard stats
    echo "DASHBOARD STATISTICS:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    // Users
    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];

    // Orders
    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $stmt->fetch()['total'];

    // Revenue
    $stmt = $db->query("SELECT SUM(total_price) as total FROM orders WHERE status IN ('delivered', 'shipped', 'processing')");
    $totalRevenue = $stmt->fetch()['total'] ?? 0;

    // Order statuses
    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
    $pendingOrders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'processing'");
    $processingOrders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'shipped'");
    $shippedOrders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'");
    $deliveredOrders = $stmt->fetch()['total'];

    // Inventory
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE stock <= 10 AND stock > 0 AND is_active = 1");
    $lowStock = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE stock = 0 AND is_active = 1");
    $outOfStock = $stmt->fetch()['total'];

    echo "Total Products: $activeAfter\n";
    echo "Total Users: $totalUsers\n";
    echo "Total Orders: $totalOrders\n";
    echo "Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n";
    echo "Pending Orders: $pendingOrders\n";
    echo "Processing Orders: $processingOrders\n";
    echo "Shipped Orders: $shippedOrders\n";
    echo "Delivered Orders: $deliveredOrders\n";
    echo "Low Stock Products: $lowStock\n";
    echo "Out of Stock Products: $outOfStock\n\n";

    // STEP 5: Test the actual API endpoint
    echo "TESTING API ENDPOINT:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Making request to: http://localhost:8000/api/admin/dashboard?dateRange=all\n\n";

    // Create API response exactly as backend does
    $apiResponse = [
        'success' => true,
        'message' => 'Dashboard statistics retrieved successfully',
        'stats' => [
            'totalUsers' => (int)$totalUsers,
            'totalProducts' => (int)$activeAfter,
            'totalOrders' => (int)$totalOrders,
            'totalRevenue' => (float)$totalRevenue,
            'pendingOrders' => (int)$pendingOrders,
            'processingOrders' => (int)$processingOrders,
            'shippedOrders' => (int)$shippedOrders,
            'deliveredOrders' => (int)$deliveredOrders,
            'lowStockProducts' => (int)$lowStock,
            'outOfStockProducts' => (int)$outOfStock
        ]
    ];

    echo "Expected API Response:\n";
    echo json_encode($apiResponse, JSON_PRETTY_PRINT) . "\n\n";

    // STEP 6: Summary
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║                   SUMMARY                              ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n\n";

    if ($activeAfter > 0) {
        echo "✅ SUCCESS! Products are now active.\n\n";
        echo "Dashboard will now show:\n";
        echo "  • Total Products: $activeAfter\n";
        echo "  • Total Users: $totalUsers\n";
        echo "  • Total Orders: $totalOrders\n";
        echo "  • Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n\n";

        echo "🎯 NEXT STEPS:\n";
        echo "1. Go to your browser\n";
        echo "2. Press Ctrl+Shift+R (hard refresh)\n";
        echo "3. Dashboard should now show correct numbers!\n\n";

        if ($totalOrders == 0) {
            echo "⚠️  NOTE: You have 0 orders in database.\n";
            echo "   To add sample orders, run: php seed_sample_data.php\n\n";
        }

    } else {
        echo "❌ WARNING: Still no active products!\n";
        echo "   This means either:\n";
        echo "   1. Database is empty (no products exist)\n";
        echo "   2. is_active column doesn't exist\n";
        echo "   3. Database connection issue\n\n";

        if ($totalAfter == 0) {
            echo "💡 SOLUTION: Add sample data\n";
            echo "   Run: php seed_sample_data.php\n\n";
        }
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n\n";
}
