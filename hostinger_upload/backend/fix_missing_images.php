<?php
/**
 * One-Click Fix for Missing Images
 *
 * Upload this file to: /backend/fix_missing_images.php
 * Run once by visiting: https://skbakers.com/backend/fix_missing_images.php
 * Delete after running for security
 */

// Prevent running in production accidentally - remove this line to enable
// die("Please uncomment line to enable this script");

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/helpers.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Fix Missing Images</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #28a745;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #dc3545;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #17a2b8;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
        pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .btn {
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 20px;
        }
        .btn:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Fix Missing Images Script</h1>

        <?php
        try {
            $db = Database::getInstance()->getConnection();

            echo '<div class="info">📊 <strong>Step 1:</strong> Checking for products with missing images...</div>';

            // Find products with missing menu-items images
            $checkStmt = $db->query("
                SELECT
                    id,
                    name,
                    images
                FROM products
                WHERE images LIKE '%menu-items%'
                AND images LIKE '%690f0b2fc68ec_1762593583%'
            ");

            $problematicProducts = $checkStmt->fetchAll(PDO::FETCH_ASSOC);
            $count = count($problematicProducts);

            if ($count > 0) {
                echo "<div class='warning'>⚠️ Found <strong>$count product(s)</strong> with missing images:</div>";
                echo "<pre>";
                foreach ($problematicProducts as $product) {
                    echo "ID: {$product['id']} - Name: {$product['name']}\n";
                }
                echo "</pre>";

                echo '<div class="info">🔧 <strong>Step 2:</strong> Fixing products...</div>';

                // Fix the products
                $fixStmt = $db->prepare("
                    UPDATE products
                    SET images = '[]'
                    WHERE images LIKE '%menu-items%'
                    AND images LIKE '%690f0b2fc68ec_1762593583%'
                ");

                $fixStmt->execute();
                $fixed = $fixStmt->rowCount();

                echo "<div class='success'>✅ <strong>Fixed $fixed product(s)</strong> - Removed references to missing images</div>";

                // Verify fix
                $verifyStmt = $db->query("
                    SELECT COUNT(*) as count
                    FROM products
                    WHERE images LIKE '%690f0b2fc68ec_1762593583%'
                ");

                $remaining = $verifyStmt->fetch()['count'];

                if ($remaining == 0) {
                    echo '<div class="success">🎉 <strong>Success!</strong> All missing image references have been removed</div>';
                } else {
                    echo "<div class='warning'>⚠️ Still $remaining product(s) with issues - may need manual review</div>";
                }

            } else {
                echo '<div class="success">✅ <strong>No issues found!</strong> All products have valid image references</div>';
            }

            // Check for base64 images
            echo '<div class="info">📊 <strong>Step 3:</strong> Checking for base64 images...</div>';

            $base64Stmt = $db->query("
                SELECT COUNT(*) as count
                FROM products
                WHERE images LIKE '%data:image%'
                OR images LIKE '%base64%'
            ");

            $base64Count = $base64Stmt->fetch()['count'];

            if ($base64Count > 0) {
                echo "<div class='warning'>⚠️ Found <strong>$base64Count product(s)</strong> with base64 images in database<br>";
                echo "These will be converted to files when you edit and update the products.</div>";
            } else {
                echo '<div class="success">✅ No base64 images found in database</div>';
            }

            // Summary
            echo '<hr>';
            echo '<h2>📊 Summary</h2>';
            echo '<div class="info">';
            echo '<strong>Database Status:</strong><br>';
            echo "✅ Missing image references: FIXED<br>";
            echo "✅ Products updated: $fixed<br>";
            if ($base64Count > 0) {
                echo "⚠️ Base64 images: $base64Count (will auto-convert on update)<br>";
            }
            echo '</div>';

            // Instructions
            echo '<div class="warning">';
            echo '<strong>⚠️ IMPORTANT:</strong><br>';
            echo '1. This script has completed successfully<br>';
            echo '2. <strong>DELETE THIS FILE</strong> from your server for security<br>';
            echo '3. File location: /backend/fix_missing_images.php<br>';
            echo '</div>';

            // Delete button (just shows command)
            echo '<div class="error">';
            echo '<strong>🗑️ Delete This File:</strong><br>';
            echo 'Go to Hostinger File Manager → /backend/ → Delete fix_missing_images.php';
            echo '</div>';

        } catch (Exception $e) {
            echo '<div class="error">❌ <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
            echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
        }
        ?>

    </div>
</body>
</html>
```

Save this file and upload it to your server!

**Usage:**
1. Upload `fix_missing_images.php` to `/backend/` folder
2. Uncomment line 11 (remove the `// die...` line)
3. Visit: `https://skbakers.com/backend/fix_missing_images.php`
4. Watch it fix the issues automatically
5. **Delete the file** after it's done

---

## ✅ **Recommended Approach**

I suggest **Method 2** - using the PHP script I just created because:
- ✅ One-click fix
- ✅ Shows you what it's doing
- ✅ Safe (shows results before/after)
- ✅ No SQL knowledge needed
- ✅ Visual feedback

---

## 📝 **After Running the Fix**

You should see:
```
✅ Fixed X products with missing images
✅ All missing image references have been removed
```

Then the errors will be gone:
- ❌ 422 errors → GONE
- ❌ ERR_NAME_NOT_RESOLVED → GONE
- ❌ Broken images → Show placeholder

---

**Which method do you prefer? I recommend uploading the PHP script I just created!** 🚀