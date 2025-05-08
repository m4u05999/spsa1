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
      faviconUrl: '/assets/images/favicon.ico',
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
      
      {/* Tab content will be added in the next part */}
      <div className="py-6">
        {/* Will render tab content based on activeTab */}
        {activeTab === 'general' && <h3>إعدادات عامة</h3>}
        {activeTab === 'social' && <h3>وسائل التواصل</h3>}
        {activeTab === 'email' && <h3>البريد الإلكتروني</h3>}
        {activeTab === 'notifications' && <h3>الإشعارات</h3>}
        {activeTab === 'security' && <h3>الأمان</h3>}
      </div>
    </div>
  );
};

export default SystemSettings;