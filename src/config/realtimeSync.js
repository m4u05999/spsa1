// src/config/realtimeSync.js
/**
 * Real-time Sync Configuration - Phase 5
 * تكوين المزامنة الفورية - المرحلة الخامسة
 * 
 * Features:
 * - Sync strategy configuration
 * - Performance optimization settings
 * - Circuit breaker configuration
 * - PDPL compliance settings
 */

import { ENV, getEnvVar } from './environment.js';
import { getFeatureFlag } from './featureFlags.js';

/**
 * Sync Strategy Configuration
 */
export const SYNC_CONFIG = {
  // Strategy Selection
  DEFAULT_STRATEGY: 'HYBRID',
  FALLBACK_STRATEGY: 'POLLING',
  
  // Performance Settings
  HEALTH_CHECK_TIMEOUT: ENV.IS_DEVELOPMENT ? 500 : 1000, // ms
  INITIALIZATION_TIMEOUT: ENV.IS_DEVELOPMENT ? 500 : 2000, // ms
  SYNC_TIMEOUT: 5000, // ms
  
  // Circuit Breaker Settings
  CIRCUIT_BREAKER: {
    MAX_FAILURES: ENV.IS_DEVELOPMENT ? 3 : 5,
    RESET_TIMEOUT: ENV.IS_DEVELOPMENT ? 30000 : 60000, // ms
    HALF_OPEN_MAX_CALLS: 3,
    FAILURE_THRESHOLD_PERCENTAGE: 50,
    MINIMUM_THROUGHPUT: 10
  },
  
  // Sync Intervals
  INTERVALS: {
    IMMEDIATE: 0, // WebSocket-based
    BATCHED: ENV.IS_DEVELOPMENT ? 1000 : 2000, // ms
    POLLING: ENV.IS_DEVELOPMENT ? 5000 : 10000, // ms
    HEALTH_CHECK: ENV.IS_DEVELOPMENT ? 10000 : 30000, // ms
    METRICS_COLLECTION: 60000 // ms
  },
  
  // Debouncing and Throttling
  DEBOUNCE: {
    CONTENT_UPDATES: 300, // ms
    USER_ACTIONS: 500, // ms
    BATCH_OPERATIONS: 1000 // ms
  },
  
  THROTTLE: {
    HIGH_FREQUENCY_UPDATES: 100, // ms
    WEBSOCKET_MESSAGES: 50, // ms
    API_CALLS: 200 // ms
  },
  
  // Batch Processing
  BATCH: {
    MAX_SIZE: 10,
    MAX_WAIT_TIME: 2000, // ms
    PRIORITY_THRESHOLD: 5
  },
  
  // Queue Management
  QUEUE: {
    MAX_SIZE: 100,
    CLEANUP_INTERVAL: 300000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // ms
  },
  
  // WebSocket Configuration
  WEBSOCKET: {
    RECONNECT_INTERVAL: 5000, // ms
    MAX_RECONNECT_ATTEMPTS: 5,
    PING_INTERVAL: 30000, // ms
    PONG_TIMEOUT: 5000, // ms
    MESSAGE_QUEUE_SIZE: 50
  },
  
  // Performance Monitoring
  METRICS: {
    ENABLED: getFeatureFlag('ENABLE_SYNC_METRICS'),
    COLLECTION_INTERVAL: 60000, // ms
    RETENTION_PERIOD: 24 * 60 * 60 * 1000, // 24 hours
    MAX_SAMPLES: 1000
  },
  
  // PDPL Compliance
  PDPL: {
    ENABLED: getFeatureFlag('ENABLE_PDPL_MODE'),
    DATA_RETENTION: 24 * 60 * 60 * 1000, // 24 hours
    ENCRYPTION_ENABLED: getFeatureFlag('ENABLE_SYNC_ENCRYPTION'),
    AUDIT_LOGGING: getFeatureFlag('ENABLE_AUDIT_LOGGING'),
    CONSENT_REQUIRED: true,
    ANONYMIZE_LOGS: true
  },
  
  // Error Handling
  ERROR_HANDLING: {
    MAX_ERROR_LOGS: 100,
    ERROR_RETENTION: 60 * 60 * 1000, // 1 hour
    SILENT_ERRORS: ['NETWORK_TIMEOUT', 'CONNECTION_LOST'],
    CRITICAL_ERRORS: ['AUTHENTICATION_FAILED', 'PERMISSION_DENIED']
  },
  
  // Development Settings
  DEVELOPMENT: {
    ENABLED: ENV.IS_DEVELOPMENT,
    VERBOSE_LOGGING: ENV.IS_DEVELOPMENT,
    MOCK_DELAYS: ENV.IS_DEVELOPMENT ? 100 : 0,
    FORCE_FALLBACK: false,
    SIMULATE_ERRORS: false
  }
};

/**
 * Environment-specific overrides
 */
const ENVIRONMENT_OVERRIDES = {
  development: {
    HEALTH_CHECK_TIMEOUT: 500,
    INITIALIZATION_TIMEOUT: 500,
    CIRCUIT_BREAKER: {
      MAX_FAILURES: 3,
      RESET_TIMEOUT: 30000
    },
    INTERVALS: {
      BATCHED: 1000,
      POLLING: 5000,
      HEALTH_CHECK: 10000
    },
    DEVELOPMENT: {
      VERBOSE_LOGGING: true,
      MOCK_DELAYS: 100
    }
  },
  
  staging: {
    HEALTH_CHECK_TIMEOUT: 750,
    INITIALIZATION_TIMEOUT: 1000,
    CIRCUIT_BREAKER: {
      MAX_FAILURES: 4,
      RESET_TIMEOUT: 45000
    },
    INTERVALS: {
      BATCHED: 1500,
      POLLING: 7500,
      HEALTH_CHECK: 20000
    }
  },
  
  production: {
    HEALTH_CHECK_TIMEOUT: 1000,
    INITIALIZATION_TIMEOUT: 2000,
    CIRCUIT_BREAKER: {
      MAX_FAILURES: 5,
      RESET_TIMEOUT: 60000
    },
    INTERVALS: {
      BATCHED: 2000,
      POLLING: 10000,
      HEALTH_CHECK: 30000
    },
    DEVELOPMENT: {
      ENABLED: false,
      VERBOSE_LOGGING: false,
      MOCK_DELAYS: 0
    }
  }
};

/**
 * Get environment-specific configuration
 */
export const getSyncConfig = () => {
  const baseConfig = { ...SYNC_CONFIG };
  const envOverrides = ENVIRONMENT_OVERRIDES[ENV.NODE_ENV] || {};
  
  // Deep merge configuration
  const mergedConfig = deepMerge(baseConfig, envOverrides);
  
  // Apply feature flag overrides
  if (!getFeatureFlag('ENABLE_REALTIME_SYNC')) {
    mergedConfig.DEFAULT_STRATEGY = 'POLLING';
  }
  
  if (!getFeatureFlag('ENABLE_WEBSOCKET')) {
    mergedConfig.DEFAULT_STRATEGY = 'POLLING';
    mergedConfig.WEBSOCKET.ENABLED = false;
  }
  
  if (!getFeatureFlag('ENABLE_SYNC_CIRCUIT_BREAKER')) {
    mergedConfig.CIRCUIT_BREAKER.ENABLED = false;
  }
  
  return mergedConfig;
};

/**
 * Deep merge utility function
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Validate sync configuration
 */
export const validateSyncConfig = (config = getSyncConfig()) => {
  const errors = [];
  
  // Validate timeouts
  if (config.HEALTH_CHECK_TIMEOUT < 100) {
    errors.push('HEALTH_CHECK_TIMEOUT must be at least 100ms');
  }
  
  if (config.INITIALIZATION_TIMEOUT < 500) {
    errors.push('INITIALIZATION_TIMEOUT must be at least 500ms');
  }
  
  // Validate circuit breaker
  if (config.CIRCUIT_BREAKER.MAX_FAILURES < 1) {
    errors.push('CIRCUIT_BREAKER.MAX_FAILURES must be at least 1');
  }
  
  if (config.CIRCUIT_BREAKER.RESET_TIMEOUT < 1000) {
    errors.push('CIRCUIT_BREAKER.RESET_TIMEOUT must be at least 1000ms');
  }
  
  // Validate intervals
  if (config.INTERVALS.BATCHED < 100) {
    errors.push('INTERVALS.BATCHED must be at least 100ms');
  }
  
  if (config.INTERVALS.POLLING < 1000) {
    errors.push('INTERVALS.POLLING must be at least 1000ms');
  }
  
  // Validate batch settings
  if (config.BATCH.MAX_SIZE < 1) {
    errors.push('BATCH.MAX_SIZE must be at least 1');
  }
  
  if (config.BATCH.MAX_WAIT_TIME < 100) {
    errors.push('BATCH.MAX_WAIT_TIME must be at least 100ms');
  }
  
  // Validate queue settings
  if (config.QUEUE.MAX_SIZE < 10) {
    errors.push('QUEUE.MAX_SIZE must be at least 10');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get sync strategy based on available features
 */
export const determineSyncStrategy = () => {
  const config = getSyncConfig();
  
  // Check feature flags
  const hasWebSocket = getFeatureFlag('ENABLE_WEBSOCKET');
  const hasRealtime = getFeatureFlag('ENABLE_REAL_TIME_FEATURES');
  const hasHybrid = getFeatureFlag('ENABLE_HYBRID_SYNC');
  
  if (hasHybrid && hasWebSocket && hasRealtime) {
    return 'HYBRID';
  } else if (hasWebSocket && hasRealtime) {
    return 'IMMEDIATE';
  } else if (getFeatureFlag('ENABLE_BATCHED_SYNC')) {
    return 'BATCHED';
  } else {
    return 'POLLING';
  }
};

/**
 * Export default configuration
 */
export default getSyncConfig();
