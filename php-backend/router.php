<?php
/**
 * Router script for PHP built-in server
 * This handles routing for the development server
 */

// Get the requested URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If it's a file that exists, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Otherwise, route to index.php
require_once __DIR__ . '/index.php';
