// src/components/profile/PrivacySettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/index.jsx';
import './PrivacySettings.css';

const PrivacySettings = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // موجز سريع للموافقات
  const consentSummary = {
    personalDataProcessing: {
      title: 'البيانات الشخصية',
      icon: '🔒',
      required: true
    },
    membershipManagement: {
      title: 'إدارة العضوية',
      icon: '👥',
      required: true
    },
    profileVisibility: {
      title: 'عرض الملف الشخصي',
      icon: '👤',
      required: false
    },
    marketingCommunications: {
      title: 'التسويق والإشعارات',
      icon: '📧',
      required: false
    },
    activityTracking: {
      title: 'تتبع النشاط',
      icon: '📊',
      required: false
    },
    researchParticipation: {
      title: 'المشاركة في الأبحاث',
      icon: '🔬',
      required: false
    }
  };

  // تحميل الموافقات
  useEffect(() => {
    const loadConsents = async () => {
      try {
        setLoading(true);
        const savedConsents = localStorage.getItem(`user_consents_${user?.id}`);
        
        if (savedConsents) {
          setConsents(JSON.parse(savedConsents));
        } else {
          // إعداد افتراضي
          const defaultConsents = {};
          Object.keys(consentSummary).forEach(key => {
            defaultConsents[key] = {
              granted: consentSummary[key].required || false,
              timestamp: new Date().toISOString(),
              version: '1.0'
            };
          });
          setConsents(defaultConsents);
        }
      } catch (error) {
        console.error('خطأ في تحميل الموافقات:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadConsents();
    }
  }, [user]);

  // تحديث موافقة واحدة
  const updateConsent = async (consentType, granted) => {
    try {
      const updatedConsents = {
        ...consents,
        [consentType]: {
          granted,
          timestamp: new Date().toISOString(),
          version: '1.0',
          method: 'profile_update'
        }
      };

      setConsents(updatedConsents);
      localStorage.setItem(`user_consents_${user?.id}`, JSON.stringify(updatedConsents));
      
      setMessage({ 
        type: 'success', 
        text: `تم تحديث إعدادات ${consentSummary[consentType].title}` 
      });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('خطأ في تحديث الموافقة:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في حفظ التغييرات' });
    }
  };

  // حساب الإحصائيات
  const getStats = () => {
    const totalConsents = Object.keys(consentSummary).length;
    const grantedConsents = Object.keys(consents).filter(
      key => consents[key]?.granted
    ).length;
    const requiredConsents = Object.keys(consentSummary).filter(
      key => consentSummary[key].required
    ).length;
    const optionalGranted = grantedConsents - requiredConsents;
    const optionalTotal = totalConsents - requiredConsents;

    return {
      total: totalConsents,
      granted: grantedConsents,
      required: requiredConsents,
      optionalGranted,
      optionalTotal,
      percentage: Math.round((grantedConsents / totalConsents) * 100)
    };
  };

  if (loading) {
    return (
      <div className="privacy-settings loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل إعدادات الخصوصية...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="privacy-settings" dir="rtl">
      
      {/* Header */}
      <div className="privacy-header">
        <div className="header-content">
          <h3 className="privacy-title">
            <span className="title-icon">🔐</span>
            إعدادات الخصوصية والموافقات
          </h3>
          <p className="privacy-description">
            إدارة موافقاتكم على استخدام البيانات الشخصية
          </p>
        </div>
        
        <div className="privacy-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.granted}/{stats.total}</div>
            <div className="stat-label">الموافقات النشطة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.percentage}%</div>
            <div className="stat-label">مستوى الخصوصية</div>
          </div>
        </div>
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

      {/* نظرة عامة على الموافقات */}
      <div className="consents-overview">
        <h4 className="overview-title">نظرة عامة على موافقاتكم</h4>
        
        <div className="consents-grid">
          {Object.entries(consentSummary).map(([key, consent]) => {
            const isGranted = consents[key]?.granted || false;
            const isRequired = consent.required;
            
            return (
              <div
                key={key}
                className={`consent-card ${isGranted ? 'granted' : 'denied'} ${isRequired ? 'required' : 'optional'}`}
              >
                <div className="card-header">
                  <div className="card-icon">{consent.icon}</div>
                  <div className="card-info">
                    <h5 className="card-title">{consent.title}</h5>
                    <span className={`card-badge ${isRequired ? 'required' : 'optional'}`}>
                      {isRequired ? 'مطلوبة' : 'اختيارية'}
                    </span>
                  </div>
                </div>
                
                <div className="card-status">
                  <div className={`status-indicator ${isGranted ? 'active' : 'inactive'}`}>
                    {isGranted ? '✓' : '✗'}
                  </div>
                  <span className="status-text">
                    {isGranted ? 'مُفعلة' : 'مُعطلة'}
                  </span>
                </div>
                
                {!isRequired && (
                  <div className="card-toggle">
                    <label className="mini-toggle">
                      <input
                        type="checkbox"
                        checked={isGranted}
                        onChange={(e) => updateConsent(key, e.target.checked)}
                      />
                      <span className="mini-slider"></span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* إعدادات سريعة */}
      <div className="quick-settings">
        <h4 className="section-title">إعدادات سريعة</h4>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">📧</div>
              <div className="setting-text">
                <h5>الإشعارات التسويقية</h5>
                <p>رسائل ترويجية وإعلانات الفعاليات</p>
              </div>
            </div>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={consents.marketingCommunications?.granted || false}
                onChange={(e) => updateConsent('marketingCommunications', e.target.checked)}
              />
              <span className="toggle-slider-mini"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">👤</div>
              <div className="setting-text">
                <h5>عرض الملف الشخصي</h5>
                <p>إظهار معلوماتكم في دليل الأعضاء</p>
              </div>
            </div>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={consents.profileVisibility?.granted || false}
                onChange={(e) => updateConsent('profileVisibility', e.target.checked)}
              />
              <span className="toggle-slider-mini"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">📊</div>
              <div className="setting-text">
                <h5>تتبع النشاط</h5>
                <p>تحسين التجربة وتخصيص المحتوى</p>
              </div>
            </div>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={consents.activityTracking?.granted || false}
                onChange={(e) => updateConsent('activityTracking', e.target.checked)}
              />
              <span className="toggle-slider-mini"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">🔬</div>
              <div className="setting-text">
                <h5>المشاركة في الأبحاث</h5>
                <p>استخدام البيانات للأبحاث الأكاديمية</p>
              </div>
            </div>
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={consents.researchParticipation?.granted || false}
                onChange={(e) => updateConsent('researchParticipation', e.target.checked)}
              />
              <span className="toggle-slider-mini"></span>
            </label>
          </div>
        </div>
      </div>

      {/* تحليل الخصوصية */}
      <div className="privacy-analysis">
        <h4 className="section-title">تحليل مستوى الخصوصية</h4>
        
        <div className="analysis-content">
          <div className="privacy-meter">
            <div className="meter-header">
              <h5>مستوى الخصوصية الحالي</h5>
              <span className="meter-percentage">{stats.percentage}%</span>
            </div>
            <div className="meter-bar">
              <div 
                className="meter-fill"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <div className="meter-labels">
              <span>خصوصية عالية</span>
              <span>خصوصية متوسطة</span>
              <span>خصوصية منخفضة</span>
            </div>
          </div>
          
          <div className="privacy-tips">
            <h5>نصائح للخصوصية</h5>
            <ul>
              <li>
                <span className="tip-icon">💡</span>
                يمكنكم تغيير موافقاتكم في أي وقت
              </li>
              <li>
                <span className="tip-icon">🔒</span>
                الموافقات المطلوبة ضرورية لتشغيل الخدمة
              </li>
              <li>
                <span className="tip-icon">📋</span>
                راجعوا سياسة الخصوصية للمزيد من التفاصيل
              </li>
              <li>
                <span className="tip-icon">📞</span>
                تواصلوا معنا لأي استفسارات حول الخصوصية
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* روابط مهمة */}
      <div className="privacy-links">
        <h4 className="section-title">روابط مهمة</h4>
        
        <div className="links-grid">
          <a href="/privacy-policy" className="link-card">
            <div className="link-icon">📋</div>
            <div className="link-content">
              <h5>سياسة الخصوصية</h5>
              <p>اطلعوا على سياسة الخصوصية الكاملة</p>
            </div>
            <span className="link-arrow">←</span>
          </a>
          
          <a href="/data-export" className="link-card">
            <div className="link-icon">📤</div>
            <div className="link-content">
              <h5>تصدير البيانات</h5>
              <p>احصلوا على نسخة من بياناتكم</p>
            </div>
            <span className="link-arrow">←</span>
          </a>
          
          <a href="/data-deletion" className="link-card">
            <div className="link-icon">🗑️</div>
            <div className="link-content">
              <h5>حذف البيانات</h5>
              <p>طلب حذف بياناتكم نهائياً</p>
            </div>
            <span className="link-arrow">←</span>
          </a>
          
          <a href="/privacy-contact" className="link-card">
            <div className="link-icon">📞</div>
            <div className="link-content">
              <h5>التواصل</h5>
              <p>تواصلوا معنا لأي استفسارات</p>
            </div>
            <span className="link-arrow">←</span>
          </a>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="additional-info">
        <div className="info-box">
          <h5>معلومات مهمة</h5>
          <ul>
            <li>آخر تحديث للموافقات: {consents.personalDataProcessing?.timestamp ? 
                new Date(consents.personalDataProcessing.timestamp).toLocaleDateString('ar-SA') : 
                'غير محدد'}</li>
            <li>جميع التغييرات محفوظة تلقائياً</li>
            <li>يمكنكم مراجعة سجل الموافقات في أي وقت</li>
            <li>نلتزم بقانون حماية البيانات الشخصية السعودي</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default PrivacySettings;