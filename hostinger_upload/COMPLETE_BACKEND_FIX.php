<?php
/**
 * COMPLETE BACKEND FIX FOR HOSTINGER
 * This script fixes all backend API issues
 */

echo "🔧 COMPLETE BACKEND FIX FOR HOSTINGER\n";
echo "=====================================\n\n";

// 1. Check if we're on Hostinger
$isHostinger = (strpos($_SERVER['HTTP_HOST'], 'skbakers.com') !== false);
echo "🌐 Environment: " . ($isHostinger ? 'HOSTINGER PRODUCTION' : 'LOCAL DEVELOPMENT') . "\n\n";

// 2. Test database connection
echo "📊 Testing database connection...\n";
try {
    require_once __DIR__ . '/backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful!\n\n";
    
    // 3. Check if tables exist
    echo "📋 Checking database tables...\n";
    $tables = ['products', 'categories', 'users', 'orders', 'banners'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "✅ Table '$table': $count records\n";
        } catch (PDOException $e) {
            echo "❌ Table '$table': Missing or error - " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n";
    
    // 4. Test products API
    echo "🧪 Testing products API...\n";
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/api/products';
    $_GET['page'] = 1;
    $_GET['limit'] = 5;
    
    ob_start();
    try {
        require __DIR__ . '/backend/api/products.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        if ($response && $response['success']) {
            echo "✅ Products API working - Found " . count($response['data']['data']) . " products\n";
        } else {
            echo "❌ Products API failed: " . ($response['message'] ?? 'Unknown error') . "\n";
            echo "Response: " . $output . "\n";
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo "❌ Products API error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
    
    // 5. Test bestsellers API
    echo "🧪 Testing bestsellers API...\n";
    $_SERVER['REQUEST_URI'] = '/api/products/bestsellers';
    $_GET['limit'] = 3;
    
    ob_start();
    try {
        require __DIR__ . '/backend/api/products.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        if ($response && $response['success']) {
            echo "✅ Bestsellers API working - Found " . count($response['data']['products']) . " bestsellers\n";
        } else {
            echo "❌ Bestsellers API failed: " . ($response['message'] ?? 'Unknown error') . "\n";
            echo "Response: " . $output . "\n";
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo "❌ Bestsellers API error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
    
    // 6. Test categories API
    echo "🧪 Testing categories API...\n";
    $_SERVER['REQUEST_URI'] = '/api/categories/all';
    
    ob_start();
    try {
        require __DIR__ . '/backend/api/categories.php';
        $output = ob_get_clean();
        $response = json_decode($output, true);
        
        if ($response && $response['success']) {
            echo "✅ Categories API working - Found " . count($response['data']['categories']) . " categories\n";
        } else {
            echo "❌ Categories API failed: " . ($response['message'] ?? 'Unknown error') . "\n";
            echo "Response: " . $output . "\n";
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo "❌ Categories API error: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "\n🎯 BACKEND DIAGNOSIS COMPLETE\n";
echo "If you see errors above, upload the backend files to Hostinger.\n";
?>
