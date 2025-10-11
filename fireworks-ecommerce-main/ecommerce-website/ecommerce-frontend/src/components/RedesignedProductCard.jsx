import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const RedesignedProductCard = ({ product }) => {
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
  const currentPrice = Math.floor(originalPrice * (1 - discountPercentage / 100));
  const savings = originalPrice - currentPrice;
  
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
    <div className="product-card group" onClick={handleProductClick}>
      {/* Product Image Container */}
      <div className="product-card-image">
        <img
          src={getImageUrl()}
          alt={product.name}
          onError={handleImageError}
        />
        
        {/* Badges */}
        <div className="product-card-badges">
          {product.isNew && (
            <span className="product-card-badge new">NEW</span>
          )}
          <span className="product-card-badge discount">-{discountPercentage}% OFF</span>
        </div>
        
        {/* Wishlist Button */}
        <button 
          className="product-card-wishlist"
          onClick={handleWishlistToggle}
          aria-label="Add to wishlist"
        >
          <svg 
            className={`w-4 h-4 transition-colors duration-200 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Content */}
      <div className="product-card-content">
        {/* Product Title */}
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        {/* Product Price */}
        <div className="product-card-price">
          <div className="flex items-center">
            <span className="original-price">₹{originalPrice.toLocaleString()}</span>
            <span className="current-price">₹{currentPrice.toLocaleString()}</span>
          </div>
          <div className="savings">You Save ₹{savings.toLocaleString()}</div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="product-card-actions">
          {/* Quantity Selector */}
          <div className="product-card-qty">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityDecrease();
              }}
              disabled={quantity <= 1}
            >
              –
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                e.stopPropagation();
                handleQuantityChange(parseInt(e.target.value) || 1);
              }}
              min="1"
              max={stock}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityIncrease();
              }}
              disabled={quantity >= stock}
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            className="product-card-add-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            aria-label={isOutOfStock ? "Product out of stock" : `Add ${product.name} to cart`}
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

export default RedesignedProductCard;
