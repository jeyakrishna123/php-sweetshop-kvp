#!/usr/bin/env node

/**
 * Comprehensive API Test Suite for SK Bakers E-commerce Application
 * Tests all CRUD operations for all endpoints
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Test data
const testData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    password: 'testpassword123',
    role: 'user'
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@example.com',
    phone: '9876543211',
    password: 'adminpassword123',
    role: 'admin'
  },
  product: {
    name: 'Test Product',
    description: 'Test product description',
    price: 100,
    stock: 50,
    category: 'Test Category',
    brand: 'Test Brand',
    images: ['test-image.jpg']
  },
  order: {
    orderItems: [
      {
        product: 'test-product-id',
        name: 'Test Product',
        quantity: 2,
        price: 100,
        image: 'test-image.jpg'
      }
    ],
    shippingAddress: {
      name: 'Test User',
      phone: '9876543210',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      postalCode: '123456',
      country: 'India'
    },
    paymentMethod: 'COD',
    itemsPrice: 200,
    taxPrice: 36,
    shippingPrice: 0,
    totalPrice: 236
  }
};

// Helper functions
const logTest = (testName, status, details = '') => {
  const result = {
    test: testName,
    status: status ? 'PASS' : 'FAIL',
    details: details,
    timestamp: new Date().toISOString()
  };
  
  TEST_RESULTS.details.push(result);
  TEST_RESULTS.total++;
  if (status) {
    TEST_RESULTS.passed++;
    console.log(`✅ ${testName}`);
  } else {
    TEST_RESULTS.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
};

const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🔍 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  logTest('Health Check', result.success, result.error);
};

const testAuthEndpoints = async () => {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test user registration
  const registerResult = await makeRequest('POST', '/api/auth/register', testData.user);
  logTest('User Registration', registerResult.success, registerResult.error);
  
  // Test user login
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: testData.user.email,
    password: testData.user.password
  });
  logTest('User Login', loginResult.success, loginResult.error);
  
  let userToken = '';
  if (loginResult.success) {
    userToken = loginResult.data.token;
  }
  
  // Test admin registration
  const adminRegisterResult = await makeRequest('POST', '/api/auth/register', testData.admin);
  logTest('Admin Registration', adminRegisterResult.success, adminRegisterResult.error);
  
  // Test admin login
  const adminLoginResult = await makeRequest('POST', '/api/auth/admin-login', {
    email: testData.admin.email,
    password: testData.admin.password
  });
  logTest('Admin Login', adminLoginResult.success, adminLoginResult.error);
  
  let adminToken = '';
  if (adminLoginResult.success) {
    adminToken = adminLoginResult.data.token;
  }
  
  // Test token verification
  if (userToken) {
    const verifyResult = await makeRequest('GET', '/api/auth/verify', null, {
      'Authorization': `Bearer ${userToken}`
    });
    logTest('Token Verification', verifyResult.success, verifyResult.error);
  }
  
  // Test admin token verification
  if (adminToken) {
    const adminVerifyResult = await makeRequest('GET', '/api/auth/verify-admin', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Admin Token Verification', adminVerifyResult.success, adminVerifyResult.error);
  }
  
  return { userToken, adminToken };
};

const testProductEndpoints = async (adminToken) => {
  console.log('\n📦 Testing Product Endpoints...');
  
  if (!adminToken) {
    logTest('Product Tests', false, 'No admin token available');
    return null;
  }
  
  // Test create product
  const createResult = await makeRequest('POST', '/api/products', testData.product, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Create Product', createResult.success, createResult.error);
  
  let productId = null;
  if (createResult.success) {
    productId = createResult.data.product._id;
  }
  
  // Test get all products
  const getAllResult = await makeRequest('GET', '/api/products');
  logTest('Get All Products', getAllResult.success, getAllResult.error);
  
  // Test get single product
  if (productId) {
    const getSingleResult = await makeRequest('GET', `/api/products/${productId}`);
    logTest('Get Single Product', getSingleResult.success, getSingleResult.error);
  }
  
  // Test update product
  if (productId) {
    const updateData = { ...testData.product, name: 'Updated Test Product', price: 150 };
    const updateResult = await makeRequest('PUT', `/api/products/${productId}`, updateData, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Update Product', updateResult.success, updateResult.error);
  }
  
  // Test product search
  const searchResult = await makeRequest('GET', '/api/products?search=test');
  logTest('Product Search', searchResult.success, searchResult.error);
  
  // Test product filtering
  const filterResult = await makeRequest('GET', '/api/products?category=Test Category');
  logTest('Product Filtering', filterResult.success, filterResult.error);
  
  // Test delete product
  if (productId) {
    const deleteResult = await makeRequest('DELETE', `/api/products/${productId}`, null, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Delete Product', deleteResult.success, deleteResult.error);
  }
  
  return productId;
};

const testOrderEndpoints = async (userToken, adminToken) => {
  console.log('\n🛒 Testing Order Endpoints...');
  
  if (!userToken) {
    logTest('Order Tests', false, 'No user token available');
    return null;
  }
  
  // Test create order (this might fail if no products exist)
  const createOrderResult = await makeRequest('POST', '/api/orders', testData.order, {
    'Authorization': `Bearer ${userToken}`
  });
  logTest('Create Order', createOrderResult.success, createOrderResult.error);
  
  let orderId = null;
  if (createOrderResult.success) {
    orderId = createOrderResult.data.order._id;
  }
  
  // Test get user orders
  const myOrdersResult = await makeRequest('GET', '/api/orders/my-orders', null, {
    'Authorization': `Bearer ${userToken}`
  });
  logTest('Get User Orders', myOrdersResult.success, myOrdersResult.error);
  
  // Test get single order
  if (orderId) {
    const getSingleOrderResult = await makeRequest('GET', `/api/orders/${orderId}`, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logTest('Get Single Order', getSingleOrderResult.success, getSingleOrderResult.error);
  }
  
  // Test admin get all orders
  if (adminToken) {
    const adminOrdersResult = await makeRequest('GET', '/api/orders/admin/all', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Admin Get All Orders', adminOrdersResult.success, adminOrdersResult.error);
  }
  
  // Test update order status (admin only)
  if (adminToken && orderId) {
    const updateStatusResult = await makeRequest('PUT', `/api/orders/admin/${orderId}/status`, {
      status: 'processing'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Update Order Status', updateStatusResult.success, updateStatusResult.error);
  }
  
  return orderId;
};

const testUserEndpoints = async (userToken, adminToken) => {
  console.log('\n👤 Testing User Endpoints...');
  
  // Test get user profile
  if (userToken) {
    const profileResult = await makeRequest('GET', '/api/users/profile', null, {
      'Authorization': `Bearer ${userToken}`
    });
    logTest('Get User Profile', profileResult.success, profileResult.error);
  }
  
  // Test update user profile
  if (userToken) {
    const updateProfileResult = await makeRequest('PUT', '/api/users/profile', {
      name: 'Updated Test User',
      phone: '9876543212'
    }, {
      'Authorization': `Bearer ${userToken}`
    });
    logTest('Update User Profile', updateProfileResult.success, updateProfileResult.error);
  }
  
  // Test admin get all users
  if (adminToken) {
    const allUsersResult = await makeRequest('GET', '/api/users', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Admin Get All Users', allUsersResult.success, allUsersResult.error);
  }
};

const testAdminEndpoints = async (adminToken) => {
  console.log('\n⚙️ Testing Admin Endpoints...');
  
  if (!adminToken) {
    logTest('Admin Tests', false, 'No admin token available');
    return;
  }
  
  // Test admin dashboard
  const dashboardResult = await makeRequest('GET', '/api/admin/dashboard', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Dashboard', dashboardResult.success, dashboardResult.error);
  
  // Test admin analytics
  const analyticsResult = await makeRequest('GET', '/api/admin/analytics', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Analytics', analyticsResult.success, analyticsResult.error);
  
  // Test admin inventory
  const inventoryResult = await makeRequest('GET', '/api/admin/inventory', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Inventory', inventoryResult.success, inventoryResult.error);
  
  // Test admin reports
  const reportsResult = await makeRequest('GET', '/api/admin/reports', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Reports', reportsResult.success, reportsResult.error);
  
  // Test admin products
  const adminProductsResult = await makeRequest('GET', '/api/admin/products', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Products', adminProductsResult.success, adminProductsResult.error);
  
  // Test admin users
  const adminUsersResult = await makeRequest('GET', '/api/admin/users', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Users', adminUsersResult.success, adminUsersResult.error);
  
  // Test admin orders
  const adminOrdersResult = await makeRequest('GET', '/api/admin/orders', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Orders', adminOrdersResult.success, adminOrdersResult.error);
};

const testCategoryEndpoints = async (adminToken) => {
  console.log('\n📂 Testing Category Endpoints...');
  
  // Test get all categories (public)
  const categoriesResult = await makeRequest('GET', '/api/categories');
  logTest('Get All Categories', categoriesResult.success, categoriesResult.error);
  
  // Test create category (admin only)
  if (adminToken) {
    const createCategoryResult = await makeRequest('POST', '/api/categories', {
      name: 'Test Category',
      description: 'Test category description',
      image: 'test-category.jpg'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Create Category', createCategoryResult.success, createCategoryResult.error);
  }
};

const testOtherEndpoints = async (adminToken) => {
  console.log('\n🔧 Testing Other Endpoints...');
  
  // Test banner endpoints
  if (adminToken) {
    const bannersResult = await makeRequest('GET', '/api/banners', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    logTest('Get Banners', bannersResult.success, bannersResult.error);
  }
  
  // Test public banner endpoint
  const publicBannersResult = await makeRequest('GET', '/api/banners/public');
  logTest('Get Public Banners', publicBannersResult.success, publicBannersResult.error);
  
  // Test search endpoint
  const searchResult = await makeRequest('GET', '/api/search?q=test');
  logTest('Search Products', searchResult.success, searchResult.error);
  
  // Test wishlist endpoints (if user token available)
  // Note: These would need a user token to test properly
};

const generateReport = () => {
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Total Tests: ${TEST_RESULTS.total}`);
  console.log(`Passed: ${TEST_RESULTS.passed}`);
  console.log(`Failed: ${TEST_RESULTS.failed}`);
  console.log(`Success Rate: ${((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(2)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('====================');
  TEST_RESULTS.details.forEach((result, index) => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.test}`);
    if (result.details && result.status === 'FAIL') {
      console.log(`   Error: ${JSON.stringify(result.details)}`);
    }
  });
  
  // Save detailed report to file
  const reportData = {
    summary: {
      total: TEST_RESULTS.total,
      passed: TEST_RESULTS.passed,
      failed: TEST_RESULTS.failed,
      successRate: ((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(2)
    },
    details: TEST_RESULTS.details,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('api-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed report saved to: api-test-report.json');
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API Test Suite');
  console.log('==========================================');
  console.log(`Testing API at: ${API_BASE_URL}`);
  console.log(`Test started at: ${new Date().toISOString()}\n`);
  
  try {
    // Run all tests
    await testHealthCheck();
    
    const { userToken, adminToken } = await testAuthEndpoints();
    
    await testProductEndpoints(adminToken);
    await testOrderEndpoints(userToken, adminToken);
    await testUserEndpoints(userToken, adminToken);
    await testAdminEndpoints(adminToken);
    await testCategoryEndpoints(adminToken);
    await testOtherEndpoints(adminToken);
    
    generateReport();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
};

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testData };
