<?php
/**
 * Database Connection Configuration
 * Compatible with Hostinger shared hosting
 */

class Database {
    private static $instance = null;
    private $conn;

    // Database configuration - Loaded from .env file
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset;

    // Singleton pattern to ensure only one database connection
    private function __construct() {
        // Load .env file if it exists
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            try {
                // Use INI_SCANNER_RAW to avoid parsing issues with special characters
                $envVars = @parse_ini_file($envFile, false, INI_SCANNER_RAW);
                if ($envVars) {
                    foreach ($envVars as $key => $value) {
                        // Remove quotes from values
                        $value = trim($value, '"\'');
                        if (!isset($_ENV[$key])) {
                            $_ENV[$key] = $value;
                            putenv("$key=$value");
                        }
                    }
                }
            } catch (Exception $e) {
                error_log("Failed to load .env file: " . $e->getMessage());
            }
        }

        // Try multiple database configurations
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
        $lastError = '';
        
        foreach ($configs as $config) {
            try {
                $this->host = $config['host'];
                $this->db_name = $config['db'];
                $this->username = $config['user'];
                $this->password = $config['pass'];
                $this->charset = 'utf8mb4';
                
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
                
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false
                ];

                // Add MySQL specific options only if PDO MySQL extension is loaded
                if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                    $options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES utf8mb4";
                }
                
                $this->conn = new PDO($dsn, $this->username, $this->password, $options);
                
                // Test the connection
                $stmt = $this->conn->prepare("SELECT 1 as test");
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result && $result['test'] == 1) {
                    $connected = true;
                    error_log("Database connected successfully with: {$this->host}/{$this->db_name}");
                    break;
                }
                
            } catch(PDOException $e) {
                $lastError = $e->getMessage();
                error_log("Database connection failed with {$config['host']}/{$config['db']}: " . $e->getMessage());
                continue;
            }
        }
        
        if (!$connected) {
            error_log("All database connection attempts failed. Last error: " . $lastError);
            throw new Exception("Database connection failed. Please check your database credentials in Hostinger control panel.");
        }
    }

    // Get singleton instance
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Get PDO connection
    public function getConnection() {
        return $this->conn;
    }

    // Prevent cloning of the instance
    private function __clone() {}

    // Prevent unserializing of the instance
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
