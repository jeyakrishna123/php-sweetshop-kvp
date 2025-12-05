<?php
/**
 * Reviews API Endpoints
 * Routes: /api/reviews/*
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

// Get path after /api/reviews/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/reviews and /api/php-backend/api/reviews
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'reviews') {
    // Handle /api/php-backend/api/reviews
    $endpoint = isset($pathParts[4]) ? $pathParts[4] : '';
} else {
    // Handle /api/reviews
    $endpoint = isset($pathParts[2]) ? $pathParts[2] : '';
}

try {
    switch ($endpoint) {
        case 'product':
            if ($method === 'GET') {
                $productId = isset($pathParts[3]) ? $pathParts[3] : null;
                getProductReviews($db, $productId);
            }
            break;

        case '':
            if ($method === 'POST') {
                createReview($db);
            }
            break;

        case 'user':
            if ($method === 'GET' && isset($pathParts[3]) && $pathParts[3] === 'my-reviews') {
                getUserReviews($db);
            }
            break;

        case 'admin':
            if ($method === 'GET' && isset($pathParts[3]) && $pathParts[3] === 'all') {
                getAllReviews($db);
            }
            break;

        default:
            // Handle review ID operations
            $reviewId = $endpoint;
            if (is_numeric($reviewId)) {
                if ($method === 'PUT') {
                    updateReview($db, $reviewId);
                } elseif ($method === 'DELETE') {
                    deleteReview($db, $reviewId);
                }
            } else {
                sendError('Endpoint not found', [], 404);
            }
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get reviews for a product
 */
function getProductReviews($db, $productId) {
    if (!$productId) {
        sendError('Product ID is required', [], 400);
    }

    $stmt = $db->prepare("
        SELECT
            r.id, r.user_id, r.name, r.rating, r.comment, r.created_at,
            u.name as user_name, u.avatar as user_avatar
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$productId]);
    $reviews = $stmt->fetchAll();

    sendSuccess('Reviews retrieved successfully', [
        'reviews' => $reviews,
        'count' => count($reviews)
    ]);
}

/**
 * Create a new review
 */
function createReview($db) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $errors = validateRequired($data, ['productId', 'rating', 'comment']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $productId = (int)$data['productId'];
    $rating = (int)$data['rating'];
    $comment = sanitizeInput($data['comment']);

    // Validate rating
    if ($rating < 1 || $rating > 5) {
        sendError('Rating must be between 1 and 5', [], 400);
    }

    // Validate comment length
    if (strlen($comment) > 500) {
        sendError('Comment cannot exceed 500 characters', [], 400);
    }

    // Check if product exists
    $stmt = $db->prepare("SELECT id, name FROM products WHERE id = ? AND is_active = 1");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        sendError('Product not found', [], 404);
    }

    // Check if user already reviewed this product
    $stmt = $db->prepare("SELECT id FROM reviews WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$authUser->id, $productId]);
    if ($stmt->fetch()) {
        sendError('You have already reviewed this product', [], 409);
    }

    // Get user name
    $stmt = $db->prepare("SELECT name FROM users WHERE id = ?");
    $stmt->execute([$authUser->id]);
    $user = $stmt->fetch();

    // Insert review
    $stmt = $db->prepare("
        INSERT INTO reviews (product_id, user_id, name, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    ");

    if ($stmt->execute([$productId, $authUser->id, $user['name'], $rating, $comment])) {
        $reviewId = $db->lastInsertId();

        // Update product average rating
        updateProductRating($db, $productId);

        // Update user's review count
        $stmt = $db->prepare("UPDATE users SET review_count = review_count + 1 WHERE id = ?");
        $stmt->execute([$authUser->id]);

        sendSuccess('Review created successfully', [
            'review' => [
                'id' => $reviewId,
                'product_id' => $productId,
                'user_id' => $authUser->id,
                'name' => $user['name'],
                'rating' => $rating,
                'comment' => $comment
            ]
        ], 201);
    } else {
        sendError('Failed to create review', [], 500);
    }
}

/**
 * Update review
 */
function updateReview($db, $reviewId) {
    $authUser = AuthMiddleware::authenticate();
    $data = getRequestBody();

    $errors = validateRequired($data, ['rating', 'comment']);
    if (!empty($errors)) {
        sendError('Validation failed', $errors, 400);
    }

    $rating = (int)$data['rating'];
    $comment = sanitizeInput($data['comment']);

    // Validate rating
    if ($rating < 1 || $rating > 5) {
        sendError('Rating must be between 1 and 5', [], 400);
    }

    // Check if review exists and belongs to user
    $stmt = $db->prepare("SELECT id, product_id, user_id FROM reviews WHERE id = ?");
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();

    if (!$review) {
        sendError('Review not found', [], 404);
    }

    if ($review['user_id'] != $authUser->id) {
        sendError('Unauthorized to update this review', [], 403);
    }

    // Update review
    $stmt = $db->prepare("
        UPDATE reviews
        SET rating = ?, comment = ?
        WHERE id = ?
    ");

    if ($stmt->execute([$rating, $comment, $reviewId])) {
        // Update product average rating
        updateProductRating($db, $review['product_id']);

        sendSuccess('Review updated successfully');
    } else {
        sendError('Failed to update review', [], 500);
    }
}

/**
 * Delete review
 */
function deleteReview($db, $reviewId) {
    $authUser = AuthMiddleware::authenticate();

    // Check if review exists and belongs to user (or user is admin)
    $stmt = $db->prepare("SELECT id, product_id, user_id FROM reviews WHERE id = ?");
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();

    if (!$review) {
        sendError('Review not found', [], 404);
    }

    if ($review['user_id'] != $authUser->id && $authUser->role !== 'admin') {
        sendError('Unauthorized to delete this review', [], 403);
    }

    // Delete review
    $stmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
    if ($stmt->execute([$reviewId])) {
        // Update product average rating
        updateProductRating($db, $review['product_id']);

        // Update user's review count
        $stmt = $db->prepare("UPDATE users SET review_count = GREATEST(review_count - 1, 0) WHERE id = ?");
        $stmt->execute([$review['user_id']]);

        sendSuccess('Review deleted successfully');
    } else {
        sendError('Failed to delete review', [], 500);
    }
}

/**
 * Get user's reviews
 */
function getUserReviews($db) {
    $authUser = AuthMiddleware::authenticate();

    $stmt = $db->prepare("
        SELECT
            r.id, r.product_id, r.rating, r.comment, r.created_at,
            p.name as product_name, p.thumbnail as product_image
        FROM reviews r
        INNER JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$authUser->id]);
    $reviews = $stmt->fetchAll();

    sendSuccess('Reviews retrieved successfully', [
        'reviews' => $reviews,
        'count' => count($reviews)
    ]);
}

/**
 * Get all reviews (Admin only)
 */
function getAllReviews($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $stmt = $db->prepare("
        SELECT
            r.id, r.product_id, r.user_id, r.name, r.rating, r.comment, r.created_at,
            p.name as product_name,
            u.email as user_email
        FROM reviews r
        INNER JOIN products p ON r.product_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    ");
    $stmt->execute();
    $reviews = $stmt->fetchAll();

    sendSuccess('All reviews retrieved successfully', [
        'reviews' => $reviews,
        'count' => count($reviews)
    ]);
}

/**
 * Helper function to update product average rating
 */
function updateProductRating($db, $productId) {
    $stmt = $db->prepare("
        SELECT AVG(rating) as avg_rating, COUNT(*) as num_reviews
        FROM reviews
        WHERE product_id = ?
    ");
    $stmt->execute([$productId]);
    $stats = $stmt->fetch();

    $avgRating = $stats['avg_rating'] ? round($stats['avg_rating'], 2) : 0;
    $numReviews = $stats['num_reviews'] ?? 0;

    $stmt = $db->prepare("
        UPDATE products
        SET average_rating = ?, num_reviews = ?
        WHERE id = ?
    ");
    $stmt->execute([$avgRating, $numReviews, $productId]);
}
