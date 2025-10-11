import React from 'react';

const SKBakersLogo = ({ 
  size = 'default', 
  showText = true, 
  className = '', 
  onClick = null 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      badge: 24,
      text: 'text-xs',
      tagline: 'text-[10px]',
      spacing: 'space-x-2'
    },
    default: {
      badge: 32,
      text: 'text-sm sm:text-base md:text-lg',
      tagline: 'text-[10px] sm:text-xs',
      spacing: 'space-x-2 sm:space-x-3'
    },
    large: {
      badge: 48,
      text: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
      tagline: 'text-xs sm:text-sm',
      spacing: 'space-x-3 sm:space-x-4'
    },
    mobile: {
      badge: 28,
      text: 'text-xs',
      tagline: 'text-[10px]',
      spacing: 'space-x-2'
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;
  const badgeSize = config.badge;

  return (
    <div 
      className={`flex items-center ${config.spacing} group ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Circular Badge with SK Letters and Cake Icon */}
      <div className="relative flex-shrink-0">
        {/* Main Circular Badge */}
        <div 
          className="relative rounded-full border-2 border-pink-500 bg-pink-100 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300"
          style={{ 
            width: badgeSize, 
            height: badgeSize 
          }}
        >
          {/* SK Letters */}
          <span 
            className="font-bold text-pink-600 select-none"
            style={{ fontSize: badgeSize * 0.4 }}
          >
            SK
          </span>
          
          {/* Cake Icon - Positioned in upper right */}
          <div 
            className="absolute -top-1 -right-1"
            style={{ 
              width: badgeSize * 0.4, 
              height: badgeSize * 0.4 
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-full h-full"
              style={{ 
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            >
              {/* Cake Base */}
              <rect 
                x="4" y="12" 
                width="16" height="8" 
                fill="#ec4899" 
                rx="2"
              />
              {/* Cake Top */}
              <rect 
                x="6" y="8" 
                width="12" height="6" 
                fill="#f472b6" 
                rx="2"
              />
              {/* Cherry */}
              <circle 
                cx="12" cy="6" 
                r="2" 
                fill="#dc2626"
              />
              {/* Cherry Stem */}
              <path 
                d="M12 4 L13 2" 
                stroke="#92400e" 
                strokeWidth="1" 
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Text Content */}
      {showText && (
        <div className="flex flex-col">
          {/* BAKERS Text */}
          <h1 className={`${config.text} font-bold text-pink-600 group-hover:text-pink-700 transition-colors select-none`}>
            BAKERS
          </h1>
          
          {/* Tagline */}
          <p className={`${config.tagline} text-gray-600 group-hover:text-pink-500 transition-colors select-none`}>
            HOME-MADE CAKES AND CAFE
          </p>
        </div>
      )}
    </div>
  );
};

export default SKBakersLogo;