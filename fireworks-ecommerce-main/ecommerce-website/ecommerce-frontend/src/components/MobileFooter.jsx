import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Icon from './Icon';

const MobileFooter = () => {
  const location = useLocation();
  const { cartCount = 0 } = useCart() || {};
  const { wishlistCount = 0 } = useWishlist() || {};

  const isActive = (path) => {
    return location.pathname === path;
  };

  const footerItems = [
    {
      path: '/',
      icon: 'home',
      label: 'Home',
      active: isActive('/')
    },
    {
      path: '/products',
      icon: 'grid',
      label: 'Products',
      active: isActive('/products') || location.pathname.startsWith('/product/')
    },
    {
      path: '/deals',
      icon: 'flame',
      label: 'Deals',
      active: isActive('/deals')
    },
    {
      path: '/cart',
      icon: 'shopping-cart',
      label: 'Cart',
      active: isActive('/cart'),
      badge: cartCount > 0 ? cartCount : null // Cart icon with item count badge
    },
    {
      path: '/profile',
      icon: 'user',
      label: 'Profile',
      active: isActive('/profile') || location.pathname.startsWith('/profile')
    }
  ];

  return (
    <div className="mobile-footer fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {footerItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
              item.active
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              <Icon 
                name={item.icon} 
                className={`w-5 h-5 ${
                  item.active ? 'text-green-600' : 'text-gray-600'
                }`} 
              />
              {item.badge && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>
            <span className={`text-xs font-medium mt-1 ${
              item.active ? 'text-green-600' : 'text-gray-600'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileFooter;
