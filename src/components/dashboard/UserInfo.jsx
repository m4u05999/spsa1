// src/components/dashboard/UserInfo.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMasterData } from '../../hooks/useMasterData';

const UserInfo = ({ user: propUser }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const {
    data: allContent,
    loading,
    error,
    getContent,
    updateContent
  } = useMasterData();

  // State for enhanced user data
  const [user, setUser] = useState(propUser || {});
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    membershipDuration: 0,
    lastActivity: null
  });

  // Fetch enhanced user data from MasterDataService
  useEffect(() => {
    const fetchUserData = async () => {
      if (!propUser?.id) {
        setUser(propUser || {});
        return;
      }

      try {
        // Fetch complete user profile
        const userProfile = await getContent({
          contentType: 'user-profiles',
          filters: { userId: propUser.id }
        });

        // Fetch user activity stats
        const userPosts = await getContent({
          contentType: 'posts',
          filters: { authorId: propUser.id }
        });

        const userComments = await getContent({
          contentType: 'comments',
          filters: { userId: propUser.id }
        });

        // Fetch membership history
        const membershipHistory = await getContent({
          contentType: 'membership-history',
          filters: { userId: propUser.id },
          sortBy: 'created_at',
          sortOrder: 'asc'
        });

        // Calculate enhanced user data
        const enhancedUser = {
          ...propUser,
          ...(userProfile?.[0] || {}),
          bio: userProfile?.[0]?.bio || propUser.bio || 'لا توجد معلومات إضافية',
          specialization: userProfile?.[0]?.specialization || propUser.specialization || 'غير محدد',
          joinDate: membershipHistory?.[0]?.created_at || propUser.joinDate || new Date().toISOString()
        };

        // Calculate user statistics
        const stats = {
          totalPosts: userPosts?.length || 0,
          totalComments: userComments?.length || 0,
          membershipDuration: membershipHistory?.length || 0,
          lastActivity: userPosts?.[0]?.created_at || userComments?.[0]?.created_at || null
        };

        setUser(enhancedUser);
        setUserStats(stats);

      } catch (err) {
        console.error('خطأ في جلب بيانات المستخدم المحسنة:', err);
        // Use fallback data on error
        setUser(propUser || {});
        setUserStats({
          totalPosts: 0,
          totalComments: 0,
          membershipDuration: 0,
          lastActivity: null
        });
      }
    };

    fetchUserData();
  }, [propUser, getContent]);

  // Loading state
  if (loading && !user.name) {
    return (
      <div className="bg-white shadow rounded-lg p-6 col-span-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

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

              <div>
                <dt className="text-sm font-medium text-gray-500">إجمالي المنشورات</dt>
                <dd className="mt-1 text-gray-900">{userStats.totalPosts} منشور</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">إجمالي التعليقات</dt>
                <dd className="mt-1 text-gray-900">{userStats.totalComments} تعليق</dd>
              </div>

              {userStats.lastActivity && (
                <div className="col-span-1 md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">آخر نشاط</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(userStats.lastActivity).toLocaleDateString('ar-SA')}
                  </dd>
                </div>
              )}
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