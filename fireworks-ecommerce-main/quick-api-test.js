#!/usr/bin/env node

/**
 * Quick API Test for Critical Endpoints
 * Tests the most important CRUD operations
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Test data
const testUser = {
  name: 'API Test User',
  email: 'apitest@example.com',
  phone: '9876543210',
  password: 'testpass123'
};

const testProduct = {
  name: 'API Test Product',
  description: 'This is a test product for API testing',
  price: 299,
  stock: 100,
  category: 'Test Category',
  brand: 'Test Brand',
  images: ['test-image.jpg']
};

let userToken = '';
let adminToken = '';
let productId = '';

// Helper function
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 10000
    };
    if (data) config.data = data;
    
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

const logTest = (testName, success, details = '') => {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
};

// Test functions
const testServerHealth = async () => {
  console.log('\n🔍 Testing Server Health...');
  const result = await makeRequest('GET', '/health');
  logTest('Server Health Check', result.success, result.error);
  return result.success;
};

const testUserRegistration = async () => {
  console.log('\n👤 Testing User Registration...');
  const result = await makeRequest('POST', '/api/auth/register', testUser);
  logTest('User Registration', result.success, result.error);
  return result.success;
};

const testUserLogin = async () => {
  console.log('\n🔐 Testing User Login...');
  const result = await makeRequest('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (result.success) {
    userToken = result.data.token;
    logTest('User Login', true, 'Token received');
  } else {
    logTest('User Login', false, result.error);
  }
  return result.success;
};

const testAdminLogin = async () => {
  console.log('\n⚙️ Testing Admin Login...');
  const result = await makeRequest('POST', '/api/auth/admin-login', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  
  if (result.success) {
    adminToken = result.data.token;
    logTest('Admin Login', true, 'Admin token received');
  } else {
    logTest('Admin Login', false, 'No admin user found - this is normal for new installations');
  }
  return result.success;
};

const testProductCRUD = async () => {
  console.log('\n📦 Testing Product CRUD Operations...');
  
  // Create Product
  const createResult = await makeRequest('POST', '/api/products', testProduct, {
    'Authorization': `Bearer ${adminToken || userToken}`
  });
  logTest('Create Product', createResult.success, createResult.error);
  
  if (createResult.success) {
    productId = createResult.data.product._id;
  }
  
  // Get All Products
  const getAllResult = await makeRequest('GET', '/api/products');
  logTest('Get All Products', getAllResult.success, getAllResult.error);
  
  // Get Single Product
  if (productId) {
    const getSingleResult = await makeRequest('GET', `/api/products/${productId}`);
    logTest('Get Single Product', getSingleResult.success, getSingleResult.error);
  }
  
  // Update Product
  if (productId) {
    const updateResult = await makeRequest('PUT', `/api/products/${productId}`, {
      ...testProduct,
      name: 'Updated Test Product',
      price: 399
    }, {
      'Authorization': `Bearer ${adminToken || userToken}`
    });
    logTest('Update Product', updateResult.success, updateResult.error);
  }
  
  return createResult.success;
};

const testOrderCRUD = async () => {
  console.log('\n🛒 Testing Order CRUD Operations...');
  
  if (!userToken) {
    logTest('Order Tests', false, 'No user token available');
    return false;
  }
  
  const testOrder = {
    orderItems: [{
      product: productId || 'test-product-id',
      name: 'Test Product',
      quantity: 2,
      price: 299,
      image: 'test-image.jpg'
    }],
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
    itemsPrice: 598,
    taxPrice: 107.64,
    shippingPrice: 0,
    totalPrice: 705.64
  };
  
  // Create Order
  const createResult = await makeRequest('POST', '/api/orders', testOrder, {
    'Authorization': `Bearer ${userToken}`
  });
  logTest('Create Order', createResult.success, createResult.error);
  
  // Get User Orders
  const myOrdersResult = await makeRequest('GET', '/api/orders/my-orders', null, {
    'Authorization': `Bearer ${userToken}`
  });
  logTest('Get User Orders', myOrdersResult.success, myOrdersResult.error);
  
  return createResult.success;
};

const testUserProfile = async () => {
  console.log('\n👤 Testing User Profile Operations...');
  
  if (!userToken) {
    logTest('Profile Tests', false, 'No user token available');
    return false;
  }
  
  // Get Profile
  const getProfileResult = await makeRequest('GET', '/api/users/profile', null, {
    'Authorization': `Bearer ${userToken}`
  });
  logTest('Get User Profile', getProfileResult.success, getProfileResult.error);
  
  // Update Profile
  const updateProfileResult = await makeRequest('PUT', '/api/users/profile', {
    name: 'Updated Test User',
    phone: '9876543211'
  }, {
    'Authorization': `Bearer ${userToken}`
  });
  logTest('Update User Profile', updateProfileResult.success, updateProfileResult.error);
  
  return getProfileResult.success;
};

const testAdminEndpoints = async () => {
  console.log('\n⚙️ Testing Admin Endpoints...');
  
  if (!adminToken) {
    logTest('Admin Tests', false, 'No admin token available - skipping admin tests');
    return false;
  }
  
  // Admin Dashboard
  const dashboardResult = await makeRequest('GET', '/api/admin/dashboard', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Dashboard', dashboardResult.success, dashboardResult.error);
  
  // Admin Products
  const productsResult = await makeRequest('GET', '/api/admin/products', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Products', productsResult.success, productsResult.error);
  
  // Admin Orders
  const ordersResult = await makeRequest('GET', '/api/admin/orders', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  logTest('Admin Orders', ordersResult.success, ordersResult.error);
  
  return dashboardResult.success;
};

const testPublicEndpoints = async () => {
  console.log('\n🌐 Testing Public Endpoints...');
  
  // Get Categories
  const categoriesResult = await makeRequest('GET', '/api/categories');
  logTest('Get Categories', categoriesResult.success, categoriesResult.error);
  
  // Search Products
  const searchResult = await makeRequest('GET', '/api/products?search=test');
  logTest('Search Products', searchResult.success, searchResult.error);
  
  // Get Bestsellers
  const bestsellersResult = await makeRequest('GET', '/api/products/bestsellers');
  logTest('Get Bestsellers', bestsellersResult.success, bestsellersResult.error);
  
  return true;
};

const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete test product
  if (productId && (adminToken || userToken)) {
    const deleteResult = await makeRequest('DELETE', `/api/products/${productId}`, null, {
      'Authorization': `Bearer ${adminToken || userToken}`
    });
    logTest('Cleanup - Delete Test Product', deleteResult.success, deleteResult.error);
  }
};

// Main test runner
const runQuickTest = async () => {
  console.log('🚀 Quick API Test for SK Bakers E-commerce');
  console.log('==========================================');
  console.log(`Testing API at: ${API_BASE_URL}\n`);
  
  const results = {
    serverHealth: false,
    userRegistration: false,
    userLogin: false,
    adminLogin: false,
    productCRUD: false,
    orderCRUD: false,
    userProfile: false,
    adminEndpoints: false,
    publicEndpoints: false
  };
  
  try {
    // Run tests
    results.serverHealth = await testServerHealth();
    results.userRegistration = await testUserRegistration();
    results.userLogin = await testUserLogin();
    results.adminLogin = await testAdminLogin();
    results.productCRUD = await testProductCRUD();
    results.orderCRUD = await testOrderCRUD();
    results.userProfile = await testUserProfile();
    results.adminEndpoints = await testAdminEndpoints();
    results.publicEndpoints = await testPublicEndpoints();
    
    // Cleanup
    await cleanup();
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`);
    });
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Your API is working perfectly!');
    } else {
      console.log('\n⚠️ Some tests failed. Check the details above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run the tests
if (require.main === module) {
  runQuickTest();
}

module.exports = { runQuickTest };
