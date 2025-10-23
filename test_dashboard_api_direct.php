<?php
/**
 * Test Dashboard API Direct
 * This script simulates the dashboard API call
 */

// Simulate the API environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/admin/dashboard';
$_GET['dateRange'] = 'all';

// Mock authentication (you'll need to provide a valid token)
// For testing, let's assume admin auth is available
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer test';

echo "=== TESTING DASHBOARD API ===\n\n";

// Capture output
ob_start();

try {
    // Include the admin API
    include __DIR__ . '/php-backend/api/admin.php';

    $output = ob_get_clean();

    echo "API Response:\n";
    echo $output;
    echo "\n\n";

    // Parse JSON if possible
    $data = json_decode($output, true);
    if ($data) {
        echo "Parsed Data:\n";
        if (isset($data['stats'])) {
            echo "  Total Products: " . ($data['stats']['totalProducts'] ?? 'N/A') . "\n";
            echo "  Total Orders: " . ($data['stats']['totalOrders'] ?? 'N/A') . "\n";
            echo "  Total Users: " . ($data['stats']['totalUsers'] ?? 'N/A') . "\n";
            echo "  Total Revenue: ₹" . ($data['stats']['totalRevenue'] ?? 'N/A') . "\n";
            echo "  Pending Orders: " . ($data['stats']['pendingOrders'] ?? 'N/A') . "\n";
            echo "  Processing Orders: " . ($data['stats']['processingOrders'] ?? 'N/A') . "\n";
            echo "  Shipped Orders: " . ($data['stats']['shippedOrders'] ?? 'N/A') . "\n";
            echo "  Delivered Orders: " . ($data['stats']['deliveredOrders'] ?? 'N/A') . "\n";
            echo "  Low Stock Products: " . ($data['stats']['lowStockProducts'] ?? 'N/A') . "\n";
            echo "  Out of Stock Products: " . ($data['stats']['outOfStockProducts'] ?? 'N/A') . "\n";
        }
    }

} catch (Exception $e) {
    ob_end_clean();
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
