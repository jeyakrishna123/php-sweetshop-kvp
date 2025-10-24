import { useState, useEffect } from "react";
import axios from "../axios";

const SearchFilter = ({ products, filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');
  const [selectedSubCategory, setSelectedSubCategory] = useState(filters?.subCategory || '');
  const [localFilters, setLocalFilters] = useState({
    search: filters?.search || '',
    category: filters?.category || 'all',
    subCategory: filters?.subCategory || '',
    brand: filters?.brand || 'all',
    minPrice: filters?.minPrice || '',
    maxPrice: filters?.maxPrice || '',
    rating: filters?.rating || '',
    availability: filters?.availability || 'all',
    sortBy: filters?.sortBy || 'relevance'
  });

  // Define the hierarchical category structure based on the menu
  const categoryStructure = {
    'Cakes': {
      subcategories: [
        'Birthday Cakes',
        'Anniversary Cakes', 
        'Wedding Cakes',
        'Chocolate Cakes',
        'Vanilla Cakes',
        'Red Velvet Cakes',
        'Cheese Cakes',
        'Designer Cakes'
      ]
    },
    'Theme Cakes': {
      subcategories: [
        '1st Birthday Cakes',
        'Princess Cakes',
        'Animal Cakes',
        'Masha & The Bear Cakes',
        'Cakes For Boys',
        'Cakes For Girls',
        'Number Cakes',
        'Alphabet Cakes'
      ]
    },
    'By Relationship': {
      subcategories: [
        'For Husband',
        'For Wife',
        'For Boyfriend',
        'For Girlfriend',
        'For Father',
        'For Mother',
        'For Brother',
        'For Sister'
      ]
    },
    'Desserts': {
      subcategories: [
        'Cookies',
        'Pastries',
        'Cupcakes',
        'Muffins',
        'Brownies',
        'Tarts',
        'Puddings',
        'Ice Cream'
      ]
    },
    'Birthday': {
      subcategories: [
        'Kids Birthday',
        'Adult Birthday',
        'Surprise Cakes',
        'Photo Cakes',
        'Number Cakes',
        'Character Cakes'
      ]
    },
    'Anniversary': {
      subcategories: [
        'Wedding Anniversary',
        'Relationship Anniversary',
        'Romantic Cakes',
        'Heart Shaped Cakes',
        'Special Occasion Cakes'
      ]
    }
  };

  console.log('🔍 SearchFilter rendered - categories:', categories);

  useEffect(() => {
    // Fetch categories on component mount
    fetchCategories();

    // Fetch brands only when products are available
    if (products && products.length > 0) {
      fetchBrands();
    }
  }, [products]);

  // Update local filters when props change
  useEffect(() => {
    if (filters) {
      setLocalFilters(prev => ({
        ...prev,
        ...filters
      }));
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      console.log('📂 Categories API response:', response.data);

      if (response.data.success) {
        // Show all categories from API
        const allCategories = response.data.categories || response.data.data || [];
        console.log('📂 Categories loaded:', allCategories.length);
        console.log('📂 Categories type:', typeof allCategories, Array.isArray(allCategories));

        // Ensure it's an array
        if (Array.isArray(allCategories)) {
          setCategories(allCategories);
        } else {
          console.warn('⚠️ Categories is not an array:', allCategories);
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      console.error("❌ Error details:", error.response?.data);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchBrands = async () => {
    try {
      // Extract unique brands from current products
      const uniqueBrands = [...new Set(products
        .map(product => product.brand || product.seller)
        .filter(brand => brand && brand.trim() !== ''))];
      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ [field]: value });
    }
    
    if (onSearch && field === 'search') {
      onSearch(value);
    }
    
    if (onFilter) {
      applyFilters(newFilters);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ [field]: value });
    }
    
    if (onFilter) {
      applyFilters(newFilters);
    }
  };

  const applyFilters = (filters) => {
    if (!products || !onFilter) return;
    
    let filtered = [...products];
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category === filters.category || 
        product.categoryName === filters.category
      );
    }
    
    // Subcategory filter
    if (filters.subCategory && filters.subCategory !== '') {
      filtered = filtered.filter(product => 
        product.subCategory === filters.subCategory ||
        product.subcategory === filters.subCategory ||
        product.categoryName === filters.subCategory
      );
    }
    
    // Brand filter
    if (filters.brand && filters.brand !== 'all') {
      filtered = filtered.filter(product => (product.brand === filters.brand || product.seller === filters.brand));
    }
    
    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }
    
    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(product => product.ratings >= filters.rating);
    }
    
    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'inStock') {
        filtered = filtered.filter(product => product.stock > 0);
      } else if (filters.availability === 'outOfStock') {
        filtered = filtered.filter(product => product.stock === 0);
      } else if (filters.availability === 'lowStock') {
        filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
      }
    }
    
    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'relevance':
            return 0; // Keep original order
          case 'priceLowToHigh':
            return a.price - b.price;
          case 'priceHighToLow':
            return b.price - a.price;
          case 'rating':
            return b.ratings - a.ratings;
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'popularity':
            return b.numOfReviews - a.numOfReviews;
          default:
            return 0;
        }
      });
    }
    
    onFilter(filtered);
  };

  const handlePriceRangeChange = (field, value) => {
    const numValue = value === '' ? '' : parseInt(value);
    const newFilters = { ...localFilters, [field]: numValue };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ [field]: numValue });
    }
    
    if (onFilter) {
      applyFilters(newFilters);
    }
  };

  const handleRatingChange = (rating) => {
    const newRating = rating === localFilters.rating ? '' : rating;
    const newFilters = { ...localFilters, rating: newRating };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ rating: newRating });
    }
    
    if (onFilter) {
      applyFilters(newFilters);
    }
  };

  const handleAvailabilityChange = (availability) => {
    const newFilters = { ...localFilters, availability };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ availability });
    }
    
    if (onFilter) {
      applyFilters(newFilters);
    }
  };

  const handleSortChange = (sortBy) => {
    const newFilters = { ...localFilters, sortBy };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ sortBy });
    }
    
    if (onFilter) {
      applyFilters(newFilters);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'all',
      subCategory: '',
      brand: 'all',
      minPrice: '',
      maxPrice: '',
      rating: '',
      availability: 'all',
      sortBy: 'relevance' // Fixed to match initial state
    };
    setLocalFilters(clearedFilters);
    setSelectedCategory('all');
    setSelectedSubCategory('');

    if (onClearFilters) {
      onClearFilters();
    }

    if (onFilter) {
      onFilter(products);
    }
  };

  const clearFilters = () => {
    clearAllFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.category && localFilters.category !== 'all') count++;
    if (localFilters.subCategory && localFilters.subCategory !== '') count++;
    if (localFilters.brand && localFilters.brand !== 'all') count++;
    if (localFilters.minPrice) count++;
    if (localFilters.maxPrice) count++;
    if (localFilters.rating) count++;
    if (localFilters.availability && localFilters.availability !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header - Enhanced with Help */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Smart Filters
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          💡 Use filters below to find exactly what you're looking for
        </p>
      </div>

      {/* Search - Enhanced with Clear Instructions */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Products
          </span>
        </label>
        <input
          type="text"
          value={localFilters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          placeholder="Type product name, flavor, or ingredient..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
        {localFilters.search && (
          <p className="text-xs text-blue-600 mt-1">
            🔍 Searching for: "{localFilters.search}"
          </p>
        )}
      </div>

      {/* Category Filter - Enhanced User Experience */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Choose Category
          </span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            const category = e.target.value;
            setSelectedCategory(category);
            setSelectedSubCategory(''); // Reset subcategory when category changes
            handleInputChange('category', category);
            handleInputChange('subCategory', ''); // Clear subcategory
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
        >
          <option value="all">🍰 All Categories</option>
          {Object.keys(categoryStructure).map((category) => (
            <option key={category} value={category}>
              🎂 {category}
            </option>
          ))}
        </select>
        {selectedCategory && selectedCategory !== 'all' && (
          <p className="text-xs text-gray-500 mt-1">
            ✓ {selectedCategory} selected - Choose specific type below
          </p>
        )}
      </div>

      {/* Subcategory Filter - Enhanced with Clear Instructions */}
      {selectedCategory && selectedCategory !== 'all' && categoryStructure[selectedCategory] && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Choose Specific Type
            </span>
          </label>
          <select
            value={selectedSubCategory}
            onChange={(e) => {
              const subCategory = e.target.value;
              setSelectedSubCategory(subCategory);
              handleInputChange('subCategory', subCategory);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
          >
            <option value="">🔍 All {selectedCategory} Types</option>
            {categoryStructure[selectedCategory].subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                🍰 {subcategory}
              </option>
            ))}
          </select>
          {selectedSubCategory && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {selectedSubCategory} selected - Products will be filtered
            </p>
          )}
        </div>
      )}

      {/* Price Range - Enhanced with Clear Instructions */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Price Range (₹)
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              value={localFilters.minPrice}
              onChange={(e) => handlePriceRangeChange('minPrice', e.target.value)}
              placeholder="Min ₹"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum price</p>
          </div>
          <div>
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) => handlePriceRangeChange('maxPrice', e.target.value)}
              placeholder="Max ₹"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum price</p>
          </div>
        </div>
        {(localFilters.minPrice || localFilters.maxPrice) && (
          <p className="text-xs text-green-600 mt-2">
            💰 Price range: ₹{localFilters.minPrice || '0'} - ₹{localFilters.maxPrice || '∞'}
          </p>
        )}
      </div>

      {/* Sort By - Enhanced with Clear Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
            Sort Products By
          </span>
        </label>
        <select
          value={localFilters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
        >
          <option value="relevance">🔍 Best Match (Recommended)</option>
          <option value="price-low">💰 Price: Low to High</option>
          <option value="price-high">💰 Price: High to Low</option>
          <option value="name">🔤 Name: A to Z</option>
          <option value="name-desc">🔤 Name: Z to A</option>
          <option value="rating">⭐ Customer Rating</option>
          <option value="newest">🆕 Newest First</option>
          <option value="oldest">📅 Oldest First</option>
        </select>
        {localFilters.sortBy && localFilters.sortBy !== 'relevance' && (
          <p className="text-xs text-blue-600 mt-1">
            📊 Products sorted by: {localFilters.sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        )}
      </div>

      {/* Clear Filters Button - Enhanced */}
      {getActiveFiltersCount() > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-yellow-800 font-medium">
              🎯 {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Click below to reset all filters and see all products
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-md transition-colors text-sm border border-red-200 hover:border-red-300"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters ({getActiveFiltersCount()})
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
