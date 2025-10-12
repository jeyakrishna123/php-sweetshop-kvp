<?php
/**
 * FIX BACKEND ISSUES - Permanent Solutions
 * This will fix the actual problems with your PHP backend
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$fixes = [];

// FIX 1: Create a working .htaccess file
$fixes['htaccess_fix'] = createWorkingHtaccess();

// FIX 2: Create a simple working API router
$fixes['router_fix'] = createWorkingRouter();

// FIX 3: Test database and create sample data
$fixes['database_fix'] = fixDatabaseAndData();

// FIX 4: Create working API endpoints
$fixes['endpoints_fix'] = createWorkingEndpoints();

echo json_encode($fixes, JSON_PRETTY_PRINT);

function createWorkingHtaccess() {
    $htaccessContent = '# Working .htaccess for Hostinger
RewriteEngine On

# Handle Authorization Header
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

# Redirect all requests to index.php except for actual files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Disable directory browsing
Options -Indexes

# Set default charset
AddDefaultCharset UTF-8

# PHP settings for Hostinger
<IfModule mod_php7.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
</IfModule>';

    file_put_contents(__DIR__ . '/.htaccess', $htaccessContent);
    
    return [
        'status' => 'success',
        'message' => 'Created working .htaccess file',
        'file' => '.htaccess'
    ];
}

function createWorkingRouter() {
    $routerContent = '<?php
/**
 * Working API Router for Hostinger
 */

// Start session
session_start();

// Set headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Get request info
$requestUri = $_SERVER["REQUEST_URI"];
$method = $_SERVER["REQUEST_METHOD"];

// Parse the URL
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode("/", trim($path, "/"));

// Remove empty parts
$pathParts = array_filter($pathParts);

// Check if this is an API request
if (isset($pathParts[0]) && $pathParts[0] === "api") {
    $resource = isset($pathParts[1]) ? $pathParts[1] : "";
    
    switch ($resource) {
        case "products":
            handleProducts();
            break;
        case "categories":
            handleCategories();
            break;
        case "auth":
            handleAuth();
            break;
        default:
            sendResponse(["error" => "Endpoint not found"], 404);
    }
} else {
    // Root endpoint
    sendResponse([
        "message" => "SK Bakers API is working!",
        "version" => "1.0",
        "timestamp" => date("c")
    ]);
}

function handleProducts() {
    try {
        require_once __DIR__ . "/config/database.php";
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            SELECT id, name, price, original_price, discount_percentage, 
                   category, thumbnail, images, average_rating, stock
            FROM products 
            WHERE is_active = 1 
            ORDER BY created_at DESC 
            LIMIT 20
        ");
        $stmt->execute();
        $products = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach ($products as &$product) {
            $product["images"] = json_decode($product["images"], true);
        }
        
        sendResponse([
            "status" => "success",
            "message" => "Products retrieved successfully",
            "data" => $products,
            "count" => count($products)
        ]);
        
    } catch (Exception $e) {
        sendResponse(["error" => "Database error: " . $e->getMessage()], 500);
    }
}

function handleCategories() {
    try {
        require_once __DIR__ . "/config/database.php";
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            SELECT DISTINCT category as name, category as slug
            FROM products 
            WHERE is_active = 1 
            ORDER BY category
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        sendResponse([
            "status" => "success",
            "message" => "Categories retrieved successfully",
            "data" => $categories,
            "count" => count($categories)
        ]);
        
    } catch (Exception $e) {
        sendResponse(["error" => "Database error: " . $e->getMessage()], 500);
    }
}

function handleAuth() {
    sendResponse([
        "status" => "success",
        "message" => "Auth endpoint working",
        "note" => "Authentication features will be implemented"
    ]);
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit();
}
?>';

    file_put_contents(__DIR__ . '/working-router.php', $routerContent);
    
    return [
        'status' => 'success',
        'message' => 'Created working router',
        'file' => 'working-router.php',
        'test_url' => 'https://skbakers.com/api/php-backend/working-router.php'
    ];
}

function fixDatabaseAndData() {
    try {
        require_once __DIR__ . '/config/database.php';
        $db = Database::getInstance()->getConnection();
        
        // Check if products table has data
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
        $stmt->execute();
        $count = $stmt->fetch()['count'];
        
        if ($count == 0) {
            // Create sample data
            $sampleProducts = [
                [
                    'name' => 'Chocolate Bento Cake',
                    'price' => 450.00,
                    'original_price' => 500.00,
                    'category' => 'Bento Cakes',
                    'thumbnail' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
                    'images' => json_encode(['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800']),
                    'stock' => 10
                ],
                [
                    'name' => 'Vanilla Birthday Cake',
                    'price' => 600.00,
                    'original_price' => 650.00,
                    'category' => 'Birthday Cakes',
                    'thumbnail' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
                    'images' => json_encode(['https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800']),
                    'stock' => 8
                ],
                [
                    'name' => 'Strawberry Cupcakes',
                    'price' => 300.00,
                    'original_price' => 350.00,
                    'category' => 'Cupcakes',
                    'thumbnail' => 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400',
                    'images' => json_encode(['https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800']),
                    'stock' => 15
                ]
            ];
            
            foreach ($sampleProducts as $product) {
                $slug = strtolower(str_replace(' ', '-', $product['name']));
                $discountPercentage = round((($product['original_price'] - $product['price']) / $product['original_price']) * 100);
                
                $stmt = $db->prepare("
                    INSERT INTO products (
                        name, slug, price, original_price, discount_percentage,
                        category, thumbnail, images, stock, is_active, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
                ");
                
                $stmt->execute([
                    $product['name'],
                    $slug,
                    $product['price'],
                    $product['original_price'],
                    $discountPercentage,
                    $product['category'],
                    $product['thumbnail'],
                    $product['images'],
                    $product['stock']
                ]);
            }
            
            return [
                'status' => 'success',
                'message' => 'Created sample data',
                'products_created' => count($sampleProducts)
            ];
        } else {
            return [
                'status' => 'success',
                'message' => 'Database already has data',
                'existing_products' => $count
            ];
        }
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ];
    }
}

function createWorkingEndpoints() {
    // Create simple products endpoint
    $productsEndpoint = '<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . "/config/database.php";
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT id, name, price, original_price, discount_percentage, 
               category, thumbnail, images, average_rating, stock
        FROM products 
        WHERE is_active = 1 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    foreach ($products as &$product) {
        $product["images"] = json_decode($product["images"], true);
    }
    
    echo json_encode([
        "status" => "success",
        "message" => "Products retrieved successfully",
        "data" => $products,
        "count" => count($products)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>';

    file_put_contents(__DIR__ . '/products-simple.php', $productsEndpoint);
    
    // Create simple categories endpoint
    $categoriesEndpoint = '<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . "/config/database.php";
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT DISTINCT category as name, category as slug
        FROM products 
        WHERE is_active = 1 
        ORDER BY category
    ");
    $stmt->execute();
    $categories = $stmt->fetchAll();
    
    echo json_encode([
        "status" => "success",
        "message" => "Categories retrieved successfully",
        "data" => $categories,
        "count" => count($categories)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>';

    file_put_contents(__DIR__ . '/categories-simple.php', $categoriesEndpoint);
    
    return [
        'status' => 'success',
        'message' => 'Created working endpoints',
        'endpoints' => [
            'products' => 'https://skbakers.com/api/php-backend/products-simple.php',
            'categories' => 'https://skbakers.com/api/php-backend/categories-simple.php'
        ]
    ];
}
?>
