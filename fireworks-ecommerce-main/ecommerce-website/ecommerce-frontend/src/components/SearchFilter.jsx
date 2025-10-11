import { useState, useEffect } from "react";
import axios from "../axios";

const SearchFilter = ({ products, onSearch, onFilter, filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: filters?.search || '',
    category: filters?.category || 'all',
    brand: filters?.brand || 'all',
    minPrice: filters?.minPrice || '',
    maxPrice: filters?.maxPrice || '',
    rating: filters?.rating || '',
    availability: filters?.availability || 'all',
    sortBy: filters?.sortBy || 'relevance'
  });

  useEffect(() => {
    if (products && products.length > 0) {
      fetchCategories();
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
      if (response.data.success) {
        // Only show categories that have products
        const categoriesWithProducts = response.data.categories.filter(category => {
          return products.some(product => 
            product.category === category._id || 
            product.category === category.name ||
            product.categoryName === category.name
          );
        });
        setCategories(categoriesWithProducts);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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
      filtered = filtered.filter(product => product.category === filters.category);
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
      brand: 'all',
      minPrice: '',
      maxPrice: '',
      rating: '',
      availability: 'all',
      sortBy: 'name'
    };
    setLocalFilters(clearedFilters);
    
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
    if (localFilters.brand && localFilters.brand !== 'all') count++;
    if (localFilters.minPrice) count++;
    if (localFilters.maxPrice) count++;
    if (localFilters.rating) count++;
    if (localFilters.availability && localFilters.availability !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={localFilters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={localFilters.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={localFilters.minPrice}
            onChange={(e) => handlePriceRangeChange('minPrice', e.target.value)}
            placeholder="Min"
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <input
            type="number"
            value={localFilters.maxPrice}
            onChange={(e) => handlePriceRangeChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={localFilters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="relevance">Relevance</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="rating">Rating: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {getActiveFiltersCount() > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearAllFilters}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
