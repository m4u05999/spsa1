import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import RegionalStudies from './units/RegionalStudies';
import InternationalRelations from './units/InternationalRelations';
import ComparativePolitics from './units/ComparativePolitics';
import PoliticalThought from './units/PoliticalThought';

const ResearchPage = () => {
  // حالة نموذج التواصل
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  
  // التعامل مع تغيير حقول النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // إزالة رسالة الخطأ عند الكتابة
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  // التحقق من صحة النموذج
  const validateForm = () => {
    let errors = {};
    let isValid = true;
    
    if (!contactForm.name.trim()) {
      errors.name = "يرجى إدخال الاسم";
      isValid = false;
    }
    
    if (!contactForm.email.trim()) {
      errors.email = "يرجى إدخال البريد الإلكتروني";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactForm.email)) {
        errors.email = "يرجى إدخال بريد إلكتروني صحيح";
        isValid = false;
      }
    }
    
    if (!contactForm.subject.trim()) {
      errors.subject = "يرجى إدخال الموضوع";
      isValid = false;
    }
    
    if (!contactForm.message.trim()) {
      errors.message = "يرجى إدخال الرسالة";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // معالج إرسال النموذج
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // إعادة تعيين حالات الإرسال
    setSubmitSuccess(false);
    setSubmitError(false);
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // محاكاة طلب API (سيتم استبداله بطلب حقيقي عند ربط الواجهة الخلفية)
      setTimeout(() => {
        console.log('تم إرسال النموذج:', contactForm);
        setIsSubmitting(false);
        setSubmitSuccess(true);
        
        // إفراغ النموذج بعد الإرسال الناجح
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
        
        // إخفاء رسالة النجاح بعد 5 ثوانٍ
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    }
  };
  const researchUnits = [
    {
      id: 'regional',
      title: 'وحدة الدراسات الإقليمية',
      description: 'تختص بدراسة الأحداث والتطورات السياسية في المناطق الجغرافية المختلفة والقوى المؤثرة فيها',
      icon: '🌍',
      link: '/research/regional',
      groups: [
        'مجموعة دراسات المملكة',
        'مجموعة الدراسات الأوروبية',
        'مجموعة دراسات أمريكا اللاتينية',
        'مجموعة الدراسات الاسيوية',
        'مجموعة الدراسات الافريقية',
        'مجموعة دراسات الشرق الأوسط',
        'مجموعة الدراسات الامريكية والكندية',
        'مجموعة الدراسات الصينية',
        'مجموعة الدراسات الروسية'
      ]
    },
    {
      id: 'international',
      title: 'وحدة العلاقات الدولية',
      description: 'تتناول العلاقات بين الدول والمنظمات الدولية وقضايا الأمن والتعاون الدولي',
      icon: '🤝',
      link: '/research/international',
      groups: [
        'مجموعة دراسات الحرب والسلام',
        'مجموعة السياسات الخارجية',
        'مجموعة دراسة المنظمات الدولية',
        'مجموعة الدراسات الدبلوماسية',
        'مجموعة دراسات إدارة الأزمات والمخاطر الدولية',
        'مجموعة دراسات الأمن الدولي',
        'مجموعة دراسات المشكلات الدولية المعاصرة'
      ]
    },
    {
      id: 'comparative',
      title: 'وحدة السياسات المقارنة',
      description: 'تهتم بالدراسات المقارنة للنظم السياسية والتجارب الحكومية المختلفة حول العالم',
      icon: '⚖️',
      link: '/research/comparative',
      groups: [
        'قسم السياسات المستقرة',
        'السياسات الغير مستقرة'
      ]
    },
    {
      id: 'thought',
      title: 'وحدة الفكر السياسي والنظرية السياسية',
      description: 'تختص بدراسة الأفكار والنظريات السياسية وتطورها التاريخي وتأثيرها على الواقع المعاصر',
      icon: '💭',
      link: '/research/thought',
      groups: [
        'الفكر السياسي الغربي',
        'الفكر السياسي الإسلامي',
        'العقائد الشمولية والمتطرفة',
        'الحركات الإسلامية والاخوان المسلمين',
        'الدين والدولة',
        'الأمن الفكري'
      ]
    }
  ];

  const achievements = [
    'نشر أكثر من 50 بحثًا علميًا في مجلات محكمة دولية',
    'تنظيم 12 مؤتمرًا وندوة علمية متخصصة',
    'إصدار 15 كتابًا في مختلف مجالات العلوم السياسية',
    'عقد شراكات بحثية مع 8 مراكز أبحاث عالمية',
    'تقديم أكثر من 30 استشارة علمية للجهات الحكومية والخاصة'
  ];

  const publications = [
    {
      title: 'التحولات الجيوسياسية في الشرق الأوسط: آفاق ومستقبل',
      type: 'كتاب',
      year: '2023'
    },
    {
      title: 'أثر الأزمات العالمية على النظام الدولي متعدد الأقطاب',
      type: 'دراسة',
      year: '2022'
    },
    {
      title: 'الاتجاهات الحديثة في النظرية السياسية المعاصرة',
      type: 'كتاب',
      year: '2023'
    },
    {
      title: 'التحول الديمقراطي في دول شمال إفريقيا: دراسة مقارنة',
      type: 'دراسة',
      year: '2022'
    }
  ];

  return (
    <>
      <Routes>
        <Route index element={
          <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
            {/* قسم الرأس */}
            <section className="py-12 sm:py-16 bg-blue-700 text-white">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                  <h1 className="text-2xl sm:text-4xl font-bold mb-4">إدارة البحوث والدراسات العلمية</h1>
                  <p className="text-lg sm:text-xl text-blue-100 mb-6">
                    تعنى إدارة البحوث بإنتاج المعرفة العلمية في مجال العلوم السياسية، وتقديم تحليلات معمقة للقضايا والظواهر السياسية المحلية والإقليمية والدولية
                  </p>
                </div>
              </div>
            </section>

            <div className="container mx-auto px-4">
              {/* وحدات البحث */}
              <section className="py-12">
                <h2 className="text-2xl font-bold mb-8">وحدات البحث الرئيسية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {researchUnits.map((unit) => (
                    <Link key={unit.id} to={unit.link} className="block group">
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-md p-6 border-2 border-gray-100 group-hover:border-blue-500 transition-all duration-300 h-full">
                        <div className="flex items-center mb-4">
                          <span className="text-2xl sm:text-3xl bg-blue-100 text-blue-700 p-3 rounded-full ml-4">{unit.icon}</span>
                          <h3 className="text-base sm:text-lg font-bold text-blue-800">{unit.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base mb-4">{unit.description}</p>
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">المجموعات البحثية:</h4>
                          <ul className="text-gray-600 text-xs sm:text-sm space-y-1 mr-4 list-disc">
                            {unit.groups.slice(0, 3).map((group, index) => (
                              <li key={index}>{group}</li>
                            ))}
                            {unit.groups.length > 3 && (
                              <li className="text-blue-600">وأخرى ({unit.groups.length - 3})...</li>
                            )}
                          </ul>
                        </div>
                        <div className="mt-auto flex justify-end">
                          <span className="text-blue-600 group-hover:text-blue-800 flex items-center text-sm sm:text-base">
                            <span>عرض التفاصيل</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* الرؤية والرسالة والإنجازات */}
              <section className="py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-6">الرؤية والرسالة</h2>
                    <div className="mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">الرؤية</h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        الريادة في مجال البحث العلمي والدراسات السياسية على المستوى المحلي والإقليمي والعالمي.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">الرسالة</h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        إنتاج بحوث ودراسات علمية رصينة تسهم في تطوير المعرفة السياسية، وتقدم رؤى وتحليلات موضوعية تساعد صانعي القرار والمهتمين بالشأن السياسي.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-6">إنجازاتنا</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
                      {achievements.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* الإصدارات العلمية */}
              <section className="py-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">أحدث الإصدارات العلمية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {publications.map((pub, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="p-4">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">{pub.type}</span>
                        <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{pub.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{pub.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link to="/publications" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base">
                    عرض جميع الإصدارات
                  </Link>
                </div>
              </section>

              {/* نموذج التواصل */}
              <section className="py-12 bg-gray-50 rounded-lg p-4 sm:p-6 mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">تواصل معنا</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      للاستفسارات العلمية أو المشاركة في الأبحاث والدراسات، يرجى التواصل معنا عبر البريد الإلكتروني أو تعبئة النموذج المرفق.
                    </p>
                    <div className="space-y-2">
                      <p className="flex items-center text-gray-600 text-sm sm:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        research@psa-sa.org
                      </p>
                      <p className="flex items-center text-gray-600 text-sm sm:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h1.6a1 1 0 01.95.68l.33 1c.11.32.39.58.72.68L10 10.6c.33.1.67-.03.89-.29l2-2.41a1 1 0 111.53 1.28l-2 2.41c-.81.97-2.17 1.24-3.27.81l-.33-.1a1 1 0 00-.94.36l-1 1.2A1 1 0 015 14V9z" clipRule="evenodd" />
                        </svg>
                        +966 11 XXX XXXX
                      </p>
                    </div>
                  </div>
                  {submitSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                      <p>تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.</p>
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      <p>حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.</p>
                    </div>
                  )}
                  
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">الاسم</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={contactForm.name} 
                          onChange={handleInputChange} 
                          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : ''}`} 
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">البريد الإلكتروني</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={contactForm.email} 
                          onChange={handleInputChange} 
                          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : ''}`} 
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">الموضوع</label>
                      <input 
                        type="text" 
                        name="subject" 
                        value={contactForm.subject} 
                        onChange={handleInputChange} 
                        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.subject ? 'border-red-500' : ''}`} 
                      />
                      {formErrors.subject && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">الرسالة</label>
                      <textarea 
                        rows="4" 
                        name="message" 
                        value={contactForm.message} 
                        onChange={handleInputChange} 
                        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.message ? 'border-red-500' : ''}`}
                      ></textarea>
                      {formErrors.message && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          جاري الإرسال...
                        </span>
                      ) : 'إرسال'}
                    </button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        } />
        <Route path="regional" element={<RegionalStudies />} />
        <Route path="international" element={<InternationalRelations />} />
        <Route path="comparative" element={<ComparativePolitics />} />
        <Route path="thought" element={<PoliticalThought />} />
      </Routes>
    </>
  );
};

export default ResearchPage;