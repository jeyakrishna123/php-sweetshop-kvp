<?php
/**
 * Menu API Endpoints
 * Routes: /api/menu/*
 */

// session_start(); // Already started in index.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/cors.php';

// Handle CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/menu and /api/php-backend/api/menu
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'menu') {
    // Handle /api/php-backend/api/menu
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/menu
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

// Auto-create menu_items table if it doesn't exist
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS menu_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image VARCHAR(500),
            color VARCHAR(50) DEFAULT '#f59e0b',
            `order` INT DEFAULT 0,
            link VARCHAR(500),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_order (`order`),
            INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
} catch (Exception $e) {
    // Table already exists
}

try {
    // Route based on endpoint and method
    if ($endpoint === 'active') {
        if ($method === 'GET') {
            getActiveMenu($db);
        } else {
            sendError('Method not allowed', [], 405);
        }
    } else if ($endpoint === 'order' && isset($pathParts[3]) && $pathParts[3] === 'update') {
        // Handle /api/menu/order/update - requires admin auth
        if ($method === 'PUT') {
            try {
                $authUser = AuthMiddleware::authenticate();
                AuthMiddleware::requireAdmin($authUser);
                updateMenuOrder($db);
            } catch (Exception $e) {
                sendError('Authentication required', [], 401);
            }
        } else {
            sendError('Method not allowed', [], 405);
        }
    } else if (empty($endpoint)) {
        // Handle /api/menu (no ID)
        switch ($method) {
            case 'GET':
                // Public access for getting menu items
                getAllMenuItems($db);
                break;
            case 'POST':
                // Requires admin authentication
                try {
                    $authUser = AuthMiddleware::authenticate();
                    AuthMiddleware::requireAdmin($authUser);
                    createMenuItem($db);
                } catch (Exception $e) {
                    sendError('Authentication required', [], 401);
                }
                break;
            default:
                sendError('Method not allowed', [], 405);
        }
    } else if (is_numeric($endpoint)) {
        // Handle /api/menu/:id - requires admin auth for all operations
        $menuId = (int)$endpoint;
        
        try {
            $authUser = AuthMiddleware::authenticate();
            AuthMiddleware::requireAdmin($authUser);
            
            switch ($method) {
                case 'GET':
                    getMenuItem($db, $menuId);
                    break;
                case 'PUT':
                    updateMenuItem($db, $menuId);
                    break;
                case 'DELETE':
                    deleteMenuItem($db, $menuId);
                    break;
            default:
                sendError('Method not allowed', [], 405);
        }
        } catch (Exception $e) {
            sendError('Authentication required', [], 401);
        }
    } else {
        sendError('Menu endpoint not found', [], 404);
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get all menu items (Admin only)
 */
function getAllMenuItems($db) {
    require_once __DIR__ . '/../middleware/auth.php';
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // DEBUG: Log what we're fetching from database
        error_log("🔍 getAllMenuItems - Fetching menu items from database");
        
        $stmt = $db->prepare("
            SELECT
                id as _id,
                name,
                description,
                image,
                color,
                `order`,
                link,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM menu_items
            ORDER BY `order` ASC, created_at DESC
        ");
        $stmt->execute();
        $menuItems = $stmt->fetchAll();

        // DEBUG: Log what was fetched from database
        error_log("🔍 getAllMenuItems - Fetched " . count($menuItems) . " menu items");
        foreach ($menuItems as $item) {
            error_log("🔍 getAllMenuItems - Item: " . $item['name'] . " | Image: " . ($item['image'] ?: 'EMPTY'));
        }

        sendSuccess('Menu items retrieved successfully', $menuItems);
    } catch (Exception $e) {
        sendError('Failed to fetch menu items', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Get single menu item by ID
 */
function getMenuItem($db, $menuId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        $stmt = $db->prepare("
            SELECT
                id as _id,
                name,
                description,
                image,
                color,
                `order`,
                link,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM menu_items
            WHERE id = ?
        ");
        $stmt->execute([$menuId]);
        $menuItem = $stmt->fetch();

        if (!$menuItem) {
            sendError('Menu item not found', [], 404);
            return;
        }

        sendSuccess('Menu item retrieved successfully', $menuItem);
    } catch (Exception $e) {
        sendError('Failed to fetch menu item', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Create new menu item (Admin only)
 */
function createMenuItem($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['name'])) {
        sendError('Menu name is required', [], 400);
        return;
    }

    try {
        // DEBUG: Log the input data
        error_log("🔍 createMenuItem - Input data: " . json_encode($input));
        error_log("🔍 createMenuItem - Image value: " . ($input['image'] ?? 'NULL'));
        
        $stmt = $db->prepare("
            INSERT INTO menu_items (name, description, image, color, `order`, link, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $input['image'] ?? '',
            $input['color'] ?? '#f59e0b',
            $input['order'] ?? 0,
            $input['link'] ?? '',
            isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1
        ]);

        $newId = $db->lastInsertId();

        // Fetch the created item
        $stmt = $db->prepare("
            SELECT
                id as _id,
                name,
                description,
                image,
                color,
                `order`,
                link,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM menu_items
            WHERE id = ?
        ");
        $stmt->execute([$newId]);
        $newMenuItem = $stmt->fetch();

        sendSuccess('Menu item created successfully', $newMenuItem, 201);
    } catch (Exception $e) {
        sendError('Failed to create menu item', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Update menu item (Admin only)
 */
function updateMenuItem($db, $menuId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $input = json_decode(file_get_contents('php://input'), true);

    // DEBUG: Log the input data
    error_log("🔍 updateMenuItem - Input data: " . json_encode($input));
    error_log("🔍 updateMenuItem - Image value: " . ($input['image'] ?? 'NULL'));

    try {
        // Check if menu item exists
        $stmt = $db->prepare("SELECT id FROM menu_items WHERE id = ?");
        $stmt->execute([$menuId]);
        if (!$stmt->fetch()) {
            sendError('Menu item not found', [], 404);
            return;
        }

        // Build update query dynamically
        $updates = [];
        $params = [];

        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = $input['name'];
        }
        if (isset($input['description'])) {
            $updates[] = "description = ?";
            $params[] = $input['description'];
        }
        if (isset($input['image'])) {
            $updates[] = "image = ?";
            $params[] = $input['image'];
        }
        if (isset($input['color'])) {
            $updates[] = "color = ?";
            $params[] = $input['color'];
        }
        if (isset($input['order'])) {
            $updates[] = "`order` = ?";
            $params[] = $input['order'];
        }
        if (isset($input['link'])) {
            $updates[] = "link = ?";
            $params[] = $input['link'];
        }
        if (isset($input['isActive'])) {
            $updates[] = "is_active = ?";
            $params[] = $input['isActive'] ? 1 : 0;
        }

        if (empty($updates)) {
            sendError('No fields to update', [], 400);
            return;
        }

        $params[] = $menuId;
        $sql = "UPDATE menu_items SET " . implode(', ', $updates) . " WHERE id = ?";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        // DEBUG: Log what was actually saved to database
        error_log("🔍 updateMenuItem - SQL executed: " . $sql);
        error_log("🔍 updateMenuItem - Parameters: " . json_encode($params));

        // Fetch updated item
        $stmt = $db->prepare("
            SELECT
                id as _id,
                name,
                description,
                image,
                color,
                `order`,
                link,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM menu_items
            WHERE id = ?
        ");
        $stmt->execute([$menuId]);
        $updatedMenuItem = $stmt->fetch();

        sendSuccess('Menu item updated successfully', $updatedMenuItem);
    } catch (Exception $e) {
        sendError('Failed to update menu item', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Delete menu item (Admin only)
 */
function deleteMenuItem($db, $menuId) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // Check if menu item exists
        $stmt = $db->prepare("SELECT id FROM menu_items WHERE id = ?");
        $stmt->execute([$menuId]);
        if (!$stmt->fetch()) {
            sendError('Menu item not found', [], 404);
            return;
        }

        // Delete menu item
        $stmt = $db->prepare("DELETE FROM menu_items WHERE id = ?");
        $stmt->execute([$menuId]);

        sendSuccess('Menu item deleted successfully', ['id' => $menuId]);
    } catch (Exception $e) {
        sendError('Failed to delete menu item', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Update menu order (Admin only)
 */
function updateMenuOrder($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['menuItems']) || !is_array($input['menuItems'])) {
        sendError('Menu items array is required', [], 400);
        return;
    }

    try {
        $db->beginTransaction();

        foreach ($input['menuItems'] as $index => $item) {
            if (!isset($item['_id'])) {
                continue;
            }

            $stmt = $db->prepare("UPDATE menu_items SET `order` = ? WHERE id = ?");
            $stmt->execute([$index, $item['_id']]);
        }

        $db->commit();

        sendSuccess('Menu order updated successfully', ['updated' => count($input['menuItems'])]);
    } catch (Exception $e) {
        $db->rollBack();
        sendError('Failed to update menu order', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Get active menu items (Public endpoint)
 */
function getActiveMenu($db) {
    try {
        // Get active menu items from menu_items table
        $stmt = $db->prepare("
            SELECT
                id as _id,
                name,
                description,
                image,
                color,
                `order`,
                link,
                is_active as isActive,
                created_at as createdAt,
                updated_at as updatedAt
            FROM menu_items
            WHERE is_active = 1
            ORDER BY `order` ASC, created_at DESC
        ");
        $stmt->execute();
        $menuItems = $stmt->fetchAll();

        // DEBUG: Log what's being returned to frontend
        error_log("🍽️ getActiveMenu - Returning " . count($menuItems) . " active menu items");
        foreach ($menuItems as $item) {
            error_log("🍽️ getActiveMenu - Item: " . $item['name'] . " | Image: " . ($item['image'] ?: 'EMPTY'));
        }

        // Return menu items directly in data field for frontend compatibility
        sendSuccess('Active menu retrieved successfully', $menuItems);
    } catch (Exception $e) {
        sendError('Failed to fetch active menu', ['error' => $e->getMessage()], 500);
    }
}
?>
