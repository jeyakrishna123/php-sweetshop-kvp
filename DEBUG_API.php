<?php
/**
 * Debug Dashboard API - Shows exactly what's wrong
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php-backend/config/database.php';

echo "═══════════════════════════════════════════════════════\n";
echo "          DASHBOARD API DEBUG                          \n";
echo "═══════════════════════════════════════════════════════\n\n";

try {
    $db = Database::getInstance()->getConnection();

    echo "✅ Database connection successful\n\n";

    // Test 1: Count ALL products (no filter)
    echo "TEST 1: Count ALL products (no filter)\n";
    echo "───────────────────────────────────────────────────────\n";
    $stmt = $db->query("SELECT COUNT(*) as total FROM products");
    $allProducts = $stmt->fetch()['total'];
    echo "Query: SELECT COUNT(*) as total FROM products\n";
    echo "Result: $allProducts products\n\n";

    // Test 2: Count products WHERE is_active = 1
    echo "TEST 2: Count products WHERE is_active = 1\n";
    echo "───────────────────────────────────────────────────────\n";
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeProducts = $stmt->fetch()['total'];
    echo "Query: SELECT COUNT(*) as total FROM products WHERE is_active = 1\n";
    echo "Result: $activeProducts products\n\n";

    // Test 3: Show is_active values
    echo "TEST 3: Check is_active column values\n";
    echo "───────────────────────────────────────────────────────\n";
    $stmt = $db->query("
        SELECT
            is_active,
            COUNT(*) as count
        FROM products
        GROUP BY is_active
    ");

    echo "is_active values distribution:\n";
    while ($row = $stmt->fetch()) {
        $value = $row['is_active'] === null ? 'NULL' : $row['is_active'];
        echo "  is_active = $value: {$row['count']} products\n";
    }
    echo "\n";

    // Test 4: Sample products
    echo "TEST 4: Sample products (first 5)\n";
    echo "───────────────────────────────────────────────────────\n";
    $stmt = $db->query("SELECT id, name, is_active, stock FROM products LIMIT 5");
    $products = $stmt->fetchAll();

    foreach ($products as $p) {
        $active = $p['is_active'] === 1 ? '✅ Active' : '❌ Inactive';
        echo sprintf("[ID: %d] %s - %s (is_active: %s, stock: %d)\n",
            $p['id'],
            $p['name'],
            $active,
            var_export($p['is_active'], true),
            $p['stock']
        );
    }
    echo "\n";

    // Test 5: Check table structure
    echo "TEST 5: Check 'products' table structure\n";
    echo "───────────────────────────────────────────────────────\n";
    $stmt = $db->query("DESCRIBE products");
    $columns = $stmt->fetchAll();

    $hasIsActive = false;
    foreach ($columns as $col) {
        if ($col['Field'] === 'is_active') {
            $hasIsActive = true;
            echo "✅ Column 'is_active' EXISTS\n";
            echo "   Type: {$col['Type']}\n";
            echo "   Null: {$col['Null']}\n";
            echo "   Default: " . ($col['Default'] ?? 'NULL') . "\n";
            break;
        }
    }

    if (!$hasIsActive) {
        echo "❌ Column 'is_active' DOES NOT EXIST!\n";
        echo "   This is the problem! The table is missing the is_active column.\n";
    }
    echo "\n";

    // DIAGNOSIS
    echo "═══════════════════════════════════════════════════════\n";
    echo "          DIAGNOSIS                                    \n";
    echo "═══════════════════════════════════════════════════════\n\n";

    if (!$hasIsActive) {
        echo "❌ CRITICAL ERROR: 'is_active' column missing!\n\n";
        echo "SOLUTION:\n";
        echo "Run this SQL command:\n\n";
        echo "ALTER TABLE products ADD COLUMN is_active TINYINT(1) DEFAULT 1;\n";
        echo "UPDATE products SET is_active = 1;\n\n";

    } elseif ($activeProducts === 0 && $allProducts > 0) {
        echo "❌ PROBLEM IDENTIFIED:\n";
        echo "   Total products: $allProducts\n";
        echo "   Active products (is_active=1): $activeProducts\n";
        echo "   Inactive products: " . ($allProducts - $activeProducts) . "\n\n";
        echo "   Dashboard query uses: WHERE is_active = 1\n";
        echo "   This is why it shows 0!\n\n";

        echo "SOLUTION:\n";
        echo "Run: php INSTANT_FIX.php\n";
        echo "Or run this SQL:\n";
        echo "UPDATE products SET is_active = 1;\n\n";

    } elseif ($allProducts === 0) {
        echo "❌ DATABASE IS EMPTY:\n";
        echo "   No products found in database\n\n";
        echo "SOLUTION:\n";
        echo "Run: php seed_sample_data.php\n\n";

    } else {
        echo "✅ DATA LOOKS CORRECT:\n";
        echo "   Total products: $allProducts\n";
        echo "   Active products: $activeProducts\n\n";
        echo "   Dashboard SHOULD show $activeProducts products.\n\n";
        echo "   If dashboard still shows 0, the problem is:\n";
        echo "   1. Backend API not being called\n";
        echo "   2. Frontend not receiving data\n";
        echo "   3. Authentication issue\n\n";
        echo "NEXT STEPS:\n";
        echo "1. Open browser console (F12)\n";
        echo "2. Look for API calls to /api/admin/dashboard\n";
        echo "3. Check the response\n";
        echo "4. Share screenshot\n\n";
    }

    // Test 6: Simulate dashboard API query
    echo "═══════════════════════════════════════════════════════\n";
    echo "          SIMULATED API RESPONSE                       \n";
    echo "═══════════════════════════════════════════════════════\n\n";

    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $users = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $orders = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT SUM(total_price) as total FROM orders WHERE status IN ('delivered', 'shipped', 'processing')");
    $revenue = $stmt->fetch()['total'] ?? 0;

    $apiResponse = [
        'success' => true,
        'stats' => [
            'totalProducts' => (int)$activeProducts,
            'totalUsers' => (int)$users,
            'totalOrders' => (int)$orders,
            'totalRevenue' => (float)$revenue
        ]
    ];

    echo json_encode($apiResponse, JSON_PRETTY_PRINT);
    echo "\n\n";

    echo "Dashboard should display:\n";
    echo "  Total Products: $activeProducts\n";
    echo "  Total Users: $users\n";
    echo "  Total Orders: $orders\n";
    echo "  Total Revenue: ₹" . number_format($revenue, 2) . "\n\n";

} catch (Exception $e) {
    echo "\n❌ DATABASE ERROR:\n";
    echo $e->getMessage() . "\n\n";
    echo "Check database configuration in:\n";
    echo "php-backend/config/database.php\n\n";
}

echo "═══════════════════════════════════════════════════════\n";
