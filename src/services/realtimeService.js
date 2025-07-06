/**
 * Real-time Service
 * خدمة الميزات المباشرة
 * 
 * Integrates with UnifiedApiService and provides real-time functionality
 */

import websocketCore from './realtime/websocketCore.js';
import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';
import { ENV } from '../config/environment.js';

/**
 * Real-time Service Class
 * فئة خدمة الميزات المباشرة
 */
class RealtimeService {
  constructor() {
    this.isInitialized = false;
    this.subscriptions = new Map();
    this.notificationQueue = [];
    this.activityFeed = [];
    this.maxActivityFeedSize = 100;
    this.fallbackPollingInterval = null;
    this.fallbackPollingDelay = 30000; // 30 seconds

    // Intelligent backoff for polling
    this.pollingBackoff = {
      currentDelay: 30000, // Start with 30 seconds
      maxDelay: 300000,    // Max 5 minutes
      multiplier: 1.5,     // Increase by 50% each failure
      consecutiveFailures: 0
    };

    this.initialize();
  }

  /**
   * Initialize real-time service
   * تهيئة خدمة الميزات المباشرة
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
        logInfo('Real-time features are disabled');
        return;
      }

      // Setup WebSocket event listeners
      this.setupWebSocketListeners();
      
      // Setup fallback mechanisms
      this.setupFallbackMechanisms();
      
      this.isInitialized = true;
      logInfo('Real-time service initialized successfully');
      
    } catch (error) {
      logError('Failed to initialize real-time service', error);
      throw error;
    }
  }

  /**
   * Connect to real-time services with circuit breaker awareness
   * الاتصال بخدمات الميزات المباشرة مع مراعاة قاطع الدائرة
   */
  async connect() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if backend supports WebSocket
      const backendAvailable = await this.checkBackendWebSocketSupport();

      if (backendAvailable && getFeatureFlag('ENABLE_WEBSOCKET')) {
        try {
          // Connect via WebSocket
          await websocketCore.connect();
          logInfo('Connected to real-time services via WebSocket');
        } catch (error) {
          // If circuit breaker is open, don't log as error
          if (error.message.includes('circuit breaker')) {
            if (ENV.IS_DEVELOPMENT) {
              console.info('ℹ️ WebSocket circuit breaker active, using polling fallback');
            }
          } else {
            logError('WebSocket connection failed, using polling fallback', error);
          }
          this.startFallbackPolling();
        }
      } else {
        // Fallback to polling
        this.startFallbackPolling();
        logInfo('Using fallback polling for real-time features');
      }

    } catch (error) {
      logError('Failed to connect to real-time services', error);
      // Fallback to polling on connection failure
      this.startFallbackPolling();
    }
  }

  /**
   * Disconnect from real-time services
   * قطع الاتصال من خدمات الميزات المباشرة
   */
  disconnect() {
    try {
      websocketCore.disconnect();
      this.stopFallbackPolling();
      this.subscriptions.clear();
      logInfo('Disconnected from real-time services');
    } catch (error) {
      logError('Error during real-time service disconnect', error);
    }
  }

  /**
   * Subscribe to real-time updates
   * الاشتراك في التحديثات المباشرة
   */
  subscribe(channel, callback, options = {}) {
    try {
      const subscriptionId = this.generateSubscriptionId();
      
      const subscription = {
        id: subscriptionId,
        channel,
        callback,
        options,
        createdAt: Date.now(),
        isActive: true
      };

      this.subscriptions.set(subscriptionId, subscription);

      // Send subscription request via WebSocket
      if (websocketCore.isConnected) {
        websocketCore.send('subscribe', {
          subscriptionId,
          channel,
          options
        });
      }

      logInfo(`Subscribed to channel: ${channel}`);
      return subscriptionId;

    } catch (error) {
      logError(`Failed to subscribe to channel: ${channel}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from real-time updates
   * إلغاء الاشتراك في التحديثات المباشرة
   */
  unsubscribe(subscriptionId) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      
      if (subscription) {
        subscription.isActive = false;
        this.subscriptions.delete(subscriptionId);

        // Send unsubscribe request via WebSocket
        if (websocketCore.isConnected) {
          websocketCore.send('unsubscribe', {
            subscriptionId,
            channel: subscription.channel
          });
        }

        logInfo(`Unsubscribed from channel: ${subscription.channel}`);
        return true;
      }

      return false;

    } catch (error) {
      logError(`Failed to unsubscribe: ${subscriptionId}`, error);
      return false;
    }
  }

  /**
   * Send real-time notification
   * إرسال إشعار مباشر
   */
  async sendNotification(notification) {
    try {
      if (!getFeatureFlag('ENABLE_LIVE_NOTIFICATIONS')) {
        return false;
      }

      const enrichedNotification = {
        ...notification,
        id: this.generateNotificationId(),
        timestamp: Date.now(),
        source: 'realtime'
      };

      // Send via WebSocket if connected
      if (websocketCore.isConnected) {
        websocketCore.send('notification', enrichedNotification);
      } else {
        // Queue for later sending or use fallback
        this.queueNotification(enrichedNotification);
      }

      // Add to activity feed
      this.addToActivityFeed({
        type: 'notification',
        data: enrichedNotification
      });

      return true;

    } catch (error) {
      logError('Failed to send real-time notification', error);
      return false;
    }
  }

  /**
   * Broadcast real-time update
   * بث تحديث مباشر
   */
  async broadcastUpdate(updateType, data) {
    try {
      if (!getFeatureFlag('ENABLE_LIVE_UPDATES')) {
        return false;
      }

      const update = {
        type: updateType,
        data,
        timestamp: Date.now(),
        id: this.generateUpdateId()
      };

      // Send via WebSocket if connected
      if (websocketCore.isConnected) {
        websocketCore.send('update', update);
      } else {
        // Use fallback mechanism
        await this.sendUpdateViaFallback(update);
      }

      // Add to activity feed
      this.addToActivityFeed({
        type: 'update',
        data: update
      });

      return true;

    } catch (error) {
      logError('Failed to broadcast real-time update', error);
      return false;
    }
  }

  /**
   * Get activity feed
   * الحصول على تدفق الأنشطة
   */
  getActivityFeed(limit = 20, filters = {}) {
    try {
      let feed = [...this.activityFeed];

      // Apply filters
      if (filters.type) {
        feed = feed.filter(item => item.type === filters.type);
      }

      if (filters.since) {
        feed = feed.filter(item => item.data.timestamp >= filters.since);
      }

      if (filters.userId) {
        feed = feed.filter(item => 
          item.data.userId === filters.userId || 
          item.data.data?.userId === filters.userId
        );
      }

      // Sort by timestamp (newest first)
      feed.sort((a, b) => b.data.timestamp - a.data.timestamp);

      // Limit results
      return feed.slice(0, limit);

    } catch (error) {
      logError('Failed to get activity feed', error);
      return [];
    }
  }

  /**
   * Clear activity feed
   * مسح تدفق الأنشطة
   */
  clearActivityFeed() {
    this.activityFeed = [];
  }

  /**
   * Setup WebSocket event listeners
   * إعداد مستمعي أحداث WebSocket
   */
  setupWebSocketListeners() {
    // Connection events
    websocketCore.on('connected', (data) => {
      logInfo('WebSocket connected for real-time features');
      this.onWebSocketConnected(data);
    });

    websocketCore.on('disconnected', (data) => {
      // Only log if not due to circuit breaker
      if (data && data.code !== 1000) {
        logInfo('WebSocket disconnected for real-time features');
      }
      this.onWebSocketDisconnected(data);
    });

    websocketCore.on('error', (error) => {
      // Suppress WebSocket errors that are handled by circuit breaker
      if (!error.message?.includes('circuit breaker')) {
        logError('WebSocket error in real-time service', error);
      }
      this.onWebSocketError(error);
    });

    // Circuit breaker events
    websocketCore.on('circuitBreakerOpened', (data) => {
      if (ENV.IS_DEVELOPMENT) {
        console.info(`ℹ️ WebSocket circuit breaker opened, switching to polling for ${Math.round(data.cooldownTime/60000)} minutes`);
      }
      this.startFallbackPolling();
    });

    websocketCore.on('reconnectBlocked', () => {
      // Ensure fallback polling is active when reconnection is blocked
      if (!this.fallbackPollingInterval) {
        this.startFallbackPolling();
      }
    });

    // Message events
    websocketCore.on('notification', (data) => {
      this.handleIncomingNotification(data);
    });

    websocketCore.on('update', (data) => {
      this.handleIncomingUpdate(data);
    });

    websocketCore.on('activity', (data) => {
      this.handleIncomingActivity(data);
    });
  }

  /**
   * Handle WebSocket connected event
   * التعامل مع حدث اتصال WebSocket
   */
  onWebSocketConnected(data) {
    // Resubscribe to all active subscriptions
    for (const [subscriptionId, subscription] of this.subscriptions) {
      if (subscription.isActive) {
        websocketCore.send('subscribe', {
          subscriptionId,
          channel: subscription.channel,
          options: subscription.options
        });
      }
    }

    // Send queued notifications
    this.sendQueuedNotifications();
  }

  /**
   * Handle WebSocket disconnected event
   * التعامل مع حدث قطع اتصال WebSocket
   */
  onWebSocketDisconnected(data) {
    // Start fallback polling if not intentional disconnect
    if (data && data.code !== 1000) {
      this.startFallbackPolling();
    } else if (!data) {
      // If no data provided, assume unexpected disconnect
      this.startFallbackPolling();
    }
  }

  /**
   * Handle WebSocket error event
   * التعامل مع حدث خطأ WebSocket
   */
  onWebSocketError(error) {
    // Start fallback polling on error
    this.startFallbackPolling();
  }

  /**
   * Handle incoming notification
   * التعامل مع الإشعار الوارد
   */
  handleIncomingNotification(data) {
    // Add to activity feed
    this.addToActivityFeed({
      type: 'notification',
      data
    });

    // Notify relevant subscriptions
    this.notifySubscriptions('notification', data);
  }

  /**
   * Handle incoming update
   * التعامل مع التحديث الوارد
   */
  handleIncomingUpdate(data) {
    // Add to activity feed
    this.addToActivityFeed({
      type: 'update',
      data
    });

    // Notify relevant subscriptions
    this.notifySubscriptions('update', data);
    this.notifySubscriptions(data.type, data.data);
  }

  /**
   * Handle incoming activity
   * التعامل مع النشاط الوارد
   */
  handleIncomingActivity(data) {
    // Add to activity feed
    this.addToActivityFeed({
      type: 'activity',
      data
    });

    // Notify relevant subscriptions
    this.notifySubscriptions('activity', data);
  }

  /**
   * Notify subscriptions
   * إشعار الاشتراكات
   */
  notifySubscriptions(channel, data) {
    for (const [subscriptionId, subscription] of this.subscriptions) {
      if (subscription.isActive && subscription.channel === channel) {
        try {
          subscription.callback(data);
        } catch (error) {
          logError(`Error in subscription callback for ${channel}`, error);
        }
      }
    }
  }

  /**
   * Add to activity feed
   * إضافة إلى تدفق الأنشطة
   */
  addToActivityFeed(activity) {
    this.activityFeed.unshift(activity);
    
    // Limit feed size
    if (this.activityFeed.length > this.maxActivityFeedSize) {
      this.activityFeed = this.activityFeed.slice(0, this.maxActivityFeedSize);
    }
  }

  /**
   * Queue notification for later sending
   * وضع الإشعار في الطابور للإرسال لاحقاً
   */
  queueNotification(notification) {
    this.notificationQueue.push(notification);
    
    // Limit queue size
    if (this.notificationQueue.length > 50) {
      this.notificationQueue.shift();
    }
  }

  /**
   * Send queued notifications
   * إرسال الإشعارات المطابورة
   */
  sendQueuedNotifications() {
    while (this.notificationQueue.length > 0 && websocketCore.isConnected) {
      const notification = this.notificationQueue.shift();
      websocketCore.send('notification', notification);
    }
  }

  /**
   * Setup fallback mechanisms
   * إعداد آليات الاحتياط
   */
  setupFallbackMechanisms() {
    // Setup polling for when WebSocket is not available
    this.fallbackPollingEnabled = true;
  }

  /**
   * Start fallback polling with intelligent backoff
   * بدء استطلاع الاحتياط مع تأخير ذكي
   */
  startFallbackPolling() {
    if (this.fallbackPollingInterval) {
      return; // Already polling
    }

    // In development, check if we should skip polling entirely
    if (ENV.IS_DEVELOPMENT && !unifiedApiService.isNewBackendAvailable) {
      // Use longer intervals for Supabase-only polling
      this.pollingBackoff.currentDelay = 60000; // 1 minute for Supabase
      this.pollingBackoff.maxDelay = 300000; // 5 minutes max
    }

    // Only log once to avoid spam
    if (this.pollingBackoff.consecutiveFailures === 0) {
      const source = unifiedApiService.isNewBackendAvailable ? 'backend' : 'Supabase';
      logInfo(`Starting intelligent fallback polling for real-time features (${source})`);
    }

    const scheduleNextPoll = () => {
      const delay = Math.min(this.pollingBackoff.currentDelay, this.pollingBackoff.maxDelay);

      this.fallbackPollingInterval = setTimeout(async () => {
        try {
          await this.pollForUpdates();

          // Reset backoff on success
          this.pollingBackoff.consecutiveFailures = 0;

          // Check circuit breaker state for delay calculation
          const circuitBreakerState = unifiedApiService.getCircuitBreakerState();
          const isBackendBlocked = circuitBreakerState?.newBackend?.isOpen ||
                                  !unifiedApiService.isNewBackendAvailable;
          this.pollingBackoff.currentDelay = isBackendBlocked ? 60000 : 30000;

        } catch (error) {
          // Increase backoff on failure
          this.pollingBackoff.consecutiveFailures++;
          this.pollingBackoff.currentDelay = Math.min(
            this.pollingBackoff.currentDelay * this.pollingBackoff.multiplier,
            this.pollingBackoff.maxDelay
          );

          // Only log errors occasionally to reduce noise
          if (this.pollingBackoff.consecutiveFailures % 10 === 1) { // Reduced frequency
            logError(`Real-time polling failed (${this.pollingBackoff.consecutiveFailures} consecutive failures)`, error);
          }
        } finally {
          // Schedule next poll
          this.fallbackPollingInterval = null;
          scheduleNextPoll();
        }
      }, delay);
    };

    scheduleNextPoll();
  }

  /**
   * Stop fallback polling
   * إيقاف استطلاع الاحتياط
   */
  stopFallbackPolling() {
    if (this.fallbackPollingInterval) {
      clearInterval(this.fallbackPollingInterval);
      this.fallbackPollingInterval = null;
      logInfo('Stopped fallback polling');
    }
  }

  /**
   * Poll for updates (fallback mechanism)
   * استطلاع التحديثات (آلية الاحتياط)
   */
  async pollForUpdates() {
    try {
      // Check if backend is available AND circuit breaker is closed
      const circuitBreakerState = unifiedApiService.getCircuitBreakerState();
      const isBackendBlocked = circuitBreakerState?.newBackend?.isOpen ||
                              !unifiedApiService.isNewBackendAvailable;

      if (isBackendBlocked) {
        // Use Supabase fallback for real-time updates
        await this.pollSupabaseUpdates();
        return;
      }

      // Get updates from API (only if circuit breaker allows it)
      const response = await unifiedApiService.request('/realtime/updates', {
        method: 'GET',
        params: {
          since: this.getLastUpdateTimestamp()
        }
      });

      if (response.success && response.data.updates) {
        response.data.updates.forEach(update => {
          this.handleIncomingUpdate(update);
        });
      }

    } catch (error) {
      // If backend fails, switch to Supabase
      if (error.message.includes('ERR_CONNECTION_REFUSED') ||
          error.message.includes('Network request failed')) {
        await this.pollSupabaseUpdates();
      } else {
        logError('Polling for updates failed', error);
      }
    }
  }

  /**
   * Poll Supabase for real-time updates
   * استطلاع Supabase للتحديثات المباشرة
   */
  async pollSupabaseUpdates() {
    try {
      // Use Supabase for real-time updates
      const response = await unifiedApiService.request('/activity-feed', {
        method: 'GET',
        requestType: 'SUPABASE_ONLY',
        params: {
          limit: 10,
          since: this.getLastUpdateTimestamp()
        }
      });

      if (response.success && response.data) {
        this.processPolledUpdates(response.data);
      }

    } catch (error) {
      // Silently handle Supabase polling errors
      if (ENV.IS_DEVELOPMENT && this.pollingBackoff.consecutiveFailures % 10 === 1) {
        console.warn('Supabase polling failed:', error.message);
      }
    }
  }

  /**
   * Send update via fallback
   * إرسال التحديث عبر الاحتياط
   */
  async sendUpdateViaFallback(update) {
    try {
      await unifiedApiService.request('/realtime/broadcast', {
        method: 'POST',
        data: update
      });
    } catch (error) {
      logError('Failed to send update via fallback', error);
    }
  }

  /**
   * Check backend WebSocket support
   * فحص دعم WebSocket في الخادم
   */
  async checkBackendWebSocketSupport() {
    try {
      // In development, check UnifiedApiService status first
      if (ENV.IS_DEVELOPMENT && !unifiedApiService.isNewBackendAvailable) {
        return false;
      }

      // Quick check with short timeout
      const response = await unifiedApiService.request('/realtime/status', {
        method: 'GET',
        timeout: 1000 // 1 second timeout
      });

      return response.success && response.data?.websocketSupported;
    } catch (error) {
      // Don't log connection refused errors in development
      if (ENV.IS_DEVELOPMENT && error.message.includes('ERR_CONNECTION_REFUSED')) {
        return false;
      }

      if (ENV.IS_DEVELOPMENT) {
        console.warn('Backend WebSocket support check failed:', error.message);
      }
      return false;
    }
  }

  /**
   * Get last update timestamp
   * الحصول على طابع زمني آخر تحديث
   */
  getLastUpdateTimestamp() {
    if (this.activityFeed.length > 0) {
      return this.activityFeed[0].data.timestamp;
    }
    return Date.now() - (5 * 60 * 1000); // Last 5 minutes
  }

  /**
   * Generate unique IDs
   * إنشاء معرفات فريدة
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  generateUpdateId() {
    return `update_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      websocketStatus: websocketCore.getStatus(),
      subscriptionsCount: this.subscriptions.size,
      activityFeedSize: this.activityFeed.length,
      queuedNotifications: this.notificationQueue.length,
      fallbackPollingActive: !!this.fallbackPollingInterval,
      featuresEnabled: {
        realTimeFeatures: getFeatureFlag('ENABLE_REAL_TIME_FEATURES'),
        websocket: getFeatureFlag('ENABLE_WEBSOCKET'),
        liveNotifications: getFeatureFlag('ENABLE_LIVE_NOTIFICATIONS'),
        liveUpdates: getFeatureFlag('ENABLE_LIVE_UPDATES'),
        activityFeed: getFeatureFlag('ENABLE_ACTIVITY_FEED')
      }
    };
  }
}

// Create and export singleton instance
const realtimeService = new RealtimeService();
export default realtimeService;
