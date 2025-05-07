// src/services/authService.js
import localStorageService from './localStorageService';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

// عادةً ما يكون هناك عنوان API حقيقي
const API_BASE_URL = 'https://api.example.com';

/**
 * وظيفة لتسجيل الدخول
 * @param {string} email - البريد الإلكتروني للمستخدم
 * @param {string} password - كلمة المرور
 * @returns {Promise<Object>} - معلومات المستخدم والرمز المميز
 */
export const login = async (email, password) => {
  try {
    // في بيئة واقعية سنقوم بإرسال طلب حقيقي إلى الخادم
    // لأغراض العرض التوضيحي، سنحاكي استجابة من الخادم
    
    // تحقق من البيانات المدخلة (وهمي)
    if (email !== 'user@example.com' && email !== 'admin@example.com') {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // احصل على استجابة وهمية
    const mockResponse = {
      user: {
        id: email === 'admin@example.com' ? '1' : '2',
        name: email === 'admin@example.com' ? 'أحمد المدير' : 'محمد المستخدم',
        email,
        role: email === 'admin@example.com' ? 'admin' : 'user',
        phone: '0501234567',
        specialization: 'العلوم السياسية',
        bio: 'عضو في جمعية العلوم السياسية'
      },
      token: 'mock_jwt_token_' + Math.random().toString(36).substring(7)
    };

    // حفظ بيانات المستخدم محلياً
    localStorageService.setItem(AUTH_TOKEN_KEY, mockResponse.token);
    localStorageService.setItem(USER_KEY, JSON.stringify(mockResponse.user));

    return mockResponse;
  } catch (error) {
    throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
  }
};

/**
 * وظيفة للتسجيل في الموقع
 * @param {Object} userData - بيانات المستخدم
 * @returns {Promise<Object>} - معلومات المستخدم الجديد
 */
export const register = async (userData) => {
  try {
    // في بيئة واقعية سنقوم بإرسال طلب حقيقي إلى الخادم
    // لأغراض العرض التوضيحي، سنحاكي استجابة من الخادم
    
    // التحقق من البريد الإلكتروني (وهمي)
    if (userData.email === 'user@example.com' || userData.email === 'admin@example.com') {
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }

    // احصل على استجابة وهمية
    const mockResponse = {
      user: {
        id: '3',
        name: userData.name,
        email: userData.email,
        role: 'user',
        phone: userData.phone || '',
        specialization: userData.specialization || '',
        bio: ''
      }
    };

    return mockResponse.user;
  } catch (error) {
    throw new Error(error.message || 'حدث خطأ أثناء إنشاء الحساب');
  }
};

/**
 * وظيفة لتسجيل الخروج
 */
export const logout = () => {
  localStorageService.removeItem(AUTH_TOKEN_KEY);
  localStorageService.removeItem(USER_KEY);
};

/**
 * التحقق من حالة المصادقة
 * @returns {boolean} - هل المستخدم مسجل الدخول أم لا
 */
export const isAuthenticated = () => {
  return !!localStorageService.getItem(AUTH_TOKEN_KEY);
};

/**
 * الحصول على المستخدم الحالي
 * @returns {Object|null} - معلومات المستخدم الحالي أو null
 */
export const getCurrentUser = () => {
  const userStr = localStorageService.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * الحصول على رمز المصادقة
 * @returns {string|null} - رمز المصادقة أو null
 */
export const getAuthToken = () => {
  return localStorageService.getItem(AUTH_TOKEN_KEY);
};

/**
 * تحديث بيانات المستخدم المحلية
 * @param {Object} userData - بيانات المستخدم المحدثة
 */
export const updateUserLocalData = (userData) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    localStorageService.setItem(USER_KEY, JSON.stringify({ ...currentUser, ...userData }));
  }
};