import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SearchFilter from "../components/SearchFilter";
import ResponsiveBanner from "../components/ResponsiveBanner";
import axios from "../axios";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || searchParams.get("flavor") || "all", // Support both 'category' and 'flavor' parameters
    subCategory: searchParams.get("subCategory") || "",
    brand: searchParams.get("brand") || "all",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
    availability: searchParams.get("availability") || "all",
    menuOption: searchParams.get("menuOption") || ""
  });
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);

  // Update filters when URL parameters change
  useEffect(() => {
    const newFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || searchParams.get("flavor") || "all",
      subCategory: searchParams.get("subCategory") || "",
      brand: searchParams.get("brand") || "all",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      sortBy: searchParams.get("sortBy") || "relevance",
      availability: searchParams.get("availability") || "all",
      menuOption: searchParams.get("menuOption") || ""
    };

    console.log('🔍 URL parameters changed:', newFilters);
    setFilters(newFilters);
  }, [searchParams]);

  useEffect(() => {
    console.log('🚀 FETCH TRIGGER - filters:', filters, 'page:', pagination.currentPage);
    fetchProducts();
  }, [filters, pagination.currentPage]);

  // Auto-refresh products when page becomes visible (user returns from admin panel)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔍 Page became visible, refreshing products...');
        fetchProducts();
      }
    };

    const handleFocus = () => {
      console.log('🔍 Window focused, refreshing products...');
      fetchProducts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Store previous product count to detect new products
  const [previousProductCount, setPreviousProductCount] = useState(0);
  
  useEffect(() => {
    if (products.length > 0 && previousProductCount > 0 && products.length > previousProductCount) {
      const newProductsCount = products.length - previousProductCount;
      console.log(`🆕 ${newProductsCount} new products detected!`);
      // You can add a toast notification here if you have a toast system
    }
    setPreviousProductCount(products.length);
  }, [products.length, previousProductCount]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    console.log('🔍 ProductListing: fetchProducts called');
    console.log('🔍 Current filters:', JSON.stringify(filters, null, 2));
    console.log('🔍 Filter values breakdown:', {
      search: `"${filters.search}"`,
      category: `"${filters.category}"`,
      subCategory: `"${filters.subCategory}"`,
      brand: `"${filters.brand}"`,
      minPrice: `"${filters.minPrice}"`,
      maxPrice: `"${filters.maxPrice}"`,
      rating: `"${filters.rating}"`,
      sortBy: `"${filters.sortBy}"`,
      availability: `"${filters.availability}"`,
      menuOption: `"${filters.menuOption}"`
    });
    
    try {
      const params = new URLSearchParams();
      
      // Add cache busting to ensure fresh data
      const timestamp = Date.now();
      const random = Math.random();
      params.append("t", timestamp.toString());
      params.append("r", random.toString());
      
      console.log('🔍 ProductListing: Cache busting params added:', { timestamp, random });
      
      // Add pagination
      params.append("page", pagination.currentPage.toString());
      params.append("limit", "12");
      
      // Handle category/flavor parameter specially
      if (filters.category && filters.category !== "all") {
        // Define main categories (these should use category parameter)
        const mainCategories = [
          'Daughters Day Cakes', 'Cakes', 'Trending Cakes', 'Theme Cakes', 
          'By Relationship', 'Desserts', 'Birthday', 'Anniversary', 'Customized Cakes'
        ];
        
        // Check if the selected category is a main category
        const isMainCategory = mainCategories.includes(filters.category);
        
        console.log('🔍 Category detection:', {
          category: filters.category,
          mainCategories: mainCategories,
          isMainCategory: isMainCategory
        });
        
        if (isMainCategory) {
          console.log('✅ Detected as main category, adding category parameter');
          params.append("category", filters.category);
        } else {
          console.log('✅ Not a main category, treating as sub-category/flavor, adding flavor parameter');
          params.append("flavor", filters.category);
        }
      }
      
      // Add other filters to params (excluding category and menuOption which are handled separately)
      // Also exclude "all" values as the backend treats "all" as a literal value
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "" && value !== "all" && key !== "category" && key !== "menuOption") {
          params.append(key, value);
        }
      });
      
      // Add menuOption filter if present
      if (filters.menuOption && filters.menuOption !== "") {
        params.append("menuOption", filters.menuOption);
        console.log('🔍 ProductListing: Added menuOption to params:', filters.menuOption);
      }
      
      // Fetch products with all filters
      console.log('🔍 ProductListing: Final params string:', params.toString());
      console.log('🔍 ProductListing: Checking for duplicate menuOption...');
      const paramString = params.toString();
      const menuOptionCount = (paramString.match(/menuOption=/g) || []).length;
      console.log('🔍 ProductListing: menuOption appears', menuOptionCount, 'times in URL');
      console.log('🔍 ProductListing: Full URL:', `${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/products?${params}`);
      console.log('🔍 ProductListing: Axios baseURL:', axios.defaults.baseURL);
      console.log('🔍 ProductListing: Request URL will be:', `${axios.defaults.baseURL}/api/products?${params}`);
      
      // Check if menuOption is being passed correctly
      console.log('🔍 ProductListing: menuOption filter value:', filters.menuOption);
      console.log('🔍 ProductListing: All filters:', filters);
      
      console.log('🔍 ProductListing: Making API call...');
      const response = await axios.get(`/api/products?${params}`);
      console.log('🔍 ProductListing: API Response received:', response.data);
      console.log('🔍 ProductListing: Response status:', response.status);
      console.log('🔍 ProductListing: Response headers:', response.headers);
      
      if (response.data.success) {
        // Backend returns: { success: true, data: { data: [...products], pagination: {...} } }
        const productsData = response.data.data?.data || response.data.products || [];
        const paginationData = response.data.data?.pagination || response.data.pagination || {};

        console.log('✅ Products received:', productsData.length);
        console.log('✅ productsData is array?', Array.isArray(productsData));

        if (productsData.length === 0) {
          console.warn('⚠️ API returned 0 products. Filters:', filters);
          console.warn('⚠️ API URL params:', params.toString());
        }

        // Map backend fields (snake_case) to frontend fields (camelCase)
        const mappedProducts = productsData.map(product => ({
          _id: product.id || product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price || product.originalPrice,
          discountPercentage: product.discount_percentage || product.discountPercentage,
          stock: product.stock,
          images: product.images || [],
          thumbnail: product.thumbnail,
          brand: product.brand || "",
          category: product.category || "",
          subCategory: product.sub_category || product.subCategory || "",
          menuOption: product.menu_option || product.menuOption || "",
          cakeFlavor: product.cake_flavor || product.cakeFlavor,
          description: product.description || "",
          featured: product.featured || false,
          isNew: product.is_new || product.isNew || false,
          averageRating: product.average_rating || product.averageRating || 0,
          numReviews: product.num_reviews || product.numReviews || 0,
          soldCount: product.sold_count || product.soldCount || 0,
          createdAt: product.created_at || product.createdAt,
          updatedAt: product.updated_at || product.updatedAt
        }));

        setProducts(mappedProducts);
        console.log('✅ Products state updated with:', mappedProducts.length, 'products');

        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.currentPage || prev.currentPage,
          totalPages: paginationData.totalPages || 1,
          totalProducts: paginationData.totalItems || mappedProducts.length,
          hasNextPage: paginationData.hasNextPage || false,
          hasPrevPage: paginationData.hasPrevPage || false
        }));
      } else {
        console.log('❌ API returned success: false');
        console.log('❌ API response:', response.data);
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("❌ ProductListing: Error fetching products:", error);
      console.error("❌ ProductListing: Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        stack: error.stack
      });
      setError("Failed to load products. Please try again.");
    } finally {
      console.log('🔍 ProductListing: fetchProducts completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== "") {
        newSearchParams.append(key, value);
      }
    });
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "all",  // Changed from "" to "all" to match initial state
      subCategory: "",  // Added missing field
      brand: "all",     // Changed from "" to "all" to match initial state
      minPrice: "",
      maxPrice: "",
      rating: "",       // Added missing field
      sortBy: "relevance",
      availability: "all",
      menuOption: ""    // Added missing field
    };
    console.log('🧹 Clearing filters to:', clearedFilters);
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== "" && value !== "relevance" && value !== "all").length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
            onClick={fetchProducts}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-4 py-8">
        {/* Banner Section */}
        <div className="mb-4 -mt-4">
          <ResponsiveBanner />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {pagination.totalProducts} products found
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-between sm:justify-end space-x-2 sm:space-x-4 mt-4 sm:mt-0 gap-2">
              {/* Refresh Button */}
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Enhanced Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                title={showFilters ? 'Hide filter options' : 'Show filter options for products'}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                  showFilters 
                    ? 'bg-pink-600 text-white shadow-lg transform scale-105' 
                    : 'bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 hover:shadow-md'
                }`}
              >
                {/* Enhanced Filter Icon */}
                <div className="relative">
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    {/* Funnel/Filter Icon */}
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    {/* Filter lines inside funnel */}
                    <path d="M6 8h12M8 12h8M10 16h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                  
                  {/* Active indicator dot */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {showFilters ? 'Hide Filters' : 'Filter Products'}
                  </span>
                  <span className="text-xs opacity-75">
                    {showFilters ? 'Close filter panel' : 'Sort & filter options'}
                  </span>
                </div>
                
                {/* Enhanced Badge */}
                {getActiveFiltersCount() > 0 && (
                  <span className={`text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold ${
                    showFilters 
                      ? 'bg-white text-pink-600' 
                      : 'bg-pink-600 text-white'
                  }`}>
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (value && value !== "" && value !== "relevance" && value !== "all") {
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
                    >
                      {key}: {value}
                      <button
                        onClick={() => handleFilterChange({ [key]: "" })}
                        className="ml-2 text-pink-600 hover:text-pink-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={clearFilters}
                className="text-sm text-pink-600 hover:text-pink-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full lg:w-80">
              <SearchFilter
                products={products}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 w-full">
            {console.log('🔍 Rendering - products.length:', products.length, 'products:', products)}
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-12 text-center">
                <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🔍</div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-pink-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-pink-700 transition duration-200 text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid/List */}
                <div className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"
                    : "grid grid-cols-1 gap-4"
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === pagination.currentPage
                              ? "bg-pink-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
