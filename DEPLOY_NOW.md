# 🚀 BANNER FIX - DEPLOY NOW
# 🚀 QUICK DEPLOYMENT STEPS - SK BAKERS

## ⚡ Fast Track Deployment (5 Steps)

### Step 1: Build Frontend
```bash
cd fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend
npm install
npm run build
```
**Output:** `dist/` folder with production build

---

### Step 2: Use Production Config
```bash
# Copy production config
cp php-backend/config/config_production.php php-backend/config/config.php
```

**OR** manually update `php-backend/config/config.php`:
- Set `APP_ENV = 'production'`
- Set `ENVIRONMENT = 'production'`
- Update `BASE_URL = 'https://skbakers.com'`
- Update `API_BASE_URL = 'https://skbakers.com/api'`

---

### Step 3: Upload to Hostinger

**Upload Structure:**
```
public_html/
├── index.html          (from dist/)
├── assets/             (from dist/)
├── static/             (from dist/)
├── api/                (from php-backend/api/)
└── backend/            (from php-backend/)
    ├── config/
    ├── includes/
    ├── middleware/
    └── uploads/        (create folder, chmod 755)
```

---

### Step 4: Set Permissions
```bash
chmod 755 backend/uploads/
chmod 755 logs/
chmod 644 backend/config/config.php
```

---

### Step 5: Test
1. Visit: `https://skbakers.com`
2. Test login/signup
3. Verify cart icon shows in navbar
4. Check API: `https://skbakers.com/api/products`

---

## ✅ Security Features Enabled:
- ✅ OTP not exposed in production
- ✅ Email verification required
- ✅ Password validation (8+ chars)
- ✅ Error reporting disabled
- ✅ HTTPS enforced

---

## 📖 Full Guide: See `PRODUCTION_DEPLOYMENT_GUIDE.md`
