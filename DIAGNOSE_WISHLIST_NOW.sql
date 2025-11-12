-- ============================================================
-- DIAGNOSE WISHLIST ISSUE - Run this in phpMyAdmin RIGHT NOW
-- ============================================================

-- Step 1: Check what's wrong with your wishlist products
SELECT
    w.id as 'Wishlist ID',
    w.product_id as 'Product ID',
    p.name as 'Product Name',
    p.is_active as 'Is Active (0=PROBLEM, 1=OK)',
    p.price as 'Price',
    CASE
        WHEN p.id IS NULL THEN '❌ PRODUCT MISSING FROM DATABASE'
        WHEN p.is_active = 0 THEN '🚨 INACTIVE - THIS IS THE PROBLEM!'
        WHEN p.is_active = 1 THEN '✅ ACTIVE - Should work'
        ELSE '❓ Unknown'
    END as 'Problem Diagnosis'
FROM wishlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1
ORDER BY w.id;

-- ============================================================
-- If you see "INACTIVE" above, run this fix:
-- ============================================================

-- FIX: Activate all wishlist products
UPDATE products
SET is_active = 1
WHERE id IN (8, 10, 12, 13, 14);

-- ============================================================
-- Verify the fix worked:
-- ============================================================

SELECT
    id,
    name,
    is_active,
    price,
    CASE
        WHEN is_active = 1 THEN '✅ NOW ACTIVE - Wishlist will work!'
        ELSE '❌ Still inactive'
    END as 'Status After Fix'
FROM products
WHERE id IN (8, 10, 12, 13, 14);

-- ============================================================
-- Expected result: All 5 products should show is_active = 1
-- Then refresh: https://skbakers.com/wishlist
-- ============================================================
