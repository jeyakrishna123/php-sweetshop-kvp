<?php
/**
 * Check if offer_popups table exists and its structure
 */

require_once __DIR__ . '/php-backend/config/database.php';

echo "🔍 Checking offer_popups table...\n\n";

try {
    $db = Database::getInstance()->getConnection();

    // Test 1: Check if table exists
    echo "1️⃣ Checking if offer_popups table exists...\n";
    $stmt = $db->query("SHOW TABLES LIKE 'offer_popups'");
    $tableExists = $stmt->fetch();

    if ($tableExists) {
        echo "   ✅ offer_popups table exists\n\n";

        // Show table structure
        echo "2️⃣ Table structure:\n";
        $stmt = $db->query("DESCRIBE offer_popups");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($columns as $column) {
            echo sprintf(
                "   - %s: %s %s\n",
                $column['Field'],
                $column['Type'],
                $column['Null'] == 'NO' ? '(NOT NULL)' : '(NULL)'
            );
        }

        // Count existing popups
        echo "\n3️⃣ Counting existing popups...\n";
        $stmt = $db->query("SELECT COUNT(*) as count FROM offer_popups");
        $result = $stmt->fetch();
        echo "   📊 Total popups: {$result['count']}\n";

    } else {
        echo "   ❌ offer_popups table does NOT exist\n";
        echo "   Creating table now...\n\n";

        $sql = "
        CREATE TABLE IF NOT EXISTS `offer_popups` (
          `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          `title` VARCHAR(255) NOT NULL,
          `description` TEXT,
          `image_url` VARCHAR(500),
          `coupon_code` VARCHAR(50),
          `discount_percentage` DECIMAL(5,2),
          `button_text` VARCHAR(100) DEFAULT 'Shop Now',
          `button_link` VARCHAR(500),
          `is_active` TINYINT(1) DEFAULT 1,
          `show_on_homepage` TINYINT(1) DEFAULT 1,
          `start_date` DATETIME DEFAULT NULL,
          `end_date` DATETIME DEFAULT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX `idx_is_active` (`is_active`),
          INDEX `idx_dates` (`start_date`, `end_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";

        $db->exec($sql);
        echo "   ✅ offer_popups table created successfully!\n\n";
    }

    echo "✅ Check complete!\n";

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
