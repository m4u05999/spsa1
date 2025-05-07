// src/components/membership/MembershipUpgrade.jsx
import React from 'react';
import { useState } from 'react';
import PaymentForm from './PaymentForm';

const membershipLevels = {
  platinum: {
    name: 'عضوية بلاتينية',
    price: 1000,
    benefits: [
      'جميع مميزات العضوية الذهبية',
      'دعوات VIP للفعاليات',
      'استشارات خاصة',
      'تقارير حصرية'
    ],
    icon: '💎'
  },
  gold: {
    name: 'عضوية ذهبية',
    price: 750,
    benefits: [
      'جميع مميزات العضوية الفضية',
      'دورات تدريبية مجانية',
      'ورش عمل متخصصة',
      'نشر الأبحاث'
    ],
    icon: '🌟'
  },
  silver: {
    name: 'عضوية فضية',
    price: 500,
    benefits: [
      'جميع مميزات العضوية البرونزية',
      'حضور المؤتمرات',
      'المشاركة في الفعاليات',
      'الوصول للمكتبة الرقمية'
    ],
    icon: '⭐'
  },
  bronze: {
    name: 'عضوية برونزية',
    price: 250,
    benefits: [
      'العضوية الأساسية',
      'النشرة الإخبارية',
      'المشاركة في المنتدى',
      'الوصول للمحتوى الأساسي'
    ],
    icon: '🥉'
  }
};

const MembershipUpgrade = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSuccess = () => {
    setShowPayment(false);
    // Additional success handling (e.g., show confirmation, update user status)
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ترقية العضوية</h1>

      {showPayment ? (
        <PaymentForm
          amount={membershipLevels[selectedLevel].price}
          membershipLevel={selectedLevel}
          onSuccess={handleSuccess}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(membershipLevels).map(([level, details]) => (
            <div
              key={level}
              className={`bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border-2 transition-all
                ${selectedLevel === level ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}
                hover:border-blue-300 cursor-pointer`}
              onClick={() => setSelectedLevel(level)}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">{details.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{details.name}</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-4">
                {details.price} ر.س
              </p>
              <ul className="space-y-1 sm:space-y-2">
                {details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-600 text-sm sm:text-base">
                    <span className="ml-2">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowPayment(true)}
                className="mt-4 sm:mt-6 w-full bg-blue-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base rounded hover:bg-blue-700 transition-colors"
              >
                اختيار هذه العضوية
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembershipUpgrade;