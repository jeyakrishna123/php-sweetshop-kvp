import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists - Fixed path calculation
const uploadsDir = path.join(__dirname, '../uploads/banners');
console.log('📁 Calculated uploads directory:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Multer destination called for:', file.originalname);
    console.log('📁 Upload directory:', uploadsDir);
    
    // Check if directory exists and is writable
    try {
      if (!fs.existsSync(uploadsDir)) {
        console.log('❌ Directory does not exist, creating...');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Test write access
      const testFile = path.join(uploadsDir, 'test-write.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Directory is writable');
      
      cb(null, uploadsDir);
    } catch (error) {
      console.error('❌ Directory error:', error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      console.log('📁 Multer filename generated:', filename);
      
      // Log the full path where file should be saved
      const fullPath = path.join(uploadsDir, filename);
      console.log('📁 Full file path:', fullPath);
      
      cb(null, filename);
    } catch (error) {
      console.error('❌ Filename generation error:', error);
      cb(error, null);
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// CLEAN CONFIGURATION: Only one Multer config that works
const multerInstance = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Allow up to 10 files
  },
  onError: (err, next) => {
    console.error('❌ Multer error:', err);
    next(err);
  }
});

// Create the upload middleware with debugging
export const uploadBanner = (req, res, next) => {
  console.log('🚀 uploadBanner middleware called');
  console.log('📋 Request headers:', req.headers);
  console.log('📋 Content-Type:', req.get('Content-Type'));
  
  const middleware = multerInstance.any();
  middleware(req, res, (err) => {
    console.log('🔄 Multer middleware completed');
    if (err) {
      console.error('❌ Multer middleware error:', err);
    } else {
      console.log('✅ Multer middleware success');
      console.log('📁 Files processed:', req.files?.length || 0);
    }
    next(err);
  });
};

// Alias for backward compatibility
export const upload = uploadBanner;

// Error handling middleware
export const handleMulterError = (err, req, res, next) => {
  console.error('🚨 Multer Error:', err);
  console.error('🚨 Error Code:', err?.code);
  console.error('🚨 Error Field:', err?.field);
  console.error('🚨 Error Message:', err?.message);
  
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
        message: `Unexpected field: ${err.field}. This error should not occur with .any() configuration.`
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

// Banner controller functions (simplified)
export const createBanner = async (req, res) => {
  try {
    console.log('🎯 Creating banner...');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    console.log('📄 Request file:', req.file);
    
    const { title, description, linkUrl, isActive, displayOrder, deviceType } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Banner title is required'
      });
    }
    
    // Process files from .any() format (array)
    let mobileImageUrl = null;
    let desktopImageUrl = null;
    let imageUrl = null;
    
    if (req.files && Array.isArray(req.files)) {
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
        } else {
          // For any other field name, treat as general image
          imageUrl = fileUrl;
          console.log('✅ Unknown field processed as image:', file.fieldname, imageUrl);
        }
      });
    }
    
    console.log('📊 Final URLs:', { mobileImageUrl, desktopImageUrl, imageUrl });
    
    // Load existing banners
    const banners = loadBanners();
    
    // Create banner object
    const banner = {
      _id: getNextId(banners).toString(),
      title,
      description: description || '',
      linkUrl: linkUrl || '',
      isActive: isActive === 'true' || isActive === true,
      displayOrder: parseInt(displayOrder) || 0,
      deviceType: deviceType || 'both',
      mobileImageUrl,
      desktopImageUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store banner in file
    banners.push(banner);
    const saved = saveBanners(banners);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save banner'
      });
    }
    
    console.log('✅ Banner created successfully:', banner);
    console.log('📊 Total banners now:', banners.length);
    
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: banner
    });
    
  } catch (error) {
    console.error('❌ Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message
    });
  }
};


// File-based storage for banners
const bannersFilePath = path.join(__dirname, '../data/banners.json');

// Helper functions for file operations
const loadBanners = () => {
  try {
    if (fs.existsSync(bannersFilePath)) {
      const data = fs.readFileSync(bannersFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading banners:', error);
    return [];
  }
};

const saveBanners = (banners) => {
  try {
    fs.writeFileSync(bannersFilePath, JSON.stringify(banners, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving banners:', error);
    return false;
  }
};

const getNextId = (banners) => {
  if (banners.length === 0) return 1;
  const maxId = Math.max(...banners.map(b => parseInt(b._id) || 0));
  return maxId + 1;
};

// Get all banners (admin)
export const getAllBanners = async (req, res) => {
  try {
    console.log('📋 Fetching all banners...');
    const banners = loadBanners();
    console.log('📊 Total banners:', banners.length);
    
    res.json({
      success: true,
      banners: banners.sort((a, b) => a.displayOrder - b.displayOrder)
    });
  } catch (error) {
    console.error('❌ Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
};

// Get active banners (public)
export const getActiveBanners = async (req, res) => {
  try {
    console.log('📋 Fetching active banners...');
    const banners = loadBanners();
    const activeBanners = banners.filter(banner => banner.isActive);
    console.log('📊 Active banners:', activeBanners.length);
    
    res.json({
      success: true,
      banners: activeBanners.sort((a, b) => a.displayOrder - b.displayOrder)
    });
  } catch (error) {
    console.error('❌ Error fetching active banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active banners'
    });
  }
};

// Get single banner
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Fetching banner by ID:', id);
    
    const banners = loadBanners();
    const banner = banners.find(b => b._id === id);
    
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
    console.error('❌ Error fetching banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner'
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Updating banner:', id);
    console.log('📋 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    
    const banners = loadBanners();
    const bannerIndex = banners.findIndex(b => b._id === id);
    
    if (bannerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    const { title, description, linkUrl, isActive, displayOrder, deviceType } = req.body;
    
    // Process files from .any() format (array)
    let mobileImageUrl = null;
    let desktopImageUrl = null;
    let imageUrl = null;
    
    if (req.files && Array.isArray(req.files)) {
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
        } else {
          // For any other field name, treat as general image
          imageUrl = fileUrl;
          console.log('✅ Unknown field processed as image:', file.fieldname, imageUrl);
        }
      });
    }
    
    // Update banner data
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
    
    updateData.updatedAt = new Date().toISOString();
    
    banners[bannerIndex] = { ...banners[bannerIndex], ...updateData };
    
    // Save to file
    const saved = saveBanners(banners);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save banner update'
      });
    }
    
    console.log('✅ Banner updated successfully:', banners[bannerIndex]);
    
    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner: banners[bannerIndex]
    });
    
  } catch (error) {
    console.error('❌ Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting banner:', id);
    
    const banners = loadBanners();
    const bannerIndex = banners.findIndex(b => b._id === id);
    
    if (bannerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    banners.splice(bannerIndex, 1);
    
    // Save to file
    const saved = saveBanners(banners);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save banner deletion'
      });
    }
    
    console.log('✅ Banner deleted successfully');
    
    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner'
    });
  }
};

// Reorder banners
export const reorderBanners = async (req, res) => {
  try {
    const { bannerIds } = req.body;
    console.log('🔄 Reordering banners:', bannerIds);
    
    if (!Array.isArray(bannerIds)) {
      return res.status(400).json({
        success: false,
        message: 'bannerIds must be an array'
      });
    }
    
    const banners = loadBanners();
    
    // Update display order based on the provided order
    bannerIds.forEach((id, index) => {
      const banner = banners.find(b => b._id === id);
      if (banner) {
        banner.displayOrder = index;
        banner.updatedAt = new Date().toISOString();
      }
    });
    
    // Save to file
    const saved = saveBanners(banners);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save banner reorder'
      });
    }
    
    console.log('✅ Banners reordered successfully');
    
    res.json({
      success: true,
      message: 'Banners reordered successfully',
      banners: banners.sort((a, b) => a.displayOrder - b.displayOrder)
    });
  } catch (error) {
    console.error('❌ Error reordering banners:', error);
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
    console.log('🔄 Toggling banner status:', id);
    
    const banners = loadBanners();
    const banner = banners.find(b => b._id === id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    banner.isActive = !banner.isActive;
    banner.updatedAt = new Date().toISOString();
    
    // Save to file
    const saved = saveBanners(banners);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save banner status change'
      });
    }
    
    console.log('✅ Banner status toggled:', banner.isActive ? 'active' : 'inactive');
    
    res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      banner: banner
    });
  } catch (error) {
    console.error('❌ Error toggling banner status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status'
    });
  }
};
