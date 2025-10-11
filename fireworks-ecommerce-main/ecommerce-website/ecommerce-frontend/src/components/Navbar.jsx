import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import Logo from "./Logo";
import AdvancedSearch from "./AdvancedSearch";

const Navbar = () => {
  const cartContext = useCart();
  const { cartCount = 0 } = cartContext || {};
  const { wishlistCount = 0 } = useWishlist() || {};
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isCakesDropdownOpen, setIsCakesDropdownOpen] = useState(false);
  const [isThemeCakesDropdownOpen, setIsThemeCakesDropdownOpen] = useState(false);
  const [isByRelationshipDropdownOpen, setIsByRelationshipDropdownOpen] = useState(false);
  const [isDessertsDropdownOpen, setIsDessertsDropdownOpen] = useState(false);
  const [isBirthdayDropdownOpen, setIsBirthdayDropdownOpen] = useState(false);
  const [isAnniversaryDropdownOpen, setIsAnniversaryDropdownOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [themeCakesDropdownPosition, setThemeCakesDropdownPosition] = useState({ top: 0, left: 0 });
  const [byRelationshipDropdownPosition, setByRelationshipDropdownPosition] = useState({ top: 0, left: 0 });
  const [dessertsDropdownPosition, setDessertsDropdownPosition] = useState({ top: 0, left: 0 });
  const [birthdayDropdownPosition, setBirthdayDropdownPosition] = useState({ top: 0, left: 0 });
  const [anniversaryDropdownPosition, setAnniversaryDropdownPosition] = useState({ top: 0, left: 0 });
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const cakesDropdownRef = useRef(null);
  const cakesButtonRef = useRef(null);
  const themeCakesDropdownRef = useRef(null);
  const themeCakesButtonRef = useRef(null);
  const byRelationshipDropdownRef = useRef(null);
  const byRelationshipButtonRef = useRef(null);
  const dessertsDropdownRef = useRef(null);
  const dessertsButtonRef = useRef(null);
  const birthdayDropdownRef = useRef(null);
  const birthdayButtonRef = useRef(null);
  const anniversaryDropdownRef = useRef(null);
  const anniversaryButtonRef = useRef(null);

  // Close user menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      // For dropdowns, check if click is outside both the dropdown AND the button that opens it
      if (cakesDropdownRef.current && !cakesDropdownRef.current.contains(event.target) && 
          cakesButtonRef.current && !cakesButtonRef.current.contains(event.target)) {
        setIsCakesDropdownOpen(false);
      }
      if (themeCakesDropdownRef.current && !themeCakesDropdownRef.current.contains(event.target) && 
          themeCakesButtonRef.current && !themeCakesButtonRef.current.contains(event.target)) {
        setIsThemeCakesDropdownOpen(false);
      }
      if (byRelationshipDropdownRef.current && !byRelationshipDropdownRef.current.contains(event.target) && 
          byRelationshipButtonRef.current && !byRelationshipButtonRef.current.contains(event.target)) {
        setIsByRelationshipDropdownOpen(false);
      }
      if (dessertsDropdownRef.current && !dessertsDropdownRef.current.contains(event.target) && 
          dessertsButtonRef.current && !dessertsButtonRef.current.contains(event.target)) {
        setIsDessertsDropdownOpen(false);
      }
      if (birthdayDropdownRef.current && !birthdayDropdownRef.current.contains(event.target) && 
          birthdayButtonRef.current && !birthdayButtonRef.current.contains(event.target)) {
        setIsBirthdayDropdownOpen(false);
      }
      if (anniversaryDropdownRef.current && !anniversaryDropdownRef.current.contains(event.target) && 
          anniversaryButtonRef.current && !anniversaryButtonRef.current.contains(event.target)) {
        setIsAnniversaryDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        if (isCakesDropdownOpen) {
          setIsCakesDropdownOpen(false);
        }
        if (isThemeCakesDropdownOpen) {
          setIsThemeCakesDropdownOpen(false);
        }
        if (isByRelationshipDropdownOpen) {
          setIsByRelationshipDropdownOpen(false);
        }
        if (isDessertsDropdownOpen) {
          setIsDessertsDropdownOpen(false);
        }
        if (isBirthdayDropdownOpen) {
          setIsBirthdayDropdownOpen(false);
        }
        if (isAnniversaryDropdownOpen) {
          setIsAnniversaryDropdownOpen(false);
        }
        if (isMobileCategoryOpen) {
          setIsMobileCategoryOpen(false);
        }
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen || isCakesDropdownOpen || isThemeCakesDropdownOpen || isByRelationshipDropdownOpen || isDessertsDropdownOpen || isBirthdayDropdownOpen || isAnniversaryDropdownOpen || isMobileCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen, isMobileMenuOpen, isCakesDropdownOpen, isThemeCakesDropdownOpen, isByRelationshipDropdownOpen, isDessertsDropdownOpen, isBirthdayDropdownOpen, isAnniversaryDropdownOpen, isMobileCategoryOpen]);

  // Handle window resize for user menu positioning
  useEffect(() => {
    const handleResize = () => {
      if (isUserMenuOpen && userMenuRef.current) {
        const rect = userMenuRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          const dropdownHeight = 400; // Estimated dropdown height
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          let topPosition = rect.bottom + window.scrollY;
          
          // If not enough space below, position above the button
          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            topPosition = rect.top + window.scrollY - dropdownHeight;
          }
          
          // Position dropdown connected to profile icon
          const dropdownWidth = Math.min(320, window.innerWidth - 32);
          const rightPosition = window.innerWidth - rect.right;
          const leftPosition = Math.max(16, rect.right - dropdownWidth);
          
          setUserMenuPosition({
            top: topPosition,
            left: leftPosition,
            right: rightPosition,
            width: dropdownWidth
          });
        } else {
          setUserMenuPosition({
            top: rect.bottom + window.scrollY,
            right: window.innerWidth - rect.right,
            left: 'auto',
            width: 'auto'
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isUserMenuOpen]);


  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (path) => {
    console.log('🔄 Navigating to:', path);
    console.log('📱 Mobile menu open:', isMobileMenuOpen);
    console.log('🎯 Current location:', window.location.pathname);
    
    // Close mobile menu first
    setIsMobileMenuOpen(false);
    
    // Add a small delay to ensure state updates properly
    setTimeout(() => {
      console.log('🚀 Executing navigation to:', path);
      console.log('📱 Mobile menu closed, navigating...');
      navigate(path);
    }, 100);
  };

  const closeMobileMenu = () => {
    console.log('🔒 Closing mobile menu');
    setIsMobileMenuOpen(false);
  };


  // Debug mobile menu state
  console.log('🔍 Mobile menu state:', { isMobileMenuOpen, isUserMenuOpen });

  return (
    <>
      {/* Top Bar - Promotional Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 text-white text-center py-3 px-4 shadow-lg" style={{
        background: 'linear-gradient(to right, #C1174A, #B91C3C, #DC2626)'
      }}>
        <div className="w-full max-w-none flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="info" className="w-4 h-4 text-red-200" />
            <span className="text-sm font-medium">Free Delivery on Orders Over ₹500</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Icon name="info" className="w-4 h-4 text-red-200" />
            <span className="text-sm font-medium">Fresh Daily</span>
          </div>
          <div className="hidden lg:flex items-center space-x-2">
            <Icon name="info" className="w-4 h-4 text-red-200" />
            <span className="text-sm font-medium">Custom Orders Available</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100 -mb-2">
        <div className="w-full max-w-none px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
             {/* Logo Section - Mobile Optimized with SK BAKERS Logo */}
             <div className="flex items-center flex-shrink-0">
               <Link to="/" className="block">
                 <Logo 
                   size="default" 
                   showText={true}
                   onClick={() => handleNavigation("/")}
                 />
               </Link>
             </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 ml-8">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🏠 Desktop Home button clicked');
                  handleNavigation("/");
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-all duration-200 text-sm group"
                style={{ minHeight: '44px' }}
              >
                <Icon name="home" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Home</span>
              </button>
              

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('ℹ️ Desktop About button clicked');
                  handleNavigation("/about");
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-all duration-200 text-sm group"
                style={{ minHeight: '44px' }}
              >
                <Icon name="info" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>About</span>
              </button>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📧 Desktop Contact button clicked');
                  handleNavigation("/contact");
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-all duration-200 text-sm group"
                style={{ minHeight: '44px' }}
              >
                <Icon name="email" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Contact</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search cakes, pastries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-r-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <Icon name="filter" className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>
            </div>

            {/* Right Side Icons - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative">
              {/* Mobile Search Button - Only visible on smaller screens */}
              <button 
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 group"
              >
                <Icon name="search" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>

              {/* Wishlist - Mobile Optimized */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('❤️ Wishlist button clicked');
                  handleNavigation("/wishlist");
                }}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 group"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Icon name="heart" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
                {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart - Mobile Optimized */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🛒 Cart button clicked');
                  handleNavigation("/cart");
                }}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 group"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Icon name="cart" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* User Menu - Mobile Optimized */}
              {user ? (
                <div className="relative group" ref={userMenuRef} style={{ position: 'relative', zIndex: 1000 }}>
                  <button 
                    onClick={(e) => {
                      if (userMenuRef.current) {
                        const rect = userMenuRef.current.getBoundingClientRect();
                        const isMobile = window.innerWidth < 768;
                        
                        if (isMobile) {
                          // Mobile: position dropdown connected to profile icon (no gap)
                          const dropdownHeight = 400; // Estimated dropdown height
                          const spaceBelow = window.innerHeight - rect.bottom;
                          const spaceAbove = rect.top;
                          
                          let topPosition = rect.bottom + window.scrollY;
                          
                          // If not enough space below, position above the button
                          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                            topPosition = rect.top + window.scrollY - dropdownHeight;
                          }
                          
                          // Position dropdown connected to profile icon
                          const dropdownWidth = Math.min(320, window.innerWidth - 32);
                          const rightPosition = window.innerWidth - rect.right;
                          const leftPosition = Math.max(16, rect.right - dropdownWidth);
                          
                          setUserMenuPosition({
                            top: topPosition,
                            left: leftPosition,
                            right: rightPosition,
                            width: dropdownWidth
                          });
                        } else {
                          // Desktop: position dropdown connected to button (no gap)
                          setUserMenuPosition({
                            top: rect.bottom + window.scrollY,
                            right: window.innerWidth - rect.right,
                            left: 'auto',
                            width: 'auto'
                          });
                        }
                      }
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-red-600 transition-all duration-200 p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-red-50 group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-red-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                      <Icon name="user" className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-20 truncate">{user.name}</span>
                    <Icon name="chevronDown" className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:rotate-180 text-red-500 group-hover:text-red-600 hidden sm:block" />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      {/* Mobile backdrop overlay */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      
                      <div 
                        className="bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 backdrop-blur-sm sm:py-4"
                        style={{ 
                          position: 'fixed',
                          top: userMenuPosition.top,
                          right: userMenuPosition.right,
                          left: userMenuPosition.left,
                          width: userMenuPosition.width || '288px',
                          zIndex: 10000,
                          maxWidth: 'calc(100vw - 32px)',
                          maxHeight: 'calc(100vh - 100px)',
                          overflowY: 'auto'
                        }}
                      >
                      {/* User Info Header */}
                      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-red-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <Icon name="user" className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                            <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mt-1 capitalize">
                              {user.role || 'user'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1 sm:py-2">
                        <button 
                          onClick={() => {
                            handleNavigation("/profile");
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 sm:space-x-4 w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                            <Icon name="user" className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-medium text-sm sm:text-base">My Profile</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            handleNavigation("/myorder");
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 sm:space-x-4 w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 group"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                            <Icon name="package" className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium text-sm sm:text-base">My Orders</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            handleNavigation("/wishlist");
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 sm:space-x-4 w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 group"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors flex-shrink-0">
                            <Icon name="heart" className="w-4 h-4 text-pink-600" />
                          </div>
                          <span className="font-medium text-sm sm:text-base">My Wishlist</span>
                        </button>
                        
                        {user.role === 'admin' || user.role === 'superadmin' ? (
                          <button 
                            onClick={() => {
                              handleNavigation("/admin");
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 sm:space-x-4 w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 group"
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                              <Icon name="shield" className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium text-sm sm:text-base">Admin Panel</span>
                          </button>
                        ) : null}
                      </div>
                      
                      {/* Logout Section */}
                      <div className="border-t border-gray-200 pt-2 sm:pt-3 mx-3 sm:mx-4">
                        <button 
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 sm:space-x-4 w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium group rounded-xl"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                            <Icon name="logout" className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="text-sm sm:text-base">Sign Out</span>
                        </button>
                      </div>
                    </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔑 Desktop Login button clicked');
                      handleNavigation("/login");
                    }}
                    className="text-gray-600 hover:text-red-600 transition-colors duration-200 text-xs sm:text-sm font-medium px-2 py-1 rounded"
                    style={{ minHeight: '44px' }}
                  >
                    Login
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('📝 Desktop Signup button clicked');
                      handleNavigation("/signup");
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-xs sm:text-sm font-medium"
                    style={{ minHeight: '44px' }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🍔 Mobile menu toggle clicked, current state:', isMobileMenuOpen);
                  console.log('🔄 Setting mobile menu to:', !isMobileMenuOpen);
                  console.log('📱 Screen width:', window.innerWidth);
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="lg:hidden mobile-menu-button nav-button p-2 sm:p-3 text-gray-600 hover:text-red-600 transition-all duration-300 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 shadow-sm hover:shadow-lg group relative"
                aria-label="Toggle mobile menu"
                style={{ 
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                  {isMobileMenuOpen ? (
                    <Icon 
                      name="x" 
                      className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 rotate-180" 
                    />
                  ) : (
                    <div className="space-y-1">
                      <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'group-hover:w-4'}`}></div>
                      <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'group-hover:w-5'}`}></div>
                      <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'group-hover:w-3'}`}></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar - Hidden on Mobile */}
        <div className="hidden lg:block bg-white border-b border-gray-200 relative -mb-2" style={{ zIndex: 100000 }}>
          <div className="w-full max-w-none px-3 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-3 overflow-x-auto overflow-y-visible scrollbar-hide">

              <button 
                onClick={() => handleNavigation("/products?category=Daughters%20Day%20Cakes")}
                className="text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-colors"
              >
                Daughters Day Cakes
              </button>
              <div className="relative" ref={cakesDropdownRef} style={{ zIndex: 100001 }}>
                <button 
                  ref={cakesButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (cakesButtonRef.current) {
                      const rect = cakesButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 4,
                        left: rect.left
                      });
                    }
                    
                    setIsCakesDropdownOpen(!isCakesDropdownOpen);
                  }}
                  className={`text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-all duration-200 relative px-3 py-2 rounded-md ${
                    isCakesDropdownOpen 
                      ? 'text-red-600 bg-red-50 border-b-2 border-red-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Cakes
                  <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Cakes Dropdown Menu */}
                {isCakesDropdownOpen && (
                  <div 
                    className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg" 
                    style={{ 
                      position: 'fixed', 
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      zIndex: 999999,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-4">
                      {/* View All Cakes Option */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <button
                          onClick={() => {
                            handleNavigation("/products?category=Cakes");
                            setIsCakesDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          View All Cakes
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Trending Cakes */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">Trending</h3>
                          </div>
                          <div className="space-y-2">
                            {['Gourmet Cakes', 'Bento Cakes', 'Labubu Cakes', 'Cricket Cakes', 'Pinata Cakes', 'Drip Cakes'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* By Type */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">By Type</h3>
                          </div>
                          <div className="space-y-2">
                            {['Bestsellers', 'Eggless Cakes', 'Photo Cakes', 'Cheese Cakes', 'Half Cakes', 'Heart Shaped'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* By Flavours */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">Flavours</h3>
                          </div>
                          <div className="space-y-2">
                            {['Chocolate Cakes', 'Butterscotch Cakes', 'Pineapple Cakes', 'Kit Kat Cakes', 'Black Forest Cakes', 'Red Velvet Cakes'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={themeCakesDropdownRef} style={{ zIndex: 100001 }}>
                <button 
                  ref={themeCakesButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (themeCakesButtonRef.current) {
                      const rect = themeCakesButtonRef.current.getBoundingClientRect();
                      const viewportWidth = window.innerWidth;
                      const dropdownWidth = 320; // Approximate dropdown width
                      
                      // Ensure dropdown doesn't go off screen
                      let left = rect.left;
                      if (left + dropdownWidth > viewportWidth) {
                        left = viewportWidth - dropdownWidth - 10;
                      }
                      if (left < 10) {
                        left = 10;
                      }
                      
                      setThemeCakesDropdownPosition({
                        top: rect.bottom + 4,
                        left: left
                      });
                    }
                    
                    setIsThemeCakesDropdownOpen(!isThemeCakesDropdownOpen);
                  }}
                  className={`text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-all duration-200 relative px-3 py-2 rounded-md ${
                    isThemeCakesDropdownOpen 
                      ? 'text-red-600 bg-red-50 border-b-2 border-red-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Theme Cakes
                  <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Theme Cakes Dropdown Menu */}
                {isThemeCakesDropdownOpen && (
                  <div 
                    className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg" 
                    style={{ 
                      position: 'fixed', 
                      top: themeCakesDropdownPosition.top,
                      left: themeCakesDropdownPosition.left,
                      zIndex: 999999,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-4">
                      {/* View All Theme Cakes Option */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <button
                          onClick={() => {
                            handleNavigation("/products?category=Theme Cakes");
                            setIsThemeCakesDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          View All Theme Cakes
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Kids Cakes */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">Kids Cakes</h3>
                          </div>
                          <div className="space-y-2">
                            {['1st Birthday Cakes', 'Princess Cakes', 'Animal Cakes', 'Masha & The Bear Cakes', 'Cakes For Boys', 'Cakes For Girls', 'Number Cakes', 'Alphabet Cakes'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsThemeCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Character Cakes */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">Character Cakes</h3>
                          </div>
                          <div className="space-y-2">
                            {['Spiderman Cakes', 'Unicorn Cakes', 'Barbie Cakes', 'Harry Potter Cakes', 'Avenger Cakes', 'Peppa Pig Cakes', 'Doraemon Cakes', 'Naruto Cakes'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsThemeCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Grown Up Cakes */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">Grown Up Cakes</h3>
                          </div>
                          <div className="space-y-2">
                            {['Makeup Cakes', 'Bride To Be Cakes', 'Wedding Cakes', 'Gym Cakes', 'Party Cakes', 'BTS Cakes'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsThemeCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* More Cakes */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs">More Cakes</h3>
                          </div>
                          <div className="space-y-2">
                            {['Jungle Theme Cakes', 'Cricket Cakes', 'Football Cakes', 'Basketball Cakes', 'Rainbow Cakes', 'Butterfly Cakes', 'Shinchan Cakes', 'Dinosaur Cakes'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsThemeCakesDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={byRelationshipDropdownRef} style={{ zIndex: 100001 }}>
                <button 
                  ref={byRelationshipButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (byRelationshipButtonRef.current) {
                      const rect = byRelationshipButtonRef.current.getBoundingClientRect();
                      setByRelationshipDropdownPosition({
                        top: rect.bottom + 4,
                        left: rect.left
                      });
                    }
                    
                    setIsByRelationshipDropdownOpen(!isByRelationshipDropdownOpen);
                  }}
                  className={`text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-all duration-200 relative px-3 py-2 rounded-md ${
                    isByRelationshipDropdownOpen 
                      ? 'text-red-600 bg-red-50 border-b-2 border-red-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  By Relationship
                  <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* By Relationship Dropdown Menu */}
                {isByRelationshipDropdownOpen && (
                  <div 
                    className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg" 
                    style={{ 
                      position: 'fixed', 
                      top: byRelationshipDropdownPosition.top,
                      left: byRelationshipDropdownPosition.left,
                      zIndex: 999999,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-4">
                      {/* View All By Relationship Option */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <button
                          onClick={() => {
                            handleNavigation("/products?category=By Relationship");
                            setIsByRelationshipDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          View All By Relationship
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {/* For Him */}
                        <div>
                          <div className="flex items-center mb-3">
                            <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h3 className="font-semibold text-gray-900 text-sm">For Him</h3>
                          </div>
                          <div className="space-y-2">
                            {['Cakes For Friend', 'Cakes For Father', 'Cakes For Husband', 'Cakes For Brother', 'Cakes For Boyfriend'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsByRelationshipDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* For Her */}
                        <div>
                          <div className="flex items-center mb-3">
                            <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h3 className="font-semibold text-gray-900 text-sm">For Her</h3>
                          </div>
                          <div className="space-y-2">
                            {['Cakes For Friend', 'Cakes For Mother', 'Cakes For Wife', 'Cakes For Girlfriend', 'Cakes For Sister'].map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                  setIsByRelationshipDropdownOpen(false);
                                }}
                                className="block w-full text-left text-xs text-gray-700 hover:text-red-600 py-1.5 px-2 rounded-md hover:bg-red-50 transition-all duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={dessertsDropdownRef} style={{ zIndex: 100001 }}>
                <button 
                  ref={dessertsButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (dessertsButtonRef.current) {
                      const rect = dessertsButtonRef.current.getBoundingClientRect();
                      setDessertsDropdownPosition({
                        top: rect.bottom + 4,
                        left: rect.left
                      });
                    }
                    
                    setIsDessertsDropdownOpen(!isDessertsDropdownOpen);
                  }}
                  className={`text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-all duration-200 relative px-3 py-2 rounded-md ${
                    isDessertsDropdownOpen 
                      ? 'text-red-600 bg-red-50 border-b-2 border-red-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Desserts
                  <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Desserts Dropdown Menu */}
                {isDessertsDropdownOpen && (
                  <div 
                    className="w-64 bg-white border border-gray-200 rounded-lg shadow-lg" 
                    style={{ 
                      position: 'fixed', 
                      top: dessertsDropdownPosition.top,
                      left: dessertsDropdownPosition.left,
                      zIndex: 999999,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-4">
                      {/* View All Desserts Option */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <button
                          onClick={() => {
                            handleNavigation("/products?category=Desserts");
                            setIsDessertsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          View All Desserts
                        </button>
                      </div>
                      <div className="space-y-2">
                        {['All Desserts', 'Jar Cakes', 'Pastries', 'Cheese Cakes', 'Cup Cakes', 'Brownies', 'Cookies', 'Tea Cakes'].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                              setIsDessertsDropdownOpen(false);
                            }}
                            className="block w-full text-left text-sm text-gray-700 hover:text-red-600 py-2 px-3 rounded-md hover:bg-red-50 transition-all duration-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={birthdayDropdownRef} style={{ zIndex: 100001 }}>
                <button 
                  ref={birthdayButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (birthdayButtonRef.current) {
                      const rect = birthdayButtonRef.current.getBoundingClientRect();
                      setBirthdayDropdownPosition({
                        top: rect.bottom + 4,
                        left: rect.left
                      });
                    }
                    
                    setIsBirthdayDropdownOpen(!isBirthdayDropdownOpen);
                  }}
                  className={`text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-all duration-200 relative px-3 py-2 rounded-md ${
                    isBirthdayDropdownOpen 
                      ? 'text-red-600 bg-red-50 border-b-2 border-red-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Birthday
                  <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Birthday Dropdown Menu */}
                {isBirthdayDropdownOpen && (
                  <div 
                    className="w-64 bg-white border border-gray-200 rounded-lg shadow-lg" 
                    style={{ 
                      position: 'fixed', 
                      top: birthdayDropdownPosition.top,
                      left: birthdayDropdownPosition.left,
                      zIndex: 999999,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-4">
                      {/* View All Birthday Option */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <button
                          onClick={() => {
                            handleNavigation("/products?category=Birthday");
                            setIsBirthdayDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          View All Birthday
                        </button>
                      </div>
                      <div className="space-y-2">
                        {['Birthday Cakes', '1st Birthday Cakes', 'Birthday Photo Cakes', 'Half Birthday Cakes'].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                              setIsBirthdayDropdownOpen(false);
                            }}
                            className="block w-full text-left text-sm text-gray-700 hover:text-red-600 py-2 px-3 rounded-md hover:bg-red-50 transition-all duration-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={anniversaryDropdownRef} style={{ zIndex: 100001 }}>
                <button 
                  ref={anniversaryButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (anniversaryButtonRef.current) {
                      const rect = anniversaryButtonRef.current.getBoundingClientRect();
                      setAnniversaryDropdownPosition({
                        top: rect.bottom + 4,
                        left: rect.left
                      });
                    }
                    
                    setIsAnniversaryDropdownOpen(!isAnniversaryDropdownOpen);
                  }}
                  className={`text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-all duration-200 relative px-3 py-2 rounded-md ${
                    isAnniversaryDropdownOpen 
                      ? 'text-red-600 bg-red-50 border-b-2 border-red-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Anniversary
                  <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Anniversary Dropdown Menu */}
                {isAnniversaryDropdownOpen && (
                  <div 
                    className="w-64 bg-white border border-gray-200 rounded-lg shadow-lg" 
                    style={{ 
                      position: 'fixed', 
                      top: anniversaryDropdownPosition.top,
                      left: anniversaryDropdownPosition.left,
                      zIndex: 999999,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-4">
                      {/* View All Anniversary Option */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <button
                          onClick={() => {
                            handleNavigation("/products?category=Anniversary");
                            setIsAnniversaryDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          View All Anniversary
                        </button>
                      </div>
                      <div className="space-y-2">
                        {['All Anniversary Cakes', '1st Anniversary Cakes', '25th Anniversary Cakes', 'Anniversary Cakes For Parents', '5th Anniversary Cakes', 'Anniversary Photo Cakes', '10th Anniversary Cakes', '50th Anniversary Cakes'].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                              setIsAnniversaryDropdownOpen(false);
                            }}
                            className="block w-full text-left text-sm text-gray-700 hover:text-red-600 py-2 px-3 rounded-md hover:bg-red-50 transition-all duration-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleNavigation("/products")}
                className="text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-colors"
              >
                Customized Cakes
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu - Slide Down Animation */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden mobile-menu-container bg-white border-t border-gray-200 shadow-2xl backdrop-blur-sm"
            style={{ 
              zIndex: 9998,
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              width: '100%',
              display: 'block',
              animation: 'slideDown 0.3s ease-out'
            }}
            ref={mobileMenuRef}
          >
            
             {/* Mobile Logo Header */}
             <div className="px-3 py-4 bg-gradient-to-r from-red-50 to-red-50 border-b border-gray-100">
               <div className="flex items-center justify-center">
                 <Logo 
                   size="mobile" 
                   showText={false}
                   onClick={() => {
                     handleNavigation("/");
                     setIsMobileMenuOpen(false);
                   }}
                 />
               </div>
             </div>
            
            {/* Compact Mobile Search Bar */}
            <div className="px-3 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search cakes..."
                  className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 text-sm bg-white shadow-sm hover:shadow-md"
                />
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Icon name="filter" className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Mobile Categories Section - Sidebar Style */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="fixed left-0 top-0 h-full w-80 bg-amber-50 shadow-2xl overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">All Categories</h2>
              <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-amber-100"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="flex-shrink-0 px-4 py-3 bg-amber-50 border-b border-amber-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="search" className="w-4 h-4 text-gray-400" />
                </div>
                    <input
                      type="text"
                      placeholder="Search cakes..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Categories List - Scrollable */}
                <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                  {/* Daughters Day Cakes */}
                  <button 
                    onClick={() => {
                      handleNavigation("/products");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-amber-100 rounded-lg group"
                  >
                    <Icon name="info" className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="font-medium">Daughters Day Cakes</span>
              </button>

                  {/* Cakes - Expandable */}
                  <div className="space-y-1">
              <button 
                      onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                      className="flex items-center justify-between w-full text-left px-3 py-3 text-gray-700 hover:bg-amber-100 rounded-lg group"
                    >
                      <div className="flex items-center">
                        <Icon name="info" className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="font-bold">Cakes</span>
                      </div>
                      <Icon 
                        name={isMobileCategoryOpen ? "minus" : "plus"} 
                        className="w-4 h-4 text-gray-400" 
                      />
                    </button>
                    
                    {isMobileCategoryOpen && (
                      <div className="ml-7 space-y-1">
                        {['Theme Cakes', 'By Relationship'].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                  handleNavigation("/products");
                              setIsMobileMenuOpen(false);
                }}
                            className="flex items-center justify-between w-full text-left px-3 py-2 text-gray-600 hover:bg-amber-100 rounded-lg group"
              >
                            <div className="flex items-center">
                              <Icon name="info" className="w-3 h-3 text-gray-500 mr-3" />
                              <span className="text-sm">{item}</span>
                </div>
                            <Icon name="plus" className="w-3 h-3 text-gray-400" />
              </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other Categories */}
                  {['Desserts', 'Birthday', 'Anniversary'].map((category) => (
              <button 
                      key={category}
                      onClick={() => {
                        handleNavigation("/products");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-3 text-gray-700 hover:bg-amber-100 rounded-lg group"
                    >
                      <div className="flex items-center">
                        <Icon name="info" className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="font-medium">{category}</span>
                </div>
                      <Icon name="plus" className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>

                {/* User Actions - Fixed at Bottom */}
                <div className="flex-shrink-0 px-4 py-4 bg-amber-50 border-t border-amber-200 space-y-3">
                  {user ? (
                    <>
                      <button 
                        onClick={() => {
                          handleNavigation("/profile");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-amber-100 rounded-lg group"
                      >
                        <Icon name="user" className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="font-medium">Profile</span>
              </button>

              <button 
                        onClick={() => {
                          handleNavigation("/myorder");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-amber-100 rounded-lg group"
                      >
                        <Icon name="package" className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="font-medium">Orders</span>
                      </button>
                      
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <button 
                          onClick={() => {
                            handleNavigation("/admin");
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-amber-100 rounded-lg group"
                        >
                          <Icon name="shield" className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="font-medium">Admin</span>
                        </button>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg group"
                      >
                        <Icon name="logout" className="w-4 h-4 text-red-600 mr-3" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          handleNavigation("/login");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => {
                          handleNavigation("/signup");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-white hover:bg-gray-50 text-red-600 font-medium py-2 px-4 rounded-lg border border-red-600 transition-colors"
                      >
                        Sign Up
                      </button>
                </div>
                  )}
                </div>
              </div>
            </div>

            {/* Optimized Mobile User Actions */}
            <div className="px-3 py-4 border-t border-gray-100 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {user ? (
                <div className="space-y-3">
                  {/* Compact User Profile Card */}
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white rounded-xl shadow-md border border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-900 truncate">{user.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <div className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full mt-1 capitalize">
                        {user.role || 'user'}
                      </div>
                    </div>
                  </div>

                  {/* Compact Quick Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('👤 Profile button clicked');
                        handleNavigation("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center space-y-1.5 px-3 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Icon name="user" className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Profile</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('📦 Orders button clicked');
                        handleNavigation("/myorder");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center space-y-1.5 px-3 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Icon name="package" className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Orders</span>
                    </button>

                    {user.role === 'admin' || user.role === 'superadmin' ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🛡️ Admin button clicked');
                          handleNavigation("/admin");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center space-y-1.5 px-3 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
                        style={{ minHeight: '48px' }}
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Icon name="shield" className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">Admin</span>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('❤️ Wishlist button clicked');
                          handleNavigation("/wishlist");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center space-y-1.5 px-3 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
                        style={{ minHeight: '48px' }}
                      >
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                          <Icon name="heart" className="w-4 h-4 text-pink-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">Wishlist</span>
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🚪 Logout button clicked');
                      handleLogout();
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium bg-white shadow-sm hover:shadow-md group"
                    style={{ minHeight: '48px' }}
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Icon name="logout" className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-base">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Welcome to Sweet Dreams Bakery</h3>
                    <p className="text-xs text-gray-600">Sign in for exclusive benefits</p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔑 Login button clicked');
                      handleNavigation("/login");
                    }}
                    className="w-full text-center px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium bg-white shadow-sm hover:shadow-md border border-gray-200 hover:border-red-300"
                    style={{ minHeight: '48px' }}
                  >
                    Sign In
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('📝 Signup button clicked');
                      handleNavigation("/signup");
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium shadow-md"
                    style={{ minHeight: '48px' }}
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Search Modal */}
        <AdvancedSearch 
          isOpen={isAdvancedSearchOpen} 
          onClose={() => setIsAdvancedSearchOpen(false)} 
        />
      </nav>
    </>
  );
};

export default Navbar;

