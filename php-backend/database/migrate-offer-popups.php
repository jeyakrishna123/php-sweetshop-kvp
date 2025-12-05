<?php
/**
 * Migration script to fix offer_popups table
 * Run this once to add missing columns
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "Starting migration for offer_popups table...\n\n";

    // Get current table structure
    echo "Current table structure:\n";
    $stmt = $db->query("DESCRIBE offer_popups");
    $currentColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Existing columns: " . implode(', ', $currentColumns) . "\n\n";

    $columnsToAdd = [];

    // Check and add image_url
    if (!in_array('image_url', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `image_url` VARCHAR(500) DEFAULT NULL AFTER `description`";
    }

    // Check and add coupon_code
    if (!in_array('coupon_code', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `coupon_code` VARCHAR(50) DEFAULT NULL";
    }

    // Check and add discount_percentage
    if (!in_array('discount_percentage', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `discount_percentage` DECIMAL(5,2) DEFAULT NULL";
    }

    // Check and add button_text
    if (!in_array('button_text', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `button_text` VARCHAR(50) DEFAULT 'Shop Now'";
    }

    // Check and add button_link
    if (!in_array('button_link', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `button_link` VARCHAR(500) DEFAULT NULL";
    }

    // Check and add is_active
    if (!in_array('is_active', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `is_active` TINYINT(1) DEFAULT 1";
    }

    // Check and add show_on_homepage
    if (!in_array('show_on_homepage', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `show_on_homepage` TINYINT(1) DEFAULT 1";
    }

    // Check and add start_date
    if (!in_array('start_date', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `start_date` DATETIME DEFAULT NULL";
    }

    // Check and add end_date
    if (!in_array('end_date', $currentColumns)) {
        $columnsToAdd[] = "ADD COLUMN `end_date` DATETIME DEFAULT NULL";
    }

    if (empty($columnsToAdd)) {
        echo "✅ All columns already exist. No migration needed.\n";
    } else {
        echo "Adding missing columns:\n";
        foreach ($columnsToAdd as $column) {
            echo "- $column\n";
        }
        echo "\n";

        // Execute ALTER TABLE
        $sql = "ALTER TABLE `offer_popups` " . implode(", ", $columnsToAdd);
        $db->exec($sql);

        echo "✅ Migration completed successfully!\n\n";
    }

    // Show final table structure
    echo "Final table structure:\n";
    $stmt = $db->query("DESCRIBE offer_popups");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $row) {
        echo sprintf("%-25s %-20s %-10s\n",
            $row['Field'],
            $row['Type'],
            $row['Null'] === 'YES' ? 'NULL' : 'NOT NULL'
        );
    }

    echo "\n✅ offer_popups table is now ready!\n";

} catch (PDOException $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
