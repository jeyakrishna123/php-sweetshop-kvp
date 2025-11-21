<?php
/**
 * WISHLIST VERIFICATION SCRIPT
 * Upload to: hostinger_upload/backend/api/wishlist_verification.php
 * Visit: https://skbakers.com/backend/api/wishlist_verification.php
 * 
 * This script verifies that the wishlist query will work correctly
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

header('Content-Type: application/json');

$db = Database::getInstance()->getConnection();

$results = [
    'verification' => 'Wishlist Query Verification',
    'timestamp' => date('c'),
    'checks' => []
];

// Check 1: Verify products table columns exist
$results['checks']['products_table_columns'] = [];
try {
    $columnsStmt = $db->query("SHOW COLUMNS FROM products");
    $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
    $results['checks']['products_table_columns']['status'] = 'SUCCESS';
    $results['checks']['products_table_columns']['columns'] = $columns;
    
    // Check for required columns
    $requiredColumns = ['id', 'name', 'description', 'price', 'original_price', 'discount_percentage', 'category_id', 'images', 'thumbnail', 'stock', 'is_active', 'average_rating', 'num_reviews', 'weight_options'];
    $missingColumns = [];
    foreach ($requiredColumns as $col) {
        if (!in_array($col, $columns)) {
            $missingColumns[] = $col;
        }
    }
    
    if (empty($missingColumns)) {
        $results['checks']['products_table_columns']['required_columns'] = 'ALL PRESENT';
    } else {
        $results['checks']['products_table_columns']['required_columns'] = 'MISSING: ' . implode(', ', $missingColumns);
        $results['checks']['products_table_columns']['status'] = 'WARNING';
    }
    
    // Check for problematic columns that don't exist
    $problematicColumns = ['slug', 'category', 'has_weight_options'];
    $foundProblematic = [];
    foreach ($problematicColumns as $col) {
        if (in_array($col, $columns)) {
            $foundProblematic[] = $col;
        }
    }
    if (!empty($foundProblematic)) {
        $results['checks']['products_table_columns']['note'] = 'These columns exist but were removed from query: ' . implode(', ', $foundProblematic);
    }
    
} catch (Exception $e) {
    $results['checks']['products_table_columns']['status'] = 'FAILED';
    $results['checks']['products_table_columns']['error'] = $e->getMessage();
}

// Check 2: Test the actual wishlist query syntax
$results['checks']['query_syntax'] = [];
try {
    $testQuery = "
        SELECT
            w.id, w.product_id, w.created_at,
            p.name, p.description, p.price,
            p.original_price, p.discount_percentage, p.category_id, p.images,
            p.thumbnail, p.stock, p.is_active, p.average_rating, p.num_reviews,
            p.weight_options
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
        ORDER BY w.created_at DESC
        LIMIT 5
    ";
    
    $testStmt = $db->prepare($testQuery);
    $testStmt->execute();
    $testResults = $testStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $results['checks']['query_syntax']['status'] = 'SUCCESS';
    $results['checks']['query_syntax']['rows_returned'] = count($testResults);
    $results['checks']['query_syntax']['message'] = 'Query executes without errors';
    
    if (count($testResults) > 0) {
        $results['checks']['query_syntax']['sample_row'] = $testResults[0];
        $results['checks']['query_syntax']['columns_in_result'] = array_keys($testResults[0]);
    }
    
} catch (Exception $e) {
    $results['checks']['query_syntax']['status'] = 'FAILED';
    $results['checks']['query_syntax']['error'] = $e->getMessage();
    $results['checks']['query_syntax']['error_code'] = $e->getCode();
}

// Check 3: Verify wishlist table exists and has data
$results['checks']['wishlist_table'] = [];
try {
    $wishlistCheck = $db->query("SELECT COUNT(*) as total, GROUP_CONCAT(DISTINCT user_id) as user_ids FROM wishlist");
    $wishlistData = $wishlistCheck->fetch(PDO::FETCH_ASSOC);
    
    $results['checks']['wishlist_table']['status'] = 'SUCCESS';
    $results['checks']['wishlist_table']['total_items'] = (int)$wishlistData['total'];
    $results['checks']['wishlist_table']['user_ids'] = $wishlistData['user_ids'];
    
} catch (Exception $e) {
    $results['checks']['wishlist_table']['status'] = 'FAILED';
    $results['checks']['wishlist_table']['error'] = $e->getMessage();
}

// Check 4: Verify products exist for wishlist items
$results['checks']['products_exist'] = [];
try {
    $productCheck = $db->query("
        SELECT COUNT(DISTINCT w.product_id) as wishlist_products,
               COUNT(DISTINCT p.id) as existing_products
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = 1
    ");
    $productData = $productCheck->fetch(PDO::FETCH_ASSOC);
    
    $results['checks']['products_exist']['status'] = 'SUCCESS';
    $results['checks']['products_exist']['wishlist_products'] = (int)$productData['wishlist_products'];
    $results['checks']['products_exist']['existing_products'] = (int)$productData['existing_products'];
    $results['checks']['products_exist']['missing_products'] = (int)$productData['wishlist_products'] - (int)$productData['existing_products'];
    
} catch (Exception $e) {
    $results['checks']['products_exist']['status'] = 'FAILED';
    $results['checks']['products_exist']['error'] = $e->getMessage();
}

// Final verification status
$allPassed = true;
foreach ($results['checks'] as $check) {
    if (isset($check['status']) && $check['status'] === 'FAILED') {
        $allPassed = false;
        break;
    }
}

$results['overall_status'] = $allPassed ? '✅ ALL CHECKS PASSED - READY FOR PRODUCTION' : '❌ SOME CHECKS FAILED - REVIEW ERRORS';
$results['ready_for_production'] = $allPassed;

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

