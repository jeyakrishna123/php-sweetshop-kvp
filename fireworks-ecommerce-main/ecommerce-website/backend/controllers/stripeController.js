import Stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../database.js';
dotenv.config();

// Initialize Stripe only if API key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Stripe initialized in stripe controller");
} else {
  console.log("⚠️ Stripe not configured in stripe controller");
}

export const getSessionDetails = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: "Payment service not configured" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ['customer_details', 'line_items'],
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Safely parse metadata with error handling
    let cartItems = [];
    let shippingAddress = {};
    let userId = null;

    try {
      if (session.metadata?.cartItems) {
        cartItems = JSON.parse(session.metadata.cartItems);
      }
      if (session.metadata?.shippingAddress) {
        shippingAddress = JSON.parse(session.metadata.shippingAddress);
      }
      if (session.metadata?.userId) {
        userId = session.metadata.userId;
      }
    } catch (parseError) {
      console.error('Error parsing metadata:', parseError);
      return res.status(400).json({ message: 'Error parsing session metadata' });
    }

    // Ensure shipping address has all required fields
    const completeShippingAddress = {
      type: 'home', // Default value
      street: shippingAddress.street || session.customer_details?.address?.line1 || '',
      city: shippingAddress.city || session.customer_details?.address?.city || '',
      state: shippingAddress.state || session.customer_details?.address?.state || '',
      country: shippingAddress.country || session.customer_details?.address?.country || '',
      postalCode: shippingAddress.postalCode || session.customer_details?.address?.postal_code || '',
    };

    // Find existing order from JSON database
    const orders = db.getAllOrders();
    const existingOrder = orders.find(order => 
      order.paymentResult && order.paymentResult.id === session.payment_intent
    );

    res.status(200).json({
      cartItems,
      address: session.customer_details?.address || {},
      amount: session.amount_total / 100,
      userEmail: session.customer_details?.email || '',
      order: existingOrder,
    });
  } catch (error) {
    console.error('Error in getSessionDetails:', error);
    res.status(400).json({ message: error.message });
  }
};
