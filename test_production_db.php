<?php
/**
 * Test Production Database Connection
 * Run this to verify database connection on Hostinger
 */

// Test database connection with production credentials
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

echo "🔍 Testing Database Connection...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n\n";
    
    // Test banners table
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM banners");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo "📊 Banners table count: " . $result['count'] . "\n";
    
    // Test active banners
    $stmt = $pdo->prepare("SELECT id, title, image_url, is_active FROM banners WHERE is_active = 1");
    $stmt->execute();
    $banners = $stmt->fetchAll();
    
    echo "🎯 Active banners: " . count($banners) . "\n";
    
    if (count($banners) > 0) {
        echo "\n📋 Active Banners:\n";
        foreach ($banners as $banner) {
            echo "- ID: {$banner['id']}, Title: {$banner['title']}, Image: {$banner['image_url']}\n";
        }
    }
    
    echo "\n✅ Database test completed successfully!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "🔧 Please check your database credentials in Hostinger control panel.\n";
}
?>
