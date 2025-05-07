// src/components/dashboard/UserList.jsx
import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

const UserList = () => {
  const { users, permissions } = useDashboard();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">المستخدمون</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-right">الاسم</th>
                <th className="px-4 py-2 text-right">البريد الإلكتروني</th>
                <th className="px-4 py-2 text-right">الدور</th>
                <th className="px-4 py-2 text-right">الحالة</th>
                {permissions.canManageUsers && (
                  <th className="px-4 py-2 text-right">الإجراءات</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  {permissions.canManageUsers && (
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 ml-2"
                        onClick={() => {/* Handle edit */}}
                      >
                        تعديل
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => {/* Handle delete */}}
                      >
                        حذف
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;