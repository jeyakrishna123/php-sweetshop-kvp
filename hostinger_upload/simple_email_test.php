<?php
// Simple email test
echo "Testing email configuration...\n";

// Test basic mail function
$to = 'jeyakrishna402@gmail.com';
$subject = 'SK Bakers - Simple Test';
$message = 'This is a simple test email from SK Bakers.';
$headers = "From: SK Bakers <noreply@skbakers.com>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

echo "Sending test email to: $to\n";

if (mail($to, $subject, $message, $headers)) {
    echo "✅ Email sent successfully!\n";
} else {
    echo "❌ Email failed to send\n";
    echo "Error: " . error_get_last()['message'] . "\n";
}
?>
