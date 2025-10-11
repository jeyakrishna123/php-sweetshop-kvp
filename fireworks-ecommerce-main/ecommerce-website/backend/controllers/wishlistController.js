import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load wishlists data
const loadWishlists = () => {
  try {
    const wishlistsPath = path.join(__dirname, '../data/wishlists.json');
    const wishlistsData = fs.readFileSync(wishlistsPath, 'utf8');
    return JSON.parse(wishlistsData);
  } catch (error) {
    console.error('Error loading wishlists:', error);
    return [];
  }
};

// Save wishlists data
const saveWishlists = (wishlists) => {
  try {
    const wishlistsPath = path.join(__dirname, '../data/wishlists.json');
    fs.writeFileSync(wishlistsPath, JSON.stringify(wishlists, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving wishlists:', error);
    return false;
  }
};

// Generate unique wishlist ID
const generateWishlistId = () => {
  return `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get user's wishlist
export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlists = loadWishlists();
    
    let userWishlist = wishlists.find(wishlist => wishlist.userId === userId);
    
    if (!userWishlist) {
      // Create new wishlist for user if it doesn't exist
      userWishlist = {
        _id: generateWishlistId(),
        userId,
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      wishlists.push(userWishlist);
      saveWishlists(wishlists);
    }

    // Load products data to get full product details
    const productsPath = path.join(__dirname, '../data/products.json');
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    // Get full product details for wishlist items
    const wishlistProducts = userWishlist.products.map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        ...item,
        product: product || null
      };
    }).filter(item => item.product !== null); // Remove products that no longer exist

    res.json({
      success: true,
      wishlist: {
        ...userWishlist,
        products: wishlistProducts
      }
    });
  } catch (error) {
    console.error('Get user wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist'
    });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const wishlists = loadWishlists();
    let userWishlist = wishlists.find(wishlist => wishlist.userId === userId);

    if (!userWishlist) {
      // Create new wishlist for user
      userWishlist = {
        _id: generateWishlistId(),
        userId,
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      wishlists.push(userWishlist);
    }

    // Check if product is already in wishlist
    const existingProduct = userWishlist.products.find(item => item.productId === productId);
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in your wishlist'
      });
    }

    // Add product to wishlist
    userWishlist.products.push({
      productId,
      addedAt: new Date().toISOString()
    });
    userWishlist.updatedAt = new Date().toISOString();

    if (saveWishlists(wishlists)) {
      res.json({
        success: true,
        message: 'Product added to wishlist successfully',
        wishlist: userWishlist
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save wishlist'
      });
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlists = loadWishlists();
    const userWishlist = wishlists.find(wishlist => wishlist.userId === userId);

    if (!userWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove product from wishlist
    const productIndex = userWishlist.products.findIndex(item => item.productId === productId);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    userWishlist.products.splice(productIndex, 1);
    userWishlist.updatedAt = new Date().toISOString();

    if (saveWishlists(wishlists)) {
      res.json({
        success: true,
        message: 'Product removed from wishlist successfully',
        wishlist: userWishlist
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save wishlist'
      });
    }
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlists = loadWishlists();
    const userWishlist = wishlists.find(wishlist => wishlist.userId === userId);

    if (!userWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Clear all products from wishlist
    userWishlist.products = [];
    userWishlist.updatedAt = new Date().toISOString();

    if (saveWishlists(wishlists)) {
      res.json({
        success: true,
        message: 'Wishlist cleared successfully',
        wishlist: userWishlist
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save wishlist'
      });
    }
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    });
  }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlists = loadWishlists();
    const userWishlist = wishlists.find(wishlist => wishlist.userId === userId);

    if (!userWishlist) {
      return res.json({
        success: true,
        inWishlist: false
      });
    }

    const isInWishlist = userWishlist.products.some(item => item.productId === productId);

    res.json({
      success: true,
      inWishlist: isInWishlist
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status'
    });
  }
};
