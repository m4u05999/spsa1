// src/context/DashboardContext.jsx
// هذا الملف محتفظ به للتوافق مع الكود القديم
// يُنصح باستخدام UnifiedDashboardContext للتطبيقات الجديدة
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useUnifiedDashboard } from './UnifiedDashboardContext';

const DashboardContext = createContext(null);

const initialState = {
  tasks: [],
  users: [],
  stats: {
    totalMembers: 0,
    activeProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalViews: 0,
    totalLikes: 0,
    membershipStats: {
      activePercentage: 0,
      platinum: { count: 0, percentage: 0 },
      gold: { count: 0, percentage: 0 },
      silver: { count: 0, percentage: 0 },
      bronze: { count: 0, percentage: 0 }
    },
    revenue: {
      total: 0,
      growth: 0,
      byLevel: {
        platinum: 0,
        gold: 0,
        silver: 0,
        bronze: 0
      }
    }
  },
  permissions: {
    canManageUsers: false,
    canManageTasks: false,
    canViewReports: false,
    canEditContent: false
  },
  loading: true,
  error: null
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    default:
      return state;
  }
};

// Function to fetch real statistics using the enhanced dashboard stats service
const fetchRealStats = async () => {
  try {
    console.log('🔄 Fetching dashboard statistics...');
    const stats = await dashboardStatsService.getDashboardStats();
    console.log('✅ Dashboard statistics loaded successfully:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    // Return fallback stats instead of throwing
    return {
      totalMembers: 0,
      activeMembers: 0,
      newMembers: 0,
      totalContent: 0,
      publishedContent: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalViews: 0,
      totalLikes: 0,
      isUsingFallback: true
    };
  }
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user } = useAuth();

  // Fetch real statistics on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const realStats = await fetchRealStats();
        dispatch({ type: 'SET_STATS', payload: realStats });
      } catch (error) {
        console.error('Failed to load dashboard statistics:', error);
        dispatch({ type: 'SET_ERROR', payload: 'فشل في تحميل الإحصائيات' });
        // Keep initial mock data as fallback
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    if (user) {
      // Set permissions based on user role
      const permissions = {
        canManageUsers: user.role === 'admin',
        canManageTasks: ['admin', 'staff'].includes(user.role),
        canViewReports: ['admin', 'staff'].includes(user.role),
        canEditContent: user.role === 'admin'
      };
      dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
    }
  }, [user]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Export default for better compatibility
export default DashboardProvider;