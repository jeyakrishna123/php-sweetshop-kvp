import { useState, useEffect } from 'react';

const CategoryProductFilter = ({ products, onFilteredProducts, onCategoryChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Helper function to count products for each category - FIXED LOGIC
  const getCategoryCount = (categoryName) => {
    switch (categoryName) {
      case 'All Products':
        return products.length;
      case 'Cakes':
        return products.filter(p => 
          p.productTypes?.includes('cakes') || 
          p.category?.toLowerCase().includes('cake') ||
          p.name?.toLowerCase().includes('cake')
        ).length;
      case 'Sweets':
        return products.filter(p => 
          p.productTypes?.includes('sweets') || 
          p.category?.toLowerCase().includes('sweet') ||
          p.name?.toLowerCase().includes('sweet')
        ).length;
      case 'New Items':
        return products.filter(p => 
          p.productTypes?.includes('newItems') || 
          p.isNew || 
          p.category?.toLowerCase().includes('new')
        ).length;
      case 'Special Items':
        return products.filter(p => 
          p.productTypes?.includes('specialItems') || 
          p.category?.toLowerCase().includes('special')
        ).length;
      default:
        return 0;
    }
  };

  // Main categories with icons and colors - FIXED COUNTS
  const mainCategories = [
    { name: "All Products", icon: "🛍️", color: "bg-gray-100 text-gray-800", count: getCategoryCount('All Products') },
    { name: "Cakes", icon: "🎂", color: "bg-pink-100 text-pink-800", count: getCategoryCount('Cakes') },
    { name: "Sweets", icon: "🍭", color: "bg-purple-100 text-purple-800", count: getCategoryCount('Sweets') },
    { name: "New Items", icon: "✨", color: "bg-yellow-100 text-yellow-800", count: getCategoryCount('New Items') },
    { name: "Special Items", icon: "⭐", color: "bg-red-100 text-red-800", count: getCategoryCount('Special Items') }
  ];

  // Sub-categories for each main category
  const subCategories = {
    "Cakes": [
      "Chocolate", "Butterscotch", "Black Forest", "Gulab Jamun", "Rasmalai",
      "Cheese Cakes", "Vanilla", "Blueberry", "Strawberry", "Special Flavours",
      "Double Flavours", "Red Velvet", "Fruit Cakes", "Truffle Cakes",
      "Ferrero Rocher", "Mango", "Pineapple", "Kitkat Cakes", "Customize Cakes"
    ],
    "Sweets": [
      "Indian Sweets", "Chocolates", "Cookies", "Pastries", "Donuts",
      "Cupcakes", "Muffins", "Brownies", "Tarts", "Pies", "Candies",
      "Jellies", "Toffees", "Ladoos", "Barfi", "Rasgulla", "Gulab Jamun"
    ],
    "New Items": [
      "Latest Cakes", "Trending Sweets", "Seasonal Specials", "Limited Edition",
      "Chef's Special", "Experimental Flavors", "Fusion Items", "Modern Creations"
    ],
    "Special Items": [
      "Festival Special", "Wedding Cakes", "Birthday Cakes", "Anniversary Cakes",
      "Corporate Orders", "Custom Designs", "Seasonal Items", "Premium Collection",
      "Gift Hampers", "Party Packs", "Bulk Orders"
    ]
  };

  // Filter products based on selected categories - FIXED LOGIC
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All Products') {
      if (selectedSubCategory) {
        // Filter by both main category and sub-category (cake flavor)
        filtered = products.filter(product => {
          const hasProductType = product.productTypes?.includes(selectedCategory.toLowerCase().replace(' ', ''));
          const hasCategoryMatch = product.category?.toLowerCase().includes(selectedCategory.toLowerCase());
          const hasCakeFlavor = selectedCategory === 'Cakes' && product.cakeFlavor === selectedSubCategory;
          const isNewItem = selectedCategory === 'New Items' && product.isNew;
          
          return (hasProductType || hasCategoryMatch) && (hasCakeFlavor || isNewItem || selectedCategory !== 'Cakes');
        });
      } else {
        // Filter by main category only - FIXED TO CHECK BOTH FIELDS
        filtered = products.filter(product => {
          const hasProductType = product.productTypes?.includes(selectedCategory.toLowerCase().replace(' ', ''));
          const hasCategoryMatch = product.category?.toLowerCase().includes(selectedCategory.toLowerCase());
          
          switch (selectedCategory) {
            case 'Cakes':
              return hasProductType || hasCategoryMatch || 
                     product.category?.toLowerCase().includes('cake') ||
                     product.name?.toLowerCase().includes('cake');
            case 'Sweets':
              return hasProductType || hasCategoryMatch ||
                     product.category?.toLowerCase().includes('sweet') ||
                     product.name?.toLowerCase().includes('sweet');
            case 'New Items':
              return hasProductType || product.isNew || 
                     product.category?.toLowerCase().includes('new');
            case 'Special Items':
              return hasProductType || hasCategoryMatch ||
                     product.category?.toLowerCase().includes('special');
            default:
              return hasProductType || hasCategoryMatch;
          }
        });
      }
    }

    console.log(`🔍 CategoryProductFilter: ${selectedCategory} - Found ${filtered.length} products out of ${products.length}`);
    console.log(`📦 Sample filtered products:`, filtered.slice(0, 3).map(p => ({ 
      name: p.name, 
      category: p.category, 
      productTypes: p.productTypes 
    })));

    onFilteredProducts(filtered);
    onCategoryChange(selectedCategory, selectedSubCategory);
  }, [selectedCategory, selectedSubCategory, products, onFilteredProducts, onCategoryChange]);

  const handleMainCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory(''); // Reset sub-category when main category changes
  };

  const handleSubCategoryClick = (subCategoryName) => {
    setSelectedSubCategory(subCategoryName);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* Main Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mainCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleMainCategoryClick(category.name)}
              className={`flex flex-col items-center gap-2 px-3 py-3 sm:px-4 rounded-full border-2 transition-all duration-200 hover:shadow-md ${
                selectedCategory === category.name
                  ? `${category.color} border-current shadow-md`
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <span className="text-lg sm:text-xl">{category.icon}</span>
              <span className="font-medium text-sm sm:text-base text-center">{category.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedCategory === category.name ? 'bg-white bg-opacity-20' : 'bg-gray-100'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Categories */}
      {selectedCategory !== 'All Products' && subCategories[selectedCategory] && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            {selectedCategory} Types
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSubCategoryClick('')}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSubCategory === ''
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              All {selectedCategory}
            </button>
            {subCategories[selectedCategory].map((subCategory) => (
              <button
                key={subCategory}
                onClick={() => handleSubCategoryClick(subCategory)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSubCategory === subCategory
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {subCategory}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Category Display */}
      {(selectedCategory !== 'All Products' || selectedSubCategory) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="font-medium">Showing:</span>
            <span className="text-sm">
              {selectedCategory}
              {selectedSubCategory && ` → ${selectedSubCategory}`}
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All Products');
                setSelectedSubCategory('');
              }}
              className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProductFilter;
