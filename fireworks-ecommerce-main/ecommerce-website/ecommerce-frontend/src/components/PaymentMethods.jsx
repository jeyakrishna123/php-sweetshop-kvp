import React, { useState, useEffect } from 'react';
import axios from '../axios';
import QRCode from 'qrcode';
import PaymentService from '../services/PaymentService';

const PaymentMethods = ({ 
  cartItems, 
  totalAmount, 
  shippingAddress, 
  onPaymentSuccess, 
  onPaymentError 
}) => {

  const [selectedMethod, setSelectedMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);

  // Enhanced payment methods with Indian payment options
  const paymentMethods = [
    {
      id: 'googlepay',
      name: 'Google Pay',
      icon: '💳',
      description: 'Pay with Google Pay',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      activeColor: 'border-blue-500 bg-blue-100'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      description: 'Pay with PhonePe',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      activeColor: 'border-purple-500 bg-purple-100'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      icon: '💰',
      description: 'Pay with Paytm',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      activeColor: 'border-blue-500 bg-blue-100'
    },
    {
      id: 'upi',
      name: 'UPI ID',
      icon: '🏦',
      description: 'Pay with UPI ID',
      color: 'bg-green-50 border-green-200 text-green-700',
      activeColor: 'border-green-500 bg-green-100'
    },
    {
      id: 'barcode',
      name: 'QR Code',
      icon: '📱',
      description: 'Scan QR Code to Pay',
      color: 'bg-gray-50 border-gray-200 text-gray-700',
      activeColor: 'border-gray-500 bg-gray-100'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when delivered',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      activeColor: 'border-orange-500 bg-orange-100'
    }
  ];

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

  // Create UPI payment string
  const createUPIString = (amount, merchantUPI, merchantName, transactionId) => {
    return `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${amount}&cu=INR&tn=Order-${transactionId}`;
  };

  // Handle different payment methods
  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      switch (selectedMethod) {
        case 'googlepay':
          await handleGooglePay(orderId);
          break;
        case 'phonepe':
          await handlePhonePe(orderId);
          break;
        case 'paytm':
          await handlePaytm(orderId);
          break;
        case 'upi':
          await handleUPI(orderId);
          break;
        case 'barcode':
          await handleBarcodePayment(orderId);
          break;
        case 'cod':
          await handleCOD(orderId);
          break;
        default:
          setError('Invalid payment method');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Google Pay Integration
  const handleGooglePay = async (orderId) => {
    try {
      const paymentData = {
        amount: totalAmount,
        currency: 'INR',
        customerInfo: {
          userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null,
          email: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : '',
          phone: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).phone : ''
        },
        shippingAddress,
        cartItems
      };

      const result = await PaymentService.initiateGooglePay(paymentData);
      
      if (result.success) {
        // Initialize Google Pay
        if (window.google && window.google.payments) {
          const paymentsClient = new window.google.payments.api.PaymentsClient({
            environment: process.env.REACT_APP_ENVIRONMENT === 'production' ? 'PRODUCTION' : 'TEST'
          });

          const paymentDataRequest = result.paymentData;
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
      } else {
        throw new Error('Google Pay session creation failed');
      }
    } catch (error) {
      throw new Error('Google Pay payment failed: ' + error.message);
    }
  };

  // PhonePe Integration
  const handlePhonePe = async (orderId) => {
    try {
      const paymentData = {
        amount: totalAmount,
        currency: 'INR',
        customerInfo: {
          userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null,
          email: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : '',
          phone: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).phone : ''
        },
        shippingAddress,
        cartItems
      };

      const result = await PaymentService.initiatePhonePe(paymentData);
      
      if (result.success) {
        // Redirect to PhonePe payment page
        window.location.href = result.paymentUrl;
      } else {
        throw new Error('PhonePe session creation failed');
      }
    } catch (error) {
      throw new Error('PhonePe payment failed: ' + error.message);
    }
  };

  // Paytm Integration
  const handlePaytm = async (orderId) => {
    try {
      const paymentData = {
        amount: totalAmount,
        currency: 'INR',
        customerInfo: {
          userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null,
          email: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : '',
          phone: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).phone : ''
        },
        shippingAddress,
        cartItems
      };

      const result = await PaymentService.initiatePaytm(paymentData);
      
      if (result.success) {
        // Redirect to Paytm payment page
        window.location.href = result.paymentUrl;
      } else {
        throw new Error('Paytm session creation failed');
      }
    } catch (error) {
      throw new Error('Paytm payment failed: ' + error.message);
    }
  };

  // UPI ID Payment
  const handleUPI = async (orderId) => {
    try {
      const paymentData = {
        amount: totalAmount,
        currency: 'INR',
        customerInfo: {
          userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null,
          email: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : '',
          phone: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).phone : ''
        },
        shippingAddress,
        cartItems
      };

      const result = await PaymentService.initiateUPI(paymentData);
      
      if (result.success) {
        // Generate QR Code
        await generateQRCode(result.upiString);
        
        // Store payment session
        setPaymentSession(result);
      } else {
        throw new Error('UPI session creation failed');
      }
    } catch (error) {
      throw new Error('UPI payment setup failed: ' + error.message);
    }
  };

  // Barcode/QR Code Payment
  const handleBarcodePayment = async (orderId) => {
    try {
      const paymentData = {
        amount: totalAmount,
        currency: 'INR',
        customerInfo: {
          userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null,
          email: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : '',
          phone: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).phone : ''
        },
        shippingAddress,
        cartItems
      };

      const result = await PaymentService.initiateUPI(paymentData);
      
      if (result.success) {
        await generateQRCode(result.upiString);
        setPaymentSession(result);
      } else {
        throw new Error('QR Code payment setup failed');
      }
    } catch (error) {
      throw new Error('QR Code payment setup failed: ' + error.message);
    }
  };

  // Cash on Delivery
  const handleCOD = async (orderId) => {
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod: 'cod',
        totalPrice: totalAmount,
        customerInfo: {
          userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null,
          email: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : '',
          phone: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).phone : ''
        }
      };
      
      const response = await axios.post('/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        onPaymentSuccess({
          success: true,
          orderId: response.data.orderId,
          paymentStatus: 'confirmed',
          message: 'Order placed successfully'
        });
      } else {
        throw new Error(response.data.message || 'Order creation failed');
      }
    } catch (error) {
      throw new Error('COD order creation failed: ' + error.message);
    }
  };

  // Check if payment app is available
  const checkAppAvailability = (scheme) => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = scheme;
      
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false);
      }, 2000);
      
      iframe.onload = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(true);
      };
      
      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(false);
      };
      
      document.body.appendChild(iframe);
    });
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
      setError('Payment verification failed: ' + error.message);
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
            <span className="text-white text-xl">💳</span>
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
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedMethod === method.id
                  ? `${method.activeColor} shadow-md`
                  : `${method.color} hover:shadow-sm`
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center w-full">
                <div className="text-3xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{method.name}</div>
                  <div className="text-sm opacity-75">{method.description}</div>
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
              Pay ₹{totalAmount.toFixed(2)} Now
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
              
              {upiId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Or enter UPI ID manually:</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{upiId}</p>
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

export default PaymentMethods;
