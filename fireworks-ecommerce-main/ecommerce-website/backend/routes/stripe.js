import express from "express";
import Stripe from "stripe";
import dotenv from 'dotenv';
import { getSessionDetails } from "../controllers/stripeController.js";
dotenv.config();

const router = express.Router();

// Initialize Stripe only if API key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Stripe initialized in routes");
} else {
  console.log("⚠️ Stripe not configured in routes");
}

// ✅ FIXED ROUTE HERE!
router.get("/session/:id", getSessionDetails);

router.post("/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: "Payment service not configured" });
  }

  const { cartItems, email, name, userId, shippingAddress } = req.body;

  try {
    // Validate required data
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
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
        userId: userId,
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(
          cartItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            product: item._id,
          }))
        ),
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({ message: "Stripe session creation failed", error: error.message });
  }
});

export default router;
