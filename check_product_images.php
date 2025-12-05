<?php
require_once __DIR__ . '/php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

echo "🖼️ Checking product images in database...\n\n";

$stmt = $db->query("SELECT id, name, thumbnail, images FROM products WHERE id IN (1, 3) LIMIT 5");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($products as $product) {
    echo "Product ID: " . $product['id'] . "\n";
    echo "Name: " . $product['name'] . "\n";
    echo "Thumbnail: " . ($product['thumbnail'] ?? 'NULL') . "\n";
    echo "Images: " . ($product['images'] ?? 'NULL') . "\n";
    echo "---\n";
}
