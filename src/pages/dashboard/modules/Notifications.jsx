// src/pages/dashboard/modules/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions.js';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Check permissions
  const canManageNotifications = checkPermission(user, 'notifications', 'manage') || user?.role === 'admin';

  useEffect(() => {
    if (canManageNotifications) {
      loadNotifications();
    }
  }, [canManageNotifications]);

  useEffect(() => {
    applyFilter();
  }, [notifications, filter]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // محاكاة تحميل البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // بيانات تجريبية للإشعارات
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'info',
          title: 'عضو جديد انضم للجمعية',
          message: 'تم انضمام أحمد محمد إلى الجمعية كعضو جديد',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          read: false,
          priority: 'medium',
          category: 'membership'
        },
        {
          id: 'notif-2',
          type: 'alert',
          title: 'طلبات عضوية في انتظار المراجعة',
          message: 'يوجد 3 طلبات عضوية جديدة تحتاج للمراجعة والموافقة',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          priority: 'high',
          category: 'membership'
        },
        {
          id: 'notif-3',
          type: 'success',
          title: 'تم نشر المقال بنجاح',
          message: 'تم نشر مقال "تطوير العلوم السياسية في المملكة" بنجاح',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          read: true,
          priority: 'low',
          category: 'content'
        },
        {
          id: 'notif-4',
          type: 'warning',
          title: 'تذكير: فعالية قادمة',
          message: 'ستبدأ فعالية "مؤتمر العلوم السياسية السنوي" خلال يومين',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          read: true,
          priority: 'medium',
          category: 'events'
        },
        {
          id: 'notif-5',
          type: 'error',
          title: 'خطأ في النظام',
          message: 'تم حل مشكلة مؤقتة في نظام تحميل الملفات',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          priority: 'high',
          category: 'system'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('خطأ في تحميل الإشعارات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...notifications];
    
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'read':
        filtered = filtered.filter(n => n.read);
        break;
      case 'high':
        filtered = filtered.filter(n => n.priority === 'high');
        break;
      case 'membership':
        filtered = filtered.filter(n => n.category === 'membership');
        break;
      case 'content':
        filtered = filtered.filter(n => n.category === 'content');
        break;
      case 'events':
        filtered = filtered.filter(n => n.category === 'events');
        break;
      case 'system':
        filtered = filtered.filter(n => n.category === 'system');
        break;
      default:
        // 'all' - no filtering
        break;
    }
    
    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationIds) => {
    try {
      const updatedNotifications = notifications.map(notif => 
        notificationIds.includes(notif.id) ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      setSelectedNotifications([]);
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعارات:', error);
    }
  };

  const deleteNotifications = async (notificationIds) => {
    if (!window.confirm('هل أنت متأكد من حذف الإشعارات المحددة؟')) {
      return;
    }

    try {
      const updatedNotifications = notifications.filter(notif => 
        !notificationIds.includes(notif.id)
      );
      setNotifications(updatedNotifications);
      setSelectedNotifications([]);
    } catch (error) {
      console.error('خطأ في حذف الإشعارات:', error);
    }
  };

  const toggleSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "w-5 h-5";
    switch (type) {
      case 'info':
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <svg className={`${iconClasses} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'alert':
      case 'warning':
        return (
          <div className="rounded-full bg-yellow-100 p-2">
            <svg className={`${iconClasses} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="rounded-full bg-green-100 p-2">
            <svg className={`${iconClasses} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="rounded-full bg-red-100 p-2">
            <svg className={`${iconClasses} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return `منذ ${days} يوم`;
    }
  };

  if (!canManageNotifications) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">غير مصرح</h3>
          <p className="text-gray-600">ليس لديك صلاحية لإدارة الإشعارات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الإشعارات</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع إشعارات النظام</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={loadNotifications}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded text-sm ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            غير مقروءة ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1 rounded text-sm ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            مقروءة ({notifications.filter(n => n.read).length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded text-sm ${filter === 'high' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            أولوية عالية ({notifications.filter(n => n.priority === 'high').length})
          </button>
          <button
            onClick={() => setFilter('membership')}
            className={`px-3 py-1 rounded text-sm ${filter === 'membership' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            العضوية
          </button>
          <button
            onClick={() => setFilter('content')}
            className={`px-3 py-1 rounded text-sm ${filter === 'content' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            المحتوى
          </button>
          <button
            onClick={() => setFilter('events')}
            className={`px-3 py-1 rounded text-sm ${filter === 'events' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            الفعاليات
          </button>
          <button
            onClick={() => setFilter('system')}
            className={`px-3 py-1 rounded text-sm ${filter === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            النظام
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">تم تحديد {selectedNotifications.length} إشعار</span>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => markAsRead(selectedNotifications)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                تحديد كمقروء
              </button>
              <button
                onClick={() => deleteNotifications(selectedNotifications)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                حذف
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Controls */}
      {filteredNotifications.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            عرض {filteredNotifications.length} من {notifications.length} إشعار
          </span>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              تحديد الكل
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الإشعارات...</p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.068A8.962 8.962 0 0012 16a8.962 8.962 0 007.132 3.068M6.036 7.964A8.963 8.963 0 0012 4a8.963 8.963 0 005.964 3.964M8.5 8.5l7 7m0-7l-7 7" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-600">لا توجد إشعارات مطابقة للفلتر المحدد</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="mr-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className={`px-2 py-1 text-xs rounded ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.priority === 'high' ? 'عالية' :
                             notification.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <div className="mt-2 flex items-center space-x-4 space-x-reverse">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {notification.category === 'membership' ? 'العضوية' :
                           notification.category === 'content' ? 'المحتوى' :
                           notification.category === 'events' ? 'الفعاليات' :
                           notification.category === 'system' ? 'النظام' : notification.category}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead([notification.id])}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            تحديد كمقروء
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotifications([notification.id])}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Statistics */}
      {!isLoading && notifications.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
              <div className="text-sm text-gray-600">إجمالي الإشعارات</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => !n.read).length}
              </div>
              <div className="text-sm text-gray-600">غير مقروءة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">أولوية عالية</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.read).length}
              </div>
              <div className="text-sm text-gray-600">مقروءة</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;