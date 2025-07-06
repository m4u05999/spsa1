/**
 * Unified API Service - SPSA Integration Layer
 * خدمة API موحدة - طبقة التكامل للجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - Smart fallback between Node.js Backend and Supabase
 * - Automatic retry logic with exponential backoff
 * - Performance monitoring and metrics
 * - PDPL compliant error handling
 * - Feature flags integration
 */

import { ENV } from '../config/environment.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { loadSupabaseService } from '../utils/moduleLoader.js';
import { monitoringService } from '../utils/monitoring.js';
import { recordServiceInit, recordApiCall } from '../utils/developmentPerformanceMonitor.js';

/**
 * Service configuration and endpoints
 */
// Get API URL with proper fallback logic - FIXED TO PREVENT CONNECTION ERRORS
const getApiUrl = () => {
  // Direct check of Vite environment variables
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const viteAppEnv = import.meta.env.VITE_APP_ENV;
  const isDev = import.meta.env.DEV;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // For test environment, always use localhost:3001 as expected by tests
  if (viteAppEnv === 'test' || import.meta.env.MODE === 'test') {
    return viteApiUrl || 'http://localhost:3001/api';
  }

  // For development, use Supabase instead of localhost to prevent connection errors
  if (isDev || viteAppEnv === 'development') {
    // Use Supabase REST API instead of localhost
    return supabaseUrl ? `${supabaseUrl}/rest/v1` : 'https://dufvobubfjicrkygwyll.supabase.co/rest/v1';
  }

  // For production, use ENV.API_URL or fallback
  return ENV.API_URL || viteApiUrl || 'https://api.political-science-assoc.com';
};

const SERVICE_CONFIG = {
  NEW_BACKEND: {
    baseURL: getApiUrl(),
    timeout: 3000, // Reduced from 10s to 3s for faster response
    retryAttempts: 2, // Reduced from 3 to 2 for faster fallback
    retryDelay: 300, // Reduced from 1s to 300ms
    healthCheckTimeout: 1000 // Fast health check timeout
  },
  SUPABASE: {
    timeout: 2000, // Reduced from 8s to 2s
    retryAttempts: 1, // Reduced from 2 to 1
    retryDelay: 200, // Reduced from 500ms to 200ms
    healthCheckTimeout: 500 // Very fast health check
  },
  CACHE: {
    defaultTTL: 300000, // 5 minutes default cache
    maxSize: 100, // Maximum cached items
    shortTTL: 60000, // 1 minute for frequently changing data
    longTTL: 900000 // 15 minutes for static data
  }
};

// Debug logging for service configuration
if (import.meta.env.DEV) {
  console.log('🔗 UnifiedApiService Config Debug:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    IS_DEV: import.meta.env.DEV,
    ENV_API_URL: ENV.API_URL,
    FINAL_BASE_URL: SERVICE_CONFIG.NEW_BACKEND.baseURL,
    HEALTH_CHECK_URL: `${SERVICE_CONFIG.NEW_BACKEND.baseURL.replace('/api', '')}/health`
  });
}

/**
 * Request types and their fallback strategies
 */
const FALLBACK_STRATEGIES = {
  AUTH: 'PREFER_NEW', // Authentication prefers new backend
  CONTENT: 'SMART', // Content uses smart routing
  ADMIN: 'NEW_ONLY', // Admin operations only on new backend
  PUBLIC: 'EITHER' // Public data can use either service
};

/**
 * Unified API Service Class
 */
class UnifiedApiService {
  constructor() {
    this.isNewBackendAvailable = false;
    this.isSupabaseAvailable = false;
    this.healthCheckInterval = null;
    this.requestQueue = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;

    // Enhanced caching system
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.pendingRequests = new Map(); // Request deduplication

    // Performance tracking
    this.performanceMetrics = {
      requestCount: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      fastestResponse: Infinity,
      slowestResponse: 0
    };

    this.circuitBreaker = {
      newBackend: {
        failures: 0,
        lastFailure: null,
        isOpen: false,
        openUntil: null,
        backoffMultiplier: 1,
        consecutiveSuccesses: 0 // Track recovery
      },
      supabase: {
        failures: 0,
        lastFailure: null,
        isOpen: false,
        openUntil: null,
        backoffMultiplier: 1,
        consecutiveSuccesses: 0 // Track recovery
      }
    };

    // Load circuit breaker state from localStorage
    this.loadCircuitBreakerState();

    // Start non-blocking initialization
    this.initializeAsync();
  }

  /**
   * Non-blocking initialization
   */
  initializeAsync() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * Perform actual initialization with timeout
   */
  async performInitialization() {
    const startTime = performance.now();

    try {
      // In development, use immediate circuit breaker check
      if (ENV.IS_DEVELOPMENT) {
        const savedState = this.loadCircuitBreakerState();

        // If we have recent failures, skip health check entirely
        if (savedState?.newBackend?.failures >= 2) {
          if (ENV.IS_DEVELOPMENT) {
            console.log('🟡 Development mode: Circuit breaker open, using Supabase fallback');
          }
          this.isNewBackendAvailable = false;
          this.isSupabaseAvailable = true;
          this.updateCircuitBreaker('newBackend', false);
          this.updateCircuitBreaker('supabase', true);
        } else {
          // Very fast health check in development (500ms max)
          await this.fastHealthCheck();
        }
      } else {
        // Production: normal health check
        await this.checkServicesHealthWithTimeout(2000); // Reduced to 2 seconds
      }

      this.startHealthMonitoring();
      this.isInitialized = true;

      const endTime = performance.now();
      recordServiceInit('UnifiedApiService', startTime, endTime);

      if (ENV.IS_DEVELOPMENT) {
        console.log('🔗 UnifiedApiService initialized', {
          newBackend: this.isNewBackendAvailable,
          supabase: this.isSupabaseAvailable,
          initTime: `${(endTime - startTime).toFixed(2)}ms`
        });
      }
    } catch (error) {
      // Fallback to Supabase on initialization failure
      this.isNewBackendAvailable = false;
      this.isSupabaseAvailable = true;
      this.isInitialized = true;

      const endTime = performance.now();
      recordServiceInit('UnifiedApiService', startTime, endTime);

      if (ENV.IS_DEVELOPMENT) {
        console.warn('🟡 UnifiedApiService initialization failed, using Supabase fallback:', error.message);
      }
    }
  }

  /**
   * Check if backend is intentionally unavailable in development
   */
  isBackendIntentionallyUnavailable() {
    if (!ENV.IS_DEVELOPMENT) return false;

    // Check circuit breaker state from localStorage
    const savedState = this.loadCircuitBreakerState();
    if (savedState?.newBackend?.failures >= 1) { // More aggressive in development
      const now = Date.now();
      const lastFailure = savedState.newBackend.lastFailure;

      // If failed in last 5 minutes, consider unavailable
      if (lastFailure && (now - lastFailure) < 300000) {
        return true;
      }
    }

    return false;
  }

  /**
   * Enhanced caching system with TTL support
   */
  getCacheKey(endpoint, method, data) {
    const dataHash = data ? JSON.stringify(data) : '';
    return `${method}:${endpoint}:${dataHash}`;
  }

  isValidCacheEntry(key, ttl = SERVICE_CONFIG.CACHE.defaultTTL) {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;

    const now = Date.now();
    return (now - timestamp) < ttl;
  }

  getFromCache(endpoint, method, data, ttl) {
    const key = this.getCacheKey(endpoint, method, data);

    if (this.cache.has(key) && this.isValidCacheEntry(key, ttl)) {
      return this.cache.get(key);
    }

    return null;
  }

  setCache(endpoint, method, data, result, ttl = SERVICE_CONFIG.CACHE.defaultTTL) {
    const key = this.getCacheKey(endpoint, method, data);

    // Implement LRU eviction if cache is full
    if (this.cache.size >= SERVICE_CONFIG.CACHE.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }

    this.cache.set(key, result);
    this.cacheTimestamps.set(key, Date.now());
  }

  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Request deduplication system
   */
  getRequestKey(endpoint, method, data) {
    return this.getCacheKey(endpoint, method, data);
  }

  isDuplicateRequest(endpoint, method, data) {
    const key = this.getRequestKey(endpoint, method, data);
    return this.pendingRequests.has(key);
  }

  addPendingRequest(endpoint, method, data, promise) {
    const key = this.getRequestKey(endpoint, method, data);
    this.pendingRequests.set(key, promise);

    // Clean up when request completes
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return promise;
  }

  getPendingRequest(endpoint, method, data) {
    const key = this.getRequestKey(endpoint, method, data);
    return this.pendingRequests.get(key);
  }

  /**
   * Check health of both services with timeout
   */
  async checkServicesHealthWithTimeout(timeout = 5000) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeout);
    });

    try {
      const healthChecks = await Promise.race([
        Promise.allSettled([
          this.checkNewBackendHealth(),
          this.checkSupabaseHealth()
        ]),
        timeoutPromise
      ]);

      this.isNewBackendAvailable = healthChecks[0].status === 'fulfilled';
      this.isSupabaseAvailable = healthChecks[1].status === 'fulfilled';

      // Update circuit breakers
      this.updateCircuitBreaker('newBackend', this.isNewBackendAvailable);
      this.updateCircuitBreaker('supabase', this.isSupabaseAvailable);

      // Save circuit breaker state
      this.saveCircuitBreakerState();

    } catch (error) {
      // On timeout, assume backend is unavailable but Supabase works
      this.isNewBackendAvailable = false;
      this.isSupabaseAvailable = true;
      this.updateCircuitBreaker('newBackend', false);
      this.updateCircuitBreaker('supabase', true);
      this.saveCircuitBreakerState();

      if (ENV.IS_DEVELOPMENT) {
        console.warn('🟡 Health check timeout, using Supabase fallback');
      }
    }
  }

  /**
   * Ultra-fast health check for development (300ms max)
   */
  async fastHealthCheck() {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Fast health check timeout')), 300);
    });

    try {
      // Use AbortController for faster cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 250);

      const backendCheck = Promise.race([
        this.ultraQuickBackendPing(controller.signal),
        timeoutPromise
      ]);

      const isBackendAvailable = await backendCheck;
      clearTimeout(timeoutId);

      this.isNewBackendAvailable = isBackendAvailable;
      this.isSupabaseAvailable = true; // Always assume Supabase works

      this.updateCircuitBreaker('newBackend', isBackendAvailable);
      this.updateCircuitBreaker('supabase', true);

      this.saveCircuitBreakerState();

    } catch (error) {
      // On timeout or error, assume backend is unavailable
      this.isNewBackendAvailable = false;
      this.isSupabaseAvailable = true;
      this.updateCircuitBreaker('newBackend', false);
      this.updateCircuitBreaker('supabase', true);
      this.saveCircuitBreakerState();

      if (ENV.IS_DEVELOPMENT) {
        console.log('🟡 Ultra-fast health check failed, using Supabase fallback');
      }
    }
  }

  /**
   * Ultra-quick backend ping with abort signal
   */
  async ultraQuickBackendPing(signal) {
    try {
      const response = await fetch(`${SERVICE_CONFIG.NEW_BACKEND.baseURL.replace('/api', '')}/health`, {
        method: 'HEAD', // Use HEAD instead of GET for faster response
        signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Health check aborted');
      }
      return false;
    }
  }

  /**
   * Quick backend ping (very fast check)
   */
  async quickBackendPing() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300); // 300ms timeout

      const response = await fetch('http://localhost:3001/health', {
        method: 'HEAD', // HEAD request is faster than GET
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check health of both services (legacy method)
   */
  async checkServicesHealth() {
    return this.checkServicesHealthWithTimeout(5000); // Reduced from 10s
  }

  /**
   * Check new backend health with circuit breaker awareness
   */
  async checkNewBackendHealth() {
    try {
      // Check circuit breaker first
      if (this.isCircuitBreakerOpen('newBackend')) {
        return false;
      }

      // Check if we've failed recently to avoid spam
      const lastCheck = this.lastHealthCheck?.newBackend;
      const now = Date.now();

      // In development, be much more aggressive about avoiding checks
      const cooldownTime = ENV.IS_DEVELOPMENT ? 10000 : 60000; // 10s in dev, 60s in prod
      if (lastCheck && (now - lastCheck.timestamp) < cooldownTime && !lastCheck.success) {
        return false;
      }

      // In development, check saved circuit breaker state
      if (ENV.IS_DEVELOPMENT) {
        const savedState = this.loadCircuitBreakerState();
        if (savedState?.newBackend?.failures >= 1) {
          const timeSinceFailure = now - (savedState.newBackend.lastFailure || 0);
          if (timeSinceFailure < 300000) { // 5 minutes
            return false;
          }
        }
      }

      // Check if we're using Supabase URL (contains supabase.co)
      const baseURL = SERVICE_CONFIG.NEW_BACKEND.baseURL;
      const isSupabaseUrl = baseURL.includes('supabase.co');

      if (isSupabaseUrl) {
        // For Supabase, test with a simple REST API call instead of /health
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ENV.IS_DEVELOPMENT ? 1000 : 3000);

        // Test Supabase connection with a simple query that doesn't require tables
        const response = await fetch(`${baseURL}/?select=count`, {
          method: 'HEAD', // HEAD request to avoid data transfer
          signal: controller.signal,
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        // For Supabase, 200 or 406 (Method Not Allowed) are both acceptable for HEAD requests
        const isHealthy = response.status === 200 || response.status === 406;

        // Store last check result
        this.lastHealthCheck = this.lastHealthCheck || {};
        this.lastHealthCheck.newBackend = {
          timestamp: now,
          success: isHealthy
        };

        return isHealthy;
      } else {
        // For custom backend, use /health endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ENV.IS_DEVELOPMENT ? 1000 : 3000);

        const response = await fetch(`${baseURL.replace('/api', '')}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Health check failed: ${response.status}`);

        const data = await response.json();
        const isHealthy = data.status === 'healthy';

        // Store last check result
        this.lastHealthCheck = this.lastHealthCheck || {};
        this.lastHealthCheck.newBackend = {
          timestamp: now,
          success: isHealthy
        };

        return isHealthy;
      }
    } catch (error) {
      // Store failed check to avoid spam
      this.lastHealthCheck = this.lastHealthCheck || {};
      this.lastHealthCheck.newBackend = {
        timestamp: Date.now(),
        success: false
      };

      // Silently fail for common connection errors to reduce console noise
      // Only log once per session to avoid spam
      if (ENV.IS_DEVELOPMENT && !this._backendUnavailableLogged &&
          !error.message.includes('Failed to fetch') &&
          !error.name?.includes('Abort') &&
          !error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.info('ℹ️ Backend unavailable, using Supabase fallback');
        this._backendUnavailableLogged = true;
      }

      return false;
    }
  }

  /**
   * Check Supabase health with improved error handling
   */
  async checkSupabaseHealth() {
    try {
      // Check if we've failed recently to avoid spam
      const lastCheck = this.lastHealthCheck?.supabase;
      const now = Date.now();

      if (lastCheck && (now - lastCheck.timestamp) < 30000 && !lastCheck.success) {
        // Don't check again if we failed in the last 30 seconds
        return false;
      }

      const service = await loadSupabaseService();
      if (!service.isAvailable()) {
        // Store failed check
        this.lastHealthCheck = this.lastHealthCheck || {};
        this.lastHealthCheck.supabase = {
          timestamp: now,
          success: false
        };
        return false;
      }

      const result = await service.testConnection();
      const isHealthy = result.success;

      // Store last check result
      this.lastHealthCheck = this.lastHealthCheck || {};
      this.lastHealthCheck.supabase = {
        timestamp: now,
        success: isHealthy
      };

      return isHealthy;
    } catch (error) {
      // Store failed check to avoid spam
      this.lastHealthCheck = this.lastHealthCheck || {};
      this.lastHealthCheck.supabase = {
        timestamp: Date.now(),
        success: false
      };

      // Only log if it's not a module loading error (to reduce noise)
      if (!error.message.includes('Supabase service not available')) {
        console.warn('Supabase health check failed:', error.message);
      }

      return false;
    }
  }

  /**
   * Start health monitoring with intelligent intervals and circuit breaker
   */
  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Adaptive health check intervals based on service status
    const getHealthCheckInterval = () => {
      const newBackendBreaker = this.circuitBreaker.newBackend;
      const supabaseBreaker = this.circuitBreaker.supabase;

      // If both services are failing, increase interval significantly
      if (newBackendBreaker.isOpen && supabaseBreaker.isOpen) {
        return 300000; // 5 minutes when both are down
      }

      // If new backend is failing but Supabase works, check less frequently
      if (newBackendBreaker.isOpen && !supabaseBreaker.isOpen) {
        return 180000; // 3 minutes when backend is down but Supabase works
      }

      // Normal interval when services are healthy
      return 120000; // 2 minutes for normal operation
    };

    const scheduleNextCheck = () => {
      const interval = getHealthCheckInterval();
      this.healthCheckInterval = setTimeout(() => {
        this.checkServicesHealth().finally(() => {
          scheduleNextCheck(); // Schedule next check after current one completes
        });
      }, interval);
    };

    // Initial check after 10 seconds (increased from 5)
    setTimeout(() => {
      this.checkServicesHealth().finally(() => {
        scheduleNextCheck();
      });
    }, 10000);
  }

  /**
   * Load circuit breaker state from localStorage
   */
  loadCircuitBreakerState() {
    try {
      const saved = localStorage.getItem('unifiedApiService_circuitBreaker');
      if (saved) {
        const state = JSON.parse(saved);
        const now = Date.now();

        // Check if saved state is still valid (not older than 1 hour)
        if (state.timestamp && (now - state.timestamp) < 3600000) {
          Object.assign(this.circuitBreaker, state.circuitBreaker);
          return state.circuitBreaker;
        }
      }
    } catch (error) {
      if (ENV.IS_DEVELOPMENT) {
        console.warn('Failed to load circuit breaker state:', error);
      }
    }
    return null;
  }

  /**
   * Save circuit breaker state to localStorage
   */
  saveCircuitBreakerState() {
    try {
      const state = {
        circuitBreaker: this.circuitBreaker,
        timestamp: Date.now()
      };
      localStorage.setItem('unifiedApiService_circuitBreaker', JSON.stringify(state));
    } catch (error) {
      if (ENV.IS_DEVELOPMENT) {
        console.warn('Failed to save circuit breaker state:', error);
      }
    }
  }

  /**
   * Update circuit breaker state with exponential backoff
   */
  updateCircuitBreaker(service, isHealthy) {
    const breaker = this.circuitBreaker[service];
    const now = Date.now();

    if (isHealthy) {
      // Reset on success
      const wasOpen = breaker.isOpen;
      breaker.consecutiveSuccesses++;

      // Reset failures and close circuit after successful request
      if (breaker.consecutiveSuccesses >= 1) { // Close after first success
        breaker.failures = 0;
        breaker.lastFailure = null;
        breaker.isOpen = false;
        breaker.openUntil = null;

        // Gradually reduce backoff multiplier on consecutive successes
        if (breaker.consecutiveSuccesses >= 3) {
          breaker.backoffMultiplier = Math.max(breaker.backoffMultiplier * 0.8, 1);
        }
      }

      if (import.meta.env.DEV && wasOpen) {
        console.log(`✅ ${service} service recovered (${breaker.consecutiveSuccesses} consecutive successes)`);
      }
    } else {
      breaker.failures++;
      breaker.lastFailure = now;
      breaker.consecutiveSuccesses = 0; // Reset success counter

      // More aggressive circuit breaking for faster response
      const maxFailures = ENV.IS_DEVELOPMENT ? 1 : 2; // Reduced from 3 to 2 in production
      if (breaker.failures >= maxFailures) {
        breaker.isOpen = true;
        breaker.backoffMultiplier = Math.min(breaker.backoffMultiplier * 1.5, 8); // Max 8x backoff

        // Reduced backoff times for faster recovery
        const baseBackoff = ENV.IS_DEVELOPMENT ? 30000 : 60000; // Reduced from 60s/120s to 30s/60s
        const backoffTime = baseBackoff * breaker.backoffMultiplier;
        breaker.openUntil = now + backoffTime;

        if (import.meta.env.DEV) {
          console.warn(`🔴 ${service} circuit breaker opened for ${Math.round(backoffTime/1000)}s (${breaker.failures} failures)`);
        }
      }
    }

    // Save state after update
    this.saveCircuitBreakerState();
  }

  /**
   * Check if circuit breaker allows requests with exponential backoff
   */
  isCircuitBreakerOpen(service) {
    const breaker = this.circuitBreaker[service];
    const now = Date.now();

    if (!breaker.isOpen) return false;

    // Check if backoff period has expired
    if (breaker.openUntil && now >= breaker.openUntil) {
      // Allow one test request (half-open state)
      breaker.isOpen = false;
      breaker.openUntil = null;

      if (import.meta.env.DEV) {
        console.log(`🟡 ${service} circuit breaker half-open (testing connection)`);
      }

      return false;
    }

    return true;
  }

  /**
   * Determine which service to use for a request
   */
  determineService(requestType, options = {}) {
    const strategy = FALLBACK_STRATEGIES[requestType] || 'SMART';
    const forceService = options.forceService;
    
    if (forceService) {
      return forceService === 'NEW_BACKEND' ? 'newBackend' : 'supabase';
    }

    // Check feature flags
    const useNewBackend = getFeatureFlag(`USE_NEW_${requestType}`);
    
    switch (strategy) {
      case 'NEW_ONLY':
        return 'newBackend';
        
      case 'PREFER_NEW':
        if (useNewBackend && this.isNewBackendAvailable && !this.isCircuitBreakerOpen('newBackend')) {
          return 'newBackend';
        }
        return this.isSupabaseAvailable ? 'supabase' : 'newBackend';
        
      case 'SMART':
        // Use performance metrics to decide
        const newBackendMetrics = monitoringService.getServiceMetrics('newBackend');
        const supabaseMetrics = monitoringService.getServiceMetrics('supabase');
        
        if (useNewBackend && this.isNewBackendAvailable && !this.isCircuitBreakerOpen('newBackend')) {
          if (!newBackendMetrics || newBackendMetrics.avgResponseTime < 1000) {
            return 'newBackend';
          }
        }
        
        return this.isSupabaseAvailable && !this.isCircuitBreakerOpen('supabase') ? 'supabase' : 'newBackend';
        
      case 'EITHER':
      default:
        if (this.isNewBackendAvailable && !this.isCircuitBreakerOpen('newBackend')) {
          return 'newBackend';
        }
        return 'supabase';
    }
  }

  /**
   * Make request with automatic fallback, caching, and deduplication
   */
  async request(endpoint, options = {}) {
    const requestId = this.generateRequestId();
    const startTime = performance.now();

    try {
      const {
        method = 'GET',
        data = null,
        headers = {},
        requestType = 'PUBLIC',
        timeout = SERVICE_CONFIG.NEW_BACKEND.timeout, // Use optimized timeout
        retryOnFailure = true,
        useCache = method === 'GET', // Enable caching for GET requests
        cacheTTL = SERVICE_CONFIG.CACHE.defaultTTL
      } = options;

      // Check cache first for GET requests
      if (useCache && method === 'GET') {
        const cachedResult = this.getFromCache(endpoint, method, data, cacheTTL);
        if (cachedResult) {
          // Update performance metrics for cache hit
          const endTime = performance.now();
          this.updatePerformanceMetrics(endTime - startTime);

          if (ENV.IS_DEVELOPMENT && Math.random() < 0.05) { // 5% chance to log cache hits
            console.log(`⚡ Cache hit for ${endpoint} (${(endTime - startTime).toFixed(2)}ms)`);
          }

          return cachedResult;
        }
      }

      // Check for duplicate requests
      if (this.isDuplicateRequest(endpoint, method, data)) {
        const pendingRequest = this.getPendingRequest(endpoint, method, data);
        if (pendingRequest) {
          if (ENV.IS_DEVELOPMENT && Math.random() < 0.1) { // 10% chance to log deduplication
            console.log(`🔄 Deduplicating request for ${endpoint}`);
          }
          return await pendingRequest;
        }
      }

      // Determine primary service
      const primaryService = this.determineService(requestType, options);
      
      // Track request start
      monitoringService.trackRequest(requestId, {
        endpoint,
        method,
        service: primaryService,
        requestType
      });

      // Create request promise and add to pending requests for deduplication
      const requestPromise = this.executeRequest(primaryService, endpoint, {
        method,
        data,
        headers,
        timeout,
        requestId,
        retryOnFailure
      });

      // Add to pending requests for deduplication
      this.addPendingRequest(endpoint, method, data, requestPromise);

      let result;
      let usedService = primaryService;

      try {
        const requestResult = await requestPromise;
        result = requestResult.result;
        usedService = requestResult.usedService;

      } catch (error) {
        // Remove from pending requests on error
        this.pendingRequests.delete(this.getRequestKey(endpoint, method, data));
        throw error;
      }

      // Track successful request
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(duration);

      monitoringService.trackRequestSuccess(requestId, {
        service: usedService,
        duration,
        endpoint
      });

      // Record performance metrics
      recordApiCall(endpoint, startTime, endTime, true);

      // Cache successful GET requests
      if (options.useCache && options.method === 'GET') {
        this.setCache(endpoint, options.method, data, result, options.cacheTTL);
      }

      // Log performance warnings
      if (duration > 2000 && ENV.IS_DEVELOPMENT) {
        console.warn(`⚠️ Slow request: ${endpoint} took ${duration.toFixed(2)}ms`);
      } else if (duration < 500 && ENV.IS_DEVELOPMENT && Math.random() < 0.02) { // 2% chance
        console.log(`⚡ Fast request: ${endpoint} took ${duration.toFixed(2)}ms`);
      }

      return {
        success: true,
        data: result,
        metadata: {
          service: usedService,
          duration,
          requestId,
          endpoint,
          cached: false
        }
      };

    } catch (error) {
      // Track failed request
      const endTime = performance.now();
      const duration = endTime - startTime;

      monitoringService.trackRequestError(requestId, {
        error: error.message,
        duration,
        endpoint
      });

      // Record performance metrics
      recordApiCall(endpoint, startTime, endTime, false);

      throw error;
    }
  }

  /**
   * Execute request with fallback logic
   */
  async executeRequest(primaryService, endpoint, options) {
    const { method, data, headers, timeout, requestId, retryOnFailure } = options;

    try {
      // Try primary service
      const result = await this.makeServiceRequest(primaryService, endpoint, {
        method,
        data,
        headers,
        timeout,
        requestId
      });

      return { result, usedService: primaryService };

    } catch (primaryError) {
      // Only log non-connection errors in development
      if (ENV.IS_DEVELOPMENT && !primaryError.message.includes('ERR_CONNECTION_REFUSED') &&
          !primaryError.message.includes('Failed to fetch')) {
        console.warn(`Primary service (${primaryService}) failed:`, primaryError.message);
      }

      // Try fallback if enabled and available
      if (retryOnFailure && primaryService !== 'supabase' && this.isSupabaseAvailable) {
        try {
          const result = await this.makeServiceRequest('supabase', endpoint, {
            method,
            data,
            headers,
            timeout: SERVICE_CONFIG.SUPABASE.timeout,
            requestId
          });

          // Only log fallback success occasionally to reduce noise
          if (ENV.IS_DEVELOPMENT && Math.random() < 0.1) { // 10% chance
            console.info(`✅ Fallback to Supabase successful for ${endpoint}`);
          }

          return { result, usedService: 'supabase' };

        } catch (fallbackError) {
          if (ENV.IS_DEVELOPMENT) {
            console.error(`❌ Both services failed for ${endpoint}`);
          }
          throw new UnifiedApiError('All services unavailable', {
            primary: primaryError,
            fallback: fallbackError,
            endpoint,
            requestId
          });
        }
      } else {
        throw primaryError;
      }
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(duration) {
    this.performanceMetrics.requestCount++;
    this.performanceMetrics.lastResponseTime = duration;

    // Update fastest and slowest
    if (duration < this.performanceMetrics.fastestResponse) {
      this.performanceMetrics.fastestResponse = duration;
    }
    if (duration > this.performanceMetrics.slowestResponse) {
      this.performanceMetrics.slowestResponse = duration;
    }

    // Calculate rolling average
    const currentAvg = this.performanceMetrics.averageResponseTime;
    const count = this.performanceMetrics.requestCount;
    this.performanceMetrics.averageResponseTime =
      ((currentAvg * (count - 1)) + duration) / count;
  }

  /**
   * Make request to specific service
   */
  async makeServiceRequest(service, endpoint, options) {
    const { method, data, headers, timeout, requestId } = options;

    if (service === 'newBackend') {
      return await this.makeNewBackendRequest(endpoint, {
        method,
        data,
        headers,
        timeout,
        requestId
      });
    } else {
      return await this.makeSupabaseRequest(endpoint, {
        method,
        data,
        headers,
        timeout,
        requestId
      });
    }
  }

  /**
   * Make request to new Node.js backend
   */
  async makeNewBackendRequest(endpoint, options) {
    const { method, data, headers, timeout, requestId } = options;
    
    const url = `${SERVICE_CONFIG.NEW_BACKEND.baseURL}${endpoint}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-Client-Info': 'spsa-frontend',
      ...headers
    };

    // Add auth token if available
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      requestHeaders.Authorization = `Bearer ${authToken}`;
    }

    const fetchOptions = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(typeof timeout === 'number' && isFinite(timeout) ? timeout : 10000)
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new UnifiedApiError(
        errorData.error || `HTTP ${response.status}`,
        {
          status: response.status,
          service: 'newBackend',
          endpoint,
          details: errorData
        }
      );
    }

    return await response.json();
  }

  /**
   * Make request to Supabase
   */
  async makeSupabaseRequest(endpoint, options) {
    // Load Supabase service dynamically
    const service = await loadSupabaseService();

    // Map endpoint to Supabase service method
    const { method, data } = options;
    
    // This is a simplified mapping - you'll need to expand based on your endpoints
    if (endpoint.startsWith('/auth/')) {
      return await this.handleSupabaseAuth(endpoint, method, data);
    } else if (endpoint.startsWith('/content')) {
      return await this.handleSupabaseContent(endpoint, method, data);
    } else if (endpoint.startsWith('/users')) {
      return await this.handleSupabaseUsers(endpoint, method, data);
    }
    
    // Silently return fallback response for unsupported endpoints
    console.info(`ℹ️ Endpoint ${endpoint} not supported by Supabase, using default response`);
    return { success: false, error: 'Endpoint not supported', fallback: true };
  }

  /**
   * Handle Supabase authentication requests
   */
  async handleSupabaseAuth(endpoint, method, data) {
    const service = await loadSupabaseService();

    if (endpoint === '/auth/login' && method === 'POST') {
      return await service.auth.signIn(data.email, data.password);
    } else if (endpoint === '/auth/register' && method === 'POST') {
      return await service.auth.signUp(data.email, data.password, data);
    } else if (endpoint === '/auth/logout' && method === 'POST') {
      return await service.auth.signOut();
    }

    throw new UnifiedApiError(`Auth endpoint not supported: ${endpoint}`);
  }

  /**
   * Handle Supabase content requests
   */
  async handleSupabaseContent(endpoint, method, data) {
    const service = await loadSupabaseService();

    if (method === 'GET') {
      return await service.db.select('content', {
        filters: data?.filters,
        orderBy: data?.orderBy,
        limit: data?.limit
      });
    } else if (method === 'POST') {
      return await service.db.insert('content', data);
    }

    throw new UnifiedApiError(`Content endpoint not supported: ${endpoint}`);
  }

  /**
   * Handle Supabase users requests
   */
  async handleSupabaseUsers(endpoint, method, data) {
    const service = await loadSupabaseService();

    if (method === 'GET') {
      return await service.db.select('users', {
        filters: data?.filters,
        orderBy: data?.orderBy,
        limit: data?.limit
      });
    }

    throw new UnifiedApiError(`Users endpoint not supported: ${endpoint}`);
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      newBackend: {
        available: this.isNewBackendAvailable,
        circuitOpen: this.isCircuitBreakerOpen('newBackend'),
        failures: this.circuitBreaker.newBackend.failures
      },
      supabase: {
        available: this.isSupabaseAvailable,
        circuitOpen: this.isCircuitBreakerOpen('supabase'),
        failures: this.circuitBreaker.supabase.failures
      }
    };
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState() {
    return {
      newBackend: {
        isOpen: this.isCircuitBreakerOpen('newBackend'),
        failures: this.circuitBreaker.newBackend.failures,
        lastFailure: this.circuitBreaker.newBackend.lastFailure,
        openUntil: this.circuitBreaker.newBackend.openUntil
      },
      supabase: {
        isOpen: this.isCircuitBreakerOpen('supabase'),
        failures: this.circuitBreaker.supabase.failures,
        lastFailure: this.circuitBreaker.supabase.lastFailure,
        openUntil: this.circuitBreaker.supabase.openUntil
      }
    };
  }

  /**
   * Authentication methods
   * طرق المصادقة
   */
  auth = {
    /**
     * Login user
     * تسجيل دخول المستخدم
     */
    login: async (credentials) => {
      return await this.request('/auth/login', {
        method: 'POST',
        data: credentials
      });
    },

    /**
     * Register new user
     * تسجيل مستخدم جديد
     */
    register: async (userData) => {
      return await this.request('/auth/register', {
        method: 'POST',
        data: userData
      });
    },

    /**
     * Logout user
     * تسجيل خروج المستخدم
     */
    logout: async () => {
      return await this.request('/auth/logout', {
        method: 'POST'
      });
    },

    /**
     * Get current user
     * الحصول على المستخدم الحالي
     */
    getCurrentUser: async () => {
      return await this.request('/auth/me', {
        method: 'GET'
      });
    },

    /**
     * Refresh token
     * تحديث الرمز المميز
     */
    refreshToken: async (refreshToken) => {
      return await this.request('/auth/refresh', {
        method: 'POST',
        data: { refreshToken }
      });
    }
  };

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      circuitBreakerStatus: {
        newBackend: {
          isOpen: this.circuitBreaker.newBackend.isOpen,
          failures: this.circuitBreaker.newBackend.failures,
          consecutiveSuccesses: this.circuitBreaker.newBackend.consecutiveSuccesses,
          backoffMultiplier: this.circuitBreaker.newBackend.backoffMultiplier
        },
        supabase: {
          isOpen: this.circuitBreaker.supabase.isOpen,
          failures: this.circuitBreaker.supabase.failures,
          consecutiveSuccesses: this.circuitBreaker.supabase.consecutiveSuccesses,
          backoffMultiplier: this.circuitBreaker.supabase.backoffMultiplier
        }
      },
      serviceAvailability: {
        newBackend: this.isNewBackendAvailable,
        supabase: this.isSupabaseAvailable
      }
    };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      requestCount: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      fastestResponse: Infinity,
      slowestResponse: 0
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if ((now - timestamp) < SERVICE_CONFIG.CACHE.defaultTTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.performanceMetrics.requestCount > 0 ?
        (validEntries / this.performanceMetrics.requestCount * 100).toFixed(2) + '%' : '0%'
    };
  }
}

/**
 * Custom error class for unified API
 */
class UnifiedApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'UnifiedApiError';
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Create singleton instance
const unifiedApiService = new UnifiedApiService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    unifiedApiService.destroy();
  });
}

export { UnifiedApiError };
export default unifiedApiService;
