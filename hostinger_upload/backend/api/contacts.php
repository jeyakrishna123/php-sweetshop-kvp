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

// Get database connection - same approach as wishlist.php
$db = Database::getInstance()->getConnection();
if (!$db) {
    error_log('❌ Contacts API: Database connection is null');
    sendError('Database connection failed', [
        'error' => 'Unable to connect to database',
        'details' => 'Database::getInstance()->getConnection() returned null',
        'location' => 'contacts.php-top-level'
    ], 500);
    exit;
}

// Auto-create contacts table if it doesn't exist (simple approach like wishlist.php)
try {
    $db->exec("
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
    ");
} catch (Exception $e) {
    // Table might already exist, or creation failed - log but continue
    error_log('Contacts table check: ' . $e->getMessage());
}

// Get path after /api/contacts/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = array_values(array_filter(explode('/', trim($path, '/'))));

// Handle both /api/contacts and /api/php-backend/api/contacts
if (isset($pathParts[0]) && $pathParts[0] === 'api') {
    if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'contacts') {
        // Handle /api/php-backend/api/contacts
        $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
        $subEndpoint = isset($pathParts[5]) ? $pathParts[5] : '';
    } else if (isset($pathParts[1]) && $pathParts[1] === 'contacts') {
        // Handle /api/contacts
        $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
        $subEndpoint = isset($pathParts[3]) ? $pathParts[3] : '';
    } else {
        $endpoint = '';
        $subEndpoint = '';
    }
} else {
    $endpoint = '';
    $subEndpoint = '';
}

try {
    switch ($endpoint) {
        case '':
            // GET /api/contacts - Get all contacts (admin only)
            if ($method === 'GET') {
                try {
                    getAllContacts($db);
                } catch (Throwable $e) {
                    error_log('❌ getAllContacts routing exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                    sendError('Server error', [
                        'error' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ], 500);
                }
                exit; // Exit after sending response
            }
            // POST /api/contacts - Create new contact (public)
            elseif ($method === 'POST') {
                try {
                    createContact($db);
                } catch (Throwable $e) {
                    error_log('❌ createContact routing exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                    sendError('Server error', [
                        'error' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ], 500);
                }
                exit; // Exit after sending response
            } else {
                sendError('Method not allowed', [], 405);
                exit;
            }
            break;

        case 'stats':
            // GET /api/contacts/stats/overview - Get contact statistics
            if ($method === 'GET' && $subEndpoint === 'overview') {
                try {
                    getContactStats($db);
                } catch (Throwable $e) {
                    $errorDetails = [
                        'error' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'type' => get_class($e),
                        'trace' => $e->getTraceAsString(),
                        'location' => 'routing-level-getContactStats',
                        'code' => $e->getCode()
                    ];
                    
                    error_log('❌ getContactStats routing exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                    error_log('❌ getContactStats routing stack trace: ' . $e->getTraceAsString());
                    
                    sendError('Server error', $errorDetails, 500);
                    exit;
                }
                exit; // Exit after sending response
            } else {
                sendError('Endpoint not found', [], 404);
                exit;
            }
            break;

        default:
            // Handle contact ID operations
            $contactId = $endpoint;
            
            // Check if this is a mark-as-read request: /api/contacts/{id}/read
            if (str_contains($requestUri, '/read')) {
                // Extract contact ID from path (remove /read)
                $contactId = str_replace('/read', '', $contactId);
                // Also handle if contactId contains /read at the end
                $contactId = preg_replace('/\/read$/', '', $contactId);
                if ($method === 'PUT' && is_numeric($contactId)) {
                    markContactAsRead($db, (int)$contactId);
                    exit;
                }
            }
            
            // Handle regular contact ID operations
            if (is_numeric($contactId)) {
                $contactId = (int)$contactId;
                if ($method === 'GET') {
                    getContact($db, $contactId);
                    exit;
                } elseif ($method === 'PUT') {
                    updateContact($db, $contactId);
                    exit;
                } elseif ($method === 'DELETE') {
                    deleteContact($db, $contactId);
                    exit;
                } else {
                    sendError('Method not allowed', [], 405);
                    exit;
                }
            } else {
                sendError('Endpoint not found', [], 404);
                exit;
            }
    }
} catch (Throwable $e) {
    // Catch all errors including fatal errors
    $errorDetails = [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'type' => get_class($e),
        'trace' => $e->getTraceAsString()
    ];
    
    error_log('❌ Contacts API Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    error_log('❌ Contacts API Stack Trace: ' . $e->getTraceAsString());
    
    sendError('Server error', $errorDetails, 500);
    exit;
}

/**
 * Ensure contacts table exists
 */
function ensureContactsTable($db) {
    if (!$db) {
        return false;
    }
    
    try {
        // Simple approach: just try to create the table (IF NOT EXISTS handles if it already exists)
        $db->exec("
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
        ");
        
        // CRITICAL: Ensure all required columns exist (fix for production table mismatch)
        $requiredColumns = [
            'full_name' => "VARCHAR(255) NOT NULL DEFAULT ''",
            'is_read' => "TINYINT(1) DEFAULT 0",
            'admin_notes' => "TEXT",
            'status' => "ENUM('new', 'responded', 'closed') DEFAULT 'new'",
            'created_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'updated_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        try {
            // Get all existing columns
            $existingCols = $db->query("SHOW COLUMNS FROM contacts")->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($requiredColumns as $colName => $colDef) {
                if (!in_array($colName, $existingCols)) {
                    // Check if old column name exists (for migration)
                    $oldName = null;
                    if ($colName === 'full_name') {
                        if (in_array('name', $existingCols)) {
                            $oldName = 'name';
                        }
                    }
                    
                    if ($oldName) {
                        // Rename old column
                        $db->exec("ALTER TABLE contacts CHANGE COLUMN $oldName $colName $colDef");
                        error_log("✅ ensureContactsTable: Renamed $oldName column to $colName");
                    } else {
                        // Add new column
                        $position = ($colName === 'full_name') ? 'AFTER id' : '';
                        $db->exec("ALTER TABLE contacts ADD COLUMN $colName $colDef $position");
                        error_log("✅ ensureContactsTable: Added $colName column");
                    }
                }
            }
        } catch (Exception $colEx) {
            error_log('⚠️ ensureContactsTable: Column check/update failed: ' . $colEx->getMessage());
        }
        
        return true;
    } catch (Exception $e) {
        // Table might already exist, or creation failed
        error_log('ensureContactsTable: ' . $e->getMessage());
        return false;
    }
}

/**
 * Get all contacts (Admin only)
 */
function getAllContacts($db) {
    // Authenticate first - wrap in try-catch to catch any unexpected errors
    try {
        $authUser = AuthMiddleware::authenticate();
        if (!$authUser) {
            sendError('Authentication failed', ['error' => 'User not authenticated'], 401);
            return;
        }
        AuthMiddleware::requireAdmin($authUser);
    } catch (Exception $authEx) {
        // If auth throws an exception (shouldn't happen, but just in case)
        error_log('❌ getAllContacts: Auth exception: ' . $authEx->getMessage());
        sendError('Authentication failed', ['error' => $authEx->getMessage()], 401);
        return;
    } catch (Throwable $authEx) {
        // Catch any other errors
        error_log('❌ getAllContacts: Auth throwable: ' . $authEx->getMessage());
        sendError('Authentication failed', ['error' => $authEx->getMessage()], 401);
        return;
    }

    try {
        // Check database connection
        if (!$db) {
            error_log('❌ getAllContacts: Database connection is null');
            sendError('Database error', ['error' => 'Database connection not available'], 500);
            return;
        }
        
        // Ensure table exists - try to create if it doesn't exist
        try {
            $db->exec("
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
            ");
        } catch (Exception $tableEx) {
            // Table might already exist, or creation failed - log but continue
            error_log('⚠️ getAllContacts: Table creation check: ' . $tableEx->getMessage());
        }

        // First, verify table exists by trying a simple query
        try {
            $testStmt = $db->query("SELECT 1 FROM contacts LIMIT 1");
        } catch (PDOException $tableCheckEx) {
            $tableErrorMsg = $tableCheckEx->getMessage();
            error_log('❌ getAllContacts: Table check failed: ' . $tableErrorMsg);
            
            // If table doesn't exist, try to create it one more time
            if (strpos($tableErrorMsg, "doesn't exist") !== false || 
                strpos($tableErrorMsg, "Table") !== false ||
                strpos($tableErrorMsg, "42S02") !== false) {
                try {
                    $db->exec("
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
                    ");
                    error_log('✅ getAllContacts: Table created successfully');
                } catch (Exception $createEx) {
                    error_log('❌ getAllContacts: Table creation failed: ' . $createEx->getMessage());
                    sendError('Database error: Table does not exist and cannot be created', [
                        'error' => 'Contacts table missing',
                        'details' => $createEx->getMessage(),
                        'file' => $createEx->getFile(),
                        'line' => $createEx->getLine(),
                        'location' => 'getAllContacts-table-creation'
                    ], 500);
                    return;
                }
            } else {
                // Other database error
                sendError('Database error: ' . $tableErrorMsg, [
                    'error' => 'Database query failed',
                    'details' => $tableErrorMsg,
                    'error_code' => $tableCheckEx->getCode(),
                    'file' => $tableCheckEx->getFile(),
                    'line' => $tableCheckEx->getLine(),
                    'location' => 'getAllContacts-table-check'
                ], 500);
                return;
            }
        }
        
        // Ensure all required columns exist before querying
        $requiredColumns = [
            'full_name' => "VARCHAR(255) NOT NULL DEFAULT ''",
            'is_read' => "TINYINT(1) DEFAULT 0",
            'admin_notes' => "TEXT",
            'status' => "ENUM('new', 'responded', 'closed') DEFAULT 'new'",
            'created_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'updated_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        try {
            $existingCols = $db->query("SHOW COLUMNS FROM contacts")->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($requiredColumns as $colName => $colDef) {
                if (!in_array($colName, $existingCols)) {
                    $oldName = null;
                    if ($colName === 'full_name' && in_array('name', $existingCols)) {
                        $oldName = 'name';
                    }
                    
                    if ($oldName) {
                        $db->exec("ALTER TABLE contacts CHANGE COLUMN $oldName $colName $colDef");
                        error_log("✅ getAllContacts: Renamed $oldName to $colName");
                    } else {
                        $position = ($colName === 'full_name') ? 'AFTER id' : '';
                        $db->exec("ALTER TABLE contacts ADD COLUMN $colName $colDef $position");
                        error_log("✅ getAllContacts: Added $colName column");
                    }
                }
            }
        } catch (Exception $colEx) {
            error_log('⚠️ getAllContacts: Column check failed: ' . $colEx->getMessage());
        }
        
        $stmt = $db->prepare("
            SELECT
                id, full_name as fullName, email, phone, subject, message,
                status, is_read as isRead, admin_notes as adminNotes,
                created_at as createdAt, updated_at as updatedAt
            FROM contacts
            ORDER BY created_at DESC
        ");
        
        if (!$stmt) {
            $errorInfo = $db->errorInfo();
            error_log('❌ getAllContacts: Failed to prepare statement: ' . json_encode($errorInfo));
            sendError('Database error: Failed to prepare query - ' . ($errorInfo[2] ?? 'Unknown error'), [
                'error' => 'Failed to prepare database query',
                'sql_state' => $errorInfo[0] ?? 'N/A',
                'error_code' => $errorInfo[1] ?? 'N/A',
                'sql_error' => $errorInfo[2] ?? 'N/A',
                'location' => 'getAllContacts-prepare'
            ], 500);
            return;
        }
        
        try {
            $stmt->execute();
            $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $executeEx) {
            // PDOException doesn't have errorInfo() method - use getMessage() and getCode()
            $errorMessage = $executeEx->getMessage();
            $errorCode = $executeEx->getCode();
            error_log('❌ getAllContacts: Execute failed: ' . $errorMessage . ' | Code: ' . $errorCode);
            
            // If table doesn't exist, return empty array
            if (strpos($errorMessage, "doesn't exist") !== false || 
                strpos($errorMessage, "Table") !== false ||
                strpos($errorMessage, "42S02") !== false ||
                strpos($errorMessage, "Base table or view not found") !== false ||
                strpos($errorMessage, "Unknown table") !== false) {
                error_log('⚠️ getAllContacts: Table does not exist, returning empty array');
                sendSuccess('Contacts retrieved successfully', [
                    'contacts' => [],
                    'count' => 0
                ]);
                return;
            }
            
            // For other errors, return detailed error with full context
            $errorDetails = [
                'error' => 'Failed to execute contacts query',
                'details' => $errorMessage,
                'error_code' => $errorCode,
                'sql_query' => 'SELECT contacts from contacts table',
                'location' => 'getAllContacts-execute',
                'file' => $executeEx->getFile(),
                'line' => $executeEx->getLine(),
                'type' => get_class($executeEx)
            ];
            error_log('❌ getAllContacts: Full error details: ' . json_encode($errorDetails));
            sendError('Database error', $errorDetails, 500);
            return;
        }

        // Convert is_read to boolean
        foreach ($contacts as &$contact) {
            $contact['isRead'] = (bool)$contact['isRead'];
        }

        sendSuccess('Contacts retrieved successfully', [
            'contacts' => $contacts,
            'count' => count($contacts)
        ]);
    } catch (PDOException $e) {
        // PDOException doesn't have errorInfo() method - use getMessage() and getCode()
        $errorMsg = 'GetAllContacts PDO Exception: ' . $e->getMessage() . ' | Code: ' . $e->getCode();
        error_log('❌ ' . $errorMsg);
        sendError('Database error', [
            'error' => 'Failed to retrieve contacts',
            'details' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'type' => get_class($e),
            'location' => 'getAllContacts-catch-PDOException'
        ], 500);
    } catch (Exception $e) {
        $errorDetails = [
            'error' => 'An error occurred while fetching contacts',
            'details' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'type' => get_class($e),
            'trace' => $e->getTraceAsString(),
            'location' => 'getAllContacts-catch-Exception'
        ];
        
        error_log('❌ GetAllContacts General Exception: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
        error_log('❌ GetAllContacts Stack Trace: ' . $e->getTraceAsString());
        
        sendError('Server error', $errorDetails, 500);
    }
}

/**
 * Get single contact (Admin only)
 */
function getContact($db, $contactId) {
    // Authenticate first - these functions exit on error
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // Ensure all required columns exist before querying
        $requiredColumns = [
            'full_name' => "VARCHAR(255) NOT NULL DEFAULT ''",
            'is_read' => "TINYINT(1) DEFAULT 0",
            'admin_notes' => "TEXT",
            'status' => "ENUM('new', 'responded', 'closed') DEFAULT 'new'",
            'created_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'updated_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        try {
            $existingCols = $db->query("SHOW COLUMNS FROM contacts")->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($requiredColumns as $colName => $colDef) {
                if (!in_array($colName, $existingCols)) {
                    $oldName = null;
                    if ($colName === 'full_name' && in_array('name', $existingCols)) {
                        $oldName = 'name';
                    }
                    
                    if ($oldName) {
                        $db->exec("ALTER TABLE contacts CHANGE COLUMN $oldName $colName $colDef");
                    } else {
                        $position = ($colName === 'full_name') ? 'AFTER id' : '';
                        $db->exec("ALTER TABLE contacts ADD COLUMN $colName $colDef $position");
                    }
                }
            }
        } catch (Exception $colEx) {
            error_log('⚠️ getContact: Column check failed: ' . $colEx->getMessage());
        }
        
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
            return;
        }

        $contact['isRead'] = (bool)$contact['isRead'];

        sendSuccess('Contact retrieved successfully', [
            'contact' => $contact
        ]);
    } catch (PDOException $e) {
        sendError('Database error', ['error' => 'Failed to retrieve contact'], 500);
    } catch (Exception $e) {
        sendError('Server error', ['error' => 'An error occurred'], 500);
    }
}

/**
 * Create new contact (Public endpoint)
 */
function createContact($db) {
    // Check database connection
    if (!$db) {
        error_log('❌ createContact: Database connection is null');
        sendError('Database error', ['error' => 'Database connection not available'], 500);
        return;
    }
    
    // Ensure table exists
    ensureContactsTable($db);

    $data = getRequestBody();
    
    // Log received data for debugging (only in case of errors)
    if (empty($data)) {
        error_log('⚠️ createContact: Empty request body received');
        error_log('⚠️ Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? 'Not set'));
        error_log('⚠️ Request Method: ' . $_SERVER['REQUEST_METHOD']);
        error_log('⚠️ php://input length: ' . strlen(file_get_contents('php://input')));
    }

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
        // Ensure all required columns exist before inserting
        $requiredColumns = [
            'full_name' => "VARCHAR(255) NOT NULL DEFAULT ''",
            'is_read' => "TINYINT(1) DEFAULT 0",
            'admin_notes' => "TEXT",
            'status' => "ENUM('new', 'responded', 'closed') DEFAULT 'new'",
            'created_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'updated_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        try {
            $existingCols = $db->query("SHOW COLUMNS FROM contacts")->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($requiredColumns as $colName => $colDef) {
                if (!in_array($colName, $existingCols)) {
                    $oldName = null;
                    if ($colName === 'full_name' && in_array('name', $existingCols)) {
                        $oldName = 'name';
                    }
                    
                    if ($oldName) {
                        $db->exec("ALTER TABLE contacts CHANGE COLUMN $oldName $colName $colDef");
                    } else {
                        $position = ($colName === 'full_name') ? 'AFTER id' : '';
                        $db->exec("ALTER TABLE contacts ADD COLUMN $colName $colDef $position");
                    }
                }
            }
        } catch (Exception $colEx) {
            error_log('⚠️ createContact: Column check failed: ' . $colEx->getMessage());
        }
        
        // Test database connection first
        try {
            $testQuery = $db->query("SELECT 1");
            if (!$testQuery) {
                error_log('❌ createContact: Database connection test failed');
                sendError('Database connection failed', ['error' => 'Unable to execute database queries'], 500);
                return;
            }
        } catch (PDOException $testError) {
            error_log('❌ createContact: Database connection test error: ' . $testError->getMessage());
            sendError('Database connection failed', ['error' => $testError->getMessage()], 500);
            return;
        }
        
        $stmt = $db->prepare("
            INSERT INTO contacts (full_name, email, phone, subject, message, status, is_read)
            VALUES (?, ?, ?, ?, ?, 'new', 0)
        ");
        
        if (!$stmt) {
            $errorInfo = $db->errorInfo();
            error_log('❌ createContact: Failed to prepare statement: ' . json_encode($errorInfo));
            sendError('Database error', ['error' => 'Failed to prepare insert statement', 'details' => $errorInfo[2] ?? 'Unknown error'], 500);
            return;
        }

        $result = $stmt->execute([$fullName, $email, $phone, $subject, $message]);
        
        if ($result) {
            $contactId = $db->lastInsertId();
            
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
            error_log('❌ createContact: Insert execution failed: ' . json_encode($errorInfo));
            sendError('Failed to submit contact form', [
                'error' => 'Database insert failed',
                'details' => $errorInfo[2] ?? 'Unknown error',
                'sql_state' => $errorInfo[0] ?? 'N/A',
                'error_code' => $errorInfo[1] ?? 'N/A'
            ], 500);
        }
    } catch (PDOException $e) {
        // PDOException doesn't have errorInfo() method - use getMessage() and getCode()
        error_log('❌ createContact PDO Exception: ' . $e->getMessage() . ' | Code: ' . $e->getCode());
        sendError('Database error occurred', [
            'error' => $e->getMessage(),
            'details' => $e->getMessage(),
            'error_code' => $e->getCode()
        ], 500);
    } catch (Exception $e) {
        error_log('❌ createContact General Exception: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
        sendError('An error occurred', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}

/**
 * Update contact (Admin only)
 */
function updateContact($db, $contactId) {
    // Authenticate first - these functions exit on error
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        $data = getRequestBody();

        // Check if contact exists
        $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
        $stmt->execute([$contactId]);
        if (!$stmt->fetch()) {
            sendError('Contact not found', [], 404);
            return;
        }

        $status = isset($data['status']) ? sanitizeInput($data['status']) : null;
        $adminNotes = isset($data['adminNotes']) ? sanitizeInput($data['adminNotes']) : null;

        // Validate status
        if ($status && !in_array($status, ['new', 'responded', 'closed'])) {
            sendError('Invalid status. Must be one of: new, responded, closed', [], 400);
            return;
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
            return;
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
    } catch (PDOException $e) {
        sendError('Database error', ['error' => 'Failed to update contact'], 500);
    } catch (Exception $e) {
        sendError('Server error', ['error' => 'An error occurred'], 500);
    }
}

/**
 * Mark contact as read (Admin only)
 */
function markContactAsRead($db, $contactId) {
    // Authenticate first - these functions exit on error
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // Check if contact exists
        $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
        $stmt->execute([$contactId]);
        if (!$stmt->fetch()) {
            sendError('Contact not found', [], 404);
            return;
        }

        $stmt = $db->prepare("UPDATE contacts SET is_read = 1, updated_at = NOW() WHERE id = ?");

        if ($stmt->execute([$contactId])) {
            sendSuccess('Contact marked as read');
        } else {
            sendError('Failed to mark contact as read', [], 500);
        }
    } catch (PDOException $e) {
        sendError('Database error', ['error' => 'Failed to mark contact as read'], 500);
    } catch (Exception $e) {
        sendError('Server error', ['error' => 'An error occurred'], 500);
    }
}

/**
 * Delete contact (Admin only)
 */
function deleteContact($db, $contactId) {
    // Authenticate first - these functions exit on error
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // Check if contact exists
        $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
        $stmt->execute([$contactId]);
        if (!$stmt->fetch()) {
            sendError('Contact not found', [], 404);
            return;
        }

        $stmt = $db->prepare("DELETE FROM contacts WHERE id = ?");

        if ($stmt->execute([$contactId])) {
            sendSuccess('Contact deleted successfully');
        } else {
            sendError('Failed to delete contact', [], 500);
        }
    } catch (PDOException $e) {
        sendError('Database error', ['error' => 'Failed to delete contact'], 500);
    } catch (Exception $e) {
        sendError('Server error', ['error' => 'An error occurred'], 500);
    }
}

/**
 * Get contact statistics (Admin only)
 */
function getContactStats($db) {
    // Authenticate first - these functions exit on error
    try {
        $authUser = AuthMiddleware::authenticate();
        if (!$authUser) {
            sendError('Authentication failed', ['error' => 'User not authenticated'], 401);
            return;
        }
        AuthMiddleware::requireAdmin($authUser);
    } catch (Exception $authEx) {
        error_log('❌ getContactStats: Auth exception: ' . $authEx->getMessage());
        sendError('Authentication failed', ['error' => $authEx->getMessage()], 401);
        return;
    } catch (Throwable $authEx) {
        error_log('❌ getContactStats: Auth throwable: ' . $authEx->getMessage());
        sendError('Authentication failed', ['error' => $authEx->getMessage()], 401);
        return;
    }

    try {
        // Check database connection
        if (!$db) {
            error_log('❌ getContactStats: Database connection is null');
            sendError('Database error', ['error' => 'Database connection not available'], 500);
            return;
        }
        
        // First, verify table exists by trying a simple query
        try {
            $testStmt = $db->query("SELECT 1 FROM contacts LIMIT 1");
        } catch (PDOException $tableCheckEx) {
            $tableErrorMsg = $tableCheckEx->getMessage();
            error_log('❌ getContactStats: Table check failed: ' . $tableErrorMsg);
            
            // If table doesn't exist, try to create it one more time
            if (strpos($tableErrorMsg, "doesn't exist") !== false || 
                strpos($tableErrorMsg, "Table") !== false ||
                strpos($tableErrorMsg, "42S02") !== false) {
                try {
                    $db->exec("
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
                    ");
                    error_log('✅ getContactStats: Table created successfully');
                } catch (Exception $createEx) {
                    error_log('❌ getContactStats: Table creation failed: ' . $createEx->getMessage());
                    sendError('Database error: Table does not exist and cannot be created - ' . $createEx->getMessage(), [
                        'error' => 'Contacts table missing',
                        'details' => $createEx->getMessage(),
                        'file' => $createEx->getFile(),
                        'line' => $createEx->getLine(),
                        'location' => 'getContactStats-table-creation'
                    ], 500);
                    return;
                }
            } else {
                // Other database error
                sendError('Database error: ' . $tableErrorMsg, [
                    'error' => 'Database query failed',
                    'details' => $tableErrorMsg,
                    'error_code' => $tableCheckEx->getCode(),
                    'file' => $tableCheckEx->getFile(),
                    'line' => $tableCheckEx->getLine(),
                    'location' => 'getContactStats-table-check'
                ], 500);
                return;
            }
        }
        
        // Ensure all required columns exist before querying stats
        $requiredColumns = [
            'full_name' => "VARCHAR(255) NOT NULL DEFAULT ''",
            'is_read' => "TINYINT(1) DEFAULT 0",
            'admin_notes' => "TEXT",
            'status' => "ENUM('new', 'responded', 'closed') DEFAULT 'new'",
            'created_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'updated_at' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        try {
            $existingCols = $db->query("SHOW COLUMNS FROM contacts")->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($requiredColumns as $colName => $colDef) {
                if (!in_array($colName, $existingCols)) {
                    $oldName = null;
                    if ($colName === 'full_name' && in_array('name', $existingCols)) {
                        $oldName = 'name';
                    }
                    
                    if ($oldName) {
                        $db->exec("ALTER TABLE contacts CHANGE COLUMN $oldName $colName $colDef");
                        error_log("✅ getContactStats: Renamed $oldName to $colName");
                    } else {
                        $position = ($colName === 'full_name') ? 'AFTER id' : '';
                        $db->exec("ALTER TABLE contacts ADD COLUMN $colName $colDef $position");
                        error_log("✅ getContactStats: Added $colName column");
                    }
                }
            }
        } catch (Exception $colEx) {
            error_log('⚠️ getContactStats: Column check failed: ' . $colEx->getMessage());
        }
        
        // Get counts for each status
        // Use backticks for reserved words and ensure proper column names
        $stmt = $db->prepare("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
                SUM(CASE WHEN status = 'responded' THEN 1 ELSE 0 END) as responded_count,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
                SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count
            FROM contacts
        ");
        
        if (!$stmt) {
            $errorInfo = $db->errorInfo();
            error_log('❌ getContactStats: Failed to prepare statement: ' . json_encode($errorInfo));
            sendError('Database error: Failed to prepare query - ' . ($errorInfo[2] ?? 'Unknown error'), [
                'error' => 'Failed to prepare database query',
                'details' => 'Statement preparation failed',
                'sql_state' => $errorInfo[0] ?? 'N/A',
                'error_code' => $errorInfo[1] ?? 'N/A',
                'sql_error' => $errorInfo[2] ?? 'N/A',
                'location' => 'getContactStats-prepare'
            ], 500);
            return;
        }
        
        try {
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $executeEx) {
            // PDOException doesn't have errorInfo() method - use getMessage() and getCode()
            $errorMessage = $executeEx->getMessage();
            $errorCode = $executeEx->getCode();
            error_log('❌ getContactStats: Execute failed: ' . $errorMessage . ' | Code: ' . $errorCode);
            
            // If table doesn't exist, return empty stats
            if (strpos($errorMessage, "doesn't exist") !== false || 
                strpos($errorMessage, "Table") !== false ||
                strpos($errorMessage, "42S02") !== false ||
                strpos($errorMessage, "Base table or view not found") !== false ||
                strpos($errorMessage, "Unknown table") !== false) {
                error_log('⚠️ getContactStats: Table does not exist, returning empty stats');
                sendSuccess('Contact statistics retrieved successfully', [
                    'stats' => [
                        'total' => 0,
                        'new' => 0,
                        'responded' => 0,
                        'closed' => 0,
                        'unread' => 0,
                        'read' => 0
                    ]
                ]);
                return;
            }
            
            // For other errors, return detailed error with full context
            $errorDetails = [
                'error' => 'Failed to execute statistics query',
                'details' => $errorMessage,
                'error_code' => $errorCode,
                'sql_query' => 'SELECT COUNT(*) and SUM aggregations from contacts table',
                'location' => 'getContactStats-execute',
                'file' => $executeEx->getFile(),
                'line' => $executeEx->getLine(),
                'type' => get_class($executeEx)
            ];
            error_log('❌ getContactStats: Full error details: ' . json_encode($errorDetails));
            sendError('Database error', $errorDetails, 500);
            return;
        }

        // Handle case where fetch returns false (no rows) or null values
        if ($stats === false || $stats === null) {
            error_log('⚠️ getContactStats: Query returned false/null, returning empty stats');
            sendSuccess('Contact statistics retrieved successfully', [
                'stats' => [
                    'total' => 0,
                    'new' => 0,
                    'responded' => 0,
                    'closed' => 0,
                    'unread' => 0,
                    'read' => 0
                ]
            ]);
            return;
        }

        // Map column names from query to response format
        // Ensure all values are properly cast to integers, defaulting to 0 if missing
        $responseStats = [
            'total' => (int)($stats['total'] ?? 0),
            'new' => (int)($stats['new_count'] ?? 0),
            'responded' => (int)($stats['responded_count'] ?? 0),
            'closed' => (int)($stats['closed_count'] ?? 0),
            'unread' => (int)($stats['unread_count'] ?? 0),
            'read' => (int)($stats['read_count'] ?? 0)
        ];
        
        // Log the response for debugging (only if there's an issue)
        if (array_sum($responseStats) === 0 && ($stats['total'] ?? 0) > 0) {
            error_log('⚠️ getContactStats: Stats mapping issue - raw stats: ' . json_encode($stats));
        }
        
        sendSuccess('Contact statistics retrieved successfully', [
            'stats' => $responseStats
        ]);
    } catch (PDOException $e) {
        // PDOException doesn't have errorInfo() method - use getMessage() and getCode()
        $errorMsg = 'GetContactStats PDO Exception: ' . $e->getMessage() . ' | Code: ' . $e->getCode();
        error_log('❌ ' . $errorMsg);
        sendError('Database error', [
            'error' => 'Failed to retrieve contact statistics',
            'details' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'location' => 'getContactStats-catch-PDOException'
        ], 500);
    } catch (Exception $e) {
        error_log('❌ GetContactStats General Exception: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
        sendError('Server error', [
            'error' => 'An error occurred while fetching statistics',
            'details' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'type' => get_class($e),
            'location' => 'getContactStats-catch-Exception'
        ], 500);
    }
}
