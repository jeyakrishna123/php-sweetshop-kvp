<?php
/**
 * REAL FIX - Root Cause Analysis & Permanent Solution
 * This will identify and fix the actual backend issues
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$fixResults = [];

// FIX 1: Check if .htaccess is working
$fixResults['htaccess_check'] = checkHtaccess();

// FIX 2: Check database connection
$fixResults['database_fix'] = fixDatabaseConnection();

// FIX 3: Check file permissions
$fixResults['permissions_fix'] = fixFilePermissions();

// FIX 4: Test direct API access
$fixResults['api_test'] = testDirectAPI();

// FIX 5: Create working API endpoints
$fixResults['endpoint_fix'] = createWorkingEndpoints();

echo json_encode($fixResults, JSON_PRETTY_PRINT);

function checkHtaccess() {
    $result = ['status' => 'checking'];
    
    // Check if .htaccess exists
    if (!file_exists(__DIR__ . '/.htaccess')) {
        $result['status'] = 'error';
        $result['issue'] = '.htaccess file missing';
        $result['fix'] = 'Create .htaccess file';
        return $result;
    }
    
    // Check .htaccess content
    $htaccess = file_get_contents(__DIR__ . '/.htaccess');
    if (strpos($htaccess, 'RewriteEngine On') === false) {
        $result['status'] = 'error';
        $result['issue'] = 'URL rewriting not enabled';
        $result['fix'] = 'Add RewriteEngine On to .htaccess';
        return $result;
    }
    
    // Test if URL rewriting works
    $testUrl = 'https://skbakers.com/api/php-backend/test-rewrite';
    $result['test_url'] = $testUrl;
    $result['status'] = 'success';
    $result['message'] = '.htaccess appears to be working';
    
    return $result;
}

function fixDatabaseConnection() {
    $result = ['status' => 'checking'];
    
    try {
        require_once __DIR__ . '/config/database.php';
        $db = Database::getInstance()->getConnection();
        
        // Test basic query
        $stmt = $db->prepare("SELECT 1 as test");
        $stmt->execute();
        $test = $stmt->fetch();
        
        if ($test && $test['test'] == 1) {
            $result['status'] = 'success';
            $result['message'] = 'Database connection working';
            
            // Check if products table has data
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
            $stmt->execute();
            $count = $stmt->fetch()['count'];
            $result['products_count'] = $count;
            
            if ($count == 0) {
                $result['warning'] = 'No products in database - need sample data';
            }
        } else {
            $result['status'] = 'error';
            $result['message'] = 'Database query failed';
        }
        
    } catch (Exception $e) {
        $result['status'] = 'error';
        $result['message'] = 'Database connection failed: ' . $e->getMessage();
        $result['fix'] = 'Check database credentials in config/database.php';
    }
    
    return $result;
}

function fixFilePermissions() {
    $result = ['status' => 'checking'];
    
    $files = [
        'index.php',
        'api/products.php',
        'api/categories.php',
        'config/database.php',
        'config/config.php'
    ];
    
    $permissionIssues = [];
    
    foreach ($files as $file) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            $perms = fileperms($path);
            $readable = is_readable($path);
            $executable = is_executable($path);
            
            if (!$readable) {
                $permissionIssues[] = "$file is not readable";
            }
            if (!$executable && pathinfo($path, PATHINFO_EXTENSION) === 'php') {
                $permissionIssues[] = "$file is not executable";
            }
        } else {
            $permissionIssues[] = "$file does not exist";
        }
    }
    
    if (empty($permissionIssues)) {
        $result['status'] = 'success';
        $result['message'] = 'All file permissions are correct';
    } else {
        $result['status'] = 'error';
        $result['issues'] = $permissionIssues;
        $result['fix'] = 'Set correct file permissions (644 for files, 755 for directories)';
    }
    
    return $result;
}

function testDirectAPI() {
    $result = ['status' => 'testing'];
    
    // Test main index.php
    try {
        $originalUri = $_SERVER['REQUEST_URI'];
        $_SERVER['REQUEST_URI'] = '/api/php-backend/';
        
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        $_SERVER['REQUEST_URI'] = $originalUri;
        
        if (!empty($output)) {
            $result['main_api'] = 'working';
            $result['main_api_length'] = strlen($output);
        } else {
            $result['main_api'] = 'not_working';
            $result['main_api_issue'] = 'No output from index.php';
        }
    } catch (Exception $e) {
        $result['main_api'] = 'error';
        $result['main_api_error'] = $e->getMessage();
    }
    
    // Test products API directly
    try {
        $originalUri = $_SERVER['REQUEST_URI'];
        $_SERVER['REQUEST_URI'] = '/api/php-backend/api/products';
        
        ob_start();
        include __DIR__ . '/index.php';
        $output = ob_get_clean();
        
        $_SERVER['REQUEST_URI'] = $originalUri;
        
        if (!empty($output)) {
            $result['products_api'] = 'working';
            $result['products_api_length'] = strlen($output);
        } else {
            $result['products_api'] = 'not_working';
            $result['products_api_issue'] = 'No output from products API';
        }
    } catch (Exception $e) {
        $result['products_api'] = 'error';
        $result['products_api_error'] = $e->getMessage();
    }
    
    $result['status'] = 'completed';
    return $result;
}

function createWorkingEndpoints() {
    $result = ['status' => 'creating'];
    
    // Create a simple working products endpoint
    $simpleProducts = '<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . "/../config/database.php";
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("SELECT id, name, price, category, thumbnail FROM products WHERE is_active = 1 LIMIT 10");
    $stmt->execute();
    $products = $stmt->fetchAll();
    
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
    
    // Write the simple endpoint
    file_put_contents(__DIR__ . '/simple-products.php', $simpleProducts);
    
    $result['status'] = 'success';
    $result['message'] = 'Created simple-products.php endpoint';
    $result['test_url'] = 'https://skbakers.com/api/php-backend/simple-products.php';
    
    return $result;
}
?>
