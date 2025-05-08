// src/pages/dashboard/modules/SystemSettings.jsx
import React, { useState, useEffect } from 'react';

const SystemSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'الجمعية السعودية للعلوم السياسية',
      siteDescription: 'البوابة الإلكترونية الرسمية للجمعية السعودية للعلوم السياسية',
      siteEmail: 'contact@saudipolsci.org',
      phoneNumber: '+966 11 123 4567',
      address: 'الرياض، المملكة العربية السعودية',
      logoUrl: '/assets/images/logo.png',
      primaryColor: '#1a8917',
      secondaryColor: '#daa520',
      faviconUrl: '/assets/images/favicon.ico',
    },
    language: {
      defaultLanguage: 'ar',
      enableEnglish: true,
      timezone: 'Asia/Riyadh',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24',
      firstDayOfWeek: 'saturday',
    },
    backup: {
      automaticBackup: true,
      backupFrequency: 'daily',
      backupTime: '03:00',
      retentionDays: 30,
      storageLimit: 5, // GB
      lastBackupDate: '2024-05-01T03:00:00',
      backupLocation: 'cloud',
    },
    social: {
      twitter: 'https://twitter.com/saudipolsci',
      facebook: 'https://facebook.com/saudipolsci',
      linkedin: 'https://linkedin.com/company/saudipolsci',
      youtube: '',
      instagram: '',
    },
    email: {
      smtpServer: 'smtp.example.com',
      smtpPort: '587',
      smtpUsername: 'mail@domain.com',
      smtpPassword: '********',
      senderName: 'الجمعية السعودية للعلوم السياسية',
      senderEmail: 'no-reply@saudipolsci.org',
    },
    notifications: {
      emailNotifications: true,
      newMembershipAlert: true,
      newInquiryAlert: true,
      eventReminders: true,
      newsletterFrequency: 'weekly',
    },
    security: {
      requireEmailVerification: true,
      twoFactorAuth: false,
      passwordMinLength: 8,
      passwordRequireSpecialChar: true,
      passwordRequireNumbers: true,
      sessionTimeout: 120,
      maxLoginAttempts: 5,
    },
  });
  
  // Handle form input changes
  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (section, field) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: !settings[section][field]
      }
    });
  };
  
  // Save settings
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // In a real app, this would be an API call
      // For now, simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message or action would happen here
      alert('تم حفظ الإعدادات بنجاح');
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
      setIsSaving(false);
    }
  };
  
  // Tab navigation classes
  const getTabClasses = (tabName) => {
    return tabName === activeTab
      ? 'border-blue-500 text-blue-600 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm cursor-pointer';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          <a
            className={getTabClasses('general')}
            onClick={() => setActiveTab('general')}
          >
            إعدادات عامة
          </a>
          <a
            className={getTabClasses('language')}
            onClick={() => setActiveTab('language')}
          >
            اللغة والمنطقة
          </a>
          <a
            className={getTabClasses('backup')}
            onClick={() => setActiveTab('backup')}
          >
            النسخ الاحتياطي
          </a>
          <a
            className={getTabClasses('social')}
            onClick={() => setActiveTab('social')}
          >
            وسائل التواصل
          </a>
          <a
            className={getTabClasses('email')}
            onClick={() => setActiveTab('email')}
          >
            البريد الإلكتروني
          </a>
          <a
            className={getTabClasses('notifications')}
            onClick={() => setActiveTab('notifications')}
          >
            الإشعارات
          </a>
          <a
            className={getTabClasses('security')}
            onClick={() => setActiveTab('security')}
          >
            الأمان
          </a>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="py-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات الموقع العامة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Name */}
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الموقع
                </label>
                <input
                  type="text"
                  id="siteName"
                  value={settings.general.siteName}
                  onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
              
              {/* Site Description */}
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  وصف الموقع
                </label>
                <input
                  type="text"
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
              
              {/* Contact Email */}
              <div>
                <label htmlFor="siteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني للاتصال
                </label>
                <input
                  type="email"
                  id="siteEmail"
                  value={settings.general.siteEmail}
                  onChange={(e) => handleChange('general', 'siteEmail', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={settings.general.phoneNumber}
                  onChange={(e) => handleChange('general', 'phoneNumber', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                  dir="ltr"
                />
              </div>
              
              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  id="address"
                  value={settings.general.address}
                  onChange={(e) => handleChange('general', 'address', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">تخصيص المظهر</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شعار الموقع
                  </label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                      {settings.general.logoUrl && (
                        <img 
                          src={settings.general.logoUrl} 
                          alt="logo" 
                          className="max-w-full max-h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="logoUpload"
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('logoUpload').click()}
                        className="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        تغيير الشعار
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    أيقونة الموقع (Favicon)
                  </label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                      {settings.general.faviconUrl && (
                        <img 
                          src={settings.general.faviconUrl} 
                          alt="favicon" 
                          className="max-w-full max-h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="faviconUpload"
                        className="hidden"
                        accept="image/x-icon,image/png"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('faviconUpload').click()}
                        className="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        تغيير الأيقونة
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Primary Color */}
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    اللون الرئيسي
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="color"
                      id="primaryColor"
                      value={settings.general.primaryColor}
                      onChange={(e) => handleChange('general', 'primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-md border border-gray-300 p-1"
                    />
                    <input
                      type="text"
                      value={settings.general.primaryColor}
                      onChange={(e) => handleChange('general', 'primaryColor', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                {/* Secondary Color */}
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    اللون الثانوي
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={settings.general.secondaryColor}
                      onChange={(e) => handleChange('general', 'secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded-md border border-gray-300 p-1"
                    />
                    <input
                      type="text"
                      value={settings.general.secondaryColor}
                      onChange={(e) => handleChange('general', 'secondaryColor', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Language and Region Settings Tab */}
        {activeTab === 'language' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ضبط اللغة والمنطقة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Language */}
              <div>
                <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                  اللغة الافتراضية
                </label>
                <select
                  id="defaultLanguage"
                  value={settings.language.defaultLanguage}
                  onChange={(e) => handleChange('language', 'defaultLanguage', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                >
                  <option value="ar">العربية</option>
                  <option value="en">الإنجليزية</option>
                </select>
              </div>
              
              {/* Enable English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تفعيل اللغة الإنجليزية
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEnglish"
                    checked={settings.language.enableEnglish}
                    onChange={() => handleCheckboxChange('language', 'enableEnglish')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableEnglish" className="mr-2 block text-sm text-gray-700">
                    تفعيل واجهة المستخدم باللغة الإنجليزية
                  </label>
                </div>
              </div>
              
              {/* Timezone */}
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  المنطقة الزمنية
                </label>
                <select
                  id="timezone"
                  value={settings.language.timezone}
                  onChange={(e) => handleChange('language', 'timezone', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                >
                  <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                  <option value="Asia/Jeddah">جدة (GMT+3)</option>
                  <option value="Asia/Dubai">دبي (GMT+4)</option>
                  <option value="Europe/London">لندن (GMT+0/+1)</option>
                  <option value="America/New_York">نيويورك (GMT-5/-4)</option>
                </select>
              </div>
              
              {/* Date Format */}
              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                  تنسيق التاريخ
                </label>
                <select
                  id="dateFormat"
                  value={settings.language.dateFormat}
                  onChange={(e) => handleChange('language', 'dateFormat', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (31-12-2025)</option>
                </select>
              </div>
              
              {/* Time Format */}
              <div>
                <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 mb-1">
                  تنسيق الوقت
                </label>
                <select
                  id="timeFormat"
                  value={settings.language.timeFormat}
                  onChange={(e) => handleChange('language', 'timeFormat', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                >
                  <option value="24">24 ساعة (14:30)</option>
                  <option value="12">12 ساعة (2:30 م)</option>
                </select>
              </div>
              
              {/* First Day of Week */}
              <div>
                <label htmlFor="firstDayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                  اليوم الأول من الأسبوع
                </label>
                <select
                  id="firstDayOfWeek"
                  value={settings.language.firstDayOfWeek}
                  onChange={(e) => handleChange('language', 'firstDayOfWeek', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                >
                  <option value="saturday">السبت</option>
                  <option value="sunday">الأحد</option>
                  <option value="monday">الاثنين</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-yellow-700">
                    سيتم تطبيق التغييرات على إعدادات اللغة والمنطقة بعد إعادة تحميل الموقع.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Backup Settings Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات النسخ الاحتياطي</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Automatic Backup */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">النسخ الاحتياطي التلقائي</h4>
                    <p className="text-sm text-gray-500 mt-1">تفعيل النسخ الاحتياطي التلقائي للبيانات</p>
                  </div>
                  <div>
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.backup.automaticBackup}
                        onChange={() => handleCheckboxChange('backup', 'automaticBackup')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Backup Settings */}
              <div>
                <fieldset className="space-y-4">
                  <legend className="text-sm font-medium text-gray-700">جدولة النسخ الاحتياطي التلقائي</legend>
                  
                  {/* Backup Frequency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                        تكرار النسخ الاحتياطي
                      </label>
                      <select
                        id="backupFrequency"
                        value={settings.backup.backupFrequency}
                        onChange={(e) => handleChange('backup', 'backupFrequency', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                        disabled={!settings.backup.automaticBackup}
                      >
                        <option value="hourly">كل ساعة</option>
                        <option value="daily">يوميًا</option>
                        <option value="weekly">أسبوعيًا</option>
                        <option value="monthly">شهريًا</option>
                      </select>
                    </div>
                    
                    {/* Backup Time */}
                    <div>
                      <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700 mb-1">
                        وقت النسخ الاحتياطي
                      </label>
                      <input
                        type="time"
                        id="backupTime"
                        value={settings.backup.backupTime}
                        onChange={(e) => handleChange('backup', 'backupTime', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                        disabled={!settings.backup.automaticBackup || settings.backup.backupFrequency === 'hourly'}
                      />
                    </div>
                  </div>
                  
                  {/* Retention Days */}
                  <div>
                    <label htmlFor="retentionDays" className="block text-sm font-medium text-gray-700 mb-1">
                      مدة الاحتفاظ بالنسخ الاحتياطية (بالأيام)
                    </label>
                    <input
                      type="number"
                      id="retentionDays"
                      value={settings.backup.retentionDays}
                      onChange={(e) => handleChange('backup', 'retentionDays', parseInt(e.target.value))}
                      min="1"
                      max="365"
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                      disabled={!settings.backup.automaticBackup}
                    />
                  </div>
                  
                  {/* Storage Limit */}
                  <div>
                    <label htmlFor="storageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                      الحد الأقصى لمساحة التخزين (GB)
                    </label>
                    <input
                      type="number"
                      id="storageLimit"
                      value={settings.backup.storageLimit}
                      onChange={(e) => handleChange('backup', 'storageLimit', parseInt(e.target.value))}
                      min="1"
                      max="100"
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                    />
                  </div>
                  
                  {/* Backup Location */}
                  <div>
                    <label htmlFor="backupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      موقع تخزين النسخ الاحتياطية
                    </label>
                    <select
                      id="backupLocation"
                      value={settings.backup.backupLocation}
                      onChange={(e) => handleChange('backup', 'backupLocation', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                    >
                      <option value="local">خادم محلي</option>
                      <option value="cloud">تخزين سحابي</option>
                      <option value="both">محلي وسحابي</option>
                    </select>
                  </div>
                </fieldset>
              </div>
              
              {/* Manual Backup Options */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">خيارات النسخ الاحتياطي اليدوي</h4>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    إنشاء نسخة احتياطية الآن
                  </button>
                  
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    استعادة من نسخة احتياطية
                  </button>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">آخر نسخة احتياطية</h5>
                  <div className="text-sm text-gray-600">
                    {settings.backup.lastBackupDate ? (
                      <>
                        <p>تاريخ النسخة: {new Date(settings.backup.lastBackupDate).toLocaleString('ar-SA')}</p>
                        <p>الحالة: تم بنجاح</p>
                      </>
                    ) : (
                      <p>لا توجد نسخة احتياطية سابقة</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Other Tabs */}
        {activeTab === 'social' && <h3 className="text-lg font-medium text-gray-900">وسائل التواصل</h3>}
        {activeTab === 'email' && <h3 className="text-lg font-medium text-gray-900">البريد الإلكتروني</h3>}
        {activeTab === 'notifications' && <h3 className="text-lg font-medium text-gray-900">الإشعارات</h3>}
        {activeTab === 'security' && <h3 className="text-lg font-medium text-gray-900">الأمان</h3>}
      </div>
    </div>
  );
};

export default SystemSettings;