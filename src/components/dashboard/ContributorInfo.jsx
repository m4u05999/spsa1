// src/components/dashboard/ContributorInfo.jsx
import React from 'react';

const ContributorInfo = ({ contributor }) => {
  // دالة مساعدة لتنسيق المبلغ
  const formatAmount = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // تحديد لون الشارة حسب المستوى
  const getBadgeColor = (tier) => {
    switch(tier) {
      case 'ذهبي':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'فضي':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'برونزي':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{contributor.name}</h3>
          <p className="text-sm text-gray-600">{contributor.email}</p>
          
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getBadgeColor(contributor.tier)} border`}>
              مساهم {contributor.tier}
            </span>
          </div>
        </div>

        {contributor.logo && (
          <div className="flex-shrink-0 h-16 w-16">
            <img 
              src={contributor.logo} 
              alt={`شعار ${contributor.name}`}
              className="h-16 w-16 object-contain"
            />
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">إجمالي المساهمات:</span>
          <span className="text-sm font-bold text-gray-900">{formatAmount(contributor.totalAmount)} ريال</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">أول مساهمة:</span>
          <span className="text-sm text-gray-900">
            {new Date(contributor.firstDonation).toLocaleDateString('ar-SA')}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">آخر مساهمة:</span>
          <span className="text-sm text-gray-900">
            {new Date(contributor.lastDonation).toLocaleDateString('ar-SA')}
          </span>
        </div>
      </div>

      {contributor.tier === 'ذهبي' && (
        <div className="mt-4 bg-yellow-50 p-2 rounded text-center text-sm">
          <span className="font-medium text-yellow-800">
            مساهم ذهبي مميز
          </span>
        </div>
      )}
    </div>
  );
};

export default ContributorInfo;