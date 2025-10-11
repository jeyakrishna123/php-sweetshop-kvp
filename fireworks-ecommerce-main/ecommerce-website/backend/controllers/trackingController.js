import db from '../database.js';
import { sendEmail } from '../utils/sendEmail.js';

// Get order tracking information
export const getOrderTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    // Find order by tracking number
    const order = db.findOrderByTracking(trackingNumber);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking number'
      });
    }

    // Get user details
    const user = db.findUserById(order.user);
    
    // Get tracking history
    const trackingHistory = getTrackingHistory(order);

    // Calculate estimated delivery
    const estimatedDelivery = calculateEstimatedDelivery(order);

    // Get delivery status
    const deliveryStatus = getDeliveryStatus(order);

    res.json({
      success: true,
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.status,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod
      },
      customer: {
        name: user?.name || 'Customer',
        email: user?.email || '',
        phone: user?.phone || ''
      },
      shippingAddress: order.shippingAddress,
      trackingHistory,
      estimatedDelivery,
      deliveryStatus,
      orderItems: order.orderItems
    });

  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order tracking information',
      error: error.message
    });
  }
};

// Update order tracking status
export const updateTrackingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, notes } = req.body;

    // Validate required fields
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required'
      });
    }

    // Find order
    const order = db.findOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['out_for_delivery', 'delivered'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Update order status
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };

    // Add specific fields based on status
    if (status === 'shipped') {
      updateData.shippedAt = new Date().toISOString();
    } else if (status === 'out_for_delivery') {
      updateData.outForDeliveryAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();
      updateData.isDelivered = true;
    }

    // Add tracking location if provided
    if (location) {
      updateData.currentLocation = location;
    }

    // Add tracking notes if provided
    if (notes) {
      updateData.trackingNotes = notes;
    }

    const updatedOrder = db.updateOrder(orderId, updateData);

    // Send tracking update email to customer
    try {
      const user = db.findUserById(order.user);
      if (user) {
        await sendTrackingUpdateEmail(updatedOrder, user, status);
      }
    } catch (emailError) {
      console.log('Email sending failed for tracking update:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Order tracking status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update tracking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking status',
      error: error.message
    });
  }
};

// Get all orders for admin tracking
export const getAllOrdersForTracking = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get all orders
    let orders = db.getAllOrders();

    // Filter by status if provided
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Populate orders with user details
    const populatedOrders = paginatedOrders.map(order => {
      const user = db.findUserById(order.user);
      return {
        ...order,
        customer: {
          name: user?.name || 'Unknown',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      };
    });

    res.json({
      success: true,
      orders: populatedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(orders.length / parseInt(limit)),
        totalOrders: orders.length,
        hasNextPage: endIndex < orders.length,
        hasPrevPage: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Get all orders for tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders for tracking',
      error: error.message
    });
  }
};

// Get tracking statistics
export const getTrackingStats = async (req, res) => {
  try {
    const orders = db.getAllOrders();
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      outForDeliveryOrders: orders.filter(o => o.status === 'out_for_delivery').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      averageDeliveryTime: calculateAverageDeliveryTime(orders)
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get tracking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tracking statistics',
      error: error.message
    });
  }
};

// Helper functions
const getTrackingHistory = (order) => {
  const history = [
    {
      status: 'pending',
      timestamp: order.createdAt,
      description: 'Order placed successfully',
      location: 'Online Store'
    }
  ];

  if (order.status !== 'pending') {
    history.push({
      status: 'confirmed',
      timestamp: order.confirmedAt || order.updatedAt,
      description: 'Order confirmed and payment verified',
      location: 'Processing Center'
    });
  }

  if (order.status === 'processing' || order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') {
    history.push({
      status: 'processing',
      timestamp: order.processingAt || order.updatedAt,
      description: 'Order is being prepared for shipment',
      location: 'Warehouse'
    });
  }

  if (order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') {
    history.push({
      status: 'shipped',
      timestamp: order.shippedAt || order.updatedAt,
      description: 'Order has been shipped',
      location: order.currentLocation || 'Shipping Center'
    });
  }

  if (order.status === 'out_for_delivery' || order.status === 'delivered') {
    history.push({
      status: 'out_for_delivery',
      timestamp: order.outForDeliveryAt || order.updatedAt,
      description: 'Order is out for delivery',
      location: order.currentLocation || 'Local Delivery Center'
    });
  }

  if (order.status === 'delivered') {
    history.push({
      status: 'delivered',
      timestamp: order.deliveredAt || order.updatedAt,
      description: 'Order has been delivered',
      location: order.shippingAddress?.address || 'Delivery Address'
    });
  }

  if (order.status === 'cancelled') {
    history.push({
      status: 'cancelled',
      timestamp: order.updatedAt,
      description: 'Order has been cancelled',
      location: 'Online Store'
    });
  }

  return history;
};

const calculateEstimatedDelivery = (order) => {
  const orderDate = new Date(order.createdAt);
  const estimatedDate = new Date(orderDate);
  
  // Add delivery time based on status
  switch (order.status) {
    case 'pending':
    case 'confirmed':
      estimatedDate.setDate(estimatedDate.getDate() + 3); // 3 days
      break;
    case 'processing':
      estimatedDate.setDate(estimatedDate.getDate() + 2); // 2 days
      break;
    case 'shipped':
      estimatedDate.setDate(estimatedDate.getDate() + 1); // 1 day
      break;
    case 'out_for_delivery':
      estimatedDate.setDate(estimatedDate.getDate() + 0); // Same day
      break;
    case 'delivered':
      return null; // Already delivered
    case 'cancelled':
      return null; // Cancelled
    default:
      estimatedDate.setDate(estimatedDate.getDate() + 3);
  }

  return {
    date: estimatedDate.toISOString(),
    days: Math.ceil((estimatedDate - orderDate) / (1000 * 60 * 60 * 24))
  };
};

const getDeliveryStatus = (order) => {
  const statusMap = {
    'pending': {
      status: 'Order Placed',
      color: 'blue',
      icon: '📝',
      description: 'Your order has been placed and is being processed'
    },
    'confirmed': {
      status: 'Order Confirmed',
      color: 'green',
      icon: '✅',
      description: 'Your order has been confirmed and payment verified'
    },
    'processing': {
      status: 'Processing',
      color: 'yellow',
      icon: '⚙️',
      description: 'Your order is being prepared for shipment'
    },
    'shipped': {
      status: 'Shipped',
      color: 'purple',
      icon: '🚚',
      description: 'Your order has been shipped and is on its way'
    },
    'out_for_delivery': {
      status: 'Out for Delivery',
      color: 'orange',
      icon: '🏃',
      description: 'Your order is out for delivery and will arrive soon'
    },
    'delivered': {
      status: 'Delivered',
      color: 'green',
      icon: '🎉',
      description: 'Your order has been successfully delivered'
    },
    'cancelled': {
      status: 'Cancelled',
      color: 'red',
      icon: '❌',
      description: 'Your order has been cancelled'
    }
  };

  return statusMap[order.status] || statusMap['pending'];
};

const calculateAverageDeliveryTime = (orders) => {
  const deliveredOrders = orders.filter(order => 
    order.status === 'delivered' && order.deliveredAt
  );

  if (deliveredOrders.length === 0) return 0;

  const totalDays = deliveredOrders.reduce((sum, order) => {
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(order.deliveredAt);
    const days = Math.ceil((deliveryDate - orderDate) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round(totalDays / deliveredOrders.length);
};

// Email notification for tracking updates
const sendTrackingUpdateEmail = async (order, user, status) => {
  try {
    const statusInfo = getDeliveryStatus(order);
    
    const emailOptions = {
      email: user.email,
      subject: `Order Update - ${statusInfo.status} - Order #${order._id.slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${statusInfo.icon} Order Update</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${statusInfo.status}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <h2 style="color: #1e3c72; margin-bottom: 20px;">Hello ${user.name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${statusInfo.description}
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e3c72; margin-bottom: 15px;">📦 Order Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${statusInfo.status}</span></p>
              <p><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/tracking/${order.trackingNumber}" 
                 style="background: #1e3c72; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              Thank you for choosing FireworksHub! 🎆
            </p>
          </div>
        </div>
      `
    };
    
    await sendEmail(emailOptions);
  } catch (error) {
    console.error('Tracking update email error:', error);
  }
};
