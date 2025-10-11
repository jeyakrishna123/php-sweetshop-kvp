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
  uploadBannerFixed
} from '../controllers/bannerController_fixed.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveBanners);
router.get('/:id', getBannerById);

// FIXED: Admin routes with proper multer configuration
router.get('/', isAuthenticated, isAdmin, getAllBanners);
router.post('/', isAuthenticated, isAdmin, uploadBannerFixed, createBanner);
router.put('/:id', isAuthenticated, isAdmin, uploadBannerFixed, updateBanner);
router.delete('/:id', isAuthenticated, isAdmin, deleteBanner);
router.post('/reorder', isAuthenticated, isAdmin, reorderBanners);
router.patch('/:id/toggle', isAuthenticated, isAdmin, toggleBannerStatus);

export default router;
