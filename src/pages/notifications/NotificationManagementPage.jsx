/**
 * Notification Management Page
 * صفحة إدارة الإشعارات
 * 
 * Dedicated page for notification system management and testing
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import NotificationDashboard from '../../components/notifications/NotificationDashboard.jsx';
import NotificationPreferences from '../../components/notifications/NotificationPreferences.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './NotificationManagementPage.css';

/**
 * NotificationManagementPage Component
 * مكون صفحة إدارة الإشعارات
 */
const NotificationManagementPage = () => {
  const {
    isInitialized,
    serviceStatus,
    statistics,
    isLoading,
    error,
    clearError
  } = useNotifications();

  const [activeView, setActiveView] = useState('dashboard');

  // Check if notification system is enabled
  if (!getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM')) {
    return (
      <div className="notification-management-disabled">
        <div className="disabled-content">
          <div className="disabled-icon">🔕</div>
          <h1>نظام الإشعارات غير مفعل</h1>
          <p>يرجى تفعيل نظام الإشعارات في إعدادات النظام للوصول إلى هذه الصفحة</p>
          <div className="feature-flags-info">
            <h3>متغيرات البيئة المطلوبة:</h3>
            <ul>
              <li><code>VITE_ENABLE_NOTIFICATION_SYSTEM=true</code></li>
              <li><code>VITE_ENABLE_EMAIL_NOTIFICATIONS=true</code></li>
              <li><code>VITE_ENABLE_SMS_NOTIFICATIONS=true</code></li>
              <li><code>VITE_ENABLE_PUSH_NOTIFICATIONS=true</code></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>إدارة نظام الإشعارات</h1>
          <p>لوحة تحكم شاملة لإدارة واختبار جميع أنواع الإشعارات</p>
          
          {/* System Status Indicator */}
          <div className="system-status">
            <div className={`status-indicator ${isInitialized ? 'active' : 'inactive'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {isInitialized ? 'النظام نشط' : 'النظام غير نشط'}
              </span>
            </div>
            
            {isLoading && (
              <div className="loading-indicator">
                <span className="loading-spinner"></span>
                <span>جاري التحميل...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-value">{statistics.total || 0}</div>
            <div className="stat-label">إجمالي الإشعارات</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{statistics.successful || 0}</div>
            <div className="stat-label">الناجحة</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{statistics.failed || 0}</div>
            <div className="stat-label">الفاشلة</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{serviceStatus.providersCount || 0}</div>
            <div className="stat-label">مقدمو الخدمة</div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-close" onClick={clearError}>×</button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="view-navigation">
        <button
          className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <span className="tab-icon">📊</span>
          لوحة التحكم
        </button>
        <button
          className={`nav-tab ${activeView === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveView('preferences')}
        >
          <span className="tab-icon">⚙️</span>
          التفضيلات
        </button>
        <button
          className={`nav-tab ${activeView === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveView('testing')}
        >
          <span className="tab-icon">🧪</span>
          الاختبار
        </button>
        <button
          className={`nav-tab ${activeView === 'documentation' ? 'active' : ''}`}
          onClick={() => setActiveView('documentation')}
        >
          <span className="tab-icon">📚</span>
          التوثيق
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeView === 'dashboard' && (
          <div className="dashboard-view">
            <NotificationDashboard />
          </div>
        )}

        {activeView === 'preferences' && (
          <div className="preferences-view">
            <div className="view-header">
              <h2>تفضيلات الإشعارات</h2>
              <p>قم بتخصيص إعدادات الإشعارات حسب احتياجاتك</p>
            </div>
            <NotificationPreferences />
          </div>
        )}

        {activeView === 'testing' && (
          <div className="testing-view">
            <div className="view-header">
              <h2>اختبار النظام</h2>
              <p>أدوات شاملة لاختبار جميع ميزات نظام الإشعارات</p>
            </div>
            <TestingPanel />
          </div>
        )}

        {activeView === 'documentation' && (
          <div className="documentation-view">
            <div className="view-header">
              <h2>دليل الاستخدام</h2>
              <p>تعليمات مفصلة لاستخدام نظام الإشعارات</p>
            </div>
            <DocumentationPanel />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Testing Panel Component
 * مكون لوحة الاختبار
 */
const TestingPanel = () => {
  const {
    sendEmail,
    sendSMS,
    sendPush,
    sendInApp,
    sendMultiChannel,
    scheduleNotification,
    requestPushPermission,
    subscribeToPush,
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES,
    NOTIFICATION_CATEGORIES
  } = useNotifications();

  const [testData, setTestData] = useState({
    email: 'test@example.com',
    phone: '+966501234567',
    title: 'إشعار تجريبي',
    message: 'هذا إشعار تجريبي لاختبار النظام',
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    category: NOTIFICATION_CATEGORIES.SYSTEM
  });

  const [testResults, setTestResults] = useState([]);

  const addTestResult = (type, result) => {
    const newResult = {
      id: Date.now(),
      type,
      result,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const handleEmailTest = async () => {
    try {
      const result = await sendEmail(testData.email, testData.title, testData.message, {
        priority: testData.priority,
        category: testData.category
      });
      addTestResult('Email', result);
    } catch (error) {
      addTestResult('Email', { success: false, error: error.message });
    }
  };

  const handleSMSTest = async () => {
    try {
      const result = await sendSMS(testData.phone, testData.message, {
        priority: testData.priority,
        category: testData.category
      });
      addTestResult('SMS', result);
    } catch (error) {
      addTestResult('SMS', { success: false, error: error.message });
    }
  };

  const handlePushTest = async () => {
    try {
      // Request permission first
      await requestPushPermission();
      await subscribeToPush();
      
      const result = await sendPush('test-user', testData.title, testData.message, {
        priority: testData.priority,
        category: testData.category
      });
      addTestResult('Push', result);
    } catch (error) {
      addTestResult('Push', { success: false, error: error.message });
    }
  };

  const handleInAppTest = async () => {
    try {
      const result = await sendInApp('test-user', testData.title, testData.message, {
        priority: testData.priority,
        category: testData.category
      });
      addTestResult('In-App', result);
    } catch (error) {
      addTestResult('In-App', { success: false, error: error.message });
    }
  };

  const handleMultiChannelTest = async () => {
    try {
      const result = await sendMultiChannel(
        { id: 'test-user', email: testData.email, phone: testData.phone },
        testData.title,
        testData.message,
        [NOTIFICATION_TYPES.EMAIL, NOTIFICATION_TYPES.SMS, NOTIFICATION_TYPES.PUSH, NOTIFICATION_TYPES.IN_APP],
        { priority: testData.priority, category: testData.category }
      );
      addTestResult('Multi-Channel', result);
    } catch (error) {
      addTestResult('Multi-Channel', { success: false, error: error.message });
    }
  };

  const handleScheduleTest = async () => {
    try {
      const scheduledAt = Date.now() + (60 * 1000); // 1 minute from now
      const result = await scheduleNotification({
        recipient: { id: 'test-user', email: testData.email },
        types: [NOTIFICATION_TYPES.IN_APP],
        title: testData.title + ' (مجدول)',
        message: testData.message,
        priority: testData.priority,
        category: testData.category,
        scheduledAt
      });
      addTestResult('Scheduled', result);
    } catch (error) {
      addTestResult('Scheduled', { success: false, error: error.message });
    }
  };

  return (
    <div className="testing-panel">
      {/* Test Configuration */}
      <div className="test-config">
        <h3>إعدادات الاختبار</h3>
        <div className="config-grid">
          <div className="config-item">
            <label>البريد الإلكتروني:</label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => setTestData({...testData, email: e.target.value})}
            />
          </div>
          <div className="config-item">
            <label>رقم الهاتف:</label>
            <input
              type="tel"
              value={testData.phone}
              onChange={(e) => setTestData({...testData, phone: e.target.value})}
            />
          </div>
          <div className="config-item">
            <label>العنوان:</label>
            <input
              type="text"
              value={testData.title}
              onChange={(e) => setTestData({...testData, title: e.target.value})}
            />
          </div>
          <div className="config-item">
            <label>الرسالة:</label>
            <textarea
              value={testData.message}
              onChange={(e) => setTestData({...testData, message: e.target.value})}
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="test-actions">
        <h3>اختبار الإشعارات</h3>
        <div className="action-grid">
          <button className="test-button email" onClick={handleEmailTest}>
            📧 اختبار البريد الإلكتروني
          </button>
          <button className="test-button sms" onClick={handleSMSTest}>
            📱 اختبار الرسائل النصية
          </button>
          <button className="test-button push" onClick={handlePushTest}>
            🔔 اختبار الإشعارات المنبثقة
          </button>
          <button className="test-button in-app" onClick={handleInAppTest}>
            💬 اختبار إشعارات التطبيق
          </button>
          <button className="test-button multi" onClick={handleMultiChannelTest}>
            🌐 اختبار متعدد القنوات
          </button>
          <button className="test-button schedule" onClick={handleScheduleTest}>
            ⏰ اختبار الجدولة
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="test-results">
        <h3>نتائج الاختبار</h3>
        <div className="results-list">
          {testResults.map((result) => (
            <div key={result.id} className={`result-item ${result.result.success ? 'success' : 'error'}`}>
              <div className="result-header">
                <span className="result-type">{result.type}</span>
                <span className="result-time">{result.timestamp}</span>
                <span className={`result-status ${result.result.success ? 'success' : 'error'}`}>
                  {result.result.success ? '✅ نجح' : '❌ فشل'}
                </span>
              </div>
              {result.result.error && (
                <div className="result-error">{result.result.error}</div>
              )}
              {result.result.messageId && (
                <div className="result-id">معرف الرسالة: {result.result.messageId}</div>
              )}
            </div>
          ))}
          {testResults.length === 0 && (
            <div className="no-results">
              <p>لا توجد نتائج اختبار بعد. قم بتشغيل اختبار لرؤية النتائج هنا.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Documentation Panel Component
 * مكون لوحة التوثيق
 */
const DocumentationPanel = () => {
  return (
    <div className="documentation-panel">
      <div className="doc-section">
        <h3>🚀 البدء السريع</h3>
        <div className="doc-content">
          <h4>1. تشغيل النظام</h4>
          <pre><code>npm run dev</code></pre>
          
          <h4>2. الوصول إلى لوحة التحكم</h4>
          <p>انتقل إلى: <code>http://localhost:5173/notifications</code></p>
          
          <h4>3. اختبار الإشعارات</h4>
          <p>استخدم علامة تبويب "الاختبار" لإرسال إشعارات تجريبية</p>
        </div>
      </div>

      <div className="doc-section">
        <h3>⚙️ الإعدادات المطلوبة</h3>
        <div className="doc-content">
          <h4>متغيرات البيئة (.env)</h4>
          <pre><code>{`VITE_ENABLE_NOTIFICATION_SYSTEM=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_SMS_NOTIFICATIONS=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_IN_APP_NOTIFICATIONS=true`}</code></pre>
        </div>
      </div>

      <div className="doc-section">
        <h3>📱 أنواع الإشعارات</h3>
        <div className="doc-content">
          <ul>
            <li><strong>البريد الإلكتروني:</strong> إشعارات عبر البريد الإلكتروني مع قوالب HTML</li>
            <li><strong>الرسائل النصية:</strong> رسائل SMS عبر مقدمي الخدمة السعوديين</li>
            <li><strong>الإشعارات المنبثقة:</strong> إشعارات المتصفح والجوال</li>
            <li><strong>إشعارات التطبيق:</strong> إشعارات داخل التطبيق مباشرة</li>
          </ul>
        </div>
      </div>

      <div className="doc-section">
        <h3>🔧 استكشاف الأخطاء</h3>
        <div className="doc-content">
          <h4>مشاكل شائعة وحلولها:</h4>
          <ul>
            <li><strong>النظام غير نشط:</strong> تحقق من متغيرات البيئة</li>
            <li><strong>فشل الإشعارات المنبثقة:</strong> امنح إذن الإشعارات في المتصفح</li>
            <li><strong>مشاكل الاتصال:</strong> تحقق من حالة الشبكة والخادم</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagementPage;
