import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import axios from "../axios";
import { StatCard, LineChart, BarChart, PieChart } from "../components/AdvancedCharts";
import { exportToCSV } from "../utils/exportUtils";

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByMonth: [],
    orderStatuses: {},
    dailySales: [],
    recentOrders: [],
    totalCustomers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalUsers: 0,
    totalProfit: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30");
  const [realTimeData, setRealTimeData] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return;
    getAnalytics();
  }, [user, timeRange]);

  const getAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/admin/analytics?range=${timeRange}`);
      
      if (response.data && response.data.success) {
        const analyticsData = response.data.analytics;
        
        // Always set the analytics data - let the UI handle empty states
        setAnalytics(analyticsData);
        
        // Log the received data for debugging
        console.log('📊 Received Analytics Data:', analyticsData);
        
        // Show success message if we have meaningful data
        if (analyticsData.totalSales > 0 || analyticsData.totalOrders > 0) {
          showToast("Analytics data loaded successfully", "success", 1000);
        }
      } else {
        throw new Error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setError("Failed to load analytics data. Please check if the backend server is running.");
      showToast("Failed to load analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  const getOrderStats = async () => {
    try {
      const response = await axios.get("/api/admin/order-stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        return response.data.orderStats;
      } else {
        throw new Error("Failed to fetch order stats");
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
      return null;
    }
  };

  const getUserStats = async () => {
    try {
      const response = await axios.get("/api/admin/user-stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        return response.data.userStats;
      } else {
        throw new Error("Failed to fetch user stats");
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      return null;
    }
  };

  // Use REAL analytics calculations from backend
  const advancedMetrics = useMemo(() => {
    const { 
      totalSales, 
      totalOrders, 
      totalCustomers, 
      averageOrderValue, 
      dailySales, 
      salesByMonth,
      // REAL CALCULATED METRICS FROM BACKEND
      conversionRate,
      customerLTV,
      orderFrequency,
      profitMargin,
      peakSalesDay,
      dailyAverageSales,
      growthRate
    } = analytics;
    
    // Use real calculated values from backend instead of frontend calculations
    return {
      salesGrowthRate: growthRate || 0,
      conversionRate: conversionRate || 0,
      customerLTV: customerLTV || 0,
      profitMargin: profitMargin || 0,
      orderFrequency: orderFrequency || 0,
      revenuePerCustomer: customerLTV || 0, // Same as customerLTV
      dailyAverageSales: dailyAverageSales || 0,
      peakSalesDay: peakSalesDay || null
    };
  }, [analytics]);

  // Real-time data refresh
  useEffect(() => {
    if (realTimeData) {
      const interval = setInterval(() => {
        getAnalytics();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeData]);

  // Export REAL analytics data
  const exportAnalytics = () => {
    const exportData = {
      overview: {
        totalSales: analytics.totalSales,
        totalOrders: analytics.totalOrders,
        totalCustomers: analytics.totalCustomers,
        averageOrderValue: analytics.averageOrderValue,
        totalProfit: analytics.totalProfit
      },
      realMetrics: {
        conversionRate: analytics.conversionRate,
        customerLTV: analytics.customerLTV,
        orderFrequency: analytics.orderFrequency,
        profitMargin: analytics.profitMargin,
        growthRate: analytics.growthRate,
        dailyAverageSales: analytics.dailyAverageSales,
        peakSalesDay: analytics.peakSalesDay
      },
      calculatedMetrics: advancedMetrics,
      topProducts: analytics.topProducts,
      dailySales: analytics.dailySales,
      salesByMonth: analytics.salesByMonth,
      orderStatuses: analytics.orderStatuses,
      recentOrders: analytics.recentOrders
    };

    exportToCSV(exportData, `real-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    showToast("Real analytics data exported successfully", "success");
  };

  const chartData = {
    sales: Array.isArray(analytics.salesByMonth) ? analytics.salesByMonth : [],
    orders: analytics.orderStatuses || {},
    products: Array.isArray(analytics.topProducts) ? analytics.topProducts : []
  };

  const revenueChart = {
    labels: chartData.sales.map(item => item.month || 'Unknown'),
    datasets: [{
      label: 'Revenue',
      data: chartData.sales.map(item => item.revenue || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2
    }]
  };

  const orderChart = {
    labels: Object.keys(chartData.orders || {}),
    datasets: [{
      label: 'Orders',
      data: Object.values(chartData.orders || {}),
      backgroundColor: [
        'rgba(255, 205, 86, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };

  const userChart = {
    labels: ['Active Users', 'New Users', 'Total Users'],
    datasets: [{
      label: 'Users',
      data: [analytics.activeUsers || 0, analytics.newUsers || 0, analytics.totalUsers || 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ]
    }]
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    if (image && typeof image === 'object' && image.public_id) return image.url;
    return "https://via.placeholder.com/50x50?text=No+Image";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    const isNoDataError = error.includes("No analytics data available yet");
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className={`text-6xl mb-4 ${isNoDataError ? 'text-blue-500' : 'text-red-500'}`}>
            {isNoDataError ? '📊' : '⚠️'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNoDataError ? 'No Analytics Data Yet' : 'Analytics Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {isNoDataError ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">To see analytics data:</p>
              <ul className="text-sm text-gray-500 text-left">
                <li>• Add products to your store</li>
                <li>• Receive customer orders</li>
                <li>• Update order statuses</li>
              </ul>
            </div>
          ) : (
            <button
              onClick={getAnalytics}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">100% Real data from your database - No mock data</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* Real-time Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={realTimeData}
              onChange={(e) => setRealTimeData(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Real-time Updates</span>
          </label>
          
          {/* Export Button */}
          <button
            onClick={exportAnalytics}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "revenue", name: "Revenue", icon: "💰" },
              { id: "customers", name: "Customers", icon: "👥" },
              { id: "products", name: "Products", icon: "📦" },
              { id: "insights", name: "Insights", icon: "🔍" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Time Range</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Sales</p>
              <p className="text-3xl font-bold text-green-900">₹{(analytics.totalSales || 0).toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">
                {advancedMetrics.salesGrowthRate > 0 ? '+' : ''}{advancedMetrics.salesGrowthRate.toFixed(1)}% vs last month
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Orders</p>
              <p className="text-3xl font-bold text-blue-900">{analytics.totalOrders || 0}</p>
              <p className="text-xs text-blue-600 mt-1">
                {advancedMetrics.orderFrequency.toFixed(1)} orders per customer
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Customers</p>
              <p className="text-3xl font-bold text-purple-900">{analytics.totalCustomers || 0}</p>
              <p className="text-xs text-purple-600 mt-1">
                {analytics.newUsers || 0} new this month
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Avg Order Value</p>
              <p className="text-3xl font-bold text-orange-900">₹{(analytics.averageOrderValue || 0).toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">
                Customer LTV: ₹{advancedMetrics.customerLTV.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profit Margin */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{advancedMetrics.profitMargin.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Total Profit: ₹{(analytics.totalProfit || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-xl">📈</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{advancedMetrics.conversionRate.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Orders per 1000 visitors</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">₹{advancedMetrics.dailyAverageSales.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Per day sales</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-xl">📅</span>
            </div>
          </div>
        </div>

        {/* Revenue per Customer */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue/Customer</p>
              <p className="text-2xl font-bold text-gray-900">₹{advancedMetrics.revenuePerCustomer.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Average per customer</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-xl">💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab-based Content */}
      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
            </div>
            <div className="p-6">
              {Array.isArray(analytics.dailySales) && analytics.dailySales.length > 0 ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Sales trend visualization</p>
                    <p className="text-xs text-gray-500">Chart component would be integrated here</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sales data available for the selected period</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Performing Products</h2>
            </div>
            <div className="p-6">
              {!Array.isArray(analytics.topProducts) || analytics.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No product data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48x48?text=No+Image";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">₹{product.price?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.sales || 0} sold</p>
                        <p className="text-sm text-gray-600">₹{(product.price * (product.sales || 0))?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === "revenue" && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-green-600">₹{(analytics.totalSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Profit</span>
                  <span className="font-semibold text-blue-600">₹{(analytics.totalProfit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profit Margin</span>
                  <span className="font-semibold text-purple-600">{advancedMetrics.profitMargin.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold text-orange-600">₹{(analytics.averageOrderValue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sales Growth</span>
                  <span className={`font-semibold ${advancedMetrics.salesGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {advancedMetrics.salesGrowthRate > 0 ? '+' : ''}{advancedMetrics.salesGrowthRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Daily Average</span>
                  <span className="font-semibold text-blue-600">₹{advancedMetrics.dailyAverageSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue per Customer</span>
                  <span className="font-semibold text-purple-600">₹{advancedMetrics.revenuePerCustomer.toLocaleString()}</span>
                </div>
                {advancedMetrics.peakSalesDay && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Peak Sales Day</span>
                    <span className="font-semibold text-orange-600">{advancedMetrics.peakSalesDay.date}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
            </div>
            <div className="p-6">
              {Array.isArray(analytics.salesByMonth) && analytics.salesByMonth.length > 0 ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Monthly revenue chart</p>
                    <p className="text-xs text-gray-500">Chart component would be integrated here</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No monthly revenue data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === "customers" && (
        <div className="space-y-6">
          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalCustomers || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.newUsers || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">🆕</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.activeUsers || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Value</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Lifetime Value</span>
                  <span className="font-semibold text-blue-600">₹{advancedMetrics.customerLTV.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue per Customer</span>
                  <span className="font-semibold text-green-600">₹{advancedMetrics.revenuePerCustomer.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders per Customer</span>
                  <span className="font-semibold text-purple-600">{advancedMetrics.orderFrequency.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold text-orange-600">{advancedMetrics.conversionRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Growth</span>
                  <span className="font-semibold text-green-600">+{analytics.newUsers || 0} this month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Rate</span>
                  <span className="font-semibold text-blue-600">
                    {analytics.totalCustomers > 0 ? ((analytics.activeUsers / analytics.totalCustomers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "products" && (
        <div className="space-y-6">
          {/* Product Performance */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Product Performance</h2>
            </div>
            <div className="p-6">
              {!Array.isArray(analytics.topProducts) || analytics.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No product data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48x48?text=No+Image";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">₹{product.price?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.sales || 0} sold</p>
                        <p className="text-sm text-gray-600">₹{(product.price * (product.sales || 0))?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === "insights" && (
        <div className="space-y-6">
          {/* Business Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Best Performing Metric</p>
                      <p className="text-lg font-semibold text-green-900">Total Sales</p>
                    </div>
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Growth Rate</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {advancedMetrics.salesGrowthRate > 0 ? '+' : ''}{advancedMetrics.salesGrowthRate.toFixed(1)}%
                      </p>
                    </div>
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Customer Value</p>
                      <p className="text-lg font-semibold text-purple-900">₹{advancedMetrics.customerLTV.toLocaleString()}</p>
                    </div>
                    <span className="text-2xl">💎</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Optimize Conversion</p>
                      <p className="text-xs text-yellow-700">Current rate: {advancedMetrics.conversionRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <p className="text-sm font-medium text-orange-800">Increase Order Frequency</p>
                      <p className="text-xs text-orange-700">Current: {advancedMetrics.orderFrequency.toFixed(1)} orders/customer</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="text-sm font-medium text-red-800">Improve Profit Margin</p>
                      <p className="text-xs text-red-700">Current: {advancedMetrics.profitMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Distribution - Only show in overview tab */}
      {selectedTab === "overview" && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Status Distribution</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analytics.orderStatuses || {}).map(([status, count]) => (
                <div key={status} className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    status === 'delivered' ? 'bg-green-100' :
                    status === 'shipped' ? 'bg-purple-100' :
                    status === 'processing' ? 'bg-blue-100' :
                    status === 'pending' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <span className="text-lg">
                      {status === 'delivered' ? '✅' :
                       status === 'shipped' ? '📦' :
                       status === 'processing' ? '⚙️' :
                       status === 'pending' ? '⏳' :
                       '❌'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
