// src/components/dashboard/UserInfo.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserInfo = ({ user }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  return (
    <div className="bg-white shadow rounded-lg p-6 col-span-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">معلومات الحساب</h3>
          <p className="text-gray-600">
            أساسيات حسابك ومعلوماتك الشخصية
          </p>
        </div>
        <Link
          to="/profile"
          className="mt-2 md:mt-0 inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
        >
          تعديل الملف الشخصي
        </Link>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">الاسم الكامل</dt>
            <dd className="mt-1 text-gray-900">{user.name || 'غير محدد'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">البريد الإلكتروني</dt>
            <dd className="mt-1 text-gray-900">{user.email || 'غير محدد'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">رقم الهاتف</dt>
            <dd className="mt-1 text-gray-900">{user.phone || 'غير محدد'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">التخصص</dt>
            <dd className="mt-1 text-gray-900">{user.specialization || 'غير محدد'}</dd>
          </div>

          {showMoreInfo && (
            <>
              <div className="col-span-1 md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">نبذة مختصرة</dt>
                <dd className="mt-1 text-gray-900">{user.bio || 'لا توجد معلومات إضافية'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">تاريخ الانضمام</dt>
                <dd className="mt-1 text-gray-900">
                  {user.joinDate 
                    ? new Date(user.joinDate).toLocaleDateString('ar-SA') 
                    : new Date().toLocaleDateString('ar-SA')}
                </dd>
              </div>
            </>
          )}
        </dl>

        <button
          type="button"
          className="mt-6 text-sm text-blue-600 hover:text-blue-800"
          onClick={() => setShowMoreInfo(!showMoreInfo)}
        >
          {showMoreInfo ? 'عرض معلومات أقل' : 'عرض المزيد من المعلومات'}
        </button>
      </div>
    </div>
  );
};

export default UserInfo;