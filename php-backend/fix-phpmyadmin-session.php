<?php
/**
 * Fix phpMyAdmin Session Cookie Issue
 * Run this script to resolve the session cookie error
 */

echo "<h1>phpMyAdmin Session Fix</h1>";

// Method 1: Check if we can access phpMyAdmin directly
echo "<h2>Method 1: Direct phpMyAdmin Access</h2>";
echo "Try accessing phpMyAdmin directly:<br>";
echo "<a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a><br>";
echo "<a href='http://127.0.0.1/phpmyadmin' target='_blank'>http://127.0.0.1/phpmyadmin</a><br>";

// Method 2: Check XAMPP/WAMP status
echo "<h2>Method 2: Check XAMPP/WAMP Status</h2>";
echo "Make sure Apache and MySQL are running in XAMPP/WAMP control panel<br>";

// Method 3: Alternative database access
echo "<h2>Method 3: Alternative Database Access</h2>";
echo "You can also import the database using:<br>";
echo "1. MySQL Workbench<br>";
echo "2. Command line: mysql -u root -p<br>";
echo "3. Or fix the phpMyAdmin session issue<br>";

// Method 4: Test our PHP backend connection
echo "<h2>Method 4: Test PHP Backend Database Connection</h2>";
try {
    require_once 'config/database.php';
    
    // Update database config for your Hostinger database
    $host = 'localhost';
    $dbname = 'u707629033_skbakers_main';
    $username = 'u707629033_admin';
    $password = 'YOUR_PASSWORD_HERE'; // You need to set this
    
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    
    echo "✅ Database connection successful!<br>";
    echo "Database: $dbname<br>";
    echo "User: $username<br>";
    
    // Test if tables exist
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "✅ Tables found: " . count($tables) . "<br>";
        echo "Tables: " . implode(', ', $tables) . "<br>";
    } else {
        echo "⚠️ No tables found. You need to import the schema.sql file.<br>";
        echo "Download schema: <a href='database/schema.sql' target='_blank'>database/schema.sql</a><br>";
    }
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
    echo "<strong>Solution:</strong> Update the database credentials in config/database.php<br>";
}

echo "<h2>Next Steps:</h2>";
echo "1. Fix phpMyAdmin session issue (try different browser or clear cookies)<br>";
echo "2. Import database/schema.sql into your database<br>";
echo "3. Update database credentials in config/database.php<br>";
echo "4. Test the complete application<br>";
?>
