// src/components/forms/DonationForm.jsx
import React, { useState, useContext } from 'react';
import { validateAmount } from '../../utils/validators';
import { processDonation } from '../../services/paymentService';
import { addNewDonation } from '../../services/userService';
import { AuthContext } from '../../contexts/index.jsx';

const DonationForm = ({ onSuccess }) => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    amount: '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    purpose: 'general', // عام، أبحاث، تعليم، فعاليات
    anonymous: false,
    message: '',
    paymentMethod: 'credit', // credit, bank, paypal
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    agreeTerms: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: معلومات التبرع، 2: معلومات الدفع

  // تعريف خيارات الغرض من التبرع
  const purposeOptions = [
    { value: 'general', label: 'دعم عام للجمعية' },
    { value: 'research', label: 'دعم الأبحاث العلمية' },
    { value: 'education', label: 'دعم البرامج التعليمية' },
    { value: 'events', label: 'دعم الفعاليات والمؤتمرات' }
  ];

  // تعريف خيارات مبلغ التبرع المقترحة
  const suggestedAmounts = [100, 500, 1000, 5000];

  // معالج تغييرات الإدخال
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    // تنسيق خاص للمبلغ (أرقام فقط)
    if (name === 'amount' && type !== 'checkbox') {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setFormData(prevState => ({
        ...prevState,
        [name]: sanitizedValue
      }));
    }
    // تنسيق خاص لرقم البطاقة
    else if (name === 'cardNumber') {
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
        [name]: inputValue
      }));
    }
    
    // مسح رسائل الخطأ عند الكتابة
    if (formErrors[name]) {
      setFormErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  // اختيار مبلغ مقترح
  const handleAmountSelect = (amount) => {
    setFormData(prevState => ({
      ...prevState,
      amount: amount.toString()
    }));
    
    // مسح رسالة الخطأ للمبلغ
    if (formErrors.amount) {
      setFormErrors(prevState => ({
        ...prevState,
        amount: ''
      }));
    }
  };

  // التحقق من صحة نموذج معلومات التبرع
  const validateDonationInfo = () => {
    const errors = {};
    
    if (!formData.amount) {
      errors.amount = 'مبلغ التبرع مطلوب';
    } else if (!validateAmount(formData.amount) || parseInt(formData.amount) < 1) {
      errors.amount = 'يرجى إدخال مبلغ صالح';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'الاسم مطلوب';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    }
    
    if (!formData.purpose) {
      errors.purpose = 'يرجى اختيار الغرض من التبرع';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // التحقق من صحة نموذج معلومات الدفع
  const validatePaymentInfo = () => {
    const errors = {};
    
    if (formData.paymentMethod === 'credit') {
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = 'رقم البطاقة مطلوب';
      } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = 'رقم البطاقة غير صالح';
      }
      
      if (!formData.expiryDate) {
        errors.expiryDate = 'تاريخ انتهاء البطاقة مطلوب';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = 'تاريخ انتهاء البطاقة غير صالح';
      }
      
      if (!formData.cvv) {
        errors.cvv = 'رمز الأمان مطلوب';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = 'رمز الأمان غير صالح';
      }
    }
    
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'يجب الموافقة على الشروط والأحكام';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // معالج الانتقال للخطوة التالية
  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (validateDonationInfo()) {
      setStep(2);
    }
  };

  // معالج العودة للخطوة السابقة
  const handlePrevStep = (e) => {
    e.preventDefault();
    setStep(1);
  };

  // معالج إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (validateDonationInfo()) {
        setStep(2);
      }
      return;
    }
    
    if (validatePaymentInfo()) {
      setIsSubmitting(true);
      try {
        // معالجة الدفع
        const donationResult = await processDonation({
          amount: parseInt(formData.amount),
          purpose: formData.purpose,
          paymentMethod: formData.paymentMethod,
          // أي معلومات إضافية مطلوبة للدفع
        });
        
        // حفظ بيانات التبرع
        await addNewDonation({
          userId: currentUser?.id,
          amount: parseInt(formData.amount),
          purpose: formData.purpose,
          message: formData.message,
          anonymous: formData.anonymous,
          status: 'completed'
        });
        
        // استدعاء دالة النجاح
        onSuccess(formData.amount);
      } catch (error) {
        console.error('خطأ في معالجة التبرع:', error);
        setFormErrors({
          submit: 'حدث خطأ أثناء معالجة التبرع. يرجى المحاولة مرة أخرى.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formErrors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {formErrors.submit}
        </div>
      )}
      
      {/* الخطوة 1: معلومات التبرع */}
      {step === 1 && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-1">
              اختر مبلغ التبرع*
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={`px-4 py-2 border rounded-md text-sm ${
                    formData.amount === amount.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {amount.toLocaleString()} ريال
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  document.getElementById('custom-amount').focus();
                }}
                className={`px-4 py-2 border rounded-md text-sm ${
                  formData.amount && !suggestedAmounts.includes(parseInt(formData.amount))
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                مبلغ آخر
              </button>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">ريال</span>
              </div>
              <input
                id="custom-amount"
                name="amount"
                type="text"
                value={formData.amount}
                onChange={handleInputChange}
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pr-3 pl-12 text-right text-lg py-3 ${
                  formErrors.amount ? 'border-red-300' : 'border-gray-300'
                } rounded-md`}
                placeholder="أدخل مبلغ التبرع"
                inputMode="numeric"
              />
            </div>
            {formErrors.amount && (
              <p className="mt-2 text-sm text-red-600">{formErrors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">
              الاسم الكامل*
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="أدخل اسمك الكامل"
              />
              {formErrors.name && (
                <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right">
              البريد الإلكتروني*
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="أدخل بريدك الإلكتروني"
              />
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 text-right">
              الغرض من التبرع*
            </label>
            <div className="mt-1">
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  formErrors.purpose ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                {purposeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.purpose && (
                <p className="mt-2 text-sm text-red-600">{formErrors.purpose}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="anonymous"
                name="anonymous"
                type="checkbox"
                checked={formData.anonymous}
                onChange={handleInputChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="mr-3 text-sm">
              <label htmlFor="anonymous" className="font-medium text-gray-700">
                التبرع بشكل مجهول
              </label>
              <p className="text-gray-500">لن يتم عرض اسمك في قائمة المساهمين</p>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 text-right">
              رسالة (اختياري)
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="أضف رسالة مع تبرعك"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              متابعة للدفع
            </button>
          </div>
        </>
      )}

      {/* الخطوة 2: معلومات الدفع */}
      {step === 2 && (
        <>
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">المبلغ:</span>
              <span className="font-bold text-lg">{parseInt(formData.amount).toLocaleString()} ريال</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {purposeOptions.find(option => option.value === formData.purpose)?.label}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-3">
              طريقة الدفع*
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="radio"
                  name="paymentMethod"
                  id="credit"
                  value="credit"
                  checked={formData.paymentMethod === 'credit'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <label
                  htmlFor="credit"
                  className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
                    formData.paymentMethod === 'credit'
                      ? 'bg-blue-50 border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-sm font-medium">بطاقة ائتمان</span>
                </label>
              </div>
              
              <div>
                <input
                  type="radio"
                  name="paymentMethod"
                  id="bank"
                  value="bank"
                  checked={formData.paymentMethod === 'bank'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <label
                  htmlFor="bank"
                  className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
                    formData.paymentMethod === 'bank'
                      ? 'bg-blue-50 border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <span className="text-sm font-medium">تحويل بنكي</span>
                </label>
              </div>
              
              <div>
                <input
                  type="radio"
                  name="paymentMethod"
                  id="paypal"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <label
                  htmlFor="paypal"
                  className={`flex flex-col items-center p-3 border rounded-md cursor-pointer ${
                    formData.paymentMethod === 'paypal'
                      ? 'bg-blue-50 border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">PayPal</span>
                </label>
              </div>
            </div>
          </div>

          {formData.paymentMethod === 'credit' && (
            <>
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
                      formErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {formErrors.cardNumber && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.cardNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                        formErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="MM/YY"
                    />
                    {formErrors.expiryDate && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.expiryDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 text-right">
                    رمز الأمان CVV*
                  </label>
                  <div className="mt-1">
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        formErrors.cvv ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="123"
                    />
                    {formErrors.cvv && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.paymentMethod === 'bank' && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3">معلومات الحساب البنكي:</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">اسم البنك:</span> البنك العربي الوطني</p>
                <p><span className="font-medium">اسم الحساب:</span> جمعية العلوم السياسية</p>
                <p><span className="font-medium">رقم الحساب:</span> 01234567890123456</p>
                <p><span className="font-medium">IBAN:</span> SA0123456789012345678901</p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                بعد إتمام التحويل، يرجى إرسال صورة من إيصال التحويل إلى البريد الإلكتروني: donations@example.com
              </div>
            </div>
          )}

          {formData.paymentMethod === 'paypal' && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-center">سيتم تحويلك إلى موقع PayPal لإتمام عملية الدفع.</p>
            </div>
          )}

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="mr-3 text-sm">
              <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                أوافق على <a href="#" className="text-blue-600 hover:text-blue-500">الشروط والأحكام</a>*
              </label>
              {formErrors.agreeTerms && (
                <p className="mt-1 text-sm text-red-600">{formErrors.agreeTerms}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              رجوع
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isSubmitting ? 'جاري تنفيذ التبرع...' : 'تأكيد التبرع'}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default DonationForm;