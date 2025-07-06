/**
 * Real-time Context
 * سياق الميزات المباشرة
 * 
 * Provides real-time state management and functionality across the application
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import realtimeService from '../services/realtimeService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';
import { recordComponentMount } from '../utils/developmentPerformanceMonitor.js';
import { ENV } from '../config/environment.js';

// Real-time Context
const RealtimeContext = createContext();

// Real-time Actions
const REALTIME_ACTIONS = {
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_ACTIVITY_FEED: 'SET_ACTIVITY_FEED',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  CLEAR_ACTIVITY_FEED: 'CLEAR_ACTIVITY_FEED',
  SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  REMOVE_SUBSCRIPTION: 'REMOVE_SUBSCRIPTION',
  SET_LIVE_UPDATES: 'SET_LIVE_UPDATES',
  ADD_LIVE_UPDATE: 'ADD_LIVE_UPDATE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  // Connection state
  isConnected: false,
  isConnecting: false,
  connectionId: null,
  lastActivity: null,
  
  // Notifications
  notifications: [],
  unreadNotifications: 0,
  
  // Activity feed
  activityFeed: [],
  activityFilters: {
    type: '',
    userId: '',
    since: null
  },
  
  // Subscriptions
  subscriptions: new Map(),
  
  // Live updates
  liveUpdates: [],
  updateTypes: new Set(),
  
  // UI state
  loading: false,
  error: null,
  
  // Settings
  settings: {
    enableNotifications: true,
    enableActivityFeed: true,
    enableLiveUpdates: true,
    notificationSound: true,
    maxNotifications: 50,
    maxActivityItems: 100
  }
};

// Reducer function
function realtimeReducer(state, action) {
  switch (action.type) {
    case REALTIME_ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload.isConnected,
        isConnecting: action.payload.isConnecting,
        connectionId: action.payload.connectionId,
        lastActivity: action.payload.lastActivity
      };

    case REALTIME_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadNotifications: action.payload.filter(n => !n.read).length
      };

    case REALTIME_ACTIONS.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      const limitedNotifications = newNotifications.slice(0, state.settings.maxNotifications);
      
      return {
        ...state,
        notifications: limitedNotifications,
        unreadNotifications: limitedNotifications.filter(n => !n.read).length
      };

    case REALTIME_ACTIONS.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      
      return {
        ...state,
        notifications: filteredNotifications,
        unreadNotifications: filteredNotifications.filter(n => !n.read).length
      };

    case REALTIME_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadNotifications: 0
      };

    case REALTIME_ACTIONS.SET_ACTIVITY_FEED:
      return {
        ...state,
        activityFeed: action.payload
      };

    case REALTIME_ACTIONS.ADD_ACTIVITY:
      const newActivity = [action.payload, ...state.activityFeed];
      const limitedActivity = newActivity.slice(0, state.settings.maxActivityItems);
      
      return {
        ...state,
        activityFeed: limitedActivity
      };

    case REALTIME_ACTIONS.CLEAR_ACTIVITY_FEED:
      return {
        ...state,
        activityFeed: []
      };

    case REALTIME_ACTIONS.SET_SUBSCRIPTIONS:
      return {
        ...state,
        subscriptions: action.payload
      };

    case REALTIME_ACTIONS.ADD_SUBSCRIPTION:
      const newSubscriptions = new Map(state.subscriptions);
      newSubscriptions.set(action.payload.id, action.payload);
      
      return {
        ...state,
        subscriptions: newSubscriptions
      };

    case REALTIME_ACTIONS.REMOVE_SUBSCRIPTION:
      const updatedSubscriptions = new Map(state.subscriptions);
      updatedSubscriptions.delete(action.payload);
      
      return {
        ...state,
        subscriptions: updatedSubscriptions
      };

    case REALTIME_ACTIONS.SET_LIVE_UPDATES:
      return {
        ...state,
        liveUpdates: action.payload,
        updateTypes: new Set(action.payload.map(u => u.type))
      };

    case REALTIME_ACTIONS.ADD_LIVE_UPDATE:
      const newUpdates = [action.payload, ...state.liveUpdates];
      const limitedUpdates = newUpdates.slice(0, 50); // Keep last 50 updates
      
      return {
        ...state,
        liveUpdates: limitedUpdates,
        updateTypes: new Set(limitedUpdates.map(u => u.type))
      };

    case REALTIME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case REALTIME_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case REALTIME_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
}

/**
 * Real-time Provider Component
 * مكون موفر سياق الميزات المباشرة
 */
export const RealtimeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(realtimeReducer, initialState);
  const mountStartTime = performance.now();

  // Initialize service (deferred to avoid blocking UI)
  useEffect(() => {
    // Defer initialization to next tick to avoid blocking UI
    const timeoutId = setTimeout(() => {
      initializeService();
    }, 100); // Small delay to allow UI to render first

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, []);

  // Update connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const status = realtimeService.getServiceStatus();
      dispatch({
        type: REALTIME_ACTIONS.SET_CONNECTION_STATUS,
        payload: {
          isConnected: status.websocketStatus.isConnected,
          isConnecting: status.websocketStatus.isConnecting,
          connectionId: status.websocketStatus.connectionId,
          lastActivity: status.websocketStatus.lastActivity
        }
      });
    };

    const interval = setInterval(updateConnectionStatus, 5000); // Update every 5 seconds
    updateConnectionStatus(); // Initial update

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize real-time service (non-blocking)
   * تهيئة خدمة الميزات المباشرة (غير محجوبة)
   */
  const initializeService = async () => {
    try {
      if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
        logInfo('Real-time features are disabled');
        return;
      }

      dispatch({ type: REALTIME_ACTIONS.SET_LOADING, payload: true });

      // Initialize service in background with timeout
      const initPromise = Promise.race([
        realtimeService.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Real-time service timeout')), 3000)
        )
      ]);

      try {
        await initPromise;

        // Load initial activity feed in background
        loadActivityFeed().catch(error => {
          if (ENV.IS_DEVELOPMENT) {
            console.warn('Failed to load initial activity feed:', error.message);
          }
        });

        logInfo('Real-time context initialized');
      } catch (error) {
        // Continue without real-time features on timeout/failure
        if (ENV.IS_DEVELOPMENT) {
          console.warn('Real-time service initialization failed, continuing without real-time features:', error.message);
        }
      }

      dispatch({ type: REALTIME_ACTIONS.SET_LOADING, payload: false });

      // Record component mount performance
      const mountEndTime = performance.now();
      recordComponentMount('RealtimeProvider', mountStartTime, mountEndTime);

    } catch (error) {
      logError('Failed to initialize real-time context', error);
      dispatch({
        type: REALTIME_ACTIONS.SET_ERROR,
        payload: 'فشل في تهيئة الميزات المباشرة'
      });
      dispatch({ type: REALTIME_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Cleanup resources
   * تنظيف الموارد
   */
  const cleanup = () => {
    // Unsubscribe from all subscriptions
    state.subscriptions.forEach((subscription, id) => {
      realtimeService.unsubscribe(id);
    });

    // Disconnect from real-time service
    realtimeService.disconnect();
  };

  /**
   * Connect to real-time services
   * الاتصال بخدمات الميزات المباشرة
   */
  const connect = useCallback(async () => {
    try {
      dispatch({ type: REALTIME_ACTIONS.SET_LOADING, payload: true });
      await realtimeService.connect();
      dispatch({ type: REALTIME_ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      logError('Failed to connect to real-time services', error);
      dispatch({
        type: REALTIME_ACTIONS.SET_ERROR,
        payload: 'فشل في الاتصال بالخدمات المباشرة'
      });
    }
  }, []);

  /**
   * Disconnect from real-time services
   * قطع الاتصال من خدمات الميزات المباشرة
   */
  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, []);

  /**
   * Subscribe to real-time channel
   * الاشتراك في قناة مباشرة
   */
  const subscribe = useCallback((channel, callback, options = {}) => {
    try {
      const subscriptionId = realtimeService.subscribe(channel, (data) => {
        // Handle different types of real-time data
        if (channel === 'notifications') {
          handleNotification(data);
        } else if (channel === 'updates') {
          handleLiveUpdate(data);
        } else if (channel === 'activity') {
          handleActivity(data);
        }
        
        // Call user callback
        callback(data);
      }, options);

      // Add to local subscriptions
      dispatch({
        type: REALTIME_ACTIONS.ADD_SUBSCRIPTION,
        payload: {
          id: subscriptionId,
          channel,
          options,
          createdAt: Date.now()
        }
      });

      return subscriptionId;

    } catch (error) {
      logError(`Failed to subscribe to channel: ${channel}`, error);
      throw error;
    }
  }, []);

  /**
   * Unsubscribe from real-time channel
   * إلغاء الاشتراك في قناة مباشرة
   */
  const unsubscribe = useCallback((subscriptionId) => {
    try {
      const success = realtimeService.unsubscribe(subscriptionId);
      
      if (success) {
        dispatch({
          type: REALTIME_ACTIONS.REMOVE_SUBSCRIPTION,
          payload: subscriptionId
        });
      }

      return success;

    } catch (error) {
      logError(`Failed to unsubscribe: ${subscriptionId}`, error);
      return false;
    }
  }, []);

  /**
   * Send notification
   * إرسال إشعار
   */
  const sendNotification = useCallback(async (notification) => {
    try {
      const success = await realtimeService.sendNotification(notification);
      
      if (success) {
        // Add to local notifications if it's for current user
        handleNotification(notification);
      }

      return success;

    } catch (error) {
      logError('Failed to send notification', error);
      return false;
    }
  }, []);

  /**
   * Broadcast update
   * بث تحديث
   */
  const broadcastUpdate = useCallback(async (updateType, data) => {
    try {
      return await realtimeService.broadcastUpdate(updateType, data);
    } catch (error) {
      logError('Failed to broadcast update', error);
      return false;
    }
  }, []);

  /**
   * Load activity feed
   * تحميل تدفق الأنشطة
   */
  const loadActivityFeed = useCallback(async (limit = 20, filters = {}) => {
    try {
      const feed = realtimeService.getActivityFeed(limit, filters);
      dispatch({
        type: REALTIME_ACTIONS.SET_ACTIVITY_FEED,
        payload: feed
      });
      return feed;
    } catch (error) {
      logError('Failed to load activity feed', error);
      return [];
    }
  }, []);

  /**
   * Clear activity feed
   * مسح تدفق الأنشطة
   */
  const clearActivityFeed = useCallback(() => {
    realtimeService.clearActivityFeed();
    dispatch({ type: REALTIME_ACTIONS.CLEAR_ACTIVITY_FEED });
  }, []);

  /**
   * Mark notification as read
   * تمييز الإشعار كمقروء
   */
  const markNotificationAsRead = useCallback((notificationId) => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true, readAt: Date.now() }
        : notification
    );

    dispatch({
      type: REALTIME_ACTIONS.SET_NOTIFICATIONS,
      payload: updatedNotifications
    });
  }, [state.notifications]);

  /**
   * Mark all notifications as read
   * تمييز جميع الإشعارات كمقروءة
   */
  const markAllNotificationsAsRead = useCallback(() => {
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      read: true,
      readAt: Date.now()
    }));

    dispatch({
      type: REALTIME_ACTIONS.SET_NOTIFICATIONS,
      payload: updatedNotifications
    });
  }, [state.notifications]);

  /**
   * Remove notification
   * إزالة إشعار
   */
  const removeNotification = useCallback((notificationId) => {
    dispatch({
      type: REALTIME_ACTIONS.REMOVE_NOTIFICATION,
      payload: notificationId
    });
  }, []);

  /**
   * Clear all notifications
   * مسح جميع الإشعارات
   */
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: REALTIME_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);

  /**
   * Handle incoming notification
   * التعامل مع الإشعار الوارد
   */
  const handleNotification = useCallback((notification) => {
    const enrichedNotification = {
      ...notification,
      read: false,
      receivedAt: Date.now()
    };

    dispatch({
      type: REALTIME_ACTIONS.ADD_NOTIFICATION,
      payload: enrichedNotification
    });

    // Play notification sound if enabled
    if (state.settings.notificationSound) {
      playNotificationSound();
    }

    // Show browser notification if permission granted
    showBrowserNotification(enrichedNotification);

  }, [state.settings.notificationSound]);

  /**
   * Handle incoming live update
   * التعامل مع التحديث المباشر الوارد
   */
  const handleLiveUpdate = useCallback((update) => {
    dispatch({
      type: REALTIME_ACTIONS.ADD_LIVE_UPDATE,
      payload: update
    });
  }, []);

  /**
   * Handle incoming activity
   * التعامل مع النشاط الوارد
   */
  const handleActivity = useCallback((activity) => {
    dispatch({
      type: REALTIME_ACTIONS.ADD_ACTIVITY,
      payload: activity
    });
  }, []);

  /**
   * Play notification sound
   * تشغيل صوت الإشعار
   */
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently handle audio errors
    }
  };

  /**
   * Show browser notification
   * عرض إشعار المتصفح
   */
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title || 'إشعار جديد', {
        body: notification.message || notification.content,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  /**
   * Request notification permission
   * طلب إذن الإشعارات
   */
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    dispatch({ type: REALTIME_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Connection actions
    connect,
    disconnect,
    
    // Subscription actions
    subscribe,
    unsubscribe,
    
    // Notification actions
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Update actions
    broadcastUpdate,
    
    // Activity feed actions
    loadActivityFeed,
    clearActivityFeed,
    
    // Utility actions
    requestNotificationPermission,
    clearError,
    
    // Service status
    isServiceAvailable: getFeatureFlag('ENABLE_REAL_TIME_FEATURES'),
    serviceStatus: realtimeService.getServiceStatus()
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

/**
 * Hook to use real-time context
 * خطاف لاستخدام سياق الميزات المباشرة
 */
export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  
  return context;
};

/**
 * Hook for notifications
 * خطاف للإشعارات
 */
export const useNotifications = () => {
  const { 
    notifications, 
    unreadNotifications, 
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications
  } = useRealtime();
  
  return {
    notifications,
    unreadNotifications,
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications
  };
};

/**
 * Hook for activity feed
 * خطاف لتدفق الأنشطة
 */
export const useActivityFeed = () => {
  const { 
    activityFeed, 
    loadActivityFeed, 
    clearActivityFeed 
  } = useRealtime();
  
  return {
    activityFeed,
    loadActivityFeed,
    clearActivityFeed
  };
};

/**
 * Hook for live updates
 * خطاف للتحديثات المباشرة
 */
export const useLiveUpdates = () => {
  const { 
    liveUpdates, 
    updateTypes, 
    broadcastUpdate, 
    subscribe, 
    unsubscribe 
  } = useRealtime();
  
  return {
    liveUpdates,
    updateTypes,
    broadcastUpdate,
    subscribe,
    unsubscribe
  };
};

// Export default for better compatibility
export default RealtimeProvider;
