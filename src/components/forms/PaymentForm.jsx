// src/components/forms/PaymentForm.jsx
import React, { useState } from 'react';
import { processPayment } from '../../services/paymentService';
import { validateCreditCard, validateExpiryDate, validateCVV } from '../../utils/validators';

const PaymentForm = ({ amount, membershipId, onSuccess }) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // معالج تغييرات الإدخال
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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
        [name]: value
      }));
    }
    
    // مسح رسائل الخطأ عند الكتابة
    if (formErrors[name]) {
      setFormErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
    
    // مسح رسالة خطأ الدفع
    if (paymentError) {
      setPaymentError('');
    }
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const errors = {};
    
    if (!formData.cardName.trim()) {
      errors.cardName = 'اسم حامل البطاقة مطلوب';
    }
    
    const cardNumberWithoutSpaces = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberWithoutSpaces) {
      errors.cardNumber = 'رقم البطاقة مطلوب';
    } else if (!validateCreditCard(cardNumberWithoutSpaces)) {
      errors.cardNumber = 'رقم البطاقة غير صالح';
    }
    
    if (!formData.expiryDate) {
      errors.expiryDate = 'تاريخ انتهاء البطاقة مطلوب';
    } else if (!validateExpiryDate(formData.expiryDate)) {
      errors.expiryDate = 'تاريخ انتهاء البطاقة غير صالح';
    }
    
    if (!formData.cvv) {
      errors.cvv = 'رمز الأمان مطلوب';
    } else if (!validateCVV(formData.cvv)) {
      errors.cvv = 'رمز الأمان غير صالح';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // معالج إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // إجراء عملية الدفع
        await processPayment({
          amount,
          membershipId,
          cardDetails: {
            name: formData.cardName,
            number: formData.cardNumber.replace(/\s/g, ''),
            expiry: formData.expiryDate,
            cvv: formData.cvv
          }
        });
        
        // استدعاء دالة النجاح
        onSuccess();
      } catch (error) {
        setPaymentError(error.message || 'حدث خطأ أثناء معالجة الدفع');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {paymentError}
        </div>
      )}
      
      <div>
        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 text-right">
          اسم حامل البطاقة*
        </label>
        <div className="mt-1">
          <input
            id="cardName"
            name="cardName"
            type="text"
            autoComplete="cc-name"
            required
            value={formData.cardName}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              formErrors.cardName ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="أدخل اسم حامل البطاقة"
          />
          {formErrors.cardName && (
            <p className="mt-2 text-sm text-red-600">{formErrors.cardName}</p>
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
            autoComplete="cc-number"
            required
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
              autoComplete="cc-exp"
              required
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
              autoComplete="cc-csc"
              required
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

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 text-center font-bold text-lg">
          المبلغ الإجمالي: {amount} ريال
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'جاري تنفيذ عملية الدفع...' : 'إتمام الدفع'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;