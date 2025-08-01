// src/components/dashboard/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/index.jsx';
import { useMasterData } from '../../hooks/useMasterData';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const {
    data: allContent,
    loading,
    error,
    getContent
  } = useMasterData();

  // State for navigation items
  const [navigation, setNavigation] = useState([]);

  // Fetch navigation configuration from MasterDataService
  useEffect(() => {
    const fetchNavigationConfig = async () => {
      try {
        // Fetch navigation configuration
        const navConfig = await getContent({
          contentType: 'navigation-config',
          limit: 50
        });

        // Fetch user permissions
        const userPermissions = await getContent({
          contentType: 'user-permissions',
          filters: { userId: user?.id }
        });

        let navigationItems = [];

        if (navConfig && navConfig.length > 0) {
          // Use dynamic navigation from MasterDataService
          navigationItems = navConfig
            .filter(item => {
              // Filter based on user role and permissions
              if (!item.roles || item.roles.includes(user?.role)) {
                return true;
              }
              return false;
            })
            .map(item => ({
              name: item.name || item.title,
              path: item.path || item.url,
              icon: item.icon,
              order: item.order || 0
            }))
            .sort((a, b) => a.order - b.order);
        } else {
          // Fallback to static navigation
          navigationItems = [
            { name: 'الرئيسية', path: '/', icon: '🏠', order: 1 },
            { name: 'الملف الشخصي', path: '/profile', icon: '👤', order: 2 },
            ...(user?.role === 'admin' ? [
              { name: 'إدارة المستخدمين', path: '/dashboard/users', icon: '👥', order: 3 },
              { name: 'إدارة المحتوى', path: '/dashboard/content', icon: '📝', order: 4 },
              { name: 'إدارة الفعاليات', path: '/dashboard/events', icon: '📅', order: 5 }
            ] : []),
            ...(user?.role === 'staff' ? [
              { name: 'المهام', path: '/dashboard/tasks', icon: '✅', order: 3 },
              { name: 'الفعاليات', path: '/dashboard/events', icon: '📅', order: 4 }
            ] : [])
          ];
        }

        setNavigation(navigationItems);

      } catch (err) {
        console.error('خطأ في جلب إعدادات التنقل:', err);
        // Use fallback navigation on error
        setNavigation([
          { name: 'الرئيسية', path: '/', icon: '🏠' },
          { name: 'الملف الشخصي', path: '/profile', icon: '👤' },
          ...(user?.role === 'admin' ? [
            { name: 'إدارة المستخدمين', path: '/dashboard/users', icon: '👥' },
            { name: 'إدارة المحتوى', path: '/dashboard/content', icon: '📝' },
            { name: 'إدارة الفعاليات', path: '/dashboard/events', icon: '📅' }
          ] : []),
          ...(user?.role === 'staff' ? [
            { name: 'المهام', path: '/dashboard/tasks', icon: '✅' },
            { name: 'الفعاليات', path: '/dashboard/events', icon: '📅' }
          ] : [])
        ]);
      }
    };

    if (user) {
      fetchNavigationConfig();
    }
  }, [getContent, user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed top-0 right-0 z-40 w-64 h-screen pt-20 bg-white border-l shadow-lg">
        <div className="h-full px-3 pb-4 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
            <h2 className="text-lg font-semibold">لوحة التحكم</h2>
            <p className="text-sm opacity-90">مرحباً {user?.name || 'المستخدم'}</p>
          </div>

          {/* Navigation Menu */}
          <ul className="space-y-2 font-medium">
            {navigation.map((item, index) => (
              <li key={item.path || index}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                      : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.icon && (
                    <span className="ml-3 text-lg">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="text-sm">خطأ في تحميل التنقل: {error}</p>
            </div>
          )}
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