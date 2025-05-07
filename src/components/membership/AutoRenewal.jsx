// src/components/membership/AutoRenewal.jsx
import React, { useState } from 'react';
import { usePayment } from '../../hooks/usePayment';

const AutoRenewal = () => {
  const { savedCards, updateAutoRenewal, deleteCard } = usePayment();
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const handleToggleAutoRenewal = async () => {
    try {
      await updateAutoRenewal({
        enabled: !isEnabled,
        cardId: selectedCard
      });
      setIsEnabled(!isEnabled);
    } catch (err) {
      console.error('Failed to update auto-renewal:', err);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">إعدادات التجديد التلقائي</h2>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base text-gray-700">تفعيل التجديد التلقائي</span>
          <button
            onClick={handleToggleAutoRenewal}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">بطاقات الدفع المحفوظة</h3>
          
          {savedCards.length > 0 ? (
            <div className="space-y-4">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedCard === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  `}
                  onClick={() => setSelectedCard(card.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm sm:text-base font-medium">
                        **** **** **** {card.last4}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        تنتهي في {card.expMonth}/{card.expYear}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">لا توجد بطاقات محفوظة</p>
          )}

          <button
            onClick={() => setShowAddCard(true)}
            className="mt-3 sm:mt-4 inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-700"
          >
            <span className="ml-2">+</span>
            إضافة بطاقة جديدة
          </button>
        </div>

        {isEnabled && (
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">إعدادات التجديد</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-700">إرسال تذكير قبل التجديد</span>
                <select className="border rounded p-1.5 sm:p-2 text-sm sm:text-base">
                  <option value="7">7 أيام</option>
                  <option value="14">14 يوم</option>
                  <option value="30">30 يوم</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-700">طريقة التذكير</span>
                <div className="space-x-4 rtl:space-x-reverse">
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="mr-2 text-sm sm:text-base">البريد الإلكتروني</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="mr-2 text-sm sm:text-base">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoRenewal;