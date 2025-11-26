# 📚 Complete Application Code Overview
## SK Bakers E-Commerce Platform

**Date:** $(Get-Date -Format "yyyy-MM-dd")  
**Status:** Production Ready

---

## 🏗️ Architecture Overview

### **Technology Stack:**
- **Frontend:** React 18.2.0 + Vite 6.3.6
- **Backend:** PHP 7.4+ (Hostinger compatible)
- **Database:** MySQL (Hostinger shared hosting)
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** PHPMailer (SMTP via Hostinger)
- **Deployment:** Hostinger shared hosting

### **Project Structure:**
```
php-sweetshop-kvp/
├── hostinger_upload/          # Production deployment folder
│   ├── backend/               # PHP Backend API
│   │   ├── api/               # API endpoints
│   │   ├── config/            # Configuration files
│   │   ├── includes/          # Helper classes & functions
│   │   ├── middleware/        # Auth & CORS middleware
│   │   ├── uploads/           # User-uploaded files
│   │   └── index.php          # Main API router
│   ├── frontend/              # React build output
│   └── .htaccess              # Apache routing rules
│
└── fireworks-ecommerce-main/  # Development source
    └── ecommerce-website/
        └── ecommerce-frontend/ # React source code
            ├── src/
            │   ├── components/ # React components
            │   ├── pages/      # Page components
            │   ├── context/    # React Context providers
            │   ├── utils/      # Utility functions
            │   └── routes.jsx  # Route definitions
            └── dist/          # Build output
```

---

## 🔧 Backend Architecture (PHP)

### **1. Main Entry Point** (`backend/index.php`)
- **Purpose:** API router - routes all `/api/*` requests
- **Key Features:**
  - Handles CORS preflight requests
  - Routes to appropriate API files based on resource
  - Rejects image file requests (prevents 422 errors)
  - Supports multiple path formats (`/api/products`, `/api/php-backend/api/products`)

**Routes:**
- `/api/auth` → `api/auth.php`
- `/api/products` → `api/products.php`
- `/api/orders` → `api/orders.php`
- `/api/users` → `api/users.php`
- `/api/categories` → `api/categories.php`
- `/api/wishlist` → `api/wishlist.php`
- `/api/banners` → `api/banners.php`
- `/api/admin` → `api/admin.php`
- `/api/offer-popups` → `api/offer-popups.php`
- `/api/menu` → `api/menu.php`
- `/api/contacts` → `api/contacts.php`
- `/api/analytics` → `api/analytics.php`
- And more...

### **2. Configuration** (`backend/config/`)

#### **config.php:**
- Database credentials (Hostinger MySQL)
- JWT secret key & expiration
- CORS allowed origins
- Upload settings (10MB max, image types)
- SMTP email configuration
- Base URLs (production: `https://skbakers.com`)

#### **database.php:**
- Singleton Database class
- PDO connection with multiple fallback configs
- Auto-loads `.env` file if present
- UTF-8 charset support
- Error handling & logging

### **3. Helper Functions** (`backend/includes/helpers.php`)

**Key Functions:**
- `sendResponse()` - JSON response wrapper
- `sendSuccess()` - Success response helper
- `sendError()` - Error response helper
- `getRequestBody()` - Parse JSON/Form data
- `getBearerToken()` - Extract JWT from Authorization header
- `generateUniqueOrderId()` - 6-digit unique order ID
- `uploadImage()` - File upload handler
- `uploadBase64Image()` - Base64 to file converter
- `getImageUrl()` - Image URL builder (production URLs)
- `normalizeImagePath()` - Path normalization
- `sendEmail()` - Email sending wrapper
- `validateImageUpload()` - Image validation
- And many more...

### **4. API Endpoints**

#### **Authentication** (`api/auth.php`)
- `POST /api/auth/register` - User registration with OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Token verification

#### **Products** (`api/products.php`)
- `GET /api/products` - List all products (paginated)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/featured` - Featured products
- `GET /api/products/bestsellers` - Bestseller products
- `GET /api/products/new` - New products
- `GET /api/products/search` - Search products
- `GET /api/products/category/:name` - Products by category

**Features:**
- Base64 image detection & conversion
- Image file existence validation
- Stock management
- Category/flavor/type filtering

#### **Orders** (`api/orders.php`)
- `GET /api/orders` - User's orders
- `GET /api/orders/all` - All orders (admin)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order (admin)
- `POST /api/orders/:id/send-bill-pdf` - Email bill PDF
- `DELETE /api/orders/:id` - Cancel order

**Features:**
- 6-digit unique order ID generation
- Tracking number generation
- Order status management
- PDF bill generation & email
- Guest checkout support

#### **Other Endpoints:**
- **Users:** CRUD operations, profile management
- **Categories:** Category management
- **Wishlist:** Add/remove products
- **Banners:** Banner management
- **Admin:** Dashboard stats, analytics
- **Contacts:** Contact form submissions
- **Analytics:** Sales analytics, reports

### **5. Email Service** (`backend/includes/EmailService.php`)

**Features:**
- PHPMailer integration (with fallback to `mail()`)
- SMTP configuration (Hostinger SMTP)
- PDF attachment support
- HTML email templates
- Error handling (never throws exceptions)
- Development mode simulation

**Methods:**
- `sendEmail()` - Basic email
- `sendEmailWithAttachment()` - Email with PDF
- `sendCustomerEmail()` - Branded email template
- `getLastError()` - Get error details

### **6. Middleware**

#### **Auth Middleware** (`middleware/auth.php`)
- JWT token validation
- User authentication check
- Admin role verification
- Session management

#### **CORS Middleware** (`middleware/cors.php`)
- CORS header management
- Preflight request handling
- Production origin whitelist

### **7. Apache Configuration** (`.htaccess`)

**Root `.htaccess`:**
- SPA routing (all requests → `frontend/index.html`)
- API routing (`/api/*` → `backend/index.php`)
- Static file serving (assets, images)
- Image upload handling (`/backend/uploads/`)
- MIME type configuration
- Security headers
- Compression

**Backend `.htaccess`:**
- Excludes image files from PHP routing
- Protects sensitive files
- Sets PHP upload limits
- Cache control headers

---

## ⚛️ Frontend Architecture (React)

### **1. Entry Points**

#### **main.jsx:**
- React 18 root creation
- Strict mode enabled
- App component mounting

#### **App.jsx:**
- Router setup (React Router v6)
- Context providers:
  - `AuthProvider` - Authentication state
  - `CartProvider` - Shopping cart
  - `WishlistProvider` - Wishlist
  - `ToastProvider` - Notifications
  - `NotificationProvider` - System notifications
- Global components:
  - `ChatbotToggle`
  - `MobileFooter`
  - `JumpToTop`
- Error boundary

### **2. Routing** (`routes.jsx`)

**Admin Routes** (`/admin/*`):
- `/admin` - Dashboard
- `/admin/orders` - Order management
- `/admin/products` - Product management
- `/admin/users` - User management
- `/admin/analytics` - Analytics
- `/admin/categories` - Categories
- `/admin/banners` - Banners
- `/admin/contacts` - Contacts
- `/admin/offer-popups` - Offer popups
- `/admin/menu` - Menu management
- And more...

**Public Routes:**
- `/` - Homepage
- `/products` - Product listing
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/signup` - Signup
- `/wishlist` - Wishlist
- `/myorder` - Order history
- `/order/:id` - Order details
- `/about` - About page
- `/contact` - Contact page
- `/faq` - FAQ page

### **3. Context Providers**

#### **AuthContext** (`context/AuthContext.jsx`)
**State:**
- `user` - Current user object
- `loading` - Auth loading state
- `error` - Auth errors
- `sessionValid` - Session validity

**Methods:**
- `login()` - User login
- `adminLogin()` - Admin login
- `register()` - User registration
- `logout()` - Logout
- `validateSession()` - Session validation

**Features:**
- JWT token management
- Auto token refresh (non-admin users)
- Token expiration handling
- 401 error interception
- LocalStorage persistence

#### **CartContext** (`context/CartContext.jsx`)
**State:**
- `cartItems` - Cart items array
- `cartTotal` - Total price
- `cartCount` - Unique items count
- `cartItemCount` - Total quantity

**Actions:**
- `ADD_TO_CART` - Add item
- `REMOVE_FROM_CART` - Remove item
- `UPDATE_QUANTITY` - Update quantity
- `CLEAR_CART` - Clear cart
- `SET_CART` - Set cart items

**Features:**
- LocalStorage persistence
- Stock validation
- Quantity limits

### **4. API Utilities**

#### **axios.js:**
- Base axios instance
- Production URL detection:
  - Checks `window.__PRODUCTION_API_URL__`
  - Checks `VITE_API_URL` env var
  - Checks domain (`skbakers.com`)
  - Falls back to `localhost:8000`
- Request interceptor (adds JWT token)
- Response interceptor (handles 401 errors)

#### **adminAPI.js:**
**Product API:**
- `getAllProducts()` - Fetch all products
- `getProduct(id)` - Get single product
- `createProduct(data)` - Create product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `uploadImages(images)` - Upload images
- `removeDuplicates()` - Remove duplicates

**Order API:**
- `getAllOrders()` - Fetch all orders
- `updateOrderStatus(id, status)` - Update status
- `sendBillEmailWithPDF(orderId, pdfData)` - Email bill PDF

**Features:**
- Comprehensive error handling
- Detailed error message extraction
- Network error detection
- PHPMailer error parsing

### **5. Image Utilities** (`utils/imageUtils.js`)

**Functions:**
- `getImageUrl(imagePath)` - Build image URL
  - Detects base64 images
  - Returns null for base64 (prevents 414 errors)
  - Converts relative paths to production URLs
- `getResponsiveImageUrl(imagePath, fallback)` - Responsive image URL
- `handleImageError(e, fallbackUrl)` - Image error handler
  - Direct data URI fallback (no placeholder 404s)
  - Prevents infinite error loops

**Features:**
- Base64 detection (multiple patterns)
- Production URL construction
- Data URI SVG fallback
- No external dependencies

### **6. Key Components**

#### **ProductCard.jsx:**
- Product display card
- Image error handling (data URI fallback)
- Stock status display
- Add to cart functionality
- Responsive design

#### **BillOfSupply.jsx:**
- Order bill/invoice display
- PDF generation (html2canvas + jsPDF)
- Email PDF functionality
- Error handling with detailed messages

#### **AdminSidebar.jsx:**
- Admin navigation menu
- Role-based menu items
- Active route highlighting
- Responsive design

### **7. Pages**

**Public Pages:**
- `Home.jsx` - Homepage with menu items, banners
- `ProductListing.jsx` - Product grid with filters
- `ProductDetails.jsx` - Product detail page
- `Cart.jsx` - Shopping cart
- `Checkout.jsx` - Checkout process
- `Login.jsx` - User login
- `Signup.jsx` - User registration (with OTP)
- `Wishlist.jsx` - User wishlist
- `MyOrder.jsx` - Order history
- `OrderDetails.jsx` - Order details

**Admin Pages:**
- `AdminPanel.jsx` - Dashboard
- `AdminOrders.jsx` - Order management
- `AdminProducts.jsx` - Product management
- `AdminUsers.jsx` - User management
- `AdminAnalytics.jsx` - Analytics dashboard
- `AdminCategories.jsx` - Category management
- `AdminBanners.jsx` - Banner management
- `AdminContacts.jsx` - Contact management
- `AdminOfferPopups.jsx` - Offer popup management
- And more...

---

## 🔐 Security Features

### **Backend:**
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (PDO prepared statements)
- XSS protection (input sanitization)
- CORS whitelist
- File upload validation
- Image type validation
- Session security (httponly, secure cookies)
- Protected sensitive files (`.htaccess`)

### **Frontend:**
- JWT token storage (localStorage)
- Token expiration handling
- Protected routes (PrivateRoute, AdminRoute)
- Input validation
- XSS protection (React auto-escaping)
- Secure API communication (HTTPS)

---

## 📧 Email System

### **Configuration:**
- **SMTP Host:** `smtp.hostinger.com`
- **SMTP Port:** `587`
- **Encryption:** TLS
- **From Email:** `noreply@skbakers.com`
- **From Name:** `SK Bakers`

### **Email Types:**
1. **Order Confirmation** - Order created
2. **Order Status Update** - Status changed
3. **Password Reset** - OTP for password reset
4. **Registration OTP** - Email verification
5. **Bill PDF** - Invoice/bill email with PDF attachment

### **Features:**
- PHPMailer with fallback to `mail()`
- HTML email templates
- PDF attachment support
- Error logging
- Development mode simulation

---

## 🗄️ Database Schema

### **Main Tables:**
- `users` - User accounts
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items
- `categories` - Product categories
- `reviews` - Product reviews
- `wishlist` - User wishlists
- `banners` - Homepage banners
- `offer_popups` - Offer popups
- `contacts` - Contact form submissions
- `menu_items` - Menu navigation items

### **Key Features:**
- 6-digit unique order IDs
- Tracking numbers
- Soft deletes (is_active flags)
- Timestamps (created_at, updated_at)
- Image path storage (relative paths)

---

## 🚀 Deployment

### **Production URL:**
- **Domain:** `https://skbakers.com`
- **API Base:** `https://skbakers.com/api`
- **Frontend:** `https://skbakers.com/`
- **Backend:** `https://skbakers.com/backend/`

### **File Structure on Server:**
```
public_html/
├── frontend/          # React build output
│   ├── index.html
│   └── assets/
├── backend/          # PHP backend
│   ├── api/
│   ├── config/
│   ├── includes/
│   ├── uploads/
│   └── index.php
└── .htaccess         # Apache routing
```

### **Build Process:**
1. **Frontend:** `npm run build` → Output to `dist/`
2. **Copy:** `dist/*` → `hostinger_upload/frontend/`
3. **Upload:** `hostinger_upload/*` → `public_html/`

---

## 🐛 Recent Fixes

### **Image 404 Errors:**
- ✅ Direct data URI fallback (no placeholder 404s)
- ✅ Base64 image detection & conversion
- ✅ File existence validation
- ✅ `.htaccess` image routing fixes

### **Email PDF Errors:**
- ✅ Detailed error extraction from backend
- ✅ PHPMailer error logging
- ✅ SMTP configuration validation
- ✅ Comprehensive error messages in frontend

### **Admin Panel:**
- ✅ Inventory section hidden
- ✅ Error handling improvements
- ✅ Order management fixes

---

## 📊 Application Statistics

### **Codebase Size:**
- **Backend PHP:** ~15,000+ lines
- **Frontend React:** ~50,000+ lines
- **Components:** 89+ React components
- **Pages:** 30+ page components
- **API Endpoints:** 50+ endpoints

### **Features:**
- ✅ User authentication (JWT)
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Order management
- ✅ Admin panel
- ✅ Analytics dashboard
- ✅ Email notifications
- ✅ PDF generation
- ✅ Image uploads
- ✅ Wishlist
- ✅ Reviews
- ✅ Banners
- ✅ Offer popups
- ✅ Contact forms
- ✅ Search & filters

---

## 🔄 Data Flow

### **User Registration:**
1. Frontend: User submits form
2. Backend: Create user (inactive)
3. Backend: Generate OTP
4. Backend: Send OTP email
5. Frontend: Show OTP modal
6. User: Enters OTP
7. Backend: Verify OTP
8. Backend: Activate user
9. Frontend: Auto-login

### **Order Creation:**
1. Frontend: User adds items to cart
2. Frontend: User proceeds to checkout
3. Frontend: User submits order
4. Backend: Validate order
5. Backend: Generate 6-digit order ID
6. Backend: Create order record
7. Backend: Create order items
8. Backend: Send confirmation email
9. Frontend: Redirect to success page

### **Image Upload:**
1. Frontend: User selects image
2. Frontend: Convert to base64 (if needed)
3. Frontend: Send to `/api/admin/upload-images`
4. Backend: Validate image
5. Backend: Save to `/backend/uploads/products/`
6. Backend: Return relative path
7. Frontend: Use path in product data

---

## 📝 Key Design Decisions

1. **6-Digit Order IDs:** Easy to remember, unique, generated once
2. **Base64 Image Conversion:** Prevents 414 errors, ensures images are files
3. **Data URI Fallback:** No external dependencies, always works
4. **JWT Authentication:** Stateless, scalable, secure
5. **PDO Prepared Statements:** SQL injection prevention
6. **Error Logging:** Comprehensive logging for debugging
7. **Production URL Detection:** Automatic environment detection
8. **LocalStorage Persistence:** Cart & auth state persistence

---

## 🎯 Next Steps / Improvements

### **Potential Enhancements:**
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics (charts, reports)
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Inventory management system
- [ ] Automated email campaigns
- [ ] Customer loyalty program
- [ ] Product recommendations
- [ ] Advanced search (Elasticsearch)

---

## 📚 Documentation Files

- `README.md` - Project overview
- `START_HERE.md` - Quick start guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `IMAGE_404_FINAL_FIX.md` - Image error fixes
- `EMAIL_ERROR_PRODUCTION_FIX.md` - Email error fixes
- And many more...

---

**This is a comprehensive overview of your application codebase. All major components, features, and architecture decisions are documented here.**

