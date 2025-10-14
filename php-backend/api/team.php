<?php
/**
 * Team API Endpoints
 * Routes: /api/team/*
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

// Get path after /api/team/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/team and /api/php-backend/api/team
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'team') {
    // Handle /api/php-backend/api/team
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/team
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case '':
            // GET /api/team - Get all team members
            if ($method === 'GET') {
                getAllTeamMembers($db);
            }
            // POST /api/team - Create new team member (admin only)
            elseif ($method === 'POST') {
                createTeamMember($db);
            }
            break;

        default:
            // Handle team member ID operations
            $memberId = $endpoint;
            if (is_numeric($memberId)) {
                if ($method === 'GET') {
                    getTeamMember($db, $memberId);
                } elseif ($method === 'PUT') {
                    updateTeamMember($db, $memberId);
                } elseif ($method === 'DELETE') {
                    deleteTeamMember($db, $memberId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get all team members (Public endpoint)
 */
function getAllTeamMembers($db) {
    try {
        $stmt = $db->prepare("
            SELECT
                id, name, role, bio, image,
                social_links as socialLinks,
                display_order as displayOrder,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM team_members
            WHERE is_active = 1
            ORDER BY display_order ASC, name ASC
        ");
        $stmt->execute();
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode social links JSON
        foreach ($members as &$member) {
            $member['isActive'] = (bool)$member['isActive'];
            $member['displayOrder'] = (int)$member['displayOrder'];
            $member['socialLinks'] = $member['socialLinks'] ? json_decode($member['socialLinks'], true) : [];
        }

        sendSuccess('Team members retrieved successfully', [
            'team' => $members,
            'count' => count($members)
        ]);
    } catch (Exception $e) {
        sendError('Failed to fetch team members', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Get single team member (Public endpoint)
 */
function getTeamMember($db, $memberId) {
    try {
        $stmt = $db->prepare("
            SELECT
                id, name, role, bio, image,
                social_links as socialLinks,
                display_order as displayOrder,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM team_members
            WHERE id = ?
        ");
        $stmt->execute([$memberId]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            sendError('Team member not found', [], 404);
        }

        $member['isActive'] = (bool)$member['isActive'];
        $member['displayOrder'] = (int)$member['displayOrder'];
        $member['socialLinks'] = $member['socialLinks'] ? json_decode($member['socialLinks'], true) : [];

        sendSuccess('Team member retrieved successfully', [
            'member' => $member
        ]);
    } catch (Exception $e) {
        sendError('Failed to fetch team member', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Create new team member (Admin only)
 */
function createTeamMember($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    $errors = validateRequired($data, ['name', 'role']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $name = sanitizeInput($data['name']);
    $role = sanitizeInput($data['role']);
    $bio = isset($data['bio']) ? sanitizeInput($data['bio']) : '';
    $image = isset($data['image']) ? sanitizeInput($data['image']) : '';
    $socialLinks = isset($data['socialLinks']) ? json_encode($data['socialLinks']) : '{}';
    $displayOrder = isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0;
    $isActive = isset($data['isActive']) ? (bool)$data['isActive'] : true;

    try {
        $stmt = $db->prepare("
            INSERT INTO team_members (name, role, bio, image, social_links, display_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        if ($stmt->execute([$name, $role, $bio, $image, $socialLinks, $displayOrder, $isActive])) {
            $memberId = $db->lastInsertId();

            sendSuccess('Team member created successfully', [
                'member' => [
                    'id' => $memberId,
                    'name' => $name,
                    'role' => $role,
                    'bio' => $bio,
                    'image' => $image,
                    'socialLinks' => json_decode($socialLinks, true),
                    'displayOrder' => $displayOrder,
                    'isActive' => $isActive
                ]
            ], 201);
        } else {
            sendError('Failed to create team member', [], 500);
        }
    } catch (Exception $e) {
        sendError('Failed to create team member', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Update team member (Admin only)
 */
function updateTeamMember($db, $memberId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $data = getRequestBody();

    // Check if team member exists
    $stmt = $db->prepare("SELECT id FROM team_members WHERE id = ?");
    $stmt->execute([$memberId]);
    if (!$stmt->fetch()) {
        sendError('Team member not found', [], 404);
    }

    // Build update query dynamically
    $updates = [];
    $params = [];

    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $params[] = sanitizeInput($data['name']);
    }

    if (isset($data['role'])) {
        $updates[] = "role = ?";
        $params[] = sanitizeInput($data['role']);
    }

    if (isset($data['bio'])) {
        $updates[] = "bio = ?";
        $params[] = sanitizeInput($data['bio']);
    }

    if (isset($data['image'])) {
        $updates[] = "image = ?";
        $params[] = sanitizeInput($data['image']);
    }

    if (isset($data['socialLinks'])) {
        $updates[] = "social_links = ?";
        $params[] = json_encode($data['socialLinks']);
    }

    if (isset($data['displayOrder'])) {
        $updates[] = "display_order = ?";
        $params[] = (int)$data['displayOrder'];
    }

    if (isset($data['isActive'])) {
        $updates[] = "is_active = ?";
        $params[] = (bool)$data['isActive'] ? 1 : 0;
    }

    if (empty($updates)) {
        sendError('No valid fields to update', [], 400);
    }

    $updates[] = "updated_at = NOW()";
    $params[] = $memberId;

    try {
        $sql = "UPDATE team_members SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);

        if ($stmt->execute($params)) {
            sendSuccess('Team member updated successfully');
        } else {
            sendError('Failed to update team member', [], 500);
        }
    } catch (Exception $e) {
        sendError('Failed to update team member', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Delete team member (Admin only)
 */
function deleteTeamMember($db, $memberId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    // Check if team member exists
    $stmt = $db->prepare("SELECT id FROM team_members WHERE id = ?");
    $stmt->execute([$memberId]);
    if (!$stmt->fetch()) {
        sendError('Team member not found', [], 404);
    }

    try {
        // Soft delete by setting is_active to 0
        $stmt = $db->prepare("UPDATE team_members SET is_active = 0, updated_at = NOW() WHERE id = ?");

        if ($stmt->execute([$memberId])) {
            sendSuccess('Team member deleted successfully');
        } else {
            sendError('Failed to delete team member', [], 500);
        }
    } catch (Exception $e) {
        sendError('Failed to delete team member', ['error' => $e->getMessage()], 500);
    }
}
