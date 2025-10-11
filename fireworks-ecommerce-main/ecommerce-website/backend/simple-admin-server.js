const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Fixed for admin panel
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

// Admin Users
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: [
      { _id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { _id: '2', name: 'John Doe', email: 'john@example.com', role: 'user' }
    ]
  });
});

// Admin Dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    dashboard: { totalUsers: 150, totalProducts: 25, totalOrders: 89 }
  });
});

// Products
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: [
      { _id: '1', name: 'Chocolate Cake', price: 299, category: 'Chocolate' }
    ]
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      { _id: '1', name: 'Chocolate', isActive: true },
      { _id: '2', name: 'Vanilla', isActive: true }
    ]
  });
});

// Admin Orders
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    orders: [
      { _id: '1', user: 'John Doe', total: 299, status: 'completed' }
    ]
  });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'mock-token',
    user: { _id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' }
  });
});

app.get('/api/auth/verify-admin', (req, res) => {
  res.json({
    success: true,
    user: { _id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('✅ All admin endpoints ready!');
});
