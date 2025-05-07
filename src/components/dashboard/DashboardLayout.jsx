// src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الملف الشخصي', path: '/profile' },
    ...(user?.role === 'admin' ? [
      { name: 'إدارة المستخدمين', path: '/dashboard/users' },
      { name: 'إدارة المحتوى', path: '/dashboard/content' },
      { name: 'إدارة الفعاليات', path: '/dashboard/events' }
    ] : []),
    ...(user?.role === 'staff' ? [
      { name: 'المهام', path: '/dashboard/tasks' },
      { name: 'الفعاليات', path: '/dashboard/events' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed top-0 right-0 z-40 w-64 h-screen pt-20 bg-white border-l">
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-4 sm:mr-64">
        <div className="p-4 mt-14">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;