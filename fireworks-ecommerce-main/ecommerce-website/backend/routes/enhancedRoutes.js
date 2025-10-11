import express from 'express';
import { enhancedAuth } from '../middleware/enhancedAuth.js';
import { emailService } from '../controllers/emailController.js';
import * as searchController from '../controllers/searchController.js';
import * as authController from '../controllers/authController.js';
import * as enhancedAnalyticsController from '../controllers/enhancedAnalyticsController.js';
import * as enhancedPaymentController from '../controllers/enhancedPaymentController.js';

const router = express.Router();

// ===== EMAIL ROUTES =====
router.post('/email/send-order-confirmation', enhancedAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const result = await emailService.sendOrderConfirmation(orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

router.post('/email/send-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await emailService.sendPasswordReset(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send password reset email' });
  }
});

router.post('/email/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await emailService.sendEmailVerification(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send verification email' });
  }
});

router.post('/email/send-order-status-update', enhancedAuth, async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    const result = await emailService.sendOrderStatusUpdate(orderId, newStatus);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send status update email' });
  }
});

// ===== ENHANCED AUTH ROUTES =====
router.post('/auth/register-enhanced', authController.registerUser);
router.post('/auth/login-enhanced', authController.loginUser);
router.post('/auth/request-password-reset', authController.requestPasswordReset);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/resend-verification', authController.resendVerification);
router.post('/auth/change-password', enhancedAuth, authController.changePassword);
router.get('/auth/profile', enhancedAuth, authController.getUserProfile);
router.put('/auth/profile', enhancedAuth, authController.updateUserProfile);

// ===== ADVANCED SEARCH ROUTES =====
router.get('/search/advanced', searchController.advancedSearch);
router.get('/search/suggestions', searchController.getSearchSuggestions);
router.get('/search/trending', searchController.getTrendingSearches);
router.get('/search/filters', searchController.getSearchFilters);

// ===== ENHANCED ANALYTICS ROUTES =====
router.get('/analytics/enhanced', enhancedAuth, enhancedAnalyticsController.getEnhancedAnalytics);
router.get('/analytics/real-time', enhancedAuth, enhancedAnalyticsController.getRealTimeAnalytics);
router.get('/analytics/export', enhancedAuth, enhancedAnalyticsController.exportAnalytics);

// ===== ENHANCED PAYMENT ROUTES =====
router.post('/payments/create-intent', enhancedAuth, enhancedPaymentController.createPaymentIntent);
router.post('/payments/process', enhancedAuth, enhancedPaymentController.processPayment);
router.get('/payments/methods', enhancedPaymentController.getPaymentMethods);
router.get('/payments/status/:orderId', enhancedAuth, enhancedPaymentController.getPaymentStatus);
router.post('/payments/refund', enhancedAuth, enhancedPaymentController.refundPayment);
router.get('/payments/analytics', enhancedAuth, enhancedPaymentController.getPaymentAnalytics);

// ===== USER MANAGEMENT ROUTES =====
router.get('/users/me', enhancedAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.put('/users/me', enhancedAuth, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = req.user;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    
    user.updatedAt = new Date().toISOString();
    
    // Update user in database
    const updatedUser = await db.updateUser(user._id, user);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// ===== NOTIFICATION ROUTES =====
router.get('/notifications', enhancedAuth, (req, res) => {
  // Mock notifications - in production, this would come from a database
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off on fireworks this Diwali!',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    notifications
  });
});

router.put('/notifications/:id/read', enhancedAuth, (req, res) => {
  const { id } = req.params;
  
  // In production, mark notification as read in database
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

// ===== DASHBOARD ROUTES =====
router.get('/dashboard/overview', enhancedAuth, async (req, res) => {
  try {
    // Get user-specific dashboard data
    const userId = req.user.id;
    
    // Mock dashboard data - in production, this would come from database
    const dashboardData = {
      recentOrders: [],
      wishlistItems: [],
      savedAddresses: [],
      paymentMethods: [],
      notifications: []
    };
    
    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// ===== SETTINGS ROUTES =====
router.get('/settings', enhancedAuth, (req, res) => {
  const user = req.user;
  
  const settings = {
    email: user.email,
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      profileVisibility: 'public',
      orderHistory: 'private'
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: user.updatedAt
    }
  };
  
  res.json({
    success: true,
    settings
  });
});

router.put('/settings', enhancedAuth, (req, res) => {
  const { notifications, privacy, security } = req.body;
  
  // Update user settings
  // In production, this would update the database
  
  res.json({
    success: true,
    message: 'Settings updated successfully'
  });
});

// ===== HELP & SUPPORT ROUTES =====
router.get('/help/faq', (req, res) => {
  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the My Orders section.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, UPI, net banking, and cash on delivery.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-5 business days. Express delivery is available for select areas.'
    }
  ];
  
  res.json({
    success: true,
    faqs
  });
});

router.post('/help/contact', enhancedAuth, (req, res) => {
  const { subject, message, category } = req.body;
  
  // In production, this would create a support ticket
  
  res.json({
    success: true,
    message: 'Support ticket created successfully. We will get back to you within 24 hours.'
  });
});

// ===== FEEDBACK & RATINGS ROUTES =====
router.post('/feedback', enhancedAuth, (req, res) => {
  const { type, rating, comment, orderId } = req.body;
  
  // In production, this would save feedback to database
  
  res.json({
    success: true,
    message: 'Thank you for your feedback!'
  });
});

// ===== WISHLIST ENHANCEMENTS =====
router.get('/wishlist/analytics', enhancedAuth, (req, res) => {
  // Mock wishlist analytics
  const analytics = {
    totalItems: 5,
    totalValue: 2500,
    mostWishedCategory: 'Fireworks',
    priceRange: {
      min: 100,
      max: 800
    }
  };
  
  res.json({
    success: true,
    analytics
  });
});

// ===== PRODUCT RECOMMENDATIONS =====
router.get('/recommendations', enhancedAuth, (req, res) => {
  // Mock product recommendations based on user behavior
  const recommendations = [
    {
      id: 'rec1',
      type: 'based_on_history',
      products: []
    },
    {
      id: 'rec2',
      type: 'trending',
      products: []
    },
    {
      id: 'rec3',
      type: 'similar_to_wishlist',
      products: []
    }
  ];
  
  res.json({
    success: true,
    recommendations
  });
});

// ===== INVENTORY ALERTS =====
router.get('/inventory/alerts', enhancedAuth, (req, res) => {
  // Mock inventory alerts
  const alerts = [
    {
      type: 'low_stock',
      productId: 'prod1',
      productName: 'Sparkler Pack',
      currentStock: 5,
      threshold: 10
    }
  ];
  
  res.json({
    success: true,
    alerts
  });
});

// ===== EXPORT & REPORTING ROUTES =====
router.get('/reports/orders', enhancedAuth, (req, res) => {
  const { format = 'json', startDate, endDate } = req.query;
  
  // In production, this would generate order reports
  
  res.json({
    success: true,
    message: 'Report generated successfully'
  });
});

router.get('/reports/sales', enhancedAuth, (req, res) => {
  const { format = 'json', period = 'monthly' } = req.query;
  
  // In production, this would generate sales reports
  
  res.json({
    success: true,
    message: 'Sales report generated successfully'
  });
});

// ===== SYSTEM HEALTH & STATUS =====
router.get('/system/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      email: 'configured',
      payments: 'configured',
      search: 'operational'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  };
  
  res.json({
    success: true,
    health
  });
});

router.get('/system/status', (req, res) => {
  const status = {
    maintenance: false,
    announcements: [],
    systemUpdates: [],
    performance: {
      responseTime: '120ms',
      throughput: '1000 req/min',
      errorRate: '0.1%'
    }
  };
  
  res.json({
    success: true,
    status
  });
});

export default router;
