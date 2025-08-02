// src/pages/dashboard/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/index.jsx';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    position: '',
    organization: '',
    location: '',
    website: '',
    socialMedia: {
      twitter: '',
      linkedin: '',
      facebook: ''
    },
    preferences: {
      language: 'ar',
      timezone: 'Asia/Riyadh',
      emailNotifications: true,
      pushNotifications: true,
      newsletter: true
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        position: user.position || '',
        organization: user.organization || '',
        location: user.location || '',
        website: user.website || '',
        socialMedia: {
          twitter: user.socialMedia?.twitter || '',
          linkedin: user.socialMedia?.linkedin || '',
          facebook: user.socialMedia?.facebook || ''
        },
        preferences: {
          language: user.preferences?.language || 'ar',
          timezone: user.preferences?.timezone || 'Asia/Riyadh',
          emailNotifications: user.preferences?.emailNotifications ?? true,
          pushNotifications: user.preferences?.pushNotifications ?? true,
          newsletter: user.preferences?.newsletter ?? true
        }
      }));
    }
  }, [user]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // في التطبيق الحقيقي، سيتم استدعاء updateProfile من AuthContext
      if (updateProfile) {
        await updateProfile({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          position: formData.position,
          organization: formData.organization,
          location: formData.location,
          website: formData.website,
          socialMedia: formData.socialMedia,
          preferences: formData.preferences
        });
      }
      
      // حفظ في التخزين المحلي للتجربة
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        position: formData.position,
        organization: formData.organization,
        location: formData.location,
        website: formData.website,
        socialMedia: formData.socialMedia,
        preferences: formData.preferences
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      alert('تم حفظ الملف الشخصي بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الملف الشخصي:', error);
      alert('حدث خطأ أثناء حفظ الملف الشخصي');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.security.newPassword !== formData.security.confirmPassword) {
      alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    if (formData.security.newPassword.length < 8) {
      alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    try {
      setIsSaving(true);
      
      // محاكاة تغيير كلمة المرور
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // إعادة تعيين حقول كلمة المرور
      setFormData(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }));
      
      alert('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      alert('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      id: 'personal',
      name: 'المعلومات الشخصية',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'contact',
      name: 'معلومات التواصل',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'preferences',
      name: 'التفضيلات',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'security',
      name: 'الأمان',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية وإعداداتك</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={activeTab === 'security' ? handleChangePassword : handleSaveProfile}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'جاري الحفظ...' : activeTab === 'security' ? 'تغيير كلمة المرور' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'أ'}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'المستخدم'}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'admin' ? 'مدير النظام' : 
               user?.role === 'staff' ? 'موظف' : 'عضو'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'admin' ? 'bg-red-100 text-red-800' :
              user?.role === 'staff' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user?.role === 'admin' ? 'مدير' : 
               user?.role === 'staff' ? 'موظف' : 'عضو'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">المعلومات الشخصية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنصب/الوظيفة
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange(null, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجهة/المؤسسة
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleInputChange(null, 'organization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع/المدينة
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange(null, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نبذة شخصية
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اكتب نبذة قصيرة عن نفسك..."
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">معلومات التواصل</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع الإلكتروني
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange(null, 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تويتر
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    لينكد إن
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleInputChange('socialMedia', 'linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فيسبوك
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="facebook.com/username"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">التفضيلات</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اللغة
                  </label>
                  <select
                    value={formData.preferences.language}
                    onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">الإنجليزية</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنطقة الزمنية
                  </label>
                  <select
                    value={formData.preferences.timezone}
                    onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">الإشعارات</h4>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={formData.preferences.emailNotifications}
                    onChange={(e) => handleInputChange('preferences', 'emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="mr-2 text-sm">
                    إشعارات البريد الإلكتروني
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={formData.preferences.pushNotifications}
                    onChange={(e) => handleInputChange('preferences', 'pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pushNotifications" className="mr-2 text-sm">
                    الإشعارات الفورية
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={formData.preferences.newsletter}
                    onChange={(e) => handleInputChange('preferences', 'newsletter', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="mr-2 text-sm">
                    النشرة الإخبارية
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">الأمان</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      تغيير كلمة المرور
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>تأكد من استخدام كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الحالية *
                  </label>
                  <input
                    type="password"
                    value={formData.security.currentPassword}
                    onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الجديدة *
                  </label>
                  <input
                    type="password"
                    value={formData.security.newPassword}
                    onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور الجديدة *
                  </label>
                  <input
                    type="password"
                    value={formData.security.confirmPassword}
                    onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">معلومات الأمان</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">آخر تسجيل دخول:</span>
                    <span className="text-gray-600 mr-2">
                      {new Date().toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">المتصفح:</span>
                    <span className="text-gray-600 mr-2">Chrome (Windows)</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">عنوان IP:</span>
                    <span className="text-gray-600 mr-2">192.168.1.1</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">المصادقة الثنائية:</span>
                    <span className="text-red-600 mr-2">غير مفعلة</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;