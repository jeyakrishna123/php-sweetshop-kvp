import React, { useState, useCallback, memo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import QuantitySelector from './QuantitySelector';
import Icon from './Icon';

const ProductCard = memo(({ product, viewMode = "grid" }) => {
  const { dispatch } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Calculate stock and out of stock status early to avoid reference errors
  const stock = product.stock || product.countInStock || 0;
  const isOutOfStock = stock === 0;

  // Reset quantity when product changes
  React.useEffect(() => {
    setQuantity(1);
  }, [product._id]);

  // Check wishlist status when user or product changes
  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    } else {
      setIsInWishlist(false);
    }
  }, [user, product._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await axios.get(`/api/wishlist/check/${product._id}`);
      if (response.data.success) {
        setIsInWishlist(response.data.inWishlist);
      }
    } catch (error) {
      console.log('Wishlist status check error:', error.response?.data || error.message);
      // Silent error handling for wishlist status check
      setIsInWishlist(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      showToast("Please login to add items to wishlist", "warning");
      navigate("/login");
      return;
    }

    // Check if user has valid token
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Please login to add items to wishlist", "warning");
      navigate("/login");
      return;
    }

    console.log('User:', user);
    console.log('Token exists:', !!token);
    console.log('Product ID:', product._id);

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        console.log('Removing from wishlist...');
        await axios.delete(`/api/wishlist/remove/${product._id}`);
        setIsInWishlist(false);
        showToast("Removed from wishlist", "success");
      } else {
        // Add to wishlist
        console.log('Adding to wishlist...');
        await axios.post("/api/wishlist/add", { productId: product._id });
        setIsInWishlist(true);
        showToast("Added to wishlist", "success");
      }
    } catch (error) {
      console.log('Wishlist toggle error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to update wishlist";
      showToast(errorMessage, "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = useCallback(() => {
    if (!user) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }
    
    if (isOutOfStock) {
      showToast("This product is out of stock", "error");
      return;
    }

    if (quantity > stock) {
      showToast(`Only ${stock} items available in stock`, "error");
      return;
    }

    setCartLoading(true);
    
    dispatch({ 
      type: 'ADD_TO_CART', 
      payload: { 
        ...product, 
        quantity,
        price: product.discountPercentage > 0 
          ? product.price * (1 - product.discountPercentage / 100) 
          : product.price
      } 
    });
    
    showToast(`${product.name} added to cart!`, "success", 1200);
    setCartLoading(false);
    setQuantity(1);
  }, [dispatch, product, quantity, user, isOutOfStock, stock, showToast, navigate]);

  const handleQuickBuy = useCallback(() => {
    if (!user) {
      showToast("Please login to make a purchase", "warning");
      navigate("/login");
      return;
    }

    if (isOutOfStock) {
      showToast("Product is out of stock", "error");
      return;
    }

    // Add to cart and navigate to checkout
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        ...product,
        quantity,
        price: product.discountPercentage > 0 
          ? product.price * (1 - product.discountPercentage / 100) 
          : product.price
      }
    });
    
    showToast("Added to cart, redirecting to checkout", "success", 1000);
    navigate("/checkout");
  }, [user, isOutOfStock, quantity, product, dispatch, showToast, navigate]);

  const handleQuantityChange = useCallback((e) => {
    const value = parseInt(e.target.value) || 1;
    const maxStock = product.stock || product.countInStock || 10;
    if (value > 0 && value <= maxStock) {
      setQuantity(value);
    } else if (value > maxStock) {
      setQuantity(maxStock);
    }
  }, [product.stock, product.countInStock]);

  const handleQuantityIncrease = useCallback(() => {
    const maxStock = product.stock || product.countInStock || 10;
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  }, [quantity, product.stock, product.countInStock]);

  const handleQuantityDecrease = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  const handleProductClick = useCallback(() => {
    navigate(`/product/${product._id}`);
  }, [navigate, product._id]);

  // Get the image URL, handling both 'image' and 'images' fields
  const getImageUrl = () => {
    if (imageError) {
      return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
    }
    
    if (product.image) {
      return product.image;
    }
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") {
        return firstImage;
      }
      if (firstImage && firstImage.url) {
        return firstImage.url;
      }
    }
    
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
  };

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative group cursor-pointer w-full sm:w-48 h-48 sm:h-48 flex-shrink-0" onClick={handleProductClick}>
            <img
              src={getImageUrl()}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={handleImageError}
            />
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors duration-200 disabled:opacity-50"
            >
              {wishlistLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
              ) : (
                <svg
                  className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>

            {/* Stock Badge */}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 badge badge-error">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
              <div className="flex-1">
                <h3
                  className="font-display text-gray-900 text-lg sm:text-xl mb-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  onClick={handleProductClick}
                >
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            i < Math.floor(product.ratings || 4.9)
                              ? 'bg-yellow-400'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span className={`text-xs font-bold ${
                            i < Math.floor(product.ratings || 4.9)
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}>
                            i
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm ml-1 font-medium">{product.ratings || 4.9}</span>
                  </div>
                  <span className="text-gray-400 text-sm mx-2">•</span>
                  <span className="text-gray-600 text-sm">({product.numReviews || 0})</span>
                </div>

                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base sm:text-lg text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <QuantitySelector
                      quantity={quantity}
                      onIncrease={handleQuantityIncrease}
                      onDecrease={handleQuantityDecrease}
                      onChange={handleQuantityChange}
                      max={stock}
                      disabled={isOutOfStock}
                      size="md"
                      variant="compact"
                    />
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view - Simplified Design with Essential Elements Only
  return (
    <div className="group relative bg-white rounded-md sm:rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden w-full flex flex-col">
      {/* Product Image Container */}
      <div className="relative w-full aspect-square overflow-hidden cursor-pointer flex-shrink-0 bg-gray-50 flex items-center justify-center" onClick={handleProductClick}>
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />

        {/* Vegetarian Icon - Hidden on mobile for space */}
        <div className="hidden sm:flex absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full items-center justify-center shadow-sm border border-gray-200">
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-600 rounded-full"></div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(e);
          }}
          className={`absolute top-1 sm:top-2 right-1 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 z-10 ${
            isInWishlist
              ? 'bg-white text-red-500'
              : 'bg-white/90 text-gray-600 hover:text-red-500'
          }`}
          aria-label="Add to wishlist"
        >
          <Icon name="heart" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <Icon name="x" className="w-4 h-4" />
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col p-1.5 sm:p-3 min-h-0">
        {/* Product Name */}
        <h3
          className="text-[10px] sm:text-sm font-semibold text-gray-900 mb-1 cursor-pointer hover:text-red-600 transition-colors duration-200 line-clamp-1 sm:line-clamp-2 leading-tight"
          onClick={handleProductClick}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm sm:text-lg font-bold text-red-600">
            ₹{product.price?.toLocaleString()}
          </span>
          <div className="flex items-center bg-green-600 px-1 py-0.5 rounded text-[8px] sm:text-xs">
            <span className="text-white font-bold mr-0.5">
              {Number(product.ratings || 4.9).toFixed(1)}
            </span>
            <Icon name="star" className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white fill-current" />
          </div>
        </div>

        {/* Quantity & Add Button Row */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quantity Selector - Increased Size */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityDecrease();
              }}
              disabled={isOutOfStock || quantity <= 1}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-50 text-sm sm:text-base font-bold transition-colors duration-200"
            >
              −
            </button>
            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityIncrease();
              }}
              disabled={isOutOfStock || quantity >= stock}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-50 text-sm sm:text-base font-bold transition-colors duration-200"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button - Reduced Size */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[8px] sm:text-xs font-bold py-1.5 sm:py-2 px-2 rounded transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-0.5 sm:gap-1"
          >
            {cartLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <>
                <Icon name="shopping-cart" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{isOutOfStock ? 'Out' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;


