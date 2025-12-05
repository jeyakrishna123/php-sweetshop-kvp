-- Fix offer_popups table structure
-- This adds the missing image_url column

-- Check if column exists and add if missing
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(500) DEFAULT NULL AFTER `description`;

-- Also ensure all other required columns exist
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `coupon_code` VARCHAR(50) DEFAULT NULL AFTER `image_url`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `discount_percentage` DECIMAL(5,2) DEFAULT NULL AFTER `coupon_code`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `button_text` VARCHAR(50) DEFAULT 'Shop Now' AFTER `discount_percentage`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `button_link` VARCHAR(500) DEFAULT NULL AFTER `button_text`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) DEFAULT 1 AFTER `button_link`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `show_on_homepage` TINYINT(1) DEFAULT 1 AFTER `is_active`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `start_date` DATETIME DEFAULT NULL AFTER `show_on_homepage`;

ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `end_date` DATETIME DEFAULT NULL AFTER `start_date`;

-- Show current table structure
DESCRIBE `offer_popups`;
