// src/pages/auth/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../../components/forms/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-24 w-auto"
            src="/assets/images/logo.png"
            alt="جمعية العلوم السياسية"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              تسجيل الدخول
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;