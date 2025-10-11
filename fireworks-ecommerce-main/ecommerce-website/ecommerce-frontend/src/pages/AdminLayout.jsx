import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { ThemeProvider } from '../context/ThemeContext';

const AdminLayout = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-300">
        {/* Sidebar - Fixed, no scroll */}
        <div className="fixed left-0 top-0 h-full w-64 z-10">
          <AdminSidebar />
        </div>
        
        {/* Main Content - Scrollable, full width */}
        <div className="flex-1 ml-64 min-h-screen overflow-y-auto flex flex-col">
          {/* Top Header with Breadcrumbs */}
          <AdminHeader />
          
          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;
