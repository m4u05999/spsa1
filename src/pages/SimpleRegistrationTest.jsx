import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { runAllDirectTests } from '../debug/directServiceTest';
import { inspectLocalStorage, syncUserData, testRegistrationFlow } from '../debug/localStorageInspector';

/**
 * Simple Registration Test
 * اختبار تسجيل بسيط
 */
const SimpleRegistrationTest = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const testRegistration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 Starting simple registration test...');
      
      // Clear any existing test users
      localStorage.removeItem('registeredUsers');
      
      const testData = {
        name: 'مستخدم اختبار بسيط',
        email: `simple.test.${Date.now()}@example.com`,
        password: 'SimpleTest123!',
        confirmPassword: 'SimpleTest123!',
        phone: '0501234567',
        specialization: 'political-science',
        agreeTerms: true
      };

      console.log('📝 Test data:', testData);
      console.log('🔧 Register function:', typeof register);

      if (!register) {
        throw new Error('Register function not available from AuthContext');
      }

      const registrationResult = await register(testData);
      
      console.log('📊 Registration result:', registrationResult);

      // Check if user was saved
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      console.log('💾 Saved users:', savedUsers);

      setResult({
        success: registrationResult.success,
        message: registrationResult.message || 'تم التسجيل',
        user: registrationResult.user,
        savedUsers: savedUsers,
        userFound: savedUsers.find(u => u.email === testData.email)
      });

    } catch (error) {
      console.error('❌ Registration test error:', error);
      setResult({
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthContext = () => {
    console.log('🔍 Checking AuthContext...');
    console.log('Register function:', register);
    console.log('Register type:', typeof register);
    console.log('AuthContext:', AuthContext);
  };

  const inspectStorage = () => {
    console.log('🔍 Inspecting localStorage...');
    const results = inspectLocalStorage();
    setResult({
      success: true,
      message: 'فحص التخزين المحلي مكتمل',
      storageInspection: results
    });
  };

  const syncStorage = () => {
    console.log('🔄 Syncing user data...');
    const results = syncUserData();
    setResult({
      success: results.success,
      message: results.success ? 'تم مزامنة البيانات بنجاح' : 'فشل في مزامنة البيانات',
      syncResults: results
    });
  };

  const testCompleteFlow = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing complete registration flow...');
      const results = await testRegistrationFlow();
      setResult({
        success: results.success,
        message: results.success ? 'اختبار التدفق الكامل مكتمل' : 'فشل في اختبار التدفق',
        flowResults: results
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkServices = async () => {
    try {
      console.log('🔍 Running comprehensive service tests...');
      const results = await runAllDirectTests();

      setResult({
        success: true,
        message: 'اختبار الخدمات مكتمل',
        directTests: results
      });

    } catch (error) {
      console.error('❌ Service check error:', error);
      setResult({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            اختبار التسجيل البسيط
          </h1>

          <div className="space-y-4 mb-6">
            <button
              onClick={testRegistration}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'جاري الاختبار...' : 'اختبار التسجيل'}
            </button>

            <button
              onClick={checkAuthContext}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 ml-4"
            >
              فحص AuthContext
            </button>

            <button
              onClick={checkServices}
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 ml-4"
            >
              فحص الخدمات
            </button>

            <button
              onClick={inspectStorage}
              className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 ml-4"
            >
              فحص التخزين
            </button>

            <button
              onClick={syncStorage}
              className="bg-yellow-600 text-white px-6 py-3 rounded hover:bg-yellow-700 ml-4"
            >
              مزامنة البيانات
            </button>

            <button
              onClick={testCompleteFlow}
              disabled={isLoading}
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 ml-4 disabled:bg-red-300"
            >
              {isLoading ? 'جاري الاختبار...' : 'اختبار التدفق الكامل'}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">نتيجة الاختبار:</h2>
              
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="space-y-2">
                  <p><strong>النجاح:</strong> {result.success ? 'نعم' : 'لا'}</p>
                  
                  {result.message && (
                    <p><strong>الرسالة:</strong> {result.message}</p>
                  )}
                  
                  {result.error && (
                    <p><strong>الخطأ:</strong> {result.error}</p>
                  )}
                  
                  {result.user && (
                    <div>
                      <p><strong>المستخدم المُنشأ:</strong></p>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {JSON.stringify(result.user, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.savedUsers && (
                    <div>
                      <p><strong>المستخدمون المحفوظون ({result.savedUsers.length}):</strong></p>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {JSON.stringify(result.savedUsers, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.userFound && (
                    <p className="text-green-600">✅ المستخدم موجود في localStorage</p>
                  )}
                  
                  {result.savedUsers && !result.userFound && (
                    <p className="text-red-600">❌ المستخدم غير موجود في localStorage</p>
                  )}

                  {result.storageInspection && (
                    <div>
                      <p><strong>فحص التخزين:</strong></p>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {JSON.stringify(result.storageInspection, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.syncResults && (
                    <div>
                      <p><strong>نتائج المزامنة:</strong></p>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {JSON.stringify(result.syncResults, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.flowResults && (
                    <div>
                      <p><strong>نتائج اختبار التدفق:</strong></p>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {JSON.stringify(result.flowResults, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.directTests && (
                    <div>
                      <p><strong>نتائج الاختبارات المباشرة:</strong></p>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {JSON.stringify(result.directTests, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Stack Trace</summary>
                      <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-1">
                        {result.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleRegistrationTest;
