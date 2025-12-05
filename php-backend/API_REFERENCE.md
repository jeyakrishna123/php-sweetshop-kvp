# Complete API Reference - SK Bakers Backend

Base URL: `https://yourdomain.com/api`

All endpoints return JSON responses in this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-10-12T01:00:00+00:00"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... },
  "timestamp": "2025-10-12T01:00:00+00:00"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Get Current User
**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      ...
    }
  }
}
```

### Logout
**POST** `/api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

### Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

---

## Products Endpoints

### Get All Products
**GET** `/api/products`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - true/false
- `sortBy` - Sort field (created_at, price, average_rating, sold_count, name)
- `order` - Sort order (asc, desc)

**Example:** `/api/products?page=1&limit=10&category=cakes&sortBy=price&order=asc`

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Chocolate Cake",
        "price": 500,
        "images": ["image1.jpg"],
        ...
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Get Single Product
**GET** `/api/products/:id`

**Example:** `/api/products/1`

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "id": 1,
      "name": "Chocolate Cake",
      "description": "Delicious chocolate cake",
      "price": 500,
      "original_price": 600,
      "discount_percentage": 16.67,
      "category": "cakes",
      "images": ["image1.jpg", "image2.jpg"],
      "thumbnail": "thumb.jpg",
      "stock": 10,
      "average_rating": 4.5,
      "num_reviews": 10,
      "reviews": [...]
    }
  }
}
```

### Get Featured Products
**GET** `/api/products/featured`

**Query Parameters:**
- `limit` - Number of products (default: 8, max: 20)

### Search Products
**GET** `/api/products/search`

**Query Parameters:**
- `q` - Search query (required)
- `page` - Page number
- `limit` - Items per page

**Example:** `/api/products/search?q=chocolate&page=1`

### Get Products by Category
**GET** `/api/products/category/:category`

**Example:** `/api/products/category/cakes`

### Get Products by Flavor
**GET** `/api/products/flavor/:flavor`

**Example:** `/api/products/flavor/chocolate`

### Get Products by Type
**GET** `/api/products/type/:type`

**Example:** `/api/products/type/newItems`

### Create Product (Admin)
**POST** `/api/products`

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "name": "Chocolate Cake",
  "description": "Delicious chocolate cake",
  "price": 500,
  "originalPrice": 600,
  "discountPercentage": 16.67,
  "category": "cakes",
  "cakeFlavor": "chocolate",
  "productTypes": ["cakes", "specialItems"],
  "isNew": true,
  "brand": "SK Bakers",
  "stock": 10,
  "images": ["image1.jpg", "image2.jpg"],
  "thumbnail": "thumb.jpg",
  "tags": ["cake", "chocolate", "dessert"],
  "featured": true,
  "hasWeightOptions": true,
  "weightOptions": [
    {
      "weight": "500g",
      "price": 500,
      "servingSize": "4-6 people"
    }
  ]
}
```

### Update Product (Admin)
**PUT** `/api/products/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:** Same as create (only include fields to update)

### Delete Product (Admin)
**DELETE** `/api/products/:id`

**Headers:** `Authorization: Bearer <admin-token>`

---

## Orders Endpoints

### Get User Orders
**GET** `/api/orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page

### Get Single Order
**GET** `/api/orders/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order": {
      "id": 1,
      "tracking_number": "TRK1234567890",
      "status": "pending",
      "total_price": 1500,
      "orderItems": [...],
      "shippingAddress": {...},
      "paymentInfo": {...},
      "statusHistory": [...]
    }
  }
}
```

### Get All Orders (Admin)
**GET** `/api/orders/all`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

### Create Order
**POST** `/api/orders`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderItems": [
    {
      "product": 1,
      "name": "Chocolate Cake",
      "quantity": 2,
      "price": 500,
      "image": "image.jpg"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentInfo": {
    "id": "pay_123",
    "method": "stripe",
    "status": "completed"
  },
  "itemsPrice": 1000,
  "taxPrice": 180,
  "shippingPrice": 100,
  "discountAmount": 50,
  "totalPrice": 1230,
  "couponCode": "SAVE10",
  "customerNotes": "Please deliver in evening"
}
```

### Update Order (Admin)
**PUT** `/api/orders/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "status": "shipped",
  "statusNote": "Order shipped via FedEx",
  "trackingNumber": "FEDEX123456",
  "shippingCarrier": "FedEx"
}
```

### Cancel Order
**DELETE** `/api/orders/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

---

## Users Endpoints

### Get Profile
**GET** `/api/users/profile`

**Headers:** `Authorization: Bearer <token>`

### Update Profile
**PUT** `/api/users/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "avatar": "avatar.jpg"
}
```

### Get Addresses
**GET** `/api/users/addresses`

**Headers:** `Authorization: Bearer <token>`

### Add Address
**POST** `/api/users/addresses`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "home",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "India",
  "isDefault": true
}
```

### Update Address
**PUT** `/api/users/address/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as add address

### Delete Address
**DELETE** `/api/users/address/:id`

**Headers:** `Authorization: Bearer <token>`

### Change Password
**POST** `/api/users/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Update Preferences
**PUT** `/api/users/preferences`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "newsletter": true,
  "marketing": false,
  "notificationsEmail": true,
  "notificationsSms": false,
  "notificationsPush": true,
  "currency": "INR",
  "language": "en"
}
```

### Get All Users (Admin)
**GET** `/api/users/all`

**Headers:** `Authorization: Bearer <admin-token>`

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Common Headers

### All Requests
```
Content-Type: application/json
```

### Authenticated Requests
```
Authorization: Bearer <token>
```

### CORS Headers (automatically set)
```
Access-Control-Allow-Origin: <frontend-url>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

---

## Testing with Postman

1. Import endpoints from this documentation
2. Set base URL as environment variable
3. After login, save token and use in subsequent requests
4. Set Authorization header: `Bearer <token>`

## Testing with cURL

**Login:**
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skbakers.com","password":"admin123456"}'
```

**Get Products:**
```bash
curl -X GET https://yourdomain.com/api/products
```

**Create Product (Admin):**
```bash
curl -X POST https://yourdomain.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"New Cake","price":500,...}'
```

---

## Rate Limiting

Currently not implemented but can be added via:
- `.htaccess` rules
- PHP session-based limiting
- Third-party services

---

## Pagination

All list endpoints support pagination:
- Default page size: 20 items
- Maximum page size: 100 items
- Use `page` and `limit` query parameters

---

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific error message"
  },
  "timestamp": "2025-10-12T01:00:00+00:00"
}
```

---

For more details, see `README.md` and `DEPLOYMENT_GUIDE.md`
