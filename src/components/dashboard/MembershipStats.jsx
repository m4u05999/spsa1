// src/components/dashboard/MembershipStats.jsx
import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const MembershipStats = () => {
  const { membershipStats, isLoading, error } = useDashboardStats();

  if (isLoading) return <div className="text-center p-4">جاري التحميل...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const MembershipLevel = ({ level, count, percentage, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{level}</h3>
        <span className="text-sm text-gray-500">{count} عضو</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-1">{percentage}%</p>
    </div>
  );

  const ActiveInactiveChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="font-medium mb-4">حالة العضوية</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span>نشط</span>
            <span>{membershipStats.activePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${membershipStats.activePercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span>غير نشط</span>
            <span>{100 - membershipStats.activePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: `${100 - membershipStats.activePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <ActiveInactiveChart />
      
      <div className="grid gap-6">
        <MembershipLevel
          level="عضوية بلاتينية"
          count={membershipStats.platinum.count}
          percentage={membershipStats.platinum.percentage}
          color="bg-purple-600"
        />
        <MembershipLevel
          level="عضوية ذهبية"
          count={membershipStats.gold.count}
          percentage={membershipStats.gold.percentage}
          color="bg-yellow-500"
        />
        <MembershipLevel
          level="عضوية فضية"
          count={membershipStats.silver.count}
          percentage={membershipStats.silver.percentage}
          color="bg-gray-400"
        />
        <MembershipLevel
          level="عضوية برونزية"
          count={membershipStats.bronze.count}
          percentage={membershipStats.bronze.percentage}
          color="bg-orange-500"
        />
      </div>
    </div>
  );
};

export default MembershipStats;