import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { categoryAPI } from "../utils/adminAPI";
import axios from "../axios";
import { getApiConfig } from "../config/api";
import ImageUploadOrUrl from "../components/ImageUploadOrUrl";

// Default predefined categories - can be modified
const defaultPredefinedCakeCategories = [
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
  
  // Sweet Categories
  "Indian Sweets",
  "Chocolates",
  "Cookies",
  "Pastries",
  "Donuts",
  "Cupcakes",
  "Muffins",
  "Brownies",
  "Tarts",
  "Pies",
  
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

const AdminCategories = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('predefined'); // 'predefined' or 'custom'
  const [productCounts, setProductCounts] = useState({});
  const [editingPredefinedCategory, setEditingPredefinedCategory] = useState(null);
  const [predefinedCategoryForm, setPredefinedCategoryForm] = useState({
    name: '',
    image: '',
    description: ''
  });
  const [modifiedCategories, setModifiedCategories] = useState({});
  const [predefinedCakeCategories, setPredefinedCakeCategories] = useState(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('predefinedCakeCategories');
    return saved ? JSON.parse(saved) : defaultPredefinedCakeCategories;
  });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the /all endpoint to get both active and inactive categories
      const response = await axios.get(`${getApiConfig().BASE_URL}/api/categories/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        const categories = response.data.categories || [];
        
        // Add product counts to each category
        const categoriesWithCounts = await Promise.all(
          categories.map(async (category) => {
            try {
              const productResponse = await axios.get(`${getApiConfig().BASE_URL}/api/products?category=${category._id}&limit=1`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              return {
                ...category,
                productCount: productResponse.data.pagination?.totalProducts || 0
              };
            } catch (error) {
              console.error(`Failed to fetch product count for category ${category.name}:`, error);
              return {
                ...category,
                productCount: 0
              };
            }
          })
        );
        
        setCategories(categoriesWithCounts);
      } else {
        setError("Failed to load categories");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setError("Failed to load categories");
      showToast(error.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCounts = async () => {
    try {
      const counts = {};
      for (const category of predefinedCakeCategories) {
        try {
          const response = await axios.get(`${getApiConfig().BASE_URL}/api/products?category=${encodeURIComponent(category)}&limit=1`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          counts[category] = response.data.pagination?.totalProducts || 0;
        } catch (error) {
          console.error(`Failed to fetch product count for ${category}:`, error);
          counts[category] = 0;
        }
      }
      setProductCounts(counts);
    } catch (error) {
      console.error("Failed to fetch product counts:", error);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      navigate('/admin/login');
      return;
    }
    fetchCategories();
    fetchProductCounts();
    
    // Load saved modifications from localStorage
    const savedModifications = localStorage.getItem('predefinedCategoryModifications');
    if (savedModifications) {
      try {
        setModifiedCategories(JSON.parse(savedModifications));
      } catch (error) {
        console.error('Failed to load saved modifications:', error);
      }
    }

    // Load predefined categories from localStorage
    const savedPredefinedCategories = localStorage.getItem('predefinedCakeCategories');
    if (savedPredefinedCategories) {
      try {
        setPredefinedCakeCategories(JSON.parse(savedPredefinedCategories));
      } catch (error) {
        console.error('Failed to load saved predefined categories:', error);
      }
    }
  }, [user, navigate]);

  // Handle ESC key to close form
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showAddForm) {
        cancelForm();
      }
    };

    if (showAddForm) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showAddForm]);

  // Listen for predefined category deletion events
  useEffect(() => {
    const handlePredefinedCategoryDeleted = (event) => {
      const { updatedCategories } = event.detail;
      setPredefinedCakeCategories(updatedCategories);
    };

    window.addEventListener('predefinedCategoryDeleted', handlePredefinedCategoryDeleted);
    
    return () => {
      window.removeEventListener('predefinedCategoryDeleted', handlePredefinedCategoryDeleted);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (formData.image && !isValidUrl(formData.image)) {
      errors.image = 'Please enter a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      showToast("Please fix the errors below", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        // Update existing category
        const response = await categoryAPI.updateCategory(editingCategory._id, formData);
        
        if (response.success) {
          showToast("Category updated successfully", "success");
          setEditingCategory(null);
          resetForm();
          fetchCategories();
        }
      } else {
        // Create new category
        const response = await categoryAPI.createCategory(formData);
        
        if (response.success) {
          showToast("Category created successfully", "success");
          setShowAddForm(false);
          resetForm();
          fetchCategories();
        }
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      showToast(error.message || "Failed to save category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      console.log("Attempting to delete category with ID:", categoryId);
      const response = await categoryAPI.deleteCategory(categoryId);
      console.log("Delete response:", response);
      
      if (response.success) {
        showToast("Category deleted successfully", "success");
        fetchCategories();
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      showToast(error.message || "Failed to delete category", "error");
    }
  };

  const handleToggleStatus = async (category) => {
    const action = category.isActive ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} the category "${category.name}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Use direct API call to update category status
      const response = await axios.put(`${getApiConfig().BASE_URL}/api/categories/${category._id}`, {
        ...category,
        isActive: !category.isActive
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        showToast(`Category "${category.name}" ${action}d successfully`, "success");
        fetchCategories();
      } else {
        throw new Error(response.data.message || 'Failed to update category status');
      }
    } catch (error) {
      console.error("Failed to toggle category status:", error);
      showToast(error.message || "Failed to update category status", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: ""
    });
    setEditingCategory(null);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  // Predefined Category Handlers
  const handleEditPredefinedCategory = (category, index) => {
    setEditingPredefinedCategory({ category, index });
    
    // Load existing modifications if any
    const existingModification = modifiedCategories[category];
    setPredefinedCategoryForm({
      name: existingModification?.name || category,
      image: existingModification?.image || `https://images.unsplash.com/photo-${1578985545062 + index}?w=200&h=200&fit=crop`,
      description: existingModification?.description || `Edit ${category} category`
    });
  };

  const handleDeletePredefinedCategory = async (category, index) => {
    if (!window.confirm(`Are you sure you want to reset the "${category}" category to its original state? This will remove any custom modifications.`)) {
      return;
    }

    try {
      // Remove modifications for this category
      const updatedModifications = { ...modifiedCategories };
      delete updatedModifications[category];
      
      // Save to localStorage
      localStorage.setItem('predefinedCategoryModifications', JSON.stringify(updatedModifications));
      
      // Update state
      setModifiedCategories(updatedModifications);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('categoryUpdated', { 
        detail: { category, modifications: updatedModifications } 
      }));
      
      showToast(`Category "${category}" has been reset to original state`, "success");
    } catch (error) {
      console.error("Failed to reset predefined category:", error);
      showToast("Failed to reset category", "error");
    }
  };

  const handleDeletePredefinedCategoryPermanently = async (category, index) => {
    // Check if category has products
    const productCount = productCounts[category] || 0;
    
    if (productCount > 0) {
      showToast(`Cannot delete "${category}" - it has ${productCount} products assigned. Please remove all products first.`, "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete the "${category}" category? This action cannot be undone and will remove the category from the predefined list.`)) {
      return;
    }

    try {
      // Call backend API to delete the predefined category
      const response = await axios.delete(`${getApiConfig().BASE_URL}/api/categories/predefined/${encodeURIComponent(category)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        showToast(`Predefined category "${category}" deleted successfully`, "success");
        
        // Remove from predefined categories list
        const updatedPredefinedCategories = predefinedCakeCategories.filter(cat => cat !== category);
        
        // Update state
        setPredefinedCakeCategories(updatedPredefinedCategories);
        
        // Update the predefined categories in localStorage
        localStorage.setItem('predefinedCakeCategories', JSON.stringify(updatedPredefinedCategories));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('predefinedCategoryDeleted', { 
          detail: { category, updatedCategories: updatedPredefinedCategories } 
        }));
        
        // Update product counts
        fetchProductCounts();
        
        // Force a small delay to ensure UI updates
        setTimeout(() => {
          // Trigger a re-render by updating state again
          setPredefinedCakeCategories(prev => [...prev]);
        }, 100);
      } else {
        throw new Error(response.data.message || 'Failed to delete predefined category');
      }
    } catch (error) {
      console.error("Failed to delete predefined category:", error);
      showToast(error.response?.data?.message || error.message || "Failed to delete predefined category", "error");
    }
  };

  const handleSavePredefinedCategory = () => {
    if (!predefinedCategoryForm.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      const originalCategory = editingPredefinedCategory.category;
      const modifications = {
        ...modifiedCategories,
        [originalCategory]: {
          name: predefinedCategoryForm.name,
          image: predefinedCategoryForm.image,
          description: predefinedCategoryForm.description,
          modifiedAt: new Date().toISOString()
        }
      };

      // Save to localStorage
      localStorage.setItem('predefinedCategoryModifications', JSON.stringify(modifications));
      
      // Update state
      setModifiedCategories(modifications);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('categoryUpdated', { 
        detail: { category: originalCategory, modifications } 
      }));
      
      showToast(`Category "${predefinedCategoryForm.name}" updated successfully!`, "success");
      setEditingPredefinedCategory(null);
      setPredefinedCategoryForm({ name: '', image: '', description: '' });
    } catch (error) {
      console.error('Failed to save category modifications:', error);
      showToast("Failed to save changes", "error");
    }
  };

  const handleCancelPredefinedEdit = () => {
    setEditingPredefinedCategory(null);
    setPredefinedCategoryForm({ name: '', image: '', description: '' });
  };

  const handleClearAllModifications = () => {
    if (!window.confirm("Are you sure you want to clear all category modifications? This will reset all categories to their original state.")) {
      return;
    }

    try {
      // Clear all modifications
      localStorage.removeItem('predefinedCategoryModifications');
      setModifiedCategories({});
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('categoryUpdated', { 
        detail: { category: 'all', modifications: {} } 
      }));
      
      showToast("All category modifications have been cleared", "success");
    } catch (error) {
      console.error("Failed to clear modifications:", error);
      showToast("Failed to clear modifications", "error");
    }
  };

  const handleRestoreAllPredefinedCategories = () => {
    if (!window.confirm("Are you sure you want to restore all predefined categories? This will bring back all deleted categories.")) {
      return;
    }

    try {
      // Restore all predefined categories
      setPredefinedCakeCategories(defaultPredefinedCakeCategories);
      
      // Update localStorage
      localStorage.setItem('predefinedCakeCategories', JSON.stringify(defaultPredefinedCakeCategories));
      
      // Update product counts
      fetchProductCounts();
      
      // Force a small delay to ensure UI updates
      setTimeout(() => {
        // Trigger a re-render by updating state again
        setPredefinedCakeCategories(prev => [...prev]);
      }, 100);
      
      showToast("All predefined categories have been restored", "success");
    } catch (error) {
      console.error("Failed to restore predefined categories:", error);
      showToast("Failed to restore predefined categories", "error");
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat._id));
    }
  };

  const handleBulkToggle = async (action) => {
    if (selectedCategories.length === 0) {
      showToast("Please select categories to " + action, "error");
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedCategories.length} selected categories?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const promises = selectedCategories.map(categoryId => {
        const category = categories.find(cat => cat._id === categoryId);
        return axios.put(`${getApiConfig().BASE_URL}/api/categories/${categoryId}`, {
          ...category,
          isActive: action === 'activate'
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
      });

      await Promise.all(promises);
      showToast(`${selectedCategories.length} categories ${action}d successfully`, "success");
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      console.error(`Failed to ${action} categories:`, error);
      showToast(`Failed to ${action} categories`, "error");
    }
  };

  // Filter categories based on status and search term
  const filteredCategories = categories.filter(category => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && category.isActive) || 
      (statusFilter === 'inactive' && !category.isActive);
    
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Get statistics
  const activeCount = categories.filter(c => c.isActive).length;
  const inactiveCount = categories.filter(c => !c.isActive).length;
  const totalCount = categories.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchCategories}
          className="btn-primary px-6 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-blue-100 mt-2">Manage product categories for your fireworks store</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Category</span>
          </button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Categories</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div className="text-3xl">📁</div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-200">{activeCount}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-red-200">{inactiveCount}</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('predefined')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'predefined'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🍰 Predefined Cake Categories
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📁 Custom Categories
          </button>
        </div>

        {/* Predefined Categories Section */}
        {activeTab === 'predefined' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🍰 Predefined Cake Categories</h2>
              <p className="text-gray-600 mb-6">
                These are the predefined cake categories used in product creation and frontend display. 
                Each category shows the number of products currently assigned to it.
              </p>
              
              {/* Clear All Modifications Button */}
              {Object.keys(modifiedCategories).length > 0 && (
                <div className="mb-6 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                    </div>
                    <div>
                      <p className="text-yellow-800 font-medium">
                        {Object.keys(modifiedCategories).length} categories have been modified
                      </p>
                      <p className="text-yellow-600 text-sm">
                        You can reset all modifications to restore original categories
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearAllModifications}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Clear All Modifications
                  </button>
                </div>
              )}

              {/* Restore Deleted Categories Button */}
              {predefinedCakeCategories.length < defaultPredefinedCakeCategories.length && (
                <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🔄</span>
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">
                        {defaultPredefinedCakeCategories.length - predefinedCakeCategories.length} categories have been deleted
                      </p>
                      <p className="text-blue-600 text-sm">
                        You can restore all deleted predefined categories
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRestoreAllPredefinedCategories}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Restore All Categories
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {predefinedCakeCategories.map((category, index) => (
                  <div
                    key={category}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border-2 border-transparent hover:border-pink-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={modifiedCategories[category]?.image || `https://images.unsplash.com/photo-${1578985545062 + index}?w=60&h=60&fit=crop`}
                            alt={modifiedCategories[category]?.name || category}
                            className="w-12 h-12 rounded-full object-cover shadow-md"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=60&h=60&fit=crop";
                            }}
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          {modifiedCategories[category] && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{modifiedCategories[category]?.name || category}</span>
                          {modifiedCategories[category] && (
                            <span className="text-xs text-green-600 font-medium">Modified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Products:</span>
                        <span className="font-semibold text-blue-600">
                          {productCounts[category] || 0}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2 mb-2">
                        <button
                          onClick={() => navigate(`/admin/products?category=${encodeURIComponent(category)}`)}
                          className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          View Products
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products?action=create&category=${encodeURIComponent(category)}`)}
                          className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Add Product
                        </button>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditPredefinedCategory(category, index)}
                          className="flex-1 bg-orange-50 text-orange-600 hover:bg-orange-100 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          title="Edit category"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeletePredefinedCategory(category, index)}
                          className="flex-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          title="Reset to original state"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => handleDeletePredefinedCategoryPermanently(category, index)}
                          className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          title="Delete category permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Category Management Info</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• These categories are predefined and used in the product creation form</li>
                  <li>• They appear as clickable cards on the homepage "Trending Cake Flavours" section</li>
                  <li>• When users click a category, they see all products in that category</li>
                  <li>• Each product can only belong to one category</li>
                  <li>• Categories are future-proof and can be easily modified in the code</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Custom Categories Section */}
        {activeTab === 'custom' && (
          <div>
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories ({totalCount})</option>
                    <option value="active">Active Only ({activeCount})</option>
                    <option value="inactive">Inactive Only ({inactiveCount})</option>
                  </select>
                </div>
                
                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  Showing {filteredCategories.length} of {totalCount} categories
                </div>
              </div>
            </div>

            {/* Enhanced Add/Edit Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                  onClick={cancelForm}
                ></div>
                
                {/* Modal Content */}
                <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">
                              {editingCategory ? '✏️' : '➕'}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <p className="text-blue-100 text-sm">
                              {editingCategory ? 'Update category information' : 'Create a new product category'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={cancelForm}
                          className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                          title="Close form"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                      formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter category name (e.g., Fireworks, Sparklers)"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📁</span>
                  </div>
                </div>
                {formErrors.name && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500 resize-none ${
                      formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    rows="4"
                    placeholder="Enter a detailed description of this category..."
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="text-gray-400">📝</span>
                  </div>
                </div>
                {formErrors.description ? (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{formErrors.description}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Describe what products belong to this category
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category Image
                </label>
                <ImageUploadOrUrl
                  value={formData.image}
                  onChange={(imageUrl) => setFormData(prev => ({ ...prev, image: imageUrl }))}
                  placeholder="Upload category image or enter URL"
                  className="w-full"
                  disabled={isSubmitting}
                />
                {formErrors.image ? (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{formErrors.image}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Optional: Upload an image to represent this category
                  </p>
                )}
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Image Preview
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="w-24 h-24 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-center text-gray-500 text-sm">
                      Invalid image URL
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{editingCategory ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{editingCategory ? '✏️' : '➕'}</span>
                      <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>❌</span>
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
            </div>
          </div>
        </div>
      )}

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
                  {selectedCategories.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {selectedCategories.length} selected
                      </span>
                      <button
                        onClick={() => handleBulkToggle('activate')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <span>▶️</span>
                        <span>Activate Selected</span>
                      </button>
                      <button
                        onClick={() => handleBulkToggle('deactivate')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <span>⏸️</span>
                        <span>Deactivate Selected</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-4xl">📁</div>
                            <p className="text-lg">No categories found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => (
                        <tr 
                          key={category._id} 
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            !category.isActive ? 'bg-red-50/30 border-l-4 border-l-red-400' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category._id)}
                              onChange={() => handleSelectCategory(category._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative">
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className={`w-12 h-12 rounded-lg object-cover mr-4 ${
                                    !category.isActive ? 'opacity-50 grayscale' : ''
                                  }`}
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/48x48?text=No+Image";
                                  }}
                                />
                                {!category.isActive && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">❌</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className={`text-sm font-medium flex items-center space-x-2 ${
                                  !category.isActive ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  <span>{category.name}</span>
                                  {!category.isActive && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      INACTIVE
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  ID: {category._id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm max-w-xs truncate ${
                              !category.isActive ? 'text-gray-500' : 'text-gray-900'
                            }`}>
                              {category.description}
                            </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!category.isActive && (
                          <span className="text-xs text-red-600 font-medium">
                            Hidden from users
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                            category.isActive
                              ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
                              : 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md'
                          }`}
                          title={`${category.isActive ? 'Deactivate' : 'Activate'} category`}
                        >
                          <span className="text-lg">
                            {category.isActive ? '⏸️' : '▶️'}
                          </span>
                          <span>
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800 text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-1 border border-blue-200 hover:border-blue-300"
                          title="Edit category"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className={`text-sm px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1 border ${
                            category.productCount > 0
                              ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300'
                          }`}
                          title={category.productCount > 0 ? `Cannot delete - ${category.productCount} products assigned` : "Delete category"}
                          disabled={category.productCount > 0}
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
        )}

        {/* Predefined Category Edit Modal */}
        {editingPredefinedCategory && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancelPredefinedEdit}
            ></div>
            
            {/* Modal Content */}
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">✏️</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Edit Predefined Category
                        </h2>
                        <p className="text-orange-100 text-sm">
                          Modify the "{editingPredefinedCategory.category}" category
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancelPredefinedEdit}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={predefinedCategoryForm.name}
                      onChange={(e) => setPredefinedCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500 border-gray-300"
                      placeholder="Enter category name"
                    />
                  </div>

                  {/* Category Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={predefinedCategoryForm.description}
                      onChange={(e) => setPredefinedCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500 border-gray-300"
                      placeholder="Enter category description"
                      rows={3}
                    />
                  </div>

                  {/* Category Image */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Category Image
                    </label>
                    <ImageUploadOrUrl
                      value={predefinedCategoryForm.image}
                      onChange={(imageUrl) => setPredefinedCategoryForm(prev => ({ ...prev, image: imageUrl }))}
                      placeholder="Upload category image or enter URL"
                      className="w-full"
                    />
                  </div>

                  {/* Preview */}
                  {predefinedCategoryForm.image && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Image Preview
                      </label>
                      <div className="flex items-center space-x-4">
                        <img
                          src={predefinedCategoryForm.image}
                          alt="Category preview"
                          className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=64&h=64&fit=crop";
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{predefinedCategoryForm.name}</p>
                          <p className="text-xs text-gray-500">{predefinedCategoryForm.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCancelPredefinedEdit}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePredefinedCategory}
                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories ;
