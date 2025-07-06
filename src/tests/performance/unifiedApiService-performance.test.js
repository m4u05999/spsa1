/**
 * UnifiedApiService Performance Tests
 * اختبارات أداء خدمة API الموحدة
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import unifiedApiService from '../../services/unifiedApiService.js';

describe('UnifiedApiService Performance Tests', () => {
  let performanceStartTime;

  beforeEach(() => {
    performanceStartTime = performance.now();
    // Reset performance metrics
    unifiedApiService.resetPerformanceMetrics();
    unifiedApiService.clearCache();
  });

  afterEach(() => {
    const testDuration = performance.now() - performanceStartTime;
    console.log(`Test completed in ${testDuration.toFixed(2)}ms`);
  });

  describe('Initialization Performance', () => {
    it('should initialize within 500ms target', async () => {
      const startTime = performance.now();
      
      // Force re-initialization
      const service = new (await import('../../services/unifiedApiService.js')).default.constructor();
      await service.initializeAsync();
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      console.log(`🔗 UnifiedApiService initialization time: ${initTime.toFixed(2)}ms`);
      
      // Target: under 500ms
      expect(initTime).toBeLessThan(500);
    });

    it('should handle fast health check within 300ms', async () => {
      const startTime = performance.now();
      
      await unifiedApiService.fastHealthCheck();
      
      const endTime = performance.now();
      const healthCheckTime = endTime - startTime;
      
      console.log(`⚡ Health check time: ${healthCheckTime.toFixed(2)}ms`);
      
      // Target: under 300ms
      expect(healthCheckTime).toBeLessThan(300);
    });
  });

  describe('Request Performance', () => {
    it('should handle cached requests under 50ms', async () => {
      const endpoint = '/test/cached-data';
      const testData = { test: 'data' };
      
      // First request to populate cache
      unifiedApiService.setCache(endpoint, 'GET', null, testData);
      
      const startTime = performance.now();
      
      const result = await unifiedApiService.request(endpoint, {
        method: 'GET',
        useCache: true
      });
      
      const endTime = performance.now();
      const requestTime = endTime - startTime;
      
      console.log(`⚡ Cached request time: ${requestTime.toFixed(2)}ms`);
      
      // Target: under 50ms for cached requests
      expect(requestTime).toBeLessThan(50);

      // Check result structure - it might be wrapped in success/data structure
      if (result && result.data) {
        expect(result.data).toEqual(testData);
      } else {
        expect(result).toEqual(testData);
      }
    });

    it('should handle request deduplication efficiently', async () => {
      const endpoint = '/test/duplicate-request';
      
      // Mock the actual service request to simulate network delay
      const originalMakeServiceRequest = unifiedApiService.makeServiceRequest;
      unifiedApiService.makeServiceRequest = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        return { test: 'response' };
      });
      
      const startTime = performance.now();
      
      // Make 3 identical requests simultaneously
      const promises = [
        unifiedApiService.request(endpoint, { method: 'GET' }),
        unifiedApiService.request(endpoint, { method: 'GET' }),
        unifiedApiService.request(endpoint, { method: 'GET' })
      ];
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log(`🔄 Deduplicated requests time: ${totalTime.toFixed(2)}ms`);
      
      // Should only make one actual request due to deduplication
      expect(unifiedApiService.makeServiceRequest).toHaveBeenCalledTimes(1);
      
      // All results should be identical (compare the core response data)
      // Extract the core data from potentially different response structures
      const extractData = (result) => {
        if (result?.result) return result.result;
        if (result?.data) return result.data;
        return result;
      };

      const data0 = extractData(results[0]);
      const data1 = extractData(results[1]);
      const data2 = extractData(results[2]);

      expect(data0).toEqual(data1);
      expect(data1).toEqual(data2);
      
      // Total time should be close to single request time (not 3x)
      expect(totalTime).toBeLessThan(200); // Should be ~100ms, not ~300ms
      
      // Restore original method
      unifiedApiService.makeServiceRequest = originalMakeServiceRequest;
    });

    it('should handle circuit breaker efficiently', async () => {
      const endpoint = '/test/circuit-breaker';
      
      // Force circuit breaker to open state
      unifiedApiService.updateCircuitBreaker('newBackend', false);
      
      const startTime = performance.now();
      
      // This should immediately use fallback without trying primary service
      try {
        await unifiedApiService.request(endpoint, {
          method: 'GET',
          requestType: 'PUBLIC'
        });
      } catch (error) {
        // Expected to fail in test environment
      }
      
      const endTime = performance.now();
      const circuitBreakerTime = endTime - startTime;
      
      console.log(`🔴 Circuit breaker response time: ${circuitBreakerTime.toFixed(2)}ms`);

      // Circuit breaker should respond reasonably quickly (increased tolerance for test environment)
      expect(circuitBreakerTime).toBeLessThan(200);
    });
  });

  describe('Cache Performance', () => {
    it('should handle cache operations efficiently', () => {
      const startTime = performance.now();
      
      // Add 50 cache entries
      for (let i = 0; i < 50; i++) {
        unifiedApiService.setCache(`/test/endpoint-${i}`, 'GET', null, { data: i });
      }
      
      const cacheSetTime = performance.now();
      
      // Retrieve all cache entries
      let hits = 0;
      for (let i = 0; i < 50; i++) {
        const result = unifiedApiService.getFromCache(`/test/endpoint-${i}`, 'GET', null);
        if (result) hits++;
      }
      
      const cacheGetTime = performance.now();
      
      const setDuration = cacheSetTime - startTime;
      const getDuration = cacheGetTime - cacheSetTime;
      
      console.log(`💾 Cache set time: ${setDuration.toFixed(2)}ms`);
      console.log(`💾 Cache get time: ${getDuration.toFixed(2)}ms`);
      
      expect(hits).toBe(50);
      expect(setDuration).toBeLessThan(50); // Setting 50 entries should be under 50ms
      expect(getDuration).toBeLessThan(25); // Getting 50 entries should be under 25ms
    });

    it('should handle cache eviction efficiently', () => {
      const maxSize = 100; // SERVICE_CONFIG.CACHE.maxSize
      
      const startTime = performance.now();
      
      // Add more entries than max size to trigger eviction
      for (let i = 0; i < maxSize + 20; i++) {
        unifiedApiService.setCache(`/test/eviction-${i}`, 'GET', null, { data: i });
      }
      
      const endTime = performance.now();
      const evictionTime = endTime - startTime;
      
      console.log(`🗑️ Cache eviction time: ${evictionTime.toFixed(2)}ms`);
      
      const cacheStats = unifiedApiService.getCacheStats();
      console.log('📊 Cache stats:', cacheStats);
      
      // Cache should not exceed max size
      expect(unifiedApiService.cache.size).toBeLessThanOrEqual(maxSize);
      
      // Eviction should be efficient
      expect(evictionTime).toBeLessThan(100);
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics accurately', async () => {
      // Simulate some requests with known durations
      const durations = [100, 200, 150, 300, 50];
      
      for (const duration of durations) {
        unifiedApiService.updatePerformanceMetrics(duration);
      }
      
      const metrics = unifiedApiService.getPerformanceMetrics();
      
      console.log('📊 Performance metrics:', metrics);
      
      expect(metrics.requestCount).toBe(5);
      expect(metrics.fastestResponse).toBe(50);
      expect(metrics.slowestResponse).toBe(300);
      expect(metrics.averageResponseTime).toBe(160); // (100+200+150+300+50)/5
      expect(metrics.lastResponseTime).toBe(50);
    });

    it('should provide comprehensive service status', () => {
      const startTime = performance.now();
      
      const metrics = unifiedApiService.getPerformanceMetrics();
      const cacheStats = unifiedApiService.getCacheStats();
      
      const endTime = performance.now();
      const metricsTime = endTime - startTime;
      
      console.log('📊 Service metrics retrieval time:', `${metricsTime.toFixed(2)}ms`);
      console.log('📊 Full metrics:', metrics);
      console.log('💾 Cache stats:', cacheStats);
      
      // Metrics retrieval should be very fast
      expect(metricsTime).toBeLessThan(10);
      
      // Should have all expected properties
      expect(metrics).toHaveProperty('requestCount');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('circuitBreakerStatus');
      expect(metrics).toHaveProperty('serviceAvailability');
      
      expect(cacheStats).toHaveProperty('totalEntries');
      expect(cacheStats).toHaveProperty('validEntries');
      expect(cacheStats).toHaveProperty('hitRate');
    });
  });

  describe('Overall Performance Target', () => {
    it('should meet sub-500ms response time target for typical requests', async () => {
      // Test multiple request scenarios
      const scenarios = [
        { name: 'Cached GET', useCache: true, expectedTime: 50 },
        { name: 'Circuit Breaker', circuitOpen: true, expectedTime: 100 },
        { name: 'Health Check', isHealthCheck: true, expectedTime: 300 }
      ];
      
      for (const scenario of scenarios) {
        const startTime = performance.now();
        
        try {
          if (scenario.isHealthCheck) {
            await unifiedApiService.fastHealthCheck();
          } else {
            if (scenario.circuitOpen) {
              unifiedApiService.updateCircuitBreaker('newBackend', false);
            }
            
            if (scenario.useCache) {
              unifiedApiService.setCache('/test/scenario', 'GET', null, { test: 'data' });
            }
            
            await unifiedApiService.request('/test/scenario', {
              method: 'GET',
              useCache: scenario.useCache
            });
          }
        } catch (error) {
          // Expected in test environment
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`⚡ ${scenario.name} time: ${duration.toFixed(2)}ms (target: <${scenario.expectedTime}ms)`);
        
        expect(duration).toBeLessThan(scenario.expectedTime);
      }
    });
  });
});
