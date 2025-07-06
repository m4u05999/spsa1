// src/components/admin/RealtimeSyncTest.jsx
/**
 * Real-time Sync Test Component - Phase 5
 * مكون اختبار المزامنة الفورية - المرحلة الخامسة
 * 
 * Features:
 * - Test real-time synchronization functionality
 * - Monitor sync performance and metrics
 * - Debug sync issues in development
 * - PDPL-compliant testing interface
 */

import React, { useState, useEffect } from 'react';
import { useContentSync } from '../../hooks/useRealtimeSync.js';
import { useContent } from '../../contexts/ContentContext.jsx';
import SyncStatusIndicator, { SyncStatusBadge } from '../common/SyncStatusIndicator.jsx';
import { SYNC_EVENTS } from '../../services/realtimeSyncService.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';
import { ENV } from '../../config/environment.js';

/**
 * Real-time Sync Test Component
 */
const RealtimeSyncTest = () => {
  const {
    isConnected,
    syncStatus,
    lastUpdate,
    error,
    isRealtimeEnabled,
    syncContent,
    refreshSync,
    clearError
  } = useContentSync();

  const {
    content,
    realtimeSync,
    createContentWithSync,
    updateContentWithSync,
    deleteContentWithSync
  } = useContent();

  const [testResults, setTestResults] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState(CONTENT_TYPES.NEWS);

  /**
   * Add test result
   */
  const addTestResult = (test, success, details = '') => {
    const result = {
      id: Date.now(),
      test,
      success,
      details,
      timestamp: new Date().toLocaleString('ar-SA')
    };

    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  /**
   * Test content creation sync
   */
  const testContentCreation = async () => {
    try {
      setIsRunningTest(true);
      
      const testContent = {
        title: `اختبار المزامنة ${Date.now()}`,
        content: 'محتوى اختبار للمزامنة الفورية',
        type: selectedContentType,
        status: CONTENT_STATUS.DRAFT,
        author: 'نظام الاختبار',
        tags: ['اختبار', 'مزامنة'],
        metadata: {
          isTest: true,
          createdBy: 'sync_test'
        }
      };

      const startTime = Date.now();
      const result = await createContentWithSync(testContent);
      const duration = Date.now() - startTime;

      if (result && result.success) {
        addTestResult(
          'إنشاء المحتوى',
          true,
          `تم إنشاء المحتوى بنجاح في ${duration}ms`
        );
      } else {
        addTestResult(
          'إنشاء المحتوى',
          false,
          result?.error || 'فشل في إنشاء المحتوى'
        );
      }

    } catch (error) {
      addTestResult(
        'إنشاء المحتوى',
        false,
        `خطأ: ${error.message}`
      );
    } finally {
      setIsRunningTest(false);
    }
  };

  /**
   * Test content update sync
   */
  const testContentUpdate = async () => {
    try {
      setIsRunningTest(true);

      // Find a test content to update
      const testContent = content.find(item => 
        item.metadata?.isTest && item.title?.includes('اختبار المزامنة')
      );

      if (!testContent) {
        addTestResult(
          'تحديث المحتوى',
          false,
          'لم يتم العثور على محتوى اختبار للتحديث'
        );
        return;
      }

      const updatedData = {
        ...testContent,
        title: `${testContent.title} - محدث`,
        content: `${testContent.content} - تم التحديث في ${new Date().toLocaleString('ar-SA')}`,
        updatedAt: new Date().toISOString()
      };

      const startTime = Date.now();
      const result = await updateContentWithSync(testContent.id, updatedData);
      const duration = Date.now() - startTime;

      if (result && result.success) {
        addTestResult(
          'تحديث المحتوى',
          true,
          `تم تحديث المحتوى بنجاح في ${duration}ms`
        );
      } else {
        addTestResult(
          'تحديث المحتوى',
          false,
          result?.error || 'فشل في تحديث المحتوى'
        );
      }

    } catch (error) {
      addTestResult(
        'تحديث المحتوى',
        false,
        `خطأ: ${error.message}`
      );
    } finally {
      setIsRunningTest(false);
    }
  };

  /**
   * Test content deletion sync
   */
  const testContentDeletion = async () => {
    try {
      setIsRunningTest(true);

      // Find a test content to delete
      const testContent = content.find(item => 
        item.metadata?.isTest && item.title?.includes('اختبار المزامنة')
      );

      if (!testContent) {
        addTestResult(
          'حذف المحتوى',
          false,
          'لم يتم العثور على محتوى اختبار للحذف'
        );
        return;
      }

      const startTime = Date.now();
      const result = await deleteContentWithSync(testContent.id);
      const duration = Date.now() - startTime;

      if (result && result.success) {
        addTestResult(
          'حذف المحتوى',
          true,
          `تم حذف المحتوى بنجاح في ${duration}ms`
        );
      } else {
        addTestResult(
          'حذف المحتوى',
          false,
          result?.error || 'فشل في حذف المحتوى'
        );
      }

    } catch (error) {
      addTestResult(
        'حذف المحتوى',
        false,
        `خطأ: ${error.message}`
      );
    } finally {
      setIsRunningTest(false);
    }
  };

  /**
   * Test sync performance
   */
  const testSyncPerformance = async () => {
    try {
      setIsRunningTest(true);

      const iterations = 5;
      const results = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        await syncContent(SYNC_EVENTS.CONTENT_UPDATED, {
          id: `test_${i}`,
          title: `اختبار الأداء ${i + 1}`,
          type: selectedContentType
        });

        const duration = Date.now() - startTime;
        results.push(duration);
      }

      const avgDuration = results.reduce((sum, d) => sum + d, 0) / results.length;
      const maxDuration = Math.max(...results);
      const minDuration = Math.min(...results);

      addTestResult(
        'اختبار الأداء',
        avgDuration < 1000, // Success if average < 1 second
        `متوسط: ${avgDuration.toFixed(0)}ms، أقصى: ${maxDuration}ms، أدنى: ${minDuration}ms`
      );

    } catch (error) {
      addTestResult(
        'اختبار الأداء',
        false,
        `خطأ: ${error.message}`
      );
    } finally {
      setIsRunningTest(false);
    }
  };

  /**
   * Run all tests
   */
  const runAllTests = async () => {
    setTestResults([]);
    
    await testContentCreation();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testContentUpdate();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSyncPerformance();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testContentDeletion();
  };

  /**
   * Clear test results
   */
  const clearTestResults = () => {
    setTestResults([]);
  };

  /**
   * Don't render in production
   */
  if (!ENV.IS_DEVELOPMENT) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          اختبار المزامنة الفورية
        </h2>
        <SyncStatusBadge />
      </div>

      {/* Real-time Status */}
      {!isRealtimeEnabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ المزامنة الفورية غير مفعلة. تأكد من تفعيل ENABLE_REAL_TIME_FEATURES
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{error.message}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع المحتوى للاختبار
          </label>
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRunningTest}
          >
            {Object.values(CONTENT_TYPES).map(type => (
              <option key={type} value={type}>
                {type === CONTENT_TYPES.NEWS ? 'أخبار' :
                 type === CONTENT_TYPES.EVENT ? 'فعاليات' :
                 type === CONTENT_TYPES.ARTICLE ? 'مقالات' :
                 type === CONTENT_TYPES.LECTURE ? 'محاضرات' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={refreshSync}
            disabled={isRunningTest}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            تحديث الاتصال
          </button>
        </div>
      </div>

      {/* Individual Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={testContentCreation}
          disabled={isRunningTest || !isRealtimeEnabled}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          اختبار الإنشاء
        </button>

        <button
          onClick={testContentUpdate}
          disabled={isRunningTest || !isRealtimeEnabled}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          اختبار التحديث
        </button>

        <button
          onClick={testSyncPerformance}
          disabled={isRunningTest || !isRealtimeEnabled}
          className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          اختبار الأداء
        </button>

        <button
          onClick={testContentDeletion}
          disabled={isRunningTest || !isRealtimeEnabled}
          className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          اختبار الحذف
        </button>
      </div>

      {/* Run All Tests Button */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunningTest || !isRealtimeEnabled}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunningTest ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
        </button>

        <button
          onClick={clearTestResults}
          disabled={isRunningTest}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          مسح النتائج
        </button>
      </div>

      {/* Sync Status Info */}
      {syncStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">معلومات المزامنة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">الحالة:</span>
              <span className={`mr-2 font-medium ${
                isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {isConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">الاستراتيجية:</span>
              <span className="mr-2 font-medium">{syncStatus.strategy}</span>
            </div>
            <div>
              <span className="text-gray-600">المزامنات الناجحة:</span>
              <span className="mr-2 font-medium text-green-600">
                {syncStatus.metrics?.successfulSyncs || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">المزامنات الفاشلة:</span>
              <span className="mr-2 font-medium text-red-600">
                {syncStatus.metrics?.failedSyncs || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">نتائج الاختبارات</h3>
          <div className="space-y-2">
            {testResults.map(result => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
                {result.details && (
                  <p className="text-sm text-gray-600 mt-1 mr-6">
                    {result.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Status Indicator */}
      <SyncStatusIndicator 
        showDetails={true}
        position="bottom-left"
        className="relative"
      />
    </div>
  );
};

export default RealtimeSyncTest;
