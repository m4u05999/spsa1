// src/components/privacy/DataDeletionRequest.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/index.jsx';
import './DataDeletionRequest.css';

const DataDeletionRequest = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    reason: '',
    customReason: '',
    confirmDeletion: false,
    confirmUnderstanding: false,
    confirmNoReturn: false,
    keepArchive: false,
    backupRequested: false
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState({});

  // أسباب طلب الحذف
  const deletionReasons = [
    {
      id: 'no_longer_needed',
      title: 'لم أعد بحاجة للخدمة',
      description: 'لا أرغب في استخدام خدمات الجمعية بعد الآن'
    },
    {
      id: 'privacy_concerns',
      title: 'مخاوف بشأن الخصوصية',
      description: 'لدي مخاوف حول كيفية استخدام بياناتي الشخصية'
    },
    {
      id: 'data_accuracy',
      title: 'مشاكل في دقة البيانات',
      description: 'البيانات المحفوظة غير صحيحة ولا يمكن تصحيحها'
    },
    {
      id: 'security_breach',
      title: 'مخاوف أمنية',
      description: 'أشك في حدوث خرق أمني لحسابي'
    },
    {
      id: 'legal_requirement',
      title: 'متطلب قانوني',
      description: 'مطالبة قانونية بحذف البيانات'
    },
    {
      id: 'other',
      title: 'سبب آخر',
      description: 'سبب غير مذكور أعلاه'
    }
  ];

  // تحميل بيانات المستخدم
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // في التطبيق الحقيقي، سيتم جلب البيانات من الخادم
        const mockUserData = {
          personalInfo: {
            name: user?.name || 'غير محدد',
            email: user?.email || 'غير محدد',
            phone: user?.phone || 'غير محدد',
            membershipType: 'عضو عادي',
            joinDate: '2024-01-15'
          },
          dataCategories: [
            { category: 'البيانات الشخصية الأساسية', count: '5 حقول', critical: true },
            { category: 'بيانات العضوية والاشتراكات', count: '12 سجل', critical: true },
            { category: 'سجل النشاطات والمشاركات', count: '8 أنشطة', critical: false },
            { category: 'تفضيلات الإشعارات', count: '6 إعدادات', critical: false },
            { category: 'سجل تسجيل الدخول', count: '24 سجل', critical: false },
            { category: 'الملفات المرفوعة', count: '3 ملفات', critical: false }
          ],
          totalRecords: 58,
          lastActivity: new Date(Date.now() - 86400000 * 7).toLocaleDateString('ar-SA')
        };
        
        setUserData(mockUserData);
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        setMessage({ type: 'error', text: 'حدث خطأ في تحميل البيانات' });
      }
    };

    if (user?.id) {
      loadUserData();
    }
  }, [user]);

  // معالجة تغيير البيانات
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // التقدم للخطوة التالية
  const nextStep = () => {
    if (step === 1 && !formData.reason) {
      setMessage({ type: 'error', text: 'يرجى اختيار سبب طلب الحذف' });
      return;
    }
    
    if (step === 1 && formData.reason === 'other' && !formData.customReason.trim()) {
      setMessage({ type: 'error', text: 'يرجى تحديد السبب' });
      return;
    }

    if (step === 3 && (!formData.confirmDeletion || !formData.confirmUnderstanding || !formData.confirmNoReturn)) {
      setMessage({ type: 'error', text: 'يرجى تأكيد جميع النقاط للمتابعة' });
      return;
    }

    setMessage({ type: '', text: '' });
    setStep(prev => prev + 1);
  };

  // العودة للخطوة السابقة
  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
    setMessage({ type: '', text: '' });
  };

  // تقديم طلب الحذف
  const submitDeletionRequest = async () => {
    try {
      setLoading(true);
      
      // في التطبيق الحقيقي، سيتم إرسال الطلب للخادم
      await new Promise(resolve => setTimeout(resolve, 2000)); // محاكاة
      
      const requestData = {
        userId: user?.id,
        reason: formData.reason,
        customReason: formData.customReason,
        keepArchive: formData.keepArchive,
        backupRequested: formData.backupRequested,
        timestamp: new Date().toISOString(),
        requestId: `DEL_${Date.now()}`
      };

      // حفظ الطلب محلياً (في التطبيق الحقيقي سيكون في قاعدة البيانات)
      localStorage.setItem(`deletion_request_${user?.id}`, JSON.stringify(requestData));
      
      setMessage({ 
        type: 'success', 
        text: 'تم تقديم طلب حذف البيانات بنجاح. سيتم التواصل معكم خلال 30 يوماً.' 
      });
      
      setStep(5); // الانتقال لصفحة التأكيد

    } catch (error) {
      console.error('خطأ في تقديم طلب الحذف:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في تقديم الطلب. يرجى المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  // طلب نسخة من البيانات
  const requestDataExport = async () => {
    try {
      setLoading(true);
      
      // محاكاة تصدير البيانات
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // إنشاء ملف JSON وهمي للبيانات
      const exportData = {
        exportDate: new Date().toISOString(),
        userData: userData,
        consents: JSON.parse(localStorage.getItem(`user_consents_${user?.id}`) || '{}'),
        note: 'هذه نسخة من جميع بياناتكم المحفوظة لدى الجمعية السعودية للعلوم السياسية'
      };

      // تحويل إلى JSON وتنزيل
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `my_data_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'تم تصدير بياناتكم بنجاح' });
      handleInputChange('backupRequested', true);

    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في تصدير البيانات' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-deletion-request" dir="rtl">
      
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={`progress-step ${step >= num ? 'active' : ''} ${step === num ? 'current' : ''}`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '❌'}
          </span>
          {message.text}
        </div>
      )}

      {/* Step 1: Reason Selection */}
      {step === 1 && (
        <div className="step-content">
          <div className="step-header">
            <h2 className="step-title">سبب طلب حذف البيانات</h2>
            <p className="step-description">
              يرجى اختيار السبب الرئيسي لطلب حذف بياناتكم الشخصية
            </p>
          </div>

          <div className="reasons-list">
            {deletionReasons.map((reason) => (
              <label
                key={reason.id}
                className={`reason-option ${formData.reason === reason.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  checked={formData.reason === reason.id}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                />
                <div className="reason-content">
                  <h4 className="reason-title">{reason.title}</h4>
                  <p className="reason-description">{reason.description}</p>
                </div>
                <span className="reason-indicator">
                  {formData.reason === reason.id ? '●' : '○'}
                </span>
              </label>
            ))}
          </div>

          {formData.reason === 'other' && (
            <div className="custom-reason">
              <label htmlFor="customReason">تحديد السبب:</label>
              <textarea
                id="customReason"
                value={formData.customReason}
                onChange={(e) => handleInputChange('customReason', e.target.value)}
                placeholder="يرجى توضيح السبب بالتفصيل..."
                rows="4"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Data Overview */}
      {step === 2 && (
        <div className="step-content">
          <div className="step-header">
            <h2 className="step-title">نظرة عامة على بياناتكم</h2>
            <p className="step-description">
              هذه البيانات التي سيتم حذفها من نظامنا
            </p>
          </div>

          <div className="user-data-overview">
            <div className="data-summary">
              <h3>معلومات العضوية</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">الاسم:</span>
                  <span className="value">{userData.personalInfo?.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">البريد الإلكتروني:</span>
                  <span className="value">{userData.personalInfo?.email}</span>
                </div>
                <div className="summary-item">
                  <span className="label">نوع العضوية:</span>
                  <span className="value">{userData.personalInfo?.membershipType}</span>
                </div>
                <div className="summary-item">
                  <span className="label">تاريخ الانضمام:</span>
                  <span className="value">{userData.personalInfo?.joinDate}</span>
                </div>
                <div className="summary-item">
                  <span className="label">آخر نشاط:</span>
                  <span className="value">{userData.lastActivity}</span>
                </div>
                <div className="summary-item">
                  <span className="label">إجمالي السجلات:</span>
                  <span className="value">{userData.totalRecords} سجل</span>
                </div>
              </div>
            </div>

            <div className="data-categories">
              <h3>فئات البيانات</h3>
              <div className="categories-list">
                {userData.dataCategories?.map((category, index) => (
                  <div
                    key={index}
                    className={`category-item ${category.critical ? 'critical' : 'optional'}`}
                  >
                    <div className="category-info">
                      <h4 className="category-name">{category.category}</h4>
                      <p className="category-count">{category.count}</p>
                    </div>
                    <div className="category-status">
                      <span className={`status-badge ${category.critical ? 'critical' : 'optional'}`}>
                        {category.critical ? 'حرجة' : 'اختيارية'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="step-content">
          <div className="step-header">
            <h2 className="step-title">تأكيد طلب الحذف</h2>
            <p className="step-description">
              يرجى قراءة والموافقة على النقاط التالية قبل المتابعة
            </p>
          </div>

          <div className="confirmation-section">
            <div className="warning-box">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h3>تحذير مهم</h3>
                <p>
                  حذف البيانات عملية لا يمكن التراجع عنها. بمجرد تأكيد الحذف، 
                  سيتم محو جميع بياناتكم نهائياً من أنظمتنا.
                </p>
              </div>
            </div>

            <div className="confirmations-list">
              <label className="confirmation-item">
                <input
                  type="checkbox"
                  checked={formData.confirmDeletion}
                  onChange={(e) => handleInputChange('confirmDeletion', e.target.checked)}
                />
                <span className="confirmation-text">
                  أؤكد أنني أرغب في حذف جميع بياناتي الشخصية نهائياً من نظام الجمعية السعودية للعلوم السياسية
                </span>
              </label>

              <label className="confirmation-item">
                <input
                  type="checkbox"
                  checked={formData.confirmUnderstanding}
                  onChange={(e) => handleInputChange('confirmUnderstanding', e.target.checked)}
                />
                <span className="confirmation-text">
                  أفهم أن هذا الإجراء لا يمكن التراجع عنه وأنني سأفقد جميع البيانات والسجلات المرتبطة بحسابي
                </span>
              </label>

              <label className="confirmation-item">
                <input
                  type="checkbox"
                  checked={formData.confirmNoReturn}
                  onChange={(e) => handleInputChange('confirmNoReturn', e.target.checked)}
                />
                <span className="confirmation-text">
                  أدرك أنني لن أتمكن من استرداد أي من هذه البيانات مستقبلاً وأنني مسؤول عن هذا القرار
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Final Options */}
      {step === 4 && (
        <div className="step-content">
          <div className="step-header">
            <h2 className="step-title">خيارات إضافية</h2>
            <p className="step-description">
              خيارات أخيرة قبل تقديم طلب الحذف
            </p>
          </div>

          <div className="final-options">
            <div className="option-card">
              <div className="option-header">
                <h3>نسخة احتياطية من بياناتكم</h3>
                <p>احصلوا على نسخة من جميع بياناتكم قبل الحذف</p>
              </div>
              <div className="option-actions">
                <button
                  className="btn btn-outline"
                  onClick={requestDataExport}
                  disabled={loading}
                >
                  {loading ? 'جاري التصدير...' : 'تصدير البيانات'}
                </button>
                {formData.backupRequested && (
                  <span className="success-indicator">✅ تم التصدير</span>
                )}
              </div>
            </div>

            <div className="option-card">
              <div className="option-header">
                <h3>الاحتفاظ بأرشيف مجهول الهوية</h3>
                <p>الاحتفاظ بالبيانات الإحصائية فقط (بدون معلومات شخصية) لأغراض البحث العلمي</p>
              </div>
              <div className="option-actions">
                <label className="archive-option">
                  <input
                    type="checkbox"
                    checked={formData.keepArchive}
                    onChange={(e) => handleInputChange('keepArchive', e.target.checked)}
                  />
                  <span>السماح بالاحتفاظ بأرشيف مجهول الهوية</span>
                </label>
              </div>
            </div>

            <div className="deletion-info">
              <h3>معلومات عملية الحذف</h3>
              <ul>
                <li>سيتم حذف البيانات خلال 30 يوماً من تاريخ الطلب</li>
                <li>ستتلقون تأكيداً نهائياً عند اكتمال عملية الحذف</li>
                <li>يمكنكم إلغاء الطلب خلال 7 أيام من تاريخ التقديم</li>
                <li>بعض البيانات قد تبقى في النسخ الاحتياطية لفترة إضافية حسب القانون</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="step-content">
          <div className="success-page">
            <div className="success-icon">✅</div>
            <h2 className="success-title">تم تقديم طلب الحذف بنجاح</h2>
            <p className="success-description">
              شكراً لكم. تم تقديم طلبكم لحذف البيانات الشخصية بنجاح.
            </p>

            <div className="next-steps">
              <h3>الخطوات القادمة:</h3>
              <ol>
                <li>ستتلقون رسالة تأكيد عبر البريد الإلكتروني خلال 24 ساعة</li>
                <li>سيتم مراجعة طلبكم من قبل فريق حماية البيانات</li>
                <li>يمكنكم إلغاء الطلب خلال 7 أيام من اليوم</li>
                <li>سيتم تنفيذ الحذف خلال 30 يوماً من تاريخ اليوم</li>
                <li>ستتلقون تأكيداً نهائياً عند اكتمال عملية الحذف</li>
              </ol>
            </div>

            <div className="contact-info">
              <h3>للاستفسارات:</h3>
              <p><strong>البريد الإلكتروني:</strong> privacy@spsa.org.sa</p>
              <p><strong>الهاتف:</strong> +966-11-XXXXXXX</p>
              <p><strong>رقم الطلب:</strong> DEL_{Date.now()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="navigation-actions">
        {step > 1 && step < 5 && (
          <button
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={loading}
          >
            السابق
          </button>
        )}

        {step < 3 && (
          <button
            className="btn btn-primary"
            onClick={nextStep}
            disabled={loading}
          >
            التالي
          </button>
        )}

        {step === 3 && (
          <button
            className="btn btn-primary"
            onClick={nextStep}
            disabled={loading || !formData.confirmDeletion || !formData.confirmUnderstanding || !formData.confirmNoReturn}
          >
            المتابعة
          </button>
        )}

        {step === 4 && (
          <button
            className="btn btn-danger"
            onClick={submitDeletionRequest}
            disabled={loading}
          >
            {loading ? 'جاري التقديم...' : 'تقديم طلب الحذف'}
          </button>
        )}

        {step === 5 && (
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            العودة للصفحة الرئيسية
          </button>
        )}
      </div>

    </div>
  );
};

export default DataDeletionRequest;