<?php
/**
 * Debug API Script for Hostinger
 * Test backend connectivity and routing
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 SK Bakers API Debug</h1>";

// Test 1: Basic PHP Info
echo "<h2>1. PHP Environment</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Server:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p><strong>Current Directory:</strong> " . __DIR__ . "</p>";

// Test 2: File Structure
echo "<h2>2. File Structure Check</h2>";
$requiredFiles = [
    'index.php',
    'config/config.php',
    'config/database.php',
    'api/products.php',
    'includes/helpers.php',
    'middleware/cors.php',
    'middleware/auth.php'
];

foreach ($requiredFiles as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        echo "<p>✅ <strong>$file</strong> - Found</p>";
    } else {
        echo "<p>❌ <strong>$file</strong> - Missing</p>";
    }
}

// Test 3: Database Connection
echo "<h2>3. Database Connection Test</h2>";
try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "<p>✅ <strong>Database Connection:</strong> Success</p>";
    
    // Test if products table exists
    $stmt = $db->prepare("SHOW TABLES LIKE 'products'");
    $stmt->execute();
    if ($stmt->fetch()) {
        echo "<p>✅ <strong>Products Table:</strong> Exists</p>";
        
        // Count products
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
        $stmt->execute();
        $count = $stmt->fetch()['count'];
        echo "<p>📊 <strong>Total Products:</strong> $count</p>";
    } else {
        echo "<p>❌ <strong>Products Table:</strong> Missing</p>";
    }
} catch (Exception $e) {
    echo "<p>❌ <strong>Database Error:</strong> " . $e->getMessage() . "</p>";
}

// Test 4: URL Routing
echo "<h2>4. URL Routing Test</h2>";
echo "<p><strong>Request URI:</strong> " . $_SERVER['REQUEST_URI'] . "</p>";
echo "<p><strong>Script Name:</strong> " . $_SERVER['SCRIPT_NAME'] . "</p>";
echo "<p><strong>Path Info:</strong> " . ($_SERVER['PATH_INFO'] ?? 'None') . "</p>";

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
echo "<p><strong>Path Parts:</strong> " . json_encode($pathParts) . "</p>";

// Test 5: .htaccess Check
echo "<h2>5. .htaccess Configuration</h2>";
if (file_exists(__DIR__ . '/.htaccess')) {
    echo "<p>✅ <strong>.htaccess:</strong> Found</p>";
    $htaccess = file_get_contents(__DIR__ . '/.htaccess');
    if (strpos($htaccess, 'RewriteEngine On') !== false) {
        echo "<p>✅ <strong>URL Rewriting:</strong> Enabled</p>";
    } else {
        echo "<p>❌ <strong>URL Rewriting:</strong> Not configured</p>";
    }
} else {
    echo "<p>❌ <strong>.htaccess:</strong> Missing</p>";
}

// Test 6: API Endpoint Test
echo "<h2>6. API Endpoint Test</h2>";
echo "<p><strong>Testing:</strong> /api/products endpoint</p>";

// Simulate API request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/php-backend/api/products';

try {
    // Include the main router
    ob_start();
    include __DIR__ . '/index.php';
    $output = ob_get_clean();
    
    if (!empty($output)) {
        echo "<p>✅ <strong>API Response:</strong> Received</p>";
        echo "<pre>" . htmlspecialchars($output) . "</pre>";
    } else {
        echo "<p>❌ <strong>API Response:</strong> Empty</p>";
    }
} catch (Exception $e) {
    echo "<p>❌ <strong>API Error:</strong> " . $e->getMessage() . "</p>";
}

// Test 7: CORS Headers
echo "<h2>7. CORS Configuration</h2>";
try {
    require_once __DIR__ . '/config/config.php';
    echo "<p><strong>Allowed Origins:</strong> " . json_encode(ALLOWED_ORIGINS) . "</p>";
} catch (Exception $e) {
    echo "<p>❌ <strong>CORS Config Error:</strong> " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><strong>Debug completed at:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><a href='https://skbakers.com/api/php-backend/'>🔗 Test Main API</a></p>";
echo "<p><a href='https://skbakers.com/api/php-backend/api/products'>🔗 Test Products API</a></p>";
?>
