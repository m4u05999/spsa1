/**
 * Supabase Service - Real Backend Integration
 * خدمة Supabase - التكامل الحقيقي مع الواجهة الخلفية
 */

import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/environment.js';

// Supabase client instance
let supabaseClient = null;

/**
 * Initialize Supabase client
 * تهيئة عميل Supabase
 */
const initializeSupabase = () => {
  if (!supabaseClient && ENV.SUPABASE.URL && ENV.SUPABASE.ANON_KEY) {
    try {
      supabaseClient = createClient(
        ENV.SUPABASE.URL,
        ENV.SUPABASE.ANON_KEY,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
          },
          global: {
            headers: {
              'X-Client-Info': 'spsa-frontend'
            }
          }
        }
      );
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('Supabase client initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }
  
  return supabaseClient;
};

/**
 * Get Supabase client instance
 * الحصول على مثيل عميل Supabase
 */
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    initializeSupabase();
  }
  return supabaseClient;
};

/**
 * Check if Supabase is configured and available
 * التحقق من تكوين وتوفر Supabase
 */
export const isSupabaseAvailable = () => {
  return !!(ENV.SUPABASE.URL && ENV.SUPABASE.ANON_KEY && supabaseClient);
};

/**
 * Test Supabase connection
 * اختبار اتصال Supabase
 */
export const testSupabaseConnection = async () => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: 'Supabase client not initialized',
        message: 'عميل Supabase غير مُهيأ'
      };
    }

    // Test basic connection by getting auth user
    const { data, error } = await client.auth.getUser();
    
    return {
      success: !error,
      data: data?.user || null,
      error: error?.message || null,
      message: error ? 'فشل في الاتصال بـ Supabase' : 'تم الاتصال بـ Supabase بنجاح'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'خطأ في اختبار اتصال Supabase'
    };
  }
};

/**
 * Supabase Authentication Service
 * خدمة مصادقة Supabase
 */
export const supabaseAuth = {
  /**
   * Sign up new user
   * تسجيل مستخدم جديد
   */
  signUp: async (email, password, userData = {}) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'تم إنشاء الحساب بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في إنشاء الحساب'
      };
    }
  },

  /**
   * Sign in user
   * تسجيل دخول المستخدم
   */
  signIn: async (email, password) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'تم تسجيل الدخول بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في تسجيل الدخول'
      };
    }
  },

  /**
   * Sign out user
   * تسجيل خروج المستخدم
   */
  signOut: async () => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      const { error } = await client.auth.signOut();
      if (error) throw error;

      return {
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في تسجيل الخروج'
      };
    }
  },

  /**
   * Get current user
   * الحصول على المستخدم الحالي
   */
  getCurrentUser: async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data: { user }, error } = await client.auth.getUser();
      if (error) throw error;

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Reset password
   * إعادة تعيين كلمة المرور
   */
  resetPassword: async (email) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${ENV.APP_URL}/reset-password`
      });

      if (error) throw error;

      return {
        success: true,
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في إرسال رابط إعادة تعيين كلمة المرور'
      };
    }
  }
};

/**
 * Supabase Database Service
 * خدمة قاعدة بيانات Supabase
 */
export const supabaseDB = {
  /**
   * Get data from table
   * الحصول على البيانات من الجدول
   */
  select: async (table, options = {}) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      let query = client.from(table).select(options.select || '*');

      // Apply filters
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending !== false 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        data,
        count: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  /**
   * Insert data into table
   * إدراج البيانات في الجدول
   */
  insert: async (table, data) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;

      return {
        success: true,
        data: result,
        message: 'تم إدراج البيانات بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في إدراج البيانات'
      };
    }
  },

  /**
   * Update data in table
   * تحديث البيانات في الجدول
   */
  update: async (table, data, filters) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      let query = client.from(table).update(data);

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
      }

      const { data: result, error } = await query.select();
      if (error) throw error;

      return {
        success: true,
        data: result,
        message: 'تم تحديث البيانات بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في تحديث البيانات'
      };
    }
  },

  /**
   * Delete data from table
   * حذف البيانات من الجدول
   */
  delete: async (table, filters) => {
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not available');

      let query = client.from(table).delete();

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
      }

      const { error } = await query;
      if (error) throw error;

      return {
        success: true,
        message: 'تم حذف البيانات بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'فشل في حذف البيانات'
      };
    }
  }
};

// Initialize Supabase on module load
initializeSupabase();

export default {
  client: getSupabaseClient,
  isAvailable: isSupabaseAvailable,
  testConnection: testSupabaseConnection,
  auth: supabaseAuth,
  db: supabaseDB
};
