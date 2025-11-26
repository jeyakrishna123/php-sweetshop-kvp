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
    // If errors array has 'details' or 'error', append to message for visibility
    $fullMessage = $message;
    if (is_array($errors) && !empty($errors)) {
        $errorDetails = [];
        if (isset($errors['details'])) {
            $errorDetails[] = $errors['details'];
        }
        if (isset($errors['error']) && $errors['error'] !== $message) {
            $errorDetails[] = $errors['error'];
        }
        if (isset($errors['file']) && isset($errors['line'])) {
            $errorDetails[] = "File: " . basename($errors['file']) . ":" . $errors['line'];
        }
        if (!empty($errorDetails)) {
            $fullMessage = $message . " | " . implode(" | ", $errorDetails);
        }
    }
    
    // Include both 'errors' (for backward compatibility) and 'data' (for consistency with sendSuccess)
    sendResponse([
        'success' => false,
        'message' => $fullMessage,
        'errors' => $errors,
        'data' => $errors, // Also include in 'data' for consistency
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
    
    // Handle null, empty, or non-string values
    if ($data === null || $data === '') {
        return '';
    }
    
    if (!is_string($data)) {
        return $data; // Return as-is for non-string values
    }
    
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Get request body as JSON
 */
function getRequestBody() {
    // Get Content-Type header
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    
    // First try to get from php://input (for JSON and raw data)
    $input = file_get_contents('php://input');
    
    // If Content-Type is application/json or input is JSON, decode it
    if (stripos($contentType, 'application/json') !== false || !empty($input)) {
        $data = json_decode($input, true);
        
        // If json_decode failed but we have input, try to decode again
        if ($data === null && !empty($input) && json_last_error() !== JSON_ERROR_NONE) {
            // Input might be JSON but with encoding issues - try to clean it
            $cleanedInput = trim($input);
            $data = json_decode($cleanedInput, true);
        }
        
        // If we got valid JSON data, return it
        if ($data !== null && json_last_error() === JSON_ERROR_NONE) {
            return $data;
        }
    }
    
    // If no JSON data, try POST data (for form-encoded data)
    if (empty($data) && !empty($_POST)) {
        return $_POST;
    }
    
    // If still no data and we have input, try one more time to decode as JSON
    if (empty($data) && !empty($input)) {
        $data = json_decode($input, true);
        if ($data !== null && json_last_error() === JSON_ERROR_NONE) {
            return $data;
        }
    }
    
    // Return empty array if nothing worked
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
    // Generate a unique 6-digit tracking number
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
 * Generate unique 6-digit order ID
 * Ensures uniqueness by checking database
 * Generated once and never regenerated
 * Always returns exactly 6 digits (100000-999999)
 * Handles case where order_number column doesn't exist yet
 */
function generateUniqueOrderId($db) {
    // First, check if order_number column exists
    $columnExists = false;
    try {
        $checkColStmt = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
        $columnExists = $checkColStmt && $checkColStmt->rowCount() > 0;
    } catch (PDOException $e) {
        // Column doesn't exist, continue without it
        $columnExists = false;
    }
    
    $maxAttempts = 50; // Increased attempts for better uniqueness
    $attempt = 0;
    
    do {
        // Generate 6-digit number (100000 to 999999)
        // Method 1: Use microtime + random for better uniqueness
        $microtime = (int)(microtime(true) * 1000000); // Microseconds
        $microtimePart = $microtime % 1000000; // Last 6 digits
        
        // Generate random component to ensure uniqueness
        $randomPart = mt_rand(100000, 999999);
        
        // Combine microtime and random (XOR for better distribution)
        $orderId = ($microtimePart ^ $randomPart) % 900000 + 100000;
        
        // Ensure it's exactly 6 digits (100000-999999)
        if ($orderId < 100000 || $orderId > 999999) {
            $orderId = mt_rand(100000, 999999);
        }
        
        // Format as 6-digit string (ensure leading zeros if needed, though shouldn't happen)
        $orderIdString = str_pad((string)$orderId, 6, '0', STR_PAD_LEFT);
        
        // Validate it's exactly 6 digits
        if (strlen($orderIdString) !== 6 || !is_numeric($orderIdString)) {
            $orderIdString = str_pad((string)mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        }
        
        // Check if this order ID already exists in database
        // Only check order_number column if it exists
        if ($columnExists) {
            try {
                $checkStmt = $db->prepare("SELECT id FROM orders WHERE order_number = ? LIMIT 1");
                $checkStmt->execute([$orderIdString]);
                $exists = $checkStmt->fetch();
            } catch (PDOException $e) {
                // If column check fails, assume it doesn't exist and skip duplicate check
                $exists = false;
            }
        } else {
            // Column doesn't exist, so we can't check for duplicates
            // Just return the generated ID (it will be unique enough with microtime + random)
            error_log("✅ Generated 6-digit order ID (no column check): $orderIdString");
            return $orderIdString;
        }
        
        if (!$exists) {
            error_log("✅ Generated unique 6-digit order ID: $orderIdString");
            return $orderIdString;
        }
        
        $attempt++;
        
        // If duplicate found, try again with different random component
        if ($attempt < $maxAttempts) {
            // Generate new random component for next attempt
            $randomPart = mt_rand(100000, 999999);
        }
        
    } while ($attempt < $maxAttempts);
    
    // If all attempts failed (highly unlikely), use timestamp-based fallback
    error_log("⚠️ Max attempts reached, using fallback for order ID generation");
    $timestamp = time();
    $timestampPart = $timestamp % 1000000; // Last 6 digits of timestamp
    $fallbackId = ($timestampPart % 900000) + 100000; // Ensure 6 digits
    
    // Final validation
    if ($fallbackId < 100000 || $fallbackId > 999999) {
        $fallbackId = mt_rand(100000, 999999);
    }
    
    $finalOrderId = str_pad((string)$fallbackId, 6, '0', STR_PAD_LEFT);
    error_log("✅ Generated fallback 6-digit order ID: $finalOrderId");
    return $finalOrderId;
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
    // Check if UPLOAD_DIR is defined
    if (!defined('UPLOAD_DIR')) {
        error_log("❌ uploadImage - UPLOAD_DIR constant not defined!");
        return false;
    }
    
    $uploadDir = UPLOAD_DIR . $directory . '/';
    error_log("🔍 uploadImage - Upload directory: $uploadDir");
    error_log("🔍 uploadImage - Absolute path: " . realpath($uploadDir) ?: 'PATH DOES NOT EXIST');

    // PRODUCTION: Check if parent uploads directory exists
    if (!file_exists(UPLOAD_DIR)) {
        error_log("❌ PRODUCTION ISSUE - UPLOAD_DIR does not exist: " . UPLOAD_DIR);
        error_log("🔍 Attempting to create UPLOAD_DIR: " . UPLOAD_DIR);
        if (!mkdir(UPLOAD_DIR, 0755, true)) {
            error_log("❌ PRODUCTION ISSUE - Failed to create UPLOAD_DIR. Check permissions!");
            error_log("❌ Current user: " . get_current_user());
            error_log("❌ Directory owner check needed - may need chown www-data:www-data");
            return false;
        }
        error_log("✅ Created UPLOAD_DIR: " . UPLOAD_DIR);
    }
    
    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        error_log("⚠️ uploadImage - Directory doesn't exist, creating: $uploadDir");
        if (!mkdir($uploadDir, 0755, true)) {
            error_log("❌ uploadImage - Failed to create directory: $uploadDir");
            error_log("❌ PRODUCTION ISSUE - Cannot create directory. Check:");
            error_log("   1. Parent directory permissions");
            error_log("   2. PHP user has write access");
            error_log("   3. Disk space available");
            return false;
        }
        error_log("✅ uploadImage - Directory created successfully");
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        error_log("❌ uploadImage - Directory not writable: $uploadDir");
        error_log("❌ PRODUCTION ISSUE - Directory exists but is not writable!");
        error_log("🔍 Current permissions: " . substr(sprintf('%o', fileperms($uploadDir)), -4));
        error_log("🔍 Fix with: chmod 755 $uploadDir");
        error_log("🔍 Or: chmod 777 $uploadDir (less secure)");
        
        // Try to fix permissions
        if (!chmod($uploadDir, 0755)) {
            error_log("❌ uploadImage - Failed to set directory permissions");
            error_log("❌ PRODUCTION ISSUE - Cannot chmod directory. May need root/sudo access.");
            return false;
        }
        error_log("✅ Fixed directory permissions to 755");
    }

    // Validate file
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        error_log("❌ uploadImage - Invalid file upload: " . json_encode($file));
        return false;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Validate extension
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($extension, $allowedExtensions)) {
        error_log("❌ uploadImage - Invalid file extension: $extension");
        return false;
    }
    
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    error_log("🔍 uploadImage - Moving file to: $filepath");
    error_log("🔍 uploadImage - Temp file exists: " . (file_exists($file['tmp_name']) ? 'YES' : 'NO'));
    error_log("🔍 uploadImage - Temp file size: " . (file_exists($file['tmp_name']) ? filesize($file['tmp_name']) . ' bytes' : 'N/A'));
    error_log("🔍 uploadImage - Target directory writable: " . (is_writable($uploadDir) ? 'YES' : 'NO'));

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // PRODUCTION: Verify file was actually saved
        if (file_exists($filepath) && filesize($filepath) > 0) {
            $relativePath = '/uploads/' . $directory . '/' . $filename;
            error_log("✅ uploadImage - File uploaded successfully: $relativePath");
            error_log("✅ uploadImage - File verified on disk: " . filesize($filepath) . " bytes");
            return $relativePath;
        } else {
            error_log("❌ PRODUCTION ISSUE - move_uploaded_file returned true but file does not exist or is empty!");
            error_log("❌ Target path: $filepath");
            error_log("❌ File exists: " . (file_exists($filepath) ? 'YES' : 'NO'));
            if (file_exists($filepath)) {
                error_log("❌ File size: " . filesize($filepath) . " bytes");
            }
            return false;
        }
    } else {
        $lastError = error_get_last();
        error_log("❌ uploadImage - Failed to move uploaded file");
        error_log("❌ PRODUCTION ISSUE - move_uploaded_file() failed!");
        error_log("❌ Error: " . ($lastError ? $lastError['message'] : 'Unknown error'));
        error_log("❌ Source: " . $file['tmp_name']);
        error_log("❌ Destination: $filepath");
        error_log("❌ Check:");
        error_log("   1. Disk space: " . (disk_free_space($uploadDir) ?: 'Unknown'));
        error_log("   2. Directory permissions");
        error_log("   3. PHP user permissions");
        return false;
    }
}

/**
 * Convert base64 image to file and upload
 * Returns relative path on success, false on failure
 */
function uploadBase64Image($base64String, $directory = 'products') {
    if (empty($base64String)) {
        error_log("❌ uploadBase64Image - Empty base64 string provided");
        return false;
    }

    // Check if UPLOAD_DIR is defined
    if (!defined('UPLOAD_DIR')) {
        error_log("❌ uploadBase64Image - UPLOAD_DIR constant not defined!");
        return false;
    }

    // Check if it's a base64 data URI
    if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $base64String, $matches)) {
        $imageType = strtolower($matches[1]); // jpeg, png, webp, gif
        $base64Data = $matches[2];
        error_log("🔍 uploadBase64Image - Detected data URI with type: $imageType");
    } else {
        // Assume it's raw base64 without data URI prefix
        // Try to detect image type from the base64 data
        $decoded = base64_decode($base64String, true);
        if ($decoded === false) {
            error_log("❌ uploadBase64Image - Invalid base64 string (decode failed)");
            return false;
        }

        // Detect MIME type from binary data
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_buffer($finfo, $decoded);
        finfo_close($finfo);

        error_log("🔍 uploadBase64Image - Detected MIME type: $mimeType");

        // Map MIME type to extension
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif'
        ];

        $imageType = $mimeMap[$mimeType] ?? 'jpg'; // Default to jpg
        $base64Data = $base64String;
    }

    // Validate image type
    $allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($imageType, $allowedTypes)) {
        error_log("❌ uploadBase64Image - Invalid image type: " . $imageType);
        return false;
    }

    // Decode base64 data
    $imageData = base64_decode($base64Data, true);
    if ($imageData === false) {
        error_log("❌ uploadBase64Image - Failed to decode base64 data");
        return false;
    }

    error_log("🔍 uploadBase64Image - Decoded image size: " . strlen($imageData) . " bytes");

    // Validate it's actually an image
    $tempFile = tmpfile();
    $tempPath = stream_get_meta_data($tempFile)['uri'];
    file_put_contents($tempPath, $imageData);

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMime = finfo_file($finfo, $tempPath);
    finfo_close($finfo);
    fclose($tempFile);

    error_log("🔍 uploadBase64Image - Validated MIME type: $detectedMime");

    if (!in_array($detectedMime, ALLOWED_IMAGE_TYPES)) {
        error_log("❌ uploadBase64Image - Detected invalid MIME type: " . $detectedMime);
        return false;
    }

    // Create upload directory if it doesn't exist
    $uploadDir = UPLOAD_DIR . $directory . '/';
    error_log("🔍 uploadBase64Image - Upload directory: $uploadDir");

    if (!file_exists($uploadDir)) {
        error_log("⚠️ uploadBase64Image - Directory doesn't exist, creating: $uploadDir");
        if (!mkdir($uploadDir, 0755, true)) {
            error_log("❌ uploadBase64Image - Failed to create directory: $uploadDir");
            return false;
        }
        error_log("✅ uploadBase64Image - Directory created successfully");
    }

    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        error_log("❌ uploadBase64Image - Directory not writable: $uploadDir");
        return false;
    }

    // Generate unique filename
    $extension = ($imageType === 'jpeg') ? 'jpg' : $imageType;
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    error_log("🔍 uploadBase64Image - Saving to: $filepath");

    // Save image to file
    $result = file_put_contents($filepath, $imageData);
    if ($result !== false) {
        error_log("✅ uploadBase64Image - Saved base64 image to: /uploads/" . $directory . "/" . $filename . " (Size: $result bytes)");
        return '/uploads/' . $directory . '/' . $filename;
    } else {
        error_log("❌ uploadBase64Image - Failed to save file: " . $filepath . " (file_put_contents returned false)");
        return false;
    }
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

/**
 * Get image URL - Convert relative paths to absolute production URLs
 * CRITICAL: Never convert base64 images to URLs - they should be converted to files first
 * Returns placeholder if image file doesn't exist
 */
function getImageUrl($imagePath) {
    if (empty($imagePath)) {
        // Return placeholder instead of null to prevent 404 errors
        $placeholder = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
        return $placeholder . '/backend/uploads/products/default-product.png';
    }
    
    // CRITICAL: Check if it's a base64 image string - DO NOT convert to URL
    // Base64 images should never be passed to this function - they should be converted to files first
    // Check for data:image/ ANYWHERE in string (not just at start) - handles path prefixes
    if (is_string($imagePath)) {
        // Check for data URI format anywhere in string (handles path prefixes like /uploads/products/data:image/...)
        if (strpos($imagePath, 'data:image/') !== false || strpos($imagePath, ';base64,') !== false) {
            error_log("⚠️ getImageUrl - Base64 data URI detected! This should have been converted to a file first: " . substr($imagePath, 0, 100) . "...");
            // Return placeholder instead of null
            $placeholder = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
            return $placeholder . '/backend/uploads/products/default-product.png';
        }
        
        // Check for base64 pattern in strings with path prefixes
        // e.g., /uploads/products/data:image/webp;base64,...
        if (strlen($imagePath) > 200 && preg_match('/data:image\/[^;]+;base64,/', $imagePath)) {
            error_log("⚠️ getImageUrl - Base64 pattern with path prefix detected! This should have been converted to a file first");
            // Return placeholder instead of null
            $placeholder = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
            return $placeholder . '/backend/uploads/products/default-product.png';
        }
        
        // Check for raw base64 string (long string matching base64 pattern)
        if (strlen($imagePath) > 100 && preg_match('/^[A-Za-z0-9+\/]+=*$/', $imagePath)) {
            // Only treat as base64 if it doesn't look like a file path or URL
            if (strpos($imagePath, '/') === false && strpos($imagePath, '\\') === false && strpos($imagePath, 'http') === false) {
                error_log("⚠️ getImageUrl - Raw base64 string detected! This should have been converted to a file first");
                // Return placeholder instead of null
                $placeholder = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
                return $placeholder . '/backend/uploads/products/default-product.png';
            }
        }
    }
    
    // If already an absolute URL, return as is
    if (preg_match('/^https?:\/\//', $imagePath)) {
        return $imagePath;
    }
    
    // Handle old paths like /uploads/banners/ -> convert to /backend/uploads/banners/
    if (strpos($imagePath, '/uploads/') === 0) {
        $imagePath = '/backend' . $imagePath;
    }
    
    // If starts with /, it's a root-relative path
    if (strpos($imagePath, '/') === 0) {
        $fullUrl = defined('BASE_URL') ? BASE_URL . $imagePath : 'https://skbakers.com' . $imagePath;
        
        // Always check if file exists on local filesystem (even for production URLs)
        // Convert URL path to local file path
        $localPath = null;
        
        // Extract the path part from URL (remove domain)
        if (strpos($imagePath, '/backend/') === 0) {
            // Path already has /backend/, use it directly
            $localPath = __DIR__ . '/..' . $imagePath;
        } elseif (strpos($imagePath, '/uploads/') === 0) {
            // Path has /uploads/, add /backend prefix
            $localPath = __DIR__ . '/../backend' . $imagePath;
        } else {
            // Try both possibilities
            $localPath = __DIR__ . '/..' . $imagePath;
            if (!file_exists($localPath) && strpos($imagePath, '/backend/') === false) {
                $localPath = __DIR__ . '/../backend' . $imagePath;
            }
        }
        
        // Check if file exists on local filesystem
        if ($localPath && !file_exists($localPath)) {
            error_log("⚠️ getImageUrl - File not found on server: $localPath (URL: $fullUrl), using placeholder");
            $placeholder = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
            // Return a placeholder image URL - use a data URI SVG to avoid 404s
            // This will be handled by frontend onError handlers
            return $placeholder . '/backend/uploads/products/default-product.png';
        }
        
        return $fullUrl;
    }
    
    // Otherwise, prepend uploads directory
    $baseUrl = defined('IMAGE_BASE_URL') ? IMAGE_BASE_URL : 'https://skbakers.com/backend/uploads';
    return $baseUrl . '/' . ltrim($imagePath, '/');
}

/**
 * Normalize image URL/path - Convert full URLs to relative paths for storage
 * This ensures images are stored as relative paths and converted back to full URLs when retrieved
 */
function normalizeImagePath($imagePath, $directory = 'products') {
    if (empty($imagePath)) {
        return null;
    }
    
    // CRITICAL: Check if it's a base64 image string
    // Base64 images can have path prefixes like /uploads/products/data:image/...
    // Check for data:image/ ANYWHERE in the string (not just at start)
    $isBase64 = false;
    
    // Check for data URI format anywhere in string
    if (strpos($imagePath, 'data:image/') !== false || strpos($imagePath, ';base64,') !== false) {
        $isBase64 = true;
        error_log("🔍 normalizeImagePath - Detected base64 pattern (data:image/ or ;base64,) in string");
    } 
    // Check for base64 pattern in strings with path prefixes
    // e.g., /uploads/products/data:image/webp;base64,...
    else if (strlen($imagePath) > 200 && preg_match('/data:image\/[^;]+;base64,/', $imagePath)) {
        $isBase64 = true;
        error_log("🔍 normalizeImagePath - Detected base64 pattern with path prefix");
    }
    // Check for raw base64 string (long string matching base64 pattern)
    else if (strlen($imagePath) > 100 && preg_match('/^[A-Za-z0-9+\/]+=*$/', $imagePath)) {
        // Only treat as base64 if it doesn't look like a file path or URL
        if (strpos($imagePath, '/') === false && strpos($imagePath, '\\') === false && strpos($imagePath, 'http') === false) {
            $isBase64 = true;
            error_log("🔍 normalizeImagePath - Detected raw base64 string");
        }
    }
    
    if ($isBase64) {
        error_log("🔍 normalizeImagePath - Detected base64 image (length: " . strlen($imagePath) . " chars), converting to file...");
        
        // CRITICAL: If base64 has path prefix, extract just the base64 part
        // e.g., /uploads/products/data:image/webp;base64,... -> data:image/webp;base64,...
        $base64String = $imagePath;
        if (strpos($imagePath, 'data:image/') !== false) {
            // Find where data:image/ starts
            $dataImagePos = strpos($imagePath, 'data:image/');
            $base64String = substr($imagePath, $dataImagePos);
            error_log("🔍 normalizeImagePath - Extracted base64 from path prefix: " . substr($base64String, 0, 50) . "...");
        }
        
        // Convert base64 to file
        $uploadedPath = uploadBase64Image($base64String, $directory);
        if ($uploadedPath) {
            error_log("✅ normalizeImagePath - Base64 converted to: " . $uploadedPath);
            return $uploadedPath;
        } else {
            error_log("❌ normalizeImagePath - Failed to convert base64 image - returning NULL (will cause validation error)");
            // CRITICAL: Return null so the calling code knows conversion failed
            // The calling code should NOT save the product if this returns null
            return null;
        }
    }
    
    // If it's already a relative path (starts with /uploads/ or /backend/uploads/), return as is
    if (strpos($imagePath, '/uploads/') === 0) {
        return $imagePath; // Return as /uploads/... format
    }
    
    if (strpos($imagePath, '/backend/uploads/') === 0) {
        // Convert /backend/uploads/ to /uploads/ for storage
        return str_replace('/backend/uploads/', '/uploads/', $imagePath);
    }
    
    // If it's a full URL, extract the relative path
    $baseUrl = defined('BASE_URL') ? BASE_URL : 'https://skbakers.com';
    $imageBaseUrl = defined('IMAGE_BASE_URL') ? IMAGE_BASE_URL : 'https://skbakers.com/backend/uploads';
    
    // Remove base URL if present
    if (strpos($imagePath, $baseUrl) === 0) {
        $relativePath = substr($imagePath, strlen($baseUrl));
        // Convert /backend/uploads/ to /uploads/ for storage
        if (strpos($relativePath, '/backend/uploads/') === 0) {
            return str_replace('/backend/uploads/', '/uploads/', $relativePath);
        }
        return $relativePath;
    }
    
    // Remove image base URL if present
    if (strpos($imagePath, $imageBaseUrl) === 0) {
        $relativePath = substr($imagePath, strlen($imageBaseUrl));
        return '/uploads/products' . $relativePath;
    }
    
    // If it doesn't start with /, assume it's a filename or path relative to uploads
    if (strpos($imagePath, '/') !== 0) {
        return '/uploads/products/' . ltrim($imagePath, '/');
    }
    
    // Return as is if we can't normalize it
    return $imagePath;
}