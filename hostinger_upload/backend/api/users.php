<?php
/**
 * Users API Endpoints
 * Routes: /api/users/*
 */

// session_start(); // Already started in index.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/EmailService.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/users and /api/php-backend/api/users
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'users') {
    // Handle /api/php-backend/api/users
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/users
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case 'profile':
            if ($method === 'GET') {
                getProfile($db);
            } elseif ($method === 'PUT') {
                updateProfile($db);
            }
            break;

        case 'addresses':
            if ($method === 'GET') {
                getAddresses($db);
            } elseif ($method === 'POST') {
                addAddress($db);
            }
            break;

        case 'address':
            $addressId = isset($pathParts[3]) ? $pathParts[3] : null;
            if ($method === 'PUT' && $addressId) {
                updateAddress($db, $addressId);
            } elseif ($method === 'DELETE' && $addressId) {
                deleteAddress($db, $addressId);
            }
            break;

        case 'change-password':
            if ($method === 'POST') {
                changePassword($db);
            }
            break;

        case 'preferences':
            if ($method === 'PUT') {
                updatePreferences($db);
            }
            break;

        case 'all':
            // Admin only
            if ($method === 'GET') {
                getAllUsers($db);
            }
            break;

        case 'email':
            // Handle email endpoint: /api/users/email/{userId}
            $userId = isset($pathParts[3]) ? $pathParts[3] : null;
            if ($userId && is_numeric($userId)) {
                if ($method === 'POST') {
                    sendEmailToUser($db, $userId);
                } else {
                    sendError('Method not allowed', [], 405);
                }
            } else {
                sendError('User ID required for email', [], 400);
            }
            break;

        default:
            // Handle user ID parameter for updates
            $userId = $endpoint;
            if (is_numeric($userId)) {
                if ($method === 'PUT') {
                    updateUser($db, $userId);
                } elseif ($method === 'GET') {
                    getUser($db, $userId);
                } elseif ($method === 'DELETE') {
                    deleteUser($db, $userId);
                } else {
                    sendError('Method not allowed', [], 405);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
            break;
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get user profile
 */
function getProfile($db) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("
        SELECT id, name, email, phone, avatar, role, is_active, is_email_verified,
               newsletter, marketing, notifications_email, notifications_sms, notifications_push,
               currency, language, total_orders, total_spent, last_order_date,
               wishlist_count, review_count, created_at, updated_at
        FROM users WHERE id = ?
    ");
    $stmt->execute([$authUser->id]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('User not found', [], 404);
    }

    sendSuccess('Profile retrieved successfully', ['user' => $user]);
}

/**
 * Update user profile
 */
function updateProfile($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $fields = [];
    $params = [];

    $allowedFields = ['name', 'phone', 'avatar'];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = sanitizeInput($data[$field]);
        }
    }

    if (empty($fields)) {
        sendError('No fields to update', [], 400);
    }

    $params[] = $authUser->id;
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        sendSuccess('Profile updated successfully');
    } else {
        sendError('Failed to update profile', [], 500);
    }
}

/**
 * Get user addresses
 */
function getAddresses($db) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("
        SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC
    ");
    $stmt->execute([$authUser->id]);
    $addresses = $stmt->fetchAll();

    sendSuccess('Addresses retrieved successfully', ['addresses' => $addresses]);
}

/**
 * Add new address
 */
function addAddress($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $errors = validateRequired($data, ['address', 'city', 'state', 'postalCode']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $isDefault = isset($data['isDefault']) && $data['isDefault'] ? 1 : 0;

    // If this is default, unset all other default addresses
    if ($isDefault) {
        $stmt = $db->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?");
        $stmt->execute([$authUser->id]);
    }

    $stmt = $db->prepare("
        INSERT INTO addresses (user_id, type, address, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([
        $authUser->id,
        $data['type'] ?? 'home',
        sanitizeInput($data['address']),
        sanitizeInput($data['city']),
        sanitizeInput($data['state']),
        sanitizeInput($data['postalCode']),
        $data['country'] ?? 'India',
        $isDefault
    ])) {
        $addressId = $db->lastInsertId();
        sendSuccess('Address added successfully', ['id' => $addressId], 201);
    } else {
        sendError('Failed to add address', [], 500);
    }
}

/**
 * Update address
 */
function updateAddress($db, $id) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    // Verify address belongs to user
    $stmt = $db->prepare("SELECT user_id FROM addresses WHERE id = ?");
    $stmt->execute([$id]);
    $address = $stmt->fetch();

    if (!$address || $address['user_id'] != $authUser->id) {
        sendError('Address not found', [], 404);
    }

    $fields = [];
    $params = [];

    $allowedFields = ['type', 'address', 'city', 'state', 'postal_code', 'country', 'is_default'];

    foreach ($allowedFields as $field) {
        $camelField = lcfirst(str_replace('_', '', ucwords($field, '_')));
        if (isset($data[$camelField])) {
            $fields[] = "$field = ?";
            $params[] = sanitizeInput($data[$camelField]);

            // If setting as default, unset others
            if ($field === 'is_default' && $data[$camelField]) {
                $stmt = $db->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?");
                $stmt->execute([$authUser->id]);
            }
        }
    }

    if (empty($fields)) {
        sendError('No fields to update', [], 400);
    }

    $params[] = $id;
    $sql = "UPDATE addresses SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        sendSuccess('Address updated successfully');
    } else {
        sendError('Failed to update address', [], 500);
    }
}

/**
 * Delete address
 */
function deleteAddress($db, $id) {
    $authUser = AuthMiddleware::authenticate();

    // Verify address belongs to user
    $stmt = $db->prepare("SELECT user_id FROM addresses WHERE id = ?");
    $stmt->execute([$id]);
    $address = $stmt->fetch();

    if (!$address || $address['user_id'] != $authUser->id) {
        sendError('Address not found', [], 404);
    }

    $stmt = $db->prepare("DELETE FROM addresses WHERE id = ?");

    if ($stmt->execute([$id])) {
        sendSuccess('Address deleted successfully');
    } else {
        sendError('Failed to delete address', [], 500);
    }
}

/**
 * Change password
 */
function changePassword($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $errors = validateRequired($data, ['currentPassword', 'newPassword']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    if (strlen($data['newPassword']) < 8) {
        sendError('New password must be at least 8 characters', [], 400);
    }

    // Get current password
    $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$authUser->id]);
    $user = $stmt->fetch();

    // Verify current password
    if (!AuthMiddleware::verifyPassword($data['currentPassword'], $user['password'])) {
        sendError('Current password is incorrect', [], 400);
    }

    // Update password
    $newHash = AuthMiddleware::hashPassword($data['newPassword']);
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");

    if ($stmt->execute([$newHash, $authUser->id])) {
        sendSuccess('Password changed successfully');
    } else {
        sendError('Failed to change password', [], 500);
    }
}

/**
 * Update user preferences
 */
function updatePreferences($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $fields = [];
    $params = [];

    $allowedFields = [
        'newsletter', 'marketing', 'notifications_email',
        'notifications_sms', 'notifications_push', 'currency', 'language'
    ];

    foreach ($allowedFields as $field) {
        $camelField = lcfirst(str_replace('_', '', ucwords($field, '_')));
        if (isset($data[$camelField])) {
            $fields[] = "$field = ?";
            $params[] = $data[$camelField];
        }
    }

    if (empty($fields)) {
        sendError('No preferences to update', [], 400);
    }

    $params[] = $authUser->id;
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        sendSuccess('Preferences updated successfully');
    } else {
        sendError('Failed to update preferences', [], 500);
    }
}

/**
 * Get all users (Admin only)
 */
function getAllUsers($db) {
    AuthMiddleware::requireAdmin();
    $pagination = getPaginationParams();

    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];

    // Get users
    $stmt = $db->prepare("
        SELECT id, name, email, phone, role, is_active, is_email_verified,
               total_orders, total_spent, last_order_date, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$pagination['limit'], $pagination['offset']]);
    $users = $stmt->fetchAll();

    $response = createPaginationResponse($users, $total, $pagination['page'], $pagination['limit']);
    sendSuccess('Users retrieved successfully', $response);
}

/**
 * Get single user (Admin only)
 */
function getUser($db, $userId) {
    AuthMiddleware::requireAdmin();

    $stmt = $db->prepare("
        SELECT id, name, email, phone, role, is_active, is_email_verified,
               total_orders, total_spent, last_order_date, created_at
        FROM users WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('User not found', [], 404);
    }

    sendSuccess('User retrieved successfully', ['user' => $user]);
}

/**
 * Update user (Admin only)
 */
function updateUser($db, $userId) {
    AuthMiddleware::requireAdmin();
    $data = getRequestBody();

    $fields = [];
    $params = [];

    $allowedFields = ['name', 'email', 'phone', 'is_active', 'is_email_verified'];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = sanitizeInput($data[$field]);
        }
    }

    // Handle camelCase field names
    if (isset($data['isActive'])) {
        $fields[] = "is_active = ?";
        $params[] = $data['isActive'] ? 1 : 0;
    }
    if (isset($data['isEmailVerified'])) {
        $fields[] = "is_email_verified = ?";
        $params[] = $data['isEmailVerified'] ? 1 : 0;
    }

    if (empty($fields)) {
        sendError('No fields to update', [], 400);
    }

    $params[] = $userId;
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        sendSuccess('User updated successfully');
    } else {
        sendError('Failed to update user', [], 500);
    }
}

/**
 * Delete user (Admin only)
 */
function deleteUser($db, $userId) {
    AuthMiddleware::requireAdmin();

    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        sendError('User not found', [], 404);
    }

    // Delete user
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    
    if ($stmt->execute([$userId])) {
        sendSuccess('User deleted successfully');
    } else {
        sendError('Failed to delete user', [], 500);
    }
}

/**
 * Send email to user (Admin only)
 */
function sendEmailToUser($db, $userId) {
    try {
        AuthMiddleware::requireAdmin();
        $data = getRequestBody();

        $errors = validateRequired($data, ['subject', 'message']);
        if (!empty($errors)) {
            sendError('Validation failed', $errors, 400);
        }

        // Get user details
        $stmt = $db->prepare("SELECT name, email FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError('User not found', [], 404);
        }

        $subject = sanitizeInput($data['subject']);
        $message = sanitizeInput($data['message']);

        // Validate email address
        if (!filter_var($user['email'], FILTER_VALIDATE_EMAIL)) {
            sendError('Invalid email address for user', [], 400);
        }

        // Log the email attempt
        error_log("Attempting to send email to: " . $user['email'] . " with subject: " . $subject);

        // Use EmailService for better email delivery
        $emailService = new EmailService();
        $mailSent = $emailService->sendCustomerEmail($user['name'], $user['email'], $subject, $message);
        
        if ($mailSent) {
            error_log("Email sent successfully to: " . $user['email']);
            sendSuccess('Email sent successfully');
        } else {
            error_log("Failed to send email to: " . $user['email']);
            
            // In development, we'll simulate success since SMTP might not be configured
            if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
                error_log("Development environment detected - simulating email success");
                sendSuccess('Email queued for delivery (development mode)');
            } else {
                sendError('Failed to send email. Please check your email configuration.', [], 500);
            }
        }
    } catch (Exception $e) {
        error_log("Email sending error: " . $e->getMessage());
        sendError('Email service error: ' . $e->getMessage(), [], 500);
    }
}
