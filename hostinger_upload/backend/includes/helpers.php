<?php
/**
 * Helper Functions
 */

/**
 * Send JSON response
 * Clears any output buffer before sending to prevent warnings from breaking JSON
 */
function sendResponse($data = [], $statusCode = 200) {
    // Clean any buffered output (errors, warnings, etc.)
    if (ob_get_level()) {
        ob_clean();
    }

    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Send success response
 */
function sendSuccess($message = 'Success', $data = [], $statusCode = 200) {
    sendResponse([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c')
    ], $statusCode);
}

/**
 * Send error response
 */
function sendError($message = 'Error', $errors = [], $statusCode = 400) {
    sendResponse([
        'success' => false,
        'message' => $message,
        'errors' => $errors,
        'timestamp' => date('c')
    ], $statusCode);
}

/**
 * Validate required fields
 */
function validateRequired($data, $requiredFields) {
    $errors = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            $errors[$field] = ucfirst($field) . ' is required';
        } else {
            // Handle different data types
            $value = $data[$field];
            if (is_string($value) && empty(trim($value))) {
                $errors[$field] = ucfirst($field) . ' is required';
            } elseif (is_array($value) && empty($value)) {
                $errors[$field] = ucfirst($field) . ' is required';
            }
        }
    }
    return $errors;
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Sanitize input
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Get request body as JSON
 */
function getRequestBody() {
    // First try to get from php://input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // If no data from input stream, try POST data
    if (empty($data) && !empty($_POST)) {
        $data = $_POST;
    }
    
    // If still no data, try to get from raw input
    if (empty($data)) {
        $rawInput = file_get_contents('php://input');
        if (!empty($rawInput)) {
            $data = json_decode($rawInput, true);
        }
    }
    
    // Log for debugging
    error_log("getRequestBody() - Raw input: " . $input);
    error_log("getRequestBody() - Parsed data: " . json_encode($data));
    error_log("getRequestBody() - POST data: " . json_encode($_POST));
    
    return $data ?? [];
}

/**
 * Get authorization header
 */
function getAuthorizationHeader() {
    $headers = getallheaders();

    if (isset($headers['Authorization'])) {
        return $headers['Authorization'];
    }

    if (isset($headers['authorization'])) {
        return $headers['authorization'];
    }

    return null;
}

/**
 * Get bearer token from authorization header
 */
function getBearerToken() {
    $authHeader = getAuthorizationHeader();

    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return $matches[1];
    }

    return null;
}

/**
 * Generate random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Generate tracking number
 * Format: 6-digit unique order ID like Amazon/Flipkart (e.g., 243158, 876542)
 */
function generateTrackingNumber() {
    // Generate a unique 6-digit number
    // Start from 100000 to ensure 6 digits
    $min = 100000;
    $max = 999999;

    // Use microtime for additional uniqueness
    $microtime = (int)(microtime(true) * 1000);
    $random = mt_rand($min, $max);

    // Combine microtime and random for better uniqueness
    $uniqueNumber = ($microtime + $random) % 900000 + 100000;

    return (string)$uniqueNumber;
}

/**
 * Generate slug from string
 */
function generateSlug($string) {
    $slug = strtolower(trim($string));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Format price
 */
function formatPrice($price, $currency = 'INR') {
    return number_format($price, 2) . ' ' . $currency;
}

/**
 * Validate phone number (Indian format)
 */
function validatePhone($phone) {
    return preg_match('/^[0-9]{10}$/', $phone);
}

/**
 * Calculate discount price
 */
function calculateDiscountPrice($price, $discountPercentage) {
    return $price * (1 - ($discountPercentage / 100));
}

/**
 * Get pagination parameters
 */
function getPaginationParams() {
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
    $offset = ($page - 1) * $limit;

    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => $offset
    ];
}

/**
 * Create pagination response
 */
function createPaginationResponse($data, $total, $page, $limit) {
    $totalPages = ceil($total / $limit);

    return [
        'data' => $data,
        'pagination' => [
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'totalItems' => $total,
            'itemsPerPage' => $limit,
            'hasNextPage' => $page < $totalPages,
            'hasPrevPage' => $page > 1
        ]
    ];
}

/**
 * Log activity
 */
function logActivity($message, $data = []) {
    $logFile = __DIR__ . '/../logs/activity.log';
    $logDir = dirname($logFile);

    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }

    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";

    if (!empty($data)) {
        $logMessage .= ' | Data: ' . json_encode($data);
    }

    $logMessage .= PHP_EOL;

    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

/**
 * Validate image upload
 */
function validateImageUpload($file) {
    $errors = [];

    // Check if file was uploaded
    if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
        $errors[] = 'No file uploaded';
        return $errors;
    }

    // Check file size
    if ($file['size'] > MAX_FILE_SIZE) {
        $errors[] = 'File size exceeds maximum allowed size';
    }

    // Check file type using finfo if available, otherwise use mime_content_type or extension
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
    } elseif (function_exists('mime_content_type')) {
        $mimeType = mime_content_type($file['tmp_name']);
    } else {
        // Fallback to checking file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($extension, $validExtensions)) {
            $errors[] = 'Invalid file extension. Only JPG, PNG, WebP, and GIF are allowed';
        }
        return $errors;
    }

    if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
        $errors[] = 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed';
    }

    return $errors;
}

/**
 * Upload image
 */
function uploadImage($file, $directory = 'products') {
    $uploadDir = UPLOAD_DIR . $directory . '/';

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return '/uploads/' . $directory . '/' . $filename;
    }

    return false;
}

/**
 * Delete file
 */
function deleteFile($filepath) {
    $fullPath = __DIR__ . '/../' . ltrim($filepath, '/');

    if (file_exists($fullPath)) {
        return unlink($fullPath);
    }

    return false;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if user is admin
 */
function isAdmin() {
    return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'superadmin']);
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user role
 */
function getCurrentUserRole() {
    return $_SESSION['role'] ?? 'user';
}

/**
 * Send email notification using SMTP
 * This function never throws exceptions or outputs warnings
 */
function sendEmail($to, $subject, $body, $isHtml = true) {
    // Suppress all errors to prevent breaking JSON responses
    $oldErrorLevel = error_reporting(0);

    try {
        // Load SimpleMailer
        require_once __DIR__ . '/SimpleMailer.php';

        // Create mailer instance
        $mailer = new SimpleMailer(
            SMTP_HOST,
            SMTP_PORT,
            SMTP_USERNAME,
            SMTP_PASSWORD,
            FROM_EMAIL,
            FROM_NAME
        );

        // Send email
        $success = @$mailer->send($to, $subject, $body, $isHtml);

        if ($success) {
            error_log("✅ Email sent successfully to: $to via SMTP");
            error_reporting($oldErrorLevel);
            return true;
        } else {
            error_log("❌ Failed to send email to: $to - Error: " . $mailer->getLastError());
            error_reporting($oldErrorLevel);
            return false;
        }
    } catch (Throwable $e) {
        // Catch all errors including warnings
        error_log("❌ Email error: " . $e->getMessage());
        error_reporting($oldErrorLevel);
        return false;
    }
}

/**
 * Send order status update email
 */
function sendOrderStatusEmail($customerEmail, $customerName, $orderId, $newStatus, $trackingNumber = null) {
    $subject = "Order Status Update - Order #$orderId";

    // Status descriptions
    $statusMessages = [
        'pending' => 'Your order has been received and is pending confirmation.',
        'processing' => 'Your order is being processed and will be shipped soon.',
        'shipped' => 'Your order has been shipped and is on its way to you!',
        'delivered' => 'Your order has been delivered. Thank you for your purchase!',
        'cancelled' => 'Your order has been cancelled.'
    ];

    $statusMessage = $statusMessages[$newStatus] ?? 'Your order status has been updated.';

    $body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-processing { background: #dbeafe; color: #1e40af; }
            .status-shipped { background: #e9d5ff; color: #6b21a8; }
            .status-delivered { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎂 " . FROM_NAME . "</h1>
                <p>Order Status Update</p>
            </div>
            <div class='content'>
                <h2>Hello $customerName!</h2>
                <p>Your order status has been updated.</p>

                <div class='order-details'>
                    <p><strong>Order ID:</strong> #$orderId</p>
                    <p><strong>New Status:</strong> <span class='status-badge status-$newStatus'>" . strtoupper($newStatus) . "</span></p>
                    <p>$statusMessage</p>";

    if ($trackingNumber) {
        $body .= "<p><strong>Tracking Number:</strong> $trackingNumber</p>";
    }

    $body .= "
                </div>

                <p>If you have any questions about your order, please don't hesitate to contact us.</p>

                <div class='footer'>
                    <p>Thank you for choosing " . FROM_NAME . "!</p>
                    <p>&copy; " . date('Y') . " " . FROM_NAME . ". All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>";

    return sendEmail($customerEmail, $subject, $body, true);
}
