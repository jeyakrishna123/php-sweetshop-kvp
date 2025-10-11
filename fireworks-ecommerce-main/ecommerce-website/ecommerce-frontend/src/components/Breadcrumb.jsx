import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Function to generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs = [];
    
    // Always start with Admin Panel
    breadcrumbs.push({
      label: 'Admin Panel',
      path: '/admin',
      isActive: location.pathname === '/admin' || location.pathname === '/admin/'
    });
    
    // Add other segments
    let currentPath = '/admin';
    pathSegments.forEach((segment, index) => {
      if (segment !== 'admin') {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        
        // Convert segment to readable label
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        breadcrumbs.push({
          label,
          path: currentPath,
          isActive: isLast
        });
      }
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumb if we're on the main admin dashboard
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return null;
  }
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      <Link 
        to="/admin" 
        className="hover:text-blue-600 transition-colors duration-200 flex items-center"
        title="Go to Admin Dashboard"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={`${breadcrumb.path}-${index}`}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          {breadcrumb.isActive ? (
            <span className="text-gray-900 font-medium" aria-current="page">
              {breadcrumb.label}
            </span>
          ) : (
            <Link 
              to={breadcrumb.path}
              className="hover:text-blue-600 transition-colors duration-200"
              title={`Go to ${breadcrumb.label}`}
            >
              {breadcrumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
