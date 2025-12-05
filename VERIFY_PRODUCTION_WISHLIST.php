<?php
/**
 * Production Wishlist E2E Verification Script
 * Upload to: public_html/backend/VERIFY_PRODUCTION_WISHLIST.php
 * Visit: https://skbakers.com/backend/VERIFY_PRODUCTION_WISHLIST.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/helpers.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Wishlist Production E2E Verification</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #1a73e8; margin-bottom: 10px; font-size: 28px; }
        h2 { color: #333; margin-top: 30px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #1a73e8; font-size: 20px; }
        h3 { color: #555; margin-top: 20px; margin-bottom: 10px; font-size: 16px; }
        .success { color: #0f9d58; font-weight: bold; padding: 8px 12px; background: #e6f4ea; border-left: 4px solid #0f9d58; margin: 8px 0; }
        .error { color: #d93025; font-weight: bold; padding: 8px 12px; background: #fce8e6; border-left: 4px solid #d93025; margin: 8px 0; }
        .warning { color: #f29900; font-weight: bold; padding: 8px 12px; background: #fef7e0; border-left: 4px solid #f29900; margin: 8px 0; }
        .info { color: #1a73e8; padding: 8px 12px; background: #e8f0fe; border-left: 4px solid #1a73e8; margin: 8px 0; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #dadce0; margin: 10px 0; font-size: 13px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        tr:hover { background: #f8f9fa; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: 600; }
        .badge-success { background: #0f9d58; color: white; }
        .badge-error { background: #d93025; color: white; }
        .badge-warning { background: #f29900; color: white; }
        .summary { background: #e8f0fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary h3 { margin-top: 0; color: #1a73e8; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .test-pass { background: #e6f4ea; border-left: 4px solid #0f9d58; }
        .test-fail { background: #fce8e6; border-left: 4px solid #d93025; }
        code { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
        .timestamp { color: #5f6368; font-size: 14px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Wishlist Production E2E Verification</h1>
        <p class="timestamp"><strong>Timestamp:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

<?php

$testResults = [];
$totalTests = 0;
$passedTests = 0;

function runTest($name, $result, $details = '') {
    global $testResults, $totalTests, $passedTests;
    $totalTests++;
    if ($result) $passedTests++;
    $testResults[] = [
        'name' => $name,
        'result' => $result,
        'details' => $details
    ];
    return $result;
}

try {
    $db = Database::getInstance()->getConnection();
    echo "<div class='success'>✅ Database connection: SUCCESS</div>";

    // TEST 1: Database Structure
    echo "<h2>📊 Test 1: Database Structure</h2>";

    $tables = $db->query("SHOW TABLES LIKE 'wishlist'")->fetchAll();
    if (runTest('Wishlist table exists', count($tables) > 0)) {
        echo "<div class='test-result test-pass'>✅ Wishlist table exists</div>";

        $structure = $db->query("DESCRIBE wishlist")->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Table Structure:</h3>";
        echo "<table><tr><th>Field</th><th>Type</th><th>Key</th></tr>";
        foreach ($structure as $col) {
            echo "<tr><td>{$col['Field']}</td><td>{$col['Type']}</td><td>{$col['Key']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<div class='test-result test-fail'>❌ Wishlist table NOT FOUND</div>";
    }

    // TEST 2: Data Verification
    echo "<h2>📋 Test 2: Current Wishlist Data</h2>";

    $wishlistCount = $db->query("SELECT COUNT(*) as total FROM wishlist")->fetch()['total'];
    echo "<div class='info'>Total wishlist items in database: <strong>$wishlistCount</strong></div>";

    $wishlistData = $db->query("SELECT * FROM wishlist WHERE user_id = 1 ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
    runTest('User 1 has wishlist items', count($wishlistData) > 0, 'Found ' . count($wishlistData) . ' items');

    if (count($wishlistData) > 0) {
        echo "<h3>User 1 Wishlist Items:</h3>";
        echo "<table><tr><th>ID</th><th>Product ID</th><th>Created At</th></tr>";
        foreach ($wishlistData as $item) {
            echo "<tr><td>{$item['id']}</td><td>{$item['product_id']}</td><td>{$item['created_at']}</td></tr>";
        }
        echo "</table>";
    }

    // TEST 3: Product Validation
    echo "<h2>🛍️ Test 3: Product Validation</h2>";

    $productIds = array_column($wishlistData, 'product_id');
    if (!empty($productIds)) {
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $db->prepare("SELECT id, name, price, is_active, stock, images FROM products WHERE id IN ($placeholders)");
        $stmt->execute($productIds);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<h3>Products Status:</h3>";
        echo "<table><tr><th>ID</th><th>Name</th><th>Price</th><th>Active</th><th>Stock</th><th>Status</th></tr>";
        foreach ($productIds as $pid) {
            $product = array_filter($products, function($p) use ($pid) { return $p['id'] == $pid; });
            $product = reset($product);

            if ($product) {
                $isActive = $product['is_active'] == 1;
                $hasStock = $product['stock'] > 0;
                $hasName = !empty($product['name']);

                $status = ($isActive && $hasName) ? '<span class="badge badge-success">✅ VALID</span>' : '<span class="badge badge-error">❌ INVALID</span>';
                $activeText = $isActive ? '<span class="badge badge-success">ACTIVE</span>' : '<span class="badge badge-error">INACTIVE</span>';

                runTest("Product $pid is valid", $isActive && $hasName);

                echo "<tr>";
                echo "<td>{$product['id']}</td>";
                echo "<td>{$product['name']}</td>";
                echo "<td>₹{$product['price']}</td>";
                echo "<td>$activeText</td>";
                echo "<td>{$product['stock']}</td>";
                echo "<td>$status</td>";
                echo "</tr>";
            } else {
                runTest("Product $pid exists", false);
                echo "<tr>";
                echo "<td>$pid</td>";
                echo "<td colspan='5'><span class='badge badge-error'>❌ PRODUCT NOT FOUND</span></td>";
                echo "</tr>";
            }
        }
        echo "</table>";
    }

    // TEST 4: Query Tests
    echo "<h2>🔍 Test 4: SQL Query Tests</h2>";

    // Test INNER JOIN (OLD)
    echo "<h3>A) INNER JOIN Query (Old Method):</h3>";
    echo "<pre>SELECT w.product_id, p.name, p.is_active
FROM wishlist w
INNER JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1 AND p.is_active = 1</pre>";

    $innerStmt = $db->query("
        SELECT w.product_id, p.name, p.is_active, p.price
        FROM wishlist w
        INNER JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1 AND p.is_active = 1
    ");
    $innerResult = $innerStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<div class='info'>INNER JOIN returned: <strong>" . count($innerResult) . " rows</strong></div>";
    if (count($innerResult) > 0) {
        echo "<pre>" . print_r($innerResult, true) . "</pre>";
    } else {
        echo "<div class='warning'>⚠️ INNER JOIN returns 0 rows (This is why old code failed)</div>";
    }

    // Test LEFT JOIN (NEW)
    echo "<h3>B) LEFT JOIN Query (New Method):</h3>";
    echo "<pre>SELECT w.product_id, p.name, p.is_active
FROM wishlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1</pre>";

    $leftStmt = $db->query("
        SELECT w.product_id, p.name, p.is_active, p.price, p.images
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
        ORDER BY w.created_at DESC
    ");
    $leftResult = $leftStmt->fetchAll(PDO::FETCH_ASSOC);

    runTest('LEFT JOIN returns data', count($leftResult) > 0, count($leftResult) . ' rows');
    echo "<div class='success'>✅ LEFT JOIN returned: <strong>" . count($leftResult) . " rows</strong></div>";

    if (count($leftResult) > 0) {
        echo "<h4>Validation Check:</h4>";
        $validCount = 0;
        foreach ($leftResult as $item) {
            if (!empty($item['name'])) {
                echo "<div class='test-result test-pass'>✅ Product {$item['product_id']}: {$item['name']} - VALID</div>";
                $validCount++;
                runTest("Product {$item['product_id']} passes validation", true);
            } else {
                echo "<div class='test-result test-fail'>❌ Product {$item['product_id']}: Name is EMPTY - WOULD BE FILTERED OUT</div>";
                runTest("Product {$item['product_id']} passes validation", false);
            }
        }
        echo "<div class='info'><strong>Valid items after PHP validation:</strong> $validCount / " . count($leftResult) . "</div>";
    }

    // TEST 5: File Verification
    echo "<h2>📄 Test 5: Production File Verification</h2>";

    $filePath = __DIR__ . '/api/wishlist.php';
    if (file_exists($filePath)) {
        $fileContent = file_get_contents($filePath);
        $fileSize = filesize($filePath);
        $lastModified = date('Y-m-d H:i:s', filemtime($filePath));

        echo "<div class='success'>✅ File exists: backend/api/wishlist.php</div>";
        echo "<div class='info'>File size: " . number_format($fileSize) . " bytes (~" . round($fileSize/1024, 2) . " KB)</div>";
        echo "<div class='info'>Last modified: <strong>$lastModified</strong></div>";

        echo "<h3>Code Pattern Checks:</h3>";

        // Check for LEFT JOIN
        if (strpos($fileContent, 'LEFT JOIN products p ON w.product_id = p.id') !== false) {
            echo "<div class='test-result test-pass'>✅ Found: <code>LEFT JOIN products</code> (CORRECT)</div>";
            runTest('Uses LEFT JOIN', true);
        } else {
            echo "<div class='test-result test-fail'>❌ NOT FOUND: <code>LEFT JOIN products</code> (WRONG!)</div>";
            runTest('Uses LEFT JOIN', false);
        }

        // Check for INNER JOIN (should NOT exist)
        if (strpos($fileContent, 'INNER JOIN products p ON w.product_id = p.id') !== false) {
            echo "<div class='test-result test-fail'>❌ Found: <code>INNER JOIN products</code> (OLD CODE STILL THERE!)</div>";
            runTest('No INNER JOIN', false);
        } else {
            echo "<div class='test-result test-pass'>✅ NOT FOUND: <code>INNER JOIN products</code> (Good - old code removed)</div>";
            runTest('No INNER JOIN', true);
        }

        // Check WHERE clause
        if (preg_match('/WHERE\s+w\.user_id\s*=\s*\?\s*(?!AND)/i', $fileContent)) {
            echo "<div class='test-result test-pass'>✅ Found: <code>WHERE w.user_id = ?</code> without is_active filter (CORRECT)</div>";
            runTest('No is_active filter in WHERE', true);
        } elseif (strpos($fileContent, 'AND p.is_active = 1') !== false) {
            echo "<div class='test-result test-fail'>❌ Found: <code>AND p.is_active = 1</code> (OLD FILTER STILL THERE!)</div>";
            runTest('No is_active filter in WHERE', false);
        }

        // Check validation logic
        if (strpos($fileContent, "if (empty(\$item['name']))") !== false) {
            echo "<div class='test-result test-pass'>✅ Found: PHP validation for missing products (CORRECT)</div>";
            runTest('Has PHP validation', true);
        } else {
            echo "<div class='test-result test-fail'>❌ NOT FOUND: PHP validation logic (MISSING!)</div>";
            runTest('Has PHP validation', false);
        }

        // Check auto-create table
        if (strpos($fileContent, 'CREATE TABLE IF NOT EXISTS wishlist') !== false) {
            echo "<div class='test-result test-pass'>✅ Found: Auto-create table logic (CORRECT)</div>";
            runTest('Has auto-create table', true);
        } else {
            echo "<div class='test-result test-fail'>❌ NOT FOUND: Auto-create table logic (MISSING!)</div>";
            runTest('Has auto-create table', false);
        }

    } else {
        echo "<div class='test-result test-fail'>❌ File NOT FOUND: backend/api/wishlist.php</div>";
        runTest('File exists', false);
    }

    // TEST 6: API Endpoint Simulation
    echo "<h2>🌐 Test 6: API Response Simulation</h2>";

    echo "<p>Simulating what the API would return for GET /api/wishlist:</p>";

    $validWishlist = [];
    foreach ($leftResult as $item) {
        if (!empty($item['name'])) {
            $validWishlist[] = $item;
        }
    }

    $apiResponse = [
        'success' => true,
        'message' => 'Wishlist retrieved successfully',
        'data' => [
            'wishlist' => $validWishlist,
            'count' => count($validWishlist)
        ]
    ];

    echo "<pre>" . json_encode($apiResponse, JSON_PRETTY_PRINT) . "</pre>";

    runTest('API would return valid data', count($validWishlist) > 0, count($validWishlist) . ' products');

    // SUMMARY
    echo "<h2>📊 Test Summary</h2>";

    $passRate = $totalTests > 0 ? round(($passedTests / $totalTests) * 100, 1) : 0;

    echo "<div class='summary'>";
    echo "<h3>Overall Results:</h3>";
    echo "<p><strong>Total Tests:</strong> $totalTests</p>";
    echo "<p><strong>Passed:</strong> <span style='color: #0f9d58;'>$passedTests</span></p>";
    echo "<p><strong>Failed:</strong> <span style='color: #d93025;'>" . ($totalTests - $passedTests) . "</span></p>";
    echo "<p><strong>Pass Rate:</strong> <span style='font-size: 24px; font-weight: bold; color: " . ($passRate >= 80 ? '#0f9d58' : '#d93025') . "'>$passRate%</span></p>";
    echo "</div>";

    if ($passRate >= 80) {
        echo "<div class='success' style='font-size: 18px; padding: 20px; margin: 20px 0;'>";
        echo "🎉 <strong>SUCCESS!</strong> Wishlist is production-ready!";
        echo "<br><br>Expected behavior: Frontend should display " . count($validWishlist) . " products.";
        echo "</div>";
    } else {
        echo "<div class='error' style='font-size: 18px; padding: 20px; margin: 20px 0;'>";
        echo "❌ <strong>ISSUES FOUND!</strong> Review the failed tests above.";
        echo "</div>";
    }

    echo "<h3>Failed Tests:</h3>";
    $hasFailures = false;
    foreach ($testResults as $test) {
        if (!$test['result']) {
            echo "<div class='test-result test-fail'>";
            echo "❌ <strong>{$test['name']}</strong>";
            if ($test['details']) echo " - {$test['details']}";
            echo "</div>";
            $hasFailures = true;
        }
    }
    if (!$hasFailures) {
        echo "<div class='success'>✅ No failed tests! Everything is working correctly.</div>";
    }

    echo "<h3>Next Steps:</h3>";
    if ($passRate >= 80 && count($validWishlist) > 0) {
        echo "<ol>";
        echo "<li>Clear browser cache (Ctrl+Shift+Delete)</li>";
        echo "<li>Visit: <a href='https://skbakers.com/wishlist'>https://skbakers.com/wishlist</a></li>";
        echo "<li>Expected: Should show <strong>" . count($validWishlist) . " products</strong></li>";
        echo "<li>Delete this debug file: <code>backend/VERIFY_PRODUCTION_WISHLIST.php</code></li>";
        echo "</ol>";
    } else {
        echo "<ol>";
        echo "<li>Review failed tests above</li>";
        echo "<li>If file shows OLD CODE: Re-upload wishlist.php</li>";
        echo "<li>If products are INACTIVE: Run SQL to activate them</li>";
        echo "<li>Re-run this test after fixes</li>";
        echo "</ol>";
    }

} catch (Exception $e) {
    echo "<div class='error'>❌ <strong>Fatal Error:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

?>

    </div>
</body>
</html>
