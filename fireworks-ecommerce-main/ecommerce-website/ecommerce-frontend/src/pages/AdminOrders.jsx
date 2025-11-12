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
    type: "today", // Default to today's orders - Changed from "all" to "today"
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

      // Validate user authentication first
      if (!user || !localStorage.getItem('token')) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await orderAPI.getAllOrders();
      console.log("📦 Orders response:", response);

      // Validate response structure
      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.success) {
        const errorMessage = response.message || response.error || "Failed to fetch orders";
        console.error("❌ API response not successful:", response);
        throw new Error(errorMessage);
      }

      // Validate data exists
      if (!response.data && !response.orders) {
        throw new Error("Invalid response format: missing data");
      }

      // Handle nested data structure: response.data.data
      let newOrders = response.data?.data || response.orders || [];

      // Validate orders is an array
      if (!Array.isArray(newOrders)) {
        console.error("❌ Orders data is not an array:", newOrders);
        throw new Error("Invalid orders data format");
      }

      // Map PHP-style fields to frontend format for compatibility
      newOrders = newOrders.map((order, index) => {
        try {
          // Validate required fields
          if (!order.id && !order._id) {
            console.warn(`⚠️ Order at index ${index} missing ID:`, order);
          }

          return {
            ...order,
            _id: order._id || order.id?.toString() || `temp-${index}`,
            // Use 6-digit order number for display (prioritize order_number from backend)
            // Only fallback to id if order_number is not available
            orderNumber: order.order_number || order.display_order_id || order.orderNumber || null,
            displayOrderId: order.display_order_id || order.order_number || order.orderNumber || null,
            // Map snake_case to camelCase for order summary with validation
            itemsPrice: !isNaN(parseFloat(order.items_price)) ? parseFloat(order.items_price) : 0,
            taxPrice: !isNaN(parseFloat(order.tax_price)) ? parseFloat(order.tax_price) : 0,
            shippingPrice: !isNaN(parseFloat(order.shipping_price)) ? parseFloat(order.shipping_price) : 0,
            totalPrice: !isNaN(parseFloat(order.total_price)) ? parseFloat(order.total_price) : 0,
            discountAmount: !isNaN(parseFloat(order.discount_amount)) ? parseFloat(order.discount_amount) : 0,
            // Map date fields - CRITICAL FIX for date display with timezone
            createdAt: order.createdAt || order.created_at || order.orderDate || new Date().toISOString(),
            updatedAt: order.updatedAt || order.updated_at || order.createdAt || order.created_at || new Date().toISOString(),
            // Map customer information with fallbacks
            userDetails: {
              name: order.user_name || order.shipping_name || 'Guest User',
              email: order.user_email || 'N/A',
              phone: order.phone || 'N/A'
            },
            user: {
              name: order.user_name || 'Guest User',
              email: order.user_email || 'N/A'
            },
            shippingAddress: {
              name: order.shipping_name || 'N/A',
              phone: order.phone || 'N/A',
              city: order.city || 'N/A',
              state: order.state || 'N/A'
            },
            // Map payment method
            paymentMethod: order.payment_method || 'COD',
            paymentStatus: order.payment_status || 'pending',
            // Ensure orderItems is available and is an array
            orderItems: Array.isArray(order.orderItems) ? order.orderItems :
                       Array.isArray(order.items) ? order.items : []
          };
        } catch (mapError) {
          console.error(`❌ Error mapping order at index ${index}:`, mapError, order);
          // Return a minimal valid order object
          return {
            ...order,
            _id: `error-${index}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            itemsPrice: 0,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 0,
            userDetails: { name: 'Error Loading', email: 'N/A', phone: 'N/A' },
            orderItems: []
          };
        }
      });

      console.log("✅ Orders loaded successfully:", newOrders.length, "orders");

      // Check for new orders for notifications
      if (showNotification && lastOrderCount > 0 && newOrders.length > lastOrderCount) {
        const newOrdersCount = newOrders.length - lastOrderCount;
        showToast(`🔔 ${newOrdersCount} new order(s) received!`, 'success');

        // Add to notifications
        try {
          const newNotification = {
            id: Date.now(),
            message: `${newOrdersCount} new order(s) received`,
            timestamp: new Date().toISOString(),
            type: 'new_order'
          };
          setNotifications(prev => [newNotification, ...(prev || []).slice(0, 4)]); // Keep last 5
        } catch (notifError) {
          console.error("❌ Error adding notification:", notifError);
        }
      }

      setOrders(newOrders);
      setLastOrderCount(newOrders.length);
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      // Detailed error messages based on error type
      let errorMessage = "Failed to load orders";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to view orders.";
      } else if (error.response?.status === 404) {
        errorMessage = "Orders API endpoint not found. Please contact support.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes("Network Error") || error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      showToast(errorMessage, "error");
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
        // Start of today (00:00:00)
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        // End of today (23:59:59)
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        return {
          start: startOfToday,
          end: endOfToday
        };
      case "week":
        // Start of week (Sunday 00:00:00)
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        // End of week (Saturday 23:59:59)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return {
          start: weekStart,
          end: weekEnd
        };
      case "month":
        // Start of month (1st day 00:00:00)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        // End of month (last day 23:59:59)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return { start: monthStart, end: monthEnd };
      case "custom":
        let customStart = null;
        let customEnd = null;

        if (dateFilter.startDate) {
          customStart = new Date(dateFilter.startDate);
          customStart.setHours(0, 0, 0, 0);
        }

        if (dateFilter.endDate) {
          customEnd = new Date(dateFilter.endDate);
          customEnd.setHours(23, 59, 59, 999);
        }

        return {
          start: customStart,
          end: customEnd
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
    // Validate inputs
    if (!orderId) {
      showToast("Invalid order ID", "error");
      return;
    }

    if (!newStatus) {
      showToast("Please select a status", "error");
      return;
    }

    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      showToast("Invalid status value", "error");
      return;
    }

    // Check if user is authenticated
    if (!user || !localStorage.getItem('token')) {
      showToast("Authentication required. Please log in again.", "error");
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
      return;
    }

    setUpdatingOrder(orderId);
    try {
      console.log("🔄 Updating order status:", { orderId, newStatus });

      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      console.log("📦 Update response:", response);

      // Validate response
      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.success) {
        // Update local state optimistically
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));

        // Show success message with status emoji
        const statusEmojis = {
          pending: '⏳',
          processing: '⚙️',
          shipped: '📦',
          delivered: '✅',
          cancelled: '❌'
        };
        const emoji = statusEmojis[newStatus] || '✅';

        showToast(`${emoji} Order status updated to ${newStatus}`, "success");
        console.log("✅ Order status updated successfully");
      } else {
        const errorMessage = response.message || response.error || "Failed to update order status";
        console.error("❌ Update failed:", response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Failed to update order status:", error);
      console.error("❌ Error details:", error.response?.data);

      // Detailed error messages
      let errorMessage = "Failed to update order status";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to update orders.";
      } else if (error.response?.status === 404) {
        errorMessage = "Order not found. It may have been deleted.";
        // Refresh orders list
        fetchOrders();
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");

      // Revert to previous status on error
      fetchOrders();
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

  // Helper to detect base64 images
  const isBase64Image = (str) => {
    if (!str || typeof str !== 'string') return false;
    if (str.startsWith('data:image/')) return true;
    // Check for raw base64 string (long string matching base64 pattern)
    if (str.length > 100 && /^[A-Za-z0-9+\/]+=*$/.test(str)) {
      if (!str.includes('/') && !str.includes('\\') && !str.includes('http')) {
        return true;
      }
    }
    return false;
  };

  // Helper function to get proper image URL
  const getImageUrl = (item) => {
    console.log('🔍 getImageUrl called with item:', item);

    // Try multiple image sources in order of preference
    let imagePath = null;

    // 1. Check item.image
    if (item?.image && typeof item.image === 'string' && !item.image.includes('placeholder')) {
      imagePath = item.image;
    }

    // 2. Check item.product_image (from JOIN with products table)
    if (!imagePath && item?.product_image && typeof item.product_image === 'string') {
      imagePath = item.product_image;
    }

    // 3. Check item.thumbnail
    if (!imagePath && item?.thumbnail && typeof item.thumbnail === 'string') {
      imagePath = item.thumbnail;
    }

    // 4. If still no image, use placeholder URL
    if (!imagePath) {
      console.log('❌ No valid image found, using Unsplash placeholder');
      return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop";
    }

    // CRITICAL: Never convert base64 images to URLs
    if (isBase64Image(imagePath)) {
      console.warn('⚠️ AdminOrders: Base64 image detected, returning as-is');
      return imagePath; // Return base64 as-is for img src
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      console.log('✅ Full URL detected:', imagePath);
      return imagePath;
    }

    // If it starts with /uploads, use backend server URL
    if (imagePath.startsWith('/uploads')) {
      const fullUrl = `${process.env.NODE_ENV === 'production' ? 'https://skbakers.com' : 'http://localhost:8000'}${imagePath}`;
      console.log('🔗 Local upload path converted to:', fullUrl);
      return fullUrl;
    }

    // If it's just a filename, construct the full path
    if (imagePath.includes('.')) {
      const fullUrl = `${process.env.NODE_ENV === 'production' ? 'https://skbakers.com' : 'http://localhost:8000'}/uploads/products/${imagePath}`;
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
      // Skip invalid orders
      if (!order || !order._id) return false;

      // Status filtering
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;

      // Search filtering - include order number in search
      const matchesSearch = searchTerm === "" ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderNumber && String(order.orderNumber).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.displayOrderId && String(order.displayOrderId).toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Date filtering - Fixed logic
      let matchesDate = true;
      if (dateFilter.type !== "all") {
        const orderDate = new Date(order.createdAt || order.created_at || order.orderDate);
        const dateRange = getDateRange(dateFilter.type);

        // For "today", "week", "month" - both start and end will be defined
        if (dateRange.start && dateRange.end) {
          matchesDate = orderDate >= dateRange.start && orderDate <= dateRange.end;
        }
        // For "custom" - check if dates are provided
        else if (dateFilter.type === "custom") {
          if (dateRange.start && dateRange.end) {
            matchesDate = orderDate >= dateRange.start && orderDate <= dateRange.end;
          } else if (dateRange.start) {
            matchesDate = orderDate >= dateRange.start;
          } else if (dateRange.end) {
            matchesDate = orderDate <= dateRange.end;
          }
        }
      }

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
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{(() => {
                          // Get order ID first (always available)
                          const orderId = order._id || order.id;
                          const orderIdNum = parseInt(orderId) || 0;
                          
                          // Check if we have a valid 6-digit order number from backend
                          let orderNum = order.orderNumber || order.displayOrderId || order.order_number || order.display_order_id;
                          
                          // Validate: orderNum must be numeric, 6 digits, and NOT the same as order ID
                          if (orderNum) {
                            const numStr = String(orderNum).padStart(6, '0');
                            const numValue = parseInt(numStr) || 0;
                            
                            // Only use if it's 6 digits AND not the same as order ID
                            if (numStr.length === 6 && numValue !== orderIdNum && numValue >= 100000 && numValue <= 999999) {
                              return numStr;
                            }
                          }
                          
                          // If no valid 6-digit number, generate one from order ID for display
                          if (orderIdNum > 0) {
                            // Generate consistent 6-digit number: (order_id * 12345) % 900000 + 100000
                            let generated = ((orderIdNum * 12345) % 900000) + 100000;
                            
                            // Ensure it's within 6-digit range (100000-999999)
                            if (generated > 999999) {
                              generated = (generated % 900000) + 100000;
                            }
                            if (generated < 100000) {
                              generated = generated + 100000;
                            }
                            
                            return String(generated).padStart(6, '0');
                          }
                          
                          return '000000';
                        })()}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {(() => {
                              try {
                                // Use created_at from database (MySQL datetime format: YYYY-MM-DD HH:MM:SS)
                                const createdAt = order.created_at || order.createdAt || order.orderDate;
                                if (!createdAt) return 'Invalid Date';
                                
                                // MySQL datetime format: "2025-11-06 14:47:00" (no timezone info)
                                // CRITICAL: MySQL stores datetime in server timezone (likely IST)
                                // We need to parse it as IST and then display it correctly
                                
                                let orderDate;
                                
                                // Check if it's already an ISO string with timezone
                                if (createdAt.includes('T') && (createdAt.includes('Z') || createdAt.includes('+') || createdAt.includes('-'))) {
                                  // ISO format with timezone - parse directly
                                  orderDate = new Date(createdAt);
                                } else {
                                  // MySQL datetime format without timezone: "2025-11-06 14:47:00"
                                  // Parse it as IST (Asia/Kolkata = UTC+5:30)
                                  // The simplest approach: treat the MySQL datetime as IST and convert to UTC
                                  const mysqlDateTime = createdAt.replace(' ', 'T');
                                  const dateTimeParts = mysqlDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
                                  
                                  if (dateTimeParts) {
                                    const year = parseInt(dateTimeParts[1]);
                                    const month = parseInt(dateTimeParts[2]) - 1; // JS months are 0-indexed
                                    const day = parseInt(dateTimeParts[3]);
                                    const hour = parseInt(dateTimeParts[4]);
                                    const minute = parseInt(dateTimeParts[5]);
                                    const second = parseInt(dateTimeParts[6]);
                                    
                                    // Create date assuming it's in IST
                                    // IST = UTC+5:30, so to convert IST datetime to UTC, subtract 5:30
                                    // Create as UTC first, then subtract the offset
                                    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
                                    // Subtract IST offset: 5 hours 30 minutes = 330 minutes
                                    utcDate.setUTCMinutes(utcDate.getUTCMinutes() - 330);
                                    
                                    orderDate = utcDate;
                                  } else {
                                    // Fallback: try parsing directly (will use browser's local timezone)
                                    orderDate = new Date(createdAt);
                                  }
                                }
                                
                                if (isNaN(orderDate.getTime())) {
                                  return 'Invalid Date';
                                }
                                
                                // Format: DD MMM YYYY • HH:MM AM/PM (Indian timezone)
                                // Now convert UTC date to IST for display
                                const dateStr = orderDate.toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'Asia/Kolkata'
                                });
                                
                                const timeStr = orderDate.toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: 'Asia/Kolkata'
                                });
                                
                                return `${dateStr} • ${timeStr}`;
                              } catch (e) {
                                if (process.env.NODE_ENV === 'development') {
                                  console.error('Date parsing error:', e, order.created_at, order.createdAt);
                                }
                                return 'Invalid Date';
                              }
                            })()}
                          </span>
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {(() => {
                              try {
                                const createdAt = order.created_at || order.createdAt;
                                if (!createdAt) return 'N/A';
                                
                                // Parse MySQL datetime as IST
                                let orderDate;
                                if (createdAt.includes('T') || createdAt.includes('Z') || createdAt.includes('+')) {
                                  orderDate = new Date(createdAt);
                                } else {
                                  const mysqlDateTime = createdAt.replace(' ', 'T');
                                  const dateTimeParts = mysqlDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
                                  if (dateTimeParts) {
                                    const year = parseInt(dateTimeParts[1]);
                                    const month = parseInt(dateTimeParts[2]) - 1;
                                    const day = parseInt(dateTimeParts[3]);
                                    const hour = parseInt(dateTimeParts[4]);
                                    const minute = parseInt(dateTimeParts[5]);
                                    const second = parseInt(dateTimeParts[6]);
                                    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
                                    utcDate.setUTCMinutes(utcDate.getUTCMinutes() - 330); // IST offset
                                    orderDate = utcDate;
                                  } else {
                                    orderDate = new Date(createdAt);
                                  }
                                }
                                
                                return orderDate.toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: 'Asia/Kolkata'
                                });
                              } catch (e) {
                                return 'N/A';
                              }
                            })()}
                          </span>
                        </p>
                      </div>
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
                      {getStatusIcon(order.status)} {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
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
                          src={getImageUrl(item)}
                          alt={item.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.log(`❌ Image failed to load for ${item.name}:`, item);
                            e.target.src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop";
                          }}
                          onLoad={() => {
                            console.log(`✅ Image loaded successfully for ${item.name}:`, getImageUrl(item));
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