<?php
/**
 * Router for PHP Built-in Server
 * Handles all API requests
 */

// Get the request URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Log the request for debugging
error_log("Router: Handling request to: " . $uri);

// Check if it's a real file (for static assets)
$file = __DIR__ . $uri;
if (is_file($file)) {
    error_log("Router: Serving static file: " . $file);
    return false; // Serve the file as-is
}

// All other requests go to index.php
error_log("Router: Routing to index.php");
require __DIR__ . '/index.php';
