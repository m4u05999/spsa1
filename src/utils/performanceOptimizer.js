/**
 * Performance Optimizer Utility
 * أداة تحسين الأداء
 * 
 * Provides performance optimization utilities for SPSA project
 */

import { getFeatureFlag } from '../config/featureFlags.js';
import { logInfo, logWarning } from './monitoring.js';

/**
 * Image optimization utilities
 * أدوات تحسين الصور
 */
export const imageOptimizer = {
  /**
   * Generate optimized image URLs with WebP support
   * إنشاء روابط صور محسنة مع دعم WebP
   */
  generateOptimizedUrl: (originalUrl, options = {}) => {
    const {
      width = 800,
      height = null,
      quality = 80,
      format = 'auto'
    } = options;

    // Check if it's an external URL
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }

    // For local images, add optimization parameters
    const params = new URLSearchParams();
    params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    if (format !== 'auto') params.set('fm', format);

    return `${originalUrl}?${params.toString()}`;
  },

  /**
   * Create responsive image srcSet
   * إنشاء srcSet للصور المتجاوبة
   */
  createResponsiveSrcSet: (originalUrl, sizes = [400, 800, 1200]) => {
    return sizes
      .map(size => `${imageOptimizer.generateOptimizedUrl(originalUrl, { width: size })} ${size}w`)
      .join(', ');
  },

  /**
   * Preload critical images
   * تحميل مسبق للصور المهمة
   */
  preloadImage: (url, priority = false) => {
    if (!getFeatureFlag('ENABLE_LAZY_LOADING')) return;

    const link = document.createElement('link');
    link.rel = priority ? 'preload' : 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }
};

/**
 * Bundle optimization utilities
 * أدوات تحسين الحزم
 */
export const bundleOptimizer = {
  /**
   * Dynamic import with error handling
   * استيراد ديناميكي مع معالجة الأخطاء
   */
  dynamicImport: async (importFunction, fallback = null) => {
    try {
      const module = await importFunction();
      return module.default || module;
    } catch (error) {
      logWarning('Dynamic import failed:', error);
      return fallback;
    }
  },

  /**
   * Preload component chunks
   * تحميل مسبق لأجزاء المكونات
   */
  preloadComponent: (importFunction) => {
    if (!getFeatureFlag('ENABLE_LAZY_LOADING')) return;

    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunction().catch(() => {
          // Ignore preload errors
        });
      });
    } else {
      setTimeout(() => {
        importFunction().catch(() => {
          // Ignore preload errors
        });
      }, 100);
    }
  }
};

/**
 * Component rendering optimization
 * تحسين عرض المكونات
 */
export const renderOptimizer = {
  /**
   * Debounce function for expensive operations
   * تأخير التنفيذ للعمليات المكلفة
   */
  debounce: (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  /**
   * Throttle function for high-frequency events
   * تقييد التنفيذ للأحداث عالية التكرار
   */
  throttle: (func, limit = 100) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Memoization utility for expensive calculations
   * أداة التذكر للحسابات المكلفة
   */
  memoize: (func, keyGenerator = (...args) => JSON.stringify(args)) => {
    const cache = new Map();
    return (...args) => {
      const key = keyGenerator(...args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    };
  }
};

/**
 * Network optimization utilities
 * أدوات تحسين الشبكة
 */
export const networkOptimizer = {
  /**
   * Request deduplication
   * إلغاء تكرار الطلبات
   */
  pendingRequests: new Map(),

  deduplicateRequest: async (key, requestFunction) => {
    if (networkOptimizer.pendingRequests.has(key)) {
      return networkOptimizer.pendingRequests.get(key);
    }

    const promise = requestFunction();
    networkOptimizer.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      networkOptimizer.pendingRequests.delete(key);
      return result;
    } catch (error) {
      networkOptimizer.pendingRequests.delete(key);
      throw error;
    }
  },

  /**
   * Batch multiple requests
   * تجميع طلبات متعددة
   */
  batchRequests: (requests, batchSize = 5) => {
    const batches = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }

    return batches.reduce(async (previousBatch, currentBatch) => {
      await previousBatch;
      return Promise.all(currentBatch.map(request => request()));
    }, Promise.resolve());
  }
};

/**
 * Memory optimization utilities
 * أدوات تحسين الذاكرة
 */
export const memoryOptimizer = {
  /**
   * Cleanup unused resources
   * تنظيف الموارد غير المستخدمة
   */
  cleanup: () => {
    // Clear network request cache
    networkOptimizer.pendingRequests.clear();

    // Clear any global caches if they exist
    if (window.appCache) {
      window.appCache.clear();
    }

    // Force garbage collection if available (development only)
    if (window.gc && process.env.NODE_ENV === 'development') {
      window.gc();
    }

    logInfo('Memory cleanup completed');
  },

  /**
   * Monitor memory usage
   * مراقبة استخدام الذاكرة
   */
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
};

/**
 * CSS optimization utilities
 * أدوات تحسين CSS
 */
export const cssOptimizer = {
  /**
   * Load CSS asynchronously
   * تحميل CSS بشكل غير متزامن
   */
  loadCSS: (href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  },

  /**
   * Remove unused CSS classes
   * إزالة فئات CSS غير المستخدمة
   */
  removeUnusedClasses: (element) => {
    const computedStyle = window.getComputedStyle(element);
    const classList = Array.from(element.classList);
    
    classList.forEach(className => {
      // This is a simplified check - in practice, you'd need more sophisticated detection
      if (computedStyle.getPropertyValue('--unused-class-marker') === className) {
        element.classList.remove(className);
      }
    });
  }
};

/**
 * Performance monitoring and optimization
 * مراقبة وتحسين الأداء
 */
export const performanceOptimizer = {
  /**
   * Initialize performance optimizations
   * تهيئة تحسينات الأداء
   */
  init: () => {
    if (!getFeatureFlag('ENABLE_PERFORMANCE_MONITORING')) return;

    // Set up periodic memory cleanup
    setInterval(() => {
      memoryOptimizer.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) { // Log slow operations
            logWarning(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['measure'] });
    }

    logInfo('Performance optimizer initialized');
  },

  /**
   * Get performance recommendations
   * الحصول على توصيات الأداء
   */
  getRecommendations: () => {
    const recommendations = [];
    const memoryUsage = memoryOptimizer.getMemoryUsage();

    if (memoryUsage && memoryUsage.used > memoryUsage.limit * 0.8) {
      recommendations.push({
        type: 'memory',
        message: 'استخدام الذاكرة مرتفع. يُنصح بإعادة تحميل الصفحة.',
        priority: 'high'
      });
    }

    if (networkOptimizer.pendingRequests.size > 10) {
      recommendations.push({
        type: 'network',
        message: 'عدد كبير من الطلبات المعلقة. قد يؤثر على الأداء.',
        priority: 'medium'
      });
    }

    return recommendations;
  }
};

export default {
  imageOptimizer,
  bundleOptimizer,
  renderOptimizer,
  networkOptimizer,
  memoryOptimizer,
  cssOptimizer,
  performanceOptimizer
};
