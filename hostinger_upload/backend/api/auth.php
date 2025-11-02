<?php
/**
 * AUTHENTICATION API - ULTIMATE FIXED VERSION
 * Handles all authentication-related endpoints with complete OTP verification
 */

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/config.php";
require_once __DIR__ . "/../includes/helpers.php";

// Load EmailService with error handling
$emailServiceLoaded = false;
try {
    if (file_exists(__DIR__ . "/../includes/EmailService.php")) {
        require_once __DIR__ . "/../includes/EmailService.php";
        $emailServiceLoaded = class_exists('EmailService');
        if ($emailServiceLoaded) {
            error_log("✅ AUTH API - EmailService loaded successfully");
        } else {
            error_log("⚠️ AUTH API - EmailService file exists but class not found");
        }
    } else {
        error_log("⚠️ AUTH API - EmailService.php file not found");
    }
} catch (Throwable $e) {
    error_log("⚠️ AUTH API - Failed to load EmailService: " . $e->getMessage());
}

require_once __DIR__ . "/../middleware/cors.php";
require_once __DIR__ . "/../middleware/auth.php";

// Handle CORS
CorsMiddleware::handle();

// Get request method and endpoint
$method = $_SERVER["REQUEST_METHOD"];

// Get endpoint from URL path or query parameter
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/auth/register and /api/auth?endpoint=register
$endpoint = "";
if (isset($pathParts[2]) && $pathParts[2] !== '') {
    // Direct path: /api/auth/register
    $endpoint = $pathParts[2];
} else {
    // Query parameter: /api/auth?endpoint=register
    $endpoint = $_GET["endpoint"] ?? "";
}

// Log the request for debugging
error_log("🔍 AUTH API - Method: $method, Endpoint: '$endpoint', Path: " . json_encode($pathParts));

// Initialize database connection with error handling
try {
    $db = Database::getInstance()->getConnection();
    error_log("✅ AUTH API - Database connection successful");
} catch (Exception $e) {
    error_log("❌ AUTH API - Database connection failed: " . $e->getMessage());
    sendError("Database connection failed", ["error" => $e->getMessage()], 500);
    exit;
}

// Route the request
switch ($endpoint) {
    case "register":
        if ($method === "POST") {
            register($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "login":
        if ($method === "POST") {
            login($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "forgot-password":
        if ($method === "POST") {
            // Wrap in error handler to catch any fatal errors
            try {
                forgotPassword($db);
            } catch (Throwable $e) {
                // Final safety net - catch anything that wasn't caught
                error_log("❌ FORGOT PASSWORD - Top-level error handler caught: " . $e->getMessage());
                error_log("❌ FORGOT PASSWORD - Top-level error file: " . $e->getFile() . ", Line: " . $e->getLine());
                error_log("❌ FORGOT PASSWORD - Top-level error trace: " . $e->getTraceAsString());
                
                // Clean output
                if (ob_get_level()) {
                    ob_clean();
                }
                
                sendError("An error occurred processing your request. Please try again.", [
                    "message" => "We're experiencing technical difficulties. Please try again in a moment.",
                    "error_code" => "TOP_LEVEL_ERROR"
                ], 500);
            }
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "verify-otp":
        if ($method === "POST") {
            verifyOtp($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "reset-password":
        if ($method === "POST") {
            resetPassword($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "resend-signup-otp":
        if ($method === "POST") {
            resendSignupOtp($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "logout":
        if ($method === "POST") {
            logout();
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "verify-signup-otp":
        if ($method === "POST") {
            verifySignupOtp($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "refresh-token":
        if ($method === "POST") {
            refreshToken($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    case "me":
        if ($method === "GET") {
            getCurrentUser($db);
        } else {
            sendError("Method not allowed", [], 405);
        }
        break;

    default:
        sendError("Authentication endpoint not found", [], 404);
}

/**
 * Register new user - SECURE VERSION: Does NOT create user until OTP is verified
 */
function register($db) {
    try {
        error_log("🔍 REGISTER FUNCTION - Starting SECURE registration process (no user creation until OTP verified)");
        
        // Test database connection
        if (!$db) {
            error_log("❌ REGISTER - Database connection is null");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        $data = getRequestBody();
        
        if (empty($data)) {
            sendError("Please provide all required information", [], 400);
            return;
        }

        $errors = validateRequired($data, ["name", "email", "password"]);
        if (!empty($errors)) {
            sendError("Please fill in all required fields", $errors, 400);
            return;
        }

        $name = sanitizeInput($data["name"]);
        $email = sanitizeInput($data["email"]);
        $password = $data["password"];
        $phone = isset($data["phone"]) ? sanitizeInput($data["phone"]) : null;
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendError("Invalid email format", ["email" => "Please enter a valid email address"], 400);
            return;
        }
        
        // Validate password strength
        if (strlen($password) < 6) {
            sendError("Password must be at least 6 characters long", ["password" => "Password is too short"], 400);
            return;
        }
        
        // Validate name
        if (strlen(trim($name)) < 2) {
            sendError("Name must be at least 2 characters long", ["name" => "Name is too short"], 400);
            return;
        }

        // SECURITY: Check if user already exists as VERIFIED/ACTIVE user
        $stmt = $db->prepare("SELECT id, is_email_verified, is_active FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $existingUser = $stmt->fetch();
        
        if ($existingUser) {
            // If user is verified and active, reject registration
            if ($existingUser['is_email_verified'] == 1 || $existingUser['is_active'] == 1) {
                error_log("❌ REGISTER - Verified user already exists with email: $email");
                sendError("An account with this email already exists", ["email" => "This email is already registered"], 409);
                return;
            }
            // If user exists but not verified, allow resending OTP
            error_log("⚠️ REGISTER - Unverified user exists, allowing OTP resend");
        }

        // Hash password for temporary storage (will be used when creating user after OTP verification)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // SECURITY: Create signup_otps table to store temporary signup data (NO user creation until OTP verified)
        try {
            $checkTable = $db->prepare("SHOW TABLES LIKE 'signup_otps'");
            $checkTable->execute();
            $tableExists = $checkTable->fetch();
            
            if (!$tableExists) {
                error_log("🔍 REGISTER - Creating signup_otps table for secure OTP storage");
                $createTable = "
                    CREATE TABLE IF NOT EXISTS signup_otps (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        email VARCHAR(255) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        phone VARCHAR(50) NULL,
                        otp VARCHAR(6) NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        used TINYINT(1) DEFAULT 0,
                        INDEX idx_email (email),
                        INDEX idx_email_otp (email, otp),
                        INDEX idx_expires (expires_at),
                        INDEX idx_created (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ";
                $db->exec($createTable);
                error_log("✅ REGISTER - signup_otps table created");
            } else {
                error_log("✅ REGISTER - signup_otps table exists");
            }
        } catch (Exception $e) {
            error_log("⚠️ REGISTER - Table creation/check error: " . $e->getMessage());
            sendError("Database setup error. Please try again.", [], 500);
            return;
        }

        // SECURITY: Mark old unused OTPs as expired/invalid for this email
        try {
            $invalidateStmt = $db->prepare("
                UPDATE signup_otps 
                SET used = 1 
                WHERE email = ? AND used = 0 AND expires_at > NOW()
            ");
            $invalidateStmt->execute([$email]);
            error_log("🔍 REGISTER - Invalidated old unused OTPs for email: $email");
        } catch (Exception $e) {
            error_log("⚠️ REGISTER - Failed to invalidate old OTPs: " . $e->getMessage());
            // Continue anyway
        }

        // Generate OTP
        try {
            $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $expiresAt = date('Y-m-d H:i:s', time() + 300); // 5 minutes
            error_log("🔍 REGISTER - Generated OTP: $otp (expires: $expiresAt)");

            // SECURITY: Store signup data temporarily (NO user created yet - only after OTP verification)
            $otpStmt = $db->prepare("
                INSERT INTO signup_otps (email, name, password_hash, phone, otp, expires_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $otpStmt->execute([$email, $name, $hashedPassword, $phone, $otp, $expiresAt]);
            $otpId = $db->lastInsertId();
            error_log("✅ REGISTER - Signup OTP stored successfully with ID: $otpId (NO USER CREATED YET)");
        } catch (PDOException $e) {
            error_log("❌ REGISTER - Failed to store signup OTP: " . $e->getMessage());
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }

        // Send OTP email (with comprehensive error handling)
        $mailSent = false;
        
        // Verify OTP was generated successfully
        if (empty($otp)) {
            error_log("❌ REGISTER - OTP is empty, cannot send email");
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }
        
        // Suppress any potential errors from email service to prevent breaking API response
        $oldErrorLevel = error_reporting(0);
        $displayErrors = ini_get('display_errors');
        ini_set('display_errors', '0');
        
        try {
            // Instantiate EmailService (constructor cannot fail, but wrap for safety)
            try {
                $emailService = new EmailService();
            } catch (Throwable $initError) {
                error_log("❌ REGISTER - Failed to instantiate EmailService: " . $initError->getMessage());
                $mailSent = false;
                throw $initError;
            }
            
            $subject = "Verify Your Email - OTP Code";
            $message = "
                <h2>Welcome to SK Bakers!</h2>
                <p>Please use the following OTP to verify your email address:</p>
                <h1 style=\"color: #e74c3c; font-size: 32px; text-align: center;\">$otp</h1>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            ";

            // EmailService never throws exceptions, always returns boolean
            $mailSent = $emailService->sendEmail($email, $subject, $message, true);
            error_log("🔍 REGISTER - Email send result: " . ($mailSent ? 'SUCCESS' : 'FAILED'));
            
        } catch (Throwable $e) {
            // This should never happen since EmailService doesn't throw, but just in case
            error_log("❌ REGISTER - Unexpected email error: " . $e->getMessage());
            error_log("❌ REGISTER - Error trace: " . $e->getTraceAsString());
            $mailSent = false;
        } finally {
            // Always restore error reporting settings
            error_reporting($oldErrorLevel);
            ini_set('display_errors', $displayErrors);
        }

        if ($mailSent) {
            sendSuccess("OTP sent to your email. Please verify your email to complete registration.", [
                "email" => $email,
                "otp_sent" => true,
                "message" => "Check your email for the verification code"
            ], 200);
        } else {
            // If email failed, delete the OTP record so user can try again
            if (!empty($otp)) {
                try {
                    $deleteStmt = $db->prepare("DELETE FROM signup_otps WHERE email = ? AND otp = ?");
                    $deleteStmt->execute([$email, $otp]);
                    error_log("⚠️ REGISTER - Deleted OTP record due to email send failure");
                } catch (Exception $e) {
                    error_log("⚠️ REGISTER - Failed to delete OTP after email failure: " . $e->getMessage());
                }
            }
            
            // Always return proper JSON error response (never breaks API)
            sendError("Failed to send OTP email. Please check your email address and try again.", [
                "email" => $email,
                "otp_sent" => false,
                "message" => "The OTP was generated but could not be sent. Please try registering again."
            ], 500);
        }

    } catch (PDOException $e) {
        error_log("❌ REGISTER - PDO Database error: " . $e->getMessage());
        error_log("❌ REGISTER - PDO Error Code: " . $e->getCode());
        error_log("❌ REGISTER - PDO Error Info: " . json_encode($e->errorInfo ?? []));
        error_log("❌ REGISTER - SQL State: " . ($e->errorInfo[0] ?? 'N/A'));
        error_log("❌ REGISTER - Driver Error Code: " . ($e->errorInfo[1] ?? 'N/A'));
        error_log("❌ REGISTER - Driver Error Message: " . ($e->errorInfo[2] ?? 'N/A'));
        
        // Provide more specific error messages
        $errorCode = $e->getCode();
        $errorMessage = $e->getMessage();
        
        if (strpos($errorMessage, 'Duplicate entry') !== false) {
            sendError("An account with this email already exists.", ["email" => "This email is already registered"], 409);
        } else if (strpos($errorMessage, 'SQLSTATE[42S22]') !== false || strpos($errorMessage, 'Unknown column') !== false) {
            sendError("Database schema error. Please contact support.", ["error" => "Table structure mismatch"], 500);
        } else if (strpos($errorMessage, 'SQLSTATE[HY000]') !== false || strpos($errorMessage, 'Connection') !== false) {
            sendError("Database connection error. Please try again later.", [], 500);
        } else {
            sendError("Database error. Please try again later.", ["error" => "Database operation failed"], 500);
        }
    } catch (Exception $e) {
        error_log("❌ REGISTER - General error: " . $e->getMessage());
        error_log("❌ REGISTER - Error trace: " . $e->getTraceAsString());
        error_log("❌ REGISTER - File: " . $e->getFile());
        error_log("❌ REGISTER - Line: " . $e->getLine());
        sendError("Registration failed. Please try again.", ["error" => $e->getMessage()], 500);
    }
}

/**
 * Login user
 */
function login($db) {
    try {
        error_log("🔍 LOGIN API - Starting login process");
        
        // Check if database connection is valid
        if (!$db) {
            error_log("❌ LOGIN API - Database connection is null");
            sendError("Database connection error", [], 500);
            return;
        }
        
        $data = getRequestBody();
        
        if (empty($data)) {
            error_log("❌ LOGIN API - No data received");
            sendError("Email and password are required", [], 400);
            return;
        }

        $errors = validateRequired($data, ["email", "password"]);
        if (!empty($errors)) {
            error_log("❌ LOGIN API - Validation failed: " . json_encode($errors));
            sendError("Please provide both email and password", $errors, 400);
            return;
        }

        $email = sanitizeInput($data["email"]);
        $password = $data["password"];
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendError("Invalid email format", ["email" => "Please enter a valid email address"], 400);
            return;
        }
        
        error_log("🔍 LOGIN API - Attempting login for email: " . $email);

        $stmt = $db->prepare("
            SELECT id, name, email, password, role, is_active, is_email_verified
            FROM users WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Don't reveal if user exists - same error message for security
            error_log("❌ LOGIN API - User not found for email: " . $email);
            sendError("Invalid email or password", [], 401);
            return;
        }

        if (!password_verify($password, $user["password"])) {
            error_log("❌ LOGIN API - Invalid password for email: " . $email);
            sendError("Invalid email or password", [], 401);
            return;
        }

        if (!$user["is_active"]) {
            error_log("❌ LOGIN API - Account deactivated for email: " . $email);
            sendError("Your account has been deactivated. Please contact support.", [], 403);
            return;
        }

        // Generate JWT token with extended expiration
        $token = AuthMiddleware::generateToken($user);
        error_log("✅ LOGIN API - Login successful for email: " . $email);

        sendSuccess("Login successful", [
            "user" => [
                "id" => $user["id"],
                "name" => $user["name"],
                "email" => $user["email"],
                "role" => $user["role"],
                "is_active" => $user["is_active"],
                "is_email_verified" => $user["is_email_verified"]
            ],
            "token" => $token
        ]);

    } catch (PDOException $e) {
        error_log("❌ LOGIN API - Database error: " . $e->getMessage());
        sendError("Database error. Please try again later.", [], 500);
    } catch (Exception $e) {
        error_log("❌ LOGIN API - General error: " . $e->getMessage());
        sendError("Login failed. Please try again.", [], 500);
    }
}

/**
 * Forgot password - Step 1: Send OTP to user's email
 * Complete flow: Email → OTP → Verify OTP → Reset Password
 * 
 * SECURITY FEATURES:
 * - Validates user email exists before sending OTP
 * - Generates cryptographically secure 6-digit OTP
 * - Stores OTP with 5-minute expiry
 * - Invalidates old unused OTPs
 * - Sends OTP via email with comprehensive error handling
 * - Returns proper JSON responses (never crashes)
 * - Logs detailed errors server-side only
 */
function forgotPassword($db) {
    // Initialize all variables to prevent undefined errors
    $email = '';
    $user = null;
    $otp = '';
    $expiresAt = '';
    $mailSent = false;
    $emailService = null;
    $emailError = null;
    
    // Top-level error handler - catches ALL errors including fatal ones
    try {
        // Start output buffering to catch any accidental output
        if (!ob_get_level()) {
            ob_start();
        }
        
        error_log("🔍 FORGOT PASSWORD - Starting password reset request");
        
        // Database connection check
        if (!$db || !is_object($db)) {
            error_log("❌ FORGOT PASSWORD - Database connection is null or invalid");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        // Get request body with error handling
        $data = null;
        try {
            $data = getRequestBody();
        } catch (Exception $e) {
            error_log("❌ FORGOT PASSWORD - Failed to get request body: " . $e->getMessage());
            sendError("Invalid request. Please try again.", [], 400);
            return;
        }
        
        if (empty($data)) {
            error_log("❌ FORGOT PASSWORD - No data received");
            sendError("Please provide your email address", [], 400);
            return;
        }

        $errors = validateRequired($data, ["email"]);
        if (!empty($errors)) {
            error_log("❌ FORGOT PASSWORD - Validation failed: " . json_encode($errors));
            sendError("Please provide a valid email address", $errors, 400);
            return;
        }

        $email = sanitizeInput(trim($data["email"]));
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_log("❌ FORGOT PASSWORD - Invalid email format: $email");
            sendError("Invalid email format", ["email" => "Please enter a valid email address"], 400);
            return;
        }

        error_log("🔍 FORGOT PASSWORD - Checking user existence for email: $email");

        // Check if user exists in database
        $user = false;
        try {
            $stmt = $db->prepare("SELECT id, name, email, is_active FROM users WHERE email = ? LIMIT 1");
            if (!$stmt) {
                error_log("❌ FORGOT PASSWORD - Failed to prepare statement");
                sendError("Database error. Please try again.", [], 500);
                return;
            }
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC); // Explicitly use FETCH_ASSOC for safety
            if ($user === false) {
                $user = null; // Normalize false to null
            }
        } catch (PDOException $e) {
            error_log("❌ FORGOT PASSWORD - Database query error: " . $e->getMessage());
            error_log("❌ FORGOT PASSWORD - SQL State: " . ($e->getCode() ?? 'N/A'));
            sendError("Database error. Please try again.", [], 500);
            return;
        } catch (Exception $e) {
            error_log("❌ FORGOT PASSWORD - Unexpected error during user lookup: " . $e->getMessage());
            sendError("An error occurred. Please try again.", [], 500);
            return;
        }

        if (!$user || !is_array($user)) {
            // Security: Don't reveal if email exists - same message for security
            error_log("⚠️ FORGOT PASSWORD - User not found for email: $email (not revealing existence)");
            sendError("If an account exists with this email, an OTP will be sent.", [], 200);
            return;
        }
        
        // Verify user array has required fields BEFORE accessing them
        if (!isset($user['id']) || empty($user['id']) || !isset($user['name']) || empty($user['name'])) {
            error_log("❌ FORGOT PASSWORD - User data incomplete for email: $email");
            error_log("❌ FORGOT PASSWORD - User data: " . json_encode($user));
            sendError("User data incomplete. Please contact support.", [], 500);
            return;
        }
        
        // Check if account is active
        if (isset($user['is_active']) && ($user['is_active'] == 0 || $user['is_active'] === '0')) {
            error_log("❌ FORGOT PASSWORD - Account is deactivated for email: $email");
            sendError("This account has been deactivated. Please contact support.", [], 403);
            return;
        }

        // Ensure password_reset_tokens table exists
        try {
            $checkTable = $db->prepare("SHOW TABLES LIKE 'password_reset_tokens'");
            $checkTable->execute();
            $tableExists = $checkTable->fetch();
            
            if (!$tableExists) {
                error_log("🔍 FORGOT PASSWORD - Creating password_reset_tokens table");
                $createTable = "
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        used TINYINT(1) DEFAULT 0,
                        INDEX idx_email_token (email, token),
                        INDEX idx_expires (expires_at),
                        INDEX idx_user_id (user_id),
                        INDEX idx_created (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ";
                $db->exec($createTable);
                error_log("✅ FORGOT PASSWORD - password_reset_tokens table created");
            }
        } catch (Exception $e) {
            error_log("❌ FORGOT PASSWORD - Table creation error: " . $e->getMessage());
            sendError("Database setup error. Please try again.", [], 500);
            return;
        }

        // SECURITY: Invalidate old unused OTPs for this email
        try {
            $invalidateStmt = $db->prepare("
                UPDATE password_reset_tokens 
                SET used = 1 
                WHERE email = ? AND used = 0 AND expires_at > NOW()
            ");
            $invalidateStmt->execute([$email]);
            error_log("🔍 FORGOT PASSWORD - Invalidated old unused OTPs for email: $email");
        } catch (Exception $e) {
            error_log("⚠️ FORGOT PASSWORD - Failed to invalidate old OTPs: " . $e->getMessage());
            // Continue anyway
        }

        // Generate cryptographically secure 6-digit OTP
        try {
            $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $expiresAt = date('Y-m-d H:i:s', time() + 300); // 5 minutes expiry
            error_log("🔍 FORGOT PASSWORD - Generated OTP for email: $email (expires: $expiresAt)");
        } catch (Exception $e) {
            error_log("❌ FORGOT PASSWORD - Failed to generate OTP: " . $e->getMessage());
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }

        // Store OTP in database
        try {
            // Verify user ID exists before using it
            if (!isset($user["id"]) || empty($user["id"])) {
                error_log("❌ FORGOT PASSWORD - User ID missing");
                sendError("Failed to generate OTP. Please try again.", [], 500);
                return;
            }
            
            $otpStmt = $db->prepare("
                INSERT INTO password_reset_tokens (user_id, email, token, expires_at) 
                VALUES (?, ?, ?, ?)
            ");
            $otpStmt->execute([$user["id"], $email, $otp, $expiresAt]);
            $otpId = $db->lastInsertId();
            
            if (!$otpId || $otpId == 0) {
                error_log("❌ FORGOT PASSWORD - Failed to get OTP ID after insert");
                sendError("Failed to generate OTP. Please try again.", [], 500);
                return;
            }
            
            error_log("✅ FORGOT PASSWORD - OTP stored successfully with ID: $otpId");
        } catch (PDOException $e) {
            error_log("❌ FORGOT PASSWORD - Failed to store OTP: " . $e->getMessage());
            error_log("❌ FORGOT PASSWORD - PDO Error Info: " . json_encode($e->errorInfo ?? []));
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }

        // Send OTP email (with comprehensive error handling)
        // Verify OTP was generated successfully
        if (empty($otp)) {
            error_log("❌ FORGOT PASSWORD - OTP is empty, cannot send email");
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }
        
        // Suppress any potential errors from email service to prevent breaking API response
        // Store original error reporting settings
        $oldErrorLevel = error_reporting();
        $displayErrors = ini_get('display_errors');
        
        // Suppress errors during email sending
        error_reporting(E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR);
        ini_set('display_errors', '0');
        
        $mailSent = false;
        $emailError = null;
        try {
            // Check if EmailService class exists and was loaded
            if (!class_exists('EmailService')) {
                error_log("❌ FORGOT PASSWORD - EmailService class not available");
                $mailSent = false;
                $emailError = "Email service class not found - falling back to basic mail";
                
                // Try basic PHP mail() as fallback
                $subject = "Password Reset OTP - SK Bakers";
                $userName = isset($user) && is_array($user) && isset($user["name"]) ? htmlspecialchars($user["name"], ENT_QUOTES, 'UTF-8') : "User";
                $message = "
                    <h2>Password Reset Request</h2>
                    <p>Hello " . $userName . ",</p>
                    <p>You requested a password reset. Use the following OTP:</p>
                    <h1 style=\"color: #e74c3c; font-size: 32px; text-align: center;\">" . htmlspecialchars($otp, ENT_QUOTES, 'UTF-8') . "</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                ";
                
                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "From: SK Bakers <noreply@skbakers.com>\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                
                $mailSent = @mail($email, $subject, $message, $headers);
                if ($mailSent) {
                    error_log("✅ FORGOT PASSWORD - Email sent via basic mail() fallback");
                } else {
                    error_log("❌ FORGOT PASSWORD - Basic mail() also failed");
                    $emailError = "Both EmailService and basic mail() failed";
                }
            } else {
                // Instantiate EmailService (constructor cannot fail, but wrap for safety)
                try {
                    $emailService = new EmailService();
                    if (!is_object($emailService)) {
                        error_log("❌ FORGOT PASSWORD - EmailService instantiation returned non-object");
                        $mailSent = false;
                        $emailError = "Email service initialization returned invalid object";
                    }
                } catch (Throwable $initError) {
                    error_log("❌ FORGOT PASSWORD - Failed to instantiate EmailService: " . $initError->getMessage());
                    error_log("❌ FORGOT PASSWORD - Init error trace: " . $initError->getTraceAsString());
                    error_log("❌ FORGOT PASSWORD - Init error file: " . $initError->getFile() . ", Line: " . $initError->getLine());
                    $mailSent = false;
                    $emailError = "Email service initialization error: " . $initError->getMessage();
                }
            }
            
            // Only proceed if EmailService is available and instantiated
            if (isset($emailService) && is_object($emailService)) {
                $subject = "Password Reset OTP - SK Bakers";
                // Safely get user name with multiple fallbacks
                $userName = "User";
                if (isset($user) && is_array($user) && isset($user["name"]) && !empty($user["name"])) {
                    $userName = htmlspecialchars($user["name"], ENT_QUOTES, 'UTF-8');
                } elseif (isset($user) && is_array($user) && isset($user["email"])) {
                    $userName = htmlspecialchars($user["email"], ENT_QUOTES, 'UTF-8');
                }
                
                $message = "
                    <h2>Password Reset Request</h2>
                    <p>Hello " . $userName . ",</p>
                    <p>You requested a password reset. Use the following OTP:</p>
                    <h1 style=\"color: #e74c3c; font-size: 32px; text-align: center;\">" . htmlspecialchars($otp, ENT_QUOTES, 'UTF-8') . "</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                ";

                // EmailService never throws exceptions, always returns boolean
                $mailSent = $emailService->sendEmail($email, $subject, $message, true);
                if (!$mailSent) {
                    $emailError = "Email sending returned false";
                }
            } else {
                error_log("❌ FORGOT PASSWORD - Cannot proceed with email sending - service unavailable");
                $mailSent = false;
                $emailError = "Email service not available";
            }
            
        } catch (Throwable $e) {
            // This should never happen since EmailService doesn't throw, but just in case
            error_log("❌ FORGOT PASSWORD - Unexpected email error: " . $e->getMessage());
            error_log("❌ FORGOT PASSWORD - Error trace: " . $e->getTraceAsString());
            error_log("❌ FORGOT PASSWORD - Error file: " . $e->getFile() . ", Line: " . $e->getLine());
            $mailSent = false;
            $emailError = $e->getMessage();
        } finally {
            // Always restore error reporting settings
            error_reporting($oldErrorLevel);
            ini_set('display_errors', $displayErrors);
        }
        
        // Log email error details if available
        if (!$mailSent && $emailError) {
            error_log("❌ FORGOT PASSWORD - Email error details: " . $emailError);
        }

        // Clean output buffer before sending response
        if (ob_get_level()) {
            ob_clean();
        }
        
        if ($mailSent) {
            error_log("✅ FORGOT PASSWORD - OTP email sent successfully to: $email");
            
            // Clean buffer again before sending
            if (ob_get_level()) {
                ob_clean();
            }
            
            sendSuccess("OTP sent to your email address. Please check your inbox.", [
                "otp_sent" => true,
                "email" => $email,
                "message" => "Check your email for the verification code",
                "expires_in" => "5 minutes"
            ], 200);
            return; // Explicit return
        } else {
            // If email failed, delete the OTP record so user can try again
            if (!empty($otp) && !empty($email)) {
                try {
                    $deleteStmt = $db->prepare("DELETE FROM password_reset_tokens WHERE email = ? AND token = ?");
                    $deleteStmt->execute([$email, $otp]);
                    error_log("⚠️ FORGOT PASSWORD - Deleted OTP record due to email send failure");
                } catch (Exception $e) {
                    error_log("⚠️ FORGOT PASSWORD - Failed to delete OTP after email failure: " . $e->getMessage());
                }
            }
            
            error_log("❌ FORGOT PASSWORD - Failed to send OTP email to: $email");
            if ($emailError) {
                error_log("❌ FORGOT PASSWORD - Email error reason: " . $emailError);
            }
            
            // Clean buffer again before sending
            if (ob_get_level()) {
                ob_clean();
            }
            
            // Return 200 with error message instead of 500 for email failures (non-critical)
            // This prevents false 500 errors and provides better UX
            sendError("Unable to send OTP email at this time. Please try again later or contact support.", [
                "email" => $email,
                "otp_sent" => false,
                "message" => "The OTP was generated but could not be sent. Please try again in a few moments.",
                "suggestion" => "If the problem persists, please contact our support team."
            ], 200);
            return; // Explicit return
        }

    } catch (PDOException $e) {
        // Clean any output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Log full error details (not exposed to user for security)
        error_log("❌ FORGOT PASSWORD - PDO Database error: " . $e->getMessage());
        error_log("❌ FORGOT PASSWORD - PDO Error Info: " . json_encode($e->errorInfo ?? []));
        error_log("❌ FORGOT PASSWORD - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        // Return user-friendly error without exposing system details
        sendError("A database error occurred. Please try again later.", [
            "message" => "We're experiencing technical difficulties. Please try again in a moment.",
            "error_code" => "DB_ERROR"
        ], 500);
        return;
    } catch (Exception $e) {
        // Clean any output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Log full error details (not exposed to user for security)
        error_log("❌ FORGOT PASSWORD - General error: " . $e->getMessage());
        error_log("❌ FORGOT PASSWORD - Error trace: " . $e->getTraceAsString());
        error_log("❌ FORGOT PASSWORD - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        // Return user-friendly error without exposing system details
        sendError("An unexpected error occurred. Please try again.", [
            "message" => "We're experiencing technical difficulties. Please try again in a moment.",
            "error_code" => "SYSTEM_ERROR"
        ], 500);
        return;
    } catch (Throwable $e) {
        // Clean any output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Catch any other errors (including fatal errors converted to exceptions)
        error_log("❌ FORGOT PASSWORD - Fatal error: " . $e->getMessage());
        error_log("❌ FORGOT PASSWORD - Error trace: " . $e->getTraceAsString());
        error_log("❌ FORGOT PASSWORD - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        sendError("A system error occurred. Please try again later.", [
            "message" => "We're experiencing technical difficulties. Please try again in a moment.",
            "error_code" => "FATAL_ERROR"
        ], 500);
        return;
    } catch (Error $e) {
        // Catch PHP 7+ Error class (fatal errors)
        // Clean any output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        error_log("❌ FORGOT PASSWORD - PHP Error: " . $e->getMessage());
        error_log("❌ FORGOT PASSWORD - Error trace: " . $e->getTraceAsString());
        error_log("❌ FORGOT PASSWORD - File: " . $e->getFile() . ", Line: " . $e->getLine());
        
        sendError("A critical error occurred. Please try again later.", [
            "message" => "We're experiencing technical difficulties. Please try again in a moment.",
            "error_code" => "CRITICAL_ERROR"
        ], 500);
        return;
    }
}

/**
 * Verify OTP - Step 2: Verify the OTP entered by user
 * This validates the OTP before allowing password reset
 */
function verifyOtp($db) {
    $email = "";
    $otp = "";
    $token = null;
    
    try {
        error_log("🔍 VERIFY OTP - Starting OTP verification");
        
        // Database connection check
        if (!$db) {
            error_log("❌ VERIFY OTP - Database connection is null");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        $data = getRequestBody();
        
        if (empty($data)) {
            error_log("❌ VERIFY OTP - No data received");
            sendError("Please provide email and OTP", [], 400);
            return;
        }

        $errors = validateRequired($data, ["email", "otp"]);
        if (!empty($errors)) {
            error_log("❌ VERIFY OTP - Validation failed: " . json_encode($errors));
            sendError("Please provide both email and OTP", $errors, 400);
            return;
        }

        $email = sanitizeInput(trim($data["email"]));
        $otp = sanitizeInput(trim($data["otp"]));
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_log("❌ VERIFY OTP - Invalid email format: $email");
            sendError("Invalid email format", ["email" => "Please enter a valid email address"], 400);
            return;
        }
        
        // Validate OTP format (6 digits)
        if (!preg_match("/^[0-9]{6}$/", $otp)) {
            error_log("❌ VERIFY OTP - Invalid OTP format: $otp");
            sendError("OTP must be 6 digits", ["otp" => "Please enter a valid 6-digit OTP"], 400);
            return;
        }
        
        error_log("🔍 VERIFY OTP - Verifying OTP for email: $email");

        // Ensure password_reset_tokens table exists
        try {
            $checkTable = $db->prepare("SHOW TABLES LIKE 'password_reset_tokens'");
            $checkTable->execute();
            $tableExists = $checkTable->fetch();
            
            if (!$tableExists) {
                $createTable = "
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        used TINYINT(1) DEFAULT 0,
                        INDEX idx_email_token (email, token),
                        INDEX idx_expires (expires_at),
                        INDEX idx_user_id (user_id),
                        INDEX idx_created (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ";
                $db->exec($createTable);
            }
        } catch (Exception $e) {
            error_log("Table creation error: " . $e->getMessage());
            sendError("Database setup error", [], 500);
            return;
        }

        // Verify OTP from database
        try {
            $verifyStmt = $db->prepare("
                SELECT id, user_id, token, expires_at, created_at
                FROM password_reset_tokens 
                WHERE email = ? AND token = ? AND expires_at > NOW() AND used = 0
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $verifyStmt->execute([$email, $otp]);
            $token = $verifyStmt->fetch();
        } catch (PDOException $e) {
            error_log("❌ VERIFY OTP - Database query error: " . $e->getMessage());
            sendError("Database error. Please try again.", [], 500);
            return;
        }

        if (!$token) {
            error_log("❌ VERIFY OTP - Invalid or expired OTP for email: $email");
            sendError("Invalid or expired OTP. Please try again or request a new one.", [
                "otp_invalid" => true,
                "message" => "The OTP you entered is incorrect or has expired. OTPs expire after 5 minutes."
            ], 400);
            return;
        }

        // SECURITY: Don't mark as used yet - allow user to proceed to password reset
        // OTP will be marked as used in resetPassword() after successful password update
        // This allows the user to verify OTP first, then reset password in separate steps
        
        // Verify token array has required fields before accessing
        if (!isset($token["user_id"])) {
            error_log("❌ VERIFY OTP - Token data incomplete, missing user_id");
            sendError("OTP verification failed. Please try again.", [], 500);
            return;
        }
        
        $userId = $token["user_id"];
        error_log("✅ VERIFY OTP - OTP verified successfully for email: $email, User ID: $userId");
        
        sendSuccess("OTP verified successfully. You can now reset your password.", [
            "user_id" => $userId,
            "email" => $email,
            "verified" => true,
            "message" => "OTP verified. Please proceed to set your new password."
        ], 200);

    } catch (PDOException $e) {
        error_log("❌ VERIFY OTP - PDO Database error: " . $e->getMessage());
        error_log("❌ VERIFY OTP - PDO Error Info: " . json_encode($e->errorInfo ?? []));
        sendError("Database error. Please try again.", [], 500);
    } catch (Exception $e) {
        error_log("❌ VERIFY OTP - General error: " . $e->getMessage());
        error_log("❌ VERIFY OTP - Error trace: " . $e->getTraceAsString());
        sendError("OTP verification failed. Please try again.", [], 500);
    }
}

/**
 * Reset Password - Step 3: Update password after OTP verification
 * This function verifies OTP one more time and updates the password securely
 */
function resetPassword($db) {
    $email = "";
    $otp = "";
    $newPassword = "";
    $token = null;
    $userId = null;
    
    try {
        error_log("🔍 RESET PASSWORD - Starting password reset");
        
        // Database connection check
        if (!$db) {
            error_log("❌ RESET PASSWORD - Database connection is null");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        $data = getRequestBody();
        
        if (empty($data)) {
            error_log("❌ RESET PASSWORD - No data received");
            sendError("Please provide all required information", [], 400);
            return;
        }

        $errors = validateRequired($data, ["email", "otp", "new_password"]);
        if (!empty($errors)) {
            error_log("❌ RESET PASSWORD - Validation failed: " . json_encode($errors));
            sendError("Please provide email, OTP, and new password", $errors, 400);
            return;
        }

        $email = sanitizeInput(trim($data["email"]));
        $otp = sanitizeInput(trim($data["otp"]));
        $newPassword = $data["new_password"]; // Don't sanitize password - keep it as-is for hashing
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_log("❌ RESET PASSWORD - Invalid email format: $email");
            sendError("Invalid email format", ["email" => "Please enter a valid email address"], 400);
            return;
        }
        
        // Validate OTP format (6 digits)
        if (!preg_match("/^[0-9]{6}$/", $otp)) {
            error_log("❌ RESET PASSWORD - Invalid OTP format: $otp");
            sendError("OTP must be 6 digits", ["otp" => "Please enter a valid 6-digit OTP"], 400);
            return;
        }
        
        // Validate password strength
        if (strlen($newPassword) < 6) {
            error_log("❌ RESET PASSWORD - Password too short");
            sendError("Password must be at least 6 characters long", ["password" => "Password is too short"], 400);
            return;
        }
        
        // SECURITY: Check password isn't too long (prevent DoS)
        if (strlen($newPassword) > 128) {
            error_log("❌ RESET PASSWORD - Password too long");
            sendError("Password is too long. Maximum 128 characters allowed.", ["password" => "Password exceeds maximum length"], 400);
            return;
        }
        
        error_log("🔍 RESET PASSWORD - Processing password reset for email: $email");

        // Ensure password_reset_tokens table exists
        try {
            $checkTable = $db->prepare("SHOW TABLES LIKE 'password_reset_tokens'");
            $checkTable->execute();
            $tableExists = $checkTable->fetch();
            
            if (!$tableExists) {
                $createTable = "
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        used TINYINT(1) DEFAULT 0,
                        INDEX idx_email_token (email, token),
                        INDEX idx_expires (expires_at),
                        INDEX idx_user_id (user_id),
                        INDEX idx_created (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ";
                $db->exec($createTable);
            }
        } catch (Exception $e) {
            error_log("Table creation error: " . $e->getMessage());
            sendError("Database setup error", [], 500);
            return;
        }

        // SECURITY: Verify OTP again before password reset (double verification)
        // Note: OTP should not be marked as used yet (verified but not used for password reset)
        try {
            $verifyStmt = $db->prepare("
                SELECT id, user_id, token, expires_at, created_at, used
                FROM password_reset_tokens 
                WHERE email = ? AND token = ? AND expires_at > NOW() AND used = 0
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $verifyStmt->execute([$email, $otp]);
            $token = $verifyStmt->fetch();
        } catch (PDOException $e) {
            error_log("❌ RESET PASSWORD - Database query error: " . $e->getMessage());
            sendError("Database error. Please try again.", [], 500);
            return;
        }

        if (!$token) {
            error_log("❌ RESET PASSWORD - Invalid or expired OTP for email: $email");
            sendError("Invalid or expired OTP. Please request a new password reset.", [
                "otp_invalid" => true,
                "message" => "The OTP you entered is incorrect or has expired. OTPs expire after 5 minutes."
            ], 400);
            return;
        }
        
        // Verify token data is complete
        if (!isset($token["user_id"]) || !isset($token["id"])) {
            error_log("❌ RESET PASSWORD - Token data incomplete");
            sendError("OTP verification failed. Please try again.", [], 500);
            return;
        }
        
        $userId = $token["user_id"];
        error_log("✅ RESET PASSWORD - OTP verified for user ID: $userId");

        // SECURITY: Verify user still exists and is active
        try {
            $userCheck = $db->prepare("SELECT id, email, is_active FROM users WHERE id = ? AND email = ?");
            $userCheck->execute([$userId, $email]);
            $user = $userCheck->fetch();
            
            if (!$user) {
                error_log("❌ RESET PASSWORD - User not found: ID=$userId, Email=$email");
                sendError("User account not found. Please contact support.", [], 404);
                return;
            }
            
            if (isset($user['is_active']) && $user['is_active'] == 0) {
                error_log("❌ RESET PASSWORD - Account deactivated for user ID: $userId");
                sendError("This account has been deactivated. Please contact support.", [], 403);
                return;
            }
        } catch (PDOException $e) {
            error_log("❌ RESET PASSWORD - User verification error: " . $e->getMessage());
            sendError("Database error. Please try again.", [], 500);
            return;
        }

        // SECURITY: Hash password using bcrypt (PASSWORD_DEFAULT uses bcrypt)
        try {
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            if (!$hashedPassword) {
                error_log("❌ RESET PASSWORD - Password hashing failed");
                sendError("Failed to process password. Please try again.", [], 500);
                return;
            }
            error_log("🔍 RESET PASSWORD - Password hashed successfully");
        } catch (Exception $e) {
            error_log("❌ RESET PASSWORD - Password hashing error: " . $e->getMessage());
            sendError("Failed to process password. Please try again.", [], 500);
            return;
        }

        // SECURITY: Update password in database using transaction-like logic
        // First mark OTP as used to prevent concurrent use, then update password
        try {
            // Start: Mark OTP as used first to lock it (prevents race conditions)
            $updateTokenStmt = $db->prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ? AND used = 0");
            $updateTokenStmt->execute([$token["id"]]);
            
            if ($updateTokenStmt->rowCount() === 0) {
                error_log("❌ RESET PASSWORD - OTP already used or not found. Possible concurrent request.");
                sendError("This OTP has already been used or expired. Please request a new password reset.", [], 400);
                return;
            }
            
            error_log("✅ RESET PASSWORD - OTP token locked for password update");
        } catch (Exception $e) {
            error_log("❌ RESET PASSWORD - Failed to mark token as used: " . $e->getMessage());
            sendError("Failed to process password reset. Please try again.", [], 500);
            return;
        }

        // Update password in database
        try {
            $updateStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ? AND email = ?");
            $updateStmt->execute([$hashedPassword, $userId, $email]);
            
            if ($updateStmt->rowCount() === 0) {
                error_log("❌ RESET PASSWORD - No rows updated for user ID: $userId");
                // Rollback: Try to unmark OTP as used if password update failed
                try {
                    $rollbackStmt = $db->prepare("UPDATE password_reset_tokens SET used = 0 WHERE id = ?");
                    $rollbackStmt->execute([$token["id"]]);
                    error_log("⚠️ RESET PASSWORD - Rolled back OTP usage due to password update failure");
                } catch (Exception $rollbackError) {
                    error_log("⚠️ RESET PASSWORD - Failed to rollback OTP: " . $rollbackError->getMessage());
                }
                sendError("Failed to update password. Please try again.", [], 500);
                return;
            }
            
            error_log("✅ RESET PASSWORD - Password updated successfully for user ID: $userId");
        } catch (PDOException $e) {
            error_log("❌ RESET PASSWORD - Password update error: " . $e->getMessage());
            // Rollback: Try to unmark OTP as used if password update failed
            try {
                $rollbackStmt = $db->prepare("UPDATE password_reset_tokens SET used = 0 WHERE id = ?");
                $rollbackStmt->execute([$token["id"]]);
                error_log("⚠️ RESET PASSWORD - Rolled back OTP usage due to password update error");
            } catch (Exception $rollbackError) {
                error_log("⚠️ RESET PASSWORD - Failed to rollback OTP: " . $rollbackError->getMessage());
            }
            sendError("Failed to update password. Please try again.", [], 500);
            return;
        }

        error_log("✅ RESET PASSWORD - SUCCESS for user ID: $userId, Email: $email");
        
        sendSuccess("Password reset successfully! You can now login with your new password.", [
            "user_id" => $userId,
            "email" => $email,
            "reset" => true,
            "message" => "Your password has been updated successfully. Please login with your new password.",
            "timestamp" => date("Y-m-d H:i:s")
        ], 200);

    } catch (PDOException $e) {
        error_log("❌ RESET PASSWORD - PDO Database error: " . $e->getMessage());
        error_log("❌ RESET PASSWORD - PDO Error Info: " . json_encode($e->errorInfo ?? []));
        sendError("Database error. Please try again.", [], 500);
    } catch (Exception $e) {
        error_log("❌ RESET PASSWORD - General error: " . $e->getMessage());
        error_log("❌ RESET PASSWORD - Error trace: " . $e->getTraceAsString());
        sendError("Password reset failed. Please try again.", [], 500);
    }
}

/**
 * Resend signup OTP - Works with signup_otps table (no user required)
 */
function resendSignupOtp($db) {
    try {
        error_log("🔍 RESEND SIGNUP OTP - Starting resend process");
        
        // Database connection check
        if (!$db) {
            error_log("❌ RESEND OTP - Database connection is null");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        $data = getRequestBody();
        
        if (empty($data)) {
            error_log("❌ RESEND OTP - No data received");
            sendError("No data received", [], 400);
            return;
        }

        $errors = validateRequired($data, ["email"]);
        if (!empty($errors)) {
            error_log("❌ RESEND OTP - Validation failed");
            sendError("Validation failed", $errors, 400);
            return;
        }

        $email = sanitizeInput($data["email"]);
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendError("Invalid email format", ["email" => "Please enter a valid email address"], 400);
            return;
        }

        error_log("🔍 RESEND OTP - Processing email: $email");

        // SECURITY: Check if signup OTP exists (user may not exist yet)
        try {
            $checkSignupOtp = $db->prepare("
                SELECT id, name, email 
                FROM signup_otps 
                WHERE email = ? AND used = 0 AND expires_at > NOW()
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $checkSignupOtp->execute([$email]);
            $existingOtp = $checkSignupOtp->fetch();
        } catch (PDOException $e) {
            error_log("❌ RESEND OTP - Database query error: " . $e->getMessage());
            sendError("Database error. Please try again.", [], 500);
            return;
        }

        if (!$existingOtp) {
            error_log("❌ RESEND OTP - No active signup OTP found for email: $email");
            sendError("No active signup request found. Please register again.", [], 404);
            return;
        }

        // Mark old OTP as used
        try {
            $invalidateStmt = $db->prepare("UPDATE signup_otps SET used = 1 WHERE email = ? AND used = 0");
            $invalidateStmt->execute([$email]);
            error_log("🔍 RESEND OTP - Invalidated old OTPs for email: $email");
        } catch (Exception $e) {
            error_log("⚠️ RESEND OTP - Failed to invalidate old OTPs: " . $e->getMessage());
        }

        // Generate new OTP
        $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + 300); // 5 minutes

        // Get signup data from existing OTP to preserve user details
        try {
            $getSignupData = $db->prepare("
                SELECT name, password_hash, phone 
                FROM signup_otps 
                WHERE email = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $getSignupData->execute([$email]);
            $signupData = $getSignupData->fetch();
        } catch (PDOException $e) {
            error_log("❌ RESEND OTP - Failed to get signup data: " . $e->getMessage());
            sendError("Database error. Please try again.", [], 500);
            return;
        }

        if (!$signupData) {
            error_log("❌ RESEND OTP - No signup data found for email: $email");
            sendError("Signup data not found. Please register again.", [], 404);
            return;
        }

        // Store new OTP with existing signup data
        try {
            $otpStmt = $db->prepare("
                INSERT INTO signup_otps (email, name, password_hash, phone, otp, expires_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $otpStmt->execute([
                $email,
                $signupData['name'],
                $signupData['password_hash'],
                $signupData['phone'],
                $otp,
                $expiresAt
            ]);
            error_log("✅ RESEND OTP - New OTP stored for email: $email");
        } catch (PDOException $e) {
            error_log("❌ RESEND OTP - Failed to store new OTP: " . $e->getMessage());
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }

        // Send OTP email (with comprehensive error handling)
        // Verify OTP was generated successfully
        if (empty($otp)) {
            error_log("❌ RESEND OTP - OTP is empty, cannot send email");
            sendError("Failed to generate OTP. Please try again.", [], 500);
            return;
        }
        
        // Initialize mailSent variable
        $mailSent = false;
        
        // Suppress any potential errors from email service to prevent breaking API response
        $oldErrorLevel = error_reporting(0);
        $displayErrors = ini_get('display_errors');
        ini_set('display_errors', '0');
        
        try {
            // Instantiate EmailService (constructor cannot fail, but wrap for safety)
            try {
                $emailService = new EmailService();
            } catch (Throwable $initError) {
                error_log("❌ RESEND OTP - Failed to instantiate EmailService: " . $initError->getMessage());
                $mailSent = false;
                throw $initError;
            }
            
            $subject = "Verify Your Email - New OTP Code";
            $message = "
                <h2>New OTP Code - SK Bakers</h2>
                <p>Hello " . htmlspecialchars($signupData['name']) . ",</p>
                <p>Here is your new OTP code:</p>
                <h1 style=\"color: #e74c3c; font-size: 32px; text-align: center;\">$otp</h1>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            ";

            // EmailService never throws exceptions, always returns boolean
            $mailSent = $emailService->sendEmail($email, $subject, $message, true);
            
        } catch (Throwable $e) {
            // This should never happen since EmailService doesn't throw, but just in case
            error_log("❌ RESEND OTP - Unexpected email error: " . $e->getMessage());
            error_log("❌ RESEND OTP - Error trace: " . $e->getTraceAsString());
            $mailSent = false;
        } finally {
            // Always restore error reporting settings
            error_reporting($oldErrorLevel);
            ini_set('display_errors', $displayErrors);
        }

        if ($mailSent) {
            error_log("✅ RESEND OTP - Email sent successfully to: $email");
            sendSuccess("New OTP sent to your email", ["otp_sent" => true]);
        } else {
            error_log("❌ RESEND OTP - Failed to send email to: $email");
            // Delete the OTP if email failed
            try {
                $deleteStmt = $db->prepare("DELETE FROM signup_otps WHERE email = ? AND otp = ?");
                $deleteStmt->execute([$email, $otp]);
            } catch (Exception $e) {
                error_log("⚠️ RESEND OTP - Failed to delete OTP after email failure");
            }
            sendError("Failed to send OTP email. Please check your email address.", [], 500);
        }

    } catch (Exception $e) {
        error_log("❌ RESEND OTP ERROR: " . $e->getMessage());
        error_log("❌ RESEND OTP TRACE: " . $e->getTraceAsString());
        sendError("Failed to resend OTP", ["error" => $e->getMessage()], 500);
    }
}

/**
 * SECURE VERIFY SIGNUP OTP - Creates user account ONLY after OTP verification
 * This ensures no user data is stored in database until email is verified
 */
function verifySignupOtp($db) {
    $email = "";
    $otp = "";
    $signupData = null;
    $data = [];
    $userId = null;
    
    try {
        error_log("🔍 SECURE OTP VERIFICATION STARTED - Will create user after verification");
        
        // Database connection check
        if (!$db) {
            error_log("❌ OTP VERIFICATION - Database connection is null");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        $data = getRequestBody();
        
        if (empty($data)) {
            error_log("❌ OTP VERIFICATION - No data received");
            sendError("No data received. Please try again.", [], 400);
            return;
        }
        
        error_log("🔍 OTP VERIFICATION - Data received: " . json_encode($data));
        
        // Validate required fields
        if (!isset($data["email"]) || empty(trim($data["email"]))) {
            error_log("❌ OTP VERIFICATION - Email missing or empty");
            sendError("Email is required", [], 400);
            return;
        }
        
        if (!isset($data["otp"]) || empty(trim($data["otp"]))) {
            error_log("❌ OTP VERIFICATION - OTP missing or empty");
            sendError("OTP is required", [], 400);
            return;
        }
        
        $email = sanitizeInput(trim($data["email"]));
        $otp = sanitizeInput(trim($data["otp"]));
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_log("❌ OTP VERIFICATION - Invalid email format: $email");
            sendError("Invalid email format", [], 400);
            return;
        }
        
        // Validate OTP format (6 digits)
        if (!preg_match("/^[0-9]{6}$/", $otp)) {
            error_log("❌ OTP VERIFICATION - Invalid OTP format: $otp");
            sendError("OTP must be 6 digits", [], 400);
            return;
        }
        
        error_log("🔍 OTP VERIFICATION - Processing email: $email, OTP: $otp");
        
        // SECURITY: Verify OTP from signup_otps table (not password_reset_tokens)
        try {
            $verifyStmt = $db->prepare("
                SELECT id, email, name, password_hash, phone, otp, expires_at, created_at
                FROM signup_otps 
                WHERE email = ? AND otp = ? AND expires_at > NOW() AND used = 0
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $verifyStmt->execute([$email, $otp]);
            $signupData = $verifyStmt->fetch();
            
            if (!$signupData) {
                error_log("❌ OTP VERIFICATION - Invalid or expired OTP for email: $email");
                sendError("Invalid or expired OTP. Please try again or request a new one.", [], 400);
                return;
            }
            
            error_log("✅ OTP VERIFICATION - Valid OTP found for email: $email");
            
        } catch (Exception $e) {
            error_log("❌ OTP VERIFICATION - Query error: " . $e->getMessage());
            sendError("OTP verification failed. Please try again.", [], 500);
            return;
        }
        
        // SECURITY: Check if user already exists (prevent duplicate creation)
        try {
            $checkUserStmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $checkUserStmt->execute([$email]);
            $existingUser = $checkUserStmt->fetch();
            
            if ($existingUser) {
                error_log("⚠️ OTP VERIFICATION - User already exists, activating account instead");
                $userId = $existingUser['id'];
                
                // Activate existing user
                $checkEmailVerified = $db->prepare("SHOW COLUMNS FROM users LIKE 'is_email_verified'");
                $checkEmailVerified->execute();
                $hasEmailVerified = $checkEmailVerified->fetch();
                
                $checkIsActive = $db->prepare("SHOW COLUMNS FROM users LIKE 'is_active'");
                $checkIsActive->execute();
                $hasIsActive = $checkIsActive->fetch();
                
                if ($hasEmailVerified && $hasIsActive) {
                    $activateStmt = $db->prepare("UPDATE users SET is_email_verified = 1, is_active = 1 WHERE id = ?");
                    $activateStmt->execute([$userId]);
                    error_log("✅ OTP VERIFICATION - Existing user activated: $userId");
                }
            } else {
                // SECURITY: CREATE USER ACCOUNT ONLY AFTER OTP VERIFICATION
                error_log("🔍 OTP VERIFICATION - Creating new user account (OTP verified)");
                
                // Check table structure
                $checkEmailVerified = $db->prepare("SHOW COLUMNS FROM users LIKE 'is_email_verified'");
                $checkEmailVerified->execute();
                $hasEmailVerified = $checkEmailVerified->fetch();
                
                $checkIsActive = $db->prepare("SHOW COLUMNS FROM users LIKE 'is_active'");
                $checkIsActive->execute();
                $hasIsActive = $checkIsActive->fetch();
                
                // Create user with verified status
                if ($hasIsActive && $hasEmailVerified) {
                    $createUserStmt = $db->prepare("
                        INSERT INTO users (name, email, password, phone, role, is_active, is_email_verified, created_at) 
                        VALUES (?, ?, ?, ?, 'user', 1, 1, NOW())
                    ");
                    $createUserStmt->execute([
                        $signupData['name'],
                        $signupData['email'],
                        $signupData['password_hash'],
                        $signupData['phone']
                    ]);
                } else {
                    $createUserStmt = $db->prepare("
                        INSERT INTO users (name, email, password, phone, role, created_at) 
                        VALUES (?, ?, ?, ?, 'user', NOW())
                    ");
                    $createUserStmt->execute([
                        $signupData['name'],
                        $signupData['email'],
                        $signupData['password_hash'],
                        $signupData['phone']
                    ]);
                }
                
                $userId = $db->lastInsertId();
                if (!$userId || $userId == 0) {
                    error_log("❌ OTP VERIFICATION - Failed to create user account");
                    
                    // Rollback: Try to mark OTP as unused if user creation failed
                    try {
                        $rollbackStmt = $db->prepare("UPDATE signup_otps SET used = 0 WHERE id = ?");
                        $rollbackStmt->execute([$signupData['id']]);
                        error_log("⚠️ OTP VERIFICATION - Rolled back OTP usage due to user creation failure");
                    } catch (Exception $rollbackError) {
                        error_log("⚠️ OTP VERIFICATION - Failed to rollback OTP: " . $rollbackError->getMessage());
                    }
                    
                    sendError("Failed to create account. Please try again.", [], 500);
                    return;
                }
                
                error_log("✅ OTP VERIFICATION - User account created successfully with ID: $userId");
            }
            
        } catch (PDOException $e) {
            error_log("❌ OTP VERIFICATION - User creation/activation error: " . $e->getMessage());
            error_log("❌ OTP VERIFICATION - PDO Error Info: " . json_encode($e->errorInfo ?? []));
            
            // Check for duplicate entry (user already exists race condition)
            if (strpos($e->getMessage(), 'Duplicate entry') !== false || 
                ($e->errorInfo[0] ?? '') === '23000') {
                error_log("⚠️ OTP VERIFICATION - Duplicate entry detected, attempting activation");
                
                // Try to activate existing user instead
                try {
                    $existingUserStmt = $db->prepare("SELECT id FROM users WHERE email = ?");
                    $existingUserStmt->execute([$email]);
                    $existingUser = $existingUserStmt->fetch();
                    
                    if ($existingUser) {
                        $userId = $existingUser['id'];
                        $checkEmailVerified = $db->prepare("SHOW COLUMNS FROM users LIKE 'is_email_verified'");
                        $checkEmailVerified->execute();
                        $hasEmailVerified = $checkEmailVerified->fetch();
                        
                        $checkIsActive = $db->prepare("SHOW COLUMNS FROM users LIKE 'is_active'");
                        $checkIsActive->execute();
                        $hasIsActive = $checkIsActive->fetch();
                        
                        if ($hasEmailVerified && $hasIsActive) {
                            $activateStmt = $db->prepare("UPDATE users SET is_email_verified = 1, is_active = 1 WHERE id = ?");
                            $activateStmt->execute([$userId]);
                            error_log("✅ OTP VERIFICATION - Existing user activated after duplicate entry: $userId");
                        } else {
                            error_log("✅ OTP VERIFICATION - User exists but table structure incomplete");
                        }
                    } else {
                        throw $e; // Re-throw if user doesn't exist
                    }
                } catch (Exception $activateError) {
                    error_log("❌ OTP VERIFICATION - Failed to activate existing user: " . $activateError->getMessage());
                    sendError("Account creation failed. Please contact support.", [], 500);
                    return;
                }
            } else {
                sendError("Account creation failed. Please contact support.", [], 500);
                return;
            }
        }
        
        // Mark OTP as used (only if we have a valid userId)
        if ($userId) {
            try {
                $updateStmt = $db->prepare("UPDATE signup_otps SET used = 1 WHERE id = ?");
                $updateStmt->execute([$signupData['id']]);
                error_log("✅ OTP VERIFICATION - OTP marked as used");
            } catch (Exception $e) {
                error_log("⚠️ OTP VERIFICATION - Failed to mark OTP as used: " . $e->getMessage());
                // Continue anyway - user is already created
            }
        } else {
            error_log("⚠️ OTP VERIFICATION - No user ID available, cannot mark OTP as used");
        }
        
        // Final validation: Ensure we have a valid userId
        if (!$userId || $userId == 0) {
            error_log("❌ OTP VERIFICATION - No valid user ID after all processing");
            sendError("Account verification failed. Please contact support.", [], 500);
            return;
        }
        
        error_log("✅ OTP VERIFICATION - SUCCESS for user ID: $userId");
        
        sendSuccess("Email verified successfully! Your account is now active.", [
            "user_id" => $userId,
            "email" => $email,
            "verified" => true,
            "message" => "Welcome! You can now login to your account.",
            "timestamp" => date("Y-m-d H:i:s")
        ]);
        
    } catch (Exception $e) {
        error_log("❌❌❌ FATAL ERROR in verifySignupOtp:");
        error_log("Message: " . $e->getMessage());
        error_log("File: " . $e->getFile());
        error_log("Line: " . $e->getLine());
        error_log("Trace: " . $e->getTraceAsString());
        
        sendError("OTP verification failed. Please try again.", [
            "error" => "Server error occurred during verification",
            "timestamp" => date("Y-m-d H:i:s")
        ], 500);
    }
}

/**
 * Logout user
 */
function logout() {
    try {
        error_log("🔍 LOGOUT - User logout requested");
        
        // JWT-based auth: Logout is primarily client-side (token removal)
        // No server-side session to destroy, but we return success for API consistency
        sendSuccess("Logged out successfully", [
            "message" => "You have been logged out successfully"
        ]);
        
    } catch (Exception $e) {
        error_log("❌ LOGOUT ERROR: " . $e->getMessage());
        // Even if there's an error, logout should succeed (client clears token anyway)
        sendSuccess("Logged out successfully", []);
    }
}

/**
 * Refresh JWT token
 */
function refreshToken($db) {
    try {
        error_log("🔄 REFRESH TOKEN - Starting token refresh");
        
        // Authenticate user - token should still be valid if frontend is refreshing proactively
        $authUser = AuthMiddleware::authenticate();
        
        error_log("🔄 REFRESH TOKEN - User authenticated: " . $authUser->id);
        
        // Get fresh user data
        $stmt = $db->prepare("
            SELECT id, name, email, role, is_active, is_email_verified
            FROM users WHERE id = ?
        ");
        $stmt->execute([$authUser->id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            error_log("❌ REFRESH TOKEN - User not found: " . $authUser->id);
            sendError("User not found", [], 404);
            return;
        }
        
        if (!$user["is_active"]) {
            error_log("❌ REFRESH TOKEN - Account deactivated: " . $authUser->id);
            sendError("Account is deactivated", [], 403);
            return;
        }
        
        // Generate new token with fresh expiration
        $token = AuthMiddleware::generateToken($user);
        error_log("✅ REFRESH TOKEN - New token generated for user: " . $user['email']);
        
        sendSuccess("Token refreshed successfully", [
            "user" => $user,
            "token" => $token
        ]);
        
    } catch (PDOException $e) {
        error_log("❌ REFRESH TOKEN - Database error: " . $e->getMessage());
        sendError("Database error. Please try again.", [], 500);
    } catch (Exception $e) {
        error_log("❌ REFRESH TOKEN - Error: " . $e->getMessage());
        sendError("Token refresh failed", ["error" => "Please login again"], 500);
    }
}

/**
 * Get current user
 */
function getCurrentUser($db) {
    try {
        // Database connection check
        if (!$db) {
            error_log("❌ GET CURRENT USER - Database connection is null");
            sendError("Database connection failed. Please try again later.", [], 500);
            return;
        }
        
        // Authenticate user
        $authUser = AuthMiddleware::authenticate();
        
        if (!$authUser || !isset($authUser->id)) {
            error_log("❌ GET CURRENT USER - Authentication failed");
            sendError("Authentication failed", [], 401);
            return;
        }

        // Get user data
        $stmt = $db->prepare("
            SELECT id, name, email, phone, role, is_active, is_email_verified, created_at
            FROM users WHERE id = ?
        ");
        $stmt->execute([$authUser->id]);
        $user = $stmt->fetch();

        if (!$user) {
            error_log("❌ GET CURRENT USER - User not found: " . $authUser->id);
            sendError("User not found", [], 404);
            return;
        }

        error_log("✅ GET CURRENT USER - User retrieved: " . $user['email']);
        sendSuccess("User profile retrieved successfully", ["user" => $user]);
        
    } catch (PDOException $e) {
        error_log("❌ GET CURRENT USER - Database error: " . $e->getMessage());
        sendError("Database error. Please try again.", [], 500);
    } catch (Exception $e) {
        error_log("❌ GET CURRENT USER - Error: " . $e->getMessage());
        sendError("Failed to retrieve user profile", [], 500);
    }
}
?>
?>