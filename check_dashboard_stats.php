<?php
/**
 * Diagnostic script to check all dashboard statistics
 */
require_once 'php-backend/config/database.php';

echo "🔍 ADMIN DASHBOARD STATISTICS DIAGNOSTIC\n";
echo str_repeat("=", 80) . "\n\n";

try {
    $db = Database::getInstance()->getConnection();

    // Check Users
    echo "👥 USERS:\n";
    echo str_repeat("-", 80) . "\n";
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];
    echo "Total Users: $totalUsers\n";

    if ($totalUsers > 0) {
        $stmt = $db->prepare("SELECT id, name, email, role, created_at FROM users LIMIT 5");
        $stmt->execute();
        $users = $stmt->fetchAll();
        foreach ($users as $user) {
            echo sprintf("  - [%d] %s (%s) - Role: %s\n",
                $user['id'], $user['name'], $user['email'], $user['role']);
        }
    }
    echo "\n";

    // Check Products
    echo "📦 PRODUCTS:\n";
    echo str_repeat("-", 80) . "\n";
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['total'];
    echo "Total Active Products: $totalProducts\n";

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products");
    $stmt->execute();
    $allProducts = $stmt->fetch()['total'];
    echo "Total All Products: $allProducts\n\n";

    // Check Orders
    echo "🛒 ORDERS:\n";
    echo str_repeat("-", 80) . "\n";
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
    $stmt->execute();
    $totalOrders = $stmt->fetch()['total'];
    echo "Total Orders: $totalOrders\n";

    if ($totalOrders > 0) {
        $stmt = $db->prepare("
            SELECT o.id, o.tracking_number, o.status, o.total_price, o.created_at,
                   u.name as user_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll();
        foreach ($orders as $order) {
            echo sprintf("  - Order #%s: ₹%.2f - %s - Customer: %s\n",
                $order['tracking_number'],
                $order['total_price'],
                $order['status'],
                $order['user_name']);
        }
    }
    echo "\n";

    // Check Revenue
    echo "💰 REVENUE:\n";
    echo str_repeat("-", 80) . "\n";
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute();
    $totalRevenue = $stmt->fetch()['total'] ?? 0;
    echo "Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n\n";

    // Check Database Connection
    echo "🔌 DATABASE CONNECTION:\n";
    echo str_repeat("-", 80) . "\n";
    $stmt = $db->prepare("SELECT DATABASE() as db_name");
    $stmt->execute();
    $dbInfo = $stmt->fetch();
    echo "Connected Database: " . $dbInfo['db_name'] . "\n";

    $stmt = $db->prepare("SELECT VERSION() as version");
    $stmt->execute();
    $versionInfo = $stmt->fetch();
    echo "MySQL Version: " . $versionInfo['version'] . "\n\n";

    // Summary
    echo "📊 SUMMARY:\n";
    echo str_repeat("=", 80) . "\n";
    echo "Total Users: $totalUsers\n";
    echo "Total Products: $totalProducts (Active) / $allProducts (All)\n";
    echo "Total Orders: $totalOrders\n";
    echo "Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n";
    echo "\n";

    // Analysis
    echo "🔍 ANALYSIS:\n";
    echo str_repeat("=", 80) . "\n";
    if ($totalUsers == 0) {
        echo "❌ NO USERS FOUND - Database might be empty!\n";
    } else {
        echo "✅ Users table has data\n";
    }

    if ($totalProducts == 0) {
        echo "❌ NO PRODUCTS FOUND - Database might be empty!\n";
    } else {
        echo "✅ Products table has data\n";
    }

    if ($totalOrders == 0) {
        echo "⚠️  NO ORDERS FOUND - This is expected if no orders have been placed yet\n";
    } else {
        echo "✅ Orders table has data\n";
    }

    echo "\n";

    // Check if admin.php would return zeros
    echo "🎯 SIMULATING ADMIN API RESPONSE:\n";
    echo str_repeat("=", 80) . "\n";
    echo "The API would return:\n";
    echo "  - totalUsers: $totalUsers\n";
    echo "  - totalProducts: $totalProducts\n";
    echo "  - totalOrders: $totalOrders\n";
    echo "  - totalRevenue: " . number_format($totalRevenue, 2) . "\n";

    if ($totalUsers == 0 && $totalProducts == 0 && $totalOrders == 0) {
        echo "\n❌ ALL STATISTICS ARE ZERO!\n";
        echo "This means the database tables exist but are empty.\n";
        echo "You need to import sample data using SQL files.\n";
    } else {
        echo "\n✅ Statistics show actual data!\n";
        echo "If the frontend shows zeros, the issue is likely:\n";
        echo "  1. Authentication failure (not logged in as admin)\n";
        echo "  2. API endpoint not being reached\n";
        echo "  3. CORS or network issues\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Database connection failed or query error occurred.\n";
}
