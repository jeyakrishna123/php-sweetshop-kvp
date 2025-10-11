import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import {
  getAdvancedAnalytics,
  generateReport
} from '../controllers/advancedAnalyticsController.js';

const router = express.Router();

// Get advanced analytics dashboard
router.get('/dashboard', isAuthenticated, isAdmin, getAdvancedAnalytics);

// Generate comprehensive reports
router.post('/reports/generate', isAuthenticated, isAdmin, generateReport);

// Get real-time analytics
router.get('/realtime', isAuthenticated, isAdmin, getAdvancedAnalytics);

// Get sales analytics
router.get('/sales', isAuthenticated, isAdmin, (req, res) => {
  // This would call generateReport with sales type
  res.json({ message: 'Sales analytics endpoint' });
});

// Get customer analytics
router.get('/customers', isAuthenticated, isAdmin, (req, res) => {
  // This would call generateReport with customer type
  res.json({ message: 'Customer analytics endpoint' });
});

// Get product analytics
router.get('/products', isAuthenticated, isAdmin, (req, res) => {
  // This would call generateReport with product type
  res.json({ message: 'Product analytics endpoint' });
});

// Get financial analytics
router.get('/financial', isAuthenticated, isAdmin, (req, res) => {
  // This would call generateReport with financial type
  res.json({ message: 'Financial analytics endpoint' });
});

export default router;
