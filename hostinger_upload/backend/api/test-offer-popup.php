<?php
/**
 * Test endpoint to diagnose offer popup issues
 * Access: https://skbakers.com/api/test-offer-popup.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

header('Content-Type: application/json');

$diagnostics = [];

// 1. Test database connection
try {
    $db = Database::getInstance()->getConnection();
    $diagnostics['database'] = '✅ Connected';
} catch (Exception $e) {
    $diagnostics['database'] = '❌ Failed: ' . $e->getMessage();
}

// 2. Check upload directory
$uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR . 'offer-popups/' : __DIR__ . '/../uploads/offer-popups/';
$diagnostics['upload_dir'] = $uploadDir;
$diagnostics['upload_dir_exists'] = is_dir($uploadDir) ? '✅ Exists' : '❌ Does not exist';
$diagnostics['upload_dir_writable'] = is_writable($uploadDir) ? '✅ Writable' : '❌ Not writable';

// 3. Test Base64 processing
$testBase64 = 'data:image/webp;base64,UklGRhIAAABXRUJQVlA4IAYAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
if (strpos($testBase64, 'data:image/') === 0) {
    $diagnostics['base64_detection'] = '✅ Working';
    $cleaned = preg_replace('/^data:image\/\w+;base64,/', '', $testBase64);
    $decoded = base64_decode($cleaned);
    $diagnostics['base64_decode'] = ($decoded !== false) ? '✅ Working (' . strlen($decoded) . ' bytes)' : '❌ Failed';
} else {
    $diagnostics['base64_detection'] = '❌ Failed';
}

// 4. Check table structure
try {
    $stmt = $db->query("DESCRIBE offer_popups");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $diagnostics['table_columns'] = $columns;
    $diagnostics['table_exists'] = '✅ Table exists';
} catch (Exception $e) {
    $diagnostics['table_exists'] = '❌ Failed: ' . $e->getMessage();
}

// 5. Test file write
try {
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        $diagnostics['upload_dir_created'] = '✅ Created';
    }

    $testFile = $uploadDir . 'test_' . time() . '.txt';
    if (file_put_contents($testFile, 'test')) {
        $diagnostics['file_write_test'] = '✅ Success';
        unlink($testFile); // Clean up
    } else {
        $diagnostics['file_write_test'] = '❌ Failed';
    }
} catch (Exception $e) {
    $diagnostics['file_write_test'] = '❌ Failed: ' . $e->getMessage();
}

// 6. Check PHP version and extensions
$diagnostics['php_version'] = PHP_VERSION;
$diagnostics['gd_extension'] = extension_loaded('gd') ? '✅ Loaded' : '❌ Not loaded';
$diagnostics['pdo_extension'] = extension_loaded('pdo') ? '✅ Loaded' : '❌ Not loaded';

// 7. Backend file timestamp (to verify it was uploaded)
$backendFile = __DIR__ . '/offer-popups.php';
if (file_exists($backendFile)) {
    $diagnostics['backend_file'] = '✅ Exists';
    $diagnostics['backend_file_modified'] = date('Y-m-d H:i:s', filemtime($backendFile));
    $diagnostics['backend_file_size'] = filesize($backendFile) . ' bytes';
} else {
    $diagnostics['backend_file'] = '❌ Not found';
}

echo json_encode([
    'success' => true,
    'message' => 'Diagnostic test completed',
    'diagnostics' => $diagnostics
], JSON_PRETTY_PRINT);
