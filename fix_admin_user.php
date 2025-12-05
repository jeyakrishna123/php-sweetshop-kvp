<?php
/**
 * Fix Admin User - Create/Update Admin User
 * This will ensure the admin user exists with correct credentials
 */

// Test database connection with production credentials
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

echo "🔧 Fixing Admin User...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n\n";
    
    $adminEmail = 'admin@skbakers.com';
    $adminPassword = 'admin123';
    $adminPasswordHash = password_hash($adminPassword, PASSWORD_DEFAULT);
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, name, email, role, is_active, is_email_verified FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $existingAdmin = $stmt->fetch();
    
    if ($existingAdmin) {
        echo "📋 Admin user found, updating...\n";
        echo "   ID: {$existingAdmin['id']}\n";
        echo "   Name: {$existingAdmin['name']}\n";
        echo "   Email: {$existingAdmin['email']}\n";
        echo "   Role: {$existingAdmin['role']}\n";
        echo "   Active: {$existingAdmin['is_active']}\n";
        echo "   Email Verified: {$existingAdmin['is_email_verified']}\n\n";
        
        // Update admin user with correct password and ensure admin role
        $stmt = $pdo->prepare("
            UPDATE users 
            SET password = ?, 
                role = 'admin', 
                is_active = 1, 
                is_email_verified = 1,
                login_attempts = 0,
                locked_until = NULL,
                updated_at = NOW()
            WHERE email = ?
        ");
        $stmt->execute([$adminPasswordHash, $adminEmail]);
        echo "✅ Admin user updated with correct password and role\n";
        
    } else {
        echo "📋 Admin user not found, creating...\n";
        
        // Create admin user
        $stmt = $pdo->prepare("
            INSERT INTO users (
                name, email, password, role, is_active, is_email_verified,
                newsletter, marketing, notifications_email, notifications_sms, notifications_push,
                currency, language, total_orders, total_spent, wishlist_count, review_count,
                login_attempts, created_at, updated_at
            ) VALUES (?, ?, ?, 'admin', 1, 1, 0, 0, 1, 0, 1, 'INR', 'en', 0, 0.00, 0, 0, 0, NOW(), NOW())
        ");
        $stmt->execute(['Admin User', $adminEmail, $adminPasswordHash]);
        echo "✅ Admin user created successfully\n";
    }
    
    // Verify the admin user
    echo "\n🧪 Verifying Admin User...\n";
    
    $stmt = $pdo->prepare("
        SELECT id, name, email, password, role, is_active, is_email_verified, 
               login_attempts, locked_until, created_at, updated_at
        FROM users WHERE email = ?
    ");
    $stmt->execute([$adminEmail]);
    $adminUser = $stmt->fetch();
    
    if ($adminUser) {
        echo "✅ Admin user verified:\n";
        echo "   ID: {$adminUser['id']}\n";
        echo "   Name: {$adminUser['name']}\n";
        echo "   Email: {$adminUser['email']}\n";
        echo "   Role: {$adminUser['role']}\n";
        echo "   Active: {$adminUser['is_active']}\n";
        echo "   Email Verified: {$adminUser['is_email_verified']}\n";
        echo "   Login Attempts: {$adminUser['login_attempts']}\n";
        echo "   Locked Until: " . ($adminUser['locked_until'] ?: 'NULL') . "\n";
        echo "   Created: {$adminUser['created_at']}\n";
        echo "   Updated: {$adminUser['updated_at']}\n\n";
        
        // Test password verification
        if (password_verify($adminPassword, $adminUser['password'])) {
            echo "✅ Password verification successful!\n";
        } else {
            echo "❌ Password verification failed!\n";
        }
        
        // Test login simulation
        echo "\n🔐 Testing Admin Login Simulation...\n";
        
        // Simulate the exact login process from the API
        $stmt = $pdo->prepare("
            SELECT id, name, email, password, role, is_active, locked_until
            FROM users WHERE email = ?
        ");
        $stmt->execute([$adminEmail]);
        $loginUser = $stmt->fetch();
        
        if ($loginUser && password_verify($adminPassword, $loginUser['password'])) {
            echo "✅ Login simulation successful!\n";
            echo "   User ID: {$loginUser['id']}\n";
            echo "   Name: {$loginUser['name']}\n";
            echo "   Email: {$loginUser['email']}\n";
            echo "   Role: {$loginUser['role']}\n";
            echo "   Active: {$loginUser['is_active']}\n";
            echo "   Locked: " . ($loginUser['locked_until'] ?: 'No') . "\n";
            
            // Reset login attempts
            $stmt = $pdo->prepare("
                UPDATE users
                SET login_attempts = 0, locked_until = NULL, last_login = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$loginUser['id']]);
            echo "✅ Login attempts reset\n";
            
        } else {
            echo "❌ Login simulation failed!\n";
        }
        
    } else {
        echo "❌ Admin user verification failed!\n";
    }
    
    echo "\n🎉 Admin user fix completed!\n";
    echo "📧 Admin Login: admin@skbakers.com / admin123\n";
    echo "🔗 Try logging in to the admin panel now!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "🔧 Please check your database credentials in Hostinger control panel.\n";
}
?>
