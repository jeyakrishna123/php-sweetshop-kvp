// Force refresh utility for development
export const forceRefresh = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force reload the page
  window.location.reload(true);
  
  // Alternative: Hard refresh
  // window.location.href = window.location.href;
};

// Clear cache and reload
export const clearCacheAndReload = () => {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Force reload
  window.location.reload(true);
};

// Force refresh logo specifically
export const forceRefreshLogo = () => {
  // Find all logo elements and force re-render
  const logoElements = document.querySelectorAll('[class*="text-2xl"][class*="font-bold"]');
  logoElements.forEach(el => {
    // Force re-render by temporarily changing and reverting
    const originalClasses = el.className;
    el.className = originalClasses + ' force-update';
    setTimeout(() => {
      el.className = originalClasses;
    }, 10);
  });
  
  // Also clear any CSS cache
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    const href = link.href;
    link.href = '';
    link.href = href;
  });
  
  console.log('🔄 Logo refresh forced');
};

// Development helper to check if icons are loaded
export const checkIconStatus = () => {
  const iconElements = document.querySelectorAll('[class*="w-"] [class*="h-"]');
  console.log('🔍 Icon elements found:', iconElements.length);
  
  iconElements.forEach((el, index) => {
    console.log(`Icon ${index + 1}:`, {
      element: el,
      classes: el.className,
      visible: el.offsetWidth > 0 && el.offsetHeight > 0
    });
  });
  
  return iconElements.length;
};

// Test icon rendering
export const testIconRendering = () => {
  console.log('🧪 Testing icon rendering...');
  
  // Test SVG icons
  const svgTest = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgTest.setAttribute('viewBox', '0 0 24 24');
  svgTest.innerHTML = '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>';
  
  // Test Font Awesome
  const faTest = document.createElement('i');
  faTest.className = 'fas fa-user';
  
  // Test unicode
  const unicodeTest = document.createElement('span');
  unicodeTest.textContent = '👤';
  
  console.log('SVG test:', svgTest);
  console.log('Font Awesome test:', faTest);
  console.log('Unicode test:', unicodeTest);
  
  return {
    svg: svgTest,
    fontAwesome: faTest,
    unicode: unicodeTest
  };
};

// Check logo color
export const checkLogoColor = () => {
  const logoElements = document.querySelectorAll('h1, [class*="text-2xl"]');
  console.log('🎨 Logo elements found:', logoElements.length);
  
  logoElements.forEach((el, index) => {
    const computedStyle = window.getComputedStyle(el);
    console.log(`Logo ${index + 1}:`, {
      element: el,
      text: el.textContent,
      classes: el.className,
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor
    });
  });
  
  return logoElements.length;
};

export default {
  forceRefresh,
  clearCacheAndReload,
  forceRefreshLogo,
  checkIconStatus,
  testIconRendering,
  checkLogoColor
};
