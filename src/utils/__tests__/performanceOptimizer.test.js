/**
 * Performance Optimizer Tests
 * اختبارات محسن الأداء
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  imageOptimizer,
  bundleOptimizer,
  renderOptimizer,
  networkOptimizer,
  memoryOptimizer,
  performanceOptimizer
} from '../performanceOptimizer';

// Mock feature flags
vi.mock('../../config/featureFlags', () => ({
  getFeatureFlag: vi.fn((flag) => {
    const flags = {
      'ENABLE_LAZY_LOADING': true,
      'ENABLE_PERFORMANCE_MONITORING': true
    };
    return flags[flag] || false;
  })
}));

// Mock monitoring
vi.mock('../monitoring', () => ({
  logInfo: vi.fn(),
  logWarning: vi.fn()
}));

describe('Image Optimizer', () => {
  describe('generateOptimizedUrl', () => {
    it('يجب أن ينشئ رابط صورة محسن مع المعاملات الصحيحة', () => {
      const originalUrl = '/images/test.jpg';
      const options = { width: 800, height: 600, quality: 80 };
      
      const optimizedUrl = imageOptimizer.generateOptimizedUrl(originalUrl, options);
      
      expect(optimizedUrl).toContain('w=800');
      expect(optimizedUrl).toContain('h=600');
      expect(optimizedUrl).toContain('q=80');
    });

    it('يجب أن يعيد الرابط الأصلي للروابط الخارجية', () => {
      const externalUrl = 'https://example.com/image.jpg';
      
      const result = imageOptimizer.generateOptimizedUrl(externalUrl);
      
      expect(result).toBe(externalUrl);
    });

    it('يجب أن يستخدم القيم الافتراضية عند عدم تمرير خيارات', () => {
      const originalUrl = '/images/test.jpg';
      
      const optimizedUrl = imageOptimizer.generateOptimizedUrl(originalUrl);
      
      expect(optimizedUrl).toContain('w=800');
      expect(optimizedUrl).toContain('q=80');
    });
  });

  describe('createResponsiveSrcSet', () => {
    it('يجب أن ينشئ srcSet للصور المتجاوبة', () => {
      const originalUrl = '/images/test.jpg';
      const sizes = [400, 800, 1200];
      
      const srcSet = imageOptimizer.createResponsiveSrcSet(originalUrl, sizes);
      
      expect(srcSet).toContain('400w');
      expect(srcSet).toContain('800w');
      expect(srcSet).toContain('1200w');
    });
  });

  describe('preloadImage', () => {
    beforeEach(() => {
      // Mock DOM
      global.document = {
        createElement: vi.fn(() => ({
          rel: '',
          as: '',
          href: ''
        })),
        head: {
          appendChild: vi.fn()
        }
      };
    });

    it('يجب أن يضيف رابط preload للصور ذات الأولوية', () => {
      const url = '/images/priority.jpg';
      
      imageOptimizer.preloadImage(url, true);
      
      expect(document.createElement).toHaveBeenCalledWith('link');
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});

describe('Bundle Optimizer', () => {
  describe('dynamicImport', () => {
    it('يجب أن ينجح في الاستيراد الديناميكي', async () => {
      const mockModule = { default: 'test-component' };
      const importFunction = vi.fn().mockResolvedValue(mockModule);
      
      const result = await bundleOptimizer.dynamicImport(importFunction);
      
      expect(result).toBe('test-component');
      expect(importFunction).toHaveBeenCalled();
    });

    it('يجب أن يعيد fallback عند فشل الاستيراد', async () => {
      const importFunction = vi.fn().mockRejectedValue(new Error('Import failed'));
      const fallback = 'fallback-component';
      
      const result = await bundleOptimizer.dynamicImport(importFunction, fallback);
      
      expect(result).toBe(fallback);
    });

    it('يجب أن يعيد الوحدة كاملة إذا لم يكن لها default export', async () => {
      const mockModule = { namedExport: 'test' };
      const importFunction = vi.fn().mockResolvedValue(mockModule);
      
      const result = await bundleOptimizer.dynamicImport(importFunction);
      
      expect(result).toBe(mockModule);
    });
  });
});

describe('Render Optimizer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('يجب أن يؤخر تنفيذ الدالة', () => {
      const mockFn = vi.fn();
      const debouncedFn = renderOptimizer.debounce(mockFn, 300);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(300);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يمرر المعاملات بشكل صحيح', () => {
      const mockFn = vi.fn();
      const debouncedFn = renderOptimizer.debounce(mockFn, 100);
      
      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('يجب أن يقيد تنفيذ الدالة', () => {
      const mockFn = vi.fn();
      const throttledFn = renderOptimizer.throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(100);
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('يجب أن يحفظ نتائج الدوال المكلفة', () => {
      const expensiveFn = vi.fn((x) => x * 2);
      const memoizedFn = renderOptimizer.memoize(expensiveFn);
      
      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);
      
      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يستدعي الدالة مرة أخرى للمعاملات المختلفة', () => {
      const expensiveFn = vi.fn((x) => x * 2);
      const memoizedFn = renderOptimizer.memoize(expensiveFn);
      
      memoizedFn(5);
      memoizedFn(10);
      
      expect(expensiveFn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Network Optimizer', () => {
  beforeEach(() => {
    networkOptimizer.pendingRequests.clear();
  });

  describe('deduplicateRequest', () => {
    it('يجب أن يلغي تكرار الطلبات المتشابهة', async () => {
      const mockRequest = vi.fn().mockResolvedValue('result');
      const key = 'test-request';
      
      const promise1 = networkOptimizer.deduplicateRequest(key, mockRequest);
      const promise2 = networkOptimizer.deduplicateRequest(key, mockRequest);
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('يجب أن ينظف الطلبات المعلقة بعد الانتهاء', async () => {
      const mockRequest = vi.fn().mockResolvedValue('result');
      const key = 'test-request';
      
      await networkOptimizer.deduplicateRequest(key, mockRequest);
      
      expect(networkOptimizer.pendingRequests.has(key)).toBe(false);
    });
  });

  describe('batchRequests', () => {
    it('يجب أن يجمع الطلبات في مجموعات', async () => {
      const requests = [
        vi.fn().mockResolvedValue('result1'),
        vi.fn().mockResolvedValue('result2'),
        vi.fn().mockResolvedValue('result3')
      ];
      
      await networkOptimizer.batchRequests(requests, 2);
      
      requests.forEach(request => {
        expect(request).toHaveBeenCalled();
      });
    });
  });
});

describe('Memory Optimizer', () => {
  describe('cleanup', () => {
    it('يجب أن ينظف الموارد غير المستخدمة', () => {
      networkOptimizer.pendingRequests.set('test', Promise.resolve());
      
      memoryOptimizer.cleanup();
      
      expect(networkOptimizer.pendingRequests.size).toBe(0);
    });
  });

  describe('getMemoryUsage', () => {
    it('يجب أن يعيد معلومات استخدام الذاكرة إذا كانت متاحة', () => {
      // Mock performance.memory
      global.performance = {
        memory: {
          usedJSHeapSize: 1024 * 1024 * 10, // 10MB
          totalJSHeapSize: 1024 * 1024 * 20, // 20MB
          jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
        }
      };
      
      const memoryUsage = memoryOptimizer.getMemoryUsage();
      
      expect(memoryUsage).toEqual({
        used: 10,
        total: 20,
        limit: 100
      });
    });

    it('يجب أن يعيد null إذا لم تكن معلومات الذاكرة متاحة', () => {
      global.performance = {};
      
      const memoryUsage = memoryOptimizer.getMemoryUsage();
      
      expect(memoryUsage).toBeNull();
    });
  });
});

describe('Performance Optimizer', () => {
  describe('getRecommendations', () => {
    it('يجب أن يقترح تنظيف الذاكرة عند الاستخدام المرتفع', () => {
      // Mock high memory usage
      vi.spyOn(memoryOptimizer, 'getMemoryUsage').mockReturnValue({
        used: 85,
        total: 90,
        limit: 100
      });
      
      const recommendations = performanceOptimizer.getRecommendations();
      
      expect(recommendations).toContainEqual({
        type: 'memory',
        message: 'استخدام الذاكرة مرتفع. يُنصح بإعادة تحميل الصفحة.',
        priority: 'high'
      });
    });

    it('يجب أن يقترح تحسين الشبكة عند وجود طلبات كثيرة معلقة', () => {
      // Mock many pending requests
      for (let i = 0; i < 15; i++) {
        networkOptimizer.pendingRequests.set(`request-${i}`, Promise.resolve());
      }
      
      const recommendations = performanceOptimizer.getRecommendations();
      
      expect(recommendations).toContainEqual({
        type: 'network',
        message: 'عدد كبير من الطلبات المعلقة. قد يؤثر على الأداء.',
        priority: 'medium'
      });
      
      // Cleanup
      networkOptimizer.pendingRequests.clear();
    });
  });
});
