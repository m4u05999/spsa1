// src/components/forms/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/index.jsx';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    organization: '',
  });
  
  // ✅ نظام موافقة حقيقي وفقاً لقانون PDPL
  const [consents, setConsents] = useState({
    // موافقات مطلوبة (لا يمكن التسجيل بدونها)
    personalDataProcessing: false,    // معالجة البيانات الشخصية
    membershipManagement: false,      // إدارة العضوية
    
    // موافقات اختيارية
    profileVisibility: false,         // نشر الملف الشخصي
    marketingCommunications: false,   // التسويق والإشعارات
    activityTracking: false,         // تتبع النشاط
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // ✅ التحقق من كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setIsLoading(false);
      return;
    }

    // ✅ التحقق من الموافقات الأساسية المطلوبة
    if (!consents.personalDataProcessing || !consents.membershipManagement) {
      setError('يجب الموافقة على معالجة البيانات الشخصية وإدارة العضوية للمتابعة');
      setIsLoading(false);
      return;
    }

    try {
      // ❌ REMOVED: console.log - لا نكشف بداية عملية التسجيل في الإنتاج

      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        specialization: formData.specialty,
        organization: formData.organization,
        
        // ✅ موافقات حقيقية بدلاً من الافتراض الوهمي
        consents: {
          personalDataProcessing: {
            granted: consents.personalDataProcessing,
            timestamp: new Date().toISOString(),
            version: '1.0'
          },
          membershipManagement: {
            granted: consents.membershipManagement,
            timestamp: new Date().toISOString(),
            version: '1.0'
          },
          profileVisibility: {
            granted: consents.profileVisibility,
            timestamp: new Date().toISOString(),
            version: '1.0'
          },
          marketingCommunications: {
            granted: consents.marketingCommunications,
            timestamp: new Date().toISOString(),
            version: '1.0'
          },
          activityTracking: {
            granted: consents.activityTracking,
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
        // ❌ REMOVED: agreeTerms: true - لا مزيد من الافتراضات الوهمية
      };

      const result = await register(registrationData);

      if (result.success) {
        // ❌ REMOVED: console.log - لا نكشف نجاح التسجيل في الإنتاج
        // Redirect to dashboard or success page
        window.location.href = '/dashboard';
      } else {
        throw new Error(result.message || 'فشل في إنشاء الحساب');
      }
    } catch (err) {
      // ✅ نحتفظ بتسجيل الأخطاء لكن بدون تفاصيل حساسة
      console.error('خطأ في التسجيل - راجع السجلات الداخلية');
      setError(err.message || 'خطأ في إنشاء الحساب. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
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

      {/* ✅ قسم الموافقات الأساسية - مطلوبة */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-3">الموافقات المطلوبة *</h3>
        
        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={consents.personalDataProcessing}
              onChange={(e) => setConsents({
                ...consents,
                personalDataProcessing: e.target.checked
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <span className="mr-2 text-sm text-gray-700">
              أوافق على <strong>جمع ومعالجة بياناتي الشخصية</strong> (الاسم، البريد الإلكتروني، التخصص، المؤسسة) 
              لغرض إدارة عضويتي في الجمعية السعودية للعلوم السياسية وتقديم الخدمات المطلوبة.
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={consents.membershipManagement}
              onChange={(e) => setConsents({
                ...consents,
                membershipManagement: e.target.checked
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <span className="mr-2 text-sm text-gray-700">
              أوافق على <strong>إدارة عضويتي</strong> وحفظ سجلات العضوية والنشاطات المتعلقة بالجمعية.
            </span>
          </label>
        </div>
      </div>

      {/* ✅ قسم الموافقات الاختيارية */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">الموافقات الاختيارية</h3>
        
        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={consents.profileVisibility}
              onChange={(e) => setConsents({
                ...consents,
                profileVisibility: e.target.checked
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="mr-2 text-sm text-gray-600">
              أوافق على <strong>نشر ملفي الشخصي</strong> (الاسم، التخصص، المؤسسة) على الموقع العام للجمعية.
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={consents.marketingCommunications}
              onChange={(e) => setConsents({
                ...consents,
                marketingCommunications: e.target.checked
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="mr-2 text-sm text-gray-600">
              أوافق على تلقي <strong>الإشعارات والرسائل التسويقية</strong> حول أنشطة الجمعية وأحداثها.
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={consents.activityTracking}
              onChange={(e) => setConsents({
                ...consents,
                activityTracking: e.target.checked
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="mr-2 text-sm text-gray-600">
              أوافق على <strong>تتبع نشاطي</strong> على الموقع لأغراض تحسين الخدمة والأمان.
            </span>
          </label>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;