<?php
/**
 * Production Configuration for Hostinger
 * SK Bakers E-Commerce Application
 */

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Hide errors in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php-error.log');

// Timezone
date_default_timezone_set('Asia/Kolkata');

// JWT Secret Key - CHANGE THIS TO A SECURE RANDOM STRING
define('JWT_SECRET', 'sk-bakers-production-jwt-secret-key-2024-secure');
define('JWT_EXPIRATION', 7 * 24 * 60 * 60); // 7 days in seconds

// Database Configuration for Hostinger
define('DB_HOST', 'localhost');
define('DB_NAME', 'u707629033_skbakers_001');
define('DB_USER', 'u707629033_skbakers');
define('DB_PASS', 'Skbakers@123'); // Replace with your actual Hostinger database password

// CORS Settings - Production domains
define('ALLOWED_ORIGINS', [
    'https://skbakers.com',
    'https://www.skbakers.com'
]);

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Email settings (Hostinger SMTP)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'info@upgradenow.in');
define('SMTP_PASSWORD', '0056@Ravi');
define('FROM_EMAIL', 'info@upgradenow.in');
define('FROM_NAME', 'SK Bakers');

// Payment gateway settings
define('STRIPE_SECRET_KEY', '');
define('RAZORPAY_KEY_ID', '');
define('RAZORPAY_KEY_SECRET', '');

// Application settings
define('APP_NAME', 'SK Bakers E-Commerce');
define('APP_VERSION', '2.0.0');
define('APP_ENV', 'production');

// Base URL - Production domain
define('BASE_URL', 'https://skbakers.com');
define('API_BASE_URL', 'https://skbakers.com/api');

// Session settings for security
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // HTTPS only
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_samesite', 'Lax');

// Create upload directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Create logs directory if it doesn't exist
$logsDir = __DIR__ . '/../logs/';
if (!file_exists($logsDir)) {
    mkdir($logsDir, 0755, true);
}

// Force HTTPS in production
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    $redirectURL = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $redirectURL", true, 301);
    exit();
}
?>
