import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import {
  getInventory,
  updateStock,
  bulkUpdateStock,
  getInventorySummary,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventoryAnalytics
} from '../controllers/inventoryController.js';

const router = express.Router();

// Get comprehensive inventory data
router.get('/', isAuthenticated, isAdmin, getInventory);

// Get inventory summary
router.get('/summary', isAuthenticated, isAdmin, getInventorySummary);

// Get low stock products
router.get('/low-stock', isAuthenticated, isAdmin, getLowStockProducts);

// Get out of stock products
router.get('/out-of-stock', isAuthenticated, isAdmin, getOutOfStockProducts);

// Get inventory analytics
router.get('/analytics', isAuthenticated, isAdmin, getInventoryAnalytics);

// Update single product stock
router.put('/stock', isAuthenticated, isAdmin, updateStock);

// Bulk update stock
router.put('/bulk-stock', isAuthenticated, isAdmin, bulkUpdateStock);

export default router;
