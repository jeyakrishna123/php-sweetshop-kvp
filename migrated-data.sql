-- JSON to MySQL Migration Data
-- Generated: 2025-10-11T20:50:56.317Z
--

SET FOREIGN_KEY_CHECKS=0;


-- ============================================================
-- USERS (15 records)
-- ============================================================
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    1,
    'priua',
    'admin1@shop.com',
    '$2b$10$bg5IoqGGRAHyh04XV2o2NuCQw94DR5kOV2gKeaSAyZqTTyGq5Rl8a',
    '9150130466',
    '{"public_id":"admin1_avatar","url":"https://ui-avatars.com/api/?name=Admin+One"}',
    'admin',
    1,
    0,
    '2025-09-28T17:54:25.724Z',
    '2025-01-01T00:00:00.000Z',
    '2025-09-28T17:54:25.725Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    2,
    'Admin Two',
    'admin2@shop.com',
    '$2b$10$bg5IoqGGRAHyh04XV2o2NuCQw94DR5kOV2gKeaSAyZqTTyGq5Rl8a',
    '2222222222',
    '{"public_id":"admin2_avatar","url":"https://ui-avatars.com/api/?name=Admin+Two"}',
    'admin',
    1,
    0,
    '2025-08-31T02:12:11.754Z',
    '2025-01-01T00:00:00.000Z',
    '2025-08-31T02:12:11.754Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    3,
    'John Customer',
    'john.customer@example.com',
    '$2a$10$K7L/8Y75aIsgGPUoOQ4YWOWgdUr9lYAj/C4.OqMJqxduxXvJINj1e',
    '1234567890',
    NULL,
    'user',
    1,
    0,
    '2025-08-31T06:03:53.602Z',
    '2025-08-01T06:03:53.601Z',
    '2025-08-31T06:03:53.602Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    4,
    'Sarah Wilson',
    'sarah.wilson@example.com',
    '$2a$10$K7L/8Y75aIsgGPUoOQ4YWOWgdUr9lYAj/C4.OqMJqxduxXvJINj1e',
    '0987654321',
    NULL,
    'user',
    1,
    0,
    '2025-08-29T06:03:53.602Z',
    '2025-08-06T06:03:53.602Z',
    '2025-08-31T06:03:53.602Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    5,
    'Mike Johnson',
    'mike.johnson@example.com',
    '$2a$10$K7L/8Y75aIsgGPUoOQ4YWOWgdUr9lYAj/C4.OqMJqxduxXvJINj1e',
    '5555555555',
    NULL,
    'user',
    1,
    0,
    '2025-08-30T06:03:53.602Z',
    '2025-08-11T06:03:53.602Z',
    '2025-08-31T06:03:53.602Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    6,
    'jeyakrishna',
    'jeyakrishna614@gmail.com',
    '$2a$12$bOb9sAAjJIIwp21BwFbYDejUsVuVmPnIUv0xDd29cD2bklhMD8ocK',
    '8778738286',
    NULL,
    'user',
    1,
    0,
    NULL,
    '2025-08-31T18:16:52.640Z',
    '2025-08-31T18:16:52.640Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    7,
    'jk',
    'jeyakrishna40@gmail.com',
    '$2a$12$MXLZUBFXkIjSeLTiVXi30O6AXzdYmBinKYAqdg6cUBPVxEn60Phze',
    '8778738286',
    NULL,
    'user',
    1,
    0,
    '2025-09-28T08:39:40.921Z',
    '2025-08-31T18:17:56.813Z',
    '2025-09-28T08:39:40.923Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    8,
    'k.uma',
    'kuma1992@gmail.com',
    '$2a$12$u46xZRjkEydhJc3/n2LP.uAF6Q3jeVPu3QmIwiYmx7IHYmoATYF0a',
    '9629496834',
    NULL,
    'user',
    1,
    0,
    '2025-09-07T07:26:38.582Z',
    '2025-09-07T07:25:51.584Z',
    '2025-09-07T07:26:38.586Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    9,
    'jeya',
    'jeyakrishnan614@gmail.com',
    '$2a$12$nfc1m6RJ2CC7mOO0eXfHNOoQ56VzXoXvyuQrCU0DboAlrl.tYXEr2',
    '9150130466',
    NULL,
    'user',
    1,
    0,
    '2025-09-20T05:46:38.719Z',
    '2025-09-20T05:46:33.281Z',
    '2025-09-20T05:46:38.721Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    10,
    'ovi',
    'ovibalaji555@gmail.com',
    '$2a$12$BdeU6wFLJ9kGbKMFSazkf.avtelIQjqRSR0GNPm9b1MLDeIYbEBxe',
    '7010135248',
    NULL,
    'admin',
    1,
    0,
    '2025-09-24T13:54:35.873Z',
    '2025-09-24T13:54:27.506Z',
    '2025-09-24T13:54:35.874Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_ver
    
    
    
    ified, last_login, created_at, updated_at
  ) VALUES (
    11,
    'ramani ',
    '
    
    
    
    ',
    '$2a$12$npZ6O1vQDRPWxawSTFL6fOLdUp5nbhk5edcpOcBS52M995/MYUo..',
    '1234567891',
    NULL,
    'user',
    1,
    0,
    '2025-09-27T15:15:38.059Z',
    '2025-09-27T15:15:33.043Z',
    '2025-09-27T15:15:38.060Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    12,
    'jeyakrishna',
    'jeyakrishna401@gmail.com',
    '$2a$12$DIb2CBbY8nnH5mU81hWnX..Qk1nl/TzoYVDSrcHIYLD/lLvJBd6Nq',
    '+919150130466',
    NULL,
    'user',
    1,
    0,
    '2025-09-29T03:30:32.380Z',
    '2025-09-28T17:53:14.572Z',
    '2025-09-29T03:30:32.383Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    13,
    'Test User',
    'test@example.com',
    '$2a$12$uRG7wKEQ1U4rkjvHr0P8wOwczWpS.SAgsTMnJAX/afmzjxKCxlTpC',
    '1234567890',
    NULL,
    'user',
    1,
    0,
    '2025-09-29T07:01:42.818Z',
    '2025-09-29T07:00:48.546Z',
    '2025-09-29T07:01:42.819Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    14,
    'Test Admin',
    'testadmin@shop.com',
    '$2a$12$D0nO4KoyjWgEx3YLFFdo4eEUPH3bGjwAMEA0aei3c5o9MLXxSUiNO',
    '9999999999',
    NULL,
    'admin',
    1,
    0,
    NULL,
    '2025-09-29T07:02:03.674Z',
    '2025-09-29T07:02:03.674Z'
  );
INSERT INTO users (
    id, name, email, password, phone, avatar, role, is_active,
    is_email_verified, last_login, created_at, updated_at
  ) VALUES (
    15,
    'Working Admin',
    'admin@shop.com',
    '$2a$12$h.KcjGmY0lroYymk29OMQu.6JUQN8jdLrXfqKwIWLQ6H.LKM./0eG',
    '9876543210',
    NULL,
    'admin',
    1,
    0,
    '2025-09-29T07:11:58.144Z',
    '2025-09-29T07:02:22.475Z',
    '2025-09-29T07:11:58.147Z'
  );

-- ============================================================
-- CATEGORIES (21 records)
-- ============================================================
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    1,
    'Birthday Cakes',
    'birthday-cakes',
    'Beautiful custom birthday cakes for all ages and occasions',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-07T07:05:38.586Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    2,
    'Wedding Cakes',
    'wedding-cakes',
    'Elegant and sophisticated wedding cakes for your special day',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    1,
    '2025-01-15T10:00:00.000Z',
    '2025-09-06T17:38:44.277Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    3,
    'Cupcakes',
    'cupcakes',
    'Delicious individual cupcakes in various flavors and designs',
    'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    2,
    '2025-01-15T10:00:00.000Z',
    '2025-09-06T17:38:50.564Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    4,
    'Pastries',
    'pastries',
    'Fresh baked pastries including croissants, danishes, and more',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    3,
    '2025-01-15T10:00:00.000Z',
    '2025-09-06T17:38:54.918Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    5,
    'Cookies',
    'cookies',
    'Homemade cookies in various flavors and shapes',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    4,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    6,
    'Donuts',
    'donuts',
    'Fresh glazed and filled donuts in various flavors',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    5,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    7,
    'Cheesecakes',
    'cheesecakes',
    'Creamy and delicious cheesecakes in various flavors',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    6,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    8,
    'Muffins',
    'muffins',
    'Fresh baked muffins perfect for breakfast or snacks',
    'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    7,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    9,
    'Seasonal Treats',
    'seasonal-treats',
    'Special seasonal cakes and treats for holidays and occasions',
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    8,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    10,
    'Cakes',
    'cakes',
    'Delicious cakes in various flavors and designs',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    9,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    11,
    'Daughters Day Cakes',
    'daughters-day-cakes',
    'Special cakes for celebrating daughters day',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    10,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    12,
    'Birthday',
    'birthday',
    'Birthday celebration cakes and treats',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    11,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    13,
    'Theme Cakes',
    'theme-cakes',
    'Themed cakes for special occasions',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    12,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    14,
    'By Relationship',
    'by-relationship',
    'Cakes categorized by relationship',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    13,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    15,
    'Desserts',
    'desserts',
    'Delicious desserts and sweet treats',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    14,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    16,
    'Anniversary',
    'anniversary',
    'Anniversary celebration cakes',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    15,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    17,
    'Customized Cakes',
    'customized-cakes',
    'Custom designed cakes for special occasions',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    16,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    18,
    'Chocolate',
    'chocolate',
    'Chocolate flavored products',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    17,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    19,
    'Strawberry',
    'strawberry',
    'Strawberry flavored products',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    18,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    20,
    'Brownies',
    'brownies',
    'Delicious brownies and chocolate treats',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    19,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );
INSERT INTO categories (
    id, name, slug, description, image, icon, is_active, featured,
    sort_order, created_at, updated_at
  ) VALUES (
    21,
    'test',
    'test',
    'Test category for development',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
    '📦',
    1,
    0,
    20,
    '2025-01-15T10:00:00.000Z',
    '2025-01-15T10:00:00.000Z'
  );

-- ============================================================
-- PRODUCTS (381 records)
-- ============================================================
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    1,
    'Elegant Wedding Cake',
    'elegant-wedding-cake',
    'Beautiful three-tier wedding cake with elegant white frosting and delicate decorations. Perfect for your special day.',
    700,
    800,
    13,
    'cat_002',
    19,
    '["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop"]',
    NULL,
    1,
    1,
    0,
    0,
    0,
    '2025-09-24T14:49:13.817Z',
    '2025-09-28T07:07:30.280Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    2,
    'Strawberry Vanilla Cupcake',
    'strawberry-vanilla-cupcake',
    'Delicious vanilla cupcake topped with fresh strawberry frosting and a strawberry slice. Perfect for any occasion.',
    299,
    NULL,
    0,
    'cat_003',
    22,
    '["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T08:56:27.978Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    3,
    'Red Velvet Cake',
    'red-velvet-cake',
    'Classic red velvet cake with cream cheese frosting. Rich, moist, and absolutely delicious.',
    1899,
    NULL,
    0,
    'cat_001',
    3,
    '["https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop"]',
    NULL,
    1,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-29T10:06:33.262Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    4,
    'Chocolate Chip Cookies',
    'chocolate-chip-cookies',
    'Freshly baked chocolate chip cookies with premium chocolate chips. Soft, chewy, and irresistible.',
    199,
    NULL,
    0,
    'cat_004',
    48,
    '["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T07:07:29.811Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    5,
    'Tiramisu Dessert',
    'tiramisu-dessert',
    'Classic Italian tiramisu with layers of coffee-soaked ladyfingers and mascarpone cream. Elegant and sophisticated.',
    899,
    NULL,
    0,
    'cat_005',
    9,
    '["https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T08:18:01.314Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    6,
    'Chocolate Brownie',
    'chocolate-brownie',
    'Rich, fudgy chocolate brownie with a crispy top. Perfect with a cup of coffee or tea.',
    149,
    NULL,
    0,
    'cat_006',
    30,
    '["https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T07:07:29.851Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    7,
    'Vanilla Sponge Cake',
    'vanilla-sponge-cake',
    'Light and fluffy vanilla sponge cake with vanilla buttercream frosting. Perfect for afternoon tea.',
    799,
    NULL,
    0,
    'cat_001',
    15,
    '["https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T07:07:29.889Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    8,
    'Strawberry Cheesecake',
    'strawberry-cheesecake',
    'Creamy cheesecake with fresh strawberry topping and graham cracker crust. A perfect balance of sweet and tangy.',
    1299,
    NULL,
    0,
    'cat_005',
    10,
    '["https://images.unsplash.com/photo-1524351199678-941a4c4a7b8e?w=400&h=400&fit=crop"]',
    NULL,
    1,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T07:07:29.918Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    9,
    'Chocolate Muffin',
    'chocolate-muffin',
    'Moist chocolate muffin with chocolate chips. Perfect for breakfast or as a snack.',
    99,
    NULL,
    0,
    'cat_007',
    40,
    '["https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-01-15T10:00:00.000Z',
    '2025-09-28T07:07:29.946Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    10,
    'milk sweet',
    'milk-sweet',
    NULL,
    '234',
    NULL,
    0,
    'test',
    45,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-20T09:29:33.572Z',
    '2025-09-28T07:07:29.969Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    11,
    'keerthi',
    'keerthi',
    '',
    450,
    500,
    10,
    'Chocolate',
    78,
    '[{"file":{},"preview":"data:image/jpeg;base64,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","name":"Black Forest.jpg","size":11161}]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T03:57:42.528Z',
    '2025-09-28T07:07:29.992Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    12,
    'keerthi',
    'keerthi',
    '',
    450,
    560,
    20,
    'Cakes',
    568,
    '[{"file":{},"preview":"data:image/jpeg;base64,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","name":"Black Forest.jpg","size":11161}]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T04:03:57.794Z',
    '2025-09-28T07:07:30.020Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    13,
    'jk',
    'jk',
    '',
    66.99,
    765,
    91,
    'Cakes',
    666,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T13:17:39.814Z',
    '2025-09-28T07:07:30.146Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    14,
    'pk',
    'pk',
    '',
    45,
    450,
    90,
    'Cakes',
    456,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T08:07:52.126Z',
    '2025-09-28T07:07:30.084Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    15,
    'Test Cake',
    'test-cake',
    'A test cake',
    43,
    200,
    79,
    'Cakes',
    10,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T13:18:18.420Z',
    '2025-09-28T07:07:30.170Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    16,
    'jk',
    'jk',
    '',
    66.99,
    765,
    91,
    'Cakes',
    666,
    '["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGRYYGBcVGBsXGhofHRgXGxgaFxcYHSggGholGxgXITEjJSorLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy8lICUwLS8tLS8tLS0vLS0vLS0tLSs1LS0tLS0tLS0tLy0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAEAAIDBQYBBwj/xABAEAACAQIEAwUFBgUCBgMBAAABAhEAAwQSITEFQVEGEyJhcRQygZGxB2JykqHRI0JSwfAz4RVTY4Ky8UOiwkT/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAQIDBAUG/8QALBEAAgICAgECBQIHAAAAAAAAAAECEQMhEjFBBFETIjJhkSOhBRRxgbHB0f/aAAwDAQACEQMRAD8A9bxO6fiH96nNQYrZfxL9anNAKlSpUAq4aU1w0Ay/7p9DTMF/pp+EfSpLux9KhwB/hp+EUAQaZTjTaAVKlSoBGhMN/qXf+z6GizQmG/1bv/Z9DQBVKlSoBhpV01ygFQt7/Ut/930oqhrv+ono/wBBQBBrldNcoBUqVKaAaaF4mf4Vz8LfSiiaD4sf4Nz8JoAmwPAvoPpTqamw9B9KdNAKKVcmu0BI2AQ75vzGu+xr1b8xomlQA3sa9W/MahxmFARiGYECfeNH1BjR4G9DQEaYJYGr7D+Y132Jer/mP71PZPhX0H0rtACtgVPNvzH964nD0AgZgPJj+9F0qAFOCXq/5j+9NOCXq/5j+9FzTaAr8HhAQ0s5hiPePKp/YV6v+c/vSwGz/jaiaAG9hXq/5z+9RjhyAkjNJ3OY0aa5QAvsK9X/ADn964cCv9T/AJjRRptAAW8GDcYZngKDGY8yf2qb2Fer/nP7061/qP8AhX6tU9ADewr1f85/emNw5DBJaRt4j+9GUqAE9gTq/wCdv3rnsCdX/O370XXKAq8bgwCgDOJYA+I7UT/w5Or/AJ2/eljfetfjH0NGGgAv+HJ9787fvTH4XbOhzEebt+9GtXKADHDLe3i/O370v+GW/vfnb96MpGgA/wDhlv7352/elRdKgD6VDNi41yP8q4MZOuR/lQBVRYr3G9DUftf3H+VMvYkkEZH26UBPhz4F/CPpT6Cw+JIRQUeQANqk9r+4/wAqAIJiuTVVxhBftNbKPrB2jUEESRykCpMBxDNbVsrtIGoXfSovdE+CwqDF4gpk8MhnCnymYP5so+NM9s+4/wAqH4hiCbZhHkQw05qQw/VaPogJwH8/4z/aiarcJiSM3geGaRAnQip/bfuP+WpAVVTjsXdXFYe2sd3cF3NI5qoZYPI6H116UWcZ9x/y0Fj8YvgOVpS5b5bZ27v6XDUMlFrSoY4v7j/lrntg/of8pqSCv4zgrlwzauMj2ylxQrEK8Zv4bxupB+cVa4a+HRXGzAEfHkfOhUxXjY5HggD3ek/vUeFxQUuuVozZgMp0D6n/AO4c/Gq9Mm9FnSoT28f0P+U008RWYyvJ5ZTViAulQDY85woRsuUltDO4CwPPxfKpvbPuP+WoTsDcZ79r8f8A+TRhqsxOIJe2RbchTJ08iP70Qcb9y5+WpICSKbQ/tv8A07n5aiu8SVRLI45e7QkNpGhPbf8Ap3Py1w47/p3Py0AXSoP27/p3Py0qAuL3un0NKyfCPQfSu3NjTMMfAvoKAlrhNdrhoDlcJpGmk0BwmqFcRbGTDvcRfEzFWYKWUOe7UAnUEgT5LHOgO1eJvXLhsWb4sBFW5cY6EqSQ2U8iFE+ZrCdtkyYruMPcDEZU7sAZlUABf4nQ9N9t5rGc9nfh9Fzrk6tX/Y9lz1nu0HaN7IuG1ZF0WQDdLPkAkSFGhJaCD6Gsv9mnFb4ueyXZZSpZCd1YEeDcwCpn4etZXt/j71vFXrOdoLuxUEwcxJ1A38MfCoyZHx0dHovRQedxy7SV+d7+wdc+0bFkpbsqFYEAKYYEDQLsCTtqf0r1Hs5xU4iyHZcjglLif0su49NiPIivn3guGvvc7yyjubUXDkGaACNT5V7T9nmFu2sMTdtuDddr2ZiNniJEypgbGN6jFJrsn+I4sMY/ppL/ACXvHuI9xZa5pOirO0sQony1n4V4zxfjWKt4i7aOIYnvBLB2jwupGUTAAO1eqdssKcTZOGtjxXMpznZAGkmBuYDaelefv9mmIdrz3XXKEdluhvef/wCMEbrrq2h02moyTuWui3oZ4ceCXOuT91/Sv9g/B+12ITHS1/PbDi2ykkhgXyAoCT4v5vhXs4avKMJ9m161cwz50JZTccvqFuKSVVdiQwYanYqTroK9NtYsEarDc139dem9WxzSXzM5fXzhkmnjX4KrtLi7rMMNYbJcZGcvtlA6fHp5V5zxHtTj8Hc7troZwACW/iSOWpE9TvzPlWq7b8AxV29axGG/mTuzDBSIZjqWI0Ob9K884t2exmZ2u2rpCZi1wglYXQkMRDDbaefQxjObctHsejxem/l1ycXradXdnp/YHtRcxaEXlAuCSrAQHUGCQORBIB9RWoY/xF/C39q80+yrhd2273bqui5QlvvAVnMQxKhuXh3861na3i5sZVQw7JdbNE5VQAsQP6tgPM10Rn8ts8X1GBT9T8PF5/Bdtdi5cI1PdoQD63KIs3cyhuoB+YmvF8djsZhktXXu3SbhLhzdMtAHgKyf4YnYjUmt/wBjOOvdHc3Uysig22BkXEBC5o5EaT+IVGPIm6J9V/D8mCPJtNfb8GtBpVGDT5rY4DtBcS2X8af+QoyaDx/8n41+tAGNTac1NoDtcpUqALY1HhD4BVfbssd5j1plvBNOjOo8jUWC5pGghgtPff8ANXPYh/W/5qAMaq/i/EVsJnYE6wFXcn46AeZrrYQf1v8AmNZjtvNn2d2lredi6MSZ0GUMOkZtD/aobpG2DH8TIomc4px04kG5kWzceLSoGl8gYMWbNAzFioG2gaPPMNwPEYvHX+7lmz3JJ08IDGWYDwiAonqRFAG8LvEkZUVFN5GyqAFAUgmAPJTW2+zPtEi3Ltq0zN3gtuwYSQYOYTtAJP6D05O5bPZzzeG1BeOvbr/hb9guyF3BziS2a6FKlR4kEsM2U6EkAD9atL3CLIxXtD2lZ2DKHJ5MDIKnQ6Zl1B0JFWuKxq2x72QMdJ2B3+Aql4zfMKrEEzNtgdzG3mSJ08jFUnLWjzOcpStvssuzuCwuFDJh7a287FmAJOvSSdhyGw5VNiOKLOUNl8jt/tWe4bxlc+R2NtzoDsD6nkfOo+I30Vjbue/By/e8vM1T4kmiOKvZaWeLRfVCQIMNMcwYn6fGtFcuoo7ttmBgdRzrw/gna/DHFXO8fLbuFFVmBAXKIUk9NxPLTlXqNjjGHz2wbqM+UFYYEssTI66R8KmCnG7IlT6DrmIIXu/eHKd/L1+FcwOIDMBykqesnQadNapuOcctKj3QyEW4Lqx1XzA5bVnvs87WWrmPxFljPeFWtORo5AOZZ67R1g1XhKUteCdJHqF1Ea3kOhG0bzyNDYsKzK2zKI+63wp2IAnxcpg/2oLFOB4mmOo5etazlXaKJWT3CGaAMrudxsf3qi7bdne8AyM5vLbuKiqFhswjKcw0B2+RnStFwy14Qf6vFvyOwHw1+NdF8Ad43vBoAHOqput+TTFklimpw7R45x/hmJtoLFxla5azDwy+RYDaQs89THKmYDtC2HvWroj3AuVpOdSfH4t18SiCBy1q8+0Fr64tmtnKuItKhAbUwYiNySRy61jOKXWt4kGyVY2AqgRM5FhjB94E5jpyM1KbUlR9K+GbFCU92m37ff8Ad/se74HErcRbi+6wBE76jn50RWO7D443sPbQjLkRRmVoBJ1AA6wdvKtKcJ9+5867YytHyWWHCbiGg0Jjt7f4x/ekmD++/wCam3eHK0SzmNR4quZhprlDexfff81MOC++/wCagDKVBew/ff8ANSoCwW5HKoziANzrXbuMRd2im28UrbVAJkvfdNPJPSuB/KuMT0oBtrObkFRkCzmnXNMREdNZ8qqu3mTuQhUMz7STpl5iNzLgR0JPKrHhGJJu3rdwgH+Qc8oGp9PEPjNZv7SLblbF1JPdlwSBpqBr8gR8aybR1YIfqxR5txnhD4I28VcQMXzhAWiJRhJVdwMxMzuBUv2d8eFhjb7hRadxmugklWIABaZ8OmsbamqvtnxK5iGSTIQQPLb9qz+DxFyyHIaAwgj4761lVtnsZYR+HUkuXufQPaNLYtF7twIqD3mjLJga/HSvE+0vaJsUqKqtaCEwVaM3QlY0I5EHnXr/AGbVruCTv5OcZjMMTMnWREGdorzPtVwy1Zxd5LVvIgKwslt0ViddpJOg28qiMVZ4/wBjNY3HYy8io10kDYwA3lLAZjU2Nv4m+LIvXWY2gQp2OpG7DUnQa+VH2bciY0qVLcn/AGrRItSKe1wcc5+R/tRVvhyKwYEKykEEeEgjYgzII61Z4nCECVQN6nbzihFduRA8sqn6g0LqiF8CpJJZWZveJMk+pJk7D5URhsFlIMAxqNSvyPWupiDPiCn4Qf0qyWyqwVfKTrln/ARUNFroNxHH8S2Sbl5MkQQ5YadR/N8Zmo7nFcSVufx2bvFKttAnmFjwnzEVxCCNYB6jSfUbUrWpkb9RVXFMjR6D2O7TW/Z7Fq42W6ira1BhgoAVs0RJEfGfKrrtHi1sWe8IGYsqqGMAs/hUHoBM+gNYXgNg4q7btggFWloEaLrMee3qa1favAnGYe7bU5WUh0J/qQ6ek6j41VvWykYxWRX15PKO1hv2L4vXLqXLjFiroxaMuxhhAjQiI5VTYQNiXOIuXQi2gpdiRmMe6EQAakj0Fd4tZukr3i5ZJVR5j3vPfrUHC+FNcaEtkjNlJALKCN5I000/Srqrs9bPOMYpJ+D3Hs7ZtjDWTlVSyW3yjQKSimB6aD4VZ3OJ27eUXHVMxCrmMSTsBPOgMOwayoYABRpl0iB09K8j7U8V7/Ei1cQZ7TMmYEgMJlBroRqG8piqQm1LR4zjzez3bv111GkT5TtI5U7OKoOy6I9gPbuOwuEs1x1IZ22LQeWkDlAFXAtRuZFdaOZqmTi8DXDc9aVsgjSpIqSCLvPI0qliuUBNiEQ+8BXLQUbCKayk8qetoVIHZ/Omlh1rpAFVnHHfun7tQxCnQkgHqJGu0/5rUN0rJSt0VHYnHi/iMawEz3Xj3MAuAo6LuQPM1q8XKFQNVYZSDtvz+FedcFW5hmzWwEXMHNtc0uQCAGJ3JnKqzu0xXpmKXOmXYnUTyPnXLH5o67OrPHjJPwzHcb7E4F2eUZSwAi25RfxADQHby8qq+G9hsDZIJQ3WEa3iGA8woAWZ8q1dxyT4hqBB+FQGOf8Am9HL2K85NU2RM4IAWR7pECNJBA206EdKzPbLgC3FuYlQ/ehVlRqGggbAEzl6VpcTjEQFndUA3JIAHrNef8X+0Vy7JhLYZQCBceRJ190fSd6iN3YS9jFX8dlMEaeX1E1OMepHvCekxNF4/D57ObEqEuaqCLS2cpmGZ8hzXBpyQaka71BjMJw9UuFbzO3uKoWRoqg3UbXQsCfI6AHStrLKyDFdoP4BtwBczg5xyUAyP0HwmqjE8RussTMgwYGsb6xyqXFY4AQiBQIjKBIECJddWMzqetVt66x0nQct/X6fpUJF2zR9i7Ny9fVRBLL4MxgGCREzo0ho57Vb8e4NeS+gdShC6qSDzJnTSPSsfwFSl3MHyMIYEQfe6kfLkQZr1jg/asvYFvFpmtRlbOZPhXqGkMDBnlMzJE1lplo24mH4ziiHSykyILHqSNAPLf51ZW7xtqFAzXCNBsB95vIVrMTwbCYk95hNLyAA2WMzObRHJ30MA/pWO4vg3S2+Wc2Yi5IhtDqvwO4paLUar7LbmbGSp8Ko0/eGi/DxEH4V6njcCHR1GmbXSvN/sd4NdVnvssWmTICdMxzKfD1AymTtyr1U1PG1s5crqWjPdouEW3W0WtrctoQXRgGmBAYzuRUWI7uVa1lyQB3YgARtEbDyozGcQ8WkqZIgjQxVa3dsSSuU+X+1YTnG3TCTrZ3E2ka2+dcy+8VXQmNQNDrt9K8QxvEjezuEVAXGVANFBIBg82jc8z8q9ox+JSzauXCf9MEmTB0/l20J29TXl/HMdZvNiVW2tw3ihR4yuCBbYqRMGCrAiNSJq0a7NIG8+zfEq2Fyhy2R2GuhA00jpOb4z61rL1zKsxNYL7NcGs3bgZswOVgIyMCqFSdPeDBtjz13rfEZhFdUejnyfUxYfappqNEUCOVd70VYzH5q5Tc/lSoAvKP8NNMcqFt2G5mZ5dKmV40ipA4JzNQY7GrbQuwJXbTczUly1m6/OKD4ug7i4XPhAn4jUR5yBVZdFoK5I85tBbIYWLpNwXO9LOM7GCvvGIzCIAGg5ivRsH2gW7bTNlW4+ZlUmCVEwY5NG68jIrzW6ttSlpQwMOyjxH3pLakRmJJ031ofs5gGTH27zQqMpAkLJMQuh1g7hh6TrXLF1o9HNBSjfsel412bMVgMRpOoBjSRzrxjtbwfGWnLXHNwEk5s2xOsEE6GByre9oe2K4e89iPEo384nrp8axHGuNYy6CWVzabxaJoUnfMNgQY8p+FWMIRrspsPwtYz4l2AIkBdT18RMwdIj7wqtxV8TNtcsRBIkiDO/WZ10P0ruMxzMSSOmiiAOW87bb1DatsdlJidBqfSNtjUmleEPuX3uEkmfU79ZMfrQuJYiCdiNt/1rQcL7KYq4ou5VCSNXYRoSTIJ+tUt3Cw7ByBlJnpuSYjz+GtE0TwbK/WTlk6x/mlPGCuORkUnfYGJ5+VXlridlCwVYBGlyCTIA/l6Ty896Ziu0V3u0ylVGodcoPiBJB1GxWOvOrXL2I440tso/YroaDIIInyk6T151quFrdAjPnXUqdAYESFjXrykxHSq3hPFvA6sCQ6+IkgAlTNsjScwJPr8NNX2Ou2zebD3QGUiQwM/yydDvMA/E6VE7otg+HeyLBYgocoVlJYGRqSCRObXU6CYHPntWy4F2pW6iriVVrQYxnWebKxn9ROkRp0hxnY0uxexBbKSM2o0kQBEn4c/WqXiWAxGGch0g+IhhqNdRlYnSCNuenqMU2dM8cXpOzfWsRftMi4NkuWGQslt28aAT4VkTEREnmeQo3gXa0XX7q4pW6CQwIgAgkEfMH5Vg+EcUl5e5cgBip1ueLJGgY6aTuZ0redjeI27llMxUXCAMoJJHMqSxJJmT8R0rSMrOLLj4raLninCe+ZDmgAmQOf+EChGxKWz4VnLpmaTrsAJ86uwayPbvHDD2mu5c2VZy7D3oJJ5f+qiWKKfJLZzxk3oA7V3bb4XEWnuKhNpjyJ2keHcnbTzrypv4OVzkuFxLZSfCHRrc6RFwKcxHKedNxuLcWmvZic5Z8s+6HukQ55iNJ+h0p+Itmz3dy6pRSqQTzWbhYqOfubHWkTpUaVGy7AJet3bltiAGtI51mNTk06sGb8ordYfEPJXSOo1/TlWM7C4y4cQ7H/R7pbc/wBRQ/wy0gQ+QkH8IPOK3jEnVYj1rbH9Jy5vqOLaZtfd/UmpxYPNvgBFRJioMNv5a1N3w61cyH5POu1D7UvUUqAsAKRppvCm9+POrAcazvbOwxt2yrNpdt+BTAbxAkE/D4xHOtHWe7dX3TCO1vL3ggrm1AOwPpJ1J0An0rOe4s1wupoxWAw4S8yswN3IQij/AJYuSGYncglgY2kbzo/tDwvBo9q69/EJdYgJkg5SjZZmJCk8gdyelEJg1TEd6SS3dm2DrC6lmIjTXw6kfyAac7fgVuxdtRctL3llznLgGWIVg6TMAqF2jVTXLHs78rqJmW7CjE3Ha8Ft2gSLdu2uTNsQ7ZTuTOja1QcS7K44XCuYMsAW3zFTlGxeN2AgVf437RMt/ItoOn9YcSRGh6Ek6QNd+lU3aPtxdN1ltuqgFlCrDcozNmEjxAxHI1orMIt3sFbs1YwpV77ZwMoZQ0ASPIyRptRt3HWFtXHw6DwnxKI0BJgqfgPSawuMxhdyWPiJB3ZiZ3OpPMk/QU/hmICFpmGUrlJOrHRTqNhz23qeL7Zpz9kWtrtGcjWiJDHMhOuVjoSB6HbzrO4i6jLIMODlbWcwj3h8Qf0qwwNtWv29YhgfCDuNcskjUx1irntBwmw7o6ju1Oje7rEw2nOJ19J1qbSEoOT0YpW18qY4YeIAkeY08jWxuW8GqnuSFcDVroLTt7i6jad41iqniOKVu6USQOs6kknUbHXQDoNZqynfgpLGku9lNgg3eCQDGsMdCOep0irnhSu91gNSSSSYJkgGRO5mOp/Wq+1aXMYiCQBMmTMkwNCvLWeWlWnBr9tiZBS5nUAKwXSTmMxoQIiNNTUydlMap02bzhnaLu3tzdhrSgsoaGMALqSTM+GV6KIg1t+H8dtYovh7yr3Yt28xbTUgzLT1A89Qaxr8Atm09zCOjEjOy3DN3Kp8eYCc2sHSNQPKqbhOKu27Tm6Gylwq3EUAkgGYnQkKVA0aC3UVkdPG+jY8b7E20IaxiMmUg5d4OhAMcoIkefnUVjBX8LiURWtgXVcd6SBqdSQp13A2O+Xearn7QXrdwDvZUZglxlUkqfcBEAZhKg5okz8NQ+Kw2Ot9y90W76ZCJIVpIAzIp1y5pH/uqJbs2c04qM/yP7N8Zxb3XsXLYtNaKhnuGM4bMcwULB5gkGNAZ10D+1LjXcgLmXW2uXZi7G6BGUg+CJk/eAq+u4QYm4bbWlWygVS2aHLKSFhkMxl5GD4hpWP7f8Fd8RgbbZhZQBXdVE++AWGhAJbIAD1561o2cFJy12Yg8Wc2WtlFCahQo0UBlaM5MwQAIOhyA6RqWLi3Us2nDHugzwZOYeJwtsRJ0LSBJ8U13tHwqzY7zJne0O+TO0eJ5CZFCAaAlfPVukULhMXds22Y3Id1cah2ItsWUCCIySANNdBVfBqar7Ocae+uW8wKm3n9TmAkHyB1/EPOt7bZE3M/M15n2KTuMabVzKwyFUYGQJJcgkGOQEHUbevpDMOgreHRyZvqsmOLtk7ifKuMynmT9P0qvU2kJOk7zXG4qnJvlr9KsZBUH+k/58aVB/8AFB975UqA1xXzphtgVJefKJysfSP7028ihS7TAE7/AKUAHxLiAsrJMsdl/ufKvPe0XDb2IcYpXC5Q+fNOWMjZXgblSRvuI1EVfMrYi8SZ/atP7CvctbPhUqQTppIMmspXI6IPgzIpdHdtccSbltSBoMsaz1XQkEHcRtQ9jhd+x7WbpMMqoqyGTbSB18Wrba7aU29ktK2c5kEnwnRhOYgHo2i/95k6QdDgON2b9u5beSxkspkAaCMh2KR/Tpr61hE6stpa6PLONdk7tvub6OhKKWdSwVVj3QvkdRr013qtwnA2vMAiF2/mNtPDrzLsILc82avQ+IcdwljKLZtN+JxAk7TBMzO8bb1mcZ20vlO7Xu886RK5hE7DYxPrV02VT1ZnuK9kGwkO03J96OWsxpOsCrLGf8Nt2QbQLs+oJBYqTMhp2I1+XnWdv8Uusx1adWnOdxEZvnVdfusQZ6ZuZHOdt9x5frVuLfZZzVaQTfx0aLyLEbz4oB58wF2HKgr2MYgAkwCYEwBtMD5bdPhXbWAuvqqkwCYg6jmYFHXezt/KHuJ3aHWWIUnXpuN+Y51fSM5c5FT3h3J/zrTGvEEGJ6RWgv8AArFoKXxKsjAk5IzSJ2UnUTz8qZhLdm8WtWkVctt7j3rhJMKNVRdp1AHz8qWvBVx92U+GVywygeKRlBlt5kAajl+tEWGAOYwZDDceRmefp5URiL2FAIRTmy++XMq0A6KFAIzf5pJhwlrvW8TQYMGANgQBHwX5mpYjF3RZYHHXEKlXZddwSIIhhBEHU21M7ac62/DuIBrKtew2VS66orZH0yl1PJ4ze6AN4Eisja4LcKKyrmQZJYSY3hfDMbH51yzibvjBuMySU0OhymQI8wdIGuVedZySaOqEZRqSNTxvhZtYs21ebRykBpICox0JXTYnfeGio8VjyCthgCUhs7lc2RxMKQJgNMAEba9a7guMtaNuArFSHXKCxB1AJgxlmD/VoR5Vq8Ji8HjbSpcw5t3LjLrbUCCw3ZgAAZB6686oXc03tDOAdslR0S841DEss3CwBIQNAgFVGp3gCrftXxRL3DmvhGDe9bWBmB0X0kZuf6VHw77PcLk1OZSBGU5So1kArE/vr6LivD7eGwNxbg0DMEGckHMYB2008RG0rUputnNNY+fyPyeTOWZwMzsGk21LFmlSqMT7vjlFAY9OYq441wv2fBG04Y4u4Fhlll7sa+Ez4QpGpgEDyk1U3rxD5luZM5hWAVnGQqSBr4ZBETqfF51YXrt3EYMYl7k5C9pwTBhlZi0aCWmGA3HKga2Ls9ZSTkDA24ysToSVhyR5sW5bHrM7PhvEQ/gfQj/PiKo+z9qLTCCBm0BgHRQGnWfeBOvWpLgKsCOX+RWsTmnt0al8Ku0CofZiOlR2sfFoNBMELp57fQj5U9cYD1FaGPR3I39K/wCfClTu8rtBo3QJoXjM9w0eVOSSYYjy5VK2GBQ2v6gfnR9BdlD2fsjU1b41vAR4ZIIAYwCYJj9KreFeBmQ7g07tJwj2qybYYI06PGaAdGgSNSpImdJ+FZ+DVVy2ef8AH8XlFtVCOxuBXDEg6QDlBlsxkBd9jzIrR4zCRg7rrhgpW0SpyqtxlddVPOVCopJ3K67a0XE+Hqbt4K6F0zkNkPgJknKfNBl9Z3ir3hXbANh763dbthSHgZixBgwF16/CDzrmijtzN0qPIuGdmsQQ10ugXMVUs3vaeDJHUyJG0GgLVljcZLSF3Gb3ASwAMbbxFaXjfahcRdtMUi3bYPk2zaLuSJXmu3X1oXiPbq5D27SrbLkkG3AZQfeGYjUned9/KtU5PtEPgoopsPwnEX7kBHkHLt6SPlrrTb10KSPdAnUxmOkAedcxXaC8zBhcYvOpzHMfOBsYIHwFRJwfFXvGyEASS1w5ABzMHUD/AGq6TfZR5FHobaxcAu1zYDIuoZjJBIIAHhjWTzG9Q3eKXHJ8RCkxBYwJHQ+m+uwq6s9iLnhls0kSEjQdZZhI9Nda0/DuyNi2INvO2WMzwRrzAHSJqdGbnJnmqYK7cJhSTMfLT0jlpV3wLsbiLlwGMsQfF6wdJ3AMgeXKvT7fClGyAbcukc99aKw+HOYEb1Nsou7PGcXwO8l4pl/iSQyGSwBEgmOqkdN6v7XZi73WUe8QQJ8O2qzrEH9Na9IXhsXGfKczHMX6k8gZ5QP0okYBtxvVbLcqdnleBxmL4dcKlcjsq6GGBG/I5SJnbz1r0LhHD7GNss1uFcqQVI8KmJ8LdJPrvVrf4Wt1Cl22HUjZhP8AnrWbx3DMRgc9yzDWYPhmGWRtruNtjJ/WqSVnRhzSj0V3arBvZFtbggKcuedGVQ0wI10dRprEetV2H4jkAMBfEGXK0ErPUyQxXn5j4WWH7RXCot3jnVZKlhmInKNJ0I023NbpOzGCxKqyWlCnw5k0bNAJYnZt9o61Xs1clHcjNdmO1kMHOZ1HgO/UAtrueQ6z11O24ziVxGBY2srFxlXOpgN/LmBEjWJ0qp7PcDtYXvrDMl2c2UBcrEFswEaSfwnlpWjwfCO7t2rYfwh2uaiCROYKR5TGuugpTpox9RxUk0eGYq0FuBntjwznmEzrmysbYBBkBXAaF+Iox8Rh1S3ntTba5iciqPCAEtIMwOpOkzMzr5GftLw61ZvOXhrtwqLW57tZuE7+EEkLGh0J21nIcXvSBbClXI8RIMiTJQjlJA+AqY7Ik1Rq+xaLlc5cuqlGIHNYIUkeXLrV9iFmsz2WW6FW3csqqqQ2cySTETqfC2x2itHebSBudB6mtkcsnbss+CqWtNpO3/lT7y5eUURh17m2qfzNqf8APX6Vw4ydGAqyKMF9oH+GlU2e30FKpIo9Ft4IDUE1MEI50g9PBqSpX8T4cXi4kC4Pk3lWcx/Hblp5de7sIMzuULE5VZmRNQJkATrE9SK2gXzqt49wa3ibbW7mZSRGdDlYehFUkn4NcckvqMBxnF+22M1i1cts2YXDlyOQMwIgkbwPFp8xVD2P7IYtzf8AaO8UXkfxFhGZiGBInRZUAxvtsK2GE7N4jB6ozYnXR7rcpGh1kHaDrzqXD9s7Uxdt3LQEhnYeBSCBBbcbiNP01rKkuzfk6+XZ5hZ+zTHO58K2108RYGQCRmIESecem1XeB+zBVuAX7mZmkhVBCQI0LQflI59K9S9qtkSGUiYJUzBO23Wf1oC3i8oeWe0s5gzlXXXqD4lUyDDEESNRVnoqnJmWt8DweH0toHf+mxbzt8xoPiRV1a4HbaJzLGwZShkbnfUax0q/w2IRxKMrnSTbI57Hfp51JZsKgyqIGvMncyd6lFG6KWxwbQ5gBBIWDOnInQQT0HzqZOFqPOrRtD5dZgChEui4/hMoupKkEEgkQdZEb7axU9EbZC2EVRJgAddPnNNXADL4yJJ1KSoHSNfj60N2l4jcsoRatFjBbMwlOfhn+smN9Iqv4Z2tDL/FCKVChirCMxB0AJ2kH4a1RyV0axxTceSLxcCoOaNcuWTvAJIk89Sal7oelPwl7OCQVKz4SpnQge95zO1Pt2FBJVQCxkkcz1PnVqMr9yBbdZztn2d9o7pwGbuyZRdyDElQTBYRtWtK1xVmjjZfHleOXJHiGH7L4przRZurYDOQzr3ZUHcqp0X9dpitjw7heMwqBVPf2ie8/ht3T5tNCZ1Vl0kA89NZrelK5iLcocsKwgSRmB100kfX51VxNJZ3J7PO8Hj3xIuO5NpkcG2gIUoAirkGnPxalpGkDUzsr3HmtW8PcJS4GlWCETMScpmJEQQetCv2bw5fvGVEdjOZXKiSBOaWh9QN15DSqbA2LVq1isPaJvvmJtBQSyuoK+JrgCg6gTJnXTkcmmnZs8kZxUa0jJ/aFjEXFi5bMnJbZPCBM23YEgjVoNrfas5wHCi4yu67CNtyANzy5ac9D1q4XszcFy4+JBIDe61sxBYqjeEwswRERqa2XCuyrMoJi2nmCPkpEmtIpGGR8UVFt9gASToABJPkAOdaDhnCe6/jX9G/lT+n1+916UdhrGHwa+CWfbvHMsZ3A6DyFAYjHd4dSIrQwYS98MSSAZ+VBYqwDsg9YH/upLccqJt2s28/An+1WRUqu5b/AJf0/elV37IOh/WlUkGuw6Mu4HwojvfX5GuFopwYUKnfaBTxfDCo9DUXswmdfmY+W1CUOa6V3268v9qFx9gsM1sJnOsn3T5mNzt8qlfLMNB6Df8ASo8TbYj+H4T8PptUNFk62Pt4LmCuY76QfnzquxHBEIdGDEOwdvETJnTWdBpsOlF9+4MFCR1WPoT/AHpJxNZjPlPRvCfgGifhUNIlSa6K/C8Pt2IFlXEwpykHqZcuZOp8ztXbuHvKMy3CYk5CBqecuAGPM/5FWzYg84PqKhvXAwIgqTzWJHmJBH6VXiiyyMEfFuEk2iWmITWfMdB+KKJsqoERl8gPjvTrZAABJJ6wNfgNJodcOouZ+9uR/SdV/elC0wDtP3JthLzlAxBEAmY11A3GtZR+DlrIu2R3llTKIsq0E/xD4zABImBP1NehXCh0JB9RQ+JJgC3cVYI3QkQNxoRHrUOFuzSOVqPEqeE4pyIsIBbt6TckFmjXKImBI9eVWWExa3EYC6jvkmBpqZ1MGR8I25VU8VwOIuscuMFtD/KtonlGpz6850G4iIqpv8HxVsBbGKBE53LJBc/0ssEFYjmIiKjaFQfk0PA8RedDn95cwkzBOoXUqp0I6airWzm/mCg/dJI89xQlriAyjMpDRqF2HoTyoVMUiZsiEZjmMuSJ6xynyqy0UbTLwOOazr1j6eVZftDh8XezKlu2qAoyS5M5STBWAAZAM+nKaLucXbllH6/U0HiOMnncj0MfSj2Ivi7Orwp1IuYhs9sZnyRIQ5YAS3qCQCw0PQQdTUlsWGc3GtMNmVsxUnQiCogqAI36mqPE9orQMZsx6DU/LegrvGLj+6kebfsP9qqokvI2jTd/Ztljbthc0FjJMxqNzQGK4uz+6Z8+X+9Ua27jHxSfp8v3o61hm6H5VeijZGoJMv4j1P7cqKw2FB2WPQUdg+HMd1P0+tXdjh8eXoKtRVsrcLwsDUgfGrWxhOkR6UXaw4Hn61PNSVsG9lFKia5QWR+0M2yH4xUtq0597KPSjgtcNTRBAlkjp8BUmSnV2oALfUDWu2nmn4hZG00ywIAmhI66sihu4XLlZQw8xP6UbNQXrgUTyoLK18JatLCIyjpbJXfyBiobNt2PhcjydQf/ABAP60VbxalyAD+sUSkNB/2pRNle9u+Nhbb4sn9mqJrt8b2J/C4P/llq4aeVdBNRRNlA+Ocf/wA93/6f2eh7nFGH/wAF38o/etQVqHu56fCo4izK3OMN/wAi7+X/AHoW5xm7yw135KPq1bQ4f/IpjYb0+IpxFmBxHFcTysR+JgPoTQdzEY1tlVfSW/8AyK9HOBBMkA/CutghMwBU8RZ5mvDsY58TsPQAD9SaltdlLjGGzN6k/TavRzhztt6UspTqR+tKFmOwfZDKAIirfD9nVG9Xa4gHQb05Q5mQB6GT9KmiLAbXCEHKiUw6LsBUq2yNzIpw8qEDNqWZjsKkinKKCxioef6U7JXWB5RSCGgOUqdHlXKEB9NpUqsBUqVKqga1RmlSoBU1q7SoAPD++1EJzpUqFjprq0qVCo40Lht29aVKhIRXFpUqEHFp1KlQHDQ+J2NKlQlA3Cvd+f1qwpUqBjGri12lQHRTlpUqEHRXaVKgFSpUqA//2Q=="]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T13:17:39.814Z',
    '2025-09-24T13:17:39.814Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    17,
    'Test Cake',
    'test-cake',
    'A test cake',
    43,
    200,
    79,
    'Cakes',
    10,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T13:18:18.420Z',
    '2025-09-24T13:18:18.420Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    18,
    'kkkk',
    'kkkk',
    '',
    45,
    456,
    90,
    'Cakes',
    5,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T13:27:40.796Z',
    '2025-09-28T07:07:30.235Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    19,
    'kkkk',
    'kkkk',
    '',
    45,
    456,
    90,
    'Cakes',
    5,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T13:27:40.796Z',
    '2025-09-24T13:27:40.796Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    20,
    'Elegant Wedding Cake',
    'elegant-wedding-cake',
    'Beautiful three-tier wedding cake with elegant white frosting and delicate decorations. Perfect for your special day.',
    650,
    700,
    7,
    'cat_002',
    19,
    '["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T14:48:39.987Z',
    '2025-09-28T07:07:30.259Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    21,
    'Elegant Wedding Cake',
    'elegant-wedding-cake',
    'Beautiful three-tier wedding cake with elegant white frosting and delicate decorations. Perfect for your special day.',
    700,
    800,
    13,
    'cat_002',
    19,
    '["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-24T14:49:13.817Z',
    '2025-09-24T14:49:13.817Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    22,
    'jeyakrishna',
    'jeyakrishna',
    '5bbb',
    55,
    456,
    88,
    'Cakes',
    5,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-26T03:53:08.056Z',
    '2025-09-28T07:07:30.302Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    23,
    'priya',
    'priya',
    '55bggbgb',
    45,
    456,
    90,
    'Cakes',
    4,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-26T03:53:47.429Z',
    '2025-09-28T07:07:30.328Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    24,
    'vidhya',
    'vidhya',
    '4fvvfvf',
    45,
    456,
    90,
    'Daughters Day Cakes',
    5,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T06:12:45.359Z',
    '2025-09-28T07:07:30.346Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    25,
    'dttttttt',
    'dttttttt',
    '',
    64.99,
    456,
    86,
    'Birthday',
    76,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T06:46:01.478Z',
    '2025-09-28T07:07:30.365Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    26,
    'jk redvelvet',
    'jk-redvelvet',
    'tewst',
    45,
    456,
    90,
    'Cakes',
    45,
    '["data:image/jpeg;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T08:00:22.015Z',
    '2025-09-28T07:07:30.385Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    27,
    'Choco Dream Cake',
    'choco-dream-cake',
    'Relish the Dream Cake with rich chocolate layers, creamy mousse, velvety truffle, crunchy pieces and cocoa dusting. A perfect indulgence for every chocolate lover seeking a luxurious treat.',
    60,
    649,
    91,
    'Cakes',
    32,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T15:52:53.395Z',
    '2025-09-28T07:07:30.422Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    28,
    'Choco Dream Cake',
    'choco-dream-cake',
    'Relish the Dream Cake with rich chocolate layers, creamy mousse, velvety truffle, crunchy pieces and cocoa dusting. A perfect indulgence for every chocolate lover seeking a luxurious treat.',
    60,
    649,
    91,
    'Cakes',
    32,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T15:52:53.395Z',
    '2025-09-27T15:52:53.395Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    29,
    'Premium Chocolate Cake',
    'premium-chocolate-cake',
    'Rich and moist chocolate cake made with premium cocoa. Perfect for any celebration.',
    399,
    NULL,
    0,
    'Cakes',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:32:57.145Z',
    '2025-09-28T07:07:30.445Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    30,
    'Deluxe Red Velvet Cake',
    'deluxe-red-velvet-cake',
    'Classic red velvet cake with cream cheese frosting. A timeless favorite.',
    499,
    NULL,
    0,
    'Cakes',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:32:58.176Z',
    '2025-09-28T07:07:30.468Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    31,
    'Magical Unicorn Cake',
    'magical-unicorn-cake',
    'Magical unicorn themed cake with rainbow colors and sparkles. Perfect for kids'' birthdays.',
    799,
    NULL,
    0,
    'Theme Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:32:59.221Z',
    '2025-09-28T07:07:30.493Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    32,
    'Fresh Chocolate Chip Cookies',
    'fresh-chocolate-chip-cookies',
    'Freshly baked chocolate chip cookies with premium chocolate chunks.',
    199,
    NULL,
    0,
    'Desserts',
    100,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:33:00.269Z',
    '2025-09-28T07:07:30.516Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    33,
    'Premium Special Daughter Cakes',
    'premium-special-daughter-cakes',
    'High-quality special daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    239,
    NULL,
    0,
    'Daughters Day Cakes',
    35,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:35.923Z',
    '2025-09-28T07:07:30.536Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    34,
    'Deluxe Special Daughter Cakes',
    'deluxe-special-daughter-cakes',
    'High-quality special daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    451,
    NULL,
    0,
    'Daughters Day Cakes',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:36.458Z',
    '2025-09-28T07:07:30.553Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    35,
    'Special Special Daughter Cakes',
    'special-special-daughter-cakes',
    'High-quality special daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    342,
    NULL,
    0,
    'Daughters Day Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:36.998Z',
    '2025-09-28T07:07:30.576Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    36,
    'Premium Love Daughter Cakes',
    'premium-love-daughter-cakes',
    'High-quality love daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    579,
    NULL,
    0,
    'Daughters Day Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:37.527Z',
    '2025-09-28T07:07:30.602Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    37,
    'Deluxe Love Daughter Cakes',
    'deluxe-love-daughter-cakes',
    'High-quality love daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    527,
    NULL,
    0,
    'Daughters Day Cakes',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:38.053Z',
    '2025-09-28T07:07:30.628Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    38,
    'Special Love Daughter Cakes',
    'special-love-daughter-cakes',
    'High-quality love daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    578,
    NULL,
    0,
    'Daughters Day Cakes',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:38.589Z',
    '2025-09-28T07:07:30.643Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    39,
    'Premium Princess Daughter Cakes',
    'premium-princess-daughter-cakes',
    'High-quality princess daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    584,
    NULL,
    0,
    'Daughters Day Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:39.134Z',
    '2025-09-28T07:07:30.663Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    40,
    'Deluxe Princess Daughter Cakes',
    'deluxe-princess-daughter-cakes',
    'High-quality princess daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    256,
    NULL,
    0,
    'Daughters Day Cakes',
    47,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:39.679Z',
    '2025-09-28T07:07:30.684Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    41,
    'Special Princess Daughter Cakes',
    'special-princess-daughter-cakes',
    'High-quality princess daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    531,
    NULL,
    0,
    'Daughters Day Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:40.223Z',
    '2025-09-28T07:07:30.703Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    42,
    'Premium Blessing Daughter Cakes',
    'premium-blessing-daughter-cakes',
    'High-quality blessing daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    496,
    NULL,
    0,
    'Daughters Day Cakes',
    45,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:40.768Z',
    '2025-09-28T07:07:30.729Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    43,
    'Deluxe Blessing Daughter Cakes',
    'deluxe-blessing-daughter-cakes',
    'High-quality blessing daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    386,
    NULL,
    0,
    'Daughters Day Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:41.296Z',
    '2025-09-28T07:07:30.763Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    44,
    'Special Blessing Daughter Cakes',
    'special-blessing-daughter-cakes',
    'High-quality blessing daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    337,
    NULL,
    0,
    'Daughters Day Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:41.831Z',
    '2025-09-28T07:07:30.784Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    45,
    'Premium Custom Daughter Cakes',
    'premium-custom-daughter-cakes',
    'High-quality custom daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    230,
    NULL,
    0,
    'Daughters Day Cakes',
    13,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:42.358Z',
    '2025-09-28T07:07:30.813Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    46,
    'Deluxe Custom Daughter Cakes',
    'deluxe-custom-daughter-cakes',
    'High-quality custom daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    356,
    NULL,
    0,
    'Daughters Day Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:42.898Z',
    '2025-09-28T07:07:30.851Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    47,
    'Special Custom Daughter Cakes',
    'special-custom-daughter-cakes',
    'High-quality custom daughter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    230,
    NULL,
    0,
    'Daughters Day Cakes',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:43.433Z',
    '2025-09-28T07:07:30.871Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    48,
    'Premium Gourmet Cakes',
    'premium-gourmet-cakes',
    'High-quality gourmet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    557,
    NULL,
    0,
    'Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:43.963Z',
    '2025-09-28T07:07:30.890Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    49,
    'Deluxe Gourmet Cakes',
    'deluxe-gourmet-cakes',
    'High-quality gourmet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    249,
    NULL,
    0,
    'Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:44.500Z',
    '2025-09-28T08:49:07.753Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    50,
    'Special Gourmet Cakes',
    'special-gourmet-cakes',
    'High-quality gourmet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    391,
    NULL,
    0,
    'Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:45.031Z',
    '2025-09-28T07:07:30.925Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    51,
    'Premium Bento Cakes',
    'premium-bento-cakes',
    'High-quality bento cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    561,
    NULL,
    0,
    'Cakes',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:45.560Z',
    '2025-09-28T07:07:30.946Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    52,
    'Deluxe Bento Cakes',
    'deluxe-bento-cakes',
    'High-quality bento cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    403,
    NULL,
    0,
    'Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:46.096Z',
    '2025-09-28T07:07:30.972Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    53,
    'Special Bento Cakes',
    'special-bento-cakes',
    'High-quality bento cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    294,
    NULL,
    0,
    'Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:46.641Z',
    '2025-09-28T07:07:30.991Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    54,
    'Premium Labubu Cakes',
    'premium-labubu-cakes',
    'High-quality labubu cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    295,
    NULL,
    0,
    'Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:47.183Z',
    '2025-09-28T07:07:31.016Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    55,
    'Deluxe Labubu Cakes',
    'deluxe-labubu-cakes',
    'High-quality labubu cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    433,
    NULL,
    0,
    'Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:47.732Z',
    '2025-09-28T07:07:31.039Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    56,
    'Special Labubu Cakes',
    'special-labubu-cakes',
    'High-quality labubu cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    358,
    NULL,
    0,
    'Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:48.274Z',
    '2025-09-28T07:07:31.061Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    57,
    'Premium Cricket Cakes',
    'premium-cricket-cakes',
    'High-quality cricket cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    581,
    NULL,
    0,
    'Cakes',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:48.811Z',
    '2025-09-28T07:07:31.096Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    58,
    'Deluxe Cricket Cakes',
    'deluxe-cricket-cakes',
    'High-quality cricket cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    557,
    NULL,
    0,
    'Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:49.338Z',
    '2025-09-28T07:07:31.119Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    59,
    'Special Cricket Cakes',
    'special-cricket-cakes',
    'High-quality cricket cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    370,
    NULL,
    0,
    'Cakes',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:49.878Z',
    '2025-09-28T07:07:31.139Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    60,
    'Premium Pinata Cakes',
    'premium-pinata-cakes',
    'High-quality pinata cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    421,
    NULL,
    0,
    'Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:50.417Z',
    '2025-09-28T07:07:31.160Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    61,
    'Deluxe Pinata Cakes',
    'deluxe-pinata-cakes',
    'High-quality pinata cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    562,
    NULL,
    0,
    'Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:50.962Z',
    '2025-09-28T07:07:31.182Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    62,
    'Special Pinata Cakes',
    'special-pinata-cakes',
    'High-quality pinata cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    340,
    NULL,
    0,
    'Cakes',
    21,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:51.498Z',
    '2025-09-28T07:07:31.208Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    63,
    'Premium Drip Cakes',
    'premium-drip-cakes',
    'High-quality drip cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    273,
    NULL,
    0,
    'Cakes',
    56,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:52.035Z',
    '2025-09-28T07:07:31.249Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    64,
    'Deluxe Drip Cakes',
    'deluxe-drip-cakes',
    'High-quality drip cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    281,
    NULL,
    0,
    'Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:52.578Z',
    '2025-09-28T07:07:31.282Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    65,
    'Special Drip Cakes',
    'special-drip-cakes',
    'High-quality drip cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    272,
    NULL,
    0,
    'Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:53.111Z',
    '2025-09-28T07:07:31.312Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    66,
    'Premium Bestsellers',
    'premium-bestsellers',
    'High-quality bestsellers made with finest ingredients. Perfect for special occasions and celebrations.',
    231,
    NULL,
    0,
    'Cakes',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:53.658Z',
    '2025-09-28T07:07:31.337Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    67,
    'Deluxe Bestsellers',
    'deluxe-bestsellers',
    'High-quality bestsellers made with finest ingredients. Perfect for special occasions and celebrations.',
    418,
    NULL,
    0,
    'Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:54.195Z',
    '2025-09-28T07:07:31.362Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    68,
    'Special Bestsellers',
    'special-bestsellers',
    'High-quality bestsellers made with finest ingredients. Perfect for special occasions and celebrations.',
    568,
    NULL,
    0,
    'Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:54.727Z',
    '2025-09-28T07:07:31.386Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    69,
    'Premium Eggless Cakes',
    'premium-eggless-cakes',
    'High-quality eggless cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    360,
    NULL,
    0,
    'Cakes',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:55.267Z',
    '2025-09-28T07:07:31.414Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    70,
    'Deluxe Eggless Cakes',
    'deluxe-eggless-cakes',
    'High-quality eggless cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    432,
    NULL,
    0,
    'Cakes',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:55.807Z',
    '2025-09-28T07:07:31.435Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    71,
    'Special Eggless Cakes',
    'special-eggless-cakes',
    'High-quality eggless cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    210,
    NULL,
    0,
    'Cakes',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:56.336Z',
    '2025-09-28T07:07:31.454Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    72,
    'Premium Photo Cakes',
    'premium-photo-cakes',
    'High-quality photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    435,
    NULL,
    0,
    'Cakes',
    23,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:56.868Z',
    '2025-09-28T07:07:31.473Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    73,
    'Deluxe Photo Cakes',
    'deluxe-photo-cakes',
    'High-quality photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    491,
    NULL,
    0,
    'Cakes',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:57.409Z',
    '2025-09-28T07:07:31.492Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    74,
    'Special Photo Cakes',
    'special-photo-cakes',
    'High-quality photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    354,
    NULL,
    0,
    'Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:57.961Z',
    '2025-09-28T07:07:31.514Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    75,
    'Premium Cheese Cakes',
    'premium-cheese-cakes',
    'High-quality cheese cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    589,
    NULL,
    0,
    'Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:58.489Z',
    '2025-09-28T07:07:31.531Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    76,
    'Deluxe Cheese Cakes',
    'deluxe-cheese-cakes',
    'High-quality cheese cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    243,
    NULL,
    0,
    'Cakes',
    43,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:59.022Z',
    '2025-09-28T07:07:31.551Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    77,
    'Special Cheese Cakes',
    'special-cheese-cakes',
    'High-quality cheese cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    548,
    NULL,
    0,
    'Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:35:59.571Z',
    '2025-09-28T07:07:31.572Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    78,
    'Premium Half Cakes',
    'premium-half-cakes',
    'High-quality half cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    461,
    NULL,
    0,
    'Cakes',
    20,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:00.121Z',
    '2025-09-28T07:07:31.599Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    79,
    'Deluxe Half Cakes',
    'deluxe-half-cakes',
    'High-quality half cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    459,
    NULL,
    0,
    'Cakes',
    52,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:00.669Z',
    '2025-09-28T07:07:31.632Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    80,
    'Special Half Cakes',
    'special-half-cakes',
    'High-quality half cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    449,
    NULL,
    0,
    'Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:01.203Z',
    '2025-09-28T07:07:31.652Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    81,
    'Premium Heart Shaped',
    'premium-heart-shaped',
    'High-quality heart shaped made with finest ingredients. Perfect for special occasions and celebrations.',
    566,
    NULL,
    0,
    'Cakes',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:01.746Z',
    '2025-09-28T07:07:31.674Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    82,
    'Deluxe Heart Shaped',
    'deluxe-heart-shaped',
    'High-quality heart shaped made with finest ingredients. Perfect for special occasions and celebrations.',
    346,
    NULL,
    0,
    'Cakes',
    58,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:02.272Z',
    '2025-09-28T07:07:31.694Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    83,
    'Special Heart Shaped',
    'special-heart-shaped',
    'High-quality heart shaped made with finest ingredients. Perfect for special occasions and celebrations.',
    492,
    NULL,
    0,
    'Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:02.816Z',
    '2025-09-28T07:07:31.723Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    84,
    'Premium Chocolate Cakes',
    'premium-chocolate-cakes',
    'High-quality chocolate cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    357,
    NULL,
    0,
    'Cakes',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:03.351Z',
    '2025-09-28T07:07:31.745Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    85,
    'Deluxe Chocolate Cakes',
    'deluxe-chocolate-cakes',
    'High-quality chocolate cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    598,
    NULL,
    0,
    'Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:03.899Z',
    '2025-09-28T07:07:31.771Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    86,
    'Special Chocolate Cakes',
    'special-chocolate-cakes',
    'High-quality chocolate cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    475,
    NULL,
    0,
    'Cakes',
    42,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:04.442Z',
    '2025-09-28T07:07:31.797Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    87,
    'Premium Butterscotch Cakes',
    'premium-butterscotch-cakes',
    'High-quality butterscotch cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    589,
    NULL,
    0,
    'Cakes',
    10,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:04.979Z',
    '2025-09-28T07:07:31.822Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    88,
    'Deluxe Butterscotch Cakes',
    'deluxe-butterscotch-cakes',
    'High-quality butterscotch cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    355,
    NULL,
    0,
    'Cakes',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:05.515Z',
    '2025-09-28T07:07:31.859Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    89,
    'Special Butterscotch Cakes',
    'special-butterscotch-cakes',
    'High-quality butterscotch cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    330,
    NULL,
    0,
    'Cakes',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:06.055Z',
    '2025-09-28T07:07:31.903Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    90,
    'Premium Pineapple Cakes',
    'premium-pineapple-cakes',
    'High-quality pineapple cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    274,
    NULL,
    0,
    'Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:06.593Z',
    '2025-09-28T07:07:31.935Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    91,
    'Deluxe Pineapple Cakes',
    'deluxe-pineapple-cakes',
    'High-quality pineapple cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    334,
    NULL,
    0,
    'Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:07.123Z',
    '2025-09-28T07:07:31.969Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    92,
    'Special Pineapple Cakes',
    'special-pineapple-cakes',
    'High-quality pineapple cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    465,
    NULL,
    0,
    'Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:07.658Z',
    '2025-09-28T07:07:31.996Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    93,
    'Premium Kit Kat Cakes',
    'premium-kit-kat-cakes',
    'High-quality kit kat cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    491,
    NULL,
    0,
    'Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:08.186Z',
    '2025-09-28T07:07:32.018Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    94,
    'Deluxe Kit Kat Cakes',
    'deluxe-kit-kat-cakes',
    'High-quality kit kat cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    329,
    NULL,
    0,
    'Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:08.726Z',
    '2025-09-28T07:07:32.038Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    95,
    'Special Kit Kat Cakes',
    'special-kit-kat-cakes',
    'High-quality kit kat cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    249,
    NULL,
    0,
    'Cakes',
    56,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:09.260Z',
    '2025-09-28T07:07:32.091Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    96,
    'Premium Black Forest Cakes',
    'premium-black-forest-cakes',
    'High-quality black forest cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    557,
    NULL,
    0,
    'Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:09.803Z',
    '2025-09-28T07:07:32.133Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    97,
    'Deluxe Black Forest Cakes',
    'deluxe-black-forest-cakes',
    'High-quality black forest cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    371,
    NULL,
    0,
    'Cakes',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:10.326Z',
    '2025-09-28T07:07:32.158Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    98,
    'Special Black Forest Cakes',
    'special-black-forest-cakes',
    'High-quality black forest cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    367,
    NULL,
    0,
    'Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:10.857Z',
    '2025-09-28T07:07:32.181Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    99,
    'Premium Red Velvet Cakes',
    'premium-red-velvet-cakes',
    'High-quality red velvet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    494,
    NULL,
    0,
    'Cakes',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:11.392Z',
    '2025-09-28T07:07:32.200Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    100,
    'Deluxe Red Velvet Cakes',
    'deluxe-red-velvet-cakes',
    'High-quality red velvet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    493,
    NULL,
    0,
    'Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:11.932Z',
    '2025-09-28T07:07:32.222Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    101,
    'Special Red Velvet Cakes',
    'special-red-velvet-cakes',
    'High-quality red velvet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    288,
    NULL,
    0,
    'Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:12.473Z',
    '2025-09-28T07:07:32.242Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    102,
    'Premium Chocolate',
    'premium-chocolate',
    'High-quality chocolate made with finest ingredients. Perfect for special occasions and celebrations.',
    381,
    NULL,
    0,
    'Cakes',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:13.018Z',
    '2025-09-28T07:07:32.265Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    103,
    'Deluxe Chocolate',
    'deluxe-chocolate',
    'High-quality chocolate made with finest ingredients. Perfect for special occasions and celebrations.',
    392,
    NULL,
    0,
    'Cakes',
    54,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:13.541Z',
    '2025-09-28T07:07:32.292Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    104,
    'Special Chocolate',
    'special-chocolate',
    'High-quality chocolate made with finest ingredients. Perfect for special occasions and celebrations.',
    310,
    NULL,
    0,
    'Cakes',
    28,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:14.073Z',
    '2025-09-28T07:07:32.317Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    105,
    'Premium Butterscotch',
    'premium-butterscotch',
    'High-quality butterscotch made with finest ingredients. Perfect for special occasions and celebrations.',
    370,
    NULL,
    0,
    'Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:14.611Z',
    '2025-09-28T07:07:32.341Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    106,
    'Deluxe Butterscotch',
    'deluxe-butterscotch',
    'High-quality butterscotch made with finest ingredients. Perfect for special occasions and celebrations.',
    270,
    NULL,
    0,
    'Cakes',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:15.149Z',
    '2025-09-28T07:07:32.361Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    107,
    'Special Butterscotch',
    'special-butterscotch',
    'High-quality butterscotch made with finest ingredients. Perfect for special occasions and celebrations.',
    451,
    NULL,
    0,
    'Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:15.690Z',
    '2025-09-28T07:07:32.379Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    108,
    'Premium Black Forest',
    'premium-black-forest',
    'High-quality black forest made with finest ingredients. Perfect for special occasions and celebrations.',
    255,
    NULL,
    0,
    'Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:16.227Z',
    '2025-09-28T07:07:32.396Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    109,
    'Deluxe Black Forest',
    'deluxe-black-forest',
    'High-quality black forest made with finest ingredients. Perfect for special occasions and celebrations.',
    389,
    NULL,
    0,
    'Cakes',
    45,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:16.763Z',
    '2025-09-28T07:07:32.414Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    110,
    'Special Black Forest',
    'special-black-forest',
    'High-quality black forest made with finest ingredients. Perfect for special occasions and celebrations.',
    472,
    NULL,
    0,
    'Cakes',
    13,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:17.300Z',
    '2025-09-28T07:07:32.437Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    111,
    'Premium Gulab Jamun',
    'premium-gulab-jamun',
    'High-quality gulab jamun made with finest ingredients. Perfect for special occasions and celebrations.',
    333,
    NULL,
    0,
    'Cakes',
    36,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:17.838Z',
    '2025-09-28T07:07:32.461Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    112,
    'Deluxe Gulab Jamun',
    'deluxe-gulab-jamun',
    'High-quality gulab jamun made with finest ingredients. Perfect for special occasions and celebrations.',
    474,
    NULL,
    0,
    'Cakes',
    24,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:18.385Z',
    '2025-09-28T07:07:32.480Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    113,
    'Special Gulab Jamun',
    'special-gulab-jamun',
    'High-quality gulab jamun made with finest ingredients. Perfect for special occasions and celebrations.',
    349,
    NULL,
    0,
    'Cakes',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:18.925Z',
    '2025-09-28T07:07:32.496Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    114,
    'Premium Rasmalai',
    'premium-rasmalai',
    'High-quality rasmalai made with finest ingredients. Perfect for special occasions and celebrations.',
    205,
    NULL,
    0,
    'Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:19.460Z',
    '2025-09-28T07:07:32.511Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    115,
    'Deluxe Rasmalai',
    'deluxe-rasmalai',
    'High-quality rasmalai made with finest ingredients. Perfect for special occasions and celebrations.',
    215,
    NULL,
    0,
    'Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:20.000Z',
    '2025-09-28T07:07:32.528Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    116,
    'Special Rasmalai',
    'special-rasmalai',
    'High-quality rasmalai made with finest ingredients. Perfect for special occasions and celebrations.',
    217,
    NULL,
    0,
    'Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:20.551Z',
    '2025-09-28T07:07:32.544Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    117,
    'Premium Vanilla',
    'premium-vanilla',
    'High-quality vanilla made with finest ingredients. Perfect for special occasions and celebrations.',
    523,
    NULL,
    0,
    'Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:21.093Z',
    '2025-09-28T07:07:32.568Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    118,
    'Deluxe Vanilla',
    'deluxe-vanilla',
    'High-quality vanilla made with finest ingredients. Perfect for special occasions and celebrations.',
    451,
    NULL,
    0,
    'Cakes',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:21.625Z',
    '2025-09-28T07:07:32.602Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    119,
    'Special Vanilla',
    'special-vanilla',
    'High-quality vanilla made with finest ingredients. Perfect for special occasions and celebrations.',
    230,
    NULL,
    0,
    'Cakes',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:22.154Z',
    '2025-09-28T07:07:32.638Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    120,
    'Premium Blueberry',
    'premium-blueberry',
    'High-quality blueberry made with finest ingredients. Perfect for special occasions and celebrations.',
    271,
    NULL,
    0,
    'Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:22.689Z',
    '2025-09-28T07:07:32.668Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    121,
    'Deluxe Blueberry',
    'deluxe-blueberry',
    'High-quality blueberry made with finest ingredients. Perfect for special occasions and celebrations.',
    512,
    NULL,
    0,
    'Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:23.220Z',
    '2025-09-28T07:07:32.698Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    122,
    'Special Blueberry',
    'special-blueberry',
    'High-quality blueberry made with finest ingredients. Perfect for special occasions and celebrations.',
    344,
    NULL,
    0,
    'Cakes',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:23.748Z',
    '2025-09-28T07:07:32.721Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    123,
    'Premium Strawberry',
    'premium-strawberry',
    'High-quality strawberry made with finest ingredients. Perfect for special occasions and celebrations.',
    486,
    NULL,
    0,
    'Cakes',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:24.282Z',
    '2025-09-28T07:07:32.750Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    124,
    'Deluxe Strawberry',
    'deluxe-strawberry',
    'High-quality strawberry made with finest ingredients. Perfect for special occasions and celebrations.',
    493,
    NULL,
    0,
    'Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:24.816Z',
    '2025-09-28T07:07:32.780Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    125,
    'Special Strawberry',
    'special-strawberry',
    'High-quality strawberry made with finest ingredients. Perfect for special occasions and celebrations.',
    421,
    NULL,
    0,
    'Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:25.360Z',
    '2025-09-28T07:07:32.813Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    126,
    'Premium Special Flavours',
    'premium-special-flavours',
    'High-quality special flavours made with finest ingredients. Perfect for special occasions and celebrations.',
    466,
    NULL,
    0,
    'Cakes',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:25.890Z',
    '2025-09-28T07:07:32.836Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    127,
    'Deluxe Special Flavours',
    'deluxe-special-flavours',
    'High-quality special flavours made with finest ingredients. Perfect for special occasions and celebrations.',
    389,
    NULL,
    0,
    'Cakes',
    10,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:26.425Z',
    '2025-09-28T07:07:32.862Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    128,
    'Special Special Flavours',
    'special-special-flavours',
    'High-quality special flavours made with finest ingredients. Perfect for special occasions and celebrations.',
    582,
    NULL,
    0,
    'Cakes',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:26.963Z',
    '2025-09-28T07:07:32.889Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    129,
    'Premium Double Flavours',
    'premium-double-flavours',
    'High-quality double flavours made with finest ingredients. Perfect for special occasions and celebrations.',
    456,
    NULL,
    0,
    'Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:27.506Z',
    '2025-09-28T07:07:32.918Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    130,
    'Deluxe Double Flavours',
    'deluxe-double-flavours',
    'High-quality double flavours made with finest ingredients. Perfect for special occasions and celebrations.',
    472,
    NULL,
    0,
    'Cakes',
    32,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:28.036Z',
    '2025-09-28T07:07:32.961Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    131,
    'Special Double Flavours',
    'special-double-flavours',
    'High-quality double flavours made with finest ingredients. Perfect for special occasions and celebrations.',
    375,
    NULL,
    0,
    'Cakes',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:28.571Z',
    '2025-09-28T07:07:32.998Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    132,
    'Premium Red Velvet',
    'premium-red-velvet',
    'High-quality red velvet made with finest ingredients. Perfect for special occasions and celebrations.',
    343,
    NULL,
    0,
    'Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:29.116Z',
    '2025-09-28T07:07:33.019Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    133,
    'Deluxe Red Velvet',
    'deluxe-red-velvet',
    'High-quality red velvet made with finest ingredients. Perfect for special occasions and celebrations.',
    402,
    NULL,
    0,
    'Cakes',
    56,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:29.653Z',
    '2025-09-28T07:07:33.036Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    134,
    'Special Red Velvet',
    'special-red-velvet',
    'High-quality red velvet made with finest ingredients. Perfect for special occasions and celebrations.',
    454,
    NULL,
    0,
    'Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:30.181Z',
    '2025-09-28T07:07:33.052Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    135,
    'Premium Fruit Cakes',
    'premium-fruit-cakes',
    'High-quality fruit cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    567,
    NULL,
    0,
    'Cakes',
    13,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:30.717Z',
    '2025-09-28T07:07:33.074Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    136,
    'Deluxe Fruit Cakes',
    'deluxe-fruit-cakes',
    'High-quality fruit cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    461,
    NULL,
    0,
    'Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:31.260Z',
    '2025-09-28T07:07:33.093Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    137,
    'Special Fruit Cakes',
    'special-fruit-cakes',
    'High-quality fruit cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    257,
    NULL,
    0,
    'Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:31.793Z',
    '2025-09-28T07:07:33.116Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    138,
    'Premium Truffle Cakes',
    'premium-truffle-cakes',
    'High-quality truffle cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    561,
    NULL,
    0,
    'Cakes',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:32.330Z',
    '2025-09-28T07:07:33.148Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    139,
    'Deluxe Truffle Cakes',
    'deluxe-truffle-cakes',
    'High-quality truffle cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    351,
    NULL,
    0,
    'Cakes',
    28,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:32.873Z',
    '2025-09-28T07:07:33.182Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    140,
    'Special Truffle Cakes',
    'special-truffle-cakes',
    'High-quality truffle cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    379,
    NULL,
    0,
    'Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:33.419Z',
    '2025-09-28T07:07:33.202Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    141,
    'Premium Ferrero Rocher',
    'premium-ferrero-rocher',
    'High-quality ferrero rocher made with finest ingredients. Perfect for special occasions and celebrations.',
    460,
    NULL,
    0,
    'Cakes',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:33.961Z',
    '2025-09-28T07:07:33.223Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    142,
    'Deluxe Ferrero Rocher',
    'deluxe-ferrero-rocher',
    'High-quality ferrero rocher made with finest ingredients. Perfect for special occasions and celebrations.',
    360,
    NULL,
    0,
    'Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:34.490Z',
    '2025-09-28T07:07:33.246Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    143,
    'Special Ferrero Rocher',
    'special-ferrero-rocher',
    'High-quality ferrero rocher made with finest ingredients. Perfect for special occasions and celebrations.',
    505,
    NULL,
    0,
    'Cakes',
    47,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:35.036Z',
    '2025-09-28T07:07:33.266Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    144,
    'Premium Mango',
    'premium-mango',
    'High-quality mango made with finest ingredients. Perfect for special occasions and celebrations.',
    598,
    NULL,
    0,
    'Cakes',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:35.580Z',
    '2025-09-28T07:07:33.284Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    145,
    'Deluxe Mango',
    'deluxe-mango',
    'High-quality mango made with finest ingredients. Perfect for special occasions and celebrations.',
    317,
    NULL,
    0,
    'Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:36.116Z',
    '2025-09-28T07:07:33.300Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    146,
    'Special Mango',
    'special-mango',
    'High-quality mango made with finest ingredients. Perfect for special occasions and celebrations.',
    393,
    NULL,
    0,
    'Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:36.652Z',
    '2025-09-28T07:07:33.319Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    147,
    'Premium Pineapple',
    'premium-pineapple',
    'High-quality pineapple made with finest ingredients. Perfect for special occasions and celebrations.',
    256,
    NULL,
    0,
    'Cakes',
    10,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:37.184Z',
    '2025-09-28T07:07:33.342Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    148,
    'Deluxe Pineapple',
    'deluxe-pineapple',
    'High-quality pineapple made with finest ingredients. Perfect for special occasions and celebrations.',
    306,
    NULL,
    0,
    'Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:37.726Z',
    '2025-09-28T07:07:33.357Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    149,
    'Special Pineapple',
    'special-pineapple',
    'High-quality pineapple made with finest ingredients. Perfect for special occasions and celebrations.',
    375,
    NULL,
    0,
    'Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:38.263Z',
    '2025-09-28T07:07:33.375Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    150,
    'Premium Kitkat Cakes',
    'premium-kitkat-cakes',
    'High-quality kitkat cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    373,
    NULL,
    0,
    'Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:38.785Z',
    '2025-09-28T07:07:33.392Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    151,
    'Deluxe Kitkat Cakes',
    'deluxe-kitkat-cakes',
    'High-quality kitkat cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    273,
    NULL,
    0,
    'Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:39.325Z',
    '2025-09-28T07:07:33.409Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    152,
    'Special Kitkat Cakes',
    'special-kitkat-cakes',
    'High-quality kitkat cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    205,
    NULL,
    0,
    'Cakes',
    43,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:39.861Z',
    '2025-09-28T07:07:33.436Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    153,
    'Premium Customize Cakes',
    'premium-customize-cakes',
    'High-quality customize cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    298,
    NULL,
    0,
    'Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:40.405Z',
    '2025-09-28T07:07:33.462Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    154,
    'Deluxe Customize Cakes',
    'deluxe-customize-cakes',
    'High-quality customize cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    360,
    NULL,
    0,
    'Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:40.931Z',
    '2025-09-28T07:07:33.484Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    155,
    'Special Customize Cakes',
    'special-customize-cakes',
    'High-quality customize cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    398,
    NULL,
    0,
    'Cakes',
    52,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:41.476Z',
    '2025-09-28T07:07:33.505Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    156,
    'Premium Trending Cakes',
    'premium-trending-cakes',
    'High-quality trending cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    448,
    NULL,
    0,
    'Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:42.021Z',
    '2025-09-28T07:07:33.524Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    157,
    'Deluxe Trending Cakes',
    'deluxe-trending-cakes',
    'High-quality trending cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    558,
    NULL,
    0,
    'Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:42.545Z',
    '2025-09-28T07:07:33.545Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    158,
    'Special Trending Cakes',
    'special-trending-cakes',
    'High-quality trending cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    355,
    NULL,
    0,
    'Cakes',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:43.079Z',
    '2025-09-28T07:07:33.565Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    159,
    'Premium Popular Cakes',
    'premium-popular-cakes',
    'High-quality popular cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    412,
    NULL,
    0,
    'Trending Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:43.611Z',
    '2025-09-28T07:07:33.586Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    160,
    'Deluxe Popular Cakes',
    'deluxe-popular-cakes',
    'High-quality popular cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    346,
    NULL,
    0,
    'Trending Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:44.147Z',
    '2025-09-28T07:07:33.606Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    161,
    'Special Popular Cakes',
    'special-popular-cakes',
    'High-quality popular cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    268,
    NULL,
    0,
    'Trending Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:44.674Z',
    '2025-09-28T07:07:33.622Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    162,
    'Premium Latest Cakes',
    'premium-latest-cakes',
    'High-quality latest cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    398,
    NULL,
    0,
    'Trending Cakes',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:45.217Z',
    '2025-09-28T07:07:33.640Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    163,
    'Deluxe Latest Cakes',
    'deluxe-latest-cakes',
    'High-quality latest cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    584,
    NULL,
    0,
    'Trending Cakes',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:45.747Z',
    '2025-09-28T07:07:33.655Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    164,
    'Special Latest Cakes',
    'special-latest-cakes',
    'High-quality latest cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    484,
    NULL,
    0,
    'Trending Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:46.281Z',
    '2025-09-28T07:07:33.671Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    165,
    'Premium Best Seller Cakes',
    'premium-best-seller-cakes',
    'High-quality best seller cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    282,
    NULL,
    0,
    'Trending Cakes',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:46.821Z',
    '2025-09-28T07:07:33.689Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    166,
    'Deluxe Best Seller Cakes',
    'deluxe-best-seller-cakes',
    'High-quality best seller cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    383,
    NULL,
    0,
    'Trending Cakes',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:47.360Z',
    '2025-09-28T07:07:33.712Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    167,
    'Special Best Seller Cakes',
    'special-best-seller-cakes',
    'High-quality best seller cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    243,
    NULL,
    0,
    'Trending Cakes',
    53,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:47.895Z',
    '2025-09-28T07:07:33.730Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    168,
    'Premium Customer Favorites',
    'premium-customer-favorites',
    'High-quality customer favorites made with finest ingredients. Perfect for special occasions and celebrations.',
    294,
    NULL,
    0,
    'Trending Cakes',
    36,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:48.429Z',
    '2025-09-28T07:07:33.748Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    169,
    'Deluxe Customer Favorites',
    'deluxe-customer-favorites',
    'High-quality customer favorites made with finest ingredients. Perfect for special occasions and celebrations.',
    352,
    NULL,
    0,
    'Trending Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:48.965Z',
    '2025-09-28T07:07:33.768Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    170,
    'Special Customer Favorites',
    'special-customer-favorites',
    'High-quality customer favorites made with finest ingredients. Perfect for special occasions and celebrations.',
    435,
    NULL,
    0,
    'Trending Cakes',
    43,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:49.503Z',
    '2025-09-28T07:07:33.786Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    171,
    'Premium Viral Cakes',
    'premium-viral-cakes',
    'High-quality viral cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    367,
    NULL,
    0,
    'Trending Cakes',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:50.046Z',
    '2025-09-28T07:07:33.805Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    172,
    'Deluxe Viral Cakes',
    'deluxe-viral-cakes',
    'High-quality viral cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    383,
    NULL,
    0,
    'Trending Cakes',
    23,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:50.575Z',
    '2025-09-28T07:07:33.834Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    173,
    'Special Viral Cakes',
    'special-viral-cakes',
    'High-quality viral cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    464,
    NULL,
    0,
    'Trending Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:51.102Z',
    '2025-09-28T07:07:33.866Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    174,
    'Premium Seasonal Trending',
    'premium-seasonal-trending',
    'High-quality seasonal trending made with finest ingredients. Perfect for special occasions and celebrations.',
    254,
    NULL,
    0,
    'Trending Cakes',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:51.645Z',
    '2025-09-28T07:07:33.883Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    175,
    'Deluxe Seasonal Trending',
    'deluxe-seasonal-trending',
    'High-quality seasonal trending made with finest ingredients. Perfect for special occasions and celebrations.',
    231,
    NULL,
    0,
    'Trending Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:52.181Z',
    '2025-09-28T07:07:33.899Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    176,
    'Special Seasonal Trending',
    'special-seasonal-trending',
    'High-quality seasonal trending made with finest ingredients. Perfect for special occasions and celebrations.',
    390,
    NULL,
    0,
    'Trending Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:52.714Z',
    '2025-09-28T07:07:33.916Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    177,
    'Premium 1st Birthday Cakes',
    'premium-1st-birthday-cakes',
    'High-quality 1st birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    491,
    NULL,
    0,
    'Theme Cakes',
    42,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:53.255Z',
    '2025-09-28T07:07:33.932Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    178,
    'Deluxe 1st Birthday Cakes',
    'deluxe-1st-birthday-cakes',
    'High-quality 1st birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    230,
    NULL,
    0,
    'Theme Cakes',
    53,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:53.803Z',
    '2025-09-28T07:07:33.947Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    179,
    'Special 1st Birthday Cakes',
    'special-1st-birthday-cakes',
    'High-quality 1st birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    211,
    NULL,
    0,
    'Theme Cakes',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:54.332Z',
    '2025-09-28T07:07:33.965Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    180,
    'Premium Princess Cakes',
    'premium-princess-cakes',
    'High-quality princess cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    479,
    NULL,
    0,
    'Theme Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:54.869Z',
    '2025-09-28T07:07:33.984Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    181,
    'Deluxe Princess Cakes',
    'deluxe-princess-cakes',
    'High-quality princess cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    388,
    NULL,
    0,
    'Theme Cakes',
    24,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:55.403Z',
    '2025-09-28T07:07:34.002Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    182,
    'Special Princess Cakes',
    'special-princess-cakes',
    'High-quality princess cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    523,
    NULL,
    0,
    'Theme Cakes',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:55.941Z',
    '2025-09-28T07:07:34.019Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    183,
    'Premium Animal Cakes',
    'premium-animal-cakes',
    'High-quality animal cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    570,
    NULL,
    0,
    'Theme Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:56.478Z',
    '2025-09-28T07:07:34.035Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    184,
    'Deluxe Animal Cakes',
    'deluxe-animal-cakes',
    'High-quality animal cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    408,
    NULL,
    0,
    'Theme Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:57.014Z',
    '2025-09-28T07:07:34.055Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    185,
    'Special Animal Cakes',
    'special-animal-cakes',
    'High-quality animal cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    354,
    NULL,
    0,
    'Theme Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:57.558Z',
    '2025-09-28T07:07:34.075Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    186,
    'Premium Masha & The Bear Cakes',
    'premium-masha-&-the-bear-cakes',
    'High-quality masha & the bear cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    575,
    NULL,
    0,
    'Theme Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:58.098Z',
    '2025-09-28T07:07:34.094Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    187,
    'Deluxe Masha & The Bear Cakes',
    'deluxe-masha-&-the-bear-cakes',
    'High-quality masha & the bear cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    396,
    NULL,
    0,
    'Theme Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:58.637Z',
    '2025-09-28T07:07:34.111Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    188,
    'Special Masha & The Bear Cakes',
    'special-masha-&-the-bear-cakes',
    'High-quality masha & the bear cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    387,
    NULL,
    0,
    'Theme Cakes',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:59.174Z',
    '2025-09-28T07:07:34.130Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    189,
    'Premium Cakes For Boys',
    'premium-cakes-for-boys',
    'High-quality cakes for boys made with finest ingredients. Perfect for special occasions and celebrations.',
    241,
    NULL,
    0,
    'Theme Cakes',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:36:59.719Z',
    '2025-09-28T07:07:34.146Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    190,
    'Deluxe Cakes For Boys',
    'deluxe-cakes-for-boys',
    'High-quality cakes for boys made with finest ingredients. Perfect for special occasions and celebrations.',
    567,
    NULL,
    0,
    'Theme Cakes',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:00.261Z',
    '2025-09-28T07:07:34.164Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    191,
    'Special Cakes For Boys',
    'special-cakes-for-boys',
    'High-quality cakes for boys made with finest ingredients. Perfect for special occasions and celebrations.',
    585,
    NULL,
    0,
    'Theme Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:00.801Z',
    '2025-09-28T07:07:34.190Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    192,
    'Premium Cakes For Girls',
    'premium-cakes-for-girls',
    'High-quality cakes for girls made with finest ingredients. Perfect for special occasions and celebrations.',
    223,
    NULL,
    0,
    'Theme Cakes',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:01.349Z',
    '2025-09-28T07:07:34.231Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    193,
    'Deluxe Cakes For Girls',
    'deluxe-cakes-for-girls',
    'High-quality cakes for girls made with finest ingredients. Perfect for special occasions and celebrations.',
    278,
    NULL,
    0,
    'Theme Cakes',
    56,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:01.889Z',
    '2025-09-28T07:07:34.262Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    194,
    'Special Cakes For Girls',
    'special-cakes-for-girls',
    'High-quality cakes for girls made with finest ingredients. Perfect for special occasions and celebrations.',
    216,
    NULL,
    0,
    'Theme Cakes',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:02.423Z',
    '2025-09-28T07:07:34.282Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    195,
    'Premium Number Cakes',
    'premium-number-cakes',
    'High-quality number cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    272,
    NULL,
    0,
    'Theme Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:02.958Z',
    '2025-09-28T07:07:34.299Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    196,
    'Deluxe Number Cakes',
    'deluxe-number-cakes',
    'High-quality number cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    570,
    NULL,
    0,
    'Theme Cakes',
    41,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:03.492Z',
    '2025-09-28T07:07:34.322Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    197,
    'Special Number Cakes',
    'special-number-cakes',
    'High-quality number cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    219,
    NULL,
    0,
    'Theme Cakes',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:04.038Z',
    '2025-09-28T07:07:34.343Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    198,
    'Premium Alphabet Cakes',
    'premium-alphabet-cakes',
    'High-quality alphabet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    459,
    NULL,
    0,
    'Theme Cakes',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:04.593Z',
    '2025-09-28T07:07:34.371Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    199,
    'Deluxe Alphabet Cakes',
    'deluxe-alphabet-cakes',
    'High-quality alphabet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    450,
    NULL,
    0,
    'Theme Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:05.133Z',
    '2025-09-28T07:07:34.394Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    200,
    'Special Alphabet Cakes',
    'special-alphabet-cakes',
    'High-quality alphabet cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    268,
    NULL,
    0,
    'Theme Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:05.674Z',
    '2025-09-28T07:07:34.412Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    201,
    'Premium Spiderman Cakes',
    'premium-spiderman-cakes',
    'High-quality spiderman cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    512,
    NULL,
    0,
    'Theme Cakes',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:06.208Z',
    '2025-09-28T07:07:34.429Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    202,
    'Deluxe Spiderman Cakes',
    'deluxe-spiderman-cakes',
    'High-quality spiderman cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    552,
    NULL,
    0,
    'Theme Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:06.754Z',
    '2025-09-28T07:07:34.448Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    203,
    'Special Spiderman Cakes',
    'special-spiderman-cakes',
    'High-quality spiderman cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    413,
    NULL,
    0,
    'Theme Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:07.296Z',
    '2025-09-28T07:07:34.468Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    204,
    'Premium Unicorn Cakes',
    'premium-unicorn-cakes',
    'High-quality unicorn cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    394,
    NULL,
    0,
    'Theme Cakes',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:07.829Z',
    '2025-09-28T07:07:34.486Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    205,
    'Deluxe Unicorn Cakes',
    'deluxe-unicorn-cakes',
    'High-quality unicorn cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    510,
    NULL,
    0,
    'Theme Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:08.357Z',
    '2025-09-28T07:07:34.508Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    206,
    'Special Unicorn Cakes',
    'special-unicorn-cakes',
    'High-quality unicorn cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    484,
    NULL,
    0,
    'Theme Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:08.897Z',
    '2025-09-28T07:07:34.529Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    207,
    'Premium Barbie Cakes',
    'premium-barbie-cakes',
    'High-quality barbie cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    394,
    NULL,
    0,
    'Theme Cakes',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:09.446Z',
    '2025-09-28T07:07:34.549Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    208,
    'Deluxe Barbie Cakes',
    'deluxe-barbie-cakes',
    'High-quality barbie cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    505,
    NULL,
    0,
    'Theme Cakes',
    58,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:09.995Z',
    '2025-09-28T07:07:34.567Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    209,
    'Special Barbie Cakes',
    'special-barbie-cakes',
    'High-quality barbie cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    488,
    NULL,
    0,
    'Theme Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:10.526Z',
    '2025-09-28T07:07:34.592Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    210,
    'Premium Harry Potter Cakes',
    'premium-harry-potter-cakes',
    'High-quality harry potter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    245,
    NULL,
    0,
    'Theme Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:11.059Z',
    '2025-09-28T07:07:34.611Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    211,
    'Deluxe Harry Potter Cakes',
    'deluxe-harry-potter-cakes',
    'High-quality harry potter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    307,
    NULL,
    0,
    'Theme Cakes',
    42,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:11.591Z',
    '2025-09-28T07:07:34.643Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    212,
    'Special Harry Potter Cakes',
    'special-harry-potter-cakes',
    'High-quality harry potter cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    259,
    NULL,
    0,
    'Theme Cakes',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:12.124Z',
    '2025-09-28T07:07:34.676Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    213,
    'Premium Avenger Cakes',
    'premium-avenger-cakes',
    'High-quality avenger cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    534,
    NULL,
    0,
    'Theme Cakes',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:12.680Z',
    '2025-09-28T07:07:34.693Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    214,
    'Deluxe Avenger Cakes',
    'deluxe-avenger-cakes',
    'High-quality avenger cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    278,
    NULL,
    0,
    'Theme Cakes',
    35,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:13.218Z',
    '2025-09-28T07:07:34.710Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    215,
    'Special Avenger Cakes',
    'special-avenger-cakes',
    'High-quality avenger cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    222,
    NULL,
    0,
    'Theme Cakes',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:13.760Z',
    '2025-09-28T07:07:34.727Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    216,
    'Premium Peppa Pig Cakes',
    'premium-peppa-pig-cakes',
    'High-quality peppa pig cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    570,
    NULL,
    0,
    'Theme Cakes',
    38,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:14.302Z',
    '2025-09-28T07:07:34.754Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    217,
    'Deluxe Peppa Pig Cakes',
    'deluxe-peppa-pig-cakes',
    'High-quality peppa pig cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    449,
    NULL,
    0,
    'Theme Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:14.838Z',
    '2025-09-28T07:07:34.790Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    218,
    'Special Peppa Pig Cakes',
    'special-peppa-pig-cakes',
    'High-quality peppa pig cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    316,
    NULL,
    0,
    'Theme Cakes',
    36,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:15.365Z',
    '2025-09-28T07:07:34.822Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    219,
    'Premium Doraemon Cakes',
    'premium-doraemon-cakes',
    'High-quality doraemon cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    539,
    NULL,
    0,
    'Theme Cakes',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:15.908Z',
    '2025-09-28T07:07:34.842Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    220,
    'Deluxe Doraemon Cakes',
    'deluxe-doraemon-cakes',
    'High-quality doraemon cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    514,
    NULL,
    0,
    'Theme Cakes',
    38,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:16.458Z',
    '2025-09-28T07:07:34.862Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    221,
    'Special Doraemon Cakes',
    'special-doraemon-cakes',
    'High-quality doraemon cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    363,
    NULL,
    0,
    'Theme Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:17.002Z',
    '2025-09-28T07:07:34.888Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    222,
    'Premium Naruto Cakes',
    'premium-naruto-cakes',
    'High-quality naruto cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    353,
    NULL,
    0,
    'Theme Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:17.532Z',
    '2025-09-28T07:07:34.918Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    223,
    'Deluxe Naruto Cakes',
    'deluxe-naruto-cakes',
    'High-quality naruto cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    235,
    NULL,
    0,
    'Theme Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:18.077Z',
    '2025-09-28T07:07:34.952Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    224,
    'Special Naruto Cakes',
    'special-naruto-cakes',
    'High-quality naruto cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    246,
    NULL,
    0,
    'Theme Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:18.619Z',
    '2025-09-28T07:07:34.991Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    225,
    'Premium Makeup Cakes',
    'premium-makeup-cakes',
    'High-quality makeup cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    285,
    NULL,
    0,
    'Theme Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:19.153Z',
    '2025-09-28T07:07:35.017Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    226,
    'Deluxe Makeup Cakes',
    'deluxe-makeup-cakes',
    'High-quality makeup cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    336,
    NULL,
    0,
    'Theme Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:19.689Z',
    '2025-09-28T07:07:35.043Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    227,
    'Special Makeup Cakes',
    'special-makeup-cakes',
    'High-quality makeup cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    434,
    NULL,
    0,
    'Theme Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:20.226Z',
    '2025-09-28T07:07:35.071Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    228,
    'Premium Bride To Be Cakes',
    'premium-bride-to-be-cakes',
    'High-quality bride to be cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    545,
    NULL,
    0,
    'Theme Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:20.770Z',
    '2025-09-28T07:07:35.099Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    229,
    'Deluxe Bride To Be Cakes',
    'deluxe-bride-to-be-cakes',
    'High-quality bride to be cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    380,
    NULL,
    0,
    'Theme Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:21.308Z',
    '2025-09-28T07:07:35.128Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    230,
    'Special Bride To Be Cakes',
    'special-bride-to-be-cakes',
    'High-quality bride to be cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    576,
    NULL,
    0,
    'Theme Cakes',
    43,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:21.845Z',
    '2025-09-28T07:07:35.147Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    231,
    'Premium Wedding Cakes',
    'premium-wedding-cakes',
    'High-quality wedding cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    374,
    NULL,
    0,
    'Theme Cakes',
    32,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:22.372Z',
    '2025-09-28T07:07:35.171Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    232,
    'Deluxe Wedding Cakes',
    'deluxe-wedding-cakes',
    'High-quality wedding cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    576,
    NULL,
    0,
    'Theme Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:22.918Z',
    '2025-09-28T07:07:35.196Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    233,
    'Special Wedding Cakes',
    'special-wedding-cakes',
    'High-quality wedding cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    560,
    NULL,
    0,
    'Theme Cakes',
    32,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:23.461Z',
    '2025-09-28T07:07:35.219Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    234,
    'Premium Gym Cakes',
    'premium-gym-cakes',
    'High-quality gym cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    443,
    NULL,
    0,
    'Theme Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:24.005Z',
    '2025-09-28T07:07:35.248Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    235,
    'Deluxe Gym Cakes',
    'deluxe-gym-cakes',
    'High-quality gym cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    580,
    NULL,
    0,
    'Theme Cakes',
    41,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:24.548Z',
    '2025-09-28T07:07:35.267Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    236,
    'Special Gym Cakes',
    'special-gym-cakes',
    'High-quality gym cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    511,
    NULL,
    0,
    'Theme Cakes',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:25.090Z',
    '2025-09-28T07:07:35.288Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    237,
    'Premium Party Cakes',
    'premium-party-cakes',
    'High-quality party cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    257,
    NULL,
    0,
    'Theme Cakes',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:25.636Z',
    '2025-09-28T07:07:35.309Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    238,
    'Deluxe Party Cakes',
    'deluxe-party-cakes',
    'High-quality party cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    455,
    NULL,
    0,
    'Theme Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:26.180Z',
    '2025-09-28T07:07:35.328Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    239,
    'Special Party Cakes',
    'special-party-cakes',
    'High-quality party cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    427,
    NULL,
    0,
    'Theme Cakes',
    56,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:26.733Z',
    '2025-09-28T07:07:35.344Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    240,
    'Premium BTS Cakes',
    'premium-bts-cakes',
    'High-quality bts cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    299,
    NULL,
    0,
    'Theme Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:27.280Z',
    '2025-09-28T07:07:35.360Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    241,
    'Deluxe BTS Cakes',
    'deluxe-bts-cakes',
    'High-quality bts cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    372,
    NULL,
    0,
    'Theme Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:27.825Z',
    '2025-09-28T07:07:35.379Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    242,
    'Special BTS Cakes',
    'special-bts-cakes',
    'High-quality bts cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    436,
    NULL,
    0,
    'Theme Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:28.365Z',
    '2025-09-28T07:07:35.398Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    243,
    'Premium Jungle Theme Cakes',
    'premium-jungle-theme-cakes',
    'High-quality jungle theme cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    544,
    NULL,
    0,
    'Theme Cakes',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:28.913Z',
    '2025-09-28T07:07:35.418Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    244,
    'Deluxe Jungle Theme Cakes',
    'deluxe-jungle-theme-cakes',
    'High-quality jungle theme cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    385,
    NULL,
    0,
    'Theme Cakes',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:29.454Z',
    '2025-09-28T07:07:35.443Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    245,
    'Special Jungle Theme Cakes',
    'special-jungle-theme-cakes',
    'High-quality jungle theme cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    287,
    NULL,
    0,
    'Theme Cakes',
    24,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:29.991Z',
    '2025-09-28T07:07:35.466Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    246,
    'Premium Cricket Cakes',
    'premium-cricket-cakes',
    'High-quality cricket cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    379,
    NULL,
    0,
    'Theme Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:30.532Z',
    '2025-09-28T07:07:35.492Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    247,
    'Deluxe Cricket Cakes',
    'deluxe-cricket-cakes',
    'High-quality cricket cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    216,
    NULL,
    0,
    'Theme Cakes',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:31.068Z',
    '2025-09-28T07:07:35.515Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    248,
    'Special Cricket Cakes',
    'special-cricket-cakes',
    'High-quality cricket cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    447,
    NULL,
    0,
    'Theme Cakes',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:31.601Z',
    '2025-09-28T07:07:35.541Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    249,
    'Premium Football Cakes',
    'premium-football-cakes',
    'High-quality football cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    378,
    NULL,
    0,
    'Theme Cakes',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:32.142Z',
    '2025-09-28T07:07:35.561Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    250,
    'Deluxe Football Cakes',
    'deluxe-football-cakes',
    'High-quality football cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    315,
    NULL,
    0,
    'Theme Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:32.687Z',
    '2025-09-28T07:07:35.583Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    251,
    'Special Football Cakes',
    'special-football-cakes',
    'High-quality football cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    538,
    NULL,
    0,
    'Theme Cakes',
    52,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:33.235Z',
    '2025-09-28T07:07:35.601Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    252,
    'Premium Basketball Cakes',
    'premium-basketball-cakes',
    'High-quality basketball cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    208,
    NULL,
    0,
    'Theme Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:33.769Z',
    '2025-09-28T07:07:35.617Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    253,
    'Deluxe Basketball Cakes',
    'deluxe-basketball-cakes',
    'High-quality basketball cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    325,
    NULL,
    0,
    'Theme Cakes',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:34.302Z',
    '2025-09-28T07:07:35.633Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    254,
    'Special Basketball Cakes',
    'special-basketball-cakes',
    'High-quality basketball cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    375,
    NULL,
    0,
    'Theme Cakes',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:34.840Z',
    '2025-09-28T07:07:35.652Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    255,
    'Premium Rainbow Cakes',
    'premium-rainbow-cakes',
    'High-quality rainbow cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    478,
    NULL,
    0,
    'Theme Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:35.389Z',
    '2025-09-28T07:07:35.673Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    256,
    'Deluxe Rainbow Cakes',
    'deluxe-rainbow-cakes',
    'High-quality rainbow cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    295,
    NULL,
    0,
    'Theme Cakes',
    28,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:35.930Z',
    '2025-09-28T07:07:35.693Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    257,
    'Special Rainbow Cakes',
    'special-rainbow-cakes',
    'High-quality rainbow cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    436,
    NULL,
    0,
    'Theme Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:36.473Z',
    '2025-09-28T07:07:35.711Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    258,
    'Premium Butterfly Cakes',
    'premium-butterfly-cakes',
    'High-quality butterfly cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    435,
    NULL,
    0,
    'Theme Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:37.017Z',
    '2025-09-28T07:07:35.729Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    259,
    'Deluxe Butterfly Cakes',
    'deluxe-butterfly-cakes',
    'High-quality butterfly cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    587,
    NULL,
    0,
    'Theme Cakes',
    10,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:37.561Z',
    '2025-09-28T07:07:35.746Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    260,
    'Special Butterfly Cakes',
    'special-butterfly-cakes',
    'High-quality butterfly cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    483,
    NULL,
    0,
    'Theme Cakes',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:38.099Z',
    '2025-09-28T07:07:35.764Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    261,
    'Premium Shinchan Cakes',
    'premium-shinchan-cakes',
    'High-quality shinchan cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    306,
    NULL,
    0,
    'Theme Cakes',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:38.637Z',
    '2025-09-28T07:07:35.783Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    262,
    'Deluxe Shinchan Cakes',
    'deluxe-shinchan-cakes',
    'High-quality shinchan cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    540,
    NULL,
    0,
    'Theme Cakes',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:39.185Z',
    '2025-09-28T07:07:35.803Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    263,
    'Special Shinchan Cakes',
    'special-shinchan-cakes',
    'High-quality shinchan cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    337,
    NULL,
    0,
    'Theme Cakes',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:39.737Z',
    '2025-09-28T07:07:35.819Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    264,
    'Premium Dinosaur Cakes',
    'premium-dinosaur-cakes',
    'High-quality dinosaur cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    578,
    NULL,
    0,
    'Theme Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:40.286Z',
    '2025-09-28T07:07:35.837Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    265,
    'Deluxe Dinosaur Cakes',
    'deluxe-dinosaur-cakes',
    'High-quality dinosaur cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    387,
    NULL,
    0,
    'Theme Cakes',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:40.818Z',
    '2025-09-28T07:07:35.856Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    266,
    'Special Dinosaur Cakes',
    'special-dinosaur-cakes',
    'High-quality dinosaur cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    341,
    NULL,
    0,
    'Theme Cakes',
    32,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:41.354Z',
    '2025-09-28T07:07:35.876Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    267,
    'Premium Cakes For Friend',
    'premium-cakes-for-friend',
    'High-quality cakes for friend made with finest ingredients. Perfect for special occasions and celebrations.',
    504,
    NULL,
    0,
    'By Relationship',
    45,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:41.899Z',
    '2025-09-28T07:07:35.893Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    268,
    'Deluxe Cakes For Friend',
    'deluxe-cakes-for-friend',
    'High-quality cakes for friend made with finest ingredients. Perfect for special occasions and celebrations.',
    570,
    NULL,
    0,
    'By Relationship',
    15,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:42.448Z',
    '2025-09-28T07:07:35.911Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    269,
    'Special Cakes For Friend',
    'special-cakes-for-friend',
    'High-quality cakes for friend made with finest ingredients. Perfect for special occasions and celebrations.',
    410,
    NULL,
    0,
    'By Relationship',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:42.986Z',
    '2025-09-28T07:07:35.928Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    270,
    'Premium Cakes For Father',
    'premium-cakes-for-father',
    'High-quality cakes for father made with finest ingredients. Perfect for special occasions and celebrations.',
    450,
    NULL,
    0,
    'By Relationship',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:43.525Z',
    '2025-09-28T07:07:35.945Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    271,
    'Deluxe Cakes For Father',
    'deluxe-cakes-for-father',
    'High-quality cakes for father made with finest ingredients. Perfect for special occasions and celebrations.',
    410,
    NULL,
    0,
    'By Relationship',
    21,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:44.069Z',
    '2025-09-28T07:07:35.962Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    272,
    'Special Cakes For Father',
    'special-cakes-for-father',
    'High-quality cakes for father made with finest ingredients. Perfect for special occasions and celebrations.',
    503,
    NULL,
    0,
    'By Relationship',
    58,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:44.610Z',
    '2025-09-28T07:07:35.981Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    273,
    'Premium Cakes For Husband',
    'premium-cakes-for-husband',
    'High-quality cakes for husband made with finest ingredients. Perfect for special occasions and celebrations.',
    262,
    NULL,
    0,
    'By Relationship',
    22,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:45.149Z',
    '2025-09-28T07:07:36.001Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    274,
    'Deluxe Cakes For Husband',
    'deluxe-cakes-for-husband',
    'High-quality cakes for husband made with finest ingredients. Perfect for special occasions and celebrations.',
    316,
    NULL,
    0,
    'By Relationship',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:45.699Z',
    '2025-09-28T07:07:36.018Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    275,
    'Special Cakes For Husband',
    'special-cakes-for-husband',
    'High-quality cakes for husband made with finest ingredients. Perfect for special occasions and celebrations.',
    549,
    NULL,
    0,
    'By Relationship',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:46.238Z',
    '2025-09-28T07:07:36.042Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    276,
    'Premium Cakes For Brother',
    'premium-cakes-for-brother',
    'High-quality cakes for brother made with finest ingredients. Perfect for special occasions and celebrations.',
    536,
    NULL,
    0,
    'By Relationship',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:46.789Z',
    '2025-09-28T07:07:36.063Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    277,
    'Deluxe Cakes For Brother',
    'deluxe-cakes-for-brother',
    'High-quality cakes for brother made with finest ingredients. Perfect for special occasions and celebrations.',
    583,
    NULL,
    0,
    'By Relationship',
    58,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:47.322Z',
    '2025-09-28T07:07:36.081Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    278,
    'Special Cakes For Brother',
    'special-cakes-for-brother',
    'High-quality cakes for brother made with finest ingredients. Perfect for special occasions and celebrations.',
    223,
    NULL,
    0,
    'By Relationship',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:47.859Z',
    '2025-09-28T07:07:36.103Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    279,
    'Premium Cakes For Boyfriend',
    'premium-cakes-for-boyfriend',
    'High-quality cakes for boyfriend made with finest ingredients. Perfect for special occasions and celebrations.',
    414,
    NULL,
    0,
    'By Relationship',
    56,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:48.394Z',
    '2025-09-28T07:07:36.126Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    280,
    'Deluxe Cakes For Boyfriend',
    'deluxe-cakes-for-boyfriend',
    'High-quality cakes for boyfriend made with finest ingredients. Perfect for special occasions and celebrations.',
    589,
    NULL,
    0,
    'By Relationship',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:48.932Z',
    '2025-09-28T07:07:36.146Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    281,
    'Special Cakes For Boyfriend',
    'special-cakes-for-boyfriend',
    'High-quality cakes for boyfriend made with finest ingredients. Perfect for special occasions and celebrations.',
    301,
    NULL,
    0,
    'By Relationship',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:49.472Z',
    '2025-09-28T07:07:36.165Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    282,
    'Premium Cakes For Mother',
    'premium-cakes-for-mother',
    'High-quality cakes for mother made with finest ingredients. Perfect for special occasions and celebrations.',
    209,
    NULL,
    0,
    'By Relationship',
    38,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:50.011Z',
    '2025-09-28T07:07:36.188Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    283,
    'Deluxe Cakes For Mother',
    'deluxe-cakes-for-mother',
    'High-quality cakes for mother made with finest ingredients. Perfect for special occasions and celebrations.',
    500,
    NULL,
    0,
    'By Relationship',
    43,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:50.539Z',
    '2025-09-28T07:07:36.209Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    284,
    'Special Cakes For Mother',
    'special-cakes-for-mother',
    'High-quality cakes for mother made with finest ingredients. Perfect for special occasions and celebrations.',
    345,
    NULL,
    0,
    'By Relationship',
    21,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:51.077Z',
    '2025-09-28T07:07:36.229Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    285,
    'Premium Cakes For Wife',
    'premium-cakes-for-wife',
    'High-quality cakes for wife made with finest ingredients. Perfect for special occasions and celebrations.',
    537,
    NULL,
    0,
    'By Relationship',
    53,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:51.621Z',
    '2025-09-28T07:07:36.249Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    286,
    'Deluxe Cakes For Wife',
    'deluxe-cakes-for-wife',
    'High-quality cakes for wife made with finest ingredients. Perfect for special occasions and celebrations.',
    554,
    NULL,
    0,
    'By Relationship',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:52.160Z',
    '2025-09-28T07:07:36.273Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    287,
    'Special Cakes For Wife',
    'special-cakes-for-wife',
    'High-quality cakes for wife made with finest ingredients. Perfect for special occasions and celebrations.',
    586,
    NULL,
    0,
    'By Relationship',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:52.693Z',
    '2025-09-28T07:07:36.300Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    288,
    'Premium Cakes For Girlfriend',
    'premium-cakes-for-girlfriend',
    'High-quality cakes for girlfriend made with finest ingredients. Perfect for special occasions and celebrations.',
    236,
    NULL,
    0,
    'By Relationship',
    38,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:53.237Z',
    '2025-09-28T07:07:36.324Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    289,
    'Deluxe Cakes For Girlfriend',
    'deluxe-cakes-for-girlfriend',
    'High-quality cakes for girlfriend made with finest ingredients. Perfect for special occasions and celebrations.',
    441,
    NULL,
    0,
    'By Relationship',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:53.786Z',
    '2025-09-28T07:07:36.341Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    290,
    'Special Cakes For Girlfriend',
    'special-cakes-for-girlfriend',
    'High-quality cakes for girlfriend made with finest ingredients. Perfect for special occasions and celebrations.',
    509,
    NULL,
    0,
    'By Relationship',
    54,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:54.321Z',
    '2025-09-28T07:07:36.359Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    291,
    'Premium Cakes For Sister',
    'premium-cakes-for-sister',
    'High-quality cakes for sister made with finest ingredients. Perfect for special occasions and celebrations.',
    308,
    NULL,
    0,
    'By Relationship',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:54.872Z',
    '2025-09-28T07:07:36.377Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    292,
    'Deluxe Cakes For Sister',
    'deluxe-cakes-for-sister',
    'High-quality cakes for sister made with finest ingredients. Perfect for special occasions and celebrations.',
    453,
    NULL,
    0,
    'By Relationship',
    41,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:55.422Z',
    '2025-09-28T07:07:36.395Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    293,
    'Special Cakes For Sister',
    'special-cakes-for-sister',
    'High-quality cakes for sister made with finest ingredients. Perfect for special occasions and celebrations.',
    285,
    NULL,
    0,
    'By Relationship',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:55.963Z',
    '2025-09-28T07:07:36.411Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    294,
    'Premium All Desserts',
    'premium-all-desserts',
    'High-quality all desserts made with finest ingredients. Perfect for special occasions and celebrations.',
    397,
    NULL,
    0,
    'Desserts',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:56.504Z',
    '2025-09-28T07:07:36.428Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    295,
    'Deluxe All Desserts',
    'deluxe-all-desserts',
    'High-quality all desserts made with finest ingredients. Perfect for special occasions and celebrations.',
    203,
    NULL,
    0,
    'Desserts',
    36,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:57.044Z',
    '2025-09-28T07:07:36.445Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    296,
    'Special All Desserts',
    'special-all-desserts',
    'High-quality all desserts made with finest ingredients. Perfect for special occasions and celebrations.',
    300,
    NULL,
    0,
    'Desserts',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:57.586Z',
    '2025-09-28T07:07:36.462Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    297,
    'Premium Jar Cakes',
    'premium-jar-cakes',
    'High-quality jar cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    480,
    NULL,
    0,
    'Desserts',
    35,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:58.134Z',
    '2025-09-28T07:07:36.479Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    298,
    'Deluxe Jar Cakes',
    'deluxe-jar-cakes',
    'High-quality jar cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    541,
    NULL,
    0,
    'Desserts',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:58.686Z',
    '2025-09-28T07:07:36.495Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    299,
    'Special Jar Cakes',
    'special-jar-cakes',
    'High-quality jar cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    372,
    NULL,
    0,
    'Desserts',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:59.227Z',
    '2025-09-28T07:07:36.515Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    300,
    'Premium Pastries',
    'premium-pastries',
    'High-quality pastries made with finest ingredients. Perfect for special occasions and celebrations.',
    370,
    NULL,
    0,
    'Desserts',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:37:59.781Z',
    '2025-09-28T07:07:36.532Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    301,
    'Deluxe Pastries',
    'deluxe-pastries',
    'High-quality pastries made with finest ingredients. Perfect for special occasions and celebrations.',
    447,
    NULL,
    0,
    'Desserts',
    52,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:00.323Z',
    '2025-09-28T07:07:36.548Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    302,
    'Special Pastries',
    'special-pastries',
    'High-quality pastries made with finest ingredients. Perfect for special occasions and celebrations.',
    438,
    NULL,
    0,
    'Desserts',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:00.857Z',
    '2025-09-28T07:07:36.567Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    303,
    'Premium Cheese Cakes',
    'premium-cheese-cakes',
    'High-quality cheese cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    205,
    NULL,
    0,
    'Desserts',
    23,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:01.403Z',
    '2025-09-28T07:07:36.586Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    304,
    'Deluxe Cheese Cakes',
    'deluxe-cheese-cakes',
    'High-quality cheese cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    391,
    NULL,
    0,
    'Desserts',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:01.947Z',
    '2025-09-28T07:07:36.609Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    305,
    'Special Cheese Cakes',
    'special-cheese-cakes',
    'High-quality cheese cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    336,
    NULL,
    0,
    'Desserts',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:02.484Z',
    '2025-09-28T07:07:36.628Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    306,
    'Premium Cup Cakes',
    'premium-cup-cakes',
    'High-quality cup cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    239,
    NULL,
    0,
    'Desserts',
    38,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:03.027Z',
    '2025-09-28T07:07:36.648Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    307,
    'Deluxe Cup Cakes',
    'deluxe-cup-cakes',
    'High-quality cup cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    235,
    NULL,
    0,
    'Desserts',
    23,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:03.574Z',
    '2025-09-28T07:07:36.666Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    308,
    'Special Cup Cakes',
    'special-cup-cakes',
    'High-quality cup cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    566,
    NULL,
    0,
    'Desserts',
    42,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:04.121Z',
    '2025-09-28T07:07:36.685Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    309,
    'Premium Brownies',
    'premium-brownies',
    'High-quality brownies made with finest ingredients. Perfect for special occasions and celebrations.',
    378,
    NULL,
    0,
    'Desserts',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:04.661Z',
    '2025-09-28T07:07:36.705Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    310,
    'Deluxe Brownies',
    'deluxe-brownies',
    'High-quality brownies made with finest ingredients. Perfect for special occasions and celebrations.',
    331,
    NULL,
    0,
    'Desserts',
    40,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:05.209Z',
    '2025-09-28T07:07:36.725Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    311,
    'Special Brownies',
    'special-brownies',
    'High-quality brownies made with finest ingredients. Perfect for special occasions and celebrations.',
    507,
    NULL,
    0,
    'Desserts',
    47,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:05.748Z',
    '2025-09-28T07:07:36.749Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    312,
    'Premium Cookies',
    'premium-cookies',
    'High-quality cookies made with finest ingredients. Perfect for special occasions and celebrations.',
    386,
    NULL,
    0,
    'Desserts',
    24,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:06.289Z',
    '2025-09-28T07:07:36.769Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    313,
    'Deluxe Cookies',
    'deluxe-cookies',
    'High-quality cookies made with finest ingredients. Perfect for special occasions and celebrations.',
    236,
    NULL,
    0,
    'Desserts',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:06.824Z',
    '2025-09-28T07:07:36.792Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    314,
    'Special Cookies',
    'special-cookies',
    'High-quality cookies made with finest ingredients. Perfect for special occasions and celebrations.',
    516,
    NULL,
    0,
    'Desserts',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:07.361Z',
    '2025-09-28T07:07:36.816Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    315,
    'Premium Tea Cakes',
    'premium-tea-cakes',
    'High-quality tea cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    279,
    NULL,
    0,
    'Desserts',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:07.903Z',
    '2025-09-28T07:07:36.837Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    316,
    'Deluxe Tea Cakes',
    'deluxe-tea-cakes',
    'High-quality tea cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    447,
    NULL,
    0,
    'Desserts',
    20,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:08.446Z',
    '2025-09-28T07:07:36.867Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    317,
    'Special Tea Cakes',
    'special-tea-cakes',
    'High-quality tea cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    572,
    NULL,
    0,
    'Desserts',
    33,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:08.994Z',
    '2025-09-28T07:07:36.885Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    318,
    'Premium Birthday Cakes',
    'premium-birthday-cakes',
    'High-quality birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    529,
    NULL,
    0,
    'Birthday',
    47,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:09.540Z',
    '2025-09-28T07:07:36.906Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    319,
    'Deluxe Birthday Cakes',
    'deluxe-birthday-cakes',
    'High-quality birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    513,
    NULL,
    0,
    'Birthday',
    29,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:10.081Z',
    '2025-09-28T07:07:36.925Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    320,
    'Special Birthday Cakes',
    'special-birthday-cakes',
    'High-quality birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    273,
    NULL,
    0,
    'Birthday',
    38,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:10.620Z',
    '2025-09-28T07:07:36.944Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    321,
    'Premium 1st Birthday Cakes',
    'premium-1st-birthday-cakes',
    'High-quality 1st birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    587,
    NULL,
    0,
    'Birthday',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:11.163Z',
    '2025-09-28T07:07:36.964Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    322,
    'Deluxe 1st Birthday Cakes',
    'deluxe-1st-birthday-cakes',
    'High-quality 1st birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    566,
    NULL,
    0,
    'Birthday',
    54,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:11.704Z',
    '2025-09-28T07:07:36.999Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    323,
    'Special 1st Birthday Cakes',
    'special-1st-birthday-cakes',
    'High-quality 1st birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    429,
    NULL,
    0,
    'Birthday',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:12.236Z',
    '2025-09-28T07:07:37.023Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    324,
    'Premium Birthday Photo Cakes',
    'premium-birthday-photo-cakes',
    'High-quality birthday photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    365,
    NULL,
    0,
    'Birthday',
    45,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:12.769Z',
    '2025-09-28T07:07:37.046Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    325,
    'Deluxe Birthday Photo Cakes',
    'deluxe-birthday-photo-cakes',
    'High-quality birthday photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    248,
    NULL,
    0,
    'Birthday',
    49,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:13.306Z',
    '2025-09-28T07:07:37.082Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    326,
    'Special Birthday Photo Cakes',
    'special-birthday-photo-cakes',
    'High-quality birthday photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    498,
    NULL,
    0,
    'Birthday',
    44,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:13.857Z',
    '2025-09-28T07:07:37.127Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    327,
    'Premium Half Birthday Cakes',
    'premium-half-birthday-cakes',
    'High-quality half birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    489,
    NULL,
    0,
    'Birthday',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:14.391Z',
    '2025-09-28T07:07:37.175Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    328,
    'Deluxe Half Birthday Cakes',
    'deluxe-half-birthday-cakes',
    'High-quality half birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    285,
    NULL,
    0,
    'Birthday',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:14.941Z',
    '2025-09-28T07:07:37.210Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    329,
    'Special Half Birthday Cakes',
    'special-half-birthday-cakes',
    'High-quality half birthday cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    341,
    NULL,
    0,
    'Birthday',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:15.479Z',
    '2025-09-28T07:07:37.252Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    330,
    'Premium All Anniversary Cakes',
    'premium-all-anniversary-cakes',
    'High-quality all anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    580,
    NULL,
    0,
    'Anniversary',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:16.017Z',
    '2025-09-28T07:07:37.277Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    331,
    'Deluxe All Anniversary Cakes',
    'deluxe-all-anniversary-cakes',
    'High-quality all anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    470,
    NULL,
    0,
    'Anniversary',
    52,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:16.561Z',
    '2025-09-28T07:07:37.305Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    332,
    'Special All Anniversary Cakes',
    'special-all-anniversary-cakes',
    'High-quality all anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    435,
    NULL,
    0,
    'Anniversary',
    47,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:17.102Z',
    '2025-09-28T07:07:37.329Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    333,
    'Premium 1st Anniversary Cakes',
    'premium-1st-anniversary-cakes',
    'High-quality 1st anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    384,
    NULL,
    0,
    'Anniversary',
    27,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:17.640Z',
    '2025-09-28T07:07:37.357Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    334,
    'Deluxe 1st Anniversary Cakes',
    'deluxe-1st-anniversary-cakes',
    'High-quality 1st anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    253,
    NULL,
    0,
    'Anniversary',
    24,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:18.184Z',
    '2025-09-28T07:07:37.389Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    335,
    'Special 1st Anniversary Cakes',
    'special-1st-anniversary-cakes',
    'High-quality 1st anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    498,
    NULL,
    0,
    'Anniversary',
    11,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:18.727Z',
    '2025-09-28T07:07:37.438Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    336,
    'Premium 25th Anniversary Cakes',
    'premium-25th-anniversary-cakes',
    'High-quality 25th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    563,
    NULL,
    0,
    'Anniversary',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:19.279Z',
    '2025-09-28T07:07:37.472Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    337,
    'Deluxe 25th Anniversary Cakes',
    'deluxe-25th-anniversary-cakes',
    'High-quality 25th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    588,
    NULL,
    0,
    'Anniversary',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:19.824Z',
    '2025-09-28T07:07:37.509Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    338,
    'Special 25th Anniversary Cakes',
    'special-25th-anniversary-cakes',
    'High-quality 25th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    307,
    NULL,
    0,
    'Anniversary',
    47,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:20.358Z',
    '2025-09-28T07:07:37.558Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    339,
    'Premium Anniversary Cakes For Parents',
    'premium-anniversary-cakes-for-parents',
    'High-quality anniversary cakes for parents made with finest ingredients. Perfect for special occasions and celebrations.',
    208,
    NULL,
    0,
    'Anniversary',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:20.899Z',
    '2025-09-28T07:07:37.598Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    340,
    'Deluxe Anniversary Cakes For Parents',
    'deluxe-anniversary-cakes-for-parents',
    'High-quality anniversary cakes for parents made with finest ingredients. Perfect for special occasions and celebrations.',
    203,
    NULL,
    0,
    'Anniversary',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:21.452Z',
    '2025-09-28T07:07:37.664Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    341,
    'Special Anniversary Cakes For Parents',
    'special-anniversary-cakes-for-parents',
    'High-quality anniversary cakes for parents made with finest ingredients. Perfect for special occasions and celebrations.',
    484,
    NULL,
    0,
    'Anniversary',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:21.995Z',
    '2025-09-28T07:07:37.728Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    342,
    'Premium 5th Anniversary Cakes',
    'premium-5th-anniversary-cakes',
    'High-quality 5th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    596,
    NULL,
    0,
    'Anniversary',
    31,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:22.539Z',
    '2025-09-28T07:07:37.786Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    343,
    'Deluxe 5th Anniversary Cakes',
    'deluxe-5th-anniversary-cakes',
    'High-quality 5th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    585,
    NULL,
    0,
    'Anniversary',
    16,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:23.069Z',
    '2025-09-28T07:07:37.829Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    344,
    'Special 5th Anniversary Cakes',
    'special-5th-anniversary-cakes',
    'High-quality 5th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    363,
    NULL,
    0,
    'Anniversary',
    35,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:23.611Z',
    '2025-09-28T07:07:37.869Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    345,
    'Premium Anniversary Photo Cakes',
    'premium-anniversary-photo-cakes',
    'High-quality anniversary photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    307,
    NULL,
    0,
    'Anniversary',
    46,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:24.158Z',
    '2025-09-28T07:07:37.897Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    346,
    'Deluxe Anniversary Photo Cakes',
    'deluxe-anniversary-photo-cakes',
    'High-quality anniversary photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    593,
    NULL,
    0,
    'Anniversary',
    58,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:24.702Z',
    '2025-09-28T07:07:37.938Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    347,
    'Special Anniversary Photo Cakes',
    'special-anniversary-photo-cakes',
    'High-quality anniversary photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    390,
    NULL,
    0,
    'Anniversary',
    12,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:25.261Z',
    '2025-09-28T07:07:37.984Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    348,
    'Premium 10th Anniversary Cakes',
    'premium-10th-anniversary-cakes',
    'High-quality 10th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    285,
    NULL,
    0,
    'Anniversary',
    19,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:25.808Z',
    '2025-09-28T07:07:38.023Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    349,
    'Deluxe 10th Anniversary Cakes',
    'deluxe-10th-anniversary-cakes',
    'High-quality 10th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    380,
    NULL,
    0,
    'Anniversary',
    48,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:26.347Z',
    '2025-09-28T07:07:38.057Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    350,
    'Special 10th Anniversary Cakes',
    'special-10th-anniversary-cakes',
    'High-quality 10th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    278,
    NULL,
    0,
    'Anniversary',
    36,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:26.888Z',
    '2025-09-28T07:07:38.093Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    351,
    'Premium 50th Anniversary Cakes',
    'premium-50th-anniversary-cakes',
    'High-quality 50th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    464,
    NULL,
    0,
    'Anniversary',
    58,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:27.437Z',
    '2025-09-28T07:07:38.121Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    352,
    'Deluxe 50th Anniversary Cakes',
    'deluxe-50th-anniversary-cakes',
    'High-quality 50th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    328,
    NULL,
    0,
    'Anniversary',
    55,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:27.982Z',
    '2025-09-28T07:07:38.161Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    353,
    'Special 50th Anniversary Cakes',
    'special-50th-anniversary-cakes',
    'High-quality 50th anniversary cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    305,
    NULL,
    0,
    'Anniversary',
    32,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:28.517Z',
    '2025-09-28T07:07:38.193Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    354,
    'Premium Personalized Cakes',
    'premium-personalized-cakes',
    'High-quality personalized cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    471,
    NULL,
    0,
    'Customized Cakes',
    17,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:29.066Z',
    '2025-09-28T07:07:38.307Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    355,
    'Deluxe Personalized Cakes',
    'deluxe-personalized-cakes',
    'High-quality personalized cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    423,
    NULL,
    0,
    'Customized Cakes',
    14,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:29.604Z',
    '2025-09-28T07:07:38.348Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    356,
    'Special Personalized Cakes',
    'special-personalized-cakes',
    'High-quality personalized cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    404,
    NULL,
    0,
    'Customized Cakes',
    50,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:30.146Z',
    '2025-09-28T07:07:38.381Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    357,
    'Premium Custom Design Cakes',
    'premium-custom-design-cakes',
    'High-quality custom design cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    580,
    NULL,
    0,
    'Customized Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:30.692Z',
    '2025-09-28T07:07:38.411Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    358,
    'Deluxe Custom Design Cakes',
    'deluxe-custom-design-cakes',
    'High-quality custom design cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    530,
    NULL,
    0,
    'Customized Cakes',
    34,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:31.234Z',
    '2025-09-28T07:07:38.446Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    359,
    'Special Custom Design Cakes',
    'special-custom-design-cakes',
    'High-quality custom design cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    414,
    NULL,
    0,
    'Customized Cakes',
    51,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:31.787Z',
    '2025-09-28T07:07:38.478Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    360,
    'Premium Photo Cakes',
    'premium-photo-cakes',
    'High-quality photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    465,
    NULL,
    0,
    'Customized Cakes',
    18,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:32.334Z',
    '2025-09-28T07:07:38.510Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    361,
    'Deluxe Photo Cakes',
    'deluxe-photo-cakes',
    'High-quality photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    389,
    NULL,
    0,
    'Customized Cakes',
    45,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:32.868Z',
    '2025-09-28T07:07:38.539Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    362,
    'Special Photo Cakes',
    'special-photo-cakes',
    'High-quality photo cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    582,
    NULL,
    0,
    'Customized Cakes',
    52,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:33.411Z',
    '2025-09-28T07:07:38.568Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    363,
    'Premium Message Cakes',
    'premium-message-cakes',
    'High-quality message cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    226,
    NULL,
    0,
    'Customized Cakes',
    57,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:33.952Z',
    '2025-09-28T07:07:38.594Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    364,
    'Deluxe Message Cakes',
    'deluxe-message-cakes',
    'High-quality message cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    591,
    NULL,
    0,
    'Customized Cakes',
    25,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:34.484Z',
    '2025-09-28T07:07:38.626Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    365,
    'Special Message Cakes',
    'special-message-cakes',
    'High-quality message cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    251,
    NULL,
    0,
    'Customized Cakes',
    39,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:35.020Z',
    '2025-09-28T07:07:38.658Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    366,
    'Premium Shape Cakes',
    'premium-shape-cakes',
    'High-quality shape cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    447,
    NULL,
    0,
    'Customized Cakes',
    59,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:35.563Z',
    '2025-09-28T07:07:38.681Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    367,
    'Deluxe Shape Cakes',
    'deluxe-shape-cakes',
    'High-quality shape cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    282,
    NULL,
    0,
    'Customized Cakes',
    32,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:36.101Z',
    '2025-09-28T07:07:38.708Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    368,
    'Special Shape Cakes',
    'special-shape-cakes',
    'High-quality shape cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    537,
    NULL,
    0,
    'Customized Cakes',
    41,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:36.647Z',
    '2025-09-28T07:07:38.735Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    369,
    'Premium Theme Cakes',
    'premium-theme-cakes',
    'High-quality theme cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    259,
    NULL,
    0,
    'Customized Cakes',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:37.186Z',
    '2025-09-28T07:07:38.761Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    370,
    'Deluxe Theme Cakes',
    'deluxe-theme-cakes',
    'High-quality theme cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    591,
    NULL,
    0,
    'Customized Cakes',
    42,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:37.739Z',
    '2025-09-28T07:07:38.794Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    371,
    'Special Theme Cakes',
    'special-theme-cakes',
    'High-quality theme cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    460,
    NULL,
    0,
    'Customized Cakes',
    37,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:38.278Z',
    '2025-09-28T07:07:38.826Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    372,
    'Premium Special Occasion Cakes',
    'premium-special-occasion-cakes',
    'High-quality special occasion cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    565,
    NULL,
    0,
    'Customized Cakes',
    30,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:38.829Z',
    '2025-09-28T07:07:38.853Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    373,
    'Deluxe Special Occasion Cakes',
    'deluxe-special-occasion-cakes',
    'High-quality special occasion cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    582,
    NULL,
    0,
    'Customized Cakes',
    26,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:39.367Z',
    '2025-09-28T07:07:38.893Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    374,
    'Special Special Occasion Cakes',
    'special-special-occasion-cakes',
    'High-quality special occasion cakes made with finest ingredients. Perfect for special occasions and celebrations.',
    452,
    NULL,
    0,
    'Customized Cakes',
    24,
    '[]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-27T18:38:39.909Z',
    '2025-09-28T07:07:38.914Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    375,
    'kail product',
    'kail-product',
    'gtjtrjnjnernikrenikikre',
    67,
    456,
    85,
    'Birthday',
    1,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-28T03:55:48.041Z',
    '2025-09-28T07:07:38.962Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    376,
    'kail product',
    'kail-product',
    'gtjtrjnjnernikrenikikre',
    67,
    456,
    85,
    'Birthday',
    1,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-28T03:55:48.041Z',
    '2025-09-28T03:55:48.041Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    377,
    'kirthick cake',
    'kirthick-cake',
    '',
    45,
    456,
    90,
    'Birthday',
    55,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-28T10:53:07.175Z',
    '2025-09-28T10:53:07.175Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    378,
    'kirthick cake',
    'kirthick-cake',
    '',
    45,
    456,
    90,
    'Birthday',
    55,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-28T10:53:07.207Z',
    '2025-09-28T10:53:07.207Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    379,
    'jkcakes',
    'jkcakes',
    '',
    556,
    456,
    -22,
    'Cakes',
    5,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-28T10:54:29.277Z',
    '2025-09-28T10:54:29.277Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    380,
    'jkcakes',
    'jkcakes',
    '',
    556,
    456,
    -22,
    'Cakes',
    5,
    '["data:image/webp;base64,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"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-28T10:54:29.304Z',
    '2025-09-28T10:54:29.304Z'
  );
INSERT INTO products (
    id, name, slug, description, price, original_price, discount_percentage,
    category, stock, images, thumbnail, featured, is_active,
    average_rating, num_reviews, sold_count, created_at, updated_at
  ) VALUES (
    381,
    'Test Product 124158',
    'test-product-124158',
    'Test product for verification',
    100,
    NULL,
    0,
    'cat_001',
    10,
    '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop"]',
    NULL,
    0,
    1,
    0,
    0,
    0,
    '2025-09-29T07:11:58.410Z',
    '2025-09-29T07:11:58.410Z'
  );

-- ============================================================
-- ORDERS (68 records)
-- ============================================================
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    1,
    5,
    'TRK17602158563510',
    'pending',
    99999,
    17999.82,
    200,
    118198.82,
    'INR',
    '2025-08-15T11:18:14.000Z',
    '2025-08-31T08:36:47.959Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    2,
    3,
    'TRK17602158563511',
    'processing',
    149998,
    26999.64,
    200,
    177197.64,
    'INR',
    '2025-08-15T11:18:14.001Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    3,
    4,
    'TRK17602158563512',
    'delivered',
    25998,
    4679.64,
    200,
    30877.64,
    'INR',
    '2025-08-15T11:18:14.002Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    4,
    4,
    'TRKMEFMAV5X9TGVH',
    'pending',
    999,
    179.82,
    100,
    1278.82,
    'INR',
    '2025-08-17T11:43:33.965Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    5,
    4,
    'TRKMEFN6JA8B8KNB',
    'pending',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-17T12:08:11.553Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    6,
    3,
    'TRKMEFNZU5UXPV4W',
    'pending',
    999,
    179.82,
    100,
    1278.82,
    'INR',
    '2025-08-17T12:30:58.675Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    7,
    5,
    'TRKMEFO1CV8G8U9E',
    'processing',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-17T12:32:09.573Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    8,
    3,
    'TRKMEFO35ENQTHYI',
    'processing',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-17T12:33:33.216Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    9,
    3,
    'TRKMEFO63F4U0VLD',
    'pending',
    999,
    179.82,
    100,
    1278.82,
    'INR',
    '2025-08-17T12:35:50.608Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    10,
    4,
    'TRKMEFO6AA7T4WOM',
    'processing',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-17T12:35:59.504Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    11,
    5,
    'TRKMEFO6ZAPZS6TH',
    'processing',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-17T12:36:31.922Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    12,
    4,
    'TRKMEFQ8BCX76KJX',
    'pending',
    100,
    18,
    0,
    118,
    'INR',
    '2025-08-17T13:33:33.446Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    13,
    3,
    'TRKMEG2JNITO6F78',
    'pending',
    100,
    18,
    0,
    118,
    'INR',
    '2025-08-17T19:18:17.817Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    14,
    5,
    'TRKMEG2TYOEONRLT',
    'pending',
    299,
    54,
    0,
    353,
    'INR',
    '2025-08-17T19:26:18.835Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    15,
    5,
    'TRKMEGJ2AEIL923Y',
    'pending',
    13391,
    2410.38,
    0,
    15801.380000000001,
    'INR',
    '2025-08-18T03:00:41.135Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    16,
    5,
    'TRKMEGJBXBVDWAOH',
    'processing',
    249,
    44.82,
    0,
    293.82,
    'INR',
    '2025-08-18T03:08:10.749Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    17,
    3,
    'TRKMEGJJPRZHQP8B',
    'processing',
    598,
    107.64,
    0,
    705.64,
    'INR',
    '2025-08-18T03:14:14.208Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    18,
    5,
    'TRKMEGK5CUP8ZUO2',
    'processing',
    299,
    53.82,
    0,
    352.82,
    'INR',
    '2025-08-18T03:31:03.891Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    19,
    4,
    'TRKMEHDG1B73ABHT',
    'pending',
    4994,
    898.92,
    0,
    5892.92,
    'INR',
    '2025-08-18T17:11:11.015Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    20,
    5,
    'TRKMEHWJ3GGGNP13',
    'pending',
    1598,
    287.64,
    0,
    1885.6399999999999,
    'INR',
    '2025-08-19T02:05:26.472Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    21,
    3,
    'TRKMEHXT3M2D8FU3',
    'processing',
    1598,
    287.64,
    0,
    1885.6399999999999,
    'INR',
    '2025-08-19T02:41:12.847Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    22,
    4,
    'TRKMEHY6XNCFP06S',
    'pending',
    1098,
    197.64,
    0,
    1295.6399999999999,
    'INR',
    '2025-08-19T02:51:58.299Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    23,
    3,
    'TRKMEJAZXM12ETUQ',
    'pending',
    1598,
    287.64,
    0,
    1885.6399999999999,
    'INR',
    '2025-08-20T01:38:12.848Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    24,
    5,
    'TRKMEJCI9JGFPFEH',
    'pending',
    1598,
    287.64,
    0,
    1885.6399999999999,
    'INR',
    '2025-08-20T02:20:27.726Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    25,
    5,
    'TRKMEK8J48YMVXZW',
    'pending',
    4295,
    773.1,
    0,
    5068.1,
    'INR',
    '2025-08-20T17:16:55.238Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    26,
    3,
    'TRKMEK8QXNEUZGTG',
    'pending',
    1598,
    287.64,
    0,
    1885.6399999999999,
    'INR',
    '2025-08-20T17:22:59.932Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    27,
    3,
    'TRKMEKVE3Q442HQW',
    'pending',
    1196,
    215.28,
    0,
    1411.28,
    'INR',
    '2025-08-21T03:56:52.450Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    28,
    5,
    'TRKMEKVMMUOKP0A2',
    'pending',
    598,
    107.64,
    100,
    805.64,
    'INR',
    '2025-08-21T04:03:30.484Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    29,
    4,
    'TRKMELV898EBEH0X',
    'pending',
    9889,
    1780.02,
    0,
    11669.02,
    'INR',
    '2025-08-21T20:40:05.826Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    30,
    3,
    'TRKMELY5S36UU86H',
    'pending',
    2396,
    431.28,
    0,
    2827.2799999999997,
    'INR',
    '2025-08-21T22:02:09.150Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    31,
    5,
    'TRKMELY7SB1YF31K',
    'pending',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-21T22:03:42.736Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    32,
    3,
    'TRKMELYJBYP3NT56',
    'pending',
    1198,
    215.64,
    0,
    1413.6399999999999,
    'INR',
    '2025-08-21T22:12:41.427Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    33,
    5,
    'TRKMEM9VBVCPICYQ',
    'pending',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-08-22T03:29:56.959Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    34,
    4,
    'TRKMEN075HESPK1C',
    'pending',
    1497,
    269.46,
    0,
    1766.46,
    'INR',
    '2025-08-22T15:46:58.570Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    35,
    4,
    'TRKMENTRMMSDXGVO',
    'delivered',
    3290,
    592.1999999999999,
    0,
    3882.2,
    'INR',
    '2025-08-23T05:34:42.776Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    36,
    3,
    'TRKMESW3S9VKZTCK',
    'pending',
    1397,
    251.45999999999998,
    0,
    1648.46,
    'INR',
    '2025-08-26T18:39:00.078Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    37,
    4,
    'TRKMESXMG22WW50K',
    'pending',
    299,
    53.82,
    0,
    352.82,
    'INR',
    '2025-08-26T19:21:30.319Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    38,
    4,
    'TRKMETPFAIWUE71Q',
    'pending',
    597,
    107.46,
    100,
    804.46,
    'INR',
    '2025-08-27T08:19:45.802Z',
    '2025-08-31T06:03:53.604Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    39,
    4,
    'TRKMETTVMSCFPK5H',
    'delivered',
    997,
    179.45999999999998,
    100,
    1276.46,
    'INR',
    '2025-08-27T10:24:26.654Z',
    '2025-08-31T10:13:27.982Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    40,
    3,
    'TRKMEU1K92IYADPD',
    'delivered',
    3593,
    646.74,
    0,
    4239.74,
    'INR',
    '2025-08-27T13:59:32.591Z',
    '2025-08-31T08:55:38.893Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    41,
    1,
    'TRKMEZGOEDF7VBJO',
    'shipped',
    1596,
    287.28,
    0,
    1883.28,
    'INR',
    '2025-08-31T09:01:31.211Z',
    '2025-08-31T10:41:29.701Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    42,
    7,
    'TRKMF00LU0WSQBI9',
    'pending',
    1098,
    197.64,
    0,
    1295.6399999999999,
    'INR',
    '2025-08-31T18:19:23.849Z',
    '2025-08-31T18:19:23.849Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    43,
    7,
    'TRKMF00MXYBDITB2',
    'pending',
    399,
    71.82,
    100,
    570.8199999999999,
    'INR',
    '2025-08-31T18:20:15.600Z',
    '2025-08-31T18:20:15.600Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    44,
    7,
    'TRKMF00NUVF6RPKA',
    'shipped',
    399,
    71.82,
    100,
    570.8199999999999,
    'INR',
    '2025-08-31T18:20:58.258Z',
    '2025-08-31T18:22:53.214Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    45,
    1,
    'TRKMF0KFTX0GSA6Z',
    'delivered',
    348,
    62.64,
    100,
    510.64,
    'INR',
    '2025-09-01T03:34:36.095Z',
    '2025-09-01T16:31:43.806Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    46,
    1,
    'TRKMF1B6CJ6QG8US',
    'shipped',
    548,
    98.64,
    100,
    746.64,
    'INR',
    '2025-09-01T16:03:03.289Z',
    '2025-09-01T16:31:49.581Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    47,
    1,
    'TRKMF1BJTI68DSAW',
    'shipped',
    598,
    107.64,
    100,
    805.64,
    'INR',
    '2025-09-01T16:13:31.809Z',
    '2025-09-01T16:31:54.761Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    48,
    1,
    'TRKMF1BSUSBZAUVC',
    'pending',
    1198,
    215.64,
    0,
    1413.6399999999999,
    'INR',
    '2025-09-01T16:20:33.373Z',
    '2025-09-01T16:20:33.373Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    49,
    1,
    'TRKMF1BVAJ5URHZ0',
    'pending',
    199,
    35.82,
    100,
    334.82,
    'INR',
    '2025-09-01T16:22:27.092Z',
    '2025-09-01T16:22:27.092Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    50,
    1,
    'TRKMF1BX9QI02M17',
    'pending',
    1497,
    269.46,
    0,
    1766.46,
    'INR',
    '2025-09-01T16:23:59.372Z',
    '2025-09-01T16:23:59.372Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    51,
    7,
    'TRKMF3G8IIHD0E15',
    'pending',
    1297,
    233.45999999999998,
    0,
    1530.46,
    'INR',
    '2025-09-03T04:00:14.782Z',
    '2025-09-03T04:00:14.782Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    52,
    1,
    'TRKMF3HTV01CQ21E',
    'pending',
    199,
    35.82,
    100,
    334.82,
    'INR',
    '2025-09-03T04:44:50.376Z',
    '2025-09-03T04:44:50.376Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    53,
    7,
    'TRKMF5TBYM8J6W5Z',
    'pending',
    2395,
    431.09999999999997,
    0,
    2826.1,
    'INR',
    '2025-09-04T19:42:22.980Z',
    '2025-09-04T19:42:22.980Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    54,
    7,
    'TRKMF67A3BR50HL7',
    'shipped',
    6386,
    1149.48,
    0,
    7535.48,
    'INR',
    '2025-09-05T02:12:50.395Z',
    '2025-09-05T04:40:11.520Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    55,
    7,
    'TRKMF77W2EUUJENH',
    'shipped',
    598,
    107.64,
    100,
    805.64,
    'INR',
    '2025-09-05T19:17:41.831Z',
    '2025-09-07T08:55:01.191Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    56,
    1,
    'TRKMF9D3711HEIER',
    'processing',
    3592,
    646.56,
    0,
    4238.5599999999995,
    'INR',
    '2025-09-07T07:18:44.825Z',
    '2025-09-07T07:19:55.724Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    57,
    8,
    'TRKMF9DG2I5V8H7I',
    'processing',
    4991,
    898.38,
    0,
    5889.38,
    'INR',
    '2025-09-07T07:28:45.491Z',
    '2025-09-07T15:23:15.684Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    58,
    7,
    'TRKMF9I60RP1K7W7',
    'delivered',
    1992,
    358.56,
    0,
    2350.56,
    'INR',
    '2025-09-07T09:40:54.805Z',
    '2025-09-23T07:09:21.909Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    59,
    1,
    'TRKMFJKCN93W9CZY',
    'pending',
    1766.46,
    317.9628,
    0,
    2084.4228000000003,
    'INR',
    '2025-09-14T10:39:44.834Z',
    '2025-09-14T10:39:44.835Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    60,
    1,
    'TRKMFJKDLG590SAX',
    'confirmed',
    1766.46,
    317.9628,
    0,
    2084.4228000000003,
    'INR',
    '2025-09-14T10:40:29.145Z',
    '2025-09-14T10:40:29.160Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    61,
    10,
    'TRKMFY286ZSX7D8E',
    'pending',
    3296,
    593.28,
    0,
    3889.2799999999997,
    'INR',
    '2025-09-24T14:08:56.687Z',
    '2025-09-24T14:08:56.687Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    62,
    10,
    'TRKMFY2CM9XRV5LD',
    'shipped',
    3296,
    593.28,
    0,
    3889.2799999999997,
    'INR',
    '2025-09-24T14:12:23.115Z',
    '2025-09-24T14:35:34.456Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    63,
    11,
    'TRKMG2EY8NYLTGGN',
    'delivered',
    1899,
    341.82,
    0,
    2240.82,
    'INR',
    '2025-09-27T15:16:12.001Z',
    '2025-09-27T15:21:10.743Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    64,
    1,
    'TRKMG3FGB7YMDRZD',
    'pending',
    899,
    161.82,
    100,
    1160.82,
    'INR',
    '2025-09-28T08:18:01.297Z',
    '2025-09-28T08:18:01.297Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    65,
    7,
    'TRKMG3G8WF7A2SJQ',
    'pending',
    1899,
    341.82,
    0,
    2240.82,
    'INR',
    '2025-09-28T08:40:15.141Z',
    '2025-09-28T08:40:15.141Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    66,
    7,
    'TRKMG3GKBD6D9L2G',
    'pending',
    249,
    44.82,
    100,
    393.82,
    'INR',
    '2025-09-28T08:49:07.726Z',
    '2025-09-28T08:49:07.726Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    67,
    7,
    'TRKMG3GTR1OQ55YA',
    'processing',
    299,
    53.82,
    100,
    452.82,
    'INR',
    '2025-09-28T08:56:27.952Z',
    '2025-09-29T06:50:57.698Z'
  );
INSERT INTO orders (
    id, user_id, tracking_number, status, items_price, tax_price,
    shipping_price, total_price, currency, created_at, updated_at
  ) VALUES (
    68,
    15,
    'TRKMG4YRQJE9CVK9',
    'pending',
    1899,
    341.82,
    0,
    2240.82,
    'INR',
    '2025-09-29T10:06:33.244Z',
    '2025-09-29T10:06:33.244Z'
  );

-- ============================================================
-- BANNERS (1 records)
-- ============================================================
INSERT INTO banners (
      title, subtitle, image_url, link, button_text, is_active,
      sort_order, created_at, updated_at
    ) VALUES (
      '.',
      NULL,
      NULL,
      NULL,
      NULL,
      1,
      0,
      '2025-09-26T18:38:24.567Z',
      '2025-09-29T07:15:06.198Z'
    );

SET FOREIGN_KEY_CHECKS=1;
