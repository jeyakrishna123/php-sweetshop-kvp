import express from "express";
import {
  createOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  updateOrderToPaid,
  getOrderByTracking,
  deleteOrder,
} from "../controllers/orderController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { validateOrder, validateOrderStatusUpdate } from "../middleware/validation.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateBillTemplate } from "../utils/billTemplate.js";
import { generateBillPDF } from "../utils/pdfGenerator.js";
import { isEmailConfigured, getEmailSetupInstructions } from "../utils/emailConfig.js";

const router = express.Router();

// Public routes
router.get("/track/:trackingNumber", getOrderByTracking);

// Test email route (for development)
router.get("/test-email", async (req, res) => {
  try {
    if (!isEmailConfigured()) {
      return res.status(400).json({
        success: false,
        message: "Email not configured",
        instructions: getEmailSetupInstructions()
      });
    }

    // Create a sample order for testing
    const sampleOrder = {
      _id: "TEST_ORDER_123",
      orderItems: [
        {
          name: "Strobe Light Aerial",
          price: 699,
          quantity: 1
        },
        {
          name: "Multi-Color Aerial Shell",
          price: 899,
          quantity: 1
        }
      ],
      shippingAddress: {
        address: "No.7R, AKS Theatre Road, opposite to Ulavar Santhai, V.O.C. Nagar, Verravanchi Nagar, Kovilpatti, Tamil",
        city: "kovilpatti",
        state: "Tamil Nadu",
        postalCode: "628501"
      },
      paymentMethod: "Credit Card",
      itemsPrice: 1598,
      taxPrice: 287.64,
      shippingPrice: 0,
      totalPrice: 1885.64,
      status: "pending",
      trackingNumber: "TRK123456789",
      createdAt: new Date().toISOString()
    };

    const sampleUser = {
      firstName: "jeyakrishna",
      lastName: "k",
      email: "jeyakrishna40@gmail.com",
      phone: "8778738286"
    };

    // Generate bill attachment
    const billAttachment = await generateBillPDF(sampleOrder, sampleUser);
    
    const emailOptions = {
      email: sampleUser.email,
      subject: `Test Order Confirmation - Invoice #${sampleOrder._id} - FireworksHub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎆 Test Order Confirmation</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">This is a test email</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <h2 style="color: #1e3c72; margin-bottom: 20px;">Hello ${sampleUser.firstName}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              This is a test email to verify the email functionality is working correctly.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e3c72; margin-bottom: 15px;">📋 Test Order Summary</h3>
              <p><strong>Order ID:</strong> ${sampleOrder._id}</p>
              <p><strong>Tracking Number:</strong> ${sampleOrder.trackingNumber}</p>
              <p><strong>Total Amount:</strong> ₹${sampleOrder.totalPrice.toLocaleString('en-IN')}</p>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              📎 <strong>Test Invoice attached:</strong> Please find your test invoice attached to this email.
            </p>
          </div>
          
          <div style="background: #1e3c72; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">Test email sent successfully! 🎆</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `test-invoice-${sampleOrder._id}.html`,
          content: billAttachment.content,
          contentType: 'text/html'
        }
      ]
    };

    await sendEmail(emailOptions);
    
    res.json({
      success: true,
      message: "Test email sent successfully!",
      email: sampleUser.email
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
});

// Protected routes
router.post("/", isAuthenticated, validateOrder, createOrder);
router.get("/my-orders", isAuthenticated, myOrders);
router.put("/:id/pay", isAuthenticated, updateOrderToPaid);
router.put("/:id/cancel", isAuthenticated, cancelOrder);

// Admin routes (must come before /:id route to avoid conflicts)
router.get("/admin/all", isAuthenticated, isAdmin, getAllOrders);
router.put("/admin/:id", isAuthenticated, isAdmin, updateOrder);
router.put("/admin/:id/status", isAuthenticated, isAdmin, validateOrderStatusUpdate, updateOrderStatus);
router.delete("/admin/:id", isAuthenticated, isAdmin, deleteOrder);

// User routes (must come last)
router.get("/:id", isAuthenticated, getSingleOrder);

export default router;

