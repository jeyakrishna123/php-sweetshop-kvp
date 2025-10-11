import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get analytics data (admin only)
router.get('/admin/analytics', isAuthenticated, isAdmin, getAnalytics);

export default router;
