<?php
/**
 * Test Admin Dashboard API using cURL (simulates frontend request)
 */

echo "🧪 TESTING ADMIN DASHBOARD API WITH CURL\n";
echo str_repeat("=", 80) . "\n\n";

// First, let's check if we can login and get a token
echo "Step 1: Login as Admin\n";
echo str_repeat("-", 80) . "\n";

$loginUrl = "http://localhost:8000/api/auth/login";
$loginData = json_encode([
    'email' => 'admin@skbakers.com',
    'password' => 'admin123456' // Default password from schema.sql
]);

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($loginData)
]);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login URL: $loginUrl\n";
echo "HTTP Status Code: $loginHttpCode\n";

if ($loginHttpCode === 200 || $loginHttpCode === 201) {
    echo "✅ Login successful!\n";
    $loginData = json_decode($loginResponse, true);

    if (isset($loginData['token'])) {
        $token = $loginData['token'];
        echo "✅ Token received: " . substr($token, 0, 50) . "...\n";
        echo "\nUser Info:\n";
        echo "  - Name: " . ($loginData['user']['name'] ?? 'N/A') . "\n";
        echo "  - Email: " . ($loginData['user']['email'] ?? 'N/A') . "\n";
        echo "  - Role: " . ($loginData['user']['role'] ?? 'N/A') . "\n";
        echo "\n";

        // Step 2: Test Dashboard API with token
        echo "Step 2: Fetch Dashboard Stats (Authenticated)\n";
        echo str_repeat("-", 80) . "\n";

        $dashboardUrl = "http://localhost:8000/api/admin/dashboard";

        $ch = curl_init($dashboardUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ]);

        $dashboardResponse = curl_exec($ch);
        $dashboardHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        echo "Dashboard URL: $dashboardUrl\n";
        echo "HTTP Status Code: $dashboardHttpCode\n";

        if ($dashboardHttpCode === 200) {
            echo "✅ Dashboard API request successful!\n\n";

            $dashboardData = json_decode($dashboardResponse, true);

            echo "📊 Dashboard Response:\n";
            echo json_encode($dashboardData, JSON_PRETTY_PRINT) . "\n\n";

            if (isset($dashboardData['stats'])) {
                echo "📈 Dashboard Statistics:\n";
                echo str_repeat("-", 80) . "\n";
                echo "  Total Products: " . ($dashboardData['stats']['totalProducts'] ?? 0) . "\n";
                echo "  Total Orders: " . ($dashboardData['stats']['totalOrders'] ?? 0) . "\n";
                echo "  Total Users: " . ($dashboardData['stats']['totalUsers'] ?? 0) . "\n";
                echo "  Total Revenue: ₹" . ($dashboardData['stats']['totalRevenue'] ?? 0) . "\n";
                echo "  Pending Orders: " . ($dashboardData['stats']['pendingOrders'] ?? 0) . "\n";
                echo "  Today's Orders: " . ($dashboardData['stats']['todayOrders'] ?? 0) . "\n";
                echo "  Today's Revenue: ₹" . ($dashboardData['stats']['todayRevenue'] ?? 0) . "\n";
                echo "  Low Stock Products: " . ($dashboardData['stats']['lowStockProducts'] ?? 0) . "\n";
                echo "  Out of Stock Products: " . ($dashboardData['stats']['outOfStockProducts'] ?? 0) . "\n";
                echo "\n";

                // Check if all are zeros
                $allZeros = (
                    ($dashboardData['stats']['totalProducts'] ?? 0) == 0 &&
                    ($dashboardData['stats']['totalOrders'] ?? 0) == 0 &&
                    ($dashboardData['stats']['totalUsers'] ?? 0) == 0 &&
                    ($dashboardData['stats']['totalRevenue'] ?? 0) == 0
                );

                if ($allZeros) {
                    echo "❌ ALL STATISTICS ARE ZERO!\n";
                    echo "This means either:\n";
                    echo "  1. The database is truly empty\n";
                    echo "  2. The API is querying the wrong database\n";
                    echo "  3. There's an issue with the SQL queries\n";
                } else {
                    echo "✅ DASHBOARD API IS WORKING CORRECTLY!\n";
                    echo "The backend is returning data. If the frontend shows zeros, the issue is:\n";
                    echo "  1. Frontend not authenticated properly\n";
                    echo "  2. Frontend API URL is incorrect\n";
                    echo "  3. CORS or network issues preventing the request\n";
                    echo "  4. Frontend not parsing the response correctly\n";
                }
            } else {
                echo "⚠️  Response doesn't contain 'stats' object\n";
                echo "Response structure is unexpected.\n";
            }
        } else {
            echo "❌ Dashboard API request failed!\n";
            echo "Response: $dashboardResponse\n";

            if ($dashboardHttpCode === 401) {
                echo "\n❌ AUTHENTICATION FAILED!\n";
                echo "The token was not accepted. This could mean:\n";
                echo "  1. Token is invalid or expired\n";
                echo "  2. JWT verification is failing\n";
                echo "  3. User is not an admin\n";
            } elseif ($dashboardHttpCode === 403) {
                echo "\n❌ ACCESS DENIED!\n";
                echo "User is authenticated but doesn't have admin privileges.\n";
            }
        }

    } else {
        echo "❌ No token in login response\n";
        echo "Response: $loginResponse\n";
    }

} else {
    echo "❌ Login failed!\n";
    echo "HTTP Status: $loginHttpCode\n";
    echo "Response: $loginResponse\n";
    echo "\nPossible issues:\n";
    echo "  1. PHP backend is not running on http://localhost:8000\n";
    echo "  2. Database connection failed\n";
    echo "  3. Admin credentials are incorrect\n";
    echo "  4. Auth API endpoint is broken\n";
}

echo "\n";
echo "🔍 TROUBLESHOOTING GUIDE:\n";
echo str_repeat("=", 80) . "\n";
echo "1. Make sure PHP backend is running: php -S localhost:8000 -t php-backend/\n";
echo "2. Check database connection in php-backend/config/database.php\n";
echo "3. Verify admin user exists with email: admin@skbakers.com\n";
echo "4. Check if JWT_SECRET is set in php-backend/config/config.php\n";
echo "5. Review browser console for errors in the frontend\n";
echo "6. Check Network tab in browser DevTools to see actual API requests\n";
