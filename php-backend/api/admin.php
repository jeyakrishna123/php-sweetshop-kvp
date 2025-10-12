<?php
/**
 * Admin API Endpoints
 * Routes: /api/admin/*
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

// Get path after /api/admin/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/admin and /api/php-backend/api/admin
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'admin') {
    // Handle /api/php-backend/api/admin
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/admin
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case 'dashboard':
            if ($method === 'GET') {
                getDashboardStats($db);
            }
            break;

        case 'analytics':
            if ($method === 'GET') {
                getAnalytics($db);
            }
            break;

        case 'order-stats':
            if ($method === 'GET') {
                getOrderStats($db);
            }
            break;

        case 'user-stats':
            if ($method === 'GET') {
                getUserStats($db);
            }
            break;

        case 'users':
            if ($method === 'GET') {
                getAllUsers($db);
            }
            break;

        case 'customers':
            if ($method === 'GET') {
                getAllCustomers($db);
            }
            break;

        case 'reports':
            if ($method === 'GET') {
                // Check for reports/generate sub-endpoint
                $subEndpoint = '';
                if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'admin') {
                    // Handle /api/php-backend/api/admin/reports/generate
                    $subEndpoint = isset($pathParts[6]) ? $pathParts[6] : '';
                } else {
                    // Handle /api/admin/reports/generate
                    $subEndpoint = isset($pathParts[4]) ? $pathParts[4] : '';
                }
                
                if ($subEndpoint === 'generate') {
                    generateReport($db);
                } else {
                    getReports($db);
                }
            }
            break;

        case 'orders':
            if ($method === 'GET') {
                getAllOrders($db);
            }
            break;

        case 'inventory':
            if ($method === 'GET') {
                getInventoryStatus($db);
            }
            break;

        case 'banners':
            if ($method === 'GET') {
                getAllBanners($db);
            }
            break;

        case 'marketing':
            if ($method === 'GET') {
                getMarketingData($db);
            }
            break;

        default:
            sendError('Endpoint not found', [], 404);
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get dashboard statistics (Admin only)
 */
function getDashboardStats($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Get total users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];

    // Get total products
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $stmt->execute();
    $totalProducts = $stmt->fetch()['total'];

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
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM orders
        WHERE status = 'pending'
    ");
    $stmt->execute();
    $pendingOrders = $stmt->fetch()['total'];

    // Get today's orders
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM orders
        WHERE DATE(created_at) = CURDATE()
    ");
    $stmt->execute();
    $todayOrders = $stmt->fetch()['total'];

    // Get today's revenue
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE DATE(created_at) = CURDATE()
        AND status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute();
    $todayRevenue = $stmt->fetch()['total'] ?? 0;

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

    // Get recent orders
    $stmt = $db->prepare("
        SELECT o.id, o.tracking_number, o.status, o.total_price, o.created_at,
               u.name as user_name, u.email as user_email
        FROM orders o
        INNER JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recentOrders = $stmt->fetchAll();

    sendSuccess('Dashboard statistics retrieved successfully', [
        'stats' => [
            'totalUsers' => (int)$totalUsers,
            'totalProducts' => (int)$totalProducts,
            'totalOrders' => (int)$totalOrders,
            'totalRevenue' => (float)$totalRevenue,
            'pendingOrders' => (int)$pendingOrders,
            'todayOrders' => (int)$todayOrders,
            'todayRevenue' => (float)$todayRevenue,
            'lowStockProducts' => (int)$lowStockProducts,
            'outOfStockProducts' => (int)$outOfStockProducts
        ],
        'recentOrders' => $recentOrders
    ]);
}

/**
 * Get analytics data (Admin only)
 */
function getAnalytics($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
    if (!isset($_GET['range'])) {
        $days = 30; // Default
    } else {
        $days = (int)$_GET['range'];
    }

    // Get total sales
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute();
    $totalSales = $stmt->fetch()['total'] ?? 0;

    // Get total orders
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
    $stmt->execute();
    $totalOrders = $stmt->fetch()['total'];

    // Get average order value
    $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

    // Get total customers
    $stmt = $db->prepare("SELECT COUNT(DISTINCT user_id) as total FROM orders");
    $stmt->execute();
    $totalCustomers = $stmt->fetch()['total'] ?? 0;

    // Get active users (users with orders in last 30 days)
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT user_id) as total
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $activeUsers = $stmt->fetch()['total'] ?? 0;

    // Get new users this month
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM users
        WHERE DATE(created_at) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    ");
    $stmt->execute();
    $newUsers = $stmt->fetch()['total'] ?? 0;

    // Get total users
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetch()['total'];

    // Get total profit (assuming 30% margin)
    $totalProfit = $totalSales * 0.3;

    // Get daily revenue for last N days
    $stmt = $db->prepare("
        SELECT
            DATE(created_at) as date,
            SUM(total_price) as revenue,
            COUNT(*) as orders
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status IN ('delivered', 'shipped', 'processing')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$days]);
    $dailySales = $stmt->fetchAll();

    // Get orders by status
    $stmt = $db->prepare("
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
    ");
    $stmt->execute();
    $ordersByStatusArray = $stmt->fetchAll();

    // Convert to object format
    $orderStatuses = [];
    foreach ($ordersByStatusArray as $row) {
        $orderStatuses[$row['status']] = (int)$row['count'];
    }

    // Get top selling products
    $stmt = $db->prepare("
        SELECT
            p.id as _id, p.name, p.thumbnail as image, p.price,
            SUM(oi.quantity) as sales
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('delivered', 'shipped', 'processing')
        GROUP BY p.id, p.name, p.thumbnail, p.price
        ORDER BY sales DESC
        LIMIT 10
    ");
    $stmt->execute();
    $topProducts = $stmt->fetchAll();

    // Get sales by month
    $stmt = $db->prepare("
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(total_price) as revenue,
            COUNT(*) as orders
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND status IN ('delivered', 'shipped', 'processing')
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $stmt->execute();
    $salesByMonth = $stmt->fetchAll();

    // Get recent orders
    $stmt = $db->prepare("
        SELECT o.id as _id, o.tracking_number, o.status, o.total_price as totalAmount, o.created_at as createdAt,
               u.name as customerName, u.email as customerEmail
        FROM orders o
        INNER JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recentOrders = $stmt->fetchAll();

    // Calculate advanced metrics
    $conversionRate = $totalUsers > 0 ? ($totalOrders / $totalUsers) * 100 : 0;
    $customerLTV = $totalCustomers > 0 ? $totalSales / $totalCustomers : 0;
    $orderFrequency = $totalCustomers > 0 ? $totalOrders / $totalCustomers : 0;
    $profitMargin = $totalSales > 0 ? ($totalProfit / $totalSales) * 100 : 0;

    // Calculate growth rate (compare last period with previous period)
    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND created_at < CURDATE()
        AND status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute([$days]);
    $currentPeriodSales = $stmt->fetch()['total'] ?? 0;

    $stmt = $db->prepare("
        SELECT SUM(total_price) as total
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status IN ('delivered', 'shipped', 'processing')
    ");
    $stmt->execute([$days * 2, $days]);
    $previousPeriodSales = $stmt->fetch()['total'] ?? 0;

    $growthRate = $previousPeriodSales > 0 ? (($currentPeriodSales - $previousPeriodSales) / $previousPeriodSales) * 100 : 0;

    // Calculate daily average
    $dailyAverageSales = $days > 0 ? $currentPeriodSales / $days : 0;

    // Find peak sales day
    $peakSalesDay = null;
    $maxSales = 0;
    foreach ($dailySales as $day) {
        if ($day['revenue'] > $maxSales) {
            $maxSales = $day['revenue'];
            $peakSalesDay = [
                'date' => $day['date'],
                'revenue' => $day['revenue']
            ];
        }
    }

    $analyticsData = [
        'totalSales' => (float)$totalSales,
        'totalOrders' => (int)$totalOrders,
        'averageOrderValue' => (float)$averageOrderValue,
        'totalCustomers' => (int)$totalCustomers,
        'activeUsers' => (int)$activeUsers,
        'newUsers' => (int)$newUsers,
        'totalUsers' => (int)$totalUsers,
        'totalProfit' => (float)$totalProfit,
        'topProducts' => $topProducts,
        'dailySales' => $dailySales,
        'salesByMonth' => $salesByMonth,
        'orderStatuses' => $orderStatuses,
        'recentOrders' => $recentOrders,
        'conversionRate' => (float)$conversionRate,
        'customerLTV' => (float)$customerLTV,
        'orderFrequency' => (float)$orderFrequency,
        'profitMargin' => (float)$profitMargin,
        'growthRate' => (float)$growthRate,
        'dailyAverageSales' => (float)$dailyAverageSales,
        'peakSalesDay' => $peakSalesDay,
        'period' => $days . ' days'
    ];

    sendSuccess('Analytics data retrieved successfully', [
        'analytics' => $analyticsData
    ]);
}

/**
 * Get order statistics (Admin only)
 */
function getOrderStats($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(total_price) as total_revenue,
            AVG(total_price) as average_order_value
        FROM orders
    ");
    $stmt->execute();
    $stats = $stmt->fetch();

    sendSuccess('Order statistics retrieved successfully', ['stats' => $stats]);
}

/**
 * Get user statistics (Admin only)
 */
function getUserStats($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
            SUM(CASE WHEN is_email_verified = 1 THEN 1 ELSE 0 END) as verified_users,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_registrations
        FROM users
    ");
    $stmt->execute();
    $stats = $stmt->fetch();

    sendSuccess('User statistics retrieved successfully', ['stats' => $stats]);
}

/**
 * Get all users (Admin only)
 */
function getAllUsers($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Get total count
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $total = $stmt->fetch()['total'];

    // Get users
    $stmt = $db->prepare("
        SELECT id, name, email, phone, role, is_active, is_email_verified,
               total_orders, total_spent, last_login, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$limit, $offset]);
    $users = $stmt->fetchAll();

    sendSuccess('Users retrieved successfully', [
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Get all customers (Admin only)
 */
function getAllCustomers($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT id, name, email, phone, total_orders, total_spent,
               last_order_date, created_at
        FROM users
        WHERE role = 'user' AND total_orders > 0
        ORDER BY total_spent DESC
    ");
    $stmt->execute();
    $customers = $stmt->fetchAll();

    sendSuccess('Customers retrieved successfully', [
        'customers' => $customers,
        'count' => count($customers)
    ]);
}

/**
 * Get inventory status (Admin only)
 */
function getInventoryStatus($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Get low stock products
    $stmt = $db->prepare("
        SELECT id, name, sku, stock, category, price
        FROM products
        WHERE stock <= 5 AND stock > 0 AND is_active = 1
        ORDER BY stock ASC
    ");
    $stmt->execute();
    $lowStock = $stmt->fetchAll();

    // Get out of stock products
    $stmt = $db->prepare("
        SELECT id, name, sku, category, price
        FROM products
        WHERE stock = 0 AND is_active = 1
        ORDER BY name ASC
    ");
    $stmt->execute();
    $outOfStock = $stmt->fetchAll();

    // Get inventory summary
    $stmt = $db->prepare("
        SELECT
            COUNT(*) as total_products,
            SUM(stock) as total_stock,
            SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
            SUM(CASE WHEN stock <= 5 AND stock > 0 THEN 1 ELSE 0 END) as low_stock
        FROM products
        WHERE is_active = 1
    ");
    $stmt->execute();
    $summary = $stmt->fetch();

    sendSuccess('Inventory status retrieved successfully', [
        'summary' => $summary,
        'lowStock' => $lowStock,
        'outOfStock' => $outOfStock
    ]);
}

/**
 * Get reports (Admin only)
 */
function getReports($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $type = isset($_GET['type']) ? $_GET['type'] : 'sales';
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01');
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');

    if ($type === 'sales') {
        $stmt = $db->prepare("
            SELECT
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(total_price) as revenue,
                AVG(total_price) as avg_order_value
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            AND status IN ('delivered', 'shipped', 'processing')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll();
    } elseif ($type === 'products') {
        $stmt = $db->prepare("
            SELECT
                p.id, p.name, p.category,
                SUM(oi.quantity) as sold,
                SUM(oi.price * oi.quantity) as revenue
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.id
            INNER JOIN orders o ON oi.order_id = o.id
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            GROUP BY p.id, p.name, p.category
            ORDER BY revenue DESC
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll();
    } else {
        $data = [];
    }

    sendSuccess('Report generated successfully', [
        'type' => $type,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'data' => $data
    ]);
}

/**
 * Generate report (Admin only)
 */
function generateReport($db) {
    getReports($db);
}

/**
 * Get all orders (Admin only)
 */
function getAllOrders($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
    $offset = ($page - 1) * $limit;
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    // Build query
    $query = "
        SELECT o.id, o.tracking_number, o.status, o.shipping_method,
               o.total_price, o.items_price, o.tax_price, o.shipping_price, o.discount_amount,
               o.customer_notes, o.admin_notes, o.coupon_code, o.coupon_discount,
               o.estimated_delivery, o.actual_delivery, o.is_cancelled, o.cancellation_reason,
               o.created_at, o.updated_at,
               u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
        FROM orders o
        INNER JOIN users u ON o.user_id = u.id
    ";

    $params = [];

    if ($status) {
        $query .= " WHERE o.status = ?";
        $params[] = $status;
    }

    $query .= " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    // Get orders
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    // Get order items for each order
    foreach ($orders as &$order) {
        $stmt = $db->prepare("
            SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.weight,
                   p.name as product_name, p.thumbnail as product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$order['id']]);
        $order['items'] = $stmt->fetchAll();
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM orders o";
    if ($status) {
        $countQuery .= " WHERE o.status = ?";
        $stmt = $db->prepare($countQuery);
        $stmt->execute([$status]);
    } else {
        $stmt = $db->prepare($countQuery);
        $stmt->execute();
    }
    $total = $stmt->fetch()['total'];

    sendSuccess('Orders retrieved successfully', [
        'orders' => $orders,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Get all banners (Admin only)
 */
function getAllBanners($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if banners table exists
    try {
        $stmt = $db->prepare("SHOW TABLES LIKE 'banners'");
        $stmt->execute();
        $tableExists = $stmt->fetch();

        if (!$tableExists) {
            // Return empty response if table doesn't exist
            sendSuccess('Banners retrieved successfully', [
                'banners' => [],
                'count' => 0,
                'note' => 'Banners table not yet created'
            ]);
            return;
        }

        // Get all banners
        $stmt = $db->prepare("
            SELECT id, title, subtitle, image_url, link_url, button_text,
                   is_active, display_order, created_at, updated_at
            FROM banners
            ORDER BY display_order ASC, created_at DESC
        ");
        $stmt->execute();
        $banners = $stmt->fetchAll();

        sendSuccess('Banners retrieved successfully', [
            'banners' => $banners,
            'count' => count($banners)
        ]);
    } catch (Exception $e) {
        // Return empty response on error
        sendSuccess('Banners retrieved successfully', [
            'banners' => [],
            'count' => 0,
            'note' => 'Banners feature not yet configured'
        ]);
    }
}

/**
 * Get marketing data (Admin only)
 */
function getMarketingData($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Get email marketing stats (simulated - replace with actual email service integration)
    $emailStats = [
        'totalSubscribers' => 0,
        'activeSubscribers' => 0,
        'emailsSent' => 0,
        'openRate' => 0,
        'clickRate' => 0
    ];

    // Try to get user email stats
    try {
        $stmt = $db->prepare("
            SELECT
                COUNT(*) as total_users,
                SUM(CASE WHEN is_email_verified = 1 THEN 1 ELSE 0 END) as verified_emails
            FROM users
            WHERE role = 'user'
        ");
        $stmt->execute();
        $userStats = $stmt->fetch();

        $emailStats['totalSubscribers'] = (int)$userStats['total_users'];
        $emailStats['activeSubscribers'] = (int)$userStats['verified_emails'];
    } catch (Exception $e) {
        // Use default values
    }

    // Get campaign performance (simulated)
    $campaigns = [
        [
            'id' => 1,
            'name' => 'Welcome Email Campaign',
            'status' => 'active',
            'sent' => 0,
            'opens' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ];

    // Get product promotion stats
    $stmt = $db->prepare("
        SELECT
            COUNT(*) as total_products,
            SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured_products,
            SUM(CASE WHEN discount_percentage > 0 THEN 1 ELSE 0 END) as discounted_products
        FROM products
        WHERE is_active = 1
    ");
    $stmt->execute();
    $productStats = $stmt->fetch();

    // Get social media insights (simulated - replace with actual API integration)
    $socialStats = [
        'facebook' => [
            'followers' => 0,
            'engagement' => 0,
            'posts' => 0
        ],
        'instagram' => [
            'followers' => 0,
            'engagement' => 0,
            'posts' => 0
        ],
        'twitter' => [
            'followers' => 0,
            'engagement' => 0,
            'tweets' => 0
        ]
    ];

    // Get customer acquisition stats
    $stmt = $db->prepare("
        SELECT
            COUNT(*) as new_customers,
            SUM(total_orders) as total_orders,
            SUM(total_spent) as total_revenue
        FROM users
        WHERE role = 'user'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $acquisitionStats = $stmt->fetch();

    sendSuccess('Marketing data retrieved successfully', [
        'emailMarketing' => $emailStats,
        'campaigns' => $campaigns,
        'productPromotions' => $productStats,
        'socialMedia' => $socialStats,
        'customerAcquisition' => [
            'newCustomers' => (int)$acquisitionStats['new_customers'],
            'orders' => (int)$acquisitionStats['total_orders'],
            'revenue' => (float)$acquisitionStats['total_revenue'],
            'period' => 'Last 30 days'
        ]
    ]);
}
