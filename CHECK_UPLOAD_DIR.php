<?php
/**
 * CHECK UPLOAD DIRECTORY - Quick Diagnostic
 * Upload to: public_html/backend/CHECK_UPLOAD_DIR.php
 * Visit: https://skbakers.com/backend/CHECK_UPLOAD_DIR.php
 */

require_once __DIR__ . '/config/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Upload Directory Check</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .code { background: #f5f5f5; padding: 10px; border-left: 3px solid #007bff; margin: 10px 0; font-family: monospace; }
        h2 { color: #333; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        table td { padding: 10px; border-bottom: 1px solid #eee; }
        table td:first-child { font-weight: bold; width: 250px; }
    </style>
</head>
<body>
    <h1>🔍 Upload Directory Diagnostic</h1>
    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

    <?php
    // Test 1: Check UPLOAD_DIR constant
    echo "<div class='box'>";
    echo "<h2>1. UPLOAD_DIR Constant</h2>";
    if (defined('UPLOAD_DIR')) {
        echo "<p class='success'>✅ UPLOAD_DIR is defined</p>";
        echo "<div class='code'>UPLOAD_DIR = " . UPLOAD_DIR . "</div>";
    } else {
        echo "<p class='error'>❌ UPLOAD_DIR is NOT defined!</p>";
        echo "<p>Fix: Add to <code>backend/config/config.php</code>:</p>";
        echo "<div class='code'>define('UPLOAD_DIR', __DIR__ . '/../uploads/');</div>";
    }
    echo "</div>";

    if (!defined('UPLOAD_DIR')) {
        echo "<p class='error'>Cannot continue without UPLOAD_DIR defined.</p>";
        exit;
    }

    // Test 2: Check upload directory
    echo "<div class='box'>";
    echo "<h2>2. Upload Directory Status</h2>";
    $uploadDir = UPLOAD_DIR;
    $productsDir = UPLOAD_DIR . 'products/';

    echo "<table>";

    // Main upload directory
    echo "<tr><td>Upload Directory:</td><td><code>$uploadDir</code></td></tr>";
    echo "<tr><td>Exists:</td><td>";
    if (file_exists($uploadDir)) {
        echo "<span class='success'>✅ YES</span>";
    } else {
        echo "<span class='error'>❌ NO</span>";
    }
    echo "</td></tr>";

    echo "<tr><td>Writable:</td><td>";
    if (is_writable($uploadDir)) {
        echo "<span class='success'>✅ YES</span>";
    } else {
        echo "<span class='error'>❌ NO - Set permissions to 755 or 777</span>";
    }
    echo "</td></tr>";

    // Products subdirectory
    echo "<tr><td>Products Directory:</td><td><code>$productsDir</code></td></tr>";
    echo "<tr><td>Exists:</td><td>";
    if (file_exists($productsDir)) {
        echo "<span class='success'>✅ YES</span>";
    } else {
        echo "<span class='warning'>⚠️ NO - Will be created automatically</span>";
    }
    echo "</td></tr>";

    if (file_exists($productsDir)) {
        echo "<tr><td>Writable:</td><td>";
        if (is_writable($productsDir)) {
            echo "<span class='success'>✅ YES</span>";
        } else {
            echo "<span class='error'>❌ NO - Set permissions to 755 or 777</span>";
        }
        echo "</td></tr>";
    }

    echo "</table>";
    echo "</div>";

    // Test 3: Try to create products directory if it doesn't exist
    echo "<div class='box'>";
    echo "<h2>3. Auto-Create Test</h2>";
    if (!file_exists($productsDir)) {
        echo "<p>Attempting to create products directory...</p>";
        if (mkdir($productsDir, 0755, true)) {
            echo "<p class='success'>✅ Successfully created: <code>$productsDir</code></p>";
            echo "<p>Permissions: 755</p>";
        } else {
            echo "<p class='error'>❌ Failed to create directory!</p>";
            echo "<p><strong>Manual Fix Required:</strong></p>";
            echo "<ol>";
            echo "<li>Login to Hostinger File Manager</li>";
            echo "<li>Navigate to: <code>" . dirname($uploadDir) . "</code></li>";
            echo "<li>Create folder: <code>uploads</code></li>";
            echo "<li>Inside uploads, create: <code>products</code></li>";
            echo "<li>Set permissions to 755 for both folders</li>";
            echo "</ol>";
        }
    } else {
        echo "<p class='success'>✅ Products directory already exists</p>";
    }
    echo "</div>";

    // Test 4: Try to write a test file
    echo "<div class='box'>";
    echo "<h2>4. Write Test</h2>";
    if (file_exists($productsDir) && is_writable($productsDir)) {
        $testFile = $productsDir . 'test_' . time() . '.txt';
        $testContent = 'Test file created at ' . date('Y-m-d H:i:s');

        if (file_put_contents($testFile, $testContent)) {
            $fileSize = filesize($testFile);
            echo "<p class='success'>✅ Successfully wrote test file!</p>";
            echo "<table>";
            echo "<tr><td>File:</td><td><code>$testFile</code></td></tr>";
            echo "<tr><td>Size:</td><td>$fileSize bytes</td></tr>";
            echo "</table>";

            // Clean up
            unlink($testFile);
            echo "<p class='success'>✅ Test file deleted (cleanup successful)</p>";
        } else {
            echo "<p class='error'>❌ Failed to write test file!</p>";
            echo "<p>This means images cannot be saved even though directory exists.</p>";
            echo "<p><strong>Fix:</strong> Change directory permissions to 777 temporarily.</p>";
        }
    } else {
        echo "<p class='warning'>⚠️ Skipped (directory doesn't exist or not writable)</p>";
    }
    echo "</div>";

    // Test 5: Check error log location
    echo "<div class='box'>";
    echo "<h2>5. Error Log Location</h2>";
    $errorLog = __DIR__ . '/../logs/php-error.log';
    echo "<table>";
    echo "<tr><td>Error Log Path:</td><td><code>$errorLog</code></td></tr>";
    echo "<tr><td>Exists:</td><td>";
    if (file_exists($errorLog)) {
        echo "<span class='success'>✅ YES</span>";
        echo "</td></tr>";
        echo "<tr><td>Size:</td><td>" . filesize($errorLog) . " bytes</td></tr>";
        echo "<tr><td>Last Modified:</td><td>" . date('Y-m-d H:i:s', filemtime($errorLog)) . "</td></tr>";

        // Show last 20 lines
        $lines = file($errorLog);
        $lastLines = array_slice($lines, -20);
        echo "<tr><td colspan='2'><strong>Last 20 lines:</strong><br>";
        echo "<div class='code' style='max-height: 300px; overflow-y: auto;'>";
        echo htmlspecialchars(implode('', $lastLines));
        echo "</div></td></tr>";
    } else {
        echo "<span class='warning'>⚠️ NO - Will be created when first error occurs</span>";
    }
    echo "</td></tr>";
    echo "</table>";
    echo "</div>";

    // Test 6: Final verdict
    echo "<div class='box'>";
    echo "<h2>📊 Final Verdict</h2>";

    $allGood = true;
    if (!defined('UPLOAD_DIR')) {
        echo "<p class='error'>❌ UPLOAD_DIR not defined</p>";
        $allGood = false;
    }
    if (!file_exists($uploadDir)) {
        echo "<p class='error'>❌ Upload directory doesn't exist</p>";
        $allGood = false;
    }
    if (!is_writable($uploadDir)) {
        echo "<p class='error'>❌ Upload directory not writable</p>";
        $allGood = false;
    }
    if (!file_exists($productsDir)) {
        echo "<p class='warning'>⚠️ Products directory doesn't exist (will be auto-created)</p>";
    } elseif (!is_writable($productsDir)) {
        echo "<p class='error'>❌ Products directory not writable</p>";
        $allGood = false;
    }

    if ($allGood) {
        echo "<div style='background: #d4edda; padding: 20px; border-radius: 5px; border-left: 5px solid #28a745;'>";
        echo "<h3 style='margin: 0; color: #155724;'>✅ ALL CHECKS PASSED!</h3>";
        echo "<p style='margin: 10px 0 0 0; color: #155724;'>Your upload directory is configured correctly. Image uploads should work.</p>";
        echo "<p style='margin: 10px 0 0 0; color: #155724;'><strong>Next step:</strong> Try uploading a product image. If it still shows base64 error, check <code>$errorLog</code> for detailed error messages.</p>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; padding: 20px; border-radius: 5px; border-left: 5px solid #dc3545;'>";
        echo "<h3 style='margin: 0; color: #721c24;'>❌ ISSUES FOUND</h3>";
        echo "<p style='margin: 10px 0 0 0; color: #721c24;'>Fix the errors above before uploading images.</p>";
        echo "</div>";
    }
    echo "</div>";
    ?>

    <div class="box" style="background: #fff3cd; border-left: 5px solid #ffc107;">
        <h3 style="margin: 0; color: #856404;">⚠️ Security Notice</h3>
        <p style="color: #856404;">Delete this file (CHECK_UPLOAD_DIR.php) after diagnosis for security!</p>
    </div>

    <p><a href="/admin/products" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">← Back to Products</a></p>

</body>
</html>
