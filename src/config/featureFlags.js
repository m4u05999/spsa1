/**
 * Feature Flags Configuration - SPSA
 * نظام إدارة الميزات - الجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - Environment-based configuration
 * - Runtime feature toggling
 * - A/B testing support
 * - Performance monitoring integration
 * - PDPL compliance controls
 */

import { ENV, getEnvVar } from './environment.js';

/**
 * Default feature flags configuration
 */
const DEFAULT_FLAGS = {
  // API Integration Flags - UPDATED FOR SUPABASE FALLBACK
  USE_NEW_AUTH: false,
  USE_NEW_CONTENT: false,
  USE_NEW_USERS: false,
  USE_NEW_EVENTS: false,
  USE_NEW_ADMIN: false,
  USE_NEW_PAYMENTS: false,
  USE_NEW_PUBLIC: false,

  // Service Integration Flags - SUPABASE DISABLED, REAL-TIME DISABLED
  ENABLE_HYPERPAY: false,
  ENABLE_SUPABASE_FALLBACK: false,
  ENABLE_NEW_BACKEND: false,
  ENABLE_REAL_TIME: false,
  ENABLE_NOTIFICATIONS: false,
  ENABLE_USER_MANAGEMENT_API: true,
  ENABLE_CONTENT_MANAGEMENT: true,
  
  // Security and Compliance Flags
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_ENCRYPTION: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_PDPL_MODE: true,
  ENABLE_2FA: true,
  ENABLE_2FA_SYSTEM: true,
  ENABLE_2FA_SMS: true,
  ENABLE_2FA_BACKUP_CODES: true,
  
  // Performance Flags
  ENABLE_CACHING: true,
  ENABLE_COMPRESSION: true,
  ENABLE_LAZY_LOADING: true,
  ENABLE_SERVICE_WORKER: false,
  
  // Development Flags
  ENABLE_DEBUG_MODE: false,
  ENABLE_MOCK_DATA: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_REPORTING: true,

  // Phase 3 - Real-time Features System (Priority 1)
  ENABLE_PHASE3_REALTIME: getEnvVar('VITE_ENABLE_PHASE3_REALTIME', 'true') === 'true',
  ENABLE_REAL_TIME_FEATURES: getEnvVar('VITE_ENABLE_REAL_TIME_FEATURES', 'true') === 'true',
  ENABLE_WEBSOCKET: getEnvVar('VITE_ENABLE_WEBSOCKET', 'true') === 'true',
  ENABLE_LIVE_NOTIFICATIONS: getEnvVar('VITE_ENABLE_LIVE_NOTIFICATIONS', 'true') === 'true',
  ENABLE_LIVE_UPDATES: getEnvVar('VITE_ENABLE_LIVE_UPDATES', 'true') === 'true',
  ENABLE_ACTIVITY_FEED: getEnvVar('VITE_ENABLE_ACTIVITY_FEED', 'true') === 'true',
  ENABLE_CONTENT_SYNC: getEnvVar('VITE_ENABLE_CONTENT_SYNC', 'true') === 'true',
  ENABLE_ADMIN_SYNC: getEnvVar('VITE_ENABLE_ADMIN_SYNC', 'true') === 'true',
  ENABLE_USER_ACTIVITY_TRACKING: getEnvVar('VITE_ENABLE_USER_ACTIVITY_TRACKING', 'true') === 'true',
  ENABLE_LIVE_CONTENT_SYNC: getEnvVar('VITE_ENABLE_LIVE_CONTENT_SYNC', 'true') === 'true',

  // Phase 3 - File Upload System (Priority 2)
  ENABLE_PHASE3_FILE_UPLOAD: getEnvVar('VITE_ENABLE_PHASE3_FILE_UPLOAD', 'false') === 'true',
  ENABLE_FILE_UPLOAD: getEnvVar('VITE_ENABLE_FILE_UPLOAD', 'false') === 'true',
  ENABLE_MULTIPLE_FILE_UPLOAD: getEnvVar('VITE_ENABLE_MULTIPLE_FILE_UPLOAD', 'false') === 'true',
  ENABLE_LARGE_FILE_UPLOAD: getEnvVar('VITE_ENABLE_LARGE_FILE_UPLOAD', 'false') === 'true',
  ENABLE_FILE_PREVIEW: getEnvVar('VITE_ENABLE_FILE_PREVIEW', 'false') === 'true',
  ENABLE_FILE_COMPRESSION: getEnvVar('VITE_ENABLE_FILE_COMPRESSION', 'false') === 'true',
  ENABLE_FILE_VALIDATION: getEnvVar('VITE_ENABLE_FILE_VALIDATION', 'false') === 'true',
  ENABLE_VIRUS_SCANNING: getEnvVar('VITE_ENABLE_VIRUS_SCANNING', 'false') === 'true',
  ENABLE_DRAG_DROP_UPLOAD: getEnvVar('VITE_ENABLE_DRAG_DROP_UPLOAD', 'false') === 'true',

  // Phase 3 - Enhanced Notification System (Priority 3)
  ENABLE_PHASE3_NOTIFICATIONS: getEnvVar('VITE_ENABLE_PHASE3_NOTIFICATIONS', 'false') === 'true',
  ENABLE_NOTIFICATION_SYSTEM: getEnvVar('VITE_ENABLE_NOTIFICATION_SYSTEM', 'false') === 'true',
  ENABLE_EMAIL_NOTIFICATIONS: getEnvVar('VITE_ENABLE_EMAIL_NOTIFICATIONS', 'false') === 'true',
  ENABLE_SMS_NOTIFICATIONS: getEnvVar('VITE_ENABLE_SMS_NOTIFICATIONS', 'false') === 'true',
  ENABLE_PUSH_NOTIFICATIONS: getEnvVar('VITE_ENABLE_PUSH_NOTIFICATIONS', 'false') === 'true',
  ENABLE_IN_APP_NOTIFICATIONS: getEnvVar('VITE_ENABLE_IN_APP_NOTIFICATIONS', 'false') === 'true',
  ENABLE_NOTIFICATION_TEMPLATES: getEnvVar('VITE_ENABLE_NOTIFICATION_TEMPLATES', 'false') === 'true',
  ENABLE_USER_PREFERENCES: getEnvVar('VITE_ENABLE_USER_PREFERENCES', 'false') === 'true',
  ENABLE_DELIVERY_TRACKING: getEnvVar('VITE_ENABLE_DELIVERY_TRACKING', 'false') === 'true',
  ENABLE_NOTIFICATION_HISTORY: getEnvVar('VITE_ENABLE_NOTIFICATION_HISTORY', 'false') === 'true',
  ENABLE_SAUDI_SMS_PROVIDERS: getEnvVar('VITE_ENABLE_SAUDI_SMS_PROVIDERS', 'false') === 'true',

  // Legacy Search Features (Maintained for compatibility)
  ENABLE_ADVANCED_SEARCH: getEnvVar('VITE_ENABLE_ADVANCED_SEARCH', 'false') === 'true',
  ENABLE_SEARCH_ANALYTICS: getEnvVar('VITE_ENABLE_SEARCH_ANALYTICS', 'false') === 'true',
  ENABLE_SEARCH_SUGGESTIONS: getEnvVar('VITE_ENABLE_SEARCH_SUGGESTIONS', 'false') === 'true',
  ENABLE_SEARCH_HISTORY: getEnvVar('VITE_ENABLE_SEARCH_HISTORY', 'false') === 'true',

  // Phase 5 - Real-time Sync Features - DISABLED TO PREVENT CONNECTION ERRORS
  ENABLE_REALTIME_SYNC: getEnvVar('VITE_ENABLE_REALTIME_SYNC', 'false') === 'true',
  ENABLE_IMMEDIATE_SYNC: getEnvVar('VITE_ENABLE_IMMEDIATE_SYNC', 'false') === 'true',
  ENABLE_BATCHED_SYNC: getEnvVar('VITE_ENABLE_BATCHED_SYNC', 'false') === 'true',
  ENABLE_HYBRID_SYNC: getEnvVar('VITE_ENABLE_HYBRID_SYNC', 'false') === 'true',
  ENABLE_SYNC_CIRCUIT_BREAKER: getEnvVar('VITE_ENABLE_SYNC_CIRCUIT_BREAKER', 'true') === 'true',
  ENABLE_SYNC_METRICS: getEnvVar('VITE_ENABLE_SYNC_METRICS', 'true') === 'true',
  ENABLE_SYNC_PERSISTENCE: getEnvVar('VITE_ENABLE_SYNC_PERSISTENCE', 'true') === 'true',
  ENABLE_SYNC_VALIDATION: getEnvVar('VITE_ENABLE_SYNC_VALIDATION', 'true') === 'true',
  ENABLE_SYNC_COMPRESSION: getEnvVar('VITE_ENABLE_SYNC_COMPRESSION', 'false') === 'true',
  ENABLE_SYNC_ENCRYPTION: getEnvVar('VITE_ENABLE_SYNC_ENCRYPTION', 'true') === 'true',

  // Content Management Sync - DISABLED TO PREVENT CONNECTION ERRORS
  ENABLE_CONTENT_SYNC: getEnvVar('VITE_ENABLE_CONTENT_SYNC', 'false') === 'true',
  ENABLE_ADMIN_SYNC: getEnvVar('VITE_ENABLE_ADMIN_SYNC', 'false') === 'true',
  ENABLE_PUBLIC_SYNC: getEnvVar('VITE_ENABLE_PUBLIC_SYNC', 'false') === 'true',
  ENABLE_CROSS_TAB_SYNC: getEnvVar('VITE_ENABLE_CROSS_TAB_SYNC', 'false') === 'true',

  // Performance Optimization
  ENABLE_SYNC_DEBOUNCING: getEnvVar('VITE_ENABLE_SYNC_DEBOUNCING', 'true') === 'true',
  ENABLE_SYNC_THROTTLING: getEnvVar('VITE_ENABLE_SYNC_THROTTLING', 'true') === 'true',
  ENABLE_SYNC_BATCHING: getEnvVar('VITE_ENABLE_SYNC_BATCHING', 'true') === 'true',
  ENABLE_SYNC_PRIORITY: getEnvVar('VITE_ENABLE_SYNC_PRIORITY', 'true') === 'true',

  // UI/UX Flags
  ENABLE_DARK_MODE: true,
  ENABLE_RTL_SUPPORT: true,
  ENABLE_ACCESSIBILITY: true,
  ENABLE_ANIMATIONS: true,
  
  // Business Logic Flags
  ENABLE_MEMBERSHIP_RENEWAL: true,
  ENABLE_EVENT_REGISTRATION: true,
  ENABLE_CONTENT_COMMENTS: false,
  ENABLE_SOCIAL_SHARING: true,
  
  // Experimental Flags
  ENABLE_AI_FEATURES: false,
  ENABLE_ANALYTICS: true,
  ENABLE_BETA_FEATURES: false
};

/**
 * Environment-specific overrides
 */
const ENVIRONMENT_OVERRIDES = {
  development: {
    ENABLE_DEBUG_MODE: true,
    ENABLE_MOCK_DATA: true,
    USE_NEW_AUTH: false, // Disable for testing - use secureAuthService
    USE_NEW_CONTENT: false, // Gradual rollout
    ENABLE_HYPERPAY: false, // Use sandbox
    ENABLE_PERFORMANCE_MONITORING: true,

    // Real-time Sync Development Settings - DISABLED TO PREVENT CONNECTION ERRORS
    ENABLE_REALTIME_SYNC: false,
    ENABLE_IMMEDIATE_SYNC: false,
    ENABLE_SYNC_METRICS: false,
    ENABLE_SYNC_VALIDATION: false,
    ENABLE_SYNC_DEBOUNCING: false,
    ENABLE_REAL_TIME_FEATURES: false,
    ENABLE_WEBSOCKET: false,
    ENABLE_NOTIFICATIONS: false
  },
  
  staging: {
    ENABLE_DEBUG_MODE: false,
    ENABLE_MOCK_DATA: false,
    USE_NEW_AUTH: true,
    USE_NEW_CONTENT: true,
    USE_NEW_USERS: false,
    ENABLE_HYPERPAY: true, // Test environment
    ENABLE_BETA_FEATURES: true,

    // Real-time Sync Staging Settings
    ENABLE_REALTIME_SYNC: true,
    ENABLE_HYBRID_SYNC: true,
    ENABLE_SYNC_CIRCUIT_BREAKER: true,
    ENABLE_SYNC_METRICS: true,
    ENABLE_SYNC_PERSISTENCE: true
  },
  
  production: {
    ENABLE_DEBUG_MODE: false,
    ENABLE_MOCK_DATA: false,
    ENABLE_ERROR_REPORTING: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_PDPL_MODE: true,
    ENABLE_AUDIT_LOGGING: true,
    // Production flags will be controlled via environment variables
    USE_NEW_AUTH: ENV.FEATURE_NEW_AUTH === 'true',
    USE_NEW_CONTENT: ENV.FEATURE_NEW_CONTENT === 'true',
    USE_NEW_USERS: ENV.FEATURE_NEW_USERS === 'true',
    ENABLE_HYPERPAY: ENV.FEATURE_HYPERPAY === 'true',

    // Real-time Sync Production Settings
    ENABLE_REALTIME_SYNC: ENV.FEATURE_REALTIME_SYNC === 'true',
    ENABLE_HYBRID_SYNC: ENV.FEATURE_HYBRID_SYNC === 'true',
    ENABLE_SYNC_CIRCUIT_BREAKER: true,
    ENABLE_SYNC_METRICS: true,
    ENABLE_SYNC_PERSISTENCE: true,
    ENABLE_SYNC_ENCRYPTION: true,
    ENABLE_CONTENT_SYNC: ENV.FEATURE_CONTENT_SYNC === 'true',
    ENABLE_ADMIN_SYNC: ENV.FEATURE_ADMIN_SYNC === 'true'
  }
};

/**
 * User-based feature flags (for A/B testing)
 */
const USER_BASED_FLAGS = {
  // Percentage-based rollout
  GRADUAL_ROLLOUT: {
    USE_NEW_CONTENT: 25, // 25% of users
    USE_NEW_USERS: 10,   // 10% of users
    ENABLE_BETA_FEATURES: 5 // 5% of users
  },
  
  // Role-based flags
  ROLE_BASED: {
    admin: {
      USE_NEW_ADMIN: true,
      ENABLE_BETA_FEATURES: true,
      ENABLE_DEBUG_MODE: true
    },
    staff: {
      USE_NEW_CONTENT: true,
      USE_NEW_EVENTS: true
    },
    member: {
      // Standard member features
    },
    guest: {
      // Limited features for guests
      ENABLE_CONTENT_COMMENTS: false,
      ENABLE_EVENT_REGISTRATION: false
    }
  }
};

/**
 * Feature flags manager class
 */
class FeatureFlagsManager {
  constructor() {
    this.flags = { ...DEFAULT_FLAGS };
    this.userContext = null;
    this.listeners = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    this.init();
  }

  /**
   * Initialize feature flags
   */
  init() {
    // Apply environment overrides
    const envOverrides = ENVIRONMENT_OVERRIDES[ENV.NODE_ENV] || {};
    this.flags = { ...this.flags, ...envOverrides };
    
    // Load from localStorage (for development)
    if (ENV.IS_DEVELOPMENT) {
      this.loadFromLocalStorage();
    }
    
    // Load user context
    this.loadUserContext();
    
    if (ENV.IS_DEVELOPMENT) {
      console.log('🚩 Feature Flags initialized:', this.flags);
    }
  }

  /**
   * Load user context for personalized flags
   */
  loadUserContext() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.userContext = JSON.parse(userStr);
        this.applyUserBasedFlags();
      }
    } catch (error) {
      console.warn('Failed to load user context for feature flags:', error);
    }
  }

  /**
   * Apply user-based feature flags
   */
  applyUserBasedFlags() {
    if (!this.userContext) return;

    // Apply role-based flags
    const roleFlags = USER_BASED_FLAGS.ROLE_BASED[this.userContext.role];
    if (roleFlags) {
      this.flags = { ...this.flags, ...roleFlags };
    }

    // Apply gradual rollout flags
    const userId = this.userContext.id;
    if (userId) {
      const userHash = this.hashUserId(userId);
      
      Object.entries(USER_BASED_FLAGS.GRADUAL_ROLLOUT).forEach(([flag, percentage]) => {
        if (userHash % 100 < percentage) {
          this.flags[flag] = true;
        }
      });
    }
  }

  /**
   * Hash user ID for consistent percentage-based rollout
   */
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get feature flag value
   */
  getFlag(flagName, defaultValue = false) {
    // Check cache first
    const cacheKey = `${flagName}_${this.userContext?.id || 'anonymous'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    // Get flag value
    let value = this.flags[flagName];
    
    if (value === undefined) {
      value = defaultValue;
      
      if (ENV.IS_DEVELOPMENT) {
        console.warn(`Feature flag '${flagName}' not found, using default:`, defaultValue);
      }
    }

    // Cache the result
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now()
    });

    return value;
  }

  /**
   * Set feature flag value (for development/testing)
   */
  setFlag(flagName, value) {
    this.flags[flagName] = value;
    
    // Save to localStorage in development
    if (ENV.IS_DEVELOPMENT) {
      this.saveToLocalStorage();
    }
    
    // Clear cache
    this.clearCache(flagName);
    
    // Notify listeners
    this.notifyListeners(flagName, value);
    
    console.log(`🚩 Feature flag '${flagName}' set to:`, value);
  }

  /**
   * Toggle feature flag
   */
  toggleFlag(flagName) {
    const currentValue = this.getFlag(flagName);
    this.setFlag(flagName, !currentValue);
    return !currentValue;
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flagName) {
    return this.getFlag(flagName) === true;
  }

  /**
   * Check if feature is disabled
   */
  isDisabled(flagName) {
    return this.getFlag(flagName) === false;
  }

  /**
   * Get all flags
   */
  getAllFlags() {
    return { ...this.flags };
  }

  /**
   * Update user context and reapply flags
   */
  updateUserContext(userContext) {
    this.userContext = userContext;
    this.clearCache();
    this.applyUserBasedFlags();
    
    if (ENV.IS_DEVELOPMENT) {
      console.log('🚩 User context updated, flags reapplied');
    }
  }

  /**
   * Add listener for flag changes
   */
  addListener(flagName, callback) {
    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, new Set());
    }
    this.listeners.get(flagName).add(callback);
  }

  /**
   * Remove listener
   */
  removeListener(flagName, callback) {
    const flagListeners = this.listeners.get(flagName);
    if (flagListeners) {
      flagListeners.delete(callback);
    }
  }

  /**
   * Notify listeners of flag changes
   */
  notifyListeners(flagName, value) {
    const flagListeners = this.listeners.get(flagName);
    if (flagListeners) {
      flagListeners.forEach(callback => {
        try {
          callback(value, flagName);
        } catch (error) {
          console.error('Error in feature flag listener:', error);
        }
      });
    }
  }

  /**
   * Clear cache
   */
  clearCache(flagName = null) {
    if (flagName) {
      // Clear cache for specific flag
      for (const key of this.cache.keys()) {
        if (key.startsWith(flagName + '_')) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Load flags from localStorage (development only)
   */
  loadFromLocalStorage() {
    try {
      const savedFlags = localStorage.getItem('spsa_feature_flags');
      if (savedFlags) {
        const parsed = JSON.parse(savedFlags);
        this.flags = { ...this.flags, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load feature flags from localStorage:', error);
    }
  }

  /**
   * Save flags to localStorage (development only)
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('spsa_feature_flags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save feature flags to localStorage:', error);
    }
  }

  /**
   * Reset flags to defaults
   */
  resetToDefaults() {
    this.flags = { ...DEFAULT_FLAGS };
    this.clearCache();
    
    if (ENV.IS_DEVELOPMENT) {
      localStorage.removeItem('spsa_feature_flags');
      console.log('🚩 Feature flags reset to defaults');
    }
  }

  /**
   * Get feature flag statistics
   */
  getStatistics() {
    const enabledCount = Object.values(this.flags).filter(Boolean).length;
    const totalCount = Object.keys(this.flags).length;
    
    return {
      total: totalCount,
      enabled: enabledCount,
      disabled: totalCount - enabledCount,
      percentage: Math.round((enabledCount / totalCount) * 100),
      userContext: this.userContext ? {
        id: this.userContext.id,
        role: this.userContext.role
      } : null
    };
  }
}

// Create singleton instance
const featureFlagsManager = new FeatureFlagsManager();

/**
 * Convenience functions
 */
export const getFeatureFlag = (flagName, defaultValue = false) => {
  return featureFlagsManager.getFlag(flagName, defaultValue);
};

export const isFeatureEnabled = (flagName) => {
  return featureFlagsManager.isEnabled(flagName);
};

export const setFeatureFlag = (flagName, value) => {
  return featureFlagsManager.setFlag(flagName, value);
};

export const toggleFeatureFlag = (flagName) => {
  return featureFlagsManager.toggleFlag(flagName);
};

export const updateUserContext = (userContext) => {
  return featureFlagsManager.updateUserContext(userContext);
};

export const addFeatureFlagListener = (flagName, callback) => {
  return featureFlagsManager.addListener(flagName, callback);
};

export const removeFeatureFlagListener = (flagName, callback) => {
  return featureFlagsManager.removeListener(flagName, callback);
};

export const getFeatureFlagStatistics = () => {
  return featureFlagsManager.getStatistics();
};

export const getAllFeatureFlags = () => {
  return featureFlagsManager.getAllFlags();
};

// Development helpers
if (ENV.IS_DEVELOPMENT) {
  window.featureFlags = {
    get: getFeatureFlag,
    set: setFeatureFlag,
    toggle: toggleFeatureFlag,
    getAll: getAllFeatureFlags,
    reset: () => featureFlagsManager.resetToDefaults(),
    stats: getFeatureFlagStatistics
  };
}

export default featureFlagsManager;
