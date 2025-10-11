import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../axios';

const AdminMenuDropdown = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [menuDropdowns, setMenuDropdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuDropdown, setEditingMenuDropdown] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🎂',
    categories: [],
    isActive: true
  });

  // Check admin access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchMenuDropdowns();
  }, []);

  const fetchMenuDropdowns = async () => {
    try {
      setLoading(true);
      // For now, we'll use a local state since we don't have a backend endpoint yet
      // In a real implementation, this would fetch from /api/menu-dropdowns
      const defaultMenuDropdowns = [
        {
          _id: '1',
          name: 'CLASSIC',
          icon: '🎂',
          categories: ['Chocolate Cakes', 'Vanilla Cakes', 'Butterscotch Cakes', 'Black Forest Cakes', 'Red Velvet Cakes'],
          isActive: true,
          order: 1
        },
        {
          _id: '2',
          name: 'GOURMET',
          icon: '⭐',
          categories: ['Premium Cakes', 'Signature Cakes', 'Artisan Cakes', 'Luxury Desserts'],
          isActive: true,
          order: 2
        },
        {
          _id: '3',
          name: 'DESIGNER',
          icon: '🎨',
          categories: ['Custom Cakes', 'Photo Cakes', 'Themed Cakes', 'Wedding Cakes'],
          isActive: true,
          order: 3
        },
        {
          _id: '4',
          name: 'DESSERTS',
          icon: '🍰',
          categories: ['Ice Cream', 'Pastries', 'Cupcakes', 'Brownies', 'Cookies'],
          isActive: true,
          order: 4
        },
        {
          _id: '5',
          name: 'COOKIES',
          icon: '🍪',
          categories: ['Chocolate Chip', 'Sugar Cookies', 'Macarons', 'Biscuits'],
          isActive: true,
          order: 5
        }
      ];
      setMenuDropdowns(defaultMenuDropdowns);
      console.log('📋 Menu dropdowns loaded:', defaultMenuDropdowns.length);
    } catch (error) {
      console.error('Error fetching menu dropdowns:', error);
      showToast('Failed to fetch menu dropdowns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenuDropdown = async () => {
    try {
      setOperationLoading(true);
      
      if (editingMenuDropdown) {
        // Update existing menu dropdown
        const updatedMenuDropdowns = menuDropdowns.map(item => 
          item._id === editingMenuDropdown._id 
            ? { ...item, ...formData }
            : item
        );
        setMenuDropdowns(updatedMenuDropdowns);
        showToast('Menu dropdown updated successfully', 'success');
      } else {
        // Create new menu dropdown
        const newMenuDropdown = {
          _id: Date.now().toString(),
          ...formData,
          order: menuDropdowns.length + 1
        };
        setMenuDropdowns([...menuDropdowns, newMenuDropdown]);
        showToast('Menu dropdown created successfully', 'success');
      }
      
      setIsModalOpen(false);
      setEditingMenuDropdown(null);
      setFormData({
        name: '',
        icon: '🎂',
        categories: [],
        isActive: true
      });
    } catch (error) {
      console.error('Error saving menu dropdown:', error);
      showToast('Failed to save menu dropdown', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (menuDropdown) => {
    setEditingMenuDropdown(menuDropdown);
    setFormData({
      name: menuDropdown.name,
      icon: menuDropdown.icon,
      categories: [...menuDropdown.categories],
      isActive: menuDropdown.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu dropdown?')) {
      try {
        setOperationLoading(true);
        const updatedMenuDropdowns = menuDropdowns.filter(item => item._id !== id);
        setMenuDropdowns(updatedMenuDropdowns);
        showToast('Menu dropdown deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting menu dropdown:', error);
        showToast('Failed to delete menu dropdown', 'error');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setOperationLoading(true);
      const updatedMenuDropdowns = menuDropdowns.map(item => 
        item._id === id 
          ? { ...item, isActive: !item.isActive }
          : item
      );
      setMenuDropdowns(updatedMenuDropdowns);
      showToast('Menu dropdown status updated', 'success');
    } catch (error) {
      console.error('Error updating menu dropdown status:', error);
      showToast('Failed to update menu dropdown status', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(menuDropdowns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setMenuDropdowns(updatedItems);
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, '']
    }));
  };

  const updateCategory = (index, value) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => i === index ? value : cat)
    }));
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const iconOptions = ['🎂', '⭐', '🎨', '🍰', '🍪', '🧁', '🍩', '🍭', '🍫', '🥧', '🍮', '🍯'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Dropdown Management</h1>
          <p className="text-gray-600 mt-2">Manage menu dropdown options and their categories</p>
        </div>
        <button
          onClick={() => {
            setEditingMenuDropdown(null);
            setFormData({
              name: '',
              icon: '🎂',
              categories: [],
              isActive: true
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Menu Dropdown</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="menu-dropdowns">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {menuDropdowns.map((menuDropdown, index) => (
                    <Draggable key={menuDropdown._id} draggableId={menuDropdown._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                            snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{menuDropdown.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{menuDropdown.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    {menuDropdown.categories.length} categories
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleStatus(menuDropdown._id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  menuDropdown.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {menuDropdown.isActive ? 'Active' : 'Inactive'}
                              </button>
                              
                              <button
                                onClick={() => handleEdit(menuDropdown)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleDelete(menuDropdown._id)}
                                disabled={operationLoading}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Categories Preview */}
                          <div className="mt-3 ml-12">
                            <div className="flex flex-wrap gap-2">
                              {menuDropdown.categories.map((category, catIndex) => (
                                <span
                                  key={catIndex}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {category}
                                </span>
                              ))}
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
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMenuDropdown ? 'Edit Menu Dropdown' : 'Add Menu Dropdown'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CLASSIC, GOURMET, DESIGNER"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`p-3 text-2xl rounded-lg border-2 transition-colors ${
                          formData.icon === icon
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="space-y-2">
                    {formData.categories.map((category, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => updateCategory(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Category name"
                        />
                        <button
                          type="button"
                          onClick={() => removeCategory(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCategory}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMenuDropdown}
                  disabled={operationLoading || !formData.name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? 'Saving...' : editingMenuDropdown ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuDropdown;
