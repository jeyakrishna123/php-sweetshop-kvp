<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔧 Fixing payment_info.method ENUM values...\n\n";

try {
    // Alter the enum to include 'upi'
    $sql = "ALTER TABLE payment_info 
            MODIFY COLUMN method ENUM('stripe', 'cod', 'upi', 'razorpay', 'paypal') NOT NULL";
    $db->exec($sql);
    echo "✅ Successfully updated payment_info.method ENUM\n\n";
    
    // Verify the change
    $stmt = $db->query("DESCRIBE payment_info");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        if ($col['Field'] === 'method') {
            echo "New column definition:\n";
            echo "Field: " . $col['Field'] . "\n";
            echo "Type: " . $col['Type'] . "\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
