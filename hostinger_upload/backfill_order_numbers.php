<?php
/**
 * Backfill script to add 7-digit order numbers to existing orders
 * Run this once to update existing orders with unique order numbers
 */

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/includes/helpers.php';

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();

    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit();
    }

    // Check if order_number column exists
    $checkStmt = $db->query("SHOW COLUMNS FROM orders LIKE 'order_number'");
    $columnExists = $checkStmt && $checkStmt->rowCount() > 0;
    
    if (!$columnExists) {
        // Add column
        $db->exec("ALTER TABLE orders ADD COLUMN order_number VARCHAR(20) UNIQUE AFTER id");
        echo json_encode(['success' => true, 'message' => 'Added order_number column']);
    }

    // Get all orders without order_number
    $ordersStmt = $db->query("SELECT id FROM orders WHERE order_number IS NULL OR order_number = '' ORDER BY id");
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $updated = 0;
    $errors = [];
    
    foreach ($orders as $order) {
        $orderId = $order['id'];
        
        // Generate unique 7-digit order number
        $maxAttempts = 10;
        $attempt = 0;
        $uniqueOrderId = null;
        
        do {
            $min = 1000000;
            $max = 9999999;
            
            $timestamp = time();
            $timestampPart = $timestamp % 10000;
            $randomPart = mt_rand(100, 999);
            $orderNumber = $timestampPart * 1000 + $randomPart;
            
            if ($orderNumber < 1000000) {
                $orderNumber = mt_rand(1000000, 9999999);
            }
            
            // Check if exists
            $checkStmt = $db->prepare("SELECT id FROM orders WHERE order_number = ? LIMIT 1");
            $checkStmt->execute([$orderNumber]);
            $exists = $checkStmt->fetch();
            
            if (!$exists) {
                $uniqueOrderId = (string)$orderNumber;
                break;
            }
            
            $attempt++;
            if ($attempt >= $maxAttempts) {
                $uniqueOrderId = (string)mt_rand(1000000, 9999999);
                break;
            }
        } while ($attempt < $maxAttempts);
        
        // Update order
        try {
            $updateStmt = $db->prepare("UPDATE orders SET order_number = ? WHERE id = ?");
            $updateStmt->execute([$uniqueOrderId, $orderId]);
            $updated++;
        } catch (PDOException $e) {
            $errors[] = "Order ID $orderId: " . $e->getMessage();
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Backfill completed",
        'updated' => $updated,
        'total_orders' => count($orders),
        'errors' => $errors
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
