import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../axios';

const AdminMenu = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = React.useRef(null);

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    color: '#f59e0b',
    order: 0,
    link: '',
    isActive: true
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Check admin access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/menu');
      if (response.data.success) {
        setMenuItems(response.data.data);
        console.log('📋 Menu items loaded:', response.data.data.length);
        console.log('📋 Menu items data:', response.data.data);
        // Log each menu item's image URL
        response.data.data.forEach(item => {
          console.log(`📋 ${item.name}: image = "${item.image}"`);
        });
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showToast('Failed to fetch menu items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenuItem = async (formData) => {
    try {
      setOperationLoading(true);
      
      console.log('🔍 AdminMenu: Saving menu item with data:', formData);
      console.log('🔍 AdminMenu: User context:', user);
      console.log('🔍 AdminMenu: Token exists:', !!localStorage.getItem('token'));
      
      // Check if user is authenticated
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        console.log('❌ AdminMenu: User not authenticated or not admin');
        showToast('Authentication required. Please log in again.', 'error');
        setOperationLoading(false);
        return;
      }

      // Get fresh token and verify it's valid
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ AdminMenu: No token found');
        showToast('Please log in again.', 'error');
        setOperationLoading(false);
        return;
      }

      console.log('🔍 AdminMenu: Token found:', token.substring(0, 20) + '...');
      console.log('🔍 AdminMenu: Full token length:', token.length);

      // Create axios config with explicit headers
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('🔍 AdminMenu: Request config:', config);
      
      if (editingMenuItem) {
        // Update existing menu item
        console.log('🔍 AdminMenu: Updating existing menu item:', editingMenuItem._id);
        const response = await axios.put(`/api/menu/${editingMenuItem._id}`, formData, config);
        console.log('🔍 AdminMenu: Update response:', response.data);
        if (response.data.success) {
          setMenuItems(prev => 
            prev.map(item => 
              item._id === editingMenuItem._id ? response.data.data : item
            )
          );
          showToast('Menu item updated successfully', 'success');
          // Trigger frontend refresh
          window.dispatchEvent(new Event('menuUpdated'));
        }
      } else {
        // Create new menu item
        console.log('🔍 AdminMenu: Creating new menu item');
        const response = await axios.post('/api/menu', formData, config);
        console.log('🔍 AdminMenu: Create response:', response.data);
        if (response.data.success) {
          setMenuItems(prev => [...prev, response.data.data]);
          showToast('Menu item created successfully', 'success');
          // Trigger frontend refresh
          window.dispatchEvent(new Event('menuUpdated'));
        }
      }
      
      setIsModalOpen(false);
      setEditingMenuItem(null);
      resetForm();
    } catch (error) {
      console.error('❌ AdminMenu: Error saving menu item:', error);
      console.error('❌ AdminMenu: Error response:', error.response?.data);
      console.error('❌ AdminMenu: Error status:', error.response?.status);
      showToast(error.response?.data?.message || 'Failed to save menu item', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (menuItem) => {
    console.log('🔍 Editing menu item:', menuItem);
    console.log('🔍 Menu item image URL:', menuItem.image);
    setEditingMenuItem(menuItem);
    setFormData({
      name: menuItem.name,
      description: menuItem.description || '',
      image: menuItem.image || '',
      color: menuItem.color || '#f59e0b',
      order: menuItem.order || 0,
      link: menuItem.link || '',
      isActive: menuItem.isActive
    });
    setImagePreview(menuItem.image || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      setOperationLoading(true);
      const response = await axios.delete(`/api/menu/${id}`);
      if (response.data.success) {
        setMenuItems(prev => prev.filter(item => item._id !== id));
        showToast('Menu item deleted successfully', 'success');
        // Trigger frontend refresh
        window.dispatchEvent(new Event('menuUpdated'));
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast('Failed to delete menu item', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleActive = async (menuItem) => {
    try {
      setOperationLoading(true);
      const response = await axios.put(`/api/menu/${menuItem._id}`, {
        isActive: !menuItem.isActive
      });
      if (response.data.success) {
        setMenuItems(prev => 
          prev.map(item => 
            item._id === menuItem._id ? response.data.data : item
          )
        );
        showToast(`Menu item ${!menuItem.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
        // Trigger frontend refresh
        window.dispatchEvent(new Event('menuUpdated'));
      }
    } catch (error) {
      console.error('Error toggling menu item status:', error);
      showToast('Failed to update menu item status', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setMenuItems(updatedItems);

    try {
      await axios.put('/api/menu/order/update', {
        menuItems: updatedItems.map(item => ({
          id: item._id,
          order: item.order
        }))
      });
      showToast('Menu order updated successfully', 'success');
      // Trigger frontend refresh
      window.dispatchEvent(new Event('menuUpdated'));
    } catch (error) {
      console.error('Error updating menu order:', error);
      showToast('Failed to update menu order', 'error');
      // Revert on error
      fetchMenuItems();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      color: '#f59e0b',
      order: 0,
      link: '',
      isActive: true
    });
    setImagePreview(null);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setImageUploading(true);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Try to upload to server
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'menu-item');

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/upload/menu-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const imageUrl = response.data.imageUrl.startsWith('http') 
            ? response.data.imageUrl 
            : `http://localhost:8000${response.data.imageUrl}`;
          
          console.log('🔍 Image upload successful, URL:', imageUrl);
          setFormData(prev => ({ ...prev, image: imageUrl }));
          setImagePreview(null); // Clear local preview, use server URL
          showToast('Image uploaded successfully', 'success');
        }
      } catch (uploadError) {
        console.log('Upload failed, using local preview:', uploadError.message);
        showToast('Using local preview (upload will be processed on save)', 'warning');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      showToast('Error processing image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingMenuItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const colorOptions = [
    { value: '#f59e0b', label: 'Amber', class: 'bg-amber-500' },
    { value: '#eab308', label: 'Yellow', class: 'bg-yellow-500' },
    { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
    { value: '#6b7280', label: 'Gray', class: 'bg-gray-500' },
    { value: '#14b8a6', label: 'Teal', class: 'bg-teal-500' },
    { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#10b981', label: 'Green', class: 'bg-green-500' },
    { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
    { value: '#f97316', label: 'Orange', class: 'bg-orange-500' }
  ];


  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🍽️ Menu Management</h1>
            <p className="text-gray-600 mt-2">Manage your menu sections and categories</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateNew}
              disabled={operationLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                operationLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <span>{operationLoading ? '⏳' : '➕'}</span>
              <span>{operationLoading ? 'Loading...' : 'Add Menu Item'}</span>
            </button>
          </div>
        </div>

        {/* Menu Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
            <div className="text-sm text-blue-600">Total Items</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.isActive).length}
            </div>
            <div className="text-sm text-green-600">Active Items</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {menuItems.filter(item => !item.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Inactive Items</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {menuItems.filter(item => item.image).length}
            </div>
            <div className="text-sm text-purple-600">With Images</div>
          </div>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Items</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first menu item.</p>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Menu Item
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {menuItems.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                            snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-transparent'
                          } ${!item.isActive ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-gray-400 text-xl cursor-move">
                                ⋮⋮
                              </div>
                              <div className="flex items-center space-x-3">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                    crossOrigin="anonymous"
                                    onLoad={() => {
                                      console.log('🔍 Menu item image loaded successfully:', item.name, item.image);
                                    }}
                                    onError={(e) => {
                                      console.log('❌ Menu item image failed to load:', item.name, item.image);
                                      console.log('❌ Error event:', e);
                                      console.log('❌ Error target:', e.target);
                                      console.log('❌ Trying fallback approach...');
                                      
                                      // Try to load the image with a different approach
                                      const img = new Image();
                                      img.crossOrigin = 'anonymous';
                                      img.onload = () => {
                                        console.log('🔍 Fallback menu item image loaded successfully');
                                        e.target.src = img.src;
                                        e.target.style.display = 'block';
                                        e.target.nextSibling.style.display = 'none';
                                      };
                                      img.onerror = () => {
                                        console.log('❌ Fallback also failed');
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      };
                                      img.src = item.image;
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    item.image ? 'hidden' : 'flex'
                                  }`}
                                  style={{ backgroundColor: item.color }}
                                >
                                  <span className="text-white font-bold text-lg">
                                    {item.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                  {item.description && (
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                  )}
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500">Order: {item.order}</span>
                                    {item.link && (
                                      <span className="text-xs text-blue-600">Link: {item.link}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleActive(item)}
                                disabled={operationLoading}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  item.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                disabled={operationLoading}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={operationLoading}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* File Input Outside Modal */}
      {isModalOpen && (
        <>
          <input
            ref={fileInputRef}
            id="menu-image-upload-outside"
            type="file"
            accept="image/*"
            onChange={(e) => {
              console.log('File input changed:', e.target.files);
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
                e.target.value = ''; // Reset input
              }
            }}
            style={{ position: 'absolute', left: '-9999px' }}
          />

          {/* Professional Modal - Modern Design */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-4 sm:my-8 max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 sm:p-6 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                      {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <p className="text-white/80 text-sm sm:text-base hidden sm:block">
                      {editingMenuItem ? 'Update your menu item details' : 'Create a new menu section'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMenuItem(null);
                    resetForm();
                  }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveMenuItem(formData);
              }} className="space-y-4 sm:space-y-6">
                
                {/* Name Field */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2">
                    Menu Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-base"
                    placeholder="Enter menu item name"
                    required
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                    rows="2"
                    placeholder="Enter a brief description of this menu item"
                  />
                </div>

                {/* Image Section */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2">
                    Menu Item Image
                  </label>

                  {/* Image Upload Options */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* File Upload */}
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Button clicked - triggering file input');
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      disabled={imageUploading}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-indigo-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-indigo-100 transition-colors">
                          {imageUploading ? (
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">
                          {imageUploading ? 'Uploading...' : 'Click to Upload Image'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </button>

                    {/* URL Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-base"
                        placeholder="Or enter image URL"
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {(imagePreview || formData.image) && (
                    <div className="mt-3 sm:mt-4">
                      <p className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Preview:</p>
                      <div className="relative group">
                        <img
                          src={formData.image || imagePreview}
                          alt="Preview"
                          className="w-full h-32 sm:h-40 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                          crossOrigin="anonymous"
                          onLoad={() => {
                            console.log('🔍 Image loaded successfully:', formData.image || imagePreview);
                          }}
                          onError={(e) => {
                            console.log('❌ Image failed to load:', formData.image || imagePreview);
                            console.log('❌ Error details:', e);
                            console.log('❌ Trying fallback approach...');
                            
                            // Try to load the image with a different approach
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.onload = () => {
                              console.log('🔍 Fallback image loaded successfully');
                              e.target.src = img.src;
                              e.target.style.display = 'block';
                              e.target.nextSibling.style.display = 'none';
                            };
                            img.onerror = () => {
                              console.log('❌ Fallback also failed');
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            };
                            img.src = formData.image || imagePreview;
                          }}
                        />
                        <div className="w-full h-32 sm:h-40 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 text-sm hidden">
                          <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Image failed to load
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: '' });
                            setImagePreview(null);
                          }}
                          className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Color and Order Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Color Selection */}
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 hover:scale-105 ${
                            formData.color === color.value
                              ? 'ring-2 sm:ring-4 ring-indigo-500 ring-offset-1 sm:ring-offset-2 scale-110 shadow-lg'
                              : 'shadow-md hover:shadow-lg'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-base"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Link Field */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2">
                    Navigation Link
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-base"
                    placeholder="/products/category"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Leave empty to disable navigation</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm sm:text-base font-semibold text-gray-700">
                    Make this menu item active and visible
                  </label>
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMenuItem(null);
                    resetForm();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveMenuItem(formData);
                  }}
                  disabled={operationLoading || !formData.name.trim()}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                    operationLoading || !formData.name.trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {operationLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">{editingMenuItem ? 'Update' : 'Create'} Menu Item</span>
                      <span className="sm:hidden">{editingMenuItem ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default AdminMenu;
