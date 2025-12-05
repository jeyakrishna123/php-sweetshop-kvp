<?php
/**
 * Test Email Functionality
 * This script tests the order status email sending functionality
 */

// Set error reporting for testing
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load required files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/helpers.php';

echo "========================================\n";
echo "📧 EMAIL FUNCTIONALITY TEST\n";
echo "========================================\n\n";

// Test 1: Check SMTP Configuration
echo "1. Checking SMTP Configuration...\n";
echo "   SMTP Host: " . (defined('SMTP_HOST') ? SMTP_HOST : 'NOT DEFINED') . "\n";
echo "   SMTP Port: " . (defined('SMTP_PORT') ? SMTP_PORT : 'NOT DEFINED') . "\n";
echo "   SMTP Username: " . (defined('SMTP_USERNAME') ? SMTP_USERNAME : 'NOT DEFINED') . "\n";
echo "   SMTP Password: " . (defined('SMTP_PASSWORD') ? (strlen(SMTP_PASSWORD) > 0 ? '***SET***' : 'NOT SET') : 'NOT DEFINED') . "\n";
echo "   From Email: " . (defined('FROM_EMAIL') ? FROM_EMAIL : 'NOT DEFINED') . "\n";
echo "   From Name: " . (defined('FROM_NAME') ? FROM_NAME : 'NOT DEFINED') . "\n\n";

// Test 2: Check if SimpleMailer exists
echo "2. Checking SimpleMailer class...\n";
if (file_exists(__DIR__ . '/includes/SimpleMailer.php')) {
    require_once __DIR__ . '/includes/SimpleMailer.php';
    if (class_exists('SimpleMailer')) {
        echo "   ✅ SimpleMailer class loaded successfully\n\n";
    } else {
        echo "   ❌ SimpleMailer class not found\n\n";
        exit(1);
    }
} else {
    echo "   ❌ SimpleMailer.php file not found\n\n";
    exit(1);
}

// Test 3: Test sendEmail function
echo "3. Testing sendEmail() function...\n";
if (!function_exists('sendEmail')) {
    echo "   ❌ sendEmail() function not found\n\n";
    exit(1);
}
echo "   ✅ sendEmail() function exists\n\n";

// Test 4: Test sendOrderStatusEmail function
echo "4. Testing sendOrderStatusEmail() function...\n";
if (!function_exists('sendOrderStatusEmail')) {
    echo "   ❌ sendOrderStatusEmail() function not found\n\n";
    exit(1);
}
echo "   ✅ sendOrderStatusEmail() function exists\n\n";

// Test 5: Get test email from user or use default
echo "5. Email Test Setup...\n";
$testEmail = isset($argv[1]) ? $argv[1] : null;

if (!$testEmail) {
    echo "   Usage: php test_email.php <your-email@example.com>\n";
    echo "   Or enter email address: ";
    $handle = fopen("php://stdin", "r");
    $testEmail = trim(fgets($handle));
    fclose($handle);
}

if (empty($testEmail) || !filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
    echo "   ❌ Invalid email address: $testEmail\n\n";
    exit(1);
}

echo "   Test email address: $testEmail\n\n";

// Test 6: Send test order status email
echo "6. Sending test order status email...\n";
echo "   This will send a test email with order status 'shipped'\n\n";

try {
    $emailSent = sendOrderStatusEmail(
        $testEmail,
        'Test Customer',
        12345, // Test order ID
        'shipped',
        'TEST123456789' // Test tracking number
    );

    if ($emailSent) {
        echo "   ✅ Email sent successfully!\n";
        echo "   Check your inbox at: $testEmail\n";
        echo "   (Also check spam folder if not in inbox)\n\n";
    } else {
        echo "   ❌ Email sending failed\n";
        echo "   Check error logs for details\n\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error sending email: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n\n";
}

// Test 7: Test direct SMTP connection
echo "7. Testing direct SMTP connection...\n";
try {
    $mailer = new SimpleMailer(
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USERNAME,
        SMTP_PASSWORD,
        FROM_EMAIL,
        FROM_NAME
    );
    
    echo "   ✅ SimpleMailer instance created\n";
    echo "   Attempting to connect to SMTP server...\n";
    
    // Try to send a simple test email
    $testSubject = "Test Email from SK Bakers - " . date('Y-m-d H:i:s');
    $testBody = "<h2>Test Email</h2><p>This is a test email to verify SMTP configuration.</p><p>Time: " . date('Y-m-d H:i:s') . "</p>";
    
    $result = @$mailer->send($testEmail, $testSubject, $testBody, true);
    
    if ($result) {
        echo "   ✅ Direct SMTP test email sent successfully!\n\n";
    } else {
        $error = $mailer->getLastError();
        echo "   ❌ Direct SMTP test failed\n";
        echo "   Error: " . ($error ? $error : 'Unknown error') . "\n\n";
    }
} catch (Exception $e) {
    echo "   ❌ SMTP connection error: " . $e->getMessage() . "\n\n";
}

echo "========================================\n";
echo "✅ TEST COMPLETE\n";
echo "========================================\n";
echo "\nNext steps:\n";
echo "1. Check your email inbox: $testEmail\n";
echo "2. Check spam folder if email not found\n";
echo "3. Check server error logs for detailed errors\n";
echo "4. Verify SMTP credentials in config.php\n";
echo "\n";

