<?php
echo "🔍 PRODUCTION DIAGNOSIS\n";
echo "======================\n\n";

echo "1. CHECKING BACKEND FILES:\n";
echo "==========================\n";

$backendFiles = [
    'backend/index.php',
    'backend/config/database.php',
    'backend/config/config.php',
    'backend/api/auth.php',
    'backend/api/products.php',
    'backend/api/categories.php',
    'backend/middleware/cors.php',
    'backend/includes/helpers.php'
];

foreach ($backendFiles as $file) {
    if (file_exists($file)) {
        echo "✅ $file - EXISTS\n";
    } else {
        echo "❌ $file - MISSING\n";
    }
}

echo "\n2. CHECKING DATABASE CONNECTION:\n";
echo "===============================\n";

try {
    require_once __DIR__ . '/backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful\n";
    
    // Test a simple query
    $stmt = $db->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    echo "✅ Users table accessible - $userCount users\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

echo "\n3. CHECKING API ENDPOINTS:\n";
echo "==========================\n";

$endpoints = [
    '/api/auth/register',
    '/api/products',
    '/api/categories/all'
];

foreach ($endpoints as $endpoint) {
    $url = 'https://skbakers.com' . $endpoint;
    $response = @file_get_contents($url);
    
    if ($response === false) {
        echo "❌ $endpoint - Cannot connect\n";
    } else {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "✅ $endpoint - Working\n";
        } else {
            echo "❌ $endpoint - Error response\n";
        }
    }
}

echo "\n🎯 DIAGNOSIS COMPLETE\n";
echo "If you see 'MISSING' files, upload the backend folder to Hostinger.\n";
echo "If you see 'Cannot connect', the backend files are not uploaded.\n";
echo "If you see 'Working', the APIs are functioning correctly.\n";
?>
