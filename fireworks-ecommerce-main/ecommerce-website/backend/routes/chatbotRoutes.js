import express from 'express';
import aiChatbotService from '../services/aiChatbotService.js';
import skChatbotService from '../services/skChatbotService.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Chat with AI chatbot
router.post('/chat', async (req, res) => {
  try {
    const { message, userId = 'anonymous', context = {} } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get additional context if user is authenticated
    if (userId !== 'anonymous') {
      try {
        const db = await import('../database.js');
        const user = db.default.findUserById(userId);
        if (user) {
          context.user = {
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
      } catch (error) {
        console.log('Could not fetch user context:', error.message);
      }
    }

    // Get product context
    try {
      const db = await import('../database.js');
      const products = db.default.getAllProducts();
      context.products = products.filter(p => p.isActive).slice(0, 10);
    } catch (error) {
      console.log('Could not fetch product context:', error.message);
    }

    // Use SK Bakers specific chatbot service
    const result = await skChatbotService.generateResponse(message, userId, context);

    res.json({
      success: result.success,
      response: result.response,
      timestamp: result.timestamp,
      error: result.error || null
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

// Get product recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { userId = 'anonymous', preferences = {} } = req.body;

    const result = await aiChatbotService.getProductRecommendations(userId, preferences);

    res.json({
      success: result.success,
      recommendations: result.recommendations || []
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get conversation history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = aiChatbotService.getConversationHistory(userId);

    res.json({
      success: true,
      history: history
    });

  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history',
      error: error.message
    });
  }
});

// Clear conversation history
router.delete('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = aiChatbotService.clearHistory(userId);

    res.json({
      success: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('Clear history API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation history',
      error: error.message
    });
  }
});

// Get chatbot status and configuration
router.get('/status', async (req, res) => {
  try {
    const services = aiChatbotService.getFreeAIServices();
    
    res.json({
      success: true,
      status: 'active',
      services: {
        huggingface: !!process.env.HUGGINGFACE_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        cohere: !!process.env.COHERE_API_KEY
      },
      features: [
        'Product recommendations',
        'Order assistance',
        'General inquiries',
        'Conversation history',
        'Multiple AI providers'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot status',
      error: error.message
    });
  }
});

// Test chatbot with sample message
router.post('/test', async (req, res) => {
  try {
    const testMessage = req.body.message || "Hello, I need help with your products";
    const result = await aiChatbotService.generateResponse(testMessage, 'test-user', {});

    res.json({
      success: result.success,
      testMessage,
      response: result.response,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test chatbot',
      error: error.message
    });
  }
});

export default router;
