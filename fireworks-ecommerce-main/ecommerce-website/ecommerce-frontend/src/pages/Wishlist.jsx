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
      const response = await axios.get("/api/wishlist");
      
      if (response.data.success) {
        setWishlist(response.data.wishlist.products);
      } else {
        setError("Failed to load wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to load wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await axios.delete(`/api/wishlist/remove/${productId}`);
      
      if (response.data.success) {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
        showToast("Product removed from wishlist", "success");
      } else {
        showToast("Failed to remove product", "error");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showToast("Failed to remove product from wishlist", "error");
    }
  };

  const addToCart = async (product) => {
    try {
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          _id: product.product._id,
          name: product.product.name,
          price: product.product.price,
          image: product.product.images && product.product.images[0] ? product.product.images[0].url : product.product.image,
          stock: product.product.stock,
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
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                 <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
           <p className="mt-4 text-gray-600">Loading your wishlist...</p>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                 <div className="text-center">
           <div className="text-red-500 text-6xl mb-4">⚠️</div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
           <p className="text-gray-600 mb-4">{error}</p>
           <button
             onClick={fetchWishlist}
             className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
           >
             Try Again
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            
            {wishlist.length > 0 && (
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <button
                  onClick={clearWishlist}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                               <div className="text-red-500 mb-4">
                     <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                   </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding products you love to your wishlist
            </p>
                         <button
               onClick={() => navigate("/products")}
               className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
             >
               Browse Products
             </button>
          </div>
        ) : (
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
            {wishlist.map((item) => (
                              <div key={item.productId} className="w-full h-full flex flex-col">
                                     <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                     {/* Product Image */}
                     <div className="relative">
                       <img
                         src={getImageUrl(item.product.images?.[0] || item.product.image)}
                         alt={item.product.name}
                         className="w-full h-32 sm:h-36 md:h-44 lg:h-48 object-cover"
                         onError={(e) => {
                           e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                         }}
                       />
                    
                   {/* Remove from Wishlist Button */}
                   <button
                     onClick={() => removeFromWishlist(item.productId)}
                     className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>

                 {/* Product Info */}
                 <div className="p-3 sm:p-4 lg:p-5">
                   <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base lg:text-lg">
                     {item.product.name}
                   </h3>
                   
                   <div className="flex items-center mb-2">
                     <div className="flex items-center">
                       <span className="text-yellow-400 text-sm sm:text-base">★</span>
                       <span className="ml-1 text-gray-600 text-xs sm:text-sm">{item.product.ratings || 0}</span>
                       <span className="ml-1 text-gray-400 text-xs sm:text-sm">({item.product.numOfReviews || 0})</span>
                     </div>
                   </div>

                   <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3">
                     ₹{item.product.price?.toLocaleString()}
                   </div>

                   {/* Stock Status */}
                   <div className="mb-3">
                     <span className={`text-xs sm:text-sm font-medium ${
                       item.product.stock > 0 ? 'text-green-600' : 'text-red-600'
                     }`}>
                       {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                     </span>
                   </div>

                   {/* Action Buttons */}
                   <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                     <button
                       onClick={() => addToCart(item)}
                       disabled={item.product.stock === 0}
                       className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                         item.product.stock > 0
                           ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                       }`}
                     >
                       Add to Cart
                     </button>
                     
                     <button
                       onClick={() => navigate(`/product/${item.productId}`)}
                       className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md transition-colors"
                     >
                       View Details
                     </button>
                   </div>

                   {/* Added Date */}
                   <div className="mt-3 text-xs text-gray-500">
                     Added {new Date(item.addedAt).toLocaleDateString()}
                   </div>
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
