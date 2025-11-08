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
  const { cartCount = 0, cartItemCount = 0 } = cartContext || {};
  const { wishlistCount = 0 } = useWishlist() || {};
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });
  const [isCakesDropdownOpen, setIsCakesDropdownOpen] = useState(false);
  const [isThemeCakesDropdownOpen, setIsThemeCakesDropdownOpen] = useState(false);
  const [isByRelationshipDropdownOpen, setIsByRelationshipDropdownOpen] = useState(false);
  const [isDessertsDropdownOpen, setIsDessertsDropdownOpen] = useState(false);
  const [isBirthdayDropdownOpen, setIsBirthdayDropdownOpen] = useState(false);
  const [isAnniversaryDropdownOpen, setIsAnniversaryDropdownOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isMobileTrendingOpen, setIsMobileTrendingOpen] = useState(false);
  const [isMobileByTypeOpen, setIsMobileByTypeOpen] = useState(false);
  const [isMobileByFlavoursOpen, setIsMobileByFlavoursOpen] = useState(false);
  const [isMobileThemeCakesOpen, setIsMobileThemeCakesOpen] = useState(false);
  const [isMobileByRelationshipOpen, setIsMobileByRelationshipOpen] = useState(false);
  const [isMobileDessertsOpen, setIsMobileDessertsOpen] = useState(false);
  const [isMobileBirthdayOpen, setIsMobileBirthdayOpen] = useState(false);
  const [isMobileAnniversaryOpen, setIsMobileAnniversaryOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [themeCakesDropdownPosition, setThemeCakesDropdownPosition] = useState({ top: 0, left: 0 });
  const [byRelationshipDropdownPosition, setByRelationshipDropdownPosition] = useState({ top: 0, left: 0 });
  const [dessertsDropdownPosition, setDessertsDropdownPosition] = useState({ top: 0, left: 0 });
  const [birthdayDropdownPosition, setBirthdayDropdownPosition] = useState({ top: 0, left: 0 });
  const [anniversaryDropdownPosition, setAnniversaryDropdownPosition] = useState({ top: 0, left: 0 });
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
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

  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      setIsSearchFocused(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('🔍 Searching for:', searchQuery);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const closeMobileMenu = () => {
    console.log('🔒 Closing mobile menu');
    setIsMobileMenuOpen(false);
  };

  // Debug mobile menu state changes
  useEffect(() => {
    console.log('🔍 Mobile menu state changed:', { isMobileMenuOpen, isUserMenuOpen });
  }, [isMobileMenuOpen, isUserMenuOpen]);

  return (
    <>
      {/* Top Bar - Promotional Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 text-white text-center py-2 px-4 shadow-lg sticky top-0 z-40" style={{
        background: 'linear-gradient(to right, #C1174A, #B91C3C, #DC2626)',
        marginBottom: '0'
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
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky z-50 border-b border-gray-100" style={{ top: '36px' }}>
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
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

            {/* Desktop Navigation - Hidden since links are in category nav below */}
            <div className="hidden">
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
              <form onSubmit={handleSearch} className="relative w-full flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cakes, pastries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-r-lg transition-colors duration-200"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Mobile Search Bar - Only visible on smaller screens */}
            <div className="lg:hidden flex-1 max-w-xs mx-2">
              <form onSubmit={handleSearch} className="relative w-full flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-r-lg transition-colors duration-200 text-sm"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Side Icons - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative">

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
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg border-2 border-white ring-2 ring-red-600 animate-pulse">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Icon - Visible on Desktop, Hidden on Mobile (footer has cart icon) */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🛒 Cart button clicked');
                  handleNavigation("/cart");
                }}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 group hidden md:block"
                style={{ minHeight: '44px', minWidth: '44px' }}
                title={`Cart (${cartItemCount} items)`}
              >
                <Icon name="shopping-cart" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg border-2 border-white ring-2 ring-red-600 animate-pulse">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
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
                        className="fixed inset-0 bg-black bg-opacity-25 lg:hidden"
                        style={{ zIndex: 99998 }}
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
                          zIndex: 99999,
                          maxWidth: 'calc(100vw - 32px)',
                          maxHeight: 'calc(100vh - 100px)',
                          overflowY: 'auto',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
                          <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors flex-shrink-0">
                            <Icon name="heart" className="w-4 h-4 text-pink-600" />
                            {wishlistCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                {wishlistCount > 9 ? '9+' : wishlistCount}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-sm sm:text-base">
                            My Wishlist
                            {wishlistCount > 0 && (
                              <span className="ml-2 text-xs text-pink-600">({wishlistCount})</span>
                            )}
                          </span>
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
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors duration-200 text-xs sm:text-sm font-medium px-2 py-1 rounded group"
                    style={{ minHeight: '44px' }}
                  >
                    <Icon name="user" className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors duration-200" />
                    <span>Login</span>
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

              {/* Home */}
              <button
                onClick={() => handleNavigation("/")}
                className="text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Icon name="home" className="w-4 h-4" />
                Home
              </button>

              {/* About */}
              <button
                onClick={() => handleNavigation("/about")}
                className="text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Icon name="info" className="w-4 h-4" />
                About
              </button>

              {/* Contact */}
              <button
                onClick={() => handleNavigation("/contact")}
                className="text-gray-700 hover:text-red-600 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Icon name="mail" className="w-4 h-4" />
                Contact
              </button>

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
                                  handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                                  handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                                  handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                                  handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                                  handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                                  handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                              handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                              handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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
                              handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
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


        {/* Advanced Search Modal */}
        <AdvancedSearch
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
        />
      </nav>

      {/* Enhanced Mobile Menu - Moved Outside Nav for Proper Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[9998] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ touchAction: 'none' }}
          />

          {/* Sidebar Menu */}
          <div
            ref={mobileMenuRef}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl z-[9999] lg:hidden overflow-hidden flex flex-col"
            style={{
              animation: 'slideInLeft 0.3s ease-out',
              backgroundColor: '#FEF3E2',
              opacity: 1
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Categories List - Bakingo Style with Scrolling */}
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#FEF3E2' }}>
              {/* Home */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => {
                    handleNavigation("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-medium">Home</span>
                  </div>
                </button>
              </div>

              {/* About */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => {
                    handleNavigation("/about");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-medium">About</span>
                  </div>
                </button>
              </div>

              {/* Contact */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => {
                    handleNavigation("/contact");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-medium">Contact</span>
                  </div>
                </button>
              </div>

              {/* FAQ */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => {
                    handleNavigation("/faq");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-medium">FAQ</span>
                  </div>
                </button>
              </div>

              {/* Daughters Day Cakes */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => {
                    handleNavigation("/products?category=Daughters%20Day%20Cakes");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-medium">Daughters Day Cakes</span>
                  </div>
                </button>
              </div>

              {/* Cakes - Expandable */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-bold">Cakes</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isMobileCategoryOpen ? 'rotate-0' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileCategoryOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </button>

                {/* Cakes Subcategories */}
                {isMobileCategoryOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {/* Trending Cakes - Expandable */}
                    <div>
                      <button
                        onClick={() => setIsMobileTrendingOpen(!isMobileTrendingOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">Trending Cakes</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileTrendingOpen ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                      </button>
                      {isMobileTrendingOpen && (
                        <div className="bg-amber-50 border-t border-gray-100">
                          {['Gourmet Cakes', 'Bento Cakes', 'Labubu Cakes', 'Cricket Cakes', 'Pinata Cakes', 'Drip Cakes'].map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 pl-20 text-left hover:bg-white transition-colors"
                            >
                              <span className="text-gray-600 text-xs">{item}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* By Type - Expandable */}
                    <div>
                      <button
                        onClick={() => setIsMobileByTypeOpen(!isMobileByTypeOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">By Type</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileByTypeOpen ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                      </button>
                      {isMobileByTypeOpen && (
                        <div className="bg-amber-50 border-t border-gray-100">
                          {['Bestsellers', 'Eggless Cakes', 'Photo Cakes', 'Cheese Cakes', 'Half Cakes', 'Heart Shaped'].map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 pl-20 text-left hover:bg-white transition-colors"
                            >
                              <span className="text-gray-600 text-xs">{item}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* By Flavours - Expandable */}
                    <div>
                      <button
                        onClick={() => setIsMobileByFlavoursOpen(!isMobileByFlavoursOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">By Flavours</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileByFlavoursOpen ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                      </button>
                      {isMobileByFlavoursOpen && (
                        <div className="bg-amber-50 border-t border-gray-100">
                          {['Chocolate Cakes', 'Butterscotch Cakes', 'Pineapple Cakes', 'Kit Kat Cakes', 'Black Forest Cakes', 'Red Velvet Cakes'].map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                handleNavigation(`/products?category=${encodeURIComponent(item)}`);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 pl-20 text-left hover:bg-white transition-colors"
                            >
                              <span className="text-gray-600 text-xs">{item}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Theme Cakes - Expandable */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsMobileThemeCakesOpen(!isMobileThemeCakesOpen)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-bold">Theme Cakes</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileThemeCakesOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </button>

                {isMobileThemeCakesOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {/* Kids Cakes */}
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-600">Kids Cakes</span>
                    </div>
                    {['1st Birthday Cakes', 'Princess Cakes', 'Animal Cakes', 'Masha & The Bear Cakes', 'Cakes For Boys', 'Cakes For Girls', 'Number Cakes', 'Alphabet Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}

                    {/* Character Cakes */}
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-600">Character Cakes</span>
                    </div>
                    {['Spiderman Cakes', 'Unicorn Cakes', 'Barbie Cakes', 'Harry Potter Cakes', 'Avenger Cakes', 'Peppa Pig Cakes', 'Doraemon Cakes', 'Naruto Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}

                    {/* Grown Up Cakes */}
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-600">Grown Up Cakes</span>
                    </div>
                    {['Makeup Cakes', 'Bride To Be Cakes', 'Wedding Cakes', 'Gym Cakes', 'Party Cakes', 'BTS Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}

                    {/* More Cakes */}
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-600">More Cakes</span>
                    </div>
                    {['Jungle Theme Cakes', 'Cricket Cakes', 'Football Cakes', 'Basketball Cakes', 'Rainbow Cakes', 'Butterfly Cakes', 'Shinchan Cakes', 'Dinosaur Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* By Relationship */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsMobileByRelationshipOpen(!isMobileByRelationshipOpen)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-bold">By Relationship</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileByRelationshipOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </button>

                {isMobileByRelationshipOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {/* For Him */}
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-600">For Him</span>
                    </div>
                    {['Cakes For Friend', 'Cakes For Father', 'Cakes For Husband', 'Cakes For Brother', 'Cakes For Boyfriend'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}

                    {/* For Her */}
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-600">For Her</span>
                    </div>
                    {['Cakes For Friend', 'Cakes For Mother', 'Cakes For Wife', 'Cakes For Girlfriend', 'Cakes For Sister'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-12 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desserts */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsMobileDessertsOpen(!isMobileDessertsOpen)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-bold">Desserts</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileDessertsOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </button>

                {isMobileDessertsOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {['All Desserts', 'Jar Cakes', 'Pastries', 'Cheese Cakes', 'Cup Cakes', 'Brownies', 'Cookies', 'Tea Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-8 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Birthday */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsMobileBirthdayOpen(!isMobileBirthdayOpen)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-bold">Birthday</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileBirthdayOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </button>

                {isMobileBirthdayOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {['Birthday Cakes', '1st Birthday Cakes', 'Birthday Photo Cakes', 'Half Birthday Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-8 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Anniversary */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsMobileAnniversaryOpen(!isMobileAnniversaryOpen)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-lg">✦</span>
                    <span className="text-gray-800 font-bold">Anniversary</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileAnniversaryOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </button>

                {isMobileAnniversaryOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {['All Anniversary Cakes', '1st Anniversary Cakes', '25th Anniversary Cakes', 'Anniversary Cakes For Parents', '5th Anniversary Cakes', 'Anniversary Photo Cakes', '10th Anniversary Cakes', '50th Anniversary Cakes'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          handleNavigation(`/products?subCategory=${encodeURIComponent(item)}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 pl-8 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">✦</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;

