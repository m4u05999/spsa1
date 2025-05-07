// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// إنشاء سياق الإشعارات
const NotificationContext = createContext();

// نوع الإشعار
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const NotificationProvider = ({ children }) => {
  // حالة الإشعارات
  const [notifications, setNotifications] = useState([]);
  
  // إضافة إشعار جديد
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // إضافة الإشعار الجديد إلى القائمة
    setNotifications((prev) => [
      ...prev, 
      { id, message, type, timeout }
    ]);
    
    // إزالة الإشعار تلقائيًا بعد انتهاء المهلة
    if (timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);
  
  // إزالة إشعار من القائمة
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter(notification => notification.id !== id));
  }, []);
  
  // وظائف مساعدة للإشعارات حسب النوع
  const success = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, timeout);
  }, [addNotification]);
  
  const error = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, timeout);
  }, [addNotification]);
  
  const warning = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, timeout);
  }, [addNotification]);
  
  const info = useCallback((message, timeout) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, timeout);
  }, [addNotification]);
  
  // تنظيف الإشعارات عند تفكيك المكون
  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);
  
  // القيمة التي سيتم مشاركتها مع باقي التطبيق
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook لاستخدام سياق الإشعارات
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;