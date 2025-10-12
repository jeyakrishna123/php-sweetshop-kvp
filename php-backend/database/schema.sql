-- ================================================================
-- SK Bakers E-Commerce Database Schema for MySQL
-- Compatible with Hostinger shared hosting
-- ================================================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ================================================================
-- Users Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(10) DEFAULT NULL,
  `avatar` VARCHAR(500) DEFAULT NULL,
  `role` ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
  `is_active` TINYINT(1) DEFAULT 1,
  `is_email_verified` TINYINT(1) DEFAULT 0,
  `email_verification_token` VARCHAR(255) DEFAULT NULL,
  `email_verification_expires` DATETIME DEFAULT NULL,
  `password_reset_token` VARCHAR(255) DEFAULT NULL,
  `password_reset_expires` DATETIME DEFAULT NULL,
  `last_login` DATETIME DEFAULT NULL,
  `login_attempts` INT DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `newsletter` TINYINT(1) DEFAULT 1,
  `marketing` TINYINT(1) DEFAULT 0,
  `notifications_email` TINYINT(1) DEFAULT 1,
  `notifications_sms` TINYINT(1) DEFAULT 0,
  `notifications_push` TINYINT(1) DEFAULT 1,
  `currency` VARCHAR(3) DEFAULT 'INR',
  `language` VARCHAR(2) DEFAULT 'en',
  `total_orders` INT DEFAULT 0,
  `total_spent` DECIMAL(10,2) DEFAULT 0.00,
  `last_order_date` DATETIME DEFAULT NULL,
  `wishlist_count` INT DEFAULT 0,
  `review_count` INT DEFAULT 0,
  `google_id` VARCHAR(255) DEFAULT NULL,
  `google_email` VARCHAR(255) DEFAULT NULL,
  `facebook_id` VARCHAR(255) DEFAULT NULL,
  `facebook_email` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_google_id` (`google_id`),
  INDEX `idx_facebook_id` (`facebook_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Addresses Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `type` ENUM('home', 'work', 'other') DEFAULT 'home',
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `is_default` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Categories Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `image` VARCHAR(500) NOT NULL,
  `icon` VARCHAR(50) DEFAULT '📦',
  `parent_id` INT UNSIGNED DEFAULT NULL,
  `level` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `featured` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `seo_title` VARCHAR(60) DEFAULT NULL,
  `seo_description` VARCHAR(160) DEFAULT NULL,
  `seo_keywords` TEXT,
  `product_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_featured` (`featured`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Products Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `discount_percentage` DECIMAL(5,2) DEFAULT 0,
  `category` VARCHAR(50) NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `cake_flavor` VARCHAR(50) DEFAULT NULL,
  `product_types` JSON DEFAULT NULL,
  `is_new` TINYINT(1) DEFAULT 0,
  `brand` VARCHAR(50) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `images` JSON NOT NULL,
  `thumbnail` VARCHAR(500) NOT NULL,
  `specifications` JSON DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `sku` VARCHAR(50) UNIQUE DEFAULT NULL,
  `weight` DECIMAL(10,2) DEFAULT NULL,
  `has_weight_options` TINYINT(1) DEFAULT 0,
  `weight_options` JSON DEFAULT NULL,
  `length` DECIMAL(10,2) DEFAULT NULL,
  `width` DECIMAL(10,2) DEFAULT NULL,
  `height` DECIMAL(10,2) DEFAULT NULL,
  `average_rating` DECIMAL(3,2) DEFAULT 0.00,
  `num_reviews` INT DEFAULT 0,
  `sold_count` INT DEFAULT 0,
  `view_count` INT DEFAULT 0,
  `seo_title` VARCHAR(60) DEFAULT NULL,
  `seo_description` VARCHAR(160) DEFAULT NULL,
  `seo_keywords` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FULLTEXT `idx_search` (`name`, `description`),
  INDEX `idx_category` (`category`),
  INDEX `idx_cake_flavor` (`cake_flavor`),
  INDEX `idx_is_new` (`is_new`),
  INDEX `idx_featured` (`featured`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_price` (`price`),
  INDEX `idx_average_rating` (`average_rating`),
  INDEX `idx_sold_count` (`sold_count`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Reviews Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Orders Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `tracking_number` VARCHAR(50) UNIQUE NOT NULL,
  `status` ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  `items_price` DECIMAL(10,2) NOT NULL,
  `tax_price` DECIMAL(10,2) DEFAULT 0.00,
  `shipping_price` DECIMAL(10,2) DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `total_price` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'INR',
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `coupon_discount` DECIMAL(10,2) DEFAULT 0.00,
  `coupon_type` ENUM('percentage', 'fixed') DEFAULT NULL,
  `customer_notes` TEXT,
  `admin_notes` TEXT,
  `estimated_delivery` DATE DEFAULT NULL,
  `actual_delivery` DATETIME DEFAULT NULL,
  `shipping_method` ENUM('standard', 'express', 'overnight') DEFAULT 'standard',
  `shipping_carrier` VARCHAR(100) DEFAULT NULL,
  `shipping_tracking_url` VARCHAR(500) DEFAULT NULL,
  `is_gift` TINYINT(1) DEFAULT 0,
  `gift_message` TEXT,
  `is_cancelled` TINYINT(1) DEFAULT 0,
  `cancellation_reason` TEXT,
  `cancelled_by` INT UNSIGNED DEFAULT NULL,
  `cancellation_date` DATETIME DEFAULT NULL,
  `refund_amount` DECIMAL(10,2) DEFAULT 0.00,
  `refund_reason` TEXT,
  `refund_date` DATETIME DEFAULT NULL,
  `refunded_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_tracking_number` (`tracking_number`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Order Items Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL CHECK (`quantity` >= 1),
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `image` VARCHAR(500) NOT NULL,
  `sku` VARCHAR(50) DEFAULT NULL,
  `weight` DECIMAL(10,2) DEFAULT NULL,
  `length` DECIMAL(10,2) DEFAULT NULL,
  `width` DECIMAL(10,2) DEFAULT NULL,
  `height` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Shipping Addresses Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `shipping_addresses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Payment Info Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `payment_info` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL UNIQUE,
  `payment_id` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `method` ENUM('stripe', 'cod', 'razorpay', 'paypal') NOT NULL,
  `transaction_id` VARCHAR(255) DEFAULT NULL,
  `payment_date` DATETIME DEFAULT NULL,
  `refund_amount` DECIMAL(10,2) DEFAULT 0.00,
  `refund_reason` TEXT,
  `refund_date` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Order Status History Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `note` TEXT,
  `updated_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Wishlist Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_wishlist` (`user_id`, `product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Banners Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `subtitle` TEXT,
  `image_url` VARCHAR(500) NOT NULL,
  `mobile_image_url` VARCHAR(500) DEFAULT NULL,
  `desktop_image_url` VARCHAR(500) DEFAULT NULL,
  `link` VARCHAR(500) DEFAULT NULL,
  `button_text` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `start_date` DATETIME DEFAULT NULL,
  `end_date` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Offer Popups Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `offer_popups` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `discount_percentage` DECIMAL(5,2) DEFAULT NULL,
  `button_text` VARCHAR(50) DEFAULT 'Shop Now',
  `button_link` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `show_on_homepage` TINYINT(1) DEFAULT 1,
  `start_date` DATETIME DEFAULT NULL,
  `end_date` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Coupons Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `type` ENUM('percentage', 'fixed') NOT NULL,
  `value` DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount` DECIMAL(10,2) DEFAULT NULL,
  `usage_limit` INT DEFAULT NULL,
  `usage_count` INT DEFAULT 0,
  `user_limit` INT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `start_date` DATETIME DEFAULT NULL,
  `end_date` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Weight Options Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `weight_options` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `weight` VARCHAR(50) NOT NULL UNIQUE,
  `label` VARCHAR(100) NOT NULL,
  `price_multiplier` DECIMAL(5,2) DEFAULT 1.00,
  `serving_size` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Analytics Table
-- ================================================================
CREATE TABLE IF NOT EXISTS `analytics` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL,
  `event_data` JSON DEFAULT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `session_id` VARCHAR(100) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Insert Default Admin User (password: admin123456)
-- ================================================================
INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_email_verified`)
VALUES ('Admin', 'admin@skbakers.com', '$2y$12$ZBIXh9CyVOS5Uq4wG7YMmegrnQRDDQtP6g4k7EVZmVAH6hdtA1WPC', 'admin', 1)
ON DUPLICATE KEY UPDATE `email`=`email`;

-- ================================================================
-- End of Schema
-- ================================================================
