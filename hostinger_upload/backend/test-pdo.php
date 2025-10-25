<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=u707629033_skbakers_main', 'root', '');
    echo "SUCCESS: Connected to database\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
    $result = $stmt->fetch();
    echo "Products count: " . $result['count'] . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
