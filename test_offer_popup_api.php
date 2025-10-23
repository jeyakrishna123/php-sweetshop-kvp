<?php
/**
 * Test Offer Popup API Endpoint
 * Simulates a POST request to create an offer popup
 */

echo "🧪 Testing Offer Popup API Endpoint\n\n";

// First, get an admin token
require_once __DIR__ . '/php-backend/config/database.php';
$db = Database::getInstance()->getConnection();

// Get admin user
echo "1️⃣ Getting admin user...\n";
$stmt = $db->prepare("SELECT id, email, password FROM users WHERE role = 'admin' LIMIT 1");
$stmt->execute();
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    echo "   ❌ No admin user found\n";
    echo "   Creating test admin...\n";

    $testPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Test Admin', 'admin@test.com', $testPassword, 'admin']);

    $admin = [
        'id' => $db->lastInsertId(),
        'email' => 'admin@test.com',
        'password' => $testPassword
    ];
    echo "   ✅ Test admin created\n";
} else {
    echo "   ✅ Admin found: {$admin['email']}\n";
}

// Generate a JWT token manually (simplified - normally would use proper JWT library)
$header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
$payload = base64_encode(json_encode([
    'sub' => $admin['id'],
    'email' => $admin['email'],
    'role' => 'admin',
    'iat' => time(),
    'exp' => time() + 86400
]));
$signature = hash_hmac('sha256', "$header.$payload", 'your-secret-key-here', true);
$signature = base64_encode($signature);
$token = "$header.$payload.$signature";

echo "   🔑 Token generated\n\n";

// Test 2: Make API request
echo "2️⃣ Testing POST /api/offer-popups...\n";

$url = 'http://localhost:8000/api/offer-popups';
$data = json_encode([
    'couponCode' => 'TEST20',
    'imageUrl' => '/uploads/popups/test.jpg',
    'showOnInitialPage' => true
]);

echo "   📤 Sending request to: $url\n";
echo "   📦 Data: $data\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "\n   📥 Response (HTTP $httpCode):\n";
echo "   " . str_replace("\n", "\n   ", $response) . "\n\n";

if ($httpCode === 201 || $httpCode === 200) {
    echo "   ✅ API request successful!\n";
    $responseData = json_decode($response, true);
    if (isset($responseData['popup']['id'])) {
        echo "   🎉 Popup created with ID: {$responseData['popup']['id']}\n";

        // Clean up
        $popupId = $responseData['popup']['id'];
        $stmt = $db->prepare("DELETE FROM offer_popups WHERE id = ?");
        $stmt->execute([$popupId]);
        echo "   🧹 Test popup cleaned up\n";
    }
} else {
    echo "   ❌ API request failed with HTTP $httpCode\n";
    echo "   💡 Check php-backend error logs for details\n";
}

echo "\n✅ Test complete!\n";
?>
