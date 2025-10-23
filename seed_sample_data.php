<?php
/**
 * Seed Sample Data for SK Bakers Admin Dashboard
 * This script adds sample products, users, and orders to the database
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    echo "🌱 Starting to seed sample data...\n\n";

    // 1. Add sample users
    echo "👥 Adding sample users...\n";

    $users = [
        ['name' => 'John Doe', 'email' => 'john@example.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'user'],
        ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'user'],
        ['name' => 'Mike Johnson', 'email' => 'mike@example.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'user'],
        ['name' => 'Sarah Williams', 'email' => 'sarah@example.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'user'],
        ['name' => 'Admin User', 'email' => 'admin@skbakers.com', 'password' => password_hash('admin123456', PASSWORD_DEFAULT), 'role' => 'admin']
    ];

    $userIds = [];
    foreach ($users as $user) {
        // Check if user exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$user['email']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $userIds[] = $existing['id'];
            echo "  ℹ️  User {$user['email']} already exists\n";
        } else {
            $stmt = $db->prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([$user['name'], $user['email'], $user['password'], $user['role']]);
            $userIds[] = $db->lastInsertId();
            echo "  ✅ Added user: {$user['email']}\n";
        }
    }

    // 2. Add sample products
    echo "\n🍰 Adding sample products...\n";

    $products = [
        ['name' => 'Chocolate Truffle Cake', 'description' => 'Rich chocolate cake with truffle filling', 'price' => 899, 'stock' => 15, 'category' => 'Cakes'],
        ['name' => 'Red Velvet Cake', 'description' => 'Classic red velvet with cream cheese frosting', 'price' => 1200, 'stock' => 10, 'category' => 'Cakes'],
        ['name' => 'Black Forest Cake', 'description' => 'Chocolate cake with cherries and whipped cream', 'price' => 950, 'stock' => 12, 'category' => 'Cakes'],
        ['name' => 'Butterscotch Cake', 'description' => 'Sweet butterscotch flavored cake', 'price' => 799, 'stock' => 8, 'category' => 'Cakes'],
        ['name' => 'Pineapple Cake', 'description' => 'Fresh pineapple cake', 'price' => 699, 'stock' => 20, 'category' => 'Cakes'],
        ['name' => 'Vanilla Cupcakes', 'description' => 'Set of 6 vanilla cupcakes', 'price' => 299, 'stock' => 30, 'category' => 'Cupcakes'],
        ['name' => 'Chocolate Brownies', 'description' => 'Set of 4 fudgy brownies', 'price' => 249, 'stock' => 25, 'category' => 'Desserts'],
        ['name' => 'Cookies Assorted', 'description' => 'Pack of 12 assorted cookies', 'price' => 199, 'stock' => 40, 'category' => 'Cookies'],
        ['name' => 'Cheese Cake', 'description' => 'New York style cheesecake', 'price' => 1499, 'stock' => 5, 'category' => 'Cakes'],
        ['name' => 'Fruit Cake', 'description' => 'Mixed fruit cake', 'price' => 850, 'stock' => 10, 'category' => 'Cakes']
    ];

    $productIds = [];
    foreach ($products as $product) {
        // Check if product exists
        $stmt = $db->prepare("SELECT id FROM products WHERE name = ?");
        $stmt->execute([$product['name']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $productIds[] = $existing['id'];
            echo "  ℹ️  Product '{$product['name']}' already exists\n";
        } else {
            $stmt = $db->prepare("
                INSERT INTO products (name, description, price, stock, category, is_active, ratings, num_reviews, created_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?, NOW())
            ");
            $ratings = rand(40, 50) / 10; // Random rating between 4.0 and 5.0
            $numReviews = rand(50, 500);
            $stmt->execute([
                $product['name'],
                $product['description'],
                $product['price'],
                $product['stock'],
                $product['category'],
                $ratings,
                $numReviews
            ]);
            $productIds[] = $db->lastInsertId();
            echo "  ✅ Added product: {$product['name']} (₹{$product['price']})\n";
        }
    }

    // 3. Add sample orders
    echo "\n📦 Adding sample orders...\n";

    $statuses = ['pending', 'processing', 'shipped', 'delivered'];
    $ordersToCreate = 15;

    for ($i = 0; $i < $ordersToCreate; $i++) {
        // Random user
        $userId = $userIds[array_rand($userIds)];

        // Random product
        $productId = $productIds[array_rand($productIds)];

        // Get product details
        $stmt = $db->prepare("SELECT name, price FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        // Random quantity
        $quantity = rand(1, 3);
        $totalPrice = $product['price'] * $quantity;

        // Random status
        $status = $statuses[array_rand($statuses)];

        // Random date within last 30 days
        $daysAgo = rand(0, 30);
        $orderDate = date('Y-m-d H:i:s', strtotime("-$daysAgo days"));

        // Create order
        $trackingNumber = 'ORD' . strtoupper(substr(md5(uniqid()), 0, 8));

        $stmt = $db->prepare("
            INSERT INTO orders (
                user_id, tracking_number, status, total_price,
                shipping_address, payment_method, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $trackingNumber,
            $status,
            $totalPrice,
            json_encode(['address' => '123 Sample St, City', 'pincode' => '123456']),
            'cod',
            $orderDate
        ]);

        $orderId = $db->lastInsertId();

        // Create order item
        $stmt = $db->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $orderId,
            $productId,
            $quantity,
            $product['price'],
            $orderDate
        ]);

        echo "  ✅ Order #$orderId: {$quantity}x {$product['name']} - ₹{$totalPrice} ({$status}) - Created: " . date('Y-m-d', strtotime($orderDate)) . "\n";
    }

    // 4. Display statistics
    echo "\n📊 Database Statistics:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    // Count users
    $stmt = $db->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch()['total'];
    echo "👥 Total Users: $totalUsers\n";

    // Count products
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $totalProducts = $stmt->fetch()['total'];
    echo "🍰 Total Products: $totalProducts\n";

    // Count orders
    $stmt = $db->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $stmt->fetch()['total'];
    echo "📦 Total Orders: $totalOrders\n";

    // Total revenue
    $stmt = $db->query("SELECT SUM(total_price) as total FROM orders WHERE status IN ('delivered', 'shipped', 'processing')");
    $totalRevenue = $stmt->fetch()['total'] ?? 0;
    echo "💰 Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n";

    // Orders by status
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status");
    echo "\n📋 Orders by Status:\n";
    while ($row = $stmt->fetch()) {
        echo "   • {$row['status']}: {$row['count']}\n";
    }

    echo "\n✅ Sample data seeded successfully!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "\n🎯 Next Steps:\n";
    echo "1. Start PHP server: php -S localhost:8000 -t php-backend/\n";
    echo "2. Login as admin: admin@skbakers.com / admin123456\n";
    echo "3. Check Admin Dashboard - should show data now!\n\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
