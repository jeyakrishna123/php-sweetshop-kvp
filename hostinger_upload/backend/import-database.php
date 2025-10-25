<?php
/**
 * Database Import Script
 * Import the schema.sql file into your database
 */

echo "<h1>Database Import Script</h1>";

// Database configuration
$host = 'localhost';
$dbname = 'u707629033_skbakers_main';
$username = 'u707629033_admin';
$password = 'YOUR_PASSWORD_HERE'; // Update this with your actual password

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to database: $dbname<br>";
    
    // Check if tables already exist
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($existingTables) > 0) {
        echo "⚠️ Database already has " . count($existingTables) . " tables:<br>";
        echo implode(', ', $existingTables) . "<br>";
        echo "If you want to reimport, please drop the existing tables first.<br>";
    } else {
        echo "📥 No tables found. Ready to import schema...<br>";
        
        // Read and execute schema.sql
        $schemaFile = __DIR__ . '/database/schema.sql';
        
        if (file_exists($schemaFile)) {
            echo "📄 Reading schema file: $schemaFile<br>";
            
            $sql = file_get_contents($schemaFile);
            
            if ($sql) {
                // Split SQL into individual statements
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                
                $successCount = 0;
                $errorCount = 0;
                
                foreach ($statements as $statement) {
                    if (!empty($statement) && !preg_match('/^--/', $statement)) {
                        try {
                            $pdo->exec($statement);
                            $successCount++;
                        } catch (PDOException $e) {
                            $errorCount++;
                            echo "❌ Error in statement: " . substr($statement, 0, 50) . "...<br>";
                            echo "Error: " . $e->getMessage() . "<br>";
                        }
                    }
                }
                
                echo "<h2>Import Results:</h2>";
                echo "✅ Successful statements: $successCount<br>";
                echo "❌ Failed statements: $errorCount<br>";
                
                if ($errorCount == 0) {
                    echo "🎉 Database schema imported successfully!<br>";
                    
                    // Verify tables were created
                    $stmt = $pdo->query("SHOW TABLES");
                    $newTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    echo "📊 Tables created: " . count($newTables) . "<br>";
                    echo "Tables: " . implode(', ', $newTables) . "<br>";
                    
                    // Check for default admin user
                    try {
                        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                        $adminCount = $stmt->fetch()['count'];
                        echo "👤 Admin users: $adminCount<br>";
                        
                        if ($adminCount > 0) {
                            echo "✅ Default admin user created<br>";
                            echo "Email: admin@skbakers.com<br>";
                            echo "Password: admin123456<br>";
                            echo "<strong>⚠️ IMPORTANT: Change this password immediately!</strong><br>";
                        }
                    } catch (Exception $e) {
                        echo "⚠️ Could not check admin users: " . $e->getMessage() . "<br>";
                    }
                }
            } else {
                echo "❌ Could not read schema file<br>";
            }
        } else {
            echo "❌ Schema file not found: $schemaFile<br>";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
    echo "<strong>Solutions:</strong><br>";
    echo "1. Update the password in this script<br>";
    echo "2. Make sure MySQL is running<br>";
    echo "3. Check database credentials in Hostinger<br>";
    echo "4. Try accessing phpMyAdmin directly<br>";
}

echo "<h2>Next Steps:</h2>";
echo "1. Update the password in this script (line 9)<br>";
echo "2. Run this script again<br>";
echo "3. Test your API endpoints<br>";
echo "4. Start your React frontend<br>";
?>
