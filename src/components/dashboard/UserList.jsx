// src/components/dashboard/UserList.jsx
import React, { useState, useEffect } from 'react';
import { useMasterData } from '../../hooks/useMasterData';

const UserList = ({ currentUserRole = 'user', limit = 10 }) => {
  const {
    data: allContent,
    loading,
    error,
    getContent,
    updateContent,
    searchContent
  } = useMasterData();

  // State for users and permissions
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({
    canManageUsers: false,
    canViewAllUsers: false,
    canEditUsers: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users and permissions from MasterDataService
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        // Determine user permissions based on role
        const userPermissions = {
          canManageUsers: ['admin'].includes(currentUserRole),
          canViewAllUsers: ['admin', 'staff'].includes(currentUserRole),
          canEditUsers: ['admin'].includes(currentUserRole)
        };

        // Fetch users based on permissions
        let usersData = [];
        if (userPermissions.canViewAllUsers) {
          usersData = await getContent({
            contentType: 'users',
            limit: limit,
            sortBy: 'created_at',
            sortOrder: 'desc'
          });
        }

        // Fetch user roles for better display
        const userRoles = await getContent({
          contentType: 'user-roles',
          limit: 20
        });

        // Enhance users with role information
        const enhancedUsers = usersData?.map(user => ({
          ...user,
          roleName: userRoles?.find(role => role.id === user.roleId)?.name || user.role || 'مستخدم',
          isActive: user.status === 'active' || user.isActive !== false
        })) || [];

        setUsers(enhancedUsers);
        setFilteredUsers(enhancedUsers);
        setPermissions(userPermissions);

      } catch (err) {
        console.error('خطأ في جلب بيانات المستخدمين:', err);
        // Use fallback data on error
        setUsers([]);
        setFilteredUsers([]);
        setPermissions({
          canManageUsers: false,
          canViewAllUsers: false,
          canEditUsers: false
        });
      }
    };

    fetchUsersData();
  }, [currentUserRole, limit, getContent]);

  // Handle search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex space-x-4 space-x-reverse">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">قائمة المستخدمين</h2>
          {permissions.canManageUsers && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              إضافة مستخدم جديد
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="البحث في المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستخدمون</h3>
            <p className="text-gray-600">لم يتم تسجيل أي مستخدمين بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  {permissions.canManageUsers && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'م'}
                          </div>
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'غير محدد'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || 'غير محدد'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    {permissions.canManageUsers && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                            onClick={() => {/* Handle edit */}}
                          >
                            تعديل
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                            onClick={() => {/* Handle delete */}}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;