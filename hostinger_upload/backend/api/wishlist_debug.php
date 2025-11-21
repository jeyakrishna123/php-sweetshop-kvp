<?php
/**
 * DIRECT WISHLIST DEBUG SCRIPT
 * Upload to: hostinger_upload/backend/api/wishlist_debug.php
 * Visit: https://skbakers.com/backend/api/wishlist_debug.php
 * 
 * This will show EXACTLY what's happening without authentication
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

header('Content-Type: application/json');

$db = Database::getInstance()->getConnection();

echo "{\n";
echo "  \"debug\": true,\n";
echo "  \"step\": \"Direct database query test\",\n\n";

// Step 1: Check if wishlist table exists and has data
echo "  \"step1_table_check\": {\n";
try {
    $checkStmt = $db->query("SELECT COUNT(*) as total, GROUP_CONCAT(DISTINCT user_id) as user_ids FROM wishlist");
    $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
    echo "    \"total_items\": " . $checkResult['total'] . ",\n";
    echo "    \"user_ids\": \"" . $checkResult['user_ids'] . "\",\n";
    echo "    \"status\": \"SUCCESS\"\n";
} catch (Exception $e) {
    echo "    \"error\": \"" . addslashes($e->getMessage()) . "\",\n";
    echo "    \"status\": \"FAILED\"\n";
}
echo "  },\n\n";

// Step 2: Query for user_id=1 directly
echo "  \"step2_query_user1\": {\n";
try {
    $stmt = $db->prepare("
        SELECT
            w.id, w.product_id, w.created_at,
            p.name, p.description, p.price,
            p.original_price, p.discount_percentage, p.category, p.images,
            p.thumbnail, p.stock, p.is_active, p.average_rating, p.num_reviews,
            p.has_weight_options, p.weight_options
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
        ORDER BY w.created_at DESC
    ");
    $stmt->execute();
    $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "    \"rows_returned\": " . count($wishlist) . ",\n";
    echo "    \"status\": \"SUCCESS\",\n";
    
    if (count($wishlist) > 0) {
        echo "    \"first_row\": " . json_encode($wishlist[0], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . ",\n";
        echo "    \"all_rows\": " . json_encode($wishlist, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
    } else {
        echo "    \"message\": \"No rows found for user_id=1\"\n";
    }
} catch (Exception $e) {
    echo "    \"error\": \"" . addslashes($e->getMessage()) . "\",\n";
    echo "    \"status\": \"FAILED\"\n";
}
echo "  },\n\n";

// Step 3: Check raw wishlist table data
echo "  \"step3_raw_wishlist_data\": {\n";
try {
    $rawStmt = $db->query("SELECT * FROM wishlist ORDER BY created_at DESC LIMIT 5");
    $rawData = $rawStmt->fetchAll(PDO::FETCH_ASSOC);
    echo "    \"rows\": " . count($rawData) . ",\n";
    echo "    \"data\": " . json_encode($rawData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
} catch (Exception $e) {
    echo "    \"error\": \"" . addslashes($e->getMessage()) . "\",\n";
    echo "    \"status\": \"FAILED\"\n";
}
echo "  },\n\n";

// Step 4: Check if products exist for those product_ids
echo "  \"step4_product_check\": {\n";
try {
    $productIdsStmt = $db->query("SELECT DISTINCT product_id FROM wishlist WHERE user_id = 1");
    $productIds = $productIdsStmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "    \"product_ids_in_wishlist\": " . json_encode($productIds) . ",\n";
    
    if (!empty($productIds)) {
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $productCheckStmt = $db->prepare("SELECT id, name, is_active FROM products WHERE id IN ($placeholders)");
        $productCheckStmt->execute($productIds);
        $products = $productCheckStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "    \"products_found\": " . count($products) . ",\n";
        echo "    \"products\": " . json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
    } else {
        echo "    \"message\": \"No product_ids found in wishlist\"\n";
    }
} catch (Exception $e) {
    echo "    \"error\": \"" . addslashes($e->getMessage()) . "\",\n";
    echo "    \"status\": \"FAILED\"\n";
}
echo "  }\n";

echo "}\n";

