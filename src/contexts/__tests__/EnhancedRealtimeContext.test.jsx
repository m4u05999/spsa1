/**
 * Enhanced Realtime Context Tests for Phase 3
 * اختبارات سياق الميزات الفورية المحسنة للمرحلة 3
 * 
 * Comprehensive tests for enhanced real-time context
 * including state management and provider functionality
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  EnhancedRealtimeProvider, 
  useEnhancedRealtime,
  ENHANCED_REALTIME_ACTIONS 
} from '../EnhancedRealtimeContext';

// Mock dependencies
vi.mock('../../services/realtime/enhancedRealtimeService', () => ({
  enhancedRealtimeService: {
    initialize: vi.fn().mockResolvedValue(true),
    isInitialized: vi.fn().mockReturnValue(true),
    isConnected: vi.fn().mockReturnValue(true),
    syncContentChange: vi.fn().mockResolvedValue(true),
    trackUserActivity: vi.fn().mockResolvedValue(true),
    broadcastLiveNotification: vi.fn().mockResolvedValue(true),
    getMetrics: vi.fn().mockReturnValue({
      contentSyncCount: 0,
      activityCount: 0,
      notificationCount: 0,
      avgLatency: 100,
      errorCount: 0,
      memoryUsage: 1024 * 1024
    }),
    setContentSyncStrategy: vi.fn(),
    setActivityTrackingLevel: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    cleanup: vi.fn()
  },
  CONTENT_SYNC_STRATEGIES: {
    IMMEDIATE: 'immediate',
    BATCHED: 'batched',
    SCHEDULED: 'scheduled',
    ON_DEMAND: 'on_demand'
  },
  USER_ACTIVITY_LEVELS: {
    MINIMAL: 'minimal',
    STANDARD: 'standard',
    DETAILED: 'detailed',
    ANALYTICS: 'analytics'
  },
  ACTIVITY_TRACKING_LEVELS: {
    MINIMAL: 'minimal',
    STANDARD: 'standard',
    DETAILED: 'detailed',
    ANALYTICS: 'analytics'
  }
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

vi.mock('../../utils/monitoring', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarning: vi.fn()
}));

// Test component to access context
const TestComponent = ({ onContextValue = null }) => {
  const contextValue = useEnhancedRealtime();
  
  React.useEffect(() => {
    if (onContextValue) {
      onContextValue(contextValue);
    }
  }, [contextValue, onContextValue]);

  return (
    <div>
      <div data-testid="connection-status">
        {contextValue.isConnected ? 'متصل' : 'غير متصل'}
      </div>
      <div data-testid="initialization-status">
        {contextValue.isInitialized ? 'مهيأ' : 'غير مهيأ'}
      </div>
      <div data-testid="error-status">
        {contextValue.error || 'لا توجد أخطاء'}
      </div>
      <div data-testid="content-sync-count">
        {contextValue.contentSyncHistory.length}
      </div>
      <div data-testid="activity-count">
        {contextValue.userActivityHistory.length}
      </div>
      <div data-testid="notification-count">
        {contextValue.liveNotifications.length}
      </div>
      <div data-testid="unread-count">
        {contextValue.unreadNotificationCount}
      </div>
    </div>
  );
};

describe('Enhanced Realtime Context - سياق الميزات الفورية المحسنة', () => {
  let mockContextValue;

  const renderWithProvider = (children, providerProps = {}) => {
    return render(
      <EnhancedRealtimeProvider {...providerProps}>
        {children}
      </EnhancedRealtimeProvider>
    );
  };

  beforeEach(() => {
    mockContextValue = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Initialization - تهيئة المزود', () => {
    test('should initialize provider with default state - يجب تهيئة المزود بالحالة الافتراضية', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.isInitialized).toBe(true);
        expect(mockContextValue.isConnected).toBe(true);
        expect(mockContextValue.error).toBeNull();
      });

      expect(screen.getByTestId('connection-status')).toHaveTextContent('متصل');
      expect(screen.getByTestId('initialization-status')).toHaveTextContent('مهيأ');
      expect(screen.getByTestId('error-status')).toHaveTextContent('لا توجد أخطاء');
    });

    test('should handle initialization failure - يجب التعامل مع فشل التهيئة', async () => {
      const { enhancedRealtimeService } = require('../../services/realtime/enhancedRealtimeService');
      enhancedRealtimeService.initialize.mockRejectedValue(new Error('Initialization failed'));

      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.error).toBeTruthy();
      });

      expect(screen.getByTestId('error-status')).not.toHaveTextContent('لا توجد أخطاء');
    });

    test('should not initialize when Phase 3 is disabled - يجب عدم التهيئة عند تعطيل المرحلة 3', async () => {
      const { getFeatureFlag } = require('../../config/featureFlags');
      getFeatureFlag.mockReturnValue(false);

      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.isInitialized).toBe(false);
      });

      expect(screen.getByTestId('initialization-status')).toHaveTextContent('غير مهيأ');
    });
  });

  describe('Content Synchronization - تزامن المحتوى', () => {
    test('should sync content and update history - يجب تزامن المحتوى وتحديث التاريخ', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.syncContent).toBeDefined();
      });

      const contentData = {
        id: 'content_123',
        title: 'Test Content',
        type: 'article'
      };

      await act(async () => {
        await mockContextValue.syncContent('content_updated', contentData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('content-sync-count')).toHaveTextContent('1');
      });

      expect(mockContextValue.contentSyncHistory).toHaveLength(1);
      expect(mockContextValue.contentSyncHistory[0]).toMatchObject({
        changeType: 'content_updated',
        contentData,
        timestamp: expect.any(Number)
      });
    });

    test('should handle content sync errors - يجب التعامل مع أخطاء تزامن المحتوى', async () => {
      const { enhancedRealtimeService } = require('../../services/realtime/enhancedRealtimeService');
      enhancedRealtimeService.syncContentChange.mockRejectedValue(new Error('Sync failed'));

      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      await act(async () => {
        try {
          await mockContextValue.syncContent('content_updated', { id: 'test' });
        } catch (error) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(mockContextValue.error).toBeTruthy();
      });
    });

    test('should update content sync strategy - يجب تحديث استراتيجية تزامن المحتوى', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.setContentSyncStrategy).toBeDefined();
      });

      await act(async () => {
        mockContextValue.setContentSyncStrategy('batched');
      });

      expect(mockContextValue.contentSyncStrategy).toBe('batched');
    });
  });

  describe('User Activity Tracking - تتبع نشاط المستخدم', () => {
    test('should track user activity and update history - يجب تتبع نشاط المستخدم وتحديث التاريخ', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.trackActivity).toBeDefined();
      });

      const activityData = {
        action: 'page_view',
        page: '/dashboard',
        timestamp: Date.now()
      };

      await act(async () => {
        await mockContextValue.trackActivity('user_action', activityData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('activity-count')).toHaveTextContent('1');
      });

      expect(mockContextValue.userActivityHistory).toHaveLength(1);
      expect(mockContextValue.userActivityHistory[0]).toMatchObject({
        activityType: 'user_action',
        activityData,
        timestamp: expect.any(Number)
      });
    });

    test('should update activity tracking level - يجب تحديث مستوى تتبع النشاط', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.setActivityTrackingLevel).toBeDefined();
      });

      await act(async () => {
        mockContextValue.setActivityTrackingLevel('detailed');
      });

      expect(mockContextValue.activityTrackingLevel).toBe('detailed');
    });

    test('should limit activity history size - يجب تحديد حجم تاريخ النشاط', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      // Add multiple activities
      for (let i = 0; i < 15; i++) {
        await act(async () => {
          await mockContextValue.trackActivity('test_action', { index: i });
        });
      }

      await waitFor(() => {
        // Should limit to 10 activities (default max)
        expect(mockContextValue.userActivityHistory.length).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Live Notifications - الإشعارات المباشرة', () => {
    test('should broadcast notification and update state - يجب بث الإشعار وتحديث الحالة', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.broadcastNotification).toBeDefined();
      });

      const notification = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        priority: 'normal'
      };

      await act(async () => {
        await mockContextValue.broadcastNotification(notification);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
        expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
      });

      expect(mockContextValue.liveNotifications).toHaveLength(1);
      expect(mockContextValue.liveNotifications[0]).toMatchObject({
        ...notification,
        id: expect.any(String),
        timestamp: expect.any(Number),
        read: false
      });
    });

    test('should mark notification as read - يجب وضع علامة مقروء على الإشعار', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      // Add notification
      const notification = {
        title: 'Test Notification',
        message: 'Test message',
        type: 'info'
      };

      await act(async () => {
        await mockContextValue.broadcastNotification(notification);
      });

      const notificationId = mockContextValue.liveNotifications[0].id;

      // Mark as read
      await act(async () => {
        mockContextValue.markNotificationAsRead(notificationId);
      });

      await waitFor(() => {
        expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      });

      expect(mockContextValue.liveNotifications[0].read).toBe(true);
    });

    test('should remove notification - يجب إزالة الإشعار', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      // Add notification
      await act(async () => {
        await mockContextValue.broadcastNotification({
          title: 'Test',
          message: 'Test',
          type: 'info'
        });
      });

      const notificationId = mockContextValue.liveNotifications[0].id;

      // Remove notification
      await act(async () => {
        mockContextValue.removeNotification(notificationId);
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
      });

      expect(mockContextValue.liveNotifications).toHaveLength(0);
    });

    test('should clear all notifications - يجب مسح جميع الإشعارات', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      // Add multiple notifications
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await mockContextValue.broadcastNotification({
            title: `Test ${i}`,
            message: `Test message ${i}`,
            type: 'info'
          });
        });
      }

      // Clear all
      await act(async () => {
        mockContextValue.clearAllNotifications();
      });

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
        expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      });

      expect(mockContextValue.liveNotifications).toHaveLength(0);
    });
  });

  describe('Performance Metrics - مقاييس الأداء', () => {
    test('should update performance metrics - يجب تحديث مقاييس الأداء', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.performanceMetrics).toBeDefined();
      });

      expect(mockContextValue.performanceMetrics).toMatchObject({
        avgLatency: expect.any(Number),
        messageCount: expect.any(Number),
        errorCount: expect.any(Number),
        memoryUsage: expect.any(Number)
      });
    });

    test('should track active users - يجب تتبع المستخدمين النشطين', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
        expect(mockContextValue.activeUsers).toBeDefined();
      });

      // Add active user
      await act(async () => {
        mockContextValue.addActiveUser({
          id: 'user_123',
          lastActivity: Date.now(),
          currentPage: '/dashboard'
        });
      });

      expect(mockContextValue.activeUsers.size).toBe(1);
    });
  });

  describe('Error Handling - معالجة الأخطاء', () => {
    test('should handle and clear errors - يجب التعامل مع الأخطاء ومسحها', async () => {
      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      // Set error
      await act(async () => {
        mockContextValue.setError('Test error message');
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-status')).toHaveTextContent('Test error message');
      });

      // Clear error
      await act(async () => {
        mockContextValue.clearError();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-status')).toHaveTextContent('لا توجد أخطاء');
      });

      expect(mockContextValue.error).toBeNull();
    });
  });

  describe('Context Provider Props - خصائص مزود السياق', () => {
    test('should accept custom configuration - يجب قبول الإعدادات المخصصة', async () => {
      const customConfig = {
        maxContentSyncHistory: 5,
        maxActivityHistory: 5,
        maxNotifications: 3
      };

      renderWithProvider(
        <TestComponent onContextValue={(value) => { mockContextValue = value; }} />,
        customConfig
      );

      await waitFor(() => {
        expect(mockContextValue).toBeTruthy();
      });

      // Add items beyond limits
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await mockContextValue.syncContent('test', { id: i });
          await mockContextValue.trackActivity('test', { index: i });
          await mockContextValue.broadcastNotification({
            title: `Test ${i}`,
            message: `Message ${i}`,
            type: 'info'
          });
        });
      }

      await waitFor(() => {
        expect(mockContextValue.contentSyncHistory.length).toBeLessThanOrEqual(5);
        expect(mockContextValue.userActivityHistory.length).toBeLessThanOrEqual(5);
        expect(mockContextValue.liveNotifications.length).toBeLessThanOrEqual(3);
      });
    });
  });
});
