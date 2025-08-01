// src/services/localStorageService.js
/**
 * خدمة للتعامل مع التخزين المحلي (localStorage)
 * ✅ محدثة لامتثال قانون PDPL مع تشفير البيانات الحساسة
 * توفر وظائف لحفظ واسترجاع وحذف البيانات في متصفح المستخدم
 */

// ✅ استيراد خدمة التشفير
import EncryptionService from './encryptionService.js';

// ✅ البيانات الحساسة التي تحتاج تشفير
const SENSITIVE_KEYS = [
  'user',           // بيانات المستخدم الشخصية
  'authToken',      // رمز المصادقة
  'spsa_users',     // قائمة المستخدمين
  'personal_',      // أي مفتاح يبدأ بـ personal_
  'financial_',     // أي مفتاح يبدأ بـ financial_
  'payment_',       // أي مفتاح يبدأ بـ payment_
];

// ✅ فحص إذا كان المفتاح حساساً ويحتاج تشفير
const isSensitiveKey = (key) => {
  return SENSITIVE_KEYS.some(sensitiveKey => 
    key === sensitiveKey || key.startsWith(sensitiveKey)
  );
};

// ✅ إنشاء مثيل خدمة التشفير
const encryptionService = new EncryptionService();
const localStorageService = {
  /**
   * ✅ حفظ بيانات في التخزين المحلي مع تشفير البيانات الحساسة
   * @param {string} key - المفتاح الذي سيتم استخدامه للوصول للبيانات لاحقًا
   * @param {any} value - البيانات التي سيتم تخزينها
   */
  setItem: async (key, value) => {
    try {
      let dataToStore = JSON.stringify(value);
      
      // ✅ تشفير البيانات الحساسة
      if (isSensitiveKey(key)) {
        // ❌ REMOVED: console.log - لا نكشف معلومات التشفير في الإنتاج
        dataToStore = await encryptionService.encrypt(dataToStore);
        
        // ✅ إضافة علامة للدلالة على أن البيانات مشفرة
        dataToStore = 'ENCRYPTED:' + dataToStore;
      }
      
      localStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
    }
  },

  /**
   * ✅ استرجاع بيانات من التخزين المحلي مع فك تشفير البيانات الحساسة
   * @param {string} key - المفتاح المستخدم للوصول للبيانات
   * @param {any} defaultValue - القيمة الافتراضية التي سيتم إرجاعها إذا لم يتم العثور على البيانات
   * @returns {any} - البيانات المخزنة أو القيمة الافتراضية
   */
  getItem: async (key, defaultValue = null) => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null) {
        return defaultValue;
      }
      
      let dataToReturn = storedValue;
      
      // ✅ فك تشفير البيانات المشفرة
      if (storedValue.startsWith('ENCRYPTED:')) {
        // ❌ REMOVED: console.log - لا نكشف معلومات فك التشفير في الإنتاج
        const encryptedData = storedValue.replace('ENCRYPTED:', '');
        dataToReturn = await encryptionService.decrypt(encryptedData);
      }
      
      return JSON.parse(dataToReturn);
    } catch (error) {
      console.error('خطأ في استرجاع البيانات من التخزين المحلي:', error);
      
      // ✅ في حالة فشل فك التشفير، نحاول قراءة البيانات العادية
      try {
        const fallbackValue = localStorage.getItem(key);
        if (fallbackValue && !fallbackValue.startsWith('ENCRYPTED:')) {
          return JSON.parse(fallbackValue);
        }
      } catch (fallbackError) {
        console.error('فشل في قراءة البيانات حتى بدون تشفير:', fallbackError);
      }
      
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
   * ✅ حفظ بيانات المستخدم في التخزين المحلي (مشفرة)
   * @param {Object} userData - بيانات المستخدم التي سيتم تخزينها
   */
  saveUserData: async (userData) => {
    await localStorageService.setItem('user', userData);
  },

  /**
   * ✅ استرجاع بيانات المستخدم من التخزين المحلي (مع فك التشفير)
   * @returns {Object|null} - بيانات المستخدم أو null إذا لم يكن هناك مستخدم
   */
  getUserData: async () => {
    return await localStorageService.getItem('user');
  },

  /**
   * ✅ حفظ توكن المصادقة في التخزين المحلي (مشفر)
   * @param {string} token - توكن المصادقة
   */
  saveAuthToken: async (token) => {
    await localStorageService.setItem('authToken', token);
  },

  /**
   * ✅ استرجاع توكن المصادقة من التخزين المحلي (مع فك التشفير)
   * @returns {string|null} - توكن المصادقة أو null إذا لم يكن موجودًا
   */
  getAuthToken: async () => {
    return await localStorageService.getItem('authToken');
  },

  /**
   * ✅ تسجيل خروج المستخدم بحذف بياناته وتوكن المصادقة بأمان
   */
  logout: () => {
    // ✅ حذف البيانات الحساسة بأمان
    localStorageService.secureRemove('user');
    localStorageService.secureRemove('authToken');
    
    // ✅ حذف أي بيانات حساسة أخرى
    const allKeys = localStorageService.getAllKeys();
    allKeys.forEach(key => {
      if (isSensitiveKey(key)) {
        localStorageService.secureRemove(key);
      }
    });
    
    console.log('✅ تم تسجيل الخروج وحذف البيانات الحساسة بأمان');
  },

  /**
   * ✅ حذف آمن للبيانات الحساسة مع الكتابة فوقها
   * @param {string} key - المفتاح المراد حذفه
   */
  secureRemove: (key) => {
    try {
      // ✅ إذا كانت البيانات حساسة، اكتب فوقها أولاً
      if (isSensitiveKey(key)) {
        const randomData = Array(1000).fill(0).map(() => 
          Math.random().toString(36)
        ).join('');
        localStorage.setItem(key, randomData);
      }
      
      // ✅ ثم احذفها
      localStorage.removeItem(key);
    } catch (error) {
      console.error('خطأ في الحذف الآمن:', error);
      // تراجع للحذف العادي
      localStorage.removeItem(key);
    }
  },

  /**
   * التحقق من دعم التخزين المحلي في المتصفح
   * @returns {boolean} - true إذا كان التخزين المحلي مدعوماً
   */
  isSupported: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * الحصول على حجم التخزين المحلي المستخدم
   * @returns {number} - حجم التخزين بالبايت
   */
  getStorageSize: () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('خطأ في حساب حجم التخزين المحلي:', error);
      return 0;
    }
  },

  /**
   * الحصول على جميع المفاتيح في التخزين المحلي
   * @returns {string[]} - مصفوفة بجميع المفاتيح
   */
  getAllKeys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('خطأ في الحصول على مفاتيح التخزين المحلي:', error);
      return [];
    }
  },

  /**
   * إنشاء نسخة احتياطية من البيانات
   * @param {string[]} keys - المفاتيح المراد نسخها احتياطياً
   * @returns {Object} - كائن يحتوي على النسخة الاحتياطية
   */
  createBackup: (keys = []) => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {}
      };

      const keysToBackup = keys.length > 0 ? keys : localStorageService.getAllKeys();

      keysToBackup.forEach(key => {
        const value = localStorageService.getItem(key);
        if (value !== null) {
          backup.data[key] = value;
        }
      });

      return backup;
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      return null;
    }
  },

  /**
   * استعادة البيانات من النسخة الاحتياطية
   * @param {Object} backup - النسخة الاحتياطية
   * @param {boolean} overwrite - هل يتم استبدال البيانات الموجودة
   * @returns {boolean} - true إذا تمت الاستعادة بنجاح
   */
  restoreBackup: (backup, overwrite = false) => {
    try {
      if (!backup || !backup.data) {
        console.error('النسخة الاحتياطية غير صالحة');
        return false;
      }

      Object.keys(backup.data).forEach(key => {
        const existingValue = localStorageService.getItem(key);

        if (overwrite || existingValue === null) {
          localStorageService.setItem(key, backup.data[key]);
        }
      });

      console.log('تمت استعادة النسخة الاحتياطية بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في استعادة النسخة الاحتياطية:', error);
      return false;
    }
  },

  /**
   * حفظ النسخة الاحتياطية في sessionStorage
   * @param {Object} backup - النسخة الاحتياطية
   * @param {string} backupKey - مفتاح النسخة الاحتياطية
   */
  saveBackupToSession: (backup, backupKey = 'spsa_backup') => {
    try {
      const serializedBackup = JSON.stringify(backup);
      sessionStorage.setItem(backupKey, serializedBackup);
      console.log('تم حفظ النسخة الاحتياطية في sessionStorage');
    } catch (error) {
      console.error('خطأ في حفظ النسخة الاحتياطية في sessionStorage:', error);
    }
  },

  /**
   * استرجاع النسخة الاحتياطية من sessionStorage
   * @param {string} backupKey - مفتاح النسخة الاحتياطية
   * @returns {Object|null} - النسخة الاحتياطية أو null
   */
  getBackupFromSession: (backupKey = 'spsa_backup') => {
    try {
      const serializedBackup = sessionStorage.getItem(backupKey);
      if (serializedBackup) {
        return JSON.parse(serializedBackup);
      }
      return null;
    } catch (error) {
      console.error('خطأ في استرجاع النسخة الاحتياطية من sessionStorage:', error);
      return null;
    }
  },

  /**
   * تنظيف البيانات القديمة
   * @param {number} maxAge - العمر الأقصى بالأيام
   */
  cleanupOldData: (maxAge = 30) => {
    try {
      const now = new Date();
      const keys = localStorageService.getAllKeys();

      keys.forEach(key => {
        const data = localStorageService.getItem(key);

        if (data && data.timestamp) {
          const dataDate = new Date(data.timestamp);
          const ageInDays = (now - dataDate) / (1000 * 60 * 60 * 24);

          if (ageInDays > maxAge) {
            localStorageService.removeItem(key);
            console.log(`تم حذف البيانات القديمة: ${key}`);
          }
        }
      });
    } catch (error) {
      console.error('خطأ في تنظيف البيانات القديمة:', error);
    }
  },

  /**
   * إنشاء نسخة احتياطية تلقائية للمستخدمين
   */
  autoBackupUsers: () => {
    try {
      const userKeys = ['spsa_users', 'user', 'authToken'];
      const backup = localStorageService.createBackup(userKeys);

      if (backup) {
        localStorageService.saveBackupToSession(backup, 'spsa_users_backup');
        console.log('تم إنشاء نسخة احتياطية تلقائية للمستخدمين');
      }
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية التلقائية:', error);
    }
  },

  /**
   * استعادة المستخدمين من النسخة الاحتياطية التلقائية
   */
  restoreUsersFromAutoBackup: () => {
    try {
      const backup = localStorageService.getBackupFromSession('spsa_users_backup');

      if (backup) {
        const restored = localStorageService.restoreBackup(backup, false);
        if (restored) {
          console.log('تمت استعادة المستخدمين من النسخة الاحتياطية التلقائية');
        }
        return restored;
      }

      return false;
    } catch (error) {
      console.error('خطأ في استعادة المستخدمين من النسخة الاحتياطية:', error);
      return false;
    }
  }
};

export default localStorageService;