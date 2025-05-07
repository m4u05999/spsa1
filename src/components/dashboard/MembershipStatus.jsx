// src/components/dashboard/MembershipStatus.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const MembershipStatus = ({ membership }) => {
  const isActive = membership && new Date(membership.expiresAt) > new Date();
  
  // تحديد حالة العضوية وأيام الصلاحية المتبقية
  const getMembershipStatus = () => {
    if (!membership) return { status: 'غير مشترك', daysLeft: 0, statusClass: 'bg-gray-100 text-gray-800' };
    
    if (isActive) {
      const today = new Date();
      const expiryDate = new Date(membership.expiresAt);
      const diffTime = Math.abs(expiryDate - today);
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return { 
        status: 'نشط', 
        daysLeft, 
        statusClass: 'bg-green-100 text-green-800'
      };
    } else {
      return { 
        status: 'منتهي', 
        daysLeft: 0, 
        statusClass: 'bg-red-100 text-red-800' 
      };
    }
  };

  const membershipStatus = getMembershipStatus();

  return (
    <div className="bg-white shadow rounded-lg p-6 col-span-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">حالة العضوية</h3>
          <p className="text-gray-600">
            تفاصيل عضويتك في جمعية العلوم السياسية
          </p>
        </div>
        <Link
          to="/payment"
          className="mt-2 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {membership ? 'تجديد العضوية' : 'اشترك الآن'}
        </Link>
      </div>

      <div className="border-t border-gray-200 pt-4">
        {membership ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">نوع العضوية:</span>
              <span className="text-lg">{membership.type}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">الحالة:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${membershipStatus.statusClass}`}>
                {membershipStatus.status}
              </span>
            </div>
            
            {isActive && (
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">الأيام المتبقية:</span>
                <span className="text-lg">{membershipStatus.daysLeft} يوم</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">تاريخ البدء:</span>
              <span className="text-lg">{new Date(membership.startDate).toLocaleDateString('ar-SA')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">تاريخ الانتهاء:</span>
              <span className="text-lg">{new Date(membership.expiresAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">أنت غير مشترك في أي عضوية حالياً</h3>
            <p className="text-gray-600 mb-6">
              اشترك الآن للاستفادة من مزايا العضوية المتنوعة والمشاركة في فعاليات الجمعية
            </p>
            <Link
              to="/payment"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              اشترك الآن
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipStatus;