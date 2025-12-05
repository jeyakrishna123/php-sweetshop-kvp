-- Fix order_items table to allow NULL for image column
-- This allows orders to be created even if product images are missing

ALTER TABLE order_items MODIFY COLUMN image VARCHAR(500) NULL;

-- Verify the change
DESCRIBE order_items;
