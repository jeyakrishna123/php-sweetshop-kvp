<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();

// Check if banners table exists
$stmt = $db->query("SHOW TABLES LIKE 'banners'");
if ($stmt->rowCount() > 0) {
    echo "✅ Banners table exists\n\n";

    // Get table structure
    $stmt = $db->query("DESCRIBE banners");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Table structure:\n";
    foreach ($columns as $col) {
        echo sprintf("%-25s %-20s %-10s %-15s\n",
            $col['Field'],
            $col['Type'],
            $col['Null'],
            $col['Default'] ?? 'NULL'
        );
    }

    // Count banners
    $stmt = $db->query("SELECT COUNT(*) as count FROM banners");
    $count = $stmt->fetch()['count'];
    echo "\nTotal banners in database: $count\n";

} else {
    echo "❌ Banners table does NOT exist - Need to create it!\n";
}
