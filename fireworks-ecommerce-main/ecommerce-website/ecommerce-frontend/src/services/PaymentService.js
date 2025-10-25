import axios from '../axios';

class PaymentService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000');
    this.merchantConfig = {
      googlePay: {
        merchantId: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || 'SK_BAKERS_001',
        merchantName: 'SK Bakers',
        upiId: process.env.REACT_APP_MERCHANT_UPI_ID || 'skbakers@paytm',
        environment: process.env.REACT_APP_ENVIRONMENT || 'sandbox'
      },
      phonepe: {
        merchantId: process.env.REACT_APP_PHONEPE_MERCHANT_ID || 'SK_BAKERS_001',
        saltKey: process.env.REACT_APP_PHONEPE_SALT_KEY || 'your-salt-key',
        saltIndex: process.env.REACT_APP_PHONEPE_SALT_INDEX || '1',
        environment: process.env.REACT_APP_ENVIRONMENT || 'sandbox'
      },
      paytm: {
        merchantId: process.env.REACT_APP_PAYTM_MERCHANT_ID || 'SK_BAKERS_001',
        merchantKey: process.env.REACT_APP_PAYTM_MERCHANT_KEY || 'your-merchant-key',
        website: process.env.REACT_APP_PAYTM_WEBSITE || 'WEBSTAGING',
        environment: process.env.REACT_APP_ENVIRONMENT || 'sandbox'
      }
    };
  }

  // Generate secure order ID
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `ORDER_${timestamp}_${random}`.toUpperCase();
  }

  // Generate secure transaction ID
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  // Create secure payment hash
  createPaymentHash(data, saltKey) {
    const crypto = require('crypto');
    const hashString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    return crypto.createHash('sha256').update(hashString + saltKey).digest('hex');
  }

  // Google Pay Integration
  async initiateGooglePay(paymentData) {
    try {
      const orderId = this.generateOrderId();
      const transactionId = this.generateTransactionId();
      
      const googlePayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: this.merchantConfig.googlePay.merchantId
            }
          }
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: paymentData.amount.toString(),
          currencyCode: 'INR'
        },
        merchantInfo: {
          merchantId: this.merchantConfig.googlePay.merchantId,
          merchantName: this.merchantConfig.googlePay.merchantName
        }
      };

      // Create payment session on backend
      const response = await axios.post('/api/payment/googlepay/create-session', {
        orderId,
        transactionId,
        amount: paymentData.amount,
        currency: 'INR',
        customerInfo: paymentData.customerInfo,
        shippingAddress: paymentData.shippingAddress,
        googlePayRequest
      });

      if (response.data.success) {
        return {
          success: true,
          orderId,
          transactionId,
          paymentData: response.data.paymentData,
          googlePayRequest
        };
      } else {
        throw new Error(response.data.message || 'Google Pay session creation failed');
      }
    } catch (error) {
      console.error('Google Pay initiation error:', error);
      throw new Error('Google Pay payment initiation failed');
    }
  }

  // PhonePe Integration
  async initiatePhonePe(paymentData) {
    try {
      const orderId = this.generateOrderId();
      const transactionId = this.generateTransactionId();
      
      const phonePeRequest = {
        merchantId: this.merchantConfig.phonepe.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: paymentData.customerInfo.userId || 'USER_' + Date.now(),
        amount: paymentData.amount * 100, // Amount in paise
        redirectUrl: `${window.location.origin}/payment/callback`,
        redirectMode: 'POST',
        callbackUrl: `${this.baseURL}/api/payment/phonepe/callback`,
        mobileNumber: paymentData.customerInfo.phone,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Create hash for PhonePe
      const hash = this.createPaymentHash(phonePeRequest, this.merchantConfig.phonepe.saltKey);
      phonePeRequest.checksum = hash;

      // Create payment session on backend
      const response = await axios.post('/api/payment/phonepe/create-session', {
        orderId,
        transactionId,
        amount: paymentData.amount,
        currency: 'INR',
        customerInfo: paymentData.customerInfo,
        shippingAddress: paymentData.shippingAddress,
        phonePeRequest
      });

      if (response.data.success) {
        return {
          success: true,
          orderId,
          transactionId,
          paymentUrl: response.data.paymentUrl,
          phonePeRequest
        };
      } else {
        throw new Error(response.data.message || 'PhonePe session creation failed');
      }
    } catch (error) {
      console.error('PhonePe initiation error:', error);
      throw new Error('PhonePe payment initiation failed');
    }
  }

  // Paytm Integration
  async initiatePaytm(paymentData) {
    try {
      const orderId = this.generateOrderId();
      const transactionId = this.generateTransactionId();
      
      const paytmRequest = {
        MID: this.merchantConfig.paytm.merchantId,
        ORDER_ID: orderId,
        CUST_ID: paymentData.customerInfo.userId || 'CUST_' + Date.now(),
        INDUSTRY_TYPE_ID: 'Retail',
        CHANNEL_ID: 'WAP',
        TXN_AMOUNT: paymentData.amount.toString(),
        WEBSITE: this.merchantConfig.paytm.website,
        CALLBACK_URL: `${this.baseURL}/api/payment/paytm/callback`,
        EMAIL: paymentData.customerInfo.email,
        MOBILE_NO: paymentData.customerInfo.phone
      };

      // Create checksum for Paytm
      const checksum = this.createPaymentHash(paytmRequest, this.merchantConfig.paytm.merchantKey);
      paytmRequest.CHECKSUMHASH = checksum;

      // Create payment session on backend
      const response = await axios.post('/api/payment/paytm/create-session', {
        orderId,
        transactionId,
        amount: paymentData.amount,
        currency: 'INR',
        customerInfo: paymentData.customerInfo,
        shippingAddress: paymentData.shippingAddress,
        paytmRequest
      });

      if (response.data.success) {
        return {
          success: true,
          orderId,
          transactionId,
          paymentUrl: response.data.paymentUrl,
          paytmRequest
        };
      } else {
        throw new Error(response.data.message || 'Paytm session creation failed');
      }
    } catch (error) {
      console.error('Paytm initiation error:', error);
      throw new Error('Paytm payment initiation failed');
    }
  }

  // UPI Payment Integration
  async initiateUPI(paymentData) {
    try {
      const orderId = this.generateOrderId();
      const transactionId = this.generateTransactionId();
      
      const upiRequest = {
        orderId,
        transactionId,
        amount: paymentData.amount,
        currency: 'INR',
        upiId: this.merchantConfig.googlePay.upiId,
        merchantName: this.merchantConfig.googlePay.merchantName,
        customerInfo: paymentData.customerInfo,
        shippingAddress: paymentData.shippingAddress
      };

      // Create UPI payment string
      const upiString = this.createUPIString(
        paymentData.amount,
        this.merchantConfig.googlePay.upiId,
        this.merchantConfig.googlePay.merchantName,
        orderId
      );

      // Create payment session on backend
      const response = await axios.post('/api/payment/upi/create-session', {
        ...upiRequest,
        upiString
      });

      if (response.data.success) {
        return {
          success: true,
          orderId,
          transactionId,
          upiString,
          qrCode: response.data.qrCode,
          upiRequest
        };
      } else {
        throw new Error(response.data.message || 'UPI session creation failed');
      }
    } catch (error) {
      console.error('UPI initiation error:', error);
      throw new Error('UPI payment initiation failed');
    }
  }

  // Create UPI payment string
  createUPIString(amount, upiId, merchantName, orderId) {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order-' + orderId)}`;
  }

  // Verify payment
  async verifyPayment(orderId, transactionId, paymentMethod) {
    try {
      const response = await axios.post('/api/payment/verify', {
        orderId,
        transactionId,
        paymentMethod
      });

      if (response.data.success) {
        return {
          success: true,
          paymentStatus: response.data.paymentStatus,
          transactionId: response.data.transactionId,
          amount: response.data.amount,
          paymentMethod: response.data.paymentMethod
        };
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Payment verification failed');
    }
  }

  // Get payment status
  async getPaymentStatus(orderId) {
    try {
      const response = await axios.get(`/api/payment/status/${orderId}`);
      
      if (response.data.success) {
        return {
          success: true,
          orderId: response.data.orderId,
          paymentStatus: response.data.paymentStatus,
          transactionId: response.data.transactionId,
          amount: response.data.amount,
          paymentMethod: response.data.paymentMethod,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        };
      } else {
        throw new Error(response.data.message || 'Failed to get payment status');
      }
    } catch (error) {
      console.error('Get payment status error:', error);
      throw new Error('Failed to get payment status');
    }
  }

  // Cancel payment
  async cancelPayment(orderId, reason = 'User cancelled') {
    try {
      const response = await axios.post('/api/payment/cancel', {
        orderId,
        reason
      });

      if (response.data.success) {
        return {
          success: true,
          orderId: response.data.orderId,
          status: response.data.status,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Payment cancellation failed');
      }
    } catch (error) {
      console.error('Payment cancellation error:', error);
      throw new Error('Payment cancellation failed');
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await axios.get('/api/payment/methods');
      
      if (response.data.success) {
        return response.data.paymentMethods;
      } else {
        throw new Error('Failed to get payment methods');
      }
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw new Error('Failed to get payment methods');
    }
  }
}

export default new PaymentService();
