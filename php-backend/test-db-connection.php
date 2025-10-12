<?php
/**
 * Test Database Connection
 * This will test different database configurations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [];

// Test 1: Try current configuration
$results['current_config'] = testConnection('localhost', 'u707629033_skbakers_main', 'u707629033_admin', 'Skbakers@123');

// Test 2: Try with different host
$results['host_variations'] = [
    'localhost' => testConnection('localhost', 'u707629033_skbakers_main', 'u707629033_admin', 'Skbakers@123'),
    '127.0.0.1' => testConnection('127.0.0.1', 'u707629033_skbakers_main', 'u707629033_admin', 'Skbakers@123'),
    'mysql.hostinger.com' => testConnection('mysql.hostinger.com', 'u707629033_skbakers_main', 'u707629033_admin', 'Skbakers@123')
];

// Test 3: Try with different database names
$results['db_variations'] = [
    'skbakers_main' => testConnection('localhost', 'skbakers_main', 'u707629033_admin', 'Skbakers@123'),
    'u707629033_skbakers' => testConnection('localhost', 'u707629033_skbakers', 'u707629033_admin', 'Skbakers@123'),
    'u707629033_main' => testConnection('localhost', 'u707629033_main', 'u707629033_admin', 'Skbakers@123')
];

// Test 4: Check if database exists
$results['database_check'] = checkDatabaseExists();

echo json_encode($results, JSON_PRETTY_PRINT);

function testConnection($host, $dbname, $username, $password) {
    try {
        $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];
        
        $pdo = new PDO($dsn, $username, $password, $options);
        
        // Test query
        $stmt = $pdo->prepare("SELECT 1 as test");
        $stmt->execute();
        $result = $stmt->fetch();
        
        return [
            'status' => 'success',
            'message' => 'Connection successful',
            'host' => $host,
            'database' => $dbname,
            'username' => $username
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage(),
            'host' => $host,
            'database' => $dbname,
            'username' => $username
        ];
    }
}

function checkDatabaseExists() {
    try {
        // Try to connect without database name
        $dsn = "mysql:host=localhost;charset=utf8mb4";
        $pdo = new PDO($dsn, 'u707629033_admin', 'Skbakers@123');
        
        // List databases
        $stmt = $pdo->prepare("SHOW DATABASES");
        $stmt->execute();
        $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return [
            'status' => 'success',
            'message' => 'Connection to MySQL successful',
            'available_databases' => $databases
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}
?>
