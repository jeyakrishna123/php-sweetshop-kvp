<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php';

try {
    $db = getDBConnection();
    
    // Get table structure
    $stmt = $db->prepare("DESCRIBE offer_popups");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $columnNames = array_column($columns, 'Field');
    
    // Check required columns
    $required = [
        'trigger_type', 'show_on_pages', 'show_delay', 'max_shows_per_session'
    ];
    
    $missing = array_diff($required, $columnNames);
    
    echo json_encode([
        'success' => true,
        'columns' => $columns,
        'column_names' => $columnNames,
        'required_columns' => $required,
        'missing_columns' => array_values($missing),
        'all_present' => empty($missing)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
