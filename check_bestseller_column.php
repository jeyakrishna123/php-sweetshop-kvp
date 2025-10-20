<?php
require_once 'php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🔍 CHECKING BESTSELLER COLUMN\n";
echo str_repeat("=", 80) . "\n\n";

// Get all columns
$stmt = $db->query("SHOW COLUMNS FROM products");
$columns = $stmt->fetchAll();

echo "Looking for bestseller-related columns:\n";
foreach ($columns as $col) {
    if (stripos($col['Field'], 'seller') !== false ||
        stripos($col['Field'], 'best') !== false ||
        stripos($col['Field'], 'sold') !== false) {
        echo "  ✅ " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
}

echo "\n";

// Check if we have any bestseller products
$stmt = $db->query("SELECT COUNT(*) as count FROM products WHERE sold_count > 0");
$result = $stmt->fetch();
echo "Products with sold_count > 0: " . $result['count'] . "\n";

// Check products ordered by sold_count
$stmt = $db->query("SELECT id, name, sold_count, average_rating FROM products WHERE is_active = 1 ORDER BY sold_count DESC LIMIT 10");
$products = $stmt->fetchAll();

echo "\nTop 10 products by sold_count:\n";
foreach ($products as $p) {
    echo sprintf("  ID: %-3d | %-40s | Sold: %-5d | Rating: %.2f\n",
        $p['id'],
        substr($p['name'], 0, 40),
        $p['sold_count'],
        $p['average_rating']
    );
}
