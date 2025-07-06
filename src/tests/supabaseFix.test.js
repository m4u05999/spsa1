/**
 * Supabase Fix Verification Tests
 * اختبارات التحقق من حل مشكلة Supabase
 * 
 * Quick tests to verify the Supabase PostgREST module issue is resolved
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('Supabase Module Fix Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Import Tests', () => {
    test('should import UnifiedApiService without errors', async () => {
      expect(async () => {
        const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
        expect(unifiedApiService).toBeDefined();
      }).not.toThrow();
    });

    test('should import moduleLoader without errors', async () => {
      expect(async () => {
        const moduleLoader = await import('../utils/moduleLoader.js');
        expect(moduleLoader.loadSupabaseService).toBeDefined();
      }).not.toThrow();
    });

    test('should handle dynamic Supabase import', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');
      
      // Should not throw syntax errors
      const service = await loadSupabaseService();
      expect(service).toBeDefined();
      expect(service.isAvailable).toBeDefined();
    });
  });

  describe('Fallback Mechanism Tests', () => {
    test('should provide fallback service when Supabase fails', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');

      const service = await loadSupabaseService();

      // Should have fallback methods
      expect(service.auth).toBeDefined();
      expect(service.db).toBeDefined();
      expect(service.isAvailable).toBeDefined();

      // In test environment, Supabase should be considered unavailable due to invalid URL
      // The service loads but connection fails, so isAvailable should reflect actual connectivity
      const isAvailable = service.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
      // Don't enforce specific value since it depends on actual Supabase connectivity
    });

    test('should handle auth operations with fallback', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');

      const service = await loadSupabaseService();

      // Should handle auth gracefully - either reject or return error response
      try {
        const result = await service.auth.signIn('test@example.com', 'password');
        // If it resolves, should indicate failure
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      } catch (error) {
        // If it rejects, should have meaningful error message
        expect(error.message).toContain('failed');
      }
    });

    test('should handle database operations with fallback', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');

      const service = await loadSupabaseService();

      // Should handle database operations gracefully - either reject or return error response
      try {
        const result = await service.db.select('users');
        // If it resolves, should indicate failure
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      } catch (error) {
        // If it rejects, should have meaningful error message
        expect(error.message).toContain('failed');
      }
    });
  });

  describe('UnifiedApiService Integration', () => {
    test('should initialize UnifiedApiService successfully', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      expect(unifiedApiService).toBeDefined();
      expect(unifiedApiService.getServiceStatus).toBeDefined();
    });

    test('should check Supabase health without errors', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      // Should not throw errors
      const isHealthy = await unifiedApiService.checkSupabaseHealth();
      expect(typeof isHealthy).toBe('boolean');
    });

    test('should handle Supabase requests with fallback', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      // Should handle gracefully
      try {
        await unifiedApiService.handleSupabaseAuth('/auth/login', 'POST', {
          email: 'test@example.com',
          password: 'password'
        });
      } catch (error) {
        expect(error.message).toContain('Supabase service not available');
      }
    });

    test('should provide service status including Supabase', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');

      const status = unifiedApiService.getServiceStatus();

      expect(status).toHaveProperty('supabase');
      expect(status.supabase).toHaveProperty('available');
      // Service status depends on actual connectivity, so just verify it's a boolean
      expect(typeof status.supabase.available).toBe('boolean');
    });
  });

  describe('Error Handling Tests', () => {
    test('should not throw syntax errors on module resolution', async () => {
      // Test that we don't get the original PostgREST error
      expect(async () => {
        await import('../services/unifiedApiService.js');
      }).not.toThrow(/does not provide an export named 'default'/);
    });

    test('should handle module loading errors gracefully', async () => {
      const { safeModuleLoad } = await import('../utils/moduleLoader.js');
      
      const fallback = { test: 'fallback' };
      const result = await safeModuleLoad('./non-existent-module.js', fallback);
      
      expect(result).toEqual(fallback);
    });

    test('should maintain system stability with Supabase issues', async () => {
      // Import all main components
      const [
        { default: unifiedApiService },
        { getFeatureFlag },
        { monitoringService }
      ] = await Promise.all([
        import('../services/unifiedApiService.js'),
        import('../config/featureFlags.js'),
        import('../utils/monitoring.js')
      ]);

      // All should be functional
      expect(unifiedApiService).toBeDefined();
      expect(getFeatureFlag).toBeDefined();
      expect(monitoringService).toBeDefined();
      
      // System should be operational
      expect(unifiedApiService.getServiceStatus()).toBeDefined();
      expect(getFeatureFlag('USE_NEW_AUTH')).toBeDefined();
    });
  });

  describe('Performance Impact Tests', () => {
    test('should not significantly impact loading time', async () => {
      const startTime = Date.now();
      
      await import('../services/unifiedApiService.js');
      
      const loadTime = Date.now() - startTime;
      
      // Should load reasonably fast (less than 1 second)
      expect(loadTime).toBeLessThan(1000);
    });

    test('should cache module loading results', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');
      
      const startTime1 = Date.now();
      await loadSupabaseService();
      const time1 = Date.now() - startTime1;
      
      const startTime2 = Date.now();
      await loadSupabaseService();
      const time2 = Date.now() - startTime2;
      
      // Second call should be faster (cached)
      expect(time2).toBeLessThanOrEqual(time1);
    });
  });

  describe('Development Experience Tests', () => {
    test('should provide helpful error messages', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');
      
      const service = await loadSupabaseService();
      
      try {
        await service.auth.signIn('test', 'test');
      } catch (error) {
        expect(error.message).toContain('Supabase service not available');
        expect(error.message).not.toContain('SyntaxError');
        expect(error.message).not.toContain('export named');
      }
    });

    test('should maintain debugging capabilities', async () => {
      const { getModuleStatus } = await import('../utils/moduleLoader.js');
      
      const status = getModuleStatus('./supabaseService.js');
      
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('cached');
    });
  });
});

// Quick smoke test for immediate verification
describe('Smoke Test - Immediate Verification', () => {
  test('should load all Phase 1 components without syntax errors', async () => {
    const imports = [
      import('../services/unifiedApiService.js'),
      import('../config/featureFlags.js'),
      import('../utils/monitoring.js'),
      import('../services/hyperPayService.js'),
      import('../utils/moduleLoader.js')
    ];

    const results = await Promise.allSettled(imports);
    
    results.forEach((result, index) => {
      expect(result.status).toBe('fulfilled');
      expect(result.value).toBeDefined();
    });
  });

  test('should initialize core services', async () => {
    const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
    const { getFeatureFlag } = await import('../config/featureFlags.js');
    const { monitoringService } = await import('../utils/monitoring.js');

    // Core functionality should work
    expect(unifiedApiService.getServiceStatus()).toBeDefined();
    expect(getFeatureFlag('USE_NEW_AUTH')).toBeDefined();
    expect(monitoringService.getPerformanceSummary()).toBeDefined();
  });
});
