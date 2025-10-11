import db from '../database.js';

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Get all reviews for the product
    let reviews = db.getAllReviews().filter(review => review.productId === productId);

    // Sort reviews
    switch (sort) {
      case 'newest':
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest_rating':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_rating':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_helpful':
        reviews.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      default:
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Calculate review statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? 
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    // Populate reviews with user details
    const populatedReviews = paginatedReviews.map(review => {
      const user = db.findUserById(review.userId);
      return {
        ...review,
        user: {
          name: user?.name || review.userName || 'Anonymous',
          avatar: user?.avatar || null
        }
      };
    });

    res.json({
      success: true,
      reviews: populatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalReviews,
        hasNextPage: endIndex < totalReviews,
        hasPrevPage: startIndex > 0
      },
      summary: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product reviews',
      error: error.message
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, title } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if product exists
    const product = db.findProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = db.getAllReviews().find(review => 
      review.product === productId && review.user === userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product
    const userOrders = db.getOrdersByUser(userId);
    const hasPurchased = userOrders.some(order => 
      order.orderItems.some(item => item.product === productId) && 
      order.status === 'delivered'
    );

    if (!hasPurchased) {
      return res.status(400).json({
        success: false,
        message: 'You can only review products you have purchased'
      });
    }

    // Create review
    const reviewData = {
      _id: `REV${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      product: productId,
      user: userId,
      rating: parseInt(rating),
      comment: comment || '',
      title: title || '',
      helpful: 0,
      verified: true, // Verified purchase
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newReview = db.createReview(reviewData);

    // Update product rating
    updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user._id;

    // Find review
    const review = db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    const updateData = {
      rating: rating ? parseInt(rating) : review.rating,
      comment: comment !== undefined ? comment : review.comment,
      title: title !== undefined ? title : review.title,
      updatedAt: new Date().toISOString()
    };

    const updatedReview = db.updateReview(reviewId, updateData);

    // Update product rating
    updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find review
    const review = db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete review
    db.deleteReview(reviewId);

    // Update product rating
    updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find review
    const review = db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has already marked this review as helpful
    const helpfulUsers = review.helpfulUsers || [];
    if (helpfulUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    // Add user to helpful users
    helpfulUsers.push(userId);
    const updatedReview = db.updateReview(reviewId, {
      helpful: helpfulUsers.length,
      helpfulUsers
    });

    res.json({
      success: true,
      message: 'Review marked as helpful',
      review: updatedReview
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // Get user's reviews
    let reviews = db.getAllReviews().filter(review => review.userId === userId);

    // Sort by newest first
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Populate reviews with product details
    const populatedReviews = paginatedReviews.map(review => {
      const product = db.findProductById(review.productId);
      return {
        ...review,
        product: {
          _id: product?._id,
          name: product?.name,
          image: product?.images?.[0] || product?.thumbnail
        }
      };
    });

    res.json({
      success: true,
      reviews: populatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.length / parseInt(limit)),
        totalReviews: reviews.length,
        hasNextPage: endIndex < reviews.length,
        hasPrevPage: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews',
      error: error.message
    });
  }
};

// Get all reviews (admin)
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, rating } = req.query;

    // Get all reviews
    let reviews = db.getAllReviews();

    // Filter by status
    if (status) {
      reviews = reviews.filter(review => review.status === status);
    }

    // Filter by rating
    if (rating) {
      reviews = reviews.filter(review => review.rating === parseInt(rating));
    }

    // Sort by newest first
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Populate reviews with user and product details
    const populatedReviews = paginatedReviews.map(review => {
      const user = db.findUserById(review.userId);
      const product = db.findProductById(review.productId);
      return {
        ...review,
        user: {
          name: user?.name || review.userName || 'Unknown',
          email: user?.email || '',
          avatar: user?.avatar || null
        },
        product: {
          _id: product?._id,
          name: product?.name,
          image: product?.images?.[0] || product?.thumbnail
        }
      };
    });

    res.json({
      success: true,
      reviews: populatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.length / parseInt(limit)),
        totalReviews: reviews.length,
        hasNextPage: endIndex < reviews.length,
        hasPrevPage: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Helper function to update product rating
const updateProductRating = (productId) => {
  try {
    const reviews = db.getAllReviews().filter(review => review.product === productId);
    
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const totalReviews = reviews.length;

    // Update product with new rating
    db.updateProduct(productId, {
      ratings: Math.round(averageRating * 10) / 10,
      totalReviews
    });

  } catch (error) {
    console.error('Update product rating error:', error);
  }
};