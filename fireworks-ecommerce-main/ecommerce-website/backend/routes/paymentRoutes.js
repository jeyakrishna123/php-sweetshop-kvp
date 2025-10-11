import express from "express";
import { 
  createPaymentSession, 
  verifyPayment, 
  getPaymentMethods 
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Get available payment methods
router.get("/methods", getPaymentMethods);

// Create payment session
router.post("/create-session", isAuthenticated, createPaymentSession);

// Verify payment
router.post("/verify", isAuthenticated, verifyPayment);

// Payment callbacks (for webhooks)
router.post("/stripe/webhook", (req, res) => {
  // Handle Stripe webhook
  res.json({ received: true });
});

router.post("/razorpay/callback", (req, res) => {
  // Handle Razorpay callback
  res.json({ received: true });
});

router.post("/payu/callback", (req, res) => {
  // Handle PayU callback
  res.json({ received: true });
});

router.post("/phonepe/callback", (req, res) => {
  // Handle PhonePe callback
  res.json({ received: true });
});

export default router;
