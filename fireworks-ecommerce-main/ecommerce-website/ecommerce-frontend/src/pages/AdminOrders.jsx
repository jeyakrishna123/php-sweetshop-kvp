import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { orderAPI } from "../utils/adminAPI";
import { exportOrders } from "../utils/exportUtils";
import Pagination from "../components/Pagination";
import BillOfSupply from "../components/BillOfSupply";

const AdminOrders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    type: "all", // all, today, week, month, custom
    startDate: "",
    endDate: ""
  });
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showBill, setShowBill] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);

  const fetchOrders = async (showNotification = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Fetching orders...");
      const response = await orderAPI.getAllOrders();
      console.log("📦 Orders response:", response);
      
      if (response.success) {
        const newOrders = response.orders || [];
        console.log("✅ Orders loaded successfully:", newOrders.length, "orders");
        
        // Check for new orders for notifications
        if (showNotification && lastOrderCount > 0 && newOrders.length > lastOrderCount) {
          const newOrdersCount = newOrders.length - lastOrderCount;
          showToast(`🔔 ${newOrdersCount} new order(s) received!`, 'success');
          
          // Add to notifications
          const newNotification = {
            id: Date.now(),
            message: `${newOrdersCount} new order(s) received`,
            timestamp: new Date().toISOString(),
            type: 'new_order'
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep last 5
        }
        
        setOrders(newOrders);
        setLastOrderCount(newOrders.length);
      } else {
        console.error("❌ API response not successful:", response);
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setError("Failed to load orders");
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return;
    fetchOrders();
    
    // Set up polling for new orders (every 30 seconds)
    const interval = setInterval(() => {
      fetchOrders(true); // Enable notifications for polling
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

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

  const handleDateFilterChange = (type) => {
    setDateFilter({ ...dateFilter, type });
  };

  const getAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderAPI.getAllOrders();
      
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setError("Failed to load orders");
      showToast(error.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        showToast(`Order status updated to ${newStatus}`, "success");
      } else {
        throw new Error(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      showToast(error.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Bill handling functions
  const handlePrintBill = (order) => {
    setSelectedOrderForBill(order);
    setShowBill(true);
  };

  const handleCloseBill = () => {
    setShowBill(false);
    setSelectedOrderForBill(null);
  };

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    console.log('🔍 getImageUrl called with:', imagePath);
    
    // Check if imagePath exists and is a string
    if (!imagePath || typeof imagePath !== 'string') {
      console.log('❌ No valid image path provided, using placeholder');
      return "https://via.placeholder.com/64x64?text=No+Image";
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      console.log('✅ Full URL detected:', imagePath);
      return imagePath;
    }
    
    // If it starts with /uploads, use backend server URL
    if (imagePath.startsWith('/uploads')) {
      const fullUrl = `http://localhost:8000${imagePath}`;
      console.log('🔗 Local upload path converted to:', fullUrl);
      return fullUrl;
    }
    
    // If it's just a filename, construct the full path
    if (imagePath.includes('.')) {
      const fullUrl = `http://localhost:8000/uploads/products/${imagePath}`;
      console.log('🔗 Filename converted to:', fullUrl);
      return fullUrl;
    }
    
    // Fallback to placeholder if no valid image path
    console.log('❌ Invalid image path format, using placeholder');
    return "https://via.placeholder.com/64x64?text=No+Image";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'shipped': return '📦';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      const matchesSearch = searchTerm === "" || 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Date filtering
      const orderDate = new Date(order.createdAt || order.orderDate);
      const dateRange = getDateRange(dateFilter.type);
      const matchesDate = !dateRange.start || !dateRange.end || 
        (orderDate >= dateRange.start && orderDate <= dateRange.end);
      
      return matchesStatus && matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return b.totalPrice - a.totalPrice;
        case "price-low":
          return a.totalPrice - b.totalPrice;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const getOrderSummary = () => {
    // Use filtered orders for summary when date filter is applied
    const ordersToSummarize = dateFilter.type === "all" ? orders : filteredAndSortedOrders;
    const total = ordersToSummarize.length;
    const pending = ordersToSummarize.filter(o => o.status === 'pending').length;
    const processing = ordersToSummarize.filter(o => o.status === 'processing').length;
    const shipped = ordersToSummarize.filter(o => o.status === 'shipped').length;
    const delivered = ordersToSummarize.filter(o => o.status === 'delivered').length;
    const cancelled = ordersToSummarize.filter(o => o.status === 'cancelled').length;
    
    return { total, pending, processing, shipped, delivered, cancelled };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Order Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchOrders(false)}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <span>🔔</span>
                <span>Clear ({notifications.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">🔔 Recent Notifications</h4>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">{notification.message}</span>
                  <span className="text-blue-600 text-xs">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Filter Indicator */}
        {dateFilter.type !== "all" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                📅 Showing orders: {
                  dateFilter.type === "today" ? "Today" :
                  dateFilter.type === "week" ? "This Week" :
                  dateFilter.type === "month" ? "This Month" :
                  dateFilter.type === "custom" && dateFilter.startDate && dateFilter.endDate ? 
                    `${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()}` :
                    "Custom Range"
                }
              </span>
              <button
                onClick={() => setDateFilter({type: "all", startDate: "", endDate: ""})}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Show All
              </button>
            </div>
          </div>
        )}

        {/* Order Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getOrderSummary().total}</div>
            <div className="text-sm opacity-90">
              {dateFilter.type === "all" ? "Total Orders" : "Filtered Orders"}
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getOrderSummary().pending}</div>
            <div className="text-sm opacity-90">Pending</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getOrderSummary().processing}</div>
            <div className="text-sm opacity-90">Processing</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getOrderSummary().shipped}</div>
            <div className="text-sm opacity-90">Shipped</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getOrderSummary().delivered}</div>
            <div className="text-sm opacity-90">Delivered</div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getOrderSummary().cancelled}</div>
            <div className="text-sm opacity-90">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Search & Filter Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order ID, customer, or product..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Filter by Date
            </label>
            <select
              value={dateFilter.type}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Time</option>
              <option value="today">📅 Today</option>
              <option value="week">📅 This Week</option>
              <option value="month">📅 This Month</option>
              <option value="custom">📅 Custom Range</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredAndSortedOrders.length}</span> orders found
              {notifications.length > 0 && (
                <div className="mt-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    🔔 {notifications.length} new
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateFilter.type === "custom" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📅 Custom Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => setDateFilter({type: "custom", startDate: "", endDate: ""})}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Clear Dates
              </button>
              <span className="text-sm text-gray-600 flex items-center">
                {dateFilter.startDate && dateFilter.endDate && 
                  `Filtering: ${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()}`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "No orders have been placed yet."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Order Header - Clean Design */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                      #
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-8)}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        ₹{order.totalPrice?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details - Simplified Layout */}
              <div className="p-6 space-y-6">
                {/* Customer Info - Clean Design */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-20 text-sm font-medium text-gray-600">Name:</span>
                        <span className="text-gray-900 font-medium">{order.userDetails?.name || order.user?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-sm font-medium text-gray-600">Email:</span>
                        <span className="text-gray-900">{order.userDetails?.email || order.user?.email || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-20 text-sm font-medium text-gray-600">Phone:</span>
                        <span className="text-gray-900">{order.userDetails?.phone || order.shippingAddress?.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-sm font-medium text-gray-600">Payment:</span>
                        <span className="text-gray-900 font-medium">{order.paymentMethod || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items - Clean Design */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.orderItems?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.log(`Image failed to load for ${item.name}:`, item.image);
                            e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                          onLoad={() => {
                            console.log(`Image loaded successfully for ${item.name}:`, item.image);
                          }}
                        />
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 text-lg">{item.name}</h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>₹{item.price?.toLocaleString()} each</span>
                            {item.selectedWeight && (
                              <>
                                <span>•</span>
                                <span>Weight: {item.selectedWeight.weight} Kg</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-xl">
                            ₹{(item.price * item.quantity)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address - Clean Design */}
                {order.shippingAddress && (
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      Shipping Address
                    </h4>
                    <div className="text-gray-700 space-y-1">
                      <p className="font-medium">{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Order Summary - Clean Design */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Order Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-bold text-gray-900">₹{order.itemsPrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-bold text-gray-900">₹{order.taxPrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-bold text-gray-900">₹{order.shippingPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        ₹{order.totalPrice?.toLocaleString()}
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                      </div>
                      {order.isPaid && order.paidAt && (
                        <div className="text-sm text-gray-600 mt-2">
                          Paid: {new Date(order.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update & Actions - Combined Clean Design */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Update */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        Update Status
                      </h4>
                      <div className="flex items-center space-x-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50 font-medium"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">⚙️ Processing</option>
                          <option value="shipped">📦 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                        {updatingOrder === order._id && (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </div>
                        Actions
                      </h4>
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Print Bill</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill Modal */}
      {showBill && selectedOrderForBill && (
        <BillOfSupply 
          order={selectedOrderForBill} 
          onClose={handleCloseBill} 
        />
      )}
    </div>
  );
};

export default AdminOrders;