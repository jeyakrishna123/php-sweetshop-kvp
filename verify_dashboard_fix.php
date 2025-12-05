<?php
/**
 * Verify Dashboard Fix
 * This script verifies the authentication fix is working
 */

echo "=== DASHBOARD FIX VERIFICATION ===\n\n";

// Check that the file was modified
$adminFile = __DIR__ . '/php-backend/api/admin.php';
$content = file_get_contents($adminFile);

// Count correct patterns
$correctPattern = 'AuthMiddleware::requireAdmin()';
$correctCount = substr_count($content, $correctPattern);

// Count incorrect patterns (should be 0 now)
$incorrectPattern1 = 'AuthMiddleware::requireAdmin($authUser)';
$incorrectPattern2 = 'AuthMiddleware::requireAdmin($user)';
$incorrectCount = substr_count($content, $incorrectPattern1) + substr_count($content, $incorrectPattern2);

echo "✅ Correct requireAdmin() calls: {$correctCount}\n";
echo ($incorrectCount === 0 ? "✅" : "❌") . " Incorrect requireAdmin() calls: {$incorrectCount}\n\n";

if ($incorrectCount === 0 && $correctCount === 11) {
    echo "🎉 SUCCESS! All authentication calls fixed correctly!\n\n";
} else {
    echo "⚠️  WARNING: Some issues may remain.\n\n";
}

// Test database connection and counts
echo "=== DATABASE VERIFICATION ===\n";

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    $stmt = $db->query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    echo "✅ Products: " . $stmt->fetch(PDO::FETCH_ASSOC)['count'] . "\n";

    $stmt = $db->query('SELECT COUNT(*) as count FROM orders');
    echo "✅ Orders: " . $stmt->fetch(PDO::FETCH_ASSOC)['count'] . "\n";

    $stmt = $db->query('SELECT COUNT(*) as count FROM users');
    echo "✅ Users: " . $stmt->fetch(PDO::FETCH_ASSOC)['count'] . "\n";

    echo "\n✅ Database connection and queries working!\n";

} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== NEXT STEPS ===\n";
echo "1. Refresh your browser (Ctrl+Shift+R)\n";
echo "2. Log out and log back in to admin panel\n";
echo "3. Dashboard should now show correct counts!\n";
echo "4. Check browser console (F12) for detailed logs\n\n";

echo "=== VERIFICATION COMPLETE ===\n";
