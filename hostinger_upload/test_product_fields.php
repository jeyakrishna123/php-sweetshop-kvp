<?php
/**
 * Test script to verify product fields storage and retrieval
 * Run this after adding the columns to test if everything works
 */

require_once __DIR__ . '/backend/includes/database.php';
require_once __DIR__ . '/backend/includes/helpers.php';

try {
    $db = Database::getInstance()->getConnection();
    
    if (!$db) {
        die("❌ Database connection failed\n");
    }
    
    echo "✅ Database connected\n\n";
    
    // Check if columns exist
    echo "🔍 Checking for required columns...\n";
    
    $columns = ['sub_category', 'menu_option', 'menu_category'];
    $existingColumns = [];
    
    foreach ($columns as $col) {
        $stmt = $db->query("SHOW COLUMNS FROM products LIKE '$col'");
        $exists = $stmt && $stmt->rowCount() > 0;
        if ($exists) {
            echo "✅ Column '$col' exists\n";
            $existingColumns[] = $col;
        } else {
            echo "❌ Column '$col' does NOT exist - please run add_product_fields.sql\n";
        }
    }
    
    echo "\n";
    
    // Test INSERT with fields
    if (count($existingColumns) > 0) {
        echo "🧪 Testing INSERT with existing columns...\n";
        
        $testData = [
            'name' => 'Test Product ' . time(),
            'description' => 'Test description',
            'price' => 99.99,
            'category_id' => 1,
            'stock' => 10,
            'images' => json_encode(['/uploads/test.jpg']),
            'thumbnail' => '/uploads/test.jpg',
            'is_featured' => 0,
            'is_bestseller' => 0,
            'is_new' => 1,
            'is_active' => 1
        ];
        
        // Build INSERT with conditional columns
        $insertFields = "name, description, price, category_id, stock, images, thumbnail, is_featured, is_bestseller, is_new, is_active";
        $insertPlaceholders = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
        $insertValues = [
            $testData['name'],
            $testData['description'],
            $testData['price'],
            $testData['category_id'],
            $testData['stock'],
            $testData['images'],
            $testData['thumbnail'],
            $testData['is_featured'],
            $testData['is_bestseller'],
            $testData['is_new'],
            $testData['is_active']
        ];
        
        if (in_array('sub_category', $existingColumns)) {
            $insertFields .= ", sub_category";
            $insertPlaceholders .= ", ?";
            $insertValues[] = "Test Sub Category";
            echo "  ➕ Adding sub_category: Test Sub Category\n";
        }
        
        if (in_array('menu_option', $existingColumns)) {
            $insertFields .= ", menu_option";
            $insertPlaceholders .= ", ?";
            $insertValues[] = "Test Menu Option";
            echo "  ➕ Adding menu_option: Test Menu Option\n";
        }
        
        if (in_array('menu_category', $existingColumns)) {
            $insertFields .= ", menu_category";
            $insertPlaceholders .= ", ?";
            $insertValues[] = "Cakes";
            echo "  ➕ Adding menu_category: Cakes\n";
        }
        
        $stmt = $db->prepare("INSERT INTO products ($insertFields) VALUES ($insertPlaceholders)");
        $result = $stmt->execute($insertValues);
        
        if ($result) {
            $productId = $db->lastInsertId();
            echo "✅ Test product created with ID: $productId\n\n";
            
            // Test SELECT (retrieval)
            echo "🔍 Testing SELECT (retrieval)...\n";
            
            $selectFields = "p.id, p.name, p.description, p.price, p.category_id, p.stock, 
                            c.name as category_name";
            
            if (in_array('sub_category', $existingColumns)) {
                $selectFields .= ", p.sub_category";
            }
            if (in_array('menu_option', $existingColumns)) {
                $selectFields .= ", p.menu_option";
            }
            if (in_array('menu_category', $existingColumns)) {
                $selectFields .= ", p.menu_category";
            }
            
            $selectStmt = $db->prepare("
                SELECT $selectFields
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?
            ");
            $selectStmt->execute([$productId]);
            $retrievedProduct = $selectStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($retrievedProduct) {
                echo "✅ Product retrieved successfully\n";
                echo "  📦 Name: " . $retrievedProduct['name'] . "\n";
                echo "  📦 Category: " . ($retrievedProduct['category_name'] ?? 'N/A') . "\n";
                
                if (isset($retrievedProduct['sub_category'])) {
                    echo "  ✅ sub_category: " . ($retrievedProduct['sub_category'] ?? 'NULL') . "\n";
                }
                if (isset($retrievedProduct['menu_option'])) {
                    echo "  ✅ menu_option: " . ($retrievedProduct['menu_option'] ?? 'NULL') . "\n";
                }
                if (isset($retrievedProduct['menu_category'])) {
                    echo "  ✅ menu_category: " . ($retrievedProduct['menu_category'] ?? 'NULL') . "\n";
                }
                
                // Clean up test product
                $deleteStmt = $db->prepare("DELETE FROM products WHERE id = ?");
                $deleteStmt->execute([$productId]);
                echo "\n🧹 Test product deleted\n";
            } else {
                echo "❌ Failed to retrieve product\n";
            }
        } else {
            echo "❌ Failed to insert test product\n";
            $errorInfo = $stmt->errorInfo();
            echo "  Error: " . ($errorInfo[2] ?? 'Unknown') . "\n";
        }
    } else {
        echo "⚠️ No new columns exist. Please run add_product_fields.sql first.\n";
    }
    
    echo "\n✅ Test completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "  File: " . $e->getFile() . "\n";
    echo "  Line: " . $e->getLine() . "\n";
}

