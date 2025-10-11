import React from 'react';
import { useNavigate } from 'react-router-dom';
import NewProductCard from './NewProductCard';

const CategoryGrid = ({ categories, products }) => {
  const navigate = useNavigate();

  // Filter products by category
  const getProductsByCategory = (categoryId, categoryName) => {
    const filteredProducts = products.filter(product => {
      // Check multiple possible category references
      return product.category === categoryId || 
             product.categoryName === categoryName;
    });
    
    // Debug logging
    console.log(`🔍 Category: ${categoryName} (${categoryId})`);
    console.log(`📦 Total products: ${products.length}`);
    console.log(`🎯 Filtered products: ${filteredProducts.length}`);
    console.log(`📋 Sample product categories:`, products.slice(0, 3).map(p => ({ 
      name: p.name, 
      category: p.category, 
      categoryName: p.categoryName 
    })));
    
    return filteredProducts;
  };

  // Get professional color schemes for each category
  const getCategoryColors = (categoryName, index) => {
    const colorSchemes = [
      // Professional Blue scheme
      {
        background: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-600',
        iconColor: 'text-blue-600',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        accent: 'text-blue-700',
        hover: 'hover:bg-blue-100'
      },
      // Professional Green scheme
      {
        background: 'bg-green-50',
        border: 'border-green-200',
        iconBg: 'bg-green-600',
        iconColor: 'text-green-600',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-800',
        accent: 'text-green-700',
        hover: 'hover:bg-green-100'
      },
      // Professional Purple scheme
      {
        background: 'bg-purple-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-600',
        iconColor: 'text-purple-600',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800',
        accent: 'text-purple-700',
        hover: 'hover:bg-purple-100'
      },
      // Professional Orange scheme
      {
        background: 'bg-orange-50',
        border: 'border-orange-200',
        iconBg: 'bg-orange-600',
        iconColor: 'text-orange-600',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        accent: 'text-orange-700',
        hover: 'hover:bg-orange-100'
      },
      // Professional Red scheme
      {
        background: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-600',
        iconColor: 'text-red-600',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
        accent: 'text-red-700',
        hover: 'hover:bg-red-100'
      },
      // Professional Teal scheme
      {
        background: 'bg-teal-50',
        border: 'border-teal-200',
        iconBg: 'bg-teal-600',
        iconColor: 'text-teal-600',
        badgeBg: 'bg-teal-100',
        badgeText: 'text-teal-800',
        accent: 'text-teal-700',
        hover: 'hover:bg-teal-100'
      },
      // Professional Indigo scheme
      {
        background: 'bg-indigo-50',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-600',
        iconColor: 'text-indigo-600',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-800',
        accent: 'text-indigo-700',
        hover: 'hover:bg-indigo-100'
      },
      // Professional Gray scheme
      {
        background: 'bg-gray-50',
        border: 'border-gray-200',
        iconBg: 'bg-gray-600',
        iconColor: 'text-gray-600',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-800',
        accent: 'text-gray-700',
        hover: 'hover:bg-gray-100'
      }
    ];
    
    // Use category name to determine color scheme for consistency
    const name = categoryName.toLowerCase();
    let colorIndex = 0;
    
    if (name.includes('fountain')) colorIndex = 0; // Blue
    else if (name.includes('aerial')) colorIndex = 1; // Green
    else if (name.includes('sparkler')) colorIndex = 2; // Purple
    else if (name.includes('cracker')) colorIndex = 3; // Orange
    else if (name.includes('roman') || name.includes('candle')) colorIndex = 4; // Red
    else if (name.includes('rocket')) colorIndex = 5; // Teal
    else if (name.includes('wheel')) colorIndex = 6; // Indigo
    else if (name.includes('bomb') || name.includes('shell')) colorIndex = 7; // Gray
    else colorIndex = index % colorSchemes.length; // Fallback to index-based
    
    return colorSchemes[colorIndex];
  };

  // Get professional icons for each category
  const getCategoryIcon = (categoryName, iconColor) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('fountain')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    } else if (name.includes('aerial')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    } else if (name.includes('sparkler')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    } else if (name.includes('cracker')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    } else if (name.includes('roman') || name.includes('candle')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    } else if (name.includes('rocket')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
    } else if (name.includes('wheel')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    } else if (name.includes('bomb') || name.includes('shell')) {
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      // Default professional icon
      return (
        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    }
  };

  // Debug logging for categories
  console.log('🏷️ CategoryGrid received categories:', categories?.length || 0);
  console.log('📋 Category details:', categories?.map(c => ({ 
    _id: c._id, 
    name: c.name,
    isActive: c.isActive
  })));

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-20 max-w-2xl mx-auto px-4">
        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Categories Available</h3>
        <p className="text-gray-600">Product categories will be available soon. Please check back later.</p>
      </div>
    );
  }

      return (
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        {categories.map((category, index) => {
          const categoryProducts = getProductsByCategory(category._id, category.name);
          const colors = getCategoryColors(category.name, index);
          
          
          
          // Add CSS class based on number of products
          const productCountClass = categoryProducts.length === 1 ? 'single-product' : 
                                   categoryProducts.length <= 2 ? 'few-products' : '';
          
          return (
            <div key={category._id} className={`category-box ${productCountClass} ${colors.background} ${colors.border} border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}>
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Category Icon */}
                    <div className={`${colors.iconBg} p-3 rounded-lg`}>
                      {getCategoryIcon(category.name, 'text-white')}
                    </div>
                    
                    {/* Category Info */}
                    <div>
                      <h3 className={`text-2xl font-bold ${colors.accent}`}>
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Product Count Badge */}
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {categoryProducts.length}
                  </div>
                </div>
              </div>
              
              {/* Products Grid */}
              <div className="p-6">
                {categoryProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No products available</h4>
                    <p className="text-gray-500">Products will be added to this category soon.</p>
                  </div>
                ) : (
                  <div className="products-grid products-grid-mobile products-grid-tablet products-grid-desktop">
                    {categoryProducts.map((product, index) => (
                      <div key={`${product._id}-${index}`} className="w-full">
                        <NewProductCard product={product} showNewBadge={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
};

export default CategoryGrid;
