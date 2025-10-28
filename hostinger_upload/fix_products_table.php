<?php
/**
 * Fix Products Table - Add Missing Columns
 * This will add missing columns to the products table
 */

// Database connection
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to database successfully!\n\n";
    
    // Check current table structure
    echo "🔍 Checking current products table structure...\n";
    $stmt = $pdo->query("DESCRIBE products");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "📋 Current columns: " . implode(', ', $columns) . "\n\n";
    
    // Columns to add
    $columnsToAdd = [
        'stock' => 'INT DEFAULT 0',
        'stock_quantity' => 'INT DEFAULT 0',
        'thumbnail' => 'VARCHAR(500)',
        'images' => 'JSON',
        'is_featured' => 'TINYINT(1) DEFAULT 0',
        'is_bestseller' => 'TINYINT(1) DEFAULT 0',
        'is_new' => 'TINYINT(1) DEFAULT 0',
        'weight' => 'VARCHAR(50)',
        'ingredients' => 'TEXT',
        'allergens' => 'TEXT',
        'sku' => 'VARCHAR(100)',
        'average_rating' => 'DECIMAL(3,2) DEFAULT 0.00',
        'num_reviews' => 'INT DEFAULT 0',
        'sold_count' => 'INT DEFAULT 0',
        'view_count' => 'INT DEFAULT 0'
    ];
    
    echo "🔧 Adding missing columns to products table...\n";
    
    foreach ($columnsToAdd as $column => $definition) {
        try {
            $stmt = $pdo->prepare("ALTER TABLE products ADD COLUMN $column $definition");
            $stmt->execute();
            echo "✅ Added column '$column' to products table\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "✅ Column '$column' already exists\n";
            } else {
                echo "⚠️ Could not add column '$column': " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n🎉 Products table fixed successfully!\n";
    echo "🔗 Now you can run add_sample_products.php to add products!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
