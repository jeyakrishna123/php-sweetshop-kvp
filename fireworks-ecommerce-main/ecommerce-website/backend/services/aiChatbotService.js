import axios from 'axios';
import db from '../database.js';

class AIChatbotService {
  constructor() {
    this.conversationHistory = new Map(); // Store conversation history per user
    this.maxHistoryLength = 10; // Keep last 10 messages
  }

  // Free AI Services Configuration
  getFreeAIServices() {
    return {
      // Hugging Face Inference API (Free tier: 1000 requests/month)
      huggingface: {
        url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
          'Content-Type': 'application/json'
        }
      },
      
      // OpenAI API (Free tier: $5 credit)
      openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-demo'}`,
          'Content-Type': 'application/json'
        }
      },
      
      // Cohere API (Free tier: 1000 requests/month)
      cohere: {
        url: 'https://api.cohere.ai/v1/generate',
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY || 'demo'}`,
          'Content-Type': 'application/json'
        }
      },
      
      // Free AI21 API (Free tier: 1000 requests/month)
      ai21: {
        url: 'https://api.ai21.com/studio/v1/j2-ultra/complete',
        headers: {
          'Authorization': `Bearer ${process.env.AI21_API_KEY || 'demo'}`,
          'Content-Type': 'application/json'
        }
      },
      
      // Free Together AI API (Free tier: 1000 requests/month)
      together: {
        url: 'https://api.together.xyz/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY || 'demo'}`,
          'Content-Type': 'application/json'
        }
      },
      
      // Free Groq API (Free tier: 1000 requests/month)
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY || 'demo'}`,
          'Content-Type': 'application/json'
        }
      }
    };
  }

  // Get conversation history for a user
  getConversationHistory(userId) {
    return this.conversationHistory.get(userId) || [];
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
    
    // Keep only last 10 messages
    if (history.length > this.maxHistoryLength) {
      history.splice(0, history.length - this.maxHistoryLength);
    }
  }

  // Generate contextual response based on product data
  async generateContextualResponse(userMessage, conversationHistory) {
    try {
      const lowerMessage = userMessage.toLowerCase();
      
      // Get all products from database
      const products = db.getAllProducts();
      const categories = [...new Set(products.map(p => p.category))];
      
      // Product search queries
      if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('cake') || 
          lowerMessage.includes('dessert') || lowerMessage.includes('bakery') || lowerMessage.includes('buy') ||
          lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        
        // Search for specific products
        const searchTerms = lowerMessage.split(' ').filter(word => 
          word.length > 2 && !['the', 'and', 'for', 'with', 'are', 'you', 'can', 'help', 'me', 'find', 'show', 'get', 'recommend', 'suggest']
            .includes(word.toLowerCase())
        );
        
        if (searchTerms.length > 0) {
          const matchingProducts = products.filter(product => 
            searchTerms.some(term => 
              product.name.toLowerCase().includes(term) || 
              product.category.toLowerCase().includes(term) ||
              product.description.toLowerCase().includes(term)
            )
          );
          
          if (matchingProducts.length > 0) {
            const product = matchingProducts[0];
            const similarProducts = products.filter(p => 
              p.category === product.category && p._id !== product._id
            ).slice(0, 2);
            
            let response = `I found a great match for you! We have "${product.name}" in our ${product.category} category. It's priced at ₹${product.price} and ${product.description}.`;
            
            if (similarProducts.length > 0) {
              response += ` You might also like: ${similarProducts.map(p => `${p.name} (₹${p.price})`).join(', ')}.`;
            }
            
            response += ` Would you like to know more about any of these products?`;
            return response;
          }
        }
        
        // Show available categories with product counts
        const categoryInfo = categories.map(cat => {
          const count = products.filter(p => p.category === cat).length;
          return `${cat} (${count} items)`;
        }).join(', ');
        
        return `We have amazing bakery products in these categories: ${categoryInfo}. What type of product are you looking for? I can help you find the perfect item!`;
      }
      
      // Price queries
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
        const priceRanges = {
          'budget': products.filter(p => p.price < 200),
          'mid-range': products.filter(p => p.price >= 200 && p.price < 500),
          'premium': products.filter(p => p.price >= 500)
        };
        
        if (lowerMessage.includes('cheap') || lowerMessage.includes('budget')) {
          const budgetProducts = priceRanges.budget.slice(0, 3);
          return `For budget-friendly options, we have: ${budgetProducts.map(p => `${p.name} (₹${p.price})`).join(', ')}. All under ₹200!`;
        } else if (lowerMessage.includes('expensive') || lowerMessage.includes('premium')) {
          const premiumProducts = priceRanges.premium.slice(0, 3);
          return `Our premium collection includes: ${premiumProducts.map(p => `${p.name} (₹${p.price})`).join(', ')}. Perfect for special occasions!`;
        } else {
          return `Our products range from ₹${Math.min(...products.map(p => p.price))} to ₹${Math.max(...products.map(p => p.price))}. We have options for every budget! What price range are you looking for?`;
        }
      }
      
      // Category-specific queries
      for (const category of categories) {
        if (lowerMessage.includes(category.toLowerCase())) {
          const categoryProducts = products.filter(p => p.category === category);
          const featuredProducts = categoryProducts.slice(0, 3);
          return `Great choice! Our ${category} collection includes: ${featuredProducts.map(p => `${p.name} (₹${p.price})`).join(', ')}. We have ${categoryProducts.length} items in this category. Would you like to see more details about any specific product?`;
        }
      }
      
      // Order-related queries
      if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('status')) {
        // Try to extract order ID from message
        const orderIdMatch = userMessage.match(/(?:order|tracking|order\s*#?)\s*([A-Z0-9]+)/i);
        if (orderIdMatch) {
          const orderId = orderIdMatch[1];
          const order = db.findOrderById(orderId);
          if (order) {
            return `I found your order! Order #${orderId.slice(-8)} is currently ${order.status}. Total amount: ₹${order.totalPrice}. Would you like more details about your order items?`;
          } else {
            return `I couldn't find an order with ID ${orderId}. Please check the order number and try again, or contact our support team for assistance.`;
          }
        }
        return `I can help you with order-related questions! You can track your orders, check order status, or get help with any order issues. Do you have an order number or would you like to know about our ordering process?`;
      }
      
      // Delivery queries
      if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('when') || lowerMessage.includes('time')) {
        return `We offer fast and reliable delivery! Our standard delivery time is 2-3 business days. For urgent orders, we also have express delivery options. Would you like to know more about our delivery policies?`;
      }
      
      // Special occasion queries
      if (lowerMessage.includes('birthday') || lowerMessage.includes('wedding') || lowerMessage.includes('anniversary') || 
          lowerMessage.includes('party') || lowerMessage.includes('celebration') || lowerMessage.includes('special')) {
        const occasionProducts = {
          'birthday': products.filter(p => p.category === 'Cakes' || p.name.toLowerCase().includes('birthday')),
          'wedding': products.filter(p => p.category === 'Cakes' || p.name.toLowerCase().includes('wedding')),
          'anniversary': products.filter(p => p.category === 'Cakes' || p.category === 'Desserts'),
          'party': products.filter(p => p.category === 'Desserts' || p.category === 'Snacks')
        };
        
        for (const [occasion, occasionProds] of Object.entries(occasionProducts)) {
          if (lowerMessage.includes(occasion)) {
            const featured = occasionProds.slice(0, 3);
            return `Perfect for a ${occasion}! I recommend: ${featured.map(p => `${p.name} (₹${p.price})`).join(', ')}. These are our most popular items for ${occasion} celebrations. Would you like to know more about any of these?`;
          }
        }
        
        return `We have special products for every occasion! Whether it's a birthday, wedding, anniversary, or any celebration, I can help you find the perfect treat. What kind of special event are you planning?`;
      }
      
      // Contact/support queries
      if (lowerMessage.includes('contact') || lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('phone')) {
        return `I'm here to help! You can reach our support team at upgradenowtechnologies@gmail.com or call us for immediate assistance. Is there something specific I can help you with regarding our products or services?`;
      }
      
      return null; // No contextual response found
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return null;
    }
  }

  // Generate response using free AI services
  async generateResponse(userMessage, userId, context = {}) {
    try {
      // Add user message to history
      this.addToHistory(userId, userMessage, true);

      // Get conversation history
      const history = this.getConversationHistory(userId);

      // Add conversation context for better responses
      context.conversationLength = history.length;
      context.isNewConversation = history.length <= 2;
      
      // First try contextual response based on product data
      const contextualResponse = await this.generateContextualResponse(userMessage, history);
      if (contextualResponse) {
        this.addToHistory(userId, contextualResponse, false);
        return contextualResponse;
      }
      context.recentTopics = this.extractRecentTopics(history);

      // Try different AI services in order of preference
      let response = null;
      
      // Try all free AI services in parallel for better performance
      const aiPromises = [
        this.tryHuggingFace(userMessage, history, context),
        this.tryOpenAI(userMessage, history, context),
        this.tryCohere(userMessage, history, context),
        this.tryAI21(userMessage, history, context),
        this.tryTogether(userMessage, history, context),
        this.tryGroq(userMessage, history, context)
      ];
      
      // Wait for the first successful response
      const results = await Promise.allSettled(aiPromises);
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          response = result.value;
          break;
        }
      }
      
      // If no AI service worked, use intelligent fallback
      if (!response) {
        response = await this.getIntelligentFallback(userMessage, context);
      }

      // Add AI response to history
      this.addToHistory(userId, response, false);

      return {
        success: true,
        response,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('AI Chatbot Error:', error);
      return {
        success: false,
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        error: error.message
      };
    }
  }

  // Extract recent conversation topics for context
  extractRecentTopics(history) {
    const recentMessages = history.slice(-6); // Last 6 messages
    const topics = [];
    
    recentMessages.forEach(msg => {
      const text = msg.message.toLowerCase();
      if (text.includes('product') || text.includes('firework')) topics.push('products');
      if (text.includes('order') || text.includes('track')) topics.push('orders');
      if (text.includes('payment') || text.includes('pay')) topics.push('payments');
      if (text.includes('price') || text.includes('cost')) topics.push('pricing');
      if (text.includes('safe') || text.includes('safety')) topics.push('safety');
    });
    
    return [...new Set(topics)]; // Remove duplicates
  }

  // Try Hugging Face API (Free)
  async tryHuggingFace(userMessage, history, context) {
    try {
      const services = this.getFreeAIServices();
      const payload = {
        inputs: {
          past_user_inputs: history.filter(h => h.isUser).slice(-3).map(h => h.message),
          generated_responses: history.filter(h => !h.isUser).slice(-3).map(h => h.message),
          text: userMessage
        }
      };

      const response = await axios.post(services.huggingface.url, payload, {
        headers: services.huggingface.headers,
        timeout: 10000
      });

      if (response.data && response.data.generated_text) {
        return this.processAIResponse(response.data.generated_text, context);
      }
    } catch (error) {
      console.log('Hugging Face API failed:', error.message);
    }
    return null;
  }

  // Try OpenAI API (Free tier)
  async tryOpenAI(userMessage, history, context) {
    try {
      const services = this.getFreeAIServices();
      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt(context)
        },
        ...history.slice(-6).map(h => ({
          role: h.isUser ? "user" : "assistant",
          content: h.message
        })),
        {
          role: "user",
          content: userMessage
        }
      ];

      const payload = {
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 150,
        temperature: 0.7
      };

      const response = await axios.post(services.openai.url, payload, {
        headers: services.openai.headers,
        timeout: 10000
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return this.processAIResponse(response.data.choices[0].message.content, context);
      }
    } catch (error) {
      console.log('OpenAI API failed:', error.message);
    }
    return null;
  }

  // Try Cohere API (Free tier)
  async tryCohere(userMessage, history, context) {
    try {
      const services = this.getFreeAIServices();
      const conversationContext = history.slice(-4).map(h => 
        h.isUser ? `Human: ${h.message}` : `Assistant: ${h.message}`
      ).join('\n');

      const prompt = `${this.getSystemPrompt(context)}\n\n${conversationContext}\nHuman: ${userMessage}\nAssistant:`;

      const payload = {
        model: "command",
        prompt,
        max_tokens: 150,
        temperature: 0.7,
        stop_sequences: ["Human:"]
      };

      const response = await axios.post(services.cohere.url, payload, {
        headers: services.cohere.headers,
        timeout: 10000
      });

      if (response.data && response.data.generations && response.data.generations[0]) {
        return this.processAIResponse(response.data.generations[0].text, context);
      }
    } catch (error) {
      console.log('Cohere API failed:', error.message);
    }
    return null;
  }

  // Try AI21 API (Free tier)
  async tryAI21(userMessage, history, context) {
    try {
      const services = this.getFreeAIServices();
      const conversationContext = history.slice(-4).map(h => 
        h.isUser ? `Human: ${h.message}` : `Assistant: ${h.message}`
      ).join('\n');

      const prompt = `${this.getSystemPrompt(context)}\n\n${conversationContext}\nHuman: ${userMessage}\nAssistant:`;

      const payload = {
        model: "j2-ultra",
        prompt,
        maxTokens: 150,
        temperature: 0.7,
        stopSequences: ["Human:"]
      };

      const response = await axios.post(services.ai21.url, payload, {
        headers: services.ai21.headers,
        timeout: 10000
      });

      if (response.data && response.data.completions && response.data.completions[0]) {
        return this.processAIResponse(response.data.completions[0].data.text, context);
      }
    } catch (error) {
      console.log('AI21 API failed:', error.message);
    }
    return null;
  }

  // Try Together AI API (Free tier)
  async tryTogether(userMessage, history, context) {
    try {
      const services = this.getFreeAIServices();
      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt(context)
        },
        ...history.slice(-6).map(h => ({
          role: h.isUser ? "user" : "assistant",
          content: h.message
        })),
        {
          role: "user",
          content: userMessage
        }
      ];

      const payload = {
        model: "meta-llama/Llama-2-7b-chat-hf",
        messages,
        max_tokens: 150,
        temperature: 0.7
      };

      const response = await axios.post(services.together.url, payload, {
        headers: services.together.headers,
        timeout: 10000
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return this.processAIResponse(response.data.choices[0].message.content, context);
      }
    } catch (error) {
      console.log('Together AI API failed:', error.message);
    }
    return null;
  }

  // Try Groq API (Free tier)
  async tryGroq(userMessage, history, context) {
    try {
      const services = this.getFreeAIServices();
      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt(context)
        },
        ...history.slice(-6).map(h => ({
          role: h.isUser ? "user" : "assistant",
          content: h.message
        })),
        {
          role: "user",
          content: userMessage
        }
      ];

      const payload = {
        model: "llama2-7b-4096",
        messages,
        max_tokens: 150,
        temperature: 0.7
      };

      const response = await axios.post(services.groq.url, payload, {
        headers: services.groq.headers,
        timeout: 10000
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return this.processAIResponse(response.data.choices[0].message.content, context);
      }
    } catch (error) {
      console.log('Groq API failed:', error.message);
    }
    return null;
  }

  // Intelligent fallback using simple AI logic
  async getIntelligentFallback(userMessage, context) {
    // Try to use a simple AI model or generate intelligent responses
    try {
      // Use a simple AI model for fallback
      const response = await this.trySimpleAI(userMessage, context);
      if (response) return response;
    } catch (error) {
      console.log('Simple AI fallback failed:', error.message);
    }
    
    // If all else fails, use the old fallback system
    return this.getFallbackResponse(userMessage, context);
  }

  // Simple AI fallback using basic pattern matching and generation
  async trySimpleAI(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();
    const conversationHistory = this.getConversationHistory(context.userId || 'anonymous');
    
    // Generate context-aware responses using simple AI logic
    const responses = this.generateContextualResponses(userMessage, context, conversationHistory);
    return this.getVariedResponse(responses, conversationHistory);
  }

  // Generate contextual responses using AI-like logic
  generateContextualResponses(userMessage, context, history) {
    const lowerMessage = userMessage.toLowerCase();
    const responses = [];
    
    // Analyze user intent and generate appropriate responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      responses.push(
        "Hello! Welcome to Sweet Dreams Bakery! I'm your AI assistant, excited to help you find amazing cakes for your celebration!",
        "Hi there! Great to see you at Sweet Dreams Bakery! I'm here to make your shopping experience fantastic. What can I help you with today?",
        "Hey! Welcome to our bakery paradise! I'm thrilled to help you discover our amazing collection. What brings you here?",
        "Greetings! I'm your personal shopping assistant at Sweet Dreams Bakery. Ready to help you find the perfect cake!",
        "Hello! Thanks for visiting Sweet Dreams Bakery! I'm here to assist with products, orders, or any questions you might have!"
      );
    } else if (lowerMessage.includes('product') || lowerMessage.includes('cake') || lowerMessage.includes('buy')) {
      responses.push(
        "I'd love to help you find the perfect cake! We have an incredible selection of birthday cakes, wedding cakes, and celebration treats. What type of event are you planning?",
        "Our catalog features amazing cakes for every occasion! From birthday parties to wedding celebrations, we've got you covered. What's your favorite flavor?",
        "Looking for something special? We have professional-grade cakes, family-friendly options, and everything in between. Tell me more about what you're looking for!",
        "Great choice to shop with us! Our cakes are carefully crafted for quality and taste. Are you interested in custom designs, traditional flavors, or something else?",
        "I can help you discover our amazing product range! We have everything from cupcakes to grand celebration cakes. What kind of celebration are you planning?"
      );
    } else if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('delivery')) {
      responses.push(
        "I can help you with your order! You can track your order status in your account dashboard, or I can assist you with specific order details. What would you like to know?",
        "For order tracking, you'll find all the details in your order history. We also send email updates at each stage of processing. Is there a specific order you're concerned about?",
        "Our delivery team works hard to get your cakes to you safely and on time! You can check your order status anytime in your account. Need help finding a particular order?",
        "Order updates are sent via email, and you can also track progress in your account. We typically process orders within 1-2 business days. What's your order number?",
        "I'm here to help with any order questions! Whether it's tracking, delivery times, or order modifications, just let me know what you need assistance with."
      );
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('money')) {
      responses.push(
        "We offer flexible payment options to make your purchase convenient! You can pay with credit/debit cards, UPI, or choose Cash on Delivery. What works best for you?",
        "Payment is secure and easy with us! We accept all major credit cards, digital wallets, UPI, and even COD for your convenience. Which payment method do you prefer?",
        "Your payment security is our priority! We use encrypted payment processing and accept multiple methods including Stripe, Razorpay, and UPI. Need help with a specific payment issue?",
        "We've got you covered with multiple payment options! From online banking to digital wallets and cash on delivery, choose what's most convenient for you.",
        "Payment processing is quick and secure! All transactions are protected, and we support various payment methods. Is there a particular payment method you'd like to know more about?"
      );
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('safety') || lowerMessage.includes('danger')) {
      responses.push(
        "Safety is our top priority! All our fireworks meet strict safety standards and come with detailed instructions. We also provide safety tips and guidelines for responsible use.",
        "Absolutely! We only sell certified, safe fireworks with proper safety instructions. Our team ensures every product meets the highest safety standards before it reaches you.",
        "Your safety matters most to us! All our fireworks are tested and certified, with clear safety guidelines included. We're committed to providing safe, quality products.",
        "Safety first, always! Our fireworks are carefully selected for quality and safety, with detailed usage instructions. We also offer safety accessories and guidance.",
        "We take safety seriously! Every firework we sell is certified and comes with proper safety instructions. Your well-being is our primary concern."
      );
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
      responses.push(
        "Our prices are competitive and we offer great value! We have options for every budget, from affordable sparklers to premium display packages. What's your price range?",
        "We believe in fair pricing for quality fireworks! Check out our current deals and promotions. We also offer bulk discounts for larger orders. Interested in any specific products?",
        "Great question about pricing! We have something for every budget, and our prices reflect the quality and safety of our products. Would you like to see our current offers?",
        "Our pricing is designed to give you the best value! We regularly have sales and special offers. What type of fireworks are you interested in?",
        "We offer competitive prices with regular discounts and promotions! Our products range from budget-friendly to premium options. What's your budget range?"
      );
    } else {
      responses.push(
        "That's interesting! I'm here to help with anything related to our fireworks, orders, or services. Could you tell me more about what you're looking for?",
        "I'd love to assist you! Whether it's about our products, your orders, or general questions, I'm ready to help. What would you like to know?",
        "Thanks for reaching out! I'm your AI assistant and I can help with product recommendations, order support, or answer questions about SK Bakers. How can I help?",
        "I'm here and ready to help! From finding the perfect fireworks to order assistance, I can support you with various aspects of your shopping experience.",
        "Great to hear from you! I'm your personal assistant and I'm excited to help with any questions about our products, services, or anything else you need!"
      );
    }
    
    return responses;
  }

  // Enhanced fallback response with varied responses (old system as backup)
  getFallbackResponse(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();
    const conversationHistory = this.getConversationHistory(context.userId || 'anonymous');
    
    // Use the context from the generateResponse method
    const userId = context.userId || 'anonymous';
    
    // Product-related queries with variations
    if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('buy') || lowerMessage.includes('cake') || lowerMessage.includes('dessert')) {
      const productResponses = [
        "I'd be happy to help you find the perfect bakery treat! We have a fantastic selection of cakes, desserts, and confectionery items. What type of occasion are you planning?",
        "Our catalog features amazing bakery products for every occasion! From birthday cakes to wedding desserts, we've got you covered. What's your favorite type of treat?",
        "Looking for something special? We have premium cakes, artisanal desserts, and everything in between. Tell me more about what you're looking for!",
        "Great choice to shop with us! Our bakery products are carefully crafted for quality and taste. Are you interested in cakes, desserts, or something else?",
        "I can help you discover our amazing product range! We have everything from small treats to grand celebration cakes. What kind of special event are you planning?"
      ];
      return this.getVariedResponse(productResponses, conversationHistory);
    }
    
    // Order-related queries with variations
    if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      const orderResponses = [
        "I can help you with your order! You can track your order status in your account dashboard, or I can assist you with specific order details. What would you like to know?",
        "For order tracking, you'll find all the details in your order history. We also send email updates at each stage of processing. Is there a specific order you're concerned about?",
        "Our delivery team works hard to get your cakes to you safely and on time! You can check your order status anytime in your account. Need help finding a particular order?",
        "Order updates are sent via email, and you can also track progress in your account. We typically process orders within 1-2 business days. What's your order number?",
        "I'm here to help with any order questions! Whether it's tracking, delivery times, or order modifications, just let me know what you need assistance with."
      ];
      return this.getVariedResponse(orderResponses, conversationHistory);
    }
    
    // Payment queries with variations
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('money') || lowerMessage.includes('card')) {
      const paymentResponses = [
        "We offer flexible payment options to make your purchase convenient! You can pay with credit/debit cards, UPI, or choose Cash on Delivery. What works best for you?",
        "Payment is secure and easy with us! We accept all major credit cards, digital wallets, UPI, and even COD for your convenience. Which payment method do you prefer?",
        "Your payment security is our priority! We use encrypted payment processing and accept multiple methods including Stripe, Razorpay, and UPI. Need help with a specific payment issue?",
        "We've got you covered with multiple payment options! From online banking to digital wallets and cash on delivery, choose what's most convenient for you.",
        "Payment processing is quick and secure! All transactions are protected, and we support various payment methods. Is there a particular payment method you'd like to know more about?"
      ];
      return this.getVariedResponse(paymentResponses, conversationHistory);
    }
    
    // General greeting with variations
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
      const greetingResponses = [
        "Hello there! Welcome to SK Bakers! I'm your AI assistant, ready to help you find amazing bakery products and answer any questions. What can I do for you today?",
        "Hi! Great to see you at SK Bakers! I'm here to make your shopping experience fantastic. Whether you need product recommendations or have questions, I'm ready to help!",
        "Hey! Welcome to our bakery paradise! I'm excited to help you discover our amazing collection. What brings you here today?",
        "Greetings! I'm your personal shopping assistant at SK Bakers. From cakes to delicious treats, I can help you find exactly what you need!",
        "Hello! Thanks for visiting SK Bakers! I'm here to assist with products, orders, or any questions you might have. How can I make your day sweeter?"
      ];
      return this.getVariedResponse(greetingResponses, conversationHistory);
    }
    
    // Help queries with variations
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
      const helpResponses = [
        "I'm absolutely here to help! I can assist with product recommendations, order tracking, payment questions, or anything else about our fireworks. What do you need?",
        "Of course! I'm your go-to assistant for all things FireworksHub. Whether it's finding the perfect product or solving an issue, I'm ready to help!",
        "I'm delighted to assist you! From browsing our catalog to order management, I can help with various aspects of your shopping experience. What's on your mind?",
        "Absolutely! I'm here to make your experience smooth and enjoyable. I can help with products, orders, payments, or any other questions you have.",
        "I'm your personal assistant and I love helping! Whether you need product advice, order support, or have general questions, I'm here for you. What can I do?"
      ];
      return this.getVariedResponse(helpResponses, conversationHistory);
    }
    
    // Price-related queries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap') || lowerMessage.includes('discount')) {
      const priceResponses = [
        "Our prices are competitive and we offer great value! We have options for every budget, from affordable sparklers to premium display packages. What's your price range?",
        "We believe in fair pricing for quality fireworks! Check out our current deals and promotions. We also offer bulk discounts for larger orders. Interested in any specific products?",
        "Great question about pricing! We have something for every budget, and our prices reflect the quality and safety of our products. Would you like to see our current offers?",
        "Our pricing is designed to give you the best value! We regularly have sales and special offers. What type of fireworks are you interested in?",
        "We offer competitive prices with regular discounts and promotions! Our products range from budget-friendly to premium options. What's your budget range?"
      ];
      return this.getVariedResponse(priceResponses, conversationHistory);
    }
    
    // Safety-related queries
    if (lowerMessage.includes('safe') || lowerMessage.includes('safety') || lowerMessage.includes('danger') || lowerMessage.includes('risk')) {
      const safetyResponses = [
        "Safety is our top priority! All our fireworks meet strict safety standards and come with detailed instructions. We also provide safety tips and guidelines for responsible use.",
        "Absolutely! We only sell certified, safe fireworks with proper safety instructions. Our team ensures every product meets the highest safety standards before it reaches you.",
        "Your safety matters most to us! All our fireworks are tested and certified, with clear safety guidelines included. We're committed to providing safe, quality products.",
        "Safety first, always! Our fireworks are carefully selected for quality and safety, with detailed usage instructions. We also offer safety accessories and guidance.",
        "We take safety seriously! Every firework we sell is certified and comes with proper safety instructions. Your well-being is our primary concern."
      ];
      return this.getVariedResponse(safetyResponses, conversationHistory);
    }
    
    // Default responses with variations
    const defaultResponses = [
      "That's interesting! I'm here to help with anything related to our fireworks, orders, or services. Could you tell me more about what you're looking for?",
      "I'd love to assist you! Whether it's about our products, your orders, or general questions, I'm ready to help. What would you like to know?",
      "Thanks for reaching out! I'm your AI assistant and I can help with product recommendations, order support, or answer questions about FireworksHub. How can I help?",
      "I'm here and ready to help! From finding the perfect fireworks to order assistance, I can support you with various aspects of your shopping experience.",
      "Great to hear from you! I'm your personal assistant and I'm excited to help with any questions about our products, services, or anything else you need!"
    ];
    return this.getVariedResponse(defaultResponses, conversationHistory);
  }

  // Get varied response to avoid repetition
  getVariedResponse(responses, conversationHistory) {
    // If no history, return random response
    if (!conversationHistory || conversationHistory.length === 0) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Get recent responses to avoid repetition
    const recentResponses = conversationHistory
      .filter(msg => !msg.isUser)
      .slice(-3) // Last 3 AI responses
      .map(msg => msg.message);
    
    // Find responses that haven't been used recently
    const availableResponses = responses.filter(response => 
      !recentResponses.some(recent => 
        this.calculateSimilarity(response, recent) > 0.7
      )
    );
    
    // If all responses are too similar to recent ones, return a random one
    if (availableResponses.length === 0) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Return a random response from available ones
    return availableResponses[Math.floor(Math.random() * availableResponses.length)];
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }

  // Get system prompt for AI
  getSystemPrompt(context) {
    const products = db.getAllProducts();
    const categories = [...new Set(products.map(p => p.category))];
    const priceRange = `₹${Math.min(...products.map(p => p.price))} - ₹${Math.max(...products.map(p => p.price))}`;
    
    return `You are a helpful, enthusiastic customer service assistant for SK Bakers, a premium bakery and confectionery store. 

Key information about our store:
- We sell high-quality bakery products, cakes, desserts, and confectionery items
- We offer multiple payment methods (Stripe, Razorpay, UPI, COD)
- We provide fast and secure delivery nationwide
- We have ${products.length} products across ${categories.length} categories: ${categories.join(', ')}
- Price range: ${priceRange}
- We offer 24/7 customer support and order tracking
- We specialize in birthday cakes, wedding cakes, anniversary treats, and special occasions

Guidelines:
- Be friendly, enthusiastic, and professional
- Vary your responses - never give the same answer twice
- Keep responses concise but engaging (under 100 words)
- Focus on helping customers with products, orders, and general inquiries
- Use different greetings and conversation starters
- Ask follow-up questions to engage customers
- If you don't know something, suggest contacting support
- Always be positive, encouraging, and helpful
- Use emojis occasionally to make responses more engaging
- Adapt your tone based on the customer's mood and needs

Response Style:
- Use varied vocabulary and sentence structures
- Include different product suggestions and recommendations
- Offer multiple solutions when possible
- Be conversational and natural
- Avoid repetitive phrases or responses

Current context: ${JSON.stringify(context)}`;
  }

  // Process AI response with variety enhancements
  processAIResponse(response, context) {
    // Clean up the response
    let cleanedResponse = response.trim();
    
    // Remove any unwanted prefixes
    cleanedResponse = cleanedResponse.replace(/^(Assistant:|AI:|Bot:)/i, '').trim();
    
    // Add context-specific information with variety
    if (context.products && context.products.length > 0) {
      const productCount = context.products.length;
      const productAdditions = [
        `\n\nBy the way, we currently have ${productCount} amazing products in our catalog!`,
        `\n\nFun fact: We have ${productCount} fantastic fireworks available for you to explore!`,
        `\n\nJust so you know, our catalog features ${productCount} carefully selected products!`,
        `\n\nWe're proud to offer ${productCount} high-quality fireworks in our collection!`,
        `\n\nOur inventory includes ${productCount} fantastic products ready for your celebration!`
      ];
      
      // Only add product info occasionally to avoid repetition
      if (Math.random() < 0.3) { // 30% chance
        cleanedResponse += productAdditions[Math.floor(Math.random() * productAdditions.length)];
      }
    }
    
    // Add occasional emojis for engagement (20% chance)
    if (Math.random() < 0.2) {
      const emojis = ['🎆', '✨', '🎇', '🎊', '🎉', '💫', '🌟'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      cleanedResponse = cleanedResponse.replace(/\.$/, ` ${randomEmoji}`);
    }
    
    return cleanedResponse;
  }

  // Get product recommendations
  async getProductRecommendations(userId, preferences = {}) {
    try {
      const products = db.getAllProducts();
      const activeProducts = products.filter(p => p.isActive);
      
      // Simple recommendation logic
      let recommendations = activeProducts.slice(0, 5);
      
      if (preferences.category) {
        recommendations = activeProducts.filter(p => 
          p.category && p.category.toLowerCase().includes(preferences.category.toLowerCase())
        ).slice(0, 5);
      }
      
      if (preferences.priceRange) {
        const [min, max] = preferences.priceRange.split('-').map(Number);
        recommendations = recommendations.filter(p => p.price >= min && p.price <= max);
      }
      
      return {
        success: true,
        recommendations: recommendations.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] || '/placeholder.jpg',
          description: p.description?.substring(0, 100) + '...'
        }))
      };
    } catch (error) {
      console.error('Product recommendation error:', error);
      return {
        success: false,
        recommendations: []
      };
    }
  }

  // Clear conversation history
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
    return { success: true, message: 'Conversation history cleared' };
  }
}

export default new AIChatbotService();
