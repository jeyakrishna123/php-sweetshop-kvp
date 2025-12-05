import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdvancedSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPopularSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchPopularSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products/popular-searches');
      if (response.ok) {
        const data = await response.json();
        setPopularSearches(data.searches || []);
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      // Fallback popular searches
      setPopularSearches([
        'Chocolate Cake',
        'Birthday Cake',
        'Wedding Cake',
        'Vanilla Cake',
        'Red Velvet Cake',
        'Cheese Cake',
        'Cupcakes',
        'Cookies',
        'Brownies',
        'Pastries'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('search', searchQuery.trim());
      
      const searchUrl = `/products?${searchParams.toString()}`;
      console.log('🔍 Navigating to:', searchUrl);
      
      navigate(searchUrl);
      onClose();
    }
  };

  const handlePopularSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    const searchParams = new URLSearchParams();
    searchParams.set('search', searchTerm);
    
    const searchUrl = `/products?${searchParams.toString()}`;
    console.log('🔍 Navigating to:', searchUrl);
    
    navigate(searchUrl);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6" style={{ zIndex: 9999999 }}>
      <div ref={searchRef} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col" style={{ position: 'relative', zIndex: 10000000 }}>
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Search Products</h2>
                <p className="text-red-100 text-xs sm:text-sm truncate">Find your perfect cake or dessert</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-bold text-gray-800">🔍 What are you looking for?</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for cakes, pastries, desserts..."
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700 text-sm sm:text-base"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Popular Searches */}
            {!searchQuery && popularSearches.length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border-2 border-gray-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  🔥 Popular Searches
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {popularSearches.slice(0, 8).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularSearch(search)}
                      className="p-2 sm:p-3 text-left bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-200 rounded-lg transition-all group"
                    >
                      <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-red-600">
                        {search}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {searchQuery && (
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border-2 border-gray-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  💡 Search Suggestions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSearch()}
                    className="w-full p-3 text-left bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all group"
                  >
                    <span className="text-sm font-medium text-red-600">
                      Search for "{searchQuery}"
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-sm sm:text-base disabled:cursor-not-allowed"
            >
              Search Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;