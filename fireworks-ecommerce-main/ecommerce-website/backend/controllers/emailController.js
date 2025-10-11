import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import db from '../database.js';

dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create transporter
let transporter = null;
try {
  transporter = nodemailer.createTransporter(emailConfig);
  console.log('✅ Email transporter created successfully');
} catch (error) {
  console.log('⚠️ Email not configured - using fallback');
}

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmation #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🎉 Order Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Your order has been successfully placed and confirmed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Items Ordered</h3>
          ${order.orderItems.map(item => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>${item.name}</strong></p>
              <p>Quantity: ${item.quantity} × ₹${item.price}</p>
            </div>
          `).join('')}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.street}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
          <p>${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
        </div>
        
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br>FireworksHub Team</p>
      </div>
    `
  }),
  
  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🔐 Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Click the button below to reset your password:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email.</p>
        
        <p>Best regards,<br>FireworksHub Team</p>
      </div>
    `
  }),
  
  emailVerification: (user, verificationToken) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">✅ Verify Your Email</h2>
        <p>Dear ${user.name},</p>
        <p>Welcome to FireworksHub! Please verify your email address to complete your registration.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Click the button below to verify your email:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        
        <p><strong>Note:</strong> This link will expire in 24 hours.</p>
        
        <p>Best regards,<br>FireworksHub Team</p>
      </div>
    `
  }),
  
  orderStatusUpdate: (order, user, newStatus) => ({
    subject: `Order Status Updated - ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">📦 Order Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>Your order status has been updated.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>New Status:</strong> <span style="color: #007bff; font-weight: bold;">${newStatus}</span></p>
          <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Track your order: <a href="${process.env.FRONTEND_URL}/order/${order._id}">View Order</a></p>
        
        <p>Best regards,<br>FireworksHub Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  if (!transporter) {
    console.log('⚠️ Email not configured - skipping email send');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const emailContent = emailTemplates[template](data.user || data, data);
    
    const mailOptions = {
      from: `"FireworksHub" <${emailConfig.auth.user}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email service functions
export const emailService = {
  // Send order confirmation
  sendOrderConfirmation: async (orderId) => {
    try {
      const order = db.getOrderById(orderId);
      const user = db.findUserById(order.user);
      
      if (!order || !user) {
        return { success: false, message: 'Order or user not found' };
      }
      
      return await sendEmail(user.email, 'orderConfirmation', { order, user });
    } catch (error) {
      console.error('Order confirmation email error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send password reset email
  sendPasswordReset: async (email) => {
    try {
      const user = db.findUserByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Generate reset token (in production, use crypto.randomBytes)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store reset token in user data (in production, use database)
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      db.updateUser(user._id, user);
      
      return await sendEmail(email, 'passwordReset', { user, resetToken });
    } catch (error) {
      console.error('Password reset email error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send email verification
  sendEmailVerification: async (email) => {
    try {
      const user = db.findUserByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Generate verification token
      const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store verification token
      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours
      db.updateUser(user._id, user);
      
      return await sendEmail(email, 'emailVerification', { user, verificationToken });
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send order status update
  sendOrderStatusUpdate: async (orderId, newStatus) => {
    try {
      const order = db.getOrderById(orderId);
      const user = db.findUserById(order.user);
      
      if (!order || !user) {
        return { success: false, message: 'Order or user not found' };
      }
      
      return await sendEmail(user.email, 'orderStatusUpdate', { order, user, newStatus });
    } catch (error) {
      console.error('Order status update email error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Send marketing email
  sendMarketingEmail: async (emails, subject, content) => {
    try {
      const results = [];
      for (const email of emails) {
        const result = await sendEmail(email, 'custom', { 
          user: { name: 'Valued Customer' }, 
          subject, 
          content 
        });
        results.push({ email, result });
      }
      return { success: true, results };
    } catch (error) {
      console.error('Marketing email error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default emailService;
