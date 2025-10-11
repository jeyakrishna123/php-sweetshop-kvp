import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTheme(settings.theme || 'light');
        setPrimaryColor(settings.primaryColor || 'blue');
        setFontSize(settings.fontSize || 'medium');
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizeMap[fontSize]);
    
  }, [theme, fontSize]);

  // Listen for theme changes from settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'adminSettings') {
        try {
          const settings = JSON.parse(e.newValue);
          setTheme(settings.theme || 'light');
          setPrimaryColor(settings.primaryColor || 'blue');
          setFontSize(settings.fontSize || 'medium');
        } catch (error) {
          console.error('Error parsing theme settings:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor,
    fontSize,
    setFontSize
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
