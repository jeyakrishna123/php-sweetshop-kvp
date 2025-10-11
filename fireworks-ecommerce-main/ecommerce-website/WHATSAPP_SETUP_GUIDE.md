# WhatsApp Business API Integration Setup Guide

## Overview
This guide will help you set up WhatsApp Business API integration for your Crackers Commerce application.

## Prerequisites
- Meta Developer Account
- WhatsApp Business Account
- Your application running on a public domain (for webhook)
- SSL certificate (HTTPS required)

## Step 1: Meta App Configuration

### 1.1 Get Your App Details
From your Meta App Dashboard (as shown in your screenshot):
- **App ID**: `2345911512473385`
- **App Mode**: Development
- **Verify Token**: `EAAhVmBZAgHykBPcyWtsklDqvbEnDldnxiz4c8JSKBy1i1LlhZArq5HAso7DIEA9ABZBXOw9Ra7EtLtGZBCgEHyDI3BARn3uNwk6KMW205ynOVNZB`

### 1.2 Configure Webhook
1. In your Meta App Dashboard, go to **WhatsApp > Configuration**
2. Set the **Callback URL** to: `https://your-domain.com/api/whatsapp/webhook`
3. Set the **Verify token** to: `EAAhVmBZAgHykBPcyWtsklDqvbEnDldnxiz4c8JSKBy1i1LlhZArq5HAso7DIEA9ABZBXOw9Ra7EtLtGZBCgEHyDI3BARn3uNwk6KMW205ynOVNZB`
4. Click **"Verify and save"**

## Step 2: Environment Configuration

### 2.1 Update .env File
Add these variables to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=EAAhVmBZAgHykBPcyWtsklDqvbEnDldnxiz4c8JSKBy1i1LlhZArq5HAso7DIEA9ABZBXOw9Ra7EtLtGZBCgEHyDI3BARn3uNwk6KMW205ynOVNZB
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/whatsapp/webhook
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 2.2 Get Required Tokens
1. **Access Token**: Get from Meta App Dashboard > WhatsApp > API Setup
2. **Phone Number ID**: Get from Meta App Dashboard > WhatsApp > API Setup
3. **Business Account ID**: Get from Meta App Dashboard > WhatsApp > API Setup

## Step 3: Webhook Endpoints

### 3.1 Available Endpoints
Your application now has these WhatsApp endpoints:

- **GET** `/api/whatsapp/webhook` - Webhook verification
- **POST** `/api/whatsapp/webhook` - Receive messages
- **POST** `/api/whatsapp/send-message` - Send messages
- **GET** `/api/whatsapp/status` - Check webhook status
- **GET** `/api/whatsapp/test` - Test endpoint

### 3.2 Webhook URL Format
```
https://your-domain.com/api/whatsapp/webhook
```

## Step 4: Testing the Integration

### 4.1 Test Webhook Verification
```bash
curl -X GET "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=EAAhVmBZAgHykBPcyWtsklDqvbEnDldnxiz4c8JSKBy1i1LlhZArq5HAso7DIEA9ABZBXOw9Ra7EtLtGZBCgEHyDI3BARn3uNwk6KMW205ynOVNZB&hub.challenge=test_challenge"
```

### 4.2 Test Webhook Status
```bash
curl -X GET "https://your-domain.com/api/whatsapp/status"
```

### 4.3 Test Send Message
```bash
curl -X POST "https://your-domain.com/api/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "message": "Hello from Crackers Commerce!"
  }'
```

## Step 5: Message Handling

### 5.1 Supported Message Types
- **Text messages** - Auto-replies based on keywords
- **Interactive messages** - List and button responses
- **Image messages** - Acknowledgment responses
- **Document messages** - Acknowledgment responses

### 5.2 Auto-Reply Keywords
The system automatically responds to these keywords:
- `hello`, `hi`, `hey` - Welcome message
- `price`, `cost` - Pricing information
- `order`, `buy` - Ordering information
- `delivery`, `shipping` - Delivery information
- `help`, `support` - Support information
- `catalog`, `products`, `list` - Product catalog information

### 5.3 Customizing Responses
Edit the `handleTextMessage` function in `controllers/whatsappController.js` to customize responses.

## Step 6: Production Deployment

### 6.1 Requirements
- **HTTPS**: Required for webhook
- **Public Domain**: Webhook must be accessible from Meta servers
- **SSL Certificate**: Valid SSL certificate required

### 6.2 Domain Setup
1. Deploy your application to a public server
2. Set up SSL certificate
3. Update webhook URL in Meta App Dashboard
4. Test webhook verification

### 6.3 Environment Variables
Make sure all WhatsApp environment variables are set in production:
```env
WHATSAPP_ACCESS_TOKEN=your_production_access_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_WEBHOOK_URL=https://your-production-domain.com/api/whatsapp/webhook
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

## Step 7: Monitoring and Logs

### 7.1 Webhook Logs
Check your application logs for webhook activity:
```bash
# Look for these log messages:
# ✅ WhatsApp webhook verified successfully
# 📱 WhatsApp webhook received
# 📨 Processing X messages
# 📩 New message from ContactName
# 📤 Auto-reply sent
```

### 7.2 Status Monitoring
Use the status endpoint to monitor webhook health:
```bash
curl -X GET "https://your-domain.com/api/whatsapp/status"
```

## Step 8: Troubleshooting

### 8.1 Common Issues

**Webhook Verification Failed**
- Check verify token matches exactly
- Ensure webhook URL is accessible
- Verify HTTPS is working

**Messages Not Received**
- Check webhook URL is correct
- Verify phone number is registered
- Check application logs for errors

**Auto-replies Not Working**
- Check message processing logs
- Verify keyword matching logic
- Test with simple text messages

### 8.2 Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
LOG_LEVEL=debug
```

## Step 9: Advanced Features

### 9.1 Sending Messages
Use the send message endpoint to send messages programmatically:
```javascript
const response = await fetch('https://your-domain.com/api/whatsapp/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '1234567890',
    message: 'Your order has been confirmed!'
  })
});
```

### 9.2 Message Templates
For production, consider using WhatsApp message templates for better deliverability.

### 9.3 Webhook Security
Consider adding webhook signature verification for enhanced security.

## Support

If you encounter issues:
1. Check the application logs
2. Verify all environment variables
3. Test webhook endpoints
4. Check Meta App Dashboard for errors

## Next Steps

1. Set up your production domain
2. Configure SSL certificate
3. Update webhook URL in Meta App Dashboard
4. Test with real WhatsApp messages
5. Customize auto-reply messages
6. Implement advanced features as needed
