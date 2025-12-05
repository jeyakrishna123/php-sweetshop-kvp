# 🔧 FIX: Product Image Upload Not Showing in Production

## 🔍 ISSUE DIAGNOSIS

### **Problem**
Product images are being stored as base64 data URLs in the database instead of file paths:
```
❌ Database: data:image/webp;base64,UklGRiQIAABXRUJQVlA4IBgIAABwL...
✅ Should be: /uploads/products/67890_1234567890.webp
```

When displayed, this creates an invalid URL:
```
GET https://skbakers.com/backend/uploads/products/data:image/webp;base64,Ukl...
414 (URI Too Long)
```

---

## 🎯 ROOT CAUSE

The backend `uploadBase64Image()` function is failing to save base64 images as files, likely due to:

1. **Upload directory doesn't exist** or **not writable**
2. **UPLOAD_DIR constant not defined**
3. **PHP memory limit too low** for base64 decoding
4. **Errors are silently failing** (returning null, but code continues anyway)

---

## ✅ SOLUTION

### Step 1: Check Upload Directory (phpMyAdmin → SQL)

Run this to verify upload directory structure:

```sql
-- This will show if the backend can write files
SELECT
    'Check these paths on your server:',
    '/public_html/uploads/',
    '/public_html/uploads/products/',
    '/public_html/backend/uploads/',
    '/public_html/backend/uploads/products/'
AS 'Required Directories';
```

**Then in Hostinger File Manager**:

1. Navigate to `public_html/uploads/`
2. Check if `products/` folder exists
3. Right-click `products/` → Permissions → Set to `755` or `777`
4. If folder doesn't exist, create it

---

### Step 2: Verify Backend Constants

Check `public_html/backend/config/config.php` has:

```php
// SHOULD HAVE THESE LINES:
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('BASE_URL', 'https://skbakers.com');
define('IMAGE_BASE_URL', 'https://skbakers.com/backend/uploads');

// Or these:
define('UPLOAD_DIR', '/home/u707629033/public_html/uploads/');
```

If missing or different, update the file.

---

### Step 3: Check PHP Error Log

In Hostinger File Manager, check:
```
public_html/backend/error.log
```

Look for lines like:
```
❌ uploadBase64Image - Failed to save file: /path/to/products/filename.webp
❌ normalizeImagePath - Failed to convert base64 image
⚠️ UPDATE PRODUCT - Image normalization failed for: data:image/webp...
```

This will tell you exactly why base64 conversion is failing.

---

### Step 4: Fix Existing Products with Base64 Images

**Upload and run this diagnostic script:**

**File**: `public_html/backend/FIX_BASE64_IMAGES.php`

```php
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
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🔧 Fix Base64 Images Tool</h1>
    <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

<?php

$db = Database::getInstance()->getConnection();

// Step 1: Check upload directory
echo "<h2>1. Check Upload Directory</h2>";
$uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR : __DIR__ . '/../uploads/';
$productsDir = $uploadDir . 'products/';

echo "<p>Upload Directory: <code>$uploadDir</code></p>";

if (!file_exists($uploadDir)) {
    echo "<p class='error'>❌ Upload directory doesn't exist!</p>";
    if (mkdir($uploadDir, 0755, true)) {
        echo "<p class='success'>✅ Created upload directory</p>";
    } else {
        echo "<p class='error'>❌ Failed to create upload directory. Check permissions!</p>";
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
        exit;
    }
} else {
    echo "<p class='success'>✅ Products directory exists</p>";
}

// Check if writable
if (!is_writable($productsDir)) {
    echo "<p class='error'>❌ Products directory is NOT WRITABLE!</p>";
    echo "<p>Run this command via SSH or change permissions in File Manager:</p>";
    echo "<pre>chmod 755 " . $productsDir . "</pre>";
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
    echo "<a href='/admin/products' class='btn'>Back to Products</a>";
    exit;
}

echo "<p class='warning'>⚠️ Found " . count($productsWithBase64) . " products with base64 images</p>";
echo "<pre>" . print_r(array_map(fn($p) => ['id' => $p['id'], 'name' => $p['name']], $productsWithBase64), true) . "</pre>";

// Step 3: Fix them
if (!isset($_GET['fix'])) {
    echo "<h2>3. Ready to Fix</h2>";
    echo "<p class='warning'>⚠️ This will convert base64 image data to actual files.</p>";
    echo "<a href='?fix=1' class='btn'>🔧 Fix All Base64 Images</a>";
    exit;
}

echo "<h2>3. Fixing Base64 Images</h2>";

$fixed = 0;
$failed = 0;

foreach ($productsWithBase64 as $product) {
    echo "<h3>Product #{$product['id']}: {$product['name']}</h3>";

    $images = json_decode($product['images'], true);
    if (!is_array($images)) {
        echo "<p class='error'>❌ Invalid images format</p>";
        $failed++;
        continue;
    }

    $fixedImages = [];
    foreach ($images as $img) {
        // Check if it's a base64 data URL
        if (strpos($img, 'data:image/') === 0) {
            echo "<p>Converting base64 image...</p>";

            // Use the backend's uploadBase64Image function
            $fixedPath = uploadBase64Image($img, 'products');

            if ($fixedPath) {
                echo "<p class='success'>✅ Converted to: $fixedPath</p>";
                $fixedImages[] = $fixedPath;
            } else {
                echo "<p class='error'>❌ Failed to convert base64 image</p>";
                $failed++;
                // Keep original to avoid data loss
                $fixedImages[] = $img;
            }
        } else {
            // Already a file path
            echo "<p>✓ Already a file path: $img</p>";
            $fixedImages[] = $img;
        }
    }

    // Update database
    $updateStmt = $db->prepare("UPDATE products SET images = ? WHERE id = ?");
    if ($updateStmt->execute([json_encode($fixedImages), $product['id']])) {
        echo "<p class='success'>✅ Updated product #{$product['id']}</p>";
        $fixed++;
    } else {
        echo "<p class='error'>❌ Failed to update product #{$product['id']}</p>";
        $failed++;
    }

    echo "<hr>";
}

echo "<h2>✅ Summary</h2>";
echo "<p>Fixed: <strong class='success'>$fixed products</strong></p>";
echo "<p>Failed: <strong class='error'>$failed products</strong></p>";

if ($failed > 0) {
    echo "<p class='warning'>⚠️ Some products failed. Check error.log for details.</p>";
}

echo "<a href='/admin/products' class='btn'>Back to Products</a>";
echo "<p><em>After fixing, delete this file for security.</em></p>";

?>

</body>
</html>
```

---

## 📝 TEST PLAN

### After applying fixes:

1. **Upload FIX_BASE64_IMAGES.php** to `public_html/backend/`
2. **Visit** https://skbakers.com/backend/FIX_BASE64_IMAGES.php
3. **Click "Fix All Base64 Images"**
4. **Verify** products now show images correctly
5. **Delete** the fix script for security

---

## 🛡️ PREVENTION: Ensure Future Uploads Work

The backend code already has the logic to convert base64 to files, but we need to ensure it works:

### Check 1: helpers.php Line 494-497

```php
// Create upload directory if it doesn't exist
$uploadDir = UPLOAD_DIR . $directory . '/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
```

**Problem**: If `UPLOAD_DIR` is undefined, this will fail silently.

**Fix**: Add error checking in `uploadBase64Image()`:

```php
// At the start of uploadBase64Image() function (line 430)
if (!defined('UPLOAD_DIR')) {
    error_log("❌ uploadBase64Image - UPLOAD_DIR not defined!");
    return false;
}

$uploadDir = UPLOAD_DIR . $directory . '/';
error_log("🔍 uploadBase64Image - Upload directory: $uploadDir");

if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        error_log("❌ uploadBase64Image - Failed to create directory: $uploadDir");
        return false;
    }
}

if (!is_writable($uploadDir)) {
    error_log("❌ uploadBase64Image - Directory not writable: $uploadDir");
    return false;
}
```

---

## 🎯 EXPECTED RESULT

### Before Fix:
```
Database: ["data:image/webp;base64,UklGRiQIAABXRUJQ..."]
Display: ❌ 414 (URI Too Long) error
```

### After Fix:
```
Database: ["/uploads/products/67890_1234567890.webp"]
Display: ✅ Image shows correctly
Server: ✅ File exists at /public_html/uploads/products/67890_1234567890.webp
```

---

## 🚀 IMMEDIATE ACTION

1. **Check File Manager**: Verify `/public_html/uploads/products/` exists and is writable (755/777)
2. **Upload FIX_BASE64_IMAGES.php**: Run it to convert existing base64 images
3. **Check error.log**: See if `uploadBase64Image()` is logging errors
4. **Test new upload**: Create new product, upload image, verify file is saved

---

**Generated**: 2025-11-09
**Issue**: Base64 data URLs in database instead of file paths
**Solution**: Fix directory permissions + convert existing base64 to files
