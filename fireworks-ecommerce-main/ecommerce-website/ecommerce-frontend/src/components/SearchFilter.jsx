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
        'For Mother',
        'For Father',
        'For Sister',
        'For Brother',
        'For Daughter',
        'For Son'
      ]
    },
    'Occasion Cakes': {
      subcategories: [
        'Birthday Cakes',
        'Anniversary Cakes',
        'Wedding Cakes',
        'Graduation Cakes',
        'Retirement Cakes',
        'Farewell Cakes',
        'Welcome Cakes',
        'Congratulations Cakes'
      ]
    },
    'Special Cakes': {
      subcategories: [
        'Photo Cakes',
        'Number Cakes',
        'Alphabet Cakes',
        'Character Cakes',
        'Cartoon Cakes',
        'Sports Cakes',
        'Music Cakes',
        'Art Cakes'
      ]
    },
    'Cupcakes': {
      subcategories: [
        'Chocolate Cupcakes',
        'Vanilla Cupcakes',
        'Red Velvet Cupcakes',
        'Strawberry Cupcakes',
        'Lemon Cupcakes',
        'Coffee Cupcakes',
        'Carrot Cupcakes',
        'Banana Cupcakes'
      ]
    },
    'Pastries': {
      subcategories: [
        'Chocolate Pastries',
        'Vanilla Pastries',
        'Strawberry Pastries',
        'Mango Pastries',
        'Pineapple Pastries',
        'Black Forest Pastries',
        'White Forest Pastries',
        'Fruit Pastries'
      ]
    },
    'Cookies': {
      subcategories: [
        'Chocolate Chip Cookies',
        'Sugar Cookies',
        'Oatmeal Cookies',
        'Butter Cookies',
        'Almond Cookies',
        'Coconut Cookies',
        'Ginger Cookies',
        'Shortbread Cookies'
      ]
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ [field]: value });
    }
  };

  const handleSortChange = (sortBy) => {
    const newFilters = { ...localFilters, sortBy };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ sortBy });
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
      sortBy: 'relevance'
    };
    setLocalFilters(clearedFilters);
    setSelectedCategory('all');
    setSelectedSubCategory('');
    
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.category && localFilters.category !== 'all') count++;
    if (localFilters.subCategory) count++;
    if (localFilters.brand && localFilters.brand !== 'all') count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.rating) count++;
    if (localFilters.availability && localFilters.availability !== 'all') count++;
    if (localFilters.sortBy && localFilters.sortBy !== 'relevance') count++;
    return count;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Search Filter Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Filter Products</h3>
        <p className="text-sm text-gray-600">
          Use the filters below to find exactly what you're looking for
        </p>
      </div>

      {/* Search Input - Enhanced with Clear Instructions */}
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
          placeholder="Search for cakes, pastries, flavors..."
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
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              placeholder="Min price"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum price</p>
          </div>
          <div>
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              placeholder="Max price"
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
            <p className="text-xs text-yellow-700 mt-1">
              Clear all filters to see all products
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        </div>
      )}

      {/* No Active Filters Message */}
      {getActiveFiltersCount() === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800 font-medium">
              ✅ No filters applied - Showing all products
            </p>
            <p className="text-xs text-green-700 mt-1">
              Use the filters above to narrow down your search
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;