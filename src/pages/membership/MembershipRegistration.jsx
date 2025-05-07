// src/pages/membership/MembershipRegistration.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PaymentForm from '../../components/membership/PaymentForm';
import { buttonStyles } from '../../utils/theme';

const MembershipRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // استخراج نوع العضوية من query params أو ضبط الافتراضي
  const searchParams = new URLSearchParams(location.search);
  const planType = searchParams.get('plan') || 'standard';
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    academic: '',
    specialty: '',
    institution: '',
    membership: planType,
    billingCycle: 'annual',
  });
  const [errors, setErrors] = useState({});
  const [completed, setCompleted] = useState(false);
  
  // أسعار العضويات
  const membershipPrices = {
    basic: {
      monthly: '٩٩ ريال',
      annual: '٩٩٠ ريال',
    },
    standard: {
      monthly: '١٩٩ ريال',
      annual: '١,٩٩٠ ريال',
    },
    premium: {
      monthly: '٢٩٩ ريال',
      annual: '٢,٩٩٠ ريال',
    }
  };

  // اسماء العضويات بالعربية
  const membershipNames = {
    basic: 'العضوية الأساسية',
    standard: 'العضوية المحترفة',
    premium: 'العضوية المتميزة'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح الأخطاء عند الكتابة
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'يرجى إدخال الاسم الأول';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'يرجى إدخال اسم العائلة';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!/^[0-9+\s]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }
    
    if (!formData.academic.trim()) {
      newErrors.academic = 'يرجى اختيار المؤهل الأكاديمي';
    }
    
    if (!formData.specialty.trim()) {
      newErrors.specialty = 'يرجى إدخال التخصص';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };
  
  const handlePaymentSubmit = (paymentDetails) => {
    // في التطبيق الحقيقي، هنا سيتم إرسال البيانات إلى الخادم
    console.log('Form Data:', formData);
    console.log('Payment Details:', paymentDetails);
    
    // تحويل إلى صفحة التأكيد
    setCompleted(true);
    window.scrollTo(0, 0);
    
    // بعد 3 ثوانٍ، توجيه المستخدم إلى لوحة التحكم
    setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
  };
  
  const getMembershipPrice = () => {
    const cycle = formData.billingCycle === 'annual' ? 'annual' : 'monthly';
    return membershipPrices[formData.membership][cycle];
  };
  
  if (completed) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">تمت عملية الدفع بنجاح!</h1>
            <p className="text-lg text-gray-600 mb-6">
              شكراً لانضمامك إلى رابطة العلوم السياسية. لقد تم تفعيل عضويتك بنجاح.
            </p>
            <p className="text-gray-600 mb-8">
              تم إرسال تفاصيل عضويتك إلى بريدك الإلكتروني {formData.email}
            </p>
            <div className="flex justify-center">
              <Link to="/dashboard" className={`${buttonStyles.primary} px-6 py-3`}>
                الانتقال إلى لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* رأس الصفحة */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">التسجيل في {membershipNames[formData.membership]}</h1>
            <p className="text-gray-600">أكمل البيانات المطلوبة للانضمام إلى رابطة العلوم السياسية</p>
          </div>
          
          {/* مؤشر الخطوات */}
          <div className="flex justify-between items-center mb-8">
            <div className="w-full flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
            </div>
          </div>
          
          {/* نموذج الخطوة الأولى - المعلومات الشخصية */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">المعلومات الشخصية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الأول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العائلة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="05xxxxxxxx"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label htmlFor="academic" className="block text-sm font-medium text-gray-700 mb-1">
                    المؤهل الأكاديمي <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="academic"
                    name="academic"
                    value={formData.academic}
                    onChange={handleChange}
                    className={`w-full border ${errors.academic ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">اختر المؤهل</option>
                    <option value="bachelor">بكالوريوس</option>
                    <option value="master">ماجستير</option>
                    <option value="phd">دكتوراه</option>
                    <option value="student">طالب</option>
                    <option value="other">أخرى</option>
                  </select>
                  {errors.academic && <p className="text-red-500 text-sm mt-1">{errors.academic}</p>}
                </div>
                
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    التخصص <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className={`w-full border ${errors.specialty ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
                </div>
                
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                    المؤسسة / الجامعة
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">خطة العضوية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${formData.membership === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setFormData(prev => ({ ...prev, membership: 'basic' }))}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                        {formData.membership === 'basic' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <h4 className="font-medium">العضوية الأساسية</h4>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>شهري: ٩٩ ريال</div>
                      <div>سنوي: ٩٩٠ ريال</div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${formData.membership === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setFormData(prev => ({ ...prev, membership: 'standard' }))}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                        {formData.membership === 'standard' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <h4 className="font-medium">العضوية المحترفة</h4>
                      <span className="bg-yellow-400 text-xs text-blue-800 px-2 py-0.5 rounded-full mr-2">الأكثر شعبية</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>شهري: ١٩٩ ريال</div>
                      <div>سنوي: ١,٩٩٠ ريال</div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${formData.membership === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setFormData(prev => ({ ...prev, membership: 'premium' }))}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                        {formData.membership === 'premium' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <h4 className="font-medium">العضوية المتميزة</h4>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>شهري: ٢٩٩ ريال</div>
                      <div>سنوي: ٢,٩٩٠ ريال</div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-3">دورة الفوترة</h3>
                <div className="flex gap-4 mb-8">
                  <div 
                    className={`border rounded-md p-4 cursor-pointer flex-1 ${formData.billingCycle === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                        {formData.billingCycle === 'monthly' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <h4 className="font-medium">شهري</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      فوترة شهرية تلقائية
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-4 cursor-pointer flex-1 ${formData.billingCycle === 'annual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'annual' }))}
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                        {formData.billingCycle === 'annual' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <h4 className="font-medium">سنوي</h4>
                      <span className="bg-green-100 text-xs text-green-800 px-2 py-0.5 rounded-full mr-2">خصم ١٦٪</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      فوترة سنوية تلقائية
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className={`${buttonStyles.primary} px-8 py-3`}
                  onClick={handleNext}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
          
          {/* نموذج الخطوة الثانية - الدفع */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <PaymentForm 
                  onSubmit={handlePaymentSubmit} 
                  membershipType={membershipNames[formData.membership]}
                  price={getMembershipPrice()}
                />
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4">ملخص الطلب</h3>
                  <div className="border-b pb-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span>نوع العضوية</span>
                      <span className="font-medium">{membershipNames[formData.membership]}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>دورة الفوترة</span>
                      <span className="font-medium">{formData.billingCycle === 'annual' ? 'سنوي' : 'شهري'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-blue-600">{getMembershipPrice()}</span>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      className={`${buttonStyles.outline} w-full`}
                      onClick={handleBack}
                    >
                      العودة لتعديل البيانات
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">سياسة إلغاء العضوية</h4>
                      <p className="text-sm text-blue-700">
                        يمكنك إلغاء العضوية في أي وقت من خلال لوحة التحكم الخاصة بك. سيتم استرداد المبلغ وفقاً لسياسة الاسترداد.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipRegistration;