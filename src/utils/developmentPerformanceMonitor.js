/**
 * Development Performance Monitor
 * مراقب الأداء لبيئة التطوير
 */

import { ENV } from '../config/environment.js';

class DevelopmentPerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadStart: null,
      serviceInitTimes: new Map(),
      componentMountTimes: new Map(),
      apiCallTimes: new Map(),
      errors: []
    };
    
    this.isEnabled = ENV.IS_DEVELOPMENT;
    
    if (this.isEnabled) {
      this.startMonitoring();
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    // Track page load start
    this.metrics.pageLoadStart = performance.now();
    
    // Monitor navigation timing
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        this.reportPageLoadMetrics();
      });
    }

    // Monitor unhandled errors
    window.addEventListener('error', (event) => {
      this.recordError('JavaScript Error', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('Unhandled Promise Rejection', event.reason);
    });
  }

  /**
   * Record service initialization time
   */
  recordServiceInit(serviceName, startTime, endTime) {
    if (!this.isEnabled) return;
    
    const duration = endTime - startTime;
    this.metrics.serviceInitTimes.set(serviceName, {
      duration,
      timestamp: Date.now()
    });

    if (duration > 1000) { // Warn if service takes more than 1 second
      console.warn(`⚠️ Slow service initialization: ${serviceName} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Record component mount time
   */
  recordComponentMount(componentName, startTime, endTime) {
    if (!this.isEnabled) return;
    
    const duration = endTime - startTime;
    this.metrics.componentMountTimes.set(componentName, {
      duration,
      timestamp: Date.now()
    });

    if (duration > 500) { // Warn if component takes more than 500ms
      console.warn(`⚠️ Slow component mount: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Record API call time
   */
  recordApiCall(endpoint, startTime, endTime, success = true) {
    if (!this.isEnabled) return;
    
    const duration = endTime - startTime;
    const key = `${endpoint}_${Date.now()}`;
    
    this.metrics.apiCallTimes.set(key, {
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    });

    if (duration > 3000) { // Warn if API call takes more than 3 seconds
      console.warn(`⚠️ Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Record error
   */
  recordError(type, error) {
    if (!this.isEnabled) return;
    
    this.metrics.errors.push({
      type,
      message: error?.message || String(error),
      stack: error?.stack,
      timestamp: Date.now()
    });

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }
  }

  /**
   * Report page load metrics
   */
  reportPageLoadMetrics() {
    if (!this.isEnabled) return;
    
    const timing = window.performance.timing;
    const navigation = window.performance.navigation;
    
    const metrics = {
      // Navigation timing
      navigationStart: timing.navigationStart,
      domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
      connect: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      domProcessing: timing.domComplete - timing.domLoading,
      
      // Load timing
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      
      // Navigation type
      navigationType: navigation.type === 0 ? 'navigate' : 
                     navigation.type === 1 ? 'reload' : 
                     navigation.type === 2 ? 'back_forward' : 'unknown'
    };

    console.group('📊 Page Load Performance Metrics');
    console.log('🚀 DOM Content Loaded:', `${metrics.domContentLoaded}ms`);
    console.log('✅ Load Complete:', `${metrics.loadComplete}ms`);
    console.log('🔗 Domain Lookup:', `${metrics.domainLookup}ms`);
    console.log('📡 Request/Response:', `${metrics.request + metrics.response}ms`);
    console.log('🏗️ DOM Processing:', `${metrics.domProcessing}ms`);
    console.log('🧭 Navigation Type:', metrics.navigationType);
    console.groupEnd();

    // Warn about slow metrics
    if (metrics.loadComplete > 5000) {
      console.warn('⚠️ Slow page load detected! Consider optimizing service initialization.');
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    if (!this.isEnabled) return null;
    
    const now = Date.now();
    const recentTimeframe = 60000; // Last minute
    
    // Recent API calls
    const recentApiCalls = Array.from(this.metrics.apiCallTimes.values())
      .filter(call => (now - call.timestamp) < recentTimeframe);
    
    // Recent errors
    const recentErrors = this.metrics.errors
      .filter(error => (now - error.timestamp) < recentTimeframe);
    
    return {
      serviceInitTimes: Object.fromEntries(this.metrics.serviceInitTimes),
      componentMountTimes: Object.fromEntries(this.metrics.componentMountTimes),
      recentApiCalls: recentApiCalls.length,
      recentErrors: recentErrors.length,
      slowApiCalls: recentApiCalls.filter(call => call.duration > 3000).length,
      failedApiCalls: recentApiCalls.filter(call => !call.success).length
    };
  }

  /**
   * Log performance summary
   */
  logPerformanceSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getPerformanceSummary();
    if (!summary) return;
    
    console.group('📈 Performance Summary (Last Minute)');
    console.log('🔧 Service Initializations:', Object.keys(summary.serviceInitTimes).length);
    console.log('⚛️ Component Mounts:', Object.keys(summary.componentMountTimes).length);
    console.log('📡 API Calls:', summary.recentApiCalls);
    console.log('🐌 Slow API Calls:', summary.slowApiCalls);
    console.log('❌ Failed API Calls:', summary.failedApiCalls);
    console.log('🚨 Recent Errors:', summary.recentErrors);
    console.groupEnd();
  }

  /**
   * Start periodic reporting
   */
  startPeriodicReporting(interval = 60000) { // Every minute
    if (!this.isEnabled) return;
    
    setInterval(() => {
      this.logPerformanceSummary();
    }, interval);
  }
}

// Create singleton instance
const developmentPerformanceMonitor = new DevelopmentPerformanceMonitor();

// Start periodic reporting if in development
if (ENV.IS_DEVELOPMENT) {
  developmentPerformanceMonitor.startPeriodicReporting();
}

export default developmentPerformanceMonitor;

/**
 * Helper functions for easy usage
 */
export const recordServiceInit = (serviceName, startTime, endTime) => {
  developmentPerformanceMonitor.recordServiceInit(serviceName, startTime, endTime);
};

export const recordComponentMount = (componentName, startTime, endTime) => {
  developmentPerformanceMonitor.recordComponentMount(componentName, startTime, endTime);
};

export const recordApiCall = (endpoint, startTime, endTime, success) => {
  developmentPerformanceMonitor.recordApiCall(endpoint, startTime, endTime, success);
};

export const recordError = (type, error) => {
  developmentPerformanceMonitor.recordError(type, error);
};
