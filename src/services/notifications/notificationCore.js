/**
 * Notification Core Service
 * خدمة الإشعارات الأساسية
 * 
 * Central service for managing all types of notifications
 */

import { logError, logInfo } from '../../utils/monitoring.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import unifiedApiService from '../unifiedApiService.js';

/**
 * Notification Types
 * أنواع الإشعارات
 */
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

/**
 * Notification Priorities
 * أولويات الإشعارات
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Notification Categories
 * فئات الإشعارات
 */
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  SECURITY: 'security',
  CONTENT: 'content',
  USER: 'user',
  PAYMENT: 'payment',
  MARKETING: 'marketing'
};

/**
 * Delivery Status
 * حالة التسليم
 */
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked'
};

/**
 * Notification Core Class
 * فئة الإشعارات الأساسية
 */
class NotificationCore {
  constructor() {
    this.isInitialized = false;
    this.providers = new Map();
    this.templates = new Map();
    this.userPreferences = new Map();
    this.deliveryQueue = [];
    this.deliveryHistory = [];
    this.maxHistorySize = 1000;
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds
    
    // Statistics
    this.stats = {
      sent: 0,
      delivered: 0,
      failed: 0,
      bounced: 0,
      opened: 0,
      clicked: 0
    };

    this.initialize();
  }

  /**
   * Initialize notification core
   * تهيئة نواة الإشعارات
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM')) {
        logInfo('Notification system is disabled');
        return;
      }

      // Load user preferences
      await this.loadUserPreferences();
      
      // Load notification templates
      await this.loadNotificationTemplates();
      
      // Initialize providers
      await this.initializeProviders();
      
      this.isInitialized = true;
      logInfo('Notification core initialized successfully');
      
    } catch (error) {
      logError('Failed to initialize notification core', error);
      throw error;
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

      // Validate notification
      const validatedNotification = this.validateNotification(notification);
      
      // Check user preferences
      if (!this.checkUserPreferences(validatedNotification)) {
        logInfo(`Notification blocked by user preferences: ${validatedNotification.id}`);
        return { success: false, reason: 'blocked_by_preferences' };
      }

      // Generate notification ID if not provided
      if (!validatedNotification.id) {
        validatedNotification.id = this.generateNotificationId();
      }

      // Add to delivery queue
      this.addToDeliveryQueue(validatedNotification);

      // Process notification based on type
      const results = await this.processNotification(validatedNotification);

      // Update statistics
      this.updateStatistics(results);

      // Add to delivery history
      this.addToDeliveryHistory(validatedNotification, results);

      return results;

    } catch (error) {
      logError('Failed to send notification', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk notifications
   * إرسال إشعارات مجمعة
   */
  async sendBulkNotifications(notifications) {
    try {
      const results = [];
      
      // Process notifications in batches
      const batchSize = 10;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const batchPromises = batch.map(notification => 
          this.sendNotification(notification)
        );
        
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
        ));
      }

      return {
        success: true,
        total: notifications.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };

    } catch (error) {
      logError('Failed to send bulk notifications', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process notification based on type
   * معالجة الإشعار حسب النوع
   */
  async processNotification(notification) {
    const results = {};

    // Process each delivery method
    for (const type of notification.types) {
      try {
        const provider = this.providers.get(type);
        if (!provider) {
          results[type] = { success: false, error: 'Provider not available' };
          continue;
        }

        // Apply template if specified
        const processedNotification = await this.applyTemplate(notification, type);

        // Send via provider
        const result = await provider.send(processedNotification);
        results[type] = result;

      } catch (error) {
        logError(`Failed to process ${type} notification`, error);
        results[type] = { success: false, error: error.message };
      }
    }

    return {
      success: Object.values(results).some(r => r.success),
      notificationId: notification.id,
      results
    };
  }

  /**
   * Validate notification
   * التحقق من صحة الإشعار
   */
  validateNotification(notification) {
    if (!notification) {
      throw new Error('Notification is required');
    }

    if (!notification.recipient) {
      throw new Error('Notification recipient is required');
    }

    if (!notification.types || notification.types.length === 0) {
      throw new Error('Notification types are required');
    }

    if (!notification.title && !notification.message) {
      throw new Error('Notification title or message is required');
    }

    // Set defaults
    return {
      id: notification.id || this.generateNotificationId(),
      recipient: notification.recipient,
      types: notification.types,
      title: notification.title || '',
      message: notification.message || '',
      data: notification.data || {},
      priority: notification.priority || NOTIFICATION_PRIORITIES.NORMAL,
      category: notification.category || NOTIFICATION_CATEGORIES.SYSTEM,
      template: notification.template || null,
      scheduledAt: notification.scheduledAt || Date.now(),
      expiresAt: notification.expiresAt || null,
      metadata: notification.metadata || {}
    };
  }

  /**
   * Check user preferences
   * فحص تفضيلات المستخدم
   */
  checkUserPreferences(notification) {
    const userPrefs = this.userPreferences.get(notification.recipient.id);
    
    if (!userPrefs) {
      return true; // Allow if no preferences set
    }

    // Check if notification type is enabled
    for (const type of notification.types) {
      if (!userPrefs.enabledTypes.includes(type)) {
        return false;
      }
    }

    // Check if category is enabled
    if (!userPrefs.enabledCategories.includes(notification.category)) {
      return false;
    }

    // Check quiet hours
    if (userPrefs.quietHours && this.isInQuietHours(userPrefs.quietHours)) {
      // Allow urgent notifications during quiet hours
      return notification.priority === NOTIFICATION_PRIORITIES.URGENT;
    }

    return true;
  }

  /**
   * Apply notification template
   * تطبيق قالب الإشعار
   */
  async applyTemplate(notification, type) {
    if (!notification.template) {
      return notification;
    }

    const template = this.templates.get(`${notification.template}_${type}`);
    if (!template) {
      logError(`Template not found: ${notification.template}_${type}`);
      return notification;
    }

    try {
      // Apply template variables
      const processedNotification = { ...notification };
      
      if (template.title) {
        processedNotification.title = this.processTemplate(template.title, notification.data);
      }
      
      if (template.message) {
        processedNotification.message = this.processTemplate(template.message, notification.data);
      }
      
      if (template.html && type === NOTIFICATION_TYPES.EMAIL) {
        processedNotification.html = this.processTemplate(template.html, notification.data);
      }

      // Merge template metadata
      processedNotification.metadata = {
        ...template.metadata,
        ...processedNotification.metadata
      };

      return processedNotification;

    } catch (error) {
      logError('Failed to apply template', error);
      return notification;
    }
  }

  /**
   * Process template with variables
   * معالجة القالب مع المتغيرات
   */
  processTemplate(template, data) {
    let processed = template;
    
    // Replace variables in format {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, data[key] || '');
    });

    return processed;
  }

  /**
   * Register notification provider
   * تسجيل مقدم خدمة الإشعارات
   */
  registerProvider(type, provider) {
    this.providers.set(type, provider);
    logInfo(`Notification provider registered: ${type}`);
  }

  /**
   * Register notification template
   * تسجيل قالب الإشعار
   */
  registerTemplate(name, template) {
    this.templates.set(name, template);
    logInfo(`Notification template registered: ${name}`);
  }

  /**
   * Set user preferences
   * تعيين تفضيلات المستخدم
   */
  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      enabledTypes: preferences.enabledTypes || Object.values(NOTIFICATION_TYPES),
      enabledCategories: preferences.enabledCategories || Object.values(NOTIFICATION_CATEGORIES),
      quietHours: preferences.quietHours || null,
      language: preferences.language || 'ar',
      timezone: preferences.timezone || 'Asia/Riyadh'
    });
  }

  /**
   * Get user preferences
   * الحصول على تفضيلات المستخدم
   */
  getUserPreferences(userId) {
    return this.userPreferences.get(userId) || {
      enabledTypes: Object.values(NOTIFICATION_TYPES),
      enabledCategories: Object.values(NOTIFICATION_CATEGORIES),
      quietHours: null,
      language: 'ar',
      timezone: 'Asia/Riyadh'
    };
  }

  /**
   * Add to delivery queue
   * إضافة إلى طابور التسليم
   */
  addToDeliveryQueue(notification) {
    this.deliveryQueue.push({
      ...notification,
      queuedAt: Date.now(),
      attempts: 0
    });
  }

  /**
   * Add to delivery history
   * إضافة إلى تاريخ التسليم
   */
  addToDeliveryHistory(notification, results) {
    this.deliveryHistory.unshift({
      id: notification.id,
      recipient: notification.recipient,
      types: notification.types,
      category: notification.category,
      priority: notification.priority,
      sentAt: Date.now(),
      results
    });

    // Limit history size
    if (this.deliveryHistory.length > this.maxHistorySize) {
      this.deliveryHistory = this.deliveryHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Update statistics
   * تحديث الإحصائيات
   */
  updateStatistics(results) {
    Object.values(results.results || {}).forEach(result => {
      if (result.success) {
        this.stats.sent++;
        if (result.delivered) this.stats.delivered++;
      } else {
        this.stats.failed++;
      }
    });
  }

  /**
   * Check if in quiet hours
   * فحص ما إذا كان في ساعات الهدوء
   */
  isInQuietHours(quietHours) {
    if (!quietHours || !quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    return currentHour >= quietHours.start || currentHour < quietHours.end;
  }

  /**
   * Generate notification ID
   * إنشاء معرف الإشعار
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Load user preferences
   * تحميل تفضيلات المستخدم
   */
  async loadUserPreferences() {
    try {
      // Load from API or local storage
      const response = await unifiedApiService.request('/notifications/preferences', {
        method: 'GET'
      });

      if (response.success && response.data) {
        Object.entries(response.data).forEach(([userId, prefs]) => {
          this.setUserPreferences(userId, prefs);
        });
      }
    } catch (error) {
      // Silently handle - use defaults
      logInfo('Using default user preferences');
    }
  }

  /**
   * Load notification templates
   * تحميل قوالب الإشعارات
   */
  async loadNotificationTemplates() {
    try {
      // Load from API or use defaults
      const response = await unifiedApiService.request('/notifications/templates', {
        method: 'GET'
      });

      if (response.success && response.data) {
        Object.entries(response.data).forEach(([name, template]) => {
          this.registerTemplate(name, template);
        });
      }
    } catch (error) {
      // Use default templates
      this.loadDefaultTemplates();
    }
  }

  /**
   * Load default templates
   * تحميل القوالب الافتراضية
   */
  loadDefaultTemplates() {
    // Default email template
    this.registerTemplate('default_email', {
      title: '{{title}}',
      message: '{{message}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>{{title}}</h2>
          <p>{{message}}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            الجمعية السعودية للعلوم السياسية
          </p>
        </div>
      `,
      metadata: {
        from: 'noreply@spsa.org.sa',
        replyTo: 'support@spsa.org.sa'
      }
    });

    // Default SMS template
    this.registerTemplate('default_sms', {
      message: '{{title}}: {{message}}'
    });

    // Default push template
    this.registerTemplate('default_push', {
      title: '{{title}}',
      message: '{{message}}',
      metadata: {
        icon: '/favicon.ico',
        badge: '/badge.png'
      }
    });
  }

  /**
   * Initialize providers
   * تهيئة مقدمي الخدمة
   */
  async initializeProviders() {
    // Providers will be registered by their respective services
    logInfo('Notification providers initialization ready');
  }

  /**
   * Get delivery statistics
   * الحصول على إحصائيات التسليم
   */
  getStatistics() {
    return {
      ...this.stats,
      queueSize: this.deliveryQueue.length,
      historySize: this.deliveryHistory.length,
      successRate: this.stats.sent > 0 ? (this.stats.delivered / this.stats.sent * 100).toFixed(2) : 0
    };
  }

  /**
   * Get delivery history
   * الحصول على تاريخ التسليم
   */
  getDeliveryHistory(limit = 50, filters = {}) {
    let history = [...this.deliveryHistory];

    // Apply filters
    if (filters.category) {
      history = history.filter(item => item.category === filters.category);
    }

    if (filters.recipient) {
      history = history.filter(item => item.recipient.id === filters.recipient);
    }

    if (filters.since) {
      history = history.filter(item => item.sentAt >= filters.since);
    }

    return history.slice(0, limit);
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
      userPreferencesCount: this.userPreferences.size,
      queueSize: this.deliveryQueue.length,
      statistics: this.getStatistics(),
      featuresEnabled: {
        notificationSystem: getFeatureFlag('ENABLE_NOTIFICATION_SYSTEM'),
        emailNotifications: getFeatureFlag('ENABLE_EMAIL_NOTIFICATIONS'),
        smsNotifications: getFeatureFlag('ENABLE_SMS_NOTIFICATIONS'),
        pushNotifications: getFeatureFlag('ENABLE_PUSH_NOTIFICATIONS'),
        inAppNotifications: getFeatureFlag('ENABLE_IN_APP_NOTIFICATIONS'),
        notificationTemplates: getFeatureFlag('ENABLE_NOTIFICATION_TEMPLATES'),
        userPreferences: getFeatureFlag('ENABLE_USER_PREFERENCES'),
        deliveryTracking: getFeatureFlag('ENABLE_DELIVERY_TRACKING')
      }
    };
  }
}

// Create and export singleton instance
const notificationCore = new NotificationCore();
export default notificationCore;
