/**
 * Notification Context
 * سياق الإشعارات
 * 
 * Provides notification state management and functionality across the application
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import notificationService, { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES, NOTIFICATION_CATEGORIES } from '../services/notificationService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

// Notification Context
const NotificationContext = createContext();

// Notification Actions
const NOTIFICATION_ACTIONS = {
  SET_INITIALIZATION_STATUS: 'SET_INITIALIZATION_STATUS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  SET_PUSH_PERMISSION: 'SET_PUSH_PERMISSION',
  SET_PUSH_SUBSCRIPTION: 'SET_PUSH_SUBSCRIPTION',
  SET_STATISTICS: 'SET_STATISTICS',
  SET_SCHEDULED_NOTIFICATIONS: 'SET_SCHEDULED_NOTIFICATIONS',
  ADD_SCHEDULED_NOTIFICATION: 'ADD_SCHEDULED_NOTIFICATION',
  REMOVE_SCHEDULED_NOTIFICATION: 'REMOVE_SCHEDULED_NOTIFICATION',
  SET_TEMPLATES: 'SET_TEMPLATES',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  // Initialization
  isInitialized: false,
  isLoading: false,
  error: null,
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // User preferences
  userPreferences: {
    enabledTypes: Object.values(NOTIFICATION_TYPES),
    enabledCategories: Object.values(NOTIFICATION_CATEGORIES),
    quietHours: null,
    language: 'ar',
    timezone: 'Asia/Riyadh'
  },
  
  // Push notifications
  pushPermission: 'default',
  pushSubscription: null,
  
  // Scheduled notifications
  scheduledNotifications: [],
  
  // Templates
  templates: [],
  
  // Statistics
  statistics: {
    total: 0,
    successful: 0,
    failed: 0,
    byType: {},
    byCategory: {}
  },
  
  // Service status
  serviceStatus: {
    isInitialized: false,
    providersCount: 0,
    featuresEnabled: {}
  }
};

// Reducer function
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_INITIALIZATION_STATUS:
      return {
        ...state,
        isInitialized: action.payload.isInitialized,
        serviceStatus: action.payload.serviceStatus || state.serviceStatus
      };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      };

    case NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.SET_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_PUSH_PERMISSION:
      return {
        ...state,
        pushPermission: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_PUSH_SUBSCRIPTION:
      return {
        ...state,
        pushSubscription: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_STATISTICS:
      return {
        ...state,
        statistics: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_SCHEDULED_NOTIFICATIONS:
      return {
        ...state,
        scheduledNotifications: action.payload
      };

    case NOTIFICATION_ACTIONS.ADD_SCHEDULED_NOTIFICATION:
      return {
        ...state,
        scheduledNotifications: [...state.scheduledNotifications, action.payload]
      };

    case NOTIFICATION_ACTIONS.REMOVE_SCHEDULED_NOTIFICATION:
      return {
        ...state,
        scheduledNotifications: state.scheduledNotifications.filter(n => n.scheduleId !== action.payload)
      };

    case NOTIFICATION_ACTIONS.SET_TEMPLATES:
      return {
        ...state,
        templates: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

/**
 * Notification Provider Component
 * مكون موفر سياق الإشعارات
 */
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Initialize service
  useEffect(() => {
    initializeService();
  }, []);

  // Update statistics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateStatistics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize notification service
   * تهيئة خدمة الإشعارات
   */
  const initializeService = async () => {
    try {
      if (!getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM')) {
        logInfo('Notification system is disabled');
        return;
      }

      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

      // Initialize notification service
      await notificationService.initialize();

      // Get service status
      const serviceStatus = notificationService.getServiceStatus();
      
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_INITIALIZATION_STATUS,
        payload: {
          isInitialized: true,
          serviceStatus
        }
      });

      // Load initial data
      await loadInitialData();

      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
      logInfo('Notification context initialized');

    } catch (error) {
      logError('Failed to initialize notification context', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: 'فشل في تهيئة نظام الإشعارات'
      });
    }
  };

  /**
   * Load initial data
   * تحميل البيانات الأولية
   */
  const loadInitialData = async () => {
    try {
      // Load user preferences
      const preferences = notificationService.getUserPreferences('current_user');
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_USER_PREFERENCES,
        payload: preferences
      });

      // Update statistics
      updateStatistics();

    } catch (error) {
      logError('Failed to load initial notification data', error);
    }
  };

  /**
   * Update statistics
   * تحديث الإحصائيات
   */
  const updateStatistics = useCallback(() => {
    try {
      const statistics = notificationService.getStatistics();
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_STATISTICS,
        payload: statistics
      });
    } catch (error) {
      logError('Failed to update notification statistics', error);
    }
  }, []);

  /**
   * Send notification
   * إرسال إشعار
   */
  const sendNotification = useCallback(async (notification) => {
    try {
      const result = await notificationService.sendNotification(notification);
      
      if (result.success) {
        // Add to local notifications if it's an in-app notification
        if (notification.types?.includes(NOTIFICATION_TYPES.IN_APP)) {
          dispatch({
            type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
            payload: {
              ...notification,
              id: result.notificationId || notification.id,
              read: false,
              receivedAt: Date.now()
            }
          });
        }
        
        updateStatistics();
      }

      return result;

    } catch (error) {
      logError('Failed to send notification', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Send email notification
   * إرسال إشعار بريد إلكتروني
   */
  const sendEmail = useCallback(async (recipient, subject, message, options = {}) => {
    return await notificationService.sendEmail(recipient, subject, message, options);
  }, []);

  /**
   * Send SMS notification
   * إرسال إشعار رسالة نصية
   */
  const sendSMS = useCallback(async (recipient, message, options = {}) => {
    return await notificationService.sendSMS(recipient, message, options);
  }, []);

  /**
   * Send push notification
   * إرسال إشعار منبثق
   */
  const sendPush = useCallback(async (recipient, title, message, options = {}) => {
    return await notificationService.sendPush(recipient, title, message, options);
  }, []);

  /**
   * Send in-app notification
   * إرسال إشعار داخل التطبيق
   */
  const sendInApp = useCallback(async (recipient, title, message, options = {}) => {
    const result = await notificationService.sendInApp(recipient, title, message, options);
    
    if (result.success) {
      dispatch({
        type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
        payload: {
          id: result.notificationId,
          title,
          message,
          recipient,
          read: false,
          receivedAt: Date.now(),
          ...options
        }
      });
    }

    return result;
  }, []);

  /**
   * Send multi-channel notification
   * إرسال إشعار متعدد القنوات
   */
  const sendMultiChannel = useCallback(async (recipient, title, message, channels = [], options = {}) => {
    return await notificationService.sendMultiChannel(recipient, title, message, channels, options);
  }, []);

  /**
   * Schedule notification
   * جدولة إشعار
   */
  const scheduleNotification = useCallback(async (notification, scheduledAt) => {
    try {
      const result = await notificationService.scheduleNotification({
        ...notification,
        scheduledAt
      });

      if (result.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.ADD_SCHEDULED_NOTIFICATION,
          payload: {
            ...notification,
            scheduleId: result.scheduleId,
            scheduledAt,
            createdAt: Date.now()
          }
        });
      }

      return result;

    } catch (error) {
      logError('Failed to schedule notification', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Cancel scheduled notification
   * إلغاء إشعار مجدول
   */
  const cancelScheduledNotification = useCallback(async (scheduleId) => {
    try {
      const result = await notificationService.cancelScheduledNotification(scheduleId);

      if (result.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.REMOVE_SCHEDULED_NOTIFICATION,
          payload: scheduleId
        });
      }

      return result;

    } catch (error) {
      logError('Failed to cancel scheduled notification', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Set user preferences
   * تعيين تفضيلات المستخدم
   */
  const setUserPreferences = useCallback(async (preferences) => {
    try {
      const result = await notificationService.setUserPreferences('current_user', preferences);

      if (result.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_USER_PREFERENCES,
          payload: preferences
        });
      }

      return result;

    } catch (error) {
      logError('Failed to set user preferences', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Request push permission
   * طلب إذن الإشعارات المنبثقة
   */
  const requestPushPermission = useCallback(async () => {
    try {
      const result = await notificationService.requestPushPermission();
      
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_PUSH_PERMISSION,
        payload: result.permission || 'denied'
      });

      return result;

    } catch (error) {
      logError('Failed to request push permission', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Subscribe to push notifications
   * الاشتراك في الإشعارات المنبثقة
   */
  const subscribeToPush = useCallback(async () => {
    try {
      const result = await notificationService.subscribeToPush('current_user');
      
      if (result.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_PUSH_SUBSCRIPTION,
          payload: result.subscription
        });
      }

      return result;

    } catch (error) {
      logError('Failed to subscribe to push notifications', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Mark notification as read
   * تمييز الإشعار كمقروء
   */
  const markAsRead = useCallback((notificationId) => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true, readAt: Date.now() }
        : notification
    );

    dispatch({
      type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
      payload: updatedNotifications
    });
  }, [state.notifications]);

  /**
   * Mark all notifications as read
   * تمييز جميع الإشعارات كمقروءة
   */
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      read: true,
      readAt: Date.now()
    }));

    dispatch({
      type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
      payload: updatedNotifications
    });
  }, [state.notifications]);

  /**
   * Remove notification
   * إزالة إشعار
   */
  const removeNotification = useCallback((notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: notificationId
    });
  }, []);

  /**
   * Clear all notifications
   * مسح جميع الإشعارات
   */
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Notification actions
    sendNotification,
    sendEmail,
    sendSMS,
    sendPush,
    sendInApp,
    sendMultiChannel,
    
    // Scheduling actions
    scheduleNotification,
    cancelScheduledNotification,
    
    // Preference actions
    setUserPreferences,
    
    // Push notification actions
    requestPushPermission,
    subscribeToPush,
    
    // Management actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Utility actions
    clearError,
    updateStatistics,
    
    // Service info
    isServiceAvailable: getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM'),
    serviceStatus: state.serviceStatus,
    
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_CATEGORIES
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification context
 * خطاف لاستخدام سياق الإشعارات
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

/**
 * Hook for email notifications
 * خطاف لإشعارات البريد الإلكتروني
 */
export const useEmailNotifications = () => {
  const { sendEmail, statistics } = useNotifications();
  
  return {
    sendEmail,
    emailStats: statistics.providers?.email || {}
  };
};

/**
 * Hook for SMS notifications
 * خطاف لإشعارات الرسائل النصية
 */
export const useSMSNotifications = () => {
  const { sendSMS, statistics } = useNotifications();
  
  return {
    sendSMS,
    smsStats: statistics.providers?.sms || {}
  };
};

/**
 * Hook for push notifications
 * خطاف للإشعارات المنبثقة
 */
export const usePushNotifications = () => {
  const { 
    sendPush, 
    requestPushPermission, 
    subscribeToPush, 
    pushPermission, 
    pushSubscription,
    statistics 
  } = useNotifications();
  
  return {
    sendPush,
    requestPushPermission,
    subscribeToPush,
    pushPermission,
    pushSubscription,
    pushStats: statistics.providers?.push || {}
  };
};

// Export default for better compatibility
export default NotificationProvider;
