<?php
/**
 * Test endpoint to verify email sending functionality
 * Access: https://skbakers.com/backend/test_email_endpoint.php
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/ErrorHandler.php';
ErrorHandler::init();

header('Content-Type: application/json; charset=utf-8');

// Simple authentication check (for testing only)
$testToken = $_GET['token'] ?? '';
$expectedToken = 'test_email_123'; // Change this for security

if ($testToken !== $expectedToken) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Use ?token=test_email_123',
        'note' => 'This is a test endpoint - remove in production'
    ]);
    exit;
}

try {
    // Test 1: Check EmailService class
    require_once __DIR__ . '/includes/EmailService.php';
    $emailService = new EmailService();
    
    $results = [
        'test_1_emailservice_class' => class_exists('EmailService') ? 'PASS' : 'FAIL',
        'test_2_phpmailer_loaded' => class_exists('PHPMailer\PHPMailer\PHPMailer') ? 'PASS' : 'FAIL',
        'test_3_smtp_config' => [
            'host' => defined('SMTP_HOST') ? SMTP_HOST : 'NOT SET',
            'port' => defined('SMTP_PORT') ? SMTP_PORT : 'NOT SET',
            'username' => defined('SMTP_USERNAME') ? (empty(SMTP_USERNAME) ? 'EMPTY' : 'SET') : 'NOT SET',
            'password' => defined('SMTP_PASSWORD') ? (empty(SMTP_PASSWORD) ? 'EMPTY' : 'SET') : 'NOT SET',
            'from_email' => defined('FROM_EMAIL') ? FROM_EMAIL : 'NOT SET',
        ],
        'test_4_php_settings' => [
            'max_execution_time' => ini_get('max_execution_time'),
            'memory_limit' => ini_get('memory_limit'),
            'post_max_size' => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
        ],
        'test_5_emailservice_methods' => [
            'sendEmail' => method_exists($emailService, 'sendEmail') ? 'EXISTS' : 'MISSING',
            'sendEmailWithAttachment' => method_exists($emailService, 'sendEmailWithAttachment') ? 'EXISTS' : 'MISSING',
            'getLastError' => method_exists($emailService, 'getLastError') ? 'EXISTS' : 'MISSING',
        ],
    ];
    
    // Test 6: Try to send a test email (optional - uncomment to test)
    $testEmail = $_GET['test_email'] ?? '';
    if (!empty($testEmail) && filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
        $testSubject = 'Test Email from SK Bakers';
        $testMessage = '<h1>Test Email</h1><p>This is a test email from the SK Bakers system.</p>';
        
        $emailSent = $emailService->sendEmail($testEmail, $testSubject, $testMessage, true);
        $lastError = $emailService->getLastError();
        
        $results['test_6_send_test_email'] = [
            'email' => $testEmail,
            'sent' => $emailSent ? 'SUCCESS' : 'FAILED',
            'error' => $lastError ?? 'No error',
        ];
    } else {
        $results['test_6_send_test_email'] = 'SKIPPED (add ?test_email=your@email.com to test)';
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Email endpoint test completed',
        'results' => $results,
        'timestamp' => date('Y-m-d H:i:s'),
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Test failed',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ], JSON_PRETTY_PRINT);
}

