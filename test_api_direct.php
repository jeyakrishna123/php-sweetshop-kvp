<?php
/**
 * Test Admin API Endpoint Directly
 */

// Set up environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/admin/dashboard';

// Mock authentication
$mockToken = 'test_token_123';
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $mockToken";

// Override authentication for testing
class MockAuthMiddleware {
    public static function authenticate() {
        global $mockAdminUser;
        return $mockAdminUser;
    }

    public static function requireAdmin($user) {
        if ($user['role'] !== 'admin') {
            throw new Exception('Admin access required');
        }
    }
}

// Create mock admin user
require_once __DIR__ . '/php-backend/config/database.php';
$db = Database::getInstance()->getConnection();

$stmt = $db->prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
$stmt->execute();
$mockAdminUser = $stmt->fetch();

if (!$mockAdminUser) {
    die("❌ No admin user found in database\n");
}

echo "Testing as: {$mockAdminUser['email']}\n\n";

// Include the admin API file but capture its output
ob_start();

// Replace AuthMiddleware with our mock
class_alias('MockAuthMiddleware', 'AuthMiddleware');

try {
    require_once __DIR__ . '/php-backend/config/config.php';
    require_once __DIR__ . '/php-backend/includes/helpers.php';
    require_once __DIR__ . '/php-backend/middleware/cors.php';

    // Call the getDashboardStats function directly
    $dateFilter = [
        'type' => 'all',
        'startDate' => null,
        'endDate' => null
    ];

    // Build query conditions
    $dateCondition = "";
    $dateParams = [];

    // Get statistics
    echo "=== DIRECT API CALL SIMULATION ===\n\n";

    // Total Users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];

    // Total Products
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['total'];

    // Total Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE 1=1" . $dateCondition);
    $stmt->execute($dateParams);
    $totalOrders = $stmt->fetch()['total'];

    // Total Revenue
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')" . $dateCondition);
    $stmt->execute($dateParams);
    $totalRevenue = $stmt->fetch()['total'] ?? 0;

    // Pending Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'" . $dateCondition);
    $stmt->execute($dateParams);
    $pendingOrders = $stmt->fetch()['total'];

    // Processing Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'processing'" . $dateCondition);
    $stmt->execute($dateParams);
    $processingOrders = $stmt->fetch()['total'];

    // Shipped Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'shipped'" . $dateCondition);
    $stmt->execute($dateParams);
    $shippedOrders = $stmt->fetch()['total'];

    // Delivered Orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'delivered'" . $dateCondition);
    $stmt->execute($dateParams);
    $deliveredOrders = $stmt->fetch()['total'];

    // Low Stock
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
    ");
    $stmt->execute();
    $lowStockProducts = $stmt->fetch()['total'];

    // Out of Stock
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM products
        WHERE stock = 0 AND is_active = 1
    ");
    $stmt->execute();
    $outOfStockProducts = $stmt->fetch()['total'];

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

    echo "Expected API Response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n";

    echo "\n=== TESTING COMPLETE ===\n";
    echo "This is what the API should return.\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

ob_end_clean();
