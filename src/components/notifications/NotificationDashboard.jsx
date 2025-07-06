/**
 * Notification Dashboard Component
 * مكون لوحة تحكم الإشعارات
 * 
 * Comprehensive dashboard for managing and monitoring notifications
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import NotificationPreferences from './NotificationPreferences.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
// import './NotificationDashboard.css';

/**
 * NotificationDashboard Component
 * مكون لوحة تحكم الإشعارات
 */
const NotificationDashboard = ({ className = '' }) => {
  const {
    notifications,
    unreadCount,
    statistics,
    scheduledNotifications,
    serviceStatus,
    sendNotification,
    sendEmail,
    sendSMS,
    sendPush,
    sendInApp,
    scheduleNotification,
    cancelScheduledNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_CATEGORIES,
    isLoading,
    error,
    clearError
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('overview');
  const [testNotification, setTestNotification] = useState({
    type: NOTIFICATION_TYPES.IN_APP,
    title: 'إشعار تجريبي',
    message: 'هذا إشعار تجريبي لاختبار النظام',
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    category: NOTIFICATION_CATEGORIES.SYSTEM
  });

  // Don't render if feature is disabled
  if (!getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM')) {
    return (
      <div className="notification-dashboard-disabled">
        <h2>نظام الإشعارات غير مفعل</h2>
        <p>يرجى تفعيل نظام الإشعارات في إعدادات النظام</p>
      </div>
    );
  }

  /**
   * Send test notification
   * إرسال إشعار تجريبي
   */
  const sendTestNotification = async () => {
    try {
      const notification = {
        recipient: { id: 'current_user', email: 'test@example.com', phone: '+966501234567' },
        types: [testNotification.type],
        title: testNotification.title,
        message: testNotification.message,
        priority: testNotification.priority,
        category: testNotification.category,
        data: {
          testMode: true,
          timestamp: Date.now()
        }
      };

      await sendNotification(notification);

    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  /**
   * Format timestamp
   * تنسيق الطابع الزمني
   */
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get priority color
   * الحصول على لون الأولوية
   */
  const getPriorityColor = (priority) => {
    const colors = {
      [NOTIFICATION_PRIORITIES.LOW]: '#6b7280',
      [NOTIFICATION_PRIORITIES.NORMAL]: '#3b82f6',
      [NOTIFICATION_PRIORITIES.HIGH]: '#f59e0b',
      [NOTIFICATION_PRIORITIES.URGENT]: '#ef4444'
    };
    return colors[priority] || colors[NOTIFICATION_PRIORITIES.NORMAL];
  };

  /**
   * Get category icon
   * الحصول على أيقونة الفئة
   */
  const getCategoryIcon = (category) => {
    const icons = {
      [NOTIFICATION_CATEGORIES.SYSTEM]: '⚙️',
      [NOTIFICATION_CATEGORIES.SECURITY]: '🔒',
      [NOTIFICATION_CATEGORIES.CONTENT]: '📝',
      [NOTIFICATION_CATEGORIES.USER]: '👤',
      [NOTIFICATION_CATEGORIES.PAYMENT]: '💳',
      [NOTIFICATION_CATEGORIES.MARKETING]: '📢'
    };
    return icons[category] || '📋';
  };

  return (
    <div className={`notification-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>لوحة تحكم الإشعارات</h1>
        <p>إدارة ومراقبة جميع الإشعارات في النظام</p>
        
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          نظرة عامة
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          الإشعارات ({notifications.length})
        </button>
        <button
          className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          المجدولة ({scheduledNotifications.length})
        </button>
        <button
          className={`tab ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          اختبار
        </button>
        <button
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          التفضيلات
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>إجمالي الإشعارات</h3>
                  <p className="stat-number">{statistics.total}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>الناجحة</h3>
                  <p className="stat-number">{statistics.successful}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <h3>الفاشلة</h3>
                  <p className="stat-number">{statistics.failed}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📬</div>
                <div className="stat-content">
                  <h3>غير مقروءة</h3>
                  <p className="stat-number">{unreadCount}</p>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="service-status">
              <h3>حالة الخدمات</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">النظام الأساسي:</span>
                  <span className={`status-value ${serviceStatus.isInitialized ? 'active' : 'inactive'}`}>
                    {serviceStatus.isInitialized ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">مقدمو الخدمة:</span>
                  <span className="status-value">{serviceStatus.providersCount}</span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">البريد الإلكتروني:</span>
                  <span className={`status-value ${serviceStatus.featuresEnabled?.emailNotifications ? 'active' : 'inactive'}`}>
                    {serviceStatus.featuresEnabled?.emailNotifications ? 'مفعل' : 'معطل'}
                  </span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">الرسائل النصية:</span>
                  <span className={`status-value ${serviceStatus.featuresEnabled?.smsNotifications ? 'active' : 'inactive'}`}>
                    {serviceStatus.featuresEnabled?.smsNotifications ? 'مفعل' : 'معطل'}
                  </span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">الإشعارات المنبثقة:</span>
                  <span className={`status-value ${serviceStatus.featuresEnabled?.pushNotifications ? 'active' : 'inactive'}`}>
                    {serviceStatus.featuresEnabled?.pushNotifications ? 'مفعل' : 'معطل'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>النشاط الحديث</h3>
              <div className="activity-list">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="activity-item">
                    <div className="activity-icon">
                      {getCategoryIcon(notification.category)}
                    </div>
                    <div className="activity-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="activity-time">
                        {formatTimestamp(notification.receivedAt)}
                      </span>
                    </div>
                    <div 
                      className="activity-priority"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    ></div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="no-activity">
                    <p>لا توجد أنشطة حديثة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="notifications-header">
              <h3>الإشعارات الحالية</h3>
              <div className="notifications-actions">
                <button
                  className="action-button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  تمييز الكل كمقروء
                </button>
                <button
                  className="action-button danger"
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                >
                  مسح الكل
                </button>
              </div>
            </div>

            <div className="notifications-list">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon">
                    {getCategoryIcon(notification.category)}
                  </div>
                  
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimestamp(notification.receivedAt)}
                      </span>
                      <span 
                        className="notification-priority"
                        style={{ color: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="mark-read-button"
                        onClick={() => markAsRead(notification.id)}
                        title="تمييز كمقروء"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="remove-button"
                      onClick={() => removeNotification(notification.id)}
                      title="حذف"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="no-notifications">
                  <div className="no-notifications-icon">📭</div>
                  <h4>لا توجد إشعارات</h4>
                  <p>ستظهر الإشعارات هنا عند وصولها</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className="scheduled-tab">
            <div className="scheduled-header">
              <h3>الإشعارات المجدولة</h3>
            </div>

            <div className="scheduled-list">
              {scheduledNotifications.map((notification) => (
                <div key={notification.scheduleId} className="scheduled-item">
                  <div className="scheduled-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <div className="scheduled-meta">
                      <span>مجدول لـ: {formatTimestamp(notification.scheduledAt)}</span>
                      <span>الأنواع: {notification.types.join(', ')}</span>
                    </div>
                  </div>
                  
                  <button
                    className="cancel-button"
                    onClick={() => cancelScheduledNotification(notification.scheduleId)}
                  >
                    إلغاء
                  </button>
                </div>
              ))}
              
              {scheduledNotifications.length === 0 && (
                <div className="no-scheduled">
                  <div className="no-scheduled-icon">📅</div>
                  <h4>لا توجد إشعارات مجدولة</h4>
                  <p>يمكنك جدولة إشعارات من علامة تبويب الاختبار</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <div className="test-tab">
            <div className="test-form">
              <h3>اختبار الإشعارات</h3>
              
              <div className="form-group">
                <label>نوع الإشعار:</label>
                <select
                  value={testNotification.type}
                  onChange={(e) => setTestNotification({
                    ...testNotification,
                    type: e.target.value
                  })}
                >
                  {Object.values(NOTIFICATION_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>العنوان:</label>
                <input
                  type="text"
                  value={testNotification.title}
                  onChange={(e) => setTestNotification({
                    ...testNotification,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>الرسالة:</label>
                <textarea
                  value={testNotification.message}
                  onChange={(e) => setTestNotification({
                    ...testNotification,
                    message: e.target.value
                  })}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>الأولوية:</label>
                <select
                  value={testNotification.priority}
                  onChange={(e) => setTestNotification({
                    ...testNotification,
                    priority: e.target.value
                  })}
                >
                  {Object.values(NOTIFICATION_PRIORITIES).map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>الفئة:</label>
                <select
                  value={testNotification.category}
                  onChange={(e) => setTestNotification({
                    ...testNotification,
                    category: e.target.value
                  })}
                >
                  {Object.values(NOTIFICATION_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <button
                className="send-test-button"
                onClick={sendTestNotification}
                disabled={isLoading}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال إشعار تجريبي'}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            <NotificationPreferences />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDashboard;
