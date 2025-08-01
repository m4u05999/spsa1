import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/index.jsx';
import { getFeatureFlag } from '../config/featureFlags';
import { debugRegistrationFlow } from '../utils/registrationDebugger';

/**
 * Registration Test Page
 * صفحة اختبار نظام التسجيل
 */
const RegistrationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleString('ar-SA')
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Feature Flags
  const testFeatureFlags = () => {
    try {
      const useNewAuth = getFeatureFlag('USE_NEW_AUTH');
      const enableSupabaseFallback = getFeatureFlag('ENABLE_SUPABASE_FALLBACK', true);
      
      addResult(
        'Feature Flags',
        'success',
        `USE_NEW_AUTH: ${useNewAuth}, SUPABASE_FALLBACK: ${enableSupabaseFallback}`,
        { useNewAuth, enableSupabaseFallback }
      );
    } catch (error) {
      addResult('Feature Flags', 'error', error.message);
    }
  };

  // Test 2: Registration Function
  const testRegistrationFunction = async () => {
    setIsLoading(true);
    try {
      const testData = {
        name: 'مستخدم تجريبي',
        email: `test.${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        phone: '0501234567',
        specialization: 'political-science',
        agreeTerms: true
      };

      addResult('Registration Data', 'info', 'بدء اختبار التسجيل...', testData);

      const result = await register(testData);
      
      if (result.success) {
        addResult(
          'Registration Function',
          'success',
          `تم التسجيل بنجاح: ${result.message}`,
          result.user
        );
        
        // Check if user appears in localStorage
        const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userFound = savedUsers.find(u => u.email === testData.email);
        
        if (userFound) {
          addResult('Data Persistence', 'success', 'تم حفظ المستخدم في localStorage', userFound);
        } else {
          addResult('Data Persistence', 'warning', 'المستخدم غير موجود في localStorage');
        }
        
      } else {
        addResult('Registration Function', 'error', result.message || 'فشل التسجيل');
      }
    } catch (error) {
      addResult('Registration Function', 'error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Check Services
  const testServices = async () => {
    try {
      // Test Supabase connection
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        addResult('Supabase Config', 'success', 'إعدادات Supabase متوفرة');
      } else {
        addResult('Supabase Config', 'error', 'إعدادات Supabase مفقودة');
      }

      // Test environment variables
      const env = import.meta.env.VITE_APP_ENV;
      addResult('Environment', 'info', `البيئة الحالية: ${env}`);

    } catch (error) {
      addResult('Services Test', 'error', error.message);
    }
  };

  // Test 4: Check existing users
  const checkExistingUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      addResult(
        'Existing Users',
        'info',
        `عدد المستخدمين المسجلين: ${users.length}`,
        users
      );
    } catch (error) {
      addResult('Existing Users', 'error', error.message);
    }
  };

  // Test 5: Debug Registration Flow
  const runDebugFlow = async () => {
    try {
      addResult('Debug Flow', 'info', 'بدء تشخيص تدفق التسجيل...');

      const debugResult = await debugRegistrationFlow();

      addResult(
        'Debug Flow',
        'success',
        'تم تشخيص التدفق بنجاح',
        debugResult
      );
    } catch (error) {
      addResult('Debug Flow', 'error', error.message);
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('Test Suite', 'info', 'بدء تشغيل جميع الاختبارات...');

    await runDebugFlow();
    testFeatureFlags();
    await testServices();
    checkExistingUsers();
    await testRegistrationFunction();

    addResult('Test Suite', 'success', 'انتهاء جميع الاختبارات');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            اختبار نظام التسجيل
          </h1>

          {/* Test Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
            </button>
            
            <button
              onClick={testFeatureFlags}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              اختبار Feature Flags
            </button>
            
            <button
              onClick={testServices}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              اختبار الخدمات
            </button>
            
            <button
              onClick={checkExistingUsers}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              فحص المستخدمين
            </button>

            <button
              onClick={runDebugFlow}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              تشخيص التدفق
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              مسح النتائج
            </button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">نتائج الاختبارات:</h2>
            
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                لا توجد نتائج اختبار بعد. اضغط على "تشغيل جميع الاختبارات" للبدء.
              </p>
            ) : (
              <div className="space-y-3">
                {testResults.map(result => (
                  <div
                    key={result.id}
                    className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{result.test}</h3>
                        <p className="mt-1">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm opacity-75">
                              عرض التفاصيل
                            </summary>
                            <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className="text-xs opacity-75 ml-4">
                        {result.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTest;
