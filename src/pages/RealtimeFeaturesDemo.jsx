/**
 * Real-time Features Demo Page
 * صفحة عرض الميزات المباشرة
 * 
 * Demonstrates all real-time functionality
 */

import React, { useState, useEffect } from 'react';
import { useRealtime, useNotifications, useActivityFeed, useLiveUpdates } from '../contexts/RealtimeContext.jsx';
import LiveNotifications from '../components/realtime/LiveNotifications.jsx';
import RealtimeUpdates from '../components/realtime/RealtimeUpdates.jsx';
import LiveActivityFeed from '../components/realtime/LiveActivityFeed.jsx';
import { getFeatureFlag } from '../config/featureFlags.js';
import './RealtimeFeaturesDemo.css';

/**
 * RealtimeFeaturesDemo Component
 * مكون عرض الميزات المباشرة
 */
const RealtimeFeaturesDemo = () => {
  const {
    isConnected,
    isServiceAvailable,
    serviceStatus,
    connect,
    disconnect,
    clearError,
    error
  } = useRealtime();

  const {
    notifications,
    unreadNotifications,
    sendNotification,
    markAllNotificationsAsRead,
    clearAllNotifications
  } = useNotifications();

  const {
    activityFeed,
    loadActivityFeed,
    clearActivityFeed
  } = useActivityFeed();

  const {
    liveUpdates,
    updateTypes,
    broadcastUpdate
  } = useLiveUpdates();

  const [demoStats, setDemoStats] = useState({
    notificationsSent: 0,
    updatesBroadcast: 0,
    activitiesGenerated: 0
  });

  // Update stats
  useEffect(() => {
    setDemoStats(prev => ({
      ...prev,
      notificationsSent: notifications.length,
      updatesBroadcast: liveUpdates.length,
      activitiesGenerated: activityFeed.length
    }));
  }, [notifications.length, liveUpdates.length, activityFeed.length]);

  // Don't render if feature is disabled
  if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
    return (
      <div className="realtime-demo-disabled">
        <h2>الميزات المباشرة غير مفعلة</h2>
        <p>يرجى تفعيل الميزات المباشرة في إعدادات النظام</p>
      </div>
    );
  }

  /**
   * Send demo notification
   * إرسال إشعار تجريبي
   */
  const sendDemoNotification = async (type = 'info') => {
    const notifications = {
      info: {
        title: 'إشعار معلوماتي',
        message: 'هذا إشعار تجريبي للمعلومات',
        type: 'info'
      },
      success: {
        title: 'عملية ناجحة',
        message: 'تم تنفيذ العملية بنجاح',
        type: 'success'
      },
      warning: {
        title: 'تحذير',
        message: 'يرجى الانتباه لهذا التحذير',
        type: 'warning'
      },
      error: {
        title: 'خطأ',
        message: 'حدث خطأ في النظام',
        type: 'error'
      }
    };

    await sendNotification(notifications[type]);
  };

  /**
   * Broadcast demo update
   * بث تحديث تجريبي
   */
  const broadcastDemoUpdate = async (updateType = 'content') => {
    const updates = {
      content: {
        title: 'تحديث المحتوى',
        description: 'تم تحديث محتوى جديد في النظام',
        data: { id: Date.now(), type: 'article' }
      },
      users: {
        title: 'تحديث المستخدمين',
        description: 'انضم مستخدم جديد للنظام',
        data: { id: Date.now(), action: 'join' }
      },
      files: {
        title: 'تحديث الملفات',
        description: 'تم رفع ملف جديد',
        data: { id: Date.now(), filename: 'document.pdf' }
      },
      system: {
        title: 'تحديث النظام',
        description: 'تم تحديث إعدادات النظام',
        data: { id: Date.now(), setting: 'theme' }
      }
    };

    await broadcastUpdate(updateType, updates[updateType]);
  };

  /**
   * Generate demo activity
   * إنشاء نشاط تجريبي
   */
  const generateDemoActivity = () => {
    const activities = [
      'user_login',
      'content_create',
      'file_upload',
      'search_query',
      'system_update'
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    broadcastDemoUpdate(randomActivity);
  };

  /**
   * Test connection
   * اختبار الاتصال
   */
  const testConnection = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <div className="realtime-features-demo">
      {/* Header */}
      <div className="demo-header">
        <h1>عرض الميزات المباشرة</h1>
        <p>اختبار وعرض جميع الميزات المباشرة في النظام</p>
        
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}
      </div>

      {/* Status Panel */}
      <div className="status-panel">
        <div className="status-card">
          <h3>حالة الاتصال</h3>
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{isConnected ? 'متصل' : 'غير متصل'}</span>
          </div>
          <button 
            className="connection-toggle"
            onClick={testConnection}
          >
            {isConnected ? 'قطع الاتصال' : 'الاتصال'}
          </button>
        </div>

        <div className="status-card">
          <h3>إحصائيات الخدمة</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{demoStats.notificationsSent}</span>
              <span className="stat-label">إشعارات</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{demoStats.updatesBroadcast}</span>
              <span className="stat-label">تحديثات</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{demoStats.activitiesGenerated}</span>
              <span className="stat-label">أنشطة</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{unreadNotifications}</span>
              <span className="stat-label">غير مقروء</span>
            </div>
          </div>
        </div>

        <div className="status-card">
          <h3>معلومات الخدمة</h3>
          <div className="service-info">
            <div className="info-item">
              <span>متاح:</span>
              <span>{isServiceAvailable ? 'نعم' : 'لا'}</span>
            </div>
            <div className="info-item">
              <span>الاشتراكات:</span>
              <span>{serviceStatus?.subscriptionsCount || 0}</span>
            </div>
            <div className="info-item">
              <span>حجم التدفق:</span>
              <span>{serviceStatus?.activityFeedSize || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="demo-controls">
        <div className="control-section">
          <h3>إرسال الإشعارات</h3>
          <div className="button-group">
            <button 
              className="demo-button info"
              onClick={() => sendDemoNotification('info')}
            >
              إشعار معلوماتي
            </button>
            <button 
              className="demo-button success"
              onClick={() => sendDemoNotification('success')}
            >
              إشعار نجاح
            </button>
            <button 
              className="demo-button warning"
              onClick={() => sendDemoNotification('warning')}
            >
              إشعار تحذير
            </button>
            <button 
              className="demo-button error"
              onClick={() => sendDemoNotification('error')}
            >
              إشعار خطأ
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>بث التحديثات</h3>
          <div className="button-group">
            <button 
              className="demo-button"
              onClick={() => broadcastDemoUpdate('content')}
            >
              تحديث المحتوى
            </button>
            <button 
              className="demo-button"
              onClick={() => broadcastDemoUpdate('users')}
            >
              تحديث المستخدمين
            </button>
            <button 
              className="demo-button"
              onClick={() => broadcastDemoUpdate('files')}
            >
              تحديث الملفات
            </button>
            <button 
              className="demo-button"
              onClick={() => broadcastDemoUpdate('system')}
            >
              تحديث النظام
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>إدارة البيانات</h3>
          <div className="button-group">
            <button 
              className="demo-button secondary"
              onClick={generateDemoActivity}
            >
              إنشاء نشاط عشوائي
            </button>
            <button 
              className="demo-button secondary"
              onClick={markAllNotificationsAsRead}
            >
              تمييز الكل كمقروء
            </button>
            <button 
              className="demo-button danger"
              onClick={clearAllNotifications}
            >
              مسح الإشعارات
            </button>
            <button 
              className="demo-button danger"
              onClick={clearActivityFeed}
            >
              مسح التدفق
            </button>
          </div>
        </div>
      </div>

      {/* Components Demo */}
      <div className="components-demo">
        <div className="demo-section">
          <h3>الإشعارات المباشرة</h3>
          <div className="component-container">
            <LiveNotifications 
              position="top-right"
              maxVisible={5}
              showUnreadCount={true}
            />
          </div>
        </div>

        <div className="demo-section">
          <h3>التحديثات المباشرة</h3>
          <div className="component-container">
            <RealtimeUpdates 
              channels={['content', 'users', 'files', 'system']}
              showIndicator={true}
              showCounter={true}
            />
          </div>
        </div>

        <div className="demo-section full-width">
          <h3>تدفق الأنشطة المباشر</h3>
          <div className="component-container">
            <LiveActivityFeed 
              maxItems={20}
              showFilters={true}
              showTimestamps={true}
              showUserAvatars={true}
            />
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="debug-info">
        <details>
          <summary>معلومات التشخيص</summary>
          <pre>{JSON.stringify(serviceStatus, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default RealtimeFeaturesDemo;
