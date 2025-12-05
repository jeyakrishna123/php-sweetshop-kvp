# Admin Dashboard Date Filter Fix

## Problem
The Admin Dashboard was showing all zeros for statistics when filtering by date (Today, This Week, This Month). The backend was ignoring the date filter parameters sent by the frontend.

## Root Cause
The `getDashboardStats()` function in `php-backend/api/admin.php` was **not respecting the date filter parameters**. It always returned all-time statistics regardless of the filter selected.

## Solution Applied

### Backend Changes (`php-backend/api/admin.php`)

Updated the `getDashboardStats()` function to:

1. **Accept date filter parameters:**
   - `dateRange`: 'all', 'today', 'week', 'month', 'custom'
   - `startDate`: Start date for custom range
   - `endDate`: End date for custom range

2. **Build dynamic SQL conditions** based on date filter:
   ```php
   // Today filter
   case 'today':
       $dateCondition = " AND DATE(created_at) = ?";
       $dateParams = [$today];
       break;

   // Week filter
   case 'week':
       $weekStart = date('Y-m-d', strtotime('monday this week'));
       $dateCondition = " AND DATE(created_at) >= ?";
       $dateParams = [$weekStart];
       break;

   // Month filter
   case 'month':
       $monthStart = date('Y-m-01');
       $dateCondition = " AND DATE(created_at) >= ?";
       $dateParams = [$monthStart];
       break;

   // Custom range filter
   case 'custom':
       if ($startDate && $endDate) {
           $dateCondition = " AND DATE(created_at) BETWEEN ? AND ?";
           $dateParams = [$startDate, $endDate];
       }
       break;
   ```

3. **Apply filters to relevant statistics:**
   - ✅ Total Orders (filtered by date)
   - ✅ Total Revenue (filtered by date)
   - ✅ Pending Orders (filtered by date)
   - ✅ Processing Orders (filtered by date)
   - ✅ Shipped Orders (filtered by date)
   - ✅ Delivered Orders (filtered by date)
   - ❌ Total Users (always all-time - users don't have order dates)
   - ❌ Total Products (always all-time - product count is independent of dates)
   - ❌ Low Stock Products (always all-time - current inventory status)
   - ❌ Out of Stock Products (always all-time - current inventory status)

4. **Added new order status breakdown:**
   - `processingOrders`
   - `shippedOrders`
   - `deliveredOrders`

### How It Works

#### Example 1: Filter by "Today"
**Request:** `GET /api/admin/dashboard?dateRange=today`

**Backend Logic:**
```php
$dateCondition = " AND DATE(created_at) = '" . date('Y-m-d') . "'";
```

**SQL Query:**
```sql
SELECT COUNT(*) as total
FROM orders
WHERE status = 'pending' AND DATE(created_at) = '2025-01-21'
```

**Result:** Only shows orders created today

#### Example 2: Filter by "This Week"
**Request:** `GET /api/admin/dashboard?dateRange=week`

**Backend Logic:**
```php
$weekStart = date('Y-m-d', strtotime('monday this week'));
$dateCondition = " AND DATE(created_at) >= '$weekStart'";
```

**Result:** Shows orders from Monday of current week onwards

#### Example 3: Filter by "This Month"
**Request:** `GET /api/admin/dashboard?dateRange=month`

**Backend Logic:**
```php
$monthStart = date('Y-m-01');
$dateCondition = " AND DATE(created_at) >= '$monthStart'";
```

**Result:** Shows orders from the 1st day of current month

#### Example 4: Custom Date Range
**Request:** `GET /api/admin/dashboard?dateRange=custom&startDate=2025-01-01&endDate=2025-01-31`

**Backend Logic:**
```php
$dateCondition = " AND DATE(created_at) BETWEEN '2025-01-01' AND '2025-01-31'";
```

**Result:** Shows orders between January 1-31, 2025

## What Changed in the Response

### Before (No Filtering)
```json
{
  "success": true,
  "stats": {
    "totalOrders": 150,        // All orders ever
    "totalRevenue": 50000,     // All revenue ever
    "pendingOrders": 10,       // All pending orders
    ...
  }
}
```

### After (With Filtering by "Today")
```json
{
  "success": true,
  "stats": {
    "totalOrders": 3,           // Orders created today
    "totalRevenue": 1500,       // Revenue from today
    "pendingOrders": 2,         // Pending orders from today
    "processingOrders": 1,      // Processing orders from today
    "shippedOrders": 0,         // Shipped orders from today
    "deliveredOrders": 0,       // Delivered orders from today
    "totalUsers": 6,            // All users (not filtered)
    "totalProducts": 21,        // All products (not filtered)
    "lowStockProducts": 0,      // Current low stock (not filtered)
    "outOfStockProducts": 0     // Current out of stock (not filtered)
  }
}
```

## Testing the Fix

### Step 1: Start Backend Server
```bash
cd C:\Users\jeyakrishna\Documents\php-sweetshop-kvp
php -S localhost:8000 -t php-backend/
```

### Step 2: Test Different Filters

1. **All Time Filter:**
   - Click "All Time" button
   - Should show all historical data

2. **Today Filter:**
   - Click "Today" button
   - Should show only today's orders and revenue
   - If no orders today, will show 0

3. **This Week Filter:**
   - Click "This Week" button
   - Should show orders from Monday onwards

4. **This Month Filter:**
   - Click "This Month" button
   - Should show orders from the 1st of current month

5. **Custom Range Filter:**
   - Click "Custom Range" button
   - Select start and end dates
   - Should show orders within that range

### Step 3: Verify Data

Check browser DevTools → Network tab:
- Find request to `/api/admin/dashboard?dateRange=today`
- Check response shows filtered data
- Verify order counts match the selected filter

## Why You Might Still See Zeros

If you select "Today" filter and see all zeros, it means:
- ✅ **The filter is working correctly**
- ℹ️ **No orders were placed today**

To see data:
1. Click "All Time" button to see historical data
2. Or create test orders to see in today's filter

## Files Modified

1. **php-backend/api/admin.php** - `getDashboardStats()` function
   - Added date filter parameter handling
   - Modified SQL queries to include date conditions
   - Added order status breakdown

## API Endpoint Reference

**URL:** `/api/admin/dashboard`

**Method:** GET

**Query Parameters:**
| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| dateRange | string | 'all', 'today', 'week', 'month', 'custom' | Date filter type |
| startDate | string | YYYY-MM-DD | Start date (for custom range) |
| endDate | string | YYYY-MM-DD | End date (for custom range) |

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "stats": {
    "totalUsers": 6,
    "totalProducts": 21,
    "totalOrders": 0,
    "totalRevenue": 0,
    "pendingOrders": 0,
    "processingOrders": 0,
    "shippedOrders": 0,
    "deliveredOrders": 0,
    "lowStockProducts": 0,
    "outOfStockProducts": 0
  },
  "recentOrders": []
}
```

## Summary

✅ **Fixed:** Date filters now work correctly
✅ **Fixed:** Backend respects filter parameters
✅ **Fixed:** Order status breakdown by date
✅ **Improved:** Better data accuracy for filtered views

The dashboard will now show accurate, date-filtered statistics based on the selected time range!
