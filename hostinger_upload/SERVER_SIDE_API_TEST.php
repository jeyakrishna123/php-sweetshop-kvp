<?php
/**
 * SERVER-SIDE API TEST
 * Run this on your Hostinger server to test all APIs
 * Upload this file to your server and run: https://skbakers.com/SERVER_SIDE_API_TEST.php
 */

echo "=== SERVER-SIDE API TEST ===\n\n";

// Test function
function testApi($name, $endpoint, $method = 'GET', $data = null) {
    echo "Testing $name...\n";
    
    $url = 'https://skbakers.com/api/' . $endpoint;
    
    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => 'Content-Type: application/json',
            'content' => $data ? json_encode($data) : null,
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    $httpCode = 0;
    
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (strpos($header, 'HTTP/') === 0) {
                preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches);
                if (isset($matches[1])) {
                    $httpCode = (int)$matches[1];
                    break;
                }
            }
        }
    }
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data) {
            echo "✅ $name - HTTP $httpCode\n";
            echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "✅ $name - HTTP $httpCode\n";
            echo "Response: " . substr($response, 0, 200) . "...\n";
        }
    } else {
        echo "❌ $name - No response (HTTP $httpCode)\n";
    }
    
    echo "---\n";
    return $response !== false;
}

// Test 1: Health Check
echo "1. HEALTH CHECK:\n";
testApi('Health Check', 'health');

// Test 2: Public APIs (should work without auth)
echo "\n2. PUBLIC APIs:\n";
testApi('Products List', 'products');
testApi('Categories List', 'categories');
testApi('Banners List', 'banners');
testApi('Menu Items', 'menu');
testApi('Offer Popups', 'offer-popups');
testApi('Coupons List', 'coupons');
testApi('Reviews List', 'reviews');
testApi('Team Members', 'team');
testApi('Contacts List', 'contacts');
testApi('Inventory List', 'inventory');

// Test 3: Auth APIs (should return 400 for missing data)
echo "\n3. AUTHENTICATION APIs:\n";
testApi('Register (no data)', 'auth/register', 'POST');
testApi('Login (no data)', 'auth/login', 'POST');
testApi('Forgot Password (no data)', 'forgot-password', 'POST');
testApi('Verify OTP (no data)', 'verify-otp', 'POST');

// Test 4: Protected APIs (should return 401 without auth)
echo "\n4. PROTECTED APIs (should return 401):\n";
testApi('Admin Users', 'admin/users');
testApi('Admin Dashboard', 'admin/dashboard');
testApi('Admin Analytics', 'admin/analytics');
testApi('Users List', 'users');
testApi('Orders List', 'orders');
testApi('Wishlist', 'wishlist');
testApi('Payment', 'payment');
testApi('Analytics', 'analytics');

// Test 5: Upload APIs (should return 401 without auth)
echo "\n5. UPLOAD APIs (should return 401):\n";
testApi('Upload Product Image', 'upload/product-image', 'POST');
testApi('Upload Banner Image', 'upload/banner-image', 'POST');
testApi('Upload Menu Image', 'upload/menu-image', 'POST');

// Test 6: Database Connection Test
echo "\n6. DATABASE CONNECTION TEST:\n";
try {
    require_once 'backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful\n";
    
    // Test a simple query
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Users table accessible - Count: " . $result['count'] . "\n";
    
    // Test orders table
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM orders");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Orders table accessible - Count: " . $result['count'] . "\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

// Test 7: File Permissions
echo "\n7. FILE PERMISSIONS TEST:\n";
$directories = [
    'backend',
    'backend/api',
    'backend/config',
    'backend/includes',
    'backend/middleware',
    'frontend',
    'frontend/assets'
];

foreach ($directories as $dir) {
    if (is_dir($dir)) {
        if (is_readable($dir)) {
            echo "✅ $dir - Readable\n";
        } else {
            echo "❌ $dir - Not readable\n";
        }
    } else {
        echo "❌ $dir - Not found\n";
    }
}

// Test 8: PHP Configuration
echo "\n8. PHP CONFIGURATION:\n";
echo "PHP Version: " . phpversion() . "\n";
echo "OpenSSL: " . (extension_loaded('openssl') ? 'Available' : 'Not available') . "\n";
echo "cURL: " . (function_exists('curl_init') ? 'Available' : 'Not available') . "\n";
echo "PDO: " . (extension_loaded('pdo') ? 'Available' : 'Not available') . "\n";
echo "PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'Available' : 'Not available') . "\n";
echo "JSON: " . (extension_loaded('json') ? 'Available' : 'Not available') . "\n";
echo "allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'Enabled' : 'Disabled') . "\n";

echo "\n=== SERVER-SIDE TEST COMPLETE ===\n";
echo "\nINSTRUCTIONS:\n";
echo "1. Upload this file to your server root directory\n";
echo "2. Run it at: https://skbakers.com/SERVER_SIDE_API_TEST.php\n";
echo "3. Check the results to see which APIs are working\n";
echo "4. If any APIs fail, check the server error logs\n";
?>
