/**
 * Real-time Updates Component
 * مكون التحديثات المباشرة
 * 
 * Displays real-time content and data updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLiveUpdates } from '../../contexts/RealtimeContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './RealtimeUpdates.css';

/**
 * RealtimeUpdates Component
 * مكون التحديثات المباشرة
 */
const RealtimeUpdates = ({
  channels = ['content', 'users', 'files'],
  showIndicator = true,
  showCounter = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className = ''
}) => {
  const {
    liveUpdates,
    updateTypes,
    subscribe,
    unsubscribe
  } = useLiveUpdates();

  const [subscriptions, setSubscriptions] = useState(new Map());
  const [isActive, setIsActive] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Subscribe to channels
  useEffect(() => {
    if (!getFeatureFlag('ENABLE_LIVE_UPDATES')) {
      return;
    }

    const newSubscriptions = new Map();

    channels.forEach(channel => {
      const subscriptionId = subscribe(channel, handleUpdate, {
        autoRefresh,
        refreshInterval
      });
      newSubscriptions.set(channel, subscriptionId);
    });

    setSubscriptions(newSubscriptions);

    return () => {
      newSubscriptions.forEach(subscriptionId => {
        unsubscribe(subscriptionId);
      });
    };
  }, [channels, subscribe, unsubscribe, autoRefresh, refreshInterval]);

  // Handle incoming updates
  const handleUpdate = useCallback((update) => {
    setUpdateCount(prev => prev + 1);
    setLastUpdate(Date.now());
    
    // Emit custom event for other components to listen
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('realtimeUpdate', {
        detail: update
      });
      window.dispatchEvent(event);
    }
  }, []);

  // Reset counter periodically
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setUpdateCount(0);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Don't render if feature is disabled
  if (!getFeatureFlag('ENABLE_LIVE_UPDATES')) {
    return null;
  }

  /**
   * Toggle active state
   * تبديل الحالة النشطة
   */
  const toggleActive = () => {
    setIsActive(!isActive);
  };

  /**
   * Get update type icon
   * الحصول على أيقونة نوع التحديث
   */
  const getUpdateIcon = (type) => {
    const icons = {
      content: '📝',
      users: '👥',
      files: '📁',
      search: '🔍',
      notifications: '🔔',
      system: '⚙️',
      upload: '📤',
      download: '📥',
      create: '➕',
      update: '✏️',
      delete: '🗑️'
    };
    
    return icons[type] || '🔄';
  };

  /**
   * Format update time
   * تنسيق وقت التحديث
   */
  const formatUpdateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Get connection status
   * الحصول على حالة الاتصال
   */
  const getConnectionStatus = () => {
    if (subscriptions.size === 0) return 'disconnected';
    if (lastUpdate && (Date.now() - lastUpdate) < 60000) return 'active';
    return 'connected';
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className={`realtime-updates ${className}`}>
      {/* Update Indicator */}
      {showIndicator && (
        <div 
          className={`update-indicator ${connectionStatus} ${isActive ? 'active' : 'inactive'}`}
          onClick={toggleActive}
          title={`التحديثات المباشرة - ${isActive ? 'نشط' : 'متوقف'}`}
        >
          <div className="indicator-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12c0 1-1 1-1 1s-1 0-1-1 1-1 1-1 1 0 1 1"/>
              <path d="M16 12c0 1-1 1-1 1s-1 0-1-1 1-1 1-1 1 0 1 1"/>
              <path d="M11 12c0 1-1 1-1 1s-1 0-1-1 1-1 1-1 1 0 1 1"/>
              <path d="M6 12c0 1-1 1-1 1s-1 0-1-1 1-1 1-1 1 0 1 1"/>
            </svg>
          </div>
          
          {showCounter && updateCount > 0 && (
            <span className="update-counter">
              {updateCount > 99 ? '99+' : updateCount}
            </span>
          )}
        </div>
      )}

      {/* Updates Panel */}
      {isActive && (
        <div className="updates-panel">
          {/* Panel Header */}
          <div className="updates-header">
            <h4>التحديثات المباشرة</h4>
            <div className="connection-status">
              <div className={`status-dot ${connectionStatus}`}></div>
              <span className="status-text">
                {connectionStatus === 'active' && 'نشط'}
                {connectionStatus === 'connected' && 'متصل'}
                {connectionStatus === 'disconnected' && 'غير متصل'}
              </span>
            </div>
          </div>

          {/* Updates List */}
          <div className="updates-list">
            {liveUpdates.length === 0 ? (
              <div className="no-updates">
                <div className="no-updates-icon">🔄</div>
                <p>لا توجد تحديثات حديثة</p>
              </div>
            ) : (
              liveUpdates.slice(0, 10).map((update, index) => (
                <div key={update.id || index} className={`update-item ${update.type}`}>
                  <div className="update-icon">
                    {getUpdateIcon(update.type)}
                  </div>
                  
                  <div className="update-content">
                    <div className="update-title">
                      {update.title || `تحديث ${update.type}`}
                    </div>
                    <div className="update-description">
                      {update.description || update.message || 'تحديث جديد'}
                    </div>
                    <div className="update-time">
                      {formatUpdateTime(update.timestamp)}
                    </div>
                  </div>
                  
                  <div className="update-badge">
                    <span className="badge-text">{update.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel Footer */}
          <div className="updates-footer">
            <div className="footer-info">
              <span>القنوات: {channels.join(', ')}</span>
              {lastUpdate && (
                <span>آخر تحديث: {formatUpdateTime(lastUpdate)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * UpdateBadge Component
 * مكون شارة التحديث
 */
export const UpdateBadge = ({ 
  type, 
  count = 0, 
  showZero = false,
  onClick,
  className = '' 
}) => {
  if (!showZero && count === 0) {
    return null;
  }

  const getTypeColor = (type) => {
    const colors = {
      content: '#3b82f6',
      users: '#10b981',
      files: '#f59e0b',
      search: '#8b5cf6',
      notifications: '#ef4444',
      system: '#6b7280'
    };
    
    return colors[type] || '#6b7280';
  };

  return (
    <div 
      className={`update-badge-component ${className}`}
      onClick={onClick}
      style={{ '--badge-color': getTypeColor(type) }}
    >
      <span className="badge-count">{count > 99 ? '99+' : count}</span>
      <span className="badge-label">{type}</span>
    </div>
  );
};

/**
 * LiveUpdateIndicator Component
 * مكون مؤشر التحديث المباشر
 */
export const LiveUpdateIndicator = ({ 
  isActive = true, 
  lastUpdate = null,
  className = '' 
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (lastUpdate) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [lastUpdate]);

  return (
    <div className={`live-update-indicator ${isActive ? 'active' : 'inactive'} ${pulse ? 'pulse' : ''} ${className}`}>
      <div className="indicator-dot"></div>
      <span className="indicator-text">
        {isActive ? 'مباشر' : 'متوقف'}
      </span>
    </div>
  );
};

/**
 * UpdatesCounter Component
 * مكون عداد التحديثات
 */
export const UpdatesCounter = ({ 
  updates = [], 
  timeWindow = 300000, // 5 minutes
  className = '' 
}) => {
  const [recentUpdates, setRecentUpdates] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const recent = updates.filter(update => 
      (now - update.timestamp) <= timeWindow
    ).length;
    
    setRecentUpdates(recent);
  }, [updates, timeWindow]);

  return (
    <div className={`updates-counter ${className}`}>
      <span className="counter-number">{recentUpdates}</span>
      <span className="counter-label">تحديثات حديثة</span>
    </div>
  );
};

/**
 * Hook for real-time updates subscription
 * خطاف للاشتراك في التحديثات المباشرة
 */
export const useRealtimeSubscription = (channels, callback) => {
  const { subscribe, unsubscribe } = useLiveUpdates();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (!getFeatureFlag('ENABLE_LIVE_UPDATES')) {
      return;
    }

    const newSubscriptions = channels.map(channel => 
      subscribe(channel, callback)
    );
    
    setSubscriptions(newSubscriptions);

    return () => {
      newSubscriptions.forEach(subscriptionId => {
        unsubscribe(subscriptionId);
      });
    };
  }, [channels, callback, subscribe, unsubscribe]);

  return subscriptions;
};

export default RealtimeUpdates;
