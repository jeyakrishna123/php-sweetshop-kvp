<?php
/**
 * Quick Backend Test
 * Test if PHP backend is working
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'status' => 'success',
    'message' => 'PHP Backend is working!',
    'timestamp' => date('c'),
    'request_uri' => $_SERVER['REQUEST_URI'],
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
], JSON_PRETTY_PRINT);
?>
