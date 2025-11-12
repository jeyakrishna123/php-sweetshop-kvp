<?php
/**
 * Activate Wishlist Products - Quick Fix
 * Upload to backend/ and visit once: https://skbakers.com/backend/activate_wishlist_products.php
 * This will activate products that are in wishlists
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Activate Wishlist Products</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        h2 { color: #333; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .btn { display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn:hover { background: #b91c1c; }
    </style>
</head>
<body>
    <h1>🔧 Activate Wishlist Products</h1>
    <p><strong>Purpose:</strong> This script will activate all products that are in any user's wishlist.</p>

<?php

try {
    $db = Database::getInstance()->getConnection();
    echo "<p class='success'>✅ Database connected successfully</p>";

    // Step 1: Check current wishlist status
    echo "<h2>1. Current Wishlist Status</h2>";

    $checkQuery = $db->query("
        SELECT
            w.id as wishlist_id,
            w.user_id,
            w.product_id,
            w.created_at,
            p.id as product_exists,
            p.name as product_name,
            p.is_active,
            p.price,
            CASE
                WHEN p.id IS NULL THEN 'Product Missing'
                WHEN p.is_active = 0 THEN 'Inactive'
                WHEN p.is_active = 1 THEN 'Active'
            END as status
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        ORDER BY w.user_id, w.created_at DESC
    ");

    $wishlistItems = $checkQuery->fetchAll(PDO::FETCH_ASSOC);

    if (empty($wishlistItems)) {
        echo "<p class='warning'>⚠️ No wishlist items found in database</p>";
    } else {
        echo "<p class='info'>Found " . count($wishlistItems) . " wishlist items</p>";

        echo "<table>";
        echo "<tr><th>User ID</th><th>Product ID</th><th>Product Name</th><th>Status</th><th>Price</th><th>Created</th></tr>";

        $inactiveCount = 0;
        $missingCount = 0;
        $activeCount = 0;

        foreach ($wishlistItems as $item) {
            $rowClass = '';
            if ($item['status'] === 'Inactive') {
                $rowClass = 'style="background-color: #fee;"';
                $inactiveCount++;
            } elseif ($item['status'] === 'Product Missing') {
                $rowClass = 'style="background-color: #fdd;"';
                $missingCount++;
            } else {
                $activeCount++;
            }

            echo "<tr $rowClass>";
            echo "<td>" . $item['user_id'] . "</td>";
            echo "<td>" . $item['product_id'] . "</td>";
            echo "<td>" . ($item['product_name'] ?: 'N/A') . "</td>";
            echo "<td>" . $item['status'] . "</td>";
            echo "<td>" . ($item['price'] ? '₹' . number_format($item['price'], 2) : 'N/A') . "</td>";
            echo "<td>" . $item['created_at'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";

        echo "<p><strong>Summary:</strong></p>";
        echo "<ul>";
        echo "<li class='success'>Active: $activeCount products</li>";
        echo "<li class='warning'>Inactive: $inactiveCount products (need activation)</li>";
        echo "<li class='error'>Missing: $missingCount products (not in products table)</li>";
        echo "</ul>";
    }

    // Step 2: Find products to activate
    echo "<h2>2. Products That Need Activation</h2>";

    $inactiveProducts = $db->query("
        SELECT DISTINCT p.id, p.name, p.price, p.is_active
        FROM wishlist w
        INNER JOIN products p ON w.product_id = p.id
        WHERE p.is_active = 0
    ")->fetchAll(PDO::FETCH_ASSOC);

    if (empty($inactiveProducts)) {
        echo "<p class='success'>✅ All wishlist products are already active!</p>";
    } else {
        echo "<p class='warning'>⚠️ Found " . count($inactiveProducts) . " inactive products in wishlists:</p>";

        echo "<table>";
        echo "<tr><th>Product ID</th><th>Name</th><th>Price</th><th>Current Status</th></tr>";
        foreach ($inactiveProducts as $product) {
            echo "<tr>";
            echo "<td>" . $product['id'] . "</td>";
            echo "<td>" . $product['name'] . "</td>";
            echo "<td>₹" . number_format($product['price'], 2) . "</td>";
            echo "<td class='error'>Inactive (is_active = 0)</td>";
            echo "</tr>";
        }
        echo "</table>";

        // Step 3: Activate products
        if (isset($_GET['activate']) && $_GET['activate'] === 'yes') {
            echo "<h2>3. Activating Products...</h2>";

            $productIds = array_column($inactiveProducts, 'id');
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));

            $activateStmt = $db->prepare("
                UPDATE products
                SET is_active = 1
                WHERE id IN ($placeholders)
            ");

            if ($activateStmt->execute($productIds)) {
                $affectedRows = $activateStmt->rowCount();
                echo "<p class='success'>✅ Successfully activated $affectedRows products!</p>";

                echo "<h3>Activated Products:</h3>";
                echo "<ul>";
                foreach ($inactiveProducts as $product) {
                    echo "<li class='success'>Product {$product['id']}: {$product['name']} - NOW ACTIVE</li>";
                }
                echo "</ul>";

                echo "<p class='success' style='font-size: 18px; padding: 20px; background: #d4edda; border-radius: 5px; margin: 20px 0;'>";
                echo "🎉 <strong>Success!</strong> Your wishlist products are now active.<br>";
                echo "Go to <a href='https://skbakers.com/wishlist'>https://skbakers.com/wishlist</a> and refresh the page.<br>";
                echo "You should now see your products!";
                echo "</p>";

            } else {
                echo "<p class='error'>❌ Failed to activate products</p>";
            }

        } else {
            echo "<h2>3. Ready to Activate</h2>";
            echo "<p>Click the button below to activate these products:</p>";
            echo "<a href='?activate=yes' class='btn'>Activate Inactive Products</a>";
            echo "<p class='warning'>⚠️ This will set is_active = 1 for all products in wishlists</p>";
        }
    }

    // Step 4: Test wishlist query
    echo "<h2>4. Test Wishlist Query (User ID 1)</h2>";

    echo "<h3>With is_active filter (current production behavior):</h3>";
    $withFilter = $db->query("
        SELECT w.product_id, p.name, p.is_active, p.price
        FROM wishlist w
        INNER JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1 AND p.is_active = 1
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo "<p><strong>Results: " . count($withFilter) . " products</strong></p>";
    if (empty($withFilter)) {
        echo "<p class='error'>❌ Query returns 0 products (this is why wishlist appears empty)</p>";
    } else {
        echo "<pre>" . print_r($withFilter, true) . "</pre>";
    }

    echo "<h3>Without is_active filter (after fix):</h3>";
    $withoutFilter = $db->query("
        SELECT w.product_id, p.name, p.is_active, p.price
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo "<p><strong>Results: " . count($withoutFilter) . " products</strong></p>";
    if (count($withoutFilter) > 0) {
        echo "<p class='success'>✅ Query would return " . count($withoutFilter) . " products</p>";
        echo "<pre>" . print_r($withoutFilter, true) . "</pre>";
    }

} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

?>

<hr>
<h2>📋 Next Steps</h2>

<h3>Option 1: Activate Products (Quick Fix)</h3>
<p>If you clicked "Activate" above, your products are now active. Refresh wishlist page.</p>

<h3>Option 2: Upload Fixed wishlist.php (Recommended)</h3>
<p>Upload the fixed <code>wishlist.php</code> that uses LEFT JOIN instead of INNER JOIN.</p>
<p>This allows wishlist to show products regardless of is_active status.</p>

<h3>Clean Up</h3>
<p>After testing, delete this file for security:</p>
<pre>rm backend/activate_wishlist_products.php</pre>

</body>
</html>
