// src/pages/dashboard/modules/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions.js';

const Analytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    visitors: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    },
    pageViews: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    },
    topPages: [],
    userActivity: {
      activeUsers: 0,
      newRegistrations: 0,
      returnVisitors: 0
    }
  });

  // Check permissions
  const canViewAnalytics = checkPermission(user, 'analytics', 'view') || user?.role === 'admin';

  useEffect(() => {
    if (canViewAnalytics) {
      loadAnalyticsData();
    }
  }, [canViewAnalytics]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // محاكاة تحميل البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // بيانات تجريبية للتحليلات
      const mockData = {
        visitors: {
          today: 145,
          thisWeek: 1280,
          thisMonth: 5340,
          total: 25780
        },
        pageViews: {
          today: 340,
          thisWeek: 2560,
          thisMonth: 11240,
          total: 67890
        },
        topPages: [
          { path: '/', views: 2340, title: 'الصفحة الرئيسية' },
          { path: '/news', views: 1890, title: 'الأخبار' },
          { path: '/events', views: 1450, title: 'الفعاليات' },
          { path: '/about', views: 1120, title: 'عن الجمعية' },
          { path: '/membership', views: 890, title: 'العضوية' }
        ],
        userActivity: {
          activeUsers: 234,
          newRegistrations: 45,
          returnVisitors: 189
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('خطأ في تحميل بيانات التحليلات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canViewAnalytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">غير مصرح</h3>
          <p className="text-gray-600">ليس لديك صلاحية لعرض التحليلات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التحليلات والإحصائيات</h1>
          <p className="text-gray-600 mt-1">تحليل شامل لاستخدام الموقع وأنشطة المستخدمين</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={loadAnalyticsData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="365">آخر سنة</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      )}

      {/* Analytics Cards */}
      {!isLoading && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard
              title="زوار اليوم"
              value={analyticsData.visitors.today}
              change="+12%"
              changeType="positive"
              icon="👥"
            />
            <AnalyticsCard
              title="مشاهدات الصفحات"
              value={analyticsData.pageViews.today}
              change="+8%"
              changeType="positive"
              icon="👁️"
            />
            <AnalyticsCard
              title="المستخدمون النشطون"
              value={analyticsData.userActivity.activeUsers}
              change="+15%"
              changeType="positive"
              icon="🔥"
            />
            <AnalyticsCard
              title="تسجيلات جديدة"
              value={analyticsData.userActivity.newRegistrations}
              change="+25%"
              changeType="positive"
              icon="✨"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitors Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الزوار</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">اليوم</span>
                  <span className="font-semibold">{analyticsData.visitors.today.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">هذا الأسبوع</span>
                  <span className="font-semibold">{analyticsData.visitors.thisWeek.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">هذا الشهر</span>
                  <span className="font-semibold">{analyticsData.visitors.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm text-gray-600">الإجمالي</span>
                  <span className="font-bold text-lg">{analyticsData.visitors.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Page Views Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">مشاهدات الصفحات</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">اليوم</span>
                  <span className="font-semibold">{analyticsData.pageViews.today.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">هذا الأسبوع</span>
                  <span className="font-semibold">{analyticsData.pageViews.thisWeek.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">هذا الشهر</span>
                  <span className="font-semibold">{analyticsData.pageViews.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm text-gray-600">الإجمالي</span>
                  <span className="font-bold text-lg">{analyticsData.pageViews.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">أكثر الصفحات زيارة</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">{page.path}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{page.views.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">مشاهدة</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="text-center text-xs text-gray-500">
            آخر تحديث: {new Date().toLocaleString('ar-SA')} | البيانات تتحدث كل 5 دقائق
          </div>
        </>
      )}
    </div>
  );
};

// Analytics Card Component
const AnalyticsCard = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change} من الأسبوع الماضي
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default Analytics;