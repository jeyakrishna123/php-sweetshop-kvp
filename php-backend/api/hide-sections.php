<?php
/**
 * Hide Sections API Endpoints
 * Routes: /api/hide-sections/*
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

// Get path after /api/hide-sections/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/hide-sections and /api/php-backend/api/hide-sections
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'hide-sections') {
    // Handle /api/php-backend/api/hide-sections
    $sectionId = isset($pathParts[4]) ? $pathParts[4] : null;
    $action = isset($pathParts[5]) ? $pathParts[5] : null;
} else {
    // Handle /api/hide-sections
    $sectionId = isset($pathParts[2]) ? $pathParts[2] : null;
    $action = isset($pathParts[3]) ? $pathParts[3] : null;
}

try {
    // Check if table exists, create if not
    createHideSectionsTableIfNotExists($db);

    switch ($method) {
        case 'GET':
            if ($sectionId) {
                getHiddenSection($db, $sectionId);
            } else {
                getAllHiddenSections($db);
            }
            break;

        case 'POST':
            createHiddenSection($db);
            break;

        case 'PUT':
            if ($action === 'toggle') {
                toggleSectionVisibility($db, $sectionId);
            } else {
                updateHiddenSection($db, $sectionId);
            }
            break;

        case 'DELETE':
            deleteHiddenSection($db, $sectionId);
            break;

        default:
            sendError('Method not allowed', [], 405);
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Create hide_sections table if it doesn't exist
 */
function createHideSectionsTableIfNotExists($db) {
    try {
        $stmt = $db->prepare("SHOW TABLES LIKE 'hide_sections'");
        $stmt->execute();
        $tableExists = $stmt->fetch();

        if (!$tableExists) {
            $createTableSQL = "
                CREATE TABLE hide_sections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    section_name VARCHAR(255) NOT NULL,
                    section_type VARCHAR(100) NOT NULL,
                    page_path VARCHAR(255) DEFAULT 'all',
                    is_hidden BOOLEAN DEFAULT TRUE,
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_section_type (section_type),
                    INDEX idx_page_path (page_path),
                    INDEX idx_is_hidden (is_hidden)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ";
            $db->exec($createTableSQL);
        }
    } catch (Exception $e) {
        error_log("Error creating hide_sections table: " . $e->getMessage());
    }
}

/**
 * Get all hidden sections
 */
function getAllHiddenSections($db) {
    try {
        $stmt = $db->prepare("
            SELECT
                id,
                section_name as sectionName,
                section_type as sectionType,
                page_path as pagePath,
                is_hidden as isHidden,
                reason,
                created_at as createdAt,
                updated_at as updatedAt
            FROM hide_sections
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $sections = $stmt->fetchAll();

        // Convert is_hidden to boolean
        foreach ($sections as &$section) {
            $section['isHidden'] = (bool)$section['isHidden'];
        }

        sendSuccess('Hidden sections retrieved successfully', [
            'hiddenSections' => $sections,
            'count' => count($sections)
        ]);
    } catch (Exception $e) {
        sendError('Failed to fetch hidden sections', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Get a single hidden section by ID
 */
function getHiddenSection($db, $sectionId) {
    try {
        $stmt = $db->prepare("
            SELECT
                id,
                section_name as sectionName,
                section_type as sectionType,
                page_path as pagePath,
                is_hidden as isHidden,
                reason,
                created_at as createdAt,
                updated_at as updatedAt
            FROM hide_sections
            WHERE id = ?
        ");
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch();

        if (!$section) {
            sendError('Hidden section not found', [], 404);
            return;
        }

        // Convert is_hidden to boolean
        $section['isHidden'] = (bool)$section['isHidden'];

        sendSuccess('Hidden section retrieved successfully', [
            'hiddenSection' => $section
        ]);
    } catch (Exception $e) {
        sendError('Failed to fetch hidden section', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Create a new hidden section (Admin only)
 */
function createHiddenSection($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (empty($input['sectionName']) || empty($input['sectionType'])) {
        sendError('Section name and type are required', [], 400);
        return;
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO hide_sections (
                section_name,
                section_type,
                page_path,
                is_hidden,
                reason
            ) VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $input['sectionName'],
            $input['sectionType'],
            $input['pagePath'] ?? 'all',
            isset($input['isHidden']) ? (int)$input['isHidden'] : 1,
            $input['reason'] ?? null
        ]);

        $sectionId = $db->lastInsertId();

        // Fetch the created section
        $stmt = $db->prepare("
            SELECT
                id,
                section_name as sectionName,
                section_type as sectionType,
                page_path as pagePath,
                is_hidden as isHidden,
                reason,
                created_at as createdAt,
                updated_at as updatedAt
            FROM hide_sections
            WHERE id = ?
        ");
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch();
        $section['isHidden'] = (bool)$section['isHidden'];

        sendSuccess('Section hidden successfully', [
            'hiddenSection' => $section
        ], 201);
    } catch (Exception $e) {
        sendError('Failed to create hidden section', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Update a hidden section (Admin only)
 */
function updateHiddenSection($db, $sectionId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    if (!$sectionId) {
        sendError('Section ID is required', [], 400);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    try {
        // Check if section exists
        $stmt = $db->prepare("SELECT id FROM hide_sections WHERE id = ?");
        $stmt->execute([$sectionId]);
        if (!$stmt->fetch()) {
            sendError('Hidden section not found', [], 404);
            return;
        }

        // Update the section
        $stmt = $db->prepare("
            UPDATE hide_sections
            SET
                section_name = ?,
                section_type = ?,
                page_path = ?,
                is_hidden = ?,
                reason = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $input['sectionName'] ?? null,
            $input['sectionType'] ?? null,
            $input['pagePath'] ?? 'all',
            isset($input['isHidden']) ? (int)$input['isHidden'] : null,
            $input['reason'] ?? null,
            $sectionId
        ]);

        // Fetch the updated section
        $stmt = $db->prepare("
            SELECT
                id,
                section_name as sectionName,
                section_type as sectionType,
                page_path as pagePath,
                is_hidden as isHidden,
                reason,
                created_at as createdAt,
                updated_at as updatedAt
            FROM hide_sections
            WHERE id = ?
        ");
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch();
        $section['isHidden'] = (bool)$section['isHidden'];

        sendSuccess('Hidden section updated successfully', [
            'hiddenSection' => $section
        ]);
    } catch (Exception $e) {
        sendError('Failed to update hidden section', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Toggle section visibility (Admin only)
 */
function toggleSectionVisibility($db, $sectionId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    if (!$sectionId) {
        sendError('Section ID is required', [], 400);
        return;
    }

    try {
        // Check if section exists and get current state
        $stmt = $db->prepare("SELECT id, is_hidden FROM hide_sections WHERE id = ?");
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch();

        if (!$section) {
            sendError('Hidden section not found', [], 404);
            return;
        }

        // Toggle the visibility
        $newState = !$section['is_hidden'];
        $stmt = $db->prepare("UPDATE hide_sections SET is_hidden = ? WHERE id = ?");
        $stmt->execute([(int)$newState, $sectionId]);

        // Fetch the updated section
        $stmt = $db->prepare("
            SELECT
                id,
                section_name as sectionName,
                section_type as sectionType,
                page_path as pagePath,
                is_hidden as isHidden,
                reason,
                created_at as createdAt,
                updated_at as updatedAt
            FROM hide_sections
            WHERE id = ?
        ");
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch();
        $section['isHidden'] = (bool)$section['isHidden'];

        $message = $section['isHidden'] ? 'Section hidden successfully' : 'Section shown successfully';

        sendSuccess($message, [
            'hiddenSection' => $section,
            'message' => $message
        ]);
    } catch (Exception $e) {
        sendError('Failed to toggle section visibility', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Delete a hidden section (Admin only)
 */
function deleteHiddenSection($db, $sectionId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    if (!$sectionId) {
        sendError('Section ID is required', [], 400);
        return;
    }

    try {
        // Check if section exists
        $stmt = $db->prepare("SELECT id FROM hide_sections WHERE id = ?");
        $stmt->execute([$sectionId]);
        if (!$stmt->fetch()) {
            sendError('Hidden section not found', [], 404);
            return;
        }

        // Delete the section
        $stmt = $db->prepare("DELETE FROM hide_sections WHERE id = ?");
        $stmt->execute([$sectionId]);

        sendSuccess('Hidden section deleted successfully', [
            'deletedId' => (int)$sectionId
        ]);
    } catch (Exception $e) {
        sendError('Failed to delete hidden section', ['error' => $e->getMessage()], 500);
    }
}
