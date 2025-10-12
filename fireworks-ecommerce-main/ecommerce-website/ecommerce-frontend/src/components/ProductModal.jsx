import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { productAPI } from "../utils/adminAPI";
import SimpleCategorySelection from "./SimpleCategorySelection";
import ModernImageUpload from "./ModernImageUpload";

export default function ProductModal({ product, onSave, onClose, categories = [] }) {
  // Default predefined categories - will be overridden by localStorage
  const defaultPredefinedCategories = [
    // Main Categories
    "All Products",
    "Cakes",
    "Sweets",
    "New Items",
    "Special Items",
    
    // Cake Flavors
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
    "Customize Cakes",
    
    // Special Categories
    "Festival Special",
    "Wedding Cakes",
    "Birthday Cakes",
    "Anniversary Cakes",
    "Corporate Orders",
    "Custom Designs",
    "Seasonal Items",
    "Limited Edition"
  ];

  // Load predefined categories from localStorage or use default
  const [predefinedCategories, setPredefinedCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('predefinedCakeCategories');
      return saved ? JSON.parse(saved) : defaultPredefinedCategories;
    } catch (error) {
      console.error('Error loading predefined categories:', error);
      return defaultPredefinedCategories;
    }
  });
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Add error boundary
  useEffect(() => {
    const handleError = (event) => {
      console.error('❌ ProductModal: Unhandled error:', event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Listen for predefined category changes
  useEffect(() => {
    const handlePredefinedCategoryDeleted = (event) => {
      const { updatedCategories } = event.detail;
      setPredefinedCategories(updatedCategories);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'predefinedCakeCategories') {
        try {
          const saved = localStorage.getItem('predefinedCakeCategories');
          if (saved) {
            setPredefinedCategories(JSON.parse(saved));
          }
        } catch (error) {
          console.error('Error loading predefined categories from storage:', error);
        }
      }
    };

    window.addEventListener('predefinedCategoryDeleted', handlePredefinedCategoryDeleted);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('predefinedCategoryDeleted', handlePredefinedCategoryDeleted);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    offerPrice: "",
    price: "", // This will be calculated automatically
    discountPercentage: 0, // This will be calculated automatically
    stock: "",
    images: [],
    brand: "",
    category: "",
    description: "",
    seller: "",
    ratings: 0,
    numOfReviews: 0,
    featured: false,
    isNew: true, // New products are marked as new by default
    specifications: {},
    tags: []
  });

  // Simple price display - use form values directly
  const getDisplayValue = (fieldName) => {
    return form[fieldName] || '';
  };

  // Handle price changes and calculations
  useEffect(() => {
    if (form.originalPrice && form.offerPrice) {
      const original = parseFloat(form.originalPrice) || 0;
      const offer = parseFloat(form.offerPrice) || 0;
      
      // Calculate discount percentage
      let discount = 0;
      if (original > 0 && offer < original) {
        discount = Math.round(((original - offer) / original) * 100);
      }
      
      // Update form with calculated values
      setForm(prev => ({
        ...prev,
        price: offer,
        discountPercentage: discount
      }));
    }
  }, [form.originalPrice, form.offerPrice]);

  // Additional useEffect to fix price loading issues
  useEffect(() => {
    if (product && !isLoadingProduct && (form.originalPrice === "" || form.offerPrice === "")) {
      console.log('🔍 ProductModal: Fixing price loading issue...');
      const productPrice = product.price || 0;
      
      setForm(prev => ({
        ...prev,
        originalPrice: prev.originalPrice || productPrice,
        offerPrice: prev.offerPrice || productPrice,
        price: prev.price || productPrice
      }));
    }
  }, [product, form.originalPrice, form.offerPrice, isLoadingProduct]);

  // Debug: Log initial form state
  console.log('🔍 ProductModal: Initial form state:', form);
  console.log('🔍 ProductModal: Current form prices:', {
    originalPrice: form.originalPrice,
    offerPrice: form.offerPrice,
    price: form.price
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [categoryData, setCategoryData] = useState({
    selectedFlavor: '',
    selectedTypes: [],
    combinedCategory: '',
    tags: [],
    displayCategory: ''
  });


  useEffect(() => {
    if (product) {
      setIsLoadingProduct(true);
      console.log('🔍 ProductModal: Loading product for edit:', product.name);
      console.log('🔍 ProductModal: Product data:', {
        price: product.price,
        originalPrice: product.originalPrice,
        offerPrice: product.offerPrice,
        discountPercentage: product.discountPercentage
      });
      
      // Enhanced price handling - check for existing price fields first
      const productPrice = product.price || 0;
      
      // Check if product has dedicated originalPrice and offerPrice fields
      let originalPrice = product.originalPrice;
      let offerPrice = product.offerPrice;
      
      // If originalPrice doesn't exist, use the main price as original
      if (originalPrice === undefined || originalPrice === null || originalPrice === "") {
        originalPrice = productPrice;
        console.log('🔍 ProductModal: Using main price as originalPrice:', originalPrice);
      } else {
        console.log('🔍 ProductModal: Using existing originalPrice:', originalPrice);
      }
      
      // If offerPrice doesn't exist, use the main price as offer
      if (offerPrice === undefined || offerPrice === null || offerPrice === "") {
        offerPrice = productPrice;
        console.log('🔍 ProductModal: Using main price as offerPrice:', offerPrice);
      } else {
        console.log('🔍 ProductModal: Using existing offerPrice:', offerPrice);
      }
      
      console.log('🔍 ProductModal: Enhanced price calculation:', {
        productPrice,
        originalPrice,
        offerPrice,
        hasOriginalPrice: product.originalPrice !== undefined,
        hasOfferPrice: product.offerPrice !== undefined
      });

      // Calculate discount percentage if not provided
      let discountPercentage = product.discountPercentage || 0;
      if (originalPrice > 0 && offerPrice < originalPrice) {
        discountPercentage = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
      }
      
      console.log('🔍 ProductModal: Final price values:', {
        originalPrice,
        offerPrice,
        discountPercentage
      });

      // Set form with correct prices immediately
      const formData = {
        name: product.name || "",
        originalPrice: originalPrice,
        offerPrice: offerPrice,
        price: offerPrice,
        discountPercentage: discountPercentage,
        stock: product.stock || product.countInStock || "",
        images: product.images && Array.isArray(product.images) ? product.images : [],
        brand: product.brand || "",
        category: product.category || "",
        description: product.description || "",
        seller: product.seller || user?.name || "",
        ratings: product.ratings || 0,
        numOfReviews: product.numOfReviews || 0,
        featured: product.featured || false,
        isNew: product.isNew !== undefined ? product.isNew : true,
        specifications: product.specifications || {},
        tags: product.tags || []
      };
      
      console.log('🔍 ProductModal: Setting form with data:', {
        originalPrice: formData.originalPrice,
        offerPrice: formData.offerPrice,
        price: formData.price
      });
      
      setForm(formData);
      
      // Debug: Log what we just set
      console.log('🔍 ProductModal: Form set with data:', formData);
      
      // Set category data
      setCategoryData({
        selectedFlavor: product.cakeFlavor || '',
        selectedTypes: product.productTypes || [],
        combinedCategory: product.category || '',
        tags: product.productTypes || [],
        displayCategory: product.category || ''
      });
      
      // Handle images
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const previews = product.images.map(img => {
          if (typeof img === 'string') {
            return img;
          } else if (img && typeof img === 'object') {
            return img.url || img.src || img;
          }
          return img;
        }).filter(img => img);
        
        setImagePreview(previews);
      } else {
        setImagePreview([]);
      }
      
      setIsLoadingProduct(false);
      
    } else {
      // Creating new product
      console.log('🔍 ProductModal: Creating new product');
      setForm({
        name: "",
        originalPrice: "",
        offerPrice: "",
        price: "",
        discountPercentage: 0,
        stock: "",
        images: [],
        brand: "",
        category: "",
        description: "",
        seller: user?.name || "",
        ratings: 0,
        numOfReviews: 0,
        featured: false,
        isNew: true,
        specifications: {},
        tags: []
      });
      setCategoryData({
        selectedFlavor: '',
        selectedTypes: [],
        combinedCategory: '',
        tags: [],
        displayCategory: ''
      });
      setImagePreview([]);
    }
    setErrors({});
  }, [product, user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name || !form.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }
    
    if (!form.originalPrice || parseFloat(form.originalPrice) <= 0) {
      newErrors.originalPrice = "Original price must be greater than 0";
    }
    
    if (!form.offerPrice || parseFloat(form.offerPrice) <= 0) {
      newErrors.offerPrice = "Offer price must be greater than 0";
    }
    
    if (form.originalPrice && form.offerPrice && parseFloat(form.offerPrice) >= parseFloat(form.originalPrice)) {
      newErrors.offerPrice = "Offer price must be less than original price";
    }
    
    if (form.stock === "" || form.stock === null || parseInt(form.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required (0 or more)";
    }
    
    if (!form.brand || !form.brand.trim()) {
      newErrors.brand = "Brand is required";
    } else if (form.brand.trim().length < 2) {
      newErrors.brand = "Brand must be at least 2 characters";
    }
    
    if (!categoryData.selectedFlavor && categoryData.selectedTypes.length === 0) {
      newErrors.category = "Please select either a cake flavor or at least one product type";
    }
    
    // For cake products, require both flavor and Cakes checkbox
    if (categoryData.selectedFlavor && !categoryData.selectedTypes.includes('cakes')) {
      newErrors.category = "For cake products, please also select the 'Cakes' checkbox";
    }
    
    if (!form.description || !form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    
    // Validate images
    if (!form.images || form.images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to calculate discount percentage
  const calculateDiscountPercentage = (originalPrice, offerPrice) => {
    if (!originalPrice || !offerPrice || originalPrice <= 0 || offerPrice <= 0) {
      return 0;
    }
    const discount = ((originalPrice - offerPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  // Simple price calculation when user changes values
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    // Don't run during product loading
    if (isLoadingProduct) {
      return;
    }

    // Only run this if we're not in the middle of loading a product
    if (product && form.originalPrice && form.offerPrice) {
      console.log('🔍 ProductModal: Price calculation useEffect triggered:', {
        originalPrice: form.originalPrice,
        offerPrice: form.offerPrice
      });
      
      const original = parseFloat(form.originalPrice) || 0;
      const offer = parseFloat(form.offerPrice) || 0;

      if (original > 0 && offer > 0) {
        const discount = original > offer ? ((original - offer) / original) * 100 : 0;
        setForm(prev => ({
          ...prev,
          price: offer,
          discountPercentage: Math.round(discount)
        }));
      } else if (original > 0) {
        setForm(prev => ({
          ...prev,
          price: original,
          discountPercentage: 0
        }));
      }
    }
  }, [form.originalPrice, form.offerPrice, isInitialLoad, product, isLoadingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log('🔍 ProductModal: handleChange called:', { name, value, type });
    
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      console.log('🔍 ProductModal: Form state updated:', {
        originalPrice: newForm.originalPrice,
        offerPrice: newForm.offerPrice,
        price: newForm.price
      });
      return newForm;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };


  const handleCategorySave = (data) => {
    setCategoryData(data);
    setForm(prev => ({
      ...prev,
      category: data.combinedCategory,
      tags: data.tags
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 ProductModal: Form submission started');
    console.log('🚀 ProductModal: Form data:', form);
    
    if (!validateForm()) {
      console.log('❌ ProductModal: Form validation failed');
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    console.log('✅ ProductModal: Form validation passed');
    setIsSubmitting(true);
    
    try {
      let imageUrls = [];
      
      // Process images from ModernImageUpload component
      const filesToUpload = form.images.filter(img => img.file && img.file instanceof File);
      const urlImages = form.images.filter(img => img.url && !img.file);
      
      console.log('🖼️  Files to upload:', filesToUpload.length);
      console.log('🔗 URL images:', urlImages.length);
      
      // Upload file images if any
      if (filesToUpload.length > 0) {
        console.log('📤 Starting image upload...');
        try {
          const fileObjects = filesToUpload.map(img => img.file);
          const uploadResponse = await productAPI.uploadImages(fileObjects);
          console.log('📤 Upload response:', uploadResponse);
          
          if (uploadResponse.success) {
            const uploadedUrls = uploadResponse.images.map(img => 
              img.url.startsWith('http') ? img.url : `http://localhost:8000${img.url}`
            );
            imageUrls = [...imageUrls, ...uploadedUrls];
            console.log('✅ Images uploaded successfully:', uploadedUrls);
            showToast(`${uploadedUrls.length} images uploaded successfully`, 'success');
          } else {
            console.log('❌ Upload failed:', uploadResponse.message);
            showToast(uploadResponse.message || 'Failed to upload images', 'error');
          }
        } catch (uploadError) {
          console.error('❌ Image upload error:', uploadError);
          showToast(uploadError.message || 'Failed to upload images', 'error');
          // Continue with product creation even if image upload fails
        }
      }
      
      // Add URL images directly
      const urlImageUrls = urlImages.map(img => img.url);
      imageUrls = [...imageUrls, ...urlImageUrls];
      
      // Keep existing image URLs (for editing)
      const existingUrls = form.images.filter(img => typeof img === 'string' || (img && img.url && !img.file));
      const existingImageUrls = existingUrls.map(img => 
        typeof img === 'string' ? img : img.url
      );
      
      // Combine all image URLs
      const allImageUrls = [...existingImageUrls, ...imageUrls];
      
      // Prepare product data
      const productData = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice) || parseFloat(form.price),
        offerPrice: parseFloat(form.offerPrice) || parseFloat(form.price),
        discountPercentage: parseFloat(form.discountPercentage) || 0,
        stock: parseInt(form.stock),
        ratings: parseFloat(form.ratings) || 0,
        numOfReviews: parseInt(form.numOfReviews) || 0,
        name: form.name.trim(),
        description: form.description.trim(),
        category: categoryData.combinedCategory,
        categoryName: categoryData.combinedCategory,
        cakeFlavor: categoryData.selectedFlavor,
        productTypes: categoryData.tags,
        brand: form.brand.trim(),
        seller: form.seller.trim() || user?.name || "Admin",
        featured: Boolean(form.featured),
        isNew: Boolean(form.isNew),
        specifications: form.specifications || {},
        tags: categoryData.tags || [],
        // Use uploaded image URLs or default
        images: allImageUrls.length > 0 ? allImageUrls : ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' fill='%23666' font-size='16'%3EProduct Image%3C/text%3E%3C/svg%3E"]
      };
      
      console.log('📝 ProductModal: Prepared product data for update:', productData);
      
      // Call the save function
      console.log('🚀 ProductModal: Calling onSave with productData:', productData);
      await onSave(productData);
      console.log('✅ ProductModal: onSave completed successfully');
      showToast(
        product ? 'Product updated successfully' : 'Product created successfully', 
        'success'
      );
      onClose();
    } catch (error) {
      console.error('❌ ProductModal: Error in handleSubmit:', error);
      showToast(error.message || 'Failed to save product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">


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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name (min 3 characters)"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹) *
              </label>
              <input
                type="number"
                name="originalPrice"
                value={form.originalPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.originalPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
              {/* Debug info - temporary */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: form.originalPrice="{form.originalPrice}" | product.originalPrice="{product?.originalPrice}" | product.price="{product?.price}"
              </div>

              {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
            </div>

            {/* Offer Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Price (₹) *
              </label>
              <input
                type="number"
                name="offerPrice"
                value={form.offerPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.offerPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
              {/* Debug info - temporary */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: form.offerPrice="{form.offerPrice}" | product.offerPrice="{product?.offerPrice}" | product.price="{product?.price}"
              </div>
              {errors.offerPrice && <p className="text-red-500 text-sm mt-1">{errors.offerPrice}</p>}
            </div>

            {/* Discount Display */}
            {form.originalPrice && form.offerPrice && form.discountPercentage > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Discount:</span>
                  <span className="text-lg font-bold text-red-600">
                    {form.discountPercentage}% OFF
                  </span>
                </div>
                <div className="mt-1 text-xs text-red-600">
                  You save: ₹{(form.originalPrice - form.offerPrice).toFixed(2)}
                </div>
              </div>
            )}

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                required
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            {/* Simplified Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                🍰 Product Categories *
              </label>
              
              <SimpleCategorySelection
                onCategoryChange={handleCategorySave}
                initialData={categoryData}
              />
              
              {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter brand name (min 2 characters)"
                required
              />
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
            </div>

            {/* Seller */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller
              </label>
              <input
                type="text"
                name="seller"
                value={form.seller}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter seller name"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product description (min 10 characters)"
              required
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Modern Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Product Images *
            </label>
            
            <ModernImageUpload
              images={form.images}
              onImagesChange={(newImages) => {
                setForm(prev => ({ ...prev, images: newImages }));
                // Update image preview for backward compatibility
                const previews = newImages.map(img => img.preview || img.url);
                setImagePreview(previews);
              }}
              maxImages={5}
              required={true}
              error={errors.images}
            />
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ratings
              </label>
              <input
                type="number"
                name="ratings"
                value={form.ratings}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            {/* Number of Reviews */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Reviews
              </label>
              <input
                type="number"
                name="numOfReviews"
                value={form.numOfReviews}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Product Status */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  ⭐ Featured Product
                </label>
              </div>

              {/* Is New */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={form.isNew}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  🆕 Mark as New Product
                </label>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500">
                <strong>Featured:</strong> Products will be highlighted on the main page. 
                <br />
                <strong>New:</strong> Products will appear in the "New Products" section and automatically lose "new" status after 30 days.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
        </div>
        
      </div>
    );
  } catch (error) {
    console.error('❌ ProductModal: Render error:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Product Form</h2>
          <p className="text-gray-600 mb-4">There was an error loading the product form. Please try again.</p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}
