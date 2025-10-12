<?php
/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Handles CORS for React frontend
 */

class CorsMiddleware {
    public static function handle() {
        // Always allow all origins for now to fix the issue
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Origin, Accept");
        header("Access-Control-Allow-Credentials: false");
        header("Access-Control-Max-Age: 86400");

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
