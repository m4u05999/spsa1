import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/index.jsx';
import { inspectLocalStorage, syncUserData, testRegistrationFlow } from '../debug/localStorageInspector';
import { runComprehensiveTest, quickTest, testAdminPanel } from '../debug/comprehensiveTest';

// Generate unique ID with timestamp and random component
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const UserStorageTest = () => {
  const { register } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comprehensiveResults, setComprehensiveResults] = useState(null);
  const [isRunningComprehensiveTest, setIsRunningComprehensiveTest] = useState(false);
  const [storageData, setStorageData] = useState({
    registeredUsers: [],
    spsaUsers: [],
    allKeys: []
  });

  // Counter to ensure unique IDs even with rapid calls
  const resultIdCounter = useRef(0);

  useEffect(() => {
    refreshStorageData();
  }, []);

  const addResult = (type, message, data = null) => {
    resultIdCounter.current += 1;
    const result = {
      id: `${Date.now()}-${resultIdCounter.current}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      message,
      data,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    setTestResults(prev => [result, ...prev]);
    console.log(`${type.toUpperCase()}: ${message}`, data);
  };

  const refreshStorageData = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const spsaUsers = JSON.parse(localStorage.getItem('spsa_users') || '[]');
      const allKeys = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i));
      }

      setStorageData({
        registeredUsers,
        spsaUsers,
        allKeys: allKeys.filter(key => key.toLowerCase().includes('user'))
      });

      addResult('info', 'تم تحديث بيانات التخزين', {
        registeredUsers: registeredUsers.length,
        spsaUsers: spsaUsers.length,
        userKeys: allKeys.filter(key => key.toLowerCase().includes('user')).length
      });
    } catch (error) {
      addResult('error', 'خطأ في قراءة بيانات التخزين', error.message);
    }
  };

  const testRegistration = async () => {
    setIsLoading(true);
    try {
      const testData = {
        name: `مستخدم اختبار ${Date.now()}`,
        email: `test.${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        specialty: 'political-science',
        organization: 'جامعة الاختبار'
      };

      addResult('info', 'بدء اختبار التسجيل', testData);

      // Step 1: Register
      const registerResult = await register(testData);
      addResult(registerResult.success ? 'success' : 'error', 'نتيجة التسجيل', registerResult);

      // Step 2: Check storage immediately
      setTimeout(() => {
        refreshStorageData();
      }, 100);

    } catch (error) {
      addResult('error', 'خطأ في اختبار التسجيل', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = () => {
    try {
      const result = syncUserData();
      addResult(result.success ? 'success' : 'error', 'نتيجة مزامنة البيانات', result);
      refreshStorageData();
    } catch (error) {
      addResult('error', 'خطأ في مزامنة البيانات', error.message);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.removeItem('registeredUsers');
      localStorage.removeItem('spsa_users');
      addResult('warning', 'تم مسح بيانات المستخدمين');
      refreshStorageData();
    } catch (error) {
      addResult('error', 'خطأ في مسح البيانات', error.message);
    }
  };

  const testCompleteFlow = async () => {
    setIsLoading(true);
    try {
      addResult('info', 'بدء اختبار التدفق الكامل');
      const result = await testRegistrationFlow();
      addResult(result.success ? 'success' : 'error', 'نتيجة اختبار التدفق الكامل', result);
      refreshStorageData();
    } catch (error) {
      addResult('error', 'خطأ في اختبار التدفق الكامل', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runComprehensiveTestHandler = async () => {
    setIsRunningComprehensiveTest(true);
    setComprehensiveResults(null);
    try {
      addResult('info', '🚀 بدء الاختبار الشامل للنظام');
      const results = await runComprehensiveTest();
      setComprehensiveResults(results);
      addResult(
        results.success ? 'success' : 'warning',
        `اكتمل الاختبار الشامل - نجح ${results.registrationTests.filter(t => t.success).length}/${results.registrationTests.length} تسجيلات`,
        results
      );
      refreshStorageData();
    } catch (error) {
      addResult('error', 'خطأ في الاختبار الشامل', error.message);
    } finally {
      setIsRunningComprehensiveTest(false);
    }
  };

  const runQuickTestHandler = async () => {
    setIsLoading(true);
    try {
      addResult('info', '⚡ بدء الاختبار السريع');
      const result = await quickTest();
      addResult(result.success ? 'success' : 'error', 'نتيجة الاختبار السريع', result);
      refreshStorageData();
    } catch (error) {
      addResult('error', 'خطأ في الاختبار السريع', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAdminPanelHandler = () => {
    try {
      addResult('info', '🏢 اختبار لوحة المدير');
      const result = testAdminPanel();
      addResult(result.success ? 'success' : 'warning', 'نتيجة اختبار لوحة المدير', result);
    } catch (error) {
      addResult('error', 'خطأ في اختبار لوحة المدير', error.message);
    }
  };

  const openAdminUsers = () => {
    window.open('/admin/users', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          اختبار تخزين المستخدمين
        </h1>

        {/* Control Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">أدوات التحكم</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testRegistration}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'جاري التسجيل...' : 'اختبار التسجيل'}
            </button>

            <button
              onClick={syncData}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              مزامنة البيانات
            </button>

            <button
              onClick={refreshStorageData}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              تحديث البيانات
            </button>

            <button
              onClick={clearStorage}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              مسح البيانات
            </button>

            <button
              onClick={testCompleteFlow}
              disabled={isLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-orange-300"
            >
              {isLoading ? 'جاري الاختبار...' : 'اختبار التدفق الكامل'}
            </button>

            <button
              onClick={runQuickTestHandler}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
            >
              {isLoading ? 'جاري الاختبار...' : '⚡ اختبار سريع'}
            </button>

            <button
              onClick={runComprehensiveTestHandler}
              disabled={isRunningComprehensiveTest}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-300"
            >
              {isRunningComprehensiveTest ? 'جاري الاختبار الشامل...' : '🚀 اختبار شامل'}
            </button>

            <button
              onClick={testAdminPanelHandler}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              🏢 اختبار لوحة المدير
            </button>

            <button
              onClick={openAdminUsers}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              فتح لوحة المدير
            </button>
          </div>
        </div>

        {/* Storage Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* registeredUsers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-600">
              registeredUsers ({storageData.registeredUsers.length})
            </h3>
            <div className="max-h-64 overflow-y-auto">
              {storageData.registeredUsers.length > 0 ? (
                storageData.registeredUsers.map((user, index) => (
                  <div key={`registered-${user.email}-${user.createdAt || index}`} className="border-b pb-2 mb-2">
                    <p className="font-semibold">{user.name || `${user.firstName} ${user.lastName}`}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.createdAt}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">لا توجد بيانات</p>
              )}
            </div>
          </div>

          {/* spsa_users */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-green-600">
              spsa_users ({storageData.spsaUsers.length})
            </h3>
            <div className="max-h-64 overflow-y-auto">
              {storageData.spsaUsers.length > 0 ? (
                storageData.spsaUsers.map((user, index) => (
                  <div key={`spsa-${user.email}-${user.id || user.createdAt || index}`} className="border-b pb-2 mb-2">
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.role} - {user.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">لا توجد بيانات</p>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">نتائج الاختبارات</h3>
          <div className="max-h-96 overflow-y-auto">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-3 mb-2 rounded ${
                  result.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' :
                  result.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' :
                  result.type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                  'bg-blue-100 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{result.message}</p>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                {result.data && (
                  <pre className="text-xs mt-2 bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Test Results */}
        {comprehensiveResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">نتائج الاختبار الشامل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded ${comprehensiveResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h4 className="font-semibold">الحالة العامة</h4>
                <p className={comprehensiveResults.success ? 'text-green-700' : 'text-red-700'}>
                  {comprehensiveResults.success ? '✅ نجح الاختبار الشامل' : '❌ فشل الاختبار الشامل'}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded">
                <h4 className="font-semibold">إحصائيات التسجيل</h4>
                <p className="text-blue-700">
                  نجح {comprehensiveResults.registrationTests.filter(t => t.success).length} من {comprehensiveResults.registrationTests.length} تسجيلات
                </p>
              </div>
            </div>

            {comprehensiveResults.registrationTests.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">تفاصيل التسجيلات</h4>
                <div className="max-h-48 overflow-y-auto">
                  {comprehensiveResults.registrationTests.map((test, index) => (
                    <div key={`test-${test.email}-${test.user}-${index}`} className={`p-2 mb-2 rounded ${test.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="font-medium">{test.user}</p>
                      <p className="text-sm text-gray-600">{test.email}</p>
                      <p className={`text-sm ${test.success ? 'text-green-600' : 'text-red-600'}`}>
                        {test.success ? '✅ نجح' : '❌ فشل'}
                        {test.error && `: ${test.error}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comprehensiveResults.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-red-600">الأخطاء المكتشفة</h4>
                <div className="max-h-32 overflow-y-auto">
                  {comprehensiveResults.errors.map((error, index) => (
                    <p key={`error-${index}-${error.substring(0, 20).replace(/\s/g, '')}`} className="text-sm text-red-600 mb-1">• {error}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-100 rounded">
                <h5 className="font-medium">الحالة الأولية</h5>
                <p className="text-sm">registeredUsers: {comprehensiveResults.initialState?.registeredUsers?.length || 0}</p>
                <p className="text-sm">spsa_users: {comprehensiveResults.initialState?.spsaUsers?.length || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <h5 className="font-medium">الحالة النهائية</h5>
                <p className="text-sm">registeredUsers: {comprehensiveResults.finalState?.registeredUsers?.length || 0}</p>
                <p className="text-sm">spsa_users: {comprehensiveResults.finalState?.spsaUsers?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStorageTest;
