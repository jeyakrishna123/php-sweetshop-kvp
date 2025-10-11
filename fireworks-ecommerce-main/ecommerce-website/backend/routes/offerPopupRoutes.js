import express from 'express';
const router = express.Router();
import {
  getAllOfferPopups,
  getActiveOfferPopup,
  getOfferPopupById,
  createOfferPopup,
  updateOfferPopup,
  deleteOfferPopup,
  toggleOfferPopupStatus
} from '../controllers/offerPopupController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

// Public route - Get active offer popup
router.get('/active', getActiveOfferPopup);

// Admin routes
router.get('/', isAuthenticated, isAdmin, getAllOfferPopups);
router.get('/:id', isAuthenticated, isAdmin, getOfferPopupById);
router.post('/', isAuthenticated, isAdmin, createOfferPopup);
router.put('/:id', isAuthenticated, isAdmin, updateOfferPopup);
router.delete('/:id', isAuthenticated, isAdmin, deleteOfferPopup);
router.patch('/:id/toggle', isAuthenticated, isAdmin, toggleOfferPopupStatus);

export default router;
