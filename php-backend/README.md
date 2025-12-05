# SK Bakers E-Commerce - PHP Backend

Complete PHP + MySQL backend for SK Bakers E-Commerce application, designed for Hostinger shared hosting compatibility while maintaining full functionality with your existing React frontend.

## Features

- **RESTful API** - Complete REST API matching your Node.js backend endpoints
- **MySQL Database** - Full schema with relationships and indexes
- **JWT Authentication** - Secure token-based authentication
- **Secure** - Prepared statements, password hashing, input validation
- **Hostinger Compatible** - Optimized for shared hosting environments
- **No Framework Dependency** - Pure PHP for maximum compatibility

## Folder Structure

```
php-backend/
├── api/                    # API endpoint files
│   ├── auth.php           # Authentication (login, register, etc.)
│   ├── products.php       # Products CRUD
│   ├── orders.php         # Orders management
│   └── users.php          # User profile & addresses
├── config/                 # Configuration files
│   ├── config.php         # Application configuration
│   └── database.php       # Database connection
├── database/               # Database files
│   └── schema.sql         # MySQL database schema
├── includes/               # Shared utilities
│   └── helpers.php        # Helper functions
├── middleware/             # Middleware
│   ├── auth.php           # Authentication middleware
│   └── cors.php           # CORS handling
├── vendor/                 # Third-party libraries
│   └── jwt/               # JWT implementation
├── uploads/                # File uploads directory
├── logs/                   # Log files
├── .htaccess              # Apache configuration
├── index.php              # Main entry point
└── README.md              # This file
```

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server with mod_rewrite enabled
- Hostinger shared hosting account

## Installation on Hostinger

### Step 1: Upload Files

1. Connect to your Hostinger account via **File Manager** or **FTP**
2. Navigate to `public_html` directory (or your domain's root directory)
3. Create a new folder called `api` (or use any name you prefer)
4. Upload all files from the `php-backend` folder to this directory

### Step 2: Create MySQL Database

1. Go to **Hostinger Control Panel** → **Databases** → **MySQL Databases**
2. Click **Create New Database**
3. Note down:
   - Database name
   - Database username
   - Database password
   - Host (usually `localhost`)

### Step 3: Import Database Schema

1. Go to **phpMyAdmin** from Hostinger control panel
2. Select your newly created database
3. Click on **Import** tab
4. Choose the `database/schema.sql` file
5. Click **Go** to import

### Step 4: Configure Database Connection

1. Open `config/database.php`
2. Update the following values:

```php
private $host = 'localhost';          // Usually localhost
private $db_name = 'your_database';   // Your database name
private $username = 'your_username';  // Your database username
private $password = 'your_password';  // Your database password
```

### Step 5: Configure Application Settings

1. Open `config/config.php`
2. Update important settings:

```php
// JWT Secret - CHANGE THIS!
define('JWT_SECRET', 'your-very-secure-random-string-here');

// Allowed Origins - Add your React frontend URL
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',          // Local development
    'https://yourdomain.com'          // Production frontend
]);

// Base URL - Your API URL
define('BASE_URL', 'https://yourdomain.com/api');
```

### Step 6: Set Folder Permissions

Set proper permissions for upload and log directories:

```bash
chmod 755 uploads/
chmod 755 logs/
```

Or via File Manager: Right-click folder → Permissions → 755

### Step 7: Test the API

Visit: `https://yourdomain.com/api/`

You should see:
```json
{
  "success": true,
  "message": "SK Bakers E-Commerce API is running",
  "data": {
    "version": "2.0.0",
    "environment": "production",
    ...
  }
}
```

## API Endpoints

All endpoints follow the same structure as your Node.js backend:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/category/:category` - Get by category
- `GET /api/products/flavor/:flavor` - Get by cake flavor
- `GET /api/products/type/:type` - Get by product type
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/all` - Get all orders (Admin)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order (Admin)
- `DELETE /api/orders/:id` - Cancel order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/addresses` - Add address
- `PUT /api/users/address/:id` - Update address
- `DELETE /api/users/address/:id` - Delete address
- `POST /api/users/change-password` - Change password
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/all` - Get all users (Admin)

## Connecting React Frontend

Update your React frontend API base URL:

```javascript
// In your API configuration file (e.g., src/config/api.js)
const API_BASE_URL = 'https://yourdomain.com/api';

// OR if using environment variables
VITE_API_BASE_URL=https://yourdomain.com/api
```

The API endpoints remain exactly the same as your Node.js backend, so no frontend code changes needed!

## Authentication

The API uses JWT (JSON Web Tokens) for authentication, matching your Node.js implementation:

### Login Request:
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using Token:
Include in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The database includes the following tables:

- `users` - User accounts
- `addresses` - User addresses
- `categories` - Product categories
- `products` - Products catalog
- `reviews` - Product reviews
- `orders` - Customer orders
- `order_items` - Order line items
- `shipping_addresses` - Order shipping info
- `payment_info` - Payment details
- `order_status_history` - Order status tracking
- `wishlist` - User wishlists
- `banners` - Homepage banners
- `offer_popups` - Promotional popups
- `coupons` - Discount coupons
- `weight_options` - Product weight variants
- `analytics` - Usage analytics

## Security Features

- **Prepared Statements** - SQL injection protection
- **Password Hashing** - bcrypt with cost factor 12
- **JWT Tokens** - Secure authentication
- **Input Validation** - All inputs sanitized
- **CORS Protection** - Whitelist allowed origins
- **Rate Limiting** - Can be added via .htaccess
- **HTTPS Ready** - Force SSL in production

## Default Admin Account

After importing the database, a default admin account is created:

- **Email**: admin@skbakers.com
- **Password**: admin123456

**IMPORTANT**: Change this password immediately after first login!

## Troubleshooting

### 500 Internal Server Error
- Check PHP error logs in Hostinger control panel
- Verify `.htaccess` file is uploaded
- Ensure mod_rewrite is enabled

### Database Connection Failed
- Verify database credentials in `config/database.php`
- Check if database exists in phpMyAdmin
- Ensure MySQL user has proper permissions

### CORS Errors
- Add your frontend URL to `ALLOWED_ORIGINS` in `config/config.php`
- Clear browser cache
- Check browser console for specific CORS error

### JWT Token Errors
- Ensure JWT_SECRET is set in `config/config.php`
- Check token expiration (default 7 days)
- Verify Authorization header format

### File Upload Issues
- Check `uploads/` folder exists and has 755 permissions
- Verify PHP upload limits in `config/config.php`
- Check `MAX_FILE_SIZE` setting

## Performance Optimization

1. **Enable OPcache** (usually enabled by default on Hostinger)
2. **Database Indexes** - Already included in schema.sql
3. **Enable GZIP compression** - Configured in .htaccess
4. **Browser Caching** - Configured in .htaccess
5. **Use CDN** for images (optional)

## Maintenance

### Backup Database
```bash
# Via phpMyAdmin: Export → SQL → Go
# Or via command line:
mysqldump -u username -p database_name > backup.sql
```

### View Logs
Check `logs/activity.log` for application activity

### Update Code
1. Backup existing files
2. Upload new files via FTP/File Manager
3. Test thoroughly

## Support & Documentation

- **Hostinger Support**: https://www.hostinger.com/tutorials
- **PHP Documentation**: https://www.php.net/manual/
- **MySQL Documentation**: https://dev.mysql.com/doc/

## Migration from Node.js

Your React frontend should work without changes because:

1. **Same API Routes** - All endpoints match exactly
2. **Same Response Format** - JSON structure identical
3. **Same Authentication** - JWT tokens compatible
4. **Same Data Structure** - Database schema mirrors MongoDB

Simply update the API base URL in your frontend and you're done!

## License

MIT License - Feel free to modify and use for your project.

---

**Need Help?** Check Hostinger knowledge base or contact their support team.
