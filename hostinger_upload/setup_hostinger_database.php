<?php
/**
 * Database Setup Script for Hostinger
 * This script will create all necessary tables for SK Bakers
 * 
 * ⚠️ IMPORTANT: Run this file ONCE when setting up the database for the first time
 * After running, you can DELETE this file for security
 * 
 * Usage: Upload to Hostinger and access via: https://skbakers.com/setup_hostinger_database.php
 */

// Database configuration for Hostinger
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to Hostinger database successfully!<br><br>";
    
    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        is_active TINYINT(1) DEFAULT 1,
        is_email_verified TINYINT(1) DEFAULT 0,
        newsletter TINYINT(1) DEFAULT 0,
        marketing TINYINT(1) DEFAULT 0,
        notifications_email TINYINT(1) DEFAULT 1,
        notifications_sms TINYINT(1) DEFAULT 0,
        notifications_push TINYINT(1) DEFAULT 1,
        currency VARCHAR(10) DEFAULT 'INR',
        language VARCHAR(10) DEFAULT 'en',
        total_orders INT DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        last_order_date TIMESTAMP NULL,
        last_login TIMESTAMP NULL,
        wishlist_count INT DEFAULT 0,
        review_count INT DEFAULT 0,
        login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Users table created<br>";
    
    // Add missing columns to existing users table if they don't exist
    $columnsToAdd = [
        'login_attempts' => 'INT DEFAULT 0',
        'locked_until' => 'TIMESTAMP NULL',
        'last_login' => 'TIMESTAMP NULL',
        'newsletter' => 'TINYINT(1) DEFAULT 0',
        'marketing' => 'TINYINT(1) DEFAULT 0',
        'notifications_email' => 'TINYINT(1) DEFAULT 1',
        'notifications_sms' => 'TINYINT(1) DEFAULT 0',
        'notifications_push' => 'TINYINT(1) DEFAULT 1',
        'currency' => 'VARCHAR(10) DEFAULT "INR"',
        'language' => 'VARCHAR(10) DEFAULT "en"',
        'total_orders' => 'INT DEFAULT 0',
        'total_spent' => 'DECIMAL(10,2) DEFAULT 0.00',
        'last_order_date' => 'TIMESTAMP NULL',
        'wishlist_count' => 'INT DEFAULT 0',
        'review_count' => 'INT DEFAULT 0'
    ];
    
    foreach ($columnsToAdd as $column => $definition) {
        try {
            $stmt = $pdo->prepare("ALTER TABLE users ADD COLUMN $column $definition");
            $stmt->execute();
            echo "✅ Added column '$column' to users table<br>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "✅ Column '$column' already exists<br>";
            } else {
                echo "⚠️ Could not add column '$column': " . $e->getMessage() . "<br>";
            }
        }
    }
    
    // Create categories table
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Categories table created<br>";
    
    // Create products table
    $sql = "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category_id INT,
        image VARCHAR(255),
        thumbnail VARCHAR(500),
        images JSON,
        stock INT DEFAULT 0,
        stock_quantity INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        is_featured TINYINT(1) DEFAULT 0,
        is_bestseller TINYINT(1) DEFAULT 0,
        is_new TINYINT(1) DEFAULT 0,
        weight VARCHAR(50),
        ingredients TEXT,
        allergens TEXT,
        sku VARCHAR(100),
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        num_reviews INT DEFAULT 0,
        sold_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )";
    $pdo->exec($sql);
    echo "✅ Products table created<br>";
    
    // Create orders table
    $sql = "CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        tracking_number VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
        items_price DECIMAL(10,2) DEFAULT 0,
        tax_price DECIMAL(10,2) DEFAULT 0,
        shipping_price DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        coupon_code VARCHAR(100),
        coupon_discount DECIMAL(10,2) DEFAULT 0,
        coupon_type VARCHAR(50),
        customer_notes TEXT,
        shipping_method VARCHAR(50) DEFAULT 'standard',
        is_gift TINYINT(1) DEFAULT 0,
        gift_message TEXT,
        is_cancelled TINYINT(1) DEFAULT 0,
        cancellation_reason TEXT,
        cancelled_by INT,
        cancellation_date TIMESTAMP NULL,
        admin_notes TEXT,
        shipping_carrier VARCHAR(100),
        shipping_tracking_url VARCHAR(500),
        payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    $pdo->exec($sql);
    echo "✅ Orders table created<br>";
    
    // Create order_items table
    $sql = "CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        discount DECIMAL(10,2) DEFAULT 0,
        image VARCHAR(500),
        sku VARCHAR(100),
        weight VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ Order items table created<br>";
    
    // Create cart table
    $sql = "CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
    )";
    $pdo->exec($sql);
    echo "✅ Cart table created<br>";
    
    // Create wishlist table
    $sql = "CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
    )";
    $pdo->exec($sql);
    echo "✅ Wishlist table created<br>";
    
    // Create password_reset_tokens table (used for both password reset and signup OTP)
    $sql = "CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used TINYINT(1) DEFAULT 0,
        INDEX idx_email_token (email, token),
        INDEX idx_expires (expires_at),
        INDEX idx_user_id (user_id),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $pdo->exec($sql);
    echo "✅ Password reset tokens table created<br>";
    
    // Create contacts table
    $sql = "CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Contacts table created<br>";
    
    // Create offer_popups table
    $sql = "CREATE TABLE IF NOT EXISTS offer_popups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        button_text VARCHAR(100),
        button_link VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Offer popups table created<br>";
    
    // Create banners table
    $sql = "CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        image_url VARCHAR(500),
        mobile_image_url VARCHAR(500),
        desktop_image_url VARCHAR(500),
        link VARCHAR(500),
        button_text VARCHAR(100),
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Banners table created<br>";
    
    // Create shipping_addresses table
    $sql = "CREATE TABLE IF NOT EXISTS shipping_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ Shipping addresses table created<br>";
    
    // Create payment_info table
    $sql = "CREATE TABLE IF NOT EXISTS payment_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        payment_id VARCHAR(255) NOT NULL,
        status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        method VARCHAR(100) NOT NULL,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ Payment info table created<br>";
    
    // Create order_status_history table
    $sql = "CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        note TEXT,
        updated_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    $pdo->exec($sql);
    echo "✅ Order status history table created<br>";
    
    // Create addresses table (for user addresses)
    $sql = "CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('home', 'work', 'other') DEFAULT 'home',
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ Addresses table created<br>";
    
    // Create user_addresses table (alternative structure)
    $sql = "CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('home', 'work', 'other') DEFAULT 'home',
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ User addresses table created<br>";
    
    // Create reviews table
    $sql = "CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        is_verified TINYINT(1) DEFAULT 0,
        is_approved TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ Reviews table created<br>";
    
    // Create coupons table
    $sql = "CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('percentage', 'fixed') NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        minimum_amount DECIMAL(10,2) DEFAULT 0,
        maximum_discount DECIMAL(10,2),
        usage_limit INT,
        used_count INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        starts_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Coupons table created<br>";
    
    // Create newsletter_subscribers table
    $sql = "CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP NULL
    )";
    $pdo->exec($sql);
    echo "✅ Newsletter subscribers table created<br>";
    
    // Create site_settings table
    $sql = "CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "✅ Site settings table created<br>";
    
    // Create notifications table
    $sql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "✅ Notifications table created<br>";
    
    // Create analytics_events table
    $sql = "CREATE TABLE IF NOT EXISTS analytics_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_id INT,
        product_id INT,
        order_id INT,
        event_data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    )";
    $pdo->exec($sql);
    echo "✅ Analytics events table created<br>";
    
    // Create admin user
    $adminEmail = 'admin@skbakers.com';
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, is_active, is_email_verified) VALUES (?, ?, ?, 'admin', 1, 1)");
        $stmt->execute(['Admin User', $adminEmail, $adminPassword]);
        echo "✅ Admin user created (Email: admin@skbakers.com, Password: admin123)<br>";
    } else {
        echo "✅ Admin user already exists<br>";
    }
    
    // Insert default site settings
    $defaultSettings = [
        ['site_name', 'SK Bakers', 'text', 'Website name'],
        ['site_description', 'Home-made cakes and cafe', 'text', 'Website description'],
        ['contact_email', 'info@skbakers.com', 'text', 'Contact email'],
        ['contact_phone', '+91-9876543210', 'text', 'Contact phone'],
        ['free_delivery_threshold', '500', 'number', 'Free delivery threshold in INR'],
        ['currency', 'INR', 'text', 'Default currency'],
        ['timezone', 'Asia/Kolkata', 'text', 'Default timezone']
    ];
    
    $settingsStmt = $pdo->prepare("
        INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    
    foreach ($defaultSettings as $setting) {
        $settingsStmt->execute($setting);
    }
    echo "✅ Default site settings inserted<br>";
    
    echo "<br><h2>🎉 Database setup completed successfully!</h2>";
    echo "<p>📧 <strong>Admin Login:</strong> admin@skbakers.com / admin123</p>";
    echo "<p>🔗 <strong>Your database is ready for SK Bakers!</strong></p>";
    echo "<p style='color: red;'><strong>⚠️ IMPORTANT:</strong> Delete this file after setup for security!</p>";
    
} catch (PDOException $e) {
    echo "<h2>❌ Database setup failed</h2>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>🔧 Please check your database credentials in this script.</p>";
}
?>

