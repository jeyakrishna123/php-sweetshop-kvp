import express from 'express';
import { 
  getAllBanners, 
  getActiveBanners, 
  getBannerById, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  reorderBanners, 
  toggleBannerStatus,
  upload,
  uploadBanner,
  handleMulterError
} from '../controllers/bannerController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveBanners);
router.get('/:id', getBannerById);

// Admin routes (protected)
router.get('/', isAuthenticated, isAdmin, getAllBanners);
router.post('/', isAuthenticated, isAdmin, uploadBanner, handleMulterError, createBanner);
router.put('/:id', isAuthenticated, isAdmin, uploadBanner, handleMulterError, updateBanner);
router.delete('/:id', isAuthenticated, isAdmin, deleteBanner);
router.post('/reorder', isAuthenticated, isAdmin, reorderBanners);
router.patch('/:id/toggle', isAuthenticated, isAdmin, toggleBannerStatus);

export default router;
