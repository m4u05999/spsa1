/**
 * Unified App Context
 * سياق التطبيق الموحد
 * 
 * Combines multiple related contexts into a single provider to:
 * - Reduce provider nesting
 * - Improve performance
 * - Simplify state management
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ENV } from '../config/environment.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

// Unified Context
const UnifiedAppContext = createContext(null);

// Unified Actions
const UNIFIED_ACTIONS = {
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_NOTIFICATION_PREFERENCES: 'SET_NOTIFICATION_PREFERENCES',
  
  // Realtime actions
  SET_REALTIME_CONNECTION: 'SET_REALTIME_CONNECTION',
  SET_REALTIME_STATUS: 'SET_REALTIME_STATUS',
  ADD_REALTIME_ACTIVITY: 'ADD_REALTIME_ACTIVITY',
  CLEAR_REALTIME_ACTIVITIES: 'CLEAR_REALTIME_ACTIVITIES',
  
  // Content sync actions
  SET_CONTENT_SYNC_STATUS: 'SET_CONTENT_SYNC_STATUS',
  UPDATE_CONTENT_ITEM: 'UPDATE_CONTENT_ITEM',
  SYNC_CONTENT_BATCH: 'SYNC_CONTENT_BATCH',
  
  // Performance monitoring
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
  SET_ERROR_STATE: 'SET_ERROR_STATE',
  CLEAR_ERROR_STATE: 'CLEAR_ERROR_STATE'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  REALTIME: 'realtime'
};

// Initial state
const initialState = {
  // Notifications
  notifications: [],
  notificationPreferences: {
    enabled: true,
    sound: true,
    push: false,
    email: true
  },
  
  // Realtime
  realtime: {
    connected: false,
    status: 'disconnected',
    activities: [],
    subscriptions: []
  },
  
  // Content sync
  contentSync: {
    status: 'idle',
    lastSync: null,
    pendingChanges: 0,
    strategy: 'automatic'
  },
  
  // Performance
  performance: {
    renderCount: 0,
    averageRenderTime: 0,
    memoryUsage: 0
  },
  
  // Error handling
  error: null,
  errorHistory: []
};

// Unified reducer
const unifiedReducer = (state, action) => {
  switch (action.type) {
    // Notification actions
    case UNIFIED_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            ...action.payload
          }
        ]
      };
      
    case UNIFIED_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id)
      };
      
    case UNIFIED_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
      
    case UNIFIED_ACTIONS.SET_NOTIFICATION_PREFERENCES:
      return {
        ...state,
        notificationPreferences: {
          ...state.notificationPreferences,
          ...action.payload
        }
      };
      
    // Realtime actions
    case UNIFIED_ACTIONS.SET_REALTIME_CONNECTION:
      return {
        ...state,
        realtime: {
          ...state.realtime,
          connected: action.payload.connected,
          status: action.payload.connected ? 'connected' : 'disconnected'
        }
      };
      
    case UNIFIED_ACTIONS.ADD_REALTIME_ACTIVITY:
      return {
        ...state,
        realtime: {
          ...state.realtime,
          activities: [
            action.payload,
            ...state.realtime.activities.slice(0, 99) // Keep last 100 activities
          ]
        }
      };
      
    case UNIFIED_ACTIONS.CLEAR_REALTIME_ACTIVITIES:
      return {
        ...state,
        realtime: {
          ...state.realtime,
          activities: []
        }
      };
      
    // Content sync actions
    case UNIFIED_ACTIONS.SET_CONTENT_SYNC_STATUS:
      return {
        ...state,
        contentSync: {
          ...state.contentSync,
          status: action.payload.status,
          lastSync: action.payload.lastSync || state.contentSync.lastSync
        }
      };
      
    case UNIFIED_ACTIONS.UPDATE_CONTENT_ITEM:
      return {
        ...state,
        contentSync: {
          ...state.contentSync,
          pendingChanges: state.contentSync.pendingChanges + 1
        }
      };
      
    // Performance actions
    case UNIFIED_ACTIONS.UPDATE_PERFORMANCE_METRICS:
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.payload
        }
      };
      
    // Error handling
    case UNIFIED_ACTIONS.SET_ERROR_STATE:
      return {
        ...state,
        error: action.payload,
        errorHistory: [
          {
            ...action.payload,
            timestamp: new Date().toISOString()
          },
          ...state.errorHistory.slice(0, 9) // Keep last 10 errors
        ]
      };
      
    case UNIFIED_ACTIONS.CLEAR_ERROR_STATE:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

/**
 * Unified App Provider
 */
export const UnifiedAppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(unifiedReducer, initialState);
  
  // Notification methods
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
    dispatch({
      type: UNIFIED_ACTIONS.ADD_NOTIFICATION,
      payload: {
        message,
        type,
        duration: options.duration || 5000,
        persistent: options.persistent || false,
        action: options.action || null
      }
    });
    
    // Auto remove non-persistent notifications
    if (!options.persistent) {
      setTimeout(() => {
        dispatch({
          type: UNIFIED_ACTIONS.REMOVE_NOTIFICATION,
          payload: { id: Date.now() + Math.random() }
        });
      }, options.duration || 5000);
    }
  }, []);
  
  const removeNotification = useCallback((id) => {
    dispatch({
      type: UNIFIED_ACTIONS.REMOVE_NOTIFICATION,
      payload: { id }
    });
  }, []);
  
  const clearNotifications = useCallback(() => {
    dispatch({ type: UNIFIED_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);
  
  // Realtime methods
  const setRealtimeConnection = useCallback((connected) => {
    dispatch({
      type: UNIFIED_ACTIONS.SET_REALTIME_CONNECTION,
      payload: { connected }
    });
  }, []);
  
  const addRealtimeActivity = useCallback((activity) => {
    dispatch({
      type: UNIFIED_ACTIONS.ADD_REALTIME_ACTIVITY,
      payload: {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...activity
      }
    });
  }, []);
  
  // Content sync methods
  const updateContentSyncStatus = useCallback((status, lastSync = null) => {
    dispatch({
      type: UNIFIED_ACTIONS.SET_CONTENT_SYNC_STATUS,
      payload: { status, lastSync }
    });
  }, []);
  
  // Error handling methods
  const setError = useCallback((error) => {
    dispatch({
      type: UNIFIED_ACTIONS.SET_ERROR_STATE,
      payload: error
    });
    
    // Log error for monitoring
    logError('UnifiedAppContext', error);
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: UNIFIED_ACTIONS.CLEAR_ERROR_STATE });
  }, []);
  
  // Performance monitoring
  useEffect(() => {
    let renderCount = 0;
    let totalRenderTime = 0;
    
    const updatePerformance = () => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        renderCount++;
        totalRenderTime += renderTime;
        
        dispatch({
          type: UNIFIED_ACTIONS.UPDATE_PERFORMANCE_METRICS,
          payload: {
            renderCount,
            averageRenderTime: totalRenderTime / renderCount,
            memoryUsage: performance.memory?.usedJSHeapSize || 0
          }
        });
      };
    };
    
    const cleanup = updatePerformance();
    return cleanup;
  }, []);
  
  // Auto-clear old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiredNotifications = state.notifications.filter(
        notification => !notification.persistent && 
        (now - new Date(notification.timestamp).getTime()) > (notification.duration || 5000)
      );
      
      expiredNotifications.forEach(notification => {
        removeNotification(notification.id);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.notifications, removeNotification]);
  
  const contextValue = {
    // State
    ...state,
    
    // Notification methods
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Realtime methods
    setRealtimeConnection,
    addRealtimeActivity,
    
    // Content sync methods
    updateContentSyncStatus,
    
    // Error handling
    setError,
    clearError,
    
    // Utility methods
    isFeatureEnabled: (featureName) => getFeatureFlag(featureName),
    isDevelopment: ENV.NODE_ENV === 'development'
  };
  
  return (
    <UnifiedAppContext.Provider value={contextValue}>
      {children}
    </UnifiedAppContext.Provider>
  );
};

/**
 * Hook to use unified app context
 */
export const useUnifiedApp = () => {
  const context = useContext(UnifiedAppContext);
  
  if (!context) {
    throw new Error('useUnifiedApp must be used within UnifiedAppProvider');
  }
  
  return context;
};

// Export individual hooks for backward compatibility
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUnifiedApp();
  return { notifications, addNotification, removeNotification, clearNotifications };
};

export const useRealtime = () => {
  const { realtime, setRealtimeConnection, addRealtimeActivity } = useUnifiedApp();
  return { realtime, setRealtimeConnection, addRealtimeActivity };
};

export const useContentSync = () => {
  const { contentSync, updateContentSyncStatus } = useUnifiedApp();
  return { contentSync, updateContentSyncStatus };
};

export default UnifiedAppContext;