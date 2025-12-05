# Production Image Upload Error - Step-by-Step Diagnosis

## 🔍 **Step-by-Step Flow Analysis**

### **STEP 1: Frontend API Call**
**File:** `adminAPI.js` → `uploadImages()`

**Current Code:**
```javascript
const uploadAPI = axiosBase.create({
  baseURL: `${getApiConfig().BASE_URL}/api/admin`,
  timeout: 30000,
});
```

**Issue Found:**
- `getApiConfig().BASE_URL` might return different value than expected
- Should use same base URL logic as `adminAPI` instance

**Fix Applied:**
```javascript
const baseURL = import.meta.env.VITE_API_URL || 
               (import.meta.env.PROD ? 'https://skbakers.com' : 'http://localhost:8000');
const uploadAPI = axiosBase.create({
  baseURL: `${baseURL}/api/admin`,
  timeout: 30000,
});
```

**Full URL in Production:**
- `https://skbakers.com/api/admin/upload-images`

---

### **STEP 2: Backend Routing**
**File:** `admin.php` → Routing

**Current Code:**
```php
case "upload-images":
    if ($method === "POST") {
        $authUser = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($authUser);
        uploadMultipleImages();
    }
```

**Potential Issues:**
1. ❓ **Route Matching:**
   - Request: `POST /api/admin/upload-images`
   - Backend extracts endpoint: `upload-images`
   - **Check:** Is endpoint extracted correctly?

2. ❓ **Authentication:**
   - Token must be valid
   - User must be admin
   - **Check:** Are auth errors logged?

---

### **STEP 3: File Upload Processing**
**File:** `admin.php` → `uploadMultipleImages()`

**Current Code:**
```php
if (!isset($_FILES['images'])) {
    sendError('No images provided...', [], 400);
    return;
}
```

**Potential Issues:**
1. ❓ **FormData Field Name:**
   - Frontend sends: `formData.append('images', image)`
   - Backend expects: `$_FILES['images']`
   - **Check:** Is field name correct?

2. ❓ **File Array Structure:**
   - Single file: `$_FILES['images']` = `{ name: '...', ... }`
   - Multiple files: `$_FILES['images']` = `{ name: [...], ... }`
   - **Check:** Is structure handled correctly?

---

### **STEP 4: Response Generation**
**File:** `admin.php` → `uploadMultipleImages()` → End

**Response Structure:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      {
        "url": "https://skbakers.com/backend/uploads/products/abc123.jpg",
        "path": "/uploads/products/abc123.jpg",
        "fullUrl": "https://skbakers.com/backend/uploads/products/abc123.jpg",
        "name": "image.jpg"
      }
    ],
    "count": 1,
    "errors": []
  }
}
```

**Potential Issues:**
1. ❓ **URL Generation:**
   - `getImageUrl($imagePath)` might return null
   - Fallback URL might be incorrect
   - **Check:** Are URLs generated correctly?

---

### **STEP 5: Frontend Response Parsing**
**File:** `EnhancedProductModal.jsx` → Line 833-892

**Current Code:**
```javascript
const uploadResponse = await productAPI.uploadImages(validFiles);
// uploadResponse = { success: true, data: { images: [...] } }

let responseData = uploadResponse;
if (responseData.data && responseData.data.images) {
  images = responseData.data.images;  // Strategy 1
}
```

**Potential Issues:**
1. ❓ **Response Structure:**
   - Expected: `responseData.data.images`
   - Actual: Might be different
   - **Check:** What is actual structure?

---

## 🔴 **Most Common Production Errors**

### **Error 1: CORS Error**
**Symptom:** Browser console shows CORS error

**Check:**
- Browser console for CORS errors
- Network tab for OPTIONS request
- Backend CORS headers

**Fix:**
- Ensure CORS middleware allows `https://skbakers.com`
- Check `cors.php` configuration

---

### **Error 2: 404 Not Found**
**Symptom:** Request returns 404

**Check:**
- API URL is correct: `https://skbakers.com/api/admin/upload-images`
- Backend routing is correct
- `.htaccess` or server config

**Fix:**
- Verify API URL matches backend route
- Check server rewrite rules

---

### **Error 3: 401 Unauthorized**
**Symptom:** Request returns 401

**Check:**
- Token is valid
- Token is not expired
- User is admin

**Fix:**
- Refresh token or re-login
- Check token expiration

---

### **Error 4: 500 Internal Server Error**
**Symptom:** Request returns 500

**Check:**
- Server logs for PHP errors
- File upload permissions
- Directory exists and is writable

**Fix:**
- Check `/backend/uploads/products/` directory
- Set permissions: `chmod 755`
- Check PHP error logs

---

### **Error 5: Empty Images Array**
**Symptom:** Response has `success: true` but `images: []`

**Check:**
- Server logs for upload errors
- File validation errors
- URL generation errors

**Fix:**
- Check server logs
- Verify file upload succeeded
- Check URL generation

---

## 🔧 **Debugging Checklist**

### **1. Check Browser Console:**
- [ ] Look for error messages
- [ ] Check network tab for failed requests
- [ ] Check response structure
- [ ] Check request URL

### **2. Check Server Logs:**
- [ ] Look for upload errors
- [ ] Check authentication errors
- [ ] Check file validation errors
- [ ] Check URL generation errors

### **3. Verify Configuration:**
- [ ] API URL is correct
- [ ] CORS is configured
- [ ] Authentication is working
- [ ] File upload limits are set

### **4. Test API Directly:**
```bash
curl -X POST https://skbakers.com/api/admin/upload-images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@test.jpg"
```

---

## ✅ **Fixes Applied**

1. ✅ **Fixed API URL consistency** - Uses same base URL logic
2. ✅ **Added logging** - Logs base URL for debugging
3. ✅ **Enhanced error handling** - Better error messages
4. ✅ **Multiple response parsing strategies** - Handles all structures

---

## 🚀 **Next Steps**

1. **Deploy fixes:**
   - Upload updated `adminAPI.js` (or rebuilt frontend)
   - Upload backend files

2. **Test in production:**
   - Upload an image
   - Check browser console
   - Check server logs
   - Verify response structure

3. **If still failing:**
   - Share browser console errors
   - Share server log errors
   - Share network tab request/response

