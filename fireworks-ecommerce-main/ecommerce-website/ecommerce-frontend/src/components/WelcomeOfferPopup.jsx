import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { getApiConfig } from '../config/api';
import Icon from './Icon';
import { getImageUrl } from '../utils/imageUtils';

const WelcomeOfferPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to get page name from URL
  const getPageNameFromUrl = (href) => {
    if (!href) return null;
    
    // Remove leading slash and get the first part
    const path = href.replace(/^\//, '').split('/')[0];
    
    // Map common routes to page names
    const pageMap = {
      '': 'home',
      'home': 'home',
      'contact': 'contact',
      'about': 'about',
      'products': 'products',
      'services': 'services',
      'blog': 'blog'
    };
    
    return pageMap[path] || null;
  };

  // Helper function to check if popup should show for specific page
  const checkAndShowPopupForPage = (pageName) => {
    if (!popupData || !popupData.isActive) return;
    
    // Check if popup is configured for this page
    if (popupData.triggerType === 'click_specific_pages' && 
        popupData.showOnPages && 
        popupData.showOnPages.includes(pageName)) {
      
      // Check if popup was already shown for this page in this session
      const sessionKey = `popup_shown_${popupData._id}_${pageName}`;
      const hasShownForPage = sessionStorage.getItem(sessionKey);
      
      if (!hasShownForPage) {
        console.log(`🎉 Showing popup for page: ${pageName}`);
        setIsVisible(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  };

  useEffect(() => {
    fetchActivePopup();
    
    // Listen for storage changes to refresh popup when admin updates
    const handleStorageChange = (e) => {
      if (e.key === 'offerPopups') {
        console.log('🔄 Offer popups updated in localStorage, refreshing...');
        fetchActivePopup();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      console.log('🔄 Offer popups updated via custom event, refreshing...');
      fetchActivePopup();
    };
    
    window.addEventListener('offerPopupsUpdated', handleCustomStorageChange);
    
    // Listen for page navigation events
    const handlePageClick = (e) => {
      const target = e.target.closest('a[href]');
      if (target) {
        const href = target.getAttribute('href');
        const pageName = getPageNameFromUrl(href);
        if (pageName) {
          checkAndShowPopupForPage(pageName);
        }
      }
    };
    
    // Listen for keyboard events (ESC to close)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    
    document.addEventListener('click', handlePageClick);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('offerPopupsUpdated', handleCustomStorageChange);
      document.removeEventListener('click', handlePageClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchActivePopup = async () => {
    try {
      setLoading(true);
      
      // First try to get popups from localStorage (same as admin panel)
      let activePopup = null;
      
      try {
        const storedPopups = localStorage.getItem('offerPopups');
        console.log('🔍 Raw localStorage data:', storedPopups);
        
        if (storedPopups) {
          const popups = JSON.parse(storedPopups);
          console.log('🔍 Parsed popups:', popups);
          
          // Find the first active popup that should show on initial page
          activePopup = popups.find(popup => {
            const isActive = popup.isActive === true;
            // If endDate is null/undefined, popup is not expired (no expiration set)
            const notExpired = !popup.endDate || new Date(popup.endDate) > new Date();
            const shouldShowOnInitial = popup.showOnInitialPage !== false;

            console.log('🔍 Checking popup:', {
              id: popup._id,
              couponCode: popup.couponCode,
              isActive,
              notExpired,
              shouldShowOnInitial,
              endDate: popup.endDate,
              currentDate: new Date().toISOString()
            });

            return isActive && notExpired && shouldShowOnInitial;
          });
          
          console.log('🔍 Found active popup:', activePopup);
        }
      } catch (error) {
        console.log('Error reading from localStorage:', error);
      }
      
      // If no popup found in localStorage, try API
      if (!activePopup) {
        try {
          const response = await axios.get(`${getApiConfig().BASE_URL}/api/offer-popups?status=active&limit=1`);
          
          if (response.data.success && response.data.popups.length > 0) {
            // Find popup that should show on initial page
            const apiPopup = response.data.popups.find(popup => 
              popup.showOnInitialPage !== false // Default to true if not set
            );
            if (apiPopup) {
              activePopup = apiPopup;
            }
          }
        } catch (apiError) {
          console.log('API not available, using fallback');
        }
      }
      
      // No popup found - don't show anything
      if (!activePopup) {
        console.log('ℹ️ No active popup found. Create one in the admin panel.');
        setPopupData(null);
        setLoading(false);
        return;
      }
      
      setPopupData(activePopup);
      
      // Debug logging
      console.log('🔍 Popup data loaded:', {
        id: activePopup._id,
        isActive: activePopup.isActive,
        triggerType: activePopup.triggerType,
        showOnInitialPage: activePopup.showOnInitialPage,
        showDelay: activePopup.showDelay,
        endDate: activePopup.endDate,
        currentDate: new Date().toISOString()
      });
      
      // Additional debug for localStorage
      console.log('🔍 localStorage offerPopups:', localStorage.getItem('offerPopups'));
      
      // Check if popup was already shown in this session
      const hasSeenPopup = sessionStorage.getItem(`welcomeOfferShown_${activePopup._id}`);
      const showCount = parseInt(sessionStorage.getItem(`welcomeOfferShownCount_${activePopup._id}`) || '0');
      
      console.log('🔍 Session check:', {
        hasSeenPopup,
        showCount,
        maxShowsPerSession: activePopup.maxShowsPerSession || 1,
        shouldShow: !hasSeenPopup && showCount < (activePopup.maxShowsPerSession || 1) && activePopup.isActive,
        sessionKey: `welcomeOfferShown_${activePopup._id}`,
        allSessionKeys: Object.keys(sessionStorage).filter(key => key.includes('welcomeOffer') || key.includes('popup')),
        allLocalStorageKeys: Object.keys(localStorage).filter(key => key.includes('popup') || key.includes('offer'))
      });
      
      if (!hasSeenPopup && showCount < (activePopup.maxShowsPerSession || 1) && activePopup.isActive) {
        // Check trigger type
        if ((activePopup.triggerType === 'page_load' || !activePopup.triggerType) && activePopup.showOnInitialPage !== false) {
          console.log('✅ Showing popup on page load with delay:', activePopup.showDelay || 2000);
          // Show popup after configured delay for page load
          const timer = setTimeout(() => {
            console.log('🎉 Popup is now visible!');
            setIsVisible(true);
            // Mark as shown
            sessionStorage.setItem(`welcomeOfferShown_${activePopup._id}`, 'true');
            sessionStorage.setItem(`welcomeOfferShownCount_${activePopup._id}`, (showCount + 1).toString());
            console.log('🎉 Popup marked as shown in session:', `welcomeOfferShown_${activePopup._id}`);
          }, activePopup.showDelay || 2000);

          return () => clearTimeout(timer);
        } else if (activePopup.triggerType === 'click_specific_pages') {
          // Don't show automatically, wait for page clicks
          console.log('📋 Popup configured for specific page clicks, waiting for user interaction');
        }
      } else {
        console.log('❌ Popup not showing because:', {
          hasSeenPopup: !!hasSeenPopup,
          showCountExceeded: showCount >= activePopup.maxShowsPerSession,
          notActive: !activePopup.isActive,
          triggerTypeCheck: activePopup.triggerType === 'page_load' || !activePopup.triggerType,
          showOnInitialPageCheck: activePopup.showOnInitialPage !== false
        });
      }
      
    } catch (error) {
      console.error('❌ Error fetching active popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('🔒 Closing popup');
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      // Mark as shown in this session (use the correct key format)
      if (popupData && popupData._id) {
        sessionStorage.setItem(`welcomeOfferShown_${popupData._id}`, 'true');
        console.log('🔒 Marked popup as shown in session:', `welcomeOfferShown_${popupData._id}`);
      }
    }, 300);
  };

  const handleUseCode = () => {
    // Navigate to products page with the coupon code
    if (popupData) {
      navigate(`/products?code=${popupData.couponCode}`);
    } else {
      navigate('/products');
    }
    handleClose();
  };

  
  if (loading) {
    console.log('🔍 Popup loading...');
    return null;
  }

  if (!popupData) {
    console.log('🔍 No popup data available');
    return null;
  }

  if (!isVisible) {
    console.log('🔍 Popup not visible, isVisible:', isVisible);
    return null;
  }

  return (
    <>
      {/* Enhanced Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300 ${
          isClosing ? 'opacity-0 backdrop-blur-none' : 'opacity-100 backdrop-blur-md'
        }`}
        onClick={handleClose}
      />
      
      {/* Full Image Popup Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative max-w-6xl w-full mx-auto">
          {/* Enhanced Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-4 -right-4 z-20 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-110 border-4 border-white"
            aria-label="Close popup"
            title="Close popup (ESC)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* CLEAN IMAGE POPUP - NO BACKGROUND */}
          {popupData.popupImage ? (
            <div className="relative w-full max-w-6xl mx-auto">
              {/* Direct Image Display - Same as ResponsiveBanner (line 215) */}
              <img
                src={popupData.popupImage}
                alt="Special Offer"
                className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                style={{
                  minHeight: '400px',
                  maxHeight: '85vh',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.log('❌ Popup image failed to load:', popupData.popupImage);
                  console.log('❌ Failed URL:', e.target.src);
                  // Use fallback image (same as ResponsiveBanner line 232)
                  e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80&fm=jpg&crop=center';
                }}
                onLoad={() => {
                  console.log('✅ Popup image loaded successfully:', popupData.popupImage);
                }}
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-2xl shadow-2xl p-12">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Icon name="image" className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">No Image Available</h3>
                  <p className="text-gray-400 mb-6">Please upload an image for this offer popup.</p>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      Go to Admin Panel → Offer Popups → Edit → Upload Image
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WelcomeOfferPopup;
