import express from "express";
import { getOrderByTracking, getOrderDetails } from "../controllers/orderController.js";

const router = express.Router();

// Public route to get order details by ID (for QR code scanning)
router.get("/order-details/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tracking } = req.query;
    
    console.log('🔍 Public Route: Getting order details for ID:', orderId);
    console.log('🔍 Public Route: Tracking number:', tracking);
    console.log('🔍 Public Route: Request headers:', req.headers);
    console.log('🔍 Public Route: Request origin:', req.get('origin'));
    
    // Get order details
    const order = await getOrderDetails(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Verify tracking number if provided
    if (tracking && order.trackingNumber !== tracking) {
      return res.status(403).json({
        success: false,
        message: "Invalid tracking number"
      });
    }
    
    // Return order details in a format suitable for display
    res.json({
      success: true,
      order: {
        _id: order._id,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemsPrice: order.itemsPrice,
        taxPrice: order.taxPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        status: order.status,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        userDetails: order.userDetails
      }
    });
  } catch (error) {
    console.error('❌ Public Route: Error getting order details:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Public route to track order by tracking number
router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    console.log('🔍 Public Route: Tracking order:', trackingNumber);
    
    const order = await getOrderByTracking(trackingNumber);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({
      success: true,
      order: {
        _id: order._id,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemsPrice: order.itemsPrice,
        taxPrice: order.taxPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        status: order.status,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        userDetails: order.userDetails
      }
    });
  } catch (error) {
    console.error('❌ Public Route: Error tracking order:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;
