/**
 * Unified Notification Service
 * خدمة الإشعارات الموحدة
 * 
 * Central service that integrates all notification types and providers
 */

import notificationCore, { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES, NOTIFICATION_CATEGORIES } from './notifications/notificationCore.js';
import emailNotificationService from './notifications/emailNotificationService.js';
import smsNotificationService from './notifications/smsNotificationService.js';
import pushNotificationService from './notifications/pushNotificationService.js';
import realtimeService from './realtimeService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

/**
 * Unified Notification Service Class
 * فئة خدمة الإشعارات الموحدة
 */
class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.providers = new Map();
    this.templates = new Map();
    this.userPreferences = new Map();
    this.deliveryQueue = [];
    this.scheduledNotifications = new Map();
    
    // Statistics
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      byType: {
        email: 0,
        sms: 0,
        push: 0,
        in_app: 0
      },
      byCategory: {
        system: 0,
        security: 0,
        content: 0,
        user: 0,
        payment: 0,
        marketing: 0
      }
    };

    this.initialize();
  }

  /**
   * Initialize notification service
   * تهيئة خدمة الإشعارات
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM')) {
        logInfo('Notification system is disabled');
        return;
      }

      // Initialize core service
      await notificationCore.initialize();
      
      // Register notification providers
      await this.registerProviders();
      
      // Load default templates
      await this.loadDefaultTemplates();
      
      // Setup scheduled notifications processor
      this.setupScheduledProcessor();
      
      this.isInitialized = true;
      logInfo('Unified notification service initialized');
      
    } catch (error) {
      logError('Failed to initialize notification service', error);
      throw error;
    }
  }

  /**
   * Register notification providers
   * تسجيل مقدمي خدمة الإشعارات
   */
  async registerProviders() {
    // Register email provider
    if (getFeatureFlag('ENABLE_EMAIL_NOTIFICATIONS')) {
      notificationCore.registerProvider(NOTIFICATION_TYPES.EMAIL, emailNotificationService);
      this.providers.set(NOTIFICATION_TYPES.EMAIL, emailNotificationService);
    }

    // Register SMS provider
    if (getFeatureFlag('ENABLE_SMS_NOTIFICATIONS')) {
      notificationCore.registerProvider(NOTIFICATION_TYPES.SMS, smsNotificationService);
      this.providers.set(NOTIFICATION_TYPES.SMS, smsNotificationService);
    }

    // Register push provider
    if (getFeatureFlag('ENABLE_PUSH_NOTIFICATIONS')) {
      notificationCore.registerProvider(NOTIFICATION_TYPES.PUSH, pushNotificationService);
      this.providers.set(NOTIFICATION_TYPES.PUSH, pushNotificationService);
    }

    // Register in-app provider (real-time service)
    if (getFeatureFlag('ENABLE_IN_APP_NOTIFICATIONS')) {
      notificationCore.registerProvider(NOTIFICATION_TYPES.IN_APP, {
        send: async (notification) => {
          return await realtimeService.sendNotification(notification);
        }
      });
      this.providers.set(NOTIFICATION_TYPES.IN_APP, realtimeService);
    }
  }

  /**
   * Send notification
   * إرسال إشعار
   */
  async sendNotification(notification) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate and enrich notification
      const enrichedNotification = this.enrichNotification(notification);
      
      // Check if scheduled
      if (enrichedNotification.scheduledAt && enrichedNotification.scheduledAt > Date.now()) {
        return this.scheduleNotification(enrichedNotification);
      }

      // Send via core service
      const result = await notificationCore.sendNotification(enrichedNotification);
      
      // Update statistics
      this.updateStatistics(enrichedNotification, result);
      
      return result;

    } catch (error) {
      logError('Failed to send notification', error);
      this.stats.failed++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification
   * إرسال إشعار بريد إلكتروني
   */
  async sendEmail(recipient, subject, message, options = {}) {
    return this.sendNotification({
      recipient: typeof recipient === 'string' ? { email: recipient } : recipient,
      types: [NOTIFICATION_TYPES.EMAIL],
      title: subject,
      message,
      template: options.template || 'default_email',
      data: options.data || {},
      priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: options.category || NOTIFICATION_CATEGORIES.SYSTEM,
      ...options
    });
  }

  /**
   * Send SMS notification
   * إرسال إشعار رسالة نصية
   */
  async sendSMS(recipient, message, options = {}) {
    return this.sendNotification({
      recipient: typeof recipient === 'string' ? { phone: recipient } : recipient,
      types: [NOTIFICATION_TYPES.SMS],
      message,
      template: options.template || 'default_sms',
      data: options.data || {},
      priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: options.category || NOTIFICATION_CATEGORIES.SYSTEM,
      ...options
    });
  }

  /**
   * Send push notification
   * إرسال إشعار منبثق
   */
  async sendPush(recipient, title, message, options = {}) {
    return this.sendNotification({
      recipient: typeof recipient === 'string' ? { id: recipient } : recipient,
      types: [NOTIFICATION_TYPES.PUSH],
      title,
      message,
      template: options.template || 'default_push',
      data: options.data || {},
      priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: options.category || NOTIFICATION_CATEGORIES.SYSTEM,
      ...options
    });
  }

  /**
   * Send in-app notification
   * إرسال إشعار داخل التطبيق
   */
  async sendInApp(recipient, title, message, options = {}) {
    return this.sendNotification({
      recipient: typeof recipient === 'string' ? { id: recipient } : recipient,
      types: [NOTIFICATION_TYPES.IN_APP],
      title,
      message,
      data: options.data || {},
      priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: options.category || NOTIFICATION_CATEGORIES.SYSTEM,
      ...options
    });
  }

  /**
   * Send multi-channel notification
   * إرسال إشعار متعدد القنوات
   */
  async sendMultiChannel(recipient, title, message, channels = [], options = {}) {
    return this.sendNotification({
      recipient,
      types: channels,
      title,
      message,
      data: options.data || {},
      priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: options.category || NOTIFICATION_CATEGORIES.SYSTEM,
      ...options
    });
  }

  /**
   * Send bulk notifications
   * إرسال إشعارات مجمعة
   */
  async sendBulkNotifications(notifications) {
    try {
      return await notificationCore.sendBulkNotifications(notifications);
    } catch (error) {
      logError('Failed to send bulk notifications', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule notification
   * جدولة إشعار
   */
  scheduleNotification(notification) {
    const scheduleId = this.generateScheduleId();
    
    this.scheduledNotifications.set(scheduleId, {
      ...notification,
      scheduleId,
      createdAt: Date.now()
    });

    // Set timeout for scheduled notification
    const delay = notification.scheduledAt - Date.now();
    setTimeout(async () => {
      const scheduledNotification = this.scheduledNotifications.get(scheduleId);
      if (scheduledNotification) {
        this.scheduledNotifications.delete(scheduleId);
        await this.sendNotification({
          ...scheduledNotification,
          scheduledAt: null // Remove scheduling
        });
      }
    }, delay);

    return {
      success: true,
      scheduleId,
      scheduledAt: notification.scheduledAt,
      message: 'Notification scheduled successfully'
    };
  }

  /**
   * Cancel scheduled notification
   * إلغاء إشعار مجدول
   */
  cancelScheduledNotification(scheduleId) {
    const notification = this.scheduledNotifications.get(scheduleId);
    if (notification) {
      this.scheduledNotifications.delete(scheduleId);
      return { success: true, message: 'Scheduled notification cancelled' };
    }
    return { success: false, message: 'Scheduled notification not found' };
  }

  /**
   * Set user preferences
   * تعيين تفضيلات المستخدم
   */
  async setUserPreferences(userId, preferences) {
    try {
      notificationCore.setUserPreferences(userId, preferences);
      this.userPreferences.set(userId, preferences);
      
      // Save to backend if available
      try {
        await unifiedApiService.request('/notifications/preferences', {
          method: 'POST',
          data: { userId, preferences }
        });
      } catch (error) {
        // Silently handle - preferences stored locally
      }

      return { success: true };
    } catch (error) {
      logError('Failed to set user preferences', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user preferences
   * الحصول على تفضيلات المستخدم
   */
  getUserPreferences(userId) {
    return notificationCore.getUserPreferences(userId);
  }

  /**
   * Request push notification permission
   * طلب إذن الإشعارات المنبثقة
   */
  async requestPushPermission() {
    try {
      if (!getFeatureFlag('ENABLE_PUSH_NOTIFICATIONS')) {
        return { success: false, error: 'Push notifications disabled' };
      }

      const granted = await pushNotificationService.requestPermission();
      return { success: granted, permission: pushNotificationService.permission };
    } catch (error) {
      logError('Failed to request push permission', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to push notifications
   * الاشتراك في الإشعارات المنبثقة
   */
  async subscribeToPush(userId) {
    try {
      if (!getFeatureFlag('ENABLE_PUSH_NOTIFICATIONS')) {
        return { success: false, error: 'Push notifications disabled' };
      }

      const subscription = await pushNotificationService.subscribe(userId);
      return { success: true, subscription };
    } catch (error) {
      logError('Failed to subscribe to push notifications', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enrich notification with defaults
   * إثراء الإشعار بالقيم الافتراضية
   */
  enrichNotification(notification) {
    return {
      id: notification.id || this.generateNotificationId(),
      recipient: notification.recipient,
      types: notification.types || [NOTIFICATION_TYPES.IN_APP],
      title: notification.title || 'إشعار جديد',
      message: notification.message || '',
      data: notification.data || {},
      priority: notification.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: notification.category || NOTIFICATION_CATEGORIES.SYSTEM,
      template: notification.template || null,
      scheduledAt: notification.scheduledAt || null,
      expiresAt: notification.expiresAt || null,
      metadata: {
        source: 'unified_service',
        timestamp: Date.now(),
        ...notification.metadata
      }
    };
  }

  /**
   * Update statistics
   * تحديث الإحصائيات
   */
  updateStatistics(notification, result) {
    this.stats.total++;
    
    if (result.success) {
      this.stats.successful++;
    } else {
      this.stats.failed++;
    }

    // Update by type
    notification.types.forEach(type => {
      this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    });

    // Update by category
    this.stats.byCategory[notification.category] = 
      (this.stats.byCategory[notification.category] || 0) + 1;
  }

  /**
   * Load default templates
   * تحميل القوالب الافتراضية
   */
  async loadDefaultTemplates() {
    // Welcome notification template
    this.registerTemplate('welcome', {
      title: 'مرحباً بك في الجمعية السعودية للعلوم السياسية',
      message: 'نرحب بك {{userName}} في منصة الجمعية. يمكنك الآن الوصول إلى جميع الخدمات.',
      types: [NOTIFICATION_TYPES.EMAIL, NOTIFICATION_TYPES.IN_APP],
      category: NOTIFICATION_CATEGORIES.USER
    });

    // Security alert template
    this.registerTemplate('security_alert', {
      title: 'تنبيه أمني',
      message: 'تم اكتشاف نشاط غير عادي في حسابك. يرجى المراجعة.',
      types: [NOTIFICATION_TYPES.EMAIL, NOTIFICATION_TYPES.SMS, NOTIFICATION_TYPES.PUSH],
      category: NOTIFICATION_CATEGORIES.SECURITY,
      priority: NOTIFICATION_PRIORITIES.HIGH
    });

    // Content update template
    this.registerTemplate('content_update', {
      title: 'تحديث جديد',
      message: 'تم نشر محتوى جديد: {{contentTitle}}',
      types: [NOTIFICATION_TYPES.IN_APP, NOTIFICATION_TYPES.PUSH],
      category: NOTIFICATION_CATEGORIES.CONTENT
    });
  }

  /**
   * Register template
   * تسجيل قالب
   */
  registerTemplate(name, template) {
    this.templates.set(name, template);
    notificationCore.registerTemplate(name, template);
  }

  /**
   * Setup scheduled notifications processor
   * إعداد معالج الإشعارات المجدولة
   */
  setupScheduledProcessor() {
    // Check for scheduled notifications every minute
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60000);
  }

  /**
   * Process scheduled notifications
   * معالجة الإشعارات المجدولة
   */
  async processScheduledNotifications() {
    const now = Date.now();
    const toProcess = [];

    for (const [scheduleId, notification] of this.scheduledNotifications) {
      if (notification.scheduledAt <= now) {
        toProcess.push({ scheduleId, notification });
      }
    }

    for (const { scheduleId, notification } of toProcess) {
      this.scheduledNotifications.delete(scheduleId);
      await this.sendNotification({
        ...notification,
        scheduledAt: null
      });
    }
  }

  /**
   * Generate notification ID
   * إنشاء معرف الإشعار
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate schedule ID
   * إنشاء معرف الجدولة
   */
  generateScheduleId() {
    return `sched_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get delivery statistics
   * الحصول على إحصائيات التسليم
   */
  getStatistics() {
    return {
      ...this.stats,
      providers: {
        email: emailNotificationService.getDeliveryStatistics(),
        sms: smsNotificationService.getDeliveryStatistics(),
        push: pushNotificationService.getDeliveryStatistics()
      },
      core: notificationCore.getStatistics()
    };
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      providersCount: this.providers.size,
      templatesCount: this.templates.size,
      scheduledCount: this.scheduledNotifications.size,
      statistics: this.getStatistics(),
      providers: {
        email: emailNotificationService.getServiceStatus(),
        sms: smsNotificationService.getServiceStatus(),
        push: pushNotificationService.getServiceStatus(),
        core: notificationCore.getServiceStatus()
      },
      featuresEnabled: {
        notificationSystem: getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM'),
        emailNotifications: getFeatureFlag('ENABLE_EMAIL_NOTIFICATIONS'),
        smsNotifications: getFeatureFlag('ENABLE_SMS_NOTIFICATIONS'),
        pushNotifications: getFeatureFlag('ENABLE_PUSH_NOTIFICATIONS'),
        inAppNotifications: getFeatureFlag('ENABLE_IN_APP_NOTIFICATIONS')
      }
    };
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();

// Export types and constants for convenience
export {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES
};

export default notificationService;
