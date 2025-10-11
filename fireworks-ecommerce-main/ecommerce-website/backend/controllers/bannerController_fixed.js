import bannerModel from '../models/Banner.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for banner image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/banners');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// FIXED: Multer configuration that properly handles mixed content
export const uploadBannerFixed = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only process actual image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // Skip non-image fields (text data) without error
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).any();

// Get all banners (admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = bannerModel.getAllBanners();
    res.json({
      success: true,
      banners: banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
};

// Get active banners (public)
export const getActiveBanners = async (req, res) => {
  try {
    const banners = bannerModel.getActiveBanners();
    
    // Filter out banners with missing images
    const validBanners = banners.filter(banner => {
      if (!banner.imageUrl) return false;
      return true;
    });
    
    res.json({
      success: true,
      banners: validBanners
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
};

// Get single banner
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = bannerModel.getBannerById(id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      banner: banner
    });
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner'
    });
  }
};

// FIXED: Create new banner
export const createBanner = async (req, res) => {
  try {
    console.log('📝 Banner creation request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    
    const { title, description, linkUrl, isActive = true, displayOrder = 0, deviceType = 'both' } = req.body;
    
    // FIXED: Handle file uploads properly
    let mobileImageUrl = null;
    let desktopImageUrl = null;
    let imageUrl = null;
    
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.fieldname === 'mobileImage') {
          mobileImageUrl = `/uploads/banners/${file.filename}`;
        } else if (file.fieldname === 'desktopImage') {
          desktopImageUrl = `/uploads/banners/${file.filename}`;
        } else if (file.fieldname === 'image') {
          imageUrl = `/uploads/banners/${file.filename}`;
        }
      });
    }
    
    // Fallback for single file upload
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    // Validate based on device type
    if (deviceType === 'mobile' && !mobileImageUrl && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Mobile banner image is required'
      });
    }
    if (deviceType === 'desktop' && !desktopImageUrl && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Desktop banner image is required'
      });
    }
    if (deviceType === 'both' && !mobileImageUrl && !desktopImageUrl && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'At least one banner image is required'
      });
    }

    const bannerData = {
      title: title || '',
      description: description || '',
      imageUrl: imageUrl || (mobileImageUrl || desktopImageUrl),
      mobileImageUrl: mobileImageUrl || null,
      desktopImageUrl: desktopImageUrl || null,
      linkUrl: linkUrl || '',
      isActive: isActive === 'true' || isActive === true,
      displayOrder: parseInt(displayOrder) || 0,
      deviceType: deviceType || 'both'
    };

    const newBanner = bannerModel.createBanner(bannerData);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: newBanner
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create banner'
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, linkUrl, isActive, displayOrder, deviceType } = req.body;
    
    // Handle file uploads
    let mobileImageUrl = null;
    let desktopImageUrl = null;
    let imageUrl = null;
    
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.fieldname === 'mobileImage') {
          mobileImageUrl = `/uploads/banners/${file.filename}`;
        } else if (file.fieldname === 'desktopImage') {
          desktopImageUrl = `/uploads/banners/${file.filename}`;
        } else if (file.fieldname === 'image') {
          imageUrl = `/uploads/banners/${file.filename}`;
        }
      });
    }
    
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    // Check if banner exists
    const existingBanner = bannerModel.getBannerById(id);
    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder) || 0;
    if (deviceType !== undefined) updateData.deviceType = deviceType;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (mobileImageUrl) updateData.mobileImageUrl = mobileImageUrl;
    if (desktopImageUrl) updateData.desktopImageUrl = desktopImageUrl;

    const updatedBanner = bannerModel.updateBanner(id, updateData);

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner: updatedBanner
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update banner'
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    bannerModel.deleteBanner(id);

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete banner'
    });
  }
};

// Reorder banners
export const reorderBanners = async (req, res) => {
  try {
    const { bannerIds } = req.body;

    if (!Array.isArray(bannerIds)) {
      return res.status(400).json({
        success: false,
        message: 'bannerIds must be an array'
      });
    }

    const reorderedBanners = bannerModel.reorderBanners(bannerIds);

    res.json({
      success: true,
      message: 'Banners reordered successfully',
      banners: reorderedBanners
    });
  } catch (error) {
    console.error('Error reordering banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder banners'
    });
  }
};

// Toggle banner status
export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = bannerModel.getBannerById(id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const updatedBanner = bannerModel.updateBanner(id, {
      isActive: !banner.isActive
    });

    res.json({
      success: true,
      message: `Banner ${updatedBanner.isActive ? 'activated' : 'deactivated'} successfully`,
      banner: updatedBanner
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status'
    });
  }
};
