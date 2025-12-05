import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { getImageUrl } from '../utils/imageUtils';

const DynamicBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/banners/active');
      if (response.data.success) {
        // Sort banners by display order
        const sortedBanners = response.data.banners.sort((a, b) => a.displayOrder - b.displayOrder);
        setBanners(sortedBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank');
      } else {
        navigate(banner.linkUrl);
      }
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="banner-container">
        <div className="banner-content h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  return (
    <div className="banner-container">
      <div className="banner-content relative w-full max-w-7xl h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden rounded-lg">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover"
              onClick={() => handleBannerClick(banner)}
              style={{ cursor: banner.linkUrl ? 'pointer' : 'default' }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"%3E%3Crect fill="%23f3f4f6" width="1200" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666"%3EBanner%3C/text%3E%3C/svg%3E';
              }}
            />
            
            {/* Banner Content Overlay */}
            {(banner.title || banner.description) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center">
                <div className="text-center text-white px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
                  {banner.title && (
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-shadow-lg">
                      {banner.title}
                    </h2>
                  )}
                  {banner.description && (
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-4xl mx-auto mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-white/90 leading-relaxed">
                      {banner.description}
                    </p>
                  )}
                  {banner.linkUrl && (
                    <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8">
                      <button className="inline-block bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 active:from-red-800 active:to-pink-800 text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg lg:text-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                        Learn More →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
            aria-label="Next banner"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 hover:scale-125 ${
                index === currentIndex
                  ? 'bg-white shadow-lg'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Pause/Play Button */}
      {banners.length > 1 && (
        <button
          onClick={() => {
            // Toggle auto-play (you can implement this if needed)
          }}
          className="absolute top-3 sm:top-4 md:top-6 lg:top-8 right-3 sm:right-4 md:right-6 lg:right-8 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
          aria-label="Pause auto-play"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          </svg>
        </button>
      )}
       </div>
     </div>
   );
 };

export default DynamicBanner;
