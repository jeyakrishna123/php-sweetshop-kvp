# 🔧 Netlify 404 Fix - Step by Step Instructions

## 🎯 **The Problem:**
Your React app shows 404 errors because Netlify doesn't know how to handle client-side routing.

## ✅ **The Solution:**
I've created files that will fix this. Follow these steps:

### **Step 1: Files Already Created ✅**
- `public/_redirects` - Handles routing
- `netlify.toml` - Netlify configuration
- `vite.config.js` - Updated for Netlify

### **Step 2: In Your Netlify Dashboard**

1. **Go to "Build & deploy"** in left sidebar
2. **Click "Continuous deployment"**
3. **Set these values:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### **Step 3: Add Environment Variables**

1. **Click "Environment variables"** in left sidebar
2. **Add these variables:**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

### **Step 4: Redeploy**

1. **Go to "Deploys"** in left sidebar
2. **Click "Trigger deploy"** → **"Deploy site"**

## 🎉 **Result:**
After redeployment, your app will work without 404 errors!

## 📞 **Need Help?**
If you get stuck on any step, just ask me and I'll guide you through it!
