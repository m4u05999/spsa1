// src/components/auth/RegistrationSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Registration Success Component
 * مكون نجاح التسجيل
 */
const RegistrationSuccess = ({ 
  user, 
  message = 'تم إنشاء الحساب بنجاح!',
  redirectPath = '/dashboard',
  redirectDelay = 5000,
  showPaymentInfo = true 
}) => {
  const [countdown, setCountdown] = useState(Math.floor(redirectDelay / 1000));
  const navigate = useNavigate();

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectPath, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, redirectPath]);

  const handleManualRedirect = () => {
    navigate(redirectPath, { replace: true });
  };

  const handleGoToPayment = () => {
    navigate('/payment', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>

          {/* Success Message */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {message}
            </h2>
            
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="text-sm text-green-800">
                  <p className="font-medium">مرحباً {user.name}!</p>
                  <p className="mt-1">تم إنشاء حسابك بالبريد الإلكتروني: {user.email}</p>
                  {user.membershipStatus === 'pending' && showPaymentInfo && (
                    <p className="mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                      <strong>ملاحظة:</strong> يجب إكمال عملية الدفع لتفعيل العضوية
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">الخطوات التالية:</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-right">
                {showPaymentInfo && user?.membershipStatus === 'pending' && (
                  <li className="flex items-center">
                    <span className="ml-2">1.</span>
                    <span>إكمال عملية الدفع لتفعيل العضوية</span>
                  </li>
                )}
                <li className="flex items-center">
                  <span className="ml-2">{showPaymentInfo && user?.membershipStatus === 'pending' ? '2.' : '1.'}</span>
                  <span>تحقق من بريدك الإلكتروني لتأكيد الحساب</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-2">{showPaymentInfo && user?.membershipStatus === 'pending' ? '3.' : '2.'}</span>
                  <span>استكشف لوحة التحكم والخدمات المتاحة</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {showPaymentInfo && user?.membershipStatus === 'pending' && (
                <button
                  onClick={handleGoToPayment}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <span>إكمال عملية الدفع</span>
                  <ArrowRightIcon className="mr-2 h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={handleManualRedirect}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <span>الانتقال إلى لوحة التحكم</span>
                <ArrowRightIcon className="mr-2 h-4 w-4" />
              </button>
            </div>

            {/* Auto Redirect Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                سيتم توجيهك تلقائياً خلال {countdown} ثانية
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((redirectDelay / 1000 - countdown) / (redirectDelay / 1000)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
