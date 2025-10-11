import db from '../database.js';

// Enhanced analytics with comprehensive business metrics
export const getEnhancedAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const orders = await db.getAllOrders();
    const products = await db.getAllProducts();
    const users = await db.getAllUsers();
    const categories = await db.getAllCategories();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Filter orders by period
    const periodOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate && new Date(order.createdAt) <= endDate
    );

    // Basic metrics
    const totalSales = periodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = periodOrders.length;
    const totalCustomers = users.filter(user => user.role === 'user').length;
    const totalProducts = products.length;
    const activeProducts = products.filter(product => product.isActive).length;

    // Sales analytics
    const salesAnalytics = analyzeSales(periodOrders, startDate, endDate);
    
    // Customer analytics
    const customerAnalytics = analyzeCustomers(users, periodOrders);
    
    // Product analytics
    const productAnalytics = analyzeProducts(products, periodOrders);
    
    // Category analytics
    const categoryAnalytics = analyzeCategories(categories, products, periodOrders);
    
    // Revenue analytics
    const revenueAnalytics = analyzeRevenue(periodOrders);
    
    // Inventory analytics
    const inventoryAnalytics = analyzeInventory(products);
    
    // Performance metrics
    const performanceMetrics = calculatePerformanceMetrics(periodOrders, users);

    const analytics = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      overview: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        activeProducts,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        conversionRate: calculateConversionRate(users, periodOrders)
      },
      sales: salesAnalytics,
      customers: customerAnalytics,
      products: productAnalytics,
      categories: categoryAnalytics,
      revenue: revenueAnalytics,
      inventory: inventoryAnalytics,
      performance: performanceMetrics
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Enhanced analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Sales analysis
const analyzeSales = (orders, startDate, endDate) => {
  const dailySales = [];
  const hourlySales = new Array(24).fill(0);
  const weeklySales = new Array(7).fill(0);
  
  // Daily sales
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOrders = orders.filter(order => 
      order.createdAt.startsWith(dateStr)
    );
    
    const dayAmount = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const dayCount = dayOrders.length;
    
    dailySales.push({
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayAmount,
      orders: dayCount,
      dateStr
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Hourly and weekly patterns
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const hour = orderDate.getHours();
    const dayOfWeek = orderDate.getDay();
    
    hourlySales[hour] += order.totalPrice;
    weeklySales[dayOfWeek] += order.totalPrice;
  });

  return {
    daily: dailySales,
    hourly: hourlySales.map((amount, hour) => ({ hour, amount })),
    weekly: weeklySales.map((amount, day) => ({ 
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day], 
      amount 
    })),
    trends: calculateSalesTrends(dailySales)
  };
};

// Customer analysis
const analyzeCustomers = (users, orders) => {
  const customers = users.filter(user => user.role === 'user');
  
  // Customer segments
  const customerSegments = {
    new: 0,
    returning: 0,
    loyal: 0,
    inactive: 0
  };

  // Customer lifetime value
  const customerLTV = {};
  
  customers.forEach(customer => {
    const customerOrders = orders.filter(order => order.user === customer._id);
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const orderCount = customerOrders.length;
    
    customerLTV[customer._id] = {
      totalSpent,
      orderCount,
      averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0
    };

    // Segment customers
    if (orderCount === 0) customerSegments.inactive++;
    else if (orderCount === 1) customerSegments.new++;
    else if (orderCount <= 3) customerSegments.returning++;
    else customerSegments.loyal++;
  });

  // Top customers
  const topCustomers = Object.entries(customerLTV)
    .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map(([customerId, data]) => {
      const customer = customers.find(c => c._id === customerId);
      return {
        customer: customer ? { name: customer.name, email: customer.email } : { name: 'Unknown', email: 'Unknown' },
        ...data
      };
    });

  return {
    total: customers.length,
    segments: customerSegments,
    averageLTV: Object.values(customerLTV).reduce((sum, data) => sum + data.totalSpent, 0) / customers.length,
    topCustomers,
    retentionRate: calculateRetentionRate(customers, orders)
  };
};

// Product analysis
const analyzeProducts = (products, orders) => {
  // Product performance
  const productPerformance = {};
  
  products.forEach(product => {
    const productOrders = orders.filter(order => 
      order.orderItems.some(item => item.product === product._id)
    );
    
    const totalSold = productOrders.reduce((sum, order) => {
      const item = order.orderItems.find(item => item.product === product._id);
      return sum + (item ? item.quantity : 0);
    }, 0);
    
    const totalRevenue = productOrders.reduce((sum, order) => {
      const item = order.orderItems.find(item => item.product === product._id);
      return sum + (item ? item.price * item.quantity : 0);
    }, 0);

    productPerformance[product._id] = {
      name: product.name,
      totalSold,
      totalRevenue,
      averageRating: product.rating || 0,
      stockLevel: product.stock,
      isActive: product.isActive
    };
  });

  // Top selling products
  const topSelling = Object.values(productPerformance)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);

  // Low stock products
  const lowStock = Object.values(productPerformance)
    .filter(product => product.stockLevel <= 10 && product.stockLevel > 0)
    .sort((a, b) => a.stockLevel - b.stockLevel);

  return {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    topSelling,
    lowStock,
    averageRating: products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
  };
};

// Category analysis
const analyzeCategories = (categories, products, orders) => {
  const categoryStats = {};
  
  categories.forEach(category => {
    const categoryProducts = products.filter(product => product.category === category.name);
    const categoryOrders = orders.filter(order => 
      order.orderItems.some(item => {
        const product = categoryProducts.find(p => p._id === item.product);
        return product && product.category === category.name;
      })
    );
    
    const totalRevenue = categoryOrders.reduce((sum, order) => {
      const categoryItems = order.orderItems.filter(item => {
        const product = categoryProducts.find(p => p._id === item.product);
        return product && product.category === category.name;
      });
      return sum + categoryItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
    }, 0);

    categoryStats[category.name] = {
      productCount: categoryProducts.length,
      totalRevenue,
      averageRating: categoryProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / categoryProducts.length || 0
    };
  });

  // Top performing categories
  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  return {
    total: categories.length,
    topCategories,
    averageProductsPerCategory: products.length / categories.length
  };
};

// Revenue analysis
const analyzeRevenue = (orders) => {
  const revenueByPaymentMethod = {};
  const revenueByStatus = {};
  
  orders.forEach(order => {
    // Payment method
    const method = order.paymentMethod || 'Unknown';
    revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + order.totalPrice;
    
    // Order status
    const status = order.status || 'Unknown';
    revenueByStatus[status] = (revenueByStatus[status] || 0) + order.totalPrice;
  });

  // Revenue growth
  const monthlyRevenue = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toISOString().slice(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalPrice;
  });

  return {
    byPaymentMethod: revenueByPaymentMethod,
    byStatus: revenueByStatus,
    monthly: monthlyRevenue,
    total: orders.reduce((sum, order) => sum + order.totalPrice, 0)
  };
};

// Inventory analysis
const analyzeInventory = (products) => {
  const stockLevels = {
    outOfStock: 0,
    lowStock: 0,
    normalStock: 0,
    overstocked: 0
  };

  let totalInventoryValue = 0;
  
  products.forEach(product => {
    totalInventoryValue += product.price * product.stock;
    
    if (product.stock === 0) stockLevels.outOfStock++;
    else if (product.stock <= 10) stockLevels.lowStock++;
    else if (product.stock <= 50) stockLevels.normalStock++;
    else stockLevels.overstocked++;
  });

  return {
    stockLevels,
    totalInventoryValue,
    averageStockLevel: products.reduce((sum, p) => sum + p.stock, 0) / products.length,
    productsNeedingRestock: products.filter(p => p.stock <= 10).length
  };
};

// Performance metrics
const calculatePerformanceMetrics = (orders, users) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalCustomers = users.filter(user => user.role === 'user').length;
  
  return {
    revenuePerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    customerAcquisitionCost: 0, // Would need marketing spend data
    customerLifetimeValue: 0, // Would need historical data
    churnRate: calculateChurnRate(users, orders)
  };
};

// Helper functions
const calculateSalesTrends = (dailySales) => {
  if (dailySales.length < 2) return { trend: 'stable', percentage: 0 };
  
  const recent = dailySales.slice(-7);
  const previous = dailySales.slice(-14, -7);
  
  const recentAvg = recent.reduce((sum, day) => sum + day.amount, 0) / recent.length;
  const previousAvg = previous.reduce((sum, day) => sum + day.amount, 0) / previous.length;
  
  if (previousAvg === 0) return { trend: 'stable', percentage: 0 };
  
  const percentage = ((recentAvg - previousAvg) / previousAvg) * 100;
  const trend = percentage > 5 ? 'increasing' : percentage < -5 ? 'decreasing' : 'stable';
  
  return { trend, percentage: Math.round(percentage * 100) / 100 };
};

const calculateConversionRate = (users, orders) => {
  const customers = users.filter(user => user.role === 'user');
  const customersWithOrders = new Set(orders.map(order => order.user));
  
  return customers.length > 0 ? (customersWithOrders.size / customers.length) * 100 : 0;
};

const calculateRetentionRate = (customers, orders) => {
  // Simple retention calculation
  const customersWithOrders = new Set(orders.map(order => order.user));
  return customers.length > 0 ? (customersWithOrders.size / customers.length) * 100 : 0;
};

const calculateChurnRate = (users, orders) => {
  // Simple churn calculation
  const customers = users.filter(user => user.role === 'user');
  const activeCustomers = new Set(orders.map(order => order.user));
  
  return customers.length > 0 ? ((customers.length - activeCustomers.size) / customers.length) * 100 : 0;
};

// Real-time analytics
export const getRealTimeAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const orders = await db.getAllOrders();
    const todayOrders = orders.filter(order => 
      order.createdAt.startsWith(today)
    );
    
    const realTimeData = {
      todaySales: todayOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      todayOrders: todayOrders.length,
      currentHour: now.getHours(),
      activeUsers: Math.floor(Math.random() * 50) + 10, // Mock data
      lastOrder: todayOrders.length > 0 ? todayOrders[todayOrders.length - 1] : null
    };

    res.json({
      success: true,
      realTime: realTimeData
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time analytics'
    });
  }
};

// Export analytics data
export const exportAnalytics = async (req, res) => {
  try {
    const { format = 'json', period = '30d' } = req.query;
    
    // Get analytics data
    const analytics = await getEnhancedAnalytics({ query: { period } });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(analytics);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}.csv`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: analytics
      });
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics'
    });
  }
};

// Convert analytics to CSV
const convertToCSV = (analytics) => {
  // Implementation for CSV conversion
  // This is a simplified version
  let csv = 'Metric,Value\n';
  csv += `Total Sales,${analytics.overview.totalSales}\n`;
  csv += `Total Orders,${analytics.overview.totalOrders}\n`;
  csv += `Total Customers,${analytics.overview.totalCustomers}\n`;
  csv += `Average Order Value,${analytics.overview.averageOrderValue}\n`;
  
  return csv;
};
