/**
 * WebSocket Core Service
 * خدمة WebSocket الأساسية
 * 
 * Manages WebSocket connections, events, and real-time communication
 */

import { logError, logInfo } from '../../utils/monitoring.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import { ENV } from '../../config/environment.js';

/**
 * WebSocket Core Class
 * فئة WebSocket الأساسية
 */
class WebSocketCore {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds

    // Circuit breaker for WebSocket connections
    this.circuitBreaker = {
      isOpen: false,
      failures: 0,
      lastFailure: null,
      openUntil: null,
      maxFailures: 3,
      cooldownPeriod: 300000, // 5 minutes
      backoffMultiplier: 1
    };
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.eventListeners = new Map();
    this.messageQueue = [];
    this.connectionId = null;
    this.lastActivity = Date.now();
    
    // Configuration
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      heartbeatTimeout: 5000, // 5 seconds
      maxMessageQueueSize: 100,
      enableCompression: true,
      enableBinaryType: 'arraybuffer'
    };

    this.initialize();
  }

  /**
   * Initialize WebSocket service
   * تهيئة خدمة WebSocket
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_WEBSOCKET')) {
        logInfo('WebSocket is disabled');
        return;
      }

      // Setup event listeners for page lifecycle
      this.setupPageLifecycleListeners();
      
      logInfo('WebSocket core initialized');
      
    } catch (error) {
      logError('Failed to initialize WebSocket core', error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket server with circuit breaker
   * الاتصال بخادم WebSocket مع قاطع الدائرة
   */
  async connect(url = null) {
    try {
      if (this.isConnected || this.isConnecting) {
        logInfo('WebSocket already connected or connecting');
        return;
      }

      // Check circuit breaker
      if (this.isCircuitBreakerOpen()) {
        const timeLeft = Math.round((this.circuitBreaker.openUntil - Date.now()) / 1000);
        if (ENV.IS_DEVELOPMENT) {
          console.info(`🔴 WebSocket circuit breaker open for ${timeLeft}s more`);
        }
        throw new Error(`WebSocket circuit breaker open for ${timeLeft} seconds`);
      }

      this.isConnecting = true;
      
      // Determine WebSocket URL
      const wsUrl = url || this.getWebSocketUrl();
      
      logInfo(`Connecting to WebSocket: ${wsUrl}`);
      
      // Create WebSocket connection
      this.socket = new WebSocket(wsUrl);
      
      // Configure socket
      this.socket.binaryType = this.config.enableBinaryType;
      
      // Setup event handlers
      this.setupSocketEventHandlers();
      
      // Wait for connection or timeout
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.cleanup();
          reject(new Error('WebSocket connection timeout'));
        }, 10000); // 10 second timeout

        this.socket.onopen = () => {
          clearTimeout(timeout);
          this.onSocketOpen();
          resolve();
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          this.onSocketError(error);
          this.updateCircuitBreaker(false);
          reject(error);
        };
      });

    } catch (error) {
      this.isConnecting = false;
      logError('WebSocket connection failed', error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   * قطع الاتصال من خادم WebSocket
   */
  disconnect() {
    try {
      logInfo('Disconnecting WebSocket');
      
      this.cleanup();
      
      if (this.socket) {
        this.socket.close(1000, 'Client disconnect');
        this.socket = null;
      }
      
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionId = null;
      
      this.emit('disconnected');
      
    } catch (error) {
      logError('Error during WebSocket disconnect', error);
    }
  }

  /**
   * Send message through WebSocket
   * إرسال رسالة عبر WebSocket
   */
  send(type, data = {}) {
    try {
      const message = {
        type,
        data,
        timestamp: Date.now(),
        id: this.generateMessageId()
      };

      if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
        this.lastActivity = Date.now();
        return true;
      } else {
        // Queue message for later sending
        this.queueMessage(message);
        return false;
      }

    } catch (error) {
      logError('Failed to send WebSocket message', error);
      return false;
    }
  }

  /**
   * Subscribe to WebSocket events
   * الاشتراك في أحداث WebSocket
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from WebSocket events
   * إلغاء الاشتراك في أحداث WebSocket
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit WebSocket event
   * إرسال حدث WebSocket
   */
  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logError(`Error in WebSocket event listener for ${event}`, error);
        }
      });
    }
  }

  /**
   * Setup socket event handlers
   * إعداد معالجات أحداث Socket
   */
  setupSocketEventHandlers() {
    this.socket.onopen = () => this.onSocketOpen();
    this.socket.onclose = (event) => this.onSocketClose(event);
    this.socket.onerror = (error) => this.onSocketError(error);
    this.socket.onmessage = (event) => this.onSocketMessage(event);
  }

  /**
   * Handle socket open event
   * التعامل مع حدث فتح Socket
   */
  onSocketOpen() {
    logInfo('WebSocket connected successfully');

    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.lastActivity = Date.now();

    // Reset circuit breaker on successful connection
    this.updateCircuitBreaker(true);
    
    // Generate connection ID
    this.connectionId = this.generateConnectionId();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.sendQueuedMessages();
    
    // Emit connected event
    this.emit('connected', { connectionId: this.connectionId });
  }

  /**
   * Handle socket close event
   * التعامل مع حدث إغلاق Socket
   */
  onSocketClose(event) {
    logInfo(`WebSocket closed: ${event.code} - ${event.reason}`);
    
    this.isConnected = false;
    this.isConnecting = false;
    this.cleanup();
    
    this.emit('disconnected', { code: event.code, reason: event.reason });
    
    // Attempt reconnection if not intentional close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle socket error event
   * التعامل مع حدث خطأ Socket
   */
  onSocketError(error) {
    logError('WebSocket error', error);
    this.emit('error', error);
  }

  /**
   * Handle socket message event
   * التعامل مع حدث رسالة Socket
   */
  onSocketMessage(event) {
    try {
      this.lastActivity = Date.now();
      
      let message;
      if (typeof event.data === 'string') {
        message = JSON.parse(event.data);
      } else {
        // Handle binary data
        message = this.parseBinaryMessage(event.data);
      }
      
      // Handle special message types
      if (message.type === 'heartbeat') {
        this.handleHeartbeat(message);
        return;
      }
      
      // Emit message event
      this.emit('message', message);
      this.emit(message.type, message.data);
      
    } catch (error) {
      logError('Failed to parse WebSocket message', error);
    }
  }

  /**
   * Schedule reconnection attempt with circuit breaker
   * جدولة محاولة إعادة الاتصال مع قاطع الدائرة
   */
  scheduleReconnect() {
    // Check circuit breaker first
    if (this.isCircuitBreakerOpen()) {
      if (ENV.IS_DEVELOPMENT) {
        console.info('🔴 WebSocket reconnection blocked by circuit breaker');
      }
      this.emit('reconnectBlocked');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateCircuitBreaker(false);
      if (ENV.IS_DEVELOPMENT) {
        console.warn('🔴 WebSocket max reconnection attempts reached, opening circuit breaker');
      }
      this.emit('reconnectFailed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    // Only log first few attempts to reduce noise
    if (this.reconnectAttempts <= 2 && ENV.IS_DEVELOPMENT) {
      console.info(`🟡 WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    }

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting && !this.isCircuitBreakerOpen()) {
        this.connect().catch(error => {
          // Only log if not a circuit breaker error
          if (!error.message.includes('circuit breaker')) {
            logError('Reconnection attempt failed', error);
          }
        });
      }
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   * بدء آلية نبضات القلب
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat();
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   * إيقاف آلية نبضات القلب
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Send heartbeat message
   * إرسال رسالة نبضة القلب
   */
  sendHeartbeat() {
    this.send('heartbeat', { timestamp: Date.now() });
    
    // Set timeout for heartbeat response
    this.heartbeatTimeout = setTimeout(() => {
      logError('Heartbeat timeout - connection may be lost');
      this.disconnect();
    }, this.config.heartbeatTimeout);
  }

  /**
   * Handle heartbeat response
   * التعامل مع استجابة نبضة القلب
   */
  handleHeartbeat(message) {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    // Calculate latency
    const latency = Date.now() - message.data.timestamp;
    this.emit('heartbeat', { latency });
  }

  /**
   * Queue message for later sending
   * وضع الرسالة في الطابور للإرسال لاحقاً
   */
  queueMessage(message) {
    if (this.messageQueue.length >= this.config.maxMessageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push(message);
  }

  /**
   * Send queued messages
   * إرسال الرسائل المطابورة
   */
  sendQueuedMessages() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Cleanup resources
   * تنظيف الموارد
   */
  cleanup() {
    this.stopHeartbeat();
    this.messageQueue = [];
  }

  /**
   * Setup page lifecycle listeners
   * إعداد مستمعي دورة حياة الصفحة
   */
  setupPageLifecycleListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - reduce activity
        this.emit('pageHidden');
      } else {
        // Page is visible - resume activity
        this.emit('pageVisible');
        if (!this.isConnected && getFeatureFlag('ENABLE_WEBSOCKET')) {
          this.connect().catch(error => {
            logError('Failed to reconnect on page visible', error);
          });
        }
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  /**
   * Get WebSocket URL with development mode detection
   * الحصول على رابط WebSocket مع اكتشاف وضع التطوير
   */
  getWebSocketUrl() {
    // Try to get from environment or construct from API URL
    const apiUrl = ENV.API_URL || 'http://localhost:3001/api';
    const wsUrl = apiUrl.replace(/^http/, 'ws').replace('/api', '/ws');

    // In development, check if backend is intentionally unavailable
    if (ENV.IS_DEVELOPMENT && wsUrl.includes('localhost:3001')) {
      // Add a flag to indicate this is a development environment
      this.isDevelopmentMode = true;
    }

    return wsUrl;
  }

  /**
   * Check if backend is intentionally unavailable in development
   * فحص ما إذا كان الخادم الخلفي غير متاح عمداً في التطوير
   */
  isBackendIntentionallyUnavailable() {
    if (!ENV.IS_DEVELOPMENT) return false;

    // If we've had multiple failures and we're in development mode,
    // assume backend is intentionally unavailable
    return this.circuitBreaker.failures >= 2 && this.isDevelopmentMode;
  }

  /**
   * Generate unique message ID
   * إنشاء معرف رسالة فريد
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique connection ID
   * إنشاء معرف اتصال فريد
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Parse binary message
   * تحليل الرسالة الثنائية
   */
  parseBinaryMessage(data) {
    // Basic binary message parsing - can be extended
    try {
      const decoder = new TextDecoder();
      const text = decoder.decode(data);
      return JSON.parse(text);
    } catch (error) {
      logError('Failed to parse binary message', error);
      return { type: 'unknown', data: null };
    }
  }

  /**
   * Get connection status
   * الحصول على حالة الاتصال
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      connectionId: this.connectionId,
      reconnectAttempts: this.reconnectAttempts,
      lastActivity: this.lastActivity,
      queuedMessages: this.messageQueue.length,
      readyState: this.socket ? this.socket.readyState : null,
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures,
        openUntil: this.circuitBreaker.openUntil
      }
    };
  }

  /**
   * Check if circuit breaker is open
   * فحص ما إذا كان قاطع الدائرة مفتوح
   */
  isCircuitBreakerOpen() {
    const now = Date.now();

    if (!this.circuitBreaker.isOpen) return false;

    // Check if cooldown period has expired
    if (this.circuitBreaker.openUntil && now >= this.circuitBreaker.openUntil) {
      // Reset circuit breaker for testing
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.openUntil = null;

      if (ENV.IS_DEVELOPMENT) {
        console.log('🟡 WebSocket circuit breaker half-open (testing connection)');
      }

      return false;
    }

    return true;
  }

  /**
   * Update circuit breaker state
   * تحديث حالة قاطع الدائرة
   */
  updateCircuitBreaker(success) {
    const now = Date.now();

    if (success) {
      // Reset on success
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.openUntil = null;
      this.circuitBreaker.backoffMultiplier = 1;

      if (ENV.IS_DEVELOPMENT && this.circuitBreaker.failures > 0) {
        console.log('✅ WebSocket circuit breaker reset - connection successful');
      }
    } else {
      // Increment failures
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailure = now;

      // Open circuit breaker after max failures
      if (this.circuitBreaker.failures >= this.circuitBreaker.maxFailures) {
        this.circuitBreaker.isOpen = true;
        this.circuitBreaker.backoffMultiplier = Math.min(this.circuitBreaker.backoffMultiplier * 2, 8);

        // Calculate cooldown time with exponential backoff
        const cooldownTime = this.circuitBreaker.cooldownPeriod * this.circuitBreaker.backoffMultiplier;
        this.circuitBreaker.openUntil = now + cooldownTime;

        if (ENV.IS_DEVELOPMENT) {
          console.warn(`🔴 WebSocket circuit breaker opened for ${Math.round(cooldownTime/60000)} minutes (${this.circuitBreaker.failures} failures)`);
        }

        this.emit('circuitBreakerOpened', {
          failures: this.circuitBreaker.failures,
          cooldownTime: cooldownTime
        });
      }
    }
  }

  /**
   * Get connection statistics
   * الحصول على إحصائيات الاتصال
   */
  getStats() {
    return {
      ...this.getStatus(),
      eventListeners: this.eventListeners.size,
      uptime: this.isConnected ? Date.now() - this.lastActivity : 0,
      config: this.config
    };
  }
}

// Create and export singleton instance
const websocketCore = new WebSocketCore();
export default websocketCore;
