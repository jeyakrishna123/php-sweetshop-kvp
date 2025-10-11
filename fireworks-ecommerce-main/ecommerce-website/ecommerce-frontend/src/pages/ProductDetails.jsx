import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import axios from "../axios";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import ReviewSummary from "../components/ReviewSummary";
import ReviewSystem from "../components/ReviewSystem";
import ImageZoomModal from "../components/ImageZoomModal";
import SignupModal from "../components/SignupModal";
import NewProductCard from "../components/NewProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [selectedRating, setSelectedRating] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Weight selection state
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedWeightPrice, setSelectedWeightPrice] = useState(null);
  const [productWeightOptions, setProductWeightOptions] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/products/${id}`);
        
        if (response.data && response.data.success) {
          const productData = response.data.product;
          setProduct(productData);
          
          // Set weight options if product has them
          if (productData.hasWeightOptions && productData.weightOptions && productData.weightOptions.length > 0) {
            setProductWeightOptions(productData.weightOptions);
          } else {
            setProductWeightOptions([]);
          }
        } else {
          throw new Error("Product not found");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const response = await axios.get(`/api/products?limit=4`);
        
        if (response.data && response.data.success) {
          // Filter out current product and get 4 related products
          const filtered = response.data.products
            .filter(p => p._id !== id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error);
        // Don't set error for related products as it's not critical
      }
    };

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await axios.get(`/api/reviews/product/${id}`);
        
        if (response.data && response.data.success) {
          setReviews(response.data.reviews);
          setReviewSummary(response.data.summary);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        // Don't set error for reviews as it's not critical
      } finally {
        setLoadingReviews(false);
      }
    };

    const checkWishlistStatus = async () => {
      if (user && id) {
        try {
          const response = await axios.get(`/api/wishlist/check/${id}`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          });
          setIsWishlisted(response.data.isInWishlist);
        } catch (error) {
          console.error('Failed to check wishlist status:', error);
        }
      }
    };

    if (id) {
      fetchProduct();
      fetchRelatedProducts();
      fetchReviews();
      checkWishlistStatus();
    }
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      setIsSignupModalOpen(true);
      return;
    }

    if (!product || product.stock < quantity) {
      showToast("Product is out of stock", "error");
      return;
    }

    try {
      setAddingToCart(true);
      
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          _id: product._id,
          name: product.name,
          price: selectedWeightPrice || product.price,
          image: product.images && product.images[0] ? product.images[0].url : product.image,
          stock: product.stock,
          quantity: quantity,
          selectedWeight: selectedWeight
        }
      });

      showToast("Product added to cart successfully!", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add product to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle weight selection
  const handleWeightSelect = (weightOption) => {
    setSelectedWeight(weightOption);
    setSelectedWeightPrice(weightOption.price);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      setIsSignupModalOpen(true);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await axios.delete(`/api/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIsWishlisted(false);
        showToast('Removed from wishlist', 'success');
      } else {
        await axios.post('/api/wishlist', 
          { productId: product._id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setIsWishlisted(true);
        showToast('Added to wishlist', 'success');
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
      showToast('Failed to update wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    return "https://via.placeholder.com/400x400?text=No+Image";
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    // Update summary
    const newTotal = reviewSummary.totalReviews + 1;
    const newAverage = ((reviewSummary.averageRating * reviewSummary.totalReviews) + newReview.rating) / newTotal;
    const newDistribution = { ...reviewSummary.ratingDistribution };
    newDistribution[newReview.rating] = (newDistribution[newReview.rating] || 0) + 1;
    
    setReviewSummary({
      totalReviews: newTotal,
      averageRating: Math.round(newAverage * 10) / 10,
      ratingDistribution: newDistribution
    });
  };

  const handleReviewUpdate = (updatedReview) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      )
    );
  };

  const handleReviewDelete = (reviewId) => {
    setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
    // Update summary (simplified - in real app you'd recalculate from backend)
    setReviewSummary(prev => ({
      ...prev,
      totalReviews: prev.totalReviews - 1
    }));
  };

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);
  };

  const filteredReviews = selectedRating 
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getDiscountPrice = () => {
    const basePrice = selectedWeightPrice || product.price;
    if (product.discountPercentage > 0) {
      return basePrice * (1 - product.discountPercentage / 100);
    }
    return null;
  };

  const getSavings = () => {
    const basePrice = selectedWeightPrice || product.price;
    const discountPrice = getDiscountPrice();
    if (discountPrice) {
      return basePrice - discountPrice;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-8">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-purple-200 border-t-purple-600"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Loading Premium Product</h3>
          <p className="text-purple-200 text-lg">Preparing your shopping experience...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Product Not Found</h2>
          <p className="text-red-200 text-lg mb-8">{error || "The product you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </span>
          </button>
        </div>
      </div>
    );
  }

  const discountPrice = getDiscountPrice();
  const savings = getSavings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <button
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Home
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <button
                onClick={() => navigate("/products")}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Products
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="p-6 lg:p-8">
              {/* Main Product Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-6 cursor-pointer group" onClick={() => setIsZoomModalOpen(true)}>
                <img
                  src={getImageUrl(product.images && product.images[selectedImage] ? product.images[selectedImage] : product.images?.[0] || product.image)}
                  alt={product.name}
                  className="w-full h-full object-contain bg-gray-50 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x600?text=No+Image";
                  }}
                />
                
                {/* Discount Badge */}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discountPercentage}% OFF
                  </div>
                )}

                {/* New Badge */}
                {product.isNew && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    NEW
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150x150?text=No+Image";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Product Header */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                
                {/* Category Badge */}
                {product.category && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </div>
                )}
                
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.ratings || 0) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-700 font-medium ml-1">
                      {product.ratings || 0} ({product.numOfReviews || 0} reviews)
                    </span>
                  </div>
                  <div className="text-gray-400">•</div>
                  <div className="text-gray-600 text-sm">
                    SKU: {product._id}
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {discountPrice ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(discountPrice)}
                      </span>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                
                {savings > 0 && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    💰 Save {formatPrice(savings)}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-700">Availability:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Weight Selection */}
              {product.hasWeightOptions && productWeightOptions && productWeightOptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Weight</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {productWeightOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleWeightSelect(option)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedWeight && selectedWeight.weight === option.weight
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-lg">{option.weight} Kg</div>
                          <div className="text-sm font-medium text-green-600 mt-1">₹{option.price}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedWeight && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedWeight.weight} Kg
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-2 text-gray-900 bg-white min-w-[60px] text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || addingToCart || (product.hasWeightOptions && !selectedWeight)}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    product.stock > 0 && (!product.hasWeightOptions || selectedWeight)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Adding to Cart...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      {product.stock > 0 
                        ? (product.hasWeightOptions && !selectedWeight 
                            ? 'Select Weight First' 
                            : 'Add to Cart')
                        : 'Out of Stock'
                      }
                    </span>
                  )}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700"
                >
                  {wishlistLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto"></div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className={`w-6 h-6 mr-3 ${isWishlisted ? 'fill-current text-red-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                    </span>
                  )}
                </button>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">{key}</dt>
                        <dd className="text-lg font-semibold text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <ReviewSystem 
            productId={product._id} 
            onReviewAdded={() => {
              // Refresh product data to update ratings
              window.location.reload();
            }}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related Products
              </h2>
              <p className="text-gray-600 text-lg">You might also like these products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="w-full h-full flex flex-col">
                  <NewProductCard product={relatedProduct} showNewBadge={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Zoom Modal */}
        <ImageZoomModal
          isOpen={isZoomModalOpen}
          onClose={() => setIsZoomModalOpen(false)}
          images={product?.images || [product?.image]}
          currentIndex={selectedImage}
          productName={product?.name || 'Product'}
        />

        {/* Signup Modal */}
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onSuccess={() => {
            // After successful login/signup, add to cart
            handleAddToCart();
          }}
        />
      </div>
    </div>
  );
};

export default ProductDetails;