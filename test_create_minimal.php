<?php
/**
 * Test minimal product creation to debug 500 error
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php-backend/config/database.php';

echo "🔍 TESTING MINIMAL PRODUCT CREATION\n";
echo str_repeat("=", 80) . "\n\n";

$db = Database::getInstance()->getConnection();

// Minimal product data - exactly what frontend sends
$testData = [
    'name' => 'Debug Test Product',
    'price' => 100,
    'category' => 'Cakes',
    'stock' => 10,
    'images' => ['data:image/svg+xml,%3Csvg width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E']
];

echo "📋 Test Data:\n";
print_r($testData);
echo "\n";

try {
    // Generate required fields
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $testData['name'])));
    $images = json_encode($testData['images']);
    $thumbnail = $testData['images'][0];

    echo "🔧 Generated Fields:\n";
    echo "  Slug: $slug\n";
    echo "  Images JSON: " . substr($images, 0, 50) . "...\n";
    echo "  Thumbnail: " . substr($thumbnail, 0, 50) . "...\n\n";

    // Prepare SQL - exactly as in products.php
    $sql = "
        INSERT INTO products (
            name, slug, description, price, original_price, discount_percentage,
            category, sub_category, menu_option, cake_flavor, product_types, is_new,
            brand, stock, images, thumbnail,
            specifications, tags, featured, sku, weight, has_weight_options, weight_options
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";

    echo "💾 Preparing SQL statement...\n";
    $stmt = $db->prepare($sql);

    if (!$stmt) {
        echo "❌ Failed to prepare statement\n";
        echo "Error: " . json_encode($db->errorInfo()) . "\n";
        exit(1);
    }

    echo "✅ Statement prepared\n";

    $params = [
        $testData['name'],               // name
        $slug,                           // slug
        '',                              // description
        $testData['price'],              // price
        null,                            // original_price
        0,                               // discount_percentage
        $testData['category'],           // category
        '',                              // sub_category
        '',                              // menu_option
        null,                            // cake_flavor
        null,                            // product_types
        0,                               // is_new
        null,                            // brand
        $testData['stock'],              // stock
        $images,                         // images
        $thumbnail,                      // thumbnail
        null,                            // specifications
        null,                            // tags
        0,                               // featured
        null,                            // sku
        null,                            // weight
        0,                               // has_weight_options
        null                             // weight_options
    ];

    echo "\n📝 Parameters (" . count($params) . " total):\n";
    foreach ($params as $i => $param) {
        if (is_string($param) && strlen($param) > 50) {
            echo "  [$i] " . substr($param, 0, 50) . "... (string)\n";
        } else {
            echo "  [$i] " . json_encode($param) . "\n";
        }
    }

    echo "\n🚀 Executing statement...\n";
    $result = $stmt->execute($params);

    if ($result) {
        $productId = $db->lastInsertId();
        echo "\n✅ SUCCESS! Product created with ID: $productId\n";
    } else {
        echo "\n❌ FAILED to insert\n";
        echo "Error Info: " . json_encode($stmt->errorInfo()) . "\n";
        echo "Error Code: " . $stmt->errorCode() . "\n";
    }

} catch (Exception $e) {
    echo "\n❌ EXCEPTION: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n" . str_repeat("=", 80) . "\n";
