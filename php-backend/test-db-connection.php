<?php
/**
 * Database Connection Test
 * Tests each configuration from database.php
 */

header('Content-Type: text/plain');

// Load .env file if it exists
$envFile = __DIR__ . '/.env';
echo "=== Database Connection Test ===\n\n";
echo "Loading .env from: $envFile\n";

if (file_exists($envFile)) {
    try {
        $envVars = @parse_ini_file($envFile, false, INI_SCANNER_RAW);
        if ($envVars) {
            echo "✅ .env loaded successfully\n";
            foreach ($envVars as $key => $value) {
                $value = trim($value, '"\'');
                if (!isset($_ENV[$key])) {
                    $_ENV[$key] = $value;
                    putenv("$key=$value");
                }
                echo "  $key = " . (empty($value) ? '(empty)' : $value) . "\n";
            }
        } else {
            echo "❌ Failed to parse .env file\n";
        }
    } catch (Exception $e) {
        echo "❌ Error loading .env: " . $e->getMessage() . "\n";
    }
} else {
    echo "❌ .env file not found\n";
}

echo "\n";

// Try multiple database configurations (same as database.php)
$configs = [
    // Config 1: Local development with existing database
    ['host' => 'localhost', 'db' => 'u707629033_skbakers_main', 'user' => 'root', 'pass' => ''],
    // Config 2: Environment variables from .env
    ['host' => $_ENV['DB_HOST'] ?? 'localhost',
     'db' => $_ENV['DB_NAME'] ?? 'u707629033_skbakers_main',
     'user' => $_ENV['DB_USER'] ?? 'root',
     'pass' => $_ENV['DB_PASS'] ?? ''],
    // Config 3: Alternative local name
    ['host' => 'localhost', 'db' => 'sk_bakers', 'user' => 'root', 'pass' => ''],
    // Config 4: Hostinger production
    ['host' => 'localhost', 'db' => 'u707629033_skbakers_main', 'user' => 'u707629033_admin', 'pass' => 'Skbakers@123']
];

$connected = false;

foreach ($configs as $configIndex => $config) {
    echo "--- Config #" . ($configIndex + 1) . " ---\n";
    echo "Host: {$config['host']}\n";
    echo "Database: {$config['db']}\n";
    echo "User: {$config['user']}\n";
    echo "Password: " . (empty($config['pass']) ? '(empty)' : '***') . "\n";
    echo "Connecting...\n";

    $result = testConnection($config['host'], $config['db'], $config['user'], $config['pass']);
    echo $result['message'] . "\n";

    if ($result['status'] === 'success') {
        $connected = true;
        echo "\n✅✅✅ THIS CONFIG WORKS! ✅✅✅\n\n";
        break;
    }
    echo "\n";
}

if (!$connected) {
    echo "❌ All configurations failed!\n\n";
    echo "Checking PHP extensions:\n";
    echo "PDO: " . (extension_loaded('pdo') ? '✅ YES' : '❌ NO') . "\n";
    echo "PDO MySQL: " . (extension_loaded('pdo_mysql') ? '✅ YES' : '❌ NO') . "\n";
}

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
