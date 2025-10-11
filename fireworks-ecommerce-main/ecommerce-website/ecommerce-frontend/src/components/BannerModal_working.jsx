import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUtils';

const BannerModal = ({ isOpen, onClose, banner = null, onSave }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    linkUrl: '',
    isActive: true,
    displayOrder: 0,
    deviceType: 'both' // 'mobile', 'desktop', 'both'
  });
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [desktopImageFile, setDesktopImageFile] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState('');
  const [desktopImagePreview, setDesktopImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        linkUrl: banner.linkUrl || '',
        isActive: banner.isActive !== undefined ? banner.isActive : true,
        displayOrder: banner.displayOrder || 0,
        deviceType: banner.deviceType || 'both'
      });
      // Set image previews with proper URL construction
      if (banner.mobileImageUrl) {
        setMobileImagePreview(getImageUrl(banner.mobileImageUrl));
      } else {
        setMobileImagePreview('');
      }
      if (banner.desktopImageUrl) {
        setDesktopImagePreview(getImageUrl(banner.desktopImageUrl));
      } else {
        setDesktopImagePreview('');
      }
    } else {
      setFormData({
        title: '',
        description: '',
        linkUrl: '',
        isActive: true,
        displayOrder: 0,
        deviceType: 'both'
      });
      setMobileImagePreview('');
      setDesktopImagePreview('');
    }
    setMobileImageFile(null);
    setDesktopImageFile(null);
  }, [banner, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }

      if (type === 'mobile') {
        setMobileImageFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setMobileImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else if (type === 'desktop') {
        setDesktopImageFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setDesktopImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // WORKING: Form submission with proper FormData handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on device type
    if (formData.deviceType === 'mobile' && !mobileImageFile && !mobileImagePreview) {
      showToast('Please select a mobile banner image', 'error');
      return;
    }
    if (formData.deviceType === 'desktop' && !desktopImageFile && !desktopImagePreview) {
      showToast('Please select a desktop banner image', 'error');
      return;
    }
    if (formData.deviceType === 'both' && !mobileImageFile && !mobileImagePreview && !desktopImageFile && !desktopImagePreview) {
      showToast('Please select at least one banner image', 'error');
      return;
    }

    setLoading(true);
    try {
      // WORKING: Create FormData properly
      const formDataToSend = new FormData();
      
      // Add text fields as strings
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('linkUrl', formData.linkUrl || '');
      formDataToSend.append('isActive', String(formData.isActive));
      formDataToSend.append('displayOrder', String(formData.displayOrder));
      formDataToSend.append('deviceType', formData.deviceType || 'both');
      
      // Add image files only if they exist
      if (mobileImageFile) {
        formDataToSend.append('mobileImage', mobileImageFile, mobileImageFile.name);
      }
      if (desktopImageFile) {
        formDataToSend.append('desktopImage', desktopImageFile, desktopImageFile.name);
      }

      console.log('📤 Sending FormData with fields:', {
        title: formData.title,
        linkUrl: formData.linkUrl,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
        deviceType: formData.deviceType,
        hasMobileImage: !!mobileImageFile,
        hasDesktopImage: !!desktopImageFile
      });

      await onSave(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save banner';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {banner ? 'Edit Banner' : 'Create New Banner'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Device Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.deviceType === 'mobile' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="deviceType"
                  value="mobile"
                  checked={formData.deviceType === 'mobile'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-2xl mb-2">📱</div>
                <span className="text-sm font-medium">Mobile Only</span>
              </label>
              
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.deviceType === 'desktop' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="deviceType"
                  value="desktop"
                  checked={formData.deviceType === 'desktop'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-2xl mb-2">💻</div>
                <span className="text-sm font-medium">Desktop Only</span>
              </label>
              
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.deviceType === 'both' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="deviceType"
                  value="both"
                  checked={formData.deviceType === 'both'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-2xl mb-2">📱💻</div>
                <span className="text-sm font-medium">Both Devices</span>
              </label>
            </div>
          </div>

          {/* Mobile Banner Upload */}
          {(formData.deviceType === 'mobile' || formData.deviceType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Banner Image *
                <span className="text-red-500 ml-1">(Required for mobile devices)</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'mobile')}
                  className="hidden"
                  id="mobile-banner-image"
                />
                <label htmlFor="mobile-banner-image" className="cursor-pointer">
                  {mobileImagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={mobileImagePreview}
                        alt="Mobile banner preview"
                        className="mx-auto max-w-full max-h-48 object-contain rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        Click to change mobile image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-4xl">📱</div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-green-600 hover:text-green-500">
                            Click to upload mobile banner
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">800×400px recommended</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Desktop Banner Upload */}
          {(formData.deviceType === 'desktop' || formData.deviceType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desktop Banner Image *
                <span className="text-red-500 ml-1">(Required for desktop devices)</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'desktop')}
                  className="hidden"
                  id="desktop-banner-image"
                />
                <label htmlFor="desktop-banner-image" className="cursor-pointer">
                  {desktopImagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={desktopImagePreview}
                        alt="Desktop banner preview"
                        className="mx-auto max-w-full max-h-64 object-contain rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        Click to change desktop image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-4xl">💻</div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload desktop banner
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">1200×400px recommended</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter banner title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter banner description"
            />
          </div>

          {/* Link URL */}
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Link URL
            </label>
            <input
              type="url"
              id="linkUrl"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Where should the banner link to when clicked?
            </p>
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (visible on website)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                banner ? 'Update Banner' : 'Create Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;
