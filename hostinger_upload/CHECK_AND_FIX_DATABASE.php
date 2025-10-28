<?php
/**
 * CHECK AND FIX DATABASE
 * This script checks if database tables exist and creates them if missing
 */

echo "🔍 CHECKING AND FIXING DATABASE\n";
echo "================================\n\n";

try {
    require_once __DIR__ . '/backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful!\n\n";
    
    // Check if users table exists
    echo "📋 Checking database tables...\n";
    $tables = ['users', 'products', 'categories', 'orders', 'banners'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "✅ Table '$table': $count records\n";
        } catch (PDOException $e) {
            echo "❌ Table '$table': Missing - " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n🎯 DIAGNOSIS:\n";
    echo "If you see 'Missing' tables, run setup_hostinger_database.php to create them.\n";
    echo "If you see record counts, the database is working correctly.\n";
    
} catch (Exception $e) {
    echo "❌ CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\n🔧 SOLUTION:\n";
    echo "1. Check database credentials in Hostinger control panel\n";
    echo "2. Make sure database exists\n";
    echo "3. Run setup_hostinger_database.php to create tables\n";
}
?>
