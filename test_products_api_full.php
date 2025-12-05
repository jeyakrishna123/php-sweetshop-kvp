<?php
header('Content-Type: text/plain; charset=utf-8');

echo "🔍 PRODUCTS API DIAGNOSTIC TEST\n";
echo str_repeat("=", 80) . "\n\n";

// Test 1: Direct database query
require_once __DIR__ . '/php-backend/config/database.php';
$db = Database::getInstance()->getConnection();

echo "TEST 1: Direct Database Query\n";
echo str_repeat("-", 80) . "\n";
$stmt = $db->query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
$result = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Active products in database: " . $result['total'] . "\n\n";

// Test 2: Simulate API call
echo "TEST 2: Simulate API GET Request\n";
echo str_repeat("-", 80) . "\n";

$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['page'] = '1';
$_GET['limit'] = '12';
$_GET['sortBy'] = 'relevance';
$_GET['availability'] = 'all';

// Capture output
ob_start();

try {
    // Include the products API
    require_once __DIR__ . '/php-backend/api/products.php';
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$output = ob_get_clean();

// Try to decode JSON response
$jsonStart = strpos($output, '{');
if ($jsonStart !== false) {
    $jsonOutput = substr($output, $jsonStart);
    $response = json_decode($jsonOutput, true);

    if ($response) {
        echo "✅ API Response:\n";
        echo "Success: " . ($response['success'] ? 'true' : 'false') . "\n";
        echo "Message: " . $response['message'] . "\n";

        if (isset($response['data']['data'])) {
            echo "Products count: " . count($response['data']['data']) . "\n";
            echo "Total items: " . ($response['data']['pagination']['totalItems'] ?? 'N/A') . "\n";

            if (count($response['data']['data']) > 0) {
                echo "\nFirst 3 products:\n";
                foreach (array_slice($response['data']['data'], 0, 3) as $product) {
                    echo "  - ID: " . $product['id'] . " | " . $product['name'] . " | Active: " . ($product['is_active'] ?? 'N/A') . "\n";
                }
            }
        } else {
            echo "❌ No products data in response\n";
            echo "Response structure: " . json_encode(array_keys($response), JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "❌ Failed to decode JSON response\n";
        echo "Raw output:\n" . $output . "\n";
    }
} else {
    echo "❌ No JSON in output\n";
    echo "Raw output:\n" . $output . "\n";
}

echo "\n" . str_repeat("=", 80) . "\n";
echo "TEST 3: Check CORS Headers\n";
echo str_repeat("-", 80) . "\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/products?page=1&limit=12');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_NOBODY, false);

$response = curl_exec($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

curl_close($ch);

echo "Response Headers:\n";
$headerLines = explode("\n", $headers);
foreach ($headerLines as $line) {
    if (stripos($line, 'access-control') !== false || stripos($line, 'content-type') !== false) {
        echo "  " . trim($line) . "\n";
    }
}

$jsonResponse = json_decode($body, true);
if ($jsonResponse && isset($jsonResponse['data']['data'])) {
    echo "\n✅ API is accessible via HTTP\n";
    echo "Products returned: " . count($jsonResponse['data']['data']) . "\n";
} else {
    echo "\n❌ API returned unexpected response\n";
}

echo "\n" . str_repeat("=", 80) . "\n";
echo "DIAGNOSTIC COMPLETE\n";
