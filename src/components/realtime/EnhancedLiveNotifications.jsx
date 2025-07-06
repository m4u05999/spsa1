/**
 * Enhanced Live Notifications Component for Phase 3
 * مكون الإشعارات المباشرة المحسنة للمرحلة 3
 * 
 * Provides real-time notifications with enhanced features
 * including PDPL compliance and performance optimization
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useEnhancedRealtime } from '../../contexts/EnhancedRealtimeContext';
import { getFeatureFlag } from '../../config/featureFlags';
import { useErrorMessages } from '../../hooks/useErrorMessages';
import { OptimizedLoader } from '../common/OptimizedLoader';

/**
 * Enhanced Live Notifications Component
 * مكون الإشعارات المباشرة المحسنة
 */
const EnhancedLiveNotifications = memo(({ 
  maxNotifications = 5,
  autoHide = true,
  hideDelay = 5000,
  showUnreadCount = true,
  allowMarkAsRead = true,
  allowDismiss = true,
  position = 'top-right',
  onNotificationClick = null,
  onNotificationDismiss = null,
  className = ''
}) => {
  const { getErrorMessage } = useErrorMessages();
  
  // Enhanced real-time context
  const {
    isConnected,
    liveNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    removeNotification,
    clearAllNotifications,
    broadcastNotification
  } = useEnhancedRealtime();

  // Local state
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationTimers, setNotificationTimers] = useState(new Map());

  /**
   * Handle notification click
   * التعامل مع نقرة الإشعار
   */
  const handleNotificationClick = useCallback((notification) => {
    if (allowMarkAsRead && !notification.read) {
      markNotificationAsRead(notification.id);
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  }, [allowMarkAsRead, markNotificationAsRead, onNotificationClick]);

  /**
   * Handle notification dismiss
   * التعامل مع إلغاء الإشعار
   */
  const handleNotificationDismiss = useCallback((notification) => {
    if (allowDismiss) {
      removeNotification(notification.id);
      
      // Clear timer if exists
      const timer = notificationTimers.get(notification.id);
      if (timer) {
        clearTimeout(timer);
        setNotificationTimers(prev => {
          const newTimers = new Map(prev);
          newTimers.delete(notification.id);
          return newTimers;
        });
      }

      if (onNotificationDismiss) {
        onNotificationDismiss(notification);
      }
    }
  }, [allowDismiss, removeNotification, notificationTimers, onNotificationDismiss]);

  /**
   * Set up auto-hide timer for notification
   * إعداد مؤقت الإخفاء التلقائي للإشعار
   */
  const setupAutoHideTimer = useCallback((notification) => {
    if (!autoHide || notification.persistent) {
      return;
    }

    const timer = setTimeout(() => {
      handleNotificationDismiss(notification);
    }, hideDelay);

    setNotificationTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.set(notification.id, timer);
      return newTimers;
    });
  }, [autoHide, hideDelay, handleNotificationDismiss]);

  /**
   * Get notification icon based on type
   * الحصول على أيقونة الإشعار حسب النوع
   */
  const getNotificationIcon = useCallback((notification) => {
    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      admin: '👨‍💼',
      system: '⚙️',
      user: '👤',
      content: '📄',
      default: '🔔'
    };

    return iconMap[notification.type] || iconMap.default;
  }, []);

  /**
   * Get notification priority styling
   * الحصول على تنسيق أولوية الإشعار
   */
  const getNotificationStyling = useCallback((notification) => {
    const priorityStyles = {
      high: {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-800',
        accent: 'border-l-red-500'
      },
      medium: {
        border: 'border-yellow-300',
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        accent: 'border-l-yellow-500'
      },
      low: {
        border: 'border-blue-300',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        accent: 'border-l-blue-500'
      },
      default: {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        accent: 'border-l-gray-500'
      }
    };

    const typeStyles = {
      success: {
        border: 'border-green-300',
        bg: 'bg-green-50',
        text: 'text-green-800',
        accent: 'border-l-green-500'
      },
      error: {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-800',
        accent: 'border-l-red-500'
      },
      warning: {
        border: 'border-yellow-300',
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        accent: 'border-l-yellow-500'
      },
      info: {
        border: 'border-blue-300',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        accent: 'border-l-blue-500'
      }
    };

    return typeStyles[notification.type] || 
           priorityStyles[notification.priority] || 
           priorityStyles.default;
  }, []);

  /**
   * Get position classes
   * الحصول على فئات الموضع
   */
  const getPositionClasses = useCallback(() => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    return positions[position] || positions['top-right'];
  }, [position]);

  /**
   * Format notification timestamp
   * تنسيق طابع زمني للإشعار
   */
  const formatTimestamp = useCallback((timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'الآن';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes} دقيقة`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours} ساعة`;
    } else {
      return new Date(timestamp).toLocaleDateString('ar-SA');
    }
  }, []);

  // Update visible notifications when live notifications change
  useEffect(() => {
    const sortedNotifications = [...liveNotifications]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, isExpanded ? liveNotifications.length : maxNotifications);

    setVisibleNotifications(sortedNotifications);

    // Set up auto-hide timers for new notifications
    sortedNotifications.forEach(notification => {
      if (!notificationTimers.has(notification.id)) {
        setupAutoHideTimer(notification);
      }
    });
  }, [liveNotifications, maxNotifications, isExpanded, notificationTimers, setupAutoHideTimer]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      notificationTimers.forEach(timer => clearTimeout(timer));
    };
  }, [notificationTimers]);

  // Don't render if live notifications are disabled
  if (!getFeatureFlag('ENABLE_PHASE3_REALTIME') || !getFeatureFlag('ENABLE_LIVE_NOTIFICATIONS')) {
    return null;
  }

  // Don't render if no notifications and not showing unread count
  if (visibleNotifications.length === 0 && (!showUnreadCount || unreadNotificationCount === 0)) {
    return null;
  }

  return (
    <div className={`enhanced-live-notifications fixed z-50 ${getPositionClasses()} ${className}`}>
      {/* Unread Count Badge */}
      {showUnreadCount && unreadNotificationCount > 0 && (
        <div className="mb-2 flex justify-end">
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadNotificationCount} إشعار جديد
          </div>
        </div>
      )}

      {/* Notifications Container */}
      <div className="space-y-2 max-w-sm">
        {visibleNotifications.map((notification) => {
          const styling = getNotificationStyling(notification);
          const icon = getNotificationIcon(notification);
          
          return (
            <div
              key={notification.id}
              className={`
                ${styling.bg} ${styling.border} ${styling.accent}
                border border-l-4 rounded-lg shadow-lg p-4 cursor-pointer
                transform transition-all duration-300 hover:scale-105
                ${!notification.read ? 'ring-2 ring-blue-200' : ''}
              `}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <h4 className={`text-sm font-medium ${styling.text} mb-1`}>
                        {notification.title}
                      </h4>
                    )}
                    <p className={`text-sm ${styling.text} break-words`}>
                      {notification.message || notification.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          جديد
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dismiss Button */}
                {allowDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationDismiss(notification);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                    title="إلغاء الإشعار"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Additional notification data */}
              {notification.data && (
                <div className="mt-2 text-xs text-gray-600">
                  {typeof notification.data === 'string' 
                    ? notification.data 
                    : JSON.stringify(notification.data).substring(0, 100) + '...'
                  }
                </div>
              )}
            </div>
          );
        })}

        {/* Expand/Collapse Button */}
        {liveNotifications.length > maxNotifications && (
          <div className="text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {isExpanded 
                ? 'إظهار أقل' 
                : `إظهار ${liveNotifications.length - maxNotifications} إشعار إضافي`
              }
            </button>
          </div>
        )}

        {/* Clear All Button */}
        {visibleNotifications.length > 1 && (
          <div className="text-center">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              مسح جميع الإشعارات
            </button>
          </div>
        )}
      </div>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 text-center">
          غير متصل - قد تتأخر الإشعارات
        </div>
      )}
    </div>
  );
});

EnhancedLiveNotifications.displayName = 'EnhancedLiveNotifications';

export default EnhancedLiveNotifications;
