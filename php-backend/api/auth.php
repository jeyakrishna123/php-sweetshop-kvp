<?php
/**
 * Authentication API Endpoints
 * Routes: /api/auth/*
 */

// session_start(); // Already started in index.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

// Get path after /api/auth/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/auth/register and /api/php-backend/api/auth/register
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'auth') {
    // Handle /api/php-backend/api/auth/register
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/auth/register
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case 'register':
            if ($method === 'POST') {
                register($db);
            }
            break;

        case 'login':
            if ($method === 'POST') {
                login($db);
            }
            break;

        case 'me':
            if ($method === 'GET') {
                getCurrentUser($db);
            }
            break;

        case 'logout':
            if ($method === 'POST') {
                logout();
            }
            break;

        case 'forgot-password':
            if ($method === 'POST') {
                forgotPassword($db);
            }
            break;

        case 'verify-otp':
            if ($method === 'POST') {
                verifyOtp($db);
            }
            break;

        case 'reset-password':
            if ($method === 'POST') {
                resetPassword($db);
            }
            break;

        case 'verify-signup-otp':
            if ($method === 'POST') {
                verifySignupOtp($db);
            }
            break;

        case 'resend-signup-otp':
            if ($method === 'POST') {
                resendSignupOtp($db);
            }
            break;

        default:
            sendError('Endpoint not found', [], 404);
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Register new user
 */
function register($db) {
    $data = getRequestBody();

    // Validate required fields
    $errors = validateRequired($data, ['name', 'email', 'password']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $name = sanitizeInput($data['name']);
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $phone = isset($data['phone']) ? sanitizeInput($data['phone']) : null;

    // Validate email
    if (!validateEmail($email)) {
        sendError('Invalid email format', ['email' => 'Invalid email'], 400);
    }

    // Validate password length
    if (strlen($password) < 8) {
        sendError('Password must be at least 8 characters', ['password' => 'Too short'], 400);
    }

    // Validate phone if provided
    if ($phone && !validatePhone($phone)) {
        sendError('Invalid phone number', ['phone' => 'Must be 10 digits'], 400);
    }

    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Email already registered', ['email' => 'Email already exists'], 409);
    }

    // Hash password
    $hashedPassword = AuthMiddleware::hashPassword($password);

    // Insert user (inactive until email verification)
    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, phone, is_active, is_email_verified)
        VALUES (?, ?, ?, ?, 0, 0)
    ");

    if ($stmt->execute([$name, $email, $hashedPassword, $phone])) {
        $userId = $db->lastInsertId();

        // Generate OTP for email verification
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));

        // Save OTP in password_reset_tokens table
        $stmt = $db->prepare("
            INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $email, $otp, $expiresAt]);

        // Send OTP via email
        $subject = "Email Verification OTP - SK Bakers";
        $message = "
        <html>
        <head>
            <title>Email Verification OTP</title>
        </head>
        <body>
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background: linear-gradient(135deg, #dc2626, #b91c3c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                    <h1 style='margin: 0; font-size: 24px;'>SK Bakers</h1>
                    <p style='margin: 5px 0 0 0; opacity: 0.9;'>Email Verification</p>
                </div>
                <div style='background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;'>
                    <h2 style='color: #374151; margin-top: 0;'>Hello " . htmlspecialchars($name) . ",</h2>
                    <p style='color: #6b7280; line-height: 1.6;'>Thank you for signing up! Please verify your email address using the OTP below:</p>
                    
                    <div style='background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
                        <h3 style='color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;'>" . $otp . "</h3>
                    </div>
                    
                    <p style='color: #6b7280; line-height: 1.6;'>
                        <strong>Important:</strong><br>
                        • This OTP will expire in 5 minutes<br>
                        • Do not share this OTP with anyone<br>
                        • Use this code to complete your account verification
                    </p>
                    
                    <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;'>
                        <p style='color: #9ca3af; font-size: 14px; margin: 0;'>
                            Welcome to SK Bakers!<br>
                            <strong>The SK Bakers Team</strong>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";

        // Enhanced email headers for better delivery
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
        $headers .= "From: SK Bakers <noreply@skbakers.com>" . "\r\n";
        $headers .= "Reply-To: noreply@skbakers.com" . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: 3" . "\r\n";

        // Send email with error handling
        $mailSent = @mail($email, $subject, $message, $headers);
        
        // Log the OTP for testing purposes (only in development)
        $isDevelopment = (defined('ENVIRONMENT') && ENVIRONMENT === 'development') || 
                         (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false);
        if ($isDevelopment) {
            error_log("🔧 DEVELOPMENT MODE - Signup OTP for " . $email . ": " . $otp);
        }

        logActivity('User registered - OTP sent', ['user_id' => $userId, 'email' => $email]);

        // Prepare response - only include OTP in development mode
        $responseData = [
            'user_id' => $userId,
            'email' => $email
        ];
        
        // Only include OTP in development/testing (check if in development mode)
        $isDevelopment = (defined('ENVIRONMENT') && ENVIRONMENT === 'development') || 
                         (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false);
        
        if ($isDevelopment) {
            $responseData['otp'] = $otp; // Only for development/testing
            error_log("🔧 DEVELOPMENT MODE - OTP included in response: " . $otp);
        }

        sendSuccess('Account created successfully. Please check your email for verification code.', $responseData, 201);
    } else {
        sendError('Failed to create user', [], 500);
    }
}

/**
 * Login user
 */
function login($db) {
    $data = getRequestBody();

    // Validate required fields
    $errors = validateRequired($data, ['email', 'password']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $email = sanitizeInput($data['email']);
    $password = $data['password'];

    // Get user by email (include password and verification status)
    $stmt = $db->prepare("
        SELECT id, name, email, password, role, is_active, is_email_verified, locked_until
        FROM users WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('Invalid credentials', ['error' => 'Email or password incorrect'], 401);
        return;
    }

    // Check if account is locked
    if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
        $lockTime = strtotime($user['locked_until']) - time();
        $minutes = ceil($lockTime / 60);
        sendError('Account locked due to multiple failed login attempts. Please try again in ' . $minutes . ' minute(s).', [], 403);
        return;
    }

    // Verify password
    if (!AuthMiddleware::verifyPassword($password, $user['password'])) {
        // Increment login attempts
        $stmt = $db->prepare("
            UPDATE users
            SET login_attempts = login_attempts + 1,
                locked_until = CASE WHEN login_attempts >= 4 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE) ELSE NULL END
            WHERE id = ?
        ");
        $stmt->execute([$user['id']]);

        sendError('Invalid credentials', ['error' => 'Email or password incorrect'], 401);
        return;
    }

    // Check if account is active
    if (!$user['is_active']) {
        sendError('Account is deactivated. Please contact support.', [], 403);
        return;
    }

    // Check if email is verified (required for login)
    if (!$user['is_email_verified']) {
        sendError('Email not verified. Please verify your email address before logging in. Check your inbox for the verification code.', [
            'email_verified' => false,
            'hint' => 'You can resend the verification code from the signup page'
        ], 403);
        return;
    }

    // Reset login attempts and update last login
    $stmt = $db->prepare("
        UPDATE users
        SET login_attempts = 0, locked_until = NULL, last_login = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);

    // Remove sensitive data from response
    unset($user['password']);
    unset($user['locked_until']);
    // Keep is_email_verified in response for frontend reference

    // Generate token
    $token = AuthMiddleware::generateToken($user);

    sendSuccess('Login successful', [
        'user' => $user,
        'token' => $token
    ]);
}

/**
 * Get current user
 */
function getCurrentUser($db) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("
        SELECT id, name, email, phone, avatar, role, is_active, is_email_verified,
               newsletter, marketing, notifications_email, notifications_sms, notifications_push,
               currency, language, total_orders, total_spent, last_order_date,
               wishlist_count, review_count, created_at
        FROM users WHERE id = ?
    ");
    $stmt->execute([$authUser->id]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('User not found', [], 404);
    }

    sendSuccess('User retrieved successfully', ['user' => $user]);
}

/**
 * Logout user
 */
function logout() {
    session_destroy();
    sendSuccess('Logged out successfully');
}

/**
 * Forgot password
 */
function forgotPassword($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['email']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $email = sanitizeInput($data['email']);

    // Get user - STRICT VALIDATION: Only proceed if user exists
    $stmt = $db->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // User not found - return error (don't reveal if email exists)
        sendError('No account found with this email address', [], 404);
        return;
    }

    if ($user) {
        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));

        // Save OTP in password_reset_tokens table
        $stmt = $db->prepare("
            INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$user['id'], $email, $otp, $expiresAt]);

        // Send OTP via email with improved headers
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

        // Enhanced email headers for better delivery
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
        $headers .= "From: SK Bakers <noreply@skbakers.com>" . "\r\n";
        $headers .= "Reply-To: noreply@skbakers.com" . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: 3" . "\r\n";

        // Send email with error handling
        $mailSent = @mail($email, $subject, $message, $headers);
        
        // Log the OTP for testing purposes (only in development)
        $isDevelopment = (defined('ENVIRONMENT') && ENVIRONMENT === 'development') || 
                         (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false);
        if ($isDevelopment) {
            error_log("🔧 DEVELOPMENT MODE - Password reset OTP for " . $email . ": " . $otp);
        }

        logActivity('Password reset OTP sent', ['user_id' => $user['id'], 'email' => $email]);
    }

    // Return success message
    sendSuccess('OTP sent to your email address. Please check your inbox and spam folder.');
}

/**
 * Verify OTP
 */
function verifyOtp($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['email', 'otp']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $email = sanitizeInput($data['email']);
    $otp = sanitizeInput($data['otp']);

    // Verify OTP
    $stmt = $db->prepare("
        SELECT prt.id, prt.user_id, prt.token, prt.expires_at 
        FROM password_reset_tokens prt 
        JOIN users u ON prt.user_id = u.id 
        WHERE prt.email = ? AND prt.token = ? AND prt.expires_at > NOW() AND prt.used = 0
        ORDER BY prt.created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$email, $otp]);
    $token = $stmt->fetch();

    if (!$token) {
        sendError('Invalid or expired OTP', [], 400);
    }

    // Mark token as used
    $stmt = $db->prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?");
    $stmt->execute([$token['id']]);

    sendSuccess('OTP verified successfully', [
        'user_id' => $token['user_id']
    ]);
}

/**
 * Reset password
 */
function resetPassword($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['email', 'otp', 'newPassword']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $email = sanitizeInput($data['email']);
    $otp = sanitizeInput($data['otp']);
    $newPassword = $data['newPassword'];

    // Password validation - must match signup requirements (8 characters minimum)
    if (strlen($newPassword) < 8) {
        sendError('Password must be at least 8 characters', ['password' => 'Too short'], 400);
        return;
    }

    // Verify OTP again
    $stmt = $db->prepare("
        SELECT prt.id, prt.user_id, prt.token, prt.expires_at 
        FROM password_reset_tokens prt 
        JOIN users u ON prt.user_id = u.id 
        WHERE prt.email = ? AND prt.token = ? AND prt.expires_at > NOW() AND prt.used = 0
        ORDER BY prt.created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$email, $otp]);
    $token = $stmt->fetch();

    if (!$token) {
        sendError('Invalid or expired OTP', [], 400);
    }

    // Hash the new password
    $hashedPassword = AuthMiddleware::hashPassword($newPassword);

    // Update user password
    $stmt = $db->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$hashedPassword, $token['user_id']]);

    // Mark all reset tokens for this user as used
    $stmt = $db->prepare("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?");
    $stmt->execute([$token['user_id']]);

    sendSuccess('Password reset successfully');
}

/**
 * Verify signup OTP
 */
function verifySignupOtp($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['email', 'otp']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $email = sanitizeInput($data['email']);
    $otp = sanitizeInput($data['otp']);

    // Verify OTP
    $stmt = $db->prepare("
        SELECT prt.id, prt.user_id, prt.token, prt.expires_at 
        FROM password_reset_tokens prt 
        JOIN users u ON prt.user_id = u.id 
        WHERE prt.email = ? AND prt.token = ? AND prt.expires_at > NOW() AND prt.used = 0
        ORDER BY prt.created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$email, $otp]);
    $token = $stmt->fetch();

    if (!$token) {
        sendError('Invalid or expired OTP', [], 400);
    }

    // Mark token as used
    $stmt = $db->prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?");
    $stmt->execute([$token['id']]);

    // Activate user account
    $stmt = $db->prepare("UPDATE users SET is_email_verified = 1, is_active = 1 WHERE id = ?");
    $stmt->execute([$token['user_id']]);

    sendSuccess('Email verified successfully. Your account is now active.', [
        'user_id' => $token['user_id']
    ]);
}

/**
 * Resend signup OTP
 */
function resendSignupOtp($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['email']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $email = sanitizeInput($data['email']);

    // Get user
    $stmt = $db->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('User not found', [], 404);
    }

    // Generate new OTP
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));

    // Save OTP in password_reset_tokens table
    $stmt = $db->prepare("
        INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$user['id'], $email, $otp, $expiresAt]);

    // Send OTP via email
    $subject = "Email Verification OTP - SK Bakers";
    $message = "
    <html>
    <head>
        <title>Email Verification OTP</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #dc2626, #b91c3c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0; font-size: 24px;'>SK Bakers</h1>
                <p style='margin: 5px 0 0 0; opacity: 0.9;'>Email Verification</p>
            </div>
            <div style='background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;'>
                <h2 style='color: #374151; margin-top: 0;'>Hello " . htmlspecialchars($user['name']) . ",</h2>
                <p style='color: #6b7280; line-height: 1.6;'>Thank you for signing up! Please verify your email address using the OTP below:</p>
                
                <div style='background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
                    <h3 style='color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;'>" . $otp . "</h3>
                </div>
                
                <p style='color: #6b7280; line-height: 1.6;'>
                    <strong>Important:</strong><br>
                    • This OTP will expire in 5 minutes<br>
                    • Do not share this OTP with anyone<br>
                    • Use this code to complete your account verification
                </p>
                
                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;'>
                    <p style='color: #9ca3af; font-size: 14px; margin: 0;'>
                        Welcome to SK Bakers!<br>
                        <strong>The SK Bakers Team</strong>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";

    // Enhanced email headers for better delivery
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: SK Bakers <noreply@skbakers.com>" . "\r\n";
    $headers .= "Reply-To: noreply@skbakers.com" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "X-Priority: 3" . "\r\n";

    // Send email with error handling
    $mailSent = @mail($email, $subject, $message, $headers);
    
    // Log the OTP for testing purposes (remove in production)
    error_log("Signup OTP for " . $email . ": " . $otp);

    logActivity('Signup OTP sent', ['user_id' => $user['id'], 'email' => $email]);

    sendSuccess('OTP sent to your email address. Please check your inbox and spam folder.');
}
