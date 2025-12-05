<?php
/**
 * Wishlist API Endpoints
 * Routes: /api/wishlist/*
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

// Auto-create wishlist table if it doesn't exist
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS wishlist (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_wishlist (user_id, product_id),
            INDEX idx_user_id (user_id),
            INDEX idx_product_id (product_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
} catch (Exception $e) {
    // Table already exists
    error_log('Wishlist table check: ' . $e->getMessage());
}

// Get path after /api/wishlist/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/wishlist and /api/php-backend/api/wishlist
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'wishlist') {
    // Handle /api/php-backend/api/wishlist
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/wishlist
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case '':
            // Root endpoint
            if ($method === 'GET') {
                getWishlist($db);
            }
            break;

        case 'add':
            if ($method === 'POST') {
                addToWishlist($db);
            }
            break;

        case 'remove':
            if ($method === 'DELETE') {
                // Handle /api/wishlist/remove/{id}
                $productId = isset($pathParts[3]) ? $pathParts[3] : null;
                if (!$productId) {
                    sendError('Product ID is required', [], 400);
                    return;
                }
                removeFromWishlist($db, $productId);
            }
            break;

        case 'clear':
            if ($method === 'DELETE') {
                clearWishlist($db);
            }
            break;

        case 'check':
            if ($method === 'GET') {
                $productId = isset($pathParts[3]) ? $pathParts[3] : null;
                checkWishlist($db, $productId);
            }
            break;

        default:
            // Handle DELETE /api/wishlist/{productId} (direct product ID)
            if ($method === 'DELETE' && is_numeric($endpoint)) {
                removeFromWishlist($db, $endpoint);
            }
            // Handle GET /api/wishlist/check/{productId}
            else if ($method === 'GET' && is_numeric($endpoint)) {
                checkWishlist($db, $endpoint);
            }
            else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get user's wishlist
 */
function getWishlist($db) {
    try {
        // Authenticate and get user_id
        $authUser = AuthMiddleware::authenticate();
        $userId = (int)$authUser->id;
        
        // Query wishlist items for the authenticated user
        $stmt = $db->prepare("
            SELECT
                w.id, w.product_id, w.created_at,
                p.name, p.description, p.price,
                p.original_price, p.discount_percentage, p.category_id, p.images,
                p.thumbnail, p.stock, p.is_active, p.average_rating, p.num_reviews,
                p.weight_options
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        ");
        
        $stmt->execute([$userId]);
        $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process all items - include missing products with a flag
        $validWishlist = [];
        foreach ($wishlist as $item) {
            // Ensure product_id is set (from wishlist table)
            $productId = isset($item['product_id']) ? $item['product_id'] : (isset($item['id']) ? $item['id'] : null);
            if (empty($productId) || $productId === null) {
                continue;
            }
            
            // Ensure product_id is set in item for processing
            if (!isset($item['product_id'])) {
                $item['product_id'] = $productId;
            }
            
            // Check if product exists (name will be NULL if LEFT JOIN finds no product)
            $productExists = !empty($item['name']) && $item['name'] !== null;
            
            if (!$productExists) {
                // Include item but mark as unavailable
                $validItem = [
                    'id' => (int)$item['id'],
                    'product_id' => (int)$item['product_id'],
                    'created_at' => $item['created_at'],
                    'name' => 'Product Unavailable',
                    'is_unavailable' => true,
                    'images' => [],
                    'thumbnail' => null,
                    'price' => 0,
                    'stock' => 0,
                    'is_active' => 0,
                    'average_rating' => 0,
                    'num_reviews' => 0
                ];
            } else {
                // Product exists - process normally
                $validItem = $item;
                $validItem['is_unavailable'] = false;
                $validItem['product_id'] = (int)$validItem['product_id'];
                $validItem['id'] = (int)$validItem['id'];
                
                // Decode JSON fields
                $validItem['images'] = json_decode($validItem['images'], true) ?? [];
                $validItem['weight_options'] = json_decode($validItem['weight_options'], true) ?? [];

                // CRITICAL: Convert image URLs to full URLs using filterBase64Images for consistency
                if (!empty($validItem['images']) && is_array($validItem['images'])) {
                    $validItem['images'] = filterBase64Images($validItem['images']);
                }
                // Convert thumbnail to production URL (filter base64)
                if (!empty($validItem['thumbnail'])) {
                    $validItem['thumbnail'] = filterBase64Thumbnail($validItem['thumbnail']);
                }
            }

            $validWishlist[] = $validItem;
        }

        $responseData = [
            'wishlist' => $validWishlist,
            'count' => count($validWishlist)
        ];

        sendSuccess('Wishlist retrieved successfully', $responseData);
    } catch (Exception $e) {
        // Log error for debugging
        error_log('Wishlist Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        
        // Return proper error response
        sendError('Failed to retrieve wishlist', ['error' => 'An error occurred while fetching your wishlist'], 500);
    }
}

/**
 * Add product to wishlist
 */
function addToWishlist($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $errors = validateRequired($data, ['productId']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $productId = (int)$data['productId'];

    // Check if product exists and is active
    $stmt = $db->prepare("SELECT id, name FROM products WHERE id = ? AND is_active = 1");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        sendError('Product not found or inactive', [], 404);
    }

    // Check if already in wishlist
    $stmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$authUser->id, $productId]);
    if ($stmt->fetch()) {
        sendError('Product already in wishlist', [], 409);
    }

    // Add to wishlist
    $stmt = $db->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)");
    if ($stmt->execute([$authUser->id, $productId])) {
        // Update user's wishlist count
        $stmt = $db->prepare("UPDATE users SET wishlist_count = wishlist_count + 1 WHERE id = ?");
        $stmt->execute([$authUser->id]);

        sendSuccess('Product added to wishlist', [
            'wishlist_item' => [
                'id' => $db->lastInsertId(),
                'product_id' => $productId,
                'product_name' => $product['name']
            ]
        ], 201);
    } else {
        sendError('Failed to add to wishlist', [], 500);
    }
}

/**
 * Remove product from wishlist
 */
function removeFromWishlist($db, $productId) {
    $authUser = AuthMiddleware::authenticate();

    if (!$productId) {
        sendError('Product ID is required', [], 400);
    }

    $stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
    if ($stmt->execute([$authUser->id, $productId])) {
        if ($stmt->rowCount() > 0) {
            // Update user's wishlist count
            $stmt = $db->prepare("UPDATE users SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = ?");
            $stmt->execute([$authUser->id]);

            sendSuccess('Product removed from wishlist');
        } else {
            sendError('Product not in wishlist', [], 404);
        }
    } else {
        sendError('Failed to remove from wishlist', [], 500);
    }
}

/**
 * Clear entire wishlist
 */
function clearWishlist($db) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ?");
    if ($stmt->execute([$authUser->id])) {
        // Reset user's wishlist count
        $stmt = $db->prepare("UPDATE users SET wishlist_count = 0 WHERE id = ?");
        $stmt->execute([$authUser->id]);

        sendSuccess('Wishlist cleared successfully');
    } else {
        sendError('Failed to clear wishlist', [], 500);
    }
}

/**
 * Check if product is in wishlist
 */
function checkWishlist($db, $productId) {
    $authUser = AuthMiddleware::authenticate();

    if (!$productId) {
        sendError('Product ID is required', [], 400);
    }

    $stmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$authUser->id, $productId]);
    $exists = $stmt->fetch() ? true : false;

    sendSuccess('Wishlist status checked', [
        'in_wishlist' => $exists,
        'product_id' => $productId
    ]);
}
