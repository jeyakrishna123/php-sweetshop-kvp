<?php
/**
 * Test and Fix Admin User
 * Check if admin user exists and create/fix if needed
 */

// Test database connection with production credentials
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

echo "🔍 Testing Admin User...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n\n";
    
    // Check if admin user exists
    $adminEmail = 'admin@skbakers.com';
    $stmt = $pdo->prepare("SELECT id, name, email, role, is_active, is_email_verified FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $adminUser = $stmt->fetch();
    
    if ($adminUser) {
        echo "✅ Admin user found:\n";
        echo "   ID: {$adminUser['id']}\n";
        echo "   Name: {$adminUser['name']}\n";
        echo "   Email: {$adminUser['email']}\n";
        echo "   Role: {$adminUser['role']}\n";
        echo "   Active: {$adminUser['is_active']}\n";
        echo "   Email Verified: {$adminUser['is_email_verified']}\n\n";
        
        // Test password
        $stmt = $pdo->prepare("SELECT password FROM users WHERE email = ?");
        $stmt->execute([$adminEmail]);
        $passwordHash = $stmt->fetchColumn();
        
        if (password_verify('admin123', $passwordHash)) {
            echo "✅ Admin password is correct\n";
        } else {
            echo "❌ Admin password is incorrect, updating...\n";
            
            // Update password
            $newPasswordHash = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
            $stmt->execute([$newPasswordHash, $adminEmail]);
            echo "✅ Admin password updated\n";
        }
        
    } else {
        echo "❌ Admin user not found, creating...\n";
        
        // Create admin user
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, is_active, is_email_verified) VALUES (?, ?, ?, 'admin', 1, 1)");
        $stmt->execute(['Admin User', $adminEmail, $adminPassword]);
        echo "✅ Admin user created\n";
    }
    
    // Test login simulation
    echo "\n🧪 Testing Admin Login...\n";
    
    $stmt = $pdo->prepare("SELECT id, name, email, password, role, is_active, is_email_verified FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $user = $stmt->fetch();
    
    if ($user && password_verify('admin123', $user['password'])) {
        echo "✅ Admin login test successful!\n";
        echo "   User ID: {$user['id']}\n";
        echo "   Name: {$user['name']}\n";
        echo "   Email: {$user['email']}\n";
        echo "   Role: {$user['role']}\n";
        echo "   Active: {$user['is_active']}\n";
        echo "   Email Verified: {$user['is_email_verified']}\n";
    } else {
        echo "❌ Admin login test failed\n";
    }
    
    echo "\n✅ Admin user test completed!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "🔧 Please check your database credentials in Hostinger control panel.\n";
}
?>
