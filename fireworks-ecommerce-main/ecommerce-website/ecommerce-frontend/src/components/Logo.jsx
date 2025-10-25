import React from 'react';
import Icon from './Icon';

const Logo = ({ 
  size = 'default', 
  showText = false, 
  className = '', 
  onClick = null 
}) => {
  // Size configurations - Logo only (no text) - Extra large sizes
  const sizeConfig = {
    small: {
      logo: 'w-12 h-12',
      text: 'text-sm',
      tagline: 'text-xs'
    },
    default: {
      logo: 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24',
      text: 'text-sm sm:text-base md:text-lg lg:text-xl',
      tagline: 'text-xs sm:text-sm md:text-base'
    },
    large: {
      logo: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32',
      text: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
      tagline: 'text-sm sm:text-base md:text-lg'
    },
    mobile: {
      logo: 'w-16 h-16',
      text: 'text-sm',
      tagline: 'text-xs'
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 group flex-shrink-0 ${className}`} onClick={onClick}>
      {/* Logo Image */}
      <div className="relative flex-shrink-0">
        {/* Desktop Logo */}
        <img 
          src="/sk-bakers-logo.png" 
          alt="SK BAKERS HOME-MADE CAKES AND CAFE" 
          className={`hidden sm:block ${config.logo} object-contain transition-all duration-300 group-hover:scale-105`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        
        {/* Mobile Logo */}
        <img 
          src="/sk-bakers-logo.png" 
          alt="SK BAKERS" 
          className={`block sm:hidden ${config.logo} object-contain transition-all duration-300 group-hover:scale-105`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        
        {/* Fallback Icon */}
        <div className={`${config.logo} bg-gradient-to-br from-red-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 hidden`}>
          <Icon name="lightning" className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white drop-shadow-sm" />
        </div>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <div className="block">
          {/* Desktop Brand Name */}
          <h1 className={`${config.text} font-bold text-gray-900 group-hover:text-red-600 transition-colors hidden sm:block drop-shadow-sm`}>
            SK BAKERS
          </h1>
          
          {/* Mobile Brand Name */}
          <h1 className={`${config.text} font-bold text-gray-900 group-hover:text-red-600 transition-colors block sm:hidden drop-shadow-sm`}>
            SK BAKERS
          </h1>
          
          {/* Tagline - Hidden on mobile for small size, shown for others */}
          <p className={`${config.tagline} text-gray-600 -mt-0.5 ${size === 'small' ? 'hidden sm:block' : 'hidden sm:block'} group-hover:text-red-500 transition-colors drop-shadow-sm`}>
            HOME-MADE CAKES AND CAFE
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;