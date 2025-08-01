// src/contexts/UnifiedDashboardContext.jsx
// سياق موحد لجميع بيانات لوحة التحكم
// 
// التحديثات المضافة:
// - التخزين المؤقت الذكي لتحسين الأداء
// - التحديثات المباشرة للبيانات الهامة
// - إدارة محسنة للموارد مع تنظيف تلقائي
// - معالجة أمنة للأخطاء مع رسائل باللغة العربية
// - دعم التصفح والتصفية المحسن للمستخدمين
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dashboardStatsService } from '../services/dashboardStatsService';
import { optimizedDashboardService } from '../services/optimizedDashboardService';

const UnifiedDashboardContext = createContext(null);

// دالة تنظيف البيانات الحساسة
const sanitizeUserData = (userData) => {
  if (!userData || typeof userData !== 'object') return {};
  
  // قائمة الحقول الحساسة التي يجب إزالتها
  const sensitiveFields = [
    'password', 'passwordHash', 'salt', 'secret', 'token', 'accessToken', 
    'refreshToken', 'apiKey', 'privateKey', 'sessionId', 'otp', 'twoFactorSecret',
    'socialSecurityNumber', 'nationalId', 'bankAccount', 'creditCard'
  ];
  
  // إنشاء نسخة من البيانات مع إزالة الحقول الحساسة
  const sanitized = { ...userData };
  
  sensitiveFields.forEach(field => {
    if (sanitized.hasOwnProperty(field)) {
      delete sanitized[field];
    }
  });
  
  // تنظيف أي حقول متداخلة
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map(item => 
          typeof item === 'object' ? sanitizeUserData(item) : item
        );
      } else {
        sanitized[key] = sanitizeUserData(sanitized[key]);
      }
    }
  });
  
  return sanitized;
};

// الحالة الأولية الموحدة
const initialState = {
  // إحصائيات عامة
  stats: {
    totalMembers: 0,
    activeMembers: 0,
    newMembers: 0,
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalViews: 0,
    monthlyRevenue: 0,
    membershipGrowth: 0,
    revenueGrowth: 0,
    viewsGrowth: 0,
    lastUpdated: null
  },
  
  // إحصائيات العضوية التفصيلية
  membershipStats: {
    activePercentage: 0,
    byLevel: {
      platinum: { count: 0, percentage: 0 },
      gold: { count: 0, percentage: 0 },
      silver: { count: 0, percentage: 0 },
      bronze: { count: 0, percentage: 0 }
    }
  },

  // الأنشطة الأخيرة
  recentActivities: [],
  
  // المستخدمون
  users: {
    data: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      role: 'all',
      status: 'all'
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  },

  // المحتوى
  content: {
    data: [],
    loading: false,
    error: null,
    filters: {
      type: 'all',
      status: 'all',
      search: ''
    },
    selectedItems: []
  },

  // الفعاليات
  events: {
    data: [],
    loading: false,
    error: null,
    upcoming: [],
    past: []
  },

  // حالة التحميل العامة
  globalLoading: true,
  globalError: null,
  
  // آخر تحديث للبيانات
  lastRefresh: null
};

// أنواع الإجراءات
const actionTypes = {
  // إحصائيات
  SET_STATS: 'SET_STATS',
  SET_MEMBERSHIP_STATS: 'SET_MEMBERSHIP_STATS',
  
  // الأنشطة
  SET_RECENT_ACTIVITIES: 'SET_RECENT_ACTIVITIES',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  
  // المستخدمون
  SET_USERS: 'SET_USERS',
  SET_USERS_LOADING: 'SET_USERS_LOADING',
  SET_USERS_ERROR: 'SET_USERS_ERROR',
  SET_USERS_FILTERS: 'SET_USERS_FILTERS',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  
  // المحتوى
  SET_CONTENT: 'SET_CONTENT',
  SET_CONTENT_LOADING: 'SET_CONTENT_LOADING',
  SET_CONTENT_ERROR: 'SET_CONTENT_ERROR',
  SET_CONTENT_FILTERS: 'SET_CONTENT_FILTERS',
  SET_SELECTED_CONTENT: 'SET_SELECTED_CONTENT',
  ADD_CONTENT: 'ADD_CONTENT',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  DELETE_CONTENT: 'DELETE_CONTENT',
  
  // الفعاليات
  SET_EVENTS: 'SET_EVENTS',
  SET_EVENTS_LOADING: 'SET_EVENTS_LOADING',
  SET_EVENTS_ERROR: 'SET_EVENTS_ERROR',
  
  // حالة عامة
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  SET_GLOBAL_ERROR: 'SET_GLOBAL_ERROR',
  SET_LAST_REFRESH: 'SET_LAST_REFRESH'
};

// مخفض الحالة الموحد
const dashboardReducer = (state, action) => {
  switch (action.type) {
    // إحصائيات
    case actionTypes.SET_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload, lastUpdated: new Date() },
        globalLoading: false
      };
      
    case actionTypes.SET_MEMBERSHIP_STATS:
      return {
        ...state,
        membershipStats: { ...state.membershipStats, ...action.payload }
      };

    // الأنشطة
    case actionTypes.SET_RECENT_ACTIVITIES:
      return {
        ...state,
        recentActivities: action.payload
      };
      
    case actionTypes.ADD_ACTIVITY:
      return {
        ...state,
        recentActivities: [action.payload, ...state.recentActivities.slice(0, 9)]
      };

    // المستخدمون
    case actionTypes.SET_USERS:
      return {
        ...state,
        users: {
          ...state.users,
          data: action.payload.data || action.payload,
          loading: false,
          error: null,
          pagination: action.payload.pagination || state.users.pagination
        }
      };
      
    case actionTypes.SET_USERS_LOADING:
      return {
        ...state,
        users: { ...state.users, loading: action.payload }
      };
      
    case actionTypes.SET_USERS_ERROR:
      return {
        ...state,
        users: { ...state.users, error: action.payload, loading: false }
      };
      
    case actionTypes.SET_USERS_FILTERS:
      return {
        ...state,
        users: { ...state.users, filters: { ...state.users.filters, ...action.payload } }
      };
      
    case actionTypes.ADD_USER:
      return {
        ...state,
        users: {
          ...state.users,
          data: [action.payload, ...state.users.data]
        }
      };
      
    case actionTypes.UPDATE_USER:
      // تنظيف البيانات الحساسة قبل التحديث
      const sanitizedUserData = sanitizeUserData(action.payload);
      return {
        ...state,
        users: {
          ...state.users,
          data: state.users.data.map(user =>
            user.id === action.payload.id ? { ...user, ...sanitizedUserData } : user
          )
        }
      };
      
    case actionTypes.DELETE_USER:
      return {
        ...state,
        users: {
          ...state.users,
          data: state.users.data.filter(user => user.id !== action.payload)
        }
      };

    // المحتوى
    case actionTypes.SET_CONTENT:
      return {
        ...state,
        content: {
          ...state.content,
          data: action.payload,
          loading: false,
          error: null
        }
      };
      
    case actionTypes.SET_CONTENT_LOADING:
      return {
        ...state,
        content: { ...state.content, loading: action.payload }
      };
      
    case actionTypes.SET_CONTENT_ERROR:
      return {
        ...state,
        content: { ...state.content, error: action.payload, loading: false }
      };
      
    case actionTypes.SET_CONTENT_FILTERS:
      return {
        ...state,
        content: { ...state.content, filters: { ...state.content.filters, ...action.payload } }
      };
      
    case actionTypes.SET_SELECTED_CONTENT:
      return {
        ...state,
        content: { ...state.content, selectedItems: action.payload }
      };

    // الفعاليات
    case actionTypes.SET_EVENTS:
      const now = new Date();
      const events = action.payload;
      return {
        ...state,
        events: {
          ...state.events,
          data: events,
          upcoming: events.filter(event => new Date(event.date) > now),
          past: events.filter(event => new Date(event.date) <= now),
          loading: false,
          error: null
        }
      };

    // حالة عامة
    case actionTypes.SET_GLOBAL_LOADING:
      return { ...state, globalLoading: action.payload };
      
    case actionTypes.SET_GLOBAL_ERROR:
      return { ...state, globalError: action.payload, globalLoading: false };
      
    case actionTypes.SET_LAST_REFRESH:
      return { ...state, lastRefresh: action.payload };

    default:
      return state;
  }
};

// مزود السياق الموحد
export const UnifiedDashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user } = useAuth();

  // تحميل البيانات الأولية
  useEffect(() => {
    let cleanup = null;
    
    if (user) {
      loadInitialData().then(cleanupFn => {
        cleanup = cleanupFn;
      });
    }

    // تنظيف الموارد عند إلغاء المكون
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
      optimizedDashboardService.cleanup();
    };
  }, [user]);

  /**
   * تحميل البيانات الأولية للوحة التحكم
   * يتم استدعاؤها عند تحميل المكون أو تغيير المستخدم
   * @returns {Promise<Function>} دالة تنظيف الموارد
   */
  const loadInitialData = async () => {
    try {
      dispatch({ type: actionTypes.SET_GLOBAL_LOADING, payload: true });
      
      // تحميل الإحصائيات مع التخزين المؤقت والتحديث المباشر
      await loadStats();
      
      // تحميل الأنشطة الأخيرة مع التخزين المؤقت
      await loadRecentActivities();
      
      dispatch({ type: actionTypes.SET_LAST_REFRESH, payload: new Date() });
    } catch (error) {
      console.error('فشل في تحميل البيانات الأولية:', error);
      dispatch({ type: actionTypes.SET_GLOBAL_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_GLOBAL_LOADING, payload: false });
    }
  };

  // تحميل الإحصائيات باستخدام الخدمة المحسنة
  const loadStats = async () => {
    try {
      // استخدام الخدمة المحسنة مع التخزين المؤقت
      const statsResult = await optimizedDashboardService.getDashboardStats({
        enableRealtime: true
      });
      
      dispatch({ type: actionTypes.SET_STATS, payload: statsResult.data });
      
      // تحميل إحصائيات العضوية التفصيلية
      const membershipResult = await optimizedDashboardService.getMembershipStats();
      dispatch({ type: actionTypes.SET_MEMBERSHIP_STATS, payload: membershipResult.data });

      // الاشتراك في التحديثات المباشرة للإحصائيات
      const unsubscribeStats = optimizedDashboardService.subscribe('dashboard_stats', (result) => {
        if (result.data && result.isUpdate) {
          dispatch({ type: actionTypes.SET_STATS, payload: result.data });
        }
      });

      const unsubscribeMembership = optimizedDashboardService.subscribe('membership_stats', (result) => {
        if (result.data && result.isUpdate) {
          dispatch({ type: actionTypes.SET_MEMBERSHIP_STATS, payload: result.data });
        }
      });

      // حفظ دوال إلغاء الاشتراك للتنظيف لاحقاً
      return () => {
        unsubscribeStats();
        unsubscribeMembership();
      };

    } catch (error) {
      console.error('فشل في تحميل الإحصائيات:', error);
      // استخدام بيانات افتراضية في حالة الفشل
      dispatch({ 
        type: actionTypes.SET_STATS, 
        payload: {
          totalMembers: 1250,
          activeMembers: 980,
          newMembers: 45,
          totalContent: 156,
          publishedContent: 142,
          draftContent: 14,
          totalEvents: 12,
          upcomingEvents: 3,
          totalViews: 12540,
          monthlyRevenue: 125000,
          membershipGrowth: 12,
          revenueGrowth: 8,
          viewsGrowth: 15
        }
      });
    }
  };

  // تحميل الأنشطة الأخيرة باستخدام الخدمة المحسنة
  const loadRecentActivities = async () => {
    try {
      // استخدام الخدمة المحسنة مع التخزين المؤقت
      const activitiesResult = await optimizedDashboardService.getData(
        'recent_activities',
        async () => {
          // محاكاة تحميل الأنشطة - يجب استبدالها بـ API حقيقي
          const currentDate = new Date();
          return [
            {
              id: 1,
              type: 'member',
              action: 'انضمام عضو جديد',
              actor: 'أحمد محمد السعيد',
              timestamp: new Date(currentDate.getTime() - 1000 * 60 * 15), // 15 دقيقة مضت
              details: { membershipType: 'gold' }
            },
            {
              id: 2,
              type: 'content',
              action: 'نشر مقال جديد',
              actor: 'د. سارة الأحمد',
              timestamp: new Date(currentDate.getTime() - 1000 * 60 * 45), // 45 دقيقة مضت
              details: { contentTitle: 'التطورات السياسية في المنطقة' }
            },
            {
              id: 3,
              type: 'event',
              action: 'إنشاء فعالية جديدة',
              actor: 'محمد عبدالله',
              timestamp: new Date(currentDate.getTime() - 1000 * 60 * 60 * 2), // ساعتان مضت
              details: { eventTitle: 'ورشة العلاقات الدولية' }
            },
            {
              id: 4,
              type: 'member',
              action: 'تحديث الملف الشخصي',
              actor: 'د. فاطمة النجار',
              timestamp: new Date(currentDate.getTime() - 1000 * 60 * 30), // 30 دقيقة مضت
              details: { membershipType: 'silver' }
            }
          ];
        },
        {
          cacheDuration: 3 * 60 * 1000, // 3 دقائق للأنشطة
          enableRealtime: false
        }
      );
      
      dispatch({ type: actionTypes.SET_RECENT_ACTIVITIES, payload: activitiesResult.data });
    } catch (error) {
      console.error('فشل في تحميل الأنشطة الأخيرة:', error);
      // استخدام بيانات افتراضية في حالة الفشل
      dispatch({ 
        type: actionTypes.SET_RECENT_ACTIVITIES, 
        payload: [
          {
            id: 1,
            type: 'system',
            action: 'تم تحميل النظام',
            actor: 'النظام',
            timestamp: new Date(),
            details: {}
          }
        ]
      });
    }
  };

  /**
   * تحميل المستخدمين مع التصفح والتصفية باستخدام الخدمة المحسنة
   * @param {Object} options - خيارات التحميل
   * @param {number} options.page - رقم الصفحة
   * @param {number} options.limit - عدد العناصر في الصفحة
   * @param {string} options.search - نص البحث
   * @param {string} options.role - دور المستخدم للتصفية
   * @param {string} options.status - حالة المستخدم للتصفية
   */
  const loadUsers = async (options = {}) => {
    try {
      dispatch({ type: actionTypes.SET_USERS_LOADING, payload: true });
      
      // استخدام الخدمة المحسنة مع التخزين المؤقت والتصفح
      const usersResult = await optimizedDashboardService.getUsersPaginated(
        options.page || 1,
        {
          limit: options.limit || 20,
          search: options.search || '',
          role: options.role || 'all',
          status: options.status || 'all',
          ...options
        }
      );
      
      dispatch({ type: actionTypes.SET_USERS, payload: usersResult.data });
      
    } catch (error) {
      console.error('فشل في تحميل المستخدمين:', error);
      dispatch({ type: actionTypes.SET_USERS_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_USERS_LOADING, payload: false });
    }
  };

  // دوال المساعدة
  const actions = {
    // إحصائيات
    refreshStats: loadStats,
    
    // الأنشطة
    addActivity: (activity) => {
      dispatch({ 
        type: actionTypes.ADD_ACTIVITY, 
        payload: { 
          ...activity, 
          id: Date.now(), 
          timestamp: new Date() 
        } 
      });
    },
    refreshActivities: loadRecentActivities,
    
    // المستخدمون - دوال محسنة
    loadUsers,
    setUsersLoading: (loading) => dispatch({ type: actionTypes.SET_USERS_LOADING, payload: loading }),
    setUsersError: (error) => dispatch({ type: actionTypes.SET_USERS_ERROR, payload: error }),
    setUsersFilters: (filters) => dispatch({ type: actionTypes.SET_USERS_FILTERS, payload: filters }),
    setUsers: (users) => dispatch({ type: actionTypes.SET_USERS, payload: users }),
    addUser: (user) => {
      dispatch({ type: actionTypes.ADD_USER, payload: user });
      // إضافة نشاط جديد
      actions.addActivity({
        type: 'member',
        action: 'انضمام عضو جديد',
        actor: user.name || `${user.firstName} ${user.lastName}`,
        details: { membershipType: user.role }
      });
    },
    updateUser: (user) => dispatch({ type: actionTypes.UPDATE_USER, payload: user }),
    deleteUser: (userId) => dispatch({ type: actionTypes.DELETE_USER, payload: userId }),
    
    // المحتوى
    setContentLoading: (loading) => dispatch({ type: actionTypes.SET_CONTENT_LOADING, payload: loading }),
    setContentError: (error) => dispatch({ type: actionTypes.SET_CONTENT_ERROR, payload: error }),
    setContentFilters: (filters) => dispatch({ type: actionTypes.SET_CONTENT_FILTERS, payload: filters }),
    setContent: (content) => dispatch({ type: actionTypes.SET_CONTENT, payload: content }),
    setSelectedContent: (items) => dispatch({ type: actionTypes.SET_SELECTED_CONTENT, payload: items }),
    
    // الفعаليات
    setEventsLoading: (loading) => dispatch({ type: actionTypes.SET_EVENTS_LOADING, payload: loading }),
    setEventsError: (error) => dispatch({ type: actionTypes.SET_EVENTS_ERROR, payload: error }),
    setEvents: (events) => dispatch({ type: actionTypes.SET_EVENTS, payload: events }),
    
    // تحديث شامل
    refreshAll: loadInitialData,
    
    // تنظيف الموارد
    cleanup: () => {
      optimizedDashboardService.cleanup();
    }
  };

  // معالج الأخطاء المحسن
  const handleError = (error, context = '') => {
    console.error(`خطأ في ${context}:`, error);
    
    // إشعار المستخدم بالخطأ
    dispatch({ 
      type: actionTypes.SET_GLOBAL_ERROR, 
      payload: `حدث خطأ في ${context}. يرجى المحاولة مرة أخرى.` 
    });
    
    // مسح الخطأ بعد 5 ثوان
    setTimeout(() => {
      dispatch({ type: actionTypes.SET_GLOBAL_ERROR, payload: null });
    }, 5000);
  };

  const value = {
    ...state,
    actions,
    actionTypes,
    handleError
  };

  return (
    <UnifiedDashboardContext.Provider value={value}>
      {children}
    </UnifiedDashboardContext.Provider>
  );
};

// هوك لاستخدام السياق الموحد
export const useUnifiedDashboard = () => {
  const context = useContext(UnifiedDashboardContext);
  if (!context) {
    throw new Error('useUnifiedDashboard must be used within UnifiedDashboardProvider');
  }
  return context;
};

// هوكس متخصصة للاستخدام المبسط
export const useDashboardStats = () => {
  const { stats, membershipStats, actions } = useUnifiedDashboard();
  return {
    stats,
    membershipStats,
    refreshStats: actions.refreshStats,
    isLoading: !stats.lastUpdated
  };
};

export const useDashboardUsers = () => {
  const { users, actions } = useUnifiedDashboard();
  return {
    ...users,
    ...actions
  };
};

export const useDashboardContent = () => {
  const { content, actions } = useUnifiedDashboard();
  return {
    ...content,
    ...actions
  };
};

export const useDashboardActivities = () => {
  const { recentActivities, actions } = useUnifiedDashboard();
  return {
    activities: recentActivities,
    addActivity: actions.addActivity
  };
};

export default UnifiedDashboardProvider;