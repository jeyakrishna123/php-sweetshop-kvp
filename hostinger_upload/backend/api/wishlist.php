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
        $authUser = AuthMiddleware::authenticate();

        error_log('✅ Wishlist: User authenticated - ID: ' . $authUser->id);

        $stmt = $db->prepare("
            SELECT
                w.id, w.product_id, w.created_at,
                p.name, p.slug, p.description, p.price,
                p.original_price, p.discount_percentage, p.category, p.images,
                p.thumbnail, p.stock, p.is_active, p.average_rating, p.num_reviews,
                p.has_weight_options, p.weight_options
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        ");

        error_log('✅ Wishlist: Executing query for user: ' . $authUser->id);
        $stmt->execute([$authUser->id]);
        $wishlist = $stmt->fetchAll();

        error_log('✅ Wishlist: Found ' . count($wishlist) . ' items');

        // Filter out items where product doesn't exist and process the rest
        $validWishlist = [];
        foreach ($wishlist as $item) {
            // Skip if product doesn't exist (LEFT JOIN returned NULL)
            if (empty($item['name'])) {
                error_log('⚠️ Wishlist: Skipping product_id ' . $item['product_id'] . ' - product not found');
                continue;
            }

            // Decode JSON fields
            $item['images'] = json_decode($item['images'], true) ?? [];
            $item['weight_options'] = json_decode($item['weight_options'], true) ?? [];

            // Convert image URLs to full URLs
            if (!empty($item['images'])) {
                foreach ($item['images'] as &$image) {
                    if (!str_starts_with($image, 'http')) {
                        $image = getImageUrl($image);
                    }
                }
            }
            if (!empty($item['thumbnail']) && !str_starts_with($item['thumbnail'], 'http')) {
                $item['thumbnail'] = getImageUrl($item['thumbnail']);
            }

            $validWishlist[] = $item;
        }

        error_log('✅ Wishlist: ' . count($validWishlist) . ' valid items (skipped ' . (count($wishlist) - count($validWishlist)) . ' missing products)');

        sendSuccess('Wishlist retrieved successfully', [
            'wishlist' => $validWishlist,
            'count' => count($validWishlist)
        ]);
    } catch (Exception $e) {
        error_log('❌ Wishlist Error: ' . $e->getMessage());
        error_log('❌ Wishlist Stack trace: ' . $e->getTraceAsString());

        // Return empty wishlist instead of error for better UX
        sendSuccess('Wishlist retrieved successfully', [
            'wishlist' => [],
            'count' => 0
        ]);
    }
}

/**
 * Add product to wishlist
 */
function addToWishlist($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    // Debug logging
    error_log('🔍 addToWishlist - Request data: ' . json_encode($data));
    error_log('🔍 addToWishlist - Auth user ID: ' . $authUser->id);

    $errors = validateRequired($data, ['productId']);
    if (!empty($errors)) {
        error_log('❌ addToWishlist - Validation errors: ' . json_encode($errors));
        sendError('Validation failed', $errors, 400);
    }

    $productId = (int)$data['productId'];
    error_log('🔍 addToWishlist - Product ID (converted to int): ' . $productId);

    // Check if product exists and is active
    $stmt = $db->prepare("SELECT id, name FROM products WHERE id = ? AND is_active = 1");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    error_log('🔍 addToWishlist - Product found: ' . ($product ? 'YES' : 'NO'));
    if ($product) {
        error_log('🔍 addToWishlist - Product name: ' . $product['name']);
    }

    if (!$product) {
        error_log('❌ addToWishlist - Product not found or inactive for ID: ' . $productId);
        sendError('Product not found or inactive', [], 404);
    }

    // Check if already in wishlist
    $stmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$authUser->id, $productId]);
    if ($stmt->fetch()) {
        error_log('⚠️ addToWishlist - Product already in wishlist');
        sendError('Product already in wishlist', [], 409);
    }

    // Add to wishlist
    $stmt = $db->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)");
    if ($stmt->execute([$authUser->id, $productId])) {
        error_log('✅ addToWishlist - Successfully added to wishlist');

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
        error_log('❌ addToWishlist - Failed to insert into wishlist table');
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
