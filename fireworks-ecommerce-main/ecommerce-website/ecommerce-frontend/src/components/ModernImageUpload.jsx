import { useState, useRef, useEffect } from "react";

// Debug helper
const debugLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ModernImageUpload] ${message}`, data || '');
  }
};

const ModernImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  required = false,
  error = null 
}) => {
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Debug: Log when component mounts and fileInputRef is set
  useEffect(() => {
    debugLog('Component mounted, fileInputRef:', fileInputRef.current);
    if (fileInputRef.current) {
      debugLog('File input is ready');
    }
  }, []);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [];

    for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image. Please select only image files.`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please select files smaller than 5MB.`);
        continue;
      }

      try {
        // Convert to base64 for preview
        const base64 = await convertToBase64(file);
        newImages.push({
          file,
          preview: base64,
          name: file.name,
          size: file.size
        });
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing file ${file.name}`);
      }
    }

    onImagesChange([...images, ...newImages]);
    setIsUploading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImage = {
      url: imageUrl.trim(),
      preview: imageUrl.trim(),
      name: 'URL Image',
      isUrl: true
    };

    onImagesChange([...images, newImage]);
    setImageUrl('');
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = (e) => {
    // Don't prevent default on the outer div - let it bubble naturally
    // Only stop if clicking on nested elements that shouldn't trigger file picker
    const target = e.target;
    const currentTarget = e.currentTarget;
    
    // If clicking on a button or link inside, don't trigger file picker
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
      return;
    }
    
    // Only trigger if clicking directly on the drop zone or its direct children
    if (target === currentTarget || currentTarget.contains(target)) {
      e.stopPropagation(); // Prevent bubbling to parent forms/mods
      
      if (!isUploading && images.length < maxImages) {
        // Ensure the file input exists and is accessible
        if (fileInputRef.current) {
          console.log('🖱️ ModernImageUpload: Click detected, opening file picker...');
          // Use setTimeout to ensure DOM is ready and event cycle completes
          setTimeout(() => {
            try {
              if (fileInputRef.current) {
                fileInputRef.current.click();
                console.log('✅ ModernImageUpload: File picker triggered');
              } else {
                console.error('❌ ModernImageUpload: File input ref is null');
              }
            } catch (error) {
              console.error('❌ ModernImageUpload: Error opening file picker:', error);
            }
          }, 10);
        } else {
          console.error('❌ ModernImageUpload: fileInputRef.current is null');
        }
      } else {
        console.log('⚠️ ModernImageUpload: Cannot open picker - uploading:', isUploading, 'images:', images.length, 'max:', maxImages);
      }
    }
  };


  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            uploadMode === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📁 Upload Files
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            uploadMode === 'url'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔗 Add URL
        </button>
      </div>

      {/* Upload Mode */}
      {uploadMode === 'upload' && (
        <label
          htmlFor="file-upload-input"
          className={`block border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isUploading || images.length >= maxImages
              ? 'border-blue-400 bg-blue-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={(e) => {
            // If clicking on label, let it handle naturally via htmlFor
            // Only use custom handler for drag zone clicks
            if (isUploading || images.length >= maxImages) {
              e.preventDefault();
              return;
            }
            // Fallback: ensure input is triggered even if label doesn't work
            if (fileInputRef.current && !e.target.matches('input[type="file"]')) {
              setTimeout(() => {
                if (fileInputRef.current && document.activeElement !== fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }, 0);
            }
          }}
          style={{ 
            pointerEvents: isUploading || images.length >= maxImages ? 'none' : 'auto',
            position: 'relative',
            display: 'block'
          }}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isUploading ? 'Uploading...' : 'Upload Product Images'}
              </h3>
              <p className="text-gray-600 mt-1">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPG, PNG, GIF up to 5MB each. Max {maxImages} images.
              </p>
            </div>
          </div>

          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              console.log('📁 ModernImageUpload: Files selected:', files?.length || 0);
              if (files && files.length > 0) {
                handleFileUpload(Array.from(files));
              }
              // Reset input to allow selecting the same file again
              e.target.value = '';
            }}
            disabled={isUploading || images.length >= maxImages}
            className="sr-only"
            style={{ 
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: 0
            }}
            tabIndex={-1}
          />
        </label>
      )}

      {/* URL Mode */}
      {uploadMode === 'url' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Image URL</h3>
                <p className="text-sm text-gray-600">Enter the URL of an image to add to your product</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim() || images.length >= maxImages}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Images ({images.length}/{maxImages})
            </h4>
            {images.length >= maxImages && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Maximum reached
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => {
              // Safely extract image URL from different possible formats
              let imageUrl;
              if (typeof image === 'string') {
                imageUrl = image;
              } else if (image && typeof image === 'object') {
                imageUrl = image.preview || image.url || null;
              } else {
                imageUrl = null;
              }

              // Prepend API base URL if it's a relative path
              if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
                const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
                imageUrl = `${apiURL}${imageUrl}`;
              }

              return (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666" font-size="12"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No preview
                    </div>
                  )}
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image Info */}
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {typeof image === 'object' && image.name ? image.name : 'Image'}
                  {typeof image === 'object' && image.size && ` (${(image.size / 1024).toFixed(1)}KB)`}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Required Indicator */}
      {required && (
        <div className="text-xs text-gray-500">
          * At least one image is required for the product
        </div>
      )}
    </div>
  );
};

export default ModernImageUpload;
