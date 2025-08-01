// src/components/consent/ConsentManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/index.jsx';
import './ConsentManager.css';

const ConsentManager = () => {
  const { user, updateUserConsents } = useAuth();
  const [consents, setConsents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // تعريف أنواع الموافقات
  const consentTypes = {
    personalDataProcessing: {
      title: 'معالجة البيانات الشخصية',
      description: 'الموافقة على جمع ومعالجة بياناتكم الشخصية الأساسية (الاسم، البريد الإلكتروني، رقم الهاتف) لأغراض إدارة العضوية وتقديم الخدمات.',
      required: true,
      category: 'أساسية',
      icon: '🔒',
      consequences: {
        granted: 'سنتمكن من إدارة عضويتكم وتقديم جميع الخدمات المطلوبة.',
        denied: 'لن نتمكن من تقديم خدمات العضوية أو التواصل معكم.'
      }
    },
    membershipManagement: {
      title: 'إدارة العضوية والخدمات',
      description: 'الموافقة على استخدام بياناتكم لإدارة عضويتكم، معالجة المدفوعات، وتقديم الخدمات المطلوبة من الجمعية.',
      required: true,
      category: 'أساسية',
      icon: '👥',
      consequences: {
        granted: 'سنتمكن من إدارة عضويتكم ومعالجة المدفوعات وتقديم الخدمات.',
        denied: 'لن تتمكنوا من الحصول على خدمات العضوية أو المشاركة في الأنشطة.'
      }
    },
    profileVisibility: {
      title: 'عرض الملف الشخصي',
      description: 'الموافقة على عرض معلوماتكم الأكاديمية (الاسم، التخصص، المؤسسة) في دليل الأعضاء وصفحات المشاركين في الفعاليات.',
      required: false,
      category: 'اختيارية',
      icon: '👤',
      consequences: {
        granted: 'سيظهر ملفكم الشخصي للأعضاء الآخرين والمهتمين بالأنشطة.',
        denied: 'ستبقى معلوماتكم خاصة ولن تظهر في دليل الأعضاء.'
      }
    },
    marketingCommunications: {
      title: 'التسويق والإشعارات الترويجية',
      description: 'الموافقة على إرسال رسائل تسويقية، النشرات الإخبارية، والدعوات للفعاليات والمؤتمرات عبر البريد الإلكتروني أو الرسائل النصية.',
      required: false,
      category: 'اختيارية',
      icon: '📧',
      consequences: {
        granted: 'ستتلقون إشعارات حول الفعاليات والأخبار والعروض الخاصة.',
        denied: 'ستتلقون فقط الإشعارات الأساسية المتعلقة بعضويتكم.'
      }
    },
    activityTracking: {
      title: 'تتبع النشاط والتحليلات',
      description: 'الموافقة على تتبع نشاطكم في الموقع (الصفحات المزارة، الوقت المقضي، التقييمات) لتحسين الخدمات وتخصيص المحتوى.',
      required: false,
      category: 'اختيارية',
      icon: '📊',
      consequences: {
        granted: 'سنتمكن من تقديم تجربة مخصصة وتحسين خدماتنا بناءً على تفضيلاتكم.',
        denied: 'ستحصلون على تجربة موحدة بدون تخصيص.'
      }
    },
    researchParticipation: {
      title: 'المشاركة في الأبحاث',
      description: 'الموافقة على استخدام بياناتكم المجمعة (بدون هوية شخصية) في الأبحاث الأكاديمية والإحصائيات العامة للجمعية.',
      required: false,
      category: 'اختيارية',
      icon: '🔬',
      consequences: {
        granted: 'ستساهمون في تطوير البحث العلمي في مجال العلوم السياسية.',
        denied: 'لن تُستخدم بياناتكم في أي أبحاث أكاديمية.'
      }
    },
    thirdPartySharing: {
      title: 'مشاركة البيانات مع الشركاء',
      description: 'الموافقة على مشاركة بياناتكم مع الشركاء الأكاديميين والمؤسسات البحثية ذات الصلة لأغراض التعاون الأكاديمي.',
      required: false,
      category: 'اختيارية',
      icon: '🤝',
      consequences: {
        granted: 'قد تتلقون دعوات للمشاركة في أنشطة وأبحاث مع مؤسسات شريكة.',
        denied: 'لن نشارك بياناتكم مع أي جهة خارجية.'
      }
    }
  };

  // تحميل الموافقات الحالية
  useEffect(() => {
    const loadConsents = async () => {
      try {
        setLoading(true);
        
        // محاولة جلب الموافقات من localStorage أو قاعدة البيانات
        const savedConsents = localStorage.getItem(`user_consents_${user?.id}`);
        
        if (savedConsents) {
          const parsedConsents = JSON.parse(savedConsents);
          setConsents(parsedConsents);
        } else {
          // إعداد افتراضي للموافقات الجديدة
          const defaultConsents = {};
          Object.keys(consentTypes).forEach(key => {
            defaultConsents[key] = {
              granted: consentTypes[key].required || false,
              timestamp: new Date().toISOString(),
              version: '1.0',
              method: 'default'
            };
          });
          setConsents(defaultConsents);
        }
      } catch (error) {
        console.error('خطأ في تحميل الموافقات:', error);
        setMessage({ type: 'error', text: 'حدث خطأ في تحميل إعدادات الموافقة' });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadConsents();
    }
  }, [user]);

  // حفظ التغييرات
  const handleConsentChange = async (consentType, granted) => {
    try {
      const updatedConsents = {
        ...consents,
        [consentType]: {
          granted,
          timestamp: new Date().toISOString(),
          version: '1.0',
          method: 'user_update'
        }
      };

      setConsents(updatedConsents);
      
      // حفظ في localStorage (في التطبيق الحقيقي، سيتم الحفظ في قاعدة البيانات)
      localStorage.setItem(`user_consents_${user?.id}`, JSON.stringify(updatedConsents));
      
      // إشعار المستخدم
      setMessage({ 
        type: 'success', 
        text: `تم ${granted ? 'منح' : 'سحب'} الموافقة على ${consentTypes[consentType].title} بنجاح` 
      });

      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('خطأ في حفظ الموافقة:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في حفظ التغييرات' });
    }
  };

  // حفظ جميع التغييرات
  const saveAllConsents = async () => {
    try {
      setSaving(true);
      
      // في التطبيق الحقيقي، سيتم إرسال البيانات للخادم
      await new Promise(resolve => setTimeout(resolve, 1000)); // محاكاة
      
      if (updateUserConsents) {
        await updateUserConsents(consents);
      }
      
      setMessage({ type: 'success', text: 'تم حفظ جميع إعدادات الموافقة بنجاح' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('خطأ في حفظ الموافقات:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="consent-manager loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل إعدادات الموافقة...</p>
      </div>
    );
  }

  return (
    <div className="consent-manager" dir="rtl">
      
      {/* Header */}
      <div className="consent-header">
        <h2 className="consent-title">إدارة الموافقات والخصوصية</h2>
        <p className="consent-subtitle">
          يمكنكم هنا إدارة موافقاتكم على استخدام بياناتكم الشخصية وفقاً لقانون حماية البيانات الشخصية السعودي
        </p>
      </div>

      {/* رسالة الحالة */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '❌'}
          </span>
          {message.text}
        </div>
      )}

      {/* تنبيه مهم */}
      <div className="important-notice">
        <div className="notice-icon">⚠️</div>
        <div className="notice-content">
          <h3>تنبيه مهم</h3>
          <p>
            الموافقات المطلوبة (الأساسية) ضرورية لتقديم خدمات العضوية. 
            يمكنكم سحب الموافقات الاختيارية في أي وقت دون تأثير على عضويتكم الأساسية.
          </p>
        </div>
      </div>

      {/* قائمة الموافقات */}
      <div className="consents-list">
        
        {/* الموافقات الأساسية */}
        <div className="consent-category">
          <h3 className="category-title">
            <span className="category-icon">🔒</span>
            الموافقات الأساسية (مطلوبة)
          </h3>
          <p className="category-description">
            هذه الموافقات ضرورية لتقديم خدمات العضوية ولا يمكن إلغاؤها
          </p>
          
          {Object.entries(consentTypes)
            .filter(([key, consent]) => consent.required)
            .map(([key, consent]) => (
              <ConsentItem
                key={key}
                consentKey={key}
                consent={consent}
                currentConsent={consents[key]}
                onConsentChange={handleConsentChange}
                disabled={consent.required}
              />
            ))}
        </div>

        {/* الموافقات الاختيارية */}
        <div className="consent-category">
          <h3 className="category-title">
            <span className="category-icon">⚙️</span>
            الموافقات الاختيارية
          </h3>
          <p className="category-description">
            يمكنكم اختيار منح أو سحب هذه الموافقات حسب تفضيلاتكم
          </p>
          
          {Object.entries(consentTypes)
            .filter(([key, consent]) => !consent.required)
            .map(([key, consent]) => (
              <ConsentItem
                key={key}
                consentKey={key}
                consent={consent}
                currentConsent={consents[key]}
                onConsentChange={handleConsentChange}
                disabled={false}
              />
            ))}
        </div>
      </div>

      {/* أزرار العمل */}
      <div className="consent-actions">
        <button 
          className="btn btn-primary"
          onClick={saveAllConsents}
          disabled={saving}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </button>
        
        <button className="btn btn-secondary">
          تصدير سجل الموافقات
        </button>
        
        <button className="btn btn-outline btn-danger">
          سحب جميع الموافقات الاختيارية
        </button>
      </div>

      {/* معلومات إضافية */}
      <div className="consent-info">
        <h3>معلومات مهمة</h3>
        <ul>
          <li>يتم حفظ جميع التغييرات تلقائياً مع الطابع الزمني</li>
          <li>يمكنكم تغيير موافقاتكم في أي وقت</li>
          <li>سيتم إشعاركم عند أي تغيير في سياسة الخصوصية</li>
          <li>لديكم الحق في طلب حذف جميع بياناتكم</li>
        </ul>
        
        <div className="contact-info">
          <p><strong>للاستفسارات:</strong> privacy@spsa.org.sa</p>
          <p><strong>الهاتف:</strong> +966-11-XXXXXXX</p>
        </div>
      </div>

    </div>
  );
};

// مكون عنصر الموافقة الفردي
const ConsentItem = ({ consentKey, consent, currentConsent, onConsentChange, disabled }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const isGranted = currentConsent?.granted || false;
  const lastUpdated = currentConsent?.timestamp ? 
    new Date(currentConsent.timestamp).toLocaleDateString('ar-SA') : 
    'غير محدد';

  return (
    <div className={`consent-item ${isGranted ? 'granted' : 'denied'} ${disabled ? 'disabled' : ''}`}>
      
      {/* رأس العنصر */}
      <div className="consent-header-item">
        <div className="consent-info-basic">
          <div className="consent-icon">{consent.icon}</div>
          <div className="consent-text">
            <h4 className="consent-title-item">{consent.title}</h4>
            <p className="consent-description">{consent.description}</p>
          </div>
        </div>
        
        <div className="consent-controls">
          <div className="consent-status">
            <span className={`status-badge ${isGranted ? 'granted' : 'denied'}`}>
              {isGranted ? 'مُفعل' : 'مُعطل'}
            </span>
          </div>
          
          <div className="consent-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isGranted}
                onChange={(e) => onConsentChange(consentKey, e.target.checked)}
                disabled={disabled}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* تفاصيل إضافية */}
      <div className="consent-details">
        <button 
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          <span className={`arrow ${showDetails ? 'up' : 'down'}`}>▼</span>
        </button>
        
        {showDetails && (
          <div className="details-content">
            <div className="consequences">
              <h5>تأثير الموافقة:</h5>
              <div className="consequence granted-consequence">
                <strong>عند الموافقة:</strong> {consent.consequences.granted}
              </div>
              <div className="consequence denied-consequence">
                <strong>عند الرفض:</strong> {consent.consequences.denied}
              </div>
            </div>
            
            <div className="metadata">
              <p><strong>آخر تحديث:</strong> {lastUpdated}</p>
              <p><strong>النسخة:</strong> {currentConsent?.version || '1.0'}</p>
              <p><strong>الفئة:</strong> {consent.category}</p>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ConsentManager;