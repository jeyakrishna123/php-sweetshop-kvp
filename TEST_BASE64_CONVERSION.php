<?php
/**
 * TEST BASE64 CONVERSION - Quick Test Script
 * Upload to: public_html/backend/TEST_BASE64_CONVERSION.php
 * Visit: https://skbakers.com/backend/TEST_BASE64_CONVERSION.php
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/helpers.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Test Base64 Conversion</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .code { background: #f5f5f5; padding: 10px; border-left: 3px solid #007bff; margin: 10px 0; font-family: monospace; white-space: pre-wrap; word-break: break-all; }
        h2 { color: #333; margin-top: 0; }
    </style>
</head>
<body>
    <h1>🧪 Test Base64 Image Conversion</h1>
    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

<?php

// Create a tiny 1x1 red pixel PNG in base64
$testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

echo "<div class='box'>";
echo "<h2>1. Configuration Check</h2>";

echo "<table style='width:100%; border-collapse: collapse;'>";
echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>UPLOAD_DIR Defined:</strong></td><td style='padding:10px;'>";
if (defined('UPLOAD_DIR')) {
    echo "<span class='success'>✅ YES</span>";
} else {
    echo "<span class='error'>❌ NO</span>";
}
echo "</td></tr>";

if (defined('UPLOAD_DIR')) {
    echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>UPLOAD_DIR Value:</strong></td><td style='padding:10px;'><code>" . UPLOAD_DIR . "</code></td></tr>";

    echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Upload Dir Exists:</strong></td><td style='padding:10px;'>";
    if (file_exists(UPLOAD_DIR)) {
        echo "<span class='success'>✅ YES</span>";
    } else {
        echo "<span class='error'>❌ NO</span>";
    }
    echo "</td></tr>";

    echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Upload Dir Writable:</strong></td><td style='padding:10px;'>";
    if (is_writable(UPLOAD_DIR)) {
        echo "<span class='success'>✅ YES</span>";
    } else {
        echo "<span class='error'>❌ NO</span>";
    }
    echo "</td></tr>";

    $productsDir = UPLOAD_DIR . 'products/';
    echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Products Dir Exists:</strong></td><td style='padding:10px;'>";
    if (file_exists($productsDir)) {
        echo "<span class='success'>✅ YES</span>";
    } else {
        echo "<span class='warning'>⚠️ NO</span>";
    }
    echo "</td></tr>";

    if (file_exists($productsDir)) {
        echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Products Dir Writable:</strong></td><td style='padding:10px;'>";
        if (is_writable($productsDir)) {
            echo "<span class='success'>✅ YES</span>";
        } else {
            echo "<span class='error'>❌ NO</span>";
        }
        echo "</td></tr>";
    }
}

echo "</table>";
echo "</div>";

// Test 2: Check if functions exist
echo "<div class='box'>";
echo "<h2>2. Function Check</h2>";

echo "<table style='width:100%; border-collapse: collapse;'>";
echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>uploadBase64Image() exists:</strong></td><td style='padding:10px;'>";
if (function_exists('uploadBase64Image')) {
    echo "<span class='success'>✅ YES</span>";
} else {
    echo "<span class='error'>❌ NO</span>";
}
echo "</td></tr>";

echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>normalizeImagePath() exists:</strong></td><td style='padding:10px;'>";
if (function_exists('normalizeImagePath')) {
    echo "<span class='success'>✅ YES</span>";
} else {
    echo "<span class='error'>❌ NO</span>";
}
echo "</td></tr>";
echo "</table>";
echo "</div>";

// Test 3: Test the actual conversion
echo "<div class='box'>";
echo "<h2>3. Conversion Test</h2>";

echo "<p>Testing with a small 1x1 red pixel PNG (base64):</p>";
echo "<div class='code'>" . substr($testBase64, 0, 100) . "...</div>";

if (function_exists('uploadBase64Image')) {
    echo "<p>Calling <code>uploadBase64Image()</code>...</p>";

    // Capture any errors
    $errorBefore = error_get_last();

    $result = uploadBase64Image($testBase64, 'products');

    $errorAfter = error_get_last();

    if ($result) {
        echo "<p class='success'>✅ Conversion SUCCEEDED!</p>";
        echo "<table style='width:100%; border-collapse: collapse;'>";
        echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Returned Path:</strong></td><td style='padding:10px;'><code>$result</code></td></tr>";

        // Check if file actually exists
        $fullPath = UPLOAD_DIR . 'products' . substr($result, strlen('/uploads/products'));
        echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Full Server Path:</strong></td><td style='padding:10px;'><code>$fullPath</code></td></tr>";

        echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>File Exists:</strong></td><td style='padding:10px;'>";
        if (file_exists($fullPath)) {
            echo "<span class='success'>✅ YES</span>";
            echo "</td></tr>";

            echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>File Size:</strong></td><td style='padding:10px;'>" . filesize($fullPath) . " bytes</td></tr>";

            // Clean up
            unlink($fullPath);
            echo "<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'><strong>Cleanup:</strong></td><td style='padding:10px;'><span class='success'>✅ Test file deleted</span></td></tr>";
        } else {
            echo "<span class='error'>❌ NO - File was not created!</span>";
            echo "</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='error'>❌ Conversion FAILED!</p>";
        echo "<p><strong>Possible reasons:</strong></p>";
        echo "<ul>";
        echo "<li>Upload directory doesn't exist or not writable</li>";
        echo "<li>PHP memory limit too low</li>";
        echo "<li>File permissions issue</li>";
        echo "</ul>";

        if ($errorAfter && $errorAfter != $errorBefore) {
            echo "<p><strong>PHP Error:</strong></p>";
            echo "<div class='code'>" . $errorAfter['message'] . " in " . $errorAfter['file'] . " on line " . $errorAfter['line'] . "</div>";
        }
    }
} else {
    echo "<p class='error'>❌ Function uploadBase64Image() not found!</p>";
}

echo "</div>";

// Test 4: Check error log
echo "<div class='box'>";
echo "<h2>4. Error Log Check</h2>";

$errorLog = __DIR__ . '/../logs/php-error.log';

if (file_exists($errorLog)) {
    echo "<p class='success'>✅ Error log exists</p>";
    echo "<p><strong>Location:</strong> <code>$errorLog</code></p>";
    echo "<p><strong>Size:</strong> " . number_format(filesize($errorLog)) . " bytes</p>";

    // Show last 30 lines
    $lines = file($errorLog);
    $lastLines = array_slice($lines, -30);

    echo "<h3>Last 30 lines:</h3>";
    echo "<div class='code' style='max-height: 400px; overflow-y: auto;'>";
    echo htmlspecialchars(implode('', $lastLines));
    echo "</div>";
} else {
    echo "<p class='warning'>⚠️ Error log doesn't exist yet</p>";
    echo "<p>Log will be created: <code>$errorLog</code></p>";
}

echo "</div>";

// Test 5: Test normalizeImagePath
echo "<div class='box'>";
echo "<h2>5. normalizeImagePath() Test</h2>";

if (function_exists('normalizeImagePath')) {
    echo "<p>Testing <code>normalizeImagePath()</code> with base64...</p>";

    $normalizeResult = normalizeImagePath($testBase64, 'products');

    if ($normalizeResult) {
        echo "<p class='success'>✅ normalizeImagePath() returned: <code>$normalizeResult</code></p>";

        // Check if it's still base64 (bad) or a file path (good)
        if (strpos($normalizeResult, 'data:image') === 0) {
            echo "<p class='error'>❌ WARNING: Still base64! Conversion failed but returned original string!</p>";
        } else if (strpos($normalizeResult, '/uploads/') === 0) {
            echo "<p class='success'>✅ GOOD: Returned a file path</p>";
        } else {
            echo "<p class='warning'>⚠️ Unexpected format: $normalizeResult</p>";
        }
    } else {
        echo "<p class='error'>❌ normalizeImagePath() returned NULL (conversion failed)</p>";
    }
} else {
    echo "<p class='error'>❌ Function normalizeImagePath() not found!</p>";
}

echo "</div>";

?>

<div class="box" style="background: #fff3cd; border-left: 5px solid #ffc107;">
    <h3 style="margin: 0; color: #856404;">📋 What This Test Shows</h3>
    <ul style="color: #856404;">
        <li>If conversion works: Functions are correct, directory is writable ✅</li>
        <li>If conversion fails: Check error log for exact reason ❌</li>
        <li>If functions don't exist: helpers.php not loaded correctly ❌</li>
    </ul>
</div>

<div class="box" style="background: #fff3cd; border-left: 5px solid #ffc107;">
    <h3 style="margin: 0; color: #856404;">⚠️ Security Notice</h3>
    <p style="color: #856404;">Delete this file (TEST_BASE64_CONVERSION.php) after testing!</p>
</div>

<p><a href="/admin/products" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">← Back to Products</a></p>

</body>
</html>
