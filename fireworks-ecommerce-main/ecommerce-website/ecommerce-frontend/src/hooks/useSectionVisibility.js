import { useState, useEffect } from 'react';
import axios from '../axios';

const useSectionVisibility = (pagePath, sectionName) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVisibility = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/hide-sections/visibility/check', {
          params: {
            pagePath,
            sectionName
          }
        });
        
        if (response.data.success) {
          setIsVisible(!response.data.isHidden);
        }
      } catch (error) {
        console.error('Error checking section visibility:', error);
        // Default to visible if there's an error
        setIsVisible(true);
      } finally {
        setLoading(false);
      }
    };

    if (pagePath && sectionName) {
      checkVisibility();
    } else {
      setLoading(false);
    }
  }, [pagePath, sectionName]);

  return { isVisible, loading };
};

export default useSectionVisibility;
