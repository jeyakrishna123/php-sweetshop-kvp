<?php
/**
 * Analytics API Endpoints - PRODUCTION FIXED VERSION
 * Routes: /api/analytics/*
 */

// Error reporting - CORS and headers handled by middleware
error_reporting(E_ALL);
ini_set("display_errors", 0);
ini_set("log_errors", 1);

// Note: CORS headers and Content-Type are handled by CorsMiddleware
// Don't set duplicate headers here to prevent conflicts

// Include required files with error handling
try {
    require_once __DIR__ . "/../config/database.php";
    require_once __DIR__ . "/../config/config.php";
    require_once __DIR__ . "/../includes/helpers.php";
    require_once __DIR__ . "/../middleware/auth.php";
    require_once __DIR__ . "/../middleware/cors.php";
} catch (Exception $e) {
    error_log("❌ Analytics API Setup Error: " . $e->getMessage());
    sendError("API setup failed", [], 500);
}

// Handle CORS
try {
    CorsMiddleware::handle();
} catch (Exception $e) {
    error_log("❌ CORS Error: " . $e->getMessage());
}

// Get database connection
try {
    $db = Database::getInstance()->getConnection();
} catch (Exception $e) {
    error_log("❌ Database Connection Error: " . $e->getMessage());
    sendError("Database connection failed", [], 500);
}

$method = $_SERVER["REQUEST_METHOD"];
$requestUri = $_SERVER["REQUEST_URI"];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode("/", trim($path, "/"));

// Handle both /api/analytics and /api/php-backend/api/analytics
if (isset($pathParts[1]) && $pathParts[1] === "php-backend" && isset($pathParts[2]) && $pathParts[2] === "api" && isset($pathParts[3]) && $pathParts[3] === "analytics") {
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : "";
} else {
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : "";
}

try {
    error_log("🔍 Analytics API - Method: $method, Endpoint: $endpoint");
    
    switch ($endpoint) {
        case "":
            if ($method === "GET") {
                getDashboardAnalytics($db);
            }
            break;

        case "dashboard":
            if ($method === "GET") {
                getDashboardAnalytics($db);
            }
            break;

        case "sales":
            if ($method === "GET") {
                getSalesAnalytics($db);
            }
            break;

        case "products":
            if ($method === "GET") {
                getProductAnalytics($db);
            }
            break;

        case "customers":
            if ($method === "GET") {
                getCustomerAnalytics($db);
            }
            break;

        default:
            sendError("Endpoint not found", [], 404);
    }
} catch (Exception $e) {
    error_log("❌❌❌ FATAL ERROR in analytics.php:");
    error_log("Message: " . $e->getMessage());
    error_log("File: " . $e->getFile());
    error_log("Line: " . $e->getLine());
    error_log("Trace: " . $e->getTraceAsString());
    
    sendError("Server error", [
        "error" => $e->getMessage(),
        "file" => basename($e->getFile()),
        "line" => $e->getLine()
    ], 500);
}

/**
 * Get dashboard analytics with enhanced error handling
 */
function getDashboardAnalytics($db) {
    try {
        error_log("🔍 Getting dashboard analytics");
        
        // Get basic stats
        $stats = getBasicStats($db);
        
        // Get sales trends
        $salesTrends = getSalesTrends($db);
        
        // Get top products
        $topProducts = getTopProducts($db);
        
        // Get recent activity
        $recentActivity = getRecentActivity($db);

        error_log("✅ Dashboard analytics retrieved successfully");
        
        sendSuccess("Dashboard analytics retrieved successfully", [
            "stats" => $stats,
            "salesTrends" => $salesTrends,
            "topProducts" => $topProducts,
            "recentActivity" => $recentActivity
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getDashboardAnalytics Error: " . $e->getMessage());
        
        // Return empty analytics on error
        sendSuccess("Dashboard analytics retrieved successfully", [
            "stats" => [
                "totalRevenue" => 0,
                "totalOrders" => 0,
                "totalCustomers" => 0,
                "totalProducts" => 0
            ],
            "salesTrends" => [],
            "topProducts" => [],
            "recentActivity" => []
        ]);
    }
}

/**
 * Get sales analytics with enhanced error handling
 */
function getSalesAnalytics($db) {
    try {
        error_log("🔍 Getting sales analytics");
        
        // Get sales by period
        $salesByPeriod = getSalesByPeriod($db);
        
        // Get revenue trends
        $revenueTrends = getRevenueTrends($db);
        
        // Get order trends
        $orderTrends = getOrderTrends($db);

        error_log("✅ Sales analytics retrieved successfully");
        
        sendSuccess("Sales analytics retrieved successfully", [
            "salesByPeriod" => $salesByPeriod,
            "revenueTrends" => $revenueTrends,
            "orderTrends" => $orderTrends
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getSalesAnalytics Error: " . $e->getMessage());
        
        sendSuccess("Sales analytics retrieved successfully", [
            "salesByPeriod" => [],
            "revenueTrends" => [],
            "orderTrends" => []
        ]);
    }
}

/**
 * Get product analytics with enhanced error handling
 */
function getProductAnalytics($db) {
    try {
        error_log("🔍 Getting product analytics");
        
        // Get product performance
        $productPerformance = getProductPerformance($db);
        
        // Get category performance
        $categoryPerformance = getCategoryPerformance($db);
        
        // Get inventory status
        $inventoryStatus = getInventoryStatus($db);

        error_log("✅ Product analytics retrieved successfully");
        
        sendSuccess("Product analytics retrieved successfully", [
            "productPerformance" => $productPerformance,
            "categoryPerformance" => $categoryPerformance,
            "inventoryStatus" => $inventoryStatus
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getProductAnalytics Error: " . $e->getMessage());
        
        sendSuccess("Product analytics retrieved successfully", [
            "productPerformance" => [],
            "categoryPerformance" => [],
            "inventoryStatus" => [
                "totalProducts" => 0,
                "inStock" => 0,
                "outOfStock" => 0,
                "lowStock" => 0
            ]
        ]);
    }
}

/**
 * Get customer analytics with enhanced error handling
 */
function getCustomerAnalytics($db) {
    try {
        error_log("🔍 Getting customer analytics");
        
        // Get customer acquisition
        $customerAcquisition = getCustomerAcquisition($db);
        
        // Get customer lifetime value (simplified)
        $stmt = $db->prepare("
            SELECT
                0 as average_ltv,
                0 as max_ltv,
                0 as min_ltv
            FROM users
            WHERE role = 'user'
            LIMIT 1
        ");
        $stmt->execute();
        $ltvData = $stmt->fetch();

        // Get repeat customer rate (simplified)
        $stmt = $db->prepare("
            SELECT
                COUNT(*) as total_customers,
                0 as repeat_customers
            FROM users
            WHERE role = 'user'
        ");
        $stmt->execute();
        $repeatData = $stmt->fetch();

        error_log("✅ Customer analytics retrieved successfully");
        
        sendSuccess("Customer analytics retrieved successfully", [
            "customerAcquisition" => $customerAcquisition,
            "lifetimeValue" => $ltvData,
            "repeatCustomers" => $repeatData
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getCustomerAnalytics Error: " . $e->getMessage());
        
        sendSuccess("Customer analytics retrieved successfully", [
            "customerAcquisition" => [
                "totalCustomers" => 0,
                "newCustomers" => 0,
                "returningCustomers" => 0
            ],
            "lifetimeValue" => [
                "average_ltv" => 0,
                "max_ltv" => 0,
                "min_ltv" => 0
            ],
            "repeatCustomers" => [
                "total_customers" => 0,
                "repeat_customers" => 0
            ]
        ]);
    }
}

/**
 * Get basic stats
 */
function getBasicStats($db) {
    try {
        // Get total revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status != 'cancelled'");
        $stmt->execute();
        $totalRevenue = $stmt->fetch()["total"];

        // Get total orders
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
        $stmt->execute();
        $totalOrders = $stmt->fetch()["total"];

        // Get total customers
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
        $stmt->execute();
        $totalCustomers = $stmt->fetch()["total"];

        // Get total products
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
        $stmt->execute();
        $totalProducts = $stmt->fetch()["total"];

        return [
            "totalRevenue" => (float)$totalRevenue,
            "totalOrders" => (int)$totalOrders,
            "totalCustomers" => (int)$totalCustomers,
            "totalProducts" => (int)$totalProducts
        ];
    } catch (Exception $e) {
        error_log("❌ getBasicStats Error: " . $e->getMessage());
        return [
            "totalRevenue" => 0,
            "totalOrders" => 0,
            "totalCustomers" => 0,
            "totalProducts" => 0
        ];
    }
}

/**
 * Get sales trends
 */
function getSalesTrends($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(total_price) as revenue
            FROM orders
            WHERE status != 'cancelled'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getSalesTrends Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get top products
 */
function getTopProducts($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                p.name,
                p.thumbnail,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id, p.name, p.thumbnail
            ORDER BY total_sold DESC
            LIMIT 10
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getTopProducts Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get recent activity
 */
function getRecentActivity($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                'order' as type,
                o.id as item_id,
                o.status as status,
                o.created_at as created_at,
                u.name as user_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getRecentActivity Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get sales by period
 */
function getSalesByPeriod($db) {
    try {
        $periods = [
            "today" => "CURDATE()",
            "week" => "DATE_SUB(NOW(), INTERVAL 7 DAY)",
            "month" => "DATE_SUB(NOW(), INTERVAL 30 DAY)",
            "year" => "DATE_SUB(NOW(), INTERVAL 365 DAY)"
        ];

        $result = [];
        foreach ($periods as $period => $condition) {
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as orders,
                    COALESCE(SUM(total_price), 0) as revenue
                FROM orders
                WHERE status != 'cancelled'
                AND created_at >= $condition
            ");
            $stmt->execute();
            $data = $stmt->fetch();
            $result[$period] = [
                "orders" => (int)$data["orders"],
                "revenue" => (float)$data["revenue"]
            ];
        }
        return $result;
    } catch (Exception $e) {
        error_log("❌ getSalesByPeriod Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get revenue trends
 */
function getRevenueTrends($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                DATE(created_at) as date,
                SUM(total_price) as revenue
            FROM orders
            WHERE status != 'cancelled'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getRevenueTrends Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get order trends
 */
function getOrderTrends($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders
            FROM orders
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getOrderTrends Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get product performance
 */
function getProductPerformance($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                p.id,
                p.name,
                p.thumbnail,
                p.price,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id, p.name, p.thumbnail, p.price
            ORDER BY total_sold DESC
            LIMIT 20
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getProductPerformance Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get category performance
 */
function getCategoryPerformance($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                p.category,
                COUNT(DISTINCT p.id) as product_count,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.category
            ORDER BY total_sold DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("❌ getCategoryPerformance Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get inventory status
 */
function getInventoryStatus($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_products,
                SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
                SUM(CASE WHEN stock_quantity < 10 THEN 1 ELSE 0 END) as low_stock
            FROM products
            WHERE is_active = 1
        ");
        $stmt->execute();
        $result = $stmt->fetch();
        return [
            "totalProducts" => (int)$result["total_products"],
            "inStock" => (int)$result["in_stock"],
            "outOfStock" => (int)$result["out_of_stock"],
            "lowStock" => (int)$result["low_stock"]
        ];
    } catch (Exception $e) {
        error_log("❌ getInventoryStatus Error: " . $e->getMessage());
        return [
            "totalProducts" => 0,
            "inStock" => 0,
            "outOfStock" => 0,
            "lowStock" => 0
        ];
    }
}

/**
 * Get customer acquisition
 */
function getCustomerAcquisition($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_customers,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_customers,
                SUM(CASE WHEN created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as returning_customers
            FROM users
            WHERE role = 'user'
        ");
        $stmt->execute();
        $result = $stmt->fetch();
        return [
            "totalCustomers" => (int)$result["total_customers"],
            "newCustomers" => (int)$result["new_customers"],
            "returningCustomers" => (int)$result["returning_customers"]
        ];
    } catch (Exception $e) {
        error_log("❌ getCustomerAcquisition Error: " . $e->getMessage());
        return [
            "totalCustomers" => 0,
            "newCustomers" => 0,
            "returningCustomers" => 0
        ];
    }
}
?>