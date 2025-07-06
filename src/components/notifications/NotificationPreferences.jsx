/**
 * Notification Preferences Component
 * مكون تفضيلات الإشعارات
 * 
 * Allows users to configure their notification preferences
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './NotificationPreferences.css';

/**
 * NotificationPreferences Component
 * مكون تفضيلات الإشعارات
 */
const NotificationPreferences = ({ className = '' }) => {
  const {
    userPreferences,
    setUserPreferences,
    pushPermission,
    requestPushPermission,
    subscribeToPush,
    NOTIFICATION_TYPES,
    NOTIFICATION_CATEGORIES,
    isLoading,
    error,
    clearError
  } = useNotifications();

  const [preferences, setPreferences] = useState(userPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update local preferences when context changes
  useEffect(() => {
    setPreferences(userPreferences);
    setHasChanges(false);
  }, [userPreferences]);

  // Don't render if feature is disabled
  if (!getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM')) {
    return null;
  }

  /**
   * Handle preference change
   * التعامل مع تغيير التفضيل
   */
  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  /**
   * Handle notification type toggle
   * التعامل مع تبديل نوع الإشعار
   */
  const handleTypeToggle = (type) => {
    const enabledTypes = preferences.enabledTypes.includes(type)
      ? preferences.enabledTypes.filter(t => t !== type)
      : [...preferences.enabledTypes, type];
    
    handlePreferenceChange('enabledTypes', enabledTypes);
  };

  /**
   * Handle category toggle
   * التعامل مع تبديل فئة الإشعار
   */
  const handleCategoryToggle = (category) => {
    const enabledCategories = preferences.enabledCategories.includes(category)
      ? preferences.enabledCategories.filter(c => c !== category)
      : [...preferences.enabledCategories, category];
    
    handlePreferenceChange('enabledCategories', enabledCategories);
  };

  /**
   * Handle quiet hours change
   * التعامل مع تغيير ساعات الهدوء
   */
  const handleQuietHoursChange = (field, value) => {
    const quietHours = {
      ...preferences.quietHours,
      [field]: value
    };
    handlePreferenceChange('quietHours', quietHours);
  };

  /**
   * Save preferences
   * حفظ التفضيلات
   */
  const savePreferences = async () => {
    try {
      setSaving(true);
      clearError();

      const result = await setUserPreferences(preferences);
      
      if (result.success) {
        setHasChanges(false);
      } else {
        throw new Error(result.error || 'فشل في حفظ التفضيلات');
      }

    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset preferences
   * إعادة تعيين التفضيلات
   */
  const resetPreferences = () => {
    setPreferences(userPreferences);
    setHasChanges(false);
  };

  /**
   * Handle push permission request
   * التعامل مع طلب إذن الإشعارات المنبثقة
   */
  const handlePushPermissionRequest = async () => {
    try {
      const result = await requestPushPermission();
      
      if (result.success) {
        // Subscribe to push notifications
        await subscribeToPush();
      }

    } catch (error) {
      console.error('Failed to request push permission:', error);
    }
  };

  /**
   * Get type label
   * الحصول على تسمية النوع
   */
  const getTypeLabel = (type) => {
    const labels = {
      [NOTIFICATION_TYPES.EMAIL]: 'البريد الإلكتروني',
      [NOTIFICATION_TYPES.SMS]: 'الرسائل النصية',
      [NOTIFICATION_TYPES.PUSH]: 'الإشعارات المنبثقة',
      [NOTIFICATION_TYPES.IN_APP]: 'إشعارات التطبيق'
    };
    return labels[type] || type;
  };

  /**
   * Get category label
   * الحصول على تسمية الفئة
   */
  const getCategoryLabel = (category) => {
    const labels = {
      [NOTIFICATION_CATEGORIES.SYSTEM]: 'النظام',
      [NOTIFICATION_CATEGORIES.SECURITY]: 'الأمان',
      [NOTIFICATION_CATEGORIES.CONTENT]: 'المحتوى',
      [NOTIFICATION_CATEGORIES.USER]: 'المستخدم',
      [NOTIFICATION_CATEGORIES.PAYMENT]: 'المدفوعات',
      [NOTIFICATION_CATEGORIES.MARKETING]: 'التسويق'
    };
    return labels[category] || category;
  };

  return (
    <div className={`notification-preferences ${className}`}>
      {/* Header */}
      <div className="preferences-header">
        <h2>تفضيلات الإشعارات</h2>
        <p>قم بتخصيص كيفية ووقت تلقي الإشعارات</p>
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="preference-section">
        <h3>أنواع الإشعارات</h3>
        <p>اختر طرق تلقي الإشعارات</p>
        
        <div className="preference-grid">
          {Object.values(NOTIFICATION_TYPES).map(type => (
            <div key={type} className="preference-item">
              <div className="preference-control">
                <input
                  type="checkbox"
                  id={`type-${type}`}
                  checked={preferences.enabledTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  disabled={isLoading || saving}
                />
                <label htmlFor={`type-${type}`}>
                  <span className="preference-label">{getTypeLabel(type)}</span>
                  {type === NOTIFICATION_TYPES.PUSH && (
                    <span className={`permission-status ${pushPermission}`}>
                      {pushPermission === 'granted' && '✓ مفعل'}
                      {pushPermission === 'denied' && '✗ مرفوض'}
                      {pushPermission === 'default' && '⚠ غير محدد'}
                    </span>
                  )}
                </label>
              </div>
              
              {type === NOTIFICATION_TYPES.PUSH && pushPermission !== 'granted' && (
                <button
                  className="permission-button"
                  onClick={handlePushPermissionRequest}
                  disabled={isLoading || saving}
                >
                  طلب الإذن
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification Categories */}
      <div className="preference-section">
        <h3>فئات الإشعارات</h3>
        <p>اختر أنواع الإشعارات التي تريد تلقيها</p>
        
        <div className="preference-grid">
          {Object.values(NOTIFICATION_CATEGORIES).map(category => (
            <div key={category} className="preference-item">
              <div className="preference-control">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={preferences.enabledCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  disabled={isLoading || saving}
                />
                <label htmlFor={`category-${category}`}>
                  <span className="preference-label">{getCategoryLabel(category)}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="preference-section">
        <h3>ساعات الهدوء</h3>
        <p>تحديد الأوقات التي لا تريد تلقي إشعارات فيها (عدا الطارئة)</p>
        
        <div className="quiet-hours-controls">
          <div className="quiet-hours-toggle">
            <input
              type="checkbox"
              id="quiet-hours-enabled"
              checked={preferences.quietHours?.enabled || false}
              onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
              disabled={isLoading || saving}
            />
            <label htmlFor="quiet-hours-enabled">
              تفعيل ساعات الهدوء
            </label>
          </div>
          
          {preferences.quietHours?.enabled && (
            <div className="quiet-hours-time">
              <div className="time-input">
                <label>من الساعة:</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.quietHours?.start || 22}
                  onChange={(e) => handleQuietHoursChange('start', parseInt(e.target.value))}
                  disabled={isLoading || saving}
                />
              </div>
              
              <div className="time-input">
                <label>إلى الساعة:</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={preferences.quietHours?.end || 8}
                  onChange={(e) => handleQuietHoursChange('end', parseInt(e.target.value))}
                  disabled={isLoading || saving}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language and Timezone */}
      <div className="preference-section">
        <h3>الإعدادات العامة</h3>
        
        <div className="preference-grid">
          <div className="preference-item">
            <label htmlFor="language">اللغة:</label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              disabled={isLoading || saving}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="preference-item">
            <label htmlFor="timezone">المنطقة الزمنية:</label>
            <select
              id="timezone"
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              disabled={isLoading || saving}
            >
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Mecca">مكة المكرمة (GMT+3)</option>
              <option value="Asia/Kuwait">الكويت (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="preferences-actions">
        <button
          className="save-button"
          onClick={savePreferences}
          disabled={!hasChanges || isLoading || saving}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
        </button>
        
        <button
          className="reset-button"
          onClick={resetPreferences}
          disabled={!hasChanges || isLoading || saving}
        >
          إلغاء التغييرات
        </button>
      </div>

      {/* Status */}
      {hasChanges && (
        <div className="changes-indicator">
          <span>⚠ لديك تغييرات غير محفوظة</span>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
