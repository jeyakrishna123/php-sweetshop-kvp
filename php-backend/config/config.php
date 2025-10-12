<?php
/**
 * Application Configuration
 */

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Asia/Kolkata');

// JWT Secret Key - CHANGE THIS TO A SECURE RANDOM STRING
define('JWT_SECRET', 'your-secret-key-change-this-to-something-very-secure');
define('JWT_EXPIRATION', 7 * 24 * 60 * 60); // 7 days in seconds

// CORS Settings - Update with your React frontend URL
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://skbakers.com', // Your production domain
    'https://www.skbakers.com' // With www
]);

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Email settings (for order notifications, etc.)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@yourdomain.com');
define('SMTP_PASSWORD', 'your-email-password');
define('FROM_EMAIL', 'noreply@yourdomain.com');
define('FROM_NAME', 'SK Bakers');

// Payment gateway settings (Stripe, Razorpay, etc.)
define('STRIPE_SECRET_KEY', '');
define('RAZORPAY_KEY_ID', '');
define('RAZORPAY_KEY_SECRET', '');

// Application settings
define('APP_NAME', 'SK Bakers E-Commerce');
define('APP_VERSION', '2.0.0');
define('APP_ENV', 'development'); // 'development' or 'production'

// Base URL - Update this for your domain
define('BASE_URL', 'http://localhost/php-backend');
define('API_BASE_URL', BASE_URL . '/api');

// Session settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);

// Create upload directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
