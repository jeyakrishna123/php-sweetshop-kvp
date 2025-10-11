# 🤖 AI Chatbot Setup Guide

## **FREE AI SERVICES CONFIGURATION**

Your FireworksHub e-commerce system now includes a powerful AI chatbot that uses multiple free AI services. Here's how to set them up:

---

## **🔧 ENVIRONMENT VARIABLES**

Add these to your `.env` file:

```bash
# AI Chatbot Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
```

---

## **🆓 FREE AI SERVICES**

### **1. Hugging Face (Recommended - 100% Free)**
- **Free Tier**: 1000 requests/month
- **Setup**:
  1. Go to [huggingface.co](https://huggingface.co)
  2. Create a free account
  3. Go to Settings → Access Tokens
  4. Create a new token
  5. Add to `.env` as `HUGGINGFACE_API_KEY`

### **2. OpenAI (Free Credit)**
- **Free Tier**: $5 credit (expires after 3 months)
- **Setup**:
  1. Go to [platform.openai.com](https://platform.openai.com)
  2. Create an account
  3. Go to API Keys section
  4. Create a new API key
  5. Add to `.env` as `OPENAI_API_KEY`

### **3. Cohere (Free Tier)**
- **Free Tier**: 1000 requests/month
- **Setup**:
  1. Go to [cohere.ai](https://cohere.ai)
  2. Sign up for free
  3. Go to API Keys
  4. Generate a new key
  5. Add to `.env` as `COHERE_API_KEY`

---

## **🚀 FEATURES**

### **✅ What the Chatbot Can Do:**
- **Product Recommendations** - Suggest products based on preferences
- **Order Assistance** - Help with order tracking and status
- **General Inquiries** - Answer questions about the store
- **Payment Help** - Explain payment methods and processes
- **Customer Support** - Provide 24/7 assistance
- **Conversation History** - Remember previous conversations
- **Multiple AI Providers** - Fallback between different AI services

### **🎯 Smart Features:**
- **Context Awareness** - Knows about your products and services
- **User Personalization** - Adapts to logged-in users
- **Quick Questions** - Pre-defined common questions
- **Typing Indicators** - Shows when AI is responding
- **Message History** - Persistent conversation memory
- **Fallback Responses** - Works even without AI services

---

## **📱 HOW TO USE**

### **For Customers:**
1. **Click the floating chat button** (bottom-right corner)
2. **Type your question** or click a quick question
3. **Get instant AI responses** about products, orders, etc.
4. **View conversation history** across sessions

### **For Admins:**
1. **Monitor chatbot usage** via API endpoints
2. **View conversation logs** for customer insights
3. **Customize responses** by modifying the service
4. **Test chatbot** using the test endpoint

---

## **🔗 API ENDPOINTS**

### **Chat with AI:**
```bash
POST /api/chatbot/chat
{
  "message": "What products do you have?",
  "userId": "user123",
  "context": {}
}
```

### **Get Recommendations:**
```bash
POST /api/chatbot/recommendations
{
  "userId": "user123",
  "preferences": {
    "category": "fireworks",
    "priceRange": "100-500"
  }
}
```

### **Get Conversation History:**
```bash
GET /api/chatbot/history/user123
```

### **Test Chatbot:**
```bash
POST /api/chatbot/test
{
  "message": "Hello, I need help"
}
```

### **Get Status:**
```bash
GET /api/chatbot/status
```

---

## **⚡ QUICK START**

### **1. Without API Keys (Fallback Mode):**
The chatbot works immediately with intelligent fallback responses even without any API keys!

### **2. With One API Key:**
Add any one of the free API keys above for enhanced AI responses.

### **3. With Multiple API Keys:**
The system automatically tries different AI services for maximum reliability.

---

## **🎨 CUSTOMIZATION**

### **Modify Responses:**
Edit `backend/services/aiChatbotService.js` to customize:
- System prompts
- Fallback responses
- Context handling
- Response processing

### **UI Customization:**
Edit `frontend/src/components/Chatbot.jsx` to customize:
- Chat interface design
- Quick questions
- Message styling
- Animation effects

---

## **📊 MONITORING**

### **Health Check:**
```bash
GET /api/chatbot/status
```

### **Test Response:**
```bash
POST /api/chatbot/test
```

### **View Logs:**
Check server console for chatbot activity and errors.

---

## **🔒 SECURITY**

- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Sanitizes user messages
- **Context Isolation** - User conversations are separate
- **Error Handling** - Graceful fallbacks on failures

---

## **💡 TIPS**

1. **Start with Hugging Face** - It's completely free and reliable
2. **Test without keys first** - The fallback system works great
3. **Monitor usage** - Keep track of API limits
4. **Customize responses** - Make it match your brand voice
5. **Add more context** - Include product data for better responses

---

**🎉 Your AI Chatbot is now ready to provide 24/7 customer support!**
