import OfferPopup from '../models/OfferPopup.js';
import mongoose from 'mongoose';
import db from '../database.js';

// Get all offer popups - Optimized for faster loading
const getAllOfferPopups = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    // Use file-based storage directly for faster response
    // Skip MongoDB to avoid connection delays
    console.log('📊 Fetching offer popups from file storage...');
    
    const allPopups = await db.getOfferPopups();
    const now = new Date();
    
    let filteredPopups = allPopups;
    if (status === 'active') {
      filteredPopups = allPopups.filter(p => 
        p.isActive === true && 
        new Date(p.startDate) <= now && 
        new Date(p.endDate) >= now
      );
    } else if (status === 'inactive') {
      filteredPopups = allPopups.filter(p => p.isActive === false);
    } else if (status === 'expired') {
      filteredPopups = allPopups.filter(p => new Date(p.endDate) < now);
    }
    
    // Sort by creation date (newest first)
    filteredPopups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = filteredPopups.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const popups = filteredPopups.slice(startIndex, endIndex);

    console.log(`✅ Offer popups loaded: ${popups.length}/${total}`);

    res.json({
      success: true,
      popups,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching offer popups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offer popups',
      error: error.message
    });
  }
};

// Get active offer popup
const getActiveOfferPopup = async (req, res) => {
  try {
    const now = new Date();
    
    // Try MongoDB first, fallback to file-based storage
    let popup = null;
    
    try {
      popup = await OfferPopup.findOne({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('createdBy', 'name email');
    } catch (mongoError) {
      console.log('MongoDB not available, using file-based storage for offer popups');
      
      // Fallback to file-based storage
      const offerPopups = await db.getOfferPopups();
      popup = offerPopups.find(p => 
        p.isActive === true && 
        new Date(p.startDate) <= now && 
        new Date(p.endDate) >= now
      );
    }

    if (!popup) {
      return res.json({
        success: true,
        popup: null,
        message: 'No active offer popup found'
      });
    }

    res.json({
      success: true,
      popup
    });
  } catch (error) {
    console.error('Error fetching active offer popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active offer popup',
      error: error.message
    });
  }
};

// Get offer popup by ID
const getOfferPopupById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Offer popup ID is required'
      });
    }

    let popup = null;
    
    try {
      // Try MongoDB first - only validate ObjectId if it looks like one
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid offer popup ID format'
          });
        }

        popup = await OfferPopup.findById(id)
          .populate('createdBy', 'name email')
          .populate('lastModifiedBy', 'name email');

        if (!popup) {
          return res.status(404).json({
            success: false,
            message: 'Offer popup not found'
          });
        }
      } else {
        throw new Error('Not a MongoDB ObjectId, using file storage');
      }
    } catch (mongoError) {
      console.log('MongoDB not available or invalid ObjectId, using file-based storage for offer popup fetch');
      
      // Fallback to file-based storage
      const allPopups = await db.getOfferPopups();
      popup = allPopups.find(p => p._id === id);
      
      if (!popup) {
        return res.status(404).json({
          success: false,
          message: 'Offer popup not found'
        });
      }
    }

    res.json({
      success: true,
      popup
    });
  } catch (error) {
    console.error('Error fetching offer popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offer popup',
      error: error.message
    });
  }
};

// Create new offer popup
const createOfferPopup = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      offerText,
      offerSubtext,
      discountPercentage,
      couponCode,
      minimumOrderAmount,
      termsAndConditions,
      products,
      showDelay,
      maxShowsPerSession,
      startDate,
      endDate
    } = req.body;

    // No validation - accept any fields provided
    // Provide default values for missing fields
    const popupData = {
      title: title || 'Special Offer',
      subtitle: subtitle || 'Limited Time Deal',
      offerText: offerText || '20% OFF',
      offerSubtext: offerSubtext || 'First Order',
      discountPercentage: discountPercentage || 20,
      couponCode: couponCode || 'WELCOME20',
      minimumOrderAmount: minimumOrderAmount || 0,
      termsAndConditions: termsAndConditions || 'Valid for new customers. One-time use only.',
      products: products || [
        { name: 'Cakes', initials: 'CK', color: 'pink' },
        { name: 'Bread', initials: 'BR', color: 'orange' },
        { name: 'Pastry', initials: 'PS', color: 'red' }
      ],
      showDelay: showDelay || 3000,
      maxShowsPerSession: maxShowsPerSession || 1,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: req.user.id,
      isActive: true
    };

    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    let popup = null;
    
    try {
      // Check if coupon code already exists
      const existingPopup = await OfferPopup.findOne({ couponCode: popupData.couponCode });
      if (existingPopup) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }

      popup = new OfferPopup(popupData);

      await popup.save();
    } catch (mongoError) {
      console.log('MongoDB not available, using file-based storage for offer popups');
      
      // Fallback to file-based storage
      const allPopups = await db.getOfferPopups();
      const existingPopup = allPopups.find(p => p.couponCode === couponCode);
      if (existingPopup) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }

      const popupData = {
        title,
        subtitle,
        offerText,
        offerSubtext,
        discountPercentage,
        couponCode,
        minimumOrderAmount,
        termsAndConditions,
        products,
        showDelay: showDelay || 2000,
        maxShowsPerSession: maxShowsPerSession || 1,
        startDate: startDate || new Date().toISOString(),
        endDate,
        isActive: true,
        createdBy: req.user.id || 'admin'
      };

      popup = await db.createOfferPopup(popupData);
    }

    res.status(201).json({
      success: true,
      message: 'Offer popup created successfully',
      popup
    });
  } catch (error) {
    console.error('Error creating offer popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating offer popup',
      error: error.message
    });
  }
};

// Update offer popup
const updateOfferPopup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate required fields for update
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Offer popup ID is required'
      });
    }

    let popup = null;
    let isMongoDB = false;
    
    try {
      // Try MongoDB first - only validate ObjectId if it looks like one
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid offer popup ID format'
          });
        }

        // Check if coupon code already exists (excluding current popup)
        if (updateData.couponCode) {
          const existingPopup = await OfferPopup.findOne({ 
            couponCode: updateData.couponCode,
            _id: { $ne: id }
          });
          if (existingPopup) {
            return res.status(400).json({
              success: false,
              message: 'Coupon code already exists'
            });
          }
        }

        updateData.lastModifiedBy = req.user.id;

        popup = await OfferPopup.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: false }
        ).populate('createdBy', 'name email')
         .populate('lastModifiedBy', 'name email');

        if (!popup) {
          return res.status(404).json({
            success: false,
            message: 'Offer popup not found'
          });
        }
        isMongoDB = true;
      } else {
        throw new Error('Not a MongoDB ObjectId, using file storage');
      }
    } catch (mongoError) {
      console.log('MongoDB not available or invalid ObjectId, using file-based storage for offer popup update');
      
      // Fallback to file-based storage
      const allPopups = await db.getOfferPopups();
      const existingPopup = allPopups.find(p => p._id === id);
      
      if (!existingPopup) {
        return res.status(404).json({
          success: false,
          message: 'Offer popup not found'
        });
      }

      // Check if coupon code already exists (excluding current popup)
      if (updateData.couponCode) {
        const duplicatePopup = allPopups.find(p => 
          p.couponCode === updateData.couponCode && p._id !== id
        );
        if (duplicatePopup) {
          return res.status(400).json({
            success: false,
            message: 'Coupon code already exists'
          });
        }
      }

      // Update the popup data
      const updatedData = {
        ...updateData,
        lastModifiedBy: req.user.id || 'admin',
        updatedAt: new Date().toISOString()
      };

      popup = await db.updateOfferPopup(id, updatedData);
      
      if (!popup) {
        return res.status(404).json({
          success: false,
          message: 'Offer popup not found'
        });
      }
    }

    res.json({
      success: true,
      message: 'Offer popup updated successfully',
      popup
    });
  } catch (error) {
    console.error('Error updating offer popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating offer popup',
      error: error.message
    });
  }
};

// Delete offer popup
const deleteOfferPopup = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id.length);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Offer popup ID is required'
      });
    }

    let deleted = false;
    
    try {
      // Try MongoDB first - only validate ObjectId if it looks like one
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        console.log('ID looks like MongoDB ObjectId, validating...');
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid offer popup ID format'
          });
        }

        const popup = await OfferPopup.findByIdAndDelete(id);
        if (popup) {
          deleted = true;
        }
      } else {
        console.log('ID does not look like MongoDB ObjectId, using file storage');
        throw new Error('Not a MongoDB ObjectId, using file storage');
      }
    } catch (mongoError) {
      console.log('MongoDB not available or invalid ObjectId, using file-based storage for offer popup deletion');
      console.log('MongoDB error:', mongoError.message);
      
      // Fallback to file-based storage
      const allPopups = await db.getOfferPopups();
      console.log('All popups from file storage:', allPopups.length);
      allPopups.forEach((popup, index) => {
        console.log(index + 1 + '. ID: ' + popup._id + ' (type: ' + typeof popup._id + ')');
      });
      
      const existingPopup = allPopups.find(p => p._id === id);
      console.log('Found existing popup:', existingPopup ? existingPopup.title : 'Not found');
      
      if (existingPopup) {
        const deleteResult = await db.deleteOfferPopup(id);
        console.log('Delete result from database:', deleteResult);
        deleted = true;
      }
    }

    console.log('Final deleted status:', deleted);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Offer popup not found'
      });
    }

    return res.json({
      success: true,
      message: 'Offer popup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting offer popup:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting offer popup',
      error: error.message
    });
  }
};

// Toggle offer popup status
const toggleOfferPopupStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Offer popup ID is required'
      });
    }

    let popup = null;
    
    try {
      // Try MongoDB first - only validate ObjectId if it looks like one
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid offer popup ID format'
          });
        }

        popup = await OfferPopup.findById(id);
        if (!popup) {
          return res.status(404).json({
            success: false,
            message: 'Offer popup not found'
          });
        }

        popup.isActive = !popup.isActive;
        popup.lastModifiedBy = req.user.id;
        await popup.save();
      } else {
        throw new Error('Not a MongoDB ObjectId, using file storage');
      }
    } catch (mongoError) {
      console.log('MongoDB not available or invalid ObjectId, using file-based storage for offer popup toggle');
      
      // Fallback to file-based storage
      const allPopups = await db.getOfferPopups();
      const existingPopup = allPopups.find(p => p._id === id);
      
      if (!existingPopup) {
        return res.status(404).json({
          success: false,
          message: 'Offer popup not found'
        });
      }

      // Toggle the status
      const updatedData = {
        ...existingPopup,
        isActive: !existingPopup.isActive,
        lastModifiedBy: req.user.id || 'admin',
        updatedAt: new Date().toISOString()
      };

      popup = await db.updateOfferPopup(id, updatedData);
    }

    res.json({
      success: true,
      message: `Offer popup ${popup.isActive ? 'activated' : 'deactivated'} successfully`,
      popup
    });
  } catch (error) {
    console.error('Error toggling offer popup status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling offer popup status',
      error: error.message
    });
  }
};

export {
  getAllOfferPopups,
  getActiveOfferPopup,
  getOfferPopupById,
  createOfferPopup,
  updateOfferPopup,
  deleteOfferPopup,
  toggleOfferPopupStatus
};
