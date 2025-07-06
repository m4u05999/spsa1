/**
 * Enhanced Real-time Context for Phase 3
 * سياق الميزات الفورية المحسنة للمرحلة 3
 * 
 * Provides enhanced real-time state management including:
 * - Live content synchronization state
 * - User activity tracking state
 * - Performance metrics
 * - PDPL-compliant data handling
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getFeatureFlag } from '../config/featureFlags';
import { enhancedRealtimeService, ENHANCED_REALTIME_EVENTS, CONTENT_SYNC_STRATEGIES, ACTIVITY_TRACKING_LEVELS } from '../services/realtime/enhancedRealtimeService';
import { useErrorMessages } from '../hooks/useErrorMessages';
import { logInfo, logError } from '../utils/monitoring';

// Enhanced real-time context
const EnhancedRealtimeContext = createContext(null);

// Action types for enhanced real-time state
export const ENHANCED_REALTIME_ACTIONS = {
  // Service state actions
  SET_INITIALIZED: 'SET_INITIALIZED',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Content sync actions
  SET_CONTENT_SYNC_STRATEGY: 'SET_CONTENT_SYNC_STRATEGY',
  ADD_CONTENT_SYNC: 'ADD_CONTENT_SYNC',
  UPDATE_CONTENT_SYNC: 'UPDATE_CONTENT_SYNC',
  REMOVE_CONTENT_SYNC: 'REMOVE_CONTENT_SYNC',
  SET_SYNC_STATUS: 'SET_SYNC_STATUS',
  
  // User activity actions
  SET_ACTIVITY_TRACKING_LEVEL: 'SET_ACTIVITY_TRACKING_LEVEL',
  ADD_USER_ACTIVITY: 'ADD_USER_ACTIVITY',
  UPDATE_ACTIVE_USERS: 'UPDATE_ACTIVE_USERS',
  SET_USER_STATUS: 'SET_USER_STATUS',
  
  // Performance actions
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
  ADD_SYNC_LATENCY: 'ADD_SYNC_LATENCY',
  INCREMENT_MESSAGE_COUNT: 'INCREMENT_MESSAGE_COUNT',
  INCREMENT_ERROR_COUNT: 'INCREMENT_ERROR_COUNT',
  
  // Live notifications actions
  ADD_LIVE_NOTIFICATION: 'ADD_LIVE_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  REMOVE_LIVE_NOTIFICATION: 'REMOVE_LIVE_NOTIFICATION',
  CLEAR_LIVE_NOTIFICATIONS: 'CLEAR_LIVE_NOTIFICATIONS'
};

// Initial state for enhanced real-time context
const initialState = {
  // Service state
  isInitialized: false,
  isConnected: false,
  error: null,
  
  // Content synchronization state
  contentSyncStrategy: CONTENT_SYNC_STRATEGIES.IMMEDIATE,
  contentSyncs: new Map(),
  syncStatus: {
    lastSync: null,
    pendingSync: false,
    syncQueue: 0,
    failedSyncs: 0
  },
  
  // User activity state
  activityTrackingLevel: ACTIVITY_TRACKING_LEVELS.STANDARD,
  activeUsers: new Map(),
  userActivities: [],
  currentUserStatus: 'active',
  
  // Performance metrics
  performanceMetrics: {
    syncLatency: [],
    messageCount: 0,
    errorCount: 0,
    avgLatency: 0,
    uptime: 0
  },
  
  // Live notifications
  liveNotifications: [],
  unreadNotificationCount: 0,
  
  // Feature flags
  features: {
    contentSync: false,
    activityTracking: false,
    liveNotifications: false,
    performanceMonitoring: false
  }
};

// Enhanced real-time reducer
function enhancedRealtimeReducer(state, action) {
  switch (action.type) {
    case ENHANCED_REALTIME_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: action.payload,
        error: action.payload ? null : state.error
      };

    case ENHANCED_REALTIME_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload,
        error: action.payload ? null : state.error
      };

    case ENHANCED_REALTIME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isConnected: false
      };

    case ENHANCED_REALTIME_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ENHANCED_REALTIME_ACTIONS.SET_CONTENT_SYNC_STRATEGY:
      return {
        ...state,
        contentSyncStrategy: action.payload
      };

    case ENHANCED_REALTIME_ACTIONS.ADD_CONTENT_SYNC:
      const newContentSyncs = new Map(state.contentSyncs);
      newContentSyncs.set(action.payload.id, action.payload);
      return {
        ...state,
        contentSyncs: newContentSyncs
      };

    case ENHANCED_REALTIME_ACTIONS.UPDATE_CONTENT_SYNC:
      const updatedContentSyncs = new Map(state.contentSyncs);
      const existingSync = updatedContentSyncs.get(action.payload.id);
      if (existingSync) {
        updatedContentSyncs.set(action.payload.id, { ...existingSync, ...action.payload });
      }
      return {
        ...state,
        contentSyncs: updatedContentSyncs
      };

    case ENHANCED_REALTIME_ACTIONS.REMOVE_CONTENT_SYNC:
      const filteredContentSyncs = new Map(state.contentSyncs);
      filteredContentSyncs.delete(action.payload);
      return {
        ...state,
        contentSyncs: filteredContentSyncs
      };

    case ENHANCED_REALTIME_ACTIONS.SET_SYNC_STATUS:
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          ...action.payload
        }
      };

    case ENHANCED_REALTIME_ACTIONS.SET_ACTIVITY_TRACKING_LEVEL:
      return {
        ...state,
        activityTrackingLevel: action.payload
      };

    case ENHANCED_REALTIME_ACTIONS.ADD_USER_ACTIVITY:
      return {
        ...state,
        userActivities: [action.payload, ...state.userActivities].slice(0, 100) // Keep last 100 activities
      };

    case ENHANCED_REALTIME_ACTIONS.UPDATE_ACTIVE_USERS:
      return {
        ...state,
        activeUsers: new Map(action.payload)
      };

    case ENHANCED_REALTIME_ACTIONS.SET_USER_STATUS:
      return {
        ...state,
        currentUserStatus: action.payload
      };

    case ENHANCED_REALTIME_ACTIONS.UPDATE_PERFORMANCE_METRICS:
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          ...action.payload
        }
      };

    case ENHANCED_REALTIME_ACTIONS.ADD_SYNC_LATENCY:
      const newLatencies = [...state.performanceMetrics.syncLatency, action.payload].slice(-100);
      const avgLatency = newLatencies.reduce((a, b) => a + b, 0) / newLatencies.length;
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          syncLatency: newLatencies,
          avgLatency: Math.round(avgLatency)
        }
      };

    case ENHANCED_REALTIME_ACTIONS.INCREMENT_MESSAGE_COUNT:
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          messageCount: state.performanceMetrics.messageCount + 1
        }
      };

    case ENHANCED_REALTIME_ACTIONS.INCREMENT_ERROR_COUNT:
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          errorCount: state.performanceMetrics.errorCount + 1
        }
      };

    case ENHANCED_REALTIME_ACTIONS.ADD_LIVE_NOTIFICATION:
      const newNotification = {
        ...action.payload,
        id: action.payload.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: action.payload.timestamp || Date.now(),
        read: false
      };
      return {
        ...state,
        liveNotifications: [newNotification, ...state.liveNotifications],
        unreadNotificationCount: state.unreadNotificationCount + 1
      };

    case ENHANCED_REALTIME_ACTIONS.MARK_NOTIFICATION_READ:
      const updatedNotifications = state.liveNotifications.map(notif =>
        notif.id === action.payload ? { ...notif, read: true } : notif
      );
      const wasUnread = state.liveNotifications.find(notif => notif.id === action.payload && !notif.read);
      return {
        ...state,
        liveNotifications: updatedNotifications,
        unreadNotificationCount: wasUnread ? state.unreadNotificationCount - 1 : state.unreadNotificationCount
      };

    case ENHANCED_REALTIME_ACTIONS.REMOVE_LIVE_NOTIFICATION:
      const filteredNotifications = state.liveNotifications.filter(notif => notif.id !== action.payload);
      const removedNotification = state.liveNotifications.find(notif => notif.id === action.payload);
      return {
        ...state,
        liveNotifications: filteredNotifications,
        unreadNotificationCount: removedNotification && !removedNotification.read 
          ? state.unreadNotificationCount - 1 
          : state.unreadNotificationCount
      };

    case ENHANCED_REALTIME_ACTIONS.CLEAR_LIVE_NOTIFICATIONS:
      return {
        ...state,
        liveNotifications: [],
        unreadNotificationCount: 0
      };

    default:
      return state;
  }
}

/**
 * Enhanced Real-time Provider Component
 * مكون موفر الميزات الفورية المحسنة
 */
export const EnhancedRealtimeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(enhancedRealtimeReducer, initialState);
  const { handleApiError } = useErrorMessages();
  const initializationRef = useRef(false);
  const performanceIntervalRef = useRef(null);

  /**
   * Initialize enhanced real-time service
   * تهيئة خدمة الميزات الفورية المحسنة
   */
  const initialize = useCallback(async () => {
    if (initializationRef.current) {
      return;
    }

    try {
      initializationRef.current = true;

      // Check if Phase 3 real-time features are enabled
      if (!getFeatureFlag('ENABLE_PHASE3_REALTIME')) {
        logInfo('Phase 3 real-time features disabled');
        return;
      }

      // Update feature flags
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.SET_INITIALIZED,
        payload: false
      });

      // Initialize enhanced real-time service
      const success = await enhancedRealtimeService.initialize();

      if (success) {
        dispatch({
          type: ENHANCED_REALTIME_ACTIONS.SET_INITIALIZED,
          payload: true
        });

        dispatch({
          type: ENHANCED_REALTIME_ACTIONS.SET_CONNECTED,
          payload: true
        });

        // Set up event listeners
        setupEventListeners();

        // Start performance monitoring
        startPerformanceMonitoring();

        logInfo('Enhanced real-time context initialized successfully');
      } else {
        throw new Error('Failed to initialize enhanced real-time service');
      }

    } catch (error) {
      logError('Failed to initialize enhanced real-time context', error);
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.SET_ERROR,
        payload: handleApiError(error)
      });
    }
  }, [handleApiError]);

  /**
   * Set up event listeners for enhanced real-time events
   * إعداد مستمعي الأحداث للميزات الفورية المحسنة
   */
  const setupEventListeners = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Content sync events
    window.addEventListener('contentSyncUpdate', (event) => {
      const { eventType, data } = event.detail;
      handleContentSyncUpdate(eventType, data);
    });

    // User activity events
    window.addEventListener('userActivityUpdate', (event) => {
      const { eventType, data } = event.detail;
      handleUserActivityUpdate(eventType, data);
    });

    // Admin events
    window.addEventListener('adminRealtimeUpdate', (event) => {
      const { eventType, data } = event.detail;
      handleAdminUpdate(eventType, data);
    });

  }, []);

  /**
   * Handle content sync update
   * التعامل مع تحديث تزامن المحتوى
   */
  const handleContentSyncUpdate = useCallback((eventType, data) => {
    try {
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.ADD_CONTENT_SYNC,
        payload: {
          id: data.id || `sync_${Date.now()}`,
          eventType,
          data,
          timestamp: Date.now(),
          status: 'completed'
        }
      });

      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.SET_SYNC_STATUS,
        payload: {
          lastSync: Date.now(),
          pendingSync: false
        }
      });

    } catch (error) {
      logError('Failed to handle content sync update', error);
    }
  }, []);

  /**
   * Handle user activity update
   * التعامل مع تحديث نشاط المستخدم
   */
  const handleUserActivityUpdate = useCallback((eventType, data) => {
    try {
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.ADD_USER_ACTIVITY,
        payload: {
          eventType,
          data,
          timestamp: Date.now()
        }
      });

      // Update active users if needed
      if (data.userId) {
        const serviceStatus = enhancedRealtimeService.getServiceStatus();
        dispatch({
          type: ENHANCED_REALTIME_ACTIONS.UPDATE_ACTIVE_USERS,
          payload: serviceStatus.activeUsers
        });
      }

    } catch (error) {
      logError('Failed to handle user activity update', error);
    }
  }, []);

  /**
   * Handle admin update
   * التعامل مع تحديث الإدارة
   */
  const handleAdminUpdate = useCallback((eventType, data) => {
    try {
      // Convert admin updates to live notifications
      if (eventType === ENHANCED_REALTIME_EVENTS.ADMIN_NOTIFICATION) {
        dispatch({
          type: ENHANCED_REALTIME_ACTIONS.ADD_LIVE_NOTIFICATION,
          payload: {
            ...data,
            type: 'admin',
            priority: 'high'
          }
        });
      }

    } catch (error) {
      logError('Failed to handle admin update', error);
    }
  }, []);

  /**
   * Start performance monitoring
   * بدء مراقبة الأداء
   */
  const startPerformanceMonitoring = useCallback(() => {
    if (performanceIntervalRef.current) {
      clearInterval(performanceIntervalRef.current);
    }

    performanceIntervalRef.current = setInterval(() => {
      const serviceStatus = enhancedRealtimeService.getServiceStatus();
      
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.UPDATE_PERFORMANCE_METRICS,
        payload: {
          ...serviceStatus.performanceMetrics,
          uptime: Date.now() - (state.performanceMetrics.startTime || Date.now())
        }
      });

    }, 10000); // Update every 10 seconds
  }, [state.performanceMetrics.startTime]);

  // Initialize on mount
  useEffect(() => {
    initialize();

    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current);
      }
    };
  }, [initialize]);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Service actions
    initialize,
    
    // Content sync actions
    syncContent: enhancedRealtimeService.syncContentChange.bind(enhancedRealtimeService),
    setContentSyncStrategy: (strategy) => {
      enhancedRealtimeService.contentSyncStrategy = strategy;
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.SET_CONTENT_SYNC_STRATEGY,
        payload: strategy
      });
    },
    
    // User activity actions
    trackActivity: enhancedRealtimeService.trackUserActivity.bind(enhancedRealtimeService),
    setActivityTrackingLevel: (level) => {
      enhancedRealtimeService.activityTrackingLevel = level;
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.SET_ACTIVITY_TRACKING_LEVEL,
        payload: level
      });
    },
    
    // Live notification actions
    broadcastNotification: enhancedRealtimeService.broadcastLiveNotification.bind(enhancedRealtimeService),
    markNotificationAsRead: (notificationId) => {
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.MARK_NOTIFICATION_READ,
        payload: notificationId
      });
    },
    removeNotification: (notificationId) => {
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.REMOVE_LIVE_NOTIFICATION,
        payload: notificationId
      });
    },
    clearAllNotifications: () => {
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.CLEAR_LIVE_NOTIFICATIONS
      });
    },
    
    // Utility actions
    clearError: () => {
      dispatch({
        type: ENHANCED_REALTIME_ACTIONS.CLEAR_ERROR
      });
    },
    
    // Service status
    getServiceStatus: enhancedRealtimeService.getServiceStatus.bind(enhancedRealtimeService)
  };

  return (
    <EnhancedRealtimeContext.Provider value={contextValue}>
      {children}
    </EnhancedRealtimeContext.Provider>
  );
};

/**
 * Hook to use enhanced real-time context
 * خطاف لاستخدام سياق الميزات الفورية المحسنة
 */
export const useEnhancedRealtime = () => {
  const context = useContext(EnhancedRealtimeContext);
  
  if (!context) {
    throw new Error('useEnhancedRealtime must be used within an EnhancedRealtimeProvider');
  }
  
  return context;
};

export default EnhancedRealtimeContext;
