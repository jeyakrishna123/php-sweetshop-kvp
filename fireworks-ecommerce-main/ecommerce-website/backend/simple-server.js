// Simple Server for Testing Upload Routes
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'popup-images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for popup image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `popup-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1
  }
});

// Test route
app.get('/api/upload/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({
    success: true,
    message: 'Upload routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Popup image upload route (no auth for testing)
app.post('/api/upload/popup-image', upload.single('image'), (req, res) => {
  console.log('🎯 Popup image route hit!', {
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

// Offer popups routes (mock data)
app.get('/api/offer-popups', (req, res) => {
  console.log('📋 Offer popups route hit!');
  res.json({
    success: true,
    popups: [],
    totalPages: 0,
    currentPage: 1,
    total: 0
  });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log('🚀 Simple Upload Server Started!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log('📋 Available routes:');
  console.log('  GET  /api/upload/test');
  console.log('  POST /api/upload/popup-image');
  console.log('  GET  /api/offer-popups');
  console.log('');
  console.log('🧪 Ready for testing!');
});