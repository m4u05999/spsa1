// src/pages/dashboard/modules/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { checkPermission } from '../../../utils/permissions';
import UserModal from '../../../components/modals/UserModal';
import userManagementApi from '../../../services/api/userManagementApi';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userManagementApi.getUsers({
        page: 1,
        limit: 100, // Load all users for now
        search: searchTerm,
        role: selectedRole !== 'all' ? selectedRole : '',
        status: selectedStatus !== 'all' ? selectedStatus : ''
      });

      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        console.error('Failed to load users:', response.error);
        // Keep existing users if API fails
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Keep existing users if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users when search or filters change
  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(
        user => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 user.email.toLowerCase().includes(searchTerm.toLowerCase());
        }
      );
    }

    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(result);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  // Format date to Arabic format
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'active' ? 'suspended' : 'active';

      const response = await userManagementApi.updateUserStatus(userId, newStatus);

      if (response.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId ? { ...u, status: newStatus } : u
          )
        );
      } else {
        console.error('Failed to update user status:', response.error);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Handle modal actions
  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
    setModalMode('create');
  };

  const handleModalSubmit = async (formData) => {
    try {
      let response;

      if (modalMode === 'create') {
        response = await userManagementApi.createUser(formData);
      } else if (modalMode === 'edit') {
        response = await userManagementApi.updateUser(selectedUser.id, formData);
      }

      if (response.success) {
        // Reload users to get updated data
        await loadUsers();
        closeModal();
      } else {
        console.error('Failed to save user:', response.error);
        alert('فشل في حفظ المستخدم');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('حدث خطأ أثناء حفظ المستخدم');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        const response = await userManagementApi.deleteUser(userId);

        if (response.success) {
          // Remove user from local state
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } else {
          console.error('Failed to delete user:', response.error);
          alert('فشل في حذف المستخدم');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };

  // User role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // User status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate role to Arabic
  const translateRole = (role) => {
    const roles = {
      'admin': 'مدير',
      'staff': 'موظف',
      'member': 'عضو'
    };
    return roles[role] || role;
  };

  // Translate status to Arabic
  const translateStatus = (status) => {
    const statuses = {
      'active': 'نشط',
      'suspended': 'معلق',
      'inactive': 'غير نشط'
    };
    return statuses[status] || status;
  };

  // Check if user can manage users
  const canManageUsers = checkPermission(user, 'users.manage');

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع المستخدمين في النظام</p>
        </div>
        {canManageUsers && (
          <button
            onClick={() => openModal('create')}
            className="mt-4 lg:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة مستخدم جديد
            </span>
          </button>
        )}
      </div>

      {/* Filters and search */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                placeholder="البحث بالاسم أو البريد الإلكتروني"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Role filter */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
            <select
              id="role"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">جميع الأدوار</option>
              <option value="admin">مدير</option>
              <option value="staff">موظف</option>
              <option value="member">عضو</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              id="status"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="suspended">معلق</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-600">جاري تحميل المستخدمين...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الانضمام
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر نشاط
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profilePicture ? (
                              <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-lg">
                                  {(user.firstName || user.email).charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {translateRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                          {translateStatus(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'لم يسجل دخول'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 space-x-reverse">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => openModal('view', user)}
                          >
                            عرض
                          </button>
                          {canManageUsers && (
                            <>
                              <button
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={() => openModal('edit', user)}
                              >
                                تعديل
                              </button>
                              {user.role !== 'admin' && (
                                <>
                                  <button
                                    className={user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                    onClick={() => toggleUserStatus(user.id)}
                                  >
                                    {user.status === 'active' ? 'تعليق' : 'تفعيل'}
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    حذف
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      لا توجد نتائج مطابقة للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalIsOpen}
        onClose={closeModal}
        mode={modalMode}
        userData={selectedUser}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default UserManagement;