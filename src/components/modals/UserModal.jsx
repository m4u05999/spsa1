// src/components/modals/UserModal.jsx
import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';

const UserModal = ({ isOpen, onClose, mode, userData, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member',
    phone: '',
    specialization: '',
    workplace: '',
    academicDegree: '',
    membershipType: 'regular',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData && (mode === 'edit' || mode === 'view')) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        role: userData.role || 'member',
        phone: userData.phone || '',
        specialization: userData.specialization || '',
        workplace: userData.workplace || '',
        academicDegree: userData.academicDegree || '',
        membershipType: userData.membershipType || 'regular',
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'member',
        phone: '',
        specialization: '',
        workplace: '',
        academicDegree: '',
        membershipType: 'regular',
        password: '',
        confirmPassword: ''
      });
    }
  }, [userData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'create' || mode === 'edit') {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('الاسم الأول والأخير والبريد الإلكتروني مطلوبة');
        return;
      }

      if (mode === 'create') {
        if (!formData.password) {
          setError('كلمة المرور مطلوبة');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('كلمة المرور غير متطابقة');
          return;
        }
      }
    }

    onSubmit(formData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} dir="rtl">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-right align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {mode === 'create' ? 'إضافة مستخدم جديد' : 
                     mode === 'edit' ? 'تعديل بيانات المستخدم' : 
                     'عرض بيانات المستخدم'}
                  </h2>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">إغلاق</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        الاسم الأخير
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      الدور
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      dir="rtl"
                    >
                      <option value="member">عضو</option>
                      <option value="staff">موظف</option>
                      <option value="admin">مدير</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">
                        نوع العضوية
                      </label>
                      <select
                        id="membershipType"
                        name="membershipType"
                        value={formData.membershipType}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        dir="rtl"
                      >
                        <option value="regular">عادية</option>
                        <option value="student">طالب</option>
                        <option value="academic">أكاديمية</option>
                        <option value="honorary">فخرية</option>
                        <option value="corporate">مؤسسية</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      التخصص
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      disabled={mode === 'view'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="workplace" className="block text-sm font-medium text-gray-700">
                        مكان العمل
                      </label>
                      <input
                        type="text"
                        id="workplace"
                        name="workplace"
                        value={formData.workplace}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label htmlFor="academicDegree" className="block text-sm font-medium text-gray-700">
                        الدرجة العلمية
                      </label>
                      <input
                        type="text"
                        id="academicDegree"
                        name="academicDegree"
                        value={formData.academicDegree}
                        onChange={handleChange}
                        disabled={mode === 'view'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {(mode === 'create' || (mode === 'edit' && formData.changePassword)) && (
                    <>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          كلمة المرور
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          تأكيد كلمة المرور
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          dir="rtl"
                        />
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  <div className="flex justify-end space-x-3 space-x-reverse">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      إلغاء
                    </button>
                    {mode !== 'view' && (
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {mode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
                      </button>
                    )}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

UserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['create', 'edit', 'view']).isRequired,
  userData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired
};

export default UserModal;