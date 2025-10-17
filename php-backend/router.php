<?php
/**
 * Router script for PHP built-in server
 * This handles routing for the development server
 */

// Set CORS headers for ALL requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Origin');
header('Access-Control-Expose-Headers: Content-Length, Content-Type');

// Get the requested URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

// Serve static files from uploads directory with proper headers
if (strpos($uri, '/uploads/') === 0) {
    $file = __DIR__ . $uri;
    if (file_exists($file) && is_file($file)) {
        // Set CORS headers first
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Origin');
        header('Access-Control-Expose-Headers: Content-Length, Content-Type');

        // Get mime type
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file);
            finfo_close($finfo);
        } else {
            // Fallback to extension-based mime type
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            $mimeTypes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp'
            ];
            $mime = $mimeTypes[$extension] ?? 'application/octet-stream';
        }

        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
}

// Always route /api requests to index.php
if (strpos($uri, '/api') === 0) {
    require_once __DIR__ . '/index.php';
    exit;
}

// If it's a file that exists, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Otherwise, route to index.php
require_once __DIR__ . '/index.php';
