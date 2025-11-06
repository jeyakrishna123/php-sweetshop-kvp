import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart on successful payment
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cartItems');
    
    // Get order details from navigation state or sessionStorage
    if (location.state) {
      setOrderDetails(location.state);
      // Store in sessionStorage as backup
      sessionStorage.setItem('orderSuccessDetails', JSON.stringify(location.state));
    } else {
      // Try to get from sessionStorage if no state
      const storedDetails = sessionStorage.getItem('orderSuccessDetails');
      if (storedDetails) {
        try {
          setOrderDetails(JSON.parse(storedDetails));
        } catch (error) {
          console.error('Error parsing stored order details:', error);
          navigate('/', { replace: true });
          return;
        }
      } else {
        // If no state and no stored details, redirect to home
        navigate('/', { replace: true });
        return;
      }
    }
    
    setLoading(false);

    // Cleanup function to clear sessionStorage when component unmounts
    return () => {
      sessionStorage.removeItem('orderSuccessDetails');
    };
  }, [dispatch, location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Details Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order details. Please check your order history.
          </p>
          <button
            onClick={() => navigate("/myorder")}
            className="bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 transition duration-200"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        {/* Payment Status Badge */}
        {orderDetails.paymentStatus && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${
            orderDetails.paymentStatus === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {orderDetails.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
          </div>
        )}

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {orderDetails.paymentStatus === 'paid' ? 'Payment Successful!' : 'Order Placed Successfully!'}
        </h2>
        <p className="text-gray-600 mb-6">
          {orderDetails.paymentStatus === 'paid' 
            ? 'Thank you for your purchase. Your order has been confirmed and will be processed shortly.'
            : 'Thank you for your order. Please pay the amount when the order is delivered.'
          }
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Order ID:</span> {(() => {
                // Prioritize 6-digit orderNumber from response
                let orderNum = orderDetails.orderNumber || 
                              orderDetails.orderDetails?.order_number || 
                              orderDetails.orderDetails?.display_order_id ||
                              orderDetails.displayOrderId;
                
                // If we have a number, ensure it's formatted as 6 digits
                if (orderNum) {
                  const numStr = String(orderNum).padStart(6, '0');
                  // Only use if it's 6 digits, otherwise try to generate from orderId
                  if (numStr.length === 6) {
                    return numStr;
                  }
                }
                
                // If no valid 6-digit number, generate one from orderId for display
                if (orderDetails.orderId) {
                  const orderIdNum = parseInt(orderDetails.orderId) || 0;
                  if (orderIdNum > 0) {
                    // Generate consistent 6-digit number: (order_id * 12345) % 900000 + 100000
                    const generated = ((orderIdNum * 12345) % 900000) + 100000;
                    return String(generated).padStart(6, '0');
                  }
                }
                
                return 'N/A';
              })()}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Total Amount:</span> ₹{orderDetails.total?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Date:</span> {(() => {
                try {
                  const orderDate = orderDetails.orderDetails?.created_at || orderDetails.createdAt || new Date();
                  let date = new Date(orderDate);
                  
                  // If date is invalid, try parsing with IST timezone
                  if (isNaN(date.getTime())) {
                    const dateStr = String(orderDate);
                    if (dateStr && !dateStr.includes('Z') && !dateStr.includes('+')) {
                      date = new Date(dateStr + '+05:30');
                    } else {
                      date = new Date(orderDate);
                    }
                  }
                  
                  if (isNaN(date.getTime())) {
                    return new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
                  }
                  
                  return date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata'
                  });
                } catch (e) {
                  return new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
                }
              })()}
            </p>
            {orderDetails.orderDetails?.paymentMethod && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Payment Method:</span> {orderDetails.orderDetails.paymentMethod}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/myorder")}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-700 transition duration-200"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="w-full border border-pink-600 text-pink-600 py-3 px-4 rounded-lg font-medium hover:bg-pink-50 transition duration-200"
          >
            Continue Shopping
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>You will receive an email confirmation shortly.</p>
          <p>For any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default Success;

