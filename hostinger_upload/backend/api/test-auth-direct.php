<?php
/**
 * DIRECT TEST ENDPOINT - Bypasses index.php routing
 * Test: https://skbakers.com/api/test-auth-direct.php
 * This helps diagnose if the issue is with routing or the code itself
 */

// Set headers FIRST
@header('Content-Type: application/json; charset=utf-8');
@header('Access-Control-Allow-Origin: *');
@header('Access-Control-Allow-Methods: POST, OPTIONS');
@header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start output buffering
@ob_start();

try {
    // Test 1: Basic PHP functionality
    $test1 = ['php_version' => phpversion(), 'timestamp' => date('Y-m-d H:i:s')];
    
    // Test 2: Check if config files exist
    $configExists = file_exists(__DIR__ . '/../config/config.php');
    $databaseExists = file_exists(__DIR__ . '/../config/database.php');
    $helpersExists = file_exists(__DIR__ . '/../includes/helpers.php');
    
    $test2 = [
        'config_exists' => $configExists,
        'database_exists' => $databaseExists,
        'helpers_exists' => $helpersExists
    ];
    
    // Test 3: Try loading config (non-fatal)
    $configLoaded = false;
    $databaseLoaded = false;
    $helpersLoaded = false;
    
    try {
        require_once __DIR__ . '/../config/config.php';
        $configLoaded = true;
    } catch (Throwable $e) {
        $configError = $e->getMessage();
    }
    
    try {
        require_once __DIR__ . '/../config/database.php';
        $databaseLoaded = true;
    } catch (Throwable $e) {
        $databaseError = $e->getMessage();
    }
    
    try {
        require_once __DIR__ . '/../includes/helpers.php';
        $helpersLoaded = true;
    } catch (Throwable $e) {
        $helpersError = $e->getMessage();
    }
    
    // Test 4: Try database connection
    $dbConnected = false;
    $dbError = null;
    if ($databaseLoaded && class_exists('Database')) {
        try {
            $db = Database::getInstance()->getConnection();
            if ($db && is_object($db)) {
                $dbConnected = true;
            }
        } catch (Throwable $e) {
            $dbError = $e->getMessage();
        }
    }
    
    // Test 5: Check EmailService
    $emailServiceExists = file_exists(__DIR__ . '/../includes/EmailService.php');
    $emailServiceLoaded = false;
    if ($emailServiceExists) {
        try {
            require_once __DIR__ . '/../includes/EmailService.php';
            $emailServiceLoaded = class_exists('EmailService');
        } catch (Throwable $e) {
            $emailServiceError = $e->getMessage();
        }
    }
    
    // Test 6: Parse request body
    $requestBody = file_get_contents('php://input');
    $requestData = json_decode($requestBody, true);
    $email = $requestData['email'] ?? null;
    
    @ob_clean();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Diagnostic test completed',
        'tests' => [
            'php' => $test1,
            'files' => $test2,
            'loaded' => [
                'config' => $configLoaded,
                'database' => $databaseLoaded,
                'helpers' => $helpersLoaded,
                'email_service' => $emailServiceLoaded
            ],
            'database' => [
                'connected' => $dbConnected,
                'error' => $dbError ?? null
            ],
            'request' => [
                'method' => $_SERVER['REQUEST_METHOD'],
                'uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
                'email_provided' => !empty($email),
                'email_value' => $email
            ],
            'errors' => [
                'config' => $configError ?? null,
                'database' => $databaseError ?? null,
                'helpers' => $helpersError ?? null,
                'email_service' => $emailServiceError ?? null
            ]
        ]
    ]);
    exit;
    
} catch (Throwable $e) {
    @ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Test endpoint error',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
}

