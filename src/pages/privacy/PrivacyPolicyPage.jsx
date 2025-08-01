// src/pages/privacy/PrivacyPolicyPage.jsx
import React, { useState, useEffect } from 'react';
import { privacyPolicyArabic } from '../../data/privacyPolicy.js';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isScrolling, setIsScrolling] = useState(false);

  // تتبع التمرير لتحديد القسم النشط
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;
      
      const sections = privacyPolicyArabic.sections;
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);

  const scrollToSection = (sectionId) => {
    setIsScrolling(true);
    setActiveSection(sectionId);
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setTimeout(() => setIsScrolling(false), 1000);
  };

  const formatContent = (content) => {
    // تحويل النص إلى HTML مع الحفاظ على التنسيق
    return content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <br key={index} />;
        
        // عناوين فرعية (تبدأ بـ **)
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          const title = trimmedLine.slice(2, -2);
          return <h4 key={index} className="subsection-title">{title}</h4>;
        }
        
        // نقاط مهمة (تبدأ بـ - أو **)
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
          return (
            <li key={index} className="policy-list-item">
              {trimmedLine.substring(2)}
            </li>
          );
        }
        
        // نص عادي
        return <p key={index} className="policy-paragraph">{trimmedLine}</p>;
      });
  };

  return (
    <div className="privacy-policy-page" dir="rtl">
      {/* Header */}
      <div className="privacy-header">
        <div className="container">
          <h1 className="privacy-title">سياسة الخصوصية وحماية البيانات</h1>
          <p className="privacy-subtitle">
            الجمعية السعودية للعلوم السياسية ملتزمة بحماية خصوصيتكم وفقاً لقانون حماية البيانات الشخصية السعودي
          </p>
          <div className="privacy-meta">
            <span className="last-updated">
              آخر تحديث: {privacyPolicyArabic.lastUpdated}
            </span>
            <span className="version">النسخة: {privacyPolicyArabic.version}</span>
          </div>
        </div>
      </div>

      <div className="privacy-content">
        <div className="container">
          <div className="privacy-layout">
            
            {/* جدول المحتويات */}
            <aside className="privacy-sidebar">
              <div className="sidebar-sticky">
                <h3 className="sidebar-title">المحتويات</h3>
                <nav className="privacy-nav">
                  {privacyPolicyArabic.sections.map((section) => (
                    <button
                      key={section.id}
                      className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
                
                {/* معلومات الاتصال السريع */}
                <div className="quick-contact">
                  <h4>للاستفسارات</h4>
                  <p>
                    <strong>البريد الإلكتروني:</strong><br />
                    privacy@spsa.org.sa
                  </p>
                  <p>
                    <strong>الهاتف:</strong><br />
                    +966-11-XXXXXXX
                  </p>
                </div>
              </div>
            </aside>

            {/* المحتوى الرئيسي */}
            <main className="privacy-main">
              
              {/* تنبيه مهم */}
              <div className="important-notice">
                <div className="notice-icon">⚠️</div>
                <div className="notice-content">
                  <h3>تنبيه مهم</h3>
                  <p>
                    هذه السياسة متوافقة مع قانون حماية البيانات الشخصية السعودي (PDPL). 
                    يرجى قراءتها بعناية وفهم حقوقكم في البيانات الشخصية.
                  </p>
                </div>
              </div>

              {/* أقسام السياسة */}
              {privacyPolicyArabic.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`policy-section ${activeSection === section.id ? 'active' : ''}`}
                >
                  <h2 className="section-title">{section.title}</h2>
                  <div className="section-content">
                    {formatContent(section.content)}
                  </div>
                </section>
              ))}

              {/* معلومات إضافية */}
              <section className="additional-info">
                <h2 className="section-title">معلومات إضافية</h2>
                
                <div className="info-grid">
                  <div className="info-card">
                    <h3>🏛️ الجهة المسؤولة</h3>
                    <p>الجمعية السعودية للعلوم السياسية</p>
                    <p>مسجلة لدى وزارة الموارد البشرية والتنمية الاجتماعية</p>
                  </div>
                  
                  <div className="info-card">
                    <h3>⚖️ القانون المطبق</h3>
                    <p>قانون حماية البيانات الشخصية السعودي</p>
                    <p>اللوائح التنفيذية للقانون</p>
                  </div>
                  
                  <div className="info-card">
                    <h3>🔄 مراجعة السياسة</h3>
                    <p>تتم المراجعة كل 6 أشهر</p>
                    <p>المراجعة القادمة: {privacyPolicyArabic.metadata.nextReview}</p>
                  </div>
                  
                  <div className="info-card">
                    <h3>📧 تحديثات السياسة</h3>
                    <p>إشعار قبل 30 يوماً من أي تغيير</p>
                    <p>موافقة صريحة للتغييرات الجوهرية</p>
                  </div>
                </div>
              </section>

              {/* أزرار العمل */}
              <div className="action-buttons">
                <button className="btn btn-primary">
                  📄 طباعة السياسة
                </button>
                <button className="btn btn-secondary">
                  📧 إرسال نسخة بالبريد
                </button>
                <button className="btn btn-outline">
                  ⚖️ الإبلاغ عن مخالفة
                </button>
              </div>

              {/* إقرار الموافقة */}
              <div className="consent-section">
                <h3>إقرار بقراءة السياسة</h3>
                <div className="consent-checkbox">
                  <input type="checkbox" id="privacy-read" />
                  <label htmlFor="privacy-read">
                    أقر بأنني قرأت وفهمت سياسة الخصوصية وحماية البيانات الخاصة بالجمعية السعودية للعلوم السياسية
                  </label>
                </div>
                <p className="consent-note">
                  * هذا الإقرار اختياري ولا يؤثر على استخدامكم للموقع
                </p>
              </div>

            </main>
          </div>
        </div>
      </div>

      {/* زر العودة للأعلى */}
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑ العودة للأعلى
      </button>
    </div>
  );
};

export default PrivacyPolicyPage;