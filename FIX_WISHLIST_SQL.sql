-- ============================================================
-- WISHLIST FIX - Activate Products in Wishlist
-- Run this in phpMyAdmin SQL tab
-- Database: u707629033_skbakers
-- ============================================================

-- Step 1: Check current status of wishlist products
SELECT
    w.id as wishlist_id,
    w.product_id,
    p.name as product_name,
    p.is_active,
    p.price,
    CASE
        WHEN p.id IS NULL THEN '❌ Product Missing'
        WHEN p.is_active = 0 THEN '⚠️ Inactive (needs activation)'
        WHEN p.is_active = 1 THEN '✅ Active'
    END as status
FROM wishlist w
LEFT JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1
ORDER BY w.created_at DESC;

-- Step 2: Activate all products that are in wishlists
-- This makes them visible in the wishlist page
UPDATE products p
INNER JOIN wishlist w ON p.id = w.product_id
SET p.is_active = 1
WHERE p.is_active = 0;

-- Step 3: Verify the fix - check if products are now active
SELECT
    w.id as wishlist_id,
    w.product_id,
    p.name as product_name,
    p.is_active,
    p.price,
    '✅ Now Active' as status
FROM wishlist w
INNER JOIN products p ON w.product_id = p.id
WHERE w.user_id = 1
ORDER BY w.created_at DESC;

-- ============================================================
-- Expected Result:
-- All products (8, 10, 12, 13, 14) should now have is_active = 1
-- Visit https://skbakers.com/wishlist - should show 5 products
-- ============================================================
