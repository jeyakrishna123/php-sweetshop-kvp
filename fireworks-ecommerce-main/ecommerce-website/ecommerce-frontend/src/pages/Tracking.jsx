import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking';

const Tracking = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [inputTrackingNumber, setInputTrackingNumber] = useState(trackingNumber || '');
  const [showTrackingForm, setShowTrackingForm] = useState(!trackingNumber);

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (inputTrackingNumber.trim()) {
      navigate(`/tracking/${inputTrackingNumber.trim()}`);
    }
  };

  if (trackingNumber) {
    return <OrderTracking trackingNumber={trackingNumber} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
            <p className="text-gray-600">Enter your tracking number to see the status of your order</p>
          </div>

          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                id="trackingNumber"
                value={inputTrackingNumber}
                onChange={(e) => setInputTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Track Order
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Don't have your tracking number?</p>
            <button
              onClick={() => navigate('/my-orders')}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
