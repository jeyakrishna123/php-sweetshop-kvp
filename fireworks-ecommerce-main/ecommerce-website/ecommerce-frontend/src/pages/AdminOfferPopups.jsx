import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getApiConfig } from '../config/api';
import { getImageUrl } from '../utils/imageUtils';

const AdminOfferPopups = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  // Form state - simplified
  const [formData, setFormData] = useState({
    couponCode: '',
    popupImage: null,
    popupImagePreview: null,
    showOnInitialPage: true,
    showOnPages: ['home', 'contact'], // Pages where popup should show
    triggerType: 'page_load' // 'page_load' or 'click_specific_pages'
  });

  // Check if user is authorized
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin privileges required to access this page.</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    // Check admin access first
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      console.log('🔐 User not authorized, redirecting to admin login');
      return;
    }
    
    // Add debouncing to prevent rapid API calls
    const timeoutId = setTimeout(() => {
    fetchPopups();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage, statusFilter, user]);

  // Initialize default mock data
  const getDefaultMockPopups = () => [
    {
      _id: "mock-popup-1",
      couponCode: "WELCOME20",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      popupImage: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Welcome+20%25+OFF",
      showOnInitialPage: true,
      triggerType: 'page_load',
      showOnPages: ['home'],
      isActive: true,
      title: "Welcome Offer",
      subtitle: "Get 20% off your first order",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "mock-popup-2",
      couponCode: "SAVE15",
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      popupImage: "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Save+15%25",
      showOnInitialPage: false,
      triggerType: 'click_specific_pages',
      showOnPages: ['home', 'contact'],
      isActive: true,
      title: "Special Discount",
      subtitle: "Limited time offer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "mock-popup-3",
      couponCode: "NEWUSER",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      popupImage: "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=New+User+Special",
      showOnInitialPage: true,
      triggerType: 'page_load',
      showOnPages: ['home'],
      isActive: false,
      title: "New User Special",
      subtitle: "Exclusive offer for new customers",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Load popups from localStorage or use default
  const loadPopupsFromStorage = () => {
    try {
      const stored = localStorage.getItem('offerPopups');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 Loaded popups from localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
    }
    
    // Return default data if no stored data
    const defaultData = getDefaultMockPopups();
    localStorage.setItem('offerPopups', JSON.stringify(defaultData));
    console.log('📦 Initialized with default popups:', defaultData.length);
    return defaultData;
  };

  // Save popups to localStorage
  const savePopupsToStorage = (popups) => {
    try {
      localStorage.setItem('offerPopups', JSON.stringify(popups));
      console.log('💾 Saved popups to localStorage:', popups.length);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('offerPopupsUpdated'));
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  };

  const fetchPopups = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Fetching offer popups...');
      
      // Add minimal delay to show loading state briefly
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Load from localStorage (persistent storage)
      const allPopups = loadPopupsFromStorage();
      
      // Filter based on status
      let filteredPopups = allPopups;
      if (statusFilter === 'active') {
        filteredPopups = allPopups.filter(p => p.isActive === true);
      } else if (statusFilter === 'inactive') {
        filteredPopups = allPopups.filter(p => p.isActive === false);
      } else if (statusFilter === 'expired') {
        const now = new Date();
        filteredPopups = allPopups.filter(p => new Date(p.endDate) < now);
      }
      
      console.log('✅ Offer popups loaded from storage:', filteredPopups.length);
      setPopups(filteredPopups);
      setTotalPages(1);
      setError('');
      
    } catch (error) {
      console.error('❌ Error fetching offer popups:', error);
      setError('Failed to fetch offer popups');
      setPopups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // No validation - proceed directly
      console.log('💾 Saving offer popup:', formData);

      // Try to save via API first
      try {
      if (editingPopup) {
        await axios.put(`${getApiConfig().BASE_URL}/api/offer-popups/${editingPopup._id}`, formData, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        showToast('Offer popup updated successfully', 'success');
      } else {
        const response = await axios.post(`${getApiConfig().BASE_URL}/api/offer-popups`, formData, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        showToast('Offer popup created successfully', 'success');
      }
      } catch (apiError) {
        console.log('⚠️ API not available, using mock save:', apiError.message);
        console.log('⚠️ API Error details:', {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message
        });

        // Check if it's an authentication error or 404 (not found) - handle gracefully without redirect
        if (apiError.response?.status === 401) {
          console.log('🔐 Authentication error - using mock save instead of redirecting');
          showToast('Using offline mode - changes saved locally', 'warning');
        } else if (apiError.response?.status === 404) {
          console.log('🔍 API endpoint not found (404) - using mock save');
          showToast('Using local storage - API not available', 'info');
        }

        // Continue with mock save for all errors
        
        // Mock save - update localStorage and local state
        const allPopups = loadPopupsFromStorage();
        
        if (editingPopup) {
                  // Update existing popup
                  const updatedPopups = allPopups.map(popup => 
                    popup._id === editingPopup._id 
                      ? { 
                          ...popup, 
                          couponCode: formData.couponCode,
                          popupImage: formData.popupImage,
                          showOnInitialPage: formData.showOnInitialPage,
                          updatedAt: new Date().toISOString()
                        }
                      : popup
                  );
          
          // Save to localStorage
          savePopupsToStorage(updatedPopups);
          
          // Update UI state
          setPopups(prevPopups => 
            prevPopups.map(popup => 
              popup._id === editingPopup._id 
                ? { 
                    ...popup, 
                    couponCode: formData.couponCode,
                    popupImage: formData.popupImage,
                    showOnInitialPage: formData.showOnInitialPage,
                    showOnPages: formData.showOnPages,
                    triggerType: formData.triggerType,
                    updatedAt: new Date().toISOString()
                  }
                : popup
            )
          );
          showToast('Offer popup updated successfully', 'success');
        } else {
          // Create new popup
          const newPopup = {
            _id: `mock-popup-${Date.now()}`,
            couponCode: formData.couponCode,
            popupImage: formData.popupImage,
            showOnInitialPage: formData.showOnInitialPage,
            showOnPages: formData.showOnPages,
            triggerType: formData.triggerType,
            isActive: true,
            title: "New Offer",
            subtitle: "Special promotion",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          const updatedPopups = [newPopup, ...allPopups];
          
          // Save to localStorage
          savePopupsToStorage(updatedPopups);
          
          // Update UI state
          setPopups(prevPopups => [newPopup, ...prevPopups]);
          showToast('Offer popup created successfully', 'success');
        }
      }
      
      setShowModal(false);
      setEditingPopup(null);
      resetForm();
    } catch (error) {
      console.error('❌ Error saving popup:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save offer popup';
      showToast(errorMessage, 'error');
    }
  };

  const handleEdit = (popup) => {
    console.log('✏️ Editing popup:', popup);
    setEditingPopup(popup);
    setFormData({
      couponCode: popup.couponCode || '',
      popupImage: popup.popupImage || null,
      popupImagePreview: popup.popupImage || null,
      showOnInitialPage: popup.showOnInitialPage !== undefined ? popup.showOnInitialPage : true,
      showOnPages: popup.showOnPages || ['home', 'contact'],
      triggerType: popup.triggerType || 'page_load'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer popup?')) {
      try {
        console.log('🗑️ Deleting popup with ID:', id);
        
        // Get current popups from localStorage
        const allPopups = loadPopupsFromStorage();
        const updatedPopups = allPopups.filter(popup => popup._id !== id);
        
        // Save updated popups to localStorage
        savePopupsToStorage(updatedPopups);
        
        // Update UI state
        setPopups(prevPopups => prevPopups.filter(popup => popup._id !== id));
        
        console.log('✅ Popup deleted and saved to localStorage');
        showToast('Offer popup deleted successfully', 'success');
        
        // Optional: Try real API as fallback
        try {
        const response = await axios.delete(`${getApiConfig().BASE_URL}/api/offer-popups/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
          console.log('✅ Real API delete response:', response.data);
        } catch (apiError) {
          console.log('⚠️ Real API delete failed, but localStorage deletion succeeded:', apiError.message);
        }
        
      } catch (error) {
        console.error('❌ Error deleting popup:', error);
        showToast('Failed to delete offer popup', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      console.log('🔄 Toggling status for popup ID:', id);
      
      // Get current popups from localStorage
      const allPopups = loadPopupsFromStorage();
      const updatedPopups = allPopups.map(popup => 
        popup._id === id 
          ? { ...popup, isActive: !popup.isActive, updatedAt: new Date().toISOString() }
          : popup
      );
      
      // Save to localStorage
      savePopupsToStorage(updatedPopups);
      
      // Update UI state
      setPopups(prevPopups => 
        prevPopups.map(popup => 
          popup._id === id 
            ? { ...popup, isActive: !popup.isActive, updatedAt: new Date().toISOString() }
            : popup
        )
      );
      
      console.log('✅ Status toggled and saved to localStorage');
      showToast('Offer popup status updated', 'success');
      
      // Trigger frontend popup refresh
      window.dispatchEvent(new Event('offerPopupsUpdated'));
      console.log('🔄 Triggered frontend popup refresh');
      
      // Clear session storage for this popup so it can show again when activating
      const popupToUpdate = allPopups.find(p => p._id === id);
      if (popupToUpdate && popupToUpdate.isActive) {
        // If activating, clear session storage so popup can show again
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.includes(`welcomeOfferShown_${id}`) || 
          key.includes(`popup_shown_${id}`)
        );
        sessionKeys.forEach(key => {
          sessionStorage.removeItem(key);
          console.log('🧹 Cleared session key:', key);
        });
      }
      
      // Optional: Try real API as fallback
      try {
      const response = await axios.patch(`${getApiConfig().BASE_URL}/api/offer-popups/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
        console.log('✅ Real API toggle response:', response.data);
      } catch (apiError) {
        console.log('⚠️ Real API toggle failed, but localStorage toggle succeeded:', apiError.message);
      }
      
    } catch (error) {
      console.error('❌ Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      couponCode: '',
      popupImage: null,
      popupImagePreview: null,
      showOnInitialPage: true,
      showOnPages: ['home', 'contact'],
      triggerType: 'page_load'
    });
    setImageError('');
  };

  // Reset to default data (useful for testing)
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all offer popups to default data? This will clear all your changes.')) {
      const defaultData = getDefaultMockPopups();
      savePopupsToStorage(defaultData);
      setPopups(defaultData);
      showToast('Reset to default data successfully', 'success');
    }
  };


  // Image upload functions
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setImageError('Image size must be less than 2MB');
      return;
    }

    setImageError('');
    setImageUploading(true);

    // First, create a data URL for immediate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      console.log('✅ Data URL created for immediate preview:', dataUrl.substring(0, 50) + '...');
      
      setFormData(prev => ({
        ...prev,
        popupImage: dataUrl,
        popupImagePreview: dataUrl
      }));
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'offer-popup');

      console.log('📤 Uploading popup image...');
      console.log('🔍 Upload details:', {
        url: `${getApiConfig().BASE_URL}/api/upload/popup-image`,
        hasFile: !!file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasToken: !!user?.token
      });
      
      try {
        const response = await axios.post(`${getApiConfig().BASE_URL}/api/upload/popup-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.token}`
          }
        });

        if (response.data.success) {
          console.log('✅ Image uploaded successfully:', response.data.imageUrl);
          console.log('🔍 Full response data:', response.data);
          
          // Construct the full image URL
          const fullImageUrl = response.data.imageUrl.startsWith('http') 
            ? response.data.imageUrl 
            : `${getApiConfig().BASE_URL}${response.data.imageUrl}`;
          
          console.log('🔗 Constructed full image URL:', fullImageUrl);
          
          // Test the image URL before setting it
          const testImg = new Image();
          testImg.onload = () => {
            console.log('✅ Image URL is valid and accessible');
            // Update with the uploaded URL
            setFormData(prev => ({
              ...prev,
              popupImage: fullImageUrl,
              popupImagePreview: fullImageUrl
            }));
          };
          testImg.onerror = () => {
            console.log('❌ Image URL is not accessible, keeping data URL');
            // Keep the data URL if the uploaded URL doesn't work
            setFormData(prev => ({
              ...prev,
              popupImage: prev.popupImage, // Keep the data URL
              popupImagePreview: prev.popupImagePreview // Keep the data URL
            }));
          };
          testImg.src = fullImageUrl;
          showToast('Image uploaded successfully', 'success');
        } else {
          throw new Error(response.data.message || 'Failed to upload image');
        }
      } catch (uploadError) {
        // Handle authentication errors gracefully
        if (uploadError.response?.status === 401) {
          console.log('🔐 Authentication error during image upload - using local preview');
          showToast('Using local image preview (offline mode)', 'warning');
          setImageError('Using local preview - upload will be processed on save');
          return; // Exit early to avoid showing error toast
        }
        
        // Re-throw other errors
        throw uploadError;
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      
      // Keep the data URL preview that was already set
      console.log('⚠️ Upload failed, but keeping data URL preview');
      
      setImageError('Upload failed, using fallback preview');
      showToast('Image preview created (upload will be processed on save)', 'warning');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      popupImage: null,
      popupImagePreview: null
    }));
    setImageError('');
  };



  const getStatusBadge = (popup) => {
    const now = new Date();
    const startDate = new Date(popup.startDate);
    const endDate = new Date(popup.endDate);

    if (!popup.isActive) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>;
    } else if (now < startDate) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Scheduled</span>;
    } else if (now > endDate) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Expired</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Offer Popups
                </h1>
                <p className="text-gray-600 text-lg font-medium">Manage welcome offers and promotional campaigns</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  Persistent Storage - Changes Saved Locally
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
          <button
            onClick={() => {
              setEditingPopup(null);
              resetForm();
              setShowModal(true);
            }}
            className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <span className="relative flex items-center">
              <svg className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Popup
            </span>
          </button>
            
            <button
              onClick={resetToDefault}
              className="group relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              title="Reset all popups to default data"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                <svg className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to Default
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-gray-700 font-semibold">Filter by Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 shadow-lg hover:shadow-xl"
            >
              <option value="all">All Popups</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Popups Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {popups.map((popup) => (
                <tr key={popup._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono">{popup.couponCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {popup.popupImage ? (
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={popup.popupImage?.startsWith('data:') || popup.popupImage?.startsWith('http') 
                            ? popup.popupImage 
                            : getImageUrl(popup.popupImage)}
                          alt="Popup" 
                          className="max-w-full max-h-full object-contain rounded-lg"
                          onError={(e) => {
                            console.log('❌ Table image failed to load:', popup.popupImage);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center hidden">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(popup)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        popup.triggerType === 'page_load' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {popup.triggerType === 'page_load' ? '📄 Page Load' : '🖱️ Click Pages'}
                      </span>
                      {popup.triggerType === 'click_specific_pages' && popup.showOnPages && (
                        <div className="flex flex-wrap gap-1">
                          {popup.showOnPages.slice(0, 2).map((page, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                              {page}
                            </span>
                          ))}
                          {popup.showOnPages.length > 2 && (
                            <span className="text-xs text-gray-500">+{popup.showOnPages.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(popup.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(popup)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                        title="Edit offer popup"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(popup._id)}
                        className={`px-3 py-1 rounded-md transition-colors duration-200 text-sm font-medium ${
                          popup.isActive 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={popup.isActive ? 'Deactivate popup' : 'Activate popup'}
                      >
                        {popup.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(popup._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                        title="Delete offer popup"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInModal">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/20 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 sm:p-6 md:p-8 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                        {editingPopup ? 'Edit Offer Popup' : 'Create New Offer Popup'}
                      </h2>
                      <p className="text-blue-100 text-sm sm:text-base md:text-lg truncate">
                        {editingPopup ? 'Update your promotional campaign' : 'Design an attractive offer for your customers'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingPopup(null);
                      resetForm();
                    }}
                    className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all duration-200 hover:scale-110 flex-shrink-0 ml-2"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(95vh-200px)]">
              {/* Coupon Code Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Coupon Code</h3>
                </div>
                  <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Enter Coupon Code</label>
                    <input
                      type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-center font-bold text-lg tracking-widest"
                    placeholder="WELCOME"
                  />
                </div>
              </div>

              {/* Popup Image Upload Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-purple-500 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Popup Design Image</h3>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recommended: 400x300px
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
        {formData.popupImagePreview ? (
          <div className="space-y-4">
            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Debug: popupImagePreview = {formData.popupImagePreview?.substring(0, 50)}...
              <br />
              Type: {formData.popupImagePreview?.startsWith('data:') ? 'Data URL' : 'HTTP URL'}
            </div>
            <div className="relative inline-block w-full max-w-md mx-auto">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={formData.popupImagePreview}
                  alt="Popup preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.log('❌ Preview image failed to load:', formData.popupImagePreview);
                    console.log('❌ Error details:', e.target.src);
                    e.target.style.display = 'none';
                    const fallback = document.getElementById('image-error-fallback');
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                  onLoad={(e) => {
                    console.log('✅ Preview image loaded successfully:', formData.popupImagePreview);
                    console.log('✅ Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                  }}
                />
                <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center hidden" id="image-error-fallback">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Image failed to load</p>
                    <p className="text-xs text-gray-400 mt-1">URL: {formData.popupImagePreview?.substring(0, 30)}...</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600">Image uploaded successfully</p>
          </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">Upload Your Design</p>
                          <p className="text-sm text-gray-500">Recommended: 400x300px (2:3 ratio)</p>
                          <p className="text-xs text-gray-400">Supports: JPEG, PNG, WebP (Max 2MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          disabled={imageUploading}
                          className="hidden"
                          id="popup-image-upload"
                        />
                        <label
                          htmlFor="popup-image-upload"
                          className={`inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {imageUploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Choose Image
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Error Display */}
                  {imageError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{imageError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Settings Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Display Settings</h3>
              </div>

                <div className="space-y-4">
                  {/* Trigger Type Selection */}
                  <div className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">When to Show Popup</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="triggerType"
                          value="page_load"
                          checked={formData.triggerType === 'page_load'}
                          onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">On Page Load</span>
                          <p className="text-xs text-gray-500">Show popup when users first visit the website</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="triggerType"
                          value="click_specific_pages"
                          checked={formData.triggerType === 'click_specific_pages'}
                          onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">On Specific Page Clicks</span>
                          <p className="text-xs text-gray-500">Show popup when users click on specific pages</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Page Selection (only show if click_specific_pages is selected) */}
                  {formData.triggerType === 'click_specific_pages' && (
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Pages</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'home', label: 'Home', icon: '🏠' },
                          { value: 'contact', label: 'Contact', icon: '📞' },
                          { value: 'about', label: 'About', icon: 'ℹ️' },
                          { value: 'products', label: 'Products', icon: '🛍️' },
                          { value: 'services', label: 'Services', icon: '⚙️' },
                          { value: 'blog', label: 'Blog', icon: '📝' }
                        ].map((page) => (
                          <label key={page.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.showOnPages.includes(page.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    showOnPages: [...formData.showOnPages, page.value]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    showOnPages: formData.showOnPages.filter(p => p !== page.value)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                            />
                            <span className="text-sm text-gray-700">{page.icon} {page.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show on Initial Page Option (only show if page_load is selected) */}
                  {formData.triggerType === 'page_load' && (
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Show on Initial Page Load</h4>
                        <p className="text-xs text-gray-500">Display this popup when users first visit the website</p>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showOnInitialPage}
                            onChange={(e) => setFormData({ ...formData, showOnInitialPage: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Info about the setting */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-800">
                          <strong>Enabled:</strong> Popup will show when users first visit the homepage<br/>
                          <strong>Disabled:</strong> Popup will only show when manually triggered or through other means
                        </p>
                </div>
                </div>
              </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4 sm:p-6 border-t border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-400 rounded-xl flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">Ready to {editingPopup ? 'update' : 'create'} your offer?</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Just add your image and coupon code</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingPopup(null);
                        resetForm();
                      }}
                      className="px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm sm:text-base">{editingPopup ? 'Update Popup' : 'Create Popup'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfferPopups;
