import React from 'react';

const Icon = ({ 
  name, 
  type = 'svg', // 'svg', 'fa', 'heroicon'
  className = '', 
  size = 'md',
  enhanced = true, // Enable enhanced styling by default
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Enhanced styling classes
  const enhancedClasses = enhanced ? 'icon-enhanced' : '';
  const baseClasses = `${sizeClasses[size]} ${enhancedClasses} ${className}`;

  // Enhanced SVG Icons with better visibility
  const svgIcons = {
    email: (
      <svg className={baseClasses} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
    password: (
      <svg className={baseClasses} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
      </svg>
    ),
    user: (
      <svg className={baseClasses} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
    phone: (
      <svg className={baseClasses} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </svg>
    ),
    eye: (
      <svg className={baseClasses} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    ),
    eyeSlash: (
      <svg className={baseClasses} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
      </svg>
    ),
    cart: (
      <div className="relative inline-flex items-center justify-center">
        <div className="bg-red-600 hover:bg-red-700 transition-colors duration-200 rounded-lg p-2.5 shadow-lg hover:shadow-xl">
          <svg className={`${baseClasses} text-white`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      </div>
    ),
    heart: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    search: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    home: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    shield: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    info: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    arrowLeft: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    ),
    lightning: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    plus: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    minus: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    menu: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    chevronDown: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    package: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    logout: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    shoppingBag: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    check: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    arrowRight: (
      <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    )
  };

  // Font Awesome Icons as fallback
  const faIcons = {
    email: <i className={`fas fa-envelope ${baseClasses}`} {...props}></i>,
    password: <i className={`fas fa-lock ${baseClasses}`} {...props}></i>,
    user: <i className={`fas fa-user ${baseClasses}`} {...props}></i>,
    phone: <i className={`fas fa-phone ${baseClasses}`} {...props}></i>,
    eye: <i className={`fas fa-eye ${baseClasses}`} {...props}></i>,
    eyeSlash: <i className={`fas fa-eye-slash ${baseClasses}`} {...props}></i>,
    cart: (
      <div className="relative inline-flex items-center justify-center">
        <div className="bg-red-600 hover:bg-red-700 transition-colors duration-200 rounded-lg p-2.5 shadow-lg hover:shadow-xl">
          <i className={`fas fa-shopping-cart ${baseClasses} text-white`} {...props}></i>
        </div>
      </div>
    ),
    heart: <i className={`fas fa-heart ${baseClasses}`} {...props}></i>,
    search: <i className={`fas fa-search ${baseClasses}`} {...props}></i>,
    shield: <i className={`fas fa-shield-alt ${baseClasses}`} {...props}></i>,
    info: <i className={`fas fa-info-circle ${baseClasses}`} {...props}></i>,
    arrowLeft: <i className={`fas fa-arrow-left ${baseClasses}`} {...props}></i>,
    lightning: <i className={`fas fa-bolt ${baseClasses}`} {...props}></i>,
    plus: <i className={`fas fa-plus ${baseClasses}`} {...props}></i>,
    minus: <i className={`fas fa-minus ${baseClasses}`} {...props}></i>,
    menu: <i className={`fas fa-bars ${baseClasses}`} {...props}></i>,
    chevronDown: <i className={`fas fa-chevron-down ${baseClasses}`} {...props}></i>,
    package: <i className={`fas fa-box ${baseClasses}`} {...props}></i>,
    logout: <i className={`fas fa-sign-out-alt ${baseClasses}`} {...props}></i>,
    shoppingBag: <i className={`fas fa-shopping-bag ${baseClasses}`} {...props}></i>,
    check: <i className={`fas fa-check ${baseClasses}`} {...props}></i>,
    arrowRight: <i className={`fas fa-arrow-right ${baseClasses}`} {...props}></i>
  };

  // Unicode fallback icons (always work)
  const unicodeIcons = {
    email: '✉️',
    password: '🔒',
    user: '👤',
    phone: '📞',
    eye: '👁️',
    eyeSlash: '🙈',
    cart: (
      <div className="relative inline-flex items-center justify-center">
        <div className="bg-red-600 hover:bg-red-700 transition-colors duration-200 rounded-lg p-2.5 shadow-lg hover:shadow-xl">
          <span className="text-white text-lg">🛒</span>
        </div>
      </div>
    ),
    heart: '❤️',
    search: '🔍',
    shield: '🛡️',
    info: 'ℹ️',
    arrowLeft: '←',
    lightning: '⚡',
    plus: '+',
    minus: '-',
    menu: '☰',
    chevronDown: '⌄',
    package: '📦',
    logout: '🚪',
    shoppingBag: '🛍️',
    check: '✅',
    arrowRight: '→'
  };

  // Try SVG first
  if (type === 'svg' && svgIcons[name]) {
    return svgIcons[name];
  }

  // Try Font Awesome if SVG not found or type is 'fa'
  if ((type === 'fa' || !svgIcons[name]) && faIcons[name]) {
    return faIcons[name];
  }

  // Final fallback to unicode
  if (unicodeIcons[name]) {
    return (
      <span className={baseClasses} style={{ fontSize: sizeClasses[size].replace('w-', '').replace('h-', '') + 'px' }} {...props}>
        {unicodeIcons[name]}
      </span>
    );
  }

  // Ultimate fallback - return a generic icon
  return (
    <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

export default Icon;
