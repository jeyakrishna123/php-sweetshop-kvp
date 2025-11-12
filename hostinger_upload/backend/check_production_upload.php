<?php
/**
 * Production Upload Environment Diagnostic Script
 * Run this to check if your production server is ready for image uploads
 * Access: https://skbakers.com/backend/check_production_upload.php
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== PRODUCTION UPLOAD ENVIRONMENT CHECK ===\n\n";

// Load config
require_once __DIR__ . '/config/config.php';

$issues = [];
$warnings = [];
$success = [];

// 1. Check PHP Upload Settings
echo "1. PHP Upload Settings:\n";
$uploadMaxFilesize = ini_get('upload_max_filesize');
$postMaxSize = ini_get('post_max_size');
$fileUploads = ini_get('file_uploads');

echo "   - upload_max_filesize: $uploadMaxFilesize\n";
echo "   - post_max_size: $postMaxSize\n";
echo "   - file_uploads: " . ($fileUploads ? 'ENABLED' : 'DISABLED') . "\n";

if (!$fileUploads) {
    $issues[] = "PHP file_uploads is DISABLED. Enable it in php.ini";
}
if (parseSize($uploadMaxFilesize) < 10 * 1024 * 1024) {
    $warnings[] = "upload_max_filesize ($uploadMaxFilesize) is less than 10MB";
}
if (parseSize($postMaxSize) < 10 * 1024 * 1024) {
    $warnings[] = "post_max_size ($postMaxSize) is less than 10MB";
} else {
    $success[] = "PHP upload settings are configured correctly";
}

// 2. Check UPLOAD_DIR
echo "\n2. Upload Directory:\n";
if (!defined('UPLOAD_DIR')) {
    $issues[] = "UPLOAD_DIR constant is not defined!";
    echo "   ❌ UPLOAD_DIR not defined\n";
} else {
    $uploadDir = UPLOAD_DIR;
    echo "   - UPLOAD_DIR: $uploadDir\n";
    echo "   - Absolute path: " . realpath($uploadDir) ?: 'DOES NOT EXIST' . "\n";
    
    if (!file_exists($uploadDir)) {
        $issues[] = "UPLOAD_DIR does not exist: $uploadDir";
        echo "   ❌ Directory does not exist\n";
        echo "   💡 Fix: mkdir -p $uploadDir && chmod 755 $uploadDir\n";
    } else {
        $success[] = "UPLOAD_DIR exists";
        
        if (!is_writable($uploadDir)) {
            $issues[] = "UPLOAD_DIR is not writable: $uploadDir";
            echo "   ❌ Directory is not writable\n";
            $perms = substr(sprintf('%o', fileperms($uploadDir)), -4);
            echo "   - Current permissions: $perms\n";
            echo "   💡 Fix: chmod 755 $uploadDir\n";
            echo "   💡 Or: chmod 777 $uploadDir (less secure)\n";
        } else {
            $success[] = "UPLOAD_DIR is writable";
        }
    }
}

// 3. Check products subdirectory
echo "\n3. Products Upload Directory:\n";
if (defined('UPLOAD_DIR')) {
    $productsDir = UPLOAD_DIR . 'products/';
    echo "   - Path: $productsDir\n";
    
    if (!file_exists($productsDir)) {
        $warnings[] = "products/ subdirectory does not exist (will be created automatically)";
        echo "   ⚠️  Directory does not exist (will be created on first upload)\n";
    } else {
        $success[] = "products/ directory exists";
        
        if (!is_writable($productsDir)) {
            $issues[] = "products/ directory is not writable: $productsDir";
            echo "   ❌ Directory is not writable\n";
            $perms = substr(sprintf('%o', fileperms($productsDir)), -4);
            echo "   - Current permissions: $perms\n";
            echo "   💡 Fix: chmod 755 $productsDir\n";
        } else {
            $success[] = "products/ directory is writable";
        }
    }
}

// 4. Check disk space
echo "\n4. Disk Space:\n";
if (defined('UPLOAD_DIR') && file_exists(UPLOAD_DIR)) {
    $freeSpace = disk_free_space(UPLOAD_DIR);
    $freeSpaceMB = round($freeSpace / 1024 / 1024, 2);
    echo "   - Free space: " . formatBytes($freeSpace) . " ($freeSpaceMB MB)\n";
    
    if ($freeSpace < 100 * 1024 * 1024) { // Less than 100MB
        $warnings[] = "Low disk space: " . formatBytes($freeSpace);
        echo "   ⚠️  Low disk space\n";
    } else {
        $success[] = "Sufficient disk space available";
    }
}

// 5. Check PHP user
echo "\n5. PHP User:\n";
$phpUser = get_current_user();
$phpUserInfo = posix_getpwuid(posix_geteuid());
echo "   - Current user: $phpUser\n";
if (isset($phpUserInfo['name'])) {
    echo "   - Effective user: " . $phpUserInfo['name'] . "\n";
}
$success[] = "PHP user identified";

// 6. Check temp directory
echo "\n6. Temporary Directory:\n";
$tmpDir = sys_get_temp_dir();
echo "   - Temp dir: $tmpDir\n";
if (!is_writable($tmpDir)) {
    $issues[] = "PHP temp directory is not writable: $tmpDir";
    echo "   ❌ Temp directory is not writable\n";
} else {
    $success[] = "Temp directory is writable";
}

// 7. Check required PHP functions
echo "\n7. Required PHP Functions:\n";
$requiredFunctions = ['move_uploaded_file', 'file_exists', 'is_writable', 'mkdir', 'chmod'];
foreach ($requiredFunctions as $func) {
    if (function_exists($func)) {
        echo "   ✅ $func() available\n";
    } else {
        $issues[] = "Required PHP function missing: $func()";
        echo "   ❌ $func() NOT available\n";
    }
}

// 8. Check file permissions
echo "\n8. File Permissions Test:\n";
if (defined('UPLOAD_DIR') && file_exists(UPLOAD_DIR) && is_writable(UPLOAD_DIR)) {
    $testFile = UPLOAD_DIR . 'test_write_' . time() . '.txt';
    if (file_put_contents($testFile, 'test') !== false) {
        unlink($testFile);
        $success[] = "File write test successful";
        echo "   ✅ Can write files to upload directory\n";
    } else {
        $issues[] = "Cannot write test file to upload directory";
        echo "   ❌ Cannot write test file\n";
    }
} else {
    echo "   ⚠️  Skipped (directory not writable)\n";
}

// Summary
echo "\n=== SUMMARY ===\n\n";

if (count($success) > 0) {
    echo "✅ PASSED CHECKS:\n";
    foreach ($success as $item) {
        echo "   ✅ $item\n";
    }
    echo "\n";
}

if (count($warnings) > 0) {
    echo "⚠️  WARNINGS:\n";
    foreach ($warnings as $item) {
        echo "   ⚠️  $item\n";
    }
    echo "\n";
}

if (count($issues) > 0) {
    echo "❌ CRITICAL ISSUES (MUST FIX):\n";
    foreach ($issues as $item) {
        echo "   ❌ $item\n";
    }
    echo "\n";
    echo "=== FIXES NEEDED ===\n\n";
    
    if (in_array("UPLOAD_DIR does not exist", $issues) || in_array("UPLOAD_DIR is not writable", $issues)) {
        echo "1. Fix Upload Directory:\n";
        echo "   SSH into your server and run:\n";
        echo "   cd /path/to/backend\n";
        echo "   mkdir -p uploads/products\n";
        echo "   chmod 755 uploads\n";
        echo "   chmod 755 uploads/products\n";
        echo "   chown -R www-data:www-data uploads/  # or your web server user\n";
        echo "\n";
    }
    
    if (in_array("PHP file_uploads is DISABLED", $issues)) {
        echo "2. Enable PHP File Uploads:\n";
        echo "   Edit php.ini and set:\n";
        echo "   file_uploads = On\n";
        echo "   Then restart your web server\n";
        echo "\n";
    }
    
    if (in_array("PHP temp directory is not writable", $issues)) {
        echo "3. Fix Temp Directory:\n";
        echo "   Check sys_get_temp_dir() permissions\n";
        echo "   Usually: /tmp (should be 1777)\n";
        echo "\n";
    }
    
    exit(1);
} else {
    echo "✅ ALL CHECKS PASSED!\n";
    echo "Your production environment is ready for image uploads.\n";
    exit(0);
}

// Helper functions
function parseSize($size) {
    $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
    $size = preg_replace('/[^0-9\.]/', '', $size);
    if ($unit) {
        return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
    }
    return round($size);
}

function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}
?>

