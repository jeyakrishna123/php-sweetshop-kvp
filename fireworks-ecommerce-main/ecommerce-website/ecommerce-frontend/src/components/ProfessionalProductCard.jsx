import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const ProfessionalProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const { showToast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  
  const isInWishlist = wishlistItems.some(item => item._id === product._id);
  const stock = product.countInStock || 0;
  const isOutOfStock = stock <= 0;
  
  // Calculate pricing
  const originalPrice = product.price || 0;
  const discountPercentage = product.discountPercentage || Math.floor(Math.random() * 30) + 10;
  const offerPrice = Math.floor(originalPrice * (1 - discountPercentage / 100));
  
  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };
  
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      removeFromWishlist(product._id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist', 'success');
    }
  };
  
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleQuantityIncrease = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      showToast('Product is out of stock', 'error');
      return;
    }
    
    try {
      await addToCart(product._id, quantity);
      showToast(`${product.name} added to cart`, 'success');
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    }
  };
  
  const getImageUrl = () => {
    if (product.image && product.image.url) {
      return product.image.url;
    }
    return product.image || '/images/placeholder.jpg';
  };
  
  const handleImageError = (e) => {
    e.target.src = '/images/placeholder.jpg';
  };

  return (
    <div className="ux-card group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden w-full h-[320px] flex flex-col">
      {/* Product Image Container - 4:3 Aspect Ratio */}
      <div 
        className="ux-img relative w-full h-32 overflow-hidden cursor-pointer flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100" 
        onClick={handleProductClick}
      >
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 z-10"
          aria-label="Add to wishlist"
        >
          <svg 
            className={`w-4 h-4 transition-colors duration-200 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-500 hover:text-red-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        {/* Discount Badge - Animated */}
        <div className="absolute top-2 left-2 z-10">
          <span className="ux-discount-badge bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            -{discountPercentage}% OFF
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="ux-content flex-1 flex flex-col p-3 justify-between">
        {/* Product Name - Single Line with Ellipsis */}
        <h3 
          className="ux-title text-sm font-bold text-gray-900 cursor-pointer hover:text-green-600 transition-colors duration-200 truncate"
          onClick={handleProductClick}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="ux-price flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Offer Price - Bold Green */}
            <span className="text-lg font-bold text-green-600">
              ₹{offerPrice.toLocaleString()}
            </span>
            {/* Original Price - Strikethrough Gray */}
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quantity and Add to Cart Row - Side by Side */}
        <div className="ux-actions flex items-center gap-2">
          {/* Quantity Stepper */}
          <div className="ux-qty flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={handleQuantityDecrease}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="text-gray-600 font-bold">–</span>
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min="1"
              max={stock}
              className="w-12 h-8 text-center text-sm font-semibold border-0 focus:outline-none"
            />
            <button
              onClick={handleQuantityIncrease}
              disabled={quantity >= stock}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="text-gray-600 font-bold">+</span>
            </button>
          </div>

          {/* Add to Cart Button - Full Width Green */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            className="ux-add flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-1 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg text-xs h-8"
          >
            {cartLoading ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                  <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="currentColor"/>
                </svg>
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProductCard;
