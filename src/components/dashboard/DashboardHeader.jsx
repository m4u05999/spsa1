// src/components/dashboard/DashboardHeader.jsx
import React from 'react';
import { MenuIcon } from './icons';

const DashboardHeader = ({ onToggleSidebar, isMobile }) => {
  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-20">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center flex-1">
          {isMobile && (
            <button
              type="button"
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onToggleSidebar}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-800 mr-4">
            لوحة التحكم
          </h2>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            type="button"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">الإشعارات</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;