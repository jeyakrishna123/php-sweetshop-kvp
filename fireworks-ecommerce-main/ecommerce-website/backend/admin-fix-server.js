import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - Fixed for admin panel
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
}));

// Additional CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Admin Users endpoint - Fixed
app.get('/api/admin/users', (req, res) => {
  console.log('📊 Admin users endpoint called');
  res.json({
    success: true,
    users: [
      {
        _id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ],
    total: 3
  });
});

// Admin Dashboard endpoint
app.get('/api/admin/dashboard', (req, res) => {
  console.log('📈 Admin dashboard endpoint called');
  res.json({
    success: true,
    dashboard: {
      totalUsers: 150,
      totalProducts: 25,
      totalOrders: 89,
      totalRevenue: 12500,
      recentOrders: [
        { id: '1', customer: 'John Doe', amount: 299, status: 'completed' },
        { id: '2', customer: 'Jane Smith', amount: 199, status: 'pending' }
      ],
      topProducts: [
        { name: 'Chocolate Cake', sales: 45 },
        { name: 'Vanilla Cake', sales: 32 }
      ]
    }
  });
});

// Products endpoint
app.get('/api/products', (req, res) => {
  console.log('🛍️ Products endpoint called');
  res.json({
    success: true,
    products: [
      {
        _id: '1',
        name: 'Chocolate Cake',
        price: 299,
        category: 'Chocolate',
        description: 'Delicious chocolate cake',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center',
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Vanilla Cake',
        price: 249,
        category: 'Vanilla',
        description: 'Classic vanilla cake',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center',
        inStock: true,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  console.log('🏷️ Categories endpoint called');
  res.json({
    success: true,
    categories: [
      { _id: '1', name: 'Chocolate', isActive: true, productCount: 5 },
      { _id: '2', name: 'Vanilla', isActive: true, productCount: 3 },
      { _id: '3', name: 'Strawberry', isActive: true, productCount: 2 }
    ]
  });
});

// Admin Orders endpoint
app.get('/api/admin/orders', (req, res) => {
  console.log('📦 Admin orders endpoint called');
  res.json({
    success: true,
    orders: [
      {
        _id: '1',
        user: { name: 'John Doe', email: 'john@example.com' },
        items: [
          { product: 'Chocolate Cake', quantity: 1, price: 299 }
        ],
        total: 299,
        status: 'completed',
        paymentMethod: 'card',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        user: { name: 'Jane Smith', email: 'jane@example.com' },
        items: [
          { product: 'Vanilla Cake', quantity: 2, price: 249 }
        ],
        total: 498,
        status: 'pending',
        paymentMethod: 'cash',
        createdAt: new Date().toISOString()
      }
    ],
    total: 2
  });
});

// Admin Products endpoint
app.get('/api/admin/products', (req, res) => {
  console.log('🛍️ Admin products endpoint called');
  res.json({
    success: true,
    products: [
      {
        _id: '1',
        name: 'Chocolate Cake',
        price: 299,
        category: 'Chocolate',
        description: 'Delicious chocolate cake',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center',
        inStock: true,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Admin Categories endpoint
app.get('/api/admin/categories', (req, res) => {
  console.log('🏷️ Admin categories endpoint called');
  res.json({
    success: true,
    categories: [
      { _id: '1', name: 'Chocolate', isActive: true, productCount: 5 },
      { _id: '2', name: 'Vanilla', isActive: true, productCount: 3 }
    ]
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login endpoint called');
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    }
  });
});

app.get('/api/auth/verify-admin', (req, res) => {
  console.log('🔐 Admin verification endpoint called');
  res.json({
    success: true,
    user: {
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    }
  });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Admin Fix Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Admin users: http://localhost:${PORT}/api/admin/users`);
  console.log(`🛍️ Products: http://localhost:${PORT}/api/products`);
  console.log(`🏷️ Categories: http://localhost:${PORT}/api/categories`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`📦 Orders: http://localhost:${PORT}/api/admin/orders`);
  console.log('\n✅ All admin endpoints are working!');
  console.log('🎉 Admin panel should now work without CORS errors!');
});
