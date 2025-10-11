import Stripe from 'stripe';
import db from '../database.js';
import { sendEmail } from '../utils/sendEmail.js';

// Initialize payment gateways
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Stripe initialized");
} else {
  console.log("⚠️ Stripe not configured - using fallback payment methods");
}

// Payment gateway configurations
const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  RAZORPAY: 'razorpay',
  PAYU: 'payu',
  PHONEPE: 'phonepe',
  COD: 'cod',
  UPI: 'upi'
};

// Create payment session for multiple gateways
export const createPaymentSession = async (req, res) => {
  try {
    const { 
      cartItems, 
      email, 
      name, 
      userId, 
      shippingAddress, 
      paymentMethod,
      totalAmount 
    } = req.body;

    // Validate required data
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart items are required" 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ 
        success: false, 
        message: "Complete shipping address is required" 
      });
    }

    const orderData = {
      user: userId,
      orderItems: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'stripe',
      itemsPrice: totalAmount,
      taxPrice: totalAmount * 0.18, // 18% GST
      shippingPrice: 0, // Free shipping
      totalPrice: totalAmount + (totalAmount * 0.18),
      status: 'pending',
      isPaid: false,
      isDelivered: false,
      trackingNumber: generateTrackingNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create order first
    const newOrder = db.createOrder(orderData);

    // Handle different payment methods
    switch (paymentMethod) {
      case PAYMENT_GATEWAYS.STRIPE:
        return await handleStripePayment(req, res, newOrder, cartItems, email);
      
      case PAYMENT_GATEWAYS.RAZORPAY:
        return await handleRazorpayPayment(req, res, newOrder, totalAmount);
      
      case PAYMENT_GATEWAYS.PAYU:
        return await handlePayUPayment(req, res, newOrder, totalAmount);
      
      case PAYMENT_GATEWAYS.PHONEPE:
        return await handlePhonePePayment(req, res, newOrder, totalAmount);
      
      case PAYMENT_GATEWAYS.UPI:
        return await handleUPIPayment(req, res, newOrder, totalAmount);
      
      case PAYMENT_GATEWAYS.COD:
        return await handleCODPayment(req, res, newOrder);
      
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid payment method"
        });
    }

  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({
      success: false,
      message: "Payment session creation failed",
      error: error.message
    });
  }
};

// Stripe payment handler
const handleStripePayment = async (req, res, order, cartItems, email) => {
  if (!stripe) {
    return res.status(503).json({ 
      success: false, 
      message: "Stripe payment service not configured" 
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ['IN'],
      },
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: order._id,
        userId: order.user,
      },
    });

    res.json({ 
      success: true, 
      paymentId: session.id,
      paymentUrl: session.url,
      orderId: order._id
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({
      success: false,
      message: "Stripe payment failed",
      error: error.message
    });
  }
};

// Razorpay payment handler
const handleRazorpayPayment = async (req, res, order, amount) => {
  try {
    const razorpay = require('razorpay');
    const instance = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: order._id,
      payment_capture: 1,
      notes: {
        orderId: order._id,
        userId: order.user,
      }
    };

    const payment = await instance.orders.create(options);

    res.json({
      success: true,
      paymentId: payment.id,
      orderId: order._id,
      amount: amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay payment error:", error);
    res.status(500).json({
      success: false,
      message: "Razorpay payment failed",
      error: error.message
    });
  }
};

// PayU payment handler
const handlePayUPayment = async (req, res, order, amount) => {
  try {
    const payu = require('payu-sdk');
    
    const paymentData = {
      key: process.env.PAYU_MERCHANT_KEY,
      txnid: order._id,
      amount: amount,
      productinfo: `Fireworks Order - ${order._id}`,
      firstname: order.shippingAddress.name || 'Customer',
      email: order.shippingAddress.email || 'customer@example.com',
      phone: order.shippingAddress.phone || '9999999999',
      surl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
      furl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`,
      hash: generatePayUHash(order._id, amount, process.env.PAYU_MERCHANT_KEY, process.env.PAYU_MERCHANT_SALT)
    };

    res.json({
      success: true,
      paymentData,
      orderId: order._id,
      paymentUrl: process.env.PAYU_PAYMENT_URL
    });
  } catch (error) {
    console.error("PayU payment error:", error);
    res.status(500).json({
      success: false,
      message: "PayU payment failed",
      error: error.message
    });
  }
};

// PhonePe payment handler
const handlePhonePePayment = async (req, res, order, amount) => {
  try {
    const phonepe = require('phonepe-sdk');
    
    const paymentData = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: order._id,
      amount: Math.round(amount * 100),
      merchantUserId: order.user,
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/phonepe/callback`,
      mobileNumber: order.shippingAddress.phone || '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    res.json({
      success: true,
      paymentData,
      orderId: order._id,
      paymentUrl: process.env.PHONEPE_PAYMENT_URL
    });
  } catch (error) {
    console.error("PhonePe payment error:", error);
    res.status(500).json({
      success: false,
      message: "PhonePe payment failed",
      error: error.message
    });
  }
};

// UPI payment handler
const handleUPIPayment = async (req, res, order, amount) => {
  try {
    // Generate UPI payment link
    const upiId = process.env.UPI_ID || 'your-upi-id@paytm';
    const upiLink = `upi://pay?pa=${upiId}&pn=FireworksHub&am=${amount}&cu=INR&tn=Order-${order._id}`;
    
    res.json({
      success: true,
      paymentId: `UPI_${order._id}`,
      orderId: order._id,
      upiLink,
      qrCode: generateQRCode(upiLink),
      amount,
      upiId
    });
  } catch (error) {
    console.error("UPI payment error:", error);
    res.status(500).json({
      success: false,
      message: "UPI payment failed",
      error: error.message
    });
  }
};

// COD payment handler
const handleCODPayment = async (req, res, order) => {
  try {
    // Update order status for COD
    const updatedOrder = db.updateOrder(order._id, {
      status: 'confirmed',
      paymentMethod: 'COD',
      isPaid: false,
      paymentStatus: 'pending'
    });

    // Send confirmation email
    try {
      const user = db.findUserById(order.user);
      if (user) {
        await sendOrderConfirmationEmail(updatedOrder, user);
      }
    } catch (emailError) {
      console.log('Email sending failed for COD order:', emailError.message);
    }

    res.json({
      success: true,
      orderId: order._id,
      message: "Order placed successfully. Payment will be collected on delivery.",
      paymentMethod: 'COD'
    });
  } catch (error) {
    console.error("COD payment error:", error);
    res.status(500).json({
      success: false,
      message: "COD order failed",
      error: error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, paymentMethod, paymentData } = req.body;

    const order = db.findOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    let isPaymentValid = false;

    switch (paymentMethod) {
      case PAYMENT_GATEWAYS.STRIPE:
        isPaymentValid = await verifyStripePayment(paymentId);
        break;
      case PAYMENT_GATEWAYS.RAZORPAY:
        isPaymentValid = await verifyRazorpayPayment(paymentData);
        break;
      case PAYMENT_GATEWAYS.PAYU:
        isPaymentValid = await verifyPayUPayment(paymentData);
        break;
      case PAYMENT_GATEWAYS.PHONEPE:
        isPaymentValid = await verifyPhonePePayment(paymentData);
        break;
      case PAYMENT_GATEWAYS.UPI:
        isPaymentValid = true; // UPI verification would be done differently
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid payment method"
        });
    }

    if (isPaymentValid) {
      // Update order status
      const updatedOrder = db.updateOrder(orderId, {
        status: 'confirmed',
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentResult: {
          id: paymentId,
          status: 'completed',
          method: paymentMethod
        }
      });

      // Send confirmation email
      try {
        const user = db.findUserById(order.user);
        if (user) {
          await sendOrderConfirmationEmail(updatedOrder, user);
        }
      } catch (emailError) {
        console.log('Email sending failed:', emailError.message);
      }

      res.json({
        success: true,
        message: "Payment verified successfully",
        order: updatedOrder
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};

// Get available payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        icon: '💳',
        enabled: !!process.env.STRIPE_SECRET_KEY,
        description: 'Pay with Visa, Mastercard, American Express'
      },
      {
        id: 'razorpay',
        name: 'Razorpay',
        icon: '🏦',
        enabled: !!process.env.RAZORPAY_KEY_ID,
        description: 'Pay with Razorpay gateway'
      },
      {
        id: 'payu',
        name: 'PayU',
        icon: '💼',
        enabled: !!process.env.PAYU_MERCHANT_KEY,
        description: 'Pay with PayU gateway'
      },
      {
        id: 'phonepe',
        name: 'PhonePe',
        icon: '📱',
        enabled: !!process.env.PHONEPE_MERCHANT_ID,
        description: 'Pay with PhonePe wallet'
      },
      {
        id: 'upi',
        name: 'UPI',
        icon: '📲',
        enabled: true,
        description: 'Pay with UPI apps like Google Pay, Paytm'
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        icon: '💰',
        enabled: true,
        description: 'Pay when your order is delivered'
      }
    ];

    res.json({
      success: true,
      paymentMethods: paymentMethods.filter(method => method.enabled)
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment methods",
      error: error.message
    });
  }
};

// Helper functions
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TRK${timestamp}${random}`.toUpperCase();
};

const generatePayUHash = (txnid, amount, key, salt) => {
  const crypto = require('crypto');
  const hashString = `${key}|${txnid}|${amount}|productinfo|firstname|email|||||||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
};

const generateQRCode = (upiLink) => {
  // This would generate a QR code for UPI payment
  // For now, return the UPI link
  return upiLink;
};

// Payment verification functions
const verifyStripePayment = async (paymentId) => {
  if (!stripe) return false;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(paymentId);
    return session.payment_status === 'paid';
  } catch (error) {
    console.error('Stripe verification error:', error);
    return false;
  }
};

const verifyRazorpayPayment = async (paymentData) => {
  // Implement Razorpay payment verification
  return true; // Placeholder
};

const verifyPayUPayment = async (paymentData) => {
  // Implement PayU payment verification
  return true; // Placeholder
};

const verifyPhonePePayment = async (paymentData) => {
  // Implement PhonePe payment verification
  return true; // Placeholder
};

// Email confirmation function
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const emailOptions = {
      email: user.email,
      subject: `Order Confirmation - Order #${order._id.slice(-8)} - FireworksHub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🎆 Order Confirmed!</h2>
          <p>Dear ${user.name},</p>
          <p>Your order has been successfully placed and is being processed.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <p>Thank you for choosing FireworksHub!</p>
        </div>
      `
    };
    
    await sendEmail(emailOptions);
  } catch (error) {
    console.error('Order confirmation email error:', error);
  }
};
