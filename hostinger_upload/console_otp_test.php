<?php
/**
 * Console OTP Test
 */

require_once 'backend/config/config.php';
require_once 'backend/config/database.php';

echo "=== SK Bakers OTP Test ===\n\n";

// Test database connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    echo "✅ Database connection successful\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit;
}

// Test OTP generation
$otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
echo "✅ Generated OTP: $otp\n";

// Test email configuration
echo "📧 Email Configuration:\n";
echo "  SMTP Host: " . (defined('SMTP_HOST') ? SMTP_HOST : 'Not defined') . "\n";
echo "  SMTP Port: " . (defined('SMTP_PORT') ? SMTP_PORT : 'Not defined') . "\n";
echo "  From Email: " . (defined('FROM_EMAIL') ? FROM_EMAIL : 'Not defined') . "\n";

// Test basic mail function
echo "\n📤 Testing basic mail function...\n";
$to = 'test@example.com';
$subject = 'Test';
$message = 'Test message';
$headers = "From: noreply@skbakers.com\r\n";

if (@mail($to, $subject, $message, $headers)) {
    echo "✅ Basic mail function working\n";
} else {
    echo "❌ Basic mail function failed (expected in local development)\n";
    echo "   This is normal for local development without SMTP\n";
}

echo "\n=== Test Complete ===\n";
echo "For production deployment:\n";
echo "1. Ensure SMTP credentials are correct\n";
echo "2. Test with real email addresses\n";
echo "3. Check Hostinger email account setup\n";
?>
