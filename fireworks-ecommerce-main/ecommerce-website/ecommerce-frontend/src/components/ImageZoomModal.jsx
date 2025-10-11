import React, { useState, useEffect } from 'react';

const ImageZoomModal = ({ isOpen, onClose, images, currentIndex, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, zoomLevel]);

  const handlePrevious = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleNext = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (zoomLevel > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPosition({ x: (x - 0.5) * 2, y: (y - 0.5) * 2 });
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image;
    }
    if (image && image.url) {
      return image.url;
    }
    return 'https://via.placeholder.com/800x600?text=No+Image';
  };

  if (!isOpen) return null;

  const currentImage = images && images[currentImageIndex] ? images[currentImageIndex] : images?.[0];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation Arrows */}
      {images && images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <button
          onClick={handleZoomOut}
          className="bg-white bg-opacity-20 text-white px-3 py-1 rounded hover:bg-opacity-30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="bg-white bg-opacity-20 text-white px-3 py-1 rounded hover:bg-opacity-30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-white bg-opacity-20 text-white px-3 py-1 rounded hover:bg-opacity-30 transition-colors text-sm"
        >
          Reset
        </button>
      </div>

      {/* Image Counter */}
      {images && images.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
          {currentImageIndex + 1} / {images.length}
        </div>
      )}

      {/* Main Image */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-8 cursor-move"
        onMouseMove={handleMouseMove}
      >
        <img
          src={getImageUrl(currentImage)}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x * 50}px, ${position.y * 50}px)`,
            cursor: zoomLevel > 1 ? 'move' : 'default'
          }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x600?text=No+Image";
          }}
        />
      </div>

      {/* Thumbnail Navigation */}
      {images && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setZoomLevel(1);
                setPosition({ x: 0, y: 0 });
              }}
              className={`w-16 h-16 rounded border-2 overflow-hidden ${
                currentImageIndex === index ? 'border-white' : 'border-gray-400'
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
        <div>Use arrow keys to navigate</div>
        <div>+ / - to zoom, ESC to close</div>
      </div>
    </div>
  );
};

export default ImageZoomModal;
