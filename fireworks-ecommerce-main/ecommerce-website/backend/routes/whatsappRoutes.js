import express from 'express';
import { 
  verifyWebhook, 
  handleWebhook, 
  sendWhatsAppMessage, 
  getWebhookStatus 
} from '../controllers/whatsappController.js';

const router = express.Router();

// Webhook verification (GET request from Meta)
router.get('/webhook', verifyWebhook);

// Webhook handler (POST request from Meta)
router.post('/webhook', handleWebhook);

// Send message endpoint (for testing)
router.post('/send-message', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const result = await sendWhatsAppMessage(to, message);
    
    res.json({
      success: result.success,
      message: result.success ? 'Message sent successfully' : 'Failed to send message',
      error: result.error
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get webhook status
router.get('/status', getWebhookStatus);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp webhook is working!',
    timestamp: new Date().toISOString(),
    webhook_url: process.env.WHATSAPP_WEBHOOK_URL || 'not configured'
  });
});

export default router;
