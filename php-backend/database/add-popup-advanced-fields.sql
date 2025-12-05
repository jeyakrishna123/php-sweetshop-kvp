-- Database Migration: Add Advanced Popup Fields
-- Run this in phpMyAdmin for production database

-- Add trigger_type field (page_load or click_specific_pages)
ALTER TABLE `offer_popups`
ADD COLUMN `trigger_type` VARCHAR(50) DEFAULT 'page_load' AFTER `show_on_homepage`;

-- Add show_on_pages field (JSON array of page names)
ALTER TABLE `offer_popups`
ADD COLUMN `show_on_pages` JSON DEFAULT NULL AFTER `trigger_type`;

-- Add show_delay field (milliseconds delay before showing)
ALTER TABLE `offer_popups`
ADD COLUMN `show_delay` INT DEFAULT 2000 AFTER `show_on_pages`;

-- Add max_shows_per_session field (how many times to show per session)
ALTER TABLE `offer_popups`
ADD COLUMN `max_shows_per_session` INT DEFAULT 1 AFTER `show_delay`;

-- Verify new structure
DESCRIBE `offer_popups`;
