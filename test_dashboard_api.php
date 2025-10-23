<?php
/**
 * Test Dashboard API Endpoint
 * This simulates what the frontend calls to get dashboard data
 */

require_once __DIR__ . '/php-backend/config/database.php';
require_once __DIR__ . '/php-backend/config/config.php';
require_once __DIR__ . '/php-backend/includes/helpers.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "\n";
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║     TESTING DASHBOARD API ENDPOINT                     ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
    echo "\n";

    // Simulate the dashboard query without authentication
    echo "📊 Simulating: GET /api/admin/dashboard?dateRange=all\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // Get total users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];

    // Get total products
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['total'];

    // Get total products (without is_active filter)
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products");
    $stmt->execute();
    $totalProductsAll = $stmt->fetch()['total'];

    // Get total orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
    $stmt->execute();
    $totalOrders = $stmt->fetch()['total'];

    // Get total revenue
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute();
    $totalRevenue = $stmt->fetch()['total'] ?? 0;

    // Get pending orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
    $stmt->execute();
    $pendingOrders = $stmt->fetch()['total'];

    // Get processing orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'processing'");
    $stmt->execute();
    $processingOrders = $stmt->fetch()['total'];

    // Get shipped orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'shipped'");
    $stmt->execute();
    $shippedOrders = $stmt->fetch()['total'];

    // Get delivered orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'");
    $stmt->execute();
    $deliveredOrders = $stmt->fetch()['total'];

    // Get low stock products
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $stmt->execute();
    $lowStockProducts = $stmt->fetch()['total'];

    // Get out of stock products
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $stmt->execute();
    $outOfStockProducts = $stmt->fetch()['total'];

    // Build response exactly as backend does
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

    // Display response as JSON
    echo "API Response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

    // Display issue detection
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "🔍 ISSUE DETECTION:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    if ($totalProducts === 0 && $totalProductsAll > 0) {
        echo "❌ PROBLEM FOUND:\n";
        echo "   Total products in database: $totalProductsAll\n";
        echo "   Active products (is_active=1): $totalProducts\n";
        echo "   Dashboard shows: $totalProducts ❌\n\n";
        echo "💡 SOLUTION:\n";
        echo "   Your products have is_active = 0 or NULL!\n";
        echo "   Run this command to fix:\n";
        echo "   php activate_all_products.php\n\n";
    } elseif ($totalProducts > 0) {
        echo "✅ PRODUCTS LOOK CORRECT:\n";
        echo "   Dashboard should show: $totalProducts products\n\n";
        echo "   If dashboard still shows 0, the problem is:\n";
        echo "   1. Backend server not running on localhost:8000\n";
        echo "   2. Frontend not connecting to backend\n";
        echo "   3. Authentication/token issue\n\n";
        echo "   CHECK:\n";
        echo "   • Is backend running? php -S localhost:8000 -t php-backend/\n";
        echo "   • Open browser console (F12) → Console tab\n";
        echo "   • Look for the log: '✅ Dashboard data received:'\n";
        echo "   • Check what data it shows\n\n";
    } else {
        echo "❌ DATABASE IS EMPTY:\n";
        echo "   No products found in database!\n";
        echo "   Run: php seed_sample_data.php\n\n";
    }

    // Check if products have is_active column
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📋 PRODUCT DETAILS (First 5):\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    $stmt = $db->query("SELECT id, name, is_active FROM products LIMIT 5");
    $products = $stmt->fetchAll();

    if (empty($products)) {
        echo "   No products in database\n\n";
    } else {
        foreach ($products as $product) {
            $activeStatus = $product['is_active'] === 1 ? '✅ Active' : '❌ Inactive';
            echo sprintf("   [ID: %d] %s - %s (is_active: %s)\n",
                $product['id'],
                $product['name'],
                $activeStatus,
                var_export($product['is_active'], true)
            );
        }
        echo "\n";
    }

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n\n";
}
