<?php
/**
 * Apply Database Fix for order_items.image column
 */

require_once __DIR__ . '/php-backend/config/database.php';

echo "=== Applying Database Fix ===\n\n";

try {
    $db = Database::getInstance()->getConnection();

    echo "1. Modifying order_items.image column to allow NULL...\n";

    $sql = "ALTER TABLE order_items MODIFY COLUMN image VARCHAR(500) NULL";
    $db->exec($sql);

    echo "   ✅ Successfully modified image column to allow NULL\n\n";

    // Verify the change
    echo "2. Verifying the change...\n";
    $stmt = $db->query("DESCRIBE order_items");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $column) {
        if ($column['Field'] === 'image') {
            echo "   - image: {$column['Type']}, Null: {$column['Null']}, Default: " . ($column['Default'] ?: 'NULL') . "\n";

            if ($column['Null'] === 'YES') {
                echo "   ✅ VERIFIED: image column now allows NULL\n\n";
            } else {
                echo "   ❌ ERROR: Change did not apply correctly\n\n";
            }
        }
    }

    echo "=== Fix Applied Successfully ===\n\n";
    echo "NEXT STEPS:\n";
    echo "1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)\n";
    echo "2. Try checkout again\n";
    echo "3. Orders should now work even if images are missing\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "\nIf you see 'permission denied', try running this SQL manually:\n";
    echo "ALTER TABLE order_items MODIFY COLUMN image VARCHAR(500) NULL;\n";
}
