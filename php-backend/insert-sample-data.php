<?php
/**
 * INSERT SAMPLE DATA TO MYSQL DATABASE
 * This will add sample products, categories, and data to your database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $results = [];
    
    // INSERT SAMPLE CATEGORIES
    $categories = [
        ['name' => 'Bento Cakes', 'slug' => 'bento-cakes', 'description' => 'Beautiful bento cakes for special occasions'],
        ['name' => 'Birthday Cakes', 'slug' => 'birthday-cakes', 'description' => 'Custom birthday cakes'],
        ['name' => 'Wedding Cakes', 'slug' => 'wedding-cakes', 'description' => 'Elegant wedding cakes'],
        ['name' => 'Cupcakes', 'slug' => 'cupcakes', 'description' => 'Delicious cupcakes in various flavors'],
        ['name' => 'Cookies', 'slug' => 'cookies', 'description' => 'Fresh baked cookies'],
        ['name' => 'Bread', 'slug' => 'bread', 'description' => 'Fresh bread and pastries']
    ];
    
    $categoryIds = [];
    foreach ($categories as $category) {
        $stmt = $db->prepare("
            INSERT INTO categories (name, slug, description, is_active, featured, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, 1, 1, 0, NOW(), NOW())
        ");
        $stmt->execute([$category['name'], $category['slug'], $category['description']]);
        $categoryIds[$category['name']] = $db->lastInsertId();
    }
    $results['categories_inserted'] = count($categories);
    
    // INSERT SAMPLE PRODUCTS
    $products = [
        [
            'name' => 'Chocolate Bento Cake',
            'description' => 'Delicious chocolate bento cake perfect for any occasion. Made with premium chocolate and fresh ingredients.',
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
            'description' => 'Classic vanilla birthday cake with buttercream frosting. Perfect for celebrating special moments.',
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
            'description' => 'Fresh strawberry cupcakes with cream cheese frosting. Perfect for parties and gatherings.',
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
            'description' => 'Elegant red velvet wedding cake with cream cheese frosting. Perfect for your special day.',
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
            'description' => 'Refreshing lemon bento cake with lemon curd filling. Perfect for summer occasions.',
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
        ],
        [
            'name' => 'Chocolate Chip Cookies (12 Pack)',
            'description' => 'Fresh baked chocolate chip cookies. Soft, chewy, and delicious.',
            'price' => 200.00,
            'original_price' => 250.00,
            'category' => 'Cookies',
            'cake_flavor' => 'Chocolate',
            'stock' => 20,
            'thumbnail' => 'https://images.unsplash.com/photo-1499636136210-6f4ee6a4c0b0?w=400',
            'images' => json_encode([
                'https://images.unsplash.com/photo-1499636136210-6f4ee6a4c0b0?w=800'
            ]),
            'featured' => 0
        ],
        [
            'name' => 'Fresh Bread Loaf',
            'description' => 'Freshly baked bread loaf. Perfect for breakfast or sandwiches.',
            'price' => 150.00,
            'original_price' => 180.00,
            'category' => 'Bread',
            'cake_flavor' => 'Plain',
            'stock' => 25,
            'thumbnail' => 'https://images.unsplash.com/photo-1509440159596-104908b2be83?w=400',
            'images' => json_encode([
                'https://images.unsplash.com/photo-1509440159596-104908b2be83?w=800'
            ]),
            'featured' => 0
        ],
        [
            'name' => 'Carrot Cake',
            'description' => 'Moist carrot cake with cream cheese frosting. Made with fresh carrots and nuts.',
            'price' => 550.00,
            'original_price' => 600.00,
            'category' => 'Birthday Cakes',
            'cake_flavor' => 'Carrot',
            'stock' => 6,
            'thumbnail' => 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
            'images' => json_encode([
                'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800'
            ]),
            'featured' => 1
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
    $results['products_inserted'] = count($products);
    
    // INSERT SAMPLE BANNERS
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
        ],
        [
            'title' => 'Fresh Daily',
            'subtitle' => 'Baked with love every day',
            'image_url' => 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=1200',
            'button_text' => 'View Menu',
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
    $results['banners_inserted'] = count($banners);
    
    // INSERT SAMPLE USERS
    $users = [
        [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'phone' => '+91 9876543210',
            'role' => 'customer'
        ],
        [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'phone' => '+91 9876543211',
            'role' => 'customer'
        ],
        [
            'name' => 'Admin User',
            'email' => 'admin@skbakers.com',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'phone' => '+91 9876543212',
            'role' => 'admin'
        ]
    ];
    
    foreach ($users as $user) {
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password, phone, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        ");
        $stmt->execute([
            $user['name'],
            $user['email'],
            $user['password'],
            $user['phone'],
            $user['role']
        ]);
    }
    $results['users_inserted'] = count($users);
    
    // FINAL STATUS
    $results['status'] = 'success';
    $results['message'] = 'Sample data inserted successfully!';
    $results['timestamp'] = date('c');
    
    // VERIFY DATA
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
    $stmt->execute();
    $results['total_products'] = $stmt->fetch()['count'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM categories WHERE is_active = 1");
    $stmt->execute();
    $results['total_categories'] = $stmt->fetch()['count'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM banners WHERE is_active = 1");
    $stmt->execute();
    $results['total_banners'] = $stmt->fetch()['count'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE is_active = 1");
    $stmt->execute();
    $results['total_users'] = $stmt->fetch()['count'];
    
} catch (Exception $e) {
    $results = [
        'status' => 'error',
        'message' => 'Error inserting sample data: ' . $e->getMessage()
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
