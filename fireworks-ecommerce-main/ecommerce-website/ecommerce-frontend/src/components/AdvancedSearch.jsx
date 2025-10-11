import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';

const AdvancedSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    sortBy: 'relevance',
    sortOrder: 'desc',
    tags: [],
    brand: '',
    discount: false,
    featured: false
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    tags: [],
    priceRange: { min: 0, max: 1000 }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');

  useEffect(() => {
    if (isOpen) {
      fetchPopularSearches();
      fetchFilterOptions();
      searchRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPopularSearches = async () => {
    try {
      // Get popular searches from products data
      const response = await axios.get('/api/products');
      if (response.data.success) {
        const products = response.data.products || [];
        const popularTags = [];
        
        // Extract popular tags from products
        products.forEach(product => {
          if (product.tags && Array.isArray(product.tags)) {
            product.tags.forEach(tag => {
              if (!popularTags.includes(tag)) {
                popularTags.push(tag);
              }
            });
          }
        });
        
        setPopularSearches(popularTags.slice(0, 8)); // Limit to 8 popular searches
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      // Fallback to default popular searches
      setPopularSearches(['chocolate', 'vanilla', 'strawberry', 'birthday', 'wedding', 'cupcake', 'cookies', 'dessert']);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        const products = response.data.products || [];
        console.log('🔍 Products for filter options:', products.length);
        
        const categories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];
        const brands = [...new Set(products.map(p => p.seller).filter(Boolean))]; // Changed from p.brand to p.seller
        const tags = [...new Set(products.flatMap(p => p.tags || []))];
        const prices = products.map(p => p.price).filter(Boolean);
        
        console.log('🔍 Filter options:', { categories, brands, tags, prices: prices.length });
        
        setFilterOptions({
          categories,
          brands,
          tags,
          priceRange: { 
            min: prices.length > 0 ? Math.min(...prices) : 0, 
            max: prices.length > 0 ? Math.max(...prices) : 1000 
          }
        });
        console.log('🔍 Filter options set:', { categories, brands, tags });
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      // Fallback to default options
      setFilterOptions({
        categories: ['Birthday Cakes', 'Wedding Cakes', 'Cupcakes', 'Cookies', 'Desserts', 'Brownies', 'Muffins', 'Pies', 'Tarts', 'Candies', 'Pastries'],
        brands: ['SK Bakers'],
        tags: ['chocolate', 'vanilla', 'strawberry', 'birthday', 'wedding', 'cupcake', 'cookies', 'dessert', 'fresh', 'custom'],
        priceRange: { min: 99, max: 2999 }
      });
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        const products = response.data.products || [];
        const queryLower = query.toLowerCase();
        
        const suggestions = products
          .filter(product => 
            product.name.toLowerCase().includes(queryLower) ||
            product.description?.toLowerCase().includes(queryLower) ||
            product.tags?.some(tag => tag.toLowerCase().includes(queryLower))
          )
          .slice(0, 5)
          .map(product => ({
            text: product.name,
            type: 'product',
            id: product._id,
            image: product.images?.[0],
            price: product.price
          }));
        
        setSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/products?category=${suggestion.id}`);
    } else if (suggestion.type === 'tag') {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, suggestion.text]
      }));
    }
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterName, value) => {
    console.log('🔍 Filter change:', filterName, value);
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleTagRemove = (tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSearch = () => {
    console.log('🔍 Handle search called with:', { searchQuery, filters });
    
    const searchParams = new URLSearchParams();
    
    // Map to the parameter names expected by ProductListing page
    if (searchQuery) searchParams.set('search', searchQuery); // Changed from 'query' to 'search'
    if (filters.category) searchParams.set('category', filters.category);
    if (filters.minPrice) searchParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice);
    if (filters.rating) searchParams.set('rating', filters.rating);
    if (filters.inStock) searchParams.set('availability', 'inStock'); // Changed from 'inStock' to 'availability'
    if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);
    if (filters.tags.length > 0) searchParams.set('tags', filters.tags.join(','));
    if (filters.brand) searchParams.set('brand', filters.brand);
    if (filters.discount) searchParams.set('discount', filters.discount);
    if (filters.featured) searchParams.set('featured', filters.featured);

    const searchUrl = `/products?${searchParams.toString()}`;
    console.log('🔍 Navigating to:', searchUrl);
    
    navigate(searchUrl);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      sortBy: 'relevance',
      sortOrder: 'desc',
      tags: [],
      brand: '',
      discount: false,
      featured: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 9999 }}>
      <div ref={searchRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col" style={{ position: 'relative', zIndex: 10000 }}>
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
                <p className="text-red-100 text-sm">Find your perfect bakery products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex-1 overflow-y-auto min-h-0">
          {/* Main Search Input - Always Visible */}
          <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-8 mb-8 border-4 border-red-300 shadow-2xl">
            <label className="block text-2xl font-bold text-red-900 mb-6 flex items-center">
              <svg className="w-8 h-8 mr-3 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Products
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for cakes, sweets, desserts..."
                className="w-full pl-16 pr-6 py-6 border-4 border-red-400 rounded-2xl focus:outline-none focus:ring-6 focus:ring-red-500 focus:border-red-600 text-xl placeholder-red-500 bg-white shadow-xl font-semibold"
                style={{ minHeight: '80px', fontSize: '20px' }}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border-4 border-red-300 rounded-2xl shadow-2xl z-10 max-h-80 overflow-y-auto mt-4">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-6 py-4 text-left hover:bg-red-50 hover:text-red-700 flex items-center space-x-4 border-b-2 border-red-100 last:border-b-0 transition-colors duration-200 text-lg font-medium"
                    >
                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.text}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.text}</div>
                        {suggestion.price && (
                          <div className="text-sm text-gray-500">₹{suggestion.price}</div>
                        )}
                      </div>
                      <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        {suggestion.type}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 sm:mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'search' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔍 Search
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'filters' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⚙️ Filters
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Popular Searches */}
              {!searchQuery && popularSearches.length > 0 && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 hover:text-red-800 rounded-full text-sm font-semibold transition-all border-2 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results Preview */}
              {searchQuery && (
                <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-md">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Search Results for: "{searchQuery}"
                  </h3>
                  <p className="text-green-700 font-medium">Click "Search Products" to see results with your current filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Filters Tab */}
          {activeTab === 'filters' && (
            <div className="space-y-6 min-h-[400px]">
              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">📂 Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories && filterOptions.categories.length > 0 ? (
                      filterOptions.categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))
                    ) : (
                      <>
                        <option value="Birthday Cakes">Birthday Cakes</option>
                        <option value="Wedding Cakes">Wedding Cakes</option>
                        <option value="Cupcakes">Cupcakes</option>
                        <option value="Cookies">Cookies</option>
                        <option value="Desserts">Desserts</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">🏷️ Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                  >
                    <option value="">All Brands</option>
                    {filterOptions.brands && filterOptions.brands.length > 0 ? (
                      filterOptions.brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))
                    ) : (
                      <>
                        <option value="SK Bakers">SK Bakers</option>
                        <option value="Sweet Dreams">Sweet Dreams</option>
                        <option value="Bakery House">Bakery House</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">⭐ Minimum Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">⭐ 4+ Stars</option>
                    <option value="3">⭐ 3+ Stars</option>
                    <option value="2">⭐ 2+ Stars</option>
                    <option value="1">⭐ 1+ Stars</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">💰 Min Price (₹)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min price"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">💰 Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max price"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                  />
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">🔄 Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                    <option value="newest">Newest</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Filters */}
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">⚙️</span>
                  Additional Filters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <label className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-red-50 cursor-pointer border-2 border-transparent hover:border-red-200 transition-all">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-gray-800">📦 In Stock Only</span>
                  </label>

                  <label className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-red-50 cursor-pointer border-2 border-transparent hover:border-red-200 transition-all">
                    <input
                      type="checkbox"
                      checked={filters.discount}
                      onChange={(e) => handleFilterChange('discount', e.target.checked)}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-gray-800">🏷️ On Sale</span>
                  </label>

                  <label className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-red-50 cursor-pointer border-2 border-transparent hover:border-red-200 transition-all">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-gray-800">⭐ Featured</span>
                  </label>
                </div>
              </div>

              {/* Selected Tags */}
              {filters.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Selected Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 bg-white gap-4 sm:gap-0 mt-6">
            <button
              onClick={clearFilters}
              className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all text-sm sm:text-base w-full sm:w-auto"
            >
              Clear All Filters
            </button>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-6 sm:px-8 py-2 sm:py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Search Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
