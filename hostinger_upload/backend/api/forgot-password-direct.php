<?php
/**
 * DIRECT FORGOT PASSWORD ENDPOINT
 * Standalone version that bypasses routing issues
 * URL: /api/forgot-password-direct.php
 * 
 * This is a backup/simplified version to ensure it works
 */

// Set headers FIRST - CRITICAL
@header('Content-Type: application/json; charset=utf-8');
@header('Access-Control-Allow-Origin: *');
@header('Access-Control-Allow-Methods: POST, OPTIONS');
@header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start output buffering
@ob_start();

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    @ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Load required files
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../config/config.php';
    require_once __DIR__ . '/../includes/helpers.php';
    
    // Try to load EmailService (non-fatal)
    $emailServiceAvailable = false;
    if (file_exists(__DIR__ . '/../includes/EmailService.php')) {
        try {
            require_once __DIR__ . '/../includes/EmailService.php';
            $emailServiceAvailable = class_exists('EmailService');
        } catch (Throwable $e) {
            error_log("⚠️ FORGOT PASSWORD DIRECT - EmailService load failed: " . $e->getMessage());
        }
    }
    
    // Get database connection
    $db = Database::getInstance()->getConnection();
    if (!$db || !is_object($db)) {
        throw new Exception("Database connection failed");
    }
    
    // Get request data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (empty($data) || !isset($data['email']) || empty(trim($data['email']))) {
        @ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email address is required'
        ]);
        exit;
    }
    
    $email = trim($data['email']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        @ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format'
        ]);
        exit;
    }
    
    // Check if user exists
    $stmt = $db->prepare("SELECT id, name, email, is_active FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !isset($user['id'])) {
        // Don't reveal if email exists
        @ob_clean();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'If an account exists with this email, you will receive an OTP shortly.',
            'data' => [
                'email_sent' => false,
                'email' => $email
            ]
        ]);
        exit;
    }
    
    // Check if active
    if (isset($user['is_active']) && $user['is_active'] == 0) {
        @ob_clean();
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Account is deactivated'
        ]);
        exit;
    }
    
    // Create table if needed
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            used TINYINT(1) DEFAULT 0,
            INDEX idx_email_token (email, token),
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Exception $e) {
        // Table might already exist, continue
    }
    
    // Invalidate old OTPs
    try {
        $stmt = $db->prepare("UPDATE password_reset_tokens SET used = 1 WHERE email = ? AND used = 0");
        $stmt->execute([$email]);
    } catch (Exception $e) {
        // Continue anyway
    }
    
    // Generate OTP
    $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', time() + 300);
    
    // Store OTP
    $stmt = $db->prepare("INSERT INTO password_reset_tokens (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user['id'], $email, $otp, $expiresAt]);
    
    // Send email
    $mailSent = false;
    $subject = "Password Reset OTP - SK Bakers";
    $userName = !empty($user['name']) ? htmlspecialchars($user['name']) : $email;
    $message = "<h2>Password Reset Request</h2><p>Hello $userName,</p><p>Your OTP: <strong style='font-size:24px'>$otp</strong></p><p>Expires in 5 minutes.</p>";
    
    if ($emailServiceAvailable) {
        try {
            $emailService = new EmailService();
            $mailSent = $emailService->sendEmail($email, $subject, $message, true);
        } catch (Throwable $e) {
            error_log("EmailService failed: " . $e->getMessage());
        }
    }
    
    // Fallback to basic mail
    if (!$mailSent) {
        $headers = "MIME-Version: 1.0\r\nFrom: SK Bakers <noreply@skbakers.com>\r\nContent-Type: text/html; charset=UTF-8\r\n";
        $mailSent = @mail($email, $subject, $message, $headers);
    }
    
    @ob_clean();
    
    if ($mailSent) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'OTP sent to your email address',
            'data' => [
                'otp_sent' => true,
                'email' => $email,
                'expires_in' => '5 minutes'
            ]
        ]);
    } else {
        // Delete OTP if email failed
        try {
            $stmt = $db->prepare("DELETE FROM password_reset_tokens WHERE email = ? AND token = ?");
            $stmt->execute([$email, $otp]);
        } catch (Exception $e) {
            // Ignore
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'message' => 'Unable to send email. Please try again later.',
            'data' => [
                'otp_sent' => false,
                'email' => $email
            ]
        ]);
    }
    
} catch (Throwable $e) {
    @ob_clean();
    error_log("❌ FORGOT PASSWORD DIRECT - Error: " . $e->getMessage());
    error_log("❌ FORGOT PASSWORD DIRECT - File: " . $e->getFile() . ", Line: " . $e->getLine());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again.',
        'error_code' => 'SERVER_ERROR'
    ]);
}

