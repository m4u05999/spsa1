// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { validateCreditCard, validateExpiryDate, validateCVV } from '../utils/validators';
import { processPayment } from '../services/paymentService';

const PaymentPage = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // فحص ما إذا كان المستخدم مسجل دخوله
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/payment' } } });
    }
  }, [isAuthenticated, navigate]);

  // بيانات خطط العضوية
  const membershipPlans = [
    {
      id: 'student',
      name: 'عضوية طالب',
      price: 100,
      description: 'عضوية مخفضة للطلاب الجامعيين',
      features: [
        'المشاركة في فعاليات الجمعية',
        'الحصول على نسخ إلكترونية من إصدارات الجمعية',
        'حضور الورش التدريبية بشكل مجاني'
      ]
    },
    {
      id: 'standard',
      name: 'عضوية أساسية',
      price: 300,
      description: 'العضوية الأساسية في الجمعية',
      features: [
        'جميع مزايا عضوية الطالب',
        'المشاركة في اللجان العلمية',
        'الحصول على نسخ مطبوعة من إصدارات الجمعية',
        'حضور المؤتمرات والفعاليات المميزة'
      ]
    },
    {
      id: 'professional',
      name: 'عضوية متخصص',
      price: 500,
      description: 'عضوية كاملة للمتخصصين والأكاديميين',
      features: [
        'جميع مزايا العضوية الأساسية',
        'إمكانية النشر في مجلة الجمعية',
        'المشاركة في الوحدات البحثية',
        'تمثيل الجمعية في المناسبات العلمية',
        'خصومات خاصة على الدورات المتقدمة'
      ]
    }
  ];

  // معالج تغيير الخطة المختارة
  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
  };

  // معالج تغيير حقول النموذج
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // تنسيق خاص لرقم البطاقة
    if (name === 'cardNumber') {
      const sanitizedValue = value.replace(/\s/g, '');
      if (sanitizedValue.length > 16) return;
      
      // تنسيق رقم البطاقة بفواصل كل 4 أرقام
      const formattedValue = sanitizedValue.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setFormData(prevState => ({
        ...prevState,
        [name]: formattedValue
      }));
    } 
    // تنسيق خاص لتاريخ الانتهاء
    else if (name === 'expiryDate') {
      const sanitizedValue = value.replace(/\s/g, '').replace('/', '');
      if (sanitizedValue.length > 4) return;
      
      if (sanitizedValue.length > 2) {
        const formattedValue = `${sanitizedValue.slice(0, 2)}/${sanitizedValue.slice(2)}`;
        setFormData(prevState => ({
          ...prevState,
          [name]: formattedValue
        }));
      } else {
        setFormData(prevState => ({
          ...prevState,
          [name]: sanitizedValue
        }));
      }
    }
    // تنسيق لرمز CVV
    else if (name === 'cvv') {
      const sanitizedValue = value.replace(/\D/g, '');
      if (sanitizedValue.length > 4) return;
      setFormData(prevState => ({
        ...prevState,
        [name]: sanitizedValue
      }));
    } 
    // أي حقل آخر
    else {
      setFormData(prevState => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // مسح رسائل الخطأ عند الكتابة
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'اسم حامل البطاقة مطلوب';
    }
    
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'رقم البطاقة مطلوب';
    } else if (!validateCreditCard(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'رقم البطاقة غير صالح';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'تاريخ انتهاء البطاقة مطلوب';
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'تاريخ انتهاء البطاقة غير صالح';
    }
    
    if (!formData.cvv) {
      newErrors.cvv = 'رمز الأمان مطلوب';
    } else if (!validateCVV(formData.cvv)) {
      newErrors.cvv = 'رمز الأمان غير صالح';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'يجب الموافقة على الشروط والأحكام';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالج إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setPaymentError('');
    
    try {
      const plan = membershipPlans.find(plan => plan.id === selectedPlan);
      
      // معالجة الدفع
      await processPayment({
        amount: plan.price,
        membershipId: selectedPlan,
        cardDetails: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardHolder: formData.cardHolder
        }
      });
      
      // نجاح الدفع
      setPaymentSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('خطأ في معالجة الدفع:', error);
      setPaymentError('حدث خطأ أثناء معالجة الدفع. يرجى التأكد من معلومات البطاقة أو المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // عرض رسالة النجاح
  if (paymentSuccess) {
    const plan = membershipPlans.find(plan => plan.id === selectedPlan);
    
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="rounded-full bg-green-100 h-20 w-20 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">تم الدفع بنجاح!</h2>
            <p className="text-xl text-gray-600 mb-6">
              تم تفعيل عضويتك {plan.name} بمبلغ {plan.price} ريال.
            </p>
            <p className="text-gray-600 mb-8">
              ستصلك رسالة تأكيد على بريدك الإلكتروني قريباً مع كافة التفاصيل والخطوات التالية.
            </p>
            <div className="space-x-4 space-x-reverse">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                الانتقال للوحة التحكم
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">اختر خطة العضوية</h1>
          <p className="text-lg text-gray-600">
            اختر الخطة المناسبة لك وانضم إلى جمعية العلوم السياسية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg overflow-hidden ${
                selectedPlan === plan.id
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 shadow'
              }`}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline mt-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="mr-1 text-gray-600">ريال / سنة</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 ml-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handlePlanChange(plan.id)}
                  className={`w-full py-2 px-4 rounded-md ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {selectedPlan === plan.id ? 'مختارة' : 'اختر هذه الخطة'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">تفاصيل الدفع</h2>
            
            {paymentError && (
              <div className="mb-6 bg-red-50 border-r-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 text-right">
                  اسم حامل البطاقة*
                </label>
                <div className="mt-1">
                  <input
                    id="cardHolder"
                    name="cardHolder"
                    type="text"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.cardHolder ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="الاسم كما يظهر على البطاقة"
                  />
                  {errors.cardHolder && (
                    <p className="mt-2 text-sm text-red-600">{errors.cardHolder}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 text-right">
                  رقم البطاقة*
                </label>
                <div className="mt-1">
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 text-right">
                    تاريخ الانتهاء*
                  </label>
                  <div className="mt-1">
                    <input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="MM/YY"
                    />
                    {errors.expiryDate && (
                      <p className="mt-2 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 text-right">
                    رمز الأمان (CVV)*
                  </label>
                  <div className="mt-1">
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.cvv ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="mt-2 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="mr-2 block text-sm text-gray-900">
                  أوافق على <a href="#" className="text-blue-600 hover:text-blue-500">الشروط والأحكام</a> وسياسة الخصوصية*
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="mt-2 text-sm text-red-600">{errors.agreeTerms}</p>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-lg font-medium text-gray-900">المجموع:</div>
                  <div className="text-xl font-bold text-gray-900">
                    {membershipPlans.find(plan => plan.id === selectedPlan)?.price || 0} ريال
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري معالجة الدفع...
                    </span>
                  ) : (
                    'إتمام الدفع'
                  )}
                </button>
                <div className="flex justify-center mt-4">
                  <img 
                    src="/assets/images/payment-methods.png" 
                    alt="طرق الدفع المتاحة" 
                    className="h-8" 
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;