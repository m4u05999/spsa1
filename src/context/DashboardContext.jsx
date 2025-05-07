// src/context/DashboardContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DashboardContext = createContext(null);

const initialState = {
  tasks: [],
  users: [],
  stats: {
    totalMembers: 1250,
    activeProjects: 8,
    pendingTasks: 15,
    completedTasks: 45,
    membershipStats: {
      activePercentage: 78,
      platinum: { count: 50, percentage: 4 },
      gold: { count: 200, percentage: 16 },
      silver: { count: 450, percentage: 36 },
      bronze: { count: 550, percentage: 44 }
    },
    revenue: {
      total: 125000,
      growth: 10,
      byLevel: {
        platinum: 35000,
        gold: 45000,
        silver: 30000,
        bronze: 15000
      }
    }
  },
  permissions: {
    canManageUsers: false,
    canManageTasks: false,
    canViewReports: false,
    canEditContent: false
  }
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
      return { ...state, stats: action.payload };
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

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user } = useAuth();

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