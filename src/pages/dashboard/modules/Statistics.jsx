// src/pages/dashboard/modules/Statistics.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { dashboardStatsService } from '../../../services/dashboardStatsService';
import { useDashboard } from '../../../context/DashboardContext';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const { stats: dashboardStats } = useDashboard();

  // Function to fetch real statistics using the enhanced dashboard stats service
  const fetchRealStatistics = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching detailed statistics...');
      const realStatistics = await dashboardStatsService.getDetailedStats();
      console.log('✅ Detailed statistics loaded:', realStatistics);
      return realStatistics;
    } catch (error) {
      console.error('❌ Error fetching real statistics:', error);
      // Return fallback mock data with proper structure
      return {
        users: { total: 0, active: 0, new: 0, growthRate: 0 },
        content: { articles: 0, news: 0, research: 0, publications: 0 },
        events: { total: 0, upcoming: 0, past: 0, participants: 0 },
        membership: { applications: 0, approved: 0, pending: 0, rejected: 0 },
        engagement: { comments: 0, likes: 0, shares: 0 },
        traffic: { daily: [], weekly: [], monthly: [] },
        isUsingFallback: true
      };
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const realStats = await fetchRealStatistics();
        setStats(realStats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Prepare data for charts
  const prepareTrafficData = () => {
    if (!stats) return [];
    
    if (timeFilter === 'daily') {
      return stats.traffic.daily.map((value, index) => ({
        name: `اليوم ${index + 1}`,
        زوار: value
      }));
    } else if (timeFilter === 'weekly') {
      return stats.traffic.weekly.map((value, index) => ({
        name: `الأسبوع ${index + 1}`,
        زوار: value
      }));
    } else {
      return stats.traffic.monthly.map((value, index) => ({
        name: `الشهر ${index + 1}`,
        زوار: value
      }));
    }
  };

  const prepareMembershipData = () => {
    if (!stats) return [];
    
    return [
      { name: 'مقبولة', value: stats.membership.approved, fill: '#4ade80' },
      { name: 'قيد المراجعة', value: stats.membership.pending, fill: '#facc15' },
      { name: 'مرفوضة', value: stats.membership.rejected, fill: '#f87171' },
    ];
  };

  const prepareContentData = () => {
    if (!stats) return [];
    
    return [
      { name: 'مقالات', value: stats.content.articles, fill: '#8884d8' },
      { name: 'أخبار', value: stats.content.news, fill: '#82ca9d' },
      { name: 'أبحاث', value: stats.content.research, fill: '#ffc658' },
      { name: 'منشورات', value: stats.content.publications, fill: '#ff8042' },
    ];
  };

  const prepareEngagementData = () => {
    if (!stats) return [];
    
    return [
      { name: 'تعليقات', value: stats.engagement.comments, fill: '#8884d8' },
      { name: 'إعجابات', value: stats.engagement.likes, fill: '#82ca9d' },
      { name: 'مشاركات', value: stats.engagement.shares, fill: '#ffc658' },
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإحصائيات والتحليلات</h1>
        
        <div className="flex flex-wrap mt-4 md:mt-0 gap-2">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              id="filter-daily"
              name="filter-daily"
              onClick={() => setTimeFilter('daily')}
              className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 ${timeFilter === 'daily' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              يومي
            </button>
            <button
              type="button"
              id="filter-weekly"
              name="filter-weekly"
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 ${timeFilter === 'weekly' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              أسبوعي
            </button>
            <button
              type="button"
              id="filter-monthly"
              name="filter-monthly"
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 ${timeFilter === 'monthly' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              شهري
            </button>
          </div>
          
          <button
            type="button"
            id="toggle-detailed-view"
            name="toggle-detailed-view"
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            {showDetailedStats ? 'عرض موجز' : 'عرض تفصيلي'}
          </button>
        </div>
      </div>
      
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* المخططات البيانية التفاعلية - تظهر فقط في العرض التفصيلي */}
      {showDetailedStats && (
        <div className="mt-8 space-y-8">
          {/* مخطط حركة الزوار عبر الزمن */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">حركة الزوار ({timeFilter === 'daily' ? 'يومي' : timeFilter === 'weekly' ? 'أسبوعي' : 'شهري'})</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={prepareTrafficData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`${value}`, 'عدد الزوار']} />
                <Area type="monotone" dataKey="زوار" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* مخطط توزيع المحتوى */}
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">توزيع أنواع المحتوى</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareContentData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareContentData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'العدد']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* مخطط نشاط المستخدمين */}
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">نشاط المستخدمين</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={prepareEngagementData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'العدد']} />
                  <Legend />
                  <Bar dataKey="value" name="العدد" fill="#8884d8">
                    {prepareEngagementData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* مخطط طلبات العضوية */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">حالة طلبات العضوية</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareMembershipData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {prepareMembershipData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'العدد']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
