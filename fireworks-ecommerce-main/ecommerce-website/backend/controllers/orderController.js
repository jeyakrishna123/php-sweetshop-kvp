import db from "../database.js";
import { sendEmail, sendOrderStatusUpdate, sendOrderConfirmation, sendBillEmail } from "../utils/sendEmail.js";
import { generateBillTemplate } from "../utils/billTemplate.js";
import { generateBillPDF } from "../utils/pdfGenerator.js";
import { isEmailConfigured } from "../utils/emailConfig.js";

// Helper function to populate order items with product details and user information
const populateOrderItems = (order) => {
  const products = db.getAllProducts();
  const users = db.getAllUsers();
  const populatedOrder = { ...order };
  
  // Ensure data is arrays
  if (!Array.isArray(products)) {
    console.error('❌ Products data is not an array in populateOrderItems');
    products = [];
  }
  if (!Array.isArray(users)) {
    console.error('❌ Users data is not an array in populateOrderItems');
    users = [];
  }
  
  // Populate user information if missing
  if (order.user && !populatedOrder.userDetails) {
    const user = users.find(u => u._id === order.user);
    if (user) {
      populatedOrder.userDetails = {
        name: user.name,
        email: user.email,
        phone: user.phone
      };
    }
  }
  
  // Populate order items with product details
  if (order.orderItems) {
    populatedOrder.orderItems = order.orderItems.map(item => {
      const product = products.find(p => p._id === item.product);
      return {
        ...item,
        image: item.image || (product && product.images && product.images.length > 0 ? product.images[0] : null),
        description: item.description || (product ? product.description : null),
        category: item.category || (product ? product.category : null)
      };
    });
  }
  
  return populatedOrder;
};

// Create new order with stock validation and transaction handling
export const createOrder = async (req, res) => {
  try {
    console.log('🔍 Order Controller: Creating order with data:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Order Controller: User from auth middleware:', req.user);
    console.log('🔍 Order Controller: User ID:', req.user?._id);
    
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      console.log('❌ Order Controller: No order items provided');
      return res.status(400).json({ success: false, message: "No order items" });
    }

    if (!req.user || !req.user._id) {
      console.log('❌ Order Controller: No user found in request');
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    // Validate stock availability
    console.log('🔍 Order Controller: Validating stock for items:', orderItems.length);
    console.log('🔍 Order Controller: Order items:', JSON.stringify(orderItems, null, 2));
    const stockValidation = await validateAndReserveStock(orderItems);
    if (!stockValidation.success) {
      console.log('❌ Order Controller: Stock validation failed:', stockValidation.message);
      console.log('❌ Order Controller: Available products in database:');
      const allProducts = db.getAllProducts();
      allProducts.forEach(p => console.log(`  - ID: ${p._id}, Name: ${p.name}, Stock: ${p.stock || p.countInStock || 'undefined'}`));
      return res.status(400).json({ success: false, message: stockValidation.message });
    }
    console.log('✅ Order Controller: Stock validation successful');

    const orderData = {
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
      isPaid: paymentMethod === 'UPI' ? true : false, // Only mark as paid for UPI
      isDelivered: false,
      trackingNumber: generateTrackingNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    // Create order with transaction
    const newOrder = await createOrderWithTransaction(orderData, stockValidation.reservedItems);
    console.log('Order created successfully:', newOrder._id);

    // Send real-time notification to admin panel
    if (global.io) {
      try {
        const notificationData = {
          type: 'new_order',
          orderId: newOrder._id,
          orderNumber: newOrder._id.slice(-8),
          customerName: req.user.name,
          totalAmount: newOrder.totalPrice,
          timestamp: new Date().toISOString(),
          status: newOrder.status
        };
        
        global.io.to('admin').emit('new_order', notificationData);
        console.log('🔔 Real-time notification sent for new order:', newOrder._id.slice(-8));
      } catch (notificationError) {
        console.error('Error sending real-time notification:', notificationError);
        // Don't fail the order creation if notification fails
      }
    }

    // Send order confirmation email with bill (only if email is configured) - ASYNC
    console.log('Checking email configuration...');
    const emailConfigured = isEmailConfigured();
    console.log('Email configured:', emailConfigured);
    
    if (emailConfigured) {
      // Send email asynchronously to avoid blocking the response
      setImmediate(async () => {
        try {
          console.log('Sending order confirmation email to:', req.user.email);
          await sendOrderConfirmation(newOrder, req.user);
          console.log('Order confirmation email sent successfully');
          
          // Generate and send PDF bill
          console.log('Generating PDF bill...');
          const pdfResult = await generateBillPDF(newOrder, req.user);
          
          if (pdfResult.success) {
            console.log('PDF bill generated successfully:', pdfResult.filename);
            
            // Send bill email with PDF attachment
            console.log('Sending bill email with PDF attachment...');
            const billEmailResult = await sendBillEmail(newOrder, req.user, pdfResult.buffer, pdfResult.filename);
            
            if (billEmailResult.success) {
              console.log('Bill email with PDF sent successfully');
            } else {
              console.error('Error sending bill email:', billEmailResult.error);
            }
          } else {
            console.error('Error generating PDF bill:', pdfResult.error);
          }
        } catch (emailError) {
          console.error('Error sending order confirmation email:', emailError);
          // Don't fail the order creation if email fails
        }
      });
    } else {
      console.log('Email not configured. Skipping order confirmation email.');
      console.log('Current email config:', {
        SMTP_EMAIL: process.env.SMTP_EMAIL,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***configured***' : 'not set',
        SMTP_HOST: process.env.SMTP_HOST
      });
    }

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate stock and reserve items
const validateAndReserveStock = async (orderItems) => {
  try {
    console.log('🔍 Stock Validation: Starting stock validation for items:', orderItems.length);
    const reservedItems = [];
    
    for (const item of orderItems) {
      console.log('🔍 Stock Validation: Validating item:', item.product, 'quantity:', item.quantity);
      const product = db.findProductById(item.product);
      
      if (!product) {
        console.log('❌ Stock Validation: Product not found:', item.product);
        console.log('🔍 Stock Validation: Available products:', db.getAllProducts().map(p => ({ id: p._id, name: p.name })));
        console.log('🔍 Stock Validation: Cart item details:', item);
        return { success: false, message: `Product ${item.product} not found` };
      }
      
      console.log('✅ Stock Validation: Product found:', product.name, 'stock:', product.stock, 'countInStock:', product.countInStock);
      
      const availableStock = product.stock || product.countInStock || 0;
      if (availableStock < item.quantity) {
        console.log('❌ Stock Validation: Insufficient stock:', product.name, 'available:', availableStock, 'requested:', item.quantity);
        return { 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
        };
      }
      
      // Reserve the item
      reservedItems.push({
        productId: item.product,
        quantity: item.quantity,
        currentStock: availableStock
      });
      console.log('Item reserved:', item.product, 'quantity:', item.quantity);
    }
    
    console.log('Stock validation successful, reserved items:', reservedItems.length);
    return { success: true, reservedItems };
  } catch (error) {
    console.error('Stock validation error:', error);
    return { success: false, message: 'Stock validation failed: ' + error.message };
  }
};

// Create order with transaction
const createOrderWithTransaction = async (orderData, reservedItems) => {
  try {
    console.log('Starting order transaction');
    
    // Create the order
    console.log('Creating order in database');
    const newOrder = db.createOrder(orderData);
    console.log('Order created with ID:', newOrder._id);
    
    // Update stock levels
    console.log('Updating stock levels for', reservedItems.length, 'items');
    for (const item of reservedItems) {
      const product = db.findProductById(item.productId);
      const newStock = item.currentStock - item.quantity;
      
      if (newStock < 0) {
        throw new Error(`Stock cannot be negative for product ${item.productId}`);
      }
      
      console.log('Updating stock for product:', item.productId, 'from', item.currentStock, 'to', newStock);
      db.updateProduct(item.productId, { stock: newStock });
    }
    
    console.log('Order transaction completed successfully');
    return newOrder;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
};

// Generate tracking number
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TRK${timestamp}${random}`.toUpperCase();
};

// Get single order
export const getSingleOrder = async (req, res) => {
  try {
    const order = db.findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (order.user !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Populate order items with product details
    const populatedOrder = populateOrderItems(order);

    res.json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get logged in user orders
export const myOrders = async (req, res) => {
  try {
    const orders = db.getOrdersByUser(req.user._id);

    // Populate order items with product details
    const populatedOrders = orders.map(populateOrderItems);

    res.json({
      success: true,
      orders: populatedOrders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = db.getAllOrders();

    // Populate order items with product details including images
    const populatedOrders = orders.map(populateOrderItems);

    res.json({
      success: true,
      orders: populatedOrders
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ message: error.message });
  }
};





// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = db.findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    const updatedOrder = db.updateOrder(req.params.id, { status: 'cancelled' });

    // Populate order items with product details
    const populatedOrder = populateOrderItems(updatedOrder);

    res.json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update order to paid
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = db.findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedOrder = db.updateOrder(req.params.id, {
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentResult: {
        id: req.body.id,
        status: req.body.status,
        update_time: new Date().toISOString(),
        email_address: req.body.email_address
      }
    });

    // Populate order items with product details
    const populatedOrder = populateOrderItems(updatedOrder);

    res.json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error updating order to paid:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get order by tracking number
export const getOrderByTracking = async (req, res) => {
  try {
    const order = db.findOrderByTracking(req.params.trackingNumber);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error getting order by tracking:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete order (admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = db.findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    db.deleteOrder(req.params.id);

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send order confirmation email with bill
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    console.log('Starting order confirmation email process...');
    const billHTML = generateBillTemplate(order, user);
    
    // Generate bill attachment
    console.log('Generating bill PDF...');
    const billAttachment = await generateSimpleBillPDF(order, user);
    console.log('Bill attachment result:', billAttachment);
    
    const emailOptions = {
      email: user.email,
      subject: `Order Confirmation & Bill - Order #${order._id.slice(-8)} - SK Bakers`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎆 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <h2 style="color: #1e3c72; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your order has been successfully placed and is being processed. Your official bill has been generated and attached to this email for your records.
            </p>
            
            <div style="background: #e8f5e8; border: 2px solid #28a745; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #28a745; margin: 0 0 10px 0;">📄 Your Bill is Attached!</h3>
              <p style="margin: 0; color: #155724;">Please find your official bill of supply attached to this email. Keep this for your records and tax purposes.</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e3c72; margin-bottom: 15px;">📋 Order Summary</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${order.status}</span></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e3c72; margin-bottom: 15px;">🚚 Shipping Address</h3>
              <p>${order.shippingAddress.address}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e3c72; margin-bottom: 15px;">📦 Items Ordered</h3>
              ${order.orderItems.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0;">
                  <div>
                    <strong>${item.name}</strong><br>
                    <small>Quantity: ${item.quantity}</small>
                  </div>
                  <div style="font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/orders/${order._id}" style="background: #1e3c72; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              📎 <strong>Invoice attached:</strong> Please find your detailed tax invoice attached to this email.
            </p>
            
                         <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
               If you have any questions, please contact our support team at upgradenowtechnologies@gmail.com
             </p>
          </div>
          
          <div style="background: #1e3c72; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">Thank you for choosing SK Bakers! 🍰</p>
          </div>
        </div>
      `,
      message: `
Order Confirmation - Invoice #${order._id}

Hello ${user.firstName}!

Your order has been successfully placed and is being processed.

Order Details:
- Order ID: ${order._id}
- Tracking Number: ${order.trackingNumber}
- Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
- Total Amount: ₹${order.totalPrice.toLocaleString('en-IN')}
- Payment Method: ${order.paymentMethod}
- Status: ${order.status}

Shipping Address:
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}

Items Ordered:
${order.orderItems.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`).join('\n')}

📎 Invoice attached: Please find your detailed tax invoice attached to this email.

View your order details at: http://localhost:5173/orders/${order._id}

Thank you for choosing SK Bakers!

Best regards,
The SK Bakers Team
      `,
      attachments: billAttachment.success ? [
        {
          filename: `bill-of-supply-${order._id.slice(-8)}.html`,
          content: billAttachment.html,
          contentType: 'text/html'
        }
      ] : []
    };

    await sendEmail(emailOptions);
    console.log(`Order confirmation email with invoice sent to ${user.email}`);
    
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating order ${id} status to:`, status);

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get current order
    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order status
    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString()
    };

    // If status is delivered, mark as delivered
    if (status === 'delivered') {
      updatedOrder.isDelivered = true;
      updatedOrder.deliveredAt = new Date().toISOString();
    }

    await db.updateOrder(id, updatedOrder);

    console.log(`Order ${id} status updated to ${status}`);

    // Send email notification to customer about status change
    console.log('=== ORDER STATUS UPDATE DEBUG ===');
    console.log('Order ID:', id);
    console.log('Old Status:', order.status);
    console.log('New Status:', status);
    console.log('Order User ID:', order.user);
    
    const emailConfigured = isEmailConfigured();
    console.log('Email configured:', emailConfigured);
    
    if (emailConfigured) {
      try {
        console.log('Sending order status update email to customer...');
        const user = db.findUserById(order.user);
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
          console.log('User email:', user.email);
          console.log('User name:', user.name);
          await sendOrderStatusUpdate(updatedOrder, user, status, order.status);
          console.log('Order status update email sent successfully');
        } else {
          console.log('User not found for order, skipping email notification');
        }
      } catch (emailError) {
        console.error('Error sending order status update email:', emailError);
        // Don't fail the status update if email fails
      }
    } else {
      console.log('Email not configured. Skipping order status update email.');
      console.log('Current email config:', {
        SMTP_EMAIL: process.env.SMTP_EMAIL,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***configured***' : 'not set',
        SMTP_HOST: process.env.SMTP_HOST
      });
    }
    console.log('=== END ORDER STATUS UPDATE DEBUG ===');

    // Populate order items with product details
    const populatedOrder = populateOrderItems(updatedOrder);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: populatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};

// Update entire order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`Updating order ${id} with data:`, updateData);

    // Get current order
    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order
    const updatedOrder = {
      ...order,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await db.updateOrder(id, updatedOrder);

    console.log(`Order ${id} updated successfully`);

    // Populate order items with product details
    const populatedOrder = populateOrderItems(updatedOrder);

    res.json({
      success: true,
      message: "Order updated successfully",
      order: populatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update order"
    });
  }
};

// Get order details by ID (public access for QR code)
export const getOrderDetails = async (orderId) => {
  try {
    console.log('🔍 Order Controller: Getting order details for ID:', orderId);
    
    const order = db.findOrderById(orderId);
    if (!order) {
      console.log('❌ Order Controller: Order not found:', orderId);
      return null;
    }
    
    console.log('✅ Order Controller: Order found:', order._id);
    
    // Populate order with full details
    const populatedOrder = populateOrderItems(order);
    
    return populatedOrder;
  } catch (error) {
    console.error('❌ Order Controller: Error getting order details:', error);
    return null;
  }
};
