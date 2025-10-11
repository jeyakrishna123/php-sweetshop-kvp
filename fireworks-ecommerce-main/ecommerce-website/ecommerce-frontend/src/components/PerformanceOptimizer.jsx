import { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Image lazy loading optimization
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalImages = [
        '/images/hero-banner.jpg',
        '/images/logo.png'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();

    // Cleanup
    return () => {
      imageObserver.disconnect();
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;
