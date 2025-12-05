<?php
/**
 * Test Database Connection and API Setup
 * Run this file to verify everything is working
 */

echo "<h1>SK Bakers PHP Backend - Connection Test</h1>";

// Test 1: Check if required files exist
echo "<h2>1. File Structure Check</h2>";
$requiredFiles = [
    'index.php',
    'config/config.php',
    'config/database.php',
    'includes/helpers.php',
    'middleware/auth.php',
    'middleware/cors.php',
    'api/auth.php',
    'api/products.php',
    'api/orders.php',
    'api/users.php',
    'database/schema.sql',
    '.htaccess'
];

$missingFiles = [];
foreach ($requiredFiles as $file) {
    if (!file_exists($file)) {
        $missingFiles[] = $file;
    }
}

if (empty($missingFiles)) {
    echo "✅ All required files exist<br>";
} else {
    echo "❌ Missing files:<br>";
    foreach ($missingFiles as $file) {
        echo "- $file<br>";
    }
}

// Test 2: Check PHP version
echo "<h2>2. PHP Version Check</h2>";
$phpVersion = phpversion();
echo "PHP Version: $phpVersion<br>";
if (version_compare($phpVersion, '7.4.0', '>=')) {
    echo "✅ PHP version is compatible<br>";
} else {
    echo "❌ PHP version too old. Need 7.4+<br>";
}

// Test 3: Check required PHP extensions
echo "<h2>3. PHP Extensions Check</h2>";
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
$missingExtensions = [];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

if (empty($missingExtensions)) {
    echo "✅ All required PHP extensions are loaded<br>";
} else {
    echo "❌ Missing extensions:<br>";
    foreach ($missingExtensions as $ext) {
        echo "- $ext<br>";
    }
}

// Test 4: Database connection
echo "<h2>4. Database Connection Test</h2>";
try {
    require_once 'config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful<br>";
    
    // Test a simple query
    $stmt = $db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    if ($result['test'] == 1) {
        echo "✅ Database query test successful<br>";
    }
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
    echo "<strong>Solution:</strong> Check your database credentials in config/database.php<br>";
}

// Test 5: Check upload directories
echo "<h2>5. Directory Permissions Check</h2>";
$directories = ['uploads', 'uploads/products', 'uploads/banners', 'uploads/users', 'logs'];
foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
        echo "✅ Created directory: $dir<br>";
    } else {
        echo "✅ Directory exists: $dir<br>";
    }
}

// Test 6: Check .htaccess
echo "<h2>6. Apache Configuration Check</h2>";
if (file_exists('.htaccess')) {
    echo "✅ .htaccess file exists<br>";
} else {
    echo "❌ .htaccess file missing<br>";
}

// Test 7: API endpoint test
echo "<h2>7. API Endpoint Test</h2>";
echo "Test these URLs in your browser:<br>";
echo "- <a href='index.php'>Root API</a><br>";
echo "- <a href='index.php/api/health'>Health Check</a><br>";
echo "- <a href='index.php/api/products'>Products API</a><br>";

echo "<h2>Summary</h2>";
if (empty($missingFiles) && empty($missingExtensions)) {
    echo "🎉 <strong>Your PHP backend is ready to use!</strong><br>";
    echo "Next steps:<br>";
    echo "1. Create MySQL database and import schema.sql<br>";
    echo "2. Update database credentials in config/database.php<br>";
    echo "3. Start your React frontend<br>";
    echo "4. Test the complete application<br>";
} else {
    echo "⚠️ <strong>Some issues need to be fixed before deployment</strong><br>";
}
?>
