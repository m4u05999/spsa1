/**
 * Push Notification Service
 * خدمة الإشعارات المنبثقة
 * 
 * Handles browser and mobile push notifications
 */

import { logError, logInfo } from '../../utils/monitoring.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import unifiedApiService from '../unifiedApiService.js';
import { DELIVERY_STATUS } from './notificationCore.js';

/**
 * Push Notification Types
 * أنواع الإشعارات المنبثقة
 */
export const PUSH_TYPES = {
  BROWSER: 'browser',
  MOBILE: 'mobile',
  WEB_PUSH: 'web_push'
};

/**
 * Push Notification Actions
 * إجراءات الإشعارات المنبثقة
 */
export const PUSH_ACTIONS = {
  VIEW: 'view',
  DISMISS: 'dismiss',
  REPLY: 'reply',
  ARCHIVE: 'archive'
};

/**
 * Push Notification Service Class
 * فئة خدمة الإشعارات المنبثقة
 */
class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.isSupported = false;
    this.permission = 'default';
    this.registration = null;
    this.subscriptions = new Map();
    this.deliveryTracking = new Map();
    this.config = {
      vapidPublicKey: null,
      applicationServerKey: null,
      icon: '/favicon.ico',
      badge: '/badge.png',
      defaultActions: [
        {
          action: 'view',
          title: 'عرض',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'إغلاق',
          icon: '/icons/dismiss.png'
        }
      ]
    };
    
    this.initialize();
  }

  /**
   * Initialize push notification service
   * تهيئة خدمة الإشعارات المنبثقة
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_PUSH_NOTIFICATIONS')) {
        logInfo('Push notifications are disabled');
        return;
      }

      // Check browser support
      this.checkBrowserSupport();
      
      if (!this.isSupported) {
        logInfo('Push notifications not supported in this browser');
        return;
      }

      // Load configuration
      await this.loadConfiguration();
      
      // Register service worker
      await this.registerServiceWorker();
      
      // Check current permission
      this.permission = Notification.permission;
      
      this.isInitialized = true;
      logInfo('Push notification service initialized');
      
    } catch (error) {
      logError('Failed to initialize push notification service', error);
      throw error;
    }
  }

  /**
   * Check browser support
   * فحص دعم المتصفح
   */
  checkBrowserSupport() {
    this.isSupported = (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /**
   * Request permission
   * طلب الإذن
   */
  async requestPermission() {
    try {
      if (!this.isSupported) {
        throw new Error('Push notifications not supported');
      }

      if (this.permission === 'granted') {
        return true;
      }

      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      return permission === 'granted';

    } catch (error) {
      logError('Failed to request push notification permission', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   * الاشتراك في الإشعارات المنبثقة
   */
  async subscribe(userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isSupported || this.permission !== 'granted') {
        throw new Error('Push notifications not available');
      }

      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Get or create subscription
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
        });
      }

      // Store subscription
      this.subscriptions.set(userId, {
        subscription,
        userId,
        subscribedAt: Date.now(),
        endpoint: subscription.endpoint
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(userId, subscription);

      logInfo(`Push subscription created for user: ${userId}`);
      return subscription;

    } catch (error) {
      logError('Failed to subscribe to push notifications', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   * إلغاء الاشتراك في الإشعارات المنبثقة
   */
  async unsubscribe(userId) {
    try {
      const userSubscription = this.subscriptions.get(userId);
      
      if (userSubscription) {
        await userSubscription.subscription.unsubscribe();
        this.subscriptions.delete(userId);
        
        // Remove subscription from server
        await this.removeSubscriptionFromServer(userId);
        
        logInfo(`Push subscription removed for user: ${userId}`);
        return true;
      }

      return false;

    } catch (error) {
      logError('Failed to unsubscribe from push notifications', error);
      return false;
    }
  }

  /**
   * Send push notification
   * إرسال إشعار منبثق
   */
  async send(notification) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate push notification
      const validatedNotification = this.validatePushNotification(notification);
      
      // Prepare push data
      const pushData = await this.preparePushData(validatedNotification);
      
      // Send push notification
      const result = await this.sendPushNotification(pushData);
      
      // Track delivery
      if (getFeatureFlag('ENABLE_DELIVERY_TRACKING')) {
        this.trackDelivery(notification.id, result);
      }
      
      return result;

    } catch (error) {
      logError('Failed to send push notification', error);
      return {
        success: false,
        error: error.message,
        status: DELIVERY_STATUS.FAILED
      };
    }
  }

  /**
   * Send local browser notification
   * إرسال إشعار محلي في المتصفح
   */
  async sendLocal(notification) {
    try {
      if (this.permission !== 'granted') {
        throw new Error('Permission not granted');
      }

      const options = {
        body: notification.message || notification.body,
        icon: notification.icon || this.config.icon,
        badge: notification.badge || this.config.badge,
        image: notification.image,
        data: notification.data || {},
        tag: notification.tag || notification.id,
        renotify: notification.renotify || false,
        requireInteraction: notification.requireInteraction || false,
        actions: notification.actions || this.config.defaultActions,
        timestamp: Date.now()
      };

      const browserNotification = new Notification(
        notification.title || 'إشعار جديد',
        options
      );

      // Handle notification events
      browserNotification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(notification, 'click');
        browserNotification.close();
      };

      browserNotification.onclose = () => {
        this.handleNotificationClick(notification, 'close');
      };

      browserNotification.onerror = (error) => {
        logError('Browser notification error', error);
      };

      // Auto-close after delay if specified
      if (notification.autoClose) {
        setTimeout(() => {
          browserNotification.close();
        }, notification.autoClose);
      }

      return {
        success: true,
        notificationId: notification.id,
        type: 'local',
        status: DELIVERY_STATUS.DELIVERED
      };

    } catch (error) {
      logError('Failed to send local notification', error);
      return {
        success: false,
        error: error.message,
        status: DELIVERY_STATUS.FAILED
      };
    }
  }

  /**
   * Validate push notification
   * التحقق من صحة الإشعار المنبثق
   */
  validatePushNotification(notification) {
    if (!notification.recipient?.id) {
      throw new Error('Recipient ID is required');
    }

    if (!notification.title && !notification.message) {
      throw new Error('Title or message is required');
    }

    return {
      ...notification,
      title: notification.title || 'إشعار جديد',
      message: notification.message || notification.body || '',
      icon: notification.icon || this.config.icon,
      badge: notification.badge || this.config.badge,
      data: notification.data || {},
      actions: notification.actions || this.config.defaultActions,
      requireInteraction: notification.requireInteraction || false,
      tag: notification.tag || notification.id
    };
  }

  /**
   * Prepare push data
   * إعداد بيانات الإشعار المنبثق
   */
  async preparePushData(notification) {
    return {
      title: notification.title,
      body: notification.message,
      icon: notification.icon,
      badge: notification.badge,
      image: notification.image,
      data: {
        ...notification.data,
        notificationId: notification.id,
        category: notification.category,
        priority: notification.priority,
        url: notification.data?.url || '/',
        timestamp: Date.now()
      },
      actions: notification.actions,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      renotify: notification.renotify || false
    };
  }

  /**
   * Send push notification via server
   * إرسال الإشعار المنبثق عبر الخادم
   */
  async sendPushNotification(pushData) {
    try {
      // Try to send via backend API
      const response = await unifiedApiService.request('/notifications/push/send', {
        method: 'POST',
        data: pushData
      });

      if (response.success) {
        return {
          success: true,
          messageId: response.data.messageId,
          status: DELIVERY_STATUS.SENT,
          recipients: response.data.recipients || 1
        };
      }

      // Fallback to local notification
      return await this.sendLocal(pushData);

    } catch (error) {
      logError('Server push failed, using local fallback', error);
      return await this.sendLocal(pushData);
    }
  }

  /**
   * Handle notification click
   * التعامل مع نقر الإشعار
   */
  handleNotificationClick(notification, action) {
    try {
      // Track interaction
      if (getFeatureFlag('ENABLE_DELIVERY_TRACKING')) {
        this.trackInteraction(notification.id, action);
      }

      // Handle specific actions
      switch (action) {
        case 'click':
          if (notification.data?.url) {
            window.open(notification.data.url, '_blank');
          }
          break;
        case 'view':
          if (notification.data?.url) {
            window.open(notification.data.url, '_blank');
          }
          break;
        case 'dismiss':
          // Just close - no additional action needed
          break;
        default:
          // Custom action handling
          if (notification.onAction) {
            notification.onAction(action);
          }
      }

    } catch (error) {
      logError('Failed to handle notification click', error);
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
      type: result.type || 'push',
      sentAt: Date.now(),
      interactions: []
    });
  }

  /**
   * Track interaction
   * تتبع التفاعل
   */
  trackInteraction(notificationId, action) {
    const tracking = this.deliveryTracking.get(notificationId);
    if (tracking) {
      tracking.interactions.push({
        action,
        timestamp: Date.now()
      });
      
      // Update status based on interaction
      if (action === 'click' || action === 'view') {
        tracking.status = DELIVERY_STATUS.CLICKED;
      }
    }
  }

  /**
   * Register service worker
   * تسجيل Service Worker
   */
  async registerServiceWorker() {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      this.registration = await navigator.serviceWorker.register('/sw.js');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      logInfo('Service worker registered successfully');

    } catch (error) {
      logError('Failed to register service worker', error);
      throw error;
    }
  }

  /**
   * Send subscription to server
   * إرسال الاشتراك إلى الخادم
   */
  async sendSubscriptionToServer(userId, subscription) {
    try {
      await unifiedApiService.request('/notifications/push/subscribe', {
        method: 'POST',
        data: {
          userId,
          subscription: subscription.toJSON()
        }
      });
    } catch (error) {
      // Silently handle - subscription stored locally
      logInfo('Subscription stored locally only');
    }
  }

  /**
   * Remove subscription from server
   * إزالة الاشتراك من الخادم
   */
  async removeSubscriptionFromServer(userId) {
    try {
      await unifiedApiService.request('/notifications/push/unsubscribe', {
        method: 'POST',
        data: { userId }
      });
    } catch (error) {
      // Silently handle
      logInfo('Subscription removed locally only');
    }
  }

  /**
   * Convert VAPID key
   * تحويل مفتاح VAPID
   */
  urlBase64ToUint8Array(base64String) {
    if (!base64String) {
      return null;
    }

    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Load configuration
   * تحميل التكوين
   */
  async loadConfiguration() {
    try {
      const response = await unifiedApiService.request('/notifications/push/config', {
        method: 'GET'
      });

      if (response.success && response.data) {
        this.config = { ...this.config, ...response.data };
      }
    } catch (error) {
      // Use default configuration
      logInfo('Using default push notification configuration');
    }
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
      clicked: tracking.filter(t => t.status === DELIVERY_STATUS.CLICKED).length,
      failed: tracking.filter(t => t.status === DELIVERY_STATUS.FAILED).length,
      interactions: tracking.reduce((sum, t) => sum + t.interactions.length, 0)
    };
  }

  /**
   * Get subscription status
   * الحصول على حالة الاشتراك
   */
  getSubscriptionStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      hasRegistration: !!this.registration,
      subscriptionsCount: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.values()).map(sub => ({
        userId: sub.userId,
        subscribedAt: sub.subscribedAt,
        endpoint: sub.endpoint.substring(0, 50) + '...' // Truncate for privacy
      }))
    };
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      isSupported: this.isSupported,
      permission: this.permission,
      hasRegistration: !!this.registration,
      subscriptionsCount: this.subscriptions.size,
      trackingCount: this.deliveryTracking.size,
      statistics: this.getDeliveryStatistics(),
      config: {
        icon: this.config.icon,
        badge: this.config.badge,
        hasVapidKey: !!this.config.vapidPublicKey
      }
    };
  }
}

// Create and export singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
