<?php
// Test script for server
error_reporting(E_ALL);
ini_set("display_errors", 1);

echo "=== SERVER TEST ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Current time: " . date("Y-m-d H:i:s") . "\n";

// Test database connection
try {
    require_once "backend/config/database.php";
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection: SUCCESS\n";
    
    // Test users table
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Users table: " . $result["count"] . " users found\n";
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "=== TEST COMPLETE ===\n";
?>