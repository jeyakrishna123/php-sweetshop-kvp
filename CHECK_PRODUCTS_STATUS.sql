-- Check the is_active status of your wishlist products
-- Run this in phpMyAdmin to see what's wrong

SELECT
    id,
    name,
    price,
    is_active,
    stock,
    CASE
        WHEN is_active = 1 THEN '✅ ACTIVE - Will show in wishlist'
        WHEN is_active = 0 THEN '❌ INACTIVE - This is the problem!'
        ELSE '⚠️ Unknown status'
    END as status_explanation
FROM products
WHERE id IN (8, 10, 12, 13, 14)
ORDER BY id;
