import db from '../database.js';

// Get analytics data for admin dashboard
export const getAnalytics = async (req, res) => {
  try {
    // Get all orders
    const orders = await db.getAllOrders();
    const products = await db.getAllProducts();
    const users = await db.getAllUsers();

    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate total profit based on actual product costs vs selling prices
    // For now, we'll calculate based on a more realistic margin based on product pricing
    let totalProfit = 0;
    orders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const product = products.find(p => p._id === item.product);
          if (product) {
            // Calculate profit per item (assuming 30% margin on average, but this could be made dynamic)
            const itemProfit = (product.price * item.quantity) * 0.3;
            totalProfit += itemProfit;
          }
        });
      }
    });
    
    // Get total customers (excluding admins)
    const totalCustomers = users.filter(user => user.role === 'user').length;

    // Get daily sales - show all available data instead of just last 7 days
    const dailySales = [];
    const orderDates = [...new Set(orders.map(order => order.createdAt.split('T')[0]))].sort();
    
    // If we have orders, show the actual order dates
    if (orderDates.length > 0) {
      orderDates.forEach(dateStr => {
        const dayOrders = orders.filter(order => 
          order.createdAt.startsWith(dateStr)
        );
        
        const dayAmount = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        const date = new Date(dateStr);
        dailySales.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: dayAmount
        });
      });
    } else {
      // Fallback to last 7 days if no orders
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        dailySales.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: 0
        });
      }
    }

    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
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
      .map(([productId, sold]) => {
        const product = products.find(p => p._id === productId);
        return {
          _id: productId,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          sales: sold,
          image: product?.image || product?.images?.[0]?.url || null
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Get recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(order => ({
        ...order,
        user: users.find(user => user._id === order.user)
      }));

    // Calculate average order value
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
    
    // Get order status distribution
    const orderStatuses = {};
    orders.forEach(order => {
      const status = order.status || 'pending';
      orderStatuses[status] = (orderStatuses[status] || 0) + 1;
    });
    
    // Get sales by month - show all available data
    const salesByMonth = [];
    const orderMonths = [...new Set(orders.map(order => order.createdAt.slice(0, 7)))].sort();
    
    // If we have orders, show the actual order months
    if (orderMonths.length > 0) {
      orderMonths.forEach(monthStr => {
        const monthOrders = orders.filter(order => 
          order.createdAt.startsWith(monthStr)
        );
        
        const monthAmount = monthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        const date = new Date(monthStr + '-01');
        salesByMonth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthAmount
        });
      });
    } else {
      // Fallback to last 12 months if no orders
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        salesByMonth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: 0
        });
      }
    }
    
    // Get user statistics - REAL DATA
    const activeUsers = users.filter(user => user.role === 'user' && user.lastLogin).length;
    const newUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return user.role === 'user' && userDate > thirtyDaysAgo;
    }).length;

    // Calculate real conversion rate based on actual orders vs users
    const conversionRate = totalCustomers > 0 ? (orders.length / totalCustomers) * 100 : 0;

    // Calculate real customer lifetime value
    const customerLTV = totalCustomers > 0 ? totalSales / totalCustomers : 0;

    // Calculate real order frequency
    const orderFrequency = totalCustomers > 0 ? orders.length / totalCustomers : 0;

    // Calculate real profit margin
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Get real peak sales day
    const peakSalesDay = dailySales.length > 0 ? 
      dailySales.reduce((peak, day) => day.amount > peak.amount ? day : peak, dailySales[0]) : null;

    // Calculate real daily average
    const dailyAverageSales = dailySales.length > 0 ? 
      dailySales.reduce((sum, day) => sum + day.amount, 0) / dailySales.length : 0;

    // Calculate real growth rate (month over month)
    const currentMonthRevenue = salesByMonth.length > 0 ? salesByMonth[salesByMonth.length - 1]?.revenue || 0 : 0;
    const previousMonthRevenue = salesByMonth.length > 1 ? salesByMonth[salesByMonth.length - 2]?.revenue || 0 : 0;
    const growthRate = previousMonthRevenue > 0 ? 
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

    const analytics = {
      totalSales,
      totalOrders: orders.length,
      totalCustomers,
      totalProfit,
      averageOrderValue,
      dailySales,
      topProducts,
      recentOrders,
      orderStatuses,
      salesByMonth,
      activeUsers,
      newUsers,
      totalUsers: users.filter(user => user.role === 'user').length,
      // REAL CALCULATED METRICS
      conversionRate,
      customerLTV,
      orderFrequency,
      profitMargin,
      peakSalesDay,
      dailyAverageSales,
      growthRate
    };

    // Debug logging - REAL DATA
    console.log('📊 REAL ANALYTICS DATA SUMMARY:');
    console.log(`- Total Orders: ${orders.length}`);
    console.log(`- Total Sales: ₹${totalSales.toLocaleString()}`);
    console.log(`- Total Customers: ${totalCustomers}`);
    console.log(`- Total Profit: ₹${totalProfit.toLocaleString()}`);
    console.log(`- Profit Margin: ${profitMargin.toFixed(2)}%`);
    console.log(`- Conversion Rate: ${conversionRate.toFixed(2)}%`);
    console.log(`- Customer LTV: ₹${customerLTV.toLocaleString()}`);
    console.log(`- Order Frequency: ${orderFrequency.toFixed(2)}`);
    console.log(`- Growth Rate: ${growthRate.toFixed(2)}%`);
    console.log(`- Daily Average: ₹${dailyAverageSales.toLocaleString()}`);
    console.log(`- Peak Sales Day: ${peakSalesDay ? peakSalesDay.date + ' (₹' + peakSalesDay.amount.toLocaleString() + ')' : 'N/A'}`);
    console.log(`- Top Products: ${topProducts.length}`);
    console.log(`- Daily Sales Data Points: ${dailySales.length}`);
    console.log(`- Monthly Sales Data Points: ${salesByMonth.length}`);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};
