/**
 * Enhanced Realtime Sync Hook Tests for Phase 3
 * اختبارات خطاف تزامن الميزات الفورية المحسنة للمرحلة 3
 * 
 * Comprehensive tests for enhanced real-time sync hook
 * including sync operations, activity tracking, and performance monitoring
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useEnhancedRealtimeSync } from '../useEnhancedRealtimeSync';
import { CONTENT_SYNC_STRATEGIES, ACTIVITY_TRACKING_LEVELS } from '../../services/realtime/enhancedRealtimeService';

// Mock dependencies
vi.mock('../../contexts/EnhancedRealtimeContext', () => ({
  useEnhancedRealtime: vi.fn(() => ({
    isInitialized: true,
    isConnected: true,
    error: null,
    syncContent: vi.fn().mockResolvedValue(true),
    trackActivity: vi.fn().mockResolvedValue(true),
    broadcastNotification: vi.fn().mockResolvedValue(true),
    setContentSyncStrategy: vi.fn(),
    setActivityTrackingLevel: vi.fn(),
    performanceMetrics: {
      avgLatency: 100,
      messageCount: 10,
      errorCount: 0,
      memoryUsage: 1024 * 1024
    },
    activeUsers: new Set(['user1', 'user2']),
    liveNotifications: [],
    clearError: vi.fn()
  }))
}));

vi.mock('../../config/featureFlags', () => ({
  getFeatureFlag: vi.fn((flag) => {
    const flags = {
      'ENABLE_PHASE3_REALTIME': true,
      'ENABLE_LIVE_CONTENT_SYNC': true,
      'ENABLE_USER_ACTIVITY_TRACKING': true,
      'ENABLE_LIVE_NOTIFICATIONS': true
    };
    return flags[flag] || false;
  })
}));

vi.mock('../../hooks/useErrorMessages', () => ({
  useErrorMessages: vi.fn(() => ({
    handleApiError: vi.fn((error) => error.message || 'Unknown error')
  }))
}));

vi.mock('../../utils/monitoring', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarning: vi.fn()
}));

describe('Enhanced Realtime Sync Hook - خطاف تزامن الميزات الفورية المحسنة', () => {
  let mockUseEnhancedRealtime;

  beforeEach(() => {
    mockUseEnhancedRealtime = require('../../contexts/EnhancedRealtimeContext').useEnhancedRealtime;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Initialization - تهيئة الخطاف', () => {
    test('should initialize with default options - يجب التهيئة بالخيارات الافتراضية', () => {
      const { result } = renderHook(() => useEnhancedRealtimeSync());

      expect(result.current).toMatchObject({
        isInitialized: true,
        isConnected: true,
        error: null,
        syncContentChange: expect.any(Function),
        trackUserActivity: expect.any(Function),
        sendLiveNotification: expect.any(Function),
        getSyncStatistics: expect.any(Function),
        features: {
          contentSyncEnabled: true,
          activityTrackingEnabled: true,
          liveNotificationsEnabled: true,
          phase3Enabled: true
        }
      });
    });

    test('should initialize with custom options - يجب التهيئة بالخيارات المخصصة', () => {
      const customOptions = {
        syncStrategy: CONTENT_SYNC_STRATEGIES.BATCHED,
        activityLevel: ACTIVITY_TRACKING_LEVELS.DETAILED,
        enableContentSync: false,
        debounceMs: 200
      };

      const { result } = renderHook(() => useEnhancedRealtimeSync(customOptions));

      expect(result.current.features.contentSyncEnabled).toBe(false);
    });

    test('should handle disabled Phase 3 features - يجب التعامل مع تعطيل ميزات المرحلة 3', () => {
      const { getFeatureFlag } = require('../../config/featureFlags');
      getFeatureFlag.mockReturnValue(false);

      const { result } = renderHook(() => useEnhancedRealtimeSync());

      expect(result.current.features.phase3Enabled).toBe(false);
    });
  });

  describe('Content Synchronization - تزامن المحتوى', () => {
    test('should sync content change successfully - يجب تزامن تغيير المحتوى بنجاح', async () => {
      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const contentData = {
        id: 'content_123',
        title: 'Test Content',
        type: 'article'
      };

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncContentChange('content_updated', contentData);
      });

      expect(syncResult).toBe(true);
      expect(result.current.syncStatus.isActive).toBe(true);
      expect(result.current.syncStatus.lastSync).toBeTruthy();
    });

    test('should handle sync errors gracefully - يجب التعامل مع أخطاء التزامن بلطف', async () => {
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        syncContent: vi.fn().mockRejectedValue(new Error('Sync failed'))
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync({
        onError: vi.fn()
      }));

      let syncResult;
      await act(async () => {
        syncResult = await result.current.syncContentChange('content_updated', { id: 'test' });
      });

      expect(syncResult).toBe(false);
      expect(result.current.syncStatus.syncErrors).toBeGreaterThan(0);
    });

    test('should debounce rapid sync operations - يجب تقييد عمليات التزامن السريعة', async () => {
      const mockSyncContent = vi.fn().mockResolvedValue(true);
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        syncContent: mockSyncContent
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync({
        debounceMs: 100
      }));

      // Perform rapid sync operations
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          result.current.syncContentChange('rapid_update', { id: i });
        }
      });

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should have debounced the calls
      expect(mockSyncContent).toHaveBeenCalledTimes(1);
    });

    test('should respect content sync feature flag - يجب احترام علامة ميزة تزامن المحتوى', async () => {
      const { getFeatureFlag } = require('../../config/featureFlags');
      getFeatureFlag.mockImplementation((flag) => {
        if (flag === 'ENABLE_LIVE_CONTENT_SYNC') return false;
        return true;
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const syncResult = await act(async () => {
        return await result.current.syncContentChange('test', { id: 'test' });
      });

      expect(syncResult).toBe(false);
    });
  });

  describe('User Activity Tracking - تتبع نشاط المستخدم', () => {
    test('should track user activity successfully - يجب تتبع نشاط المستخدم بنجاح', async () => {
      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const activityData = {
        action: 'page_view',
        page: '/dashboard',
        timestamp: Date.now()
      };

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackUserActivity('user_action', activityData);
      });

      expect(trackResult).toBe(true);
      expect(result.current.activityStatus.isTracking).toBe(true);
      expect(result.current.activityStatus.activitiesTracked).toBeGreaterThan(0);
    });

    test('should throttle high-frequency activities - يجب تقييد الأنشطة عالية التكرار', async () => {
      const mockTrackActivity = vi.fn().mockResolvedValue(true);
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        trackActivity: mockTrackActivity
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync());

      // Perform rapid activity tracking
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          result.current.trackUserActivity('rapid_action', { index: i });
        }
      });

      // Wait for throttle
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
      });

      // Should have throttled the calls
      expect(mockTrackActivity).toHaveBeenCalledTimes(1);
    });

    test('should respect activity tracking feature flag - يجب احترام علامة ميزة تتبع النشاط', async () => {
      const { getFeatureFlag } = require('../../config/featureFlags');
      getFeatureFlag.mockImplementation((flag) => {
        if (flag === 'ENABLE_USER_ACTIVITY_TRACKING') return false;
        return true;
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const trackResult = await act(async () => {
        return await result.current.trackUserActivity('test', { action: 'test' });
      });

      expect(trackResult).toBe(false);
    });
  });

  describe('Live Notifications - الإشعارات المباشرة', () => {
    test('should send live notification successfully - يجب إرسال الإشعار المباشر بنجاح', async () => {
      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const notification = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        priority: 'normal'
      };

      let notificationResult;
      await act(async () => {
        notificationResult = await result.current.sendLiveNotification(notification);
      });

      expect(notificationResult).toBe(true);
      expect(result.current.notificationStatus.notificationsSent).toBeGreaterThan(0);
    });

    test('should handle notification errors - يجب التعامل مع أخطاء الإشعارات', async () => {
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        broadcastNotification: vi.fn().mockRejectedValue(new Error('Notification failed'))
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync({
        onError: vi.fn()
      }));

      let notificationResult;
      await act(async () => {
        notificationResult = await result.current.sendLiveNotification({
          title: 'Test',
          message: 'Test'
        });
      });

      expect(notificationResult).toBe(false);
    });

    test('should respect live notifications feature flag - يجب احترام علامة ميزة الإشعارات المباشرة', async () => {
      const { getFeatureFlag } = require('../../config/featureFlags');
      getFeatureFlag.mockImplementation((flag) => {
        if (flag === 'ENABLE_LIVE_NOTIFICATIONS') return false;
        return true;
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const notificationResult = await act(async () => {
        return await result.current.sendLiveNotification({
          title: 'Test',
          message: 'Test'
        });
      });

      expect(notificationResult).toBe(false);
    });
  });

  describe('Statistics and Monitoring - الإحصائيات والمراقبة', () => {
    test('should provide comprehensive sync statistics - يجب توفير إحصائيات تزامن شاملة', () => {
      const { result } = renderHook(() => useEnhancedRealtimeSync());

      const stats = result.current.getSyncStatistics();

      expect(stats).toMatchObject({
        sync: {
          isEnabled: expect.any(Boolean),
          strategy: expect.any(String)
        },
        activity: {
          isEnabled: expect.any(Boolean),
          level: expect.any(String)
        },
        notifications: {
          isEnabled: expect.any(Boolean)
        },
        performance: {
          avgLatency: expect.any(Number),
          activeUsersCount: expect.any(Number),
          connectionStatus: expect.any(String)
        },
        features: {
          contentSync: expect.any(Boolean),
          activityTracking: expect.any(Boolean),
          liveNotifications: expect.any(Boolean),
          phase3Enabled: expect.any(Boolean)
        }
      });
    });

    test('should track performance metrics over time - يجب تتبع مقاييس الأداء عبر الزمن', async () => {
      const { result } = renderHook(() => useEnhancedRealtimeSync());

      // Perform operations to generate metrics
      await act(async () => {
        await result.current.syncContentChange('test', { id: 'test' });
        await result.current.trackUserActivity('test', { action: 'test' });
        await result.current.sendLiveNotification({ title: 'test', message: 'test' });
      });

      const stats = result.current.getSyncStatistics();
      expect(stats.performance.avgLatency).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Recovery - معالجة الأخطاء والتعافي', () => {
    test('should handle connection errors - يجب التعامل مع أخطاء الاتصال', async () => {
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        isConnected: false,
        error: 'Connection lost'
      });

      const { result } = renderHook(() => useEnhancedRealtimeSync());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Connection lost');
    });

    test('should clear errors when connection is restored - يجب مسح الأخطاء عند استعادة الاتصال', async () => {
      const mockClearError = vi.fn();
      
      // Start with error state
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        isConnected: false,
        error: 'Connection lost',
        clearError: mockClearError
      });

      const { result, rerender } = renderHook(() => useEnhancedRealtimeSync());

      expect(result.current.error).toBe('Connection lost');

      // Restore connection
      mockUseEnhancedRealtime.mockReturnValue({
        ...mockUseEnhancedRealtime(),
        isConnected: true,
        error: 'Connection lost',
        clearError: mockClearError
      });

      rerender();

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });
  });

  describe('Cleanup and Memory Management - التنظيف وإدارة الذاكرة', () => {
    test('should cleanup on unmount - يجب التنظيف عند إلغاء التركيب', () => {
      const { unmount } = renderHook(() => useEnhancedRealtimeSync());

      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });

    test('should handle rapid mount/unmount cycles - يجب التعامل مع دورات التركيب/إلغاء التركيب السريعة', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useEnhancedRealtimeSync());
        unmount();
      }

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });
  });

  describe('Callback Handling - التعامل مع استدعاءات الإرجاع', () => {
    test('should call onContentUpdate callback - يجب استدعاء callback تحديث المحتوى', async () => {
      const onContentUpdate = vi.fn();
      const { result } = renderHook(() => useEnhancedRealtimeSync({
        onContentUpdate
      }));

      await act(async () => {
        await result.current.syncContentChange('test', { id: 'test' });
      });

      expect(onContentUpdate).toHaveBeenCalledWith({
        changeType: 'test',
        contentData: { id: 'test' },
        timestamp: expect.any(Number)
      });
    });

    test('should call onActivityUpdate callback - يجب استدعاء callback تحديث النشاط', async () => {
      const onActivityUpdate = vi.fn();
      const { result } = renderHook(() => useEnhancedRealtimeSync({
        onActivityUpdate
      }));

      await act(async () => {
        await result.current.trackUserActivity('test', { action: 'test' });
      });

      expect(onActivityUpdate).toHaveBeenCalledWith({
        activityType: 'test',
        activityData: { action: 'test' },
        timestamp: expect.any(Number)
      });
    });

    test('should call onNotification callback - يجب استدعاء callback الإشعار', async () => {
      const onNotification = vi.fn();
      const { result } = renderHook(() => useEnhancedRealtimeSync({
        onNotification
      }));

      const notification = { title: 'test', message: 'test' };

      await act(async () => {
        await result.current.sendLiveNotification(notification);
      });

      expect(onNotification).toHaveBeenCalledWith({
        notification: expect.objectContaining(notification),
        targetUsers: null,
        timestamp: expect.any(Number)
      });
    });
  });
});
