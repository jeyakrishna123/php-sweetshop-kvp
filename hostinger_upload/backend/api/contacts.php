<?php
/**
 * Contacts API Endpoints
 * Routes: /api/contacts/*
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

// Get path after /api/contacts/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/contacts and /api/php-backend/api/contacts
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'contacts') {
    // Handle /api/php-backend/api/contacts
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
    $subEndpoint = isset($pathParts[5]) ? $pathParts[5] : '';
} else {
    // Handle /api/contacts
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
    $subEndpoint = isset($pathParts[3]) ? $pathParts[3] : '';
}

try {
    switch ($endpoint) {
        case '':
            // GET /api/contacts - Get all contacts (admin only)
            if ($method === 'GET') {
                getAllContacts($db);
            }
            // POST /api/contacts - Create new contact (public)
            elseif ($method === 'POST') {
                createContact($db);
            }
            break;

        case 'stats':
            // GET /api/contacts/stats/overview - Get contact statistics
            if ($method === 'GET' && $subEndpoint === 'overview') {
                getContactStats($db);
            }
            break;

        default:
            // Handle contact ID operations
            $contactId = $endpoint;
            if (is_numeric($contactId)) {
                if ($method === 'GET') {
                    getContact($db, $contactId);
                } elseif ($method === 'PUT') {
                    updateContact($db, $contactId);
                } elseif ($method === 'DELETE') {
                    deleteContact($db, $contactId);
                }
            } elseif ($contactId && str_contains($requestUri, '/read')) {
                // PUT /api/contacts/{id}/read - Mark contact as read
                $contactId = str_replace('/read', '', $contactId);
                if ($method === 'PUT' && is_numeric($contactId)) {
                    markContactAsRead($db, $contactId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get all contacts (Admin only)
 */
function getAllContacts($db) {
    try {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
    } catch (Exception $e) {
        error_log("❌ getAllContacts Auth Error: " . $e->getMessage());
        sendError('Authentication required', [], 401);
        return;
    }

    // Check if table exists
    try {
        $checkTable = $db->query("SHOW TABLES LIKE 'contacts'");
        if ($checkTable->rowCount() === 0) {
            sendSuccess('Contacts retrieved successfully', [
                'contacts' => [],
                'count' => 0
            ]);
            return;
        }
    } catch (Exception $e) {
        error_log("⚠️ Could not check contacts table: " . $e->getMessage());
        sendSuccess('Contacts retrieved successfully', [
            'contacts' => [],
            'count' => 0
        ]);
        return;
    }

    $stmt = $db->prepare("
        SELECT
            id, full_name as fullName, email, phone, subject, message,
            status, is_read as isRead, admin_notes as adminNotes,
            created_at as createdAt, updated_at as updatedAt
        FROM contacts
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert is_read to boolean
    foreach ($contacts as &$contact) {
        $contact['isRead'] = (bool)$contact['isRead'];
    }

    sendSuccess('Contacts retrieved successfully', [
        'contacts' => $contacts,
        'count' => count($contacts)
    ]);
}

/**
 * Get single contact (Admin only)
 */
function getContact($db, $contactId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT
            id, full_name as fullName, email, phone, subject, message,
            status, is_read as isRead, admin_notes as adminNotes,
            created_at as createdAt, updated_at as updatedAt
        FROM contacts
        WHERE id = ?
    ");
    $stmt->execute([$contactId]);
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contact) {
        sendError('Contact not found', [], 404);
    }

    $contact['isRead'] = (bool)$contact['isRead'];

    sendSuccess('Contact retrieved successfully', [
        'contact' => $contact
    ]);
}

/**
 * Create new contact (Public endpoint)
 */
function createContact($db) {
    // Check if contacts table exists, create if needed
    try {
        $checkTable = $db->query("SHOW TABLES LIKE 'contacts'");
        if ($checkTable->rowCount() === 0) {
            // Create table if it doesn't exist
            $createTable = "
                CREATE TABLE IF NOT EXISTS contacts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    subject VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    status ENUM('new', 'responded', 'closed') DEFAULT 'new',
                    is_read TINYINT(1) DEFAULT 0,
                    admin_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_is_read (is_read),
                    INDEX idx_created (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ";
            $db->exec($createTable);
            error_log("✅ Contacts table created automatically");
        }
    } catch (Exception $e) {
        error_log("⚠️ Could not check/create contacts table: " . $e->getMessage());
    }

    $data = getRequestBody();

    $errors = validateRequired($data, ['fullName', 'email', 'subject', 'message']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
        return;
    }

    $fullName = sanitizeInput($data['fullName']);
    $email = sanitizeInput($data['email']);
    $phone = isset($data['phone']) ? sanitizeInput($data['phone']) : null;
    $subject = sanitizeInput($data['subject']);
    $message = sanitizeInput($data['message']);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email address', [], 400);
        return;
    }

    // Validate message length
    if (strlen($message) > 2000) {
        sendError('Message cannot exceed 2000 characters', [], 400);
        return;
    }

    // Insert contact
    try {
        $stmt = $db->prepare("
            INSERT INTO contacts (full_name, email, phone, subject, message, status, is_read)
            VALUES (?, ?, ?, ?, ?, 'new', 0)
        ");

        if ($stmt->execute([$fullName, $email, $phone, $subject, $message])) {
            $contactId = $db->lastInsertId();
            error_log("✅ Contact form submitted successfully - ID: $contactId");

            sendSuccess('Contact form submitted successfully', [
                'contact' => [
                    'id' => $contactId,
                    'fullName' => $fullName,
                    'email' => $email,
                    'phone' => $phone,
                    'subject' => $subject,
                    'message' => $message,
                    'status' => 'new',
                    'isRead' => false
                ]
            ], 201);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("❌ Failed to insert contact: " . json_encode($errorInfo));
            sendError('Failed to submit contact form', [], 500);
        }
    } catch (PDOException $e) {
        error_log("❌ Contact insert error: " . $e->getMessage());
        sendError('Database error: ' . $e->getMessage(), [], 500);
    }
}

/**
 * Update contact (Admin only)
 */
function updateContact($db, $contactId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    // Check if contact exists
    $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
    $stmt->execute([$contactId]);
    if (!$stmt->fetch()) {
        sendError('Contact not found', [], 404);
    }

    $status = isset($data['status']) ? sanitizeInput($data['status']) : null;
    $adminNotes = isset($data['adminNotes']) ? sanitizeInput($data['adminNotes']) : null;

    // Validate status
    if ($status && !in_array($status, ['new', 'responded', 'closed'])) {
        sendError('Invalid status. Must be one of: new, responded, closed', [], 400);
    }

    // Build update query dynamically
    $updates = [];
    $params = [];

    if ($status !== null) {
        $updates[] = "status = ?";
        $params[] = $status;
    }

    if ($adminNotes !== null) {
        $updates[] = "admin_notes = ?";
        $params[] = $adminNotes;
    }

    if (empty($updates)) {
        sendError('No valid fields to update', [], 400);
    }

    $updates[] = "updated_at = NOW()";
    $params[] = $contactId;

    $sql = "UPDATE contacts SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);

    if ($stmt->execute($params)) {
        sendSuccess('Contact updated successfully');
    } else {
        sendError('Failed to update contact', [], 500);
    }
}

/**
 * Mark contact as read (Admin only)
 */
function markContactAsRead($db, $contactId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if contact exists
    $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
    $stmt->execute([$contactId]);
    if (!$stmt->fetch()) {
        sendError('Contact not found', [], 404);
    }

    $stmt = $db->prepare("UPDATE contacts SET is_read = 1, updated_at = NOW() WHERE id = ?");

    if ($stmt->execute([$contactId])) {
        sendSuccess('Contact marked as read');
    } else {
        sendError('Failed to mark contact as read', [], 500);
    }
}

/**
 * Delete contact (Admin only)
 */
function deleteContact($db, $contactId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if contact exists
    $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
    $stmt->execute([$contactId]);
    if (!$stmt->fetch()) {
        sendError('Contact not found', [], 404);
    }

    $stmt = $db->prepare("DELETE FROM contacts WHERE id = ?");

    if ($stmt->execute([$contactId])) {
        sendSuccess('Contact deleted successfully');
    } else {
        sendError('Failed to delete contact', [], 500);
    }
}

/**
 * Get contact statistics (Admin only)
 */
function getContactStats($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Get counts for each status
    $stmt = $db->prepare("
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
            SUM(CASE WHEN status = 'responded' THEN 1 ELSE 0 END) as responded,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as `read`
        FROM contacts
    ");
    $stmt->execute();
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    sendSuccess('Contact statistics retrieved successfully', [
        'stats' => [
            'total' => (int)$stats['total'],
            'new' => (int)$stats['new'],
            'responded' => (int)$stats['responded'],
            'closed' => (int)$stats['closed'],
            'unread' => (int)$stats['unread'],
            'read' => (int)$stats['read']
        ]
    ]);
}
