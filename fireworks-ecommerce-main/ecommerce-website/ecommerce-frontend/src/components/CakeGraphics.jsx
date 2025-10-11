import React from 'react';

// Cake Decorations Component
export const CakeDecorations = ({ className = "", size = "w-4 h-4", color = "text-pink-500" }) => {
  return (
    <div className={`${className} ${size} ${color} animate-pulse`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L19 5L17 7V9L19 11L21 9ZM3 9V7L5 5L7 7V9L5 11L3 9ZM12 7.5C12.8 7.5 13.5 8.2 13.5 9S12.8 10.5 12 10.5S10.5 9.8 10.5 9S11.2 7.5 12 7.5ZM12 1C10.3 1 9 2.3 9 4S10.3 7 12 7S15 5.7 15 4S13.7 1 12 1ZM12 8.5C11.2 8.5 10.5 9.2 10.5 10S11.2 11.5 12 11.5S13.5 10.8 13.5 10S12.8 8.5 12 8.5Z"/>
      </svg>
    </div>
  );
};

// Sparkle Effect Component (reused from fireworks)
export const SparkleEffect = ({ className = "", size = "w-4 h-4", color = "text-yellow-400" }) => {
  return (
    <div className={`${className} ${size} ${color} animate-spin`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
      </svg>
    </div>
  );
};

// Main Cake Graphics Component
const CakeGraphics = ({ 
  density = "normal", 
  showDecorations = true, 
  showSparkles = true, 
  showCandles = true, 
  showFrosting = true, 
  showCherries = true 
}) => {
  const getDensity = () => {
    switch (density) {
      case "low": return 3;
      case "normal": return 6;
      case "high": return 12;
      default: return 6;
    }
  };

  const decorations = [];
  const count = getDensity();

  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 2 + Math.random() * 3;

    decorations.push(
      <div
        key={i}
        className="absolute animate-bounce"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      >
        {showDecorations && <CakeDecorations size="w-3 h-3" color="text-pink-300" />}
        {showSparkles && Math.random() > 0.5 && (
          <SparkleEffect 
            size="w-2 h-2" 
            color="text-yellow-300" 
            className="absolute -top-1 -right-1" 
          />
        )}
        {showCandles && Math.random() > 0.7 && (
          <div className="w-1 h-2 bg-yellow-400 rounded-full animate-flicker"></div>
        )}
        {showFrosting && Math.random() > 0.6 && (
          <div className="w-2 h-1 bg-pink-200 rounded-full animate-pulse"></div>
        )}
        {showCherries && Math.random() > 0.8 && (
          <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {decorations}
    </div>
  );
};

export default CakeGraphics;
