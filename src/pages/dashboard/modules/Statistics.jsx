// src/pages/dashboard/modules/Statistics.jsx
import React, { useEffect, useState } from 'react';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch statistics
    const fetchStatistics = async () => {
      try {
        // In a real app, this would be an API call
        setLoading(true);
        
        // Mock data for statistics
        const mockStatistics = {
          users: {
            total: 1250,
            active: 876,
            new: 124,
            growthRate: 12.5
          },
          content: {
            articles: 345,
            news: 142,
            research: 73,
            publications: 48
          },
          events: {
            total: 24,
            upcoming: 8,
            past: 16,
            participants: 2450
          },
          membership: {
            applications: 56,
            approved: 42,
            pending: 14,
            rejected: 8
          },
          engagement: {
            comments: 1245,
            likes: 3670,
            shares: 890
          },
          traffic: {
            daily: [120, 145, 132, 167, 190, 178, 199],
            weekly: [780, 890, 932, 1050, 1200],
            monthly: [3200, 3800, 4100, 4500, 5100, 4800]
          }
        };
        
        // Simulate network delay
        setTimeout(() => {
          setStats(mockStatistics);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">الإحصائيات والتحليلات</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* User Statistics Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold mb-2">المستخدمين</h2>
              <p className="text-3xl font-bold">{stats.users.total}</p>
              <p className="text-sm opacity-80 mt-1">نشط: {stats.users.active}</p>
            </div>
            <div className="bg-white bg-opacity-30 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-100 bg-green-500 bg-opacity-30 px-2 py-1 rounded-full text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              {stats.users.growthRate}%
            </span>
            <span className="text-sm text-white text-opacity-70 mr-2">في الشهر الماضي</span>
          </div>
        </div>

        {/* Content Statistics Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold mb-2">المحتوى</h2>
              <p className="text-3xl font-bold">{stats.content.articles + stats.content.news + stats.content.research + stats.content.publications}</p>
              <p className="text-sm opacity-80 mt-1">أبحاث: {stats.content.research}</p>
            </div>
            <div className="bg-white bg-opacity-30 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>مقالات: {stats.content.articles}</span>
              <span>أخبار: {stats.content.news}</span>
              <span>منشورات: {stats.content.publications}</span>
            </div>
          </div>
        </div>

        {/* Events Statistics Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold mb-2">الفعاليات</h2>
              <p className="text-3xl font-bold">{stats.events.total}</p>
              <p className="text-sm opacity-80 mt-1">قادمة: {stats.events.upcoming}</p>
            </div>
            <div className="bg-white bg-opacity-30 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2" 
                style={{ width: `${(stats.events.upcoming / stats.events.total) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>المشاركين: {stats.events.participants}</span>
              <span>الإكتمال: {Math.round((stats.events.past / stats.events.total) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Applications */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">طلبات العضوية</h2>
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-green-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">إجمالي الطلبات</h3>
                <p className="text-sm text-gray-500">خلال الشهر الماضي</p>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.membership.applications}</div>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-green-600 font-bold text-xl">{stats.membership.approved}</div>
              <p className="text-sm text-gray-500">مقبولة</p>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-bold text-xl">{stats.membership.pending}</div>
              <p className="text-sm text-gray-500">قيد المراجعة</p>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-bold text-xl">{stats.membership.rejected}</div>
              <p className="text-sm text-gray-500">مرفوضة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement & Traffic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">التفاعل</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                <span>التعليقات</span>
              </span>
              <span className="font-medium">{stats.engagement.comments}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span>الإعجابات</span>
              </span>
              <span className="font-medium">{stats.engagement.likes}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                <span>المشاركات</span>
              </span>
              <span className="font-medium">{stats.engagement.shares}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">حركة الزوار</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">اليومي</span>
                <span className="text-sm font-medium">{stats.traffic.daily[stats.traffic.daily.length - 1]} زائر</span>
              </div>
              <div className="flex items-end h-16 space-x-1 space-x-reverse">
                {stats.traffic.daily.map((value, index) => {
                  const maxValue = Math.max(...stats.traffic.daily);
                  const height = (value / maxValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-400 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">الأسبوعي</span>
                <span className="text-sm font-medium">{stats.traffic.weekly[stats.traffic.weekly.length - 1]} زائر</span>
              </div>
              <div className="flex items-end h-16 space-x-1 space-x-reverse">
                {stats.traffic.weekly.map((value, index) => {
                  const maxValue = Math.max(...stats.traffic.weekly);
                  const height = (value / maxValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-400 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">أ{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;