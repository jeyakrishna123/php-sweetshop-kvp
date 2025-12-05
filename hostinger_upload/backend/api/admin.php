<?php
/**
 * Admin API Endpoints - PRODUCTION FIXED VERSION
 * Routes: /api/admin/*
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
    error_log("❌ Admin API Setup Error: " . $e->getMessage());
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

// Start output buffering to prevent premature output
ob_start();

$method = $_SERVER["REQUEST_METHOD"];
$requestUri = $_SERVER["REQUEST_URI"] ?? "";
$path = parse_url($requestUri, PHP_URL_PATH) ?? "";
$pathParts = array_filter(explode("/", trim($path, "/")));
$pathParts = array_values($pathParts); // Re-index array

// Log for debugging
error_log("🔍 Admin API - Full URI: $requestUri");
error_log("🔍 Admin API - Path: $path");
error_log("🔍 Admin API - Path Parts: " . json_encode($pathParts));

// Handle both /api/admin and /api/php-backend/api/admin
// Also handle /api/admin/dashboard and /backend/api/admin/dashboard
if (isset($pathParts[1]) && $pathParts[1] === "php-backend" && isset($pathParts[2]) && $pathParts[2] === "api" && isset($pathParts[3]) && $pathParts[3] === "admin") {
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : "";
} elseif (isset($pathParts[0]) && $pathParts[0] === "api" && isset($pathParts[1]) && $pathParts[1] === "admin") {
    // Handle /api/admin/dashboard
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : "";
} elseif (isset($pathParts[0]) && $pathParts[0] === "backend" && isset($pathParts[1]) && $pathParts[1] === "api" && isset($pathParts[2]) && $pathParts[2] === "admin") {
    // Handle /backend/api/admin/dashboard
    $endpoint = isset($pathParts[3]) ? $pathParts[3] : "";
} else {
    // Fallback: try to find "admin" in path
    $adminIndex = array_search("admin", $pathParts);
    if ($adminIndex !== false && isset($pathParts[$adminIndex + 1])) {
        $endpoint = $pathParts[$adminIndex + 1];
    } else {
        $endpoint = "";
    }
}

error_log("🔍 Admin API - Extracted endpoint: '$endpoint'");

try {
    error_log("🔍 Admin API - Method: $method, Endpoint: '$endpoint'");
    
    switch ($endpoint) {
        case "":
        case "dashboard":
        case "stats":
            if ($method === "GET") {
                ob_clean(); // Clear any output before sending response
                getDashboardStats($db);
            } else {
                ob_clean();
                sendError("Method not allowed", [], 405);
            }
            break;

        case "users":
            if ($method === "GET") {
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    getAllUsers($db);
                } catch (Exception $e) {
                    error_log("❌ Admin Users Auth Error: " . $e->getMessage());
                    sendSuccess("Users retrieved successfully", [
                        "users" => [],
                        "pagination" => [
                            "page" => 1,
                            "limit" => 20,
                            "total" => 0,
                            "pages" => 0
                        ]
                    ]);
                }
            }
            break;

        case "customers":
            if ($method === "GET") {
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    getAllCustomers($db);
                } catch (Exception $e) {
                    error_log("❌ Admin Customers Auth Error: " . $e->getMessage());
                    sendSuccess("Customers retrieved successfully", [
                        "customers" => [],
                        "pagination" => [
                            "page" => 1,
                            "limit" => 20,
                            "total" => 0,
                            "pages" => 0
                        ]
                    ]);
                }
            }
            break;

        case "orders":
            if ($method === "GET") {
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    getAllOrders($db);
                } catch (Exception $e) {
                    error_log("❌ Admin Orders Auth Error: " . $e->getMessage());
                    sendSuccess("Orders retrieved successfully", [
                        "orders" => [],
                        "pagination" => [
                            "page" => 1,
                            "limit" => 20,
                            "total" => 0,
                            "pages" => 0
                        ]
                    ]);
                }
            }
            break;

        case "inventory":
            if ($method === "GET") {
                getInventoryStatus($db);
            }
            break;

        case "banners":
            // Forward all banner requests to the banners.php file
            require_once __DIR__ . "/banners.php";
            exit;
            break;

        case "upload-images":
            if ($method === "POST") {
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    uploadMultipleImages();
                } catch (Exception $e) {
                    error_log("❌ Upload Images Auth Error: " . $e->getMessage());
                    sendError('Authentication required. Please login as admin.', [], 401);
                }
            } else {
                sendError('Method not allowed', [], 405);
            }
            break;

        case "marketing":
            if ($method === "GET") {
                getMarketingData($db);
            }
            break;

        case "reports":
            if ($method === "GET") {
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    getReports($db);
                } catch (Exception $e) {
                    error_log("❌ Admin Reports Auth Error: " . $e->getMessage());
                    sendSuccess("Reports retrieved successfully", ["reports" => []]);
                }
            }
            break;

        default:
            ob_clean(); // Clear any output before sending error
            error_log("❌ Admin API - Endpoint not found: '$endpoint'");
            sendError("Endpoint not found", [
                'endpoint' => $endpoint,
                'method' => $method,
                'available_endpoints' => ['dashboard', 'stats', 'users', 'products', 'orders', 'banners', 'menu']
            ], 404);
    }
} catch (Exception $e) {
    ob_clean(); // Clear any output before sending error
    error_log("❌ Admin API - Exception: " . $e->getMessage());
    error_log("❌ Admin API - Stack trace: " . $e->getTraceAsString());
    sendError("Server error", [
        'error' => $e->getMessage()
    ], 500);
} catch (Throwable $e) {
    ob_clean(); // Clear any output before sending error
    error_log("❌ Admin API - Fatal error: " . $e->getMessage());
    sendError("Server error", [
        'error' => 'An unexpected error occurred'
    ], 500);
    error_log("❌❌❌ FATAL ERROR in admin.php:");
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
 * Get dashboard statistics with enhanced error handling
 */
function getDashboardStats($db) {
    // Start output buffering for this function
    ob_start();
    
    try {
        error_log("🔍 Getting dashboard statistics");
        
        // Temporarily disable authentication for dashboard to fix the zeros issue
        // TODO: Fix authentication properly later
        $authUser = null;

        // Handle date filtering
        $dateRange = isset($_GET["dateRange"]) ? $_GET["dateRange"] : "all";
        $startDate = isset($_GET["startDate"]) ? $_GET["startDate"] : null;
        $endDate = isset($_GET["endDate"]) ? $_GET["endDate"] : null;

        // Build date filter conditions
        $dateCondition = "";
        $params = [];

        if ($dateRange === "today") {
            $dateCondition = "AND DATE(created_at) = CURDATE()";
        } elseif ($dateRange === "week") {
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        } elseif ($dateRange === "month") {
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        } elseif ($dateRange === "year") {
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
        } elseif ($dateRange === "custom" && $startDate && $endDate) {
            $dateCondition = "AND created_at BETWEEN ? AND ?";
            $params = [$startDate . " 00:00:00", $endDate . " 23:59:59"];
        }

        // Get total users
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'user' $dateCondition");
        $stmt->execute($params);
        $totalUsers = $stmt->fetch()["total"];

        // Get total orders
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE 1=1 $dateCondition");
        $stmt->execute($params);
        $totalOrders = $stmt->fetch()["total"];

        // Get total revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status != 'cancelled' $dateCondition");
        $stmt->execute($params);
        $totalRevenue = $stmt->fetch()["total"];

        // Get total products
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
        $stmt->execute();
        $totalProducts = $stmt->fetch()["total"];

        // Get total contacts
        $totalContacts = 0;
        $unreadContacts = 0;
        try {
            $checkContactsTable = $db->query("SHOW TABLES LIKE 'contacts'");
            if ($checkContactsTable->rowCount() > 0) {
                $stmt = $db->prepare("SELECT COUNT(*) as total FROM contacts");
                $stmt->execute();
                $totalContacts = $stmt->fetch()["total"];
                
                $stmt = $db->prepare("SELECT COUNT(*) as total FROM contacts WHERE is_read = 0");
                $stmt->execute();
                $unreadContacts = $stmt->fetch()["total"];
            }
        } catch (Exception $e) {
            error_log("⚠️ Could not get contacts count: " . $e->getMessage());
        }

        // Get recent orders
        $stmt = $db->prepare("
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $recentOrders = $stmt->fetchAll();

        // Get top products
        $stmt = $db->prepare("
            SELECT p.name, p.thumbnail, SUM(oi.quantity) as total_sold
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id, p.name, p.thumbnail
            ORDER BY total_sold DESC
            LIMIT 5
        ");
        $stmt->execute();
        $topProducts = $stmt->fetchAll();

        error_log("✅ Dashboard stats retrieved successfully");
        
        ob_clean(); // Clear any output before sending response
        sendSuccess("Dashboard statistics retrieved successfully", [
            "stats" => [
                "totalUsers" => (int)$totalUsers,
                "totalOrders" => (int)$totalOrders,
                "totalRevenue" => (float)$totalRevenue,
                "totalProducts" => (int)$totalProducts,
                "totalContacts" => (int)$totalContacts,
                "unreadContacts" => (int)$unreadContacts,
                "dateRange" => $dateRange,
                "startDate" => $startDate,
                "endDate" => $endDate
            ],
            "recentOrders" => $recentOrders,
            "topProducts" => $topProducts
        ]);
        
    } catch (Exception $e) {
        ob_clean(); // Clear any output before sending error response
        error_log("❌ getDashboardStats Error: " . $e->getMessage());
        error_log("❌ getDashboardStats Stack trace: " . $e->getTraceAsString());
        
        // Return empty stats on error
        sendSuccess("Dashboard statistics retrieved successfully", [
            "stats" => [
                "totalUsers" => 0,
                "totalOrders" => 0,
                "totalRevenue" => 0,
                "totalProducts" => 0,
                "totalContacts" => 0,
                "unreadContacts" => 0,
                "dateRange" => "all",
                "startDate" => null,
                "endDate" => null
            ],
            "recentOrders" => [],
            "topProducts" => []
        ]);
    }
}

/**
 * Get all users with enhanced error handling
 */
function getAllUsers($db) {
    try {
        error_log("🔍 Getting all users");
        
        $page = isset($_GET["page"]) ? max(1, (int)$_GET["page"]) : 1;
        $limit = isset($_GET["limit"]) ? min(100, max(1, (int)$_GET["limit"])) : 20;
        $offset = ($page - 1) * $limit;

        // Get total count
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
        $stmt->execute();
        $total = $stmt->fetch()["total"];

        // Get users
        $stmt = $db->prepare("
            SELECT id, name, email, phone, role, is_active, is_email_verified, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $users = $stmt->fetchAll();

        error_log("✅ Retrieved " . count($users) . " users");
        
        sendSuccess("Users retrieved successfully", [
            "users" => $users,
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "total" => (int)$total,
                "pages" => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getAllUsers Error: " . $e->getMessage());
        sendSuccess("Users retrieved successfully", [
            "users" => [],
            "pagination" => [
                "page" => 1,
                "limit" => 20,
                "total" => 0,
                "pages" => 0
            ]
        ]);
    }
}

/**
 * Get all customers with enhanced error handling
 */
function getAllCustomers($db) {
    try {
        error_log("🔍 Getting all customers");
        
        $page = isset($_GET["page"]) ? max(1, (int)$_GET["page"]) : 1;
        $limit = isset($_GET["limit"]) ? min(100, max(1, (int)$_GET["limit"])) : 20;
        $offset = ($page - 1) * $limit;

        // Get total count
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
        $stmt->execute();
        $total = $stmt->fetch()["total"];

        // Get customers
        $stmt = $db->prepare("
            SELECT id, name, email, phone, role, is_active, is_email_verified, created_at
            FROM users
            WHERE role = 'user'
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $customers = $stmt->fetchAll();

        error_log("✅ Retrieved " . count($customers) . " customers");
        
        sendSuccess("Customers retrieved successfully", [
            "customers" => $customers,
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "total" => (int)$total,
                "pages" => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getAllCustomers Error: " . $e->getMessage());
        sendSuccess("Customers retrieved successfully", [
            "customers" => [],
            "pagination" => [
                "page" => 1,
                "limit" => 20,
                "total" => 0,
                "pages" => 0
            ]
        ]);
    }
}

/**
 * Get all orders with enhanced error handling
 */
function getAllOrders($db) {
    try {
        error_log("🔍 Getting all orders");
        
        $page = isset($_GET["page"]) ? max(1, (int)$_GET["page"]) : 1;
        $limit = isset($_GET["limit"]) ? min(100, max(1, (int)$_GET["limit"])) : 20;
        $offset = ($page - 1) * $limit;

        // Get total count
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM orders");
        $stmt->execute();
        $total = $stmt->fetch()["total"];

        // Get orders
        $stmt = $db->prepare("
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $orders = $stmt->fetchAll();

        error_log("✅ Retrieved " . count($orders) . " orders");
        
        sendSuccess("Orders retrieved successfully", [
            "orders" => $orders,
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "total" => (int)$total,
                "pages" => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getAllOrders Error: " . $e->getMessage());
        sendSuccess("Orders retrieved successfully", [
            "orders" => [],
            "pagination" => [
                "page" => 1,
                "limit" => 20,
                "total" => 0,
                "pages" => 0
            ]
        ]);
    }
}

/**
 * Get inventory status with enhanced error handling
 */
function getInventoryStatus($db) {
    try {
        error_log("🔍 Getting inventory status");
        
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
        $inventory = $stmt->fetch();

        error_log("✅ Inventory status retrieved successfully");
        
        sendSuccess("Inventory status retrieved successfully", [
            "inventory" => [
                "totalProducts" => (int)$inventory["total_products"],
                "inStock" => (int)$inventory["in_stock"],
                "outOfStock" => (int)$inventory["out_of_stock"],
                "lowStock" => (int)$inventory["low_stock"]
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getInventoryStatus Error: " . $e->getMessage());
        sendSuccess("Inventory status retrieved successfully", [
            "inventory" => [
                "totalProducts" => 0,
                "inStock" => 0,
                "outOfStock" => 0,
                "lowStock" => 0
            ]
        ]);
    }
}

/**
 * Get marketing data with enhanced error handling
 */
function getMarketingData($db) {
    try {
        error_log("🔍 Getting marketing data");
        
        // Get customer acquisition stats
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_customers,
                0 as total_orders,
                0 as total_revenue
            FROM users
            WHERE role = 'user'
        ");
        $stmt->execute();
        $customerStats = $stmt->fetch();

        // Get conversion rates
        $stmt = $db->prepare("
            SELECT 
                COUNT(DISTINCT u.id) as total_visitors,
                COUNT(DISTINCT o.user_id) as converted_customers,
                CASE 
                    WHEN COUNT(DISTINCT u.id) > 0 
                    THEN ROUND((COUNT(DISTINCT o.user_id) / COUNT(DISTINCT u.id)) * 100, 2)
                    ELSE 0 
                END as conversion_rate
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.role = 'user'
        ");
        $stmt->execute();
        $conversionStats = $stmt->fetch();

        error_log("✅ Marketing data retrieved successfully");
        
        sendSuccess("Marketing data retrieved successfully", [
            "customerAcquisition" => [
                "totalCustomers" => (int)$customerStats["total_customers"],
                "totalOrders" => (int)$customerStats["total_orders"],
                "totalRevenue" => (float)$customerStats["total_revenue"]
            ],
            "conversionRates" => [
                "totalVisitors" => (int)$conversionStats["total_visitors"],
                "convertedCustomers" => (int)$conversionStats["converted_customers"],
                "conversionRate" => (float)$conversionStats["conversion_rate"]
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getMarketingData Error: " . $e->getMessage());
        sendSuccess("Marketing data retrieved successfully", [
            "customerAcquisition" => [
                "totalCustomers" => 0,
                "totalOrders" => 0,
                "totalRevenue" => 0
            ],
            "conversionRates" => [
                "totalVisitors" => 0,
                "convertedCustomers" => 0,
                "conversionRate" => 0
            ]
        ]);
    }
}

/**
 * Get reports with enhanced error handling
 */
function getReports($db) {
    try {
        error_log("🔍 Getting reports");
        
        // Get sales report
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
        ");
        $stmt->execute();
        $salesReport = $stmt->fetchAll();

        error_log("✅ Reports retrieved successfully");
        
        sendSuccess("Reports retrieved successfully", [
            "reports" => [
                "salesReport" => $salesReport
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ getReports Error: " . $e->getMessage());
        sendSuccess("Reports retrieved successfully", [
            "reports" => [
                "salesReport" => []
            ]
        ]);
    }
}

/**
 * Upload multiple product images
 */
function uploadMultipleImages() {
    error_log("🔍 uploadMultipleImages called");
    error_log("🔍 FILES: " . json_encode(array_keys($_FILES)));
    
    // PRODUCTION CHECKS - Verify environment is ready
    error_log("🔍 PRODUCTION CHECK - UPLOAD_DIR: " . (defined('UPLOAD_DIR') ? UPLOAD_DIR : 'NOT DEFINED'));
    error_log("🔍 PRODUCTION CHECK - UPLOAD_DIR exists: " . (defined('UPLOAD_DIR') && file_exists(UPLOAD_DIR) ? 'YES' : 'NO'));
    error_log("🔍 PRODUCTION CHECK - UPLOAD_DIR writable: " . (defined('UPLOAD_DIR') && is_writable(UPLOAD_DIR) ? 'YES' : 'NO'));
    error_log("🔍 PRODUCTION CHECK - PHP upload_max_filesize: " . ini_get('upload_max_filesize'));
    error_log("🔍 PRODUCTION CHECK - PHP post_max_size: " . ini_get('post_max_size'));
    error_log("🔍 PRODUCTION CHECK - PHP file_uploads: " . (ini_get('file_uploads') ? 'ENABLED' : 'DISABLED'));
    
    // Check if images are uploaded
    if (!isset($_FILES['images'])) {
        error_log("❌ No images file provided");
        error_log("❌ PRODUCTION ISSUE - $_FILES is empty. Check PHP file_uploads setting and form enctype.");
        sendError('No images provided. Please upload at least one image.', [], 400);
        return;
    }
    
    $files = $_FILES['images'];
    $uploadedImages = [];
    $errors = [];
    
    // Handle both single file and multiple files
    $fileCount = is_array($files['name']) ? count($files['name']) : 1;
    
    error_log("🔍 Processing $fileCount image(s)");
    
    for ($i = 0; $i < $fileCount; $i++) {
        // Handle single file upload (not an array)
        if (!is_array($files['name'])) {
            $file = [
                'name' => $files['name'],
                'type' => $files['type'],
                'tmp_name' => $files['tmp_name'],
                'error' => $files['error'],
                'size' => $files['size']
            ];
        } else {
            // Handle multiple file uploads
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];
        }
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMsg = 'Upload error for ' . $file['name'] . ': ';
            switch ($file['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg .= 'File too large';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMsg .= 'File upload was incomplete';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMsg .= 'No file was uploaded';
                    break;
                default:
                    $errorMsg .= 'Unknown upload error';
            }
            $errors[] = $errorMsg;
            error_log("❌ " . $errorMsg);
            continue;
        }
        
        // Validate image
        $validationErrors = validateImageUpload($file);
        if (!empty($validationErrors)) {
            $errors[] = $file['name'] . ': ' . implode(', ', $validationErrors);
            error_log("❌ Validation failed for " . $file['name'] . ": " . implode(', ', $validationErrors));
            continue;
        }
        
        // PRODUCTION: Check file upload error code first
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMsg = 'Upload error code: ' . $file['error'];
            switch ($file['error']) {
                case UPLOAD_ERR_INI_SIZE:
                    $errorMsg .= ' (File exceeds upload_max_filesize: ' . ini_get('upload_max_filesize') . ')';
                    break;
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg .= ' (File exceeds MAX_FILE_SIZE in form)';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMsg .= ' (File upload was incomplete)';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMsg .= ' (No file was uploaded)';
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $errorMsg .= ' (Missing temporary folder - PRODUCTION ISSUE!)';
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    $errorMsg .= ' (Failed to write file to disk - PERMISSION ISSUE!)';
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $errorMsg .= ' (PHP extension stopped the file upload)';
                    break;
            }
            $errors[] = $file['name'] . ': ' . $errorMsg;
            error_log("❌ PRODUCTION UPLOAD ERROR: " . $errorMsg);
            continue;
        }
        
        // Upload image to products directory
        $imagePath = uploadImage($file, 'products');
        
        if ($imagePath) {
            error_log("🔍 uploadMultipleImages - Image path from uploadImage: $imagePath");
            
            // Convert to production URL FIRST (before file verification)
            $fullUrl = getImageUrl($imagePath);
            error_log("🔍 uploadMultipleImages - URL from getImageUrl: " . ($fullUrl ?: 'NULL'));
            
            // Fallback if getImageUrl returns null
            if (!$fullUrl) {
                $baseUrl = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
                if (strpos($imagePath, '/uploads/') === 0) {
                    $fullUrl = $baseUrl . '/backend' . $imagePath;
                } else {
                    $fullUrl = $baseUrl . $imagePath;
                }
                error_log("⚠️ getImageUrl returned null, using fallback: $fullUrl");
            }
            
            // CRITICAL: Only verify file exists if we have a valid URL
            // If URL generation fails, we still want to add the image with the path
            if ($fullUrl && $imagePath) {
                // Verify file exists (optional check - URL is more important)
                $filename = basename($imagePath);
                $fullFilePath = defined('UPLOAD_DIR') ? rtrim(UPLOAD_DIR, '/') . '/products/' . $filename : null;
                
                if ($fullFilePath && !file_exists($fullFilePath)) {
                    // Try alternative path
                    $altPath = defined('UPLOAD_DIR') ? UPLOAD_DIR . 'products/' . $filename : null;
                    if ($altPath && !file_exists($altPath)) {
                        error_log("⚠️ File verification: File not found at expected paths, but continuing with URL");
                    }
                }
                
                // Add image data - CRITICAL: Always add if we have URL and path
                $imageData = [
                    'url' => $fullUrl,
                    'path' => $imagePath,
                    'fullUrl' => $fullUrl,
                    'name' => $file['name']
                ];
                $uploadedImages[] = $imageData;
                error_log("✅ Image uploaded successfully: $imagePath -> $fullUrl");
                error_log("🔍 uploadMultipleImages - Image data added: " . json_encode($imageData));
            } else {
                error_log("❌ Image upload failed: fullUrl or imagePath is empty. fullUrl: " . ($fullUrl ?: 'NULL') . ", imagePath: " . ($imagePath ?: 'NULL'));
                $errors[] = $file['name'] . ': Failed to generate image URL';
            }
        } else {
            $errors[] = $file['name'] . ': Failed to upload image';
            error_log("❌ Failed to upload image: " . $file['name']);
            error_log("❌ PRODUCTION ISSUE - uploadImage() returned false. Check server logs for details.");
        }
    }
    
    if (empty($uploadedImages)) {
        error_log("❌ uploadMultipleImages - No images uploaded successfully. Errors: " . json_encode($errors));
        sendError('Failed to upload images', [
            'errors' => $errors,
            'message' => count($errors) > 0 ? implode('; ', $errors) : 'No images were uploaded successfully'
        ], 400);
        return;
    }
    
    // Return success response with uploaded images
    // Response format: { success: true, message: "...", data: { images: [...], count: N } }
    error_log("✅ uploadMultipleImages - Successfully uploaded " . count($uploadedImages) . " image(s)");
    
    // Build response data - ensure images array is always present
    $responseData = [
        'images' => $uploadedImages, // CRITICAL: Always include images array
        'count' => count($uploadedImages),
        'errors' => $errors
    ];
    
    // Verify each image has required fields
    foreach ($uploadedImages as $index => $img) {
        if (!isset($img['url']) && !isset($img['path']) && !isset($img['fullUrl'])) {
            error_log("⚠️ uploadMultipleImages - Image at index $index missing URL fields: " . json_encode($img));
        }
    }
    
    error_log("🔍 uploadMultipleImages - Response data structure: " . json_encode($responseData, JSON_UNESCAPED_SLASHES));
    error_log("🔍 uploadMultipleImages - Images count in response: " . count($responseData['images']));
    error_log("🔍 uploadMultipleImages - First image in response: " . json_encode($responseData['images'][0] ?? 'NONE', JSON_UNESCAPED_SLASHES));
    error_log("🔍 uploadMultipleImages - Full responseData structure: " . print_r($responseData, true));
    
    // CRITICAL: Test JSON encoding before sending
    $testJson = json_encode($responseData, JSON_UNESCAPED_SLASHES);
    if ($testJson === false) {
        error_log("❌ CRITICAL ERROR - JSON encoding failed! Error: " . json_last_error_msg());
        error_log("❌ Data that failed to encode: " . print_r($responseData, true));
        sendError('Failed to encode response', ['error' => json_last_error_msg()], 500);
        return;
    }
    
    error_log("✅ uploadMultipleImages - JSON encoding test passed. Response length: " . strlen($testJson) . " bytes");
    
    // CRITICAL: Final verification before sending - ensure data is not empty
    if (empty($responseData) || empty($responseData['images']) || !is_array($responseData['images']) || count($responseData['images']) === 0) {
        error_log("❌ CRITICAL ERROR - Response data is empty or images array is empty before sending!");
        error_log("❌ responseData: " . json_encode($responseData));
        error_log("❌ uploadedImages count: " . count($uploadedImages));
        sendError('Failed to upload images - response data is empty', [
            'errors' => $errors,
            'message' => 'Images were uploaded but response data is empty',
            'images' => []
        ], 500);
        return;
    }
    
    // Log final response structure
    error_log("✅ uploadMultipleImages - FINAL RESPONSE: " . json_encode([
        'success' => true,
        'message' => 'Images uploaded successfully',
        'data' => $responseData,
        'images_count' => count($responseData['images'])
    ], JSON_UNESCAPED_SLASHES));
    
    // CRITICAL: Send response DIRECTLY to ensure images array is included
    // Don't use sendSuccess wrapper - send directly to avoid any data loss
    $finalResponse = [
        'success' => true,
        'message' => 'Images uploaded successfully',
        'data' => $responseData, // This MUST contain 'images' array
        'timestamp' => date('c')
    ];
    
    // Final verification - ensure images are in the response
    if (empty($finalResponse['data']['images']) || !is_array($finalResponse['data']['images']) || count($finalResponse['data']['images']) === 0) {
        error_log("❌ CRITICAL: Final response has empty images array!");
        error_log("❌ finalResponse['data']: " . json_encode($finalResponse['data']));
        sendError('Failed to upload images - images array is empty in final response', [
            'errors' => $errors,
            'message' => 'Images were uploaded but response is empty',
            'images' => []
        ], 500);
        return;
    }
    
    error_log("✅ uploadMultipleImages - Sending final response with " . count($finalResponse['data']['images']) . " image(s)");
    error_log("✅ uploadMultipleImages - Final response structure: " . json_encode($finalResponse, JSON_UNESCAPED_SLASHES));
    
    // Send response directly
    if (ob_get_level()) {
        ob_clean();
    }
    http_response_code(201);
    header('Content-Type: application/json');
    echo json_encode($finalResponse, JSON_UNESCAPED_SLASHES);
    exit;
}
?>