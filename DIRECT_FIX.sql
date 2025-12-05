-- Direct SQL Fix for Dashboard Showing 0 Products
-- This sets all products to active (is_active = 1)

UPDATE products SET is_active = 1;

-- Verify the fix
SELECT
    COUNT(*) as total_products,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products,
    SUM(CASE WHEN is_active = 0 OR is_active IS NULL THEN 1 ELSE 0 END) as inactive_products
FROM products;
