# SK Bakers E-Commerce - Login Credentials

## 🔐 Admin Login
- **Email:** admin@skbakers.com
- **Password:** admin123456
- **Role:** admin
- **Access:** Full admin panel access

## 👤 Test User Accounts

### User 1
- **Email:** testuser2@example.com
- **Password:** password123
- **Role:** user

### User 2
- **Email:** test@example.com
- **Password:** testpass123
- **Role:** user

## 📝 Notes
- All passwords are securely hashed using PHP's password_hash() with bcrypt
- JWT tokens are used for authentication
- Token expiration: 7 days for regular users
- Session management is handled client-side with localStorage

## 🚀 Quick Start
1. Navigate to http://localhost:5174
2. Click "Login" in the navigation
3. Use any of the above credentials
4. For admin access, go to http://localhost:5174/admin/login

## ✅ Fixed Issues
- ✅ Registration now works correctly with proper response handling
- ✅ Login accepts both regular users and admins
- ✅ Admin password hash updated to match PHP's password_verify
- ✅ API response structure aligned (data nested in response.data.data)
- ✅ JWT token authentication working
- ✅ Frontend AuthContext fixed to handle PHP API responses

## 📍 API Endpoints
- **Register:** POST /api/auth/register
- **Login:** POST /api/auth/login (both user and admin)
- **Logout:** POST /api/auth/logout
- **Get Current User:** GET /api/auth/me

## 🔑 Password Rules
- Minimum 8 characters required
- Mix of letters and numbers recommended
- Special characters supported
