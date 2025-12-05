<?php
/**
 * Test Wishlist Query - Debug Script
 * Upload this to backend/ and visit: https://skbakers.com/backend/test_wishlist_query.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Wishlist Query Test</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
        h2 { color: #333; margin-top: 30px; }
    </style>
</head>
<body>
    <h1>🔍 Wishlist Query Diagnostic</h1>

<?php

try {
    $db = Database::getInstance()->getConnection();
    echo "<p class='success'>✅ Database connected</p>";

    // Check wishlist table
    echo "<h2>1. Wishlist Table Data</h2>";
    $wishlistData = $db->query("SELECT * FROM wishlist ORDER BY created_at DESC LIMIT 10")->fetchAll();
    echo "<pre>";
    print_r($wishlistData);
    echo "</pre>";

    // Test OLD query (INNER JOIN)
    echo "<h2>2. OLD Query (INNER JOIN + is_active check)</h2>";
    echo "<pre>SELECT w.id, w.product_id, w.created_at, p.id as product_id, p.name
FROM wishlist w
INNER JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1 AND p.is_active = 1</pre>";

    $oldQuery = $db->prepare("
        SELECT w.id, w.product_id, w.created_at, p.id as product_id, p.name
        FROM wishlist w
        INNER JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1 AND p.is_active = 1
    ");
    $oldQuery->execute();
    $oldResult = $oldQuery->fetchAll();

    echo "<p><strong>Result Count: " . count($oldResult) . "</strong></p>";
    echo "<pre>";
    print_r($oldResult);
    echo "</pre>";

    // Test NEW query (LEFT JOIN, no is_active)
    echo "<h2>3. NEW Query (LEFT JOIN, no is_active check)</h2>";
    echo "<pre>SELECT w.id, w.product_id, w.created_at, p.name, p.is_active, p.price
FROM wishlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1</pre>";

    $newQuery = $db->prepare("
        SELECT w.id, w.product_id, w.created_at, p.name, p.is_active, p.price
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
    ");
    $newQuery->execute();
    $newResult = $newQuery->fetchAll();

    echo "<p><strong>Result Count: " . count($newResult) . "</strong></p>";
    echo "<pre>";
    print_r($newResult);
    echo "</pre>";

    // Check products table
    echo "<h2>4. Products Check (IDs 10, 12, 13)</h2>";
    $products = $db->query("SELECT id, name, is_active, price FROM products WHERE id IN (10, 12, 13)")->fetchAll();
    echo "<pre>";
    print_r($products);
    echo "</pre>";

    // Check is_active values
    echo "<h2>5. Is Active Check</h2>";
    foreach ($products as $product) {
        $activeStatus = $product['is_active'] ? 'ACTIVE (1)' : 'INACTIVE (0)';
        $color = $product['is_active'] ? 'success' : 'error';
        echo "<p class='$color'>Product {$product['id']} ({$product['name']}): $activeStatus</p>";
    }

    // Summary
    echo "<h2>📋 Summary</h2>";
    echo "<p><strong>Wishlist items in database:</strong> " . count($wishlistData) . "</p>";
    echo "<p><strong>OLD query (INNER JOIN) returns:</strong> " . count($oldResult) . " items</p>";
    echo "<p><strong>NEW query (LEFT JOIN) returns:</strong> " . count($newResult) . " items</p>";

    if (count($oldResult) === 0 && count($newResult) > 0) {
        echo "<p class='warning'>⚠️ INNER JOIN returns 0 items but LEFT JOIN returns items!</p>";
        echo "<p class='warning'>This means products exist but is_active might be 0, or INNER JOIN has issues.</p>";
        echo "<p class='success'>✅ NEW query (LEFT JOIN) will fix this!</p>";
    }

    if (count($newResult) === 0) {
        echo "<p class='error'>❌ Even LEFT JOIN returns 0 items. Check if user_id 1 has wishlist items.</p>";
    }

} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
}

?>

<hr>
<p><small>Delete this file after testing: <code>rm backend/test_wishlist_query.php</code></small></p>

</body>
</html>
