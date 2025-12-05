# Quick Start Guide - PHP Backend for SK Bakers

This is a **super quick** guide to get your PHP backend running on Hostinger in 15 minutes.

## What You Have

A complete PHP + MySQL backend that:
- Replaces your Node.js + MongoDB backend
- Works with your existing React frontend **WITHOUT ANY CHANGES**
- Uses JWT authentication (same as before)
- Has all the same API endpoints
- Is optimized for Hostinger shared hosting

## 5-Minute Local Test (Optional)

If you have XAMPP or WAMP installed:

1. Copy `php-backend` folder to `htdocs/`
2. Start Apache and MySQL
3. Open phpMyAdmin → Create database `skbakers_db`
4. Import `database/schema.sql`
5. Edit `config/database.php` with your local credentials
6. Visit `http://localhost/php-backend/`

If you see a JSON response, it works!

## 15-Minute Hostinger Deployment

### Step 1: Create Database (3 minutes)

1. Login to Hostinger
2. Go to **Databases** → **MySQL Databases**
3. Click **Create New Database**
4. Save the credentials shown (you'll need them!)

### Step 2: Import Schema (2 minutes)

1. Go to **phpMyAdmin**
2. Click your database
3. Click **Import** tab
4. Choose `database/schema.sql`
5. Click **Go**

### Step 3: Upload Files (5 minutes)

1. Go to **File Manager**
2. Navigate to `public_html`
3. Create folder `api`
4. Upload ALL files from `php-backend` folder

### Step 4: Configure (3 minutes)

Edit these 2 files:

**File 1: `api/config/database.php`**
```php
private $db_name = 'YOUR_DATABASE_NAME';
private $username = 'YOUR_DATABASE_USERNAME';
private $password = 'YOUR_DATABASE_PASSWORD';
```

**File 2: `api/config/config.php`**
```php
// Line 10: Change this!
define('JWT_SECRET', 'put-your-random-string-here');

// Line 15: Add your React URL
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'https://your-react-app.netlify.app'  // Your frontend URL
]);

// Line 53: Your API URL
define('BASE_URL', 'https://yourdomain.com/api');
```

### Step 5: Test (2 minutes)

Visit: `https://yourdomain.com/api/`

Should see:
```json
{
  "success": true,
  "message": "SK Bakers E-Commerce API is running"
}
```

### Step 6: Connect React Frontend (1 minute)

In your React project, update API URL:

```javascript
// .env file
VITE_API_BASE_URL=https://yourdomain.com/api
```

Or in your API config:
```javascript
const API_BASE_URL = 'https://yourdomain.com/api';
```

**That's it!** Your React app should now work with the PHP backend.

## Default Login

After deployment, login with:
- **Email**: admin@skbakers.com
- **Password**: admin123456

**IMPORTANT**: Change this password immediately!

## File Permissions

If uploads don't work, set these folders to **755**:
- `uploads/`
- `logs/`

## Troubleshooting

### "Database connection failed"
- Double-check credentials in `config/database.php`
- Verify database exists in phpMyAdmin

### "CORS error"
- Add your frontend URL to `ALLOWED_ORIGINS` in `config/config.php`
- Clear browser cache

### "500 Internal Server Error"
- Check error logs in Hostinger control panel
- Verify `.htaccess` file is uploaded
- Ensure all files are uploaded

### "Invalid token"
- Change `JWT_SECRET` in `config/config.php`
- Clear browser localStorage
- Login again

## API Endpoints Quick Reference

All endpoints same as Node.js backend:

**Auth**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

**Products**
- GET `/api/products`
- GET `/api/products/:id`
- GET `/api/products/featured`
- POST `/api/products` (Admin)

**Orders**
- GET `/api/orders`
- GET `/api/orders/:id`
- POST `/api/orders`

**Users**
- GET `/api/users/profile`
- PUT `/api/users/profile`
- GET `/api/users/addresses`

Full list in `README.md`

## What's Different from Node.js?

**Nothing from the frontend perspective!**

- Same endpoints
- Same request/response format
- Same authentication
- Same data structure

Just update the API URL and you're done.

## Need More Help?

- **Full docs**: See `README.md`
- **Step-by-step**: See `DEPLOYMENT_GUIDE.md`
- **Folder structure**: See `FOLDER_STRUCTURE.txt`
- **Hostinger support**: They're very helpful!

## Files Included

```
php-backend/
├── api/                  # API endpoints (auth, products, orders, users)
├── config/               # Configuration (MUST UPDATE)
├── database/             # schema.sql (MySQL schema)
├── includes/             # Helper functions
├── middleware/           # Auth & CORS
├── vendor/               # JWT library
├── .htaccess            # Apache config
├── index.php            # Main router
└── README.md            # Full documentation
```

## Next Steps After Deployment

1. Login and change admin password
2. Add your products via admin panel
3. Test ordering flow
4. Enable HTTPS (Hostinger provides free SSL)
5. Add your categories
6. Configure payment gateway (if needed)

## Database Tables

Your database includes:
- users, addresses
- products, categories, reviews
- orders, order_items, shipping_addresses
- payment_info, wishlist, banners
- coupons, analytics

All pre-configured and ready to use!

## Security Notes

Before going live:
- [ ] Change `JWT_SECRET`
- [ ] Change default admin password
- [ ] Set `APP_ENV` to 'production'
- [ ] Enable HTTPS
- [ ] Update `ALLOWED_ORIGINS` with real URLs

## Performance Tips

- Hostinger has OPcache enabled by default (good!)
- GZIP compression is configured in `.htaccess`
- Database has proper indexes
- Caching headers are set

## Support

**Hostinger has 24/7 support** - don't hesitate to contact them if you have hosting-specific issues.

For PHP/code issues, check:
1. Error logs in Hostinger
2. `logs/activity.log` in your app
3. Browser console for frontend errors

---

**Ready to deploy?** Follow the 5 steps above and you'll be live in 15 minutes!

**Questions?** Check the full `DEPLOYMENT_GUIDE.md` for detailed explanations.
