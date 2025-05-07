// src/pages/dashboard/StaffDashboard.jsx
import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import StatsCard from '../../components/dashboard/StatsCard';
import TaskList from '../../components/dashboard/TaskList';

const StaffDashboard = () => {
  const { stats, tasks } = useDashboard();
  
  const myTasks = tasks.filter(task => task.assignedTo === 'currentUserId'); // Replace with actual user ID

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">لوحة تحكم الموظفين</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="مهامي"
          value={myTasks.length}
          icon={<span className="text-2xl">📝</span>}
          color="border-blue-500"
        />
        <StatsCard
          title="قيد التنفيذ"
          value={myTasks.filter(task => task.status === 'in_progress').length}
          icon={<span className="text-2xl">🔄</span>}
          color="border-yellow-500"
        />
        <StatsCard
          title="مكتملة"
          value={myTasks.filter(task => task.status === 'completed').length}
          icon={<span className="text-2xl">✅</span>}
          color="border-green-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">مهامي</h2>
        <TaskList tasks={myTasks} />
      </div>
    </div>
  );
};

export default StaffDashboard;