/**
 * Enhanced Real-time Service for Phase 3
 * خدمة الميزات الفورية المحسنة للمرحلة 3
 * 
 * Provides enhanced real-time features including:
 * - Live content synchronization between admin and public pages
 * - Real-time user activity tracking
 * - Enhanced live notifications
 * - Performance-optimized WebSocket management
 * - PDPL-compliant data handling
 */

import { getFeatureFlag } from '../../config/featureFlags.js';
import { unifiedApiService } from '../unifiedApiService.js';
import realtimeService from '../realtimeService.js';
import { logInfo, logError, logWarning } from '../../utils/monitoring.js';
import { renderOptimizer } from '../../utils/performanceOptimizer.js';
import { useErrorMessages } from '../../hooks/useErrorMessages.js';

// Enhanced real-time event types
export const ENHANCED_REALTIME_EVENTS = {
  // Content synchronization events
  CONTENT_CREATED: 'content:created',
  CONTENT_UPDATED: 'content:updated',
  CONTENT_DELETED: 'content:deleted',
  CONTENT_PUBLISHED: 'content:published',
  CONTENT_UNPUBLISHED: 'content:unpublished',
  
  // User activity events
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_ACTIVE: 'user:active',
  USER_IDLE: 'user:idle',
  USER_TYPING: 'user:typing',
  
  // Admin dashboard events
  ADMIN_ACTION: 'admin:action',
  ADMIN_NOTIFICATION: 'admin:notification',
  ADMIN_ALERT: 'admin:alert',
  
  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_ALERT: 'system:alert'
};

// Content sync strategies
export const CONTENT_SYNC_STRATEGIES = {
  IMMEDIATE: 'immediate',
  BATCHED: 'batched',
  SCHEDULED: 'scheduled',
  ON_DEMAND: 'on_demand'
};

// User activity tracking levels
export const ACTIVITY_TRACKING_LEVELS = {
  MINIMAL: 'minimal',     // Basic page views only
  STANDARD: 'standard',   // Page views + interactions
  DETAILED: 'detailed',   // Full activity tracking
  ANALYTICS: 'analytics'  // Advanced analytics tracking
};

// Alias for compatibility
export const USER_ACTIVITY_LEVELS = ACTIVITY_TRACKING_LEVELS;

class EnhancedRealtimeService {
  constructor() {
    this._isInitialized = false;
    this.contentSyncStrategy = CONTENT_SYNC_STRATEGIES.IMMEDIATE;
    this.activityTrackingLevel = ACTIVITY_TRACKING_LEVELS.STANDARD;
    this.activeUsers = new Map();
    this.contentSubscriptions = new Map();
    this.activityBuffer = [];
    this.syncQueue = [];
    this.performanceMetrics = {
      syncLatency: [],
      messageCount: 0,
      errorCount: 0,
      lastSyncTime: null,
      avgLatency: 0,
      memoryUsage: 0,
      connectionUptime: 0,
      syncOperations: {
        successful: 0,
        failed: 0,
        pending: 0
      },
      networkStats: {
        bytesReceived: 0,
        bytesSent: 0,
        packetsLost: 0
      },
      contentSyncCount: 0,
      activityCount: 0,
      notificationCount: 0
    };

    // State tracking
    this.lastSyncData = null;
    this.lastActivityData = null;
    this.lastNotification = null;
    this.circuitBreakerOpen = false;
    this.performanceInterval = null;
    this.latencyHistory = []; // Track recent latency measurements

    // PDPL compliance settings
    this.pdplSettings = {
      anonymizeUserData: true,
      encryptSensitiveData: true,
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      consentRequired: true
    };

    // Debounced functions for performance
    this.debouncedSyncContent = renderOptimizer.debounce(
      this.syncContentImmediate.bind(this),
      100
    );

    this.throttledTrackActivity = renderOptimizer.throttle(
      this.trackUserActivityImmediate.bind(this),
      1000
    );
  }

  /**
   * Initialize enhanced real-time service
   * تهيئة خدمة الميزات الفورية المحسنة
   */
  async initialize(config = {}) {
    if (this._isInitialized) {
      return true;
    }

    try {
      // Apply custom configuration if provided
      if (config.contentSyncStrategy) {
        this.contentSyncStrategy = config.contentSyncStrategy;
      }
      if (config.activityTrackingLevel) {
        this.activityTrackingLevel = config.activityTrackingLevel;
      }

      // Check if Phase 3 real-time features are enabled
      if (!getFeatureFlag('ENABLE_PHASE3_REALTIME')) {
        logInfo('Phase 3 real-time features disabled');
        return false;
      }

      // Initialize base real-time service (with fallback)
      try {
        if (realtimeService && typeof realtimeService.initialize === 'function') {
          await realtimeService.initialize();
        }
      } catch (realtimeError) {
        logWarning('Base realtime service initialization failed, continuing with enhanced features only:', realtimeError);
      }

      // Set up enhanced event listeners (with fallback)
      try {
        this.setupEnhancedEventListeners();
      } catch (error) {
        logWarning('Failed to setup enhanced event listeners:', error);
      }

      // Initialize content synchronization (with fallback)
      try {
        await this.initializeContentSync();
      } catch (error) {
        logWarning('Failed to initialize content sync:', error);
      }

      // Initialize user activity tracking (with fallback)
      try {
        await this.initializeActivityTracking();
      } catch (error) {
        logWarning('Failed to initialize activity tracking:', error);
      }

      // Start performance monitoring (with fallback)
      try {
        this.startPerformanceMonitoring();
      } catch (error) {
        logWarning('Failed to start performance monitoring:', error);
      }

      this._isInitialized = true;
      logInfo('Enhanced real-time service initialized successfully');

      return true;

    } catch (error) {
      logError('Failed to initialize enhanced real-time service', error);
      return false;
    }
  }

  /**
   * Set up enhanced event listeners
   * إعداد مستمعي الأحداث المحسنة
   */
  setupEnhancedEventListeners() {
    // Content synchronization events
    Object.values(ENHANCED_REALTIME_EVENTS).forEach(eventType => {
      if (eventType.startsWith('content:')) {
        realtimeService.subscribe(eventType, (data) => {
          this.handleContentSyncEvent(eventType, data);
        });
      } else if (eventType.startsWith('user:')) {
        realtimeService.subscribe(eventType, (data) => {
          this.handleUserActivityEvent(eventType, data);
        });
      } else if (eventType.startsWith('admin:')) {
        realtimeService.subscribe(eventType, (data) => {
          this.handleAdminEvent(eventType, data);
        });
      }
    });

    // Base real-time service events
    realtimeService.on('connected', () => {
      this.onRealtimeConnected();
    });

    realtimeService.on('disconnected', () => {
      this.onRealtimeDisconnected();
    });

    realtimeService.on('error', (error) => {
      this.handleRealtimeError(error);
    });
  }

  /**
   * Initialize content synchronization
   * تهيئة تزامن المحتوى
   */
  async initializeContentSync() {
    if (!getFeatureFlag('ENABLE_CONTENT_SYNC')) {
      return;
    }

    try {
      // Subscribe to content channels
      const contentChannels = [
        'content_updates',
        'admin_content_changes',
        'public_content_sync'
      ];

      for (const channel of contentChannels) {
        const subscriptionId = await realtimeService.subscribe(channel, (data) => {
          this.handleContentUpdate(channel, data);
        });
        
        this.contentSubscriptions.set(channel, subscriptionId);
      }

      logInfo('Content synchronization initialized');

    } catch (error) {
      logError('Failed to initialize content synchronization', error);
    }
  }

  /**
   * Initialize user activity tracking
   * تهيئة تتبع نشاط المستخدم
   */
  async initializeActivityTracking() {
    if (!getFeatureFlag('ENABLE_USER_ACTIVITY_TRACKING')) {
      return;
    }

    try {
      // Set up activity tracking based on level
      switch (this.activityTrackingLevel) {
        case ACTIVITY_TRACKING_LEVELS.MINIMAL:
          this.setupMinimalTracking();
          break;
        case ACTIVITY_TRACKING_LEVELS.STANDARD:
          this.setupStandardTracking();
          break;
        case ACTIVITY_TRACKING_LEVELS.DETAILED:
          this.setupDetailedTracking();
          break;
        case ACTIVITY_TRACKING_LEVELS.ANALYTICS:
          this.setupAnalyticsTracking();
          break;
      }

      // Start activity buffer processing
      this.startActivityBufferProcessing();

      logInfo(`User activity tracking initialized (level: ${this.activityTrackingLevel})`);

    } catch (error) {
      logError('Failed to initialize user activity tracking', error);
    }
  }

  /**
   * Sync content change in real-time
   * تزامن تغيير المحتوى في الوقت الفعلي
   */
  async syncContentChange(changeType, contentData, options = {}) {
    if (!getFeatureFlag('ENABLE_LIVE_CONTENT_SYNC')) {
      return false;
    }

    try {
      const syncData = {
        changeType,
        contentData: this.sanitizeContentData(contentData),
        timestamp: Date.now(),
        source: options.source || 'unknown',
        userId: options.userId,
        sessionId: options.sessionId
      };

      // Choose sync strategy
      switch (this.contentSyncStrategy) {
        case CONTENT_SYNC_STRATEGIES.IMMEDIATE:
          return await this.debouncedSyncContent(syncData);
        case CONTENT_SYNC_STRATEGIES.BATCHED:
          return this.queueContentSync(syncData);
        case CONTENT_SYNC_STRATEGIES.SCHEDULED:
          return this.scheduleContentSync(syncData);
        default:
          return await this.syncContentImmediate(syncData);
      }

    } catch (error) {
      logError('Failed to sync content change', error);
      return false;
    }
  }

  /**
   * Track user activity in real-time
   * تتبع نشاط المستخدم في الوقت الفعلي
   */
  async trackUserActivity(activityType, activityData, options = {}) {
    if (!getFeatureFlag('ENABLE_USER_ACTIVITY_TRACKING')) {
      return false;
    }

    try {
      const activity = {
        type: activityType,
        data: this.sanitizeActivityData(activityData),
        timestamp: Date.now(),
        userId: options.userId,
        sessionId: options.sessionId,
        page: options.page || window.location.pathname,
        userAgent: options.userAgent || navigator.userAgent
      };

      // Add to activity buffer
      this.activityBuffer.push(activity);

      // Throttled immediate tracking for critical activities
      if (options.immediate) {
        return await this.throttledTrackActivity(activity);
      }

      return true;

    } catch (error) {
      logError('Failed to track user activity', error);
      return false;
    }
  }

  /**
   * Broadcast live notification to all connected users
   * بث إشعار مباشر لجميع المستخدمين المتصلين
   */
  async broadcastLiveNotification(notification, targetUsers = null) {
    if (!getFeatureFlag('ENABLE_LIVE_NOTIFICATIONS')) {
      return false;
    }

    try {
      const enhancedNotification = {
        ...notification,
        id: this.generateNotificationId(),
        timestamp: Date.now(),
        type: 'live_broadcast',
        targetUsers,
        source: 'enhanced_realtime'
      };

      // Send via real-time service
      const success = await realtimeService.sendNotification(enhancedNotification);

      if (success) {
        this.performanceMetrics.messageCount++;
        logInfo(`Live notification broadcasted to ${targetUsers ? targetUsers.length : 'all'} users`);
      }

      return success;

    } catch (error) {
      logError('Failed to broadcast live notification', error);
      this.performanceMetrics.errorCount++;
      return false;
    }
  }

  /**
   * Get real-time service status
   * الحصول على حالة خدمة الميزات الفورية
   */
  getServiceStatus() {
    return {
      isInitialized: this._isInitialized,
      isConnected: realtimeService.isConnected,
      activeUsers: this.activeUsers.size,
      contentSubscriptions: this.contentSubscriptions.size,
      activityBufferSize: this.activityBuffer.length,
      syncQueueSize: this.syncQueue.length,
      performanceMetrics: { ...this.performanceMetrics },
      pdplCompliant: this.pdplSettings.anonymizeUserData && this.pdplSettings.encryptSensitiveData
    };
  }

  /**
   * Sanitize content data for PDPL compliance
   * تنظيف بيانات المحتوى للامتثال لـ PDPL
   */
  sanitizeContentData(contentData) {
    if (!this.pdplSettings.anonymizeUserData) {
      return contentData;
    }

    const sanitized = { ...contentData };
    
    // Remove or anonymize sensitive fields
    if (sanitized.authorEmail) {
      sanitized.authorEmail = this.anonymizeEmail(sanitized.authorEmail);
    }
    
    if (sanitized.userIp) {
      delete sanitized.userIp;
    }
    
    if (sanitized.personalData) {
      delete sanitized.personalData;
    }

    return sanitized;
  }

  /**
   * Sanitize activity data for PDPL compliance
   * تنظيف بيانات النشاط للامتثال لـ PDPL
   */
  sanitizeActivityData(activityData) {
    if (!this.pdplSettings.anonymizeUserData) {
      return activityData;
    }

    const sanitized = { ...activityData };
    
    // Remove sensitive tracking data
    if (sanitized.ipAddress) {
      delete sanitized.ipAddress;
    }
    
    if (sanitized.fingerprint) {
      delete sanitized.fingerprint;
    }
    
    if (sanitized.personalIdentifiers) {
      delete sanitized.personalIdentifiers;
    }

    return sanitized;
  }

  /**
   * Generate unique notification ID
   * إنشاء معرف فريد للإشعار
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Anonymize email for PDPL compliance
   * إخفاء هوية البريد الإلكتروني للامتثال لـ PDPL
   */
  anonymizeEmail(email) {
    const [username, domain] = email.split('@');
    const anonymizedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${anonymizedUsername}@${domain}`;
  }

  /**
   * Sync content immediately
   * تزامن المحتوى فوراً
   */
  async syncContentImmediate(syncData) {
    try {
      const startTime = Date.now();

      // Broadcast to all subscribers
      const success = await realtimeService.broadcastUpdate('content_sync', syncData);

      if (success) {
        this.performanceMetrics.syncLatency.push(Date.now() - startTime);
        this.performanceMetrics.lastSync = Date.now();

        // Keep only last 100 latency measurements
        if (this.performanceMetrics.syncLatency.length > 100) {
          this.performanceMetrics.syncLatency = this.performanceMetrics.syncLatency.slice(-100);
        }
      }

      return success;

    } catch (error) {
      logError('Failed to sync content immediately', error);
      this.performanceMetrics.errorCount++;
      return false;
    }
  }

  /**
   * Queue content sync for batched processing
   * إضافة تزامن المحتوى للمعالجة المجمعة
   */
  queueContentSync(syncData) {
    this.syncQueue.push(syncData);

    // Process queue if it reaches threshold
    if (this.syncQueue.length >= 10) {
      this.processSyncQueue();
    }

    return true;
  }

  /**
   * Process sync queue
   * معالجة قائمة انتظار التزامن
   */
  async processSyncQueue() {
    if (this.syncQueue.length === 0) {
      return;
    }

    try {
      const batchData = {
        type: 'batch_sync',
        items: this.syncQueue.splice(0, 10), // Process up to 10 items
        timestamp: Date.now()
      };

      await realtimeService.broadcastUpdate('batch_content_sync', batchData);
      logInfo(`Processed batch sync with ${batchData.items.length} items`);

    } catch (error) {
      logError('Failed to process sync queue', error);
    }
  }

  /**
   * Track user activity immediately
   * تتبع نشاط المستخدم فوراً
   */
  async trackUserActivityImmediate(activity) {
    try {
      // Send activity to real-time service
      await realtimeService.broadcastUpdate('user_activity', activity);

      // Update active users map
      if (activity.userId) {
        this.activeUsers.set(activity.userId, {
          lastActivity: activity.timestamp,
          currentPage: activity.page,
          sessionId: activity.sessionId
        });
      }

      return true;

    } catch (error) {
      logError('Failed to track user activity immediately', error);
      return false;
    }
  }

  /**
   * Start activity buffer processing
   * بدء معالجة مخزن النشاط
   */
  startActivityBufferProcessing() {
    setInterval(() => {
      this.processActivityBuffer();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process activity buffer
   * معالجة مخزن النشاط
   */
  async processActivityBuffer() {
    if (this.activityBuffer.length === 0) {
      return;
    }

    try {
      const activities = this.activityBuffer.splice(0, 50); // Process up to 50 activities

      const batchData = {
        type: 'batch_activity',
        activities,
        timestamp: Date.now()
      };

      await realtimeService.broadcastUpdate('batch_user_activity', batchData);

    } catch (error) {
      logError('Failed to process activity buffer', error);
    }
  }

  /**
   * Setup minimal activity tracking
   * إعداد تتبع النشاط الأساسي
   */
  setupMinimalTracking() {
    // Track only page views
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackUserActivity('page_leave', { page: window.location.pathname });
      });
    }
  }

  /**
   * Setup standard activity tracking
   * إعداد تتبع النشاط المعياري
   */
  setupStandardTracking() {
    this.setupMinimalTracking();

    if (typeof window !== 'undefined') {
      // Track clicks on important elements
      document.addEventListener('click', (event) => {
        if (event.target.matches('button, a, [data-track]')) {
          this.trackUserActivity('click', {
            element: event.target.tagName,
            text: event.target.textContent?.substring(0, 50),
            page: window.location.pathname
          });
        }
      });

      // Track form submissions
      document.addEventListener('submit', (event) => {
        this.trackUserActivity('form_submit', {
          formId: event.target.id,
          page: window.location.pathname
        });
      });
    }
  }

  /**
   * Setup detailed activity tracking
   * إعداد تتبع النشاط التفصيلي
   */
  setupDetailedTracking() {
    this.setupStandardTracking();

    if (typeof window !== 'undefined') {
      // Track scroll events
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackUserActivity('scroll', {
            scrollY: window.scrollY,
            page: window.location.pathname
          });
        }, 1000);
      });

      // Track focus/blur events
      window.addEventListener('focus', () => {
        this.trackUserActivity('window_focus', { page: window.location.pathname });
      });

      window.addEventListener('blur', () => {
        this.trackUserActivity('window_blur', { page: window.location.pathname });
      });
    }
  }

  /**
   * Setup analytics tracking
   * إعداد تتبع التحليلات
   */
  setupAnalyticsTracking() {
    this.setupDetailedTracking();

    // Additional analytics tracking would go here
    // This might include performance metrics, user journey tracking, etc.
  }

  /**
   * Handle content sync event
   * التعامل مع حدث تزامن المحتوى
   */
  handleContentSyncEvent(eventType, data) {
    try {
      // Emit custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('contentSyncUpdate', {
          detail: { eventType, data }
        }));
      }

      logInfo(`Content sync event handled: ${eventType}`);

    } catch (error) {
      logError('Failed to handle content sync event', error);
    }
  }

  /**
   * Handle user activity event
   * التعامل مع حدث نشاط المستخدم
   */
  handleUserActivityEvent(eventType, data) {
    try {
      // Update active users tracking
      if (data.userId) {
        if (eventType === ENHANCED_REALTIME_EVENTS.USER_JOINED) {
          this.activeUsers.set(data.userId, {
            joinedAt: Date.now(),
            lastActivity: Date.now(),
            ...data
          });
        } else if (eventType === ENHANCED_REALTIME_EVENTS.USER_LEFT) {
          this.activeUsers.delete(data.userId);
        } else {
          const user = this.activeUsers.get(data.userId);
          if (user) {
            this.activeUsers.set(data.userId, {
              ...user,
              lastActivity: Date.now(),
              ...data
            });
          }
        }
      }

      // Emit custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userActivityUpdate', {
          detail: { eventType, data }
        }));
      }

    } catch (error) {
      logError('Failed to handle user activity event', error);
    }
  }

  /**
   * Handle admin event
   * التعامل مع حدث الإدارة
   */
  handleAdminEvent(eventType, data) {
    try {
      // Emit custom event for admin components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adminRealtimeUpdate', {
          detail: { eventType, data }
        }));
      }

      logInfo(`Admin event handled: ${eventType}`);

    } catch (error) {
      logError('Failed to handle admin event', error);
    }
  }

  /**
   * Handle real-time service events
   */
  onRealtimeConnected() {
    logInfo('Enhanced real-time service connected');

    // Re-subscribe to all content channels
    this.initializeContentSync();
  }

  onRealtimeDisconnected() {
    logWarning('Enhanced real-time service disconnected');

    // Clear active users (they'll rejoin when reconnected)
    this.activeUsers.clear();
  }

  handleRealtimeError(error) {
    logError('Enhanced real-time service error', error);
    this.performanceMetrics.errorCount++;
  }

  /**
   * Start performance monitoring
   * بدء مراقبة الأداء
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000); // Collect metrics every 30 seconds
  }

  /**
   * Collect performance metrics
   * جمع مقاييس الأداء
   */
  collectPerformanceMetrics() {
    const metrics = {
      timestamp: Date.now(),
      activeUsers: this.activeUsers.size,
      avgSyncLatency: this.calculateAverageSyncLatency(),
      messageCount: this.performanceMetrics.messageCount,
      errorCount: this.performanceMetrics.errorCount,
      memoryUsage: this.getMemoryUsage()
    };

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Enhanced Real-time Performance Metrics:', metrics);
    }

    // Reset counters
    this.performanceMetrics.messageCount = 0;
    this.performanceMetrics.errorCount = 0;
  }

  /**
   * Calculate average sync latency
   * حساب متوسط زمن التزامن
   */
  calculateAverageSyncLatency() {
    if (this.performanceMetrics.syncLatency.length === 0) {
      return 0;
    }

    const sum = this.performanceMetrics.syncLatency.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.performanceMetrics.syncLatency.length);
  }

  /**
   * Get memory usage
   * الحصول على استخدام الذاكرة
   */
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      };
    }
    return null;
  }

  /**
   * Reset service state
   * إعادة تعيين حالة الخدمة
   */
  reset() {
    try {
      // Reset all metrics
      this.performanceMetrics = {
        syncLatency: [],
        messageCount: 0,
        errorCount: 0,
        lastSyncTime: null,
        avgLatency: 0,
        memoryUsage: 0,
        connectionUptime: 0,
        syncOperations: {
          successful: 0,
          failed: 0,
          pending: 0
        },
        networkStats: {
          bytesReceived: 0,
          bytesSent: 0,
          packetsLost: 0
        },
        contentSyncCount: 0,
        activityCount: 0,
        notificationCount: 0
      };

      // Reset state
      this._isInitialized = false;
      this.lastSyncData = null;
      this.lastActivityData = null;
      this.lastNotification = null;
      this.circuitBreakerOpen = false;

      logInfo('Enhanced realtime service reset completed');
      return true;
    } catch (error) {
      logError('Failed to reset enhanced realtime service:', error);
      return false;
    }
  }

  /**
   * Cleanup service resources
   * تنظيف موارد الخدمة
   */
  cleanup() {
    try {
      // Clear any intervals or timeouts
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }

      // Reset state
      this.reset();

      logInfo('Enhanced realtime service cleanup completed');
      return true;
    } catch (error) {
      logError('Failed to cleanup enhanced realtime service:', error);
      return false;
    }
  }

  /**
   * Calculate average latency from recent measurements
   * حساب متوسط زمن الاستجابة من القياسات الأخيرة
   */
  calculateAverageLatency() {
    if (!this.latencyHistory || this.latencyHistory.length === 0) {
      return 0;
    }

    const sum = this.latencyHistory.reduce((acc, latency) => acc + latency, 0);
    return Math.round(sum / this.latencyHistory.length);
  }

  /**
   * Get comprehensive metrics
   * الحصول على المقاييس الشاملة
   */
  getMetrics() {
    const memoryUsage = this.getMemoryUsage();
    return {
      ...this.performanceMetrics,
      memoryUsage: memoryUsage ? memoryUsage.used : 0,
      avgLatency: this.calculateAverageLatency(),
      isConnected: this.isConnected,
      isInitialized: this._isInitialized,
      circuitBreakerOpen: this.circuitBreakerOpen
    };
  }

  /**
   * Check if service is initialized
   * التحقق من تهيئة الخدمة
   */
  isInitialized() {
    return this._isInitialized;
  }

  /**
   * Get current configuration
   * الحصول على الإعدادات الحالية
   */
  getConfiguration() {
    return {
      contentSyncStrategy: this.contentSyncStrategy,
      activityTrackingLevel: this.activityTrackingLevel,
      pdplSettings: { ...this.pdplSettings },
      isInitialized: this._isInitialized,
      circuitBreakerOpen: this.circuitBreakerOpen,
      enableContentSync: getFeatureFlag('ENABLE_CONTENT_SYNC'),
      enableActivityTracking: getFeatureFlag('ENABLE_USER_ACTIVITY_TRACKING'),
      enableLiveNotifications: getFeatureFlag('ENABLE_LIVE_NOTIFICATIONS')
    };
  }

  /**
   * Set content sync strategy
   * تعيين استراتيجية تزامن المحتوى
   */
  setContentSyncStrategy(strategy) {
    try {
      if (!Object.values(CONTENT_SYNC_STRATEGIES).includes(strategy)) {
        throw new Error(`Invalid sync strategy: ${strategy}`);
      }

      this.contentSyncStrategy = strategy;
      logInfo(`Content sync strategy updated to: ${strategy}`);
      return true;
    } catch (error) {
      logError('Failed to set content sync strategy:', error);
      return false;
    }
  }

  /**
   * Set activity tracking level
   * تعيين مستوى تتبع النشاط
   */
  setActivityTrackingLevel(level) {
    try {
      if (!Object.values(USER_ACTIVITY_LEVELS).includes(level)) {
        throw new Error(`Invalid activity tracking level: ${level}`);
      }

      this.activityTrackingLevel = level;
      logInfo(`Activity tracking level updated to: ${level}`);
      return true;
    } catch (error) {
      logError('Failed to set activity tracking level:', error);
      return false;
    }
  }

  /**
   * Get last sync data
   * الحصول على آخر بيانات تزامن
   */
  getLastSyncData() {
    return this.lastSyncData;
  }

  /**
   * Get last activity data
   * الحصول على آخر بيانات نشاط
   */
  getLastActivityData() {
    return this.lastActivityData;
  }

  /**
   * Get last notification
   * الحصول على آخر إشعار
   */
  getLastNotification() {
    return this.lastNotification;
  }

  /**
   * Encrypt sensitive data for PDPL compliance
   * تشفير البيانات الحساسة للامتثال لقانون حماية البيانات
   */
  encryptSensitiveData(data) {
    try {
      const sensitiveFields = ['personalId', 'email', 'phone', 'address', 'nationalId'];
      const encrypted = { ...data };

      sensitiveFields.forEach(field => {
        if (encrypted[field]) {
          // Simple encryption for demo - in production use proper encryption
          encrypted[field] = btoa(encrypted[field]).split('').reverse().join('');
        }
      });

      return encrypted;
    } catch (error) {
      logError('Failed to encrypt sensitive data:', error);
      return data;
    }
  }

  /**
   * Cleanup expired data for PDPL compliance
   * تنظيف البيانات المنتهية الصلاحية للامتثال لقانون حماية البيانات
   */
  cleanupExpiredData() {
    try {
      const retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
      const cutoffTime = Date.now() - retentionPeriod;

      // Clean up old sync data
      if (this.lastSyncData && this.lastSyncData.timestamp < cutoffTime) {
        this.lastSyncData = null;
      }

      // Clean up old activity data
      if (this.lastActivityData && this.lastActivityData.timestamp < cutoffTime) {
        this.lastActivityData = null;
      }

      // Clean up old notifications
      if (this.lastNotification && this.lastNotification.timestamp < cutoffTime) {
        this.lastNotification = null;
      }

      logInfo('Expired data cleanup completed');
      return true;
    } catch (error) {
      logError('Failed to cleanup expired data:', error);
      return false;
    }
  }

  /**
   * Anonymize user ID for PDPL compliance
   * إخفاء هوية معرف المستخدم للامتثال لقانون حماية البيانات
   */
  anonymizeUserId(userId) {
    try {
      if (!userId) return null;

      // Create anonymous hash
      const hash = btoa(userId).replace(/[+/=]/g, '').substring(0, 8);
      return `anon_${hash}`;
    } catch (error) {
      logError('Failed to anonymize user ID:', error);
      return userId;
    }
  }

  /**
   * Open circuit breaker
   * فتح قاطع الدائرة
   */
  openCircuitBreaker() {
    this.circuitBreakerOpen = true;
    logWarning('Circuit breaker opened');
  }

  /**
   * Check if circuit breaker is open
   * التحقق من حالة قاطع الدائرة
   */
  isCircuitBreakerOpen() {
    return this.circuitBreakerOpen;
  }
}

// Create singleton instance
export const enhancedRealtimeService = new EnhancedRealtimeService();

// Export for testing
export { EnhancedRealtimeService };
