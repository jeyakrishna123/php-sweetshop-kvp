import { useState, useEffect, useRef, useCallback } from "react";
import axios from "../axios";
import useDebounce from "../hooks/useDebounce";

const SearchFilter = ({ products, filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');
  const [selectedSubCategory, setSelectedSubCategory] = useState(filters?.subCategory || '');
  const isTypingRef = useRef(false); // Track if user is currently typing
  const searchInputRef = useRef(null); // Reference to search input
  const appliedSearchRef = useRef(filters?.search || ''); // Track the last applied search value
  const [searchInputValue, setSearchInputValue] = useState(filters?.search || ''); // Separate state for input (not synced during typing)
  const debounceTimeoutRef = useRef(null); // Timeout for debounce
  const isApplyingRef = useRef(false); // Prevent multiple simultaneous applies
  
  // Debounce search input value - this is ONLY used for auto-apply after typing stops
  // The debounced value will trigger applySearchFilter after 500ms of no typing
  const debouncedSearchValue = useDebounce(searchInputValue, 500);
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

  // Apply search filter explicitly (called on Enter key, Search button click, or after debounce)
  // CRITICAL: Define this BEFORE useEffect to avoid TDZ (Temporal Dead Zone) error
  const applySearchFilter = useCallback((valueToApply = null) => {
    // Prevent multiple simultaneous applies
    if (isApplyingRef.current) {
      console.log('🔍 SearchFilter: Already applying, skipping duplicate apply');
      return;
    }
    
    isApplyingRef.current = true;
    
    // Mark that user is no longer typing
    isTypingRef.current = false;
    
    // Clear any pending debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Use provided value, or current input value
    const searchValue = (valueToApply !== null ? valueToApply : searchInputValue)?.trim() || '';
    
    // Only apply if value actually changed (avoid unnecessary API calls)
    if (searchValue === appliedSearchRef.current) {
      console.log('🔍 SearchFilter: Search value unchanged, skipping apply');
      isApplyingRef.current = false;
      return;
    }
    
    // CRITICAL: Update applied search ref BEFORE calling onFilterChange
    // This prevents sync effect from clearing the input
    appliedSearchRef.current = searchValue;
    
    // Update input value to match (preserve what user typed)
    // This ensures input shows the correct value even after filter is applied
    setSearchInputValue(searchValue);
    
    // Update localFilters to match
    setLocalFilters(prev => ({ ...prev, search: searchValue }));
    
    // Apply filter - this will trigger API call
    if (onFilterChange) {
      console.log('🔍 SearchFilter: Applying search filter:', searchValue);
      // Use setTimeout to ensure state updates complete before API call
      setTimeout(() => {
        onFilterChange({ search: searchValue });
        isApplyingRef.current = false;
      }, 0);
    } else {
      isApplyingRef.current = false;
    }
  }, [searchInputValue, onFilterChange]);

  // Sync localFilters with filters prop when it changes (e.g., from URL params)
  // CRITICAL: Don't sync search field if user is currently typing (prevents input reset)
  useEffect(() => {
    if (filters) {
      // Update all filters except search (search is handled separately)
      setLocalFilters(prev => {
        const newFilters = { ...prev };
        Object.keys(filters).forEach(key => {
          if (key !== 'search') {
            newFilters[key] = filters[key];
          }
        });
        return newFilters;
      });
      
      // CRITICAL: Only sync search input if:
      // 1. User is NOT currently typing (isTypingRef.current === false)
      // 2. The search value from filters is different from what we have applied
      // 3. The input is NOT focused (user is not actively using it)
      // 4. The input is NOT the active element (user is not typing)
      const isInputFocused = document.activeElement === searchInputRef.current;
      const isInputActive = document.activeElement?.tagName === 'INPUT' && 
                           document.activeElement?.type === 'text';
      
      const shouldSyncSearch = !isTypingRef.current && 
                               !isInputFocused && 
                               !isInputActive &&
                               filters.search !== appliedSearchRef.current;
      
      if (shouldSyncSearch) {
        const newSearchValue = filters.search || '';
        setSearchInputValue(newSearchValue);
        appliedSearchRef.current = newSearchValue;
        setLocalFilters(prev => ({ ...prev, search: newSearchValue }));
        console.log('🔍 SearchFilter: Synced search from filters:', newSearchValue);
      } else {
        console.log('🔍 SearchFilter: Skipping search sync - user typing:', isTypingRef.current, 'input focused:', isInputFocused, 'input active:', isInputActive);
      }
      
      setSelectedCategory(filters.category || 'all');
      setSelectedSubCategory(filters.subCategory || '');
    }
  }, [filters]);

  // Auto-apply search after user stops typing for 500ms (debounce)
  // This ONLY applies if user has typed something and stopped typing
  useEffect(() => {
    // Skip if debounced value matches applied value (no change)
    if (debouncedSearchValue === appliedSearchRef.current) {
      return;
    }
    
    // Skip if user is currently typing (debounce hasn't completed yet)
    if (isTypingRef.current) {
      return;
    }
    
    // Skip if we're already applying (prevent duplicate applies)
    if (isApplyingRef.current) {
      return;
    }
    
    // Skip if input is focused (user might still be typing)
    const isInputFocused = document.activeElement === searchInputRef.current;
    if (isInputFocused) {
      // Wait a bit more to ensure user has stopped typing
      const checkAgain = setTimeout(() => {
        if (!isTypingRef.current && !isApplyingRef.current) {
          const isStillFocused = document.activeElement === searchInputRef.current;
          if (!isStillFocused) {
            console.log('🔍 SearchFilter: Auto-applying debounced search after user stopped typing:', debouncedSearchValue);
            applySearchFilter(debouncedSearchValue);
          }
        }
      }, 200);
      return () => clearTimeout(checkAgain);
    }
    
    // Auto-apply after debounce delay (user has stopped typing)
    console.log('🔍 SearchFilter: Auto-applying debounced search after 500ms:', debouncedSearchValue);
    applySearchFilter(debouncedSearchValue);
  }, [debouncedSearchValue, applySearchFilter]);

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
    // CRITICAL: Search field is handled separately in onChange handler
    // This function should NEVER be called for search field
    if (field === 'search') {
      console.warn('🔍 SearchFilter: handleInputChange called for search - this should not happen!');
      return; // Do nothing for search - onChange handler manages it
    }
    
    // For other fields, update local state and apply filter immediately
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ [field]: value });
    }
  };
  
  // No cleanup needed - removed debounce functionality

  const handleSortChange = (sortBy) => {
    const newFilters = { ...localFilters, sortBy };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ sortBy });
    }
  };

  const clearAllFilters = () => {
    // Clear all filter states including search input
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
    
    // Clear search input state
    setSearchInputValue('');
    appliedSearchRef.current = '';
    isTypingRef.current = false;
    
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
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-visible">
      {/* Search Filter Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Filter Products</h3>
        <p className="text-sm text-gray-600">
          Use the filters below to find exactly what you're looking for
        </p>
      </div>

      {/* Search Input - Enhanced with Clear Instructions */}
      <div className="mb-4 overflow-visible">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Products
          </span>
        </label>
        <div className="flex gap-2 items-center w-full min-w-0 overflow-visible">
          <input
            ref={searchInputRef}
            type="text"
            value={searchInputValue}
            onFocus={(e) => {
              // Mark that user is typing when input gets focus
              isTypingRef.current = true;
              // Ensure input is focused and ready for typing
              e.target.select();
            }}
            onChange={(e) => {
              const value = e.target.value;
              
              // CRITICAL: Mark that user is actively typing - This prevents sync and filter application
              isTypingRef.current = true;
              
              // Clear any existing debounce timeout
              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
              }
              
              // Update ONLY the input value - do NOT update localFilters or call onFilterChange
              // This ensures the input NEVER triggers filter application while typing
              setSearchInputValue(value);
              
              // Set a timeout to clear typing flag after user stops typing
              // This allows debounce to work properly
              debounceTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                console.log('🔍 SearchFilter: User stopped typing, ready for debounce apply');
              }, 600); // Slightly longer than debounce delay (500ms)
              
              // ABSOLUTELY NO filter application here - debounce or button/Enter will handle it
              // This prevents ANY filter application, page refresh, or API calls while typing
              console.log('🔍 SearchFilter: User typing, value:', value, '(will auto-apply after 500ms of no typing, or click Search/Enter)');
            }}
            onKeyDown={(e) => {
              // Apply search ONLY on Enter key
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                // Clear typing flag
                isTypingRef.current = false;
                // Apply filter immediately
                applySearchFilter();
              } else if (e.key === 'Escape') {
                // Reset on Escape
                e.preventDefault();
                isTypingRef.current = false;
                const resetValue = appliedSearchRef.current || '';
                setSearchInputValue(resetValue);
                setLocalFilters(prev => ({ ...prev, search: resetValue }));
              } else {
                // Any other key means user is still typing
                isTypingRef.current = true;
              }
            }}
            onBlur={(e) => {
              // When input loses focus, check if Search button was clicked
              // If Search button was clicked, the onClick will handle it
              // Otherwise, don't auto-apply - let user explicitly search
              setTimeout(() => {
                // Only clear typing flag if focus didn't move to Search button
                const activeElement = document.activeElement;
                if (activeElement !== searchInputRef.current && 
                    activeElement?.tagName !== 'BUTTON') {
                  isTypingRef.current = false;
                }
              }, 300); // Longer delay to ensure Search button click registers
            }}
            placeholder="Type to search (auto-applies after 500ms, or press Enter/Search)"
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Clear typing flag before applying
              isTypingRef.current = false;
              // Apply filter - this is the ONLY way to apply (besides Enter key)
              applySearchFilter();
            }}
            onMouseDown={(e) => {
              // Prevent input blur from clearing typing flag before button click
              e.preventDefault();
            }}
            className="px-3 sm:px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors duration-200 flex items-center justify-center whitespace-nowrap shrink-0 flex-shrink-0"
            title="Click to search"
          >
            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
        {(searchInputValue || appliedSearchRef.current) && (
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-blue-600">
              💡 {searchInputValue !== appliedSearchRef.current 
                ? `Typing: "${searchInputValue}" - Click Search button or press Enter to apply`
                : `Active search: "${appliedSearchRef.current}"`}
            </p>
            {searchInputValue !== appliedSearchRef.current && (
              <button
                type="button"
                onClick={() => {
                  const resetValue = appliedSearchRef.current || '';
                  setSearchInputValue(resetValue);
                  setLocalFilters(prev => ({ ...prev, search: resetValue }));
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                title="Reset to current filter"
              >
                Reset
              </button>
            )}
          </div>
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