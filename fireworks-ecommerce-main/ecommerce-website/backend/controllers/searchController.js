import db from '../database.js';

// Advanced search with filters
export const advancedSearch = async (req, res) => {
  try {
    const {
      query = '',
      category = '',
      minPrice = 0,
      maxPrice = 999999,
      rating = 0,
      inStock = true,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      tags = [],
      brand = '',
      discount = false,
      featured = false
    } = req.query;

    // Get all products
    let products = db.getAllProducts();

    // Apply text search
    if (query) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      products = products.filter(product => {
        const searchableText = [
          product.name,
          product.description,
          product.category,
          product.tags?.join(' ') || '',
          product.brand || ''
        ].join(' ').toLowerCase();

        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    // Apply category filter
    if (category) {
      products = products.filter(product => 
        product.category === category || 
        product.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply price range filter
    products = products.filter(product => 
      product.price >= parseFloat(minPrice) && 
      product.price <= parseFloat(maxPrice)
    );

    // Apply rating filter
    if (rating > 0) {
      products = products.filter(product => 
        (product.ratings || 0) >= parseFloat(rating)
      );
    }

    // Apply stock filter
    if (inStock === 'true') {
      products = products.filter(product => 
        (product.countInStock || 0) > 0
      );
    }

    // Apply tags filter
    if (tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      products = products.filter(product => 
        tagArray.some(tag => 
          product.tags?.some(productTag => 
            productTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Apply brand filter
    if (brand) {
      products = products.filter(product => 
        product.brand?.toLowerCase().includes(brand.toLowerCase())
      );
    }

    // Apply discount filter
    if (discount === 'true') {
      products = products.filter(product => 
        product.discount && product.discount > 0
      );
    }

    // Apply featured filter
    if (featured === 'true') {
      products = products.filter(product => 
        product.featured === true
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        products.sort((a, b) => 
          sortOrder === 'asc' ? a.price - b.price : b.price - a.price
        );
        break;
      case 'rating':
        products.sort((a, b) => 
          sortOrder === 'asc' ? 
            (a.ratings || 0) - (b.ratings || 0) : 
            (b.ratings || 0) - (a.ratings || 0)
        );
        break;
      case 'name':
        products.sort((a, b) => 
          sortOrder === 'asc' ? 
            a.name.localeCompare(b.name) : 
            b.name.localeCompare(a.name)
        );
        break;
      case 'newest':
        products.sort((a, b) => 
          sortOrder === 'asc' ? 
            new Date(a.createdAt) - new Date(b.createdAt) : 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'popularity':
        products.sort((a, b) => 
          sortOrder === 'asc' ? 
            (a.numOfReviews || 0) - (b.numOfReviews || 0) : 
            (b.numOfReviews || 0) - (a.numOfReviews || 0)
        );
        break;
      case 'discount':
        products.sort((a, b) => 
          sortOrder === 'asc' ? 
            (a.discount || 0) - (b.discount || 0) : 
            (b.discount || 0) - (a.discount || 0)
        );
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Get search suggestions
    const suggestions = getSearchSuggestionsHelper(query, products);

    // Get filter options
    const filterOptions = getFilterOptions(products);

    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.length / parseInt(limit)),
        totalProducts: products.length,
        hasNextPage: endIndex < products.length,
        hasPrevPage: startIndex > 0
      },
      suggestions,
      filterOptions,
      appliedFilters: {
        query,
        category,
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        rating: parseFloat(rating),
        inStock: inStock === 'true',
        sortBy,
        sortOrder,
        tags: Array.isArray(tags) ? tags : tags.split(',').filter(t => t),
        brand,
        discount: discount === 'true',
        featured: featured === 'true'
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const products = db.getAllProducts();
    const categories = db.getAllCategories();
    
    const suggestions = [];

    // Product name suggestions
    const productSuggestions = products
      .filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(product => ({
        type: 'product',
        text: product.name,
        id: product._id,
        image: product.images?.[0] || product.thumbnail,
        price: product.price
      }));

    // Category suggestions
    const categorySuggestions = categories
      .filter(category => 
        category.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(category => ({
        type: 'category',
        text: category.name,
        id: category._id
      }));

    // Tag suggestions
    const allTags = products
      .flatMap(product => product.tags || [])
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .filter(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(tag => ({
        type: 'tag',
        text: tag
      }));

    suggestions.push(...productSuggestions, ...categorySuggestions, ...allTags);

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 10)
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
};

// Get popular searches
export const getPopularSearches = async (req, res) => {
  try {
    // In a real app, this would come from analytics data
    const popularSearches = [
      'sparklers',
      'firecrackers',
      'rockets',
      'fountains',
      'roman candles',
      'ground spinners',
      'aerial shells',
      'smoke bombs',
      'party poppers',
      'confetti cannons'
    ];

    res.json({
      success: true,
      popularSearches
    });

  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches',
      error: error.message
    });
  }
};

// Get filter options for search
export const getSearchFilters = async (req, res) => {
  try {
    const { category = '' } = req.query;

    let products = db.getAllProducts();

    // Filter by category if provided
    if (category) {
      products = products.filter(product => 
        product.category === category || 
        product.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    const filterOptions = getFilterOptions(products);

    res.json({
      success: true,
      filterOptions
    });

  } catch (error) {
    console.error('Get search filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search filters',
      error: error.message
    });
  }
};

// Helper functions
const getSearchSuggestionsHelper = (query, products) => {
  if (!query || query.length < 2) return [];

  const suggestions = [];

  // Product name suggestions
  const productSuggestions = products
    .filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
    .map(product => ({
      type: 'product',
      text: product.name,
      id: product._id,
      image: product.images?.[0] || product.thumbnail,
      price: product.price
    }));

  // Category suggestions
  const categories = db.getAllCategories();
  const categorySuggestions = categories
    .filter(category => 
      category.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3)
    .map(category => ({
      type: 'category',
      text: category.name,
      id: category._id
    }));

  // Tag suggestions
  const allTags = products
    .flatMap(product => product.tags || [])
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .filter(tag => 
      tag.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3)
    .map(tag => ({
      type: 'tag',
      text: tag
    }));

  suggestions.push(...productSuggestions, ...categorySuggestions, ...allTags);

  return suggestions.slice(0, 10);
};

const getFilterOptions = (products) => {
  // Price range
  const prices = products.map(p => p.price).filter(price => price > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Brands
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Tags
  const allTags = products.flatMap(p => p.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Ratings
  const ratings = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: products.filter(p => (p.ratings || 0) >= rating).length
  }));

  return {
    priceRange: { min: minPrice, max: maxPrice },
    categories,
    brands,
    tags: popularTags,
    ratings,
    inStock: products.filter(p => (p.countInStock || 0) > 0).length,
    onSale: products.filter(p => p.discount && p.discount > 0).length,
    featured: products.filter(p => p.featured).length
  };
};