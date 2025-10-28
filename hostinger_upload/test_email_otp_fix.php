<?php
/**
 * Test Email OTP Fix
 * This script tests the email functionality with the new EmailService
 */

require_once 'backend/config/config.php';
require_once 'backend/includes/EmailService.php';

echo "<h2>🧪 Testing Email OTP Fix</h2>";

// Test email configuration
echo "<h3>📧 Email Configuration</h3>";
echo "<p><strong>SMTP Host:</strong> " . (defined('SMTP_HOST') ? SMTP_HOST : 'Not defined') . "</p>";
echo "<p><strong>SMTP Port:</strong> " . (defined('SMTP_PORT') ? SMTP_PORT : 'Not defined') . "</p>";
echo "<p><strong>From Email:</strong> " . (defined('FROM_EMAIL') ? FROM_EMAIL : 'Not defined') . "</p>";
echo "<p><strong>From Name:</strong> " . (defined('FROM_NAME') ? FROM_NAME : 'Not defined') . "</p>";

// Test email service
echo "<h3>🚀 Testing EmailService</h3>";

try {
    $emailService = new EmailService();
    echo "<p>✅ EmailService initialized successfully</p>";
    
    // Test email content
    $testEmail = 'jeyakrishna402@gmail.com';
    $subject = 'SK Bakers - OTP Test';
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    
    $message = "
    <html>
    <head>
        <title>OTP Test</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #dc2626, #b91c3c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0; font-size: 24px;'>SK Bakers</h1>
                <p style='margin: 5px 0 0 0; opacity: 0.9;'>Email OTP Test</p>
            </div>
            <div style='background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;'>
                <h2 style='color: #374151; margin-top: 0;'>Hello Test User,</h2>
                <p style='color: #6b7280; line-height: 1.6;'>This is a test email to verify OTP functionality.</p>
                
                <div style='background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
                    <h3 style='color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;'>$otp</h3>
                </div>
                
                <p style='color: #6b7280; line-height: 1.6;'>
                    <strong>Test Information:</strong><br>
                    • This is a test OTP<br>
                    • Email service is working correctly<br>
                    • OTP functionality has been fixed
                </p>
                
                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;'>
                    <p style='color: #9ca3af; font-size: 14px; margin: 0;'>
                        Best regards,<br>
                        <strong>SK Bakers Development Team</strong>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    echo "<p><strong>Test OTP:</strong> $otp</p>";
    echo "<p><strong>Sending to:</strong> $testEmail</p>";
    
    // Send test email
    $result = $emailService->sendEmail($testEmail, $subject, $message, true);
    
    if ($result) {
        echo "<div style='background: #d1fae5; border: 2px solid #065f46; color: #065f46; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
        echo "<h3>✅ Email Sent Successfully!</h3>";
        echo "<p>The email OTP functionality is working correctly.</p>";
        echo "<p>Check your inbox at: <strong>$testEmail</strong></p>";
        echo "<p>Test OTP: <strong>$otp</strong></p>";
        echo "</div>";
    } else {
        echo "<div style='background: #fee2e2; border: 2px solid #dc2626; color: #dc2626; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
        echo "<h3>❌ Email Failed to Send</h3>";
        echo "<p>The email service is still not working. Check the following:</p>";
        echo "<ul>";
        echo "<li>SMTP credentials are correct</li>";
        echo "<li>Hostinger email account is set up</li>";
        echo "<li>Email account password is correct</li>";
        echo "<li>Check PHP error logs for details</li>";
        echo "</ul>";
        echo "<p>Test OTP: <strong>$otp</strong></p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #fee2e2; border: 2px solid #dc2626; color: #dc2626; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3>❌ Error Testing Email Service</h3>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "<h3>📋 Next Steps</h3>";
echo "<ul>";
echo "<li>If email sent successfully, the OTP functionality should work in the application</li>";
echo "<li>If email failed, check Hostinger email configuration</li>";
echo "<li>Verify SMTP credentials in config.php</li>";
echo "<li>Test the actual OTP endpoints in the application</li>";
echo "</ul>";

echo "<h3>🔗 Test OTP Endpoints</h3>";
echo "<p>You can test the OTP endpoints using these URLs:</p>";
echo "<ul>";
echo "<li><strong>Signup OTP:</strong> POST to /api/auth/signup</li>";
echo "<li><strong>Forgot Password OTP:</strong> POST to /api/forgot-password</li>";
echo "<li><strong>Verify OTP:</strong> POST to /api/verify-otp</li>";
echo "<li><strong>Resend OTP:</strong> POST to /api/auth/resend-signup-otp</li>";
echo "</ul>";
?>
