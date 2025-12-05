<?php
/**
 * Create Contacts Table
 * Run this file once to create the contacts table in the database
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "🔧 Creating contacts table...\n\n";

    $sql = "
    CREATE TABLE IF NOT EXISTS `contacts` (
      `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      `full_name` VARCHAR(255) NOT NULL,
      `email` VARCHAR(255) NOT NULL,
      `phone` VARCHAR(20) DEFAULT NULL,
      `subject` VARCHAR(500) NOT NULL,
      `message` TEXT NOT NULL,
      `status` ENUM('new', 'responded', 'closed') DEFAULT 'new',
      `is_read` TINYINT(1) DEFAULT 0,
      `admin_notes` TEXT DEFAULT NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX `idx_email` (`email`),
      INDEX `idx_status` (`status`),
      INDEX `idx_is_read` (`is_read`),
      INDEX `idx_created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    $db->exec($sql);

    echo "✅ Contacts table created successfully!\n\n";

    // Verify table was created
    $stmt = $db->query("SHOW TABLES LIKE 'contacts'");
    $tableExists = $stmt->fetch();

    if ($tableExists) {
        echo "✅ Table verification: contacts table exists\n\n";

        // Show table structure
        echo "📋 Table structure:\n";
        $stmt = $db->query("DESCRIBE contacts");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($columns as $column) {
            echo sprintf(
                "  - %s: %s %s\n",
                $column['Field'],
                $column['Type'],
                $column['Null'] == 'NO' ? '(NOT NULL)' : '(NULL)'
            );
        }

        echo "\n🎉 Setup complete! Contact form is now ready to use.\n";
        echo "\n📝 You can now:\n";
        echo "  1. Submit contact forms from: http://localhost:5173/contact\n";
        echo "  2. View submissions in admin panel: http://localhost:5173/admin/contacts\n";
    } else {
        echo "❌ Error: Table was not created\n";
    }

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
