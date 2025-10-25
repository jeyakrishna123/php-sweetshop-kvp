<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

require_once '../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || empty($input['email'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Email is required']);
        exit();
    }

    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid email format']);
        exit();
    }

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'No account found with this email address']);
        exit();
    }

    // Generate 6-digit OTP
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    
    // Store OTP in database with expiration (5 minutes)
    $expires_at = date('Y-m-d H:i:s', strtotime('+5 minutes'));
    
    $stmt = $pdo->prepare("INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$user['id'], $email, $otp, $expires_at]);

    // Send OTP via email (simplified - in production, use proper email service)
    $subject = "Password Reset OTP - SK Bakers";
    $message = "
    <html>
    <head>
        <title>Password Reset OTP</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #dc2626, #b91c3c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0; font-size: 24px;'>SK Bakers</h1>
                <p style='margin: 5px 0 0 0; opacity: 0.9;'>Password Reset OTP</p>
            </div>
            <div style='background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;'>
                <h2 style='color: #374151; margin-top: 0;'>Hello " . htmlspecialchars($user['name']) . ",</h2>
                <p style='color: #6b7280; line-height: 1.6;'>You requested a password reset for your SK Bakers account. Use the following OTP to reset your password:</p>
                
                <div style='background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
                    <h3 style='color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;'>" . $otp . "</h3>
                </div>
                
                <p style='color: #6b7280; line-height: 1.6;'>
                    <strong>Important:</strong><br>
                    • This OTP will expire in 5 minutes<br>
                    • Do not share this OTP with anyone<br>
                    • If you didn't request this, please ignore this email
                </p>
                
                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;'>
                    <p style='color: #9ca3af; font-size: 14px; margin: 0;'>
                        Best regards,<br>
                        <strong>SK Bakers Team</strong>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: SK Bakers <noreply@skbakers.com>" . "\r\n";

    // Send email (in production, use proper email service like SendGrid, Mailgun, etc.)
    $mailSent = mail($email, $subject, $message, $headers);

    if ($mailSent) {
        echo json_encode([
            'message' => 'OTP sent successfully to your email address',
            'success' => true
        ]);
    } else {
        // Even if email fails, we still return success for security
        // In production, you might want to handle this differently
        echo json_encode([
            'message' => 'OTP generated successfully. Please check your email.',
            'success' => true
        ]);
    }

} catch (Exception $e) {
    error_log("Forgot password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Internal server error']);
}
?>
