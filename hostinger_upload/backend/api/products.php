<?php
/**
 * Products API Endpoints
 * Routes: /api/products/*
 */

// Session is already started in index.php, no need to start again
// session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

// Get path parts
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/products and /api/php-backend/api/products
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'products') {
    // Handle /api/php-backend/api/products
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
    $id = isset($pathParts[5]) ? $pathParts[5] : null;
} else {
    // Handle /api/products
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
    $id = isset($pathParts[3]) ? $pathParts[3] : null;
}

try {
    switch ($endpoint) {
        case '':
            // /api/products
            if ($method === 'GET') {
                getAllProducts($db);
            } elseif ($method === 'POST') {
                createProduct($db);
            }
            break;

        case 'featured':
            // /api/products/featured
            if ($method === 'GET') {
                getFeaturedProducts($db);
            }
            break;

        case 'bestsellers':
            // /api/products/bestsellers
            if ($method === 'GET') {
                getBestsellers($db);
            }
            break;

        case 'new':
            // /api/products/new
            if ($method === 'GET') {
                getNewProducts($db);
            }
            break;

        case 'reactivate':
            // /api/products/reactivate/{id} - Management feature
            if ($method === 'POST') {
                reactivateProduct($db, $id);
            }
            break;

        case 'search':
            // /api/products/search
            if ($method === 'GET') {
                searchProducts($db);
            }
            break;

        case 'category':
            // /api/products/category/:categoryName
            if ($method === 'GET' && $id) {
                getProductsByCategory($db, $id);
            }
            break;

        case 'flavor':
            // /api/products/flavor/:flavor
            if ($method === 'GET' && $id) {
                getProductsByFlavor($db, $id);
            }
            break;

        case 'type':
            // /api/products/type/:type
            if ($method === 'GET' && $id) {
                getProductsByType($db, $id);
            }
            break;

        default:
            // /api/products/:id
            if (is_numeric($endpoint)) {
                $productId = $endpoint;
                if ($method === 'GET') {
                    getProductById($db, $productId);
                } elseif ($method === 'PUT') {
                    updateProduct($db, $productId);
                } elseif ($method === 'DELETE') {
                    deleteProduct($db, $productId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    error_log("❌❌❌ FATAL ERROR in products.php:");
    error_log("Message: " . $e->getMessage());
    error_log("File: " . $e->getFile());
    error_log("Line: " . $e->getLine());
    error_log("Trace: " . $e->getTraceAsString());
    
    // Return empty products array instead of error for better UX
    sendSuccess('Products retrieved successfully', [
        'products' => [],
        'pagination' => [
            'page' => 1,
            'limit' => 20,
            'total' => 0,
            'pages' => 0
        ]
    ]);
}

/**
 * Helper function to filter base64 images from product images array
 * Converts base64 to files or removes invalid images
 */
function filterBase64Images($images) {
    if (!is_array($images)) {
        return [];
    }
    
    $validImages = [];
    foreach ($images as $img) {
        if (is_string($img)) {
            // Check if it's a base64 image (shouldn't be in database, but handle it)
            // Check for data:image/ ANYWHERE in string (not just at start) - handles path prefixes
            $isBase64 = (strpos($img, 'data:image/') !== false) || 
                        (strpos($img, ';base64,') !== false) ||
                        // Check for base64 pattern with path prefixes
                        (strlen($img) > 200 && preg_match('/data:image\/[^;]+;base64,/', $img)) ||
                        // Check for raw base64 string
                        (strlen($img) > 100 && preg_match('/^[A-Za-z0-9+\/]+=*$/', $img) && 
                         strpos($img, '/') === false && strpos($img, 'http') === false);
            
            if ($isBase64) {
                // Try to convert base64 to file
                $uploadedPath = uploadBase64Image($img, 'products');
                if ($uploadedPath) {
                    $validImages[] = getImageUrl($uploadedPath) ?: (defined('BASE_URL') ? BASE_URL . $uploadedPath : 'https://skbakers.com' . $uploadedPath);
                    error_log("⚠️ filterBase64Images - Found base64 image, converted to: " . $uploadedPath);
                } else {
                    error_log("⚠️ filterBase64Images - Found base64 image but conversion failed, skipping");
                }
            } else {
                // Valid image path/URL - convert to full URL
                $imageUrl = getImageUrl($img);
                if ($imageUrl) {
                    // CRITICAL: Verify image file exists before adding to response
                    // Extract file path from URL for verification
                    $filePath = null;
                    if (strpos($imageUrl, '/backend/uploads/') !== false || strpos($imageUrl, '/uploads/') !== false) {
                        // Extract relative path from URL
                        $urlPath = parse_url($imageUrl, PHP_URL_PATH);
                        // Remove /backend prefix if present
                        $relativePath = str_replace('/backend', '', $urlPath);
                        // Remove leading /uploads/ to get just the subdirectory and filename
                        // e.g., /uploads/products/filename.webp -> products/filename.webp
                        $relativePath = preg_replace('#^/uploads/#', '', $relativePath);
                        
                        // Construct full file path: UPLOAD_DIR already includes /uploads/
                        // So: UPLOAD_DIR = /path/to/backend/uploads/
                        // relativePath = products/filename.webp
                        // Result: /path/to/backend/uploads/products/filename.webp
                        if (defined('UPLOAD_DIR') && $relativePath) {
                            $filePath = rtrim(UPLOAD_DIR, '/') . '/' . $relativePath;
                        }
                    }
                    
                    // Only add image if file exists (or if we can't verify - for external URLs)
                    if ($filePath === null || file_exists($filePath)) {
                        $validImages[] = $imageUrl;
                    } else {
                        error_log("⚠️ filterBase64Images - Image file does not exist: $filePath (URL: $imageUrl, relativePath: " . ($relativePath ?? 'N/A') . ")");
                        // Don't add missing images to prevent 404 errors
                    }
                }
            }
        } else {
            // Non-string image - keep as is
            $validImages[] = $img;
        }
    }
    return $validImages;
}

/**
 * Helper function to filter base64 from thumbnail
 */
function filterBase64Thumbnail($thumbnail) {
    if (empty($thumbnail)) {
        return null;
    }
    
    if (is_string($thumbnail)) {
        // Check for data:image/ ANYWHERE in string (not just at start) - handles path prefixes
        $isBase64 = (strpos($thumbnail, 'data:image/') !== false) || 
                    (strpos($thumbnail, ';base64,') !== false) ||
                    // Check for base64 pattern with path prefixes
                    (strlen($thumbnail) > 200 && preg_match('/data:image\/[^;]+;base64,/', $thumbnail)) ||
                    // Check for raw base64 string
                    (strlen($thumbnail) > 100 && preg_match('/^[A-Za-z0-9+\/]+=*$/', $thumbnail) && 
                     strpos($thumbnail, '/') === false && strpos($thumbnail, 'http') === false);
        
        if ($isBase64) {
            $uploadedPath = uploadBase64Image($thumbnail, 'products');
            if ($uploadedPath) {
                return getImageUrl($uploadedPath) ?: (defined('BASE_URL') ? BASE_URL . $uploadedPath : 'https://skbakers.com' . $uploadedPath);
            } else {
                return null;
            }
        } else {
            return getImageUrl($thumbnail);
        }
    }
    
    return $thumbnail;
}

/**
 * Get all products with pagination and filters
 */
function getAllProducts($db) {
    try {
        $pagination = getPaginationParams();
    $page = $pagination['page'];
    $limit = $pagination['limit'];
    $offset = $pagination['offset'];

    // Build query with filters - Enhanced Management Logic
    $where = [];
    $params = [];
    
    // Management Logic: Check if user is admin for different views
    $isAdmin = false;
    $authUser = AuthMiddleware::optionalAuth();
    if ($authUser && $authUser->role === 'admin') {
        $isAdmin = true;
    }
    
    // If-else logic for product visibility management
    if ($isAdmin) {
        // Admin can see all products (active and inactive)
        $where[] = '1=1'; // No filter for admin
    } else {
        // Public users only see active products
        $where[] = 'p.is_active = 1';
    }

    // Filter by search query
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $searchTerm = '%' . sanitizeInput($_GET['search']) . '%';
        $where[] = '(p.name LIKE ? OR p.description LIKE ?)';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    // Filter by category (using category_id)
    if (isset($_GET['category']) && !empty($_GET['category'])) {
        $where[] = 'p.category_id = (SELECT id FROM categories WHERE name = ? OR slug = ?)';
        $params[] = sanitizeInput($_GET['category']);
        $params[] = sanitizeInput($_GET['category']);
    }

    // Note: sub_category, menu_option, brand filters removed as they don't exist in current schema

    // Filter by price range
    if (isset($_GET['minPrice']) && !empty($_GET['minPrice'])) {
        $where[] = 'p.price >= ?';
        $params[] = floatval($_GET['minPrice']);
    }
    if (isset($_GET['maxPrice']) && !empty($_GET['maxPrice'])) {
        $where[] = 'p.price <= ?';
        $params[] = floatval($_GET['maxPrice']);
    }

    // Filter by minimum rating
    if (isset($_GET['rating']) && !empty($_GET['rating'])) {
        $where[] = 'p.average_rating >= ?';
        $params[] = floatval($_GET['rating']);
    }

    // Filter by stock availability
    if (isset($_GET['inStock']) && $_GET['inStock'] === 'true') {
        $where[] = 'p.stock > 0';
    }
    if (isset($_GET['availability']) && $_GET['availability'] === 'inStock') {
        $where[] = 'p.stock > 0';
    }

    // Filter by discount (on sale) - removed as discount_percentage doesn't exist in schema

    // Filter by featured products
    if (isset($_GET['featured']) && $_GET['featured'] === 'true') {
        $where[] = 'p.is_featured = 1';
    }

    $whereClause = implode(' AND ', $where);

    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    // Get products with enhanced sorting
    $sortBy = isset($_GET['sortBy']) ? sanitizeInput($_GET['sortBy']) : 'relevance';
    $sortOrder = isset($_GET['sortOrder']) ? sanitizeInput($_GET['sortOrder']) : 'desc';
    $order = ($sortOrder === 'asc') ? 'ASC' : 'DESC';

    // Map frontend sort options to database columns
    $sortMapping = [
        'relevance' => 'p.created_at',     // Most recent first
        'price' => 'p.price',
        'rating' => 'p.average_rating',
        'name' => 'p.name',
        'newest' => 'p.created_at',
        'popularity' => 'p.sold_count'
    ];

    $orderBy = isset($sortMapping[$sortBy]) ? $sortMapping[$sortBy] : 'p.created_at';

    // Special case: for relevance and newest, always DESC (newest first)
    if ($sortBy === 'relevance' || $sortBy === 'newest') {
        $order = 'DESC';
    }

    error_log("🔍 GET ALL PRODUCTS - WHERE: $whereClause");
    error_log("🔍 GET ALL PRODUCTS - PARAMS: " . json_encode($params));
    error_log("🔍 GET ALL PRODUCTS - SORT: $orderBy $order");
    error_log("🔍 GET ALL PRODUCTS - LIMIT: $limit, OFFSET: $offset");
    error_log("🔍 GET ALL PRODUCTS - Is Admin: " . ($isAdmin ? 'YES' : 'NO'));
    error_log("🔍 GET ALL PRODUCTS - Filters: " . json_encode($_GET));

    // Check if sub_category and menu_option columns exist in products table
    $hasSubCategory = false;
    $hasMenuOption = false;
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM products LIKE 'sub_category'");
        $hasSubCategory = $colCheck && $colCheck->rowCount() > 0;
        $colCheck2 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_option'");
        $hasMenuOption = $colCheck2 && $colCheck2->rowCount() > 0;
    } catch (Exception $e) {
        // Columns don't exist, continue without them
    }
    
    // Build SELECT clause based on available columns
    $selectFields = "p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug";
    
    if ($hasSubCategory) {
        $selectFields .= ", p.sub_category";
    }
    if ($hasMenuOption) {
        $selectFields .= ", p.menu_option";
    }

    $stmt = $db->prepare("
        SELECT $selectFields
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE $whereClause
        ORDER BY $orderBy $order
        LIMIT ? OFFSET ?
    ");

    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    error_log("🔍 GET ALL PRODUCTS - Found " . count($products) . " products");
    error_log("🔍 GET ALL PRODUCTS - Total count: $total");

    // Decode JSON fields and convert image URLs to production URLs
    // CRITICAL: Filter out base64 images that might be in the database
    foreach ($products as &$product) {
        $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
        
        // CRITICAL: Filter out base64 images that might be in the database
        $product['images'] = filterBase64Images($product['images']);
        $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
        $product['product_types'] = $product['product_types'] ?? null ? json_decode($product['product_types'], true) : null;
        $product['specifications'] = $product['specifications'] ?? null ? json_decode($product['specifications'], true) : null;
        $product['tags'] = $product['tags'] ?? null ? json_decode($product['tags'], true) : null;
        $product['weight_options'] = $product['weight_options'] ?? null ? json_decode($product['weight_options'], true) : null;
        
        // Add category field for frontend compatibility
        $product['category'] = $product['category_name'] ?? null;
    }

    // Return real products from database
    $response = createPaginationResponse($products, $total, $page, $limit);
    sendSuccess('Products retrieved successfully', $response);
    } catch (PDOException $e) {
        error_log("❌ GET ALL PRODUCTS - PDO Exception: " . $e->getMessage());
        error_log("❌ GET ALL PRODUCTS - Error Info: " . json_encode($e->errorInfo ?? []));
        if (!headers_sent()) {
            sendSuccess('Products retrieved successfully', [
                'products' => [],
                'pagination' => [
                    'page' => 1,
                    'limit' => 20,
                    'total' => 0,
                    'pages' => 0
                ]
            ]);
        }
    } catch (Exception $e) {
        error_log("❌ GET ALL PRODUCTS - General Exception: " . $e->getMessage());
        error_log("❌ GET ALL PRODUCTS - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendSuccess('Products retrieved successfully', [
                'products' => [],
                'pagination' => [
                    'page' => 1,
                    'limit' => 20,
                    'total' => 0,
                    'pages' => 0
                ]
            ]);
        }
    }
}

/**
 * Get single product by ID
 */
function getProductById($db, $id) {
    // Check if user is admin - admins can view inactive products too
    $isAdmin = false;
    $authUser = AuthMiddleware::optionalAuth();
    if ($authUser && $authUser->role === 'admin') {
        $isAdmin = true;
    }

    // Check if sub_category, menu_option, and menu_category columns exist
    $hasSubCategory = false;
    $hasMenuOption = false;
    $hasMenuCategory = false;
    try {
        $colCheck = $db->query("SHOW COLUMNS FROM products LIKE 'sub_category'");
        $hasSubCategory = $colCheck && $colCheck->rowCount() > 0;
        $colCheck2 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_option'");
        $hasMenuOption = $colCheck2 && $colCheck2->rowCount() > 0;
        $colCheck3 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_category'");
        $hasMenuCategory = $colCheck3 && $colCheck3->rowCount() > 0;
    } catch (Exception $e) {
        // Columns don't exist, continue without them
    }
    
    // Build SELECT query with conditional columns
    $selectFields = "p.id, p.name, p.description, p.price, p.original_price, p.category_id, p.stock, p.images, p.thumbnail,
                     p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
                     p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
                     c.name as category_name, c.slug as category_slug";
    
    if ($hasSubCategory) {
        $selectFields .= ", p.sub_category";
    }
    if ($hasMenuOption) {
        $selectFields .= ", p.menu_option";
    }
    if ($hasMenuCategory) {
        $selectFields .= ", p.menu_category";
    }
    
    // Build query with JOIN to get category name - CRITICAL for edit modal
    if ($isAdmin) {
        // Admin can view any product (active or inactive)
        $stmt = $db->prepare("
            SELECT $selectFields
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
    } else {
        // Public users only see active products
        $stmt = $db->prepare("
            SELECT $selectFields
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.is_active = 1
        ");
        $stmt->execute([$id]);
    }

    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        sendError('Product not found', [], 404);
        return;
    }

    // Decode JSON fields - handle null values properly
    $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
    // CRITICAL: Filter out base64 images that might be in the database
    $product['images'] = filterBase64Images($product['images']);
    $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
    $product['product_types'] = isset($product['product_types']) && $product['product_types'] ? json_decode($product['product_types'], true) : null;
    $product['specifications'] = isset($product['specifications']) && $product['specifications'] ? json_decode($product['specifications'], true) : [];
    $product['tags'] = isset($product['tags']) && $product['tags'] ? json_decode($product['tags'], true) : [];
    $product['weight_options'] = isset($product['weight_options']) && $product['weight_options'] ? json_decode($product['weight_options'], true) : [];
    
    // CRITICAL: Add category field for frontend compatibility
    // Use category_name from JOIN, but fallback to menu_category if category_id is NULL
    // This handles products that have menu_category but no category_id
    if (!empty($product['category_name'])) {
        $product['category'] = $product['category_name'];
    } elseif (isset($product['menu_category']) && !empty($product['menu_category'])) {
        // Fallback to menu_category if category_name is NULL/empty
        $product['category'] = $product['menu_category'];
        error_log("✅ GET PRODUCT BY ID - Using menu_category as category fallback: " . $product['menu_category']);
    } else {
        $product['category'] = null;
    }
    
    // Check if sub_category, menu_option, and menu_category columns exist and include them
    // These fields might not exist in all database schemas
    if (isset($product['sub_category']) && $product['sub_category'] !== null && $product['sub_category'] !== '') {
        $product['subCategory'] = $product['sub_category'];
        error_log("✅ GET PRODUCT BY ID - SubCategory set: " . $product['sub_category']);
    } else {
        $product['subCategory'] = null;
        error_log("⚠️ GET PRODUCT BY ID - SubCategory is NULL or empty");
    }
    // Check if menu_option column exists and has a value
    if (isset($product['menu_option']) && $product['menu_option'] !== null && $product['menu_option'] !== '') {
        $product['menuOption'] = $product['menu_option'];
        error_log("✅ GET PRODUCT BY ID - MenuOption set: " . $product['menu_option']);
    } else {
        $product['menuOption'] = null;
        error_log("⚠️ GET PRODUCT BY ID - MenuOption is NULL or empty");
    }
    // Check if menu_category column exists and has a value
    if (isset($product['menu_category']) && $product['menu_category'] !== null && $product['menu_category'] !== '') {
        $product['menuCategory'] = $product['menu_category'];
        // CRITICAL: Set selectedMenuFilter to the actual menu_category value
        // This ensures the dropdown shows the correct selection when editing
        if ($product['menu_category'] !== 'all') {
            $product['selectedMenuFilter'] = $product['menu_category'];
            error_log("✅ GET PRODUCT BY ID - MenuCategory set: " . $product['menu_category']);
        } else {
            $product['selectedMenuFilter'] = null;
        }
    } else {
        // If menu_category is NULL, empty, or column doesn't exist
        $product['menuCategory'] = null;
        $product['selectedMenuFilter'] = null;
        error_log("⚠️ GET PRODUCT BY ID - MenuCategory is NULL or empty");
    }
    
    // Ensure _id field exists for frontend compatibility (React expects _id)
    if (isset($product['id']) && !isset($product['_id'])) {
        $product['_id'] = strval($product['id']); // Convert to string if needed
    }
    
    error_log("🔍 GET PRODUCT BY ID - Category: " . ($product['category'] ?? 'NULL') . ", Category Name: " . ($product['category_name'] ?? 'NULL'));
    error_log("🔍 GET PRODUCT BY ID - SubCategory: " . ($product['subCategory'] ?? 'NULL') . ", MenuOption: " . ($product['menuOption'] ?? 'NULL') . ", MenuCategory: " . ($product['menuCategory'] ?? 'NULL') . ", selectedMenuFilter: " . ($product['selectedMenuFilter'] ?? 'NULL'));
    error_log("🔍 GET PRODUCT BY ID - Raw sub_category from DB: " . (isset($product['sub_category']) ? ($product['sub_category'] ?? 'NULL') : 'COLUMN_NOT_INCLUDED'));
    error_log("🔍 GET PRODUCT BY ID - Raw menu_category from DB: " . (isset($product['menu_category']) ? ($product['menu_category'] ?? 'NULL') : 'COLUMN_NOT_INCLUDED'));
    error_log("🔍 GET PRODUCT BY ID - Raw menu_option from DB: " . (isset($product['menu_option']) ? ($product['menu_option'] ?? 'NULL') : 'COLUMN_NOT_INCLUDED'));

    // Get reviews
    $stmt = $db->prepare("
        SELECT r.*, u.name as user_name, u.avatar
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$id]);
    $product['reviews'] = $stmt->fetchAll();

    // Increment view count
    $stmt = $db->prepare("UPDATE products SET view_count = view_count + 1 WHERE id = ?");
    $stmt->execute([$id]);

    sendSuccess('Product retrieved successfully', ['product' => $product]);
}

/**
 * Get featured products
 */
function getFeaturedProducts($db) {
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 20) : 8;

    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_featured = 1 AND p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
        // Convert image URLs to production URLs
        if (is_array($product['images'])) {
            // CRITICAL: Filter out base64 images that might be in the database
            $product['images'] = filterBase64Images($product['images']);
        }
        // Convert thumbnail to production URL (filter base64)
        $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
        // Add category field for frontend compatibility
        $product['category'] = $product['category_name'] ?? null;
    }

    sendSuccess('Featured products retrieved successfully', ['products' => $products]);
}

/**
 * Get bestsellers
 */
function getBestsellers($db) {
    $pagination = getPaginationParams();
    
    try {
        $stmt = $db->prepare("
            SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock,
                   p.images, p.thumbnail, p.is_featured, p.is_bestseller, p.is_new,
                   p.is_active, p.sku, p.weight, p.average_rating, p.num_reviews,
                   p.sold_count, p.view_count, p.created_at, p.updated_at,
                   c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1 AND (p.is_bestseller = 1 OR p.is_featured = 1 OR p.sold_count > 0)
            ORDER BY p.is_featured DESC, p.is_bestseller DESC, p.sold_count DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$pagination['limit'], $pagination['offset']]);
        $products = $stmt->fetchAll();

        // Get total count for pagination
        $countStmt = $db->prepare("
            SELECT COUNT(*) as total FROM products p
            WHERE p.is_active = 1 AND (p.is_bestseller = 1 OR p.is_featured = 1 OR p.sold_count > 0)
        ");
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];

        // Decode JSON fields and convert image URLs
        foreach ($products as &$product) {
            $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
            // Convert image URLs to production URLs
            if (is_array($product['images'])) {
                $product['images'] = array_map(function($img) {
                    if (is_string($img)) {
                        return getImageUrl($img);
                    }
                    return $img;
                }, $product['images']);
            }
            // Convert thumbnail to production URL
            if (!empty($product['thumbnail'])) {
                $product['thumbnail'] = getImageUrl($product['thumbnail']);
            }
            $product['product_types'] = $product['product_types'] ?? null ? json_decode($product['product_types'], true) : null;
            $product['specifications'] = $product['specifications'] ?? null ? json_decode($product['specifications'], true) : null;
            $product['tags'] = $product['tags'] ?? null ? json_decode($product['tags'], true) : null;
            $product['weight_options'] = $product['weight_options'] ?? null ? json_decode($product['weight_options'], true) : null;
            
            // Add category field for frontend compatibility
            $product['category'] = $product['category_name'] ?? null;
        }

        // Return products in 'products' key for frontend compatibility
        $response = [
            'products' => $products,
            'pagination' => [
                'currentPage' => $pagination['page'],
                'totalPages' => ceil($total / $pagination['limit']),
                'totalItems' => $total,
                'itemsPerPage' => $pagination['limit'],
                'hasNextPage' => $pagination['page'] < ceil($total / $pagination['limit']),
                'hasPrevPage' => $pagination['page'] > 1
            ]
        ];
        sendSuccess('Bestsellers retrieved successfully', $response);
        
    } catch (PDOException $e) {
        error_log("❌ getBestsellers Error: " . $e->getMessage());
        sendError('Database error: ' . $e->getMessage(), [], 500);
    }
}

/**
 * Get new products
 */
function getNewProducts($db) {
    $pagination = getPaginationParams();
    
    try {
        $stmt = $db->prepare("
            SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, 
                   p.images, p.thumbnail, p.is_featured, p.is_bestseller, p.is_new, 
                   p.is_active, p.sku, p.weight, p.average_rating, p.num_reviews, 
                   p.sold_count, p.view_count, p.created_at, p.updated_at,
                   c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_new = 1 AND p.is_active = 1
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$pagination['limit'], $pagination['offset']]);
        $products = $stmt->fetchAll();

        // Get total count for pagination
        $countStmt = $db->prepare("
            SELECT COUNT(*) as total FROM products p
            WHERE p.is_new = 1 AND p.is_active = 1
        ");
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];

        // Decode JSON fields and convert image URLs
        foreach ($products as &$product) {
            $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
            // Convert image URLs to production URLs
            if (is_array($product['images'])) {
                $product['images'] = array_map(function($img) {
                    if (is_string($img)) {
                        return getImageUrl($img);
                    }
                    return $img;
                }, $product['images']);
            }
            // Convert thumbnail to production URL
            if (!empty($product['thumbnail'])) {
                $product['thumbnail'] = getImageUrl($product['thumbnail']);
            }
            $product['product_types'] = $product['product_types'] ?? null ? json_decode($product['product_types'], true) : null;
            $product['specifications'] = $product['specifications'] ?? null ? json_decode($product['specifications'], true) : null;
            $product['tags'] = $product['tags'] ?? null ? json_decode($product['tags'], true) : null;
            $product['weight_options'] = $product['weight_options'] ?? null ? json_decode($product['weight_options'], true) : null;
            
            // Add category field for frontend compatibility
            $product['category'] = $product['category_name'] ?? null;
        }

        $response = createPaginationResponse($products, $total, $pagination['page'], $pagination['limit']);
        sendSuccess('New products retrieved successfully', $response);
        
    } catch (PDOException $e) {
        error_log("❌ getNewProducts Error: " . $e->getMessage());
        sendError('Database error: ' . $e->getMessage(), [], 500);
    }
}

/**
 * Search products
 */
function searchProducts($db) {
    $query = isset($_GET['q']) ? sanitizeInput($_GET['q']) : '';

    if (empty($query)) {
        sendError('Search query is required', [], 400);
    }

    $pagination = getPaginationParams();

    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)
        ORDER BY p.average_rating DESC, p.sold_count DESC
        LIMIT ? OFFSET ?
    ");

    $searchTerm = "%$query%";
    $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $pagination['limit'], $pagination['offset']]);
    $products = $stmt->fetchAll();
    
    // Get total count for pagination
    $countStmt = $db->prepare("
        SELECT COUNT(*) as total FROM products p
        WHERE p.is_active = 1
        AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)
    ");
    $countStmt->execute([$searchTerm, $searchTerm, $searchTerm]);
    $total = $countStmt->fetch()['total'];

    foreach ($products as &$product) {
        $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
        // Convert image URLs to production URLs
        if (is_array($product['images'])) {
            // CRITICAL: Filter out base64 images that might be in the database
            $product['images'] = filterBase64Images($product['images']);
        }
        // Convert thumbnail to production URL (filter base64)
        $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
    }

    $response = createPaginationResponse($products, $total, $pagination['page'], $pagination['limit']);
    $response['query'] = $query;
    sendSuccess('Search results', $response);
}

/**
 * Get products by category
 */
function getProductsByCategory($db, $category) {
    $pagination = getPaginationParams();

    // Get category ID from category name or slug
    $catStmt = $db->prepare("SELECT id FROM categories WHERE name = ? OR slug = ?");
    $catStmt->execute([$category, $category]);
    $categoryData = $catStmt->fetch();
    
    if (!$categoryData) {
        sendSuccess('Products retrieved successfully', [
            'products' => [],
            'pagination' => createPaginationResponse([], 0, $pagination['page'], $pagination['limit'])
        ]);
        return;
    }
    
    $categoryId = $categoryData['id'];

    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? AND p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$categoryId, $pagination['limit'], $pagination['offset']]);
    $products = $stmt->fetchAll();
    
    // Get total count for pagination
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = 1");
    $countStmt->execute([$categoryId]);
    $total = $countStmt->fetch()['total'];

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
        // Convert image URLs to production URLs
        if (is_array($product['images'])) {
            // CRITICAL: Filter out base64 images that might be in the database
            $product['images'] = filterBase64Images($product['images']);
        }
        // Convert thumbnail to production URL (filter base64)
        $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
    }

    $response = createPaginationResponse($products, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Products retrieved successfully', $response);
}

/**
 * Get products by cake flavor
 */
function getProductsByFlavor($db, $flavor) {
    $pagination = getPaginationParams();

    // Search in tags or product name for flavor
    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $flavorTerm = '%' . $flavor . '%';
    $stmt->execute([$flavorTerm, $flavorTerm, $flavorTerm, $pagination['limit'], $pagination['offset']]);
    $products = $stmt->fetchAll();
    
    // Get total count for pagination
    $countStmt = $db->prepare("
        SELECT COUNT(*) as total FROM products 
        WHERE is_active = 1 AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)
    ");
    $countStmt->execute([$flavorTerm, $flavorTerm, $flavorTerm]);
    $total = $countStmt->fetch()['total'];

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
        // Convert image URLs to production URLs
        if (is_array($product['images'])) {
            // CRITICAL: Filter out base64 images that might be in the database
            $product['images'] = filterBase64Images($product['images']);
        }
        // Convert thumbnail to production URL (filter base64)
        $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
    }

    $response = createPaginationResponse($products, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Products retrieved successfully', $response);
}

/**
 * Get products by type
 */
function getProductsByType($db, $type) {
    $pagination = getPaginationParams();

    // Handle special type: newItems
    if ($type === 'newItems') {
        $where = 'p.is_active = 1 AND p.is_new = 1';
        $params = [];
    } else {
        $where = 'p.is_active = 1 AND (p.product_types LIKE ? OR JSON_CONTAINS(p.product_types, ?))';
        $typeJson = json_encode($type);
        $params = ['%' . $type . '%', $typeJson];
    }

    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE $where
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $params[] = $pagination['limit'];
    $params[] = $pagination['offset'];
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Get total count for pagination
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM products p WHERE $where");
    $countParams = $params;
    array_pop($countParams); // Remove limit
    array_pop($countParams); // Remove offset
    $countStmt->execute($countParams);
    $total = $countStmt->fetch()['total'];

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
        // Convert image URLs to production URLs
        if (is_array($product['images'])) {
            // CRITICAL: Filter out base64 images that might be in the database
            $product['images'] = filterBase64Images($product['images']);
        }
        // Convert thumbnail to production URL (filter base64)
        $product['thumbnail'] = filterBase64Thumbnail($product['thumbnail']);
    }

    $response = createPaginationResponse($products, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Products retrieved successfully', $response);
}

/**
 * Create product (Admin only)
 */
function createProduct($db) {
    // Enhanced Management Logic: Check admin authentication
    try {
        $authUser = AuthMiddleware::requireAdmin();
        if (!$authUser) {
            sendError('Admin access required', [], 403);
            return;
        }
    } catch (Exception $e) {
        error_log("❌ CREATE PRODUCT - Auth error: " . $e->getMessage());
        // If sendError was already called by requireAdmin, don't send again
        if (!headers_sent()) {
            sendError('Admin access required', [], 403);
        }
        return;
    }
    
    try {
        // Get raw input for debugging
        $rawInput = file_get_contents('php://input');
        error_log("🔍 CREATE PRODUCT - Raw input length: " . strlen($rawInput));
        error_log("🔍 CREATE PRODUCT - Raw input (first 500 chars): " . substr($rawInput, 0, 500));

        $data = getRequestBody();
        
        // CRITICAL: Prevent duplicate product creation within 5 seconds
        // This prevents accidental double submissions while allowing legitimate products with same name
        if (isset($data['name']) && !empty($data['name'])) {
            $productName = sanitizeInput($data['name']);
            $checkStmt = $db->prepare("
                SELECT id, name, created_at 
                FROM products 
                WHERE name = ? 
                AND created_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $checkStmt->execute([$productName]);
            $recentProduct = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($recentProduct) {
                $timeDiff = time() - strtotime($recentProduct['created_at']);
                error_log("⚠️ CREATE PRODUCT - Duplicate detected: Product '" . $productName . "' was created " . $timeDiff . " seconds ago (ID: " . $recentProduct['id'] . ")");
                
                // Fetch the existing product with all fields
                $existingStmt = $db->prepare("
                    SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
                           p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
                           p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
                           c.name as category_name, c.slug as category_slug, p.category_id
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.id = ?
                ");
                $existingStmt->execute([$recentProduct['id']]);
                $existingProduct = $existingStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($existingProduct) {
                    // Process the product like getProductById does
                    $existingProduct['images'] = $existingProduct['images'] ? json_decode($existingProduct['images'], true) : [];
                    if (is_array($existingProduct['images'])) {
                        $existingProduct['images'] = array_map(function($img) {
                            if (is_string($img)) {
                                return getImageUrl($img);
                            }
                            return $img;
                        }, $existingProduct['images']);
                    }
                    if (!empty($existingProduct['thumbnail'])) {
                        $existingProduct['thumbnail'] = getImageUrl($existingProduct['thumbnail']);
                    }
                    $existingProduct['category'] = $existingProduct['category_name'] ?? null;
                    $existingProduct['_id'] = strval($existingProduct['id']);
                    
                    error_log("✅ CREATE PRODUCT - Returning existing product instead of creating duplicate");
                    sendSuccess('Product already exists (duplicate prevented)', [
                        'product' => $existingProduct,
                        'id' => $recentProduct['id'],
                        'duplicate_prevented' => true,
                        'message' => 'This product was created very recently. Returning existing product.'
                    ], 200);
                return;
                }
            }
        }
        
        // Add request tracking
        $requestId = uniqid('req_', true);
        error_log("🔍 CREATE PRODUCT - Request ID: " . $requestId . " for product: " . ($data['name'] ?? 'UNKNOWN'));

        // DEBUG: Log incoming data
        error_log("🔍 CREATE PRODUCT - Decoded data keys: " . json_encode(array_keys($data)));
        error_log("🔍 CREATE PRODUCT - Name: " . ($data['name'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - Category: " . ($data['category'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - Price: " . ($data['price'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - Stock: " . ($data['stock'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - Images: " . (isset($data['images']) ? count($data['images']) . ' images' : 'NOT SET'));

        // Management Logic: Validate admin permissions
        if (!isset($data['name']) || empty($data['name'])) {
            error_log("❌ CREATE PRODUCT - Name validation failed");
            sendError('Product name is required for management', [], 400);
            return;
        }

        // Validate required fields - thumbnail is optional, will use first image
        $errors = validateRequired($data, ['name', 'price', 'category', 'stock']);
        if (!empty($errors)) {
            error_log("❌ CREATE PRODUCT - Validation errors: " . json_encode($errors));
            error_log("❌ CREATE PRODUCT - Missing fields: " . implode(', ', array_keys($errors)));
            sendError('Validation failed', $errors, 400);
            return;
        }

        error_log("✅ CREATE PRODUCT - Validation passed");

        // Validate images
        if (!isset($data['images']) || empty($data['images']) || !is_array($data['images']) || count($data['images']) === 0) {
            error_log("❌ CREATE PRODUCT - No images provided or images array is empty");
            sendError('At least one product image is required', [], 400);
            return;
        }

        // Normalize image URLs to relative paths for storage
        // CRITICAL: Handle base64 images by converting them to files
        $imagesArray = isset($data['images']) ? $data['images'] : [];
        $normalizedImages = [];
        if (is_array($imagesArray)) {
            foreach ($imagesArray as $img) {
                // Handle both string URLs and object with url property
                $imageUrl = '';
                if (is_string($img)) {
                    $imageUrl = $img;
                } else if (is_array($img) || is_object($img)) {
                    $imageUrl = $img['url'] ?? $img['preview'] ?? $img['imageUrl'] ?? '';
                }
                
                if (!empty($imageUrl)) {
                    // normalizeImagePath now handles base64 conversion automatically
                    $normalizedPath = normalizeImagePath($imageUrl, 'products');
                    if ($normalizedPath) {
                        $normalizedImages[] = $normalizedPath;
                        error_log("✅ CREATE PRODUCT - Image normalized: " . substr($imageUrl, 0, 50) . "... -> " . $normalizedPath);
                    } else {
                        error_log("⚠️ CREATE PRODUCT - Image normalization failed for: " . substr($imageUrl, 0, 50) . "...");
                    }
                }
            }
        }
        
        // Validate that we have at least one normalized image
        if (empty($normalizedImages)) {
            error_log("❌ CREATE PRODUCT - All images failed normalization. Original images: " . json_encode($imagesArray));
            sendError('Failed to process product images. Please ensure images are valid URLs, uploaded files, or valid base64 data.', [], 400);
            return;
        }
        
        $images = json_encode($normalizedImages);
        
        $productTypes = isset($data['productTypes']) ? json_encode($data['productTypes']) : null;
        $specifications = isset($data['specifications']) ? json_encode($data['specifications']) : null;
        $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
        $weightOptions = isset($data['weightOptions']) ? json_encode($data['weightOptions']) : null;

        // Use first image as thumbnail if thumbnail not provided
        $thumbnailRaw = isset($data['thumbnail']) ? $data['thumbnail'] : (isset($normalizedImages[0]) ? $normalizedImages[0] : null);
        $thumbnail = $thumbnailRaw ? normalizeImagePath($thumbnailRaw) : null;

        // Check if sub_category and menu_option columns exist before including them in INSERT
        $hasSubCategory = false;
        $hasMenuOption = false;
        $hasMenuCategory = false;
        try {
            $colCheck = $db->query("SHOW COLUMNS FROM products LIKE 'sub_category'");
            $hasSubCategory = $colCheck && $colCheck->rowCount() > 0;
            $colCheck2 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_option'");
            $hasMenuOption = $colCheck2 && $colCheck2->rowCount() > 0;
            $colCheck3 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_category'");
            $hasMenuCategory = $colCheck3 && $colCheck3->rowCount() > 0;
        } catch (Exception $e) {
            // Columns don't exist, continue without them
        }
        
        // Build INSERT statement dynamically based on available columns
        $insertFields = "name, description, price, original_price, category_id, stock, images, thumbnail,
                is_featured, is_bestseller, is_new, is_active, sku, weight";
        $insertPlaceholders = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
        $insertValues = [];
        
        if ($hasSubCategory) {
            $insertFields .= ", sub_category";
            $insertPlaceholders .= ", ?";
        }
        if ($hasMenuOption) {
            $insertFields .= ", menu_option";
            $insertPlaceholders .= ", ?";
        }
        if ($hasMenuCategory) {
            $insertFields .= ", menu_category";
            $insertPlaceholders .= ", ?";
        }

        $stmt = $db->prepare("
            INSERT INTO products ($insertFields) VALUES ($insertPlaceholders)
        ");

        // Map frontend camelCase to database snake_case
        // Both isFeatured and isBestseller should mark product as featured
        $featured = ($data['isFeatured'] ?? 0) || ($data['isBestseller'] ?? 0) ? 1 : ($data['featured'] ?? 0);
        $isBestseller = ($data['isBestseller'] ?? 0) ? 1 : 0; // Convert boolean to integer
        $isNew = ($data['isNew'] ?? 0) ? 1 : 0; // Convert boolean to integer
        $hasWeightOptions = $data['hasWeightOptions'] ?? 0;
        $isActive = $data['isActive'] ?? 1; // Default to active (1) if not specified

        // DEBUG: Log the values
        error_log("🔍 CREATE PRODUCT - isNew from request: " . ($data['isNew'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - \$isNew variable: " . $isNew);
        error_log("🔍 CREATE PRODUCT - isBestseller: " . ($data['isBestseller'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - isFeatured: " . ($data['isFeatured'] ?? 'NOT SET'));
        error_log("🔍 CREATE PRODUCT - \$featured variable: " . $featured);

        // Get category_id from category name
        $categoryId = null;
        if (isset($data['category']) && !empty($data['category'])) {
            try {
                $catStmt = $db->prepare("SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1");
            $catStmt->execute([$data['category'], $data['category']]);
                $category = $catStmt->fetch(PDO::FETCH_ASSOC);
                if ($category && isset($category['id'])) {
                    $categoryId = $category['id'];
                    error_log("✅ CREATE PRODUCT - Category found: " . $data['category'] . " -> ID: " . $categoryId);
                } else {
                    error_log("⚠️ CREATE PRODUCT - Category not found: " . $data['category'] . ". Will create with category_id = NULL");
                    // Don't fail - allow products without category_id (might be a new category)
                }
            } catch (PDOException $e) {
                error_log("❌ CREATE PRODUCT - Error fetching category: " . $e->getMessage());
                // Continue without category_id
            }
        } else {
            error_log("⚠️ CREATE PRODUCT - No category provided");
        }

        // Ensure price and stock are numeric
        $price = is_numeric($data['price']) ? floatval($data['price']) : 0;
        $originalPrice = isset($data['originalPrice']) && is_numeric($data['originalPrice']) ? floatval($data['originalPrice']) : (isset($data['original_price']) && is_numeric($data['original_price']) ? floatval($data['original_price']) : null);
        $stock = is_numeric($data['stock']) ? intval($data['stock']) : 0;
        $weight = isset($data['weight']) && is_numeric($data['weight']) ? floatval($data['weight']) : null;
        
        // Validate price is greater than 0
        if ($price <= 0) {
            error_log("❌ CREATE PRODUCT - Invalid price: " . $price);
            sendError('Product price must be greater than 0', ['price' => 'Invalid price'], 400);
            return;
        }
        
        error_log("🔍 CREATE PRODUCT - Final values - Name: " . $data['name'] . ", Price: " . $price . ", Stock: " . $stock . ", Category ID: " . ($categoryId ?? 'NULL') . ", Images: " . count($normalizedImages));
        
        // Build execute parameters array
        $executeParams = [
            sanitizeInput($data['name']),
            sanitizeInput($data['description'] ?? ''),
            $price,
            $originalPrice,
            $categoryId,
            $stock,
            $images,
            $thumbnail,
            $featured,
            $data['isBestseller'] ?? 0,
            $isNew,
            $isActive,
            $data['sku'] ?? null,
            $weight
        ];

        // DEBUG: Log what we're about to insert
        error_log("🔍 CREATE PRODUCT - Execute params for is_new (index 10): " . $executeParams[10]);
        error_log("🔍 CREATE PRODUCT - Execute params for is_bestseller (index 9): " . $executeParams[9]);
        error_log("🔍 CREATE PRODUCT - Execute params for is_featured (index 8): " . $executeParams[8]);
        
        // Add sub_category if column exists
        if ($hasSubCategory) {
            $subCategoryValue = $data['subCategory'] ?? $data['sub_category'] ?? null;
            // Convert empty string to null
            $subCategoryValue = ($subCategoryValue === '' || $subCategoryValue === null) ? null : sanitizeInput($subCategoryValue);
            $executeParams[] = $subCategoryValue;
            error_log("🔍 CREATE PRODUCT - SubCategory value: " . ($subCategoryValue ?? 'NULL'));
        }
        
        // Add menu_option if column exists
        if ($hasMenuOption) {
            $menuOptionValue = $data['menuOption'] ?? $data['menu_option'] ?? null;
            // Convert empty string to null
            $menuOptionValue = ($menuOptionValue === '' || $menuOptionValue === null) ? null : sanitizeInput($menuOptionValue);
            $executeParams[] = $menuOptionValue;
            error_log("🔍 CREATE PRODUCT - MenuOption value: " . ($menuOptionValue ?? 'NULL'));
        }
        
        // Add menu_category if column exists
        // menu_category should be the same as the main category (category field)
        // This column is used for filtering, but should match category for consistency
        if ($hasMenuCategory) {
            // menu_category = category (they should be the same)
            $menuCategory = $data['category'] ?? $data['menuCategory'] ?? $data['selectedMenuFilter'] ?? null;
            // Only set if it's not "all" or empty
            $menuCategory = ($menuCategory && $menuCategory !== 'all' && $menuCategory !== '') ? sanitizeInput($menuCategory) : null;
            $executeParams[] = $menuCategory;
            error_log("🔍 CREATE PRODUCT - MenuCategory value: " . ($menuCategory ?? 'NULL') . " (same as category: " . ($data['category'] ?? 'NULL') . ")");
        }
        
        error_log("🔍 CREATE PRODUCT - Fields being inserted: " . $insertFields);
        error_log("🔍 CREATE PRODUCT - HasSubCategory column: " . ($hasSubCategory ? 'YES' : 'NO'));
        error_log("🔍 CREATE PRODUCT - HasMenuOption column: " . ($hasMenuOption ? 'YES' : 'NO'));
        error_log("🔍 CREATE PRODUCT - HasMenuCategory column: " . ($hasMenuCategory ? 'YES' : 'NO'));
        error_log("🔍 CREATE PRODUCT - Received data - subCategory: " . ($data['subCategory'] ?? $data['sub_category'] ?? 'NOT PROVIDED'));
        error_log("🔍 CREATE PRODUCT - Received data - menuOption: " . ($data['menuOption'] ?? $data['menu_option'] ?? 'NOT PROVIDED'));
        error_log("🔍 CREATE PRODUCT - Received data - selectedMenuFilter: " . ($data['selectedMenuFilter'] ?? $data['menuCategory'] ?? 'NOT PROVIDED'));
        error_log("🔍 CREATE PRODUCT - Final values - SubCategory: " . (isset($executeParams[14]) ? $executeParams[14] : 'N/A'));
        error_log("🔍 CREATE PRODUCT - Final values - MenuOption: " . (isset($executeParams[15]) ? $executeParams[15] : 'N/A'));
        error_log("🔍 CREATE PRODUCT - Final values - MenuCategory: " . (isset($executeParams[16]) ? $executeParams[16] : 'N/A'));
        
        $result = $stmt->execute($executeParams);

        if ($result) {
            $productId = $db->lastInsertId();
            error_log("✅ CREATE PRODUCT - Product created successfully with ID: " . $productId);
            
            // Build SELECT query for created product with conditional columns
            $selectFieldsCreated = "p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
                       p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
                       p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
                       c.name as category_name, c.slug as category_slug, p.category_id";
            
            if ($hasSubCategory) {
                $selectFieldsCreated .= ", p.sub_category";
            }
            if ($hasMenuOption) {
                $selectFieldsCreated .= ", p.menu_option";
            }
            if ($hasMenuCategory) {
                $selectFieldsCreated .= ", p.menu_category";
            }
            
            // Fetch the created product with all fields and converted image URLs
            $fetchStmt = $db->prepare("
                SELECT $selectFieldsCreated
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?
            ");
            $fetchStmt->execute([$productId]);
            $createdProduct = $fetchStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($createdProduct) {
                // Decode JSON fields and convert image URLs to production URLs
                $createdProduct['images'] = $createdProduct['images'] ? json_decode($createdProduct['images'], true) : [];
                if (is_array($createdProduct['images'])) {
                    $createdProduct['images'] = array_map(function($img) {
                        if (is_string($img)) {
                            return getImageUrl($img);
                        }
                        return $img;
                    }, $createdProduct['images']);
                }
                if (!empty($createdProduct['thumbnail'])) {
                    $createdProduct['thumbnail'] = getImageUrl($createdProduct['thumbnail']);
                }
                $createdProduct['product_types'] = isset($createdProduct['product_types']) && $createdProduct['product_types'] ? json_decode($createdProduct['product_types'], true) : null;
                $createdProduct['specifications'] = isset($createdProduct['specifications']) && $createdProduct['specifications'] ? json_decode($createdProduct['specifications'], true) : null;
                $createdProduct['tags'] = isset($createdProduct['tags']) && $createdProduct['tags'] ? json_decode($createdProduct['tags'], true) : null;
                $createdProduct['weight_options'] = isset($createdProduct['weight_options']) && $createdProduct['weight_options'] ? json_decode($createdProduct['weight_options'], true) : null;
                
                // CRITICAL: Add category field for frontend compatibility
                $createdProduct['category'] = $createdProduct['category_name'] ?? null;
                
                // Add sub_category, menu_option, and menu_category if they exist
                if (isset($createdProduct['sub_category'])) {
                    $createdProduct['subCategory'] = $createdProduct['sub_category'];
                }
                if (isset($createdProduct['menu_option'])) {
                    $createdProduct['menuOption'] = $createdProduct['menu_option'];
                }
                if (isset($createdProduct['menu_category'])) {
                    $createdProduct['menuCategory'] = $createdProduct['menu_category'];
                    $createdProduct['selectedMenuFilter'] = $createdProduct['menu_category'] ? $createdProduct['menu_category'] : 'all';
                }
                
                // Ensure _id field exists for frontend compatibility
                if (isset($createdProduct['id']) && !isset($createdProduct['_id'])) {
                    $createdProduct['_id'] = strval($createdProduct['id']);
                }
                
                error_log("✅ CREATE PRODUCT - Product returned with category: " . ($createdProduct['category'] ?? 'NULL'));
                error_log("✅ CREATE PRODUCT - SubCategory: " . ($createdProduct['subCategory'] ?? 'NULL') . ", MenuOption: " . ($createdProduct['menuOption'] ?? 'NULL') . ", MenuCategory: " . ($createdProduct['menuCategory'] ?? 'NULL'));
                
                sendSuccess('Product created successfully', ['product' => $createdProduct, 'id' => $productId], 201);
            } else {
                // Fallback if fetch fails
                error_log("⚠️ CREATE PRODUCT - Failed to fetch created product, returning ID only");
            sendSuccess('Product created successfully', ['id' => $productId], 201);
            }
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("❌ CREATE PRODUCT - Execute failed");
            error_log("❌ CREATE PRODUCT - Error Code: " . ($errorInfo[0] ?? 'N/A'));
            error_log("❌ CREATE PRODUCT - SQL State: " . ($errorInfo[0] ?? 'N/A'));
            error_log("❌ CREATE PRODUCT - Error Message: " . ($errorInfo[2] ?? 'Unknown error'));
            error_log("❌ CREATE PRODUCT - Full Error Info: " . json_encode($errorInfo));
            
            // Provide user-friendly error message
            $errorMessage = 'Failed to create product';
            if (isset($errorInfo[2])) {
                if (strpos($errorInfo[2], 'Column') !== false) {
                    $errorMessage = 'Database schema error. Please contact support.';
                } else if (strpos($errorInfo[2], 'Duplicate') !== false) {
                    $errorMessage = 'A product with this name already exists.';
                } else {
                    $errorMessage = 'Database error: ' . $errorInfo[2];
                }
            }
            
            sendError($errorMessage, [
                'error_code' => $errorInfo[0] ?? 'UNKNOWN',
                'hint' => 'Check if all required fields are provided and valid'
            ], 500);
        }
    } catch (PDOException $e) {
        error_log("❌ CREATE PRODUCT - PDO Exception: " . $e->getMessage());
        error_log("❌ CREATE PRODUCT - Error Code: " . $e->getCode());
        error_log("❌ CREATE PRODUCT - SQL State: " . ($e->errorInfo[0] ?? 'N/A'));
        error_log("❌ CREATE PRODUCT - Error Info: " . json_encode($e->errorInfo ?? []));
        error_log("❌ CREATE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        // Provide user-friendly error message
        $errorMessage = 'Database error occurred while creating product';
        if (strpos($e->getMessage(), 'Column') !== false) {
            $errorMessage = 'Database schema mismatch. Please contact support.';
        } else if (strpos($e->getMessage(), 'Duplicate') !== false) {
            $errorMessage = 'A product with this name already exists.';
        }
        
        if (!headers_sent()) {
            sendError($errorMessage, [
                'code' => $e->getCode(),
                'hint' => 'Check if all required fields match database schema',
                'sql_state' => $e->errorInfo[0] ?? 'N/A'
            ], 500);
        }
    } catch (Exception $e) {
        error_log("❌ CREATE PRODUCT - General Exception: " . $e->getMessage());
        error_log("❌ CREATE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        error_log("❌ CREATE PRODUCT - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendError('Failed to create product: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    } catch (Throwable $e) {
        error_log("❌ CREATE PRODUCT - Fatal Error: " . $e->getMessage());
        error_log("❌ CREATE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        error_log("❌ CREATE PRODUCT - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendError('An unexpected error occurred while creating product', [
                'error_code' => 'FATAL_ERROR'
            ], 500);
        }
    }
}

/**
 * Update product (Admin only)
 */
function updateProduct($db, $id) {
    // Enhanced Management Logic: Check admin authentication
    try {
        $authUser = AuthMiddleware::requireAdmin();
        if (!$authUser) {
            sendError('Admin access required for product management', [], 403);
            return;
        }
    } catch (Exception $e) {
        error_log("❌ UPDATE PRODUCT - Auth error: " . $e->getMessage());
        if (!headers_sent()) {
            sendError('Admin access required for product management', [], 403);
        }
        return;
    }
    
    try {
        $data = getRequestBody();
        
        // Validate that we received data
        if (empty($data)) {
            error_log("❌ UPDATE PRODUCT - Empty request body");
            sendError('No data provided for update', [], 400);
            return;
        }
        
        // Management Logic: Validate product exists before updating
        $checkStmt = $db->prepare("SELECT id, name FROM products WHERE id = ?");
        $checkStmt->execute([$id]);
        $existingProduct = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingProduct || !isset($existingProduct['id'])) {
            error_log("❌ UPDATE PRODUCT - Product not found: ID " . $id);
            sendError('Product not found for management', [], 404);
            return;
        }
        
        error_log("🔍 UPDATE PRODUCT - Updating product ID: " . $id . " - Name: " . $existingProduct['name']);

        // Check if sub_category, menu_option, and menu_category columns exist
        $hasSubCategory = false;
        $hasMenuOption = false;
        $hasMenuCategory = false;
        try {
            $colCheck = $db->query("SHOW COLUMNS FROM products LIKE 'sub_category'");
            $hasSubCategory = $colCheck && $colCheck->rowCount() > 0;
            $colCheck2 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_option'");
            $hasMenuOption = $colCheck2 && $colCheck2->rowCount() > 0;
            $colCheck3 = $db->query("SHOW COLUMNS FROM products LIKE 'menu_category'");
            $hasMenuCategory = $colCheck3 && $colCheck3->rowCount() > 0;
        } catch (Exception $e) {
            // Columns don't exist, continue without them
        }

        // Build update query dynamically based on provided fields
        $fields = [];
        $params = [];

        $allowedFields = [
            'name', 'description', 'price', 'original_price',
            'stock', 'thumbnail', 'sku', 'weight', 'is_active'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $value = sanitizeInput($data[$field]);
                // Normalize thumbnail if it's being updated
                if ($field === 'thumbnail' && !empty($value)) {
                    $value = normalizeImagePath($value);
                }
                $fields[] = "$field = ?";
                $params[] = $value;
            }
        }

        // Handle featured field - both isFeatured and isBestseller should set is_featured = 1
        if (isset($data['isFeatured']) || isset($data['isBestseller'])) {
            $isFeatured = ($data['isFeatured'] ?? 0) || ($data['isBestseller'] ?? 0) ? 1 : 0;
            $fields[] = "is_featured = ?";
            $params[] = $isFeatured;
        }
        
        // Handle isBestseller field
        if (isset($data['isBestseller'])) {
            $fields[] = "is_bestseller = ?";
            $params[] = $data['isBestseller'] ? 1 : 0;
        }
        
        // Handle isNew field
        if (isset($data['isNew'])) {
            $fields[] = "is_new = ?";
            $params[] = $data['isNew'] ? 1 : 0;
        }
        
        // Handle category_id from category name - CRITICAL for preserving category selection
        if (isset($data['category']) && !empty($data['category'])) {
            try {
                $catStmt = $db->prepare("SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1");
            $catStmt->execute([$data['category'], $data['category']]);
                $category = $catStmt->fetch(PDO::FETCH_ASSOC);
                if ($category && isset($category['id'])) {
                $fields[] = "category_id = ?";
                $params[] = $category['id'];
                    error_log("✅ UPDATE PRODUCT - Category found: " . $data['category'] . " -> ID: " . $category['id']);
                } else {
                    error_log("⚠️ UPDATE PRODUCT - Category not found: " . $data['category'] . ", category_id will remain unchanged");
                    // Don't update category_id if category name not found
                }
            } catch (PDOException $e) {
                error_log("❌ UPDATE PRODUCT - Error fetching category: " . $e->getMessage());
                // Continue without updating category_id
            }
        }
        
        // Handle sub_category if column exists - ALWAYS update if column exists (even if empty/null)
        if ($hasSubCategory) {
            $subCategoryValue = $data['subCategory'] ?? $data['sub_category'] ?? null;
            // Convert empty string to null, otherwise sanitize
            $subCategoryValue = ($subCategoryValue === '' || $subCategoryValue === null) ? null : sanitizeInput($subCategoryValue);
            $fields[] = "sub_category = ?";
            $params[] = $subCategoryValue;
            error_log("✅ UPDATE PRODUCT - SubCategory: " . ($subCategoryValue ?? 'NULL'));
        }
        
        // Handle menu_option if column exists - ALWAYS update if column exists (even if empty/null)
        if ($hasMenuOption) {
            $menuOptionValue = $data['menuOption'] ?? $data['menu_option'] ?? null;
            // Convert empty string to null, otherwise sanitize
            $menuOptionValue = ($menuOptionValue === '' || $menuOptionValue === null) ? null : sanitizeInput($menuOptionValue);
            $fields[] = "menu_option = ?";
            $params[] = $menuOptionValue;
            error_log("✅ UPDATE PRODUCT - MenuOption: " . ($menuOptionValue ?? 'NULL'));
        }
        
        // Handle menu_category if column exists
        // menu_category should be the same as the main category (category field)
        // This column is used for filtering, but should match category for consistency
        if ($hasMenuCategory) {
            // menu_category = category (they should be the same)
            $menuCategory = $data['category'] ?? $data['menuCategory'] ?? $data['selectedMenuFilter'] ?? null;
            // Only set if it's not "all" or empty, otherwise set to NULL
            if ($menuCategory && $menuCategory !== 'all' && $menuCategory !== '') {
                $fields[] = "menu_category = ?";
                $params[] = sanitizeInput($menuCategory);
                error_log("✅ UPDATE PRODUCT - MenuCategory: " . $menuCategory . " (same as category: " . ($data['category'] ?? 'NULL') . ")");
            } else {
                // Explicitly set to NULL if "all" is selected or empty
                $fields[] = "menu_category = ?";
                $params[] = null;
                error_log("✅ UPDATE PRODUCT - MenuCategory: NULL (category is empty/all)");
            }
        }

        // Handle JSON fields - normalize image URLs
        // CRITICAL: Handle base64 images by converting them to files
        if (isset($data['images'])) {
            $imagesArray = $data['images'];
            $normalizedImages = [];
            if (is_array($imagesArray)) {
                foreach ($imagesArray as $img) {
                    // Handle both string URLs and object with url property
                    $imageUrl = '';
                    if (is_string($img)) {
                        $imageUrl = $img;
                    } else if (is_array($img) || is_object($img)) {
                        $imageUrl = $img['url'] ?? $img['preview'] ?? $img['imageUrl'] ?? '';
                    }
                    
                    if (!empty($imageUrl)) {
                        // normalizeImagePath now handles base64 conversion automatically
                        $normalizedPath = normalizeImagePath($imageUrl, 'products');
                        if ($normalizedPath) {
                            $normalizedImages[] = $normalizedPath;
                            error_log("✅ UPDATE PRODUCT - Image normalized: " . substr($imageUrl, 0, 50) . "... -> " . $normalizedPath);
                        } else {
                            error_log("⚠️ UPDATE PRODUCT - Image normalization failed for: " . substr($imageUrl, 0, 50) . "...");
                        }
                    }
                }
            }
            
            // Validate that we have at least one normalized image
            if (empty($normalizedImages)) {
                error_log("❌ UPDATE PRODUCT - All images failed normalization. Original images: " . json_encode($imagesArray));
                sendError('Failed to process product images. Please ensure images are valid URLs, uploaded files, or valid base64 data.', [], 400);
                return;
            }
            
            $fields[] = "images = ?";
            $params[] = json_encode($normalizedImages);
            error_log("✅ UPDATE PRODUCT - Images normalized: " . count($normalizedImages) . " images");
        }
        // Only update optional fields if they exist in the database schema
        // Check for product_types column
        if (isset($data['productTypes'])) {
            try {
                $checkCol = $db->query("SHOW COLUMNS FROM products LIKE 'product_types'");
                if ($checkCol && $checkCol->rowCount() > 0) {
            $fields[] = "product_types = ?";
            $params[] = json_encode($data['productTypes']);
        }
            } catch (Exception $e) {
                // Column doesn't exist, skip it
            }
        }
        
        // Check for specifications column
        if (isset($data['specifications'])) {
            try {
                $checkCol = $db->query("SHOW COLUMNS FROM products LIKE 'specifications'");
                if ($checkCol && $checkCol->rowCount() > 0) {
            $fields[] = "specifications = ?";
            $params[] = json_encode($data['specifications']);
        }
            } catch (Exception $e) {
                // Column doesn't exist, skip it
                error_log("⚠️ UPDATE PRODUCT - specifications column not found, skipping");
            }
        }
        
        // Check for tags column
        if (isset($data['tags'])) {
            try {
                $checkCol = $db->query("SHOW COLUMNS FROM products LIKE 'tags'");
                if ($checkCol && $checkCol->rowCount() > 0) {
            $fields[] = "tags = ?";
            $params[] = json_encode($data['tags']);
        }
            } catch (Exception $e) {
                // Column doesn't exist, skip it
            }
        }
        
        // Check for weight_options column
        if (isset($data['weightOptions'])) {
            try {
                $checkCol = $db->query("SHOW COLUMNS FROM products LIKE 'weight_options'");
                if ($checkCol && $checkCol->rowCount() > 0) {
            $fields[] = "weight_options = ?";
            $params[] = json_encode($data['weightOptions']);
                }
            } catch (Exception $e) {
                // Column doesn't exist, skip it
            }
        }

        if (empty($fields)) {
            sendError('No fields to update', [], 400);
            return;
        }

        $params[] = $id;
        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";

        error_log("🔍 UPDATE PRODUCT - SQL: " . $sql);
        error_log("🔍 UPDATE PRODUCT - Params count: " . count($params) . ", Fields count: " . count($fields));

        $stmt = $db->prepare($sql);
        if ($stmt && $stmt->execute($params)) {
            // Build SELECT query for updated product with conditional columns
            $selectFieldsUpdated = "p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
                       p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
                       p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
                       c.name as category_name, c.slug as category_slug, p.category_id";
            
            if ($hasSubCategory) {
                $selectFieldsUpdated .= ", p.sub_category";
            }
            if ($hasMenuOption) {
                $selectFieldsUpdated .= ", p.menu_option";
            }
            if ($hasMenuCategory) {
                $selectFieldsUpdated .= ", p.menu_category";
            }
            
            // Fetch updated product with all fields - MUST include category_name from JOIN
            $updatedStmt = $db->prepare("
                SELECT $selectFieldsUpdated
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?
            ");
            $updatedStmt->execute([$id]);
            $updatedProduct = $updatedStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($updatedProduct) {
                // Decode JSON fields and convert image URLs
                $updatedProduct['images'] = $updatedProduct['images'] ? json_decode($updatedProduct['images'], true) : [];
                if (is_array($updatedProduct['images'])) {
                    $updatedProduct['images'] = array_map(function($img) {
                        if (is_string($img)) {
                            return getImageUrl($img);
                        }
                        return $img;
                    }, $updatedProduct['images']);
                }
                if (!empty($updatedProduct['thumbnail'])) {
                    $updatedProduct['thumbnail'] = getImageUrl($updatedProduct['thumbnail']);
                }
                $updatedProduct['product_types'] = $updatedProduct['product_types'] ?? null ? json_decode($updatedProduct['product_types'], true) : null;
                $updatedProduct['specifications'] = $updatedProduct['specifications'] ?? null ? json_decode($updatedProduct['specifications'], true) : null;
                $updatedProduct['tags'] = $updatedProduct['tags'] ?? null ? json_decode($updatedProduct['tags'], true) : null;
                $updatedProduct['weight_options'] = $updatedProduct['weight_options'] ?? null ? json_decode($updatedProduct['weight_options'], true) : null;
                
                // CRITICAL: Add category field for frontend compatibility
                // Use category_name from JOIN, but fallback to menu_category if category_id is NULL
                if (!empty($updatedProduct['category_name'])) {
                    $updatedProduct['category'] = $updatedProduct['category_name'];
                } elseif (isset($updatedProduct['menu_category']) && !empty($updatedProduct['menu_category'])) {
                    // Fallback to menu_category if category_name is NULL/empty
                    $updatedProduct['category'] = $updatedProduct['menu_category'];
                    error_log("✅ UPDATE PRODUCT - Using menu_category as category fallback: " . $updatedProduct['menu_category']);
                } else {
                    $updatedProduct['category'] = null;
                }
                
                // Add sub_category, menu_option, and menu_category if they exist
                if (isset($updatedProduct['sub_category']) && $updatedProduct['sub_category'] !== null && $updatedProduct['sub_category'] !== '') {
                    $updatedProduct['subCategory'] = $updatedProduct['sub_category'];
                    error_log("✅ UPDATE PRODUCT - SubCategory set: " . $updatedProduct['sub_category']);
                } else {
                    $updatedProduct['subCategory'] = null;
                    error_log("⚠️ UPDATE PRODUCT - SubCategory is NULL or empty");
                }
                // CRITICAL: Map menu_option correctly - same logic as getProductById
                if (isset($updatedProduct['menu_option']) && $updatedProduct['menu_option'] !== null && $updatedProduct['menu_option'] !== '') {
                    $updatedProduct['menuOption'] = $updatedProduct['menu_option'];
                    error_log("✅ UPDATE PRODUCT - MenuOption set: " . $updatedProduct['menu_option']);
                } else {
                    $updatedProduct['menuOption'] = null;
                    error_log("⚠️ UPDATE PRODUCT - MenuOption is NULL or empty");
                }
                // CRITICAL: Map menu_category correctly - same logic as getProductById
                if (isset($updatedProduct['menu_category']) && $updatedProduct['menu_category'] !== null && $updatedProduct['menu_category'] !== '') {
                    $updatedProduct['menuCategory'] = $updatedProduct['menu_category'];
                    if ($updatedProduct['menu_category'] !== 'all') {
                        $updatedProduct['selectedMenuFilter'] = $updatedProduct['menu_category'];
                        error_log("✅ UPDATE PRODUCT - MenuCategory set: " . $updatedProduct['menu_category']);
                    } else {
                        $updatedProduct['selectedMenuFilter'] = null;
                    }
                } else {
                    $updatedProduct['menuCategory'] = null;
                    $updatedProduct['selectedMenuFilter'] = null;
                    error_log("⚠️ UPDATE PRODUCT - MenuCategory is NULL or empty");
                }
                
                // Ensure _id field exists for frontend compatibility
                if (isset($updatedProduct['id']) && !isset($updatedProduct['_id'])) {
                    $updatedProduct['_id'] = strval($updatedProduct['id']);
                }
                
                error_log("✅ UPDATE PRODUCT - Category returned: " . ($updatedProduct['category'] ?? 'NULL'));
                error_log("✅ UPDATE PRODUCT - SubCategory: " . ($updatedProduct['subCategory'] ?? 'NULL') . ", MenuOption: " . ($updatedProduct['menuOption'] ?? 'NULL') . ", MenuCategory: " . ($updatedProduct['menuCategory'] ?? 'NULL') . ", selectedMenuFilter: " . ($updatedProduct['selectedMenuFilter'] ?? 'NULL'));
            }
            
            sendSuccess('Product updated successfully', ['product' => $updatedProduct]);
        } else {
            $errorInfo = $stmt ? $stmt->errorInfo() : ['Unknown error', 'Unknown SQL State', 'Failed to prepare or execute statement'];
            error_log("❌ UPDATE PRODUCT - Execute failed");
            error_log("❌ UPDATE PRODUCT - Error Code: " . ($errorInfo[0] ?? 'N/A'));
            error_log("❌ UPDATE PRODUCT - SQL State: " . ($errorInfo[0] ?? 'N/A'));
            error_log("❌ UPDATE PRODUCT - Error Message: " . ($errorInfo[2] ?? 'Unknown error'));
            error_log("❌ UPDATE PRODUCT - Full Error Info: " . json_encode($errorInfo));
            
            // Provide user-friendly error message
            $errorMessage = 'Failed to update product';
            if (isset($errorInfo[2])) {
                if (strpos($errorInfo[2], 'Column') !== false) {
                    $errorMessage = 'Database schema error. Please contact support.';
                } else if (strpos($errorInfo[2], 'Duplicate') !== false) {
                    $errorMessage = 'A product with this name already exists.';
                } else {
                    $errorMessage = 'Database error: ' . $errorInfo[2];
                }
            }
            
            if (!headers_sent()) {
                sendError($errorMessage, [
                    'error_code' => $errorInfo[0] ?? 'UNKNOWN',
                    'hint' => 'Check if all provided fields are valid'
                ], 500);
            }
        }
    } catch (PDOException $e) {
        error_log("❌ UPDATE PRODUCT - PDO Exception: " . $e->getMessage());
        error_log("❌ UPDATE PRODUCT - Error Code: " . $e->getCode());
        error_log("❌ UPDATE PRODUCT - SQL State: " . ($e->errorInfo[0] ?? 'N/A'));
        error_log("❌ UPDATE PRODUCT - Error Info: " . json_encode($e->errorInfo ?? []));
        error_log("❌ UPDATE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        // Provide user-friendly error message
        $errorMessage = 'Database error occurred while updating product';
        if (strpos($e->getMessage(), 'Column') !== false) {
            $errorMessage = 'Database schema mismatch. Please contact support.';
        } else if (strpos($e->getMessage(), 'Duplicate') !== false) {
            $errorMessage = 'A product with this name already exists.';
        }
        
        if (!headers_sent()) {
            sendError($errorMessage, [
                'code' => $e->getCode(),
                'hint' => 'Check if all required fields match database schema',
                'sql_state' => $e->errorInfo[0] ?? 'N/A'
            ], 500);
        }
    } catch (Exception $e) {
        error_log("❌ UPDATE PRODUCT - General Exception: " . $e->getMessage());
        error_log("❌ UPDATE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        error_log("❌ UPDATE PRODUCT - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendError('Failed to update product: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    } catch (Throwable $e) {
        error_log("❌ UPDATE PRODUCT - Fatal Error: " . $e->getMessage());
        error_log("❌ UPDATE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        error_log("❌ UPDATE PRODUCT - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendError('An unexpected error occurred while updating product', [
                'error_code' => 'FATAL_ERROR'
            ], 500);
        }
    }
}

/**
 * Delete product (Admin only)
 */
function deleteProduct($db, $id) {
    // Enhanced Management Logic: Check admin authentication
    try {
        $authUser = AuthMiddleware::requireAdmin();
        if (!$authUser) {
            sendError('Admin access required for product management', [], 403);
            return;
        }
    } catch (Exception $e) {
        error_log("❌ DELETE PRODUCT - Auth error: " . $e->getMessage());
        if (!headers_sent()) {
            sendError('Admin access required for product management', [], 403);
        }
        return;
    }
    
    try {
        // Management Logic: Check if product exists before deletion
        $checkStmt = $db->prepare("SELECT id, name FROM products WHERE id = ?");
        $checkStmt->execute([$id]);
        $product = $checkStmt->fetch();

        if (!$product) {
            sendError('Product not found', [], 404);
            return;
        }

        // HARD DELETE - Permanently remove from database
        // Check for foreign key constraints (e.g., orders referencing this product)
        $hasOrders = false;
        try {
            $orderCheckStmt = $db->prepare("SELECT COUNT(*) as count FROM order_items WHERE product_id = ?");
            $orderCheckStmt->execute([$id]);
            $orderResult = $orderCheckStmt->fetch(PDO::FETCH_ASSOC);
            $hasOrders = $orderResult && isset($orderResult['count']) && $orderResult['count'] > 0;
            
            if ($hasOrders) {
                error_log("⚠️ DELETE PRODUCT - Product has " . $orderResult['count'] . " order items. Proceeding with deletion.");
            }
        } catch (Exception $e) {
            // If order_items table doesn't exist or query fails, continue with deletion
            error_log("⚠️ DELETE PRODUCT - Could not check order_items: " . $e->getMessage());
        }
        
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");

        if ($stmt && $stmt->execute([$id])) {
            $deletedRows = $stmt->rowCount();
            error_log("✅ DELETE PRODUCT - Product deleted successfully. Rows affected: " . $deletedRows);
            
            sendSuccess('Product deleted successfully', [
                'id' => $id,
                'name' => $product['name'],
                'status' => 'deleted',
                'rows_affected' => $deletedRows
            ]);
        } else {
            $errorInfo = $stmt ? $stmt->errorInfo() : ['Unknown error', 'Unknown SQL State', 'Failed to prepare statement'];
            error_log("❌ DELETE PRODUCT - Execute failed");
            error_log("❌ DELETE PRODUCT - Error Code: " . ($errorInfo[0] ?? 'N/A'));
            error_log("❌ DELETE PRODUCT - SQL State: " . ($errorInfo[0] ?? 'N/A'));
            error_log("❌ DELETE PRODUCT - Error Message: " . ($errorInfo[2] ?? 'Unknown error'));
            error_log("❌ DELETE PRODUCT - Full Error Info: " . json_encode($errorInfo));
            
            // Provide user-friendly error message
            $errorMessage = 'Failed to delete product';
            if (isset($errorInfo[2])) {
                if (strpos($errorInfo[2], 'foreign key') !== false || strpos($errorInfo[2], 'FOREIGN KEY') !== false) {
                    $errorMessage = 'Cannot delete product. It is referenced in existing orders.';
                } else if (strpos($errorInfo[2], 'Column') !== false) {
                    $errorMessage = 'Database schema error. Please contact support.';
                } else {
                    $errorMessage = 'Database error: ' . $errorInfo[2];
                }
            }
            
            if (!headers_sent()) {
                sendError($errorMessage, [
                    'error_code' => $errorInfo[0] ?? 'UNKNOWN',
                    'hint' => 'Check if product is referenced in orders or other tables'
                ], 500);
            }
        }
    } catch (PDOException $e) {
        error_log("❌ DELETE PRODUCT - PDO Exception: " . $e->getMessage());
        error_log("❌ DELETE PRODUCT - Error Code: " . $e->getCode());
        error_log("❌ DELETE PRODUCT - SQL State: " . ($e->errorInfo[0] ?? 'N/A'));
        error_log("❌ DELETE PRODUCT - Error Info: " . json_encode($e->errorInfo ?? []));
        error_log("❌ DELETE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        // Provide user-friendly error message
        $errorMessage = 'Database error occurred while deleting product';
        if (strpos($e->getMessage(), 'foreign key') !== false || strpos($e->getMessage(), 'FOREIGN KEY') !== false) {
            $errorMessage = 'Cannot delete product. It is referenced in existing orders.';
        } else if (strpos($e->getMessage(), 'Column') !== false) {
            $errorMessage = 'Database schema mismatch. Please contact support.';
        }
        
        if (!headers_sent()) {
            sendError($errorMessage, [
                'code' => $e->getCode(),
                'hint' => 'Check if product is referenced in orders or other tables',
                'sql_state' => $e->errorInfo[0] ?? 'N/A'
            ], 500);
        }
    } catch (Exception $e) {
        error_log("❌ DELETE PRODUCT - General Exception: " . $e->getMessage());
        error_log("❌ DELETE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        error_log("❌ DELETE PRODUCT - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendError('Failed to delete product: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    } catch (Throwable $e) {
        error_log("❌ DELETE PRODUCT - Fatal Error: " . $e->getMessage());
        error_log("❌ DELETE PRODUCT - File: " . $e->getFile() . ", Line: " . $e->getLine());
        error_log("❌ DELETE PRODUCT - Trace: " . $e->getTraceAsString());
        if (!headers_sent()) {
            sendError('An unexpected error occurred while deleting product', [
                'error_code' => 'FATAL_ERROR'
            ], 500);
        }
    }
}

/**
 * Reactivate product (Admin only) - Management feature
 */
function reactivateProduct($db, $id) {
    // Enhanced Management Logic: Check admin authentication
    try {
        AuthMiddleware::requireAdmin();
    } catch (Exception $e) {
        sendError('Admin access required for product management', [], 403);
        return;
    }

    // Management Logic: Check if product exists before reactivation
    $checkStmt = $db->prepare("SELECT id, name, is_active FROM products WHERE id = ?");
    $checkStmt->execute([$id]);
    $product = $checkStmt->fetch();
    
    if (!$product) {
        sendError('Product not found for management', [], 404);
        return;
    }
    
    // If-else logic for product management
    if ($product['is_active'] == 1) {
        sendError('Product is already active', [], 400);
        return;
    }

    // Reactivate product (Management approach)
    $stmt = $db->prepare("UPDATE products SET is_active = 1, updated_at = NOW() WHERE id = ?");

    if ($stmt->execute([$id])) {
        sendSuccess('Product reactivated successfully', [
            'id' => $id,
            'name' => $product['name'],
            'status' => 'reactivated'
        ]);
    } else {
        sendError('Failed to reactivate product', [], 500);
    }
}
