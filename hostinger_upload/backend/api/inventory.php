<?php
/**
 * Inventory API Endpoints
 * Routes: /api/inventory/*
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

// Get path after /api/inventory/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Handle both /api/inventory and /api/php-backend/api/inventory
if (isset($pathParts[1]) && $pathParts[1] === 'php-backend' && isset($pathParts[2]) && $pathParts[2] === 'api' && isset($pathParts[3]) && $pathParts[3] === 'inventory') {
    // Handle /api/php-backend/api/inventory
    $action = isset($pathParts[4]) ? $pathParts[4] : null;
} else {
    // Handle /api/inventory
    $action = isset($pathParts[2]) ? $pathParts[2] : null;
}

try {
    switch ($method) {
        case 'GET':
            if (!$action) {
                getInventory($db);
            } else if ($action === 'summary') {
                getInventorySummary($db);
            } else {
                sendError('Invalid action', [], 400);
            }
            break;

        case 'PUT':
            if ($action === 'stock') {
                updateStock($db);
            } else if ($action === 'bulk-stock') {
                bulkUpdateStock($db);
            } else {
                sendError('Invalid action', [], 400);
            }
            break;

        default:
            sendError('Method not allowed', [], 405);
    }
} catch (Exception $e) {
    sendError('Server error', ['error' => $e->getMessage()], 500);
}

/**
 * Get comprehensive inventory data with sales analytics (Admin only)
 */
function getInventory($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // Get all products with their stock information
        // Use basic columns that exist in the products table
        $stmt = $db->prepare("
            SELECT
                p.id as _id,
                p.name,
                p.category,
                p.price,
                p.stock,
                p.created_at as createdAt,
                p.updated_at as updatedAt
            FROM products p
            WHERE p.is_active = 1
            ORDER BY p.name ASC
        ");
        $stmt->execute();
        $products = $stmt->fetchAll();

        // Get sales data for each product
        $inventory = [];
        foreach ($products as $product) {
            // Get total sold and revenue from orders
            $stmt = $db->prepare("
                SELECT
                    SUM(oi.quantity) as totalSold,
                    SUM(oi.quantity * oi.price) as revenue,
                    MAX(o.created_at) as lastSold
                FROM order_items oi
                INNER JOIN orders o ON oi.order_id = o.id
                WHERE oi.product_id = ?
                AND o.status IN ('delivered', 'shipped', 'processing')
            ");
            $stmt->execute([$product['_id']]);
            $salesData = $stmt->fetch();

            $totalSold = (int)($salesData['totalSold'] ?? 0);
            $revenue = (float)($salesData['revenue'] ?? 0);
            $price = (float)$product['price'];
            $cost = $price * 0.6; // Estimate cost as 60% of price
            $profit = $revenue - ($totalSold * $cost);

            $inventory[] = [
                '_id' => $product['_id'],
                'name' => $product['name'],
                'sku' => 'SKU-' . $product['_id'], // Generate SKU from ID
                'category' => $product['category'] ?? 'Uncategorized',
                'price' => $price,
                'cost' => $cost,
                'stock' => (int)$product['stock'],
                'minStock' => 10, // Default minimum stock
                'maxStock' => 100, // Default maximum stock
                'supplier' => 'Default Supplier',
                'location' => 'Main Warehouse',
                'notes' => '',
                'totalSold' => $totalSold,
                'revenue' => $revenue,
                'profit' => $profit,
                'lastSold' => $salesData['lastSold'] ?? null,
                'createdAt' => $product['createdAt'],
                'updatedAt' => $product['updatedAt']
            ];
        }

        // Calculate summary statistics
        $summary = calculateInventorySummary($inventory);

        sendSuccess('Inventory retrieved successfully', [
            'inventory' => $inventory,
            'summary' => $summary,
            'count' => count($inventory)
        ]);
    } catch (Exception $e) {
        sendError('Failed to fetch inventory', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Get inventory summary statistics (Admin only)
 */
function getInventorySummary($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    try {
        // Get all products
        $stmt = $db->prepare("
            SELECT
                COUNT(*) as totalProducts,
                SUM(CASE WHEN stock > 10 THEN 1 ELSE 0 END) as inStock,
                SUM(CASE WHEN stock > 0 AND stock <= 10 THEN 1 ELSE 0 END) as lowStock,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock,
                SUM(stock * price * 0.6) as totalValue,
                SUM(stock * price) as potentialRevenue
            FROM products
            WHERE is_active = 1
        ");
        $stmt->execute();
        $stats = $stmt->fetch();

        // Get total revenue from all sales
        $stmt = $db->prepare("
            SELECT SUM(total_price) as totalRevenue
            FROM orders
            WHERE status IN ('delivered', 'shipped', 'processing')
        ");
        $stmt->execute();
        $revenueData = $stmt->fetch();

        $totalProducts = (int)$stats['totalProducts'];
        $inStock = (int)$stats['inStock'];
        $lowStock = (int)$stats['lowStock'];
        $outOfStock = (int)$stats['outOfStock'];

        $summary = [
            'totalProducts' => $totalProducts,
            'inStock' => $inStock,
            'lowStock' => $lowStock,
            'outOfStock' => $outOfStock,
            'lowStockPercentage' => $totalProducts > 0 ? ($lowStock / $totalProducts) * 100 : 0,
            'outOfStockPercentage' => $totalProducts > 0 ? ($outOfStock / $totalProducts) * 100 : 0,
            'totalValue' => (float)($stats['totalValue'] ?? 0),
            'potentialRevenue' => (float)($stats['potentialRevenue'] ?? 0),
            'totalRevenue' => (float)($revenueData['totalRevenue'] ?? 0)
        ];

        sendSuccess('Inventory summary retrieved successfully', $summary);
    } catch (Exception $e) {
        sendError('Failed to fetch inventory summary', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Update stock for a product (Admin only)
 */
function updateStock($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['productId']) || !isset($input['quantity']) || !isset($input['operation'])) {
        sendError('Product ID, quantity, and operation are required', [], 400);
        return;
    }

    $productId = $input['productId'];
    $quantity = (int)$input['quantity'];
    $operation = $input['operation']; // 'set', 'add', 'subtract'

    try {
        // Get current stock
        $stmt = $db->prepare("SELECT stock FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        if (!$product) {
            sendError('Product not found', [], 404);
            return;
        }

        $currentStock = (int)$product['stock'];
        $newStock = $currentStock;

        switch ($operation) {
            case 'set':
                $newStock = $quantity;
                break;
            case 'add':
                $newStock = $currentStock + $quantity;
                break;
            case 'subtract':
                $newStock = max(0, $currentStock - $quantity);
                break;
            default:
                sendError('Invalid operation. Use: set, add, or subtract', [], 400);
                return;
        }

        // Update stock
        $stmt = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");
        $stmt->execute([$newStock, $productId]);

        // Log stock change (optional - requires stock_logs table)
        try {
            $stmt = $db->prepare("
                INSERT INTO stock_logs (product_id, old_stock, new_stock, operation, quantity, user_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $productId,
                $currentStock,
                $newStock,
                $operation,
                $quantity,
                $authUser->id ?? null
            ]);
        } catch (Exception $e) {
            // Silently fail if stock_logs table doesn't exist
        }

        sendSuccess('Stock updated successfully', [
            'productId' => $productId,
            'oldStock' => $currentStock,
            'newStock' => $newStock,
            'operation' => $operation
        ]);
    } catch (Exception $e) {
        sendError('Failed to update stock', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Bulk update stock for multiple products (Admin only)
 */
function bulkUpdateStock($db) {
    $authUser = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($authUser);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['updates']) || !is_array($input['updates'])) {
        sendError('Updates array is required', [], 400);
        return;
    }

    try {
        $db->beginTransaction();

        $successCount = 0;
        $errors = [];

        foreach ($input['updates'] as $update) {
            try {
                if (!isset($update['productId']) || !isset($update['quantity']) || !isset($update['operation'])) {
                    $errors[] = "Missing required fields for product update";
                    continue;
                }

                $productId = $update['productId'];
                $quantity = (int)$update['quantity'];
                $operation = $update['operation'];

                // Get current stock
                $stmt = $db->prepare("SELECT stock FROM products WHERE id = ?");
                $stmt->execute([$productId]);
                $product = $stmt->fetch();

                if (!$product) {
                    $errors[] = "Product {$productId} not found";
                    continue;
                }

                $currentStock = (int)$product['stock'];
                $newStock = $currentStock;

                switch ($operation) {
                    case 'set':
                        $newStock = $quantity;
                        break;
                    case 'add':
                        $newStock = $currentStock + $quantity;
                        break;
                    case 'subtract':
                        $newStock = max(0, $currentStock - $quantity);
                        break;
                }

                // Update stock
                $stmt = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");
                $stmt->execute([$newStock, $productId]);

                $successCount++;
            } catch (Exception $e) {
                $errors[] = "Error updating product {$productId}: " . $e->getMessage();
            }
        }

        $db->commit();

        sendSuccess('Bulk stock update completed', [
            'successCount' => $successCount,
            'totalUpdates' => count($input['updates']),
            'errors' => $errors
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        sendError('Bulk stock update failed', ['error' => $e->getMessage()], 500);
    }
}

/**
 * Calculate inventory summary statistics
 */
function calculateInventorySummary($inventory) {
    $totalProducts = count($inventory);
    $inStock = 0;
    $lowStock = 0;
    $outOfStock = 0;
    $totalValue = 0;
    $totalRevenue = 0;

    foreach ($inventory as $item) {
        $stock = $item['stock'];
        $minStock = $item['minStock'];

        if ($stock === 0) {
            $outOfStock++;
        } else if ($stock <= $minStock) {
            $lowStock++;
        } else {
            $inStock++;
        }

        $totalValue += $item['price'] * $item['stock'];
        $totalRevenue += $item['revenue'];
    }

    return [
        'totalProducts' => $totalProducts,
        'inStock' => $inStock,
        'lowStock' => $lowStock,
        'outOfStock' => $outOfStock,
        'lowStockPercentage' => $totalProducts > 0 ? ($lowStock / $totalProducts) * 100 : 0,
        'outOfStockPercentage' => $totalProducts > 0 ? ($outOfStock / $totalProducts) * 100 : 0,
        'totalValue' => $totalValue,
        'totalRevenue' => $totalRevenue
    ];
}
