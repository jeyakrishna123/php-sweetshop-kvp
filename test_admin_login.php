<?php
/**
 * Test Admin Login and Get Dashboard Stats
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "=== ADMIN LOGIN TEST ===\n\n";

    // Get admin user
    $stmt = $db->prepare("SELECT id, email, password, role FROM users WHERE role = 'admin' LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch();

    if (!$admin) {
        echo "❌ No admin user found!\n";
        echo "Creating default admin...\n";

        $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password, role, is_active, is_email_verified, created_at)
            VALUES ('Admin User', 'admin@example.com', ?, 'admin', 1, 1, NOW())
        ");
        $stmt->execute([$hashedPassword]);

        echo "✅ Admin created:\n";
        echo "   Email: admin@example.com\n";
        echo "   Password: admin123\n\n";

        // Re-fetch admin
        $stmt = $db->prepare("SELECT id, email, password, role FROM users WHERE role = 'admin' LIMIT 1");
        $stmt->execute();
        $admin = $stmt->fetch();
    } else {
        echo "✅ Admin user found:\n";
        echo "   ID: {$admin['id']}\n";
        echo "   Email: {$admin['email']}\n";
        echo "   Role: {$admin['role']}\n\n";
    }

    // Test password
    echo "Testing password verification...\n";
    $testPasswords = ['admin123', 'password', 'admin', '123456'];

    foreach ($testPasswords as $testPassword) {
        if (password_verify($testPassword, $admin['password'])) {
            echo "✅ Password is: $testPassword\n\n";
            break;
        }
    }

    // Test dashboard query
    echo "=== TESTING DASHBOARD QUERIES ===\n\n";

    // Total Users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];
    echo "👥 Total Users: $totalUsers\n";

    // Total Products
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['total'];
    echo "📦 Total Products: $totalProducts\n";

    // Total Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
    $stmt->execute();
    $totalOrders = $stmt->fetch()['total'];
    echo "📋 Total Orders: $totalOrders\n";

    // Total Revenue
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute();
    $totalRevenue = $stmt->fetch()['total'] ?? 0;
    echo "💰 Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n";

    // Pending Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
    $stmt->execute();
    $pendingOrders = $stmt->fetch()['total'];
    echo "⏳ Pending Orders: $pendingOrders\n";

    // Processing Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'processing'");
    $stmt->execute();
    $processingOrders = $stmt->fetch()['total'];
    echo "🔄 Processing Orders: $processingOrders\n";

    // Shipped Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'shipped'");
    $stmt->execute();
    $shippedOrders = $stmt->fetch()['total'];
    echo "📦 Shipped Orders: $shippedOrders\n";

    // Delivered Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'");
    $stmt->execute();
    $deliveredOrders = $stmt->fetch()['total'];
    echo "✅ Delivered Orders: $deliveredOrders\n";

    // Low Stock
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $stmt->execute();
    $lowStockProducts = $stmt->fetch()['total'];
    echo "⚠️ Low Stock Products: $lowStockProducts\n";

    // Out of Stock
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $stmt->execute();
    $outOfStockProducts = $stmt->fetch()['total'];
    echo "❌ Out of Stock Products: $outOfStockProducts\n";

    echo "\n=== ALL QUERIES WORKING ===\n";
    echo "\nIf dashboard still shows zeros, check:\n";
    echo "1. Is the backend server running on port 8000?\n";
    echo "2. Are you logged in as admin in the browser?\n";
    echo "3. Check browser console for errors\n";
    echo "4. Check Network tab in browser DevTools\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
