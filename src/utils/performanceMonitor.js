/**
 * Performance Monitor - Application Performance Monitoring
 * مراقب الأداء - مراقبة أداء التطبيق
 */

import { ENV } from '../config/environment.js';

/**
 * Performance metrics storage
 * تخزين مقاييس الأداء
 */
let performanceMetrics = {
  pageLoads: [],
  apiCalls: [],
  errors: [],
  userInteractions: [],
  memoryUsage: [],
  networkStatus: 'online'
};

/**
 * Performance thresholds
 * عتبات الأداء
 */
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD_WARNING: 3000, // 3 seconds
  PAGE_LOAD_CRITICAL: 5000, // 5 seconds
  API_CALL_WARNING: 2000, // 2 seconds
  API_CALL_CRITICAL: 5000, // 5 seconds
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
  MEMORY_CRITICAL: 100 * 1024 * 1024, // 100MB
  MAX_METRICS_STORAGE: 100 // Maximum number of metrics to store
};

/**
 * Get current timestamp
 * الحصول على الطابع الزمني الحالي
 */
const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * Get performance entry by name
 * الحصول على إدخال الأداء بالاسم
 */
const getPerformanceEntry = (name) => {
  if (typeof performance !== 'undefined' && performance.getEntriesByName) {
    const entries = performance.getEntriesByName(name);
    return entries.length > 0 ? entries[entries.length - 1] : null;
  }
  return null;
};

/**
 * Clean old metrics to prevent memory leaks
 * تنظيف المقاييس القديمة لمنع تسريب الذاكرة
 */
const cleanOldMetrics = () => {
  const maxEntries = PERFORMANCE_THRESHOLDS.MAX_METRICS_STORAGE;
  
  Object.keys(performanceMetrics).forEach(key => {
    if (Array.isArray(performanceMetrics[key]) && performanceMetrics[key].length > maxEntries) {
      performanceMetrics[key] = performanceMetrics[key].slice(-maxEntries);
    }
  });
};

/**
 * Page Load Performance Monitor
 * مراقب أداء تحميل الصفحة
 */
export const pageLoadMonitor = {
  /**
   * Start page load monitoring
   * بدء مراقبة تحميل الصفحة
   */
  start: (pageName) => {
    const startTime = getCurrentTimestamp();
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`page-load-start-${pageName}`);
    }
    
    return {
      pageName,
      startTime,
      end: () => pageLoadMonitor.end(pageName, startTime)
    };
  },

  /**
   * End page load monitoring
   * إنهاء مراقبة تحميل الصفحة
   */
  end: (pageName, startTime) => {
    const endTime = getCurrentTimestamp();
    const duration = endTime - startTime;
    
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`page-load-end-${pageName}`);
      performance.measure(
        `page-load-${pageName}`,
        `page-load-start-${pageName}`,
        `page-load-end-${pageName}`
      );
    }

    const metric = {
      pageName,
      startTime,
      endTime,
      duration,
      timestamp: new Date().toISOString(),
      status: duration > PERFORMANCE_THRESHOLDS.PAGE_LOAD_CRITICAL ? 'critical' :
              duration > PERFORMANCE_THRESHOLDS.PAGE_LOAD_WARNING ? 'warning' : 'good'
    };

    performanceMetrics.pageLoads.push(metric);
    cleanOldMetrics();

    if (ENV.IS_DEVELOPMENT) {
      console.log(`Page Load: ${pageName} - ${duration}ms (${metric.status})`);
    }

    return metric;
  },

  /**
   * Get page load metrics
   * الحصول على مقاييس تحميل الصفحة
   */
  getMetrics: () => {
    return performanceMetrics.pageLoads;
  },

  /**
   * Get average page load time
   * الحصول على متوسط وقت تحميل الصفحة
   */
  getAverageLoadTime: () => {
    const loads = performanceMetrics.pageLoads;
    if (loads.length === 0) return 0;
    
    const total = loads.reduce((sum, load) => sum + load.duration, 0);
    return Math.round(total / loads.length);
  }
};

/**
 * API Call Performance Monitor
 * مراقب أداء استدعاءات API
 */
export const apiCallMonitor = {
  /**
   * Start API call monitoring
   * بدء مراقبة استدعاء API
   */
  start: (endpoint, method = 'GET') => {
    const startTime = getCurrentTimestamp();
    const callId = `${method}-${endpoint}-${startTime}`;
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`api-call-start-${callId}`);
    }
    
    return {
      callId,
      endpoint,
      method,
      startTime,
      end: (status, error = null) => apiCallMonitor.end(callId, endpoint, method, startTime, status, error)
    };
  },

  /**
   * End API call monitoring
   * إنهاء مراقبة استدعاء API
   */
  end: (callId, endpoint, method, startTime, status, error = null) => {
    const endTime = getCurrentTimestamp();
    const duration = endTime - startTime;
    
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`api-call-end-${callId}`);
      performance.measure(
        `api-call-${callId}`,
        `api-call-start-${callId}`,
        `api-call-end-${callId}`
      );
    }

    const metric = {
      callId,
      endpoint,
      method,
      startTime,
      endTime,
      duration,
      status,
      error,
      timestamp: new Date().toISOString(),
      performanceStatus: duration > PERFORMANCE_THRESHOLDS.API_CALL_CRITICAL ? 'critical' :
                        duration > PERFORMANCE_THRESHOLDS.API_CALL_WARNING ? 'warning' : 'good'
    };

    performanceMetrics.apiCalls.push(metric);
    cleanOldMetrics();

    if (ENV.IS_DEVELOPMENT) {
      console.log(`API Call: ${method} ${endpoint} - ${duration}ms (${status}) (${metric.performanceStatus})`);
    }

    return metric;
  },

  /**
   * Get API call metrics
   * الحصول على مقاييس استدعاءات API
   */
  getMetrics: () => {
    return performanceMetrics.apiCalls;
  },

  /**
   * Get average API response time
   * الحصول على متوسط وقت استجابة API
   */
  getAverageResponseTime: () => {
    const calls = performanceMetrics.apiCalls;
    if (calls.length === 0) return 0;
    
    const total = calls.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(total / calls.length);
  },

  /**
   * Get API success rate
   * الحصول على معدل نجاح API
   */
  getSuccessRate: () => {
    const calls = performanceMetrics.apiCalls;
    if (calls.length === 0) return 100;
    
    const successCalls = calls.filter(call => call.status >= 200 && call.status < 400);
    return Math.round((successCalls.length / calls.length) * 100);
  }
};

/**
 * Error Monitor
 * مراقب الأخطاء
 */
export const errorMonitor = {
  /**
   * Log error
   * تسجيل خطأ
   */
  logError: (error, context = {}) => {
    const errorMetric = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      name: error.name || 'Error',
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    performanceMetrics.errors.push(errorMetric);
    cleanOldMetrics();

    if (ENV.IS_DEVELOPMENT) {
      console.error('Error logged:', errorMetric);
    }

    return errorMetric;
  },

  /**
   * Get error metrics
   * الحصول على مقاييس الأخطاء
   */
  getMetrics: () => {
    return performanceMetrics.errors;
  },

  /**
   * Get error rate
   * الحصول على معدل الأخطاء
   */
  getErrorRate: () => {
    const errors = performanceMetrics.errors;
    const totalInteractions = performanceMetrics.userInteractions.length + performanceMetrics.apiCalls.length;
    
    if (totalInteractions === 0) return 0;
    return Math.round((errors.length / totalInteractions) * 100);
  }
};

/**
 * Memory Monitor
 * مراقب الذاكرة
 */
export const memoryMonitor = {
  /**
   * Check memory usage
   * فحص استخدام الذاكرة
   */
  checkMemoryUsage: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: new Date().toISOString()
      };

      memory.status = memory.used > PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL ? 'critical' :
                     memory.used > PERFORMANCE_THRESHOLDS.MEMORY_WARNING ? 'warning' : 'good';

      performanceMetrics.memoryUsage.push(memory);
      cleanOldMetrics();

      if (ENV.IS_DEVELOPMENT && memory.status !== 'good') {
        console.warn(`Memory usage: ${Math.round(memory.used / 1024 / 1024)}MB (${memory.status})`);
      }

      return memory;
    }

    return null;
  },

  /**
   * Get memory metrics
   * الحصول على مقاييس الذاكرة
   */
  getMetrics: () => {
    return performanceMetrics.memoryUsage;
  }
};

/**
 * Network Monitor
 * مراقب الشبكة
 */
export const networkMonitor = {
  /**
   * Initialize network monitoring
   * تهيئة مراقبة الشبكة
   */
  initialize: () => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'onLine' in navigator) {
      performanceMetrics.networkStatus = navigator.onLine ? 'online' : 'offline';

      window.addEventListener('online', () => {
        performanceMetrics.networkStatus = 'online';
        if (ENV.IS_DEVELOPMENT) {
          console.log('Network status: online');
        }
      });

      window.addEventListener('offline', () => {
        performanceMetrics.networkStatus = 'offline';
        if (ENV.IS_DEVELOPMENT) {
          console.log('Network status: offline');
        }
      });
    }
  },

  /**
   * Get network status
   * الحصول على حالة الشبكة
   */
  getStatus: () => {
    return performanceMetrics.networkStatus;
  },

  /**
   * Check if online
   * فحص الاتصال بالإنترنت
   */
  isOnline: () => {
    return performanceMetrics.networkStatus === 'online';
  }
};

/**
 * Performance Monitor Main Interface
 * الواجهة الرئيسية لمراقب الأداء
 */
const performanceMonitor = {
  // Monitors
  pageLoad: pageLoadMonitor,
  apiCall: apiCallMonitor,
  error: errorMonitor,
  memory: memoryMonitor,
  network: networkMonitor,

  /**
   * Get all performance metrics
   * الحصول على جميع مقاييس الأداء
   */
  getAllMetrics: () => {
    return {
      ...performanceMetrics,
      summary: {
        averagePageLoadTime: pageLoadMonitor.getAverageLoadTime(),
        averageApiResponseTime: apiCallMonitor.getAverageResponseTime(),
        apiSuccessRate: apiCallMonitor.getSuccessRate(),
        errorRate: errorMonitor.getErrorRate(),
        networkStatus: networkMonitor.getStatus(),
        lastMemoryCheck: memoryMonitor.getMetrics().slice(-1)[0] || null
      }
    };
  },

  /**
   * Clear all metrics
   * مسح جميع المقاييس
   */
  clearMetrics: () => {
    performanceMetrics = {
      pageLoads: [],
      apiCalls: [],
      errors: [],
      userInteractions: [],
      memoryUsage: [],
      networkStatus: performanceMetrics.networkStatus
    };
  },

  /**
   * Initialize performance monitoring
   * تهيئة مراقبة الأداء
   */
  initialize: () => {
    try {
      // Initialize network monitoring
      networkMonitor.initialize();

      // Set up periodic memory checks
      if (typeof setInterval !== 'undefined') {
        setInterval(() => {
          memoryMonitor.checkMemoryUsage();
        }, 30000); // Check every 30 seconds
      }

      // Set up global error handler
      if (typeof window !== 'undefined') {
        window.addEventListener('error', (event) => {
          errorMonitor.logError(event.error || new Error(event.message), {
            type: 'javascript',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          });
        });

        window.addEventListener('unhandledrejection', (event) => {
          errorMonitor.logError(event.reason || new Error('Unhandled Promise Rejection'), {
            type: 'promise'
          });
        });
      }

      if (ENV.IS_DEVELOPMENT) {
        console.log('Performance Monitor initialized');
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Performance Monitor:', error);
      return false;
    }
  }
};

// Initialize on module load
performanceMonitor.initialize();

export default performanceMonitor;
