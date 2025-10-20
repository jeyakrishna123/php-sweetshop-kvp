<?php
/**
 * Test Product Creation with Full Debugging
 */

require_once __DIR__ . '/php-backend/config/database.php';

echo "🔍 PRODUCT CREATION DEBUG TEST\n";
echo str_repeat("=", 70) . "\n\n";

$db = Database::getInstance()->getConnection();

// Simulate the exact data structure from frontend
$testData = [
    'name' => 'Test Product ' . date('Y-m-d H:i:s'),
    'description' => 'This is a test product for debugging',
    'price' => 999,
    'originalPrice' => 1299,
    'offerPrice' => 999,
    'discountPercentage' => 23,
    'category' => 'Cakes',
    'subCategory' => 'Chocolate Cakes',
    'menuOption' => 'Cakes',
    'brand' => 'Test Brand',
    'stock' => 100,
    'images' => [
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETest%3C/text%3E%3C/svg%3E'
    ],
    'isActive' => true,
    'isFeatured' => false,
    'isNew' => true,
    'isBestseller' => false,
    'hasWeightOptions' => false,
    'weightOptions' => []
];

echo "📋 TEST DATA:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Check required fields
echo "✅ VALIDATION CHECK:\n";
$requiredFields = ['name', 'price', 'category', 'stock'];
foreach ($requiredFields as $field) {
    $exists = isset($testData[$field]) && !empty($testData[$field]);
    $value = $exists ? $testData[$field] : 'MISSING';
    echo sprintf("  %-20s: %s %s\n", $field, $value, $exists ? '✅' : '❌');
}
echo "\n";

// Check images
echo "🖼️ IMAGES CHECK:\n";
echo sprintf("  Images array exists: %s\n", isset($testData['images']) ? 'YES ✅' : 'NO ❌');
echo sprintf("  Images count: %d\n", count($testData['images'] ?? []));
echo "\n";

// Prepare SQL
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $testData['name'])));
$images = json_encode($testData['images']);
$thumbnail = $testData['images'][0];
$featured = $testData['isFeatured'] ?? 0;
$isNew = $testData['isNew'] ?? 0;
$hasWeightOptions = $testData['hasWeightOptions'] ?? 0;
$weightOptions = json_encode($testData['weightOptions']);

echo "🔧 PREPARED VALUES:\n";
echo sprintf("  Slug: %s\n", $slug);
echo sprintf("  Featured: %d\n", $featured);
echo sprintf("  Is New: %d\n", $isNew);
echo sprintf("  Has Weight Options: %d\n", $hasWeightOptions);
echo "\n";

// Try to insert
try {
    echo "💾 ATTEMPTING INSERT...\n";

    $stmt = $db->prepare("
        INSERT INTO products (
            name, slug, description, price, original_price, discount_percentage,
            category, sub_category, menu_option, cake_flavor, product_types, is_new, brand, stock, images, thumbnail,
            specifications, tags, featured, sku, weight, has_weight_options, weight_options
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $result = $stmt->execute([
        $testData['name'],
        $slug,
        $testData['description'],
        $testData['price'],
        $testData['originalPrice'],
        $testData['discountPercentage'],
        $testData['category'],
        $testData['subCategory'] ?? '',
        $testData['menuOption'] ?? '',
        null, // cake_flavor
        null, // product_types
        $isNew,
        $testData['brand'] ?? null,
        $testData['stock'],
        $images,
        $thumbnail,
        null, // specifications
        null, // tags
        $featured,
        null, // sku
        null, // weight
        $hasWeightOptions,
        $weightOptions
    ]);

    if ($result) {
        $productId = $db->lastInsertId();
        echo "✅ SUCCESS! Product created with ID: {$productId}\n\n";

        // Verify the product was created
        $verifyStmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $verifyStmt->execute([$productId]);
        $product = $verifyStmt->fetch();

        echo "📦 CREATED PRODUCT:\n";
        echo sprintf("  ID: %d\n", $product['id']);
        echo sprintf("  Name: %s\n", $product['name']);
        echo sprintf("  Category: %s\n", $product['category']);
        echo sprintf("  Sub-Category: %s\n", $product['sub_category']);
        echo sprintf("  Price: ₹%.2f\n", $product['price']);
        echo sprintf("  Stock: %d\n", $product['stock']);
        echo sprintf("  Featured: %d\n", $product['featured']);
        echo sprintf("  Is New: %d\n", $product['is_new']);
        echo sprintf("  Created: %s\n", $product['created_at']);
        echo "\n";

        echo "🎉 TEST PASSED!\n";
    } else {
        echo "❌ INSERT FAILED!\n";
        $errorInfo = $stmt->errorInfo();
        echo "Error: " . json_encode($errorInfo) . "\n";
    }

} catch (Exception $e) {
    echo "❌ EXCEPTION OCCURRED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "TEST COMPLETE\n";
