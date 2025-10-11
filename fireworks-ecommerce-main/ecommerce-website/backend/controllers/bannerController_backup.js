import bannerModel from '../models/Banner.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for banner image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/banners');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// DEFINITIVE FIX: Main upload configuration - accepts ANY field name
export const uploadBanner = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Allow up to 10 files
  }
}).any(); // CRITICAL: .any() accepts ANY field name - NO "Unexpected field" errors

// DEFINITIVE FIX: Multer configuration that accepts ANY field name
export const uploadBannerFlexible = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Allow up to 10 files
  }
}).any(); // Use .any() to accept ANY field name - this will fix the "Unexpected field" error

// WORKING: Alternative configuration using fields
export const uploadBannerSimple2 = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'mobileImage', maxCount: 1 },
  { name: 'desktopImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// NEW: Completely different approach - use fields to match frontend
export const uploadBannerNew = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'mobileImage', maxCount: 1 },
  { name: 'desktopImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// WORKING: Alternative approach - use fields instead of any
export const uploadBannerFields = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'mobileImage', maxCount: 1 },
  { name: 'desktopImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  console.error('🚨 Multer Error:', err);
  console.error('🚨 Error Code:', err?.code);
  console.error('🚨 Error Field:', err?.field);
  console.error('🚨 Error Message:', err?.message);
  console.error('🚨 Request Body Keys:', Object.keys(req.body || {}));
  console.error('🚨 Request Files:', req.files);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.error('🚨 Unexpected field error:', err.field);
      console.error('🚨 This should NOT happen with .any() configuration!');
      return res.status(400).json({
        success: false,
        message: `Unexpected field: ${err.field}. This error should not occur with the current configuration.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many parts in the request.'
      });
    }
  }
  
  // Handle file filter errors
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  next(err);
};

// Simple upload configuration for banners
export const uploadBannerSimple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'mobileImage', maxCount: 1 },
  { name: 'desktopImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

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
      return true; // Skip file system check for now
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

// Create new banner
export const createBanner = async (req, res) => {
  try {
    console.log('📝 Banner creation request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    console.log('📄 Single file:', req.file);
    console.log('🔍 Files type:', typeof req.files);
    console.log('🔍 Files is array:', Array.isArray(req.files));
    
    // Log files structure for debugging
    if (req.files) {
      if (Array.isArray(req.files)) {
        console.log('🔍 Files array details:', req.files.map(file => ({ 
          fieldname: file.fieldname, 
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        })));
      } else {
        console.log('🔍 Files object details:', Object.keys(req.files).map(key => ({
          field: key,
          files: req.files[key].map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          }))
        })));
      }
    }
    
    // Check for multer errors
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError
      });
    }
    
    const { title, description, linkUrl, isActive = true, displayOrder = 0, deviceType = 'both' } = req.body;
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Banner title is required'
      });
    }
    
    // Handle multiple image uploads - DEFINITIVE FIX for .any() format
    let mobileImageUrl = null;
    let desktopImageUrl = null;
    let imageUrl = null;
    
    console.log('🔍 Processing files...');
    console.log('📁 req.files:', req.files);
    console.log('📄 req.file:', req.file);
    console.log('🔍 Files type:', typeof req.files);
    console.log('🔍 Files is array:', Array.isArray(req.files));
    
    if (req.files && Array.isArray(req.files)) {
      // Handle .any() format - files are in an array
      console.log('📋 Processing files array with', req.files.length, 'files');
      
      req.files.forEach((file, index) => {
        const fileUrl = `/uploads/banners/${file.filename}`;
        console.log(`📄 File ${index + 1}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        });
        
        // Assign files based on field name
        if (file.fieldname === 'mobileImage') {
          mobileImageUrl = fileUrl;
          console.log('✅ Mobile image processed:', mobileImageUrl);
        } else if (file.fieldname === 'desktopImage') {
          desktopImageUrl = fileUrl;
          console.log('✅ Desktop image processed:', desktopImageUrl);
        } else if (file.fieldname === 'image') {
          imageUrl = fileUrl;
          console.log('✅ Image processed:', imageUrl);
        } else if (file.fieldname === 'bannerImage') {
          imageUrl = fileUrl;
          console.log('✅ Banner image processed:', imageUrl);
        } else if (file.fieldname === 'file') {
          imageUrl = fileUrl;
          console.log('✅ File processed:', imageUrl);
        } else {
          // For any other field name, treat as general image
          imageUrl = fileUrl;
          console.log('✅ Unknown field processed as image:', file.fieldname, imageUrl);
        }
      });
    } else if (req.files && !Array.isArray(req.files)) {
      // Handle .fields() format - files are in an object
      console.log('📋 Processing files object');
      
      if (req.files.mobileImage && req.files.mobileImage[0]) {
        mobileImageUrl = `/uploads/banners/${req.files.mobileImage[0].filename}`;
        console.log('✅ Mobile image processed:', mobileImageUrl);
      }
      if (req.files.desktopImage && req.files.desktopImage[0]) {
        desktopImageUrl = `/uploads/banners/${req.files.desktopImage[0].filename}`;
        console.log('✅ Desktop image processed:', desktopImageUrl);
      }
      if (req.files.image && req.files.image[0]) {
        imageUrl = `/uploads/banners/${req.files.image[0].filename}`;
        console.log('✅ Image processed:', imageUrl);
      }
    }
    
    // Fallback for single file upload
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
      console.log('✅ Single file processed:', imageUrl);
    }
    
    console.log('📊 Final URLs:', { mobileImageUrl, desktopImageUrl, imageUrl });

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
      imageUrl: imageUrl || (mobileImageUrl || desktopImageUrl), // Fallback to any available image
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
    console.error('🚨 Error creating banner:', error);
    
    // Handle specific error types
    if (error.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + error.message
      });
    }
    
    if (error.code === 'ENOENT') {
      return res.status(500).json({
        success: false,
        message: 'File system error: Directory not found'
      });
    }
    
    if (error.code === 'EACCES') {
      return res.status(500).json({
        success: false,
        message: 'Permission denied: Cannot write to uploads directory'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create banner',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, linkUrl, isActive, displayOrder, deviceType } = req.body;
    
    // Handle multiple image uploads - flexible approach  
    let mobileImageUrl = null;
    let desktopImageUrl = null;
    let imageUrl = null;
    
    if (req.files) {
      // Handle flexible file uploads (when using .any() - files are in an array)
      if (Array.isArray(req.files)) {
        req.files.forEach(file => {
          const fileUrl = `/uploads/banners/${file.filename}`;
          if (file.fieldname === 'mobileImage') {
            mobileImageUrl = fileUrl;
          } else if (file.fieldname === 'desktopImage') {
            desktopImageUrl = fileUrl;
          } else if (file.fieldname === 'image') {
            imageUrl = fileUrl;
          }
        });
      } else {
        // Handle fields file uploads (when using .fields())
        if (req.files.mobileImage && req.files.mobileImage[0]) {
          mobileImageUrl = `/uploads/banners/${req.files.mobileImage[0].filename}`;
        }
        if (req.files.desktopImage && req.files.desktopImage[0]) {
          desktopImageUrl = `/uploads/banners/${req.files.desktopImage[0].filename}`;
        }
        if (req.files.image && req.files.image[0]) {
          imageUrl = `/uploads/banners/${req.files.image[0].filename}`;
        }
      }
    }
    
    // Fallback for single file upload
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
