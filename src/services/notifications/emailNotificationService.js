/**
 * Email Notification Service
 * خدمة إشعارات البريد الإلكتروني
 * 
 * Handles email notifications with templates and delivery tracking
 */

import { logError, logInfo } from '../../utils/monitoring.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import unifiedApiService from '../unifiedApiService.js';
import { DELIVERY_STATUS } from './notificationCore.js';

/**
 * Email Providers
 * مقدمو خدمة البريد الإلكتروني
 */
export const EMAIL_PROVIDERS = {
  SMTP: 'smtp',
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  SES: 'ses', // Amazon SES
  OUTLOOK: 'outlook'
};

/**
 * Email Notification Service Class
 * فئة خدمة إشعارات البريد الإلكتروني
 */
class EmailNotificationService {
  constructor() {
    this.isInitialized = false;
    this.provider = EMAIL_PROVIDERS.SMTP; // Default provider
    this.config = {
      from: 'noreply@spsa.org.sa',
      replyTo: 'support@spsa.org.sa',
      maxRetries: 3,
      retryDelay: 5000,
      timeout: 30000
    };
    this.deliveryTracking = new Map();
    this.templates = new Map();
    
    this.initialize();
  }

  /**
   * Initialize email service
   * تهيئة خدمة البريد الإلكتروني
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_EMAIL_NOTIFICATIONS')) {
        logInfo('Email notifications are disabled');
        return;
      }

      // Load configuration
      await this.loadConfiguration();
      
      // Load email templates
      await this.loadEmailTemplates();
      
      this.isInitialized = true;
      logInfo('Email notification service initialized');
      
    } catch (error) {
      logError('Failed to initialize email notification service', error);
      throw error;
    }
  }

  /**
   * Send email notification
   * إرسال إشعار بريد إلكتروني
   */
  async send(notification) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate email notification
      const validatedNotification = this.validateEmailNotification(notification);
      
      // Prepare email data
      const emailData = await this.prepareEmailData(validatedNotification);
      
      // Send email based on provider
      const result = await this.sendViaProvider(emailData);
      
      // Track delivery
      if (getFeatureFlag('ENABLE_DELIVERY_TRACKING')) {
        this.trackDelivery(notification.id, result);
      }
      
      return result;

    } catch (error) {
      logError('Failed to send email notification', error);
      return {
        success: false,
        error: error.message,
        status: DELIVERY_STATUS.FAILED
      };
    }
  }

  /**
   * Send bulk email notifications
   * إرسال إشعارات بريد إلكتروني مجمعة
   */
  async sendBulk(notifications) {
    try {
      const results = [];
      const batchSize = 10; // Process in batches to avoid overwhelming the server
      
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const batchPromises = batch.map(notification => this.send(notification));
        
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
      logError('Failed to send bulk email notifications', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate email notification
   * التحقق من صحة إشعار البريد الإلكتروني
   */
  validateEmailNotification(notification) {
    if (!notification.recipient?.email) {
      throw new Error('Email recipient is required');
    }

    if (!this.isValidEmail(notification.recipient.email)) {
      throw new Error('Invalid email address');
    }

    return {
      ...notification,
      from: notification.from || this.config.from,
      replyTo: notification.replyTo || this.config.replyTo,
      subject: notification.title || notification.subject || 'إشعار من الجمعية السعودية للعلوم السياسية',
      html: notification.html || this.generateDefaultHtml(notification),
      text: notification.message || notification.text || '',
      attachments: notification.attachments || []
    };
  }

  /**
   * Prepare email data
   * إعداد بيانات البريد الإلكتروني
   */
  async prepareEmailData(notification) {
    const emailData = {
      from: notification.from,
      to: notification.recipient.email,
      replyTo: notification.replyTo,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
      attachments: notification.attachments,
      headers: {
        'X-Notification-ID': notification.id,
        'X-Category': notification.category,
        'X-Priority': notification.priority
      }
    };

    // Add tracking pixels if enabled
    if (getFeatureFlag('ENABLE_DELIVERY_TRACKING')) {
      emailData.html = this.addTrackingPixel(emailData.html, notification.id);
    }

    // Add unsubscribe link
    emailData.html = this.addUnsubscribeLink(emailData.html, notification.recipient.id);

    return emailData;
  }

  /**
   * Send via provider
   * الإرسال عبر مقدم الخدمة
   */
  async sendViaProvider(emailData) {
    try {
      // Try to send via backend API first
      const response = await unifiedApiService.request('/notifications/email/send', {
        method: 'POST',
        data: emailData
      });

      if (response.success) {
        return {
          success: true,
          messageId: response.data.messageId,
          status: DELIVERY_STATUS.SENT,
          provider: this.provider
        };
      }

      // Fallback to client-side simulation
      return await this.sendViaFallback(emailData);

    } catch (error) {
      logError('Provider send failed, using fallback', error);
      return await this.sendViaFallback(emailData);
    }
  }

  /**
   * Send via fallback (simulation)
   * الإرسال عبر البديل (محاكاة)
   */
  async sendViaFallback(emailData) {
    // Simulate email sending for development/demo
    logInfo(`Simulating email send to: ${emailData.to}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: DELIVERY_STATUS.SENT,
        provider: 'simulation',
        simulation: true
      };
    } else {
      throw new Error('Simulated email delivery failure');
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
        
        logInfo(`Email delivery status updated: ${messageId} -> ${status}`);
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
      logError('Failed to handle webhook event', error);
    }
  }

  /**
   * Generate default HTML
   * إنشاء HTML افتراضي
   */
  generateDefaultHtml(notification) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.subject}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>الجمعية السعودية للعلوم السياسية</h1>
          </div>
          <div class="content">
            <h2>${notification.title || notification.subject}</h2>
            <p>${notification.message || notification.text}</p>
            ${notification.data?.actionUrl ? `<a href="${notification.data.actionUrl}" class="button">عرض التفاصيل</a>` : ''}
          </div>
          <div class="footer">
            <p>هذا إشعار تلقائي من الجمعية السعودية للعلوم السياسية</p>
            <p>إذا كنت لا ترغب في تلقي هذه الإشعارات، يمكنك <a href="{{unsubscribeUrl}}">إلغاء الاشتراك</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Add tracking pixel
   * إضافة بكسل التتبع
   */
  addTrackingPixel(html, notificationId) {
    const trackingPixel = `<img src="/api/notifications/track/open/${notificationId}" width="1" height="1" style="display:none;" alt="">`;
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  /**
   * Add unsubscribe link
   * إضافة رابط إلغاء الاشتراك
   */
  addUnsubscribeLink(html, userId) {
    const unsubscribeUrl = `/unsubscribe?user=${userId}&token=${this.generateUnsubscribeToken(userId)}`;
    return html.replace('{{unsubscribeUrl}}', unsubscribeUrl);
  }

  /**
   * Generate unsubscribe token
   * إنشاء رمز إلغاء الاشتراك
   */
  generateUnsubscribeToken(userId) {
    // Simple token generation - in production, use proper JWT or similar
    return btoa(`${userId}:${Date.now()}`);
  }

  /**
   * Validate email address
   * التحقق من صحة عنوان البريد الإلكتروني
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Load configuration
   * تحميل التكوين
   */
  async loadConfiguration() {
    try {
      const response = await unifiedApiService.request('/notifications/email/config', {
        method: 'GET'
      });

      if (response.success && response.data) {
        this.config = { ...this.config, ...response.data };
        this.provider = response.data.provider || this.provider;
      }
    } catch (error) {
      // Use default configuration
      logInfo('Using default email configuration');
    }
  }

  /**
   * Load email templates
   * تحميل قوالب البريد الإلكتروني
   */
  async loadEmailTemplates() {
    try {
      const response = await unifiedApiService.request('/notifications/email/templates', {
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
    // Welcome email template
    this.templates.set('welcome', {
      subject: 'مرحباً بك في الجمعية السعودية للعلوم السياسية',
      html: this.generateWelcomeTemplate()
    });

    // Password reset template
    this.templates.set('password_reset', {
      subject: 'إعادة تعيين كلمة المرور',
      html: this.generatePasswordResetTemplate()
    });

    // Notification template
    this.templates.set('notification', {
      subject: '{{title}}',
      html: this.generateNotificationTemplate()
    });
  }

  /**
   * Generate welcome template
   * إنشاء قالب الترحيب
   */
  generateWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>مرحباً بك</title>
      </head>
      <body>
        <h1>مرحباً {{userName}}</h1>
        <p>نرحب بك في الجمعية السعودية للعلوم السياسية</p>
        <p>يمكنك الآن الوصول إلى جميع الخدمات والموارد المتاحة</p>
        <a href="{{loginUrl}}">تسجيل الدخول</a>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset template
   * إنشاء قالب إعادة تعيين كلمة المرور
   */
  generatePasswordResetTemplate() {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إعادة تعيين كلمة المرور</title>
      </head>
      <body>
        <h1>إعادة تعيين كلمة المرور</h1>
        <p>تم طلب إعادة تعيين كلمة المرور لحسابك</p>
        <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
        <a href="{{resetUrl}}">إعادة تعيين كلمة المرور</a>
        <p>هذا الرابط صالح لمدة 24 ساعة فقط</p>
      </body>
      </html>
    `;
  }

  /**
   * Generate notification template
   * إنشاء قالب الإشعار
   */
  generateNotificationTemplate() {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>{{title}}</title>
      </head>
      <body>
        <h1>{{title}}</h1>
        <p>{{message}}</p>
        {{#actionUrl}}
        <a href="{{actionUrl}}">عرض التفاصيل</a>
        {{/actionUrl}}
      </body>
      </html>
    `;
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
      bounced: tracking.filter(t => t.status === DELIVERY_STATUS.BOUNCED).length,
      opened: tracking.filter(t => t.status === DELIVERY_STATUS.OPENED).length,
      clicked: tracking.filter(t => t.status === DELIVERY_STATUS.CLICKED).length
    };
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
      statistics: this.getDeliveryStatistics(),
      config: {
        from: this.config.from,
        replyTo: this.config.replyTo,
        maxRetries: this.config.maxRetries
      }
    };
  }
}

// Create and export singleton instance
const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
