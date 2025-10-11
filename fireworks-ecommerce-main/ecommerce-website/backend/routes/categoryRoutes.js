import express from "express";
import db from "../database.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// @desc    Delete predefined category (Admin only)
// @route   DELETE /api/categories/predefined/:categoryName
// @access  Private/Admin
router.delete("/predefined/:categoryName", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.categoryName);
    console.log("Delete predefined category request for:", categoryName);
    
    // Check if category has products
    const products = await db.getAllProducts();
    const productsInCategory = products.filter(product => 
      product.category === categoryName || 
      product.cakeFlavor === categoryName ||
      product.productTypes?.includes(categoryName.toLowerCase())
    );
    
    console.log("Products found for predefined category:", productsInCategory.length);
    
    if (productsInCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete predefined category "${categoryName}" - it has ${productsInCategory.length} products assigned`
      });
    }

    // For predefined categories, we'll remove them from the predefined list
    // This is handled on the frontend by updating the predefined categories array
    // The backend just validates that it's safe to delete
    
    res.json({
      success: true,
      message: `Predefined category "${categoryName}" can be safely deleted`,
      categoryName: categoryName
    });
  } catch (error) {
    console.error("Error deleting predefined category:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get("/", async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    const activeCategories = categories.filter(category => category.isActive);
    
    res.json({
      success: true,
      categories: activeCategories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get all categories including inactive (for user display)
// @route   GET /api/categories/all
// @access  Public
router.get("/all", async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Request category reactivation
// @route   POST /api/categories/:id/request-reactivation
// @access  Public
router.post("/:id/request-reactivation", async (req, res) => {
  try {
    const category = await db.findCategoryById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // In a real application, you might want to:
    // 1. Send an email to admin
    // 2. Create a notification
    // 3. Log the request
    // For now, we'll just return a success message
    
    res.json({
      success: true,
      message: `Reactivation request for category "${category.name}" has been submitted. Admin will review your request.`,
      category: {
        _id: category._id,
        name: category.name,
        isActive: category.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const category = await db.findCategoryById(req.params.id);
    if (category && category.isActive) {
      res.json({
        success: true,
        category
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get products by category
// @route   GET /api/categories/:id/products
// @access  Public
router.get("/:id/products", async (req, res) => {
  try {
    let category;
    
    // Try to find category by ID first
    category = await db.findCategoryById(req.params.id);
    
    // If not found by ID, try to find by name (decode URL encoding)
    if (!category) {
      const categories = await db.getAllCategories();
      const decodedName = decodeURIComponent(req.params.id);
      category = categories.find(cat => 
        cat.name.toLowerCase() === decodedName.toLowerCase() && cat.isActive
      );
    }
    
    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const products = await db.getProductsByCategory(category._id);
    
    res.json({
      success: true,
      category,
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Create new category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required"
      });
    }

    const newCategory = await db.createCategory({
      name,
      description,
      image: image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=400&fit=crop"
    });

    res.status(201).json({
      success: true,
      category: newCategory
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (image) updateData.image = image;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedCategory = await db.updateCategory(req.params.id, updateData);
    
    if (updatedCategory) {
      res.json({
        success: true,
        category: updatedCategory
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log("Delete category request for ID:", req.params.id);
    
    // Check if category has products
    const products = await db.getProductsByCategory(req.params.id);
    console.log("Products found for category:", products.length);
    
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with existing products"
      });
    }

    const deleted = await db.deleteCategory(req.params.id);
    console.log("Delete result:", deleted);
    
    if (deleted) {
      res.json({
        success: true,
        message: "Category deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get all categories (Admin only - includes inactive)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
router.get("/admin/all", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;
