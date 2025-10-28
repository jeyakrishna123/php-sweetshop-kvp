<?php
/**
 * Add Sample Products to Database
 * This will add real products to your empty database
 */

// Database connection
$host = 'localhost';
$dbname = 'u707629033_skbakers';
$username = 'u707629033_sksweets';
$password = 'Skbakers@123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to database successfully!\n\n";
    
    // Sample products data
    $products = [
        [
            'name' => 'Chocolate Cake',
            'description' => 'Rich and moist chocolate cake',
            'price' => 450.00,
            'original_price' => 500.00,
            'category_id' => 1,
            'stock' => 10,
            'is_active' => 1,
            'is_featured' => 1,
            'is_bestseller' => 1,
            'is_new' => 1,
            'weight' => '1kg',
            'ingredients' => 'Flour, Sugar, Cocoa, Eggs, Butter',
            'allergens' => 'Contains: Eggs, Dairy, Gluten'
        ],
        [
            'name' => 'Vanilla Cupcakes',
            'description' => 'Soft and fluffy vanilla cupcakes',
            'price' => 25.00,
            'original_price' => 30.00,
            'category_id' => 1,
            'stock' => 50,
            'is_active' => 1,
            'is_featured' => 1,
            'is_bestseller' => 0,
            'is_new' => 1,
            'weight' => '100g each',
            'ingredients' => 'Flour, Sugar, Vanilla, Eggs, Butter',
            'allergens' => 'Contains: Eggs, Dairy, Gluten'
        ],
        [
            'name' => 'Red Velvet Cake',
            'description' => 'Classic red velvet with cream cheese frosting',
            'price' => 550.00,
            'original_price' => 600.00,
            'category_id' => 1,
            'stock' => 5,
            'is_active' => 1,
            'is_featured' => 1,
            'is_bestseller' => 1,
            'is_new' => 0,
            'weight' => '1.2kg',
            'ingredients' => 'Flour, Sugar, Cocoa, Red Food Color, Eggs, Butter',
            'allergens' => 'Contains: Eggs, Dairy, Gluten'
        ]
    ];
    
    // Insert products
    $stmt = $pdo->prepare("
        INSERT INTO products (name, description, price, original_price, category_id, stock, 
                           is_active, is_featured, is_bestseller, is_new, weight, ingredients, 
                           allergens, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $inserted = 0;
    foreach ($products as $product) {
        try {
            $stmt->execute([
                $product['name'],
                $product['description'],
                $product['price'],
                $product['original_price'],
                $product['category_id'],
                $product['stock'],
                $product['is_active'],
                $product['is_featured'],
                $product['is_bestseller'],
                $product['is_new'],
                $product['weight'],
                $product['ingredients'],
                $product['allergens']
            ]);
            $inserted++;
            echo "✅ Added product: {$product['name']}\n";
        } catch (PDOException $e) {
            echo "❌ Failed to add {$product['name']}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n🎉 Sample products added successfully!\n";
    echo "📊 Total products inserted: $inserted\n";
    echo "🔗 Check your website now - it should show real products from database!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
