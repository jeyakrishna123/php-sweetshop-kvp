<?php
/**
 * Test Login API - Debug Production Issues
 */

// Test the login API directly
$url = 'https://skbakers.com/api/auth/login';
$data = [
    'email' => 'admin@skbakers.com',
    'password' => 'admin123' // Change this to actual password
];

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "<h2>Login API Test Results</h2>";
echo "<p><strong>URL:</strong> $url</p>";
echo "<p><strong>Data:</strong> " . json_encode($data) . "</p>";
echo "<p><strong>Response:</strong></p>";
echo "<pre>" . htmlspecialchars($result) . "</pre>";

// Check HTTP response code
if (isset($http_response_header)) {
    echo "<p><strong>HTTP Headers:</strong></p>";
    echo "<pre>" . htmlspecialchars(implode("\n", $http_response_header)) . "</pre>";
}

// Test database connection
echo "<h2>Database Connection Test</h2>";
try {
    require_once __DIR__ . '/backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "<p style='color: green;'>✅ Database connection successful</p>";
    
    // Test users table
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "<p>Users in database: " . $result['count'] . "</p>";
    
    // Check if admin user exists
    $stmt = $db->prepare("SELECT id, email, role FROM users WHERE email = ?");
    $stmt->execute(['admin@skbakers.com']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<p style='color: green;'>✅ Admin user found: " . json_encode($user) . "</p>";
    } else {
        echo "<p style='color: red;'>❌ Admin user not found</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database error: " . $e->getMessage() . "</p>";
}

// Test file permissions
echo "<h2>File Permissions Test</h2>";
$files_to_check = [
    'backend/logs/php-error.log',
    'backend/uploads/',
    'frontend/otp_input_fix.js'
];

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        if (is_writable($file)) {
            echo "<p style='color: green;'>✅ $file is writable</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ $file exists but not writable</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ $file does not exist</p>";
    }
}
?>
