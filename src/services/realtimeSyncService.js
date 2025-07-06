// src/services/realtimeSyncService.js
/**
 * Real-time Synchronization Service - Phase 5
 * خدمة المزامنة الفورية - المرحلة الخامسة
 * 
 * Features:
 * - Real-time sync between public interface and admin dashboard
 * - WebSocket-based updates with fallback mechanisms
 * - Content change broadcasting
 * - PDPL-compliant data synchronization
 * - Circuit breaker patterns for reliability
 */

import { getFeatureFlag } from '../config/featureFlags.js';
import { ENV } from '../config/environment.js';
import { localStorageService } from '../utils/localStorage.js';
import unifiedApiService from './unifiedApiService.js';
import realtimeService from './realtimeService.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

/**
 * Sync Event Types
 */
const SYNC_EVENTS = {
  CONTENT_CREATED: 'content:created',
  CONTENT_UPDATED: 'content:updated',
  CONTENT_DELETED: 'content:deleted',
  CONTENT_PUBLISHED: 'content:published',
  CONTENT_UNPUBLISHED: 'content:unpublished',
  BULK_UPDATE: 'content:bulk_update',
  CACHE_INVALIDATED: 'cache:invalidated'
};

/**
 * Sync Strategies
 */
const SYNC_STRATEGIES = {
  IMMEDIATE: 'immediate',     // Instant sync via WebSocket
  BATCHED: 'batched',        // Batch updates every few seconds
  POLLING: 'polling',        // Fallback polling mechanism
  HYBRID: 'hybrid'           // Smart combination of above
};

/**
 * Real-time Synchronization Service Class
 */
class RealtimeSyncService {
  constructor() {
    this.isInitialized = false;
    this.syncStrategy = SYNC_STRATEGIES.HYBRID;
    this.subscribers = new Map();
    this.pendingUpdates = new Map();
    this.lastSyncTimestamp = null;
    this.syncQueue = [];
    this.batchTimer = null;
    this.pollTimer = null;
    
    // Performance tracking
    this.syncMetrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageLatency: 0,
      lastSyncDuration: 0
    };

    // Circuit breaker for sync operations
    this.circuitBreaker = {
      failures: 0,
      lastFailure: null,
      isOpen: false,
      openUntil: null,
      maxFailures: 3,
      resetTimeout: 60000 // 1 minute
    };

    this.initialize();
  }

  /**
   * Initialize the sync service
   */
  async initialize() {
    if (this.isInitialized) return;

    // Check if real-time sync is enabled - EARLY EXIT TO PREVENT CONNECTION ERRORS
    const isRealtimeSyncEnabled = getFeatureFlag('ENABLE_REALTIME_SYNC');
    const isContentSyncEnabled = getFeatureFlag('ENABLE_CONTENT_SYNC');

    if (!isRealtimeSyncEnabled && !isContentSyncEnabled) {
      if (ENV.IS_DEVELOPMENT) {
        console.log('🔄 RealtimeSyncService disabled via feature flags');
      }
      return;
    }

    try {
      // Load sync state from localStorage
      await this.loadSyncState();

      // Determine optimal sync strategy
      this.determineSyncStrategy();

      // Set up event listeners
      this.setupEventListeners();

      // Start sync mechanisms based on strategy
      await this.startSyncMechanisms();

      this.isInitialized = true;

      if (ENV.IS_DEVELOPMENT) {
        console.log('🔄 RealtimeSyncService initialized with strategy:', this.syncStrategy);
      }

    } catch (error) {
      console.error('❌ Failed to initialize RealtimeSyncService:', error);
      // Fallback to polling strategy
      this.syncStrategy = SYNC_STRATEGIES.POLLING;
      this.startPollingFallback();
    }
  }

  /**
   * Determine optimal sync strategy based on available services
   */
  determineSyncStrategy() {
    const isWebSocketEnabled = getFeatureFlag('ENABLE_WEBSOCKET');
    const isRealtimeEnabled = getFeatureFlag('ENABLE_REAL_TIME_FEATURES');
    const isBackendAvailable = unifiedApiService.isNewBackendAvailable;

    if (isWebSocketEnabled && isRealtimeEnabled && isBackendAvailable) {
      this.syncStrategy = SYNC_STRATEGIES.HYBRID;
    } else if (isBackendAvailable) {
      this.syncStrategy = SYNC_STRATEGIES.BATCHED;
    } else {
      this.syncStrategy = SYNC_STRATEGIES.POLLING;
    }

    if (ENV.IS_DEVELOPMENT) {
      console.log('🎯 Sync strategy determined:', this.syncStrategy, {
        websocket: isWebSocketEnabled,
        realtime: isRealtimeEnabled,
        backend: isBackendAvailable
      });
    }
  }

  /**
   * Set up event listeners for real-time updates
   */
  setupEventListeners() {
    // Listen to WebSocket events
    if (getFeatureFlag('ENABLE_WEBSOCKET')) {
      realtimeService.subscribe('content_updates', (data) => {
        this.handleRealtimeUpdate(data);
      });

      realtimeService.subscribe('sync_events', (data) => {
        this.handleSyncEvent(data);
      });
    }

    // Listen to API service events
    if (unifiedApiService.on) {
      unifiedApiService.on('serviceStatusChanged', (status) => {
        this.handleServiceStatusChange(status);
      });
    }

    // Listen to window focus events for sync resumption
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.handleWindowFocus();
      });

      window.addEventListener('beforeunload', () => {
        this.handleWindowUnload();
      });
    }
  }

  /**
   * Start sync mechanisms based on current strategy
   */
  async startSyncMechanisms() {
    switch (this.syncStrategy) {
      case SYNC_STRATEGIES.IMMEDIATE:
        await this.startImmediateSync();
        break;
      
      case SYNC_STRATEGIES.BATCHED:
        this.startBatchedSync();
        break;
      
      case SYNC_STRATEGIES.POLLING:
        this.startPollingSync();
        break;
      
      case SYNC_STRATEGIES.HYBRID:
        await this.startHybridSync();
        break;
    }
  }

  /**
   * Start immediate WebSocket-based sync
   */
  async startImmediateSync() {
    if (!getFeatureFlag('ENABLE_WEBSOCKET')) {
      throw new Error('WebSocket not enabled for immediate sync');
    }

    try {
      await realtimeService.connect();
      
      // Subscribe to content channels
      await realtimeService.subscribe('content_sync', {
        onUpdate: (data) => this.processImmediateUpdate(data),
        onError: (error) => this.handleSyncError(error)
      });

      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Immediate sync started via WebSocket');
      }

    } catch (error) {
      console.error('❌ Failed to start immediate sync:', error);
      // Fallback to batched sync
      this.syncStrategy = SYNC_STRATEGIES.BATCHED;
      this.startBatchedSync();
    }
  }

  /**
   * Start batched sync with configurable intervals
   */
  startBatchedSync() {
    const batchInterval = ENV.IS_DEVELOPMENT ? 5000 : 10000; // 5s dev, 10s prod

    this.batchTimer = setInterval(() => {
      this.processBatchedUpdates();
    }, batchInterval);

    if (ENV.IS_DEVELOPMENT) {
      console.log('✅ Batched sync started with', batchInterval + 'ms interval');
    }
  }

  /**
   * Start polling-based sync (fallback)
   */
  startPollingSync() {
    const pollInterval = ENV.IS_DEVELOPMENT ? 15000 : 30000; // 15s dev, 30s prod

    this.pollTimer = setInterval(() => {
      this.pollForUpdates();
    }, pollInterval);

    if (ENV.IS_DEVELOPMENT) {
      console.log('✅ Polling sync started with', pollInterval + 'ms interval');
    }
  }

  /**
   * Start hybrid sync (combination of immediate + batched + polling)
   */
  async startHybridSync() {
    try {
      // Try immediate sync first
      await this.startImmediateSync();
      
      // Also start batched sync for non-critical updates
      this.startBatchedSync();
      
      // Polling as ultimate fallback
      this.startPollingFallback();

      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Hybrid sync started (WebSocket + Batched + Polling)');
      }

    } catch (error) {
      console.error('❌ Hybrid sync failed, falling back to batched:', error);
      this.syncStrategy = SYNC_STRATEGIES.BATCHED;
      this.startBatchedSync();
    }
  }

  /**
   * Subscribe to sync events
   */
  subscribe(eventType, callback, options = {}) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscription = {
      id: this.generateSubscriptionId(),
      callback,
      options,
      createdAt: Date.now()
    };

    this.subscribers.get(eventType).push(subscription);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        const index = subscribers.findIndex(sub => sub.id === subscription.id);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Broadcast sync event to subscribers
   */
  broadcast(eventType, data) {
    const subscribers = this.subscribers.get(eventType);
    if (!subscribers || subscribers.length === 0) return;

    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source: 'sync_service'
    };

    subscribers.forEach(subscription => {
      try {
        subscription.callback(event);
      } catch (error) {
        console.error('❌ Error in sync subscriber callback:', error);
      }
    });
  }

  /**
   * Sync content changes
   */
  async syncContentChange(changeType, contentData, options = {}) {
    if (!this.isCircuitBreakerClosed()) {
      if (ENV.IS_DEVELOPMENT) {
        console.warn('🔴 Sync circuit breaker open, queuing update');
      }
      this.queueUpdate(changeType, contentData, options);
      return false;
    }

    const startTime = Date.now();

    try {
      const syncEvent = {
        type: changeType,
        content: contentData,
        timestamp: Date.now(),
        options
      };

      // Immediate broadcast to local subscribers
      this.broadcast(changeType, syncEvent);

      // Send to remote services based on strategy
      await this.sendSyncUpdate(syncEvent);

      // Update metrics
      this.updateSyncMetrics(true, Date.now() - startTime);

      // Save sync state
      this.saveSyncState();

      return true;

    } catch (error) {
      console.error('❌ Failed to sync content change:', error);
      this.updateSyncMetrics(false, Date.now() - startTime);
      this.handleSyncError(error);
      return false;
    }
  }

  /**
   * Generate unique subscription ID
   */
  generateSubscriptionId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load sync state from localStorage
   */
  async loadSyncState() {
    try {
      const state = await localStorageService.getItem('sync_state', {
        category: 'cache_data',
        encrypted: false
      });

      if (state) {
        this.lastSyncTimestamp = state.lastSyncTimestamp;
        this.syncMetrics = { ...this.syncMetrics, ...state.metrics };
        this.circuitBreaker = { ...this.circuitBreaker, ...state.circuitBreaker };
      }

    } catch (error) {
      console.error('❌ Failed to load sync state:', error);
    }
  }

  /**
   * Save sync state to localStorage
   */
  async saveSyncState() {
    try {
      const state = {
        lastSyncTimestamp: this.lastSyncTimestamp,
        metrics: this.syncMetrics,
        circuitBreaker: this.circuitBreaker,
        savedAt: Date.now()
      };

      await localStorageService.setItem('sync_state', state, {
        category: 'cache_data',
        encrypted: false,
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      });

    } catch (error) {
      console.error('❌ Failed to save sync state:', error);
    }
  }

  /**
   * Check if circuit breaker is closed (allowing operations)
   */
  isCircuitBreakerClosed() {
    const now = Date.now();
    
    if (this.circuitBreaker.isOpen) {
      if (now > this.circuitBreaker.openUntil) {
        // Reset circuit breaker
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.openUntil = null;
        
        if (ENV.IS_DEVELOPMENT) {
          console.log('🟢 Sync circuit breaker reset');
        }
        return true;
      }
      return false;
    }

    return true;
  }

  /**
   * Update sync metrics
   */
  updateSyncMetrics(success, duration) {
    this.syncMetrics.totalSyncs++;
    this.syncMetrics.lastSyncDuration = duration;

    if (success) {
      this.syncMetrics.successfulSyncs++;
    } else {
      this.syncMetrics.failedSyncs++;
    }

    // Update average latency
    const totalDuration = this.syncMetrics.averageLatency * (this.syncMetrics.totalSyncs - 1) + duration;
    this.syncMetrics.averageLatency = totalDuration / this.syncMetrics.totalSyncs;
  }

  /**
   * Handle sync errors and circuit breaker logic
   */
  handleSyncError(error) {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreaker.maxFailures) {
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.openUntil = Date.now() + this.circuitBreaker.resetTimeout;

      if (ENV.IS_DEVELOPMENT) {
        console.warn('🔴 Sync circuit breaker opened due to failures:', this.circuitBreaker.failures);
      }
    }
  }

  /**
   * Get sync service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      strategy: this.syncStrategy,
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures
      },
      metrics: this.syncMetrics,
      lastSync: this.lastSyncTimestamp,
      queueSize: this.syncQueue.length
    };
  }

  /**
   * Process immediate WebSocket updates
   */
  processImmediateUpdate(data) {
    try {
      const { type, content, timestamp } = data;

      // Validate update data
      if (!type || !content) {
        console.warn('⚠️ Invalid immediate update data:', data);
        return;
      }

      // Broadcast to local subscribers
      this.broadcast(type, { content, timestamp, source: 'websocket' });

      // Update last sync timestamp
      this.lastSyncTimestamp = timestamp;

      if (ENV.IS_DEVELOPMENT) {
        console.log('⚡ Processed immediate update:', type, content.id);
      }

    } catch (error) {
      console.error('❌ Error processing immediate update:', error);
    }
  }

  /**
   * Process batched updates
   */
  async processBatchedUpdates() {
    if (this.syncQueue.length === 0) return;

    try {
      const updates = [...this.syncQueue];
      this.syncQueue = [];

      // Group updates by type for efficiency
      const groupedUpdates = this.groupUpdatesByType(updates);

      // Send batched updates
      for (const [type, typeUpdates] of Object.entries(groupedUpdates)) {
        await this.sendBatchedUpdate(type, typeUpdates);
      }

      if (ENV.IS_DEVELOPMENT && updates.length > 0) {
        console.log('📦 Processed batched updates:', updates.length);
      }

    } catch (error) {
      console.error('❌ Error processing batched updates:', error);
      this.handleSyncError(error);
    }
  }

  /**
   * Poll for updates (fallback mechanism)
   */
  async pollForUpdates() {
    if (!this.isCircuitBreakerClosed()) return;

    try {
      const since = this.lastSyncTimestamp || Date.now() - 300000; // Last 5 minutes

      const response = await unifiedApiService.request('/content/sync/updates', {
        method: 'GET',
        params: { since },
        timeout: 5000
      });

      if (response.success && response.data?.updates) {
        for (const update of response.data.updates) {
          this.broadcast(update.type, update);
        }

        this.lastSyncTimestamp = Date.now();

        if (ENV.IS_DEVELOPMENT && response.data.updates.length > 0) {
          console.log('🔄 Polled updates:', response.data.updates.length);
        }
      }

    } catch (error) {
      // Don't log polling errors in production to reduce noise
      if (ENV.IS_DEVELOPMENT) {
        console.warn('⚠️ Polling update failed:', error.message);
      }
      this.handleSyncError(error);
    }
  }

  /**
   * Start polling fallback
   */
  startPollingFallback() {
    const fallbackInterval = 60000; // 1 minute fallback polling

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    this.pollTimer = setInterval(() => {
      this.pollForUpdates();
    }, fallbackInterval);

    if (ENV.IS_DEVELOPMENT) {
      console.log('🔄 Polling fallback started');
    }
  }

  /**
   * Send sync update to remote services
   */
  async sendSyncUpdate(syncEvent) {
    switch (this.syncStrategy) {
      case SYNC_STRATEGIES.IMMEDIATE:
        return await this.sendImmediateUpdate(syncEvent);

      case SYNC_STRATEGIES.BATCHED:
        this.queueUpdate(syncEvent.type, syncEvent.content, syncEvent.options);
        return true;

      case SYNC_STRATEGIES.POLLING:
        // Polling doesn't send updates, only receives
        return true;

      case SYNC_STRATEGIES.HYBRID:
        // Try immediate first, fallback to batched
        try {
          return await this.sendImmediateUpdate(syncEvent);
        } catch (error) {
          this.queueUpdate(syncEvent.type, syncEvent.content, syncEvent.options);
          return true;
        }
    }
  }

  /**
   * Send immediate update via WebSocket
   */
  async sendImmediateUpdate(syncEvent) {
    if (!getFeatureFlag('ENABLE_WEBSOCKET')) {
      throw new Error('WebSocket not available for immediate update');
    }

    return await realtimeService.broadcastUpdate('content_sync', syncEvent);
  }

  /**
   * Queue update for batched processing
   */
  queueUpdate(type, content, options = {}) {
    const update = {
      type,
      content,
      options,
      timestamp: Date.now(),
      id: this.generateUpdateId()
    };

    this.syncQueue.push(update);

    // Limit queue size to prevent memory issues
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-50); // Keep last 50 updates
    }
  }

  /**
   * Group updates by type for efficient batching
   */
  groupUpdatesByType(updates) {
    return updates.reduce((groups, update) => {
      if (!groups[update.type]) {
        groups[update.type] = [];
      }
      groups[update.type].push(update);
      return groups;
    }, {});
  }

  /**
   * Send batched update to backend
   */
  async sendBatchedUpdate(type, updates) {
    try {
      const response = await unifiedApiService.request('/content/sync/batch', {
        method: 'POST',
        data: {
          type,
          updates,
          timestamp: Date.now()
        },
        timeout: 10000
      });

      return response.success;

    } catch (error) {
      console.error('❌ Failed to send batched update:', error);
      throw error;
    }
  }

  /**
   * Handle real-time update from WebSocket
   */
  handleRealtimeUpdate(data) {
    try {
      // Validate and process the update
      if (this.validateUpdateData(data)) {
        this.processImmediateUpdate(data);
      } else {
        console.warn('⚠️ Invalid real-time update data:', data);
      }

    } catch (error) {
      console.error('❌ Error handling real-time update:', error);
    }
  }

  /**
   * Handle sync event from WebSocket
   */
  handleSyncEvent(data) {
    try {
      const { eventType, payload } = data;

      switch (eventType) {
        case 'cache_invalidate':
          this.handleCacheInvalidation(payload);
          break;

        case 'bulk_update':
          this.handleBulkUpdate(payload);
          break;

        case 'sync_request':
          this.handleSyncRequest(payload);
          break;

        default:
          if (ENV.IS_DEVELOPMENT) {
            console.log('🔄 Unknown sync event:', eventType);
          }
      }

    } catch (error) {
      console.error('❌ Error handling sync event:', error);
    }
  }

  /**
   * Handle service status change
   */
  handleServiceStatusChange(status) {
    if (status.newBackend !== unifiedApiService.isNewBackendAvailable) {
      // Backend availability changed, adjust sync strategy
      this.determineSyncStrategy();
      this.restartSyncMechanisms();
    }
  }

  /**
   * Handle window focus event
   */
  handleWindowFocus() {
    // Trigger immediate sync check when window regains focus
    if (this.isInitialized) {
      this.pollForUpdates();
    }
  }

  /**
   * Handle window unload event
   */
  handleWindowUnload() {
    // Save state before page unload
    this.saveSyncState();
  }

  /**
   * Validate update data structure
   */
  validateUpdateData(data) {
    return data &&
           typeof data.type === 'string' &&
           data.content &&
           typeof data.timestamp === 'number';
  }

  /**
   * Handle cache invalidation
   */
  handleCacheInvalidation(payload) {
    this.broadcast(SYNC_EVENTS.CACHE_INVALIDATED, payload);
  }

  /**
   * Handle bulk update
   */
  handleBulkUpdate(payload) {
    this.broadcast(SYNC_EVENTS.BULK_UPDATE, payload);
  }

  /**
   * Handle sync request
   */
  async handleSyncRequest(payload) {
    // Force immediate sync
    await this.pollForUpdates();
  }

  /**
   * Restart sync mechanisms
   */
  async restartSyncMechanisms() {
    // Stop current mechanisms
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    // Start new mechanisms
    await this.startSyncMechanisms();

    if (ENV.IS_DEVELOPMENT) {
      console.log('🔄 Sync mechanisms restarted with strategy:', this.syncStrategy);
    }
  }

  /**
   * Generate unique update ID
   */
  generateUpdateId() {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and destroy service
   */
  destroy() {
    // Clear timers
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    // Clear subscribers
    this.subscribers.clear();

    // Save final state
    this.saveSyncState();

    this.isInitialized = false;

    if (ENV.IS_DEVELOPMENT) {
      console.log('🔄 RealtimeSyncService destroyed');
    }
  }
}

// Create and export singleton instance
const realtimeSyncService = new RealtimeSyncService();

export default realtimeSyncService;
export { SYNC_EVENTS, SYNC_STRATEGIES };
