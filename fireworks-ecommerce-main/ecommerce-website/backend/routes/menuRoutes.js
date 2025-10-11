import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import {
  getAllMenuItems,
  getActiveMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemsOrder
} from '../controllers/menuController.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/active', getActiveMenuItems);

// Admin routes (authentication required)
router.get('/', isAuthenticated, isAdmin, getAllMenuItems);
router.get('/:id', isAuthenticated, isAdmin, getMenuItemById);
router.post('/', isAuthenticated, isAdmin, createMenuItem);
router.put('/:id', isAuthenticated, isAdmin, updateMenuItem);
router.delete('/:id', isAuthenticated, isAdmin, deleteMenuItem);
router.put('/order/update', isAuthenticated, isAdmin, updateMenuItemsOrder);

export default router;
