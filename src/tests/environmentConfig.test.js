/**
 * Environment Configuration Tests
 * اختبارات تكوين البيئة
 * 
 * Tests to verify environment variables are loaded correctly
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('Environment Configuration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Vite Environment Variables', () => {
    test('should load VITE_API_URL correctly', () => {
      // Check if Vite loads the environment variable
      expect(import.meta.env.VITE_API_URL).toBeDefined();
      
      // For development, should be localhost:3001
      if (import.meta.env.DEV) {
        expect(import.meta.env.VITE_API_URL).toBe('http://localhost:3001/api');
      }
    });

    test('should have correct development environment', () => {
      expect(import.meta.env.DEV).toBe(true);
      expect(import.meta.env.PROD).toBe(false);
      expect(import.meta.env.MODE).toBe('test'); // In test mode
    });

    test('should load all required VITE_ variables', () => {
      const requiredVars = [
        'VITE_API_URL',
        'VITE_APP_ENV',
        'VITE_ENABLE_NEW_BACKEND'
      ];

      requiredVars.forEach(varName => {
        expect(import.meta.env[varName]).toBeDefined();
      });
    });
  });

  describe('Environment Module', () => {
    test('should load environment module correctly', async () => {
      const { ENV } = await import('../config/environment.js');
      
      expect(ENV).toBeDefined();
      expect(ENV.API_URL).toBeDefined();
      expect(ENV.NODE_ENV).toBeDefined();
      expect(ENV.APP_ENV).toBeDefined();
    });

    test('should use correct API URL for development', async () => {
      const { ENV } = await import('../config/environment.js');
      
      // Should use localhost for development
      if (ENV.IS_DEVELOPMENT) {
        expect(ENV.API_URL).toContain('localhost:3001');
      }
    });

    test('should have proper feature flags', async () => {
      const { ENV } = await import('../config/environment.js');
      
      expect(ENV.FEATURES).toBeDefined();
      expect(typeof ENV.FEATURES.ENABLE_NEW_BACKEND).toBe('boolean');
      expect(typeof ENV.FEATURES.USE_NEW_AUTH).toBe('boolean');
    });
  });

  describe('UnifiedApiService Configuration', () => {
    test('should use correct API URL', async () => {
      // Mock console.log to capture debug output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Import UnifiedApiService (this will trigger the debug logging)
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      expect(unifiedApiService).toBeDefined();
      
      // Check if debug logging was called with correct URL
      const debugCalls = consoleSpy.mock.calls.filter(call => 
        call[0] && call[0].includes && call[0].includes('UnifiedApiService Config Debug')
      );
      
      if (debugCalls.length > 0) {
        const debugInfo = debugCalls[0][1];
        expect(debugInfo.FINAL_BASE_URL).toContain('localhost:3001');
        expect(debugInfo.HEALTH_CHECK_URL).toContain('localhost:3001');
      }
      
      consoleSpy.mockRestore();
    });

    test('should provide service status', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      const status = unifiedApiService.getServiceStatus();
      
      expect(status).toBeDefined();
      expect(status.newBackend).toBeDefined();
      expect(status.supabase).toBeDefined();
    });

    test('should handle health checks without errors', async () => {
      // Mock fetch to avoid actual network calls
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      // Should not throw error
      const isHealthy = await unifiedApiService.checkNewBackendHealth();
      expect(typeof isHealthy).toBe('boolean');
      
      global.fetch.mockRestore();
    });
  });

  describe('Environment Debug Utility', () => {
    test('should provide environment debug information', async () => {
      const { checkEnvironmentHealth } = await import('../utils/envDebug.js');
      
      const health = checkEnvironmentHealth();
      
      expect(health).toBeDefined();
      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('issues');
      expect(health).toHaveProperty('recommendations');
      
      expect(typeof health.isHealthy).toBe('boolean');
      expect(Array.isArray(health.issues)).toBe(true);
      expect(Array.isArray(health.recommendations)).toBe(true);
    });

    test('should detect environment issues', async () => {
      const { checkEnvironmentHealth } = await import('../utils/envDebug.js');
      
      const health = checkEnvironmentHealth();
      
      // In test environment, some issues might be expected
      if (!health.isHealthy) {
        expect(health.issues.length).toBeGreaterThan(0);
        expect(health.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should work when backend is unavailable', async () => {
      // Mock fetch to simulate backend unavailability
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      // Should still provide service status
      const status = unifiedApiService.getServiceStatus();
      expect(status).toBeDefined();
      
      // Should handle health check gracefully
      const isHealthy = await unifiedApiService.checkNewBackendHealth();
      expect(typeof isHealthy).toBe('boolean');
      expect(isHealthy).toBe(false); // Should be false when backend is down
      
      global.fetch.mockRestore();
    });

    test('should use enhanced content service fallback', async () => {
      const { default: enhancedContentService } = await import('../services/enhancedContentService.js');
      
      const serviceStatus = enhancedContentService.getServiceStatus();
      
      expect(serviceStatus).toBeDefined();
      expect(serviceStatus.fallbackAvailable).toBe(true);
    });
  });

  describe('Integration Test', () => {
    test('should load all services without errors', async () => {
      // Mock fetch to avoid network calls
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      
      // Import all main services
      const services = await Promise.all([
        import('../services/unifiedApiService.js'),
        import('../services/enhancedContentService.js'),
        import('../services/contentApiService.js'),
        import('../services/userApiService.js'),
        import('../services/categoriesApiService.js'),
        import('../config/environment.js'),
        import('../config/featureFlags.js')
      ]);
      
      // All services should load successfully
      services.forEach((service, index) => {
        expect(service).toBeDefined();
        if (service.default) {
          expect(service.default).toBeDefined();
        }
      });
      
      global.fetch.mockRestore();
    });

    test('should maintain system functionality', async () => {
      // Mock all external dependencies
      global.fetch = vi.fn().mockRejectedValue(new Error('All services down'));
      
      const [
        { default: unifiedApiService },
        { default: enhancedContentService },
        { ENV },
        { getFeatureFlag }
      ] = await Promise.all([
        import('../services/unifiedApiService.js'),
        import('../services/enhancedContentService.js'),
        import('../config/environment.js'),
        import('../config/featureFlags.js')
      ]);

      // Basic functionality should work
      expect(unifiedApiService.getServiceStatus()).toBeDefined();
      expect(enhancedContentService.getServiceStatus()).toBeDefined();
      expect(ENV.API_URL).toBeDefined();
      expect(getFeatureFlag('USE_NEW_AUTH')).toBeDefined();
      
      global.fetch.mockRestore();
    });
  });
});
