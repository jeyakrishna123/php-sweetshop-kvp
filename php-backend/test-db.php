<?php
// Test database connection
$configs = [
    ['host' => 'localhost', 'db' => 'u707629033_skbakers_main', 'user' => 'root', 'pass' => ''],
    ['host' => '127.0.0.1', 'db' => 'u707629033_skbakers_main', 'user' => 'root', 'pass' => ''],
    ['host' => 'localhost', 'db' => 'sk_bakers', 'user' => 'root', 'pass' => ''],
];

echo "Testing database connections...\n\n";

foreach ($configs as $i => $config) {
    echo "Config " . ($i + 1) . ": ";
    echo "{$config['user']}@{$config['host']}/{$config['db']}\n";

    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        $stmt = $pdo->query("SELECT DATABASE() as db, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE()");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo "✓ SUCCESS! Database: {$result['db']}, Tables: {$result['table_count']}\n\n";
        break;

    } catch(PDOException $e) {
        echo "✗ FAILED: " . $e->getMessage() . "\n\n";
    }
}
