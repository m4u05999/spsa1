// src/components/dashboard/DashboardSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  DocumentIcon,
  CalendarIcon,
  SettingsIcon,
  NewsIcon,
  CloseIcon
} from './icons';

const DashboardSidebar = ({ isOpen, onClose, isMobile }) => {
  const navigation = [
    { name: 'لوحة التحكم', to: '/dashboard', icon: HomeIcon },
    { name: 'الأعضاء', to: '/dashboard/members', icon: UsersIcon },
    { name: 'المستندات', to: '/dashboard/documents', icon: DocumentIcon },
    { name: 'الفعاليات', to: '/dashboard/events', icon: CalendarIcon },
    { name: 'الأخبار', to: '/dashboard/news', icon: NewsIcon },
    { name: 'الإعدادات', to: '/dashboard/settings', icon: SettingsIcon },
  ];

  const sidebarClasses = `
    fixed top-0 right-0 h-full w-[280px] bg-white shadow-lg z-40
    transform transition-transform duration-300 ease-in-out
    ${isMobile ? (isOpen ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'}
    flex flex-col
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo Area */}
      <div className="h-16 bg-blue-600 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">لوحة التحكم</h1>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={() => {
                if (isMobile) {
                  onClose();
                }
              }}
            >
              <item.icon className="ml-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="mr-3">
            <p className="text-sm font-medium text-gray-900">اسم المستخدم</p>
            <p className="text-xs text-gray-500">البريد الإلكتروني</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;