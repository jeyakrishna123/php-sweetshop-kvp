<?php
/**
 * Quick Deployment Helper for Hostinger
 * This script helps you prepare files for Hostinger deployment
 */

echo "<h1>🚀 Hostinger Quick Deploy Helper</h1>";

// Check current setup
echo "<h2>📋 Current Setup Check</h2>";

$requiredFiles = [
    'index.php',
    'config/config.php',
    'config/database.php',
    'database/schema.sql',
    '.htaccess',
    'api/auth.php',
    'api/products.php',
    'api/orders.php',
    'api/users.php'
];

$missingFiles = [];
foreach ($requiredFiles as $file) {
    if (!file_exists($file)) {
        $missingFiles[] = $file;
    }
}

if (empty($missingFiles)) {
    echo "✅ All required files present<br>";
} else {
    echo "❌ Missing files:<br>";
    foreach ($missingFiles as $file) {
        echo "- $file<br>";
    }
}

// Database configuration check
echo "<h2>🔧 Database Configuration</h2>";
echo "Current database settings:<br>";

$configFile = 'config/database.php';
if (file_exists($configFile)) {
    $content = file_get_contents($configFile);
    
    // Extract database settings
    preg_match('/db_name.*?=.*?[\'"]([^\'"]+)[\'"]/', $content, $dbName);
    preg_match('/username.*?=.*?[\'"]([^\'"]+)[\'"]/', $content, $username);
    
    echo "Database: " . ($dbName[1] ?? 'Not found') . "<br>";
    echo "Username: " . ($username[1] ?? 'Not found') . "<br>";
    echo "Host: localhost<br>";
    echo "Password: [You need to set this]<br>";
} else {
    echo "❌ Database config file not found<br>";
}

// Create deployment package
echo "<h2>📦 Create Deployment Package</h2>";

$deploymentFiles = [
    'index.php',
    'config/',
    'api/',
    'database/',
    'includes/',
    'middleware/',
    'vendor/',
    'uploads/',
    'logs/',
    '.htaccess',
    'README.md'
];

echo "Files to upload to Hostinger:<br>";
foreach ($deploymentFiles as $file) {
    if (file_exists($file)) {
        echo "✅ $file<br>";
    } else {
        echo "⚠️ $file (will be created)<br>";
    }
}

// Create upload directories if they don't exist
$directories = ['uploads', 'uploads/products', 'uploads/banners', 'uploads/users', 'logs'];
foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
        echo "✅ Created directory: $dir<br>";
    }
}

// Generate deployment instructions
echo "<h2>📋 Deployment Instructions</h2>";
echo "<h3>Step 1: Prepare Files</h3>";
echo "1. Update database credentials in config/database.php<br>";
echo "2. Update JWT secret in config/config.php<br>";
echo "3. Update CORS origins in config/config.php<br>";

echo "<h3>Step 2: Upload to Hostinger</h3>";
echo "1. Login to Hostinger File Manager<br>";
echo "2. Navigate to public_html/<br>";
echo "3. Create folder: api/<br>";
echo "4. Upload all files to public_html/api/<br>";

echo "<h3>Step 3: Database Setup</h3>";
echo "1. Go to Hostinger Control Panel → Databases<br>";
echo "2. Create MySQL database (if not exists)<br>";
echo "3. Go to phpMyAdmin<br>";
echo "4. Select your database<br>";
echo "5. Import database/schema.sql<br>";

echo "<h3>Step 4: Test Deployment</h3>";
echo "1. Visit: https://yourdomain.com/api/<br>";
echo "2. Test: https://yourdomain.com/api/health<br>";
echo "3. Test: https://yourdomain.com/api/products<br>";

// Generate configuration template
echo "<h2>⚙️ Configuration Template</h2>";
echo "<h3>Database Configuration (config/database.php):</h3>";
echo "<pre>";
echo '$this->host = "localhost";' . "\n";
echo '$this->db_name = "u707629033_skbakers_main";' . "\n";
echo '$this->username = "u707629033_admin";' . "\n";
echo '$this->password = "YOUR_HOSTINGER_PASSWORD";' . "\n";
echo '$this->charset = "utf8mb4";' . "\n";
echo "</pre>";

echo "<h3>JWT Secret (config/config.php):</h3>";
echo "<pre>";
echo 'define("JWT_SECRET", "your-very-long-secure-random-string-here");' . "\n";
echo "</pre>";

echo "<h3>CORS Origins (config/config.php):</h3>";
echo "<pre>";
echo 'define("ALLOWED_ORIGINS", [' . "\n";
echo '    "https://skbakers.com",' . "\n";
echo '    "https://www.skbakers.com"' . "\n";
echo ']);' . "\n";
echo "</pre>";

echo "<h2>🎯 Next Steps</h2>";
echo "1. <strong>Update database credentials</strong> in config/database.php<br>";
echo "2. <strong>Generate JWT secret</strong> and update config/config.php<br>";
echo "3. <strong>Update CORS origins</strong> with your domain<br>";
echo "4. <strong>Upload files</strong> to Hostinger<br>";
echo "5. <strong>Import database</strong> via phpMyAdmin<br>";
echo "6. <strong>Test your API</strong> endpoints<br>";
echo "7. <strong>Deploy React frontend</strong><br>";

echo "<h2>🔗 Useful Links</h2>";
echo "- <a href='test-connection.php'>Test Connection</a><br>";
echo "- <a href='import-database.php'>Import Database</a><br>";
echo "- <a href='HOSTINGER_DEPLOYMENT_GUIDE.md'>Complete Deployment Guide</a><br>";
?>
