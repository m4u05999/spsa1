/**
 * SMS Notification Service
 * خدمة إشعارات الرسائل النصية
 * 
 * Handles SMS notifications with Saudi telecom providers
 */

import { logError, logInfo } from '../../utils/monitoring.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import unifiedApiService from '../unifiedApiService.js';
import { DELIVERY_STATUS } from './notificationCore.js';

/**
 * Saudi SMS Providers
 * مقدمو خدمة الرسائل النصية السعوديين
 */
export const SMS_PROVIDERS = {
  STC: 'stc',
  MOBILY: 'mobily',
  ZAIN: 'zain',
  UNIFIED: 'unified', // Unified SMS gateway
  TAQNYAT: 'taqnyat', // Popular SMS service in Saudi
  MSEGAT: 'msegat' // Another popular SMS service
};

/**
 * SMS Message Types
 * أنواع الرسائل النصية
 */
export const SMS_TYPES = {
  TRANSACTIONAL: 'transactional',
  PROMOTIONAL: 'promotional',
  OTP: 'otp',
  ALERT: 'alert'
};

/**
 * SMS Notification Service Class
 * فئة خدمة إشعارات الرسائل النصية
 */
class SmsNotificationService {
  constructor() {
    this.isInitialized = false;
    this.provider = SMS_PROVIDERS.UNIFIED; // Default provider
    this.config = {
      senderId: 'SPSA',
      maxLength: 160,
      maxRetries: 3,
      retryDelay: 5000,
      timeout: 30000,
      enableUnicode: true
    };
    this.deliveryTracking = new Map();
    this.templates = new Map();
    this.rateLimits = new Map(); // Rate limiting per phone number
    
    this.initialize();
  }

  /**
   * Initialize SMS service
   * تهيئة خدمة الرسائل النصية
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_SMS_NOTIFICATIONS')) {
        logInfo('SMS notifications are disabled');
        return;
      }

      // Load configuration
      await this.loadConfiguration();
      
      // Load SMS templates
      await this.loadSmsTemplates();
      
      this.isInitialized = true;
      logInfo('SMS notification service initialized');
      
    } catch (error) {
      logError('Failed to initialize SMS notification service', error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   * إرسال إشعار رسالة نصية
   */
  async send(notification) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate SMS notification
      const validatedNotification = this.validateSmsNotification(notification);
      
      // Check rate limits
      if (!this.checkRateLimit(validatedNotification.recipient.phone)) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          status: DELIVERY_STATUS.FAILED
        };
      }
      
      // Prepare SMS data
      const smsData = await this.prepareSmsData(validatedNotification);
      
      // Send SMS based on provider
      const result = await this.sendViaProvider(smsData);
      
      // Track delivery
      if (getFeatureFlag('ENABLE_DELIVERY_TRACKING')) {
        this.trackDelivery(notification.id, result);
      }
      
      // Update rate limits
      this.updateRateLimit(validatedNotification.recipient.phone);
      
      return result;

    } catch (error) {
      logError('Failed to send SMS notification', error);
      return {
        success: false,
        error: error.message,
        status: DELIVERY_STATUS.FAILED
      };
    }
  }

  /**
   * Send bulk SMS notifications
   * إرسال إشعارات رسائل نصية مجمعة
   */
  async sendBulk(notifications) {
    try {
      const results = [];
      const batchSize = 5; // Smaller batch size for SMS to respect rate limits
      
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const batchPromises = batch.map(notification => this.send(notification));
        
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
        ));
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < notifications.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return {
        success: true,
        total: notifications.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };

    } catch (error) {
      logError('Failed to send bulk SMS notifications', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate SMS notification
   * التحقق من صحة إشعار الرسالة النصية
   */
  validateSmsNotification(notification) {
    if (!notification.recipient?.phone) {
      throw new Error('Phone number is required');
    }

    const phone = this.normalizePhoneNumber(notification.recipient.phone);
    if (!this.isValidSaudiPhone(phone)) {
      throw new Error('Invalid Saudi phone number');
    }

    const message = notification.message || notification.text || '';
    if (!message.trim()) {
      throw new Error('SMS message is required');
    }

    if (message.length > this.config.maxLength) {
      throw new Error(`SMS message too long (max ${this.config.maxLength} characters)`);
    }

    return {
      ...notification,
      recipient: {
        ...notification.recipient,
        phone
      },
      message: message.trim(),
      senderId: notification.senderId || this.config.senderId,
      type: notification.type || SMS_TYPES.TRANSACTIONAL,
      unicode: this.containsArabic(message) || notification.unicode || false
    };
  }

  /**
   * Prepare SMS data
   * إعداد بيانات الرسالة النصية
   */
  async prepareSmsData(notification) {
    const smsData = {
      to: notification.recipient.phone,
      message: notification.message,
      senderId: notification.senderId,
      type: notification.type,
      unicode: notification.unicode,
      headers: {
        'X-Notification-ID': notification.id,
        'X-Category': notification.category,
        'X-Priority': notification.priority
      }
    };

    // Add delivery receipt request if tracking is enabled
    if (getFeatureFlag('ENABLE_DELIVERY_TRACKING')) {
      smsData.deliveryReceipt = true;
      smsData.callbackUrl = `/api/notifications/sms/webhook/${notification.id}`;
    }

    return smsData;
  }

  /**
   * Send via provider
   * الإرسال عبر مقدم الخدمة
   */
  async sendViaProvider(smsData) {
    try {
      // Try to send via backend API first
      const response = await unifiedApiService.request('/notifications/sms/send', {
        method: 'POST',
        data: {
          ...smsData,
          provider: this.provider
        }
      });

      if (response.success) {
        return {
          success: true,
          messageId: response.data.messageId,
          status: DELIVERY_STATUS.SENT,
          provider: this.provider,
          cost: response.data.cost || 0
        };
      }

      // Fallback to client-side simulation
      return await this.sendViaFallback(smsData);

    } catch (error) {
      logError('Provider send failed, using fallback', error);
      return await this.sendViaFallback(smsData);
    }
  }

  /**
   * Send via fallback (simulation)
   * الإرسال عبر البديل (محاكاة)
   */
  async sendViaFallback(smsData) {
    // Simulate SMS sending for development/demo
    logInfo(`Simulating SMS send to: ${smsData.to}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure (90% success rate for SMS)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: DELIVERY_STATUS.SENT,
        provider: 'simulation',
        cost: 0.05, // Simulated cost in SAR
        simulation: true
      };
    } else {
      throw new Error('Simulated SMS delivery failure');
    }
  }

  /**
   * Track delivery
   * تتبع التسليم
   */
  trackDelivery(notificationId, result) {
    this.deliveryTracking.set(notificationId, {
      notificationId,
      status: result.status,
      messageId: result.messageId,
      provider: result.provider,
      cost: result.cost || 0,
      sentAt: Date.now(),
      attempts: 1,
      lastAttempt: Date.now()
    });
  }

  /**
   * Update delivery status
   * تحديث حالة التسليم
   */
  updateDeliveryStatus(messageId, status, metadata = {}) {
    for (const [notificationId, tracking] of this.deliveryTracking) {
      if (tracking.messageId === messageId) {
        tracking.status = status;
        tracking.updatedAt = Date.now();
        tracking.metadata = { ...tracking.metadata, ...metadata };
        
        logInfo(`SMS delivery status updated: ${messageId} -> ${status}`);
        break;
      }
    }
  }

  /**
   * Handle webhook events
   * التعامل مع أحداث Webhook
   */
  handleWebhookEvent(event) {
    try {
      const { messageId, status, timestamp, metadata } = event;
      
      this.updateDeliveryStatus(messageId, status, {
        ...metadata,
        webhookTimestamp: timestamp
      });

    } catch (error) {
      logError('Failed to handle SMS webhook event', error);
    }
  }

  /**
   * Check rate limit
   * فحص حد المعدل
   */
  checkRateLimit(phoneNumber) {
    const now = Date.now();
    const limit = this.rateLimits.get(phoneNumber);
    
    if (!limit) {
      return true; // No previous limit
    }

    // Allow 5 SMS per hour per phone number
    const hourlyLimit = 5;
    const timeWindow = 60 * 60 * 1000; // 1 hour
    
    if (now - limit.firstSent > timeWindow) {
      // Reset limit after time window
      this.rateLimits.delete(phoneNumber);
      return true;
    }

    return limit.count < hourlyLimit;
  }

  /**
   * Update rate limit
   * تحديث حد المعدل
   */
  updateRateLimit(phoneNumber) {
    const now = Date.now();
    const limit = this.rateLimits.get(phoneNumber);
    
    if (!limit) {
      this.rateLimits.set(phoneNumber, {
        count: 1,
        firstSent: now,
        lastSent: now
      });
    } else {
      limit.count++;
      limit.lastSent = now;
    }
  }

  /**
   * Normalize phone number
   * تطبيع رقم الهاتف
   */
  normalizePhoneNumber(phone) {
    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');
    
    // Handle Saudi phone numbers
    if (normalized.startsWith('966')) {
      // Already has country code
      return `+${normalized}`;
    } else if (normalized.startsWith('0')) {
      // Remove leading zero and add country code
      return `+966${normalized.substring(1)}`;
    } else if (normalized.length === 9) {
      // Add country code
      return `+966${normalized}`;
    }
    
    return `+${normalized}`;
  }

  /**
   * Validate Saudi phone number
   * التحقق من صحة رقم الهاتف السعودي
   */
  isValidSaudiPhone(phone) {
    // Saudi phone number patterns
    const saudiPatterns = [
      /^\+9665[0-9]{8}$/, // STC
      /^\+9665[0-9]{8}$/, // Mobily
      /^\+9665[0-9]{8}$/, // Zain
      /^\+9665[0-9]{8}$/, // Other operators
    ];
    
    return saudiPatterns.some(pattern => pattern.test(phone));
  }

  /**
   * Check if text contains Arabic
   * فحص ما إذا كان النص يحتوي على العربية
   */
  containsArabic(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }

  /**
   * Load configuration
   * تحميل التكوين
   */
  async loadConfiguration() {
    try {
      const response = await unifiedApiService.request('/notifications/sms/config', {
        method: 'GET'
      });

      if (response.success && response.data) {
        this.config = { ...this.config, ...response.data };
        this.provider = response.data.provider || this.provider;
      }
    } catch (error) {
      // Use default configuration
      logInfo('Using default SMS configuration');
    }
  }

  /**
   * Load SMS templates
   * تحميل قوالب الرسائل النصية
   */
  async loadSmsTemplates() {
    try {
      const response = await unifiedApiService.request('/notifications/sms/templates', {
        method: 'GET'
      });

      if (response.success && response.data) {
        Object.entries(response.data).forEach(([name, template]) => {
          this.templates.set(name, template);
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
    // OTP template
    this.templates.set('otp', {
      message: 'رمز التحقق الخاص بك: {{code}}. صالح لمدة {{minutes}} دقائق.',
      type: SMS_TYPES.OTP
    });

    // Welcome template
    this.templates.set('welcome', {
      message: 'مرحباً {{name}}! تم تفعيل حسابك في الجمعية السعودية للعلوم السياسية.',
      type: SMS_TYPES.TRANSACTIONAL
    });

    // Password reset template
    this.templates.set('password_reset', {
      message: 'تم طلب إعادة تعيين كلمة المرور. الرمز: {{code}}',
      type: SMS_TYPES.TRANSACTIONAL
    });

    // Notification template
    this.templates.set('notification', {
      message: '{{title}}: {{message}}',
      type: SMS_TYPES.ALERT
    });
  }

  /**
   * Get delivery statistics
   * الحصول على إحصائيات التسليم
   */
  getDeliveryStatistics() {
    const tracking = Array.from(this.deliveryTracking.values());
    
    return {
      total: tracking.length,
      sent: tracking.filter(t => t.status === DELIVERY_STATUS.SENT).length,
      delivered: tracking.filter(t => t.status === DELIVERY_STATUS.DELIVERED).length,
      failed: tracking.filter(t => t.status === DELIVERY_STATUS.FAILED).length,
      totalCost: tracking.reduce((sum, t) => sum + (t.cost || 0), 0).toFixed(2)
    };
  }

  /**
   * Get rate limit status
   * الحصول على حالة حد المعدل
   */
  getRateLimitStatus() {
    const now = Date.now();
    const activeLimits = [];
    
    for (const [phone, limit] of this.rateLimits) {
      if (now - limit.firstSent < 60 * 60 * 1000) { // Within 1 hour
        activeLimits.push({
          phone,
          count: limit.count,
          remaining: Math.max(0, 5 - limit.count),
          resetAt: limit.firstSent + (60 * 60 * 1000)
        });
      }
    }
    
    return activeLimits;
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      provider: this.provider,
      templatesCount: this.templates.size,
      trackingCount: this.deliveryTracking.size,
      activeLimits: this.getRateLimitStatus().length,
      statistics: this.getDeliveryStatistics(),
      config: {
        senderId: this.config.senderId,
        maxLength: this.config.maxLength,
        enableUnicode: this.config.enableUnicode
      }
    };
  }
}

// Create and export singleton instance
const smsNotificationService = new SmsNotificationService();
export default smsNotificationService;
