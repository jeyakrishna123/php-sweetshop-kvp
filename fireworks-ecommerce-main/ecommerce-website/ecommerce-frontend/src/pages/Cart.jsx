import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const Cart = () => {
  const { cart, cartCount, dispatch } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [updating, setUpdating] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get('/api/products?limit=8');
      if (response.data && response.data.success) {
        const allProducts = response.data.products;
        const cartProductIds = cart.map(item => item._id);
        const filteredProducts = allProducts.filter(product => !cartProductIds.includes(product._id));
        setRecommendations(filteredProducts.slice(0, 4));
      }
    } catch {
      // Error handled silently
    }
  }, [cart]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      console.log('🔄 Cart: Updating quantity for product:', productId, 'to:', newQuantity);

      // Find the product in cart to get current stock info
      const cartItem = cart.find(item => item._id === productId);
      if (!cartItem) {
        console.error('❌ Cart: Product not found in cart:', productId);
        showToast("Product not found in cart", "error");
        return;
      }

      // Check stock availability from cart item first
      if (cartItem.stock && newQuantity > cartItem.stock) {
        console.warn('⚠️ Cart: Requested quantity exceeds stock:', newQuantity, '>', cartItem.stock);
        showToast(`Only ${cartItem.stock} items available in stock`, "warning");
        setUpdating(prev => ({ ...prev, [productId]: false }));
        return;
      }

      // Try to verify stock from API if product ID is numeric
      if (/^\d+$/.test(String(productId))) {
        try {
          const response = await axios.get(`/api/products/${productId}`);
          console.log('✅ Cart: Stock check response:', response.data);

          if (response.data && response.data.success && response.data.product) {
            const product = response.data.product;
            if (newQuantity > product.stock) {
              showToast(`Only ${product.stock} items available in stock`, "warning");
              setUpdating(prev => ({ ...prev, [productId]: false }));
              return;
            }
          }
        } catch (error) {
          console.warn('⚠️ Cart: Could not verify stock from API:', error.message);
          // Continue anyway - we already checked cart item stock
        }
      }

      // Update quantity in cart
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { productId, quantity: newQuantity }
      });

      console.log('✅ Cart: Quantity updated successfully');
      showToast("Cart updated successfully", "success");
    } catch (error) {
      console.error('❌ Cart: Failed to update cart:', error);
      showToast("Failed to update cart: " + (error.message || 'Unknown error'), "error");
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
    showToast("Item removed from cart", "success");
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch({ type: 'CLEAR_CART' });
      showToast("Cart cleared", "success");
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryCharge = () => {
    const subtotal = getSubtotal();
    return subtotal > 1000 ? 0 : 100; // Free delivery above ₹1000
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCharge();
  };

  const getSavings = () => {
    return cart.reduce((total, item) => {
      const originalPrice = item.originalPrice || item.price;
      return total + ((originalPrice - item.price) * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      showToast("Please login to proceed to checkout", "warning");
      navigate('/login');
      return;
    }
    
    if (cart.length === 0) {
      showToast("Your cart is empty", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/checkout');
    } catch {
      showToast("Failed to proceed to checkout", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    if (image && image.images && image.images.length > 0) {
      const firstImage = image.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (firstImage && firstImage.url) return firstImage.url;
    }
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
  };

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Animated Empty Cart Icon */}
            <div className="mb-8 relative">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="h-16 w-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
            
            <div className="space-x-4">
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🛍️ Start Shopping
              </button>
              <button
                onClick={() => navigate('/products')}
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-600 hover:text-white transform hover:scale-105 transition-all duration-200"
              >
                🔍 Browse Products
              </button>
            </div>
          </div>

          {/* Enhanced Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🎁 Recommended for you</h3>
                <p className="text-gray-600">Discover amazing products you might love</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendations.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(product.images?.[0] || product.image)}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{product.price?.toLocaleString()}
                        </p>
                        <button className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🛒 Shopping Cart
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items - Mobile Optimized */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <span className="mr-2">📦</span>
                    Cart Items
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium hover:bg-red-50 px-2 py-1 sm:px-3 rounded-full transition-colors"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item._id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors duration-200">
                    {/* Mobile-First Layout */}
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4 lg:space-x-6">
                      {/* Product Image - Mobile Optimized */}
                      <div className="relative flex-shrink-0 self-center sm:self-start">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name}
                          className="w-24 h-24 sm:w-24 sm:h-24 object-cover rounded-lg sm:rounded-xl shadow-md"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      
                      {/* Product Details - Mobile Optimized */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 hover:text-purple-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">Unit Price: ₹{item.price?.toLocaleString()}</p>
                        {item.selectedWeight && (
                          <p className="text-gray-600 text-sm mb-3">Weight: {item.selectedWeight.weight} Kg</p>
                        )}
                        
                        {/* Mobile-Optimized Quantity Controls */}
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
                          {/* Quantity Selector - Enhanced for Mobile */}
                          <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit mx-auto sm:mx-0">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={updating[item._id]}
                              className="w-8 h-8 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-all duration-200 shadow-sm touch-manipulation"
                              style={{ minHeight: '44px', minWidth: '44px' }}
                            >
                              <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-1 text-gray-900 font-semibold min-w-[2rem] text-center text-base sm:text-base">
                              {updating[item._id] ? (
                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={updating[item._id]}
                              className="w-8 h-8 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-all duration-200 shadow-sm touch-manipulation"
                              style={{ minHeight: '44px', minWidth: '44px' }}
                            >
                              <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Remove Button - Mobile Optimized */}
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded-full transition-colors w-fit mx-auto sm:mx-0 touch-manipulation"
                            style={{ minHeight: '44px' }}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Price - Mobile Optimized */}
                      <div className="text-center sm:text-right">
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                          ₹{(item.price * item.quantity)?.toLocaleString()}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-sm text-gray-500 line-through">
                            ₹{(item.originalPrice * item.quantity)?.toLocaleString()}
                          </p>
                        )}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-sm text-green-600 font-medium">
                            Save ₹{((item.originalPrice - item.price) * item.quantity)?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary - Mobile Optimized */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <span className="mr-2">📋</span>
                Order Summary
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="text-gray-900 font-semibold">₹{getSubtotal()?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className={getDeliveryCharge() === 0 ? 'text-green-600 font-semibold' : 'text-gray-900 font-semibold'}>
                    {getDeliveryCharge() === 0 ? '🎉 Free' : `₹${getDeliveryCharge()}`}
                  </span>
                </div>
                
                {getSavings() > 0 && (
                  <div className="flex justify-between text-sm bg-green-50 p-2 sm:p-3 rounded-lg">
                    <span className="text-green-600 font-semibold">💰 Total Savings</span>
                    <span className="text-green-600 font-bold">-₹{getSavings()?.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-lg sm:text-xl font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹{getTotal()?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Mobile Optimized */}
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-base touch-manipulation"
                  style={{ minHeight: '48px' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      🚀 Proceed to Checkout
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full border-2 border-purple-600 text-purple-600 py-4 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:bg-purple-600 hover:text-white transform hover:scale-105 transition-all duration-200 text-base sm:text-base touch-manipulation"
                  style={{ minHeight: '48px' }}
                >
                  🛍️ Continue Shopping
                </button>
              </div>

              {/* Delivery Info */}
              {getDeliveryCharge() > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <div className="flex items-center text-blue-600 text-xs sm:text-sm">
                    <span className="mr-2">🚚</span>
                    <span>Add ₹{(1000 - getSubtotal()).toLocaleString()} more for free delivery!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">🎁 You might also like</h3>
              <p className="text-gray-600 text-sm sm:text-base">Discover more amazing products</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {recommendations.map((product, index) => (
                <div 
                  key={product._id} 
                  className="group bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer overflow-hidden"
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getImageUrl(product.images?.[0] || product.image)}
                      alt={product.name}
                      className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors text-sm sm:text-base">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{product.price?.toLocaleString()}
                      </p>
                      <button className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;




