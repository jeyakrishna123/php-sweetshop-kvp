import React, { useState, useCallback, memo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import QuantitySelector from './QuantitySelector';
import Icon from './Icon';

const NewProductCard = memo(({ product, viewMode = "grid", showQuickView = true, showNewBadge = true }) => {
  const { dispatch } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);

  // Calculate derived values
  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const discountedPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;
  const savings = product.discountPercentage > 0 
    ? product.price - discountedPrice 
    : 0;

  // Check if product is new (either by isNew flag or by creation date within last 30 days)
  const isProductNew = product.isNew || product.isNewProduct || 
    (product.createdAt && new Date() - new Date(product.createdAt) < 30 * 24 * 60 * 60 * 1000);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setCurrentImageIndex(0);
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
      setIsInWishlist(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    // Prevent multiple simultaneous requests
    if (wishlistLoading) {
      console.log('⏳ Wishlist operation already in progress');
      return;
    }

    if (!user) {
      showToast("Please login to add items to wishlist", "warning");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Please login to add items to wishlist", "warning");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await axios.delete(`/api/wishlist/remove/${product._id}`);
        setIsInWishlist(false);
        showToast("Removed from wishlist", "success");
      } else {
        try {
          await axios.post("/api/wishlist/add", { productId: product._id });
          setIsInWishlist(true);
          showToast("Added to wishlist", "success");
        } catch (addError) {
          // Handle 409 separately - it means already in wishlist
          if (addError.response?.status === 409) {
            console.log('⚠️ Product already in wishlist, syncing state');
            setIsInWishlist(true);  // Sync state with backend
            showToast("Already in wishlist", "info");
          } else {
            throw addError;  // Re-throw other errors to outer catch
          }
        }
      }
    } catch (error) {
      // Handle other errors (409 already handled in inner catch)
      if (error.response?.status !== 409) {
        const errorMessage = error.response?.data?.message || "Failed to update wishlist";
        showToast(errorMessage, "error");
      }
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
      showToast("Product is out of stock", "error");
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
        price: discountedPrice
      }
    });
    
    showToast("Added to cart successfully", "success");
    setCartLoading(false);
    setQuantity(1);
  }, [user, isOutOfStock, quantity, stock, discountedPrice, product, dispatch, showToast, navigate]);

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

    if (quantity > stock) {
      showToast(`Only ${stock} items available in stock`, "error");
      return;
    }

    // Add to cart and navigate to checkout
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        ...product,
        quantity,
        price: discountedPrice
      }
    });
    
    showToast("Added to cart, redirecting to checkout", "success");
    navigate("/checkout");
  }, [user, isOutOfStock, quantity, stock, discountedPrice, product, dispatch, showToast, navigate]);

  const handleQuantityChange = useCallback((e) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= stock) {
      setQuantity(value);
    } else if (value > stock) {
      setQuantity(stock);
    }
  }, [stock]);

  const handleQuantityIncrease = useCallback(() => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  }, [quantity, stock]);

  const handleQuantityDecrease = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  const handleQuickView = () => {
    setShowQuickViewModal(true);
  };

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };

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

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden cursor-pointer flex-shrink-0" onClick={handleProductClick}>
            <img
              src={getImageUrl()}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors duration-200 disabled:opacity-50"
            >
              {wishlistLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
              ) : (
                <svg className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>

            {/* Stock Badge */}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* Animated Product Name */}
                <h3 
                  className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors duration-200 transform hover:scale-105"
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

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(discountedPrice)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <button
                        onClick={handleQuantityDecrease}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-150 rounded-l-lg border-r border-gray-200"
                      >
                        <Icon name="minus" className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max={stock}
                        disabled={isOutOfStock}
                        className="w-12 h-8 text-center text-sm font-medium text-gray-900 border-0 focus:outline-none focus:ring-0 disabled:text-gray-400 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleQuantityIncrease}
                        disabled={quantity >= stock || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-150 rounded-r-lg border-l border-gray-200"
                      >
                        <Icon name="plus" className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || cartLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {cartLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                      </>
                    )}
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
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden w-full h-[280px] sm:h-[320px] flex flex-col">
      {/* Product Image Container */}
      <div className="relative w-full h-40 sm:h-48 overflow-hidden cursor-pointer flex-shrink-0 bg-gray-50 flex items-center justify-center" onClick={handleProductClick}>
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        
        {/* Vegetarian Icon */}
        <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">V</span>
        </div>
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(e);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 z-10 ${
            isInWishlist
              ? 'bg-red-500 text-white border-red-500 shadow-red-500/30'
              : 'bg-white/90 text-gray-600 hover:text-red-500 border-white/50 hover:border-red-200'
          }`}
          aria-label="Add to wishlist"
        >
          <Icon name="heart" className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isInWishlist ? 'fill-current scale-110' : 'hover:scale-110'}`} />
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
      <div className="flex-1 flex flex-col p-3">
        {/* Product Name */}
        <h3 
          className="text-sm font-semibold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors duration-200 line-clamp-2"
          onClick={handleProductClick}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-2">
          <span className="text-base font-bold text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name="star"
                className={`w-3 h-3 ${
                  i < Math.floor(product.ratings || 4.9)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews || Math.floor(Math.random() * 100) + 10})
          </span>
        </div>
      </div>
    </div>
  );
});

NewProductCard.displayName = 'NewProductCard';

export default NewProductCard;
