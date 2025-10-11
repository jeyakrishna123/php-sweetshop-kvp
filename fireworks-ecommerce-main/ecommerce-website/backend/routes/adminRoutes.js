import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  getDashboardStats, 
  getAnalytics, 
  getInventoryStatus, 
  getReports, 
  generateReport,
  getOrderStats,
  getUserStats,
  getAdminProducts
} from "../controllers/adminController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { 
  getAllUsers, 
  getSingleUser, 
  updateUser, 
  deleteUser 
} from "../controllers/userController.js";
import { 
  getAllOrders, 
  updateOrderStatus,
  updateOrder
} from "../controllers/orderController.js";
import { 
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct
} from "../controllers/productController.js";
import { 
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  reorderBanners, 
  toggleBannerStatus,
  uploadBanner,
  handleMulterError
} from "../controllers/bannerController.js";

const router = express.Router();

// Configure multer for image uploads with enhanced security
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    const uploadDir = 'uploads/products/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate secure filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, sanitizedFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
    fieldSize: 2 * 1024 * 1024 // 2MB field size
  },
  fileFilter: function (req, file, cb) {
    // Enhanced file type validation
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
    
    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp files are allowed.'), false);
    }
    
    // Check for malicious file names
    const maliciousPatterns = /[<>:"/\\|?*\x00-\x1f]/;
    if (maliciousPatterns.test(file.originalname)) {
      return cb(new Error('Invalid filename. Contains special characters.'), false);
    }
    
    cb(null, true);
  }
});

// Admin dashboard stats
router.get("/dashboard", isAuthenticated, isAdmin, getDashboardStats);

// Analytics routes
router.get("/analytics", isAuthenticated, isAdmin, getAnalytics);

// Inventory routes
router.get("/inventory", isAuthenticated, isAdmin, getInventoryStatus);

// Reports routes
router.get("/reports", isAuthenticated, isAdmin, getReports);
router.post("/reports/generate", isAuthenticated, isAdmin, generateReport);

// Order statistics
router.get("/order-stats", isAuthenticated, isAdmin, getOrderStats);

// User statistics
router.get("/user-stats", isAuthenticated, isAdmin, getUserStats);

// User management routes
router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.get("/user/:id", isAuthenticated, isAdmin, getSingleUser);
router.put("/user/:id", isAuthenticated, isAdmin, updateUser);
router.delete("/user/:id", isAuthenticated, isAdmin, deleteUser);

// Customer management routes
router.get("/customers", isAuthenticated, isAdmin, getAllUsers);

// Order management routes
router.get("/orders", isAuthenticated, isAdmin, getAllOrders);
router.put("/order/:id", isAuthenticated, isAdmin, updateOrder);
router.put("/order/:id/status", isAuthenticated, isAdmin, updateOrderStatus);
// Bill email functionality is now integrated into order creation

// Product management routes
router.get("/products", isAuthenticated, isAdmin, getAdminProducts);
router.get("/product/:id", isAuthenticated, isAdmin, getProduct);
router.post("/product/new", isAuthenticated, isAdmin, createProduct);
router.put("/product/:id", isAuthenticated, isAdmin, updateProduct);
router.delete("/product/:id", isAuthenticated, isAdmin, deleteProduct);

// Banner management routes
router.get("/banners", isAuthenticated, isAdmin, getAllBanners);
router.post("/banners", isAuthenticated, isAdmin, uploadBanner, handleMulterError, createBanner);
router.put("/banners/:id", isAuthenticated, isAdmin, uploadBanner, handleMulterError, updateBanner);
router.delete("/banners/:id", isAuthenticated, isAdmin, deleteBanner);
router.post("/banners/reorder", isAuthenticated, isAdmin, reorderBanners);
router.patch("/banners/:id/toggle", isAuthenticated, isAdmin, toggleBannerStatus);

// Image upload route with error handling
router.post("/upload-images", isAuthenticated, isAdmin, (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📤 Image upload request received');
    console.log('📎 Files in request:', req.files ? req.files.length : 0);
    console.log('📋 Request body:', req.body);
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in upload request');
      return res.status(400).json({
        success: false,
        message: "No images uploaded"
      });
    }

    console.log('✅ Processing uploaded files...');
    const uploadedImages = req.files.map(file => {
      console.log(`📎 Processing file: ${file.originalname} (${file.size} bytes)`);
      return {
        filename: file.filename,
        originalname: file.originalname,
        url: `/uploads/products/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    console.log('✅ Images processed successfully:', uploadedImages.length);
    
    res.json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedImages
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images: " + error.message
    });
  }
});

export default router;
