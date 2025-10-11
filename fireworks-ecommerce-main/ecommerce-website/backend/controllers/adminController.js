import db from "../database.js";

// Get all products for admin panel (no pagination)
export const getAdminProducts = async (req, res) => {
  try {
    const products = await db.getAllProducts();
    
    // Return all products for admin management
    res.json({
      success: true,
      products: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error getting admin products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products for admin panel' 
    });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const { dateRange, startDate, endDate } = req.query;
    
    const products = await db.getAllProducts();
    const orders = await db.getAllOrders();
    const users = await db.getAllUsers();

    // Apply date filtering to orders if specified
    let filteredOrders = orders;
    if (dateRange || (startDate && endDate)) {
      const now = new Date();
      let start, end;
      
      console.log('📅 Date filtering applied:', { dateRange, startDate, endDate });
      
      if (dateRange) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateRange) {
          case 'today':
            start = today;
            end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
            break;
          case 'week':
            start = new Date(today);
            start.setDate(today.getDate() - today.getDay());
            end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
            break;
          case 'month':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
            break;
          default:
            // No filtering for 'all' or unknown values
            break;
        }
      } else if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate + "T23:59:59");
      }
      
      if (start && end) {
        console.log('📊 Filtering orders from', start.toISOString(), 'to', end.toISOString());
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return orderDate >= start && orderDate <= end;
        });
        console.log(`📈 Filtered orders: ${filteredOrders.length} out of ${orders.length} total orders`);
      }
    }

    // Calculate stats using filtered orders
    const totalProducts = products.length;
    const totalOrders = filteredOrders.length;
    const totalUsers = users.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const processingOrders = filteredOrders.filter(order => order.status === 'processing').length;
    const shippedOrders = filteredOrders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered').length;

    // Low stock products (less than 10 items) - this doesn't change with date filtering
    const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;
    const outOfStockProducts = products.filter(product => (product.stock || 0) === 0).length;
    
    // New products (added in last 30 days) - this doesn't change with date filtering
    const newProducts = products.filter(product => product.isNew === true).length;

    // Recent orders (last 7 days) - use filtered orders
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = filteredOrders.filter(order => new Date(order.createdAt) >= sevenDaysAgo);

    // Top selling products using filtered orders
    const productSales = {};
    filteredOrders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          if (productSales[item.product]) {
            productSales[item.product] += item.quantity;
          } else {
            productSales[item.product] = item.quantity;
          }
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, quantity]) => {
        const product = products.find(p => p._id === productId);
        return {
          _id: productId,
          name: product ? product.name : 'Unknown Product',
          quantity,
          revenue: quantity * (product ? product.price : 0)
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        lowStockProducts,
        outOfStockProducts,
        newProducts,
        recentOrders: recentOrders.length
      },
      topProducts
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const analytics = db.getAnalyticsWithRange(parseInt(range));

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get inventory status
export const getInventoryStatus = async (req, res) => {
  try {
    const inventory = await db.getInventory();

    res.json({
      success: true,
      inventory
    });
  } catch (error) {
    console.error('Error getting inventory status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get reports
export const getReports = async (req, res) => {
  try {
    const reports = await db.getReports();

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate custom report
export const generateReport = async (req, res) => {
  try {
    const { type, dateRange } = req.body;
    const report = await db.generateReport(type, dateRange);

    if (!report) {
      return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const orders = await db.getAllOrders();

    // Order status distribution
    const statusDistribution = {};
    orders.forEach(order => {
      const status = order.status || 'pending';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Monthly revenue for the last 12 months
    const monthlyRevenue = {};
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      monthlyRevenue[monthKey] = 0;
    }

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = orderDate.toISOString().slice(0, 7);
      if (monthlyRevenue[monthKey] !== undefined) {
        monthlyRevenue[monthKey] += (order.totalPrice || 0);
      }
    });

    // Average order value
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    res.json({
      success: true,
      orderStats: {
        totalOrders: orders.length,
        statusDistribution,
        monthlyRevenue,
        averageOrderValue,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error getting order stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const orders = await db.getAllOrders();

    // Users with orders
    const usersWithOrders = new Set(orders.map(order => order.user));
    const activeUsers = usersWithOrders.size;

    // New users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = users.filter(user => new Date(user.createdAt) >= thirtyDaysAgo).length;

    // Top customers by order value
    const customerOrders = {};
    orders.forEach(order => {
      if (customerOrders[order.user]) {
        customerOrders[order.user] += (order.totalPrice || 0);
      } else {
        customerOrders[order.user] = (order.totalPrice || 0);
      }
    });

    const topCustomers = Object.entries(customerOrders)
      .map(([userId, totalSpent]) => {
        const user = users.find(u => u._id === userId);
        return {
          _id: userId,
          name: user ? user.name : 'Unknown User',
          email: user ? user.email : '',
          totalSpent,
          orderCount: orders.filter(order => order.user === userId).length
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    res.json({
      success: true,
      userStats: {
        totalUsers: users.length,
        activeUsers,
        newUsers,
        topCustomers
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: error.message });
  }
};
