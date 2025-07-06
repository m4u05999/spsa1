// src/pages/dashboard/modules/UserManagementTest.jsx
import React, { useState, useEffect } from 'react';

const UserManagementTest = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // محاولة تحميل البيانات من localStorage
    try {
      const storedUsers = localStorage.getItem('spsa_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🧪 اختبار إدارة المستخدمين
        </h1>
        
        <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            ✅ تم تحميل المكون بنجاح!
          </h2>
          <p className="text-green-700">
            هذا يعني أن مشكلة "Failed to fetch dynamically imported module" تم حلها.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800">عدد المستخدمين</h3>
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800">المدراء</h3>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800">الأعضاء</h3>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'MEMBER').length}
            </p>
          </div>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'MEMBER' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        user.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                        user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ لا توجد بيانات مستخدمين
              </h3>
              <p className="text-yellow-700 mb-4">
                يبدو أن البيانات الافتراضية لم يتم تهيئتها بعد.
              </p>
              <button 
                onClick={() => window.open('/initialize-system-data.html', '_blank')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
              >
                فتح أداة التهيئة
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">معلومات تقنية:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• تم تحميل المكون من: /src/pages/dashboard/modules/UserManagementTest.jsx</li>
            <li>• البيانات مصدرها: localStorage.getItem('spsa_users')</li>
            <li>• هذا مكون اختبار مبسط للتأكد من حل مشكلة التحميل الديناميكي</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTest;
