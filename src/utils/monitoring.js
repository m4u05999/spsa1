/**
 * Monitoring and Performance Tracking Service - SPSA
 * خدمة المراقبة وتتبع الأداء - الجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - API performance monitoring
 * - Error tracking and reporting
 * - User behavior analytics
 * - Service health monitoring
 * - PDPL compliant data collection
 */

import { ENV } from '../config/environment.js';
import { getFeatureFlag } from '../config/featureFlags.js';

/**
 * Monitoring configuration
 */
const MONITORING_CONFIG = {
  MAX_METRICS_STORAGE: 1000,
  METRICS_RETENTION_HOURS: 24,
  BATCH_SIZE: 50,
  FLUSH_INTERVAL: ENV.IS_DEVELOPMENT ? 120000 : 30000, // 2 minutes in dev, 30 seconds in prod
  ERROR_SAMPLING_RATE: 1.0, // 100% error sampling
  PERFORMANCE_SAMPLING_RATE: 0.1 // 10% performance sampling
};

/**
 * Monitoring Service Class
 */
class MonitoringService {
  constructor() {
    this.metrics = new Map();
    this.errors = [];
    this.requests = new Map();
    this.serviceMetrics = new Map();
    this.userSessions = new Map();
    this.flushTimer = null;
    
    this.init();
  }

  /**
   * Initialize monitoring service
   */
  init() {
    if (!getFeatureFlag('ENABLE_PERFORMANCE_MONITORING')) {
      return;
    }

    this.startPerformanceObserver();
    this.startFlushTimer();
    this.setupErrorHandling();
    
    if (ENV.IS_DEVELOPMENT) {
      console.log('📊 Monitoring service initialized');
    }
  }

  /**
   * Start performance observer
   */
  startPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPageLoad(entry);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackResourceLoad(entry);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackLCP(entry);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Track API request
   */
  trackRequest(requestId, details) {
    const timestamp = Date.now();
    
    this.requests.set(requestId, {
      ...details,
      startTime: timestamp,
      status: 'pending'
    });

    // Update service metrics
    this.updateServiceMetrics(details.service, 'requests', 1);
  }

  /**
   * Track successful request
   */
  trackRequestSuccess(requestId, details) {
    const request = this.requests.get(requestId);
    if (!request) return;

    const { service, duration, endpoint } = details;
    
    // Update request
    request.status = 'success';
    request.duration = duration;
    request.endTime = Date.now();

    // Update service metrics
    this.updateServiceMetrics(service, 'successes', 1);
    this.updateServiceMetrics(service, 'totalResponseTime', duration);
    this.updateServiceMetrics(service, 'avgResponseTime', this.calculateAvgResponseTime(service));

    // Track performance metric
    this.trackMetric('api_request_duration', duration, {
      service,
      endpoint,
      status: 'success'
    });

    // Sample for detailed analysis
    if (Math.random() < MONITORING_CONFIG.PERFORMANCE_SAMPLING_RATE) {
      this.trackDetailedPerformance(requestId, request);
    }

    // Cleanup old request
    setTimeout(() => this.requests.delete(requestId), 60000);
  }

  /**
   * Track failed request
   */
  trackRequestError(requestId, details) {
    const request = this.requests.get(requestId);
    if (!request) return;

    const { error, duration, endpoint } = details;
    
    // Update request
    request.status = 'error';
    request.error = error;
    request.duration = duration;
    request.endTime = Date.now();

    // Update service metrics
    const service = request.service;
    this.updateServiceMetrics(service, 'errors', 1);
    this.updateServiceMetrics(service, 'errorRate', this.calculateErrorRate(service));

    // Track error
    this.trackError({
      type: 'api_request',
      message: error,
      endpoint,
      service,
      duration,
      requestId
    });

    // Cleanup old request
    setTimeout(() => this.requests.delete(requestId), 60000);
  }

  /**
   * Track custom metric
   */
  trackMetric(name, value, tags = {}) {
    const timestamp = Date.now();
    const metricKey = `${name}_${timestamp}`;
    
    this.metrics.set(metricKey, {
      name,
      value,
      tags,
      timestamp
    });

    // Cleanup old metrics
    this.cleanupOldMetrics();
  }

  /**
   * Track error
   */
  trackError(errorDetails) {
    if (!getFeatureFlag('ENABLE_ERROR_REPORTING')) {
      return;
    }

    const timestamp = Date.now();
    const error = {
      ...errorDetails,
      timestamp,
      userAgent: navigator?.userAgent,
      url: window?.location?.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > MONITORING_CONFIG.MAX_METRICS_STORAGE) {
      this.errors = this.errors.slice(-MONITORING_CONFIG.MAX_METRICS_STORAGE);
    }

    // Log error in development
    if (ENV.IS_DEVELOPMENT) {
      console.error('📊 Error tracked:', error);
    }

    // Sample errors for reporting
    if (Math.random() < MONITORING_CONFIG.ERROR_SAMPLING_RATE) {
      this.reportError(error);
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad(entry) {
    const metrics = {
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      firstPaint: entry.responseEnd - entry.requestStart,
      ttfb: entry.responseStart - entry.requestStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.trackMetric(`page_${name}`, value, {
        page: window.location.pathname
      });
    });
  }

  /**
   * Track resource load performance
   */
  trackResourceLoad(entry) {
    if (entry.name.includes('api') || entry.name.includes('supabase')) {
      this.trackMetric('resource_load_time', entry.duration, {
        resource: entry.name,
        type: entry.initiatorType
      });
    }
  }

  /**
   * Track Largest Contentful Paint
   */
  trackLCP(entry) {
    this.trackMetric('largest_contentful_paint', entry.startTime, {
      page: window.location.pathname
    });
  }

  /**
   * Update service metrics
   */
  updateServiceMetrics(service, metric, value) {
    if (!this.serviceMetrics.has(service)) {
      this.serviceMetrics.set(service, {
        requests: 0,
        successes: 0,
        errors: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        errorRate: 0,
        lastUpdated: Date.now()
      });
    }

    const metrics = this.serviceMetrics.get(service);
    
    if (metric === 'avgResponseTime') {
      // Calculate average
      const totalRequests = metrics.successes;
      if (totalRequests > 0) {
        metrics.avgResponseTime = metrics.totalResponseTime / totalRequests;
      }
    } else {
      metrics[metric] += value;
    }
    
    metrics.lastUpdated = Date.now();
  }

  /**
   * Calculate average response time for service
   */
  calculateAvgResponseTime(service) {
    const metrics = this.serviceMetrics.get(service);
    if (!metrics || metrics.successes === 0) return 0;
    
    return metrics.totalResponseTime / metrics.successes;
  }

  /**
   * Calculate error rate for service
   */
  calculateErrorRate(service) {
    const metrics = this.serviceMetrics.get(service);
    if (!metrics) return 0;
    
    const totalRequests = metrics.requests;
    if (totalRequests === 0) return 0;
    
    return (metrics.errors / totalRequests) * 100;
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(service) {
    return this.serviceMetrics.get(service) || null;
  }

  /**
   * Get all service metrics
   */
  getAllServiceMetrics() {
    const result = {};
    for (const [service, metrics] of this.serviceMetrics.entries()) {
      result[service] = { ...metrics };
    }
    return result;
  }

  /**
   * Track user session
   */
  trackUserSession(userId, sessionData) {
    const sessionId = this.getSessionId();
    
    this.userSessions.set(sessionId, {
      userId,
      ...sessionData,
      startTime: Date.now(),
      lastActivity: Date.now()
    });
  }

  /**
   * Update user activity
   */
  updateUserActivity(activityData = {}) {
    const sessionId = this.getSessionId();
    const session = this.userSessions.get(sessionId);
    
    if (session) {
      session.lastActivity = Date.now();
      session.activities = session.activities || [];
      session.activities.push({
        ...activityData,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Track detailed performance
   */
  trackDetailedPerformance(requestId, request) {
    const performanceData = {
      requestId,
      service: request.service,
      endpoint: request.endpoint,
      method: request.method,
      duration: request.duration,
      timestamp: request.startTime,
      userAgent: navigator?.userAgent,
      connectionType: navigator?.connection?.effectiveType,
      userId: this.getCurrentUserId()
    };

    // Store for batch reporting
    this.trackMetric('detailed_performance', performanceData);
  }

  /**
   * Report error to external service
   */
  reportError(error) {
    // In a real implementation, you would send this to an error reporting service
    // like Sentry, LogRocket, or a custom endpoint
    
    if (ENV.IS_DEVELOPMENT) {
      console.group('📊 Error Report');
      console.error('Error:', error);
      console.groupEnd();
    }
    
    // Example: Send to custom endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(error)
    // }).catch(() => {}); // Silent fail
  }

  /**
   * Start flush timer
   */
  startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, MONITORING_CONFIG.FLUSH_INTERVAL);
  }

  /**
   * Flush metrics to storage/reporting
   */
  flushMetrics() {
    const metricsToFlush = Array.from(this.metrics.values());
    const errorsToFlush = [...this.errors];

    if (metricsToFlush.length === 0 && errorsToFlush.length === 0) {
      return;
    }

    // In a real implementation, you would send these to an analytics service
    // Only log significant metric flushes in development to reduce noise
    if (ENV.IS_DEVELOPMENT && (metricsToFlush.length > 10 || errorsToFlush.length > 0)) {
      console.log('📊 Flushing metrics:', {
        metrics: metricsToFlush.length,
        errors: errorsToFlush.length
      });
    }

    // Clear flushed data
    this.metrics.clear();
    this.errors = [];
  }

  /**
   * Cleanup old metrics
   */
  cleanupOldMetrics() {
    const cutoffTime = Date.now() - (MONITORING_CONFIG.METRICS_RETENTION_HOURS * 60 * 60 * 1000);
    
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.timestamp < cutoffTime) {
        this.metrics.delete(key);
      }
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const services = this.getAllServiceMetrics();
    const totalRequests = Object.values(services).reduce((sum, s) => sum + s.requests, 0);
    const totalErrors = Object.values(services).reduce((sum, s) => sum + s.errors, 0);
    
    return {
      totalRequests,
      totalErrors,
      overallErrorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      services,
      metricsCount: this.metrics.size,
      errorsCount: this.errors.length,
      lastUpdated: Date.now()
    };
  }

  /**
   * Destroy monitoring service
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    this.flushMetrics();
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    monitoringService.destroy();
  });
}

// Development helpers
if (ENV.IS_DEVELOPMENT) {
  window.monitoring = {
    getMetrics: () => monitoringService.getAllServiceMetrics(),
    getSummary: () => monitoringService.getPerformanceSummary(),
    trackError: (error) => monitoringService.trackError(error),
    trackMetric: (name, value, tags) => monitoringService.trackMetric(name, value, tags)
  };
}

// Utility functions for logging
/**
 * Development logging configuration for noise reduction
 */
const DEV_LOGGING_CONFIG = {
  suppressPatterns: [
    'Failed to fetch',
    'ERR_CONNECTION_REFUSED',
    'Backend unavailable',
    'Health check failed',
    'Connection refused',
    'WebSocket connection timeout',
    'WebSocket error',
    'WebSocket connection failed',
    'circuit breaker'
  ],
  messageRateLimit: new Map(),
  rateLimitWindow: 300000, // 5 minutes for WebSocket errors
  maxMessagesPerWindow: 1  // Only 1 WebSocket error per 5 minutes
};

/**
 * Check if message should be suppressed in development
 */
const shouldSuppressInDev = (message) => {
  if (!ENV.IS_DEVELOPMENT) return false;

  const shouldSuppress = DEV_LOGGING_CONFIG.suppressPatterns.some(pattern =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );

  if (!shouldSuppress) return false;

  // Apply rate limiting
  const now = Date.now();
  const messageKey = message.substring(0, 50);
  const rateData = DEV_LOGGING_CONFIG.messageRateLimit.get(messageKey) || { count: 0, windowStart: now };

  if (now - rateData.windowStart > DEV_LOGGING_CONFIG.rateLimitWindow) {
    rateData.count = 0;
    rateData.windowStart = now;
  }

  rateData.count++;
  DEV_LOGGING_CONFIG.messageRateLimit.set(messageKey, rateData);

  return rateData.count > DEV_LOGGING_CONFIG.maxMessagesPerWindow;
};

export const logError = (message, error = null, context = {}) => {
  const errorDetails = {
    type: 'application',
    message,
    error: error?.message || error,
    stack: error?.stack,
    context,
    timestamp: Date.now()
  };

  monitoringService.trackError(errorDetails);

  // Apply intelligent logging in development
  if (ENV.IS_DEVELOPMENT && !shouldSuppressInDev(message)) {
    console.error(`🔴 ${message}`, error, context);
  }
};

export const logInfo = (message, data = {}) => {
  // Track as metric for info logging
  monitoringService.trackMetric('info_log', 1, {
    message,
    ...data
  });

  // Apply intelligent logging in development
  if (ENV.IS_DEVELOPMENT && !shouldSuppressInDev(message)) {
    console.info(`ℹ️ ${message}`, data);
  }
};

export const logWarning = (message, data = {}) => {
  // Track as metric for warning logging
  monitoringService.trackMetric('warning_log', 1, {
    message,
    ...data
  });

  // Also log to console in development
  if (ENV.IS_DEVELOPMENT) {
    console.warn(`⚠️ ${message}`, data);
  }
};

export const logDebug = (message, data = {}) => {
  // Only log in development
  if (ENV.IS_DEVELOPMENT) {
    console.debug(`🐛 ${message}`, data);
  }
};

export { monitoringService };
export default monitoringService;
