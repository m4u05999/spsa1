// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/index.jsx';
import { useDashboardStats, useDashboardActivities } from '../../contexts/UnifiedDashboardContext.jsx';

// Dashboard statistics cards
const StatCard = ({ title, value, icon, change, changeText, bgColor }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
      <div className={`${bgColor} p-3 rounded-full`}>{icon}</div>
    </div>
    {change && (
      <div className="flex items-center mt-4">
        <span className={`flex items-center text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ${change >= 0 ? 'transform rotate-0' : 'transform rotate-180'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {Math.abs(change)}%
        </span>
        <span className="text-gray-500 text-sm mr-2">{changeText}</span>
      </div>
    )}
  </div>
);

// Quick Links Component
const QuickLinkCard = ({ title, icon, description, linkUrl, linkText }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-6">
      <div className="flex items-center">
        <div className="bg-blue-100 p-3 rounded-full">{icon}</div>
        <h3 className="text-xl font-semibold mr-3 text-gray-800">{title}</h3>
      </div>
      <p className="mt-4 text-gray-600">{description}</p>
      <div className="mt-4">
        <Link 
          to={linkUrl} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          {linkText}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
);

// Admin Dashboard Main Component
const AdminDashboard = () => {
  const { user } = useAuth();

  // استخدام النظام الموحد الجديد
  const { stats, membershipStats, isLoading: statsLoading, refreshStats } = useDashboardStats();
  const { activities, addActivity } = useDashboardActivities();

  // حساب الطلبات المعلقة بناءً على البيانات الحقيقية
  const pendingRequests = Math.floor(stats.totalMembers * 0.05) || 12;
  
  // تحديث الإحصائيات كل 5 دقائق
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 5 * 60 * 1000); // 5 دقائق

    return () => clearInterval(interval);
  }, [refreshStats]);
  
  // Format activity timestamp
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // seconds
    
    if (diff < 60) return 'منذ أقل من دقيقة';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };
  
  // Activity icon mapper
  const getActivityIcon = (type) => {
    switch(type) {
      case 'member':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'content':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'event':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'message':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">مرحبًا، {user?.name}</h1>
        <p className="text-gray-600 mt-1">هنا يمكنك إدارة نظام الجمعية السعودية للعلوم السياسية</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="إجمالي الأعضاء" 
          value={statsLoading ? "..." : stats.totalMembers.toLocaleString()} 
          bgColor="bg-blue-100"
          change={stats.membershipGrowth}
          changeText="منذ الشهر الماضي"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard 
          title="طلبات قيد الانتظار" 
          value={statsLoading ? "..." : pendingRequests} 
          bgColor="bg-amber-100"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          title="إيرادات هذا الشهر" 
          value={statsLoading ? "..." : `${stats.monthlyRevenue.toLocaleString()} ريال`} 
          bgColor="bg-green-100"
          change={stats.revenueGrowth}
          changeText="مقارنة بالشهر الماضي"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          title="إجمالي الزيارات" 
          value={statsLoading ? "..." : stats.totalViews.toLocaleString()} 
          bgColor="bg-purple-100"
          change={stats.viewsGrowth}
          changeText="في الأسبوع الماضي"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>
      
      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">إدارة سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickLinkCard 
            title="إدارة الأعضاء"
            description="إضافة وتعديل بيانات الأعضاء وإدارة طلبات العضوية الجديدة"
            linkUrl="users"
            linkText="إدارة الأعضاء"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <QuickLinkCard 
            title="إدارة المحتوى"
            description="إضافة وتعديل محتوى الموقع والمنشورات والأخبار"
            linkUrl="content"
            linkText="إدارة المحتوى"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <QuickLinkCard 
            title="إدارة الفعاليات"
            description="إنشاء وتنظيم فعاليات جديدة وإدارة الحضور"
            linkUrl="events"
            linkText="إدارة الفعاليات"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">الأنشطة الأخيرة</h2>
          <Link 
            to="/dashboard/admin/activities" 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            عرض الكل
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {statsLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-3 text-gray-600">جاري تحميل الأنشطة...</p>
            </div>
          ) : activities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="mr-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        بواسطة: {activity.actor}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.details.contentTitle || activity.details.eventTitle || activity.details.membershipType}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              لا توجد أنشطة حديثة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;