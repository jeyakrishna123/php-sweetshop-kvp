import axios from 'axios';

class SKChatbotService {
  constructor() {
    this.conversationHistory = new Map();
    this.maxHistoryLength = 20;
    this.botName = "SK Bakers Cake Shop";
    
    // Product knowledge base for SK Bakers
    this.productKnowledge = {
      categories: {
        "Cakes": {
          description: "Fresh, delicious cakes for every occasion",
          popular: ["Chocolate Cake", "Vanilla Cake", "Red Velvet", "Black Forest", "Cheese Cake"],
          occasions: ["Birthday", "Wedding", "Anniversary", "Corporate Events"],
          features: ["Custom designs", "Fresh ingredients", "Same-day delivery"]
        },
        "Sweets": {
          description: "Traditional and modern sweets for all tastes",
          popular: ["Gulab Jamun", "Rasmalai", "Ladoos", "Barfi", "Cookies"],
          occasions: ["Festivals", "Celebrations", "Gifts"],
          features: ["Traditional recipes", "Premium quality", "Gift packaging"]
        },
        "New Items": {
          description: "Latest additions to our menu",
          popular: ["Fusion Cakes", "Trending Sweets", "Seasonal Specials"],
          occasions: ["Special Events", "Limited Time"],
          features: ["Innovative flavors", "Modern presentation", "Exclusive items"]
        },
        "Special Items": {
          description: "Premium and custom items for special occasions",
          popular: ["Wedding Cakes", "Birthday Cakes", "Corporate Orders"],
          occasions: ["Weddings", "Birthdays", "Corporate Events", "Festivals"],
          features: ["Custom designs", "Premium quality", "Bulk orders", "Special packaging"]
        }
      },
      services: {
        "Delivery": {
          description: "Fast and reliable delivery service",
          areas: ["Local delivery", "Same-day delivery", "Scheduled delivery"],
          timing: "2-4 hours for local delivery",
          charges: "Free delivery for orders above ₹500"
        },
        "Custom Orders": {
          description: "Custom cakes and sweets for special occasions",
          process: "Consultation → Design → Confirmation → Preparation → Delivery",
          timeline: "2-3 days advance notice required",
          features: ["Personalized designs", "Special ingredients", "Photo cakes"]
        },
        "Payment": {
          methods: ["Cash on Delivery", "Online Payment", "UPI", "Credit/Debit Cards"],
          security: "Secure payment processing",
          offers: "Special discounts for bulk orders"
        }
      },
      commonQuestions: {
        "What products do you have?": "We have a wide variety of cakes, sweets, and special items. Our main categories include Cakes (Chocolate, Vanilla, Red Velvet, etc.), Sweets (Gulab Jamun, Rasmalai, Ladoos, etc.), New Items (Fusion cakes, trending sweets), and Special Items (Wedding cakes, custom orders).",
        "How can I place an order?": "You can place an order through our website, call us directly, or visit our shop. For custom orders, please contact us 2-3 days in advance.",
        "Do you deliver?": "Yes! We offer local delivery with 2-4 hours delivery time. Free delivery for orders above ₹500.",
        "What payment methods do you accept?": "We accept Cash on Delivery, Online Payment, UPI, and Credit/Debit Cards. All payments are secure and encrypted.",
        "Do you make custom cakes?": "Absolutely! We specialize in custom cakes for birthdays, weddings, anniversaries, and corporate events. Please contact us for design consultation.",
        "What are your prices?": "Our prices vary based on size, design, and ingredients. Basic cakes start from ₹299, and custom cakes are priced based on complexity. Contact us for detailed pricing.",
        "How fresh are your products?": "All our products are made fresh daily using premium ingredients. We don't use preservatives and ensure maximum freshness.",
        "Do you have any offers?": "Yes! We offer special discounts for bulk orders, festival specials, and first-time customers. Follow us on social media for latest offers."
      }
    };
  }

  // Add message to conversation history
  addToHistory(userId, message, isUser = true) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId);
    history.push({
      message,
      isUser,
      timestamp: new Date().toISOString()
    });
    
    // Keep only recent messages
    if (history.length > this.maxHistoryLength) {
      history.splice(0, history.length - this.maxHistoryLength);
    }
  }

  // Get conversation history
  getConversationHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }

  // Generate intelligent response
  async generateResponse(userMessage, userId, context = {}) {
    try {
      // Add user message to history
      this.addToHistory(userId, userMessage, true);

      // Get conversation history
      const history = this.getConversationHistory(userId);

      // Analyze the user's message
      const analysis = this.analyzeMessage(userMessage);
      
      // Generate appropriate response
      let response = await this.generateContextualResponse(userMessage, analysis, context, history);

      // Add AI response to history
      this.addToHistory(userId, response, false);

      return {
        success: true,
        response,
        timestamp: new Date().toISOString(),
        botName: this.botName
      };

    } catch (error) {
      console.error('SK Chatbot Error:', error);
      return {
        success: false,
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact us directly.",
        error: error.message
      };
    }
  }

  // Analyze user message to understand intent
  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    return {
      intent: this.detectIntent(lowerMessage),
      entities: this.extractEntities(lowerMessage),
      sentiment: this.analyzeSentiment(lowerMessage),
      urgency: this.detectUrgency(lowerMessage)
    };
  }

  // Detect user intent
  detectIntent(message) {
    const intents = {
      'greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      'product_inquiry': ['products', 'cakes', 'sweets', 'menu', 'what do you have', 'show me'],
      'price_inquiry': ['price', 'cost', 'how much', 'expensive', 'cheap', 'budget'],
      'order_inquiry': ['order', 'buy', 'purchase', 'place order', 'how to order'],
      'delivery_inquiry': ['delivery', 'deliver', 'shipping', 'when will it come', 'delivery time'],
      'custom_inquiry': ['custom', 'special', 'design', 'personalized', 'unique'],
      'payment_inquiry': ['payment', 'pay', 'money', 'cash', 'card', 'upi'],
      'complaint': ['complaint', 'problem', 'issue', 'wrong', 'bad', 'disappointed'],
      'compliment': ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love'],
      'goodbye': ['bye', 'goodbye', 'see you', 'thanks', 'thank you']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general_inquiry';
  }

  // Extract entities from message
  extractEntities(message) {
    const entities = {
      products: [],
      occasions: [],
      quantities: [],
      locations: []
    };

    // Extract product names
    const productKeywords = ['cake', 'sweet', 'chocolate', 'vanilla', 'gulab jamun', 'rasmalai', 'ladoo', 'barfi'];
    productKeywords.forEach(keyword => {
      if (message.includes(keyword)) {
        entities.products.push(keyword);
      }
    });

    // Extract occasions
    const occasionKeywords = ['birthday', 'wedding', 'anniversary', 'festival', 'party', 'celebration'];
    occasionKeywords.forEach(keyword => {
      if (message.includes(keyword)) {
        entities.occasions.push(keyword);
      }
    });

    return entities;
  }

  // Analyze sentiment
  analyzeSentiment(message) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'perfect', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointed', 'angry'];
    
    const positiveCount = positiveWords.filter(word => message.includes(word)).length;
    const negativeCount = negativeWords.filter(word => message.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Detect urgency
  detectUrgency(message) {
    const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'today', 'emergency'];
    return urgentWords.some(word => message.includes(word));
  }

  // Generate contextual response
  async generateContextualResponse(message, analysis, context, history) {
    const { intent, entities, sentiment, urgency } = analysis;
    
    // Handle different intents
    switch (intent) {
      case 'greeting':
        return this.generateGreetingResponse(sentiment);
      
      case 'product_inquiry':
        return this.generateProductResponse(entities, context);
      
      case 'price_inquiry':
        return this.generatePriceResponse(entities, context);
      
      case 'order_inquiry':
        return this.generateOrderResponse(entities, context);
      
      case 'delivery_inquiry':
        return this.generateDeliveryResponse(entities, context);
      
      case 'custom_inquiry':
        return this.generateCustomResponse(entities, context);
      
      case 'payment_inquiry':
        return this.generatePaymentResponse(entities, context);
      
      case 'complaint':
        return this.generateComplaintResponse(sentiment, urgency);
      
      case 'compliment':
        return this.generateComplimentResponse();
      
      case 'goodbye':
        return this.generateGoodbyeResponse();
      
      default:
        return this.generateGeneralResponse(message, entities, context);
    }
  }

  // Generate greeting response
  generateGreetingResponse(sentiment) {
    const greetings = [
      `Hello! Welcome to ${this.botName}! 🎂 I'm here to help you with all your cake and sweet needs. How can I assist you today?`,
      `Hi there! 👋 Welcome to ${this.botName}! I'm excited to help you find the perfect treats. What are you looking for?`,
      `Good day! 🌟 Welcome to ${this.botName}! I'm your personal assistant for all things delicious. How may I help you?`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Generate product response
  generateProductResponse(entities, context) {
    let response = `At ${this.botName}, we have a wonderful variety of products! 🍰\n\n`;
    
    if (entities.products.length > 0) {
      response += `I see you're interested in ${entities.products.join(', ')}. `;
    }
    
    response += `Here's what we offer:\n\n`;
    
    // Add product categories
    Object.entries(this.productKnowledge.categories).forEach(([category, info]) => {
      response += `**${category}** 🎂\n`;
      response += `${info.description}\n`;
      response += `Popular items: ${info.popular.join(', ')}\n\n`;
    });
    
    response += `Would you like to know more about any specific category or product?`;
    
    return response;
  }

  // Generate price response
  generatePriceResponse(entities, context) {
    let response = `Great question about pricing! 💰\n\n`;
    
    response += `Our prices are very competitive and vary based on size, design, and ingredients:\n\n`;
    response += `• **Basic Cakes**: Starting from ₹299\n`;
    response += `• **Premium Cakes**: ₹499 - ₹999\n`;
    response += `• **Custom Cakes**: ₹799 - ₹2999 (based on complexity)\n`;
    response += `• **Sweets**: ₹99 - ₹499 per box\n`;
    response += `• **Bulk Orders**: Special discounts available\n\n`;
    
    response += `We also offer:\n`;
    response += `• Free delivery for orders above ₹500\n`;
    response += `• Festival special discounts\n`;
    response += `• First-time customer offers\n\n`;
    
    response += `For specific pricing on custom orders, please contact us directly. Would you like to know about any particular product?`;
    
    return response;
  }

  // Generate order response
  generateOrderResponse(entities, context) {
    let response = `I'd be happy to help you place an order! 🛒\n\n`;
    
    response += `Here's how you can order from ${this.botName}:\n\n`;
    response += `**Online Ordering:**\n`;
    response += `• Browse our products on the website\n`;
    response += `• Add items to cart\n`;
    response += `• Choose delivery time\n`;
    response += `• Complete payment\n\n`;
    
    response += `**Phone Ordering:**\n`;
    response += `• Call us directly\n`;
    response += `• Tell us what you need\n`;
    response += `• We'll confirm details\n`;
    response += `• Arrange delivery\n\n`;
    
    response += `**Custom Orders:**\n`;
    response += `• Contact us 2-3 days in advance\n`;
    response += `• Discuss your requirements\n`;
    response += `• Get a quote\n`;
    response += `• Confirm and pay\n\n`;
    
    response += `What would you like to order today?`;
    
    return response;
  }

  // Generate delivery response
  generateDeliveryResponse(entities, context) {
    let response = `Delivery information for ${this.botName}! 🚚\n\n`;
    
    response += `**Delivery Areas:**\n`;
    response += `• Local delivery within city\n`;
    response += `• Same-day delivery available\n`;
    response += `• Scheduled delivery options\n\n`;
    
    response += `**Delivery Time:**\n`;
    response += `• Standard delivery: 2-4 hours\n`;
    response += `• Same-day delivery: 1-2 hours (if ordered before 2 PM)\n`;
    response += `• Custom orders: As per schedule\n\n`;
    
    response += `**Delivery Charges:**\n`;
    response += `• Free delivery for orders above ₹500\n`;
    response += `• ₹50 delivery charge for orders below ₹500\n`;
    response += `• Express delivery: ₹100 extra\n\n`;
    
    response += `**Special Instructions:**\n`;
    response += `• We handle with care\n`;
    response += `• Fresh delivery guaranteed\n`;
    response += `• Contact-free delivery available\n\n`;
    
    response += `Would you like to place an order for delivery?`;
    
    return response;
  }

  // Generate custom response
  generateCustomResponse(entities, context) {
    let response = `Custom orders are our specialty! 🎨\n\n`;
    
    response += `At ${this.botName}, we love creating unique and personalized treats:\n\n`;
    response += `**What we can customize:**\n`;
    response += `• Birthday cakes with photos\n`;
    response += `• Wedding cakes (any design)\n`;
    response += `• Corporate logo cakes\n`;
    response += `• Themed party treats\n`;
    response += `• Special dietary requirements\n\n`;
    
    response += `**Our Process:**\n`;
    response += `1. **Consultation** - Tell us your vision\n`;
    response += `2. **Design** - We create a mockup\n`;
    response += `3. **Confirmation** - You approve the design\n`;
    response += `4. **Preparation** - We make it perfect\n`;
    response += `5. **Delivery** - Fresh to your door\n\n`;
    
    response += `**Timeline:**\n`;
    response += `• 2-3 days advance notice required\n`;
    response += `• Rush orders may be possible (extra charges apply)\n\n`;
    
    response += `What kind of custom order do you have in mind?`;
    
    return response;
  }

  // Generate payment response
  generatePaymentResponse(entities, context) {
    let response = `Payment options at ${this.botName}! 💳\n\n`;
    
    response += `**Accepted Payment Methods:**\n`;
    response += `• Cash on Delivery (COD)\n`;
    response += `• Online Payment (Cards, UPI, Net Banking)\n`;
    response += `• UPI (PhonePe, Google Pay, Paytm)\n`;
    response += `• Credit/Debit Cards\n`;
    response += `• Digital Wallets\n\n`;
    
    response += `**Security:**\n`;
    response += `• All payments are secure and encrypted\n`;
    response += `• We don't store your payment details\n`;
    response += `• SSL certified payment gateway\n\n`;
    
    response += `**Special Offers:**\n`;
    response += `• 5% off on online payments\n`;
    response += `• 10% off on advance payments\n`;
    response += `• Bulk order discounts\n\n`;
    
    response += `Which payment method would you prefer?`;
    
    return response;
  }

  // Generate complaint response
  generateComplaintResponse(sentiment, urgency) {
    let response = `I'm truly sorry to hear about your experience. 😔\n\n`;
    
    if (urgency) {
      response += `This sounds urgent, and I want to help resolve this immediately.\n\n`;
    }
    
    response += `At ${this.botName}, customer satisfaction is our top priority. Here's what we can do:\n\n`;
    response += `**Immediate Actions:**\n`;
    response += `• I'll escalate this to our management team\n`;
    response += `• We'll investigate the issue thoroughly\n`;
    response += `• You'll receive a response within 2 hours\n\n`;
    
    response += `**Resolution Options:**\n`;
    response += `• Full refund or replacement\n`;
    response += `• Special discount on next order\n`;
    response += `• Free delivery on future orders\n\n`;
    
    response += `Please provide your order details, and I'll ensure this is resolved quickly. You can also call us directly for immediate assistance.`;
    
    return response;
  }

  // Generate compliment response
  generateComplimentResponse() {
    const responses = [
      `Thank you so much! 😊 Your kind words mean the world to us at ${this.botName}. We're thrilled that you enjoyed our products!`,
      `Wow, that's wonderful to hear! 🌟 We work hard to make every treat special, and your feedback makes it all worth it!`,
      `Thank you! 🎂 We're so happy you loved our products. Your satisfaction is our greatest reward!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate goodbye response
  generateGoodbyeResponse() {
    const responses = [
      `Thank you for choosing ${this.botName}! 🎂 Have a wonderful day, and we hope to serve you again soon!`,
      `It was a pleasure helping you! 😊 Take care, and don't forget to try our new products!`,
      `Goodbye! 🌟 Thank you for your time. We look forward to your next order!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate general response
  generateGeneralResponse(message, entities, context) {
    // Check if it's a common question
    for (const [question, answer] of Object.entries(this.productKnowledge.commonQuestions)) {
      if (message.toLowerCase().includes(question.toLowerCase().split(' ').slice(0, 3).join(' '))) {
        return answer;
      }
    }
    
    // Generate contextual response
    let response = `I understand you're asking about "${message}". `;
    
    if (entities.products.length > 0) {
      response += `Regarding ${entities.products.join(', ')}, `;
    }
    
    response += `At ${this.botName}, we're here to help with all your cake and sweet needs. `;
    response += `Could you please be more specific about what you'd like to know? `;
    response += `For example, you can ask about:\n`;
    response += `• Our products and menu\n`;
    response += `• Pricing and offers\n`;
    response += `• Custom orders\n`;
    response += `• Delivery information\n`;
    response += `• Payment methods\n\n`;
    response += `How can I assist you better?`;
    
    return response;
  }
}

export default new SKChatbotService();
