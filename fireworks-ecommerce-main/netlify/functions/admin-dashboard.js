// Admin Dashboard API Function - Uses REAL data from your database
const fs = require('fs');
const path = require('path');

// Helper function to read JSON data files from your real database
const readJsonFile = (filePath) => {
  try {
    const dataPath = path.join(process.cwd(), 'netlify', 'functions', 'data', filePath);
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://monumental-monstera-017d87.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Read REAL data from your database
    const orders = readJsonFile('orders.json');
    const products = readJsonFile('products.json');
    const users = readJsonFile('users.json');
    const categories = readJsonFile('categories.json');

    // Calculate real statistics from your data
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalProducts = products.length;
    const totalUsers = users.length;
    
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
      .slice(0, 5);
    
    const topProducts = products
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 3);
    
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      processing: orders.filter(o => o.status === 'processing').length
    };

    // Calculate revenue by month from real orders
    const revenueByMonth = [];
    const monthlyRevenue = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt || order.orderDate);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthlyRevenue[key]) {
        monthlyRevenue[key] = 0;
      }
      monthlyRevenue[key] += order.totalAmount || 0;
    });
    
    Object.entries(monthlyRevenue).forEach(([month, revenue]) => {
      revenueByMonth.push({ month, revenue });
    });

    const stats = {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
      ordersByStatus,
      revenueByMonth: revenueByMonth.slice(-6) // Last 6 months
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: stats
      })
    };
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      })
    };
  }
};
