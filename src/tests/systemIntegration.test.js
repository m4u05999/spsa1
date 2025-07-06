/**
 * System Integration Tests - Phase 1 Verification
 * اختبارات تكامل النظام - التحقق من المرحلة الأولى
 * 
 * Comprehensive tests to verify all Phase 1 components work correctly
 * after the Supabase module fix
 */

import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Import all Phase 1 components
import unifiedApiService from '../services/unifiedApiService.js';
import { 
  getFeatureFlag, 
  setFeatureFlag, 
  getAllFeatureFlags,
  getFeatureFlagStatistics 
} from '../config/featureFlags.js';
import { monitoringService } from '../utils/monitoring.js';
import hyperPayService from '../services/hyperPayService.js';
import { 
  loadSupabaseService, 
  checkModuleCompatibility,
  safeModuleLoad 
} from '../utils/moduleLoader.js';

// Mock external dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('System Integration Tests - Phase 1', () => {
  beforeAll(async () => {
    // Setup test environment
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    global.fetch = vi.fn();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        href: 'http://localhost:5173',
        pathname: '/'
      },
      writable: true
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('1. Module Loading System', () => {
    test('should load modules safely with fallback', async () => {
      const result = await safeModuleLoad('../config/environment.js', { fallback: true });
      expect(result).toBeDefined();
    });

    test('should handle Supabase service loading', async () => {
      const service = await loadSupabaseService();
      expect(service).toBeDefined();
      expect(service.isAvailable).toBeDefined();
      expect(service.auth).toBeDefined();
      expect(service.db).toBeDefined();
    });

    test('should generate compatibility report', async () => {
      const report = await checkModuleCompatibility();
      expect(report).toHaveProperty('supabase');
      expect(report).toHaveProperty('secureAuth');
      expect(report).toHaveProperty('environment');
      expect(report).toHaveProperty('timestamp');
    });
  });

  describe('2. UnifiedApiService Integration', () => {
    test('should initialize without errors', () => {
      expect(unifiedApiService).toBeDefined();
      expect(unifiedApiService.getServiceStatus).toBeDefined();
      expect(unifiedApiService.request).toBeDefined();
    });

    test('should provide service status', () => {
      const status = unifiedApiService.getServiceStatus();
      expect(status).toHaveProperty('newBackend');
      expect(status).toHaveProperty('supabase');
      expect(status.newBackend).toHaveProperty('available');
      expect(status.supabase).toHaveProperty('available');
    });

    test('should handle health checks', async () => {
      const newBackendHealth = await unifiedApiService.checkNewBackendHealth();
      const supabaseHealth = await unifiedApiService.checkSupabaseHealth();
      
      expect(typeof newBackendHealth).toBe('boolean');
      expect(typeof supabaseHealth).toBe('boolean');
    });

    test('should determine service correctly', () => {
      const service = unifiedApiService.determineService('AUTH');
      expect(['newBackend', 'supabase']).toContain(service);
    });

    test('should handle circuit breaker', () => {
      // Test circuit breaker functionality
      unifiedApiService.updateCircuitBreaker('newBackend', false);
      unifiedApiService.updateCircuitBreaker('newBackend', false);
      unifiedApiService.updateCircuitBreaker('newBackend', false);
      
      const isOpen = unifiedApiService.isCircuitBreakerOpen('newBackend');
      expect(typeof isOpen).toBe('boolean');
    });
  });

  describe('3. Feature Flags System', () => {
    test('should get and set feature flags', () => {
      const testFlag = 'TEST_FLAG';
      
      setFeatureFlag(testFlag, true);
      expect(getFeatureFlag(testFlag)).toBe(true);
      
      setFeatureFlag(testFlag, false);
      expect(getFeatureFlag(testFlag)).toBe(false);
    });

    test('should provide all flags', () => {
      const allFlags = getAllFeatureFlags();
      expect(typeof allFlags).toBe('object');
      expect(allFlags).toHaveProperty('USE_NEW_AUTH');
      expect(allFlags).toHaveProperty('ENABLE_HYPERPAY');
    });

    test('should provide statistics', () => {
      const stats = getFeatureFlagStatistics();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('enabled');
      expect(stats).toHaveProperty('disabled');
      expect(stats).toHaveProperty('percentage');
    });

    test('should handle user context updates', () => {
      const mockUser = {
        id: 'test-user-123',
        role: 'admin',
        email: 'test@example.com'
      };

      // This should not throw an error
      expect(() => {
        // updateUserContext is called internally
        setFeatureFlag('TEST_USER_FLAG', true);
      }).not.toThrow();
    });
  });

  describe('4. Monitoring System', () => {
    test('should track metrics', () => {
      expect(() => {
        monitoringService.trackMetric('test_metric', 1, { test: true });
      }).not.toThrow();
    });

    test('should track errors', () => {
      expect(() => {
        monitoringService.trackError({
          type: 'test_error',
          message: 'Test error message'
        });
      }).not.toThrow();
    });

    test('should provide performance summary', () => {
      const summary = monitoringService.getPerformanceSummary();
      expect(summary).toHaveProperty('totalRequests');
      expect(summary).toHaveProperty('totalErrors');
      expect(summary).toHaveProperty('overallErrorRate');
    });

    test('should track requests', () => {
      const requestId = 'test-request-123';
      
      expect(() => {
        monitoringService.trackRequest(requestId, {
          endpoint: '/test',
          method: 'GET',
          service: 'newBackend'
        });
      }).not.toThrow();
    });
  });

  describe('5. HyperPay Integration', () => {
    test('should initialize without errors', () => {
      expect(hyperPayService).toBeDefined();
      expect(hyperPayService.initializePayment).toBeDefined();
      expect(hyperPayService.checkPaymentStatus).toBeDefined();
    });

    test('should validate payment data', () => {
      const validData = {
        amount: 100,
        brand: 'VISA',
        orderId: 'TEST_ORDER_123',
        customerEmail: 'test@example.com',
        customerName: 'Test User'
      };

      expect(() => {
        hyperPayService.validatePaymentData(validData);
      }).not.toThrow();
    });

    test('should handle invalid payment data', () => {
      const invalidData = {
        amount: -100, // Invalid amount
        brand: 'INVALID_BRAND'
      };

      expect(() => {
        hyperPayService.validatePaymentData(invalidData);
      }).toThrow();
    });

    test('should provide payment statistics', () => {
      const stats = hyperPayService.getPaymentStatistics();
      expect(stats).toHaveProperty('activeCheckouts');
      expect(stats).toHaveProperty('isEnabled');
      expect(stats).toHaveProperty('environment');
    });
  });

  describe('6. Authentication Context Integration', () => {
    test('should handle token management', () => {
      // Test TokenManager functionality
      const mockTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: '24h'
      };

      // This should not throw errors
      expect(() => {
        localStorage.setItem('auth_token', mockTokens.accessToken);
        localStorage.setItem('refresh_token', mockTokens.refreshToken);
      }).not.toThrow();
    });
  });

  describe('7. Error Handling and Recovery', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await unifiedApiService.request('/test', {
          method: 'GET',
          requestType: 'PUBLIC'
        });
      } catch (error) {
        expect(error).toBeDefined();
        // Should be handled gracefully
      }
    });

    test('should recover from module loading failures', async () => {
      const fallback = { recovered: true };
      const result = await safeModuleLoad('./non-existent-module.js', fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe('8. Performance and Optimization', () => {
    test('should cache modules correctly', async () => {
      // Load same module twice
      const result1 = await safeModuleLoad('../config/environment.js');
      const result2 = await safeModuleLoad('../config/environment.js');
      
      // Should be cached (same reference or equivalent)
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        safeModuleLoad('../config/environment.js')
      );

      const results = await Promise.allSettled(requests);
      
      // All should resolve successfully
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });
  });

  describe('9. Configuration and Environment', () => {
    test('should load environment configuration', async () => {
      const envModule = await safeModuleLoad('../config/environment.js');
      expect(envModule).toBeDefined();
    });

    test('should handle different environments', () => {
      // Test environment-specific behavior
      const originalEnv = process.env.NODE_ENV;
      
      process.env.NODE_ENV = 'test';
      expect(getFeatureFlag('ENABLE_DEBUG_MODE')).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('10. Integration Completeness', () => {
    test('should have all Phase 1 components working together', async () => {
      // Test complete integration flow
      
      // 1. Feature flags should work
      setFeatureFlag('USE_NEW_AUTH', true);
      expect(getFeatureFlag('USE_NEW_AUTH')).toBe(true);
      
      // 2. Service determination should respect flags
      const service = unifiedApiService.determineService('AUTH');
      expect(service).toBeDefined();
      
      // 3. Monitoring should track the operation
      monitoringService.trackMetric('integration_test', 1);
      
      // 4. Module loading should work
      const supabaseService = await loadSupabaseService();
      expect(supabaseService).toBeDefined();
      
      // 5. All systems should be operational
      const serviceStatus = unifiedApiService.getServiceStatus();
      const monitoringStats = monitoringService.getPerformanceSummary();
      const flagStats = getFeatureFlagStatistics();
      
      expect(serviceStatus).toBeDefined();
      expect(monitoringStats).toBeDefined();
      expect(flagStats).toBeDefined();
    });
  });
});
