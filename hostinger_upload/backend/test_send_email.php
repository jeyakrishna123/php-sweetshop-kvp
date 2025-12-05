<?php
/**
 * Direct test script for send-bill-pdf endpoint
 * Usage: POST to this file with JSON body containing pdf and filename
 * 
 * This helps diagnose if the endpoint is reachable and working
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/ErrorHandler.php';
ErrorHandler::init();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.',
        'received_method' => $_SERVER['REQUEST_METHOD']
    ]);
    exit;
}

try {
    // Get order ID from query string or body
    $orderId = $_GET['order_id'] ?? null;
    if (!$orderId) {
        $input = json_decode(file_get_contents('php://input'), true);
        $orderId = $input['order_id'] ?? null;
    }
    
    if (!$orderId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Order ID is required',
            'hint' => 'Add ?order_id=21 to URL or include in JSON body'
        ]);
        exit;
    }
    
    // Get database connection
    require_once __DIR__ . '/includes/helpers.php';
    $db = getDBConnection();
    
    // Check if EmailService exists
    $emailServicePath = __DIR__ . '/includes/EmailService.php';
    $emailServiceExists = file_exists($emailServicePath);
    
    // Check if PHPMailer exists
    $phpmailerPaths = [
        __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php',
        __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php',
    ];
    $phpmailerExists = false;
    foreach ($phpmailerPaths as $path) {
        if (file_exists($path)) {
            $phpmailerExists = true;
            break;
        }
    }
    
    // Get order details
    $orderStmt = $db->prepare("SELECT o.*, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
    
    $results = [
        'test_name' => 'Send Email Endpoint Diagnostic',
        'timestamp' => date('Y-m-d H:i:s'),
        'order_id' => $orderId,
        'order_found' => $order ? 'YES' : 'NO',
        'customer_email' => $order['customer_email'] ?? 'NOT FOUND',
        'emailservice_file_exists' => $emailServiceExists ? 'YES' : 'NO',
        'emailservice_path' => $emailServicePath,
        'phpmailer_exists' => $phpmailerExists ? 'YES' : 'NO',
        'smtp_config' => [
            'host' => defined('SMTP_HOST') ? SMTP_HOST : 'NOT SET',
            'port' => defined('SMTP_PORT') ? SMTP_PORT : 'NOT SET',
            'username' => defined('SMTP_USERNAME') ? (empty(SMTP_USERNAME) ? 'EMPTY' : 'SET') : 'NOT SET',
            'password' => defined('SMTP_PASSWORD') ? (empty(SMTP_PASSWORD) ? 'EMPTY' : 'SET') : 'NOT SET',
            'from_email' => defined('FROM_EMAIL') ? FROM_EMAIL : 'NOT SET',
        ],
        'php_settings' => [
            'max_execution_time' => ini_get('max_execution_time'),
            'memory_limit' => ini_get('memory_limit'),
            'post_max_size' => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
        ],
        'request_info' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'NOT SET',
            'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 'NOT SET',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'NOT SET',
        ],
        'endpoint_test' => [
            'message' => 'This is a diagnostic endpoint. To test actual email sending, use: /api/orders/' . $orderId . '/send-bill-pdf',
            'endpoint_url' => 'https://skbakers.com/api/orders/' . $orderId . '/send-bill-pdf',
            'method' => 'POST',
            'required_headers' => [
                'Content-Type: application/json',
                'Authorization: Bearer {your_token}'
            ],
            'required_body' => [
                'pdf' => 'base64_encoded_pdf_string',
                'filename' => 'Bill_of_Supply_XX.pdf'
            ]
        ]
    ];
    
    // Try to load EmailService
    if ($emailServiceExists) {
        require_once $emailServicePath;
        $results['emailservice_class_exists'] = class_exists('EmailService') ? 'YES' : 'NO';
        
        if (class_exists('EmailService')) {
            try {
                $emailService = new EmailService();
                $results['emailservice_instance_created'] = 'YES';
                $results['phpmailer_class_exists'] = class_exists('PHPMailer\PHPMailer\PHPMailer') ? 'YES' : 'NO';
            } catch (Exception $e) {
                $results['emailservice_instance_created'] = 'NO';
                $results['emailservice_error'] = $e->getMessage();
            }
        }
    } else {
        $results['emailservice_class_exists'] = 'NO (file not found)';
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Diagnostic test completed',
        'results' => $results
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Test failed',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}

