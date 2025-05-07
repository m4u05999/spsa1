// src/components/profile/ProfileCard.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileCard = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    specialty: user.specialty || '',
    organization: user.organization || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">التخصص</label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">المؤسسة</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">معلومات العضو</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              تعديل
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">الاسم</h3>
              <p className="mt-1">{user.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">البريد الإلكتروني</h3>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">التخصص</h3>
              <p className="mt-1">{user.specialty || 'غير محدد'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">المؤسسة</h3>
              <p className="mt-1">{user.organization || 'غير محدد'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;