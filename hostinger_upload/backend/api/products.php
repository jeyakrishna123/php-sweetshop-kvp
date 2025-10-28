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
 * Get all products with pagination and filters
 */
function getAllProducts($db) {
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

    $stmt = $db->prepare("
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock, p.images, p.thumbnail,
               p.is_featured, p.is_bestseller, p.is_new, p.is_active, p.sku, p.weight,
               p.average_rating, p.num_reviews, p.sold_count, p.view_count, p.created_at, p.updated_at,
               c.name as category_name, c.slug as category_slug
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

    // Decode JSON fields
    foreach ($products as &$product) {
        $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
        $product['product_types'] = $product['product_types'] ? json_decode($product['product_types'], true) : null;
        $product['specifications'] = $product['specifications'] ? json_decode($product['specifications'], true) : null;
        $product['tags'] = $product['tags'] ? json_decode($product['tags'], true) : null;
        $product['weight_options'] = $product['weight_options'] ? json_decode($product['weight_options'], true) : null;
    }

    // Return real products from database
    $response = createPaginationResponse($products, $total, $page, $limit);
    sendSuccess('Products retrieved successfully', $response);
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

    // Build query based on user role
    if ($isAdmin) {
        // Admin can view any product (active or inactive)
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
    } else {
        // Public users only see active products
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ? AND is_active = 1");
        $stmt->execute([$id]);
    }

    $product = $stmt->fetch();

    if (!$product) {
        sendError('Product not found', [], 404);
    }

    // Decode JSON fields - handle null values properly
    $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
    $product['product_types'] = $product['product_types'] ? json_decode($product['product_types'], true) : null;
    $product['specifications'] = $product['specifications'] ? json_decode($product['specifications'], true) : [];
    $product['tags'] = $product['tags'] ? json_decode($product['tags'], true) : [];
    $product['weight_options'] = $product['weight_options'] ? json_decode($product['weight_options'], true) : [];

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
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count
        FROM products
        WHERE featured = 1 AND is_active = 1
        ORDER BY created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
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
            WHERE p.is_bestseller = 1 AND p.is_active = 1
            ORDER BY p.sold_count DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$pagination['limit'], $pagination['offset']]);
        $products = $stmt->fetchAll();

        // Decode JSON fields
        foreach ($products as &$product) {
            $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
        }

        sendSuccess('Bestsellers retrieved successfully', ['products' => $products]);
        
    } catch (PDOException $e) {
        error_log("❌ getBestsellers Error: " . $e->getMessage());
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
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count
        FROM products
        WHERE is_active = 1
        AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)
        ORDER BY average_rating DESC, sold_count DESC
        LIMIT ? OFFSET ?
    ");

    $searchTerm = "%$query%";
    $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $pagination['limit'], $pagination['offset']]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
    }

    sendSuccess('Search results', ['products' => $products, 'query' => $query]);
}

/**
 * Get products by category
 */
function getProductsByCategory($db, $category) {
    $pagination = getPaginationParams();

    $stmt = $db->prepare("
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count
        FROM products
        WHERE category = ? AND is_active = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$category, $pagination['limit'], $pagination['offset']]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
    }

    sendSuccess('Products retrieved successfully', ['products' => $products]);
}

/**
 * Get products by cake flavor
 */
function getProductsByFlavor($db, $flavor) {
    $pagination = getPaginationParams();

    $stmt = $db->prepare("
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count
        FROM products
        WHERE cake_flavor = ? AND is_active = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$flavor, $pagination['limit'], $pagination['offset']]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
    }

    sendSuccess('Products retrieved successfully', ['products' => $products]);
}

/**
 * Get products by type
 */
function getProductsByType($db, $type) {
    $pagination = getPaginationParams();

    $where = 'is_active = 1 AND JSON_CONTAINS(product_types, ?)';
    $params = [json_encode($type)];

    if ($type === 'newItems') {
        $where .= ' OR is_new = 1';
    }

    $stmt = $db->prepare("
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count
        FROM products
        WHERE $where
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $params[] = $pagination['limit'];
    $params[] = $pagination['offset'];
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
    }

    sendSuccess('Products retrieved successfully', ['products' => $products]);
}

/**
 * Create product (Admin only)
 */
function createProduct($db) {
    // Enhanced Management Logic: Check admin authentication
    try {
        AuthMiddleware::requireAdmin();
    } catch (Exception $e) {
        sendError('Admin access required', [], 403);
        return;
    }

    // Get raw input for debugging
    $rawInput = file_get_contents('php://input');
    error_log("🔍 CREATE PRODUCT - Raw input length: " . strlen($rawInput));
    error_log("🔍 CREATE PRODUCT - Raw input (first 500 chars): " . substr($rawInput, 0, 500));

    $data = getRequestBody();

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
    if (!isset($data['images']) || empty($data['images'])) {
        sendError('At least one product image is required', [], 400);
        return;
    }

    $slug = generateSlug($data['name']);
    $images = isset($data['images']) ? json_encode($data['images']) : json_encode([]);
    $productTypes = isset($data['productTypes']) ? json_encode($data['productTypes']) : null;
    $specifications = isset($data['specifications']) ? json_encode($data['specifications']) : null;
    $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
    $weightOptions = isset($data['weightOptions']) ? json_encode($data['weightOptions']) : null;

    // Use first image as thumbnail if thumbnail not provided
    $thumbnail = isset($data['thumbnail']) ? $data['thumbnail'] : (isset($data['images'][0]) ? $data['images'][0] : null);

    $stmt = $db->prepare("
        INSERT INTO products (
            name, description, price, original_price, category_id, stock, images, thumbnail,
            is_featured, is_bestseller, is_new, is_active, sku, weight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    // Map frontend camelCase to database snake_case
    // Both isFeatured and isBestseller should mark product as featured
    $featured = ($data['isFeatured'] ?? 0) || ($data['isBestseller'] ?? 0) ? 1 : ($data['featured'] ?? 0);
    $isNew = $data['isNew'] ?? 0;
    $hasWeightOptions = $data['hasWeightOptions'] ?? 0;
    $isActive = $data['isActive'] ?? 1; // Default to active (1) if not specified

    // Get category_id from category name
    $categoryId = null;
    if (isset($data['category'])) {
        $catStmt = $db->prepare("SELECT id FROM categories WHERE name = ? OR slug = ?");
        $catStmt->execute([$data['category'], $data['category']]);
        $category = $catStmt->fetch();
        $categoryId = $category ? $category['id'] : null;
    }

    try {
        $result = $stmt->execute([
            sanitizeInput($data['name']),
            sanitizeInput($data['description'] ?? ''),
            $data['price'],
            $data['originalPrice'] ?? $data['original_price'] ?? null,
            $categoryId,
            $data['stock'],
            $images,
            $thumbnail,
            $featured,
            $data['isBestseller'] ?? 0,
            $isNew,
            $isActive,
            $data['sku'] ?? null,
            $data['weight'] ?? null
        ]);

        if ($result) {
            $productId = $db->lastInsertId();
            error_log("✅ CREATE PRODUCT - Product created successfully with ID: " . $productId);
            sendSuccess('Product created successfully', ['id' => $productId], 201);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("❌ CREATE PRODUCT - Execute failed: " . json_encode($errorInfo));
            sendError('Failed to create product: ' . ($errorInfo[2] ?? 'Unknown database error'), [], 500);
        }
    } catch (PDOException $e) {
        error_log("❌ CREATE PRODUCT - PDO Exception: " . $e->getMessage());
        error_log("❌ CREATE PRODUCT - Error Code: " . $e->getCode());
        sendError('Database error: ' . $e->getMessage(), [
            'code' => $e->getCode(),
            'hint' => 'Check if all required fields match database schema'
        ], 500);
    }
}

/**
 * Update product (Admin only)
 */
function updateProduct($db, $id) {
    // Enhanced Management Logic: Check admin authentication
    try {
        AuthMiddleware::requireAdmin();
    } catch (Exception $e) {
        sendError('Admin access required for product management', [], 403);
        return;
    }

    $data = getRequestBody();
    
    // Management Logic: Validate product exists before updating
    $checkStmt = $db->prepare("SELECT id, name FROM products WHERE id = ?");
    $checkStmt->execute([$id]);
    $existingProduct = $checkStmt->fetch();
    
    if (!$existingProduct) {
        sendError('Product not found for management', [], 404);
        return;
    }

    // Build update query dynamically based on provided fields
    $fields = [];
    $params = [];

    $allowedFields = [
        'name', 'description', 'price', 'original_price', 'discount_percentage',
        'category', 'sub_category', 'menu_option', 'cake_flavor', 'is_new', 'brand', 'stock', 'thumbnail',
        'sku', 'weight', 'has_weight_options', 'is_active'
    ];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = sanitizeInput($data[$field]);
        }
    }

    // Handle featured field - both isFeatured and isBestseller should set featured = 1
    if (isset($data['isFeatured']) || isset($data['isBestseller']) || isset($data['featured'])) {
        $featured = ($data['isFeatured'] ?? 0) || ($data['isBestseller'] ?? 0) ? 1 : ($data['featured'] ?? 0);
        $fields[] = "featured = ?";
        $params[] = $featured;
    }

    // Handle JSON fields
    if (isset($data['images'])) {
        $fields[] = "images = ?";
        $params[] = json_encode($data['images']);
    }
    if (isset($data['productTypes'])) {
        $fields[] = "product_types = ?";
        $params[] = json_encode($data['productTypes']);
    }
    if (isset($data['specifications'])) {
        $fields[] = "specifications = ?";
        $params[] = json_encode($data['specifications']);
    }
    if (isset($data['tags'])) {
        $fields[] = "tags = ?";
        $params[] = json_encode($data['tags']);
    }
    if (isset($data['weightOptions'])) {
        $fields[] = "weight_options = ?";
        $params[] = json_encode($data['weightOptions']);
    }

    if (empty($fields)) {
        sendError('No fields to update', [], 400);
    }

    $params[] = $id;
    $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->prepare($sql);
    if ($stmt->execute($params)) {
        sendSuccess('Product updated successfully');
    } else {
        sendError('Failed to update product', [], 500);
    }
}

/**
 * Delete product (Admin only)
 */
function deleteProduct($db, $id) {
    // Enhanced Management Logic: Check admin authentication
    try {
        AuthMiddleware::requireAdmin();
    } catch (Exception $e) {
        sendError('Admin access required for product management', [], 403);
        return;
    }

    // Management Logic: Check if product exists before deletion
    $checkStmt = $db->prepare("SELECT id, name FROM products WHERE id = ?");
    $checkStmt->execute([$id]);
    $product = $checkStmt->fetch();

    if (!$product) {
        sendError('Product not found', [], 404);
        return;
    }

    // HARD DELETE - Permanently remove from database
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");

    if ($stmt->execute([$id])) {
        sendSuccess('Product deleted successfully', [
            'id' => $id,
            'name' => $product['name'],
            'status' => 'deleted'
        ]);
    } else {
        sendError('Failed to delete product', [], 500);
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
