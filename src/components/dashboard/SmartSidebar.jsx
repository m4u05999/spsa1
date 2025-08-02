// Smart Sidebar Component - القائمة الجانبية الذكية
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const SmartSidebar = ({ 
  isOpen, 
  onToggle, 
  userRole = 'admin',
  notifications = {},
  onLogout 
}) => {
  const location = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const sidebarRef = useRef(null);

  // تعريف عناصر القائمة حسب المجموعات
  const menuGroups = [
    {
      id: 'overview',
      title: 'نظرة عامة',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      items: [
        {
          id: 'dashboard',
          title: 'لوحة التحكم',
          path: '/dashboard/admin',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
            </svg>
          ),
          badge: notifications.total || 0
        },
        {
          id: 'analytics',
          title: 'التحليلات',
          path: '/dashboard/admin/analytics',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'management',
      title: 'الإدارة',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      items: [
        {
          id: 'users',
          title: 'إدارة الأعضاء',
          path: '/dashboard/admin/users',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          badge: notifications.pendingUsers || 0
        },
        {
          id: 'content',
          title: 'إدارة المحتوى',
          path: '/dashboard/admin/content',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          badge: notifications.pendingContent || 0
        },
        {
          id: 'events',
          title: 'إدارة الفعاليات',
          path: '/dashboard/admin/events',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          badge: notifications.upcomingEvents || 0
        },
        {
          id: 'media',
          title: 'مكتبة الوسائط',
          path: '/dashboard/admin/media',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'communication',
      title: 'التواصل',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      items: [
        {
          id: 'inquiries',
          title: 'الاستفسارات',
          path: '/dashboard/admin/inquiries',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          badge: notifications.unreadInquiries || 0
        },
        {
          id: 'notifications',
          title: 'الإشعارات',
          path: '/dashboard/admin/notifications',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.068A8.962 8.962 0 0012 16a8.962 8.962 0 007.132 3.068M6.036 7.964A8.963 8.963 0 0012 4a8.963 8.963 0 005.964 3.964M8.5 8.5l7 7m0-7l-7 7" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      items: [
        {
          id: 'system-settings',
          title: 'إعدادات النظام',
          path: '/dashboard/admin/system-settings',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          )
        },
        {
          id: 'static-pages',
          title: 'الصفحات الثابتة',
          path: '/dashboard/admin/static-pages',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        }
      ]
    }
  ];

  // تصفية العناصر حسب البحث
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const filtered = [];
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.title.includes(searchQuery) || 
            group.title.includes(searchQuery)) {
          filtered.push({
            ...item,
            groupTitle: group.title,
            groupIcon: group.icon
          });
        }
      });
    });
    
    setFilteredItems(filtered);
  }, [searchQuery]);

  // التحكم في طي وفتح المجموعات
  const toggleGroup = (groupId) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  // تحديد العنصر النشط
  const isActiveItem = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // مكون عنصر القائمة
  const MenuItem = ({ item, isActive, showBadge = true }) => (
    <Link
      to={item.path}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-primary-100 text-primary-700 shadow-sm' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <span className={`
        flex-shrink-0 transition-colors duration-200
        ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'}
      `}>
        {item.icon}
      </span>
      <span className="font-medium text-sm">{item.title}</span>
      {showBadge && item.badge > 0 && (
        <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* خلفية التراكب للموبايل */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* القائمة الجانبية */}
      <div
        ref={sidebarRef}
        className={`
          fixed right-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out z-50
          w-80 lg:w-72
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* رأس القائمة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ج.س</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm">
                لوحة التحكم
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                مدير النظام
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* مربع البحث */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في القائمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <svg 
              className="absolute right-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* محتوى القائمة */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery.trim() ? (
            // عرض نتائج البحث
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                نتائج البحث ({filteredItems.length})
              </h3>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div key={item.id}>
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                      {item.groupIcon}
                      {item.groupTitle}
                    </div>
                    <MenuItem 
                      item={item} 
                      isActive={isActiveItem(item.path)}
                      showBadge={true}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm">لا توجد نتائج</p>
                </div>
              )}
            </div>
          ) : (
            // عرض القائمة العادية
            <nav className="space-y-1">
              {menuGroups.map(group => (
                <div key={group.id} className="pb-3">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      {group.icon}
                      <span>{group.title}</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        collapsedGroups.has(group.id) ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`mt-2 space-y-1 transition-all duration-200 overflow-hidden ${
                    collapsedGroups.has(group.id) ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                  }`}>
                    {group.items.map(item => (
                      <MenuItem 
                        key={item.id}
                        item={item} 
                        isActive={isActiveItem(item.path)}
                        showBadge={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* تذييل القائمة */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
};

SmartSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  notifications: PropTypes.object,
  onLogout: PropTypes.func.isRequired
};

export default SmartSidebar;