import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { analyticsAPI, orderAPI } from "../utils/adminAPI";
import { StatCard, LineChart, BarChart, PieChart } from "../components/AdvancedCharts";
import AdminNotifications from "../components/AdminNotifications";
import DateFilter from "../components/DateFilter";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { notifications, getUnreadCount, markAllAsRead } = useNotifications();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState({
    type: "all", // all, today, week, month, custom - start with all to show all data
    startDate: "",
    endDate: ""
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [newOrderNotifications, setNewOrderNotifications] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Date filtering helper functions
  const getDateRange = (type) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart,
          end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
        };
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        return { start: monthStart, end: monthEnd };
      case "custom":
        return {
          start: dateFilter.startDate ? new Date(dateFilter.startDate) : null,
          end: dateFilter.endDate ? new Date(dateFilter.endDate + "T23:59:59") : null
        };
      default:
        return { start: null, end: null };
    }
  };

  const fetchOrders = useCallback(async (checkForNewOrders = false) => {
    try {
      setOrdersLoading(true);
      const response = await orderAPI.getAllOrders();

      if (response.success) {
        // Handle nested data structure: response.data.data
        let orders = response.data?.data || response.orders || [];

        // Map PHP-style 'id' to MongoDB-style '_id' for compatibility
        orders = orders.map(order => ({
          ...order,
          _id: order._id || order.id?.toString() || 'unknown',
          createdAt: order.createdAt || order.created_at || new Date().toISOString()
        }));

        console.log('📦 Orders received:', orders.length);
        console.log('📋 Sample orders:', orders.slice(0, 3));

        // Check for new orders using functional setState to get current lastOrderCount
        if (checkForNewOrders) {
          setLastOrderCount(prevCount => {
            if (prevCount > 0 && orders.length > prevCount) {
              const newOrdersCount = orders.length - prevCount;
              const newOrders = orders.slice(0, newOrdersCount);

              console.log('🔔 New orders detected:', newOrdersCount);
              console.log('🔔 Previous count:', prevCount, 'New count:', orders.length);

              // Add new order notifications
              const notifications = newOrders.map(order => ({
                id: order._id,
                orderId: order._id,
                message: `New order #${order._id?.slice(-8)} received`,
                customerName: order.user_name || order.shipping_name || 'Guest',
                amount: order.total_price || order.totalPrice || 0,
                timestamp: new Date().toISOString(),
                read: false
              }));

              setNewOrderNotifications(prev => [...notifications, ...prev].slice(0, 10)); // Keep last 10
              showToast(`🔔 ${newOrdersCount} new order(s) received!`, 'success');
            }
            return orders.length;
          });
        } else {
          setLastOrderCount(orders.length);
        }

        // Apply date filtering
        const dateRange = getDateRange(dateFilter.type);
        const filtered = orders.filter(order => {
          if (!dateRange.start || !dateRange.end) return true;
          const orderDate = new Date(order.created_at || order.createdAt || order.orderDate);
          return orderDate >= dateRange.start && orderDate <= dateRange.end;
        });

        setFilteredOrders(filtered);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showToast("Failed to load orders", "error");
    } finally {
      setOrdersLoading(false);
    }
  }, [dateFilter, showToast]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log('🔄 Fetching dashboard data with filter:', dateFilter);
      console.log('🔑 Token available:', !!localStorage.getItem('token'));
      console.log('👤 User info:', user);

      const response = await analyticsAPI.getDashboardStats(dateFilter);

      console.log('📊 Full API Response:', response);

      if (response && response.success) {
        console.log('✅ Dashboard data received:', response.data?.stats || response.stats);
        // Handle both response formats: response.data.stats or response.stats
        const dashboardData = response.data ? {
          ...response,
          stats: response.data.stats,
          recentOrders: response.data.recentOrders
        } : response;
        setDashboardData(dashboardData);
      } else {
        console.error('❌ API returned success=false:', response);
        // Don't throw error, just show empty data
        setDashboardData({
          success: true,
          stats: {
            totalUsers: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0
          },
          recentOrders: []
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error response:", error.response);
      
      // Don't show error toast for authentication issues
      if (error.response?.status !== 401) {
        setError("Failed to load dashboard data. Please try again.");
        showToast("Failed to load dashboard data: " + error.message, "error");
      }

      // Set empty data to prevent showing stale data
      setDashboardData({
        success: true,
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0
        },
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  }, [dateFilter, showToast, user]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      showToast('Access denied. Admin privileges required.', 'error');
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
    fetchOrders(false); // Initial load - don't check for new orders yet
  }, [user, navigate, showToast, fetchDashboardData, fetchOrders]);

  // Separate useEffect to handle date filter changes
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      console.log('🔄 Date filter changed, refetching data:', dateFilter);
      fetchDashboardData();
      fetchOrders(false); // Don't check for new orders on filter change
    }
  }, [dateFilter, fetchDashboardData, fetchOrders, user]);

  // Polling for new orders every 30 seconds
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return;
    }

    console.log('🔔 Setting up order polling...');

    // Poll for new orders every 30 seconds
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for new orders...');
      fetchOrders(true); // Pass true to check for new orders
    }, 30000); // 30 seconds

    return () => {
      console.log('🔕 Cleaning up order polling');
      clearInterval(pollInterval);
    };
  }, [user, fetchOrders]);

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-white to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg sm:shadow-xl border border-white/20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Welcome back, {user?.name}
                </p>
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Filter: {dateFilter.type === 'all' ? 'All Time' : 
                      dateFilter.type === 'today' ? 'Today' :
                      dateFilter.type === 'week' ? 'This Week' :
                      dateFilter.type === 'month' ? 'This Month' :
                      dateFilter.type === 'custom' ? 'Custom Range' : 'Unknown'}
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Live Dashboard
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notification Bell Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification Badge */}
                  {newOrderNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg animate-pulse">
                      {newOrderNotifications.filter(n => !n.read).length > 9 ? '9+' : newOrderNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {showNotificationPanel && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotificationPanel(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <h3 className="font-bold text-sm">New Order Notifications</h3>
                        </div>
                        {newOrderNotifications.filter(n => !n.read).length > 0 && (
                          <button
                            onClick={() => {
                              setNewOrderNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              showToast('All notifications marked as read', 'success');
                            }}
                            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {newOrderNotifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-sm font-medium">No new notifications</p>
                            <p className="text-xs mt-1">New orders will appear here</p>
                          </div>
                        ) : (
                          newOrderNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                // Mark as read
                                setNewOrderNotifications(prev =>
                                  prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                                );
                                // Navigate to orders page
                                navigate('/admin/orders');
                                setShowNotificationPanel(false);
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Customer: {notification.customerName}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold text-green-600">
                                      ₹{notification.amount.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(notification.timestamp).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                {!notification.read && (
                                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {newOrderNotifications.length > 0 && (
                        <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-200">
                          <button
                            onClick={() => {
                              navigate('/admin/orders');
                              setShowNotificationPanel(false);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View All Orders →
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={async () => {
                  try {
                    await logout();
                    showToast('Logged out successfully', 'success');
                    navigate('/admin/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                    showToast('Error during logout', 'error');
                  }
                }}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm font-medium w-full sm:w-auto justify-center"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mb-8">
          <DateFilter
            dateFilter={dateFilter}
            onDateFilterChange={(newFilter) => {
              console.log('📅 Date filter state updating from:', dateFilter, 'to:', newFilter);
              setDateFilter(newFilter);
            }}
            className="mb-6"
          />
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-white/20 backdrop-blur-sm p-4 sm:p-6 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{dashboardData?.stats?.totalProducts || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-white/20 backdrop-blur-sm p-4 sm:p-6 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{dashboardData?.stats?.totalOrders || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{dashboardData?.stats?.totalUsers || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">₹{dashboardData?.stats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
               onClick={() => navigate('/admin/orders')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg relative">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L19 5l-4.5-4.5L4.5 19.5z" />
                  </svg>
                  {getUnreadCount() > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                      {getUnreadCount() > 99 ? '99+' : getUnreadCount()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{getUnreadCount()}</p>
                  <p className="text-xs text-gray-500">Unread notifications</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`w-3 h-3 rounded-full ${getUnreadCount() > 0 ? 'bg-red-400 animate-pulse' : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Order Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{dashboardData?.stats?.pendingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Processing Orders */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{dashboardData?.stats?.processingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          {/* Shipped Orders */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{dashboardData?.stats?.shippedOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{dashboardData?.stats?.deliveredOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Inventory Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Low Stock Products */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Products</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{dashboardData?.stats?.lowStockProducts || 0}</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Less than 10 units
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Out of Stock Products */}
          <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{dashboardData?.stats?.outOfStockProducts || 0}</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Zero units available
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Quick Actions */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-800 bg-clip-text text-transparent">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-500">Create new product</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-500">View and update orders</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View user accounts</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Detailed reports</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/advanced-analytics')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Advanced Analytics</p>
                <p className="text-sm text-gray-500">100% Real Data Reports</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/banners')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Banners</p>
                <p className="text-sm text-gray-500">Website banners</p>
              </div>
            </button>
          </div>
        </div>

        {/* Filtered Orders Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📋</span>
              Order Details
              {dateFilter.type !== "all" && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  (Filtered by {dateFilter.type === "today" ? "Today" : 
                   dateFilter.type === "week" ? "This Week" : 
                   dateFilter.type === "month" ? "This Month" : 
                   "Custom Range"})
                </span>
              )}
            </h3>
            {ordersLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading orders...
              </div>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No orders found</h4>
              <p className="text-gray-600">
                {dateFilter.type === "all" 
                  ? "No orders have been placed yet."
                  : "No orders found for the selected date range."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{filteredOrders.length}</div>
                  <div className="text-sm opacity-90">Total Orders</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {filteredOrders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm opacity-90">Pending</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {filteredOrders.filter(o => o.status === 'processing').length}
                  </div>
                  <div className="text-sm opacity-90">Processing</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {filteredOrders.filter(o => o.status === 'shipped').length}
                  </div>
                  <div className="text-sm opacity-90">Shipped</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {filteredOrders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm opacity-90">Delivered</div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900 mb-3">Recent Orders</h4>
                {filteredOrders.slice(0, 5).map((order) => (
                  <div key={order._id || order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">📋</div>
                      <div>
                        <h5 className="font-medium text-gray-900">Order #{order._id?.slice(-8) || order.id || 'N/A'}</h5>
                        <p className="text-sm text-gray-600">
                          {order.userDetails?.name || order.user?.name || "N/A"} •
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{order.totalPrice?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-600">
                          {order.orderItems?.length || 0} items
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredOrders.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All Orders ({filteredOrders.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {dashboardData?.topProducts && dashboardData.topProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.topProducts.map((product, index) => (
                    <tr key={product._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{product.revenue?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
