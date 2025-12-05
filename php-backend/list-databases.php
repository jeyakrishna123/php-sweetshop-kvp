<?php
// List all databases
try {
    $pdo = new PDO('mysql:host=localhost', 'root', '');
    $stmt = $pdo->query('SHOW DATABASES');
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Available databases:\n";
    foreach ($databases as $db) {
        echo "  - $db\n";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
