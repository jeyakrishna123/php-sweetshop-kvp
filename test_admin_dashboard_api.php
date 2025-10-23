<?php
/**
 * Test Admin Dashboard API Endpoint
 * This simulates what happens when the frontend calls /api/admin/dashboard
 */

echo "🧪 TESTING ADMIN DASHBOARD API ENDPOINT\n";
echo str_repeat("=", 80) . "\n\n";

// Simulate the API request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/admin/dashboard';

// Try to include and execute the admin.php file
echo "1️⃣ Testing without authentication...\n";
echo str_repeat("-", 80) . "\n";

try {
    // Capture output
    ob_start();

    // Try to require the admin.php endpoint
    require_once 'php-backend/api/admin.php';

    $output = ob_get_clean();

    echo "Response:\n";
    echo $output;
    echo "\n";

} catch (Exception $e) {
    ob_end_clean();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Error Type: " . get_class($e) . "\n\n";
}

echo "\n";
echo "2️⃣ Analysis:\n";
echo str_repeat("-", 80) . "\n";
echo "If you see an authentication error above, that's the issue!\n";
echo "The frontend needs to be authenticated as an admin to access the dashboard.\n";
echo "\nPossible solutions:\n";
echo "  1. Check if the user is logged in as admin in the frontend\n";
echo "  2. Check if the JWT token is being sent in the request headers\n";
echo "  3. Check browser console for authentication errors\n";
echo "  4. Check if the token has expired\n";
