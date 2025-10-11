import React, { useState, useEffect } from 'react';
import axios from '../axios';

const PaymentMethods = ({ 
  cartItems, 
  totalAmount, 
  shippingAddress, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/api/payment/methods');
      if (response.data.success) {
        setPaymentMethods(response.data.paymentMethods);
        // Set default payment method
        if (response.data.paymentMethods.length > 0) {
          setSelectedMethod(response.data.paymentMethods[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods');
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/payment/create-session', {
        cartItems,
        totalAmount,
        shippingAddress,
        paymentMethod: selectedMethod,
        userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null
      });

      if (response.data.success) {
        if (selectedMethod === 'stripe' && response.data.paymentUrl) {
          // Redirect to Stripe checkout
          window.location.href = response.data.paymentUrl;
        } else if (selectedMethod === 'razorpay') {
          // Handle Razorpay payment
          handleRazorpayPayment(response.data);
        } else if (selectedMethod === 'payu') {
          // Handle PayU payment
          handlePayUPayment(response.data);
        } else if (selectedMethod === 'phonepe') {
          // Handle PhonePe payment
          handlePhonePePayment(response.data);
        } else if (selectedMethod === 'upi') {
          // Handle UPI payment
          handleUPIPayment(response.data);
        } else if (selectedMethod === 'cod') {
          // Handle COD
          onPaymentSuccess(response.data);
        }
      } else {
        setError(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (paymentData) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.amount * 100, // Amount in paise
      currency: paymentData.currency,
      name: 'FireworksHub',
      description: 'Fireworks Order',
      order_id: paymentData.paymentId,
      handler: function (response) {
        verifyPayment(paymentData.orderId, response.razorpay_payment_id, 'razorpay');
      },
      prefill: {
        name: shippingAddress.name || '',
        email: shippingAddress.email || '',
        contact: shippingAddress.phone || ''
      },
      theme: {
        color: '#dc2626'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayUPayment = (paymentData) => {
    // Create form and submit to PayU
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.paymentUrl;

    Object.keys(paymentData.paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData.paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handlePhonePePayment = (paymentData) => {
    // Redirect to PhonePe payment page
    window.location.href = paymentData.paymentUrl;
  };

  const handleUPIPayment = (paymentData) => {
    // Show UPI payment options
    const upiOptions = [
      { name: 'Google Pay', upi: paymentData.upiId },
      { name: 'PhonePe', upi: paymentData.upiId },
      { name: 'Paytm', upi: paymentData.upiId },
      { name: 'BHIM', upi: paymentData.upiId }
    ];

    // Create UPI payment modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">UPI Payment</h3>
        <p class="text-gray-600 mb-4">Amount: ₹${paymentData.amount}</p>
        <p class="text-gray-600 mb-4">UPI ID: ${paymentData.upiId}</p>
        <div class="space-y-2 mb-6">
          ${upiOptions.map(option => `
            <button onclick="window.open('${paymentData.upiLink}', '_blank')" 
                    class="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              ${option.name}
            </button>
          `).join('')}
        </div>
        <div class="flex gap-2">
          <button onclick="this.closest('.fixed').remove()" 
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button onclick="verifyUPIPayment('${paymentData.orderId}')" 
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">
            I've Paid
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const verifyPayment = async (orderId, paymentId, method) => {
    try {
      const response = await axios.post('/api/payment/verify', {
        orderId,
        paymentId,
        paymentMethod: method
      });

      if (response.data.success) {
        onPaymentSuccess(response.data);
      } else {
        onPaymentError(response.data.message);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      onPaymentError('Payment verification failed');
    }
  };

  // Add global function for UPI payment verification
  window.verifyUPIPayment = (orderId) => {
    verifyPayment(orderId, `UPI_${orderId}`, 'upi');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Choose Payment Method</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mr-4"
            />
            <div className="flex items-center">
              <span className="text-2xl mr-3">{method.icon}</span>
              <div>
                <div className="font-semibold">{method.name}</div>
                <div className="text-sm text-gray-600">{method.description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: ₹{totalAmount.toFixed(2)}
        </div>
        <button
          onClick={handlePayment}
          disabled={loading || !selectedMethod}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods;
