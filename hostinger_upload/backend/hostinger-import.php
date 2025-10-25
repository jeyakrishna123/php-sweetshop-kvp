<?php
/**
 * Hostinger Database Import Script
 * Use this to import your database schema to Hostinger
 */

echo "<h1>🗄️ Hostinger Database Import</h1>";

// Database configuration - UPDATE THESE VALUES
$host = 'localhost';
$dbname = 'u707629033_skbakers_main';
$username = 'u707629033_admin';
$password = 'YOUR_ACTUAL_HOSTINGER_PASSWORD'; // ⚠️ UPDATE THIS WITH YOUR ACTUAL PASSWORD

echo "<h2>📊 Database Information</h2>";
echo "Host: $host<br>";
echo "Database: $dbname<br>";
echo "Username: $username<br>";
echo "Password: [Hidden for security]<br>";

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!<br>";
    
    // Check current tables
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h2>📋 Current Database Status</h2>";
    echo "Existing tables: " . count($existingTables) . "<br>";
    
    if (count($existingTables) > 0) {
        echo "Tables found: " . implode(', ', $existingTables) . "<br>";
        echo "⚠️ Database already has tables. Import will add to existing data.<br>";
    } else {
        echo "📥 No tables found. Ready to import schema...<br>";
    }
    
    // Read schema file
    $schemaFile = __DIR__ . '/database/schema.sql';
    
    if (file_exists($schemaFile)) {
        echo "<h2>📄 Importing Database Schema</h2>";
        echo "Reading schema file: $schemaFile<br>";
        
        $sql = file_get_contents($schemaFile);
        
        if ($sql) {
            // Split SQL into individual statements
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            
            $successCount = 0;
            $errorCount = 0;
            $skippedCount = 0;
            
            echo "Executing " . count($statements) . " SQL statements...<br><br>";
            
            foreach ($statements as $i => $statement) {
                if (!empty($statement) && !preg_match('/^--/', $statement)) {
                    try {
                        $pdo->exec($statement);
                        $successCount++;
                        echo "✅ Statement " . ($i + 1) . " executed successfully<br>";
                    } catch (PDOException $e) {
                        // Check if it's a "table already exists" error
                        if (strpos($e->getMessage(), 'already exists') !== false) {
                            $skippedCount++;
                            echo "⚠️ Statement " . ($i + 1) . " skipped (table already exists)<br>";
                        } else {
                            $errorCount++;
                            echo "❌ Statement " . ($i + 1) . " failed: " . $e->getMessage() . "<br>";
                        }
                    }
                }
            }
            
            echo "<h2>📊 Import Results</h2>";
            echo "✅ Successful: $successCount<br>";
            echo "⚠️ Skipped: $skippedCount<br>";
            echo "❌ Failed: $errorCount<br>";
            
            if ($errorCount == 0) {
                echo "<h2>🎉 Database Import Complete!</h2>";
                
                // Verify tables were created
                $stmt = $pdo->query("SHOW TABLES");
                $newTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                echo "📊 Total tables: " . count($newTables) . "<br>";
                echo "Tables: " . implode(', ', $newTables) . "<br>";
                
                // Check for admin user
                try {
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                    $adminCount = $stmt->fetch()['count'];
                    echo "👤 Admin users: $adminCount<br>";
                    
                    if ($adminCount > 0) {
                        echo "<h3>🔐 Default Admin Credentials</h3>";
                        echo "Email: admin@skbakers.com<br>";
                        echo "Password: admin123456<br>";
                        echo "<strong>⚠️ IMPORTANT: Change this password immediately!</strong><br>";
                    }
                } catch (Exception $e) {
                    echo "⚠️ Could not check admin users: " . $e->getMessage() . "<br>";
                }
                
                echo "<h3>🧪 Test Your API</h3>";
                echo "1. <a href='../api/'>Test Root API</a><br>";
                echo "2. <a href='../api/health'>Test Health Check</a><br>";
                echo "3. <a href='../api/products'>Test Products API</a><br>";
                
            } else {
                echo "<h2>⚠️ Import Completed with Errors</h2>";
                echo "Some statements failed. Check the errors above.<br>";
                echo "You may need to manually fix these issues.<br>";
            }
        } else {
            echo "❌ Could not read schema file<br>";
        }
    } else {
        echo "❌ Schema file not found: $schemaFile<br>";
        echo "Make sure database/schema.sql exists<br>";
    }
    
} catch (PDOException $e) {
    echo "<h2>❌ Database Connection Failed</h2>";
    echo "Error: " . $e->getMessage() . "<br>";
    echo "<h3>🔧 Solutions:</h3>";
    echo "1. <strong>Update password</strong> in this script (line 9)<br>";
    echo "2. <strong>Check database exists</strong> in Hostinger control panel<br>";
    echo "3. <strong>Verify credentials</strong> in Hostinger MySQL settings<br>";
    echo "4. <strong>Check MySQL is running</strong> in Hostinger<br>";
    
    echo "<h3>📋 Database Setup Checklist:</h3>";
    echo "✅ Database created: u707629033_skbakers_main<br>";
    echo "✅ User created: u707629033_admin<br>";
    echo "❌ Password configured: [Update this script]<br>";
    echo "❌ Connection tested: [Fix password first]<br>";
}

echo "<h2>📋 Next Steps</h2>";
echo "1. <strong>Update password</strong> in this script if connection failed<br>";
echo "2. <strong>Run this script again</strong> to import database<br>";
echo "3. <strong>Test API endpoints</strong> to verify everything works<br>";
echo "4. <strong>Deploy React frontend</strong> and test complete application<br>";

echo "<h2>🔗 Useful Links</h2>";
echo "- <a href='quick-deploy.php'>Quick Deploy Helper</a><br>";
echo "- <a href='test-connection.php'>Test Connection</a><br>";
echo "- <a href='HOSTINGER_DEPLOYMENT_GUIDE.md'>Complete Deployment Guide</a><br>";
?>
