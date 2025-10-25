<?php
/**
 * Create Sample Data for Testing
 * Populates database with sample products, categories, etc.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $results = [];
    
    // Check if data already exists
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products");
    $stmt->execute();
    $productCount = $stmt->fetch()['count'];
    
    if ($productCount > 0) {
        $results['message'] = "Database already has $productCount products. No sample data created.";
        $results['status'] = 'info';
    } else {
        // Create sample categories
        $categories = [
            ['name' => 'Bento Cakes', 'slug' => 'bento-cakes', 'description' => 'Beautiful bento cakes for special occasions'],
            ['name' => 'Birthday Cakes', 'slug' => 'birthday-cakes', 'description' => 'Custom birthday cakes'],
            ['name' => 'Wedding Cakes', 'slug' => 'wedding-cakes', 'description' => 'Elegant wedding cakes'],
            ['name' => 'Cupcakes', 'slug' => 'cupcakes', 'description' => 'Delicious cupcakes in various flavors']
        ];
        
        foreach ($categories as $category) {
            $stmt = $db->prepare("INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, 1)");
            $stmt->execute([$category['name'], $category['slug'], $category['description']]);
        }
        
        // Create sample products
        $products = [
            [
                'name' => 'Chocolate Bento Cake',
                'description' => 'Delicious chocolate bento cake perfect for any occasion',
                'price' => 450.00,
                'original_price' => 500.00,
                'category' => 'Bento Cakes',
                'cake_flavor' => 'Chocolate',
                'stock' => 10,
                'thumbnail' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
                    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800'
                ]),
                'featured' => 1
            ],
            [
                'name' => 'Vanilla Birthday Cake',
                'description' => 'Classic vanilla birthday cake with buttercream frosting',
                'price' => 600.00,
                'original_price' => 650.00,
                'category' => 'Birthday Cakes',
                'cake_flavor' => 'Vanilla',
                'stock' => 8,
                'thumbnail' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
                    'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800'
                ]),
                'featured' => 1
            ],
            [
                'name' => 'Strawberry Cupcakes (6 Pack)',
                'description' => 'Fresh strawberry cupcakes with cream cheese frosting',
                'price' => 300.00,
                'original_price' => 350.00,
                'category' => 'Cupcakes',
                'cake_flavor' => 'Strawberry',
                'stock' => 15,
                'thumbnail' => 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400',
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800'
                ]),
                'featured' => 0
            ],
            [
                'name' => 'Red Velvet Wedding Cake',
                'description' => 'Elegant red velvet wedding cake with cream cheese frosting',
                'price' => 2500.00,
                'original_price' => 2800.00,
                'category' => 'Wedding Cakes',
                'cake_flavor' => 'Red Velvet',
                'stock' => 3,
                'thumbnail' => 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
                    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
                ]),
                'featured' => 1
            ],
            [
                'name' => 'Lemon Bento Cake',
                'description' => 'Refreshing lemon bento cake with lemon curd filling',
                'price' => 480.00,
                'original_price' => 520.00,
                'category' => 'Bento Cakes',
                'cake_flavor' => 'Lemon',
                'stock' => 12,
                'thumbnail' => 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800'
                ]),
                'featured' => 0
            ]
        ];
        
        foreach ($products as $product) {
            $slug = strtolower(str_replace(' ', '-', $product['name']));
            $discountPercentage = round((($product['original_price'] - $product['price']) / $product['original_price']) * 100);
            
            $stmt = $db->prepare("
                INSERT INTO products (
                    name, slug, description, price, original_price, discount_percentage,
                    category, cake_flavor, stock, thumbnail, images, featured, is_active,
                    average_rating, num_reviews, sold_count, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 4.5, 0, 0, NOW(), NOW())
            ");
            
            $stmt->execute([
                $product['name'],
                $slug,
                $product['description'],
                $product['price'],
                $product['original_price'],
                $discountPercentage,
                $product['category'],
                $product['cake_flavor'],
                $product['stock'],
                $product['thumbnail'],
                $product['images'],
                $product['featured']
            ]);
        }
        
        // Create sample banners
        $banners = [
            [
                'title' => 'Welcome to SK Bakers',
                'subtitle' => 'Home-made cakes and cafe',
                'image_url' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200',
                'button_text' => 'Order Now',
                'button_url' => '/products',
                'is_active' => 1
            ],
            [
                'title' => 'Free Delivery',
                'subtitle' => 'On orders over ₹500',
                'image_url' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200',
                'button_text' => 'Shop Now',
                'button_url' => '/products',
                'is_active' => 1
            ]
        ];
        
        foreach ($banners as $banner) {
            $stmt = $db->prepare("
                INSERT INTO banners (title, subtitle, image_url, button_text, button_url, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $banner['title'],
                $banner['subtitle'],
                $banner['image_url'],
                $banner['button_text'],
                $banner['button_url'],
                $banner['is_active']
            ]);
        }
        
        $results['message'] = "Sample data created successfully!";
        $results['status'] = 'success';
        $results['created'] = [
            'categories' => count($categories),
            'products' => count($products),
            'banners' => count($banners)
        ];
    }
    
} catch (Exception $e) {
    $results['status'] = 'error';
    $results['message'] = 'Error creating sample data: ' . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
