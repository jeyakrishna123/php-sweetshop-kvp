// Performance optimization utilities

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy load images
export const lazyLoadImage = (imgElement, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        observer.unobserve(imgElement);
      }
    });
  });
  observer.observe(imgElement);
};

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Preload critical resources
export const preloadResource = (href, as = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Optimize bundle size by code splitting
export const loadComponent = (importFunc) => {
  return React.lazy(importFunc);
};

// Cache API responses
export const cacheApiResponse = (key, data, ttl = 5 * 60 * 1000) => {
  const item = {
    data,
    timestamp: Date.now(),
    ttl
  };
  localStorage.setItem(`cache_${key}`, JSON.stringify(item));
};

export const getCachedResponse = (key) => {
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;
  
  const item = JSON.parse(cached);
  if (Date.now() - item.timestamp > item.ttl) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }
  
  return item.data;
};

// Optimize re-renders with React.memo
export const optimizeComponent = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};

// Virtual scrolling for large lists
export const createVirtualScroller = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(window.scrollY / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};
