import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getApiConfig } from '../config/api';
import { getImageUrl } from '../utils/imageUtils';
import { offerPopupAPI } from '../utils/adminAPI';

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

  // Fetch popups from API (same pattern as Banners - uses offerPopupAPI)
  const fetchPopups = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Fetching offer popups from API...');

      const response = await offerPopupAPI.getAllOfferPopups();

      if (response.success) {
        // Handle nested response structure and ensure it's an array
        const popupsData = response.data?.popups || response.popups || [];

        if (!Array.isArray(popupsData)) {
          console.error('Popups is not an array:', popupsData);
          setPopups([]);
          showToast('Invalid popups data format', 'error');
          return;
        }

        // Normalize data: Map backend 'image_url' (snake_case from DB) to frontend 'popupImage'
        const normalizedPopups = popupsData.map(popup => ({
          ...popup,
          popupImage: popup.image_url || popup.imageUrl || popup.popupImage, // Backend returns 'image_url', frontend uses 'popupImage'
          _id: popup.id || popup._id, // Ensure we have _id for operations
          couponCode: popup.coupon_code || popup.couponCode,
          isActive: popup.is_active !== undefined ? Boolean(popup.is_active) : Boolean(popup.isActive), // Convert 1/0 to true/false
          showOnPages: popup.show_on_pages ? (typeof popup.show_on_pages === 'string' ? JSON.parse(popup.show_on_pages) : popup.show_on_pages) : (popup.showOnPages || []), // Parse JSON string
          triggerType: popup.trigger_type || popup.triggerType || 'page_load',
          startDate: popup.start_date || popup.startDate,
          endDate: popup.end_date || popup.endDate || null, // Ensure endDate exists
          showOnInitialPage: popup.show_on_homepage !== undefined ? Boolean(popup.show_on_homepage) : true, // Map show_on_homepage
          showDelay: popup.show_delay || popup.showDelay || 2000,
          maxShowsPerSession: popup.max_shows_per_session || popup.maxShowsPerSession || 1,
          discountPercentage: popup.discount_percentage || popup.discountPercentage,
          buttonText: popup.button_text || popup.buttonText || 'Shop Now',
          buttonLink: popup.button_link || popup.buttonLink,
        }));

        // Filter based on status
        let filteredPopups = normalizedPopups;
        if (statusFilter === 'active') {
          filteredPopups = normalizedPopups.filter(p => p.isActive === true);
        } else if (statusFilter === 'inactive') {
          filteredPopups = normalizedPopups.filter(p => p.isActive === false);
        } else if (statusFilter === 'expired') {
          const now = new Date();
          filteredPopups = normalizedPopups.filter(p => new Date(p.endDate) < now);
        }

        setPopups(filteredPopups);
        setTotalPages(1);

        // Save to localStorage for frontend access (same as Banners)
        localStorage.setItem('offerPopups', JSON.stringify(normalizedPopups));
        console.log('💾 Popups saved to localStorage:', normalizedPopups.length);

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('offerPopupsUpdated'));
      } else {
        setPopups([]);
        showToast(response.message || 'Failed to fetch popups', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching offer popups:', error);
      setError('Failed to fetch offer popups');
      setPopups([]);
      showToast('Failed to fetch offer popups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('💾 Saving offer popup - Backend expects JSON with imageUrl');

      // Prepare data for backend (backend expects imageUrl field - see offer-popups.php:195)
      const apiData = {
        title: formData.title || (formData.couponCode ? `Offer: ${formData.couponCode}` : 'Special Offer'),
        description: formData.description || null,
        couponCode: formData.couponCode || '',
        imageUrl: formData.popupImagePreview || '', // Send preview URL (Base64 or URL)
        discountPercentage: formData.discountPercentage || null,
        buttonText: formData.buttonText || 'Shop Now',
        buttonLink: formData.buttonLink || null,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        showOnInitialPage: formData.showOnInitialPage,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        triggerType: formData.triggerType || 'page_load',
        showOnPages: formData.showOnPages || [],
        showDelay: formData.showDelay || 2000,
        maxShowsPerSession: formData.maxShowsPerSession || 1
      };

      console.log('📤 Sending data:', { ...apiData, imageUrl: apiData.imageUrl?.substring(0, 100) + '...' });

      try {
        if (editingPopup) {
          // Update existing popup - using offerPopupAPI (has auth interceptor like Banner)
          const response = await offerPopupAPI.updateOfferPopup(editingPopup._id, apiData);
          if (response.success) {
            showToast('Offer popup updated successfully', 'success');
            await fetchPopups(); // Refresh from database
          }
        } else {
          // Create new popup - using offerPopupAPI (has auth interceptor like Banner)
          const response = await offerPopupAPI.createOfferPopup(apiData);
          if (response.success) {
            showToast('Offer popup created successfully', 'success');
            await fetchPopups(); // Refresh from database
          }
        }
      } catch (apiError) {
        console.error('⚠️ API Error:', apiError.response?.status, apiError.response?.data);
        const errorMsg = apiError.message || 'Failed to save offer popup - API error';
        showToast(errorMsg, 'error');
        return; // Don't close modal on error
      }

      // Close modal and reset form only on success
      setShowModal(false);
      setEditingPopup(null);
      setImageFile(null);
      resetForm();
    } catch (error) {
      console.error('❌ Error saving popup:', error);
      const errorMessage = error.message || 'Failed to save offer popup';
      showToast(errorMessage, 'error');
    }
  };

  const handleEdit = (popup) => {
    console.log('✏️ Editing popup:', popup);
    setEditingPopup(popup);

    // Set preview from existing URL (same as Banner - BannerModal.jsx:35-48)
    const imageUrl = popup.popupImage || popup.imageUrl;

    setFormData({
      couponCode: popup.couponCode || '',
      popupImagePreview: imageUrl || null, // Show existing image from URL
      showOnInitialPage: popup.showOnInitialPage !== undefined ? popup.showOnInitialPage : true,
      showOnPages: popup.showOnPages || ['home', 'contact'],
      triggerType: popup.triggerType || 'page_load'
    });

    // Don't set imageFile - only set if user uploads new image
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer popup? This action cannot be undone.')) {
      return;
    }

    try {
      try {
        // Using offerPopupAPI (has auth interceptor like Banner)
        const response = await offerPopupAPI.deleteOfferPopup(id);

        if (response.success) {
          showToast('Offer popup deleted successfully', 'success');
          await fetchPopups(); // Refresh from database
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('offerPopupsUpdated'));
          return;
        }
      } catch (apiError) {
        console.error('⚠️ API Error during delete:', apiError.message);

        // Fallback to localStorage if API fails
        const storedPopups = JSON.parse(localStorage.getItem('offerPopups') || '[]');
        const updatedPopups = storedPopups.filter(popup => popup._id !== id);
        localStorage.setItem('offerPopups', JSON.stringify(updatedPopups));
        setPopups(updatedPopups);
        showToast('Popup deleted locally (API unavailable)', 'warning');

        // Dispatch event to update frontend
        window.dispatchEvent(new CustomEvent('offerPopupsUpdated'));
      }
    } catch (error) {
      console.error('❌ Error deleting popup:', error);
      showToast('Failed to delete offer popup', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      try {
        // Using offerPopupAPI (has auth interceptor like Banner)
        const response = await offerPopupAPI.toggleOfferPopupStatus(id);

        if (response.success) {
          showToast('Offer popup status updated', 'success');
          await fetchPopups(); // Refresh from database
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('offerPopupsUpdated'));
          return;
        }
      } catch (apiError) {
        console.error('⚠️ API Error during toggle:', apiError.message);

        // Fallback to localStorage if API fails
        const storedPopups = JSON.parse(localStorage.getItem('offerPopups') || '[]');
        const updatedPopups = storedPopups.map(popup =>
          popup._id === id
            ? { ...popup, isActive: !popup.isActive, updatedAt: new Date().toISOString() }
            : popup
        );
        localStorage.setItem('offerPopups', JSON.stringify(updatedPopups));
        setPopups(updatedPopups);
        showToast('Status updated locally (API unavailable)', 'warning');

        // Dispatch event to update frontend
        window.dispatchEvent(new CustomEvent('offerPopupsUpdated'));
      }
    } catch (error) {
      console.error('❌ Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      couponCode: '',
      popupImagePreview: null,
      showOnInitialPage: true,
      showOnPages: ['home', 'contact'],
      triggerType: 'page_load'
    });
    setImageFile(null);
    setImageError('');
  };

  // Clear all popups from localStorage (useful for cleaning up old data)
  const clearAllPopups = () => {
    if (window.confirm('Are you sure you want to clear localStorage? This will remove cached popup data.')) {
      localStorage.removeItem('offerPopups');
      showToast('localStorage cleared successfully', 'success');
      fetchPopups(); // Refresh from database
    }
  };


  // Image upload - Store FILE object like Banner does (NOT Base64!)
  const [imageFile, setImageFile] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file');
      showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB to match Banner)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    setImageError('');
    console.log('📤 Processing image file:', file.name, file.size, 'bytes');

    // Store the FILE object (same as Banner - NOT Base64!)
    setImageFile(file);

    // Create preview using FileReader (same as Banner)
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      console.log('✅ Image preview created successfully');

      // Only store preview for display, NOT the actual data to send
      setFormData(prev => ({
        ...prev,
        popupImagePreview: dataUrl
      }));

      showToast('Image loaded successfully', 'success');
    };

    reader.onerror = () => {
      console.error('❌ Failed to read image file');
      setImageError('Failed to read image file');
      showToast('Failed to read image file', 'error');
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
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
              onClick={clearAllPopups}
              className="group relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              title="Clear all popups from localStorage"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                <svg className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
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
                          src={`${getImageUrl(popup.popupImage)}?t=${Date.now()}`}
                          alt="Popup"
                          className="max-w-full max-h-full object-contain rounded-lg"
                          onError={(e) => {
                            console.log('❌ Table image failed to load:', e.target.src);
                            e.target.src = 'https://via.placeholder.com/64x48?text=No+Image';
                          }}
                        />
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
            <div className="relative inline-block w-full max-w-md mx-auto">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={
                    formData.popupImagePreview.startsWith('data:')
                      ? formData.popupImagePreview // Base64 preview from new upload
                      : `${getImageUrl(formData.popupImagePreview)}?t=${Date.now()}` // URL from database
                  }
                  alt="Popup preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.log('❌ Preview image failed to load:', e.target.src?.substring(0, 100));
                    e.target.src = 'https://via.placeholder.com/400x300?text=Preview+Not+Available';
                  }}
                  onLoad={() => {
                    console.log('✅ Preview image loaded successfully');
                  }}
                />
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
                          <p className="text-xs text-gray-400">Supports: All image formats (Max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="popup-image-upload"
                        />
                        <label
                          htmlFor="popup-image-upload"
                          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose Image
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
