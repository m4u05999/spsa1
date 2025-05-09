// src/components/dashboard/DashboardSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkPermission } from '../../utils/permissions';

const DashboardSidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    content: false,
    users: false,
    events: false
  });

  // Handle menu expansion
  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check user permissions for sidebar menu items
  const canManageUsers = checkPermission(user, 'users.manage');
  const canViewContent = checkPermission(user, 'content.view');
  const canManageEvents = checkPermission(user, 'events.manage');
  const canManageSettings = checkPermission(user, 'settings.manage');

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'staff') return '/dashboard/staff';
    return '/dashboard/member';
  };

  // Define navigation items based on user role
  const navigationItems = [
    // Dashboard item - available for all roles
    {
      name: 'لوحة التحكم',
      path: getDashboardPath(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      permission: null // No permission required
    },
    // User management - only for admins
    {
      name: 'إدارة المستخدمين',
      path: 'users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      permission: 'users.manage'
    },
    // Content management
    {
      name: 'إدارة المحتوى',
      path: 'content',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
          <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
        </svg>
      ),
      permission: 'content.view'
    },
    // Media library management
    {
      name: 'مكتبة الوسائط',
      path: 'media',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      permission: 'content.manage'
    },
    // Static Pages management
    {
      name: 'الصفحات الثابتة',
      path: 'pages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      permission: 'content.manage'
    },
    // Events management
    {
      name: 'إدارة الفعاليات',
      path: 'events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      permission: 'events.manage'
    },
    // Statistics - only for admins and staff
    {
      name: 'الإحصائيات',
      path: 'statistics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      ),
      permission: ['users.manage', 'content.manage']
    },
    // Inquiries management
    {
      name: 'الاستفسارات',
      path: 'inquiries',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      ),
      permission: ['users.manage', 'content.manage']
    },
    // Settings - only for admins
    {
      name: 'إعدادات النظام',
      path: 'settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      permission: 'settings.manage'
    }
  ];

  // Filter navigation items based on permissions
  const filteredNavItems = navigationItems.filter(item => {
    if (!item.permission) return true;
    
    if (Array.isArray(item.permission)) {
      return item.permission.some(perm => checkPermission(user, perm));
    }
    
    return checkPermission(user, item.permission);
  });

  // Sidebar classes based on state
  const sidebarClasses = `fixed h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40
    ${isMobile ? 
      (isOpen ? 'translate-x-0' : 'translate-x-full') : 
      'translate-x-0 right-0 w-[280px]'}
    ${isMobile ? 'top-0 right-0 w-[280px]' : 'top-16'}`;

  return (
    <aside className={sidebarClasses}>
      {/* Mobile sidebar header with close button */}
      {isMobile && (
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="font-semibold text-lg text-gray-900">لوحة التحكم</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* User profile section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
          </div>
          <div className="mr-4">
            <h2 className="text-lg font-medium text-gray-900 truncate max-w-[180px]">
              {user?.name || 'المستخدم'}
            </h2>
            <p className="text-sm text-gray-600 truncate max-w-[180px]">
              {user?.email || 'user@example.com'}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {user?.role === 'admin' ? 'مدير النظام' : user?.role === 'staff' ? 'موظف' : 'عضو'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path.startsWith('/') ? item.path : `/dashboard/admin/${item.path}`}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md group transition-colors ${
                  isActive(item.path.startsWith('/') ? item.path : `/dashboard/admin/${item.path}`) 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={isMobile ? onClose : undefined}
              >
                <span className={`inline-flex mr-3 ${
                  isActive(item.path.startsWith('/') ? item.path : `/dashboard/admin/${item.path}`) ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9.5a1 1 0 00-1-1h-1.5a1 1 0 010-2H15a3 3 0 013 3V16a3 3 0 01-3 3H3a3 3 0 01-3-3V4a3 3 0 013-3h9a3 3 0 013 3v1.5a1 1 0 01-1 1h-1.5a1 1 0 110-2H12V4a1 1 0 00-1-1H3z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M4 8a1 1 0 011-1h9.5a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M11.5 5a1 1 0 011 1v4.5a1 1 0 11-2 0V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;