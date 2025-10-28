<?php
/**
 * Add Products to Database - Fix empty products issue
 */

echo "🛍️ ADDING PRODUCTS TO DATABASE\n";
echo "==============================\n\n";

try {
    // Connect to database
    require_once __DIR__ . '/backend/config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connected\n\n";

    // First, check if we have categories
    echo "1. Checking categories...\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM categories");
    $stmt->execute();
    $catCount = $stmt->fetch()['count'];
    echo "📊 Categories in database: $catCount\n";

    if ($catCount == 0) {
        echo "❌ No categories found! Adding sample categories first...\n";
        
        $categories = [
            ['Cakes', 'cakes', 'Delicious homemade cakes'],
            ['Sweets', 'sweets', 'Traditional Indian sweets'],
            ['Pastries', 'pastries', 'Fresh baked pastries'],
            ['Cookies', 'cookies', 'Crispy cookies and biscuits']
        ];
        
        $stmt = $db->prepare("INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, 1)");
        foreach ($categories as $cat) {
            $stmt->execute($cat);
            echo "✅ Added category: {$cat[0]}\n";
        }
        echo "\n";
    }

    // Check current products
    echo "2. Checking current products...\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
    $stmt->execute();
    $prodCount = $stmt->fetch()['count'];
    echo "📊 Products in database: $prodCount\n\n";

    if ($prodCount > 0) {
        echo "⚠️ Products already exist. Skipping to avoid duplicates.\n";
        echo "If you want to add more products, delete existing ones first.\n";
        exit;
    }

    // Get first category ID
    $stmt = $db->prepare("SELECT id FROM categories LIMIT 1");
    $stmt->execute();
    $category = $stmt->fetch();
    $categoryId = $category ? $category['id'] : 1;

    // Add sample products
    echo "3. Adding sample products...\n";
    $products = [
        [
            'name' => 'Chocolate Cake',
            'description' => 'Rich and moist chocolate cake with chocolate frosting',
            'price' => 450.00,
            'original_price' => 500.00,
            'category_id' => $categoryId,
            'stock' => 10,
            'images' => json_encode(['/uploads/products/chocolate-cake.jpg']),
            'thumbnail' => '/uploads/products/chocolate-cake.jpg',
            'is_featured' => 1,
            'is_bestseller' => 1,
            'is_new' => 0,
            'is_active' => 1,
            'sku' => 'CAKE-001',
            'weight' => '1kg'
        ],
        [
            'name' => 'Vanilla Cupcakes',
            'description' => 'Soft and fluffy vanilla cupcakes with cream frosting',
            'price' => 25.00,
            'original_price' => 30.00,
            'category_id' => $categoryId,
            'stock' => 50,
            'images' => json_encode(['/uploads/products/vanilla-cupcakes.jpg']),
            'thumbnail' => '/uploads/products/vanilla-cupcakes.jpg',
            'is_featured' => 1,
            'is_bestseller' => 0,
            'is_new' => 1,
            'is_active' => 1,
            'sku' => 'CUP-001',
            'weight' => '100g each'
        ],
        [
            'name' => 'Red Velvet Cake',
            'description' => 'Classic red velvet cake with cream cheese frosting',
            'price' => 550.00,
            'original_price' => 600.00,
            'category_id' => $categoryId,
            'stock' => 5,
            'images' => json_encode(['/uploads/products/red-velvet-cake.jpg']),
            'thumbnail' => '/uploads/products/red-velvet-cake.jpg',
            'is_featured' => 1,
            'is_bestseller' => 1,
            'is_new' => 0,
            'is_active' => 1,
            'sku' => 'CAKE-002',
            'weight' => '1.2kg'
        ],
        [
            'name' => 'Butter Cookies',
            'description' => 'Crispy and buttery cookies perfect with tea',
            'price' => 15.00,
            'original_price' => 18.00,
            'category_id' => $categoryId,
            'stock' => 100,
            'images' => json_encode(['/uploads/products/butter-cookies.jpg']),
            'thumbnail' => '/uploads/products/butter-cookies.jpg',
            'is_featured' => 0,
            'is_bestseller' => 1,
            'is_new' => 0,
            'is_active' => 1,
            'sku' => 'COOK-001',
            'weight' => '50g each'
        ],
        [
            'name' => 'Strawberry Cake',
            'description' => 'Fresh strawberry cake with real strawberry pieces',
            'price' => 480.00,
            'original_price' => 520.00,
            'category_id' => $categoryId,
            'stock' => 8,
            'images' => json_encode(['/uploads/products/strawberry-cake.jpg']),
            'thumbnail' => '/uploads/products/strawberry-cake.jpg',
            'is_featured' => 1,
            'is_bestseller' => 0,
            'is_new' => 1,
            'is_active' => 1,
            'sku' => 'CAKE-003',
            'weight' => '1kg'
        ]
    ];

    $stmt = $db->prepare("
        INSERT INTO products (
            name, description, price, original_price, category_id, stock, 
            images, thumbnail, is_featured, is_bestseller, is_new, is_active, 
            sku, weight, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");

    $added = 0;
    foreach ($products as $product) {
        try {
            $stmt->execute([
                $product['name'],
                $product['description'],
                $product['price'],
                $product['original_price'],
                $product['category_id'],
                $product['stock'],
                $product['images'],
                $product['thumbnail'],
                $product['is_featured'],
                $product['is_bestseller'],
                $product['is_new'],
                $product['is_active'],
                $product['sku'],
                $product['weight']
            ]);
            $added++;
            echo "✅ Added: {$product['name']}\n";
        } catch (PDOException $e) {
            echo "❌ Failed to add {$product['name']}: " . $e->getMessage() . "\n";
        }
    }

    echo "\n🎉 SUCCESS!\n";
    echo "Added $added products to database\n";
    echo "Now visit: https://skbakers.com/api/products\n";
    echo "You should see products in the response!\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
