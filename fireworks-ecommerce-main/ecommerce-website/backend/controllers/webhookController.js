import Stripe from 'stripe';
import db from "../database.js";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe only if API key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Stripe initialized in webhook controller");
} else {
  console.log("⚠️ Stripe not configured in webhook controller");
}

export const webhookController = async (req, res) => {
  if (!stripe) {
    console.log("⚠️ Stripe not configured - webhook ignored");
    return res.status(200).json({ received: true, message: "Stripe not configured" });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Processing checkout.session.completed:', session);

    try {
      // Prevent duplicate orders for the same payment
      const orders = db.getAllOrders();
      const existingOrder = orders.find(order => order.paymentResult && order.paymentResult.id === session.payment_intent);
      
      if (existingOrder) {
        console.log("Order already exists for this payment intent. Skipping creation.");
        return res.status(200).json({ received: true });
      }

      // Parse metadata
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

      // Create order with all required fields
      const orderData = {
        user: userId,
        orderItems: cartItems,
        shippingAddress: {
          type: 'home',
          street: shippingAddress.street || session.customer_details?.address?.line1 || '',
          city: shippingAddress.city || session.customer_details?.address?.city || '',
          state: shippingAddress.state || session.customer_details?.address?.state || '',
          country: shippingAddress.country || session.customer_details?.address?.country || '',
          postalCode: shippingAddress.postalCode || session.customer_details?.address?.postal_code || '',
        },
        paymentMethod: 'Stripe',
        itemsPrice: session.amount_subtotal / 100,
        taxPrice: (session.amount_total - session.amount_subtotal) / 100,
        shippingPrice: 0,
        totalPrice: session.amount_total / 100,
        paymentResult: {
          id: session.payment_intent,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: session.customer_details?.email || '',
        },
        isPaid: true,
        paidAt: new Date().toISOString(),
        status: 'processing'
      };

      const newOrder = db.createOrder(orderData);
      console.log("✅ Order saved to JSON database after Stripe checkout!");
    } catch (error) {
      console.error('Error creating order from webhook:', error);
      return res.status(500).json({ message: 'Error creating order' });
    }
  }

  res.status(200).json({ received: true });
};
