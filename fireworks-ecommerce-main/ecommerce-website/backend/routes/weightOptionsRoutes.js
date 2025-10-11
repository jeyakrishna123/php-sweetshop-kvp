import express from 'express';
import db from '../database.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all weight options
// @route   GET /api/weight-options
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    
    let weightOptions = db.getAllWeightOptions();
    
    // Apply filters
    if (category) {
      weightOptions = weightOptions.filter(option => option.category === category);
    }
    
    if (active === 'true') {
      weightOptions = weightOptions.filter(option => option.isActive);
    }
    
    // Sort by category, displayOrder, and weight
    weightOptions.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if ((a.displayOrder || 0) !== (b.displayOrder || 0)) return (a.displayOrder || 0) - (b.displayOrder || 0);
      return a.weight.localeCompare(b.weight);
    });
    
    res.json({
      success: true,
      weightOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get weight options by category
// @route   GET /api/weight-options/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const weightOptions = db.getWeightOptionsByCategory(category);
    
    res.json({
      success: true,
      weightOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single weight option
// @route   GET /api/weight-options/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const weightOption = db.findWeightOptionById(req.params.id);
    
    if (!weightOption) {
      return res.status(404).json({
        success: false,
        message: 'Weight option not found'
      });
    }
    
    res.json({
      success: true,
      weightOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new weight option
// @route   POST /api/weight-options
// @access  Private/Admin
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const {
      name,
      weight,
      basePrice,
      servingSize,
      description,
      category,
      isActive,
      displayOrder,
      multiplier
    } = req.body;

    // Validate required fields
    if (!name || !weight || !basePrice || !servingSize || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, weight, basePrice, servingSize, and category are required'
      });
    }

    const weightOptionData = {
      name,
      weight,
      basePrice: Number(basePrice),
      servingSize,
      description,
      category,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      multiplier: multiplier || 1
    };

    const weightOption = db.createWeightOption(weightOptionData);

    res.status(201).json({
      success: true,
      weightOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update weight option
// @route   PUT /api/weight-options/:id
// @access  Private/Admin
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const {
      name,
      weight,
      basePrice,
      servingSize,
      description,
      category,
      isActive,
      displayOrder,
      multiplier
    } = req.body;

    const updateData = {};
    
    // Update fields
    if (name !== undefined) updateData.name = name;
    if (weight !== undefined) updateData.weight = weight;
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice);
    if (servingSize !== undefined) updateData.servingSize = servingSize;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (multiplier !== undefined) updateData.multiplier = multiplier;

    const weightOption = db.updateWeightOption(req.params.id, updateData);
    
    if (!weightOption) {
      return res.status(404).json({
        success: false,
        message: 'Weight option not found'
      });
    }

    res.json({
      success: true,
      weightOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete weight option
// @route   DELETE /api/weight-options/:id
// @access  Private/Admin
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const weightOption = db.findWeightOptionById(req.params.id);

    if (!weightOption) {
      return res.status(404).json({
        success: false,
        message: 'Weight option not found'
      });
    }

    db.deleteWeightOption(req.params.id);

    res.json({
      success: true,
      message: 'Weight option deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create default weight options
// @route   POST /api/weight-options/create-defaults
// @access  Private/Admin
router.post('/create-defaults', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const defaultOptions = db.createDefaultWeightOptions();

    res.json({
      success: true,
      message: 'Default weight options created successfully',
      count: defaultOptions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Toggle weight option status
// @route   PATCH /api/weight-options/:id/toggle
// @access  Private/Admin
router.patch('/:id/toggle', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const weightOption = db.findWeightOptionById(req.params.id);

    if (!weightOption) {
      return res.status(404).json({
        success: false,
        message: 'Weight option not found'
      });
    }

    const updatedWeightOption = db.updateWeightOption(req.params.id, {
      isActive: !weightOption.isActive
    });

    res.json({
      success: true,
      weightOption: updatedWeightOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
