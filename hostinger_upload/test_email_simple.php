<?php
// Simple email test for OTP
$to = 'jeyakrishna402@gmail.com';
$subject = 'SK Bakers - OTP Verification';
$otp = '864333'; // Use the OTP from console
$message = "Your OTP for SK Bakers is: $otp\n\nThis OTP is valid for 10 minutes.\n\nThank you for choosing SK Bakers!";

$headers = "From: SK Bakers <noreply@skbakers.com>\r\n";
$headers .= "Reply-To: noreply@skbakers.com\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo "✅ Email sent successfully to $to";
    echo "<br>OTP: $otp";
} else {
    echo "❌ Email failed to send";
    echo "<br>Use OTP: $otp";
}
?>
