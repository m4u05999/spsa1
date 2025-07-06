/**
 * Realtime Performance Monitor Component for Phase 3
 * مكون مراقبة أداء الميزات الفورية للمرحلة 3
 * 
 * Provides real-time performance monitoring and metrics display
 * with enhanced analytics and PDPL compliance
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useEnhancedRealtimeSync } from '../../hooks/useEnhancedRealtimeSync';
import { getFeatureFlag } from '../../config/featureFlags';
import { useErrorMessages } from '../../hooks/useErrorMessages';

/**
 * Realtime Performance Monitor Component
 * مكون مراقبة أداء الميزات الفورية
 */
const RealtimePerformanceMonitor = memo(({ 
  showDetailedMetrics = false,
  showCharts = false,
  updateInterval = 5000,
  maxDataPoints = 20,
  onPerformanceAlert = null,
  className = ''
}) => {
  const { getErrorMessage } = useErrorMessages();
  
  // Enhanced real-time sync hook
  const {
    isConnected,
    performanceMetrics,
    getSyncStatistics,
    features
  } = useEnhancedRealtimeSync({
    autoConnect: true,
    enableContentSync: true,
    enableActivityTracking: true,
    enableLiveNotifications: true
  });

  // Local state
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(100);

  /**
   * Calculate performance score
   * حساب نقاط الأداء
   */
  const calculatePerformanceScore = useCallback((metrics) => {
    let score = 100;
    
    // Latency impact (0-40 points)
    if (metrics.avgLatency > 2000) {
      score -= 40;
    } else if (metrics.avgLatency > 1000) {
      score -= 20;
    } else if (metrics.avgLatency > 500) {
      score -= 10;
    }
    
    // Error rate impact (0-30 points)
    const errorRate = metrics.errorCount / Math.max(metrics.messageCount, 1);
    if (errorRate > 0.1) {
      score -= 30;
    } else if (errorRate > 0.05) {
      score -= 15;
    } else if (errorRate > 0.01) {
      score -= 5;
    }
    
    // Connection stability impact (0-20 points)
    if (!isConnected) {
      score -= 20;
    }
    
    // Memory usage impact (0-10 points)
    if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
      score -= 10;
    } else if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }, [isConnected]);

  /**
   * Check for performance alerts
   * فحص تنبيهات الأداء
   */
  const checkPerformanceAlerts = useCallback((metrics, score) => {
    const newAlerts = [];
    
    // High latency alert
    if (metrics.avgLatency > 2000) {
      newAlerts.push({
        id: 'high_latency',
        type: 'warning',
        message: `زمن الاستجابة مرتفع: ${metrics.avgLatency}ms`,
        severity: 'high',
        timestamp: Date.now()
      });
    }
    
    // High error rate alert
    const errorRate = metrics.errorCount / Math.max(metrics.messageCount, 1);
    if (errorRate > 0.05) {
      newAlerts.push({
        id: 'high_error_rate',
        type: 'error',
        message: `معدل أخطاء مرتفع: ${(errorRate * 100).toFixed(1)}%`,
        severity: 'high',
        timestamp: Date.now()
      });
    }
    
    // Low performance score alert
    if (score < 70) {
      newAlerts.push({
        id: 'low_performance',
        type: 'warning',
        message: `نقاط الأداء منخفضة: ${score}/100`,
        severity: score < 50 ? 'high' : 'medium',
        timestamp: Date.now()
      });
    }
    
    // Connection issues alert
    if (!isConnected) {
      newAlerts.push({
        id: 'connection_lost',
        type: 'error',
        message: 'فقدان الاتصال بالخادم',
        severity: 'high',
        timestamp: Date.now()
      });
    }
    
    // Update alerts
    setAlerts(prev => {
      const existingIds = new Set(prev.map(alert => alert.id));
      const filteredNew = newAlerts.filter(alert => !existingIds.has(alert.id));
      return [...prev, ...filteredNew].slice(-10); // Keep last 10 alerts
    });
    
    // Trigger callback if provided
    if (onPerformanceAlert && newAlerts.length > 0) {
      newAlerts.forEach(alert => onPerformanceAlert(alert));
    }
  }, [isConnected, onPerformanceAlert]);

  /**
   * Update metrics and history
   * تحديث المقاييس والتاريخ
   */
  const updateMetrics = useCallback(() => {
    if (!isMonitoring) return;
    
    const stats = getSyncStatistics();
    const currentMetrics = {
      ...stats.performance,
      timestamp: Date.now(),
      connectionStatus: isConnected ? 'connected' : 'disconnected',
      activeUsers: stats.performance.activeUsersCount,
      syncErrors: stats.sync.syncErrors,
      activityCount: stats.activity.activitiesTracked
    };
    
    // Calculate performance score
    const score = calculatePerformanceScore(currentMetrics);
    setPerformanceScore(score);
    
    // Check for alerts
    checkPerformanceAlerts(currentMetrics, score);
    
    // Update metrics history
    setMetricsHistory(prev => [
      currentMetrics,
      ...prev.slice(0, maxDataPoints - 1)
    ]);
    
  }, [
    isMonitoring,
    getSyncStatistics,
    isConnected,
    calculatePerformanceScore,
    checkPerformanceAlerts,
    maxDataPoints
  ]);

  /**
   * Get performance status color
   * الحصول على لون حالة الأداء
   */
  const getPerformanceStatusColor = useCallback((score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  /**
   * Get alert severity styling
   * الحصول على تنسيق شدة التنبيه
   */
  const getAlertStyling = useCallback((severity) => {
    const styles = {
      high: 'bg-red-100 border-red-300 text-red-800',
      medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      low: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    return styles[severity] || styles.low;
  }, []);

  /**
   * Format bytes to human readable
   * تنسيق البايتات لقراءة بشرية
   */
  const formatBytes = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * Clear alerts
   * مسح التنبيهات
   */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  /**
   * Toggle monitoring
   * تبديل المراقبة
   */
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  // Start/stop monitoring based on connection and feature flags
  useEffect(() => {
    if (features.phase3Enabled && isConnected) {
      setIsMonitoring(true);
    } else {
      setIsMonitoring(false);
    }
  }, [features.phase3Enabled, isConnected]);

  // Set up metrics update interval
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(updateMetrics, updateInterval);
    
    // Initial update
    updateMetrics();
    
    return () => clearInterval(interval);
  }, [isMonitoring, updateInterval, updateMetrics]);

  // Don't render if Phase 3 real-time features are disabled
  if (!getFeatureFlag('ENABLE_PHASE3_REALTIME')) {
    return null;
  }

  const stats = getSyncStatistics();
  const latestMetrics = metricsHistory[0] || stats.performance;

  return (
    <div className={`realtime-performance-monitor ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          مراقب الأداء الفوري
        </h3>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className={`text-2xl font-bold ${getPerformanceStatusColor(performanceScore)}`}>
            {performanceScore}/100
          </div>
          <button
            onClick={toggleMonitoring}
            className={`px-3 py-1 text-xs rounded ${
              isMonitoring 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isMonitoring ? 'إيقاف' : 'تشغيل'}
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">زمن الاستجابة</div>
          <div className="text-lg font-semibold text-blue-800">
            {latestMetrics.avgLatency || 0}ms
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600 mb-1">الرسائل</div>
          <div className="text-lg font-semibold text-green-800">
            {latestMetrics.messageCount || 0}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-xs text-yellow-600 mb-1">الأخطاء</div>
          <div className="text-lg font-semibold text-yellow-800">
            {latestMetrics.errorCount || 0}
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-xs text-purple-600 mb-1">المستخدمون</div>
          <div className="text-lg font-semibold text-purple-800">
            {stats.performance.activeUsersCount || 0}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetailedMetrics && (
        <div className="p-4 border-t">
          <h4 className="text-sm font-medium text-gray-800 mb-3">مقاييس تفصيلية</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">استخدام الذاكرة:</span>
                <span className="font-mono">{formatBytes(latestMetrics.memoryUsage || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عمليات التزامن:</span>
                <span className="font-mono">{stats.sync.pendingOperations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">أخطاء التزامن:</span>
                <span className="font-mono">{stats.sync.syncErrors || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">الأنشطة المتتبعة:</span>
                <span className="font-mono">{stats.activity.activitiesTracked || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الإشعارات المرسلة:</span>
                <span className="font-mono">{stats.notifications.notificationsSent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الاتصال:</span>
                <span className={`font-mono ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'متصل' : 'غير متصل'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-800">تنبيهات الأداء</h4>
            <button
              onClick={clearAlerts}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              مسح الكل
            </button>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={`${alert.id}_${alert.timestamp}`}
                className={`p-2 border rounded text-xs ${getAlertStyling(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <span className="font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
          </span>
          <span>
            المراقبة: {isMonitoring ? '🟢 نشطة' : '🔴 متوقفة'}
          </span>
        </div>
      </div>
    </div>
  );
});

RealtimePerformanceMonitor.displayName = 'RealtimePerformanceMonitor';

export default RealtimePerformanceMonitor;
