import { useState, useRef } from 'react';
import axios from '../axios';
import { getApiConfig } from '../config/api';

const ImageUploadOrUrl = ({ 
  value, 
  onChange, 
  placeholder = "Upload image or enter URL",
  className = "",
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = "image/jpeg,image/jpg,image/png,image/gif,image/webp"
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(value || '');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Initialize URL input when value changes
  useState(() => {
    if (value && value.startsWith('http')) {
      setUrlInput(value);
      setActiveTab('url');
    }
  }, [value]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    if (!acceptedTypes.split(',').some(type => file.type === type.trim())) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${getApiConfig().BASE_URL}/api/upload/category-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const imageUrl = `${getApiConfig().BASE_URL}${response.data.data.path}`;
        setPreview(imageUrl);
        onChange(imageUrl);
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      setPreview(urlInput);
      onChange(urlInput);
      setError(null);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    if (!disabled && !uploading && activeTab === 'upload') {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setUrlInput('');
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'url' && !urlInput) {
      setUrlInput(value || '');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => switchTab('upload')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={disabled}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          onClick={() => switchTab('url')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={disabled}
        >
          🔗 Image URL
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${disabled || uploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : preview ? (
            <div className="space-y-2">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-32 mx-auto rounded-lg object-cover"
              />
              <p className="text-sm text-gray-600">Click to change image</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove image
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl text-gray-400">📁</div>
              <p className="text-sm text-gray-600">Drag & drop image here or click to select</p>
              <p className="text-xs text-gray-500">
                Supports: JPEG, PNG, GIF, WebP (max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Use URL
            </button>
          </div>
          
          {preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Preview:</p>
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-32 rounded-lg object-cover border"
                onError={() => setError('Failed to load image from URL')}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove image
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {/* Current Value Display */}
      {preview && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Current Image:</strong> {preview}
        </div>
      )}
    </div>
  );
};

export default ImageUploadOrUrl;
