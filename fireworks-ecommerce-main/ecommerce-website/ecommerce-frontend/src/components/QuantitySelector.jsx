import React from 'react';
import Icon from './Icon';

const QuantitySelector = ({ 
  quantity, 
  onIncrease, 
  onDecrease, 
  onChange, 
  min = 1, 
  max = 999, 
  disabled = false,
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'default' // 'default', 'rounded', 'compact'
}) => {
  const sizeClasses = {
    xs: {
      container: 'h-7',
      button: 'w-6 h-6 min-w-[24px] min-h-[24px]',
      input: 'w-12 text-xs min-w-[48px]',
      icon: 'w-3 h-3'
    },
    sm: {
      container: 'h-10',
      button: 'w-9 h-9 min-w-[36px] min-h-[36px]',
      input: 'w-18 text-sm min-w-[72px]',
      icon: 'w-4 h-4'
    },
    md: {
      container: 'h-11',
      button: 'w-10 h-10 min-w-[40px] min-h-[40px]',
      input: 'w-20 text-sm min-w-[80px]',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'h-12',
      button: 'w-11 h-11 min-w-[44px] min-h-[44px]',
      input: 'w-24 text-base min-w-[96px]',
      icon: 'w-5 h-5'
    }
  };

  const variantClasses = {
    default: {
      container: 'border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300',
      button: 'bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 font-bold flex items-center justify-center hover:scale-105 active:scale-95',
      input: 'text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-0 bg-white font-bold text-gray-900'
    },
    rounded: {
      container: 'border-2 border-gray-200 rounded-full overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300',
      button: 'bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 flex items-center justify-center hover:scale-105 active:scale-95',
      input: 'text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-0 bg-transparent font-bold text-gray-900'
    },
    compact: {
      container: 'border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300',
      button: 'bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 flex items-center justify-center font-bold hover:scale-105 active:scale-95',
      input: 'text-center focus:outline-none focus:ring-0 border-0 bg-white font-bold text-gray-900'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`flex items-center ${currentVariant.container} ${currentSize.container}`}>
      {/* Decrease Button */}
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
        className={`${currentVariant.button} ${currentSize.button} ${variant === 'compact' ? 'border-r border-gray-200' : ''}`}
      >
        <Icon name="minus" size={size} />
      </button>

      {/* Quantity Input */}
      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={onChange}
        disabled={disabled}
        className={`${currentVariant.input} ${currentSize.input}`}
      />

      {/* Increase Button */}
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
        className={`${currentVariant.button} ${currentSize.button} ${variant === 'compact' ? 'border-l border-gray-200' : ''}`}
      >
        <Icon name="plus" size={size} />
      </button>
    </div>
  );
};

export default QuantitySelector;
