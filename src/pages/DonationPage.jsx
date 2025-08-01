// src/pages/DonationPage.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DonationForm from '../components/forms/DonationForm';
import { AuthContext } from '../contexts/index.jsx';

const DonationPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const navigate = useNavigate();

  const handleDonationSuccess = (amount) => {
    setDonationAmount(amount);
    setDonationSuccess(true);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {donationSuccess ? (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto text-center">
            <div className="rounded-full bg-green-100 h-20 w-20 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">شكراً لمساهمتك!</h2>
            <p className="text-xl text-gray-600 mb-6">
              تم استلام تبرعك بمبلغ {donationAmount} ريال بنجاح.
            </p>
            <p className="text-gray-600 mb-8">
              ستصلك رسالة تأكيد على بريدك الإلكتروني قريباً. نقدر دعمك لجمعية العلوم السياسية ومساهمتك في تحقيق أهدافها.
            </p>
            <div className="space-x-4 space-x-reverse">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                العودة للصفحة الرئيسية
              </Link>
              <Link
                to="/contributors"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                عرض المساهمين
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">ساهم في دعم الجمعية</h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600">
                تبرعك يساعدنا على تحقيق رسالتنا في نشر الثقافة السياسية وتطوير الأبحاث في مجال العلوم السياسية
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {!isAuthenticated ? (
                  <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="text-xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
                    <p className="text-gray-600 mb-6">
                      يرجى تسجيل الدخول أو إنشاء حساب جديد للتمكن من تقديم التبرعات
                    </p>
                    <div className="flex justify-center space-x-4 space-x-reverse">
                      <Link
                        to="/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        تسجيل الدخول
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        إنشاء حساب
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">تفاصيل التبرع</h2>
                    <DonationForm onSuccess={handleDonationSuccess} />
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white shadow-md rounded-lg p-6 h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">أثر تبرعك</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="border-r-4 border-blue-600 pr-4">
                      <h4 className="font-semibold">دعم الأبحاث العلمية</h4>
                      <p className="text-gray-600">تمويل الأبحاث والدراسات في مجال العلوم السياسية</p>
                    </div>
                    <div className="border-r-4 border-green-600 pr-4">
                      <h4 className="font-semibold">تنظيم الفعاليات والمؤتمرات</h4>
                      <p className="text-gray-600">دعم المؤتمرات والندوات العلمية المتخصصة</p>
                    </div>
                    <div className="border-r-4 border-yellow-600 pr-4">
                      <h4 className="font-semibold">برامج تدريب وتأهيل</h4>
                      <p className="text-gray-600">تقديم دورات وورش عمل للباحثين والمهتمين</p>
                    </div>
                    <div className="border-r-4 border-purple-600 pr-4">
                      <h4 className="font-semibold">منح ومكافآت للطلاب</h4>
                      <p className="text-gray-600">تقديم منح دراسية للطلاب المتميزين في العلوم السياسية</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-center mb-2">مستويات المساهمة</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>مساهم برونزي:</span>
                        <span>حتى 4,999 ريال</span>
                      </li>
                      <li className="flex justify-between">
                        <span>مساهم فضي:</span>
                        <span>5,000 - 9,999 ريال</span>
                      </li>
                      <li className="flex justify-between">
                        <span>مساهم ذهبي:</span>
                        <span>10,000 ريال فأكثر</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    to="/contributors"
                    className="block w-full text-center py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    عرض قائمة المساهمين
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationPage;