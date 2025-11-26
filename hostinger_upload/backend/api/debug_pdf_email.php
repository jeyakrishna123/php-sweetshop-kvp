<?php
/**
 * Debug script for PDF email sending flow
 * This helps identify where the email sending process fails
 * 
 * Usage: Access via browser or curl
 * Example: https://skbakers.com/backend/api/debug_pdf_email.php?order_id=21
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/EmailService.php';

header('Content-Type: application/json');

$orderId = $_GET['order_id'] ?? null;

if (!$orderId) {
    echo json_encode([
        'success' => false,
        'message' => 'Order ID is required',
        'usage' => 'Add ?order_id=21 to the URL'
    ]);
    exit;
}

$db = Database::getInstance()->getConnection();
$debug = [];

try {
    // Step 1: Check if order exists
    $debug['step_1'] = 'Checking if order exists';
    $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found',
            'debug' => $debug
        ]);
        exit;
    }
    
    $debug['step_1_result'] = 'Order found: ' . json_encode([
        'id' => $order['id'],
        'user_id' => $order['user_id'] ?? 'N/A',
        'total_price' => $order['total_price'] ?? 'N/A'
    ]);
    
    // Step 2: Get customer email
    $debug['step_2'] = 'Getting customer email';
    $userStmt = $db->prepare("SELECT email, name FROM users WHERE id = ?");
    $userStmt->execute([$order['user_id']]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    $customerEmail = $user['email'] ?? null;
    $customerName = $user['name'] ?? 'Customer';
    
    if (!$customerEmail) {
        $debug['step_2_result'] = 'ERROR: Customer email not found';
        echo json_encode([
            'success' => false,
            'message' => 'Customer email not found',
            'debug' => $debug
        ]);
        exit;
    }
    
    $debug['step_2_result'] = "Customer email: $customerEmail, Name: $customerName";
    
    // Step 3: Check PHPMailer installation
    $debug['step_3'] = 'Checking PHPMailer installation';
    $phpmailerInstalled = class_exists('PHPMailer\PHPMailer\PHPMailer');
    $debug['step_3_result'] = $phpmailerInstalled ? 'PHPMailer is installed' : 'PHPMailer is NOT installed';
    
    if (!$phpmailerInstalled) {
        // Try to load it
        $possiblePaths = [
            __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php',
            __DIR__ . '/../vendor/autoload.php',
        ];
        
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                require_once $path;
                if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                    $phpmailerInstalled = true;
                    $debug['step_3_result'] .= " - Loaded from: $path";
                    break;
                }
            }
        }
    }
    
    // Step 4: Check SMTP configuration
    $debug['step_4'] = 'Checking SMTP configuration';
    $smtpConfig = [
        'host' => defined('SMTP_HOST') ? SMTP_HOST : 'NOT SET',
        'port' => defined('SMTP_PORT') ? SMTP_PORT : 'NOT SET',
        'username' => defined('SMTP_USERNAME') ? (empty(SMTP_USERNAME) ? 'EMPTY' : 'SET') : 'NOT SET',
        'password' => defined('SMTP_PASSWORD') ? (empty(SMTP_PASSWORD) ? 'EMPTY' : 'SET') : 'NOT SET',
        'from_email' => defined('FROM_EMAIL') ? FROM_EMAIL : 'NOT SET',
        'from_name' => defined('FROM_NAME') ? FROM_NAME : 'NOT SET'
    ];
    $debug['step_4_result'] = $smtpConfig;
    
    // Step 5: Test EmailService initialization
    $debug['step_5'] = 'Testing EmailService initialization';
    try {
        $emailService = new EmailService();
        $debug['step_5_result'] = 'EmailService initialized successfully';
        $debug['step_5_phpmailer_available'] = $emailService->isPHPMailerAvailable();
    } catch (Exception $e) {
        $debug['step_5_result'] = 'ERROR: ' . $e->getMessage();
    }
    
    // Step 6: Test sending a simple email (without PDF)
    $debug['step_6'] = 'Testing simple email send (without PDF)';
    try {
        $testSubject = "Test Email - Order #$orderId";
        $testBody = "<p>This is a test email for order #$orderId</p>";
        $testResult = $emailService->sendEmail($customerEmail, $testSubject, $testBody, true);
        $debug['step_6_result'] = $testResult ? 'Simple email sent successfully' : 'Simple email failed';
        $debug['step_6_error'] = $emailService->getLastError();
    } catch (Exception $e) {
        $debug['step_6_result'] = 'ERROR: ' . $e->getMessage();
    }
    
    // Step 7: Test PDF attachment (create a dummy PDF)
    $debug['step_7'] = 'Testing PDF attachment';
    try {
        // Create a minimal PDF for testing
        $testPdfBase64 = base64_encode('%PDF-1.4
1 0 obj
<<
/Type /Catalog
>>
endobj
xref
0 1
trailer
<<
/Root 1 0 R
>>
%%EOF');
        
        $testResult = $emailService->sendEmailWithAttachment(
            $customerEmail,
            "Test PDF Email - Order #$orderId",
            "<p>This is a test email with PDF attachment for order #$orderId</p>",
            $testPdfBase64,
            'test.pdf',
            true
        );
        $debug['step_7_result'] = $testResult ? 'PDF email sent successfully' : 'PDF email failed';
        $debug['step_7_error'] = $emailService->getLastError();
    } catch (Exception $e) {
        $debug['step_7_result'] = 'ERROR: ' . $e->getMessage();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Debug completed',
        'debug' => $debug,
        'summary' => [
            'order_exists' => true,
            'customer_email' => $customerEmail,
            'phpmailer_installed' => $phpmailerInstalled,
            'smtp_configured' => $smtpConfig['host'] !== 'NOT SET' && $smtpConfig['username'] !== 'NOT SET',
            'simple_email_works' => $debug['step_6_result'] ?? 'Not tested',
            'pdf_email_works' => $debug['step_7_result'] ?? 'Not tested'
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Debug failed: ' . $e->getMessage(),
        'debug' => $debug,
        'error' => [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ], JSON_PRETTY_PRINT);
}

