import express from "express";
import db from "../database.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByCakeFlavor,
  getProductsByType,
  getBestsellerProducts
} from "../controllers/productController.js";

const router = express.Router();

// @desc    Get all products with search and filter
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    console.log('🔍 Product Route: Request received');
    console.log('🔍 Product Route: Query params:', req.query);
    console.log('🔍 Product Route: Headers:', req.headers);
    
    let products = await db.getAllProducts();
    console.log('🔍 Product Route: Products loaded:', products.length);
    
    // Search functionality
    const { search, category, flavor, minPrice, maxPrice, sortBy, page = 1, limit = 12, menuOption } = req.query;
    console.log('🔍 Product Route: menuOption from query:', menuOption);
    console.log('🔍 Product Route: All query params:', req.query);
    
    // Handle duplicate menuOption parameters (take the first one)
    const menuOptionValue = Array.isArray(menuOption) ? menuOption[0] : menuOption;
    console.log('🔍 Product Route: Processed menuOption:', menuOptionValue);
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      products = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Category filter
    if (category && category !== 'all') {
      products = products.filter(product => 
        product.category === category
      );
    }
    
    // Flavor filter (for sub-categories)
    if (flavor && flavor !== 'all') {
      products = products.filter(product => {
        const flavorLower = flavor.toLowerCase();
        
        // Check multiple flavor fields with exact matching for sub-categories
        return (
          // Check subCategory field (exact match for sub-categories)
          (product.subCategory && product.subCategory.toLowerCase() === flavorLower) ||
          // Check specifications.Flavor (partial match for flavors)
          (product.specifications && product.specifications.Flavor && 
           product.specifications.Flavor.toLowerCase().includes(flavorLower)) ||
          // Check category field (partial match)
          (product.category && product.category.toLowerCase().includes(flavorLower)) ||
          // Check cakeFlavor field (exact match)
          (product.cakeFlavor && product.cakeFlavor.toLowerCase() === flavorLower) ||
          // Check product name (partial match)
          product.name.toLowerCase().includes(flavorLower) ||
          // Check description (partial match)
          (product.description && product.description.toLowerCase().includes(flavorLower))
        );
      });
    }
    
    // Menu option filter (case-insensitive)
    if (menuOptionValue && menuOptionValue !== 'all' && menuOptionValue !== '') {
      console.log('🔍 Filtering by menuOption:', menuOptionValue);
      const beforeCount = products.length;
      products = products.filter(product => {
        const match = product.menuOption && product.menuOption.toLowerCase() === menuOptionValue.toLowerCase();
        if (match) {
          console.log('✅ Product matches menuOption filter:', product.name, product.menuOption);
        }
        return match;
      });
      console.log(`🔍 Menu option filter: ${beforeCount} -> ${products.length} products`);
    }
    
    // Price filter
    if (minPrice) {
      products = products.filter(product => product.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      products = products.filter(product => product.price <= parseFloat(maxPrice));
    }
    
    // Sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'rating':
          products.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(products.length / limitNum);
    
    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: products.length,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('❌ Product Route: Error fetching products:', error);
    console.error('❌ Product Route: Error stack:', error.stack);
    console.error('❌ Product Route: Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get bestseller products
// @route   GET /api/products/bestsellers
// @access  Public
router.get("/bestsellers", getBestsellerProducts);

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await db.findProductById(req.params.id);
    if (product) {
      res.json({
        success: true,
        product
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Add new product
// @route   POST /api/products
// @access  Private/Admin
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log("Product data received for creation:", req.body);

    const { name, brand, category, description, price, stock, images, isBestseller, menuOption, hasWeightOptions, weightOptions } = req.body;

    // Build the product object
    const productData = {
      name,
      brand,
      category,
      description,
      price: Number(price),
      stock: Number(stock),
      countInStock: Number(stock),
      images: images || [],
      user: req.user._id,
      seller: req.user.name || "Admin",
      ratings: 0,
      numOfReviews: 0,
      featured: false,
      isBestseller: isBestseller || false,
      menuOption: menuOption || "",
      hasWeightOptions: hasWeightOptions || false,
      weightOptions: weightOptions || []
    };

    console.log("Product object to be saved:", productData);

    const createdProduct = await db.createProduct(productData);
    res.status(201).json({
      success: true,
      product: createdProduct
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('Starting product update...');
    console.log('Request body:', req.body);
    
    const product = await db.findProductById(req.params.id);
    console.log('Found product:', product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Build update data - handle all possible fields
    const updateData = {};
    
    // List of all possible fields that can be updated
    const updateFields = [
      'name', 'price', 'originalPrice', 'offerPrice', 'discountPercentage',
      'description', 'category', 'categoryName', 'brand', 'discount', 'featured',
      'isNew', 'isBestseller', 'seller', 'ratings', 'numOfReviews', 'specifications', 'tags',
      'cakeFlavor', 'productTypes', 'thumbnail', 'menuOption', 'hasWeightOptions', 'weightOptions'
    ];
    
    // Update all provided fields
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        console.log(`Updating field ${field}:`, req.body[field]);
        updateData[field] = req.body[field];
      }
    });

    // Handle stock update - update both stock and countInStock
    if (req.body.stock !== undefined) {
      const stockValue = Number(req.body.stock);
      console.log('Updating stock to:', stockValue);
      updateData.stock = stockValue;
      updateData.countInStock = stockValue;
    }

    // Handle images update
    if (req.body.images !== undefined) {
      console.log('Processing images...');
      updateData.images = req.body.images;
    }

    const updatedProduct = await db.updateProduct(req.params.id, updateData);
    console.log('Product updated successfully:', updatedProduct);
    
    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Remove duplicate products
// @route   DELETE /api/products/duplicates
// @access  Private/Admin
router.delete('/duplicates', isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('🧹 Starting duplicate removal process...');
    
    // Get all products
    const allProducts = await db.getAllProducts();
    console.log(`📊 Total products before cleanup: ${allProducts.length}`);
    
    // Find duplicates based on name, category, and brand
    const duplicates = [];
    const seen = new Map();
    
    allProducts.forEach((product, index) => {
      const key = `${product.name?.toLowerCase().trim()}_${product.category}_${product.brand?.toLowerCase().trim()}`;
      
      if (seen.has(key)) {
        const originalIndex = seen.get(key);
        if (!duplicates.find(d => d.originalIndex === originalIndex)) {
          duplicates.push({
            key,
            originalIndex,
            originalProduct: allProducts[originalIndex],
            duplicates: [allProducts[index]]
          });
        } else {
          const existingDuplicate = duplicates.find(d => d.originalIndex === originalIndex);
          existingDuplicate.duplicates.push(allProducts[index]);
        }
      } else {
        seen.set(key, index);
      }
    });
    
    console.log(`🔍 Found ${duplicates.length} groups of duplicates`);
    
    if (duplicates.length === 0) {
      return res.json({
        success: true,
        message: 'No duplicate products found',
        removedCount: 0,
        duplicates: []
      });
    }
    
    // Remove duplicates (keep the first one in each group)
    const duplicateIds = duplicates.flatMap(group => group.duplicates.map(p => p._id));
    
    console.log(`🗑️ Removing ${duplicateIds.length} duplicate products...`);
    
    // Remove duplicates from database
    for (const productId of duplicateIds) {
      await db.deleteProduct(productId);
    }
    
    console.log(`✅ Successfully removed ${duplicateIds.length} duplicate products`);
    
    res.json({
      success: true,
      message: `Successfully removed ${duplicateIds.length} duplicate products`,
      removedCount: duplicateIds.length,
      duplicates: duplicates.map(group => ({
        originalProduct: {
          id: group.originalProduct._id,
          name: group.originalProduct.name,
          category: group.originalProduct.category,
          brand: group.originalProduct.brand
        },
        removedDuplicates: group.duplicates.map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          brand: p.brand
        }))
      }))
    });
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove duplicates',
      error: error.message
    });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await db.findProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await db.deleteProduct(req.params.id);
    res.json({ 
      success: true,
      message: "Product removed" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get product summaries (minimal data for listings)
// @route   GET /api/products/summaries
// @access  Public
router.get("/summaries", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, featured } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .select('name price originalPrice discountPercentage thumbnail averageRating numReviews stock sku')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get product with related data in single request
// @route   GET /api/products/:id/with-related
// @access  Public
router.get("/:id/with-related", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        },
        options: { sort: { createdAt: -1 }, limit: 5 }
      })
      .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    // Get related products
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
    .select('name price thumbnail averageRating')
    .limit(4)
    .lean();
    
    res.json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Batch check wishlist status for multiple products
// @route   POST /api/products/wishlist-status
// @access  Private
router.post("/wishlist-status", isAuthenticated, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "productIds must be an array"
      });
    }
    
    // Get user's wishlist
    const wishlist = await db.getUserWishlist(req.user._id);
    const wishlistProductIds = wishlist.map(item => item.productId);
    
    // Create status map
    const statusMap = {};
    productIds.forEach(id => {
      statusMap[id] = wishlistProductIds.includes(id);
    });
    
    res.json({
      success: true,
      wishlistStatus: statusMap
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get products by cake flavor
// @route   GET /api/products/cake-flavor/:flavor
// @access  Public
router.get("/cake-flavor/:flavor", getProductsByCakeFlavor);

// @desc    Get products by product type
// @route   GET /api/products/type/:type
// @access  Public
router.get("/type/:type", getProductsByType);

export default router;
