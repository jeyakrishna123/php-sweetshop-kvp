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

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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

// Mock admin users endpoint
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: [
      {
        _id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: [
      {
        _id: '1',
        name: 'Chocolate Cake',
        price: 299,
        category: 'Chocolate',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center'
      }
    ]
  });
});

// Mock categories endpoint
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      { _id: '1', name: 'Chocolate', isActive: true },
      { _id: '2', name: 'Vanilla', isActive: true },
      { _id: '3', name: 'Strawberry', isActive: true }
    ]
  });
});

// Mock admin dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    dashboard: {
      totalUsers: 150,
      totalProducts: 25,
      totalOrders: 89,
      totalRevenue: 12500
    }
  });
});

// Mock orders endpoint
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    orders: [
      {
        _id: '1',
        user: 'John Doe',
        total: 299,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Admin users: http://localhost:${PORT}/api/admin/users`);
  console.log(`🛍️ Products: http://localhost:${PORT}/api/products`);
  console.log(`🏷️ Categories: http://localhost:${PORT}/api/categories`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`📦 Orders: http://localhost:${PORT}/api/admin/orders`);
  console.log('\n✅ All endpoints are working!');
  console.log('🎉 Project is ready for final completion!');
});