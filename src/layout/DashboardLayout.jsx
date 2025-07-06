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
      {/* Header - Fixed at top */}
      <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      {/* Main Layout Container */}
      <div className="flex relative min-h-screen pt-16">
        {/* Backdrop Overlay for Mobile */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed at right */}
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Main Content Area - Proper margin for sidebar */}
        <main className={`
          flex-1
          ${isMobile ? 'mr-0' : 'mr-[280px]'}
          transition-all duration-300 ease-in-out
          min-h-screen
          ${isMobile && sidebarOpen ? 'overflow-hidden' : ''}
        `}>
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;