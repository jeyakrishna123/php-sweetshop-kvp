# Wishlist End-to-End Test Plan

## Test Environment
- **Backend:** `hostinger_upload/backend/api/wishlist.php`
- **Frontend:** `fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend/src/pages/Wishlist.jsx`
- **Database:** MySQL (wishlist table with 3 items: product_id 24, 23, 22)

---

## Test Flow Overview

```
1. Backend API Tests
   ├── GET /api/wishlist
   ├── POST /api/wishlist/add
   ├── DELETE /api/wishlist/remove/{id}
   ├── DELETE /api/wishlist/clear
   └── GET /api/wishlist/check/{id}

2. Frontend Component Tests
   ├── Wishlist Page Load
   ├── Data Display
   ├── Add to Wishlist
   ├── Remove from Wishlist
   └── Clear Wishlist

3. Integration Tests
   ├── Add → View → Remove Flow
   ├── Unavailable Products Display
   └── Error Handling
```

---

## Test Cases

### 1. Backend API Tests

#### Test 1.1: GET /api/wishlist
**Expected Response:**
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "data": {
    "wishlist": [
      {
        "id": 19,
        "product_id": 24,
        "name": "Product Name or 'Product Unavailable'",
        "is_unavailable": true/false,
        ...
      }
    ],
    "count": 3
  }
}
```

#### Test 1.2: POST /api/wishlist/add
**Request:**
```json
{
  "productId": 25
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": {
    "wishlist_item": {
      "id": 22,
      "product_id": 25,
      "product_name": "Product Name"
    }
  }
}
```

#### Test 1.3: DELETE /api/wishlist/remove/{id}
**Expected Response:**
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

### 2. Frontend Component Tests

#### Test 2.1: Wishlist Page Load
- Navigate to `/wishlist`
- Should show loading spinner
- Should fetch data from API
- Should display all items

#### Test 2.2: Data Display
- Should show all 3 items from database
- Should display product images (or placeholder)
- Should show product names
- Should show prices
- Should show ratings
- Should show stock status

#### Test 2.3: Unavailable Products
- Products 24, 23, 22 should display
- If products don't exist, show "Product Unavailable"
- Should show yellow warning badge
- Buttons should be disabled

### 3. Integration Tests

#### Test 3.1: Complete Flow
1. Add product to wishlist from product page
2. Navigate to wishlist page
3. Verify product appears
4. Remove product from wishlist
5. Verify product disappears

---

## Manual Test Checklist

- [ ] Backend API returns correct data structure
- [ ] Frontend displays all wishlist items
- [ ] Unavailable products show correctly
- [ ] Add to wishlist works
- [ ] Remove from wishlist works
- [ ] Clear wishlist works
- [ ] Error handling works
- [ ] Responsive design works

