// src/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] min-h-screen">
        {/* Header - Fixed at top */}
        <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Main Content Area */}
        <main className="lg:col-start-1 lg:col-end-2 pt-16 min-h-screen transition-all duration-300 ease-in-out">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        {/* Sidebar - Fixed at right */}
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Backdrop Overlay for Mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;