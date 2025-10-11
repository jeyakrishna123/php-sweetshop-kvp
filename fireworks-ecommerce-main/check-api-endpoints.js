#!/usr/bin/env node

/**
 * Quick API Endpoint Checker for SK Bakers E-commerce Application
 * Verifies all API endpoints are accessible and responding
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// All API endpoints to test
const endpoints = [
  // Health & Status
  { method: 'GET', path: '/health', description: 'Health Check' },
  { method: 'GET', path: '/', description: 'Root Endpoint' },
  
  // Authentication
  { method: 'POST', path: '/api/auth/register', description: 'User Registration', requiresData: true },
  { method: 'POST', path: '/api/auth/login', description: 'User Login', requiresData: true },
  { method: 'POST', path: '/api/auth/admin-login', description: 'Admin Login', requiresData: true },
  { method: 'GET', path: '/api/auth/verify', description: 'Token Verification', requiresAuth: true },
  { method: 'GET', path: '/api/auth/verify-admin', description: 'Admin Token Verification', requiresAuth: true },
  { method: 'GET', path: '/api/auth/me', description: 'Get Current User', requiresAuth: true },
  
  // Products
  { method: 'GET', path: '/api/products', description: 'Get All Products' },
  { method: 'GET', path: '/api/products/bestsellers', description: 'Get Bestseller Products' },
  { method: 'GET', path: '/api/products/summaries', description: 'Get Product Summaries' },
  { method: 'GET', path: '/api/products/cake-flavor/chocolate', description: 'Get Products by Cake Flavor' },
  { method: 'GET', path: '/api/products/type/cakes', description: 'Get Products by Type' },
  { method: 'POST', path: '/api/products', description: 'Create Product', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/products/test-id', description: 'Update Product', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/products/test-id', description: 'Delete Product', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/products/duplicates', description: 'Remove Duplicate Products', requiresAuth: true, requiresAdmin: true },
  
  // Orders
  { method: 'GET', path: '/api/orders/track/test-tracking', description: 'Track Order by Tracking Number' },
  { method: 'GET', path: '/api/orders/test-email', description: 'Test Email Functionality' },
  { method: 'POST', path: '/api/orders', description: 'Create Order', requiresAuth: true },
  { method: 'GET', path: '/api/orders/my-orders', description: 'Get User Orders', requiresAuth: true },
  { method: 'GET', path: '/api/orders/admin/all', description: 'Admin Get All Orders', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/orders/test-id', description: 'Update Order', requiresAuth: true },
  { method: 'PUT', path: '/api/orders/test-id/pay', description: 'Update Order to Paid', requiresAuth: true },
  { method: 'PUT', path: '/api/orders/test-id/cancel', description: 'Cancel Order', requiresAuth: true },
  { method: 'PUT', path: '/api/orders/admin/test-id', description: 'Admin Update Order', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/orders/admin/test-id/status', description: 'Update Order Status', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/orders/admin/test-id', description: 'Admin Delete Order', requiresAuth: true, requiresAdmin: true },
  
  // Users
  { method: 'GET', path: '/api/users/profile', description: 'Get User Profile', requiresAuth: true },
  { method: 'PUT', path: '/api/users/profile', description: 'Update User Profile', requiresAuth: true },
  { method: 'GET', path: '/api/users', description: 'Admin Get All Users', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/users/test-id', description: 'Admin Get Single User', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/users/test-id', description: 'Admin Update User', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/users/test-id', description: 'Admin Delete User', requiresAuth: true, requiresAdmin: true },
  
  // Admin
  { method: 'GET', path: '/api/admin/dashboard', description: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/analytics', description: 'Admin Analytics', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/inventory', description: 'Admin Inventory', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/reports', description: 'Admin Reports', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/order-stats', description: 'Admin Order Stats', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/user-stats', description: 'Admin User Stats', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/users', description: 'Admin Users', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/user/test-id', description: 'Admin Get Single User', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/admin/user/test-id', description: 'Admin Update User', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/admin/user/test-id', description: 'Admin Delete User', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/orders', description: 'Admin Orders', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/admin/order/test-id', description: 'Admin Update Order', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/admin/order/test-id/status', description: 'Admin Update Order Status', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/products', description: 'Admin Products', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/product/test-id', description: 'Admin Get Single Product', requiresAuth: true, requiresAdmin: true },
  { method: 'POST', path: '/api/admin/product/new', description: 'Admin Create Product', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/admin/product/test-id', description: 'Admin Update Product', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/admin/product/test-id', description: 'Admin Delete Product', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/admin/banners', description: 'Admin Get Banners', requiresAuth: true, requiresAdmin: true },
  { method: 'POST', path: '/api/admin/banners', description: 'Admin Create Banner', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/admin/banners/test-id', description: 'Admin Update Banner', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/admin/banners/test-id', description: 'Admin Delete Banner', requiresAuth: true, requiresAdmin: true },
  { method: 'POST', path: '/api/admin/banners/reorder', description: 'Admin Reorder Banners', requiresAuth: true, requiresAdmin: true },
  { method: 'PATCH', path: '/api/admin/banners/test-id/toggle', description: 'Admin Toggle Banner Status', requiresAuth: true, requiresAdmin: true },
  { method: 'POST', path: '/api/admin/upload-images', description: 'Admin Upload Images', requiresAuth: true, requiresAdmin: true },
  
  // Categories
  { method: 'GET', path: '/api/categories', description: 'Get All Categories' },
  { method: 'POST', path: '/api/categories', description: 'Create Category', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/categories/test-id', description: 'Get Single Category' },
  { method: 'PUT', path: '/api/categories/test-id', description: 'Update Category', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/categories/test-id', description: 'Delete Category', requiresAuth: true, requiresAdmin: true },
  
  // Banners
  { method: 'GET', path: '/api/banners', description: 'Get All Banners', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/banners/public', description: 'Get Public Banners' },
  { method: 'POST', path: '/api/banners', description: 'Create Banner', requiresAuth: true, requiresAdmin: true },
  { method: 'PUT', path: '/api/banners/test-id', description: 'Update Banner', requiresAuth: true, requiresAdmin: true },
  { method: 'DELETE', path: '/api/banners/test-id', description: 'Delete Banner', requiresAuth: true, requiresAdmin: true },
  
  // Search
  { method: 'GET', path: '/api/search', description: 'Search Products' },
  { method: 'GET', path: '/api/search/suggestions', description: 'Search Suggestions' },
  
  // Reviews
  { method: 'GET', path: '/api/reviews', description: 'Get All Reviews' },
  { method: 'POST', path: '/api/reviews', description: 'Create Review', requiresAuth: true },
  { method: 'GET', path: '/api/reviews/test-id', description: 'Get Single Review' },
  { method: 'PUT', path: '/api/reviews/test-id', description: 'Update Review', requiresAuth: true },
  { method: 'DELETE', path: '/api/reviews/test-id', description: 'Delete Review', requiresAuth: true },
  
  // Wishlist
  { method: 'GET', path: '/api/wishlist', description: 'Get User Wishlist', requiresAuth: true },
  { method: 'POST', path: '/api/wishlist', description: 'Add to Wishlist', requiresAuth: true },
  { method: 'DELETE', path: '/api/wishlist/test-id', description: 'Remove from Wishlist', requiresAuth: true },
  
  // Payment
  { method: 'POST', path: '/api/payment/create-payment-intent', description: 'Create Payment Intent', requiresAuth: true },
  { method: 'POST', path: '/api/payment/confirm-payment', description: 'Confirm Payment', requiresAuth: true },
  { method: 'GET', path: '/api/payment/methods', description: 'Get Payment Methods' },
  
  // Stripe
  { method: 'POST', path: '/api/stripe/create-payment-intent', description: 'Stripe Create Payment Intent', requiresAuth: true },
  { method: 'POST', path: '/api/stripe/confirm-payment', description: 'Stripe Confirm Payment', requiresAuth: true },
  { method: 'POST', path: '/api/stripe/webhook', description: 'Stripe Webhook' },
  
  // Analytics
  { method: 'GET', path: '/api/analytics/overview', description: 'Analytics Overview' },
  { method: 'GET', path: '/api/analytics/sales', description: 'Sales Analytics' },
  { method: 'GET', path: '/api/analytics/products', description: 'Product Analytics' },
  { method: 'GET', path: '/api/analytics/users', description: 'User Analytics' },
  
  // Other endpoints
  { method: 'GET', path: '/api/upload', description: 'Upload Endpoint' },
  { method: 'GET', path: '/api/tracking/test-tracking', description: 'Order Tracking' },
  { method: 'GET', path: '/api/offer-popups', description: 'Get Offer Popups' },
  { method: 'POST', path: '/api/offer-popups', description: 'Create Offer Popup', requiresAuth: true, requiresAdmin: true },
  { method: 'GET', path: '/api/weight-options', description: 'Get Weight Options' },
  { method: 'POST', path: '/api/weight-options', description: 'Create Weight Option', requiresAuth: true, requiresAdmin: true },
];

// Test data for endpoints that require data
const testData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    password: 'testpassword123'
  },
  product: {
    name: 'Test Product',
    description: 'Test product description',
    price: 100,
    stock: 50,
    category: 'Test Category',
    brand: 'Test Brand'
  },
  order: {
    orderItems: [{ product: 'test-id', name: 'Test Product', quantity: 1, price: 100 }],
    shippingAddress: { name: 'Test User', phone: '9876543210', address: '123 Test St', city: 'Test City', state: 'Test State', postalCode: '123456', country: 'India' },
    paymentMethod: 'COD',
    itemsPrice: 100,
    taxPrice: 18,
    shippingPrice: 0,
    totalPrice: 118
  },
  category: {
    name: 'Test Category',
    description: 'Test category description',
    image: 'test-category.jpg'
  },
  review: {
    rating: 5,
    comment: 'Great product!',
    product: 'test-product-id'
  }
};

// Helper function to make requests
const makeRequest = async (method, path, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000 // 5 second timeout
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { 
      success: true, 
      status: response.status, 
      data: response.data,
      message: 'OK'
    };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 0,
      error: error.response?.data || error.message,
      message: error.response?.status ? `HTTP ${error.response.status}` : 'Connection Error'
    };
  }
};

// Test individual endpoint
const testEndpoint = async (endpoint) => {
  const { method, path, description, requiresData, requiresAuth, requiresAdmin } = endpoint;
  
  let data = null;
  let headers = {};
  
  // Add test data if required
  if (requiresData) {
    if (path.includes('/auth/register') || path.includes('/auth/login')) {
      data = testData.user;
    } else if (path.includes('/products')) {
      data = testData.product;
    } else if (path.includes('/orders')) {
      data = testData.order;
    } else if (path.includes('/categories')) {
      data = testData.category;
    } else if (path.includes('/reviews')) {
      data = testData.review;
    }
  }
  
  // Add auth headers if required (using dummy token for testing)
  if (requiresAuth) {
    headers['Authorization'] = 'Bearer dummy-token-for-testing';
  }
  
  const result = await makeRequest(method, path, data, headers);
  
  return {
    endpoint: `${method} ${path}`,
    description,
    status: result.success ? '✅' : '❌',
    response: result.message,
    details: result.success ? 'OK' : result.error
  };
};

// Main function
const checkAllEndpoints = async () => {
  console.log('🔍 SK Bakers API Endpoint Checker');
  console.log('==================================');
  console.log(`Testing API at: ${API_BASE_URL}`);
  console.log(`Total endpoints to check: ${endpoints.length}\n`);
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.method} ${endpoint.path}... `);
    
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.status === '✅') {
      passed++;
      console.log('✅');
    } else {
      failed++;
      console.log(`❌ (${result.response})`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`Total Endpoints: ${endpoints.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / endpoints.length) * 100).toFixed(2)}%`);
  
  console.log('\n📋 DETAILED RESULTS');
  console.log('===================');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.status} ${result.endpoint}`);
    console.log(`   ${result.description}`);
    console.log(`   Response: ${result.response}`);
    if (result.details !== 'OK') {
      console.log(`   Details: ${JSON.stringify(result.details)}`);
    }
    console.log('');
  });
  
  // Save results to file
  const report = {
    summary: {
      total: endpoints.length,
      passed,
      failed,
      successRate: ((passed / endpoints.length) * 100).toFixed(2)
    },
    results,
    timestamp: new Date().toISOString()
  };
  
  require('fs').writeFileSync('endpoint-check-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to: endpoint-check-report.json');
};

// Run the checker
if (require.main === module) {
  checkAllEndpoints().catch(console.error);
}

module.exports = { checkAllEndpoints, endpoints };
