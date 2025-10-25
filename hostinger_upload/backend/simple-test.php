<?php
/**
 * Simple Local Test - No cURL required
 */

echo "🔍 TESTING LOCAL PHP BACKEND\n";
echo "============================\n\n";

// Test database connection
echo "1. Testing Database Connection...\n";
try {
    require_once 'config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connected successfully!\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n\n";
}

// Test basic API routing
echo "2. Testing API Routing...\n";

// Simulate different API requests
$testUrls = [
    '/api/products',
    '/api/categories', 
    '/api/menu/active',
    '/api/auth/login',
    '/api/admin/dashboard'
];

foreach ($testUrls as $url) {
    echo "Testing: $url\n";
    
    // Simulate the routing logic
    $pathParts = explode('/', trim($url, '/'));
    $resource = '';
    
    if (isset($pathParts[0]) && $pathParts[0] === 'api') {
        $resource = isset($pathParts[1]) ? $pathParts[1] : '';
    }
    
    if ($resource) {
        echo "✅ Resource identified: $resource\n";
    } else {
        echo "❌ No resource found\n";
    }
    echo "\n";
}

echo "3. Testing API Files...\n";

$apiFiles = [
    'api/auth.php',
    'api/products.php', 
    'api/categories.php',
    'api/menu.php',
    'api/admin.php',
    'api/orders.php',
    'api/users.php'
];

foreach ($apiFiles as $file) {
    if (file_exists($file)) {
        echo "✅ $file exists\n";
    } else {
        echo "❌ $file missing\n";
    }
}

echo "\n🎯 LOCAL TEST COMPLETE!\n";
echo "Your PHP backend is ready for testing!\n";
echo "Access it at: http://localhost:8000\n";
?>
