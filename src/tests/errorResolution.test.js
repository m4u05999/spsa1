/**
 * Error Resolution Tests
 * اختبارات حل الأخطاء
 * 
 * Tests to verify that console errors have been resolved
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Console Error Resolution Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to capture errors
    global.console.error = vi.fn();
    global.console.warn = vi.fn();
    
    // Mock fetch
    global.fetch = vi.fn();
    
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Module Loading Resolution', () => {
    test('should load supabaseService without 404 error', async () => {
      const { loadSupabaseService } = await import('../utils/moduleLoader.js');
      
      // Should not throw 404 error
      const service = await loadSupabaseService();
      
      expect(service).toBeDefined();
      expect(service.isAvailable).toBeDefined();
      expect(service.auth).toBeDefined();
      expect(service.db).toBeDefined();
    });

    test('should load secureAuthService without 404 error', async () => {
      const { safeModuleLoad } = await import('../utils/moduleLoader.js');
      
      // Should not throw 404 error
      const service = await safeModuleLoad('../services/secureAuthService.js', { fallback: true });
      
      expect(service).toBeDefined();
    });

    test('should preload critical modules successfully', async () => {
      const { preloadCriticalModules } = await import('../utils/moduleLoader.js');
      
      const results = await preloadCriticalModules();
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Backend Connection Resolution', () => {
    test('should handle backend connection gracefully', async () => {
      // Mock failed connection
      global.fetch.mockRejectedValue(new Error('CONNECTION_REFUSED'));
      
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      // Should not throw error, should return false
      const isHealthy = await unifiedApiService.checkNewBackendHealth();
      
      expect(isHealthy).toBe(false);
      // Should not log CONNECTION_REFUSED errors repeatedly
      expect(global.console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('CONNECTION_REFUSED')
      );
    });

    test('should use correct API URL from environment', async () => {
      const { ENV } = await import('../config/environment.js');
      
      // Should use localhost:3001 for development
      expect(ENV.API_URL).toContain('localhost:3001');
    });

    test('should implement health check throttling', async () => {
      // Reset fetch mock to ensure clean state
      global.fetch.mockClear();
      global.fetch.mockRejectedValue(new Error('CONNECTION_REFUSED'));

      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');

      // Clear any existing health check cache
      unifiedApiService.lastHealthCheck = {};

      // First check - should make actual fetch call
      const result1 = await unifiedApiService.checkNewBackendHealth();
      expect(result1).toBe(false);

      // Second check immediately (should be throttled due to cooldown)
      const result2 = await unifiedApiService.checkNewBackendHealth();
      expect(result2).toBe(false);

      // Should only make one actual fetch call due to throttling (10s cooldown in dev)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Health Check System Resolution', () => {
    test('should not spam console with repeated health check failures', async () => {
      global.fetch.mockRejectedValue(new Error('CONNECTION_REFUSED'));
      
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      // Multiple health checks
      await unifiedApiService.checkNewBackendHealth();
      await unifiedApiService.checkNewBackendHealth();
      await unifiedApiService.checkNewBackendHealth();
      
      // Should not log multiple CONNECTION_REFUSED warnings
      const connectionRefusedWarnings = global.console.warn.mock.calls.filter(
        call => call[0] && call[0].includes && call[0].includes('CONNECTION_REFUSED')
      );
      
      expect(connectionRefusedWarnings.length).toBeLessThanOrEqual(1);
    });

    test('should use longer intervals for health monitoring', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');

      // Mock setTimeout to capture the interval (system uses setTimeout, not setInterval)
      const originalSetTimeout = global.setTimeout;
      const mockSetTimeout = vi.fn();
      global.setTimeout = mockSetTimeout;

      unifiedApiService.startHealthMonitoring();

      // Should use appropriate intervals - system uses setTimeout with 120000ms (2 minutes) for normal operation
      // Initial check is after 10 seconds, then adaptive intervals
      expect(mockSetTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        10000 // Initial check after 10 seconds
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Fallback Mechanisms Verification', () => {
    test('should fallback to legacy service when backend is unavailable', async () => {
      global.fetch.mockRejectedValue(new Error('CONNECTION_REFUSED'));
      
      const { default: enhancedContentService } = await import('../services/enhancedContentService.js');
      
      // Should not throw error, should use fallback
      const result = await enhancedContentService.getContentList();
      
      expect(result).toBeDefined();
      // Should indicate fallback was used
      expect(result.metadata?.service).toBe('legacy');
    });

    test('should provide service status correctly', async () => {
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      
      const status = unifiedApiService.getServiceStatus();
      
      expect(status).toHaveProperty('newBackend');
      expect(status).toHaveProperty('supabase');
      expect(status.newBackend).toHaveProperty('available');
      expect(status.supabase).toHaveProperty('available');
    });

    test('should handle feature flags correctly', async () => {
      const { getFeatureFlag } = await import('../config/featureFlags.js');
      
      // Should not throw errors
      const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
      const useNewContent = getFeatureFlag('USE_NEW_CONTENT_API');
      
      expect(typeof useNewAuth).toBe('boolean');
      expect(typeof useNewContent).toBe('boolean');
    });
  });

  describe('Environment Configuration', () => {
    test('should load environment variables correctly', async () => {
      const { ENV } = await import('../config/environment.js');
      
      expect(ENV).toBeDefined();
      expect(ENV.API_URL).toBeDefined();
      expect(ENV.NODE_ENV).toBeDefined();
      expect(ENV.APP_ENV).toBeDefined();
    });

    test('should use development configuration', async () => {
      const { ENV } = await import('../config/environment.js');
      
      // Should use localhost for development
      if (ENV.NODE_ENV === 'development') {
        expect(ENV.API_URL).toContain('localhost');
      }
    });
  });

  describe('System Stability', () => {
    test('should maintain system functionality despite errors', async () => {
      // Mock all external services as failing
      global.fetch.mockRejectedValue(new Error('All services down'));
      
      const { default: unifiedApiService } = await import('../services/unifiedApiService.js');
      const { default: enhancedContentService } = await import('../services/enhancedContentService.js');
      
      // System should still provide basic functionality
      const serviceStatus = unifiedApiService.getServiceStatus();
      expect(serviceStatus).toBeDefined();
      
      const contentServiceStatus = enhancedContentService.getServiceStatus();
      expect(contentServiceStatus).toBeDefined();
      expect(contentServiceStatus.fallbackAvailable).toBe(true);
    });

    test('should not break application flow', async () => {
      // Import main services
      const services = await Promise.all([
        import('../services/unifiedApiService.js'),
        import('../services/enhancedContentService.js'),
        import('../services/contentApiService.js'),
        import('../services/userApiService.js'),
        import('../services/categoriesApiService.js')
      ]);
      
      // All services should load without throwing errors
      services.forEach(service => {
        expect(service.default).toBeDefined();
      });
    });
  });
});

describe('Integration Test - Full System', () => {
  test('should work end-to-end with all fixes applied', async () => {
    // Mock environment
    global.fetch = vi.fn().mockRejectedValue(new Error('CONNECTION_REFUSED'));
    
    // Load all main components
    const [
      { default: unifiedApiService },
      { default: enhancedContentService },
      { loadSupabaseService },
      { getFeatureFlag }
    ] = await Promise.all([
      import('../services/unifiedApiService.js'),
      import('../services/enhancedContentService.js'),
      import('../utils/moduleLoader.js'),
      import('../config/featureFlags.js')
    ]);

    // Test module loading
    const supabaseService = await loadSupabaseService();
    expect(supabaseService).toBeDefined();
    // Service availability depends on actual connectivity, so just verify it's a boolean
    expect(typeof supabaseService.isAvailable()).toBe('boolean');

    // Test service health
    const newBackendHealth = await unifiedApiService.checkNewBackendHealth();
    const supabaseHealth = await unifiedApiService.checkSupabaseHealth();
    
    expect(typeof newBackendHealth).toBe('boolean');
    expect(typeof supabaseHealth).toBe('boolean');

    // Test feature flags
    const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
    expect(typeof useNewAuth).toBe('boolean');

    // Test enhanced content service
    const serviceStatus = enhancedContentService.getServiceStatus();
    expect(serviceStatus).toBeDefined();
    expect(serviceStatus.fallbackAvailable).toBe(true);

    // Test unified API service
    const apiStatus = unifiedApiService.getServiceStatus();
    expect(apiStatus).toBeDefined();
    expect(apiStatus.newBackend).toBeDefined();
    expect(apiStatus.supabase).toBeDefined();

    // System should be functional despite backend being down
    expect(true).toBe(true); // If we reach here, all imports and basic functionality work
  });
});
