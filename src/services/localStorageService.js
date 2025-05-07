// src/services/localStorageService.js
/**
 * خدمة للتعامل مع التخزين المحلي (localStorage)
 * توفر وظائف لحفظ واسترجاع وحذف البيانات في متصفح المستخدم
 */
const localStorageService = {
  /**
   * حفظ بيانات في التخزين المحلي
   * @param {string} key - المفتاح الذي سيتم استخدامه للوصول للبيانات لاحقًا
   * @param {any} value - البيانات التي سيتم تخزينها
   */
  setItem: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
    }
  },

  /**
   * استرجاع بيانات من التخزين المحلي
   * @param {string} key - المفتاح المستخدم للوصول للبيانات
   * @param {any} defaultValue - القيمة الافتراضية التي سيتم إرجاعها إذا لم يتم العثور على البيانات
   * @returns {any} - البيانات المخزنة أو القيمة الافتراضية
   */
  getItem: (key, defaultValue = null) => {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('خطأ في استرجاع البيانات من التخزين المحلي:', error);
      return defaultValue;
    }
  },

  /**
   * حذف بيانات من التخزين المحلي
   * @param {string} key - المفتاح المستخدم للوصول للبيانات
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('خطأ في حذف البيانات من التخزين المحلي:', error);
    }
  },

  /**
   * مسح كل البيانات من التخزين المحلي
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('خطأ في مسح التخزين المحلي:', error);
    }
  },

  /**
   * التحقق من وجود مفتاح في التخزين المحلي
   * @param {string} key - المفتاح المراد التحقق منه
   * @returns {boolean} - صحيح إذا كان المفتاح موجودًا، خطأ إذا لم يكن موجودًا
   */
  hasItem: (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('خطأ في التحقق من وجود المفتاح في التخزين المحلي:', error);
      return false;
    }
  },

  /**
   * حفظ بيانات المستخدم في التخزين المحلي
   * @param {Object} userData - بيانات المستخدم التي سيتم تخزينها
   */
  saveUserData: (userData) => {
    localStorageService.setItem('user', userData);
  },

  /**
   * استرجاع بيانات المستخدم من التخزين المحلي
   * @returns {Object|null} - بيانات المستخدم أو null إذا لم يكن هناك مستخدم
   */
  getUserData: () => {
    return localStorageService.getItem('user');
  },

  /**
   * حفظ توكن المصادقة في التخزين المحلي
   * @param {string} token - توكن المصادقة
   */
  saveAuthToken: (token) => {
    localStorageService.setItem('authToken', token);
  },

  /**
   * استرجاع توكن المصادقة من التخزين المحلي
   * @returns {string|null} - توكن المصادقة أو null إذا لم يكن موجودًا
   */
  getAuthToken: () => {
    return localStorageService.getItem('authToken');
  },

  /**
   * تسجيل خروج المستخدم بحذف بياناته وتوكن المصادقة
   */
  logout: () => {
    localStorageService.removeItem('user');
    localStorageService.removeItem('authToken');
  }
};

export default localStorageService;