// src/components/dashboard/DashboardStats.jsx
import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const DashboardStats = () => {
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <div className="text-center p-4">جاري التحميل...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const StatCard = ({ title, value, change, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className="text-blue-500">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard
        title="إجمالي الأعضاء"
        value={stats.totalMembers}
        change={stats.membershipGrowth}
        icon="👥"
      />
      <StatCard
        title="الأعضاء النشطين"
        value={stats.activeMembers}
        change={stats.activeMembershipGrowth}
        icon="✅"
      />
      <StatCard
        title="العضويات الجديدة"
        value={stats.newMembers}
        change={stats.newMembershipGrowth}
        icon="🆕"
      />
      <StatCard
        title="إجمالي الإيرادات"
        value={`${stats.totalRevenue} ر.س`}
        change={stats.revenueGrowth}
        icon="💰"
      />
    </div>
  );
};

export default DashboardStats;