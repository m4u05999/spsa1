// src/components/forms/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/index.jsx';
import { twoFactorService } from '../../services/twoFactorService';
import Verify2FA from '../auth/Verify2FA';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return; // Prevent multiple submissions
    
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      
      // Use AuthContext login directly
      const result = await login(formData);
      
      console.log('Login result:', result);
      
      if (result?.success) {
        console.log('Login successful, user will be redirected by AuthContext');
        // Success - AuthContext will handle navigation
      } else {
        setError(result?.error || 'خطأ في تسجيل الدخول. الرجاء التحقق من البيانات المدخلة.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('خطأ في تسجيل الدخول. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async (verificationData) => {
    try {
      // Complete login with 2FA
      const credentials = {
        ...formData,
        twoFactorCode: verificationData.code,
        twoFactorMethod: verificationData.method
      };
      
      const result = await login(credentials);
      
      if (!result.success) {
        setError(result.error || 'خطأ في التحقق من 2FA.');
      } else {
        // Reset 2FA state
        setRequires2FA(false);
        setTwoFactorData(null);
      }
    } catch (err) {
      setError('خطأ في التحقق من 2FA.');
    }
  };

  // Handle 2FA cancellation
  const handle2FACancel = () => {
    setRequires2FA(false);
    setTwoFactorData(null);
    setError('');
  };

  // 2FA disabled for debugging
  // if (requires2FA && twoFactorData) {
  //   return (
  //     <div className="mt-8">
  //       {error && (
  //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  //           {error}
  //         </div>
  //       )}
  //       <Verify2FA
  //         method={twoFactorData.method}
  //         phoneNumber={twoFactorData.phoneNumber}
  //         onVerify={handle2FAVerification}
  //         onCancel={handle2FACancel}
  //         sessionToken={twoFactorData.sessionToken}
  //       />
  //     </div>
  //   );
  // }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري تسجيل الدخول...
            </span>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;