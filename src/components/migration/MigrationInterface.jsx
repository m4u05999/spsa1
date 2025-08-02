// src/components/migration/MigrationInterface.jsx
// واجهة المستخدم لإدارة ترقية النظام

import React, { useState, useEffect } from 'react';
import { useDashboardMigration } from '../../utils/migration/DashboardMigration.js';

const MigrationInterface = ({ onComplete, onCancel }) => {
  const {
    migrationStatus,
    migrationProgress,
    checkMigration,
    performMigration,
    rollback,
    migrationInfo
  } = useDashboardMigration();

  const [showDetails, setShowDetails] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  useEffect(() => {
    checkMigration();
  }, [checkMigration]);

  const handleMigrate = async () => {
    const result = await performMigration();
    setMigrationResult(result);
    
    if (result.success && onComplete) {
      setTimeout(() => onComplete(result), 2000);
    }
  };

  const handleRollback = async () => {
    const result = await rollback();
    setMigrationResult(result);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checking':
        return '🔄';
      case 'required':
        return '⚠️';
      case 'migrating':
        return '🚀';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'rollback_completed':
        return '↩️';
      default:
        return '❓';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'checking':
        return 'جاري فحص النظام...';
      case 'required':
        return 'يتطلب النظام ترقية للحصول على المزايا الجديدة';
      case 'migrating':
        return 'جاري تنفيذ الترقية...';
      case 'completed':
        return 'تمت الترقية بنجاح! النظام جاهز للاستخدام';
      case 'failed':
        return 'فشلت الترقية. يمكنك استعادة النسخة السابقة';
      case 'rollback_completed':
        return 'تم استعادة النظام السابق بنجاح';
      default:
        return 'حالة غير معروفة';
    }
  };

  if (migrationStatus === 'completed' && !migrationResult) {
    return null; // النظام محدث بالفعل
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{getStatusIcon(migrationStatus)}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ترقية نظام لوحة التحكم
          </h2>
          <p className="text-gray-600">
            {getStatusMessage(migrationStatus)}
          </p>
        </div>

        {/* Progress Bar */}
        {migrationStatus === 'migrating' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>تقدم الترقية</span>
              <span>{migrationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${migrationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Migration Info */}
        {migrationInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-gray-700">تفاصيل الترقية</span>
              <svg 
                className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDetails && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>الإصدار الحالي:</span>
                  <span className="font-mono">{migrationInfo.currentVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>الإصدار الجديد:</span>
                  <span className="font-mono text-green-600">{migrationInfo.targetVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>حالة النسخة الاحتياطية:</span>
                  <span className={migrationInfo.hasBackup ? 'text-green-600' : 'text-orange-600'}>
                    {migrationInfo.hasBackup ? '✅ متوفرة' : '⚠️ غير متوفرة'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Preview */}
        {migrationStatus === 'required' && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">المزايا الجديدة:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <span className="text-green-500 ml-2">✨</span>
                <span>تحسين الأداء بنسبة 50%</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 ml-2">🤖</span>
                <span>رؤى ذكية بالذكاء الاصطناعي</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-500 ml-2">🎨</span>
                <span>تفاعلات متقدمة وحركات سلسة</span>
              </div>
              <div className="flex items-center">
                <span className="text-orange-500 ml-2">📱</span>
                <span>دعم محسن للأجهزة اللوحية</span>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 ml-2">🔒</span>
                <span>أمان وخصوصية محسنة</span>
              </div>
              <div className="flex items-center">
                <span className="text-teal-500 ml-2">⚡</span>
                <span>تحليلات فورية ومتقدمة</span>
              </div>
            </div>
          </div>
        )}

        {/* Result Message */}
        {migrationResult && (
          <div className={`p-4 rounded-lg mb-6 ${
            migrationResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="ml-2">
                {migrationResult.success ? '✅' : '❌'}
              </span>
              <span>
                {migrationResult.success 
                  ? migrationResult.message || 'تمت العملية بنجاح'
                  : migrationResult.error || 'حدث خطأ غير متوقع'
                }
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {migrationStatus === 'required' && (
            <>
              <button
                onClick={handleMigrate}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
              >
                🚀 بدء الترقية
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                إلغاء
              </button>
            </>
          )}

          {migrationStatus === 'migrating' && (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
            >
              جاري التنفيذ...
            </button>
          )}

          {migrationStatus === 'completed' && (
            <button
              onClick={() => onComplete && onComplete(migrationResult)}
              className="flex-1 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              ✅ إكمال
            </button>
          )}

          {migrationStatus === 'failed' && (
            <>
              <button
                onClick={handleMigrate}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                🔄 إعادة المحاولة
              </button>
              <button
                onClick={handleRollback}
                className="flex-1 bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                ↩️ استعادة النسخة السابقة
              </button>
            </>
          )}

          {migrationStatus === 'rollback_completed' && (
            <button
              onClick={() => onCancel && onCancel()}
              className="flex-1 bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              إغلاق
            </button>
          )}
        </div>

        {/* Warning */}
        {migrationStatus === 'required' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-yellow-500 ml-2 mt-0.5">⚠️</span>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">تنبيه مهم:</p>
                <p>سيتم إنشاء نسخة احتياطية تلقائياً قبل بدء الترقية. يمكنك استعادة النظام السابق في أي وقت.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationInterface;