// src/pages/profile/ProfilePage.jsx
import React from 'react';
import { useAuth } from '../../contexts/index.jsx';
import ProfileCard from '../../components/profile/ProfileCard';
import Manage2FA from '../../components/auth/Manage2FA';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return window.location.href = '/login';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">الملف الشخصي</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ProfileCard />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">المصادقة الثنائية</h2>
            <Manage2FA />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">النشاطات الأخيرة</h2>
            {/* سيتم إضافة النشاطات لاحقاً */}
            <div className="text-gray-500">لا توجد نشاطات حديثة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;