# 🔧 ADMIN PANEL FIX GUIDE

## 🚨 **CORS Error Solution**

### **Problem:**
- CORS errors blocking admin panel requests
- Admin endpoints not accessible
- Frontend can't connect to backend

### **Solution Steps:**

#### **Step 1: Start Backend Server**
```bash
# Open Command Prompt in backend folder
cd ecommerce-website/backend

# Run the batch file
start-admin-server.bat

# OR manually run:
node simple-admin-server.js
```

#### **Step 2: Verify Server is Running**
- Open browser and go to: http://localhost:3001/health
- You should see: `{"success":true,"message":"Server running"}`

#### **Step 3: Test Admin Endpoints**
- Test: http://localhost:3001/api/admin/users
- Test: http://localhost:3001/api/admin/dashboard
- Test: http://localhost:3001/api/products

#### **Step 4: Start Frontend**
```bash
# Open new Command Prompt
cd ecommerce-website/ecommerce-frontend
npm run dev
```

### **🔧 Alternative Fix - If Server Won't Start:**

#### **Option 1: Use Working Server**
```bash
cd ecommerce-website/backend
node working-server.js
```

#### **Option 2: Fix Original Server**
1. Open `ecommerce-website/backend/server.js`
2. Find the CORS section
3. Replace with:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### **🎯 Quick Test Commands:**

#### **Test Backend:**
```powershell
# Test health
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET

# Test admin users
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/users" -Method GET

# Test products
Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method GET
```

### **✅ Expected Results:**
- Backend server running on port 3001
- All API endpoints returning JSON data
- No CORS errors in browser console
- Admin panel loading properly

### **🚨 If Still Getting Errors:**

#### **Check These:**
1. **Port 3001 is free** - No other app using it
2. **Firewall not blocking** - Allow Node.js through firewall
3. **Antivirus not blocking** - Add exception for project folder
4. **Node.js installed** - Run `node --version`

#### **Emergency Fix:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Start fresh
cd ecommerce-website/backend
node simple-admin-server.js
```

### **📋 Complete Admin Panel Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/admin/users` | GET | Get all users |
| `/api/admin/dashboard` | GET | Dashboard data |
| `/api/admin/orders` | GET | Get all orders |
| `/api/products` | GET | Get all products |
| `/api/categories` | GET | Get all categories |
| `/api/auth/login` | POST | User login |
| `/api/auth/verify-admin` | GET | Verify admin token |

### **🎉 Success Indicators:**
- ✅ Backend server starts without errors
- ✅ Health endpoint returns success
- ✅ Admin endpoints return data
- ✅ Frontend loads without CORS errors
- ✅ Admin panel displays data

### **📞 If You Need Help:**
1. Check browser console for specific errors
2. Verify backend server is running
3. Test endpoints directly in browser
4. Check network tab for failed requests

---
**Status: READY TO FIX ✅**
**All Solutions Provided ✅**
**Step-by-Step Guide Complete ✅**
