import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import SectionWrapper from "../components/SectionWrapper";

import NewProductCard from "../components/NewProductCard";
import ResponsiveBanner from "../components/ResponsiveBanner";
import WelcomeOfferPopup from "../components/WelcomeOfferPopup";

// Add CSS animations for modern effects
const modernStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .gradient-animation {
    animation: gradient 3s ease infinite;
  }
  
  /* Remove any spacing between header and banner */
  .banner-container {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .banner-content {
    margin: 0 !important;
    padding: 0 !important;
  }
`;

// Default predefined categories - will be overridden by localStorage
const defaultPredefinedCategories = [
  // Main Categories
  "All Products",
  "Cakes",
  "Sweets",
  "New Items",
  "Special Items",
  
  // Cake Flavors
  "Chocolate",
  "Butterscotch", 
  "Black Forest",
  "Gulab Jamun",
  "Rasmalai",
  "Cheese Cakes",
  "Vanilla",
  "Blueberry",
  "Strawberry",
  "Special Flavours",
  "Double Flavours",
  "Red Velvet",
  "Fruit Cakes",
  "Truffle Cakes",
  "Ferrero Rocher",
  "Mango",
  "Pineapple",
  "Kitkat Cakes",
  "Customize Cakes",
  
  // Sweet Categories
  "Indian Sweets",
  "Chocolates",
  "Cookies",
  "Pastries",
  "Donuts",
  "Cupcakes",
  "Muffins",
  "Brownies",
  "Tarts",
  "Pies",
  
  // Special Categories
  "Festival Special",
  "Wedding Cakes",
  "Birthday Cakes",
  "Anniversary Cakes",
  "Corporate Orders",
  "Custom Designs",
  "Seasonal Items",
  "Limited Edition"
];

// Load predefined categories from localStorage or use default
const getPredefinedCategories = () => {
  try {
    const saved = localStorage.getItem('predefinedCakeCategories');
    return saved ? JSON.parse(saved) : defaultPredefinedCategories;
  } catch (error) {
    console.error('Error loading predefined categories:', error);
    return defaultPredefinedCategories;
  }
};

// Get modified categories from localStorage
const getModifiedCategories = () => {
  try {
    const saved = localStorage.getItem('predefinedCategoryModifications');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading modified categories:', error);
    return {};
  }
};

// Better default images for each category
const defaultImages = {
  "Chocolate": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Butterscotch": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Black Forest": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Gulab Jamun": "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Rasmalai": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Cheese Cakes": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Vanilla": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Blueberry": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Strawberry": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Special Flavours": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Double Flavours": "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Red Velvet": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Fruit Cakes": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Truffle Cakes": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Ferrero Rocher": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Mango": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Pineapple": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Kitkat Cakes": "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center",
  "Customize Cakes": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&q=80&fm=jpg&crop=center"
};

// Menu Item Card Component with image error handling
const MenuItemCard = ({ item, index, colorConfig, navigate }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = (e) => {
    console.error('Image failed to load:', item.name, item.image, e);
    setImageError(true);
    setImageLoaded(false);
    // Use data URI directly to prevent 404 errors
    const dataUriFallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
    if (e.target) {
      e.target.src = dataUriFallback;
      e.target.onerror = null; // Prevent infinite loop
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', item.name, item.image);
    setImageLoaded(true);
    setImageError(false);
  };

  // Get the full image URL - use relative path to go through Vite proxy
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If already a full URL (starts with http:// or https://), use as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Use relative path - Vite proxy will handle it
    return imagePath;
  };

  const imageUrl = getImageUrl(item.image);
  const showImage = imageUrl && !imageError;
  console.log('MenuItemCard rendering:', item.name, 'showImage:', showImage, 'imageURL:', imageUrl);

  return (
    <div
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 w-full"
      onClick={() => {
        if (item.link) {
          navigate(item.link);
        } else {
          navigate(`/products?menuOption=${encodeURIComponent(item.name)}`);
        }
      }}
    >
      <div className="relative bg-white rounded-xl xs:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">

        {/* Image Container */}
        <div className={`relative h-32 xs:h-36 sm:h-40 md:h-48 lg:h-52 bg-gradient-to-br ${colorConfig.bg} flex items-center justify-center overflow-hidden`}>
          {/* Actual Image */}
          {showImage && (
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover object-center"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="eager"
            />
          )}

          {/* Fallback with colored circle and initials */}
          {!showImage && (
            <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.circle} flex items-center justify-center`}>
              <div className="text-center px-2">
                <div className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2`}>
                  <span className="text-white text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-white text-xs xs:text-sm sm:text-base font-semibold">{item.name}</p>
              </div>
            </div>
          )}

          {/* Sparkler effect for first item */}
          {index === 0 && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-ping"></div>
          )}
        </div>

        {/* Category name */}
        <div className="p-1.5 xs:p-2 sm:p-3 md:p-4 text-center">
          <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-black text-gray-900 uppercase tracking-wide leading-tight">{item.name}</h3>
        </div>
      </div>
    </div>
  );
};

function Home() {

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modifiedCategories, setModifiedCategories] = useState({});
  const [predefinedCategories, setPredefinedCategories] = useState(defaultPredefinedCategories);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [bestsellers, setBestsellers] = useState([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(true);
  const navigate = useNavigate();


  // Load modified categories from localStorage
  useEffect(() => {
    const loadModifiedCategories = () => {
      try {
        const saved = localStorage.getItem('predefinedCategoryModifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          setModifiedCategories(parsed);
          console.log('🏷️ Loaded modified categories:', parsed);
        } else {
          console.log('🏷️ No modified categories found in localStorage');
          setModifiedCategories({});
        }
      } catch (error) {
        console.error('Error loading modified categories:', error);
        setModifiedCategories({});
      }
    };

    const loadPredefinedCategories = () => {
      try {
        const saved = localStorage.getItem('predefinedCakeCategories');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPredefinedCategories(parsed);
          console.log('🍰 Loaded predefined categories:', parsed.length, 'categories');
        } else {
          console.log('🍰 No predefined categories found in localStorage, using default');
          setPredefinedCategories(defaultPredefinedCategories);
        }
      } catch (error) {
        console.error('Error loading predefined categories:', error);
        setPredefinedCategories(defaultPredefinedCategories);
      }
    };

    loadModifiedCategories();
    loadPredefinedCategories();

    // Listen for storage changes (when admin updates categories in different tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'predefinedCategoryModifications') {
        console.log('🔄 Storage change detected, reloading categories');
        loadModifiedCategories();
      } else if (e.key === 'predefinedCakeCategories') {
        console.log('🔄 Storage change detected, reloading predefined categories');
        loadPredefinedCategories();
      }
    };

    // Listen for custom events (when admin updates categories in same tab)
    const handleCategoryUpdate = () => {
      console.log('🔄 Custom category update event received');
      loadModifiedCategories();
    };

    const handlePredefinedCategoryDeleted = (event) => {
      console.log('🔄 Predefined category deleted event received');
      const { updatedCategories } = event.detail;
      setPredefinedCategories(updatedCategories);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('categoryUpdated', handleCategoryUpdate);
    window.addEventListener('predefinedCategoryDeleted', handlePredefinedCategoryDeleted);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoryUpdated', handleCategoryUpdate);
      window.removeEventListener('predefinedCategoryDeleted', handlePredefinedCategoryDeleted);
    };
  }, []);

  // Periodic refresh to ensure categories stay in sync
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('predefinedCategoryModifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only update if there are actual changes
          if (JSON.stringify(parsed) !== JSON.stringify(modifiedCategories)) {
            console.log('🔄 Periodic refresh detected changes, updating categories');
            setModifiedCategories(parsed);
          }
        } catch (error) {
          console.error('Error in periodic refresh:', error);
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [modifiedCategories]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setMenuLoading(true);
        console.log('🍽️ Fetching menu items from API...');
        const response = await axios.get('/api/menu/active');
        console.log('🍽️ API Response:', response.data);
        if (response.data.success) {
          console.log('✅ Menu items loaded successfully:', response.data.data.length, 'items');
          console.log('🖼️ Menu items with images:', response.data.data.map(item => ({
            name: item.name,
            image: item.image,
            hasImage: !!item.image
          })));
          // CRITICAL: Remove duplicates by name to prevent showing same menu item twice
          const menuItemsArray = response.data.data || [];
          const uniqueMenuItems = [];
          const seenNames = new Set();
          
          menuItemsArray.forEach(item => {
            const nameKey = (item.name || '').toLowerCase().trim();
            
            // Skip if duplicate name (prevent showing same menu item name twice)
            if (nameKey && seenNames.has(nameKey)) {
              console.warn('⚠️ Skipping duplicate menu item name:', item.name, '(ID:', item._id || item.id, ')');
              return;
            }
            
            // Add to unique list
            uniqueMenuItems.push(item);
            if (nameKey) {
              seenNames.add(nameKey);
            }
          });
          
          console.log('✅ Menu items after deduplication:', uniqueMenuItems.length, 'unique items (from', menuItemsArray.length, 'total)');
          setMenuItems(uniqueMenuItems);
          // Save to localStorage for offline access
          localStorage.setItem('menuItems', JSON.stringify(uniqueMenuItems));
        } else {
          console.log('❌ API response not successful:', response.data);
          // Fallback to localStorage if API response is not successful
          const saved = localStorage.getItem('menuItems');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setMenuItems(parsed);
              console.log('📋 Using fallback menu items from localStorage');
            } catch (parseError) {
              console.error('Error parsing menu items from localStorage:', parseError);
              setMenuItems([]);
            }
          } else {
            setMenuItems([]);
          }
        }
      } catch (error) {
        console.error('Error fetching menu items from API:', error);

        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('menuItems');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setMenuItems(parsed);
            console.log('📋 Using fallback menu items from localStorage');
          } catch (parseError) {
            console.error('Error parsing menu items from localStorage:', parseError);
            setMenuItems([]);
          }
        } else {
          setMenuItems([]);
        }
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuItems();

    // Listen for menu updates
    const handleMenuUpdate = () => {
      console.log('🔄 Menu update event received');
      fetchMenuItems();
    };

    window.addEventListener('menuUpdated', handleMenuUpdate);

    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdate);
    };
  }, []);

  // Fetch bestsellers
  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setBestsellersLoading(true);
        console.log('🔍 Fetching bestsellers from API...');
        const response = await axios.get('/api/products/bestsellers?limit=6');
        console.log('🔍 Full bestsellers response:', response.data);

        if (response.data.success) {
          // Backend returns: { success: true, data: { products: [...] } }
          // Axios wraps in response.data, so: response.data.data.products
          const bestsellersData = response.data.data?.products || response.data.products || [];
          console.log('🏆 Bestsellers loaded:', bestsellersData.length, 'products');
          console.log('🏆 Product names:', bestsellersData.map(p => p.name));

          // Map backend fields (snake_case) to frontend fields (camelCase)
          const mappedBestsellers = bestsellersData.map(product => ({
            _id: product.id || product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.original_price || product.originalPrice,
            discountPercentage: product.discount_percentage || product.discountPercentage,
            images: product.images || [],
            thumbnail: product.thumbnail,
            category: product.category,
            description: product.description,
            ratings: product.average_rating || product.ratings || 4.9,
            numOfReviews: product.num_reviews || product.numOfReviews || 0,
            soldCount: product.sold_count || product.soldCount || 0,
            featured: product.featured
          }));

          setBestsellers(mappedBestsellers);
          console.log('✅ Bestsellers state updated with:', mappedBestsellers.length, 'products');
        } else {
          console.warn('❌ Bestsellers API response not successful:', response.data);
          setBestsellers([]);
        }
      } catch (error) {
        console.error('❌ Error fetching bestsellers:', error);
        setBestsellers([]);
      } finally {
        setBestsellersLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  // Function to refresh modified categories (for testing)
  const refreshModifiedCategories = () => {
    try {
      const saved = localStorage.getItem('predefinedCategoryModifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        setModifiedCategories(parsed);
        console.log('🔄 Refreshed modified categories:', parsed);
        console.log('📊 Total categories with modifications:', Object.keys(parsed).length);
        console.log('📋 Categories with images:', Object.entries(parsed)
          .filter(([name, data]) => data.image)
          .map(([name, data]) => ({ name, image: data.image }))
        );
      } else {
        console.log('🔄 No modified categories found in localStorage');
        setModifiedCategories({});
      }
    } catch (error) {
      console.error('Error refreshing modified categories:', error);
      setModifiedCategories({});
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Add cache busting parameter to ensure fresh data
      const timestamp = Date.now();
      const random = Math.random();
      const [productsResponse, categoriesResponse, allCategoriesResponse] = await Promise.all([
        axios.get(`/api/products?t=${timestamp}&r=${random}`),
        axios.get(`/api/categories?t=${timestamp}&r=${random}`),
        axios.get(`/api/categories/all?t=${timestamp}&r=${random}`)
      ]);
      
       if (productsResponse.data.success) {
         // Handle both response formats: direct products array OR paginated data structure
         const productsData = productsResponse.data.products || productsResponse.data.data?.data || [];
         console.log('📦 Products loaded:', productsData.length);
         console.log('📋 Sample products with is_new:', productsData.slice(0, 3).map(p => ({
           name: p.name,
           category: p.category,
           categoryName: p.categoryName,
           is_new: p.is_new,
           isNew: p.isNew
         })));
         setProducts(productsData);
       } else {
         console.log('❌ Products API failed:', productsResponse.data);
         setProducts([]);
       }
      
      if (categoriesResponse.data.success) {
        const categoriesData = categoriesResponse.data.categories || [];
        console.log('🏷️ Categories loaded:', categoriesData.length);
        console.log('📋 All categories:', categoriesData.map(c => ({ 
          _id: c._id, 
          name: c.name,
          isActive: c.isActive
        })));
        setCategories(categoriesData);
      } else {
        console.log('❌ Categories API failed:', categoriesResponse.data);
        setCategories([]);
      }

      if (allCategoriesResponse.data.success) {
        const allCategoriesData = allCategoriesResponse.data.categories || [];
        console.log('🏷️ All categories (including inactive) loaded:', allCategoriesData.length);
        setAllCategories(allCategoriesData);
      } else {
        console.log('❌ All categories API failed:', allCategoriesResponse.data);
        setAllCategories([]);
      }
      
      
      if (!productsResponse.data.success && !categoriesResponse.data.success) {
        setError('No data available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
       setError('Failed to load data. Please try again later.');
       setProducts([]);
       setCategories([]);
       setAllCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* SK Bakers Logo */}
          <div className="mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-2">
              <span className="text-white">SK</span>
              <span className="text-yellow-400 ml-2">Bakers</span>
            </h1>
          </div>
          
          {/* Professional loading spinner */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading...</h3>
            <p className="text-gray-300">Please wait while we prepare your experience</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-purple-50 min-h-screen">
      {/* Add modern CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />

      {/* Welcome Offer Popup */}
      <WelcomeOfferPopup />

      {/* Dynamic Banner Section - Full Width - Reduced Spacing */}
      <div className="-mt-8">
      <ResponsiveBanner />
      </div>

      {/* Modern Menu Section */}
      <SectionWrapper sectionName="menu" pagePath="/">
        <div className="w-full py-8 xs:py-12 sm:py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: '#ffe8ee' }}>
          {/* Beautiful background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-100/20 via-transparent to-pink-100/20"></div>
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-pink-200/30 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-br from-pink-200/30 to-red-200/30 rounded-full blur-xl animate-pulse"></div>
          </div>
          
          <div className="w-full px-4 xs:px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-8 xs:mb-12 sm:mb-16">
              {/* Menu Header */}
              <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-red-600 mb-2 xs:mb-3 sm:mb-4 leading-tight">
                Menu
              </h2>
              <p className="text-base xs:text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
                What will you wish for?
              </p>
            </div>
            
            {/* Menu Categories Grid */}
            {menuLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {menuItems.map((item, index) => {
                  // Get color configuration
                  const colorMap = {
                    '#f59e0b': { bg: 'from-amber-100 to-amber-200', circle: 'from-amber-200 to-amber-300', text: 'text-amber-700' },
                    '#eab308': { bg: 'from-yellow-100 to-yellow-200', circle: 'from-yellow-200 to-yellow-300', text: 'text-yellow-700' },
                    '#ec4899': { bg: 'from-pink-100 to-pink-200', circle: 'from-pink-200 to-pink-300', text: 'text-pink-700' },
                    '#6b7280': { bg: 'from-gray-100 to-gray-200', circle: 'from-gray-200 to-gray-300', text: 'text-gray-700' },
                    '#14b8a6': { bg: 'from-teal-100 to-teal-200', circle: 'from-teal-200 to-teal-300', text: 'text-teal-700' },
                    '#3b82f6': { bg: 'from-blue-100 to-blue-200', circle: 'from-blue-200 to-blue-300', text: 'text-blue-700' },
                    '#10b981': { bg: 'from-green-100 to-green-200', circle: 'from-green-200 to-green-300', text: 'text-green-700' },
                    '#8b5cf6': { bg: 'from-purple-100 to-purple-200', circle: 'from-purple-200 to-purple-300', text: 'text-purple-700' },
                    '#ef4444': { bg: 'from-red-100 to-red-200', circle: 'from-red-200 to-red-300', text: 'text-red-700' },
                    '#f97316': { bg: 'from-orange-100 to-orange-200', circle: 'from-orange-200 to-orange-300', text: 'text-orange-700' }
                  };

                  const colorConfig = colorMap[item.color] || colorMap['#f59e0b'];

                  return (
                    <MenuItemCard
                      key={item._id || index}
                      item={item}
                      index={index}
                      colorConfig={colorConfig}
                      navigate={navigate}
                    />
                  );
                })}
              </div>
            )}
            
            {/* CTA Button */}
            <div className="text-center mt-16">
              <button
                onClick={() => navigate('/products')}
                className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <span className="relative z-10">View Full Menu</span>
                <svg className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Bestsellers Section */}
      <div className="w-full py-6 xs:py-8 sm:py-12 lg:py-16 bg-white">
        <div className="w-full max-w-none px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 xs:mb-6 sm:mb-8">
            {/* Star Icon */}
            <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-3 xs:mb-4">
              <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
        </div>
        
            {/* Header */}
            <div className="mb-2 xs:mb-3">
              <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">India Loves</span>
        </div>
        
            {/* Subtitle */}
            <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-600 mb-4 xs:mb-6">
              Bestsellers from across the country
            </h2>
          </div>

          {bestsellersLoading ? (
            <div className="flex justify-center items-center py-12 xs:py-16">
              <div className="animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 border-b-2 border-red-600"></div>
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="text-center py-12 xs:py-16">
              <div className="text-gray-500 text-sm xs:text-base sm:text-lg">
                No bestsellers available at the moment.
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Scrollable container */}
              <div className="flex overflow-x-auto scrollbar-hide bestsellers-scroll gap-2 xs:gap-3 sm:gap-4 lg:gap-6 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {bestsellers.map((product, index) => (
                <div
                  key={product._id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-56"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full h-52 xs:h-56 sm:h-60 md:h-64 lg:h-68">
                    {/* Vegetarian Icon */}
                    <div className="absolute top-1 xs:top-2 left-1 xs:left-2 z-10">
                      <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
                        <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
            
                    {/* Product Image */}
                    <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs xs:text-sm hidden">
                        <span>No Image</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-1.5 xs:p-2 sm:p-3">
                      <h3 className="text-xs xs:text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs xs:text-sm font-bold text-gray-900">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
          </div>
          
                        {/* Heart Icon */}
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                        </button>
              </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {/* Star Rating Badge */}
                        <div className="flex items-center bg-yellow-500 px-1.5 py-0.5 rounded gap-0.5">
                          <span className="text-white text-[10px] xs:text-xs font-bold">
                            {Number(product.ratings || 4.9).toFixed(1)}
                          </span>
                          <svg className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-white fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>

                        {/* Review Count */}
                        <span className="text-[10px] xs:text-xs text-gray-600">
                          ({(product.numOfReviews || Math.floor(Math.random() * 10000) + 1000).toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              
              {/* Scroll indicators */}
              <div className="flex justify-center mt-3 xs:mt-4 space-x-1 xs:space-x-2">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-red-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-300 rounded-full"></div>
              </div>
          </div>
          )}
        </div>
      </div>

      {/* New Products Section */}
      <div className="w-full py-6 xs:py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-none px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 xs:mb-8 sm:mb-12">
            {/* Sparkle Icon */}
            <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 xs:mb-4">
              <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
           </div>
           
            {/* Header */}
            <div className="mb-2 xs:mb-3">
              <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">Fresh Arrivals</span>
           </div>
           
            {/* Subtitle */}
            <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-600 mb-4 xs:mb-6">
              Discover our latest bakery creations
            </h2>
                 </div>

          {loading ? (
            <div className="flex justify-center items-center py-12 xs:py-16">
              <div className="animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : products.filter(p => p.is_new === 1 || p.is_new === true || p.isNew === true).length === 0 ? (
            <div className="text-center py-12 xs:py-16">
              <div className="text-gray-500 text-sm xs:text-base sm:text-lg">
                No new products available at the moment.
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Scrollable container */}
              <div className="flex overflow-x-auto scrollbar-hide new-products-scroll gap-2 xs:gap-3 sm:gap-4 lg:gap-6 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {products.filter(p => p.is_new === 1 || p.is_new === true || p.isNew === true).slice(0, 6).map((product, index) => (
                <div
                  key={product._id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-56"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full h-52 xs:h-56 sm:h-60 md:h-64 lg:h-68">
                    {/* New Badge */}
                    <div className="absolute top-1 xs:top-2 left-1 xs:left-2 z-10">
                      <div className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">N</span>
                 </div>
               </div>

                    {/* Product Image */}
                    <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs xs:text-sm hidden">
                        <span>No Image</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-1.5 xs:p-2 sm:p-3">
                      <h3 className="text-xs xs:text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs xs:text-sm font-bold text-gray-900">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </span>
             )}
           </div>

                        {/* Heart Icon */}
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                   </svg>
               </button>
             </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1">
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
                          <span className="text-xs font-medium text-gray-900 ml-1">
                            {product.ratings || 4.9}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.numOfReviews || Math.floor(Math.random() * 10000) + 1000})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              
              {/* Scroll indicators */}
              <div className="flex justify-center mt-3 xs:mt-4 space-x-1 xs:space-x-2">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-300 rounded-full"></div>
              </div>
             </div>
           )}
         </div>
       </div>

      {/* Call to Action Section with Epic Cake Decorations */}
      <div className="w-full bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 py-12 relative overflow-hidden">
        {/* Clean background for final CTA */}
        <div className="w-full max-w-none text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready to Sweeten Your Celebration?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their special moments. 
            Order now and taste the magic!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 px-6 sm:py-4 sm:px-10 rounded-lg sm:rounded-xl text-sm sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
            >
                             <span className="flex items-center justify-center">
                 <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                 </svg>
                 Order Cakes Now
                 <svg className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                 </svg>
               </span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="group bg-transparent hover:bg-white/10 text-white font-bold py-2.5 px-6 sm:py-4 sm:px-10 rounded-lg sm:rounded-xl text-sm sm:text-lg transition-all duration-300 border-2 border-white hover:border-white/80 backdrop-blur-sm"
            >
                             <span className="flex items-center justify-center">
                 <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
                 Contact Us
                 <svg className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
               </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
