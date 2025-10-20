import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import axios from "../axios";

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { dispatch } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Wishlist: Fetching wishlist...');
      const response = await axios.get("/api/wishlist");
      console.log('🔍 Wishlist: Response:', response.data);

      if (response.data && response.data.success) {
        const wishlistData = response.data.data?.wishlist
          || response.data.wishlist
          || response.data.products
          || [];

        console.log('✅ Wishlist: Loaded', wishlistData.length, 'products');
        setWishlist(wishlistData);
      } else {
        console.warn('❌ Wishlist: Response not successful');
        setWishlist([]);
        setError("Failed to load wishlist");
      }
    } catch (error) {
      console.error("❌ Wishlist: Error fetching wishlist:", error);
      setWishlist([]);

      if (error.response?.status === 404) {
        setError("Wishlist not found. Your wishlist is empty.");
      } else if (error.response?.status === 401) {
        setError("Please log in to view your wishlist.");
      } else {
        setError("Failed to load wishlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log('🗑️ Removing from wishlist, product_id:', productId);
      const response = await axios.delete(`/api/wishlist/remove/${productId}`);

      if (response.data.success) {
        setWishlist(prev => prev.filter(item => item.product_id !== productId));
        showToast("Product removed from wishlist", "success");
      } else {
        showToast("Failed to remove product", "error");
      }
    } catch (error) {
      console.error("❌ Error removing from wishlist:", error);
      showToast("Failed to remove product from wishlist", "error");
    }
  };

  const addToCart = async (item) => {
    try {
      const imageUrl = item.images && item.images[0]
        ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
        : item.thumbnail || item.image || '';

      dispatch({
        type: "ADD_TO_CART",
        payload: {
          _id: item.product_id,
          name: item.name,
          price: item.price,
          image: imageUrl,
          stock: item.stock || 0,
          quantity: 1
        }
      });

      showToast("Product added to cart!", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add product to cart", "error");
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your wishlist?")) {
      return;
    }

    try {
      const response = await axios.delete("/api/wishlist/clear");

      if (response.data.success) {
        setWishlist([]);
        showToast("Wishlist cleared successfully", "success");
      } else {
        showToast("Failed to clear wishlist", "error");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      showToast("Failed to clear wishlist", "error");
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-7xl mb-6">⚠️</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-base md:text-lg">{error}</p>
          <button
            onClick={fetchWishlist}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8 lg:py-12">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                My Wishlist
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {wishlist?.length || 0} {(wishlist?.length || 0) === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {wishlist?.length > 0 && (
              <button
                onClick={clearWishlist}
                className="w-full sm:w-auto px-5 py-2.5 text-sm md:text-base text-red-600 hover:text-red-800 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Clear Wishlist
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {!wishlist || wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 lg:p-16 text-center">
            <div className="text-red-500 mb-6">
              <svg className="mx-auto h-20 w-20 md:h-24 md:w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-red-600 text-white px-8 py-3 md:px-10 md:py-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium text-sm md:text-base"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
            {wishlist.filter(item => item && item.product_id).map((item) => (
              <div
                key={item.product_id || item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border border-gray-200 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={getImageUrl(item.images?.[0] || item.thumbnail || item.image)}
                    alt={item.name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image";
                    }}
                  />

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-700 hover:text-red-600 transition-all transform hover:scale-110 z-10"
                    title="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Discount Badge */}
                  {item.discount_percentage > 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {Math.round(item.discount_percentage)}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-[11px] sm:text-xs leading-tight">
                    {item.name || 'Unnamed Product'}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mb-1">
                    <span className="text-yellow-400 text-[10px] sm:text-xs">★</span>
                    <span className="ml-0.5 text-gray-900 text-[10px] sm:text-xs font-medium">
                      {(parseFloat(item.average_rating) || parseFloat(item.ratings) || 0).toFixed(1)}
                    </span>
                    <span className="ml-0.5 text-gray-500 text-[9px] sm:text-[10px]">
                      ({parseInt(item.num_reviews) || parseInt(item.numOfReviews) || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="text-sm sm:text-base font-bold text-gray-900">
                      ₹{item.price?.toLocaleString() || '0'}
                    </div>
                    {item.original_price && item.original_price > item.price && (
                      <div className="text-[9px] sm:text-[10px] text-gray-500 line-through">
                        ₹{item.original_price?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Stock Status - Hidden on mobile to save space */}
                  <div className="mb-1 hidden sm:block">
                    <div className={`inline-flex items-center text-[10px] font-medium ${
                      (item.stock || 0) > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(item.stock || 0) > 0 ? (
                        <>
                          <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item.stock} in stock
                        </>
                      ) : (
                        'Out of stock'
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-1">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={(item.stock || 0) === 0}
                      className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-semibold rounded transition-colors ${
                        (item.stock || 0) > 0
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() => navigate(`/product/${item.product_id}`)}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Added Date - Hidden on mobile */}
                  <div className="mt-1 sm:mt-2 text-center hidden sm:block">
                    <p className="text-[10px] text-gray-500">
                      Added {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
