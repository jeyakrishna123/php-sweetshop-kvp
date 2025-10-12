<?php
/**
 * Analytics API Endpoints
 * Routes: /api/analytics/*
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

// Get path after /api/analytics/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/analytics and /api/php-backend/api/analytics
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'analytics') {
    // Handle /api/php-backend/api/analytics
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/analytics
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case 'dashboard':
            if ($method === 'GET') {
                getDashboardAnalytics($db);
            }
            break;

        case 'sales':
            if ($method === 'GET') {
                getSalesAnalytics($db);
            }
            break;

        case 'products':
            if ($method === 'GET') {
                getProductAnalytics($db);
            }
            break;

        case 'customers':
            if ($method === 'GET') {
                getCustomerAnalytics($db);
            }
            break;

        default:
            sendError('Endpoint not found', [], 404);
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get dashboard analytics (Admin only)
 */
function getDashboardAnalytics($db) {
    // Optional authentication - allow both admin and public access for reports
    $authUser = AuthMiddleware::optionalAuth();
    if ($authUser && $authUser->role !== 'admin') {
        AuthMiddleware::requireAdmin($authUser);
    }

    $period = isset($_GET['period']) ? (int)$_GET['period'] : 30;
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d', strtotime("-$period days"));
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d');

    // Get total revenue
    $stmt = $db->prepare("
        SELECT
            SUM(total_price) as total_revenue,
            COUNT(*) as total_orders,
            AVG(total_price) as average_order_value
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute([$startDate, $endDate]);
    $revenueData = $stmt->fetch();

    // Get order status breakdown
    $stmt = $db->prepare("
        SELECT
            status,
            COUNT(*) as count
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY status
    ");
    $stmt->execute([$startDate, $endDate]);
    $orderStatuses = [];
    while ($row = $stmt->fetch()) {
        $orderStatuses[$row['status']] = (int)$row['count'];
    }

    // Get daily sales
    $stmt = $db->prepare("
        SELECT
            DATE(created_at) as date,
            SUM(total_price) as revenue,
            COUNT(*) as orders
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status IN ('delivered', 'shipped', 'processing')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$startDate, $endDate]);
    $dailySales = $stmt->fetchAll();

    // Get top products
    $stmt = $db->prepare("
        SELECT
            p.id,
            p.name,
            p.price,
            p.thumbnail as image,
            SUM(oi.quantity) as sales,
            SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.status IN ('delivered', 'shipped', 'processing')
        GROUP BY p.id, p.name, p.price, p.thumbnail
        ORDER BY sales DESC
        LIMIT 10
    ");
    $stmt->execute([$startDate, $endDate]);
    $topProducts = $stmt->fetchAll();

    // Get new customers
    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM users
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND role = 'user'
    ");
    $stmt->execute([$startDate, $endDate]);
    $newCustomers = $stmt->fetch()['count'];

    // Get total customers
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    $stmt->execute();
    $totalCustomers = $stmt->fetch()['count'];

    // Get total products
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['count'];

    // Calculate growth rate (compare with previous period)
    $prevStartDate = date('Y-m-d', strtotime($startDate . " -$period days"));
    $prevEndDate = date('Y-m-d', strtotime($endDate . " -$period days"));

    $stmt = $db->prepare("
        SELECT SUM(total_price) as prev_revenue
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute([$prevStartDate, $prevEndDate]);
    $prevRevenue = $stmt->fetch()['prev_revenue'] ?? 0;

    $currentRevenue = $revenueData['total_revenue'] ?? 0;
    $growthRate = $prevRevenue > 0 ? (($currentRevenue - $prevRevenue) / $prevRevenue) * 100 : 0;

    sendSuccess('Dashboard analytics retrieved successfully', [
        'period' => [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'days' => $period
        ],
        'revenue' => [
            'total' => (float)($revenueData['total_revenue'] ?? 0),
            'average' => (float)($revenueData['average_order_value'] ?? 0),
            'growth' => (float)$growthRate
        ],
        'orders' => [
            'total' => (int)($revenueData['total_orders'] ?? 0),
            'byStatus' => $orderStatuses
        ],
        'customers' => [
            'total' => (int)$totalCustomers,
            'new' => (int)$newCustomers
        ],
        'products' => [
            'total' => (int)$totalProducts,
            'top' => $topProducts
        ],
        'dailySales' => $dailySales
    ]);
}

/**
 * Get sales analytics (Admin only)
 */
function getSalesAnalytics($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $period = isset($_GET['period']) ? (int)$_GET['period'] : 30;

    $stmt = $db->prepare("
        SELECT
            DATE(created_at) as date,
            SUM(total_price) as revenue,
            COUNT(*) as orders,
            AVG(total_price) as average_order_value
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status IN ('delivered', 'shipped', 'processing')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$period]);
    $salesData = $stmt->fetchAll();

    sendSuccess('Sales analytics retrieved successfully', [
        'period' => $period,
        'data' => $salesData
    ]);
}

/**
 * Get product analytics (Admin only)
 */
function getProductAnalytics($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $period = isset($_GET['period']) ? (int)$_GET['period'] : 30;

    // Get top selling products
    $stmt = $db->prepare("
        SELECT
            p.id,
            p.name,
            p.category,
            p.price,
            SUM(oi.quantity) as units_sold,
            SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND o.status IN ('delivered', 'shipped', 'processing')
        GROUP BY p.id, p.name, p.category, p.price
        ORDER BY units_sold DESC
        LIMIT 20
    ");
    $stmt->execute([$period]);
    $topProducts = $stmt->fetchAll();

    // Get category performance
    $stmt = $db->prepare("
        SELECT
            p.category,
            COUNT(DISTINCT p.id) as products_count,
            SUM(oi.quantity) as units_sold,
            SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND o.status IN ('delivered', 'shipped', 'processing')
        GROUP BY p.category
        ORDER BY revenue DESC
    ");
    $stmt->execute([$period]);
    $categoryPerformance = $stmt->fetchAll();

    sendSuccess('Product analytics retrieved successfully', [
        'period' => $period,
        'topProducts' => $topProducts,
        'categories' => $categoryPerformance
    ]);
}

/**
 * Get customer analytics (Admin only)
 */
function getCustomerAnalytics($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $period = isset($_GET['period']) ? (int)$_GET['period'] : 30;

    // Get customer acquisition
    $stmt = $db->prepare("
        SELECT
            DATE(created_at) as date,
            COUNT(*) as new_customers
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND role = 'user'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$period]);
    $customerAcquisition = $stmt->fetchAll();

    // Get customer lifetime value
    $stmt = $db->prepare("
        SELECT
            AVG(total_spent) as average_ltv,
            MAX(total_spent) as max_ltv,
            MIN(total_spent) as min_ltv
        FROM users
        WHERE role = 'user'
        AND total_spent > 0
    ");
    $stmt->execute();
    $ltvData = $stmt->fetch();

    // Get repeat customer rate
    $stmt = $db->prepare("
        SELECT
            COUNT(*) as total_customers,
            SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) as repeat_customers
        FROM users
        WHERE role = 'user'
        AND total_orders > 0
    ");
    $stmt->execute();
    $repeatData = $stmt->fetch();

    $repeatRate = $repeatData['total_customers'] > 0
        ? ($repeatData['repeat_customers'] / $repeatData['total_customers']) * 100
        : 0;

    sendSuccess('Customer analytics retrieved successfully', [
        'period' => $period,
        'acquisition' => $customerAcquisition,
        'lifetimeValue' => [
            'average' => (float)($ltvData['average_ltv'] ?? 0),
            'max' => (float)($ltvData['max_ltv'] ?? 0),
            'min' => (float)($ltvData['min_ltv'] ?? 0)
        ],
        'repeatRate' => (float)$repeatRate
    ]);
}
