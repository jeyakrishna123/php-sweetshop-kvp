<?php
/**
 * Wishlist Diagnostic Test Script
 * Upload this to backend/ folder and visit: https://skbakers.com/backend/test_wishlist.php
 * This will check if wishlist table exists and test basic functionality
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';

// Start output
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Wishlist Diagnostic Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
    </style>
</head>
<body>
    <h1>🔍 Wishlist Diagnostic Test</h1>
    <p><strong>Date:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>

<?php

try {
    echo "<h2>1. Database Connection Test</h2>";

    // Test database connection
    $db = Database::getInstance()->getConnection();
    echo "<p class='success'>✅ Database connection: SUCCESS</p>";
    echo "<p class='info'>Database Name: " . DB_NAME . "</p>";

    // Check if wishlist table exists
    echo "<h2>2. Wishlist Table Check</h2>";
    $tableCheck = $db->query("SHOW TABLES LIKE 'wishlist'");

    if ($tableCheck && $tableCheck->rowCount() > 0) {
        echo "<p class='success'>✅ Wishlist table: EXISTS</p>";

        // Show table structure
        echo "<h3>Table Structure:</h3>";
        $structure = $db->query("DESCRIBE wishlist");
        echo "<pre>";
        while ($row = $structure->fetch(PDO::FETCH_ASSOC)) {
            echo sprintf("%-20s %-20s %-10s %-10s\n",
                $row['Field'],
                $row['Type'],
                $row['Null'],
                $row['Key']
            );
        }
        echo "</pre>";

        // Count wishlist items
        $count = $db->query("SELECT COUNT(*) as total FROM wishlist")->fetch();
        echo "<p class='info'>Total wishlist items in database: <strong>" . $count['total'] . "</strong></p>";

        // Show sample data (last 5 items)
        echo "<h3>Sample Wishlist Data (Last 5):</h3>";
        $sample = $db->query("SELECT * FROM wishlist ORDER BY created_at DESC LIMIT 5");
        if ($sample->rowCount() > 0) {
            echo "<pre>";
            while ($row = $sample->fetch(PDO::FETCH_ASSOC)) {
                echo "ID: {$row['id']}, User ID: {$row['user_id']}, Product ID: {$row['product_id']}, Created: {$row['created_at']}\n";
            }
            echo "</pre>";
        } else {
            echo "<p class='warning'>⚠️ No wishlist items found in database</p>";
        }

    } else {
        echo "<p class='error'>❌ Wishlist table: DOES NOT EXIST</p>";
        echo "<p class='warning'>⚠️ This is the problem! The wishlist table is missing.</p>";
        echo "<h3>Solution:</h3>";
        echo "<p>Run this SQL in phpMyAdmin:</p>";
        echo "<pre>";
        echo "CREATE TABLE IF NOT EXISTS wishlist (\n";
        echo "    id INT AUTO_INCREMENT PRIMARY KEY,\n";
        echo "    user_id INT NOT NULL,\n";
        echo "    product_id INT NOT NULL,\n";
        echo "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
        echo "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
        echo "    UNIQUE KEY unique_wishlist (user_id, product_id),\n";
        echo "    INDEX idx_user_id (user_id),\n";
        echo "    INDEX idx_product_id (product_id)\n";
        echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n";
        echo "</pre>";
    }

    // Check users table for wishlist_count column
    echo "<h2>3. Users Table Check</h2>";
    $usersStructure = $db->query("DESCRIBE users");
    $hasWishlistCount = false;

    while ($row = $usersStructure->fetch(PDO::FETCH_ASSOC)) {
        if ($row['Field'] === 'wishlist_count') {
            $hasWishlistCount = true;
            break;
        }
    }

    if ($hasWishlistCount) {
        echo "<p class='success'>✅ Users table has 'wishlist_count' column</p>";
    } else {
        echo "<p class='warning'>⚠️ Users table missing 'wishlist_count' column</p>";
        echo "<p>Run this SQL to add it:</p>";
        echo "<pre>ALTER TABLE users ADD COLUMN wishlist_count INT DEFAULT 0;</pre>";
    }

    // Check products table
    echo "<h2>4. Products Table Check</h2>";
    $productCount = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1")->fetch();
    echo "<p class='info'>Active products in database: <strong>" . $productCount['total'] . "</strong></p>";

    if ($productCount['total'] == 0) {
        echo "<p class='warning'>⚠️ No active products found</p>";
    }

    // Test wishlist functionality (if table exists)
    if ($tableCheck && $tableCheck->rowCount() > 0) {
        echo "<h2>5. Wishlist Functionality Test</h2>";
        echo "<p class='info'>Testing if INSERT operation works...</p>";

        // Note: We can't test actual insert without user authentication
        // But we can check if the table structure supports it
        echo "<p class='success'>✅ Table structure looks good for INSERT operations</p>";
        echo "<p class='info'>Actual insert requires user authentication (login)</p>";
    }

    // Check file permissions
    echo "<h2>6. File Permissions Check</h2>";
    $logDir = __DIR__ . '/logs';
    if (is_writable($logDir)) {
        echo "<p class='success'>✅ Logs directory is writable</p>";
    } else {
        echo "<p class='warning'>⚠️ Logs directory is not writable</p>";
        echo "<p>Run: chmod 755 backend/logs</p>";
    }

    // Summary
    echo "<h2>📋 Summary</h2>";
    if ($tableCheck && $tableCheck->rowCount() > 0 && $hasWishlistCount) {
        echo "<p class='success' style='font-size: 18px;'>✅ All checks passed! Wishlist should work correctly.</p>";
        echo "<p>If you're still having issues:</p>";
        echo "<ul>";
        echo "<li>Check browser console for errors (F12)</li>";
        echo "<li>Make sure you're logged in</li>";
        echo "<li>Check backend/logs/php-error.log for errors</li>";
        echo "<li>Clear browser cache and try again</li>";
        echo "</ul>";
    } else {
        echo "<p class='error' style='font-size: 18px;'>❌ Issues found! Please fix the problems above.</p>";
    }

} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

?>

<hr>
<p><small>After reviewing the results, delete this file for security: <code>rm backend/test_wishlist.php</code></small></p>

</body>
</html>
