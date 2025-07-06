/**
 * Live Content Sync Component for Phase 3
 * مكون تزامن المحتوى المباشر للمرحلة 3
 * 
 * Provides real-time content synchronization between admin dashboard and public pages
 * with enhanced performance monitoring and PDPL compliance
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useEnhancedRealtimeSync } from '../../hooks/useEnhancedRealtimeSync';
import { getFeatureFlag } from '../../config/featureFlags';
import { CONTENT_SYNC_STRATEGIES } from '../../services/realtime/enhancedRealtimeService';
import { useErrorMessages } from '../../hooks/useErrorMessages';
import { OptimizedLoader } from '../common/OptimizedLoader';

/**
 * Live Content Sync Component
 * مكون تزامن المحتوى المباشر
 */
const LiveContentSync = memo(({ 
  contentId,
  contentType = 'general',
  autoSync = true,
  syncStrategy = CONTENT_SYNC_STRATEGIES.IMMEDIATE,
  showStatus = true,
  showMetrics = false,
  onContentUpdate = null,
  onSyncError = null,
  className = ''
}) => {
  const { getErrorMessage } = useErrorMessages();
  
  // Enhanced real-time sync hook
  const {
    isConnected,
    syncContentChange,
    syncStatus,
    performanceMetrics,
    getSyncStatistics,
    features
  } = useEnhancedRealtimeSync({
    autoConnect: true,
    syncStrategy,
    enableContentSync: true,
    onContentUpdate: (data) => {
      if (onContentUpdate) {
        onContentUpdate(data);
      }
      setLastUpdate(data);
    },
    onError: (error) => {
      if (onSyncError) {
        onSyncError(error);
      }
      setError(error);
    }
  });

  // Local state
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  /**
   * Handle content change and sync
   * التعامل مع تغيير المحتوى والتزامن
   */
  const handleContentChange = useCallback(async (changeType, contentData) => {
    if (!features.contentSyncEnabled) {
      console.warn('Content sync is disabled');
      return false;
    }

    try {
      setError(null);
      
      const success = await syncContentChange(changeType, contentData, {
        contentId,
        contentType,
        source: 'live_content_sync',
        timestamp: Date.now()
      });

      if (success) {
        // Add to sync history
        setSyncHistory(prev => [
          {
            id: `sync_${Date.now()}`,
            changeType,
            contentId,
            contentType,
            timestamp: Date.now(),
            status: 'success'
          },
          ...prev.slice(0, 9) // Keep last 10 sync operations
        ]);
      }

      return success;

    } catch (error) {
      const errorMessage = getErrorMessage('SYNC_FAILED', 'فشل في تزامن المحتوى');
      setError(errorMessage);
      
      // Add failed sync to history
      setSyncHistory(prev => [
        {
          id: `sync_${Date.now()}`,
          changeType,
          contentId,
          contentType,
          timestamp: Date.now(),
          status: 'failed',
          error: errorMessage
        },
        ...prev.slice(0, 9)
      ]);

      return false;
    }
  }, [
    syncContentChange,
    contentId,
    contentType,
    features.contentSyncEnabled,
    getErrorMessage
  ]);

  /**
   * Manual sync trigger
   * تشغيل التزامن اليدوي
   */
  const triggerManualSync = useCallback(async () => {
    if (!features.contentSyncEnabled || isManualSyncing) {
      return;
    }

    try {
      setIsManualSyncing(true);
      setError(null);

      const success = await handleContentChange('manual_sync', {
        id: contentId,
        type: contentType,
        action: 'manual_refresh'
      });

      if (!success) {
        throw new Error('Manual sync failed');
      }

    } catch (error) {
      setError(getErrorMessage('MANUAL_SYNC_FAILED', 'فشل في التزامن اليدوي'));
    } finally {
      setIsManualSyncing(false);
    }
  }, [
    handleContentChange,
    contentId,
    contentType,
    features.contentSyncEnabled,
    isManualSyncing,
    getErrorMessage
  ]);

  /**
   * Clear sync history
   * مسح تاريخ التزامن
   */
  const clearSyncHistory = useCallback(() => {
    setSyncHistory([]);
    setError(null);
  }, []);

  /**
   * Get sync status display
   * الحصول على عرض حالة التزامن
   */
  const getSyncStatusDisplay = useCallback(() => {
    if (!features.contentSyncEnabled) {
      return {
        status: 'disabled',
        message: 'تزامن المحتوى معطل',
        color: 'text-gray-500',
        icon: '⚪'
      };
    }

    if (!isConnected) {
      return {
        status: 'disconnected',
        message: 'غير متصل',
        color: 'text-red-500',
        icon: '🔴'
      };
    }

    if (syncStatus.pendingOperations > 0 || isManualSyncing) {
      return {
        status: 'syncing',
        message: 'جاري التزامن...',
        color: 'text-yellow-500',
        icon: '🟡'
      };
    }

    if (syncStatus.syncErrors > 0) {
      return {
        status: 'error',
        message: `أخطاء في التزامن: ${syncStatus.syncErrors}`,
        color: 'text-red-500',
        icon: '🔴'
      };
    }

    if (syncStatus.isActive && syncStatus.lastSync) {
      const timeSinceSync = Date.now() - syncStatus.lastSync;
      const minutes = Math.floor(timeSinceSync / 60000);
      
      return {
        status: 'active',
        message: minutes === 0 ? 'متزامن الآن' : `آخر تزامن: ${minutes} دقيقة`,
        color: 'text-green-500',
        icon: '🟢'
      };
    }

    return {
      status: 'ready',
      message: 'جاهز للتزامن',
      color: 'text-blue-500',
      icon: '🔵'
    };
  }, [
    features.contentSyncEnabled,
    isConnected,
    syncStatus,
    isManualSyncing
  ]);

  // Auto-sync setup
  useEffect(() => {
    if (autoSync && features.contentSyncEnabled && contentId) {
      // Set up content change listeners
      const handleContentUpdate = (event) => {
        if (event.detail?.contentId === contentId) {
          handleContentChange('external_update', event.detail);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('contentUpdate', handleContentUpdate);
        
        return () => {
          window.removeEventListener('contentUpdate', handleContentUpdate);
        };
      }
    }
  }, [autoSync, features.contentSyncEnabled, contentId, handleContentChange]);

  // Don't render if Phase 3 real-time features are disabled
  if (!getFeatureFlag('ENABLE_PHASE3_REALTIME') || !features.contentSyncEnabled) {
    return null;
  }

  const statusDisplay = getSyncStatusDisplay();
  const stats = getSyncStatistics();

  return (
    <div className={`live-content-sync ${className}`}>
      {/* Sync Status Display */}
      {showStatus && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-lg">{statusDisplay.icon}</span>
            <div>
              <p className={`text-sm font-medium ${statusDisplay.color}`}>
                {statusDisplay.message}
              </p>
              {contentId && (
                <p className="text-xs text-gray-500">
                  المحتوى: {contentId} ({contentType})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Manual Sync Button */}
            <button
              onClick={triggerManualSync}
              disabled={!features.contentSyncEnabled || isManualSyncing || !isConnected}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="تزامن يدوي"
            >
              {isManualSyncing ? (
                <OptimizedLoader type="inline" size="sm" />
              ) : (
                '🔄'
              )}
            </button>

            {/* Clear History Button */}
            {syncHistory.length > 0 && (
              <button
                onClick={clearSyncHistory}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                title="مسح التاريخ"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 ml-2">⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {showMetrics && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">مقاييس الأداء</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-blue-600">زمن التزامن:</span>
              <span className="font-mono ml-1">{stats.performance.avgLatency}ms</span>
            </div>
            <div>
              <span className="text-blue-600">العمليات المعلقة:</span>
              <span className="font-mono ml-1">{syncStatus.pendingOperations}</span>
            </div>
            <div>
              <span className="text-blue-600">المستخدمون النشطون:</span>
              <span className="font-mono ml-1">{stats.performance.activeUsersCount}</span>
            </div>
            <div>
              <span className="text-blue-600">الرسائل:</span>
              <span className="font-mono ml-1">{stats.performance.messageCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="mt-3">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              تاريخ التزامن ({syncHistory.length})
            </summary>
            <div className="mt-2 space-y-1">
              {syncHistory.map((sync) => (
                <div
                  key={sync.id}
                  className={`p-2 rounded text-xs ${
                    sync.status === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {sync.changeType} - {sync.contentType}
                    </span>
                    <span className="font-mono">
                      {new Date(sync.timestamp).toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                  {sync.error && (
                    <p className="mt-1 text-red-600">{sync.error}</p>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <p className="text-green-700">
            آخر تحديث: {lastUpdate.changeType} في{' '}
            {new Date(lastUpdate.timestamp).toLocaleTimeString('ar-SA')}
          </p>
        </div>
      )}
    </div>
  );
});

LiveContentSync.displayName = 'LiveContentSync';

export default LiveContentSync;
