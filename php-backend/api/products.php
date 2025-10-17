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
    sendError('Server error', ['error' => $e->getMessage()], 500);
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
        $where[] = 'is_active = 1';
    }

    // Filter by category
    if (isset($_GET['category'])) {
        $where[] = 'category = ?';
        $params[] = sanitizeInput($_GET['category']);
    }

    // Filter by price range
    if (isset($_GET['minPrice'])) {
        $where[] = 'price >= ?';
        $params[] = floatval($_GET['minPrice']);
    }
    if (isset($_GET['maxPrice'])) {
        $where[] = 'price <= ?';
        $params[] = floatval($_GET['maxPrice']);
    }

    // Filter by stock
    if (isset($_GET['inStock']) && $_GET['inStock'] === 'true') {
        $where[] = 'stock > 0';
    }

    $whereClause = implode(' AND ', $where);

    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    // Get products
    $orderBy = isset($_GET['sortBy']) ? sanitizeInput($_GET['sortBy']) : 'created_at';
    $order = isset($_GET['order']) && $_GET['order'] === 'asc' ? 'ASC' : 'DESC';

    // Validate sort column
    $allowedSorts = ['created_at', 'price', 'average_rating', 'sold_count', 'name'];
    if (!in_array($orderBy, $allowedSorts)) {
        $orderBy = 'created_at';
    }

    $stmt = $db->prepare("
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, sub_category, menu_option, cake_flavor, product_types, is_new, brand, stock, images, thumbnail,
               specifications, tags, featured, sku, weight, has_weight_options, weight_options,
               average_rating, num_reviews, sold_count, view_count, created_at, updated_at
        FROM products
        WHERE $whereClause
        ORDER BY $orderBy $order
        LIMIT ? OFFSET ?
    ");

    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Decode JSON fields
    foreach ($products as &$product) {
        $product['images'] = $product['images'] ? json_decode($product['images'], true) : [];
        $product['product_types'] = $product['product_types'] ? json_decode($product['product_types'], true) : null;
        $product['specifications'] = $product['specifications'] ? json_decode($product['specifications'], true) : null;
        $product['tags'] = $product['tags'] ? json_decode($product['tags'], true) : null;
        $product['weight_options'] = $product['weight_options'] ? json_decode($product['weight_options'], true) : null;
    }

    $response = createPaginationResponse($products, $total, $page, $limit);
    sendSuccess('Products retrieved successfully', $response);
}

/**
 * Get single product by ID
 */
function getProductById($db, $id) {
    $stmt = $db->prepare("
        SELECT * FROM products WHERE id = ? AND is_active = 1
    ");
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        sendError('Product not found', [], 404);
    }

    // Decode JSON fields
    $product['images'] = json_decode($product['images'], true);
    $product['product_types'] = json_decode($product['product_types'], true);
    $product['specifications'] = json_decode($product['specifications'], true);
    $product['tags'] = json_decode($product['tags'], true);
    $product['weight_options'] = json_decode($product['weight_options'], true);

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
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 20) : 6;

    $stmt = $db->prepare("
        SELECT id, name, slug, description, price, original_price, discount_percentage,
               category, images, thumbnail, average_rating, num_reviews, sold_count
        FROM products
        WHERE is_active = 1
        ORDER BY sold_count DESC, average_rating DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'], true);
    }

    sendSuccess('Bestsellers retrieved successfully', ['products' => $products]);
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

    $data = getRequestBody();
    
    // Management Logic: Validate admin permissions
    if (!isset($data['name']) || empty($data['name'])) {
        sendError('Product name is required for management', [], 400);
        return;
    }

    // Validate required fields
    $errors = validateRequired($data, ['name', 'description', 'price', 'category', 'stock', 'thumbnail']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $slug = generateSlug($data['name']);
    $images = isset($data['images']) ? json_encode($data['images']) : json_encode([]);
    $productTypes = isset($data['productTypes']) ? json_encode($data['productTypes']) : null;
    $specifications = isset($data['specifications']) ? json_encode($data['specifications']) : null;
    $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
    $weightOptions = isset($data['weightOptions']) ? json_encode($data['weightOptions']) : null;

    $stmt = $db->prepare("
        INSERT INTO products (
            name, slug, description, price, original_price, discount_percentage,
            category, sub_category, menu_option, cake_flavor, product_types, is_new, brand, stock, images, thumbnail,
            specifications, tags, featured, sku, weight, has_weight_options, weight_options
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $result = $stmt->execute([
        sanitizeInput($data['name']),
        $slug,
        sanitizeInput($data['description']),
        $data['price'],
        $data['originalPrice'] ?? null,
        $data['discountPercentage'] ?? 0,
        sanitizeInput($data['category']),
        sanitizeInput($data['subCategory'] ?? ''),
        sanitizeInput($data['menuOption'] ?? ''),
        $data['cakeFlavor'] ?? null,
        $productTypes,
        $data['isNew'] ?? 0,
        $data['brand'] ?? null,
        $data['stock'],
        $images,
        $data['thumbnail'],
        $specifications,
        $tags,
        $data['featured'] ?? 0,
        $data['sku'] ?? null,
        $data['weight'] ?? null,
        $data['hasWeightOptions'] ?? 0,
        $weightOptions
    ]);

    if ($result) {
        $productId = $db->lastInsertId();
        sendSuccess('Product created successfully', ['id' => $productId], 201);
    } else {
        sendError('Failed to create product', [], 500);
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
        'featured', 'sku', 'weight', 'has_weight_options', 'is_active'
    ];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = sanitizeInput($data[$field]);
        }
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

    // Management Logic: Check if product exists before soft delete
    $checkStmt = $db->prepare("SELECT id, name, is_active FROM products WHERE id = ?");
    $checkStmt->execute([$id]);
    $product = $checkStmt->fetch();
    
    if (!$product) {
        sendError('Product not found for management', [], 404);
        return;
    }
    
    // If-else logic for product management
    if ($product['is_active'] == 0) {
        sendError('Product is already deactivated', [], 400);
        return;
    }

    // Soft delete by setting is_active = 0 (Management approach - no hard delete)
    $stmt = $db->prepare("UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?");

    if ($stmt->execute([$id])) {
        sendSuccess('Product deactivated successfully (soft delete)', [
            'id' => $id,
            'name' => $product['name'],
            'status' => 'deactivated'
        ]);
    } else {
        sendError('Failed to deactivate product', [], 500);
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
