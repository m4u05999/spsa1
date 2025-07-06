// src/components/common/SyncStatusIndicator.jsx
/**
 * Sync Status Indicator Component - Phase 5
 * مكون مؤشر حالة المزامنة - المرحلة الخامسة
 * 
 * Features:
 * - Real-time sync status display
 * - Visual indicators for connection state
 * - Performance metrics display
 * - Error state handling
 * - PDPL-compliant status reporting
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import { ENV } from '../../config/environment.js';

/**
 * Sync Status Indicator Component
 */
const SyncStatusIndicator = ({ 
  showDetails = false, 
  position = 'bottom-right',
  className = '',
  onStatusClick = null 
}) => {
  const {
    isConnected,
    syncStatus,
    lastUpdate,
    error,
    isRealtimeEnabled,
    getSyncStatus,
    refreshSync,
    clearError
  } = useRealtimeSync({
    autoConnect: true,
    debounceMs: 200
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  /**
   * Update last update time when new update arrives
   */
  useEffect(() => {
    if (lastUpdate) {
      setLastUpdateTime(new Date(lastUpdate.timestamp));
    }
  }, [lastUpdate]);

  /**
   * Auto-refresh status periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      getSyncStatus();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [getSyncStatus]);

  /**
   * Don't render if real-time features are disabled
   */
  if (!isRealtimeEnabled) {
    return null;
  }

  /**
   * Get status color based on connection state
   */
  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (!isConnected) return 'text-yellow-500';
    if (syncStatus?.circuitBreaker?.isOpen) return 'text-orange-500';
    return 'text-green-500';
  };

  /**
   * Get status icon based on connection state
   */
  const getStatusIcon = () => {
    if (error) return '❌';
    if (!isConnected) return '⚠️';
    if (syncStatus?.circuitBreaker?.isOpen) return '🔄';
    return '✅';
  };

  /**
   * Get status text
   */
  const getStatusText = () => {
    if (error) return 'خطأ في المزامنة';
    if (!isConnected) return 'غير متصل';
    if (syncStatus?.circuitBreaker?.isOpen) return 'إعادة الاتصال';
    return 'متصل';
  };

  /**
   * Get sync strategy display text
   */
  const getSyncStrategyText = () => {
    if (!syncStatus?.strategy) return 'غير محدد';
    
    const strategies = {
      immediate: 'فوري',
      batched: 'مجمع',
      polling: 'استطلاع',
      hybrid: 'مختلط'
    };

    return strategies[syncStatus.strategy] || syncStatus.strategy;
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (date) => {
    if (!date) return 'لم يحدث';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `منذ ${diffSecs} ثانية`;
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return date.toLocaleDateString('ar-SA');
  };

  /**
   * Handle status click
   */
  const handleStatusClick = () => {
    if (onStatusClick) {
      onStatusClick(syncStatus);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  /**
   * Handle refresh click
   */
  const handleRefreshClick = async (e) => {
    e.stopPropagation();
    await refreshSync();
  };

  /**
   * Handle error clear
   */
  const handleErrorClear = (e) => {
    e.stopPropagation();
    clearError();
  };

  /**
   * Position classes
   */
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      dir="rtl"
    >
      {/* Main Status Indicator */}
      <div
        className={`
          bg-white border border-gray-200 rounded-lg shadow-lg p-3 cursor-pointer
          transition-all duration-200 hover:shadow-xl
          ${isExpanded ? 'rounded-b-none' : ''}
        `}
        onClick={handleStatusClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          
          {/* Last update indicator */}
          {lastUpdateTime && (
            <span className="text-xs text-gray-500">
              {formatTimeAgo(lastUpdateTime)}
            </span>
          )}

          {/* Expand/collapse arrow */}
          {showDetails && (
            <span className="text-gray-400 text-xs">
              {isExpanded ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && isExpanded && (
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg p-4 min-w-64">
          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <div className="flex items-center justify-between">
                <span className="text-red-800 font-medium">خطأ:</span>
                <button
                  onClick={handleErrorClear}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-red-700 mt-1">{error.message}</p>
            </div>
          )}

          {/* Sync Status Details */}
          {syncStatus && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">الاستراتيجية:</span>
                <span className="font-medium">{getSyncStrategyText()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">المزامنات الناجحة:</span>
                <span className="font-medium text-green-600">
                  {syncStatus.metrics?.successfulSyncs || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">المزامنات الفاشلة:</span>
                <span className="font-medium text-red-600">
                  {syncStatus.metrics?.failedSyncs || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">متوسط الزمن:</span>
                <span className="font-medium">
                  {syncStatus.metrics?.averageLatency 
                    ? `${Math.round(syncStatus.metrics.averageLatency)}ms`
                    : 'غير متاح'
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">حجم الطابور:</span>
                <span className="font-medium">
                  {syncStatus.queueSize || 0}
                </span>
              </div>

              {/* Circuit Breaker Status */}
              {syncStatus.circuitBreaker && (
                <div className="flex justify-between">
                  <span className="text-gray-600">قاطع الدائرة:</span>
                  <span className={`font-medium ${
                    syncStatus.circuitBreaker.isOpen ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {syncStatus.circuitBreaker.isOpen ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>
              )}

              {/* Last Sync Time */}
              {syncStatus.lastSync && (
                <div className="flex justify-between">
                  <span className="text-gray-600">آخر مزامنة:</span>
                  <span className="font-medium">
                    {formatTimeAgo(new Date(syncStatus.lastSync))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleRefreshClick}
              className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              تحديث
            </button>
            
            {ENV.IS_DEVELOPMENT && (
              <button
                onClick={() => console.log('Sync Status:', syncStatus)}
                className="flex-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                تصدير
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Sync Status Badge
 */
export const SyncStatusBadge = ({ className = '' }) => {
  const { isConnected, error, isRealtimeEnabled } = useRealtimeSync({
    autoConnect: true
  });

  if (!isRealtimeEnabled) return null;

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (!isConnected) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600">
        {error ? 'خطأ' : isConnected ? 'متصل' : 'غير متصل'}
      </span>
    </div>
  );
};

export default SyncStatusIndicator;
