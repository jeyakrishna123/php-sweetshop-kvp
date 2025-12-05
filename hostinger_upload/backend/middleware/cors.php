<?php
/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Handles CORS for React frontend
 */

class CorsMiddleware {
    private static $handled = false;

    public static function handle() {
        // Prevent duplicate header calls
        if (self::$handled) {
            return;
        }
        self::$handled = true;

        // Get the origin from the request
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        // List of allowed origins - Production domains included
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'https://skbakers.com',
            'https://www.skbakers.com',
        ];

        // Check if origin is allowed
        if (!empty($origin) && in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // For production, allow requests from same domain or no origin (direct requests)
            if (empty($origin) || strpos($origin, 'skbakers.com') !== false) {
                header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
                if (!empty($origin)) {
                    header("Access-Control-Allow-Credentials: true");
                }
            } else {
                // For development/unknown origins, still allow but without credentials
                header("Access-Control-Allow-Origin: *");
            }
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Origin, Accept");
        header("Access-Control-Max-Age: 86400");

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
