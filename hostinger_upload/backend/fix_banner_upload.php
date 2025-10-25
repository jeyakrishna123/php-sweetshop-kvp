<?php
/**
 * BANNER UPLOAD FIX - Production Issues
 * Run this script to fix banner upload issues on Hostinger
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$fixes = [];

// FIX 1: Create upload directories with correct permissions
$fixes['upload_directories'] = createUploadDirectories();

// FIX 2: Check and fix PHP upload settings
$fixes['php_settings'] = checkPhpSettings();

// FIX 3: Test file upload functionality
$fixes['upload_test'] = testFileUpload();

// FIX 4: Create .htaccess for uploads directory
$fixes['htaccess_uploads'] = createUploadsHtaccess();

echo json_encode($fixes, JSON_PRETTY_PRINT);

function createUploadDirectories() {
    $directories = [
        __DIR__ . '/uploads/banners/',
        __DIR__ . '/uploads/products/',
        __DIR__ . '/uploads/popups/',
        __DIR__ . '/uploads/menu-items/',
        __DIR__ . '/uploads/users/',
        __DIR__ . '/uploads/temp/',
        __DIR__ . '/logs/'
    ];
    
    $results = [];
    
    foreach ($directories as $dir) {
        if (!is_dir($dir)) {
            if (mkdir($dir, 0755, true)) {
                $results[] = "✅ Created directory: $dir";
            } else {
                $results[] = "❌ Failed to create directory: $dir";
            }
        } else {
            $results[] = "✅ Directory exists: $dir";
        }
        
        // Set permissions
        if (is_dir($dir)) {
            if (chmod($dir, 0755)) {
                $results[] = "✅ Set permissions 755 for: $dir";
            } else {
                $results[] = "❌ Failed to set permissions for: $dir";
            }
        }
    }
    
    return [
        'status' => 'success',
        'message' => 'Upload directories created/checked',
        'details' => $results
    ];
}

function checkPhpSettings() {
    $settings = [
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'max_execution_time' => ini_get('max_execution_time'),
        'max_input_time' => ini_get('max_input_time'),
        'file_uploads' => ini_get('file_uploads') ? 'Enabled' : 'Disabled',
        'upload_tmp_dir' => ini_get('upload_tmp_dir') ?: 'Default system temp'
    ];
    
    $issues = [];
    
    // Check if upload limits are sufficient
    $uploadLimit = parseSize($settings['upload_max_filesize']);
    $postLimit = parseSize($settings['post_max_size']);
    
    if ($uploadLimit < 10 * 1024 * 1024) { // 10MB
        $issues[] = "⚠️ upload_max_filesize is too small: {$settings['upload_max_filesize']} (recommended: 10M)";
    }
    
    if ($postLimit < 10 * 1024 * 1024) { // 10MB
        $issues[] = "⚠️ post_max_size is too small: {$settings['post_max_size']} (recommended: 10M)";
    }
    
    if ($settings['file_uploads'] === 'Disabled') {
        $issues[] = "❌ File uploads are disabled!";
    }
    
    return [
        'status' => empty($issues) ? 'success' : 'warning',
        'message' => 'PHP settings checked',
        'settings' => $settings,
        'issues' => $issues
    ];
}

function testFileUpload() {
    $testDir = __DIR__ . '/uploads/temp/';
    $testFile = $testDir . 'test_upload.txt';
    
    // Create test file
    if (file_put_contents($testFile, 'Test upload content')) {
        if (unlink($testFile)) {
            return [
                'status' => 'success',
                'message' => 'File upload test passed - directory is writable'
            ];
        } else {
            return [
                'status' => 'warning',
                'message' => 'File created but could not delete - check permissions'
            ];
        }
    } else {
        return [
            'status' => 'error',
            'message' => 'File upload test failed - directory not writable'
        ];
    }
}

function createUploadsHtaccess() {
    $htaccessContent = '# Allow access to uploaded files
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
    Order allow,deny
    Allow from all
</FilesMatch>

# Disable PHP execution in uploads
<FilesMatch "\.php$">
    Order deny,allow
    Deny from all
</FilesMatch>

# Set cache headers for images
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>';

    $htaccessFile = __DIR__ . '/uploads/.htaccess';
    
    if (file_put_contents($htaccessFile, $htaccessContent)) {
        return [
            'status' => 'success',
            'message' => 'Created .htaccess for uploads directory'
        ];
    } else {
        return [
            'status' => 'error',
            'message' => 'Failed to create .htaccess for uploads directory'
        ];
    }
}

function parseSize($size) {
    $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
    $size = preg_replace('/[^0-9\.]/', '', $size);
    
    if ($unit) {
        return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
    } else {
        return round($size);
    }
}
?>
