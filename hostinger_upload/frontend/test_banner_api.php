<?php
/**
 * Test Banner API - Check why banners not showing in production
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/config/config.php';
require_once __DIR__ . '/../backend/includes/helpers.php';

$results = [];

try {
    // Test 1: Database connection
    $db = Database::getInstance()->getConnection();
    $results['database_connection'] = '✅ Database connected successfully';
    
    // Test 2: Check if banners table exists
    $stmt = $db->query("SHOW TABLES LIKE 'banners'");
    $tableExists = $stmt->fetch();
    if ($tableExists) {
        $results['banners_table'] = '✅ Banners table exists';
    } else {
        $results['banners_table'] = '❌ Banners table does not exist';
        echo json_encode($results);
        exit();
    }
    
    // Test 3: Check banners count
    $stmt = $db->query("SELECT COUNT(*) as count FROM banners");
    $count = $stmt->fetch()['count'];
    $results['banners_count'] = "📊 Total banners in database: $count";
    
    // Test 4: Check active banners
    $stmt = $db->query("SELECT COUNT(*) as count FROM banners WHERE is_active = 1");
    $activeCount = $stmt->fetch()['count'];
    $results['active_banners_count'] = "📊 Active banners: $activeCount";
    
    // Test 5: Get all banners
    $stmt = $db->prepare("
        SELECT id as _id, title, subtitle, image_url as imageUrl, mobile_image_url as mobileImageUrl,
               desktop_image_url as desktopImageUrl, link as linkUrl, button_text as buttonText,
               is_active as isActive, sort_order as displayOrder, start_date as startDate,
               end_date as endDate, created_at as createdAt, updated_at as updatedAt
        FROM banners
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute();
    $allBanners = $stmt->fetchAll();
    $results['all_banners'] = $allBanners;
    
    // Test 6: Get active banners (same as API)
    $stmt = $db->prepare("
        SELECT id as _id, title, subtitle, image_url as imageUrl, mobile_image_url as mobileImageUrl,
               desktop_image_url as desktopImageUrl, link as linkUrl, button_text as buttonText,
               is_active as isActive, sort_order as displayOrder, start_date as startDate,
               end_date as endDate, created_at as createdAt, updated_at as updatedAt
        FROM banners
        WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute();
    $activeBanners = $stmt->fetchAll();
    $results['active_banners'] = $activeBanners;
    
    // Test 7: Check image files
    $imageFiles = [];
    foreach ($activeBanners as $banner) {
        if ($banner['imageUrl']) {
            $imagePath = __DIR__ . '/../backend/uploads/banners/' . basename($banner['imageUrl']);
            $imageFiles[] = [
                'url' => $banner['imageUrl'],
                'path' => $imagePath,
                'exists' => file_exists($imagePath),
                'size' => file_exists($imagePath) ? filesize($imagePath) : 0
            ];
        }
        if ($banner['desktopImageUrl']) {
            $imagePath = __DIR__ . '/../backend/uploads/banners/' . basename($banner['desktopImageUrl']);
            $imageFiles[] = [
                'url' => $banner['desktopImageUrl'],
                'path' => $imagePath,
                'exists' => file_exists($imagePath),
                'size' => file_exists($imagePath) ? filesize($imagePath) : 0
            ];
        }
        if ($banner['mobileImageUrl']) {
            $imagePath = __DIR__ . '/../backend/uploads/banners/' . basename($banner['mobileImageUrl']);
            $imageFiles[] = [
                'url' => $banner['mobileImageUrl'],
                'path' => $imagePath,
                'exists' => file_exists($imagePath),
                'size' => file_exists($imagePath) ? filesize($imagePath) : 0
            ];
        }
    }
    $results['image_files'] = $imageFiles;
    
    // Test 8: API endpoint test
    $apiUrl = 'https://skbakers.com/api/banners/active';
    $results['api_url'] = $apiUrl;
    
    // Test 9: Check upload directory
    $uploadDir = __DIR__ . '/../backend/uploads/banners/';
    $results['upload_directory'] = [
        'path' => $uploadDir,
        'exists' => is_dir($uploadDir),
        'writable' => is_writable($uploadDir),
        'files' => is_dir($uploadDir) ? count(scandir($uploadDir)) - 2 : 0
    ];
    
} catch (Exception $e) {
    $results['error'] = '❌ Error: ' . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
