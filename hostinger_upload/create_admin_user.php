<?php
/**
 * Create Admin User - Production Fix
 */

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/config/config.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Check if admin user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['admin@skbakers.com']);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        echo "<p style='color: green;'>✅ Admin user already exists</p>";
    } else {
        // Create admin user
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password, role, is_active, is_email_verified, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $result = $stmt->execute([
            'Admin User',
            'admin@skbakers.com',
            $hashedPassword,
            'admin',
            1,
            1
        ]);
        
        if ($result) {
            echo "<p style='color: green;'>✅ Admin user created successfully</p>";
            echo "<p><strong>Email:</strong> admin@skbakers.com</p>";
            echo "<p><strong>Password:</strong> admin123</p>";
        } else {
            echo "<p style='color: red;'>❌ Failed to create admin user</p>";
        }
    }
    
    // Test login with created user
    echo "<h3>Testing Login</h3>";
    $stmt = $db->prepare("
        SELECT id, name, email, password, role, is_active, is_email_verified
        FROM users WHERE email = ?
    ");
    $stmt->execute(['admin@skbakers.com']);
    $user = $stmt->fetch();
    
    if ($user && password_verify('admin123', $user['password'])) {
        echo "<p style='color: green;'>✅ Login test successful</p>";
        echo "<p>User data: " . json_encode($user) . "</p>";
    } else {
        echo "<p style='color: red;'>❌ Login test failed</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
