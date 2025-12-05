-- RUN THIS IN PHPMYADMIN TO FIX THE DATABASE
-- Copy and paste this entire file into phpMyAdmin SQL tab

-- First, check current structure
DESCRIBE `offer_popups`;

-- Now add missing columns one by one
-- If you get "Duplicate column" error, that column already exists - IGNORE the error and continue

-- Add trigger_type
ALTER TABLE `offer_popups`
ADD COLUMN `trigger_type` VARCHAR(50) DEFAULT 'page_load';

-- Add show_on_pages
ALTER TABLE `offer_popups`
ADD COLUMN `show_on_pages` JSON DEFAULT NULL;

-- Add show_delay
ALTER TABLE `offer_popups`
ADD COLUMN `show_delay` INT DEFAULT 2000;

-- Add max_shows_per_session
ALTER TABLE `offer_popups`
ADD COLUMN `max_shows_per_session` INT DEFAULT 1;

-- Verify all columns are now present
DESCRIBE `offer_popups`;

-- You should see these columns at the end:
-- trigger_type
-- show_on_pages
-- show_delay
-- max_shows_per_session
