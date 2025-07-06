// src/pages/conference/ConferencePage.jsx
import React, { useState } from 'react';
import ImageComponent from '../../components/ImageComponent';

const ConferencePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    paperTitle: '',
    abstract: '',
    participationType: 'حضور'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة الاتصال بالخادم
    console.log('بيانات التسجيل للمؤتمر:', formData);
    
    // محاكاة الطلب للخادم
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // إعادة تعيين النموذج بعد فترة
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          name: '',
          email: '',
          institution: '',
          paperTitle: '',
          abstract: '',
          participationType: 'حضور'
        });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">المؤتمر السنوي</h1>

      <div className="mb-8 overflow-hidden rounded-lg">
        <ImageComponent 
          src="/assets/images/conference.jpg" 
          fallbackSrc="/assets/images/conference-fallback.svg"
          alt="المؤتمر السنوي للجمعية السعودية للعلوم السياسية" 
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">المؤتمر السنوي 2024</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">الموضوع</h3>
              <p className="text-gray-700">
                "التحولات الجيوسياسية في الشرق الأوسط: تحديات وفرص"
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">التاريخ</h3>
              <p className="text-gray-700">15-17 أبريل 2024</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">المكان</h3>
              <p className="text-gray-700">فندق الريتز كارلتون، الرياض</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">المحاور الرئيسية</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>التحولات في النظام الدولي وتأثيراتها على المنطقة</li>
                <li>التعاون الإقليمي والتكامل الاقتصادي</li>
                <li>الأمن الإقليمي والتحديات المعاصرة</li>
                <li>التحول الرقمي والدبلوماسية الرقمية</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">نموذج التسجيل</h2>
          {submitSuccess ? (
            <div className="bg-green-100 border border-green-300 text-green-800 rounded-md p-4 mt-2 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">تم إرسال طلب التسجيل بنجاح!</p>
              <p className="text-sm mt-1">سنتواصل معك قريباً بخصوص تفاصيل المؤتمر</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">المؤسسة</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">نوع المشاركة</label>
                <select
                  name="participationType"
                  value={formData.participationType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="حضور">حضور</option>
                  <option value="تقديم ورقة">تقديم ورقة بحثية</option>
                  <option value="متحدث">متحدث</option>
                </select>
              </div>
              {formData.participationType === 'تقديم ورقة' && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-2">عنوان الورقة</label>
                    <input
                      type="text"
                      name="paperTitle"
                      value={formData.paperTitle}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">ملخص الورقة</label>
                    <textarea
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md h-32"
                    ></textarea>
                  </div>
                </>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'تسجيل'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConferencePage;