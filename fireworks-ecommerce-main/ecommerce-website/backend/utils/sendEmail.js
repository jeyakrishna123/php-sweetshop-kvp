import nodemailer from 'nodemailer';
import { getEmailConfig } from './emailConfig.js';

// Create transporter with error handling
let transporter = null;
try {
  const config = getEmailConfig();
  console.log('Email configuration check:', {
    SMTP_EMAIL: config.SMTP_EMAIL,
    SMTP_PASSWORD: config.SMTP_PASSWORD ? '***configured***' : 'not set',
    SMTP_HOST: config.SMTP_HOST,
    SMTP_PORT: config.SMTP_PORT
  });
  
  if (config.SMTP_EMAIL && config.SMTP_EMAIL !== 'your-email@gmail.com' && 
      config.SMTP_PASSWORD && config.SMTP_PASSWORD !== 'your-app-password' &&
      config.SMTP_PASSWORD !== 'your-gmail-app-password-here') {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: false,
      auth: {
        user: config.SMTP_EMAIL,
        pass: config.SMTP_PASSWORD
      }
    });
    console.log('Email transporter created successfully');
  } else {
    console.warn('Email not configured properly. Please check your .env file.');
    console.warn('Required: SMTP_EMAIL, SMTP_PASSWORD (Gmail App Password)');
  }
} catch (error) {
  console.warn('Email configuration error:', error.message);
}

// Send email function
export const sendEmail = async (emailOptions) => {
  try {
    if (!transporter) {
      console.warn('Email service not configured. Email not sent.');
      return { 
        success: false, 
        error: 'Email service not configured. Please check SMTP settings in .env file.' 
      };
    }

    // Validate email options
    if (!emailOptions.to && !emailOptions.email) {
      return { 
        success: false, 
        error: 'Recipient email address is required' 
      };
    }

    const mailOptions = {
      from: `${getEmailConfig().FROM_NAME} <${getEmailConfig().FROM_EMAIL}>`,
      to: emailOptions.email || emailOptions.to,
      subject: emailOptions.subject || 'SK Bakers Notification',
      html: emailOptions.html,
      text: emailOptions.text || emailOptions.message,
      attachments: emailOptions.attachments || []
    };

    console.log('Attempting to send email to:', mailOptions.to);
    console.log('Email subject:', mailOptions.subject);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server connection timed out. Please try again.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Send order confirmation email
export const sendOrderConfirmation = async (order, user) => {
  const emailOptions = {
    to: user.email,
    subject: `Order Confirmation - Order #${order._id.slice(-8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🍰 SK Bakers - Order Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> #${order._id.slice(-8)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Items:</h3>
          ${order.orderItems.map(item => `
            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
              <p><strong>${item.name}</strong></p>
              <p>Quantity: ${item.quantity} | Price: ₹${item.price}</p>
              ${item.selectedWeight ? `<p>Weight: ${item.selectedWeight.weight} Kg</p>` : ''}
            </div>
          `).join('')}
        </div>
        
        <p>We'll send you updates on your order status. If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>The SK Bakers Team</p>
      </div>
    `
  };

  return await sendEmail(emailOptions);
};

// Send order status update email
export const sendOrderStatusUpdate = async (order, user, newStatus, oldStatus) => {
  const statusMessages = {
    'pending': 'Your order is being prepared',
    'processing': 'Your order is being processed',
    'shipped': 'Your order has been shipped',
    'delivered': 'Your order has been delivered',
    'cancelled': 'Your order has been cancelled'
  };

  const statusColors = {
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'shipped': '#8b5cf6',
    'delivered': '#10b981',
    'cancelled': '#ef4444'
  };

  const statusIcons = {
    'pending': '⏳',
    'processing': '⚙️',
    'shipped': '🚚',
    'delivered': '✅',
    'cancelled': '❌'
  };

  const emailOptions = {
    to: user.email,
    subject: `Order Status Update - Order #${order._id.slice(-8)} - ${statusMessages[newStatus]}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎆 Order Status Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${statusMessages[newStatus]}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1e3c72; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <div style="background: ${statusColors[newStatus]}15; border: 2px solid ${statusColors[newStatus]}; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">${statusIcons[newStatus]}</div>
            <h3 style="color: ${statusColors[newStatus]}; margin: 0 0 10px 0; font-size: 20px;">${statusMessages[newStatus]}</h3>
            <p style="margin: 0; color: #374151; font-size: 16px;">Your order status has been updated from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong></p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px;">📋 Order Details</h3>
            <p><strong>Order ID:</strong> #${order._id.slice(-8)}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Will be provided when shipped'}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px;">🚚 Shipping Address</h3>
            <p>${order.shippingAddress?.address || 'N/A'}</p>
            <p>${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'} - ${order.shippingAddress?.postalCode || 'N/A'}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px;">📦 Items Ordered</h3>
            ${order.orderItems.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0;">
                <div>
                  <p style="margin: 0; font-weight: bold;">${item.name}</p>
                  <p style="margin: 0; color: #666; font-size: 14px;">Qty: ${item.quantity} × ₹${item.price}</p>
                  ${item.selectedWeight ? `<p style="margin: 0; color: #666; font-size: 14px;">Weight: ${item.selectedWeight.weight} Kg</p>` : ''}
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${newStatus === 'shipped' ? `
            <div style="background: #e8f5e8; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #10b981; margin: 0 0 10px 0;">📦 Your Order is on the Way!</h3>
              <p style="margin: 0; color: #155724;">Your order has been shipped and is on its way to you. You can track your order using the tracking number above.</p>
            </div>
          ` : ''}
          
          ${newStatus === 'delivered' ? `
            <div style="background: #e8f5e8; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #10b981; margin: 0 0 10px 0;">🎉 Order Delivered Successfully!</h3>
              <p style="margin: 0; color: #155724;">Your order has been delivered. Thank you for shopping with us!</p>
            </div>
          ` : ''}
          
          ${newStatus === 'cancelled' ? `
            <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #ef4444; margin: 0 0 10px 0;">❌ Order Cancelled</h3>
              <p style="margin: 0; color: #991b1b;">Your order has been cancelled. If you have any questions, please contact our support team.</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/orders/${order._id}" style="background: #1e3c72; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            If you have any questions, please contact our support team at upgradenowtechnologies@gmail.com
          </p>
        </div>
        
        <div style="background: #1e3c72; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">Thank you for choosing SK Bakers! 🎆</p>
        </div>
      </div>
    `,
    message: `
Order Status Update - Order #${order._id.slice(-8)}

Hello ${user.name},

Your order status has been updated from ${oldStatus} to ${newStatus}.

${statusMessages[newStatus]}

Order Details:
- Order ID: #${order._id.slice(-8)}
- Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
- Total Amount: ₹${order.totalPrice.toLocaleString('en-IN')}
- Status: ${newStatus}
- Tracking Number: ${order.trackingNumber || 'Will be provided when shipped'}

Items Ordered:
${order.orderItems.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`).join('\n')}

View your order details at: http://localhost:5173/orders/${order._id}

Thank you for choosing SK Bakers!

Best regards,
The SK Bakers Team
    `
  };

  return await sendEmail(emailOptions);
};

// Send password reset email
export const sendPasswordReset = async (user, resetToken) => {
  const emailOptions = {
    to: user.email,
    subject: 'Password Reset Request - SK Bakers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🔐 Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You requested a password reset for your SK Bakers account.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reset Token:</strong> ${resetToken}</p>
          <p>Use this token to reset your password. If you didn't request this, please ignore this email.</p>
        </div>
        
        <p>Best regards,<br>The SK Bakers Team</p>
      </div>
    `
  };

  return await sendEmail(emailOptions);
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const emailOptions = {
    to: user.email,
    subject: 'Welcome to SK Bakers! 🍰',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🍰 Welcome to SK Bakers!</h2>
        <p>Dear ${user.name},</p>
        <p>Welcome to SK Bakers! We're excited to have you as part of our community.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Get Started:</h3>
          <ul>
            <li>Browse our amazing fireworks collection</li>
            <li>Create your wishlist</li>
            <li>Enjoy secure shopping</li>
            <li>Get fast delivery</li>
          </ul>
        </div>
        
        <p>If you have any questions, our support team is here to help!</p>
        
        <p>Best regards,<br>The SK Bakers Team</p>
      </div>
    `
  };

  return await sendEmail(emailOptions);
};

// Send bill email to customer with PDF attachment
export const sendBillEmail = async (order, user, pdfBuffer, filename) => {
  const emailOptions = {
    to: user.email,
    subject: `Bill of Supply - Order #${order._id.slice(-8)} - SK Bakers`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">📄 Bill of Supply - SK Bakers</h2>
        <p>Dear ${user.name},</p>
        <p>Please find attached your bill of supply for your recent order. Thank you for choosing SK Bakers!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Summary:</h3>
          <p><strong>Order ID:</strong> #${order._id.slice(-8)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Items:</h3>
          ${order.orderItems?.map(item => `
            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
              <p><strong>${item.name}</strong></p>
              <p>Quantity: ${item.quantity} | Price: ₹${item.price} | Total: ₹${item.price * item.quantity}</p>
              ${item.selectedWeight ? `<p>Weight: ${item.selectedWeight.weight} Kg</p>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="background: #e5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
          <h3>📧 This email contains your official bill of supply.</h3>
          <p>Please keep this bill for your records. If you need any assistance or have questions about your order, please don't hesitate to contact our support team.</p>
        </div>
        
        <p>Thank you for your business!</p>
        
        <p>Best regards,<br>
        <strong>UpgradeNow Technologies</strong><br>
        Email: upgradenowtechnologies@gmail.com<br>
        SK Bakers Team</p>
      </div>
    `,
    attachments: [
      {
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return await sendEmail(emailOptions);
};