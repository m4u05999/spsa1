/**
 * Live Activity Tracker Component for Phase 3
 * مكون تتبع النشاط المباشر للمرحلة 3
 * 
 * Provides real-time user activity tracking and display
 * with PDPL compliance and performance optimization
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useEnhancedRealtimeSync } from '../../hooks/useEnhancedRealtimeSync';
import { getFeatureFlag } from '../../config/featureFlags';
import { ACTIVITY_TRACKING_LEVELS } from '../../services/realtime/enhancedRealtimeService';
import { useErrorMessages } from '../../hooks/useErrorMessages';

/**
 * Live Activity Tracker Component
 * مكون تتبع النشاط المباشر
 */
const LiveActivityTracker = memo(({ 
  trackingLevel = ACTIVITY_TRACKING_LEVELS.STANDARD,
  showActiveUsers = true,
  showActivityFeed = false,
  showMetrics = false,
  maxActivities = 10,
  autoTrack = true,
  onActivityUpdate = null,
  className = ''
}) => {
  const { getErrorMessage } = useErrorMessages();
  
  // Enhanced real-time sync hook
  const {
    isConnected,
    trackUserActivity,
    activityStatus,
    activeUsers,
    getSyncStatistics,
    features
  } = useEnhancedRealtimeSync({
    autoConnect: true,
    activityLevel: trackingLevel,
    enableActivityTracking: true,
    onActivityUpdate: (data) => {
      if (onActivityUpdate) {
        onActivityUpdate(data);
      }
      addToActivityFeed(data);
    }
  });

  // Local state
  const [activityFeed, setActivityFeed] = useState([]);
  const [userStatus, setUserStatus] = useState('active');
  const [lastActivity, setLastActivity] = useState(null);
  const [trackingStats, setTrackingStats] = useState({
    sessionsTracked: 0,
    activitiesLogged: 0,
    errorsEncountered: 0
  });

  /**
   * Add activity to feed
   * إضافة نشاط إلى التغذية
   */
  const addToActivityFeed = useCallback((activity) => {
    setActivityFeed(prev => [
      {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...activity,
        timestamp: activity.timestamp || Date.now()
      },
      ...prev.slice(0, maxActivities - 1)
    ]);
    
    setLastActivity(activity);
    setTrackingStats(prev => ({
      ...prev,
      activitiesLogged: prev.activitiesLogged + 1
    }));
  }, [maxActivities]);

  /**
   * Track page view activity
   * تتبع نشاط عرض الصفحة
   */
  const trackPageView = useCallback(async (page = null) => {
    if (!features.activityTrackingEnabled || !autoTrack) {
      return;
    }

    try {
      const currentPage = page || (typeof window !== 'undefined' ? window.location.pathname : '');
      
      await trackUserActivity('page_view', {
        page: currentPage,
        title: typeof document !== 'undefined' ? document.title : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        timestamp: Date.now()
      }, {
        immediate: true,
        page: currentPage
      });

    } catch (error) {
      console.error('Failed to track page view:', error);
      setTrackingStats(prev => ({
        ...prev,
        errorsEncountered: prev.errorsEncountered + 1
      }));
    }
  }, [trackUserActivity, features.activityTrackingEnabled, autoTrack]);

  /**
   * Track user interaction
   * تتبع تفاعل المستخدم
   */
  const trackInteraction = useCallback(async (interactionType, data = {}) => {
    if (!features.activityTrackingEnabled || !autoTrack) {
      return;
    }

    try {
      await trackUserActivity('interaction', {
        type: interactionType,
        ...data,
        timestamp: Date.now()
      }, {
        immediate: false
      });

    } catch (error) {
      console.error('Failed to track interaction:', error);
      setTrackingStats(prev => ({
        ...prev,
        errorsEncountered: prev.errorsEncountered + 1
      }));
    }
  }, [trackUserActivity, features.activityTrackingEnabled, autoTrack]);

  /**
   * Track user status change
   * تتبع تغيير حالة المستخدم
   */
  const trackStatusChange = useCallback(async (newStatus) => {
    if (!features.activityTrackingEnabled || userStatus === newStatus) {
      return;
    }

    try {
      setUserStatus(newStatus);
      
      await trackUserActivity('status_change', {
        oldStatus: userStatus,
        newStatus,
        timestamp: Date.now()
      }, {
        immediate: true
      });

    } catch (error) {
      console.error('Failed to track status change:', error);
    }
  }, [trackUserActivity, features.activityTrackingEnabled, userStatus]);

  /**
   * Get activity type display
   * الحصول على عرض نوع النشاط
   */
  const getActivityTypeDisplay = useCallback((activity) => {
    const activityTypes = {
      page_view: { icon: '👁️', label: 'عرض صفحة', color: 'text-blue-600' },
      interaction: { icon: '👆', label: 'تفاعل', color: 'text-green-600' },
      status_change: { icon: '🔄', label: 'تغيير حالة', color: 'text-yellow-600' },
      form_submit: { icon: '📝', label: 'إرسال نموذج', color: 'text-purple-600' },
      click: { icon: '🖱️', label: 'نقرة', color: 'text-gray-600' },
      scroll: { icon: '📜', label: 'تمرير', color: 'text-indigo-600' },
      focus: { icon: '🎯', label: 'تركيز', color: 'text-orange-600' },
      default: { icon: '📊', label: 'نشاط', color: 'text-gray-500' }
    };

    return activityTypes[activity.activityType] || activityTypes.default;
  }, []);

  /**
   * Get user status display
   * الحصول على عرض حالة المستخدم
   */
  const getUserStatusDisplay = useCallback((status) => {
    const statusTypes = {
      active: { icon: '🟢', label: 'نشط', color: 'text-green-500' },
      idle: { icon: '🟡', label: 'خامل', color: 'text-yellow-500' },
      away: { icon: '🟠', label: 'غائب', color: 'text-orange-500' },
      offline: { icon: '🔴', label: 'غير متصل', color: 'text-red-500' },
      default: { icon: '⚪', label: 'غير معروف', color: 'text-gray-500' }
    };

    return statusTypes[status] || statusTypes.default;
  }, []);

  /**
   * Format activity data for display
   * تنسيق بيانات النشاط للعرض
   */
  const formatActivityData = useCallback((activity) => {
    if (!activity.data) return '';

    const { data } = activity;
    
    if (activity.activityType === 'page_view') {
      return data.page || '';
    }
    
    if (activity.activityType === 'interaction') {
      return data.type || '';
    }
    
    if (activity.activityType === 'status_change') {
      return `${data.oldStatus} → ${data.newStatus}`;
    }

    return JSON.stringify(data).substring(0, 50) + '...';
  }, []);

  // Set up activity tracking
  useEffect(() => {
    if (!autoTrack || !features.activityTrackingEnabled) {
      return;
    }

    // Track initial page view
    trackPageView();

    // Set up event listeners based on tracking level
    const setupEventListeners = () => {
      if (typeof window === 'undefined') return;

      // Basic tracking for all levels
      const handleVisibilityChange = () => {
        trackStatusChange(document.hidden ? 'away' : 'active');
      };

      const handleBeforeUnload = () => {
        trackUserActivity('session_end', {
          duration: Date.now() - (activityStatus.lastActivity || Date.now()),
          activitiesTracked: trackingStats.activitiesLogged
        });
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Standard and detailed tracking
      if (trackingLevel !== ACTIVITY_TRACKING_LEVELS.MINIMAL) {
        const handleClick = (event) => {
          if (event.target.matches('button, a, [data-track]')) {
            trackInteraction('click', {
              element: event.target.tagName,
              text: event.target.textContent?.substring(0, 50)
            });
          }
        };

        const handleSubmit = (event) => {
          trackInteraction('form_submit', {
            formId: event.target.id || 'unknown'
          });
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleSubmit);

        // Detailed tracking
        if (trackingLevel === ACTIVITY_TRACKING_LEVELS.DETAILED || trackingLevel === ACTIVITY_TRACKING_LEVELS.ANALYTICS) {
          let scrollTimeout;
          const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              trackInteraction('scroll', {
                scrollY: window.scrollY,
                scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
              });
            }, 1000);
          };

          const handleFocus = () => trackStatusChange('active');
          const handleBlur = () => trackStatusChange('idle');

          window.addEventListener('scroll', handleScroll);
          window.addEventListener('focus', handleFocus);
          window.addEventListener('blur', handleBlur);

          return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('submit', handleSubmit);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
          };
        }

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('beforeunload', handleBeforeUnload);
          document.removeEventListener('click', handleClick);
          document.removeEventListener('submit', handleSubmit);
        };
      }

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    };

    const cleanup = setupEventListeners();
    
    // Update session tracking
    setTrackingStats(prev => ({
      ...prev,
      sessionsTracked: prev.sessionsTracked + 1
    }));

    return cleanup;
  }, [
    autoTrack,
    features.activityTrackingEnabled,
    trackingLevel,
    trackPageView,
    trackInteraction,
    trackStatusChange,
    trackUserActivity,
    activityStatus.lastActivity,
    trackingStats.activitiesLogged
  ]);

  // Don't render if activity tracking is disabled
  if (!getFeatureFlag('ENABLE_PHASE3_REALTIME') || !features.activityTrackingEnabled) {
    return null;
  }

  const stats = getSyncStatistics();
  const currentUserStatusDisplay = getUserStatusDisplay(userStatus);

  return (
    <div className={`live-activity-tracker ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-lg">{currentUserStatusDisplay.icon}</span>
          <div>
            <p className={`text-sm font-medium ${currentUserStatusDisplay.color}`}>
              {currentUserStatusDisplay.label}
            </p>
            <p className="text-xs text-gray-500">
              مستوى التتبع: {trackingLevel}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            متصل: {isConnected ? '✅' : '❌'}
          </p>
          {lastActivity && (
            <p className="text-xs text-gray-500">
              آخر نشاط: {new Date(lastActivity.timestamp).toLocaleTimeString('ar-SA')}
            </p>
          )}
        </div>
      </div>

      {/* Active Users Display */}
      {showActiveUsers && activeUsers.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            المستخدمون النشطون ({activeUsers.length})
          </h4>
          <div className="space-y-1">
            {activeUsers.slice(0, 5).map((user, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-blue-700">
                  مستخدم {index + 1}
                </span>
                <span className="text-blue-600 font-mono">
                  {user.currentPage || 'غير معروف'}
                </span>
              </div>
            ))}
            {activeUsers.length > 5 && (
              <p className="text-xs text-blue-600">
                و {activeUsers.length - 5} مستخدمين آخرين...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {showActivityFeed && activityFeed.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            تغذية النشاط ({activityFeed.length})
          </h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {activityFeed.map((activity) => {
              const typeDisplay = getActivityTypeDisplay(activity);
              return (
                <div
                  key={activity.id}
                  className="p-2 bg-white border rounded text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span>{typeDisplay.icon}</span>
                      <span className={typeDisplay.color}>
                        {typeDisplay.label}
                      </span>
                    </div>
                    <span className="text-gray-500 font-mono">
                      {new Date(activity.timestamp).toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                  {activity.data && (
                    <p className="mt-1 text-gray-600">
                      {formatActivityData(activity)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking Metrics */}
      {showMetrics && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">إحصائيات التتبع</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-green-600">الجلسات:</span>
              <span className="font-mono ml-1">{trackingStats.sessionsTracked}</span>
            </div>
            <div>
              <span className="text-green-600">الأنشطة:</span>
              <span className="font-mono ml-1">{trackingStats.activitiesLogged}</span>
            </div>
            <div>
              <span className="text-green-600">الأخطاء:</span>
              <span className="font-mono ml-1">{trackingStats.errorsEncountered}</span>
            </div>
            <div>
              <span className="text-green-600">المتوسط:</span>
              <span className="font-mono ml-1">{stats.performance.avgLatency}ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

LiveActivityTracker.displayName = 'LiveActivityTracker';

export default LiveActivityTracker;
