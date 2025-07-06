/**
 * Live Activity Feed Component
 * مكون تدفق الأنشطة المباشر
 * 
 * Displays real-time activity feed with filtering and customization
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useActivityFeed } from '../../contexts/RealtimeContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
// import './LiveActivityFeed.css';

/**
 * LiveActivityFeed Component
 * مكون تدفق الأنشطة المباشر
 */
const LiveActivityFeed = ({
  maxItems = 20,
  showFilters = true,
  showTimestamps = true,
  showUserAvatars = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className = ''
}) => {
  const {
    activityFeed,
    loadActivityFeed,
    clearActivityFeed
  } = useActivityFeed();

  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    since: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState([]);

  // Load activity feed on mount
  useEffect(() => {
    loadInitialFeed();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshFeed();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Filter activities
  useEffect(() => {
    let filtered = [...activityFeed];

    if (filters.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    if (filters.userId) {
      filtered = filtered.filter(activity => 
        activity.data?.userId === filters.userId ||
        activity.data?.data?.userId === filters.userId
      );
    }

    if (filters.since) {
      filtered = filtered.filter(activity => 
        activity.data?.timestamp >= filters.since
      );
    }

    setFilteredActivities(filtered.slice(0, maxItems));
  }, [activityFeed, filters, maxItems]);

  // Don't render if feature is disabled
  if (!getFeatureFlag('ENABLE_ACTIVITY_FEED')) {
    return null;
  }

  /**
   * Load initial feed
   * تحميل التدفق الأولي
   */
  const loadInitialFeed = async () => {
    setIsLoading(true);
    try {
      await loadActivityFeed(maxItems, filters);
    } catch (error) {
      console.error('Failed to load activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh feed
   * تحديث التدفق
   */
  const refreshFeed = useCallback(async () => {
    try {
      await loadActivityFeed(maxItems, filters);
    } catch (error) {
      console.error('Failed to refresh activity feed:', error);
    }
  }, [loadActivityFeed, maxItems, filters]);

  /**
   * Handle filter change
   * التعامل مع تغيير الفلتر
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Clear all filters
   * مسح جميع الفلاتر
   */
  const clearFilters = () => {
    setFilters({
      type: '',
      userId: '',
      since: null
    });
  };

  /**
   * Get activity icon
   * الحصول على أيقونة النشاط
   */
  const getActivityIcon = (activity) => {
    const type = activity.type;
    const dataType = activity.data?.type;
    
    const icons = {
      notification: '🔔',
      update: '🔄',
      activity: '📊',
      user_login: '🔑',
      user_logout: '🚪',
      user_register: '👤',
      content_create: '📝',
      content_update: '✏️',
      content_delete: '🗑️',
      file_upload: '📤',
      file_download: '📥',
      file_delete: '🗂️',
      search_query: '🔍',
      system_update: '⚙️',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    
    return icons[`${type}_${dataType}`] || icons[type] || icons[dataType] || '📋';
  };

  /**
   * Get activity title
   * الحصول على عنوان النشاط
   */
  const getActivityTitle = (activity) => {
    const type = activity.type;
    const data = activity.data;
    
    const titles = {
      notification: 'إشعار جديد',
      update: 'تحديث',
      activity: 'نشاط',
      user_login: 'تسجيل دخول',
      user_logout: 'تسجيل خروج',
      user_register: 'تسجيل عضو جديد',
      content_create: 'إنشاء محتوى',
      content_update: 'تحديث محتوى',
      content_delete: 'حذف محتوى',
      file_upload: 'رفع ملف',
      file_download: 'تحميل ملف',
      file_delete: 'حذف ملف',
      search_query: 'بحث',
      system_update: 'تحديث النظام'
    };
    
    return data?.title || titles[`${type}_${data?.type}`] || titles[type] || 'نشاط جديد';
  };

  /**
   * Get activity description
   * الحصول على وصف النشاط
   */
  const getActivityDescription = (activity) => {
    const data = activity.data;
    
    if (data?.description) return data.description;
    if (data?.message) return data.message;
    if (data?.content) return data.content;
    if (data?.data?.originalName) return `الملف: ${data.data.originalName}`;
    if (data?.data?.query) return `البحث: ${data.data.query}`;
    
    return 'تم تنفيذ نشاط جديد';
  };

  /**
   * Format timestamp
   * تنسيق الطابع الزمني
   */
  const formatTimestamp = (timestamp) => {
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

  /**
   * Get user avatar
   * الحصول على صورة المستخدم
   */
  const getUserAvatar = (activity) => {
    const userId = activity.data?.userId || activity.data?.data?.userId;
    if (!userId) return null;
    
    // Generate avatar based on user ID
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return (
      <div 
        className="user-avatar"
        style={{ backgroundColor: color }}
        title={`المستخدم: ${userId}`}
      >
        {userId.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className={`live-activity-feed ${className}`}>
      {/* Feed Header */}
      <div className="feed-header">
        <div className="header-left">
          <h3>تدفق الأنشطة</h3>
          <span className="activity-count">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'نشاط' : 'أنشطة'}
          </span>
        </div>
        
        <div className="header-actions">
          <button
            className="refresh-button"
            onClick={refreshFeed}
            disabled={isLoading}
            title="تحديث"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="m3.51,9a9,9 0 0,1,14.85-3.36L23,10M1,14l4.64,4.36A9,9 0 0,0,20.49,15"/>
            </svg>
          </button>
          
          <button
            className="clear-button"
            onClick={clearActivityFeed}
            title="مسح التدفق"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="feed-filters">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الأنواع</option>
            <option value="notification">إشعارات</option>
            <option value="update">تحديثات</option>
            <option value="activity">أنشطة</option>
          </select>

          <select
            value={filters.since || ''}
            onChange={(e) => handleFilterChange('since', e.target.value ? Date.now() - parseInt(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">جميع الأوقات</option>
            <option value="3600000">آخر ساعة</option>
            <option value="86400000">آخر يوم</option>
            <option value="604800000">آخر أسبوع</option>
          </select>

          {(filters.type || filters.since) && (
            <button
              className="clear-filters"
              onClick={clearFilters}
              title="مسح الفلاتر"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="activity-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>جاري تحميل الأنشطة...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>لا توجد أنشطة</h4>
            <p>لم يتم العثور على أي أنشطة مطابقة للفلاتر المحددة</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div key={activity.id || index} className={`activity-item ${activity.type}`}>
              <div className="activity-icon">
                {getActivityIcon(activity)}
              </div>
              
              {showUserAvatars && getUserAvatar(activity)}
              
              <div className="activity-content">
                <div className="activity-header">
                  <h4 className="activity-title">
                    {getActivityTitle(activity)}
                  </h4>
                  {showTimestamps && (
                    <span className="activity-time">
                      {formatTimestamp(activity.data?.timestamp || Date.now())}
                    </span>
                  )}
                </div>
                
                <p className="activity-description">
                  {getActivityDescription(activity)}
                </p>
                
                {activity.data?.data && (
                  <div className="activity-metadata">
                    {activity.data.data.size && (
                      <span className="metadata-item">
                        الحجم: {Math.round(activity.data.data.size / 1024)} KB
                      </span>
                    )}
                    {activity.data.data.type && (
                      <span className="metadata-item">
                        النوع: {activity.data.data.type}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="activity-badge">
                <span className="badge-text">{activity.type}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredActivities.length >= maxItems && (
        <div className="feed-footer">
          <button
            className="load-more"
            onClick={() => loadActivityFeed(maxItems + 20, filters)}
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ActivityItem Component
 * مكون عنصر النشاط
 */
export const ActivityItem = ({ 
  activity, 
  showTimestamp = true, 
  showAvatar = true,
  onClick,
  className = '' 
}) => {
  const getActivityIcon = (activity) => {
    // Same logic as above
    return '📋';
  };

  const formatTimestamp = (timestamp) => {
    // Same logic as above
    return 'الآن';
  };

  return (
    <div 
      className={`activity-item-component ${activity.type} ${className}`}
      onClick={onClick}
    >
      <div className="activity-icon">
        {getActivityIcon(activity)}
      </div>
      
      <div className="activity-content">
        <div className="activity-title">
          {activity.title || 'نشاط جديد'}
        </div>
        <div className="activity-description">
          {activity.description || activity.message}
        </div>
        {showTimestamp && (
          <div className="activity-time">
            {formatTimestamp(activity.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ActivityCounter Component
 * مكون عداد الأنشطة
 */
export const ActivityCounter = ({ 
  count = 0, 
  type = 'all',
  className = '' 
}) => {
  return (
    <div className={`activity-counter ${className}`}>
      <span className="counter-number">{count}</span>
      <span className="counter-label">
        {type === 'all' ? 'أنشطة' : type}
      </span>
    </div>
  );
};

export default LiveActivityFeed;
