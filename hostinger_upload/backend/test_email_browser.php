<?php
/**
 * Browser-Accessible Email Test
 * Access via: https://skbakers.com/backend/test_email_browser.php?email=your-email@example.com
 */

// Set error reporting for testing
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load required files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/helpers.php';

// Set content type to HTML
header('Content-Type: text/html; charset=UTF-8');

?>
<!DOCTYPE html>
<html>
<head>
    <title>Email Test - SK Bakers</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        .test-section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 5px; border-left: 4px solid #667eea; }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .info { color: #3b82f6; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="email"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
        button { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #5568d3; }
        .log { background: #1f2937; color: #10b981; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; margin-top: 20px; max-height: 400px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Email Functionality Test</h1>
        
        <?php
        $testEmail = $_GET['email'] ?? $_POST['email'] ?? null;
        
        if (!$testEmail) {
            // Show form
            ?>
            <div class="test-section">
                <h2>Enter Test Email Address</h2>
                <form method="GET" action="">
                    <div class="form-group">
                        <label for="email">Email Address:</label>
                        <input type="email" id="email" name="email" placeholder="your-email@example.com" required>
                    </div>
                    <button type="submit">Send Test Email</button>
                </form>
            </div>
            <?php
        } else {
            // Validate email
            if (!filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
                echo '<div class="test-section"><p class="error">❌ Invalid email address: ' . htmlspecialchars($testEmail) . '</p></div>';
                exit;
            }
            
            echo '<div class="test-section">';
            echo '<h2>Test Results</h2>';
            echo '<p><strong>Test Email:</strong> ' . htmlspecialchars($testEmail) . '</p>';
            echo '</div>';
            
            // Test 1: SMTP Configuration
            echo '<div class="test-section">';
            echo '<h3>1. SMTP Configuration</h3>';
            echo '<p>Host: <span class="info">' . (defined('SMTP_HOST') ? SMTP_HOST : 'NOT DEFINED') . '</span></p>';
            echo '<p>Port: <span class="info">' . (defined('SMTP_PORT') ? SMTP_PORT : 'NOT DEFINED') . '</span></p>';
            echo '<p>Username: <span class="info">' . (defined('SMTP_USERNAME') ? SMTP_USERNAME : 'NOT DEFINED') . '</span></p>';
            echo '<p>Password: <span class="info">' . (defined('SMTP_PASSWORD') && strlen(SMTP_PASSWORD) > 0 ? '***SET***' : 'NOT SET') . '</span></p>';
            echo '<p>From: <span class="info">' . (defined('FROM_EMAIL') ? FROM_EMAIL : 'NOT DEFINED') . '</span></p>';
            echo '</div>';
            
            // Test 2: Check SimpleMailer
            echo '<div class="test-section">';
            echo '<h3>2. SimpleMailer Class</h3>';
            if (file_exists(__DIR__ . '/includes/SimpleMailer.php')) {
                require_once __DIR__ . '/includes/SimpleMailer.php';
                if (class_exists('SimpleMailer')) {
                    echo '<p class="success">✅ SimpleMailer class loaded successfully</p>';
                } else {
                    echo '<p class="error">❌ SimpleMailer class not found</p>';
                }
            } else {
                echo '<p class="error">❌ SimpleMailer.php file not found</p>';
            }
            echo '</div>';
            
            // Test 3: Check functions
            echo '<div class="test-section">';
            echo '<h3>3. Email Functions</h3>';
            if (function_exists('sendEmail')) {
                echo '<p class="success">✅ sendEmail() function exists</p>';
            } else {
                echo '<p class="error">❌ sendEmail() function not found</p>';
            }
            
            if (function_exists('sendOrderStatusEmail')) {
                echo '<p class="success">✅ sendOrderStatusEmail() function exists</p>';
            } else {
                echo '<p class="error">❌ sendOrderStatusEmail() function not found</p>';
            }
            echo '</div>';
            
            // Test 4: Send test email
            echo '<div class="test-section">';
            echo '<h3>4. Sending Test Email</h3>';
            echo '<p>Sending order status email with:</p>';
            echo '<ul>';
            echo '<li>Order ID: 12345</li>';
            echo '<li>Status: shipped</li>';
            echo '<li>Tracking: TEST123456789</li>';
            echo '</ul>';
            
            try {
                $emailSent = sendOrderStatusEmail(
                    $testEmail,
                    'Test Customer',
                    12345,
                    'shipped',
                    'TEST123456789'
                );
                
                if ($emailSent) {
                    echo '<p class="success">✅ Email sent successfully!</p>';
                    echo '<p>Please check your inbox at: <strong>' . htmlspecialchars($testEmail) . '</strong></p>';
                    echo '<p class="info">💡 Also check your spam folder if the email is not in your inbox.</p>';
                } else {
                    echo '<p class="error">❌ Email sending failed</p>';
                    echo '<p>Check server error logs for details.</p>';
                }
            } catch (Exception $e) {
                echo '<p class="error">❌ Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<p>File: ' . htmlspecialchars($e->getFile()) . '</p>';
                echo '<p>Line: ' . $e->getLine() . '</p>';
            }
            echo '</div>';
            
            // Test 5: Direct SMTP test
            echo '<div class="test-section">';
            echo '<h3>5. Direct SMTP Connection Test</h3>';
            try {
                $mailer = new SimpleMailer(
                    SMTP_HOST,
                    SMTP_PORT,
                    SMTP_USERNAME,
                    SMTP_PASSWORD,
                    FROM_EMAIL,
                    FROM_NAME
                );
                
                echo '<p class="success">✅ SimpleMailer instance created</p>';
                
                $testSubject = "Direct SMTP Test - " . date('Y-m-d H:i:s');
                $testBody = "<h2>Direct SMTP Test</h2><p>This is a direct SMTP connection test.</p><p>Time: " . date('Y-m-d H:i:s') . "</p>";
                
                $result = @$mailer->send($testEmail, $testSubject, $testBody, true);
                
                if ($result) {
                    echo '<p class="success">✅ Direct SMTP test email sent successfully!</p>';
                } else {
                    $error = $mailer->getLastError();
                    echo '<p class="error">❌ Direct SMTP test failed</p>';
                    echo '<p>Error: ' . htmlspecialchars($error ? $error : 'Unknown error') . '</p>';
                }
            } catch (Exception $e) {
                echo '<p class="error">❌ SMTP connection error: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
            echo '</div>';
            
            echo '<div class="test-section">';
            echo '<h3>✅ Test Complete</h3>';
            echo '<p><strong>Next Steps:</strong></p>';
            echo '<ol>';
            echo '<li>Check your email inbox: <strong>' . htmlspecialchars($testEmail) . '</strong></li>';
            echo '<li>Check spam folder if email not found</li>';
            echo '<li>Verify SMTP credentials in config.php if email failed</li>';
            echo '<li>Check server error logs for detailed errors</li>';
            echo '</ol>';
            echo '</div>';
        }
        ?>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p><a href="?">← Run Another Test</a></p>
        </div>
    </div>
</body>
</html>

