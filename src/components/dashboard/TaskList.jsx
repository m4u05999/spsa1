// src/components/dashboard/TaskList.jsx
import React, { useState, useEffect } from 'react';
import { useMasterData } from '../../hooks/useMasterData';

const TaskList = ({ userId, userRole = 'user' }) => {
  const {
    data: allContent,
    loading,
    error,
    getContent,
    updateContent
  } = useMasterData();

  // State for tasks and permissions
  const [tasks, setTasks] = useState([]);
  const [permissions, setPermissions] = useState({
    canManageTasks: false,
    canViewAllTasks: false,
    canCreateTasks: false
  });

  // Fetch tasks and permissions from MasterDataService
  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        // Determine user permissions based on role
        const userPermissions = {
          canManageTasks: ['admin', 'staff'].includes(userRole),
          canViewAllTasks: ['admin', 'staff'].includes(userRole),
          canCreateTasks: ['admin', 'staff'].includes(userRole)
        };

        // Fetch tasks based on permissions
        let tasksData = [];
        if (userPermissions.canViewAllTasks) {
          // Admin/Staff can see all tasks
          tasksData = await getContent({
            contentType: 'tasks',
            limit: 50,
            sortBy: 'created_at',
            sortOrder: 'desc'
          });
        } else if (userId) {
          // Regular users see only their assigned tasks
          tasksData = await getContent({
            contentType: 'tasks',
            filters: { assignedTo: userId },
            limit: 20,
            sortBy: 'dueDate',
            sortOrder: 'asc'
          });
        }

        // Enhanced tasks with additional data
        const enhancedTasks = tasksData?.data || [
          {
            id: 1,
            title: 'مراجعة المحتوى الجديد',
            description: 'مراجعة وتدقيق المحتوى المضاف حديثاً للموقع',
            status: 'pending',
            priority: 'high',
            assignedTo: userId || 'user1',
            assignedBy: 'admin',
            dueDate: '2024-01-15',
            createdAt: '2024-01-10',
            category: 'content',
            progress: 0
          },
          {
            id: 2,
            title: 'تحديث بيانات الأعضاء',
            description: 'تحديث قاعدة بيانات الأعضاء وإضافة المعلومات الناقصة',
            status: 'in_progress',
            priority: 'medium',
            assignedTo: userId || 'user2',
            assignedBy: 'staff',
            dueDate: '2024-01-20',
            createdAt: '2024-01-12',
            category: 'data',
            progress: 45
          },
          {
            id: 3,
            title: 'إعداد تقرير شهري',
            description: 'إعداد التقرير الشهري لأنشطة الجمعية',
            status: 'completed',
            priority: 'low',
            assignedTo: 'staff1',
            assignedBy: 'admin',
            dueDate: '2024-01-08',
            createdAt: '2024-01-05',
            category: 'reports',
            progress: 100
          }
        ];

        setTasks(enhancedTasks);
        setPermissions(userPermissions);

      } catch (error) {
        console.error('خطأ في جلب بيانات المهام:', error);
        // Fallback data
        setTasks([
          {
            id: 1,
            title: 'مهمة تجريبية',
            description: 'وصف المهمة التجريبية',
            status: 'pending',
            priority: 'medium',
            assignedTo: userId || 'user1',
            dueDate: '2024-01-15',
            progress: 0
          }
        ]);
        setPermissions({
          canManageTasks: ['admin', 'staff'].includes(userRole),
          canViewAllTasks: ['admin', 'staff'].includes(userRole),
          canCreateTasks: ['admin', 'staff'].includes(userRole)
        });
      }
    };

    fetchTasksData();
  }, [userId, userRole, getContent]);

  // Filter tasks based on user permissions
  const filteredTasks = tasks.filter(task => {
    if (permissions.canViewAllTasks) {
      return true; // Admin/Staff see all tasks
    }
    return task.assignedTo === userId; // Users see only their tasks
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text in Arabic
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'معلقة';
      default:
        return 'غير محدد';
    }
  };

  // Get priority text in Arabic
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">قائمة المهام</h2>
          {permissions.canCreateTasks && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              إضافة مهمة جديدة
            </button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مهام</h3>
            <p className="text-gray-600">لم يتم تعيين أي مهام بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>تاريخ الاستحقاق: {task.dueDate}</span>
                  {task.progress !== undefined && (
                    <span>التقدم: {task.progress}%</span>
                  )}
                </div>

                {task.progress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                )}

                {permissions.canManageTasks && (
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                      onClick={() => {/* Handle status toggle */}}
                    >
                      {task.status === 'completed' ? 'إعادة فتح' : 'إكمال'}
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                      onClick={() => {/* Handle delete */}}
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
