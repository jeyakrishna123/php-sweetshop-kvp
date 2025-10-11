import { useState, useEffect } from "react";

const SimpleCategorySelection = ({ onCategoryChange, initialData = {} }) => {
  // Delicious Cake Flavors - Dropdown selection (single choice)
  const cakeFlavors = [
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
    "Customize Cakes"
  ];

  // Product Type Checkboxes
  const productTypes = [
    { id: 'cakes', label: 'Cakes', emoji: '🎂', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { id: 'sweets', label: 'Sweets', emoji: '🍭', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'newItems', label: 'New Items', emoji: '✨', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'specialItems', label: 'Special Items', emoji: '⭐', color: 'bg-red-100 text-red-800 border-red-200' }
  ];

  const [selectedFlavor, setSelectedFlavor] = useState(initialData.selectedFlavor || '');
  const [selectedTypes, setSelectedTypes] = useState(initialData.selectedTypes || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setSelectedFlavor(initialData.selectedFlavor || '');
      setSelectedTypes(initialData.selectedTypes || []);
    }
  }, [initialData]);

  const handleFlavorChange = (e) => {
    const flavor = e.target.value;
    setSelectedFlavor(flavor);
    
    // Clear flavor error when user selects
    if (errors.flavor) {
      setErrors(prev => ({ ...prev, flavor: '' }));
    }
    
    // If a flavor is selected, automatically add 'cakes' to selectedTypes if not already present
    if (flavor && !selectedTypes.includes('cakes')) {
      setSelectedTypes(prev => [...prev, 'cakes']);
    }
    
    // If flavor is deselected, remove 'cakes' from selectedTypes
    if (!flavor && selectedTypes.includes('cakes')) {
      setSelectedTypes(prev => prev.filter(type => type !== 'cakes'));
    }
    
    updateCategoryData(flavor, selectedTypes);
  };

  const handleTypeToggle = (typeId) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter(type => type !== typeId)
      : [...selectedTypes, typeId];
    
    setSelectedTypes(newTypes);
    
    // Clear types error when user selects
    if (errors.types) {
      setErrors(prev => ({ ...prev, types: '' }));
    }
    
    updateCategoryData(selectedFlavor, newTypes);
  };

  const updateCategoryData = (flavor, types) => {
    const combinedCategory = flavor 
      ? `${flavor} ${types.includes('cakes') ? 'Cakes' : ''}`.trim()
      : types.join(', ');
    
    const categoryData = {
      selectedFlavor: flavor,
      selectedTypes: types,
      combinedCategory,
      tags: types,
      displayCategory: combinedCategory
    };
    
    onCategoryChange(categoryData);
  };

  const validateSelection = () => {
    const newErrors = {};

    // For cake products (when flavor is selected), require both flavor and Cakes checkbox
    if (selectedFlavor && !selectedTypes.includes('cakes')) {
      newErrors.types = 'For cake products, please also select the "Cakes" checkbox';
    }

    // For non-cake products, require at least one checkbox
    if (!selectedFlavor && selectedTypes.length === 0) {
      newErrors.types = 'Please select at least one product type';
    }

    // For cake products, require both selections
    if (selectedFlavor && selectedTypes.length === 0) {
      newErrors.types = 'Please select at least one product type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate on every change
  useEffect(() => {
    validateSelection();
  }, [selectedFlavor, selectedTypes]);

  return (
    <div className="space-y-6">
      {/* Delicious Cake Flavors Section - Only show if no flavor selected or if cakes is selected */}
      {(selectedFlavor || selectedTypes.includes('cakes')) && (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🎂</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delicious Cake Flavors</h3>
              <p className="text-sm text-gray-600">Select a specific cake flavor</p>
            </div>
          </div>
          
          <select
            value={selectedFlavor}
            onChange={handleFlavorChange}
            className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
          >
            <option value="">Choose a cake flavor...</option>
            {cakeFlavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
          
          {errors.flavor && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.flavor}
            </p>
          )}
        </div>
      )}

      {/* Product Type Checkboxes Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Product Type Selection</h3>
            <p className="text-sm text-gray-600">Select where this product should appear</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {productTypes.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            const isRecommended = selectedFlavor && type.id === 'cakes';
            
            return (
              <div
                key={type.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-200'
                    : isRecommended
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  id={`type-${type.id}`}
                  checked={isSelected}
                  onChange={() => handleTypeToggle(type.id)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label 
                  htmlFor={`type-${type.id}`}
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span className="font-medium text-gray-900">{type.label}</span>
                  {isRecommended && !isSelected && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      💡 Recommended for cake products
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
        
        {errors.types && (
          <p className="text-red-500 text-sm mt-3 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.types}
          </p>
        )}
      </div>

      {/* Selection Preview */}
      {(selectedFlavor || selectedTypes.length > 0) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900">Selection Preview</h4>
          </div>
          
          <div className="space-y-2">
            {selectedFlavor && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Selected Flavor:</span>
                <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {selectedFlavor}
                </span>
              </div>
            )}
            {selectedTypes.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Product Types:</span>
                <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {selectedTypes.map(type => productTypes.find(t => t.id === type)?.label).join(', ')}
                </span>
              </div>
            )}
            <div className="text-sm text-gray-600 mt-2">
              <strong>This product will appear in:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>All Products tab</li>
                {selectedTypes.includes('cakes') && <li>Cakes tab</li>}
                {selectedTypes.includes('sweets') && <li>Sweets tab</li>}
                {selectedTypes.includes('newItems') && <li>New Items tab</li>}
                {selectedTypes.includes('specialItems') && <li>Special Items tab</li>}
                {selectedFlavor && (
                  <li>Specific flavor category: {selectedFlavor}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleCategorySelection;