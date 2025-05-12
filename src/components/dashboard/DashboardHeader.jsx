// src/components/dashboard/DashboardHeader.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader = ({ 
  onMenuClick, 
  isDarkMode = false, 
  onToggleDarkMode = () => {}, 
  onToggleCollapse = () => {}, 
  isCollapsed = false,
  currentTime = '',
  currentDate = ''
}) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Mock notifications for UI
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'تم إضافة عضو جديد للجمعية',
      time: '2 دقيقة'
    },
    {
      id: 2,
      type: 'alert',
      message: 'يوجد 3 طلبات عضوية في انتظار المراجعة',
      time: '1 ساعة'
    },
    {
      id: 3,
      type: 'success',
      message: 'تم نشر المقال بنجاح',
      time: '3 ساعات'
    }
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by the auth context
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const handleClickOutside = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className="rounded-full bg-yellow-100 p-2">
            <svg className="h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="rounded-full bg-green-100 p-2">
            <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-sm transition-all duration-300`} dir="rtl">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">فتح القائمة</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Logo and Title - Mobile */}
        <div className="lg:hidden flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-2 space-x-reverse">
            <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>لوحة التحكم</span>
          </Link>
        </div>

        {/* Search bar - Desktop */}
        <div className="hidden lg:block lg:max-w-xs">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className={`block w-full pr-10 pl-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white placeholder-gray-500'} rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200`}
              placeholder="البحث..."
            />
          </div>
        </div>

        {/* Right section with controls, time, notifications and profile */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Date and Time Display */}
          <div className="hidden md:flex items-center space-x-3 space-x-reverse mr-3 border-r pr-3 border-gray-300 dark:border-gray-600">
            <div className="text-right">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currentDate}</div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{currentTime}</div>
            </div>
            <div className={`rounded-full p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={onToggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors duration-200`}
            title={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم'}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Sidebar Collapse Toggle - Desktop Only */}
          <button
            className={`hidden lg:block p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors duration-200`}
            onClick={onToggleCollapse}
            title={isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
          
          {/* Notifications dropdown */}
          <div className="relative">
            <button
              type="button"
              className={`p-1 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={toggleNotifications}
            >
              <span className="sr-only">عرض الإشعارات</span>
              <div className="relative">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
              </div>
            </button>

            {/* Notifications panel */}
            {isNotificationsOpen && (
              <>
                {/* Backdrop - close on click outside */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={handleClickOutside}
                ></div>
                
                <div className={`origin-top-left absolute left-0 mt-2 w-80 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20 text-right`}>
                  <div className={`py-2 px-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>الإشعارات</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-3 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} flex items-start space-x-3 space-x-reverse border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                      >
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{notification.message}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>منذ {notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`p-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} text-center`}>
                    <Link to="/dashboard/admin/notifications" className="text-sm text-blue-500 hover:text-blue-700">
                      عرض جميع الإشعارات
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-3 space-x-reverse focus:outline-none"
              onClick={toggleProfileMenu}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium hover:bg-blue-600 transition-colors duration-200">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-right">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.name || "المشرف"}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role || "مدير النظام"}</div>
              </div>
              <svg
                className="hidden md:block h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile dropdown panel */}
            {isProfileMenuOpen && (
              <>
                {/* Backdrop - close on click outside */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={handleClickOutside}
                ></div>
                
                <div className={`origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20`}>
                  <div className="py-1 text-right" role="none">
                    <Link
                      to="/dashboard/profile"
                      className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      role="menuitem"
                    >
                      الملف الشخصي
                    </Link>
                    <Link
                      to="/dashboard/admin/settings"
                      className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      role="menuitem"
                    >
                      الإعدادات
                    </Link>
                    <button
                      type="button"
                      className={`block w-full text-right px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;