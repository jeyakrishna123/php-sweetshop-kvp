<?php
/**
 * REMOVE ALL FAKE DATA - Keep Database Clean
 * This will remove all sample/fake data and keep database empty for real client data
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
    
    // 1. REMOVE ALL FAKE PRODUCTS
    echo "🗑️ Removing all fake products...\n";
    $deleted = $pdo->exec("DELETE FROM products");
    echo "✅ Removed $deleted fake products\n";
    
    // 2. REMOVE ALL FAKE CATEGORIES
    echo "🗑️ Removing all fake categories...\n";
    $deleted = $pdo->exec("DELETE FROM categories");
    echo "✅ Removed $deleted fake categories\n";
    
    // 3. REMOVE ALL FAKE BANNERS
    echo "🗑️ Removing all fake banners...\n";
    $deleted = $pdo->exec("DELETE FROM banners");
    echo "✅ Removed $deleted fake banners\n";
    
    // 4. REMOVE ALL FAKE COUPONS
    echo "🗑️ Removing all fake coupons...\n";
    $deleted = $pdo->exec("DELETE FROM coupons");
    echo "✅ Removed $deleted fake coupons\n";
    
    // 5. REMOVE ALL FAKE ORDERS
    echo "🗑️ Removing all fake orders...\n";
    $deleted = $pdo->exec("DELETE FROM orders");
    echo "✅ Removed $deleted fake orders\n";
    
    // 6. REMOVE ALL FAKE REVIEWS
    echo "🗑️ Removing all fake reviews...\n";
    $deleted = $pdo->exec("DELETE FROM reviews");
    echo "✅ Removed $deleted fake reviews\n";
    
    // 7. REMOVE ALL FAKE NEWSLETTER SUBSCRIBERS
    echo "🗑️ Removing all fake newsletter subscribers...\n";
    $deleted = $pdo->exec("DELETE FROM newsletter_subscribers");
    echo "✅ Removed $deleted fake subscribers\n";
    
    // 8. REMOVE ALL FAKE NOTIFICATIONS
    echo "🗑️ Removing all fake notifications...\n";
    $deleted = $pdo->exec("DELETE FROM notifications");
    echo "✅ Removed $deleted fake notifications\n";
    
    // 9. REMOVE ALL FAKE ANALYTICS EVENTS
    echo "🗑️ Removing all fake analytics events...\n";
    $deleted = $pdo->exec("DELETE FROM analytics_events");
    echo "✅ Removed $deleted fake analytics events\n";
    
    // 10. KEEP ONLY ESSENTIAL SITE SETTINGS (remove fake ones)
    echo "🗑️ Cleaning site settings...\n";
    $deleted = $pdo->exec("DELETE FROM site_settings WHERE setting_key IN ('site_name', 'site_description', 'contact_email', 'contact_phone', 'shipping_cost', 'free_shipping_threshold', 'currency', 'timezone')");
    echo "✅ Removed $deleted fake site settings\n";
    
    // 11. RESET AUTO INCREMENT COUNTERS
    echo "🔄 Resetting auto increment counters...\n";
    $pdo->exec("ALTER TABLE products AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE categories AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE orders AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE banners AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE coupons AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE reviews AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE newsletter_subscribers AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE notifications AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE analytics_events AUTO_INCREMENT = 1");
    echo "✅ Auto increment counters reset\n";
    
    echo "\n🎉 ALL FAKE DATA REMOVED!\n";
    echo "📊 Database is now clean and empty\n";
    echo "🔗 Client can now add their own real data manually\n";
    echo "✅ No more fake/sample data - ready for real client data!\n";
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
