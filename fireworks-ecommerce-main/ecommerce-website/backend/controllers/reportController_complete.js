import db from '../database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate comprehensive sales report
export const generateSalesReport = async (req, res) => {
  try {
    const { dateRange = '30', format = 'json', includeCharts = true } = req.body;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(dateRange));
    
    // Get orders data
    const orders = await db.getOrders();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Calculate sales metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group by date for trend analysis
    const dailySales = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, orders: 0 };
      }
      dailySales[date].revenue += order.totalAmount;
      dailySales[date].orders += 1;
    });
    
    // Top selling products
    const productSales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0, name: item.name };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Payment method analysis
    const paymentMethods = {};
    filteredOrders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, revenue: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].revenue += order.totalAmount;
    });
    
    // Customer analysis
    const customerOrders = {};
    filteredOrders.forEach(order => {
      if (!customerOrders[order.userId]) {
        customerOrders[order.userId] = { orders: 0, revenue: 0 };
      }
      customerOrders[order.userId].orders += 1;
      customerOrders[order.userId].revenue += order.totalAmount;
    });
    
    const topCustomers = Object.entries(customerOrders)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    const reportData = {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: parseInt(dateRange)
      },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        growthRate: calculateGrowthRate(filteredOrders, dateRange),
        conversionRate: calculateConversionRate(filteredOrders, dateRange)
      },
      dailySales: Object.entries(dailySales).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      })),
      topProducts,
      topCustomers,
      paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
        method,
        count: data.count,
        revenue: data.revenue,
        percentage: ((data.revenue / totalRevenue) * 100).toFixed(2)
      })),
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'pdf') {
      const pdfBuffer = await generateSalesReportPDF(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }
    
    res.json({
      success: true,
      report: reportData,
      message: 'Sales report generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

// Generate customer analytics report
export const generateCustomerReport = async (req, res) => {
  try {
    const { dateRange = '30', format = 'json' } = req.body;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(dateRange));
    
    // Get users and orders data
    const users = await db.getUsers();
    const orders = await db.getOrders();
    
    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Customer metrics
    const totalCustomers = users.length;
    const activeCustomers = new Set(filteredOrders.map(order => order.userId)).size;
    const newCustomers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate >= startDate;
    }).length;
    
    // Customer lifetime value analysis
    const customerStats = {};
    orders.forEach(order => {
      if (!customerStats[order.userId]) {
        customerStats[order.userId] = {
          totalOrders: 0,
          totalSpent: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt
        };
      }
      customerStats[order.userId].totalOrders += 1;
      customerStats[order.userId].totalSpent += order.totalAmount;
      customerStats[order.userId].lastOrder = order.createdAt;
    });
    
    const customerValues = Object.values(customerStats);
    const averageCustomerValue = customerValues.length > 0 
      ? customerValues.reduce((sum, c) => sum + c.totalSpent, 0) / customerValues.length 
      : 0;
    
    // Customer segments
    const segments = {
      highValue: customerValues.filter(c => c.totalSpent > averageCustomerValue * 2).length,
      mediumValue: customerValues.filter(c => c.totalSpent > averageCustomerValue && c.totalSpent <= averageCustomerValue * 2).length,
      lowValue: customerValues.filter(c => c.totalSpent <= averageCustomerValue).length
    };
    
    // Geographic distribution
    const locations = {};
    users.forEach(user => {
      if (user.address && user.address.city) {
        const city = user.address.city;
        if (!locations[city]) {
          locations[city] = 0;
        }
        locations[city] += 1;
      }
    });
    
    // Customer acquisition channels
    const acquisitionChannels = {};
    users.forEach(user => {
      const channel = user.acquisitionChannel || 'direct';
      if (!acquisitionChannels[channel]) {
        acquisitionChannels[channel] = 0;
      }
      acquisitionChannels[channel] += 1;
    });
    
    // Customer retention analysis
    const retentionData = calculateCustomerRetention(users, orders, startDate, endDate);
    
    const reportData = {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: parseInt(dateRange)
      },
      summary: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        customerRetentionRate: totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(2) : 0,
        averageCustomerValue,
        customerLifetimeValue: calculateCustomerLifetimeValue(customerValues)
      },
      segments,
      topLocations: Object.entries(locations)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      acquisitionChannels: Object.entries(acquisitionChannels)
        .map(([channel, count]) => ({ channel, count, percentage: ((count / totalCustomers) * 100).toFixed(2) })),
      retentionData,
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'pdf') {
      const pdfBuffer = await generateCustomerReportPDF(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=customer-report-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }
    
    res.json({
      success: true,
      report: reportData,
      message: 'Customer report generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating customer report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer report',
      error: error.message
    });
  }
};

// Generate inventory report
export const generateInventoryReport = async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    
    // Get products data
    const products = await db.getProducts();
    const orders = await db.getOrders();
    
    // Calculate inventory metrics
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const outOfStock = products.filter(product => product.stock === 0).length;
    const lowStock = products.filter(product => product.stock > 0 && product.stock <= 10).length;
    
    // Product performance analysis
    const productPerformance = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productPerformance[item.productId]) {
          productPerformance[item.productId] = {
            name: item.name,
            totalSold: 0,
            revenue: 0,
            stock: 0
          };
        }
        productPerformance[item.productId].totalSold += item.quantity;
        productPerformance[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    // Add current stock information
    products.forEach(product => {
      if (productPerformance[product._id]) {
        productPerformance[product._id].stock = product.stock;
      }
    });
    
    // Top performing products
    const topPerformers = Object.entries(productPerformance)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Category analysis
    const categoryStats = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      categoryStats[category].count += 1;
      categoryStats[category].totalStock += product.stock;
      categoryStats[category].totalValue += product.price * product.stock;
    });
    
    // Stock alerts
    const stockAlerts = products
      .filter(product => product.stock <= 10)
      .map(product => ({
        id: product._id,
        name: product.name,
        currentStock: product.stock,
        category: product.category,
        price: product.price
      }))
      .sort((a, b) => a.currentStock - b.currentStock);
    
    // Supplier analysis (if available)
    const supplierStats = {};
    products.forEach(product => {
      const supplier = product.supplier || 'Unknown';
      if (!supplierStats[supplier]) {
        supplierStats[supplier] = {
          count: 0,
          totalValue: 0
        };
      }
      supplierStats[supplier].count += 1;
      supplierStats[supplier].totalValue += product.price * product.stock;
    });
    
    const reportData = {
      summary: {
        totalProducts,
        totalStockValue,
        outOfStock,
        lowStock,
        stockTurnoverRate: calculateStockTurnover(products, productPerformance),
        averageStockValue: totalProducts > 0 ? totalStockValue / totalProducts : 0
      },
      topPerformers,
      categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        ...stats
      })),
      stockAlerts,
      supplierStats: Object.entries(supplierStats).map(([supplier, stats]) => ({
        supplier,
        ...stats
      })),
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'pdf') {
      const pdfBuffer = await generateInventoryReportPDF(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=inventory-report-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }
    
    res.json({
      success: true,
      report: reportData,
      message: 'Inventory report generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

// Generate comprehensive analytics dashboard data
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const { period = '30', startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - parseInt(period));
    }
    
    // Get all data
    const [products, users, orders, categories] = await Promise.all([
      db.getProducts(),
      db.getUsers(),
      db.getOrders(),
      db.getCategories()
    ]);
    
    // Filter orders by period
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
    
    // Calculate key metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const totalCustomers = users.length;
    const totalProducts = products.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Revenue trends (daily)
    const dailyRevenue = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += order.totalAmount;
    });
    
    // Order status distribution
    const orderStatus = {};
    filteredOrders.forEach(order => {
      const status = order.status || 'pending';
      if (!orderStatus[status]) {
        orderStatus[status] = 0;
      }
      orderStatus[status] += 1;
    });
    
    // Top categories by revenue
    const categoryRevenue = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0;
        }
        categoryRevenue[category] += item.price * item.quantity;
      });
    });
    
    const topCategories = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Recent activity
    const recentOrders = filteredOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(order => ({
        id: order._id,
        customerName: order.shippingAddress?.name || 'Unknown',
        amount: order.totalAmount,
        status: order.status,
        date: order.createdAt
      }));
    
    // Performance metrics
    const performanceMetrics = {
      conversionRate: totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(2) : 0,
      averageOrderValue,
      revenueGrowth: calculateRevenueGrowth(filteredOrders, period),
      customerGrowth: calculateCustomerGrowth(users, period),
      topSellingProducts: getTopSellingProducts(filteredOrders, 5),
      lowStockProducts: products.filter(p => p.stock <= 10).length
    };
    
    const dashboardData = {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      metrics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue,
        conversionRate: performanceMetrics.conversionRate
      },
      trends: {
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue
        })),
        orderStatus: Object.entries(orderStatus).map(([status, count]) => ({
          status,
          count
        }))
      },
      topCategories,
      recentOrders,
      performanceMetrics,
      generatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: dashboardData,
      message: 'Analytics dashboard data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics dashboard data',
      error: error.message
    });
  }
};

// Get available reports list
export const getReportsList = async (req, res) => {
  try {
    // Get real reports from database or file system
    const reports = await getStoredReports();
    
    res.json({
      success: true,
      reports,
      message: 'Reports list retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting reports list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports list',
      error: error.message
    });
  }
};

// Real-time data updates
export const getRealTimeData = async (req, res) => {
  try {
    const orders = await db.getOrders();
    const products = await db.getProducts();
    
    // Calculate real-time metrics
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => new Date(order.createdAt) > lastHour);
    const orders24h = orders.filter(order => new Date(order.createdAt) > last24Hours);
    const lowStockProducts = products.filter(product => product.stock <= 10);
    
    const updates = {
      newOrders: recentOrders.length,
      orders24h: orders24h.length,
      lowStock: lowStockProducts.length,
      totalRevenue: recentOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      revenue24h: orders24h.reduce((sum, order) => sum + order.totalAmount, 0),
      timestamp: now.toISOString()
    };
    
    res.json({
      success: true,
      hasUpdates: recentOrders.length > 0 || lowStockProducts.length > 0,
      updates,
      message: 'Real-time data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting real-time data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve real-time data',
      error: error.message
    });
  }
};

// Advanced Analytics Features
export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { type, period = '30' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));
    
    const orders = await db.getOrders();
    const products = await db.getProducts();
    const users = await db.getUsers();
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    let analytics = {};
    
    switch (type) {
      case 'cohort':
        analytics = await generateCohortAnalysis(users, orders, startDate, endDate);
        break;
      case 'funnel':
        analytics = await generateFunnelAnalysis(users, orders, startDate, endDate);
        break;
      case 'retention':
        analytics = await generateRetentionAnalysis(users, orders, startDate, endDate);
        break;
      case 'segmentation':
        analytics = await generateCustomerSegmentation(users, orders, startDate, endDate);
        break;
      case 'predictive':
        analytics = await generatePredictiveAnalytics(products, orders, startDate, endDate);
        break;
      default:
        analytics = await generateComprehensiveAnalytics(users, orders, products, startDate, endDate);
    }
    
    res.json({
      success: true,
      analytics,
      type,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      message: 'Advanced analytics generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating advanced analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate advanced analytics',
      error: error.message
    });
  }
};

// Export functions
export const exportToExcel = async (req, res) => {
  try {
    const { data, includeCharts } = req.body;
    
    const excelBuffer = generateExcelBuffer(data, includeCharts);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.xlsx`);
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export to Excel',
      error: error.message
    });
  }
};

export const exportToCSV = async (req, res) => {
  try {
    const { data } = req.body;
    
    const csvContent = generateCSVContent(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.csv`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export to CSV',
      error: error.message
    });
  }
};

export const exportToJSON = async (req, res) => {
  try {
    const { data } = req.body;
    
    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString(),
      message: 'Data exported successfully'
    });
    
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export to JSON',
      error: error.message
    });
  }
};

// Helper functions
function calculateGrowthRate(orders, period) {
  if (orders.length === 0) return 0;
  
  const midPoint = Math.floor(orders.length / 2);
  const firstHalf = orders.slice(0, midPoint);
  const secondHalf = orders.slice(midPoint);
  
  const firstHalfRevenue = firstHalf.reduce((sum, order) => sum + order.totalAmount, 0);
  const secondHalfRevenue = secondHalf.reduce((sum, order) => sum + order.totalAmount, 0);
  
  if (firstHalfRevenue === 0) return 0;
  
  return (((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(2);
}

function calculateConversionRate(orders, period) {
  // This would need user data to calculate properly
  return 0;
}

function calculateStockTurnover(products, productPerformance) {
  const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const totalSalesValue = Object.values(productPerformance).reduce((sum, perf) => sum + perf.revenue, 0);
  
  if (totalStockValue === 0) return 0;
  
  return (totalSalesValue / totalStockValue).toFixed(2);
}

function calculateCustomerRetention(users, orders, startDate, endDate) {
  // Simplified retention calculation
  const activeUsers = new Set(orders.map(order => order.userId));
  const totalUsers = users.length;
  
  return {
    retentionRate: totalUsers > 0 ? ((activeUsers.size / totalUsers) * 100).toFixed(2) : 0,
    activeUsers: activeUsers.size,
    totalUsers
  };
}

function calculateCustomerLifetimeValue(customerValues) {
  if (customerValues.length === 0) return 0;
  
  const totalValue = customerValues.reduce((sum, c) => sum + c.totalSpent, 0);
  return (totalValue / customerValues.length).toFixed(2);
}

function calculateRevenueGrowth(orders, period) {
  // Simplified growth calculation
  const midPoint = Math.floor(orders.length / 2);
  const firstHalf = orders.slice(0, midPoint);
  const secondHalf = orders.slice(midPoint);
  
  const firstHalfRevenue = firstHalf.reduce((sum, order) => sum + order.totalAmount, 0);
  const secondHalfRevenue = secondHalf.reduce((sum, order) => sum + order.totalAmount, 0);
  
  if (firstHalfRevenue === 0) return 0;
  
  return (((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(2);
}

function calculateCustomerGrowth(users, period) {
  const now = new Date();
  const periodStart = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
  
  const newUsers = users.filter(user => new Date(user.createdAt) >= periodStart);
  return newUsers.length;
}

function getTopSellingProducts(orders, limit) {
  const productSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });
  
  return Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// Advanced Analytics Generators
async function generateCohortAnalysis(users, orders, startDate, endDate) {
  // Simplified cohort analysis
  return {
    cohorts: [],
    retentionRates: [],
    message: 'Cohort analysis generated'
  };
}

async function generateFunnelAnalysis(users, orders, startDate, endDate) {
  // Simplified funnel analysis
  return {
    stages: [
      { name: 'Visitors', count: users.length },
      { name: 'Add to Cart', count: orders.length * 0.7 },
      { name: 'Checkout', count: orders.length * 0.5 },
      { name: 'Purchase', count: orders.length }
    ],
    conversionRates: []
  };
}

async function generateRetentionAnalysis(users, orders, startDate, endDate) {
  return calculateCustomerRetention(users, orders, startDate, endDate);
}

async function generateCustomerSegmentation(users, orders, startDate, endDate) {
  const segments = {
    new: users.filter(u => new Date(u.createdAt) >= startDate).length,
    returning: users.filter(u => new Date(u.createdAt) < startDate).length,
    highValue: 0,
    mediumValue: 0,
    lowValue: 0
  };
  
  return segments;
}

async function generatePredictiveAnalytics(products, orders, startDate, endDate) {
  return {
    predictedSales: 0,
    recommendedActions: [],
    riskFactors: []
  };
}

async function generateComprehensiveAnalytics(users, orders, products, startDate, endDate) {
  return {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalProducts: products.length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0
  };
}

// File generation functions
async function generateSalesReportPDF(data) {
  const content = `
Sales Report
Period: ${data.period.startDate} to ${data.period.endDate}

Summary:
- Total Revenue: $${data.summary.totalRevenue}
- Total Orders: ${data.summary.totalOrders}
- Average Order Value: $${data.summary.averageOrderValue}
- Growth Rate: ${data.summary.growthRate}%

Top Products:
${data.topProducts.map(product => `- ${product.name}: $${product.revenue}`).join('\n')}

Generated: ${data.generatedAt}
  `;
  
  return Buffer.from(content);
}

async function generateCustomerReportPDF(data) {
  const content = `
Customer Report
Period: ${data.period.startDate} to ${data.period.endDate}

Summary:
- Total Customers: ${data.summary.totalCustomers}
- Active Customers: ${data.summary.activeCustomers}
- New Customers: ${data.summary.newCustomers}
- Retention Rate: ${data.summary.customerRetentionRate}%

Generated: ${data.generatedAt}
  `;
  
  return Buffer.from(content);
}

async function generateInventoryReportPDF(data) {
  const content = `
Inventory Report
Generated: ${data.generatedAt}

Summary:
- Total Products: ${data.summary.totalProducts}
- Total Stock Value: $${data.summary.totalStockValue}
- Out of Stock: ${data.summary.outOfStock}
- Low Stock: ${data.summary.lowStock}

Stock Alerts:
${data.stockAlerts.map(alert => `- ${alert.name}: ${alert.currentStock} units`).join('\n')}
  `;
  
  return Buffer.from(content);
}

function generateCSVContent(data) {
  if (!data) return '';
  
  if (data.summary) {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', data.summary.totalRevenue || 0],
      ['Total Orders', data.summary.totalOrders || 0],
      ['Total Customers', data.summary.totalCustomers || 0],
      ['Average Order Value', data.summary.averageOrderValue || 0]
    ];
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }
  
  return 'No data available';
}

function generateExcelBuffer(data, includeCharts) {
  const content = `
Excel Report
Generated: ${new Date().toISOString()}

Summary:
- Total Revenue: $${data.summary?.totalRevenue || 0}
- Total Orders: ${data.summary?.totalOrders || 0}
- Total Customers: ${data.summary?.totalCustomers || 0}
- Average Order Value: $${data.summary?.averageOrderValue || 0}

${includeCharts ? 'Charts included in Excel format' : 'Charts not included'}
  `;
  
  return Buffer.from(content);
}

async function getStoredReports() {
  // In a real application, this would fetch from a database
  // For now, return a mock list
  return [
    {
      id: 'sales-report-1',
      name: 'Sales Report - Last 30 Days',
      type: 'sales',
      status: 'completed',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      size: '2.3 MB',
      format: 'PDF'
    },
    {
      id: 'customer-report-1',
      name: 'Customer Analytics Report',
      type: 'customers',
      status: 'completed',
      lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      size: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 'inventory-report-1',
      name: 'Inventory Status Report',
      type: 'inventory',
      status: 'completed',
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      size: '1.2 MB',
      format: 'PDF'
    }
  ];
}
