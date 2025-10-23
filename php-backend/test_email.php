<?php
/**
 * Test Email Configuration
 * Access this file directly to test email sending
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/helpers.php';

// Get test email from query parameter or use default
$testEmail = $_GET['email'] ?? 'info@upgradenow.in';

echo "<!DOCTYPE html><html><head><title>Email Test</title></head><body>";
echo "<h1>🧪 Email Configuration Test</h1>";

echo "<h2>Email Settings:</h2>";
echo "<ul>";
echo "<li>SMTP Host: " . SMTP_HOST . "</li>";
echo "<li>SMTP Port: " . SMTP_PORT . "</li>";
echo "<li>SMTP Username: " . SMTP_USERNAME . "</li>";
echo "<li>From Email: " . FROM_EMAIL . "</li>";
echo "<li>From Name: " . FROM_NAME . "</li>";
echo "</ul>";

echo "<h2>Sending Test Email to: $testEmail</h2>";

// Send test email
$subject = "Test Email from SK Bakers";
$body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>
<body style='font-family: Arial, sans-serif; padding: 20px;'>
    <h1>🎂 Test Email</h1>
    <p>This is a test email from your SK Bakers e-commerce platform.</p>
    <p>If you received this email, your email configuration is working correctly!</p>
    <p><strong>Configuration Details:</strong></p>
    <ul>
        <li>SMTP Host: " . SMTP_HOST . "</li>
        <li>SMTP Port: " . SMTP_PORT . "</li>
        <li>From: " . FROM_NAME . " &lt;" . FROM_EMAIL . "&gt;</li>
    </ul>
    <p>Sent at: " . date('Y-m-d H:i:s') . "</p>
</body>
</html>";

$result = sendEmail($testEmail, $subject, $body, true);

if ($result) {
    echo "<div style='background: #d1fae5; border: 2px solid #065f46; color: #065f46; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3>✅ Email Sent Successfully!</h3>";
    echo "<p>Check the inbox of <strong>$testEmail</strong></p>";
    echo "<p><em>Note: Check spam/junk folder if you don't see it in inbox</em></p>";
    echo "</div>";
} else {
    echo "<div style='background: #fee2e2; border: 2px solid #991b1b; color: #991b1b; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3>❌ Email Failed to Send</h3>";
    echo "<p>Possible issues:</p>";
    echo "<ul>";
    echo "<li>SMTP credentials are incorrect</li>";
    echo "<li>SMTP server is blocking the connection</li>";
    echo "<li>PHP mail() function is not configured</li>";
    echo "<li>Firewall blocking SMTP port 587</li>";
    echo "</ul>";
    echo "<p>Check your PHP error logs for more details</p>";
    echo "</div>";
}

echo "<h2>📋 Troubleshooting Tips:</h2>";
echo "<ul>";
echo "<li>Verify SMTP credentials in <code>config/config.php</code></li>";
echo "<li>Check if port 587 is open on your server</li>";
echo "<li>Verify email password is correct (not expired)</li>";
echo "<li>Check PHP error logs at <code>logs/error.log</code></li>";
echo "<li>Make sure your hosting allows email sending</li>";
echo "</ul>";

echo "<hr>";
echo "<p><a href='?email=$testEmail'>Send Another Test Email</a></p>";
echo "<p><small>Change email: <code>test_email.php?email=your-email@example.com</code></small></p>";

echo "</body></html>";
?>
