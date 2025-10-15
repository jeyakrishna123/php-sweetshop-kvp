<?php
try {
    $pdo = new PDO('mysql:host=localhost', 'root', '');
    echo "MySQL connection OK\n";

    $stmt = $pdo->query('SHOW DATABASES');
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Available databases:\n";
    foreach($databases as $db) {
        echo "  - $db\n";
    }

    // Check if our database exists
    $targetDb = 'u707629033_skbakers_main';
    if (in_array($targetDb, $databases)) {
        echo "\n✅ Database '$targetDb' exists!\n";
    } else {
        echo "\n❌ Database '$targetDb' does NOT exist!\n";
        echo "Creating database...\n";
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$targetDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "✅ Database created successfully!\n";
    }

} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
