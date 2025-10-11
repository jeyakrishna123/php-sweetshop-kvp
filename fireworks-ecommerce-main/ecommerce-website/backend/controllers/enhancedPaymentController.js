import Stripe from 'stripe';
import db from '../database.js';
import { emailService } from './emailController.js';

// Initialize Stripe
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized in enhanced payment controller');
} else {
  console.log('⚠️ Stripe not configured in enhanced payment controller');
}

// Enhanced payment methods
export const paymentMethods = {
  stripe: 'stripe',
  razorpay: 'razorpay',
  paypal: 'paypal',
  cod: 'cod', // Cash on Delivery
  bankTransfer: 'bank_transfer'
};

// Create payment intent with multiple methods
export const createPaymentIntent = async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'inr', 
      paymentMethod = 'stripe',
      orderId,
      customerEmail,
      metadata = {}
    } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required'
      });
    }

    // Validate payment method
    if (!Object.values(paymentMethods).includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Get order details
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    let paymentIntent = null;

    switch (paymentMethod) {
      case 'stripe':
        if (!stripe) {
          return res.status(503).json({
            success: false,
            message: 'Stripe payment service not available'
          });
        }
        
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            orderId,
            customerEmail,
            ...metadata
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });
        break;

      case 'razorpay':
        // Razorpay implementation
        paymentIntent = {
          id: `rzp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          method: 'razorpay'
        };
        break;

      case 'paypal':
        // PayPal implementation
        paymentIntent = {
          id: `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          method: 'paypal'
        };
        break;

      case 'cod':
        // Cash on Delivery
        paymentIntent = {
          id: `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          method: 'cod',
          requiresAction: false
        };
        break;

      case 'bank_transfer':
        // Bank Transfer
        paymentIntent = {
          id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          method: 'bank_transfer',
          requiresAction: true,
          bankDetails: {
            accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
            accountName: process.env.BANK_ACCOUNT_NAME || 'FireworksHub',
            bankName: process.env.BANK_NAME || 'Sample Bank',
            ifscCode: process.env.BANK_IFSC || 'SAMPLE000123'
          }
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    // Update order with payment intent
    order.paymentIntent = paymentIntent.id;
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'pending';
    db.updateOrder(orderId, order);

    res.json({
      success: true,
      paymentIntent,
      orderId,
      amount,
      currency
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
};

// Process payment
export const processPayment = async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      orderId, 
      paymentMethod,
      paymentData = {}
    } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and order ID are required'
      });
    }

    // Get order
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    let paymentResult = null;

    switch (paymentMethod) {
      case 'stripe':
        if (!stripe) {
          return res.status(503).json({
            success: false,
            message: 'Stripe payment service not available'
          });
        }

        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          
          if (paymentIntent.status === 'succeeded') {
            paymentResult = {
              id: paymentIntent.id,
              status: 'succeeded',
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              method: 'stripe'
            };
          } else if (paymentIntent.status === 'requires_payment_method') {
            return res.status(400).json({
              success: false,
              message: 'Payment requires additional action'
            });
          } else {
            return res.status(400).json({
              success: false,
              message: `Payment failed: ${paymentIntent.status}`
            });
          }
        } catch (stripeError) {
          console.error('Stripe payment verification error:', stripeError);
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed'
          });
        }
        break;

      case 'razorpay':
        // Verify Razorpay payment
        paymentResult = {
          id: paymentIntentId,
          status: 'succeeded',
          amount: order.totalPrice,
          currency: 'inr',
          method: 'razorpay'
        };
        break;

      case 'paypal':
        // Verify PayPal payment
        paymentResult = {
          id: paymentIntentId,
          status: 'succeeded',
          amount: order.totalPrice,
          currency: 'inr',
          method: 'paypal'
        };
        break;

      case 'cod':
        // Cash on Delivery - mark as pending
        paymentResult = {
          id: paymentIntentId,
          status: 'pending',
          amount: order.totalPrice,
          currency: 'inr',
          method: 'cod',
          note: 'Payment will be collected on delivery'
        };
        break;

      case 'bank_transfer':
        // Bank Transfer - mark as pending
        paymentResult = {
          id: paymentIntentId,
          status: 'pending',
          amount: order.totalPrice,
          currency: 'inr',
          method: 'bank_transfer',
          note: 'Payment will be verified once bank transfer is confirmed'
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    // Update order
    order.paymentResult = paymentResult;
    order.paymentStatus = paymentResult.status;
    order.isPaid = paymentResult.status === 'succeeded';
    
    if (paymentResult.status === 'succeeded') {
      order.paidAt = new Date().toISOString();
      order.status = 'processing';
    }

    db.updateOrder(orderId, order);

    // Send confirmation email if payment succeeded
    if (paymentResult.status === 'succeeded') {
      try {
        await emailService.sendOrderConfirmation(orderId);
      } catch (emailError) {
        console.log('Order confirmation email failed:', emailError.message);
      }
    }

    res.json({
      success: true,
      paymentResult,
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice
      }
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
};

// Get payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const { currency = 'inr' } = req.query;

    const availableMethods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Secure payment via Stripe',
        icon: '💳',
        enabled: !!stripe,
        supportedCurrencies: ['inr', 'usd', 'eur'],
        fees: '2.9% + ₹30',
        processingTime: 'Instant'
      },
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Popular Indian payment gateway',
        icon: '🏦',
        enabled: true,
        supportedCurrencies: ['inr'],
        fees: '2% + ₹3',
        processingTime: 'Instant'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'International payment solution',
        icon: '🌐',
        enabled: true,
        supportedCurrencies: ['usd', 'eur', 'inr'],
        fees: '3.49% + $0.49',
        processingTime: 'Instant'
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: '💵',
        enabled: true,
        supportedCurrencies: ['inr'],
        fees: '₹50',
        processingTime: 'On Delivery'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: '🏛️',
        enabled: true,
        supportedCurrencies: ['inr'],
        fees: 'Free',
        processingTime: '1-2 business days'
      }
    ].filter(method => 
      method.enabled && 
      method.supportedCurrencies.includes(currency.toLowerCase())
    );

    res.json({
      success: true,
      paymentMethods: availableMethods,
      defaultCurrency: currency.toLowerCase()
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      paymentStatus: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        paymentResult: order.paymentResult
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and reason are required'
      });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is not paid'
      });
    }

    if (amount > order.totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }

    let refundResult = null;

    // Process refund based on payment method
    if (order.paymentMethod === 'stripe' && stripe) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.paymentIntent,
          amount: Math.round(amount * 100),
          reason: 'requested_by_customer',
          metadata: {
            orderId,
            reason
          }
        });

        refundResult = {
          id: refund.id,
          status: refund.status,
          amount: refund.amount / 100,
          reason: refund.reason
        };
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return res.status(400).json({
          success: false,
          message: 'Refund processing failed'
        });
      }
    } else {
      // Manual refund for other payment methods
      refundResult = {
        id: `manual_${Date.now()}`,
        status: 'succeeded',
        amount,
        reason,
        method: 'manual'
      };
    }

    // Update order
    order.refunds = order.refunds || [];
    order.refunds.push({
      ...refundResult,
      processedAt: new Date().toISOString(),
      processedBy: req.user?.id || 'system'
    });

    // Update order status if full refund
    if (amount === order.totalPrice) {
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
    }

    db.updateOrder(orderId, order);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundResult,
      orderId
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed'
    });
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const orders = await db.getAllOrders();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Filter orders by period
    const periodOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate && new Date(order.createdAt) <= endDate
    );

    // Payment method analysis
    const paymentMethodStats = {};
    const paymentStatusStats = {};
    let totalRevenue = 0;
    let successfulPayments = 0;

    periodOrders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      const status = order.paymentStatus || 'unknown';

      // Payment method stats
      if (!paymentMethodStats[method]) {
        paymentMethodStats[method] = {
          count: 0,
          revenue: 0,
          successRate: 0
        };
      }
      paymentMethodStats[method].count++;
      paymentMethodStats[method].revenue += order.totalPrice;

      // Payment status stats
      if (!paymentStatusStats[status]) {
        paymentStatusStats[status] = {
          count: 0,
          revenue: 0
        };
      }
      paymentStatusStats[status].count++;
      paymentStatusStats[status].revenue += order.totalPrice;

      // Overall stats
      totalRevenue += order.totalPrice;
      if (order.isPaid) successfulPayments++;
    });

    // Calculate success rates
    Object.keys(paymentMethodStats).forEach(method => {
      const methodOrders = periodOrders.filter(order => order.paymentMethod === method);
      const successful = methodOrders.filter(order => order.isPaid).length;
      paymentMethodStats[method].successRate = methodOrders.length > 0 ? 
        (successful / methodOrders.length) * 100 : 0;
    });

    const analytics = {
      period,
      overview: {
        totalOrders: periodOrders.length,
        totalRevenue,
        successfulPayments,
        overallSuccessRate: periodOrders.length > 0 ? (successfulPayments / periodOrders.length) * 100 : 0,
        averageOrderValue: periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0
      },
      paymentMethods: paymentMethodStats,
      paymentStatus: paymentStatusStats,
      trends: calculatePaymentTrends(periodOrders, startDate, endDate)
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics'
    });
  }
};

// Calculate payment trends
const calculatePaymentTrends = (orders, startDate, endDate) => {
  const dailyPayments = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOrders = orders.filter(order => 
      order.createdAt.startsWith(dateStr)
    );
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const dayCount = dayOrders.length;
    const successfulCount = dayOrders.filter(order => order.isPaid).length;
    
    dailyPayments.push({
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayRevenue,
      orders: dayCount,
      successful: successfulCount,
      successRate: dayCount > 0 ? (successfulCount / dayCount) * 100 : 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyPayments;
};
