import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const popupImagesDir = path.join(__dirname, '..', 'uploads', 'popup-images');
const menuImagesDir = path.join(__dirname, '..', 'uploads', 'menu-images');
if (!fs.existsSync(popupImagesDir)) {
  fs.mkdirSync(popupImagesDir, { recursive: true });
}
if (!fs.existsSync(menuImagesDir)) {
  fs.mkdirSync(menuImagesDir, { recursive: true });
}

// Configure multer for popup image uploads
const popupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, popupImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `popup-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for menu image uploads
const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, menuImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `menu-${uniqueSuffix}${ext}`);
  }
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Configure multer for popup images
const popupUpload = multer({
  storage: popupStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // Only one file at a time
  }
});

// Configure multer for menu images
const menuUpload = multer({
  storage: menuStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // Only one file at a time
  }
});

// Test route to check if upload routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Upload routes test endpoint hit!');
  res.json({
    success: true,
    message: 'Upload routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Test upload route without authentication (for debugging)
router.post('/test-upload', popupUpload.single('image'), (req, res) => {
  console.log('🧪 Test upload route hit!', {
    hasFile: !!req.file,
    method: req.method,
    url: req.url
  });
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file provided in test upload'
    });
  }
  
  res.json({
    success: true,
    message: 'Test upload successful!',
    filename: req.file.filename,
    size: req.file.size
  });
});

// Simple popup image upload without auth (for testing)
router.post('/popup-image-test', popupUpload.single('image'), (req, res) => {
  console.log('🧪 Popup image test route hit!', {
    hasFile: !!req.file,
    method: req.method,
    url: req.url
  });
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  console.log('📤 Popup image uploaded:', {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  });

  // Generate the URL for the uploaded image
  const imageUrl = `/uploads/popup-images/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Popup image uploaded successfully',
    imageUrl: imageUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Upload popup image route
router.post('/popup-image', isAuthenticated, isAdmin, popupUpload.single('image'), (req, res) => {
  try {
    console.log('🎯 Upload route hit!', {
      method: req.method,
      url: req.url,
      hasFile: !!req.file,
      hasAuth: !!req.user,
      userRole: req.user?.role
    });

    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📤 Popup image uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/popup-images/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Popup image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('❌ Error uploading popup image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading popup image',
      error: error.message
    });
  }
});

// Upload menu image route
router.post('/menu-image', isAuthenticated, isAdmin, menuUpload.single('image'), (req, res) => {
  try {
    console.log('🍽️ Menu image upload route hit!', {
      method: req.method,
      url: req.url,
      hasFile: !!req.file,
      hasAuth: !!req.user,
      userRole: req.user?.role
    });

    if (!req.file) {
      console.log('❌ No file provided in menu image request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📤 Menu image uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/menu-images/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Menu image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('❌ Error uploading menu image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading menu image',
      error: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
  }
  
  if (error.message === 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Upload error',
    error: error.message
  });
});

export default router;