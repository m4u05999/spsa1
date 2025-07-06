/**
 * Live Notifications Component
 * مكون الإشعارات المباشرة
 * 
 * Displays real-time notifications with different types and actions
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/RealtimeContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './LiveNotifications.css';

/**
 * LiveNotifications Component
 * مكون الإشعارات المباشرة
 */
const LiveNotifications = ({
  position = 'top-right',
  maxVisible = 5,
  autoHide = true,
  hideDelay = 5000,
  showUnreadCount = true,
  className = ''
}) => {
  const {
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();

  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Update visible notifications
  useEffect(() => {
    const visible = notifications.slice(0, maxVisible);
    setVisibleNotifications(visible);
  }, [notifications, maxVisible]);

  // Auto-hide notifications
  useEffect(() => {
    if (autoHide) {
      visibleNotifications.forEach(notification => {
        if (!notification.read && !notification.hideTimeout) {
          notification.hideTimeout = setTimeout(() => {
            markNotificationAsRead(notification.id);
          }, hideDelay);
        }
      });
    }

    return () => {
      visibleNotifications.forEach(notification => {
        if (notification.hideTimeout) {
          clearTimeout(notification.hideTimeout);
        }
      });
    };
  }, [visibleNotifications, autoHide, hideDelay, markNotificationAsRead]);

  // Don't render if feature is disabled
  if (!getFeatureFlag('ENABLE_LIVE_NOTIFICATIONS')) {
    return null;
  }

  /**
   * Handle notification click
   * التعامل مع نقر الإشعار
   */
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }

    // Handle notification action
    if (notification.action && notification.action.url) {
      window.open(notification.action.url, '_blank');
    }
  };

  /**
   * Handle notification dismiss
   * التعامل مع إغلاق الإشعار
   */
  const handleNotificationDismiss = (notificationId, event) => {
    event.stopPropagation();
    removeNotification(notificationId);
  };

  /**
   * Get notification icon
   * الحصول على أيقونة الإشعار
   */
  const getNotificationIcon = (type) => {
    const icons = {
      info: '📢',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      message: '💬',
      update: '🔄',
      upload: '📤',
      download: '📥',
      user: '👤',
      system: '⚙️'
    };
    
    return icons[type] || '📢';
  };

  /**
   * Format notification time
   * تنسيق وقت الإشعار
   */
  const formatNotificationTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'الآن';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `منذ ${minutes} دقيقة`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `منذ ${days} يوم`;
    }
  };

  return (
    <div className={`live-notifications ${position} ${className}`}>
      {/* Notification Bell/Toggle */}
      {showUnreadCount && (
        <div 
          className="notification-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="notification-bell">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadNotifications > 0 && (
              <span className="notification-badge">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {(isExpanded || !showUnreadCount) && (
        <div className="notifications-panel">
          {/* Panel Header */}
          <div className="notifications-header">
            <h3>الإشعارات</h3>
            <div className="header-actions">
              {unreadNotifications > 0 && (
                <button
                  className="mark-all-read"
                  onClick={markAllNotificationsAsRead}
                  title="تمييز الكل كمقروء"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  className="clear-all"
                  onClick={clearAllNotifications}
                  title="مسح الكل"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                  </svg>
                </button>
              )}
              
              {showUnreadCount && (
                <button
                  className="close-panel"
                  onClick={() => setIsExpanded(false)}
                  title="إغلاق"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {visibleNotifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">🔔</div>
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              visibleNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">
                        {notification.title || 'إشعار جديد'}
                      </h4>
                      <span className="notification-time">
                        {formatNotificationTime(notification.timestamp || notification.receivedAt)}
                      </span>
                    </div>
                    
                    <p className="notification-message">
                      {notification.message || notification.content}
                    </p>
                    
                    {notification.action && (
                      <div className="notification-action">
                        <span className="action-text">
                          {notification.action.text || 'عرض التفاصيل'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    className="notification-dismiss"
                    onClick={(e) => handleNotificationDismiss(notification.id, e)}
                    title="إغلاق"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Show More Link */}
          {notifications.length > maxVisible && (
            <div className="notifications-footer">
              <button className="show-more">
                عرض جميع الإشعارات ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast Notifications (for new notifications) */}
      <div className="toast-notifications">
        {visibleNotifications
          .filter(n => !n.read && (Date.now() - (n.receivedAt || n.timestamp)) < 3000)
          .slice(0, 3)
          .map((notification) => (
            <div
              key={`toast-${notification.id}`}
              className={`toast-notification ${notification.type}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="toast-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="toast-content">
                <h4 className="toast-title">
                  {notification.title || 'إشعار جديد'}
                </h4>
                <p className="toast-message">
                  {notification.message || notification.content}
                </p>
              </div>
              
              <button
                className="toast-dismiss"
                onClick={(e) => handleNotificationDismiss(notification.id, e)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))
        }
      </div>
    </div>
  );
};

/**
 * NotificationToast Component
 * مكون إشعار منبثق
 */
export const NotificationToast = ({ 
  notification, 
  onDismiss, 
  autoHide = true, 
  hideDelay = 5000 
}) => {
  useEffect(() => {
    if (autoHide) {
      const timeout = setTimeout(() => {
        onDismiss(notification.id);
      }, hideDelay);

      return () => clearTimeout(timeout);
    }
  }, [autoHide, hideDelay, notification.id, onDismiss]);

  const getNotificationIcon = (type) => {
    const icons = {
      info: '📢',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      message: '💬'
    };
    
    return icons[type] || '📢';
  };

  return (
    <div className={`notification-toast ${notification.type}`}>
      <div className="toast-icon">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="toast-content">
        <h4 className="toast-title">
          {notification.title || 'إشعار جديد'}
        </h4>
        <p className="toast-message">
          {notification.message || notification.content}
        </p>
      </div>
      
      <button
        className="toast-dismiss"
        onClick={() => onDismiss(notification.id)}
      >
        ×
      </button>
    </div>
  );
};

export default LiveNotifications;
