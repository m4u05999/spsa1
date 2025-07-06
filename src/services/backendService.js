/**
 * Backend Service - Unified Backend API Interface
 * خدمة الواجهة الخلفية - واجهة موحدة لـ API الخلفية
 */

import supabaseService from './supabaseService.js';
import { contentService } from './contentService.js';
import * as authService from './authService.js';
import { ENV } from '../config/environment.js';

/**
 * Backend Service Configuration
 * إعدادات خدمة الواجهة الخلفية
 */
const BACKEND_CONFIG = {
  USE_SUPABASE: ENV.SUPABASE.URL && ENV.SUPABASE.ANON_KEY,
  USE_MOCK: ENV.FEATURES.MOCK_AUTH || !ENV.IS_PRODUCTION,
  API_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Backend Service Status
 * حالة خدمة الواجهة الخلفية
 */
let backendStatus = {
  isOnline: false,
  lastCheck: null,
  errors: [],
  services: {
    supabase: false,
    mock: true
  }
};

/**
 * Check backend services availability
 * فحص توفر خدمات الواجهة الخلفية
 */
const checkBackendStatus = async () => {
  const status = {
    isOnline: false,
    lastCheck: new Date().toISOString(),
    errors: [],
    services: {
      supabase: false,
      mock: true
    }
  };

  // Check Supabase
  if (BACKEND_CONFIG.USE_SUPABASE) {
    try {
      const supabaseTest = await supabaseService.testConnection();
      status.services.supabase = supabaseTest.success;
      if (!supabaseTest.success) {
        status.errors.push(`Supabase: ${supabaseTest.error}`);
      }
    } catch (error) {
      status.services.supabase = false;
      status.errors.push(`Supabase: ${error.message}`);
    }
  }

  // Overall status
  status.isOnline = status.services.supabase || status.services.mock;

  backendStatus = status;
  return status;
};

/**
 * Retry mechanism for failed requests
 * آلية إعادة المحاولة للطلبات الفاشلة
 */
const retryRequest = async (requestFn, attempts = BACKEND_CONFIG.RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, BACKEND_CONFIG.RETRY_DELAY * (i + 1)));
    }
  }
};

/**
 * Unified Authentication Service
 * خدمة المصادقة الموحدة
 */
export const backendAuth = {
  /**
   * Login user
   * تسجيل دخول المستخدم
   */
  login: async (email, password) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.auth.signIn(email, password);
        if (result.success) {
          return {
            success: true,
            user: result.user,
            token: result.session?.access_token,
            message: result.message
          };
        }
      }

      // Fallback to mock auth
      const result = await authService.login(email, password);
      return {
        success: true,
        user: result.user,
        token: result.token,
        message: 'تم تسجيل الدخول بنجاح (وضع التجريب)'
      };
    });
  },

  /**
   * Register new user
   * تسجيل مستخدم جديد
   */
  register: async (userData) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.auth.signUp(
          userData.email,
          userData.password,
          userData
        );
        if (result.success) {
          return {
            success: true,
            user: result.user,
            message: result.message
          };
        }
      }

      // Fallback to mock auth
      const result = await authService.register(userData);
      return {
        success: true,
        user: result,
        message: 'تم إنشاء الحساب بنجاح (وضع التجريب)'
      };
    });
  },

  /**
   * Logout user
   * تسجيل خروج المستخدم
   */
  logout: async () => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        await supabaseService.auth.signOut();
      }

      // Always clear local auth
      authService.logout();
      
      return {
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
      };
    });
  },

  /**
   * Get current user
   * الحصول على المستخدم الحالي
   */
  getCurrentUser: async () => {
    try {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const user = await supabaseService.auth.getCurrentUser();
        if (user) return user;
      }

      // Fallback to local auth
      return authService.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Check authentication status
   * فحص حالة المصادقة
   */
  isAuthenticated: () => {
    return authService.isAuthenticated();
  }
};

/**
 * Unified Content Service
 * خدمة المحتوى الموحدة
 */
export const backendContent = {
  /**
   * Get all content
   * الحصول على جميع المحتوى
   */
  getAll: async () => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.select('content');
        if (result.success && result.data.length > 0) {
          return result.data;
        }
      }

      // Fallback to local content
      return await contentService.getAll();
    });
  },

  /**
   * Get content by ID
   * الحصول على المحتوى بالمعرف
   */
  getById: async (id) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.select('content', {
          filters: [{ column: 'id', operator: 'eq', value: id }]
        });
        if (result.success && result.data.length > 0) {
          return result.data[0];
        }
      }

      // Fallback to local content
      return await contentService.getById(id);
    });
  },

  /**
   * Search content
   * البحث في المحتوى
   */
  search: async (params) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        // Build Supabase filters from search params
        const filters = [];
        if (params.query) {
          filters.push({ column: 'title', operator: 'ilike', value: `%${params.query}%` });
        }
        if (params.type) {
          filters.push({ column: 'type', operator: 'eq', value: params.type });
        }
        if (params.status) {
          filters.push({ column: 'status', operator: 'eq', value: params.status });
        }

        const result = await supabaseService.db.select('content', { filters });
        if (result.success) {
          return result.data;
        }
      }

      // Fallback to local content
      return await contentService.search(params);
    });
  },

  /**
   * Create new content
   * إنشاء محتوى جديد
   */
  create: async (contentData) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.insert('content', contentData);
        if (result.success) {
          return result.data[0];
        }
      }

      // Fallback to local content
      return await contentService.create(contentData);
    });
  },

  /**
   * Update content
   * تحديث المحتوى
   */
  update: async (id, contentData) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.update(
          'content',
          contentData,
          [{ column: 'id', operator: 'eq', value: id }]
        );
        if (result.success) {
          return result.data[0];
        }
      }

      // Fallback to local content
      return await contentService.update(id, contentData);
    });
  },

  /**
   * Delete content
   * حذف المحتوى
   */
  delete: async (id) => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.delete('content', [
          { column: 'id', operator: 'eq', value: id }
        ]);
        if (result.success) {
          return { success: true };
        }
      }

      // Fallback to local content
      return await contentService.delete(id);
    });
  },

  /**
   * Get categories
   * الحصول على الفئات
   */
  getCategories: async () => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.select('categories');
        if (result.success && result.data.length > 0) {
          return result.data;
        }
      }

      // Fallback to local content
      return await contentService.getCategories();
    });
  },

  /**
   * Get tags
   * الحصول على العلامات
   */
  getTags: async () => {
    return retryRequest(async () => {
      if (BACKEND_CONFIG.USE_SUPABASE && backendStatus.services.supabase) {
        const result = await supabaseService.db.select('tags');
        if (result.success && result.data.length > 0) {
          return result.data;
        }
      }

      // Fallback to local content
      return await contentService.getTags();
    });
  }
};

/**
 * Backend Service Main Interface
 * الواجهة الرئيسية لخدمة الواجهة الخلفية
 */
const backendService = {
  // Configuration
  config: BACKEND_CONFIG,
  
  // Status
  getStatus: () => backendStatus,
  checkStatus: checkBackendStatus,
  
  // Services
  auth: backendAuth,
  content: backendContent,
  
  // Utilities
  isOnline: () => backendStatus.isOnline,
  getErrors: () => backendStatus.errors,
  
  /**
   * Initialize backend service
   * تهيئة خدمة الواجهة الخلفية
   */
  initialize: async () => {
    try {
      const status = await checkBackendStatus();
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('Backend Service initialized:', {
          isOnline: status.isOnline,
          services: status.services,
          errors: status.errors
        });
      }
      
      return status;
    } catch (error) {
      console.error('Failed to initialize backend service:', error);
      return {
        isOnline: false,
        error: error.message
      };
    }
  }
};

// Initialize on module load
backendService.initialize();

export default backendService;
