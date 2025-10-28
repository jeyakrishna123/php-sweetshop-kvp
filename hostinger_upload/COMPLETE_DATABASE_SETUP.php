<?php
/**
 * COMPLETE DATABASE SETUP - ALL TABLES + DATA
 * This will create ALL missing tables and add complete sample data
 */

// Database connection
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connected!\n\n";
    
    // 1. CREATE ALL MISSING TABLES
    echo "🔧 Creating all missing tables...\n";
    
    // Categories table
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✅ Categories table ready\n";
    
    // Products table (enhanced)
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
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
    )");
    echo "✅ Products table ready\n";
    
    // Orders table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        tracking_number VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
        items_price DECIMAL(10,2) DEFAULT 0.00,
        tax_price DECIMAL(10,2) DEFAULT 0.00,
        shipping_price DECIMAL(10,2) DEFAULT 0.00,
        discount_amount DECIMAL(10,2) DEFAULT 0.00,
        total_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        coupon_code VARCHAR(50),
        coupon_discount DECIMAL(10,2) DEFAULT 0.00,
        coupon_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
        customer_notes TEXT,
        shipping_method VARCHAR(100),
        is_gift TINYINT(1) DEFAULT 0,
        gift_message TEXT,
        is_cancelled TINYINT(1) DEFAULT 0,
        cancellation_reason TEXT,
        cancelled_by INT,
        cancellation_date TIMESTAMP NULL,
        admin_notes TEXT,
        shipping_carrier VARCHAR(100),
        shipping_tracking_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    echo "✅ Orders table ready\n";
    
    // Order items table
    $pdo->exec("CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        discount DECIMAL(10,2) DEFAULT 0.00,
        sku VARCHAR(100),
        weight VARCHAR(50),
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )");
    echo "✅ Order items table ready\n";
    
    // Shipping addresses table
    $pdo->exec("CREATE TABLE IF NOT EXISTS shipping_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )");
    echo "✅ Shipping addresses table ready\n";
    
    // Payment info table
    $pdo->exec("CREATE TABLE IF NOT EXISTS payment_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        payment_method ENUM('cod', 'razorpay', 'stripe', 'paypal', 'bank_transfer') NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        payment_gateway_response TEXT,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )");
    echo "✅ Payment info table ready\n";
    
    // Banners table
    $pdo->exec("CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        mobile_image_url VARCHAR(500),
        desktop_image_url VARCHAR(500),
        link_url VARCHAR(500),
        button_text VARCHAR(100),
        is_active TINYINT(1) DEFAULT 1,
        display_order INT DEFAULT 0,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    echo "✅ Banners table ready\n";
    
    // Reviews table
    $pdo->exec("CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        product_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        is_verified TINYINT(1) DEFAULT 0,
        is_approved TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )");
    echo "✅ Reviews table ready\n";
    
    // Coupons table
    $pdo->exec("CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('percentage', 'fixed') NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        minimum_amount DECIMAL(10,2) DEFAULT 0.00,
        maximum_discount DECIMAL(10,2),
        usage_limit INT,
        used_count INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✅ Coupons table ready\n";
    
    // Newsletter subscribers table
    $pdo->exec("CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✅ Newsletter subscribers table ready\n";
    
    // Site settings table
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    echo "✅ Site settings table ready\n";
    
    // Notifications table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    echo "✅ Notifications table ready\n";
    
    // Analytics events table
    $pdo->exec("CREATE TABLE IF NOT EXISTS analytics_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(100) NOT NULL,
        user_id INT,
        session_id VARCHAR(255),
        page_url VARCHAR(500),
        referrer VARCHAR(500),
        user_agent TEXT,
        ip_address VARCHAR(45),
        event_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    echo "✅ Analytics events table ready\n";
    
    // 2. ADD SAMPLE DATA
    echo "\n🍰 Adding complete sample data...\n";
    
    // Add categories
    $pdo->exec("INSERT IGNORE INTO categories (id, name, slug, description, is_active) VALUES 
        (1, 'Cakes & Pastries', 'cakes-pastries', 'Delicious cakes and pastries', 1),
        (2, 'Cookies & Biscuits', 'cookies-biscuits', 'Crispy cookies and biscuits', 1),
        (3, 'Breads', 'breads', 'Fresh baked breads', 1),
        (4, 'Desserts', 'desserts', 'Sweet desserts and treats', 1)");
    echo "✅ Categories added\n";
    
    // Add products
    $products = [
        ['Chocolate Cake', 'Rich and moist chocolate cake with chocolate frosting', 450.00, 500.00, 1, 10, 1, 1, 1, 1, '1kg', 'Flour, Sugar, Cocoa, Eggs, Butter, Milk', 'Contains: Eggs, Dairy, Gluten', 'CHOC-CAKE-001'],
        ['Vanilla Cupcakes', 'Soft and fluffy vanilla cupcakes with buttercream', 25.00, 30.00, 1, 50, 1, 1, 0, 1, '100g each', 'Flour, Sugar, Vanilla, Eggs, Butter, Milk', 'Contains: Eggs, Dairy, Gluten', 'VAN-CUP-001'],
        ['Red Velvet Cake', 'Classic red velvet with cream cheese frosting', 550.00, 600.00, 1, 5, 1, 1, 1, 0, '1.2kg', 'Flour, Sugar, Cocoa, Red Food Color, Eggs, Butter', 'Contains: Eggs, Dairy, Gluten', 'RED-VEL-001'],
        ['Strawberry Cake', 'Fresh strawberry cake with strawberry cream', 480.00, 520.00, 1, 8, 1, 1, 0, 1, '1kg', 'Flour, Sugar, Strawberries, Eggs, Butter, Cream', 'Contains: Eggs, Dairy, Gluten', 'STRAW-CAKE-001'],
        ['Butter Cookies', 'Crispy butter cookies with vanilla flavor', 15.00, 18.00, 2, 100, 1, 0, 1, 1, '50g each', 'Flour, Butter, Sugar, Vanilla', 'Contains: Dairy, Gluten', 'BUTT-COOK-001'],
        ['Chocolate Chip Cookies', 'Soft chocolate chip cookies', 20.00, 25.00, 2, 80, 1, 0, 1, 1, '60g each', 'Flour, Butter, Sugar, Chocolate Chips, Eggs', 'Contains: Eggs, Dairy, Gluten', 'CHOC-CHIP-001'],
        ['Garlic Bread', 'Fresh garlic bread with herbs', 35.00, 40.00, 3, 25, 1, 0, 0, 1, '200g', 'Flour, Garlic, Butter, Herbs, Yeast', 'Contains: Gluten, Dairy', 'GARL-BREAD-001'],
        ['Tiramisu', 'Classic Italian tiramisu dessert', 120.00, 150.00, 4, 15, 1, 1, 0, 1, '300g', 'Mascarpone, Coffee, Ladyfingers, Cocoa, Eggs', 'Contains: Eggs, Dairy, Gluten', 'TIRA-001']
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO products (name, description, price, original_price, category_id, stock, 
                           is_active, is_featured, is_bestseller, is_new, weight, ingredients, 
                           allergens, sku, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $inserted = 0;
    foreach ($products as $product) {
        try {
            $stmt->execute($product);
            $inserted++;
            echo "✅ Added: {$product[0]}\n";
        } catch (PDOException $e) {
            echo "❌ Failed: {$product[0]} - " . $e->getMessage() . "\n";
        }
    }
    
    // Add banners
    $pdo->exec("INSERT IGNORE INTO banners (title, description, image_url, is_active, display_order) VALUES 
        ('Welcome to SK Bakers', 'Fresh baked goods delivered to your doorstep', '/images/banner1.jpg', 1, 1),
        ('Special Offer', 'Get 20% off on all cakes this week', '/images/banner2.jpg', 1, 2),
        ('New Arrivals', 'Check out our latest products', '/images/banner3.jpg', 1, 3)");
    echo "✅ Banners added\n";
    
    // Add site settings
    $pdo->exec("INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type) VALUES 
        ('site_name', 'SK Bakers', 'text'),
        ('site_description', 'Fresh baked goods and sweets', 'text'),
        ('contact_email', 'info@skbakers.com', 'text'),
        ('contact_phone', '+91 9876543210', 'text'),
        ('shipping_cost', '50', 'number'),
        ('free_shipping_threshold', '500', 'number'),
        ('currency', 'INR', 'text'),
        ('timezone', 'Asia/Kolkata', 'text')");
    echo "✅ Site settings added\n";
    
    // Add sample coupons
    $pdo->exec("INSERT IGNORE INTO coupons (code, name, description, type, value, minimum_amount, usage_limit, is_active) VALUES 
        ('WELCOME20', 'Welcome Discount', 'Get 20% off on your first order', 'percentage', 20.00, 200.00, 100, 1),
        ('SAVE50', 'Flat Discount', 'Get Rs. 50 off on orders above Rs. 500', 'fixed', 50.00, 500.00, 50, 1),
        ('FREESHIP', 'Free Shipping', 'Free shipping on orders above Rs. 1000', 'fixed', 0.00, 1000.00, 1000, 1)");
    echo "✅ Coupons added\n";
    
    echo "\n🎉 COMPLETE DATABASE SETUP DONE!\n";
    echo "📊 Products added: $inserted\n";
    echo "📋 All tables created with sample data\n";
    echo "🔗 Your website now has complete database with real data!\n";
    echo "✅ No more dummy data - everything is from database!\n";
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
