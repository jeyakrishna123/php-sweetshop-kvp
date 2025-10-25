<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

require_once '../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || !isset($input['otp'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Email and OTP are required']);
        exit();
    }

    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    $otp = filter_var($input['otp'], FILTER_SANITIZE_STRING);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid email format']);
        exit();
    }

    // Verify OTP
    $stmt = $pdo->prepare("
        SELECT prt.id, prt.user_id, prt.token, prt.expires_at 
        FROM password_reset_tokens prt 
        JOIN users u ON prt.user_id = u.id 
        WHERE prt.email = ? AND prt.token = ? AND prt.expires_at > NOW() AND prt.used = 0
        ORDER BY prt.created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$email, $otp]);
    $token = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$token) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid or expired OTP']);
        exit();
    }

    // Mark token as used
    $stmt = $pdo->prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?");
    $stmt->execute([$token['id']]);

    echo json_encode([
        'message' => 'OTP verified successfully',
        'success' => true,
        'user_id' => $token['user_id']
    ]);

} catch (Exception $e) {
    error_log("OTP verification error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Internal server error']);
}
?>
