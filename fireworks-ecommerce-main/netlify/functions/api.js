// API Function - Connects to your real database data
const fs = require('fs');
const path = require('path');

// Helper function to read JSON data files from your real database
const readJsonFile = (filePath) => {
  try {
    // Read from the copied data files in Netlify Functions
    const dataPath = path.join(__dirname, 'data', filePath);
    console.log('🔍 Reading data file:', dataPath);
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      const parsed = JSON.parse(data);
      console.log(`✅ Loaded ${filePath}:`, Array.isArray(parsed) ? parsed.length : 'object');
      return parsed;
    } else {
      console.error(`❌ Data file not found: ${dataPath}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error);
    return [];
  }
};

exports.handler = async (event, context) => {
  console.log('🔍 API Request:', event.httpMethod, event.path);
  console.log('🔍 Event details:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Test endpoint to verify function is working
  if (event.path === '/api/test') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'API Function is working!',
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod
      })
    };
  }

  try {
    const path = event.path;
    const query = event.queryStringParameters || {};
    let responseData = {};

    // Health check
    if (path === '/api/health') {
      responseData = {
        success: true,
        message: 'SK Bakers API is running on Netlify Functions',
        timestamp: new Date().toISOString()
      };
    }
    // Products endpoint - uses your real products.json
    else if (path === '/api/products') {
      const products = readJsonFile('products.json');
      let filteredProducts = [...products];
      
      // Apply filters
      if (query.category && query.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.category && p.category.toLowerCase() === query.category.toLowerCase()
        );
      }

      if (query.menuOption && query.menuOption !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.menuOption && p.menuOption.toLowerCase() === query.menuOption.toLowerCase()
        );
      }

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name && (p.name.toLowerCase().includes(searchTerm) ||
          (p.description && p.description.toLowerCase().includes(searchTerm)))
        );
      }

      if (query.flavor && query.flavor !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.name && p.name.toLowerCase().includes(query.flavor.toLowerCase())
        );
      }

      if (query.brand && query.brand !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.brand && p.brand.toLowerCase() === query.brand.toLowerCase()
        );
      }

      if (query.availability && query.availability !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.availability === query.availability
        );
      }

      // Price range filter
      if (query.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(query.minPrice));
      }
      if (query.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(query.maxPrice));
      }

      // Sorting
      if (query.sortBy) {
        switch (query.sortBy) {
          case 'price-low':
            filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price-high':
            filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'name':
            filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
          case 'newest':
            filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
        }
      }

      // Pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      responseData = {
        success: true,
        products: paginatedProducts,
        data: paginatedProducts, // Keep both for compatibility
        total: filteredProducts.length,
        page,
        totalPages: Math.ceil(filteredProducts.length / limit)
      };
    }
    // Categories endpoint - uses your real categories.json
    else if (path === '/api/categories') {
      const categories = readJsonFile('categories.json');
      responseData = {
        success: true,
        categories: categories,
        data: categories // Keep both for compatibility
      };
    }
    // Categories all endpoint - same as categories but different path
    else if (path === '/api/categories/all') {
      const categories = readJsonFile('categories.json');
      responseData = {
        success: true,
        categories: categories,
        data: categories // Keep both for compatibility
      };
    }
    // Single product endpoint
    else if (path.startsWith('/api/products/') && path !== '/api/products') {
      const productId = path.split('/')[3]; // Extract ID from /api/products/ID
      const products = readJsonFile('products.json');
      const product = products.find(p => p._id === productId);
      
      if (product) {
        responseData = {
          success: true,
          product: product,
          data: product // Keep both for compatibility
        };
      } else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Product not found'
          })
        };
      }
    }
    // Bestsellers endpoint
    else if (path === '/api/products/bestsellers') {
      const products = readJsonFile('products.json');
      const limit = parseInt(query.limit) || 6;
      
      // Simple bestseller logic - products with highest stock or featured products
      const bestsellers = products
        .filter(p => p.featured || p.bestseller)
        .slice(0, limit);
      
      responseData = {
        success: true,
        products: bestsellers,
        data: bestsellers // Keep both for compatibility
      };
    }
    // Orders endpoint - uses your real orders.json
    else if (path === '/api/orders') {
      const orders = readJsonFile('orders.json');
      let filteredOrders = [...orders];

      // Apply filters
      if (query.status && query.status !== 'all') {
        filteredOrders = filteredOrders.filter(o => 
          o.status && o.status.toLowerCase() === query.status.toLowerCase()
        );
      }

      if (query.userId) {
        filteredOrders = filteredOrders.filter(o => 
          o.user && o.user._id === query.userId
        );
      }

      // Sorting
      if (query.sortBy) {
        switch (query.sortBy) {
          case 'date-newest':
            filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
          case 'date-oldest':
            filteredOrders.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            break;
          case 'amount-high':
            filteredOrders.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
            break;
          case 'amount-low':
            filteredOrders.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
            break;
        }
      }

      // Pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      responseData = {
        success: true,
        data: paginatedOrders,
        total: filteredOrders.length,
        page,
        totalPages: Math.ceil(filteredOrders.length / limit)
      };
    }
    // Admin dashboard - calculates stats from your real data
    else if (path === '/api/admin/dashboard') {
      const orders = readJsonFile('orders.json');
      const products = readJsonFile('products.json');
      const users = readJsonFile('users.json');

      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalProducts: products.length,
        totalUsers: users.length,
        recentOrders: orders.slice(0, 5),
        topProducts: products.slice(0, 3),
        ordersByStatus: {
          pending: orders.filter(o => o.status === 'pending').length,
          completed: orders.filter(o => o.status === 'completed').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        }
      };

      responseData = {
        success: true,
        data: stats
      };
    }
    // Admin orders - same as orders but for admin
    else if (path === '/api/admin/orders') {
      const orders = readJsonFile('orders.json');
      responseData = {
        success: true,
        data: orders
      };
    }
    // Weight options - uses your real weightOptions.json
    else if (path === '/api/weight-options') {
      const weightOptions = readJsonFile('weightOptions.json');
      responseData = {
        success: true,
        data: weightOptions
      };
    }
    // Menu items - uses your real menuItems.json
    else if (path === '/api/menu/active') {
      const menuItems = readJsonFile('menuItems.json');
      const activeMenuItems = menuItems.filter(item => item.isActive !== false);
      responseData = {
        success: true,
        data: activeMenuItems
      };
    }
    // Banners - uses your real banners.json
    else if (path === '/api/banners/active') {
      const banners = readJsonFile('banners.json');
      const activeBanners = banners.filter(banner => banner.isActive !== false);
      responseData = {
        success: true,
        data: activeBanners
      };
    }
    // Reviews - uses your real reviews.json
    else if (path === '/api/reviews') {
      const reviews = readJsonFile('reviews.json');
      responseData = {
        success: true,
        data: reviews
      };
    }
    // Image proxy - handles image requests
    else if (path.startsWith('/api/image-proxy/')) {
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=SK+Bakers+Image'
        },
        body: ''
      };
    }
    // 404 for unknown routes
    else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'API endpoint not found',
          path: path
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('❌ API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};