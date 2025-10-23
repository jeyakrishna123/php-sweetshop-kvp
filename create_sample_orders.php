<?php
/**
 * Create Sample Orders for Testing Dashboard
 */

require_once __DIR__ . '/php-backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    $db->beginTransaction();

    echo "🚀 Creating sample orders...\n\n";

    // Get users (excluding admin)
    $stmt = $db->prepare("SELECT id FROM users WHERE role = 'user' LIMIT 5");
    $stmt->execute();
    $users = $stmt->fetchAll();

    if (count($users) == 0) {
        echo "❌ No regular users found. Creating sample users first...\n";

        // Create sample users
        for ($i = 1; $i <= 5; $i++) {
            $stmt = $db->prepare("
                INSERT INTO users (name, email, phone, password, role, is_active, is_email_verified, created_at)
                VALUES (?, ?, ?, ?, 'user', 1, 1, NOW())
            ");
            $password = password_hash('password123', PASSWORD_BCRYPT);
            $stmt->execute([
                "Customer $i",
                "customer$i@example.com",
                "9876543" . str_pad($i, 3, '0', STR_PAD_LEFT),
                $password
            ]);
        }

        // Re-fetch users
        $stmt = $db->prepare("SELECT id FROM users WHERE role = 'user' LIMIT 5");
        $stmt->execute();
        $users = $stmt->fetchAll();
    }

    // Get products
    $stmt = $db->prepare("SELECT id, name, price FROM products WHERE is_active = 1 LIMIT 10");
    $stmt->execute();
    $products = $stmt->fetchAll();

    if (count($products) == 0) {
        throw new Exception("No active products found");
    }

    // Order statuses to create
    $statuses = [
        'pending' => 5,
        'processing' => 8,
        'shipped' => 6,
        'delivered' => 12
    ];

    $totalOrders = 0;
    $totalRevenue = 0;

    foreach ($statuses as $status => $count) {
        echo "Creating $count orders with status '$status'...\n";

        for ($i = 0; $i < $count; $i++) {
            // Random user
            $user = $users[array_rand($users)];

            // Random 1-3 products
            $numItems = rand(1, 3);
            $orderProducts = [];
            $itemsPrice = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product = $products[array_rand($products)];
                $quantity = rand(1, 3);
                $price = $product['price'];

                $orderProducts[] = [
                    'product_id' => $product['id'],
                    'product_name' => $product['name'],
                    'quantity' => $quantity,
                    'price' => $price
                ];

                $itemsPrice += $price * $quantity;
            }

            // Calculate totals
            $taxPrice = $itemsPrice * 0.18; // 18% GST
            $shippingPrice = $itemsPrice > 500 ? 0 : 50; // Free shipping over 500
            $totalPrice = $itemsPrice + $taxPrice + $shippingPrice;

            // Create tracking number
            $trackingNumber = 'ORD' . date('Ymd') . strtoupper(substr(uniqid(), -8));

            // Insert order
            $stmt = $db->prepare("
                INSERT INTO orders (
                    user_id, tracking_number, status,
                    items_price, tax_price, shipping_price, total_price,
                    shipping_method, currency,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?)
            ");

            // Random date in the last 30 days
            $daysAgo = rand(0, 30);
            $createdAt = date('Y-m-d H:i:s', strtotime("-$daysAgo days"));

            $stmt->execute([
                $user['id'],
                $trackingNumber,
                $status,
                $itemsPrice,
                $taxPrice,
                $shippingPrice,
                $totalPrice,
                'standard',
                $createdAt
            ]);

            $orderId = $db->lastInsertId();

            // Insert order items
            foreach ($orderProducts as $item) {
                $stmt = $db->prepare("
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $orderId,
                    $item['product_id'],
                    $item['quantity'],
                    $item['price']
                ]);
            }

            $totalOrders++;
            if (in_array($status, ['delivered', 'shipped', 'processing'])) {
                $totalRevenue += $totalPrice;
            }
        }
    }

    $db->commit();

    echo "\n✅ Successfully created $totalOrders sample orders!\n";
    echo "💰 Total Revenue: ₹" . number_format($totalRevenue, 2) . "\n";
    echo "\n📊 Order Summary:\n";
    foreach ($statuses as $status => $count) {
        echo "  - $status: $count orders\n";
    }

    echo "\n✅ Dashboard should now display proper statistics!\n";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
