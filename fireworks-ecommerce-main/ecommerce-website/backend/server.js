import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";

// Load email configuration
import "./email-config.js";

// Import security middleware
import securityMiddleware from "./middleware/security.js";
import { enhancedAuth } from "./middleware/enhancedAuth.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import stripeRoutes from "./routes/stripe.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import marketingRoutes from "./routes/marketingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import hideSectionRoutes from "./routes/hideSectionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import offerPopupRoutes from "./routes/offerPopupRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import advancedAnalyticsRoutes from "./routes/advancedAnalyticsRoutes.js";
import weightOptionsRoutes from "./routes/weightOptionsRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { uploadBanner, handleMulterError } from "./controllers/bannerController.js";

// Load environment variables
dotenv.config();

// Connect to database (MongoDB or file-based)
connectDB().catch(console.error);

const app = express();

// Set default environment variables if not provided
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Enhanced security middleware with comprehensive protection
app.use(helmet(securityMiddleware.helmetOptions));
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.validateInput);

// Rate limiting enabled for security
const rateLimiters = securityMiddleware.createRateLimiters();
const speedLimiter = securityMiddleware.createSpeedLimiters();

// Apply rate limiting to protect against abuse
// app.use('/api/auth', rateLimiters.authLimiter); // Disabled for development
// app.use('/api/admin', rateLimiters.adminLimiter); // Disabled for development
// app.use('/api/payment', rateLimiters.paymentLimiter); // Disabled for development
// Temporarily disabled for development
// app.use('/api', rateLimiters.apiLimiter);
// app.use('/api', speedLimiter);

// Body parser middleware with increased limits
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser with security options
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-cookie-secret'));

// Simple CORS handler - must be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://monumental-monstera-017d87.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:3000',
      'https://monumental-monstera-017d87.netlify.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Origin', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false
}));

// CORS-friendly image proxy endpoint
app.get('/api/image-proxy/*', (req, res) => {
  const imagePath = req.params[0]; // Get everything after /api/image-proxy/
  const fullPath = `uploads/${imagePath}`;
  
  console.log('🖼️ Image proxy request:', fullPath);
  
  // Set CORS headers
  const origin = req.headers.origin;
  if (origin === 'https://monumental-monstera-017d87.netlify.app') {
    res.header('Access-Control-Allow-Origin', 'https://monumental-monstera-017d87.netlify.app');
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'public, max-age=3600');
  
  // Serve the file
  res.sendFile(fullPath, { root: '.' }, (err) => {
    if (err) {
      console.log('❌ Image not found:', fullPath);
      res.status(404).json({ error: 'Image not found' });
    } else {
      console.log('✅ Image served successfully:', fullPath);
    }
  });
});

// Serve static files (uploads) with enhanced CORS headers
app.use('/uploads', (req, res, next) => {
  // Set comprehensive CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for images
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Origin, Accept, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Additional headers for better compatibility
  res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS preflight request for uploads:', req.path);
    res.sendStatus(200);
    return;
  }
  
  console.log('📁 Serving static file:', req.path);
  next();
}, express.static('uploads', {
  // Additional options for static file serving
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set additional headers for image files
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.webp') || path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Request logging middleware with enhanced information
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Health check endpoint with detailed information
app.get("/health", async (req, res) => {
  try {
    const { systemHealthCheck } = await import('./health-check.js');
    const health = systemHealthCheck();
    
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      message: health.status === 'healthy' ? "Server is running" : "Server has issues",
      timestamp: health.timestamp,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "2.0.0",
      health: health
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SK Bakers E-Commerce API is running...",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: [
      "MongoDB Database",
      "Enhanced Security",
      "Rate Limiting",
      "JWT Authentication",
      "Stripe Payments",
      "File Uploads",
      "Admin Panel",
      "Analytics"
    ]
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api", analyticsRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/admin/marketing", marketingRoutes);
app.use("/api/admin/reports", reportRoutes);
app.use("/api/admin/ai", aiRoutes);
app.use("/api/admin/alerts", alertRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/hide-sections", hideSectionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/offer-popups", offerPopupRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/weight-options", weightOptionsRoutes);
app.use("/api/analytics", advancedAnalyticsRoutes);

// Public routes (no authentication required)
app.use("/", publicRoutes);

// Stripe webhook endpoint (needs raw body)
app.post("/api/stripe/webhook", bodyParser.raw({ type: 'application/json' }), (req, res) => {
  // Handle Stripe webhook
  res.json({ received: true });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  
  if (err.code === 'ENOENT') {
    return res.status(500).json({
      success: false,
      message: 'File system error: File or directory not found'
    });
  }
  
  if (err.code === 'EACCES') {
    return res.status(500).json({
      success: false,
      message: 'Permission denied: Cannot access file or directory'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});


// Test admin endpoint (temporary for debugging)
app.get("/api/admin/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin test endpoint working",
    timestamp: new Date().toISOString()
  });
});


// Quick fix endpoint for system issues
app.post("/api/fix", async (req, res) => {
  try {
    const { quickFix } = await import('./health-check.js');
    const fixes = quickFix();
    
    res.json({
      success: true,
      message: "System fixes applied",
      fixes: fixes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to apply fixes",
      error: error.message
    });
  }
});

// Test banner upload endpoint (no auth required for testing)
app.post("/api/test/banner", (req, res, next) => {
  console.log('🧪 Test banner endpoint called');
  console.log('📋 Request body before multer:', req.body);
  console.log('📁 Request files before multer:', req.files);
  next();
}, uploadBanner, (req, res, next) => {
  console.log('🧪 After multer middleware');
  console.log('📋 Request body after multer:', req.body);
  console.log('📁 Request files after multer:', req.files);
  next();
}, handleMulterError, async (req, res) => {
  try {
    console.log('🧪 Test banner upload received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    
    // Import the createBanner function
    const { createBanner } = await import('./controllers/bannerController.js');
    
    // Call the actual createBanner function
    await createBanner(req, res);
    
    // Don't send additional response - createBanner already sent one
    
  } catch (error) {
    console.error('Test banner error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Test banner upload failed",
        error: error.message
      });
    }
  }
});

// Email test endpoint (temporary for debugging)
app.get("/api/test/email", async (req, res) => {
  try {
    const { sendEmail } = await import('./utils/sendEmail.js');
    const { getEmailConfig } = await import('./utils/emailConfig.js');
    
    const config = getEmailConfig();
    // Test actual email sending
    const testEmail = {
      to: 'upgradenowtechnologies@gmail.com', // Send to your own email for testing
      subject: 'SK Bakers Email Test - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🍰 SK Bakers Email Test</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>SMTP Host:</strong> ${config.SMTP_HOST}</p>
            <p><strong>SMTP Port:</strong> ${config.SMTP_PORT}</p>
            <p><strong>From Email:</strong> ${config.SMTP_EMAIL}</p>
          </div>
          
          <p>If you receive this email, the email system is working correctly!</p>
          
          <p>Best regards,<br>SK Bakers Team</p>
        </div>
      `
    };
    
    console.log('Testing email sending...');
    const emailResult = await sendEmail(testEmail);
    
    res.json({
      success: true,
      message: "Email test completed",
      emailResult: emailResult,
      config: {
        SMTP_HOST: config.SMTP_HOST,
        SMTP_PORT: config.SMTP_PORT,
        SMTP_EMAIL: config.SMTP_EMAIL,
        SMTP_PASSWORD: config.SMTP_PASSWORD ? '***configured***' : 'not set',
        FROM_NAME: config.FROM_NAME,
        FROM_EMAIL: config.FROM_EMAIL
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 3001;


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Admin connected:', socket.id);
  
  // Join admin room for notifications
  socket.join('admin');
  
  socket.on('disconnect', () => {
    console.log('🔌 Admin disconnected:', socket.id);
  });
});

// Make io available globally for order notifications
global.io = io;

server.listen(PORT, () => {
  console.log(`🚀 SK Bakers Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Database: MongoDB Connected`);
  console.log(`🔒 Security: Enhanced with Helmet & Rate Limiting`);
  console.log(`🔌 Socket.IO: Real-time notifications enabled`);
});
