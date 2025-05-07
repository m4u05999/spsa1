// src/components/membership/PaymentForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { buttonStyles } from '../../utils/theme';

const PaymentForm = ({ onSubmit, membershipType, price }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'يرجى إدخال اسم حامل البطاقة';
    }

    if (!cardDetails.cardNumber.trim()) {
      newErrors.cardNumber = 'يرجى إدخال رقم البطاقة';
    } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'رقم البطاقة غير صحيح';
    }

    if (!cardDetails.expiryDate.trim()) {
      newErrors.expiryDate = 'يرجى إدخال تاريخ انتهاء الصلاحية';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'صيغة تاريخ انتهاء الصلاحية غير صحيحة (MM/YY)';
    }

    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = 'يرجى إدخال رمز CVV';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'رمز CVV غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit({ ...cardDetails, paymentMethod });
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrors({ submit: 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">معلومات الدفع</h3>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">نوع العضوية:</span>
          <span>{membershipType}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">المبلغ المطلوب:</span>
          <span className="text-lg text-blue-600 font-bold">{price}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-semibold mb-2">اختر طريقة الدفع:</div>
        <div className="flex space-x-4 space-x-reverse">
          <div 
            className={`border rounded-md p-3 flex items-center cursor-pointer transition ${paymentMethod === 'credit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            onClick={() => handlePaymentMethodChange('credit')}
          >
            <div className="w-6 h-6 mr-2 flex items-center justify-center border border-gray-300 rounded-full">
              {paymentMethod === 'credit' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">بطاقة ائتمانية</span>
              <div className="flex">
                <img src="/assets/images/visa.png" alt="Visa" className="h-6 w-auto ml-1" />
                <img src="/assets/images/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
              </div>
            </div>
          </div>
          
          <div 
            className={`border rounded-md p-3 flex items-center cursor-pointer transition ${paymentMethod === 'mada' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            onClick={() => handlePaymentMethodChange('mada')}
          >
            <div className="w-6 h-6 mr-2 flex items-center justify-center border border-gray-300 rounded-full">
              {paymentMethod === 'mada' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">بطاقة مدى</span>
              <img src="/assets/images/mada.png" alt="Mada" className="h-6 w-auto" />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
            اسم حامل البطاقة
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            value={cardDetails.cardholderName}
            onChange={handleChange}
            className={`w-full border ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="الاسم كما هو مكتوب على البطاقة"
          />
          {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            رقم البطاقة
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={(e) => {
              const formattedValue = formatCardNumber(e.target.value);
              setCardDetails(prev => ({
                ...prev,
                cardNumber: formattedValue
              }));
              if (errors.cardNumber) {
                setErrors(prev => ({
                  ...prev,
                  cardNumber: ''
                }));
              }
            }}
            className={`w-full border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="XXXX XXXX XXXX XXXX"
            maxLength={19}
          />
          {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ انتهاء الصلاحية
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={cardDetails.expiryDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2) {
                  value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                setCardDetails(prev => ({
                  ...prev,
                  expiryDate: value
                }));
                if (errors.expiryDate) {
                  setErrors(prev => ({
                    ...prev,
                    expiryDate: ''
                  }));
                }
              }}
              className={`w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
          </div>
          
          <div className="flex-1">
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              رمز الأمان (CVV)
            </label>
            <input
              type="password"
              id="cvv"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleChange}
              className={`w-full border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="XXX"
              maxLength={4}
            />
            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700">
              مدفوعاتك آمنة ومشفرة. نحن لا نخزن معلومات بطاقتك الائتمانية.
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">
                {errors.submit}
              </p>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className={`${buttonStyles.primary} w-full py-3 flex justify-center items-center`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري معالجة الدفع...
            </>
          ) : (
            'إتمام الدفع'
          )}
        </button>
      </form>
    </div>
  );
};

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  membershipType: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired
};

export default PaymentForm;