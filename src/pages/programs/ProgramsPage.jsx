// src/pages/programs/ProgramsPage.jsx
import React, { useState } from 'react';
import ImageComponent from '../../components/ImageComponent';

const ProgramsPage = () => {
  // استخدام حالة لتتبع النافذة المنبثقة للتسجيل
  const [showModal, setShowModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const programs = [
    {
      id: 1,
      title: 'دبلوم الدراسات الدبلوماسية',
      duration: '6 أشهر',
      startDate: '2024/03/01',
      type: 'دبلوم مهني',
      description: 'برنامج متخصص في العمل الدبلوماسي والعلاقات الدولية',
      image: '/assets/images/diploma.jpg'
    },
    {
      id: 2,
      title: 'دورة التحليل السياسي',
      duration: '3 أشهر',
      startDate: '2024/02/15',
      type: 'دورة تدريبية',
      description: 'تطوير مهارات التحليل السياسي وكتابة التقارير',
      image: '/assets/images/analysis.jpg'
    },
    {
      id: 3,
      title: 'ورشة صناعة القرار السياسي',
      duration: 'أسبوع',
      startDate: '2024/01/20',
      type: 'ورشة عمل',
      description: 'فهم آليات صناعة القرار السياسي وتحليل السياسات العامة',
      image: '/assets/images/workshop.jpg'
    }
  ];

  // وظيفة لفتح نافذة التسجيل
  const handleRegisterClick = (program) => {
    setSelectedProgram(program);
    setShowModal(true);
  };

  // وظيفة لإغلاق نافذة التسجيل
  const closeModal = () => {
    setShowModal(false);
    setSelectedProgram(null);
    // إعادة تعيين بيانات النموذج
    setFormData({
      name: '',
      email: '',
      phone: '',
      comments: ''
    });
  };

  // وظيفة لتحديث بيانات النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // وظيفة لتقديم النموذج
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة اتصال بالخادم (سيتم استبدالها بـ Supabase لاحقًا)
    console.log('بيانات التسجيل:', { program: selectedProgram?.title, ...formData });
    
    // محاكاة الطلب للخادم
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        email: '',
        phone: '',
        comments: ''
      });
      
      // إغلاق النافذة بعد فترة
      setTimeout(() => {
        setSubmitSuccess(false);
        closeModal();
      }, 2000);
    }, 1000); // محاكاة للاتصال بالخادم
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">البرامج والدورات</h1>

      <div className="space-y-6">
        {programs.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/4 h-64 lg:h-auto relative">
                <ImageComponent 
                  src={program.image} 
                  alt={program.title}
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 lg:w-3/4">
                <div className="flex flex-col lg:flex-row justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl font-semibold mb-2">{program.title}</h2>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        المدة: {program.duration}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        تاريخ البدء: {program.startDate}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {program.type}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="mt-4 lg:mt-0 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start"
                    onClick={() => handleRegisterClick(program)}
                  >
                    سجل الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة منبثقة للتسجيل */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-800"
              aria-label="إغلاق"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center">
                التسجيل في {selectedProgram?.title}
              </h3>
              
              {submitSuccess ? (
                <div className="bg-green-100 border border-green-300 text-green-800 rounded-md p-4 mt-2 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-medium">تم إرسال طلب التسجيل بنجاح!</p>
                  <p className="text-sm mt-1">سيتم التواصل معك قريبًا</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'إرسال'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsPage;