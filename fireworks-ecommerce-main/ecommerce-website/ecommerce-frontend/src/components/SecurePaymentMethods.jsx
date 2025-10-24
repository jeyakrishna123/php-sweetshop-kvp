import React, { useState, useEffect } from 'react';
import PaymentService from '../services/PaymentService';
import QRCode from 'qrcode';

const SecurePaymentMethods = ({ 
  cartItems, 
  totalAmount, 
  shippingAddress, 
  customerInfo,
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [selectedMethod, setSelectedMethod] = useState('googlepay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Enhanced payment methods with real integrations
  const availableMethods = [
    {
      id: 'googlepay',
      name: 'Google Pay',
      icon: '💳',
      description: 'Pay securely with Google Pay',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      activeColor: 'border-blue-500 bg-blue-100',
      enabled: true,
      security: 'Bank-level encryption'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      description: 'Pay with PhonePe wallet',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      activeColor: 'border-purple-500 bg-purple-100',
      enabled: true,
      security: 'PCI DSS compliant'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      icon: '💰',
      description: 'Pay with Paytm wallet',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      activeColor: 'border-blue-500 bg-blue-100',
      enabled: true,
      security: 'RBI approved'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: '🏦',
      description: 'Pay with any UPI app',
      color: 'bg-green-50 border-green-200 text-green-700',
      activeColor: 'border-green-500 bg-green-100',
      enabled: true,
      security: 'NPCI certified'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when delivered',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      activeColor: 'border-orange-500 bg-orange-100',
      enabled: true,
      security: 'No online payment'
    }
  ];

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await PaymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods');
    }
  };

  // Generate QR Code for UPI payments
  const generateQRCode = async (upiString) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(upiString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrCodeDataURL);
      setShowQRCode(true);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      setError('Failed to generate QR code');
    }
  };

  // Handle payment initiation
  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData = {
        amount: totalAmount,
        currency: 'INR',
        customerInfo,
        shippingAddress,
        cartItems
      };

      let result;

      switch (selectedMethod) {
        case 'googlepay':
          result = await PaymentService.initiateGooglePay(paymentData);
          break;
        case 'phonepe':
          result = await PaymentService.initiatePhonePe(paymentData);
          break;
        case 'paytm':
          result = await PaymentService.initiatePaytm(paymentData);
          break;
        case 'upi':
          result = await PaymentService.initiateUPI(paymentData);
          break;
        case 'cod':
          result = await handleCOD(paymentData);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (result.success) {
        setPaymentSession(result);
        
        // Handle different payment flows
        if (selectedMethod === 'googlepay') {
          await handleGooglePayFlow(result);
        } else if (selectedMethod === 'phonepe') {
          await handlePhonePeFlow(result);
        } else if (selectedMethod === 'paytm') {
          await handlePaytmFlow(result);
        } else if (selectedMethod === 'upi') {
          await handleUPIFlow(result);
        } else if (selectedMethod === 'cod') {
          onPaymentSuccess(result);
        }
      } else {
        throw new Error('Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Google Pay Flow
  const handleGooglePayFlow = async (result) => {
    try {
      // Initialize Google Pay
      if (window.google && window.google.payments) {
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: process.env.REACT_APP_ENVIRONMENT === 'production' ? 'PRODUCTION' : 'TEST'
        });

        const paymentDataRequest = result.googlePayRequest;
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        
        // Verify payment with backend
        const verification = await PaymentService.verifyPayment(
          result.orderId,
          result.transactionId,
          'googlepay'
        );

        if (verification.success) {
          onPaymentSuccess(verification);
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        throw new Error('Google Pay not available');
      }
    } catch (error) {
      console.error('Google Pay flow error:', error);
      setError('Google Pay payment failed');
    }
  };

  // PhonePe Flow
  const handlePhonePeFlow = async (result) => {
    try {
      // Redirect to PhonePe payment page
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('PhonePe flow error:', error);
      setError('PhonePe payment failed');
    }
  };

  // Paytm Flow
  const handlePaytmFlow = async (result) => {
    try {
      // Redirect to Paytm payment page
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Paytm flow error:', error);
      setError('Paytm payment failed');
    }
  };

  // UPI Flow
  const handleUPIFlow = async (result) => {
    try {
      // Generate QR Code
      await generateQRCode(result.upiString);
    } catch (error) {
      console.error('UPI flow error:', error);
      setError('UPI payment setup failed');
    }
  };

  // Cash on Delivery
  const handleCOD = async (paymentData) => {
    try {
      // Create order directly for COD
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderItems: cartItems,
          shippingAddress,
          paymentMethod: 'cod',
          totalPrice: totalAmount,
          customerInfo
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          orderId: result.orderId,
          paymentStatus: 'confirmed',
          message: 'Order placed successfully'
        };
      } else {
        throw new Error(result.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('COD error:', error);
      throw new Error('Cash on Delivery order failed');
    }
  };

  // Verify payment
  const verifyPayment = async () => {
    if (!paymentSession) {
      setError('No payment session found');
      return;
    }

    setLoading(true);
    try {
      const verification = await PaymentService.verifyPayment(
        paymentSession.orderId,
        paymentSession.transactionId,
        selectedMethod
      );

      if (verification.success) {
        onPaymentSuccess(verification);
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      setError('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Close QR Code modal
  const closeQRCode = () => {
    setShowQRCode(false);
    setQrCode('');
    setPaymentSession(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-xl">🔒</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
            <p className="text-gray-600">Choose your preferred payment method</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {availableMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedMethod === method.id
                  ? `${method.activeColor} shadow-md`
                  : `${method.color} hover:shadow-sm`
              } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                disabled={!method.enabled}
                className="sr-only"
              />
              <div className="flex items-center w-full">
                <div className="text-3xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{method.name}</div>
                  <div className="text-sm opacity-75">{method.description}</div>
                  <div className="text-xs text-green-600 mt-1">🔒 {method.security}</div>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {selectedMethod === 'cod' ? 'Pay when delivered' : 'Secure online payment'}
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="text-green-600 mr-2">🛡️</span>
            <span className="font-semibold text-green-800">Security Features</span>
          </div>
          <div className="text-sm text-green-700">
            • Bank-level encryption • PCI DSS compliant • RBI approved • Secure tokenization
          </div>
        </div>

        {/* Pay Now Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !selectedMethod}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">💳</span>
              Pay ₹{totalAmount.toFixed(2)} Securely
            </div>
          )}
        </button>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan to Pay</h3>
              <p className="text-gray-600 mb-4">Amount: ₹{totalAmount.toFixed(2)}</p>
              
              {qrCode && (
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4 inline-block">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                </div>
              )}
              
              {paymentSession?.upiString && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Or enter UPI ID manually:</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{paymentSession.upiString}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={closeQRCode}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'I\'ve Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecurePaymentMethods;
