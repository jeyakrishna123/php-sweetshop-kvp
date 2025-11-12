<?php
/**
 * DEBUG WISHLIST - Upload to public_html/backend/ and visit
 * URL: https://skbakers.com/backend/DEBUG_WISHLIST_NOW.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Wishlist Debug</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: white; padding: 15px; border: 1px solid #ddd; overflow-x: auto; }
        h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
    </style>
</head>
<body>
    <h1>🔍 Wishlist Debug Report</h1>
    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

<?php

try {
    $db = Database::getInstance()->getConnection();
    echo "<p class='success'>✅ Database connected</p>";

    echo "<h2>1. Wishlist Table Data (User 1)</h2>";
    $stmt = $db->query("SELECT * FROM wishlist WHERE user_id = 1");
    $wishlistData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<p>Found: " . count($wishlistData) . " items</p>";
    echo "<pre>" . print_r($wishlistData, true) . "</pre>";

    echo "<h2>2. Products Status (IDs 12, 13, 14)</h2>";
    $stmt = $db->query("SELECT id, name, is_active, price, stock FROM products WHERE id IN (12, 13, 14)");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($products, true) . "</pre>";

    echo "<h2>3. Test INNER JOIN Query (OLD)</h2>";
    echo "<pre>SELECT w.product_id, p.name, p.is_active
FROM wishlist w
INNER JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1 AND p.is_active = 1</pre>";

    $stmt = $db->query("
        SELECT w.product_id, p.name, p.is_active, p.price
        FROM wishlist w
        INNER JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1 AND p.is_active = 1
    ");
    $innerResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<p>INNER JOIN Result: " . count($innerResult) . " rows</p>";
    echo "<pre>" . print_r($innerResult, true) . "</pre>";

    echo "<h2>4. Test LEFT JOIN Query (NEW)</h2>";
    echo "<pre>SELECT w.product_id, p.name, p.is_active
FROM wishlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1</pre>";

    $stmt = $db->query("
        SELECT w.product_id, p.name, p.is_active, p.price, p.images
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
    ");
    $leftResult = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<p>LEFT JOIN Result: " . count($leftResult) . " rows</p>";
    echo "<pre>" . print_r($leftResult, true) . "</pre>";

    echo "<h2>5. Validation Check</h2>";
    $validCount = 0;
    $invalidCount = 0;

    foreach ($leftResult as $item) {
        if (empty($item['name'])) {
            echo "<p class='error'>❌ Product " . $item['product_id'] . " - Name is EMPTY (would be filtered out)</p>";
            $invalidCount++;
        } else {
            echo "<p class='success'>✅ Product " . $item['product_id'] . " - Name: " . $item['name'] . " (VALID)</p>";
            $validCount++;
        }
    }

    echo "<p><strong>Valid items:</strong> $validCount</p>";
    echo "<p><strong>Invalid items:</strong> $invalidCount</p>";

    echo "<h2>6. Check wishlist.php File</h2>";
    $filePath = __DIR__ . '/api/wishlist.php';
    if (file_exists($filePath)) {
        $fileContent = file_get_contents($filePath);
        $fileSize = filesize($filePath);
        $lastModified = date('Y-m-d H:i:s', filemtime($filePath));

        echo "<p class='success'>✅ File exists: api/wishlist.php</p>";
        echo "<p>File size: " . number_format($fileSize) . " bytes</p>";
        echo "<p>Last modified: $lastModified</p>";

        // Check for key code patterns
        if (strpos($fileContent, 'LEFT JOIN products p ON w.product_id = p.id') !== false) {
            echo "<p class='success'>✅ Found: LEFT JOIN products (CORRECT)</p>";
        } else {
            echo "<p class='error'>❌ NOT FOUND: LEFT JOIN products (WRONG FILE!)</p>";
        }

        if (strpos($fileContent, 'INNER JOIN products p') !== false) {
            echo "<p class='error'>❌ Found: INNER JOIN products (OLD CODE STILL THERE!)</p>";
        }

        if (strpos($fileContent, "WHERE w.user_id = ?\n            ORDER BY") !== false) {
            echo "<p class='success'>✅ Found: WHERE w.user_id = ? (No is_active filter - CORRECT)</p>";
        }

        if (strpos($fileContent, 'AND p.is_active = 1') !== false) {
            echo "<p class='error'>❌ Found: AND p.is_active = 1 (OLD FILTER STILL THERE!)</p>";
        }

        // Show getWishlist function
        echo "<h3>getWishlist Function Code:</h3>";
        if (preg_match('/function getWishlist.*?\n\}/s', $fileContent, $matches)) {
            echo "<pre>" . htmlspecialchars(substr($matches[0], 0, 1500)) . "...</pre>";
        }
    } else {
        echo "<p class='error'>❌ File NOT FOUND: api/wishlist.php</p>";
    }

    echo "<h2>7. Summary</h2>";
    echo "<p><strong>Wishlist items in DB:</strong> " . count($wishlistData) . "</p>";
    echo "<p><strong>Products exist:</strong> " . count($products) . "</p>";
    echo "<p><strong>INNER JOIN returns:</strong> " . count($innerResult) . " rows</p>";
    echo "<p><strong>LEFT JOIN returns:</strong> " . count($leftResult) . " rows</p>";
    echo "<p><strong>Valid items after validation:</strong> $validCount</p>";

    if ($validCount > 0) {
        echo "<p class='success' style='font-size: 18px; padding: 15px; background: #d4edda; border-radius: 5px;'>";
        echo "✅ SHOULD WORK! $validCount products should appear in wishlist.";
        echo "</p>";
    } else {
        echo "<p class='error' style='font-size: 18px; padding: 15px; background: #f8d7da; border-radius: 5px;'>";
        echo "❌ PROBLEM FOUND! Check the errors above.";
        echo "</p>";
    }

} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

?>

<hr>
<p><strong>Next Steps:</strong></p>
<ol>
    <li>Review the results above</li>
    <li>If file shows OLD CODE: Re-upload wishlist.php correctly</li>
    <li>If validation shows items are EMPTY: Check products table</li>
    <li>After fixing, delete this debug file for security</li>
</ol>

</body>
</html>
