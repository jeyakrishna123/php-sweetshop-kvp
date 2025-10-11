import db from '../database.js';
// import cacheManager from '../utils/cache.js'; // Disabled for now
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Mock cache manager since it's disabled
const cacheManager = {
  get: async () => null,
  set: async () => true
};

// Get products by cake flavor
export const getProductsByCakeFlavor = async (req, res) => {
  try {
    const { flavor, limit = 20 } = req.query;
    
    if (!flavor) {
      return res.status(400).json({
        success: false,
        message: 'Cake flavor is required'
      });
    }

    let products = await db.getAllProducts();
    
    // Filter by cake flavor and product type
    products = products.filter(product => 
      product.cakeFlavor === flavor && 
      product.productTypes?.includes('cakes')
    );

    // Apply limit
    if (limit) {
      products = products.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products by cake flavor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by cake flavor',
      error: error.message
    });
  }
};

// Get products by product type
export const getProductsByType = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Product type is required'
      });
    }

    let products = await db.getAllProducts();
    
    // Filter by product type
    products = products.filter(product => {
      if (type === 'newItems') {
        return product.productTypes?.includes('newItems') || product.isNew;
      }
      return product.productTypes?.includes(type);
    });

    // Apply limit
    if (limit) {
      products = products.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by type',
      error: error.message
    });
  }
};

// Get all products with advanced filtering and caching
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      featured,
      inStock,
      bestseller,
      menuOption
    } = req.query;

    // Cache disabled for now - always fetch fresh data

    // Get all products from file-based database
    let products = await db.getAllProducts();
    
    // Ensure products is an array
    if (!Array.isArray(products)) {
      console.error('❌ Products data is not an array:', typeof products);
      products = [];
    }

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (category) {
      products = products.filter(product => {
        // Support both old and new category structures
        return product.category === category || 
               product.categoryName === category ||
               product.categoryName?.toLowerCase().includes(category.toLowerCase()) ||
               product.cakeFlavor === category ||
               product.productTypes?.includes(category.toLowerCase());
      });
    }
    
    if (brand) {
      products = products.filter(product => 
        product.brand?.toLowerCase().includes(brand.toLowerCase())
      );
    }
    
    if (minPrice || maxPrice) {
      products = products.filter(product => {
        if (minPrice && product.price < parseFloat(minPrice)) return false;
        if (maxPrice && product.price > parseFloat(maxPrice)) return false;
        return true;
      });
    }
    
    if (featured === 'true') {
      products = products.filter(product => product.featured === true);
    }
    
    if (inStock === 'true') {
      products = products.filter(product => (product.stock || 0) > 0);
    }
    
    if (bestseller === 'true') {
      products = products.filter(product => product.isBestseller === true);
    }
    
    if (menuOption) {
      products = products.filter(product => product.menuOption === menuOption);
    }

    // Apply sorting
    products.sort((a, b) => {
      let aValue, bValue;
      
      switch (sort) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          return order === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          return order === 'desc' ? bValue - aValue : aValue - bValue;
        case 'rating':
          aValue = a.ratings || 0;
          bValue = b.ratings || 0;
          return order === 'desc' ? bValue - aValue : aValue - bValue;
        case 'createdAt':
        case 'newest':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          return order === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });

    // Calculate pagination
    const total = products.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProducts = products.slice(skip, skip + parseInt(limit));
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const result = {
      success: true,
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    };

    // Cache disabled for now
    // await cacheManager.set(cacheKey, result, 300); // Cache for 5 minutes

    res.json(result);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
};

// Get single product with caching
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cache disabled for now

    const product = await db.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    // This part of the code was not provided in the original file,
    // so it's not included in the new_code.

    const result = {
      success: true,
      product
    };

    // Cache disabled for now

    res.json(result);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Create new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      const uploadedImages = await Promise.all(uploadPromises);
      
      productData.images = uploadedImages.map(img => img.secure_url);
      productData.thumbnail = uploadedImages[0].secure_url;
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      productData.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    const product = await db.createProduct(productData);

    // Cache disabled for now

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate product error specifically
    if (error.message.includes('already exists')) {
      res.status(409).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product'
      });
    }
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔄 Updating product with ID:', id);
    console.log('🔄 Update data received:', updateData);

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      const uploadedImages = await Promise.all(uploadPromises);
      
      updateData.images = uploadedImages.map(img => img.secure_url);
      updateData.thumbnail = uploadedImages[0].secure_url;
    }

    // Ensure all fields are properly handled
    const processedUpdateData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    console.log('🔄 Processed update data:', processedUpdateData);

    const product = await db.updateProduct(id, processedUpdateData);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product updated successfully:', product);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.deleteProduct(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Cache disabled for now

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const cacheKey = `featured-products:${limit}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const products = await db.getFeaturedProducts(parseInt(limit));

    const result = {
      success: true,
      products
    };

    // Cache for 1 hour
    await cacheManager.set(cacheKey, result, 3600);

    res.json(result);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get bestseller products
export const getBestsellerProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    console.log('🏆 Fetching bestseller products...');
    
    // Get all products from file-based database
    let products = await db.getAllProducts();
    
    // Filter for bestseller products
    products = products.filter(product => product.isBestseller === true);
    
    // Sort by ratings (highest first) or by creation date
    products.sort((a, b) => {
      const aRating = a.ratings || 0;
      const bRating = b.ratings || 0;
      if (aRating !== bRating) {
        return bRating - aRating;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    // Apply limit
    const limitedProducts = products.slice(0, parseInt(limit));
    
    console.log(`✅ Bestseller products loaded: ${limitedProducts.length}`);

    res.json({
      success: true,
      products: limitedProducts,
      count: limitedProducts.length
    });
  } catch (error) {
    console.error('Get bestseller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bestseller products'
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const cacheKey = `search:${q}:${limit}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const products = await db.searchProducts(q, parseInt(limit));

    const result = {
      success: true,
      query: q,
      products,
      total: products.length
    };

    // Cache disabled for now

    res.json(result);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
};

// Get products by category with pagination and sorting
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;

    // Get all products and filter by category
    let products = await db.getAllProducts();
    products = products.filter(product => product.category === categoryId);

    // Apply sorting
    products.sort((a, b) => {
      let aValue, bValue;
      
      switch (sort) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          return order === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          return order === 'desc' ? bValue - aValue : aValue - bValue;
        case 'rating':
          aValue = a.ratings || 0;
          bValue = b.ratings || 0;
          return order === 'desc' ? bValue - aValue : aValue - bValue;
        case 'createdAt':
        case 'newest':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          return order === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });

    // Calculate pagination
    const total = products.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProducts = products.slice(skip, skip + parseInt(limit));
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products by category' 
    });
  }
};

// Get product statistics (Admin only)
export const getProductStats = async (req, res) => {
  try {
    const cacheKey = 'product-stats';
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get all products from file-based database
    const products = await db.getAllProducts();
    
    // Calculate stats manually
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive !== false).length;
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0).length;
    const lowStockProducts = products.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length;
    const featuredProducts = products.filter(p => p.featured === true).length;
    const totalViews = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);

    const stats = {
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        featuredProducts,
        totalViews
      }
    };

    // Cache for 1 hour
    await cacheManager.set(cacheKey, stats, 3600);

    res.json(stats);
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics'
    });
  }
}; 