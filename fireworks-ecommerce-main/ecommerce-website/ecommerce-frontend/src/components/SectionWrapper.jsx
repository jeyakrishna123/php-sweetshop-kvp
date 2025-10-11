import React from 'react';
import useSectionVisibility from '../hooks/useSectionVisibility';

const SectionWrapper = ({ 
  children, 
  sectionName, 
  pagePath = window.location.pathname,
  fallback = null 
}) => {
  const { isVisible, loading } = useSectionVisibility(pagePath, sectionName);

  if (loading) {
    return null; // Don't render anything while loading
  }

  if (!isVisible) {
    return fallback; // Return fallback if section is hidden
  }

  return children;
};

export default SectionWrapper;
