import crypto from 'crypto';

// WhatsApp webhook verification token (from your Meta App Dashboard)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'EAAhVmBZAgHykBPcyWtsklDqvbEnDldnxiz4c8JSKBy1i1LlhZArq5HAso7DIEA9ABZBXOw9Ra7EtLtGZBCgEHyDI3BARn3uNwk6KMW205ynOVNZB';

// WhatsApp webhook verification
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 WhatsApp webhook verification request:', {
    mode,
    token: token ? 'provided' : 'missing',
    challenge: challenge ? 'provided' : 'missing'
  });

  // Check if mode and token are correct
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ WhatsApp webhook verification failed');
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Handle incoming WhatsApp messages
export const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Check if it's a WhatsApp webhook event
    if (body.object === 'whatsapp_business_account') {
      // Process each entry
      body.entry?.forEach(async (entry) => {
        // Process each change
        entry.changes?.forEach(async (change) => {
          if (change.field === 'messages') {
            await processMessages(change.value);
          }
        });
      });

      res.status(200).json({ status: 'ok' });
    } else {
      res.status(404).json({ error: 'Not a WhatsApp webhook' });
    }
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process incoming messages
const processMessages = async (value) => {
  try {
    const messages = value.messages || [];
    const contacts = value.contacts || [];
    const metadata = value.metadata || {};

    console.log(`📨 Processing ${messages.length} messages`);

    for (const message of messages) {
      await processMessage(message, contacts, metadata);
    }
  } catch (error) {
    console.error('❌ Error processing messages:', error);
  }
};

// Process individual message
const processMessage = async (message, contacts, metadata) => {
  try {
    const contact = contacts.find(c => c.wa_id === message.from);
    const contactName = contact?.profile?.name || 'Unknown';
    const messageType = message.type;
    const messageId = message.id;
    const timestamp = message.timestamp;

    console.log(`📩 New message from ${contactName} (${message.from}):`, {
      type: messageType,
      id: messageId,
      timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
    });

    // Handle different message types
    switch (messageType) {
      case 'text':
        await handleTextMessage(message, contactName);
        break;
      case 'interactive':
        await handleInteractiveMessage(message, contactName);
        break;
      case 'button':
        await handleButtonMessage(message, contactName);
        break;
      case 'image':
        await handleImageMessage(message, contactName);
        break;
      case 'document':
        await handleDocumentMessage(message, contactName);
        break;
      default:
        console.log(`⚠️ Unhandled message type: ${messageType}`);
        await sendAutoReply(message.from, `Sorry, I don't understand ${messageType} messages yet. Please send a text message.`);
    }
  } catch (error) {
    console.error('❌ Error processing individual message:', error);
  }
};

// Handle text messages
const handleTextMessage = async (message, contactName) => {
  const text = message.text.body.toLowerCase().trim();
  const from = message.from;

  console.log(`💬 Text message from ${contactName}: "${text}"`);

  // Simple keyword-based responses
  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    await sendAutoReply(from, `Hello ${contactName}! 👋 Welcome to Crackers Commerce! How can I help you today?`);
  } else if (text.includes('price') || text.includes('cost')) {
    await sendAutoReply(from, `💰 For pricing information, please visit our website or contact our sales team. You can also browse our products online!`);
  } else if (text.includes('order') || text.includes('buy')) {
    await sendAutoReply(from, `🛒 To place an order, please visit our website or call our customer service. We'll be happy to help you!`);
  } else if (text.includes('delivery') || text.includes('shipping')) {
    await sendAutoReply(from, `🚚 We offer fast and reliable delivery! Please visit our website for delivery options and shipping information.`);
  } else if (text.includes('help') || text.includes('support')) {
    await sendAutoReply(from, `🆘 Our customer support team is here to help! You can:\n• Visit our website\n• Call us directly\n• Email us\n• Chat with us online`);
  } else if (text.includes('catalog') || text.includes('products') || text.includes('list')) {
    await sendAutoReply(from, `📋 Browse our full product catalog on our website! We have a wide range of fireworks and crackers for all occasions.`);
  } else {
    // Default response
    await sendAutoReply(from, `Thank you for contacting Crackers Commerce! 😊\n\nFor immediate assistance, please:\n• Visit our website\n• Call our customer service\n• Email us directly\n\nWe'll get back to you soon!`);
  }
};

// Handle interactive messages (list, buttons, etc.)
const handleInteractiveMessage = async (message, contactName) => {
  const interactive = message.interactive;
  const from = message.from;

  console.log(`🔘 Interactive message from ${contactName}:`, interactive);

  if (interactive.type === 'list_reply') {
    const selectedId = interactive.list_reply.id;
    const selectedTitle = interactive.list_reply.title;
    
    await sendAutoReply(from, `You selected: ${selectedTitle}\n\nThank you for your interest! Our team will contact you soon.`);
  } else if (interactive.type === 'button_reply') {
    const selectedId = interactive.button_reply.id;
    const selectedTitle = interactive.button_reply.title;
    
    await sendAutoReply(from, `You clicked: ${selectedTitle}\n\nWe'll help you with that right away!`);
  }
};

// Handle button messages
const handleButtonMessage = async (message, contactName) => {
  const button = message.button;
  const from = message.from;

  console.log(`🔘 Button message from ${contactName}:`, button);
  await sendAutoReply(from, `Thank you for your response! We'll get back to you soon.`);
};

// Handle image messages
const handleImageMessage = async (message, contactName) => {
  const from = message.from;
  console.log(`🖼️ Image message from ${contactName}`);
  await sendAutoReply(from, `Thank you for sharing the image! Our team will review it and get back to you.`);
};

// Handle document messages
const handleDocumentMessage = async (message, contactName) => {
  const from = message.from;
  console.log(`📄 Document message from ${contactName}`);
  await sendAutoReply(from, `Thank you for sharing the document! We'll review it and contact you soon.`);
};

// Send auto-reply message
const sendAutoReply = async (to, message) => {
  try {
    // This is a placeholder - you'll need to implement actual WhatsApp API sending
    console.log(`📤 Auto-reply to ${to}: ${message}`);
    
    // TODO: Implement actual WhatsApp API call here
    // await sendWhatsAppMessage(to, message);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending auto-reply:', error);
    return false;
  }
};

// Send WhatsApp message (placeholder for actual implementation)
export const sendWhatsAppMessage = async (to, message) => {
  try {
    // TODO: Implement actual WhatsApp Business API call
    console.log(`📤 Sending WhatsApp message to ${to}: ${message}`);
    
    // Example implementation:
    // const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: to,
    //     type: 'text',
    //     text: { body: message }
    //   })
    // });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

// Get webhook status
export const getWebhookStatus = (req, res) => {
  res.json({
    status: 'active',
    verify_token: VERIFY_TOKEN ? 'configured' : 'missing',
    webhook_url: process.env.WHATSAPP_WEBHOOK_URL || 'not configured',
    timestamp: new Date().toISOString()
  });
};
