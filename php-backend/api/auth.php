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

        case 'reset-password':
            if ($method === 'POST') {
                resetPassword($db);
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

    // Insert user
    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, phone, is_active, is_email_verified)
        VALUES (?, ?, ?, ?, 1, 0)
    ");

    if ($stmt->execute([$name, $email, $hashedPassword, $phone])) {
        $userId = $db->lastInsertId();

        // Get user data
        $stmt = $db->prepare("SELECT id, name, email, role, is_active FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        // Generate token
        $token = AuthMiddleware::generateToken($user);

        sendSuccess('User registered successfully', [
            'user' => $user,
            'token' => $token
        ], 201);
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

    // Get user by email (include password)
    $stmt = $db->prepare("
        SELECT id, name, email, password, role, is_active, locked_until
        FROM users WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('Invalid credentials', ['error' => 'Email or password incorrect'], 401);
    }

    // Check if account is locked
    if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
        sendError('Account locked due to multiple failed login attempts', [], 403);
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
    }

    // Check if account is active
    if (!$user['is_active']) {
        sendError('Account is deactivated', [], 403);
    }

    // Reset login attempts and update last login
    $stmt = $db->prepare("
        UPDATE users
        SET login_attempts = 0, locked_until = NULL, last_login = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);

    // Remove password from response
    unset($user['password']);
    unset($user['locked_until']);

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

    // Get user
    $stmt = $db->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Generate reset token
        $resetToken = AuthMiddleware::generateResetToken();
        $hashedToken = AuthMiddleware::hashResetToken($resetToken);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Save token
        $stmt = $db->prepare("
            UPDATE users
            SET password_reset_token = ?, password_reset_expires = ?
            WHERE id = ?
        ");
        $stmt->execute([$hashedToken, $expiresAt, $user['id']]);

        // TODO: Send email with reset link
        // For now, just return success
        logActivity('Password reset requested', ['user_id' => $user['id'], 'email' => $email]);
    }

    // Always return success (security best practice)
    sendSuccess('If email exists, password reset link has been sent');
}

/**
 * Reset password
 */
function resetPassword($db) {
    $data = getRequestBody();

    $errors = validateRequired($data, ['token', 'password']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $token = $data['token'];
    $newPassword = $data['password'];

    if (strlen($newPassword) < 8) {
        sendError('Password must be at least 8 characters', [], 400);
    }

    // Hash the token to compare
    $hashedToken = AuthMiddleware::hashResetToken($token);

    // Find user with valid token
    $stmt = $db->prepare("
        SELECT id FROM users
        WHERE password_reset_token = ?
        AND password_reset_expires > NOW()
    ");
    $stmt->execute([$hashedToken]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('Invalid or expired reset token', [], 400);
    }

    // Update password
    $hashedPassword = AuthMiddleware::hashPassword($newPassword);
    $stmt = $db->prepare("
        UPDATE users
        SET password = ?, password_reset_token = NULL, password_reset_expires = NULL
        WHERE id = ?
    ");

    if ($stmt->execute([$hashedPassword, $user['id']])) {
        sendSuccess('Password reset successfully');
    } else {
        sendError('Failed to reset password', [], 500);
    }
}
