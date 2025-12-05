-- ============================================================
-- FIX PRODUCT 12 - Your Wishlist Product
-- Run this in phpMyAdmin SQL tab
-- ============================================================

-- Step 1: Check product 12 status
SELECT
    p.id,
    p.name,
    p.price,
    p.is_active,
    CASE
        WHEN p.is_active = 0 THEN '🚨 INACTIVE - This is why it does not show!'
        WHEN p.is_active = 1 THEN '✅ Active - Should work'
        WHEN p.id IS NULL THEN '❌ Product does not exist'
    END as 'Problem'
FROM products p
WHERE p.id = 12;

-- Step 2: FIX - Activate product 12
UPDATE products
SET is_active = 1
WHERE id = 12;

-- Step 3: Verify wishlist will now work
SELECT
    w.product_id,
    p.name,
    p.is_active,
    p.price,
    '✅ Should now appear in wishlist!' as status
FROM wishlist w
INNER JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1 AND p.is_active = 1;

-- ============================================================
-- Expected Result:
-- - Product 12 (blue cake) is_active = 1
-- - Wishlist query returns 1 product
-- - Visit https://skbakers.com/wishlist shows 1 product
-- ============================================================
