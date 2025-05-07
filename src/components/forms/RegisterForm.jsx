// src/components/forms/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    organization: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    try {
      // هنا سيتم إضافة التكامل مع الباك إند
      const mockUser = {
        id: '1',
        name: formData.name,
        email: formData.email,
        specialty: formData.specialty,
        organization: formData.organization,
        role: 'member',
      };
      login(mockUser);
      window.location.href = '/profile';
    } catch (err) {
      setError('خطأ في إنشاء الحساب. الرجاء المحاولة مرة أخرى.');
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="name" className="sr-only">
            الاسم الكامل
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="الاسم الكامل"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="specialty" className="sr-only">
            التخصص
          </label>
          <input
            id="specialty"
            name="specialty"
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="التخصص"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="organization" className="sr-only">
            المؤسسة
          </label>
          <input
            id="organization"
            name="organization"
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="المؤسسة"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
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
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            تأكيد كلمة المرور
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="تأكيد كلمة المرور"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إنشاء حساب
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;