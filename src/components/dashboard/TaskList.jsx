// src/components/dashboard/TaskList.jsx
import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

const TaskList = () => {
  const { tasks, permissions } = useDashboard();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'قيد الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">المهام</h2>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-gray-600">{task.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    تاريخ التسليم: {task.dueDate}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                  {permissions.canManageTasks && (
                    <div className="mt-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 ml-2"
                        onClick={() => {/* Handle edit */}}
                      >
                        تعديل
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => {/* Handle delete */}}
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;