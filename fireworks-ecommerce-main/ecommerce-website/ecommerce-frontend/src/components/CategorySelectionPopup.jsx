import { useState, useEffect } from "react";

const CategorySelectionPopup = ({ isOpen, onClose, onSave, initialData = {} }) => {
  // Delicious Cake Flavors - Main categories
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

  // Product Type Categories
  const productTypes = [
    { id: 'cakes', label: 'Cakes', emoji: '🎂' },
    { id: 'sweets', label: 'Sweets', emoji: '🍭' },
    { id: 'newItems', label: 'New Items', emoji: '✨' },
    { id: 'specialItems', label: 'Special Items', emoji: '⭐' }
  ];

  const [selectedFlavor, setSelectedFlavor] = useState(initialData.selectedFlavor || '');
  const [selectedTypes, setSelectedTypes] = useState(initialData.selectedTypes || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedFlavor(initialData.selectedFlavor || '');
      setSelectedTypes(initialData.selectedTypes || []);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleFlavorChange = (e) => {
    setSelectedFlavor(e.target.value);
    if (errors.flavor) {
      setErrors(prev => ({ ...prev, flavor: '' }));
    }
  };

  const handleTypeToggle = (typeId) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
    if (errors.types) {
      setErrors(prev => ({ ...prev, types: '' }));
    }
  };

  const validateSelection = () => {
    const newErrors = {};
    
    // Always require a cake flavor
    if (!selectedFlavor) {
      newErrors.flavor = 'Please select a cake flavor';
    }
    
    // Always require at least one product type
    if (selectedTypes.length === 0) {
      newErrors.types = 'Please select at least one product type';
    }
    
    // Special validation: If "Cakes" is selected, ensure a cake flavor is also selected
    if (selectedTypes.includes('cakes') && !selectedFlavor) {
      newErrors.flavor = 'Cake flavor is required when selecting "Cakes" product type';
    }
    
    // Special validation: If a cake flavor is selected, recommend selecting "Cakes" type
    if (selectedFlavor && !selectedTypes.includes('cakes')) {
      newErrors.types = 'For cake products, please also select "Cakes" product type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateSelection()) {
      return;
    }

    const categoryData = {
      selectedFlavor,
      selectedTypes,
      // Create a combined category string for backward compatibility
      combinedCategory: selectedFlavor,
      // Create tags for filtering
      tags: selectedTypes,
      // Create display category based on selections
      displayCategory: selectedTypes.includes('cakes') ? selectedFlavor : selectedTypes[0]
    };

    onSave(categoryData);
  };

  const handleCancel = () => {
    setSelectedFlavor('');
    setSelectedTypes([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              🍰 Select Product Categories
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Choose the cake flavor and product types to categorize your product
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-red-600 text-lg">⚠️</span>
                <h3 className="text-sm font-medium text-red-900">Please fix the following errors:</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-center space-x-2">
                    <span>•</span>
                    <span><strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Delicious Cake Flavors */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍰</span>
              <h3 className="text-xl font-semibold text-gray-900">Delicious Cake Flavors</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Select the main cake flavor for your product. <strong>For cake products, you must also select "Cakes" in the product types below.</strong>
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Cake Flavor *
              </label>
              <select
                value={selectedFlavor}
                onChange={handleFlavorChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.flavor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a cake flavor...</option>
                {cakeFlavors.map((flavor) => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
              {errors.flavor && <p className="text-red-500 text-sm mt-1">{errors.flavor}</p>}
            </div>
          </div>

          {/* Section 2: Product Type Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <h3 className="text-xl font-semibold text-gray-900">Product Type Categories</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Select which product type tabs this item should appear under. You can select multiple types. <strong>If you selected a cake flavor above, make sure to also select "Cakes" here.</strong>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {productTypes.map((type) => {
                const isRecommended = selectedFlavor && type.id === 'cakes';
                const isSelected = selectedTypes.includes(type.id);
                
                return (
                  <div
                    key={type.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : isRecommended
                        ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTypeToggle(type.id)}
                  >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => handleTypeToggle(type.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{type.emoji}</span>
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {type.id === 'cakes' && 'Appears in Cakes tab with selected flavor'}
                    {type.id === 'sweets' && 'Appears in Sweets tab'}
                    {type.id === 'newItems' && 'Appears in New Items tab'}
                    {type.id === 'specialItems' && 'Appears in Special Items tab'}
                  </p>
                  {isRecommended && !isSelected && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                      <span>💡</span>
                      <span>Recommended for cake products</span>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            {errors.types && <p className="text-red-500 text-sm mt-1">{errors.types}</p>}
          </div>

          {/* Preview Section */}
          {(selectedFlavor || selectedTypes.length > 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">📋 Selection Preview</h4>
              <div className="space-y-2 text-sm">
                {selectedFlavor && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Cake Flavor:</span>
                    <span className="font-medium text-blue-600">{selectedFlavor}</span>
                  </div>
                )}
                {selectedTypes.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Product Types:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTypes.map(typeId => {
                        const type = productTypes.find(t => t.id === typeId);
                        return (
                          <span key={typeId} className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            <span>{type.emoji}</span>
                            <span>{type.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  💡 This product will appear in the selected tabs when customers browse by category.
                </div>
                {selectedFlavor && !selectedTypes.includes('cakes') && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                    ⚠️ <strong>Warning:</strong> You selected a cake flavor but didn't select "Cakes" product type. This may cause the product to not appear in the Cakes tab.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectionPopup;
