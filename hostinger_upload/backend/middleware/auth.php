<?php
/**
 * Authentication Middleware
 * JWT-based authentication compatible with existing React frontend
 */

require_once __DIR__ . '/../vendor/jwt/JWT.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';

class AuthMiddleware {
    /**
     * Verify JWT token and authenticate user
     */
    public static function authenticate() {
        $token = getBearerToken();

        if (!$token) {
            sendError('Authentication required. No token provided', [], 401);
            exit;
        }

        try {
            $decoded = JWT::decode($token, JWT_SECRET);

            // Store user info in session/globals for easy access
            $_SESSION['user_id'] = $decoded->id;
            $_SESSION['email'] = $decoded->email;
            $_SESSION['role'] = $decoded->role;

            return $decoded;
        } catch (Exception $e) {
            sendError('Invalid or expired token', ['error' => $e->getMessage()], 401);
            exit;
        }
    }

    /**
     * Verify user is admin
     */
    public static function requireAdmin($user = null) {
        if (!$user) {
            $user = self::authenticate();
        }

        // Validate user object
        if (!$user || !is_object($user) || !isset($user->role)) {
            error_log('❌ requireAdmin: Invalid user object');
            sendError('Authentication failed', ['error' => 'Invalid user object'], 401);
            exit;
        }

        if (!in_array($user->role, ['admin', 'superadmin'])) {
            sendError('Access denied. Admin privileges required', [], 403);
            exit;
        }

        return $user;
    }

    /**
     * Optional authentication (doesn't fail if no token)
     */
    public static function optionalAuth() {
        $token = getBearerToken();

        if ($token) {
            try {
                $decoded = JWT::decode($token, JWT_SECRET);
                $_SESSION['user_id'] = $decoded->id;
                $_SESSION['email'] = $decoded->email;
                $_SESSION['role'] = $decoded->role;
                return $decoded;
            } catch (Exception $e) {
                // Invalid token, but we don't fail
                return null;
            }
        }

        return null;
    }

    /**
     * Generate JWT token for user
     */
    public static function generateToken($user) {
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + JWT_EXPIRATION
        ];

        return JWT::encode($payload, JWT_SECRET);
    }

    /**
     * Hash password using bcrypt
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify password against hash
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Generate password reset token
     */
    public static function generateResetToken() {
        return bin2hex(random_bytes(32));
    }

    /**
     * Hash reset token for storage
     */
    public static function hashResetToken($token) {
        return hash('sha256', $token);
    }
}
