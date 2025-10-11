import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from '../axios';

const OrderDetailsPublic = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const trackingNumber = searchParams.get('tracking');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching order details for:', orderId, 'tracking:', trackingNumber);
        const response = await axios.get(`/order-details/${orderId}?tracking=${trackingNumber}`);
        console.log('📡 API Response:', response.data);
        
        if (response.data.success) {
          console.log('✅ Order data received:', response.data.order);
          setOrder(response.data.order);
        } else {
          console.log('❌ API returned error:', response.data.message);
          setError(response.data.message || 'Order not found');
        }
      } catch (err) {
        console.error('❌ Error fetching order details:', err);
        console.error('❌ Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      console.log('🚀 Starting to fetch order details...');
      fetchOrderDetails();
    } else {
      console.log('❌ No order ID provided');
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId, trackingNumber]);

  const getImageUrl = (image) => {
    console.log('🖼️ Getting image URL for:', image);
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    if (image && image.images && image.images.length > 0) {
      const firstImage = image.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (firstImage && firstImage.url) return firstImage.url;
    }
    console.log('🖼️ Using fallback image');
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 OrderDetailsPublic render - order:', order);
  console.log('🎯 OrderDetailsPublic render - loading:', loading);
  console.log('🎯 OrderDetailsPublic render - error:', error);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug Information - Remove in production */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong> Order ID: {order?._id}, Items: {order?.orderItems?.length || 0}
          <br />
          <strong>Order Data:</strong> {JSON.stringify(order, null, 2)}
        </div>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
            <p className="text-gray-600">Order ID: {order._id.slice(-8)}</p>
            <p className="text-gray-600">Tracking: {order.trackingNumber}</p>
          </div>

          {/* Order Status */}
          <div className="text-center mb-6">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
              <p className="text-sm text-gray-600"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              <p className="text-sm text-gray-600"><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p className="text-sm text-gray-600"><strong>Total Amount:</strong> ₹{order.totalPrice?.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
              <p className="text-sm text-gray-600"><strong>Name:</strong> {order.userDetails?.name || 'N/A'}</p>
              <p className="text-sm text-gray-600"><strong>Email:</strong> {order.userDetails?.email || 'N/A'}</p>
              <p className="text-sm text-gray-600"><strong>Phone:</strong> {order.userDetails?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900">{order.shippingAddress?.address}</p>
            <p className="text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p className="text-gray-600">{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items ({order.orderItems?.length || 0} items)</h2>
          <div className="space-y-4">
            {console.log('📦 Rendering order items:', order.orderItems)}
            {order.orderItems && order.orderItems.length > 0 ? (
              order.orderItems.map((item, index) => {
                console.log('📦 Rendering item:', index, item);
                return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  {item.selectedWeight && (
                    <p className="text-sm text-gray-600">Weight: {item.selectedWeight.weight} Kg</p>
                  )}
                  <p className="text-sm text-gray-600">Price: ₹{item.price?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                </div>
              </div>
              );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found in this order.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{order.itemsPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18%):</span>
              <span className="font-semibold">₹{order.taxPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-semibold">₹{order.shippingPrice?.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-purple-600">₹{order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Thank you for choosing SK BAKERS!</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Visit Our Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPublic;
