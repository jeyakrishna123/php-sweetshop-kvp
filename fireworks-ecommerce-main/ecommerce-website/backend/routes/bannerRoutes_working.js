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
  uploadBannerWorking
} from '../controllers/bannerController_working.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveBanners);
router.get('/:id', getBannerById);

// WORKING: Admin routes with proper multer configuration
router.get('/', isAuthenticated, isAdmin, getAllBanners);
router.post('/', isAuthenticated, isAdmin, uploadBannerWorking, createBanner);
router.put('/:id', isAuthenticated, isAdmin, uploadBannerWorking, updateBanner);
router.delete('/:id', isAuthenticated, isAdmin, deleteBanner);
router.post('/reorder', isAuthenticated, isAdmin, reorderBanners);
router.patch('/:id/toggle', isAuthenticated, isAdmin, toggleBannerStatus);

export default router;
