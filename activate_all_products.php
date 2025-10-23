<?php
/**
 * Activate All Products
 * Sets is_active = 1 for all products in the database
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "🔧 Activating All Products\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // Count products before
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeBefore = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active != 1 OR is_active IS NULL");
    $inactiveBefore = $stmt->fetch()['total'];

    echo "Before:\n";
    echo "  ✅ Active: $activeBefore\n";
    echo "  ❌ Inactive/NULL: $inactiveBefore\n\n";

    // Activate all products
    $stmt = $db->prepare("UPDATE products SET is_active = 1 WHERE is_active != 1 OR is_active IS NULL");
    $stmt->execute();
    $updatedCount = $stmt->rowCount();

    echo "✅ Updated $updatedCount products to active status\n\n";

    // Count products after
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $activeAfter = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active != 1 OR is_active IS NULL");
    $inactiveAfter = $stmt->fetch()['total'];

    echo "After:\n";
    echo "  ✅ Active: $activeAfter\n";
    echo "  ❌ Inactive/NULL: $inactiveAfter\n\n";

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ All products are now active!\n";
    echo "   Dashboard should now show: $activeAfter products\n\n";

    echo "🎯 Next Steps:\n";
    echo "1. Refresh your Admin Dashboard\n";
    echo "2. Check if Total Products now shows: $activeAfter\n";
    echo "3. If still showing 0, check backend is running:\n";
    echo "   php -S localhost:8000 -t php-backend/\n\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}
