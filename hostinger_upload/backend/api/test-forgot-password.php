<?php
/**
 * SIMPLE TEST ENDPOINT FOR FORGOT PASSWORD
 * Use this to test if the basic endpoint works
 * URL: /api/test-forgot-password.php
 */

// Set JSON header immediately
header('Content-Type: application/json; charset=utf-8');

// Basic CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $response = [
        'success' => true,
        'message' => 'Test endpoint is working!',
        'method' => $_SERVER['REQUEST_METHOD'],
        'data_received' => $data,
        'email' => $data['email'] ?? 'not provided',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    http_response_code(200);
    echo json_encode($response);
    exit;
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    exit;
}

