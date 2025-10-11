import db from '../database.js';

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    console.log('📋 Fetching menu items from file storage...');
    
    const allMenuItems = db.getAllMenuItems();
    
    let filteredMenuItems = allMenuItems;
    if (status === 'active') {
      filteredMenuItems = allMenuItems.filter(item => item.isActive === true);
    } else if (status === 'inactive') {
      filteredMenuItems = allMenuItems.filter(item => item.isActive === false);
    }
    
    // Sort by order field if it exists, otherwise by creation date
    filteredMenuItems.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    console.log(`✅ Menu items loaded: ${filteredMenuItems.length}`);
    
    res.json({
      success: true,
      data: filteredMenuItems,
      total: filteredMenuItems.length
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
};

// Get active menu items for frontend
const getActiveMenuItems = async (req, res) => {
  try {
    const allMenuItems = db.getAllMenuItems();
    const activeMenuItems = allMenuItems
      .filter(item => item.isActive === true)
      .sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    
    console.log(`✅ Active menu items loaded: ${activeMenuItems.length}`);
    
    res.json({
      success: true,
      data: activeMenuItems
    });
  } catch (error) {
    console.error('Error fetching active menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active menu items',
      error: error.message
    });
  }
};

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = db.findMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message
    });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    console.log('🔍 Menu Controller: Creating menu item with data:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Menu Controller: User from auth middleware:', req.user);
    console.log('🔍 Menu Controller: User ID:', req.user?._id);
    
    const {
      name,
      description,
      image,
      color,
      order,
      link,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      console.log('❌ Menu Controller: Name validation failed');
      return res.status(400).json({
        success: false,
        message: 'Menu item name is required'
      });
    }

    // Validate user authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      console.log('❌ Menu Controller: User authentication failed');
      console.log('❌ Menu Controller: req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const menuItemData = {
      name: name.trim(),
      description: description || '',
      image: image || '',
      color: color || '#f59e0b',
      order: order || 0,
      link: link || '',
      isActive: isActive === true || isActive === 'true',
      createdBy: req.user.id || req.user._id
    };

    const newMenuItem = db.createMenuItem(menuItemData);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newMenuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate user authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if menu item exists
    const existingMenuItem = db.findMenuItemById(id);
    if (!existingMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Clean up update data
    const cleanedUpdateData = {};
    if (updateData.name !== undefined) cleanedUpdateData.name = updateData.name.trim();
    if (updateData.description !== undefined) cleanedUpdateData.description = updateData.description;
    if (updateData.image !== undefined) cleanedUpdateData.image = updateData.image;
    if (updateData.color !== undefined) cleanedUpdateData.color = updateData.color;
    if (updateData.order !== undefined) cleanedUpdateData.order = updateData.order;
    if (updateData.link !== undefined) cleanedUpdateData.link = updateData.link;
    if (updateData.isActive !== undefined) cleanedUpdateData.isActive = updateData.isActive === true || updateData.isActive === 'true';

    const updatedMenuItem = db.updateMenuItem(id, cleanedUpdateData);

    if (!updatedMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if menu item exists
    const existingMenuItem = db.findMenuItemById(id);
    if (!existingMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const deleted = db.deleteMenuItem(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
};

// Bulk update menu items order
const updateMenuItemsOrder = async (req, res) => {
  try {
    const { menuItems } = req.body;

    // Validate user authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!Array.isArray(menuItems)) {
      return res.status(400).json({
        success: false,
        message: 'Menu items must be an array'
      });
    }

    const updatedMenuItems = [];
    
    for (const item of menuItems) {
      if (item.id && item.order !== undefined) {
        const updated = db.updateMenuItem(item.id, { order: item.order });
        if (updated) {
          updatedMenuItems.push(updated);
        }
      }
    }

    res.json({
      success: true,
      message: 'Menu items order updated successfully',
      data: updatedMenuItems
    });
  } catch (error) {
    console.error('Error updating menu items order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu items order',
      error: error.message
    });
  }
};

export {
  getAllMenuItems,
  getActiveMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemsOrder
};
