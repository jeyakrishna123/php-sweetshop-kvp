import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { getImageUrl } from '../utils/imageUtils';
import { getBannerApiUrl } from '../config/api';
import '../styles/banner.css';

const ResponsiveBanner = () => {
  console.log('🚀 ResponsiveBanner component is rendering!');
  
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered - calling fetchBanners');
    fetchBanners();
    
    // Listen for storage changes to refresh banners when admin updates
    const handleStorageChange = (e) => {
      if (e.key === 'banners') {
        console.log('🔄 Banners updated in localStorage, refreshing...');
        fetchBanners();
      }
    };
    
    // Listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      console.log('🔄 Banners updated via custom event, refreshing...');
      fetchBanners();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bannersUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bannersUpdated', handleCustomStorageChange);
    };
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
    console.log('🎯 fetchBanners function called!');
    try {
      setLoading(true);
      console.log('🔄 Fetching banners from API...');
      
      // Try to fetch from API first
      try {
        const apiUrl = getBannerApiUrl();
        console.log('🌐 Using API URL:', apiUrl);
        const response = await axios.get(apiUrl);
        console.log('📡 API Response:', response.data);

        if (response.data.success && response.data.data && response.data.data.banners) {
          console.log('✅ Banners fetched from API:', response.data.data.banners.length);
          // Backend already returns full URLs - use directly (same as products)
          setBanners(response.data.data.banners);
          return;
        }
      } catch (apiError) {
        console.log('⚠️ API call failed, trying localStorage:', apiError.message);
        console.log('⚠️ API Error details:', apiError.response?.data || apiError.message);
      }
      
      // Fallback to localStorage
      try {
        const storedBanners = localStorage.getItem('banners');
        if (storedBanners) {
          const parsedBanners = JSON.parse(storedBanners);
          console.log('📦 Banners loaded from localStorage:', parsedBanners.length);
          setBanners(parsedBanners);
          return;
        }
      } catch (storageError) {
        console.log('⚠️ localStorage failed:', storageError.message);
      }
      
      // Final fallback to mock data
      console.log('⚠️ Using fallback mock data');
      const mockBanners = [
        {
          _id: "mock-1",
          title: "Welcome to SK Bakers",
          description: "Fresh homemade cakes and pastries",
          linkUrl: "",
          isActive: true,
          displayOrder: 0,
          deviceType: "desktop",
          mobileImageUrl: null,
          desktopImageUrl: "https://images.unsplash.com/photo-1578985545062-69aa9484c9c2?w=1200&h=400&fit=crop&q=80&fm=jpg&crop=center",
          imageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      console.log('🎯 Using fallback mock banners:', mockBanners.length);
      setBanners(mockBanners);
      
    } catch (error) {
      console.error('❌ Error fetching banners:', error);
      setBanners([]);
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

  // Show ALL banners without any filtering
  const filteredBanners = banners;
  console.log('🎯 Displaying banners:', filteredBanners.length);
  console.log('📋 Display titles:', filteredBanners.map(b => b.title));
  console.log('🔍 Current loading state:', loading);
  console.log('🔍 Current banners state:', banners);

  if (loading) {
    return (
      <div className="banner-container">
        <div className="banner-content h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (filteredBanners.length === 0) {
    console.log('❌ No banners to display');
    return (
      <div className="banner-container w-full m-0 p-0">
        <div className="banner-content h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>No banners available</p>
            <p className="text-sm mt-2">Check console for details</p>
          </div>
        </div>
      </div>
    );
  }

  // Show banner on all devices including mobile
  console.log('🎨 About to render banner component with', filteredBanners.length, 'banners');

  return (
    <div className="banner-container w-screen -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 m-0 p-0 relative" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
      <div className="banner-content relative w-full h-96 sm:h-[28rem] md:h-[32rem] lg:h-[40rem] xl:h-[44rem] 2xl:h-[48rem] m-0 p-0 bg-gradient-to-r from-pink-100 to-purple-100" style={{ overflow: 'visible' }}>
        {/* Banner Images */}
        <div className="relative w-full h-full">
          {filteredBanners.map((banner, index) => {
            // Simple: Select mobile or desktop image (same as products)
            const imageUrl = isMobile
              ? (banner.mobileImageUrl || banner.imageUrl)
              : (banner.desktopImageUrl || banner.imageUrl);
            
            console.log(`🖼️ Rendering banner ${index + 1}:`, {
              id: banner._id,
              title: banner.title,
              imageUrl: imageUrl,
              isVisible: index === currentIndex
            });
            
            return (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
            <img
              src={imageUrl}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover banner-image-wavy"
              onClick={() => handleBannerClick(banner)}
              style={{ 
                cursor: banner.linkUrl ? 'pointer' : 'default',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 90% 95%, 85% 100%, 80% 95%, 75% 100%, 70% 95%, 65% 100%, 60% 95%, 55% 100%, 50% 95%, 45% 100%, 40% 95%, 35% 100%, 30% 95%, 25% 100%, 20% 95%, 15% 100%, 10% 95%, 5% 100%, 0% 95%)'
              }}
              onLoad={() => {
                console.log('✅ Banner image loaded successfully:', banner._id);
              }}
              onError={(e) => {
                console.log('❌ Banner image failed to load:', banner._id);
                console.log('❌ Failed URL:', e.target.src);
                
                // Use a different fallback image
                console.log('🔄 Using fallback image');
                e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop&q=80&fm=jpg&crop=center';
              }}
            />
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {filteredBanners.length > 1 && (
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
        {filteredBanners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {filteredBanners.map((_, index) => (
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

      </div>
    </div>
  );
};

export default ResponsiveBanner;
