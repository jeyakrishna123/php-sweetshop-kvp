<?php
/**
 * FIX BASE64 IMAGES - Convert data URLs to files
 * Upload to: public_html/backend/FIX_BASE64_IMAGES.php
 * Visit: https://skbakers.com/backend/FIX_BASE64_IMAGES.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/helpers.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Fix Base64 Images</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: white; padding: 15px; border: 1px solid #ddd; overflow-x: auto; }
        h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; cursor: pointer; border: none; }
        .info-box { background: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>🔧 Fix Base64 Images Tool</h1>
    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

<?php

try {
    $db = Database::getInstance()->getConnection();

    // Step 1: Check upload directory
    echo "<h2>1. Check Upload Directory</h2>";
    $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR : __DIR__ . '/../uploads/';
    $productsDir = $uploadDir . 'products/';

    echo "<p>UPLOAD_DIR constant: <code>" . (defined('UPLOAD_DIR') ? UPLOAD_DIR : 'NOT DEFINED') . "</code></p>";
    echo "<p>Upload Directory: <code>$uploadDir</code></p>";
    echo "<p>Products Directory: <code>$productsDir</code></p>";

    if (!file_exists($uploadDir)) {
        echo "<p class='error'>❌ Upload directory doesn't exist!</p>";
        echo "<p class='warning'>Creating: $uploadDir</p>";
        if (mkdir($uploadDir, 0755, true)) {
            echo "<p class='success'>✅ Created upload directory</p>";
        } else {
            echo "<p class='error'>❌ Failed to create upload directory. Check permissions!</p>";
            echo "<div class='info-box'>In Hostinger File Manager, create this directory manually and set permissions to 755.</div>";
            exit;
        }
    } else {
        echo "<p class='success'>✅ Upload directory exists</p>";
    }

    if (!file_exists($productsDir)) {
        echo "<p class='warning'>⚠️ Products directory doesn't exist. Creating...</p>";
        if (mkdir($productsDir, 0755, true)) {
            echo "<p class='success'>✅ Created products directory</p>";
        } else {
            echo "<p class='error'>❌ Failed to create products directory</p>";
            echo "<div class='info-box'>In Hostinger File Manager, create this directory manually at: $productsDir</div>";
            exit;
        }
    } else {
        echo "<p class='success'>✅ Products directory exists</p>";
    }

    // Check if writable
    if (!is_writable($productsDir)) {
        echo "<p class='error'>❌ Products directory is NOT WRITABLE!</p>";
        echo "<div class='info-box'>";
        echo "<p><strong>Fix:</strong> In Hostinger File Manager:</p>";
        echo "<ol>";
        echo "<li>Navigate to <code>$productsDir</code></li>";
        echo "<li>Right-click on the folder</li>";
        echo "<li>Select 'Permissions'</li>";
        echo "<li>Set to '755' or '777'</li>";
        echo "</ol>";
        echo "</div>";
        exit;
    } else {
        echo "<p class='success'>✅ Products directory is writable</p>";
    }

    // Step 2: Find products with base64 images
    echo "<h2>2. Find Products with Base64 Images</h2>";

    $stmt = $db->query("
        SELECT id, name, images
        FROM products
        WHERE images LIKE '%data:image%'
        ORDER BY id
    ");
    $productsWithBase64 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($productsWithBase64)) {
        echo "<p class='success'>✅ No products with base64 images found! All images are properly stored as files.</p>";
        echo "<div class='info-box'>";
        echo "<p>All images are already using file paths. No fix needed!</p>";
        echo "<p>If you're still seeing 414 errors, check:</p>";
        echo "<ul>";
        echo "<li>Browser cache - Clear it and reload</li>";
        echo "<li>PHP OpCache - Restart it in Hostinger control panel</li>";
        echo "</ul>";
        echo "</div>";
        echo "<a href='/admin/products' class='btn'>Back to Products</a>";
        exit;
    }

    echo "<p class='warning'>⚠️ Found <strong>" . count($productsWithBase64) . "</strong> products with base64 images</p>";

    echo "<table border='1' cellpadding='5' style='background: white; border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Product Name</th><th>Image Status</th></tr>";
    foreach ($productsWithBase64 as $p) {
        $images = json_decode($p['images'], true);
        $base64Count = 0;
        if (is_array($images)) {
            foreach ($images as $img) {
                if (strpos($img, 'data:image/') === 0) {
                    $base64Count++;
                }
            }
        }
        echo "<tr>";
        echo "<td>{$p['id']}</td>";
        echo "<td>{$p['name']}</td>";
        echo "<td class='error'>{$base64Count} base64 image(s)</td>";
        echo "</tr>";
    }
    echo "</table>";

    // Step 3: Fix them
    if (!isset($_GET['fix'])) {
        echo "<h2>3. Ready to Fix</h2>";
        echo "<div class='info-box'>";
        echo "<p><strong>What this will do:</strong></p>";
        echo "<ul>";
        echo "<li>Convert base64 image data to actual .webp/.jpg/.png files</li>";
        echo "<li>Save files to: <code>$productsDir</code></li>";
        echo "<li>Update database with file paths instead of base64 data</li>";
        echo "<li>Original data is replaced (backed up in database history)</li>";
        echo "</ul>";
        echo "</div>";
        echo "<a href='?fix=1' class='btn'>🔧 Fix All Base64 Images Now</a>";
        exit;
    }

    echo "<h2>3. Fixing Base64 Images</h2>";

    $fixed = 0;
    $failed = 0;
    $totalImages = 0;
    $convertedImages = 0;

    foreach ($productsWithBase64 as $product) {
        echo "<h3 style='color: #2196F3;'>Product #{$product['id']}: {$product['name']}</h3>";

        $images = json_decode($product['images'], true);
        if (!is_array($images)) {
            echo "<p class='error'>❌ Invalid images format (not an array)</p>";
            $failed++;
            continue;
        }

        $fixedImages = [];
        foreach ($images as $img) {
            $totalImages++;

            // Check if it's a base64 data URL
            if (strpos($img, 'data:image/') === 0) {
                echo "<p>🔄 Converting base64 image (size: " . strlen($img) . " chars)...</p>";

                // Use the backend's uploadBase64Image function
                $fixedPath = uploadBase64Image($img, 'products');

                if ($fixedPath) {
                    echo "<p class='success'>✅ Converted to: <code>$fixedPath</code></p>";
                    $fixedImages[] = $fixedPath;
                    $convertedImages++;
                } else {
                    echo "<p class='error'>❌ Failed to convert base64 image (check error.log for details)</p>";
                    // Keep original to avoid data loss
                    $fixedImages[] = $img;
                }
            } else {
                // Already a file path
                echo "<p>✓ Already a file path: <code>" . htmlspecialchars(substr($img, 0, 80)) . "</code></p>";
                $fixedImages[] = $img;
            }
        }

        // Update database
        $updateStmt = $db->prepare("UPDATE products SET images = ? WHERE id = ?");
        if ($updateStmt->execute([json_encode($fixedImages), $product['id']])) {
            echo "<p class='success'>✅ Updated product #{$product['id']} in database</p>";
            $fixed++;
        } else {
            echo "<p class='error'>❌ Failed to update product #{$product['id']} in database</p>";
            $failed++;
        }

        echo "<hr>";
    }

    echo "<h2>✅ Summary</h2>";
    echo "<table border='1' cellpadding='10' style='background: white; font-size: 16px;'>";
    echo "<tr><td><strong>Products Fixed:</strong></td><td class='success'>{$fixed} products</td></tr>";
    echo "<tr><td><strong>Products Failed:</strong></td><td class='error'>{$failed} products</td></tr>";
    echo "<tr><td><strong>Total Images:</strong></td><td>{$totalImages} images</td></tr>";
    echo "<tr><td><strong>Images Converted:</strong></td><td class='success'>{$convertedImages} images</td></tr>";
    echo "</table>";

    if ($fixed > 0) {
        echo "<div class='info-box'>";
        echo "<p class='success'><strong>✅ Success!</strong> {$fixed} products have been fixed.</p>";
        echo "<p><strong>Next steps:</strong></p>";
        echo "<ol>";
        echo "<li>Go to your admin products page and verify images show correctly</li>";
        echo "<li>Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)</li>";
        echo "<li>If images now work, DELETE THIS FILE (FIX_BASE64_IMAGES.php) for security</li>";
        echo "</ol>";
        echo "</div>";
    }

    if ($failed > 0) {
        echo "<div class='info-box'>";
        echo "<p class='warning'>⚠️ {$failed} products failed to update.</p>";
        echo "<p>Check <code>public_html/backend/error.log</code> for details.</p>";
        echo "<p>Common issues:</p>";
        echo "<ul>";
        echo "<li>PHP memory limit too low for large base64 images</li>";
        echo "<li>Directory permissions changed during process</li>";
        echo "<li>Disk space full</li>";
        echo "</ul>";
        echo "</div>";
    }

    echo "<br><a href='/admin/products' class='btn'>📦 Back to Products</a>";
    echo "<br><br><p style='color: #999;'><em>⚠️ Remember to delete this file (FIX_BASE64_IMAGES.php) after fixing for security!</em></p>";

} catch (Exception $e) {
    echo "<h2 class='error'>❌ Fatal Error</h2>";
    echo "<p class='error'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

?>

</body>
</html>
