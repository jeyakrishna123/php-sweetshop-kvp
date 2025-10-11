import React, { useState, useEffect } from 'react';
import axios from '../axios';

const OrderTracking = ({ trackingNumber }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingData();
    }
  }, [trackingNumber]);

  const fetchTrackingData = async () => {
    try {
    setLoading(true);
      const response = await axios.get(`/api/tracking/${trackingNumber}`);
      
      if (response.data.success) {
        setTrackingData(response.data);
      } else {
        setError(response.data.message || 'Failed to fetch tracking data');
      }
    } catch (error) {
      console.error('Tracking data fetch error:', error);
      setError(error.response?.data?.message || 'Failed to fetch tracking data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Tracking Information...</h3>
          <p className="text-gray-600">Please wait while we fetch your order details</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Tracking Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
            <button
            onClick={fetchTrackingData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
            Try Again
            </button>
          </div>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  const { order, customer, trackingHistory, estimatedDelivery, deliveryStatus, orderItems } = trackingData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
              <p className="text-gray-600">Track your order in real-time</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="text-xl font-bold text-blue-600">{order.trackingNumber}</p>
            </div>
        </div>

          {/* Current Status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="text-4xl mr-4">{deliveryStatus.icon}</div>
                <div>
                <h2 className="text-2xl font-bold text-gray-900">{deliveryStatus.status}</h2>
                <p className="text-gray-600">{deliveryStatus.description}</p>
                </div>
                </div>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tracking Timeline</h3>
              
                <div className="space-y-6">
                {trackingHistory.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-600 text-white' : 
                        index < trackingHistory.length - 1 ? 'bg-green-600 text-white' : 
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">{step.description}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{step.location}</p>
                    </div>
                  </div>
                ))}
              </div>
                    </div>
                  </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">{order._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-green-600">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                      </div>
                      </div>
                    </div>

            {/* Estimated Delivery */}
            {estimatedDelivery && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Estimated Delivery</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {estimatedDelivery.days} {estimatedDelivery.days === 1 ? 'Day' : 'Days'}
                      </div>
                  <p className="text-gray-600">
                    {new Date(estimatedDelivery.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                            month: 'long',
                      year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

            {/* Customer Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Details</h3>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Name:</strong> {customer.name}</p>
                <p className="text-gray-600"><strong>Email:</strong> {customer.email}</p>
                <p className="text-gray-600"><strong>Phone:</strong> {customer.phone}</p>
                      </div>
                    </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-gray-600">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                        alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  {item.selectedWeight && (
                    <p className="text-gray-600">Weight: {item.selectedWeight.weight} Kg</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')} each</p>
                      </div>
                  </div>
                ))}
              </div>
            </div>
      </div>
    </div>
  );
};

export default OrderTracking;
