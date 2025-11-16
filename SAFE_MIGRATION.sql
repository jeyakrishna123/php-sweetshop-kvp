-- Safe migration script - adds only missing columns
-- Run these one by one in phpMyAdmin

-- Add image_url if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(500) DEFAULT NULL AFTER `description`;

-- Add coupon_code if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `coupon_code` VARCHAR(50) DEFAULT NULL;

-- Add discount_percentage if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `discount_percentage` DECIMAL(5,2) DEFAULT NULL;

-- Add button_text if not exists (this one already exists, skip it)
-- ALTER TABLE `offer_popups`
-- ADD COLUMN IF NOT EXISTS `button_text` VARCHAR(50) DEFAULT 'Shop Now';

-- Add button_link if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `button_link` VARCHAR(500) DEFAULT NULL;

-- Add is_active if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) DEFAULT 1;

-- Add show_on_homepage if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `show_on_homepage` TINYINT(1) DEFAULT 1;

-- Add start_date if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `start_date` DATETIME DEFAULT NULL;

-- Add end_date if not exists
ALTER TABLE `offer_popups`
ADD COLUMN IF NOT EXISTS `end_date` DATETIME DEFAULT NULL;

-- Check final structure
DESCRIBE `offer_popups`;
