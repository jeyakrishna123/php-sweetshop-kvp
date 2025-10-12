import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { productAPI } from "../utils/adminAPI";
import ProductModal from "../components/ProductModal";
import EnhancedProductModal from "../components/EnhancedProductModal";
import { exportProducts, importCSV, validateImportedProducts } from "../utils/exportUtils";
import Pagination from "../components/Pagination";
import AdvancedSearchFilter from "../components/AdvancedSearchFilter";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([
    { _id: 'electronics', name: 'Electronics' },
    { _id: 'fashion', name: 'Fashion' },
    { _id: 'home', name: 'Home & Garden' },
    { _id: 'sports', name: 'Sports' },
    { _id: 'books', name: 'Books' }
  ]);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedStatus, setSelectedStatus] = useState("all"); // new, featured, inStock, lowStock, outOfStock
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Increased to show all products
  
  // Export/Import handlers
  const handleExport = () => {
    try {
      exportProducts(filteredProducts);
      showToast(`Exported ${filteredProducts.length} products successfully`, 'success');
    } catch (error) {
      showToast(`Export failed: ${error.message}`, 'error');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { data } = await importCSV(file);
      const { errors, validProducts } = validateImportedProducts(data);
      
      if (errors.length > 0) {
        showToast(`Import validation failed: ${errors.length} errors found`, 'error');
        console.error('Import errors:', errors);
        return;
      }

      // Import valid products
      for (const product of validProducts) {
        await productAPI.createProduct(product);
      }
      
      showToast(`Successfully imported ${validProducts.length} products`, 'success');
      fetchProducts();
    } catch (error) {
      showToast(`Import failed: ${error.message}`, 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Check admin access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      showToast('Access denied. Admin privileges required.', 'error');
      navigate('/admin/login');
      return;
    }
  }, [user, navigate, showToast]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productAPI.getAllProducts();

      if (response.success) {
        // PHP API returns data in response.data.data
        const fetchedProducts = response.data?.data || response.products || [];

        if (!Array.isArray(fetchedProducts)) {
          console.error('fetchedProducts is not an array:', fetchedProducts);
          throw new Error('Invalid products data format');
        }

        const cleanedProducts = fetchedProducts.map(product => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock || product.countInStock || 0,
          images: product.images || [],
          brand: product.brand || "",
          category: product.category || "",
          categoryName: product.categoryName || "",
          description: product.description || "",
          user: product.user,
          seller: product.seller || "",
          ratings: product.ratings || 0,
          numOfReviews: product.numOfReviews || 0,
          featured: product.featured || false,
          specifications: product.specifications || {},
          tags: product.tags || [],
          isNew: product.isNew || false,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
        
        // Remove duplicates based on _id
        const uniqueProducts = cleanedProducts.filter((product, index, self) => 
          index === self.findIndex(p => p._id === product._id)
        );
        
        console.log('🔍 AdminProducts: Setting products:', {
          totalProducts: cleanedProducts.length,
          uniqueProducts: uniqueProducts.length,
          productIds: cleanedProducts.map(p => p._id),
          uniqueIds: [...new Set(cleanedProducts.map(p => p._id))].length,
          hadDuplicates: cleanedProducts.length !== uniqueProducts.length
        });
        setProducts(uniqueProducts);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to fetch products. Please try again.");
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      // Silently fail and use default categories
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchProducts();
      fetchCategories();
    }
  }, [user, fetchProducts, fetchCategories]);

  // Monitor products state for duplicates
  useEffect(() => {
    if (products.length > 0) {
      const uniqueIds = [...new Set(products.map(p => p._id))];
      if (products.length !== uniqueIds.length) {
        console.warn('🚨 AdminProducts: Duplicate products detected in state!', {
          totalProducts: products.length,
          uniqueProducts: uniqueIds.length,
          duplicates: products.length - uniqueIds.length
        });
      }
    }
  }, [products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
    try {
      setDeletingProduct(id);
      await productAPI.deleteProduct(id);
      
      setProducts(products.filter(p => p._id !== id));
      showToast("Product deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast("Failed to delete product", "error");
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleMarkAsOld = async (id) => {
    try {
      const product = products.find(p => p._id === id);
      if (product) {
        const updatedProduct = { ...product, isNew: false };
        await productAPI.updateProduct(id, updatedProduct);
        
        setProducts(products.map(p => p._id === id ? updatedProduct : p));
        showToast("Product marked as not new", "success");
      }
    } catch (error) {
      console.error("Failed to mark product as old:", error);
      showToast("Failed to update product", "error");
    }
  };

  const handleEdit = async (product) => {
    try {
      const response = await productAPI.getProduct(product._id);

      if (response.success) {
        const productData = response.product;
        const cleanedProductData = {
          _id: productData._id,
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice || productData.price,
          offerPrice: productData.offerPrice || productData.price,
          discountPercentage: productData.discountPercentage || 0,
          stock: productData.stock || productData.countInStock || 0,
          images: productData.images || [],
          brand: productData.brand || "",
          category: productData.category || "",
          subCategory: productData.subCategory || "", // ADDED!
          menuOption: productData.menuOption || "", // ADDED!
          description: productData.description || "",
          features: productData.features || "",
          specifications: productData.specifications || {},
          tags: productData.tags || [],
          user: productData.user,
          seller: productData.seller || "",
          ratings: productData.ratings || 0,
          numOfReviews: productData.numOfReviews || 0,
          featured: productData.featured || false,
          isActive: productData.isActive !== undefined ? productData.isActive : true,
          isFeatured: productData.isFeatured || false,
          isNew: productData.isNew || false,
          isSpecial: productData.isSpecial || false,
          isBestseller: productData.isBestseller || false,
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt
        };
        
        setEditingProduct(cleanedProductData);
        setModalOpen(true);
      } else {
        throw new Error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Failed to fetch product for editing:", error);
      showToast("Failed to load product details", "error");
    }
  };

  const handleCreate = () => {
    console.log('🚀 AdminProducts: handleCreate called - opening modal for new product');
    setEditingProduct(null);
    setModalOpen(true);
    console.log('🚀 AdminProducts: Modal state set to open');
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  // Duplicate detection and removal
  const findDuplicates = () => {
    const duplicates = [];
    const seen = new Map();
    
    products.forEach((product, index) => {
      // Create a key based on name, category, and brand (case-insensitive)
      const key = `${product.name?.toLowerCase().trim()}_${product.category}_${product.brand?.toLowerCase().trim()}`;
      
      if (seen.has(key)) {
        // Found a duplicate
        const originalIndex = seen.get(key);
        if (!duplicates.find(d => d.originalIndex === originalIndex)) {
          duplicates.push({
            key,
            originalIndex,
            originalProduct: products[originalIndex],
            duplicates: [products[index]]
          });
        } else {
          // Add to existing duplicate group
          const existingDuplicate = duplicates.find(d => d.originalIndex === originalIndex);
          existingDuplicate.duplicates.push(products[index]);
        }
      } else {
        seen.set(key, index);
      }
    });
    
    return duplicates;
  };

  const removeDuplicates = async () => {
    const duplicates = findDuplicates();
    
    if (duplicates.length === 0) {
      showToast('No duplicate products found', 'info');
      return;
    }
    
    const totalDuplicates = duplicates.reduce((sum, group) => sum + group.duplicates.length, 0);
    
    if (!window.confirm(`Found ${duplicates.length} groups of duplicate products (${totalDuplicates} total duplicates).\n\nThis will keep the first product in each group and remove all duplicates.\n\nAre you sure you want to proceed?`)) {
      return;
    }
    
    try {
      console.log('🧹 Starting duplicate removal process...');
      
      // Use the productAPI method for proper authentication
      const result = await productAPI.removeDuplicates();
      
      if (result.success) {
        showToast(`Successfully removed ${result.removedCount} duplicate products`, 'success');
        
        // Log detailed results
        console.log('🗑️ Duplicate removal results:', result);
        
        // Refresh the products list
        fetchProducts();
      } else {
        throw new Error(result.message || 'Failed to remove duplicates');
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      showToast(`Failed to remove duplicates: ${error.message}`, 'error');
    }
  };

  // Bulk operations handlers
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        for (const productId of selectedProducts) {
          await productAPI.deleteProduct(productId);
        }
        showToast(`${selectedProducts.length} products deleted successfully`, 'success');
      } else if (bulkAction === 'feature') {
        for (const productId of selectedProducts) {
          const product = products.find(p => p._id === productId);
          await productAPI.updateProduct(productId, { ...product, featured: true });
        }
        showToast(`${selectedProducts.length} products marked as featured`, 'success');
      } else if (bulkAction === 'unfeature') {
        for (const productId of selectedProducts) {
          const product = products.find(p => p._id === productId);
          await productAPI.updateProduct(productId, { ...product, featured: false });
        }
        showToast(`${selectedProducts.length} products unfeatured`, 'success');
      }

      setSelectedProducts([]);
      setBulkAction("");
      setShowBulkConfirm(false);
      fetchProducts();
    } catch (error) {
      showToast(`Bulk operation failed: ${error.message}`, 'error');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductSave = async (productData) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('🚀 AdminProducts: Already submitting, ignoring duplicate submission');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🚀 AdminProducts: handleProductSave called with:', productData);
      console.log('🚀 AdminProducts: editingProduct:', editingProduct);
      
      if (editingProduct) {
        // Update existing product
        console.log('🚀 AdminProducts: Updating existing product with ID:', editingProduct._id);
        const response = await productAPI.updateProduct(editingProduct._id, productData);
        console.log('🚀 AdminProducts: Update response:', response);
        
        if (response.success) {
          showToast("Product updated successfully", "success");
        } else {
          throw new Error(response.message || 'Update failed');
        }
      } else {
        // Create new product - check for duplicates first
        const existingProduct = products.find(p => 
          p.name.toLowerCase().trim() === productData.name.toLowerCase().trim() &&
          p.category === productData.category &&
          p.brand === productData.brand
        );
        
        if (existingProduct) {
          throw new Error(`A product with the same name "${productData.name}" already exists in the same category. Please use a different name or edit the existing product.`);
        }

        console.log('🚀 AdminProducts: Creating new product');
        const response = await productAPI.createProduct(productData);
        console.log('🚀 AdminProducts: Create response:', response);
        
        if (response.success) {
          showToast("Product created successfully", "success");
        } else {
          throw new Error(response.message || 'Creation failed');
        }
      }
      
      handleModalClose();
      
      // Refresh products list immediately
      console.log('🔍 AdminProducts: Refreshing products after save');
      await fetchProducts();
      
    } catch (error) {
      console.error('❌ AdminProducts: Error in handleProductSave:', error);
      showToast(error.message || "Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      // If it's already a full URL, return as is
      if (image.startsWith('http') || image.startsWith('data:')) {
        return image;
      }
      // If it's a relative URL from backend, make it absolute
      if (image.startsWith('/uploads/')) {
        return `http://localhost:8000${image}`;
      }
      return image;
    }
    if (image && image.url) {
      // Handle image object with url property
      if (image.url.startsWith('http') || image.url.startsWith('data:')) {
        return image.url;
      }
      if (image.url.startsWith('/uploads/')) {
        return `http://localhost:8000${image.url}`;
      }
      return image.url;
    }
    // Default fallback image
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='.3em' fill='%23666' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  // Debug: Log products state changes
  console.log('🔍 AdminProducts: Rendering with products:', {
    totalProducts: products.length,
    productIds: products.map(p => p._id),
    uniqueIds: [...new Set(products.map(p => p._id))].length,
    hasDuplicates: products.length !== [...new Set(products.map(p => p._id))].length
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || (
      (selectedStatus === "new" && product.isNew) ||
      (selectedStatus === "featured" && product.featured) ||
      (selectedStatus === "inStock" && product.stock > 0) ||
      (selectedStatus === "lowStock" && product.stock > 0 && product.stock <= 10) ||
      (selectedStatus === "outOfStock" && product.stock === 0)
    );
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedProducts([]); // Clear selections when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setSelectedProducts([]); // Clear selections
  };

  const categoryOptions = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const getStockStatus = (stock) => {
    if (stock > 10) return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
    if (stock > 0) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
  };

  const getProductSummary = () => {
    const total = products.length;
    const inStock = products.filter(p => p.stock > 10).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const featured = products.filter(p => p.featured).length;
    const newProducts = products.filter(p => p.isNew === true).length;
    const duplicates = findDuplicates();
    const duplicateCount = duplicates.reduce((sum, group) => sum + group.duplicates.length, 0);
    
    return { total, inStock, lowStock, outOfStock, featured, newProducts, duplicateCount };
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Product Management</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog and inventory</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={removeDuplicates}
              className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-red-600 text-white hover:bg-red-700"
              title="Find and remove duplicate products"
            >
              <span>🗑️</span>
              <span>Remove Duplicates</span>
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <span>{isSubmitting ? '⏳' : '➕'}</span>
              <span>{isSubmitting ? 'Creating...' : 'Add New Product'}</span>
            </button>
          </div>
        </div>

        {/* Product Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getProductSummary().total}</div>
            <div className="text-sm opacity-90">Total Products</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getProductSummary().newProducts}</div>
            <div className="text-sm opacity-90">New Products</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getProductSummary().featured}</div>
            <div className="text-sm opacity-90">Featured</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{getProductSummary().lowStock}</div>
            <div className="text-sm opacity-90">Low Stock</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${getProductSummary().duplicateCount > 0 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'}`}>
            <div className="text-2xl font-bold">{getProductSummary().duplicateCount}</div>
            <div className="text-sm opacity-90">Duplicates</div>
          </div>
        </div>


      </div>




      {/* New Products Display */}
      {products.filter(p => p.isNew === true).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🆕</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recently Added Products</h2>
                <p className="text-gray-600">Products added in the last 30 days</p>
              </div>
            </div>
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {products.filter(p => p.isNew === true).length} New
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.isNew === true).slice(0, 6).map((product) => (
              <div key={product._id} className="bg-gray-50 rounded-lg p-4 border border-emerald-200 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <img
                    className="w-16 h-16 rounded-lg object-contain"
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23666' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">₹{product.price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Stock: {product.stock} units</p>
                    <p className="text-xs text-emerald-600 mt-1">🆕 Added {new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-emerald-600 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleMarkAsOld(product._id)}
                    className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-gray-600 transition-colors"
                  >
                    ✓ Mark as Regular
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {products.filter(p => p.isNew === true).length > 6 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setSelectedStatus("new")}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                View All New Products →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">🔍 Search & Filter Products</h3>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" 
                  ? "bg-pink-100 text-pink-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" 
                  ? "bg-pink-100 text-pink-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or brand..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Products</option>
              <option value="new">🆕 New Products Only</option>
              <option value="featured">⭐ Featured Products Only</option>
              <option value="inStock">✅ In Stock Only</option>
              <option value="lowStock">⚠️ Low Stock Only</option>
              <option value="outOfStock">❌ Out of Stock Only</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Bulk Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredProducts.length}</span> products found
            {selectedProducts.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({selectedProducts.length} selected)
              </span>
            )}
          </div>
          
          {selectedProducts.length > 0 && (
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Action</option>
                <option value="delete">🗑️ Delete Selected</option>
                <option value="feature">⭐ Mark as Featured</option>
                <option value="unfeature">⭐ Remove Featured</option>
              </select>
              
              <button
                onClick={() => setShowBulkConfirm(true)}
                disabled={!bulkAction}
                className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              
              <button
                onClick={() => setSelectedProducts([])}
                className="bg-gray-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === "all"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setSelectedStatus("new")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === "new"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🆕 New Products
          </button>
          <button
            onClick={() => setSelectedStatus("featured")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === "featured"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⭐ Featured
          </button>
          <button
            onClick={() => setSelectedStatus("inStock")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === "inStock"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ✅ In Stock
          </button>
          <button
            onClick={() => setSelectedStatus("lowStock")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === "lowStock"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⚠️ Low Stock
          </button>
          <button
            onClick={() => setSelectedStatus("outOfStock")}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === "outOfStock"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ❌ Out of Stock
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} products selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {/* TODO: Implement bulk feature */}}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                ⭐ Mark Featured
              </button>
              <button
                onClick={() => {/* TODO: Implement bulk delete */}}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                🗑️ Bulk Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedStatus === "all"
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setSelectedStatus("new")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedStatus === "new"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-200"
                }`}
              >
                🆕 New Products ({products.filter(p => p.isNew === true).length})
              </button>
              <button
                onClick={() => setSelectedStatus("featured")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedStatus === "featured"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-purple-200"
                }`}
              >
                ⭐ Featured ({products.filter(p => p.featured).length})
              </button>
              <button
                onClick={() => setSelectedStatus("lowStock")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedStatus === "lowStock"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-yellow-200"
                }`}
              >
                ⚠️ Low Stock ({products.filter(p => p.stock > 0 && p.stock <= 10).length})
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => {/* TODO: Implement export to CSV */}}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Products Display */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first product."
            }
          </p>
          {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
            <button
              onClick={handleCreate}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Add Your First Product
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        // Grid View - Compact Professional Design
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              {/* Product Image - Reduced Height */}
              <div className="relative h-32 bg-gray-100 flex items-center justify-center">
                <img
                  className="w-full h-full object-contain"
                  src={getImageUrl(product.images[0])}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' fill='%23666' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                {product.featured && (
                  <div className="absolute top-1 right-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                    ⭐
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-1 left-1 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                    🆕
                  </div>
                )}
                <div className={`absolute ${product.isNew ? 'top-6' : 'top-1'} left-1`}>
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${getStockStatus(product.stock).color}`}>
                    {getStockStatus(product.stock).text}
                  </span>
                </div>
              </div>

              {/* Product Info - Compact */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Category:</span>
                    <span className="text-xs font-medium text-gray-900">{product.categoryName || product.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Price:</span>
                    <span className="text-sm font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Stock:</span>
                    <span className="text-xs font-medium text-gray-900">{product.stock} units</span>
                  </div>
                </div>

                {/* Actions - Compact */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingProduct === product._id}
                    className={`flex-1 bg-red-500 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition-colors ${
                      deletingProduct === product._id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {deletingProduct === product._id ? '🗑️...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-contain"
                            src={getImageUrl(product.images[0])}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23666' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.categoryName || product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(product.stock).color}`}>
                        {getStockStatus(product.stock).text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.featured 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.featured ? '⭐ Featured' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isNew 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isNew ? '🆕 New' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 rounded hover:bg-blue-50"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingProduct === product._id}
                          className={`text-red-600 hover:text-red-900 transition-colors px-3 py-1 rounded hover:bg-red-50 ${
                            deletingProduct === product._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingProduct === product._id ? '🗑️ Deleting...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Product Modal */}
      {modalOpen && (
        <EnhancedProductModal
          product={editingProduct}
          onSave={handleProductSave}
          onClose={handleModalClose}
          categories={categories}
        />
      )}
    </div>
  );
};

export default AdminProducts;
