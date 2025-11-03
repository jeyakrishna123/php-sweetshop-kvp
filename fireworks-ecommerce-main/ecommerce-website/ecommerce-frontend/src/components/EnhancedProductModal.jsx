import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { productAPI } from "../utils/adminAPI";
import ModernImageUpload from "./ModernImageUpload";
import axios from "../axios";

export default function EnhancedProductModal({ product, onSave, onClose, categories = [] }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Debug: Log when modal component renders
  useEffect(() => {
    console.log('🎨 EnhancedProductModal: Component rendered/mounted');
    console.log('🎨 EnhancedProductModal: Product prop:', product);
    console.log('🎨 EnhancedProductModal: Mode:', product ? 'EDIT' : 'CREATE');
  }, []);
  
  // Main categories from menu navigation
  const mainCategories = [
    { name: "Daughters Day Cakes", icon: "👧", color: "bg-pink-100 text-pink-800" },
    { name: "Cakes", icon: "🎂", color: "bg-pink-100 text-pink-800" },
    { name: "Trending Cakes", icon: "🔥", color: "bg-orange-100 text-orange-800" },
    { name: "Theme Cakes", icon: "🎨", color: "bg-purple-100 text-purple-800" },
    { name: "By Relationship", icon: "💕", color: "bg-red-100 text-red-800" },
    { name: "Desserts", icon: "🍰", color: "bg-yellow-100 text-yellow-800" },
    { name: "Birthday", icon: "🎉", color: "bg-blue-100 text-blue-800" },
    { name: "Anniversary", icon: "💍", color: "bg-green-100 text-green-800" },
    { name: "Customized Cakes", icon: "🎯", color: "bg-indigo-100 text-indigo-800" }
  ];

  // Sub-categories for different main categories - MATCHED WITH NAVIGATION MENU
  const subCategories = {
    "Cakes": [
      // Trending Cakes
      "Gourmet Cakes", "Bento Cakes", "Labubu Cakes", "Cricket Cakes", "Pinata Cakes", "Drip Cakes",
      // By Type
      "Bestsellers", "Eggless Cakes", "Photo Cakes", "Cheese Cakes", "Half Cakes", "Heart Shaped",
      // By Flavours
      "Chocolate Cakes", "Butterscotch Cakes", "Pineapple Cakes", "Kit Kat Cakes", "Black Forest Cakes", "Red Velvet Cakes",
      // Additional Flavours
      "Chocolate", "Butterscotch", "Black Forest", "Gulab Jamun", "Rasmalai", "Vanilla", 
      "Blueberry", "Strawberry", "Special Flavours", "Double Flavours", "Red Velvet", 
      "Fruit Cakes", "Truffle Cakes", "Ferrero Rocher", "Mango", "Pineapple", "Kitkat Cakes", 
      "Customize Cakes", "Trending Cakes"
    ],
    "Theme Cakes": [
      // Kids Cakes
      "1st Birthday Cakes", "Princess Cakes", "Animal Cakes", "Masha & The Bear Cakes", 
      "Cakes For Boys", "Cakes For Girls", "Number Cakes", "Alphabet Cakes",
      // Character Cakes
      "Spiderman Cakes", "Unicorn Cakes", "Barbie Cakes", "Harry Potter Cakes", 
      "Avenger Cakes", "Peppa Pig Cakes", "Doraemon Cakes", "Naruto Cakes",
      // Grown Up Cakes
      "Makeup Cakes", "Bride To Be Cakes", "Wedding Cakes", "Gym Cakes", 
      "Party Cakes", "BTS Cakes",
      // More Cakes
      "Jungle Theme Cakes", "Cricket Cakes", "Football Cakes", "Basketball Cakes",
      "Rainbow Cakes", "Butterfly Cakes", "Shinchan Cakes", "Dinosaur Cakes"
    ],
    "By Relationship": [
      // For Him
      "Cakes For Friend", "Cakes For Father", "Cakes For Husband", 
      "Cakes For Brother", "Cakes For Boyfriend",
      // For Her
      "Cakes For Mother", "Cakes For Wife", "Cakes For Girlfriend", "Cakes For Sister"
    ],
    "Desserts": [
      "All Desserts", "Jar Cakes", "Pastries", "Cheese Cakes",
      "Cup Cakes", "Brownies", "Cookies", "Tea Cakes"
    ],
    "Birthday": [
      "Birthday Cakes", "1st Birthday Cakes", "Birthday Photo Cakes", "Half Birthday Cakes"
    ],
    "Anniversary": [
      "All Anniversary Cakes", "1st Anniversary Cakes", "25th Anniversary Cakes",
      "Anniversary Cakes For Parents", "5th Anniversary Cakes", "Anniversary Photo Cakes",
      "10th Anniversary Cakes", "50th Anniversary Cakes"
    ],
    "Daughters Day Cakes": [
      "Special Daughter Cakes", "Love Daughter Cakes", "Princess Daughter Cakes",
      "Blessing Daughter Cakes", "Custom Daughter Cakes"
    ],
    "Trending Cakes": [
      "Popular Cakes", "Latest Cakes", "Best Seller Cakes", "Customer Favorites",
      "Viral Cakes", "Seasonal Trending"
    ],
    "Customized Cakes": [
      "Personalized Cakes", "Custom Design Cakes", "Photo Cakes", "Message Cakes",
      "Shape Cakes", "Theme Cakes", "Special Occasion Cakes"
    ]
  };

  const [showSubCategoryPopup, setShowSubCategoryPopup] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [showMenuFilter, setShowMenuFilter] = useState(false);
  const [selectedMenuFilter, setSelectedMenuFilter] = useState("all");
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(false);
  
  
  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    offerPrice: "",
    price: "",
    discountPercentage: 0,
    stock: "",
    images: [],
    brand: "",
    category: "",
    subCategory: "",
    menuOption: "", // New field for menu selection
    description: "",
    features: "",
    specifications: "",
    tags: "",
    isActive: true,
    isFeatured: false,
    isNew: true, // Default to true for new products
    isSpecial: false,
    isBestseller: false,
    // Weight configuration
    hasWeightOptions: false,
    weightOptions: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Additional flag to prevent duplicate submissions


  // Initialize form when product prop changes
  useEffect(() => {
    console.log('🔍 EnhancedProductModal: product prop changed:', product);

    if (product && product._id) {
      // EDIT MODE: Load existing product data
      console.log('🔄 EnhancedProductModal: Loading product data for editing');
      setForm({
        name: product.name || "",
        originalPrice: product.originalPrice || "",
        offerPrice: product.offerPrice || "",
        price: product.price || "",
        discountPercentage: product.discountPercentage || 0,
        stock: product.stock || "",
        images: product.images ? product.images.map(img => {
          // Ensure images are in the correct format for preview
          let imageUrl = '';
          
          if (typeof img === 'string') {
            imageUrl = img; // Already a URL or base64
          } else if (typeof img === 'object' && img.url) {
            imageUrl = img.url; // Extract URL from object
          } else if (typeof img === 'object' && img.preview) {
            imageUrl = img.preview; // Extract preview from object
          } else if (typeof img === 'object' && img.imageUrl) {
            imageUrl = img.imageUrl; // Extract imageUrl from object
          } else {
            imageUrl = img; // Fallback
          }
          
          // If it's a relative path, convert to full URL for display
          if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
            const apiURL = import.meta.env.VITE_API_URL || "https://skbakers.com/api";
            // Remove /api from URL if present, then add /backend/uploads if needed
            const baseURL = apiURL.replace('/api', '');
            if (!imageUrl.startsWith('/')) {
              imageUrl = '/' + imageUrl;
            }
            imageUrl = baseURL + imageUrl;
          }
          
          // Return as object format that ModernImageUpload expects
          return {
            url: imageUrl,
            preview: imageUrl,
            name: typeof img === 'object' && img.name ? img.name : 'Product Image',
            isUrl: !imageUrl.startsWith('data:')
          };
        }) : [],
        brand: product.brand || "",
        category: product.category || product.categoryName || product.cakeFlavor || "",
        subCategory: product.subCategory || "",
        menuOption: product.menuOption || "",
        description: product.description || "",
        features: product.features || "",
        specifications: product.specifications || "",
        tags: product.tags || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        isSpecial: product.isSpecial || false,
        isBestseller: product.isBestseller || false,
        // Weight configuration
        hasWeightOptions: product.hasWeightOptions || false,
        weightOptions: product.weightOptions || []
      });

      // Set the selected main category based on the product's category
      const productCategory = product.category || product.categoryName || product.cakeFlavor || "";
      console.log('🔍 EnhancedProductModal: Product category from database:', productCategory);
      
      // CRITICAL: Set menu filter from database FIRST (menuCategory or selectedMenuFilter)
      const menuCategory = product.menuCategory || product.selectedMenuFilter || "";
      if (menuCategory && menuCategory !== 'all') {
        setSelectedMenuFilter(menuCategory);
        console.log('✅ EnhancedProductModal: Menu filter set from database:', menuCategory);
      } else {
        // If no menu category in database, set to "all" to show all categories
        setSelectedMenuFilter("all");
        console.log('⚠️ EnhancedProductModal: No menu category in database, defaulting to "all"');
      }
      
      // CRITICAL: Set sub category from database
      const subCategory = product.subCategory || "";
      if (subCategory) {
        setSelectedSubCategory(subCategory);
        // CRITICAL: Also update form.subCategory to ensure it's saved on submit
        setForm(prev => ({ ...prev, subCategory }));
        console.log('✅ EnhancedProductModal: Sub category set from database:', subCategory);
      } else {
        // Ensure form.subCategory is cleared if not in database
        setForm(prev => ({ ...prev, subCategory: "" }));
      }
      
      // CRITICAL: Set menu option from database
      const menuOption = product.menuOption || "";
      if (menuOption) {
        setForm(prev => ({ ...prev, menuOption }));
        console.log('✅ EnhancedProductModal: Menu option set from database:', menuOption);
      } else {
        // Ensure form.menuOption is cleared if not in database
        setForm(prev => ({ ...prev, menuOption: "" }));
      }
      
      if (productCategory) {
        // First, try exact match
        let matchingCategory = mainCategories.find(cat => 
          cat.name === productCategory
        );
        
        // If no exact match, try case-insensitive
        if (!matchingCategory) {
          matchingCategory = mainCategories.find(cat => 
            cat.name.toLowerCase() === productCategory.toLowerCase()
          );
        }
        
        // If still no match, try partial match
        if (!matchingCategory) {
          matchingCategory = mainCategories.find(cat => 
            productCategory.toLowerCase().includes(cat.name.toLowerCase()) || 
            cat.name.toLowerCase().includes(productCategory.toLowerCase())
          );
        }
        
        if (matchingCategory) {
          // Use the exact name from mainCategories to ensure consistency
          const exactCategoryName = matchingCategory.name;
          setSelectedMainCategory(exactCategoryName);
          // Only set menu filter if it wasn't already set from database
          if (!menuCategory || menuCategory === 'all') {
            setSelectedMenuFilter(exactCategoryName);
          }
          
          // CRITICAL: Update form.category to use exact name from mainCategories
          setForm(prev => ({ ...prev, category: exactCategoryName }));
          
          console.log('✅ EnhancedProductModal: Category matched and set:', exactCategoryName, 'for product category:', productCategory);
        } else {
          // Use product's category directly if no match found
          setSelectedMainCategory(productCategory);
          // Only set menu filter if it wasn't already set from database
          if (!menuCategory || menuCategory === 'all') {
            setSelectedMenuFilter("all"); // Show all categories when editing
          }
          // Ensure form.category is set to product's category
          setForm(prev => ({ ...prev, category: productCategory }));
          console.log('⚠️ EnhancedProductModal: Category not found in mainCategories, using product category directly:', productCategory);
        }
      } else {
        // Only reset to "all" if there's no category at all and no menuCategory
        console.log('⚠️ EnhancedProductModal: No category found in product');
        setSelectedMainCategory("");
        if (!menuCategory || menuCategory === 'all') {
          setSelectedMenuFilter("all");
        }
      }
      
      // Reset dropdown visibility states (but NOT the selected filter value)
      setShowMenuFilter(false);
      setShowMenuDropdown(false);
    } else {
      // CREATE MODE: Reset form to empty values
      console.log('➕ EnhancedProductModal: Resetting form for new product creation');
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
        subCategory: "",
        menuOption: "",
        description: "",
        features: "",
        specifications: "",
        tags: "",
        isActive: true,
        isFeatured: false,
        isNew: true, // Default to true for new products
        isSpecial: false,
        isBestseller: false,
        hasWeightOptions: false,
        weightOptions: []
      });
      setSelectedMainCategory("");
      setSelectedSubCategory("");
      setSelectedMenuFilter("all");
      setShowMenuFilter(false);
      setShowMenuDropdown(false);
      setErrors({});
    }
  }, [product]);

  // Handle main category selection
  const handleMainCategorySelect = (categoryName) => {
    setSelectedMainCategory(categoryName);
    
    // Only clear sub-category if the category is actually changing
    setForm(prev => {
      const newForm = { ...prev, category: categoryName };
      
      // Clear sub-category only if the category is changing
      if (prev.category !== categoryName) {
        newForm.subCategory = '';
      }
      
      return newForm;
    });
    
    // Show sub-category popup for categories that have sub-categories
    if (subCategories[categoryName] && subCategories[categoryName].length > 0) {
      setShowSubCategoryPopup(true);
    } else {
      setShowSubCategoryPopup(false);
    }
  };

  // Handle sub-category selection
  const handleSubCategorySelect = (subCategoryName) => {
    setSelectedSubCategory(subCategoryName);
    setForm(prev => ({ ...prev, subCategory: subCategoryName }));
    setShowSubCategoryPopup(false);
  };

  // Handle direct category selection (for non-main categories)
  const handleDirectCategorySelect = (categoryName) => {
    setForm(prev => ({ ...prev, category: categoryName, subCategory: "" }));
  };



  // Handle menu filter selection
  const handleMenuFilterSelect = (menuCategory) => {
    setSelectedMenuFilter(menuCategory);
    if (menuCategory !== "all") {
      // Auto-select the menu category when filtering
      setForm(prev => ({ ...prev, category: menuCategory }));
    }
    setShowMenuFilter(false);
  };

  // Handle menu option selection
  const handleMenuOptionSelect = (menuOption) => {
    console.log('🔍 Product Creation: Selected menu option:', menuOption);
    setForm(prev => ({ ...prev, menuOption }));
    setShowMenuDropdown(false);
  };

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setMenuItemsLoading(true);
      const response = await axios.get('/api/menu/active');
      if (response.data.success) {
        setMenuItems(response.data.data);
        console.log('📋 Menu items loaded for product creation:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setMenuItemsLoading(false);
    }
  };

  // Fetch menu items when component mounts and when editing
  useEffect(() => {
    fetchMenuItems();
  }, [product]);

  // Calculate price and discount
  useEffect(() => {
    const original = parseFloat(form.originalPrice) || 0;
    const offer = parseFloat(form.offerPrice) || 0;
    
    if (original > 0 && offer > 0) {
      const discount = ((original - offer) / original) * 100;
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
  }, [form.originalPrice, form.offerPrice]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // If main category changes, clear sub-category only if it's actually changing
      if (name === 'category' && prev.category !== value) {
        newForm.subCategory = '';
      }
      
      return newForm;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle weight option changes
  const handleWeightOptionChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  // Add new weight option
  const addWeightOption = () => {
    setForm(prev => ({
      ...prev,
      weightOptions: [...prev.weightOptions, { 
        weight: "", 
        price: "", 
        servingSize: "",
        description: ""
      }]
    }));
  };

  // Remove weight option
  const removeWeightOption = (index) => {
    setForm(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.filter((_, i) => i !== index)
    }));
  };


  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
      console.error('❌ Validation Error: Product name is required');
    }
    if (!form.category) {
      newErrors.category = "Category is required";
      console.error('❌ Validation Error: Category is required');
    }

    // Validate sub-category if the category has sub-categories
    if (form.category && subCategories[form.category] && subCategories[form.category].length > 0) {
      if (!form.subCategory) {
        newErrors.subCategory = "Sub-category is required";
        console.error('❌ Validation Error: Sub-category is required for category:', form.category);
      }
    }

    if (!form.originalPrice || parseFloat(form.originalPrice) <= 0) {
      newErrors.originalPrice = "Original price is required and must be greater than 0";
      console.error('❌ Validation Error: Original price is required');
    }
    if (!form.stock || parseInt(form.stock) < 0) {
      newErrors.stock = "Stock quantity is required";
      console.error('❌ Validation Error: Stock quantity is required');
    }
    if (!form.images || form.images.length === 0) {
      newErrors.images = "At least one image is required";
      console.error('❌ Validation Error: At least one image is required');
    }

    console.log('🔍 Form Validation:', {
      hasErrors: Object.keys(newErrors).length > 0,
      errors: newErrors,
      formData: {
        name: form.name,
        category: form.category,
        subCategory: form.subCategory,
        originalPrice: form.originalPrice,
        stock: form.stock,
        imagesCount: form.images?.length || 0
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CRITICAL: Prevent duplicate submissions with multiple checks
    if (isLoading || isSubmitting) {
      console.log('🚀 EnhancedProductModal: Already submitting, ignoring duplicate submission');
      showToast("Please wait, product is being created...", "info");
      return;
    }
    
    // Set both flags immediately to prevent any race conditions
    setIsLoading(true);
    setIsSubmitting(true);

    if (!validateForm()) {
      showToast("Please fix the errors below", "error");
      // Scroll to top of modal to show error summary
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Process images - upload files first, then combine with URLs
      let processedImages = [];
      if (form.images && form.images.length > 0) {
        // Separate file uploads from URLs/existing images
        const filesToUpload = form.images.filter(img => 
          img && typeof img === 'object' && img.file && img.file instanceof File
        );
        const existingImages = form.images.filter(img => 
          !(img && typeof img === 'object' && img.file && img.file instanceof File)
        );
        
        // Upload files if any
        if (filesToUpload.length > 0) {
          try {
            console.log('📤 EnhancedProductModal: Uploading', filesToUpload.length, 'image files...');
            const fileObjects = filesToUpload.map(img => img.file);
            const uploadResponse = await productAPI.uploadImages(fileObjects);
            console.log('📤 EnhancedProductModal: Upload response:', uploadResponse);
            
            if (uploadResponse.success && uploadResponse.images) {
              // Extract URLs from upload response
              const uploadedUrls = uploadResponse.images.map(img => {
                // Response format: { url: 'https://...', path: '/uploads/...', name: '...' }
                // Use url (full URL) for consistency - backend will normalize it
                if (typeof img === 'string') {
                  return img; // Already a URL string
                } else if (img && typeof img === 'object') {
                  return img.url || img.fullUrl || img.imageUrl || img.path || '';
                }
                return '';
              }).filter(url => url); // Remove empty URLs
              
              processedImages = [...processedImages, ...uploadedUrls];
              console.log('✅ EnhancedProductModal: Uploaded images:', uploadedUrls);
              showToast(`${uploadedUrls.length} image(s) uploaded successfully`, 'success');
            } else {
              console.error('❌ EnhancedProductModal: Upload failed:', uploadResponse.message);
              showToast(uploadResponse.message || 'Failed to upload some images', 'error');
            }
          } catch (uploadError) {
            console.error('❌ EnhancedProductModal: Image upload error:', uploadError);
            showToast(uploadError.message || 'Failed to upload images', 'error');
            // Continue with existing images even if upload fails
          }
        }
        
        // Process existing images (URLs, base64, or strings)
        const existingImageUrls = existingImages.map(img => {
          // If it's a string URL, use it directly
          if (typeof img === 'string') {
            // Check if it's base64
            if (img.startsWith('data:')) {
              return img; // Keep base64 for now (backend should handle it)
            }
            // Check if it's already a full URL
            if (img.startsWith('http://') || img.startsWith('https://')) {
              return img;
            }
            // Relative path - return as is (backend will handle conversion)
            return img;
          }
          // If it's an object with url property, use the url
          if (typeof img === 'object' && img.url) {
            return img.url;
          }
          // If it's an object with preview property and it's a URL (not base64)
          if (typeof img === 'object' && img.preview && !img.preview.startsWith('data:')) {
            return img.preview;
          }
          // Fallback
          return img;
        }).filter(url => url); // Remove empty values
        
        processedImages = [...processedImages, ...existingImageUrls];
        
        console.log('📝 EnhancedProductModal: Final processed images:', processedImages);
      }
      
      // Validate that we have at least one image
      if (processedImages.length === 0) {
        showToast('Please add at least one product image', 'error');
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      
      // Convert camelCase to snake_case for backend
      const productData = {
        name: form.name,
        description: form.description || '',
        category: form.category,
        price: parseFloat(form.price),
        original_price: parseFloat(form.originalPrice), // Backend uses snake_case
        discount_percentage: parseFloat(form.discountPercentage) || 0, // Backend uses snake_case
        stock: parseInt(form.stock),
        images: processedImages, // Array of URLs (full URLs will be normalized by backend)
        thumbnail: processedImages[0] || null, // First image as thumbnail
        subCategory: form.subCategory || '', // Frontend camelCase - backend will handle conversion
        menuOption: form.menuOption || '', // Frontend camelCase - backend will handle conversion
        // menu_category should be the same as form.category (the main category)
        // Store the category value in menu_category for filtering purposes
        selectedMenuFilter: form.category || null, // menu_category = category (no separate storage needed)
        cake_flavor: form.cakeFlavor || '', // Backend uses snake_case
        is_new: form.isNew || false, // Backend uses snake_case
        is_active: form.isActive !== undefined ? form.isActive : true,
        weight_options: form.weightOptions || null, // Backend uses snake_case
        brand: form.brand || null,
        sku: form.sku || null,
        weight: form.weight || null,
        tags: form.tags || [],
        specifications: form.specifications || []
      };

      console.log('🚀 EnhancedProductModal: Submitting product data:', productData);
      console.log('🔍 EnhancedProductModal: Form values - subCategory:', form.subCategory, 'menuOption:', form.menuOption, 'selectedMenuFilter:', selectedMenuFilter);
      console.log('🔍 EnhancedProductModal: Product data - subCategory:', productData.subCategory, 'menuOption:', productData.menuOption, 'selectedMenuFilter:', productData.selectedMenuFilter);
      console.log('🔍 EnhancedProductModal: Editing mode:', !!product);

      let response;

      if (product && product._id) {
        // Update existing product
        console.log('🔄 EnhancedProductModal: Updating product ID:', product._id);
        response = await productAPI.updateProduct(product._id, productData);

        if (response.success) {
          showToast("Product updated successfully!", "success");
          onSave(productData);
          onClose();
        } else {
          showToast(response.message || "Failed to update product", "error");
        }
      } else {
        // Create new product
        console.log('➕ EnhancedProductModal: Creating new product');
        response = await productAPI.createProduct(productData);

        if (response.success) {
          // Check if this was a duplicate prevention response
          if (response.duplicate_prevented) {
            showToast(response.message || "Product already exists (duplicate prevented)", "warning");
            // Still close modal and refresh list
            onClose();
            onSave(response.product || productData);
          } else {
            showToast("Product created successfully!", "success");
            // CRITICAL: Close modal immediately to prevent re-submission
            onClose();
            onSave(response.product || productData);
          }
        } else {
          showToast(response.message || "Failed to create product", "error");
        }
      }
    } catch (error) {
      console.error("Product creation error:", error);
      showToast("Error creating product: " + (error.message || "Unknown error"), "error");
    } finally {
      // CRITICAL: Reset both flags
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  console.log('🎨 EnhancedProductModal: Rendering modal...');
  console.log('🎨 EnhancedProductModal: Current product:', product);
  console.log('🎨 EnhancedProductModal: Form state:', form);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        // Prevent closing when clicking inside the modal
        if (e.target === e.currentTarget) {
          // Optional: close on backdrop click - onClose();
        }
      }}
    >
      <div
        className="modal-content bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? "Edit Product" : "Create New Product"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter product name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Menu Filter Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Menu Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenuFilter(!showMenuFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span className="flex items-center">
                    {selectedMenuFilter === "all" ? (
                      <>
                        <span className="text-lg mr-2">🍽️</span>
                        All Menu Categories
                      </>
                    ) : (
                      <>
                        <span className="text-lg mr-2">
                          {mainCategories.find(cat => cat.name === selectedMenuFilter)?.icon || "🎂"}
                        </span>
                        {selectedMenuFilter}
                      </>
                    )}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showMenuFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMenuFilter && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 10050 }}>
                    <button
                      type="button"
                      onClick={() => handleMenuFilterSelect("all")}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                        selectedMenuFilter === "all" ? "bg-blue-50 text-blue-800" : ""
                      }`}
                    >
                      <span className="text-lg mr-2">🍽️</span>
                      All Menu Categories
                    </button>
                    {mainCategories.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => handleMenuFilterSelect(category.name)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                          selectedMenuFilter === category.name ? "bg-blue-50 text-blue-800" : ""
                        }`}
                      >
                        <span className="text-lg mr-2">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Menu Option Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Menu Option
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span className="flex items-center">
                    {form.menuOption ? (
                      <>
                        <span className="text-lg mr-2">🎂</span>
                        {form.menuOption}
                      </>
                    ) : (
                      <>
                        <span className="text-lg mr-2">🍽️</span>
                        {menuItemsLoading ? 'Loading...' : 'Select Menu Option'}
                      </>
                    )}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showMenuDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMenuDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 10050 }}>
                    <button
                      type="button"
                      onClick={() => handleMenuOptionSelect("")}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                        !form.menuOption ? "bg-blue-50 text-blue-800" : ""
                      }`}
                    >
                      <span className="text-lg mr-2">🍽️</span>
                      No Menu Option
                    </button>
                    {menuItemsLoading ? (
                      <div className="w-full px-3 py-2 text-center text-gray-500">
                        Loading menu options...
                      </div>
                    ) : (
                      menuItems.map((menuItem) => (
                        <button
                          key={menuItem._id}
                          type="button"
                          onClick={() => handleMenuOptionSelect(menuItem.name)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                            form.menuOption === menuItem.name ? "bg-blue-50 text-blue-800" : ""
                          }`}
                        >
                          <span className="text-lg mr-2">🎂</span>
                          {menuItem.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category *
              </label>
              
              {/* Menu Categories Grid - Show all when editing, filtered when creating */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {mainCategories
                  .filter(category => {
                    // When editing, always show all categories OR show the selected category
                    if (product && product._id) {
                      return true; // Show all categories when editing
                    }
                    // When creating, apply the filter
                    return selectedMenuFilter === "all" || category.name === selectedMenuFilter;
                  })
                  .map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => handleMainCategorySelect(category.name)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        form.category === category.name || selectedMainCategory === category.name ||
                        (form.category && form.category.toLowerCase() === category.name.toLowerCase()) ||
                        (selectedMainCategory && selectedMainCategory.toLowerCase() === category.name.toLowerCase())
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : `border-dashed border-gray-300 hover:border-blue-500 ${category.color}`
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="font-medium text-sm">{category.name}</div>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Quick Category Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Quick Select:
                </label>
                <div className="flex flex-wrap gap-2">
                  {mainCategories
                    .filter(category => {
                      // When editing, always show all categories
                      if (product && product._id) {
                        return true; // Show all categories when editing
                      }
                      // When creating, apply the filter
                      return selectedMenuFilter === "all" || category.name === selectedMenuFilter;
                    })
                    .map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => handleDirectCategorySelect(category.name)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          form.category === category.name || selectedMainCategory === category.name ||
                          (form.category && form.category.toLowerCase() === category.name.toLowerCase()) ||
                          (selectedMainCategory && selectedMainCategory.toLowerCase() === category.name.toLowerCase())
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  
                </div>
              </div>

              {/* Selected Categories Display */}
              {(form.category || form.subCategory) && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800">
                    <strong>✓ Selected:</strong> {form.category}
                    {form.subCategory && ` → ${form.subCategory}`}
                  </div>
                </div>
              )}

              {/* Sub-Category Selection */}
              {form.category && subCategories[form.category] && subCategories[form.category].length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Sub-Category *
                  </label>
                  <div className="relative">
                    <select
                      name="subCategory"
                      value={form.subCategory || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.subCategory ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select a sub-category</option>
                      {subCategories[form.category].map((subCategory, index) => (
                        <option key={index} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.subCategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.subCategory}</p>
                  )}
                </div>
              )}

              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price *
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.originalPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
                {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Price
                </label>
                <input
                  type="number"
                  name="offerPrice"
                  value={form.offerPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Price
                </label>
                <input
                  type="text"
                  value={`₹${form.price || 0}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
                {form.discountPercentage > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    {form.discountPercentage}% off
                  </p>
                )}
              </div>
            </div>

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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                required
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>

            {/* Modern Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images *
              </label>
              <ModernImageUpload
                images={form.images}
                onImagesChange={(newImages) => {
                  setForm(prev => ({ ...prev, images: newImages }));
                }}
                maxImages={5}
                required={true}
                error={errors.images}
              />
            </div>

            {/* Weight Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Weight Options
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasWeightOptions"
                    name="hasWeightOptions"
                    checked={form.hasWeightOptions}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasWeightOptions" className="ml-2 text-sm text-gray-700">
                    Enable Weight Selection
                  </label>
                </div>
              </div>

              {form.hasWeightOptions && (
                <div className="space-y-4">
                  {/* Custom Weight Options Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Weight Options Configuration
                      </label>
                      <button
                        type="button"
                        onClick={addWeightOption}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        + Add Weight Option
                      </button>
                    </div>

                    {form.weightOptions.length > 0 ? (
                      <div className="space-y-4">
                        {form.weightOptions.map((option, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Weight (Kg) *
                                </label>
                                <input
                                  type="text"
                                  value={option.weight}
                                  onChange={(e) => handleWeightOptionChange(index, 'weight', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., 1, 2, 3"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Price (₹) *
                                </label>
                                <input
                                  type="number"
                                  value={option.price}
                                  onChange={(e) => handleWeightOptionChange(index, 'price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Price for this weight"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Serving Size *
                                </label>
                                <input
                                  type="text"
                                  value={option.servingSize}
                                  onChange={(e) => handleWeightOptionChange(index, 'servingSize', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., Serves 4-6"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={option.description || ''}
                                  onChange={(e) => handleWeightOptionChange(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Optional description"
                                />
                              </div>
                            </div>
                            {form.weightOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWeightOption(index)}
                                className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove Weight Option
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p>No weight options configured yet.</p>
                        <p className="text-sm">Click "Add Weight Option" to get started.</p>
                      </div>
                    )}
                  </div>

                  {/* Weight Options Preview */}
                  {form.weightOptions.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-3">Weight Options Preview:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {form.weightOptions.map((option, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                            <div className="font-semibold text-lg">{option.weight} Kg</div>
                            <div className="text-sm font-medium text-green-600">₹{option.price}</div>
                            {option.description && (
                              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Status Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Status
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-800">
                  ℹ️ <strong>Active</strong> products are visible to customers.
                  Inactive products can only be viewed by admins.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 font-medium">
                    Active (Visible to customers)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                    Featured
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isNew"
                    name="isNew"
                    checked={form.isNew}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isNew" className="ml-2 text-sm text-gray-700">
                    New Product
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isBestseller"
                    name="isBestseller"
                    checked={form.isBestseller}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isBestseller" className="ml-2 text-sm text-gray-700">
                    Bestseller
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading
                  ? (product ? "Updating..." : "Creating...")
                  : (product ? "Update Product" : "Create Product")
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sub-Category Popup */}
      {showSubCategoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Select {selectedMainCategory} Sub-Category
                </h3>
                <button
                  onClick={() => setShowSubCategoryPopup(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subCategories[selectedMainCategory]?.map((subCategory) => (
                  <button
                    key={subCategory}
                    type="button"
                    onClick={() => handleSubCategorySelect(subCategory)}
                    className={`p-4 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all duration-200 ${
                      selectedSubCategory === subCategory 
                        ? 'border-blue-500 bg-blue-50 text-blue-800' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">{subCategory}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
