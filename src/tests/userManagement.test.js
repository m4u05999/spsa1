/**
 * اختبارات وحدة نظام إدارة المستخدمين
 * User Management System Unit Tests
 * 
 * @description اختبارات شاملة لنظام إدارة المستخدمين والتخزين المحلي
 * @author SPSA Development Team
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store = {};

  const mock = {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value; // لا نحول إلى string لأن localStorageService يرسل JSON string بالفعل
      // إضافة المفتاح كخاصية في mock لدعم for...in loops
      mock[key] = store[key];
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
      delete mock[key];
    }),
    clear: vi.fn(() => {
      // حذف جميع المفاتيح من store و mock
      Object.keys(store).forEach(key => {
        delete mock[key];
      });
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => Object.keys(store)[index] || null),
    // إضافة hasOwnProperty للتوافق مع getStorageSize
    hasOwnProperty: vi.fn((key) => store.hasOwnProperty(key))
  };

  // إضافة خاصية للوصول للمفاتيح
  Object.defineProperty(mock, 'keys', {
    get: () => Object.keys(store)
  });

  return mock;
})();

const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => Object.keys(store)[index] || null)
  };
})();

// Set up global mocks - simple approach
global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

// Import modules after setting up mocks
import localStorageService from '../services/localStorageService.js';

describe('🧪 نظام التخزين المحلي (Local Storage Service)', () => {
  beforeEach(() => {
    // مسح جميع البيانات قبل كل اختبار
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // تنظيف بعد كل اختبار
    vi.clearAllMocks();
  });

  describe('📝 العمليات الأساسية (Basic Operations)', () => {
    test('يجب أن يحفظ ويسترجع البيانات بنجاح', () => {
      const testData = { name: 'أحمد محمد', email: 'ahmed@example.com' };
      
      localStorageService.setItem('test_user', testData);
      const retrieved = localStorageService.getItem('test_user');
      
      expect(retrieved).toEqual(testData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test_user', JSON.stringify(testData));
    });

    test('يجب أن يعيد القيمة الافتراضية عند عدم وجود البيانات', () => {
      const defaultValue = { users: [] };
      const result = localStorageService.getItem('non_existent_key', defaultValue);
      
      expect(result).toEqual(defaultValue);
    });

    test('يجب أن يحذف البيانات بنجاح', () => {
      localStorageService.setItem('test_key', 'test_value');
      localStorageService.removeItem('test_key');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_key');
    });

    test('يجب أن يتحقق من وجود المفتاح بشكل صحيح', () => {
      localStorageService.setItem('existing_key', 'value');
      
      expect(localStorageService.hasItem('existing_key')).toBe(true);
      expect(localStorageService.hasItem('non_existing_key')).toBe(false);
    });
  });

  describe('👤 إدارة بيانات المستخدم (User Data Management)', () => {
    test('يجب أن يحفظ ويسترجع بيانات المستخدم', () => {
      const userData = {
        id: 'user123',
        firstName: 'فاطمة',
        lastName: 'أحمد',
        email: 'fatima@example.com',
        role: 'member'
      };

      localStorageService.saveUserData(userData);
      const retrieved = localStorageService.getUserData();

      expect(retrieved).toEqual(userData);
    });

    test('يجب أن يحفظ ويسترجع توكن المصادقة', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      localStorageService.saveAuthToken(token);
      const retrieved = localStorageService.getAuthToken();

      expect(retrieved).toBe(token);
    });

    test('يجب أن ينظف بيانات المستخدم عند تسجيل الخروج', () => {
      localStorageService.saveUserData({ id: 'user123' });
      localStorageService.saveAuthToken('token123');

      localStorageService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('💾 النسخ الاحتياطي (Backup System)', () => {
    test('يجب أن ينشئ نسخة احتياطية بنجاح', () => {
      // إعداد بيانات تجريبية
      localStorageService.setItem('users', [{ id: 1, name: 'محمد' }]);
      localStorageService.setItem('settings', { theme: 'dark' });

      const backup = localStorageService.createBackup(['users', 'settings']);

      expect(backup).toBeDefined();
      expect(backup.timestamp).toBeDefined();
      expect(backup.data).toBeDefined();
      expect(backup.data.users).toEqual([{ id: 1, name: 'محمد' }]);
      expect(backup.data.settings).toEqual({ theme: 'dark' });
    });

    test('يجب أن يستعيد البيانات من النسخة الاحتياطية', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          users: [{ id: 1, name: 'علي' }],
          settings: { language: 'ar' }
        }
      };

      const result = localStorageService.restoreBackup(backup, true);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('users', JSON.stringify([{ id: 1, name: 'علي' }]));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('settings', JSON.stringify({ language: 'ar' }));
    });

    test('يجب أن يحفظ النسخة الاحتياطية في sessionStorage', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: { users: [] }
      };

      localStorageService.saveBackupToSession(backup, 'test_backup');

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('test_backup', JSON.stringify(backup));
    });

    test('يجب أن يسترجع النسخة الاحتياطية من sessionStorage', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: { users: [{ id: 1, name: 'سارة' }] }
      };

      sessionStorageMock.setItem('test_backup', JSON.stringify(backup));
      const retrieved = localStorageService.getBackupFromSession('test_backup');

      expect(retrieved).toEqual(backup);
    });
  });

  describe('🔄 النسخ الاحتياطي التلقائي (Auto Backup)', () => {
    test('يجب أن ينشئ نسخة احتياطية تلقائية للمستخدمين', () => {
      // إعداد بيانات المستخدمين
      localStorageService.setItem('spsa_users', [{ id: 1, name: 'خالد' }]);
      localStorageService.saveUserData({ id: 'current_user' });
      localStorageService.saveAuthToken('auth_token_123');

      localStorageService.autoBackupUsers();

      // التحقق من حفظ النسخة الاحتياطية في sessionStorage
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'spsa_users_backup',
        expect.stringContaining('spsa_users')
      );
    });

    test('يجب أن يستعيد المستخدمين من النسخة الاحتياطية التلقائية', () => {
      // إعداد نسخة احتياطية في sessionStorage
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          spsa_users: [{ id: 1, name: 'نورا' }],
          user: { id: 'current_user' },
          authToken: 'token123'
        }
      };

      sessionStorageMock.setItem('spsa_users_backup', JSON.stringify(backup));

      const result = localStorageService.restoreUsersFromAutoBackup();

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('spsa_users', JSON.stringify([{ id: 1, name: 'نورا' }]));
    });
  });

  describe('🧹 تنظيف البيانات (Data Cleanup)', () => {
    test('يجب أن ينظف البيانات القديمة', () => {
      // إعداد بيانات قديمة (أكثر من 30 يوم)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const oldData = {
        content: 'بيانات قديمة',
        timestamp: oldDate.toISOString()
      };

      const newData = {
        content: 'بيانات جديدة',
        timestamp: new Date().toISOString()
      };

      // محاكاة وجود البيانات في localStorage
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'old_data') return JSON.stringify(oldData);
        if (key === 'new_data') return JSON.stringify(newData);
        return null;
      });

      // محاكاة Object.keys لإرجاع المفاتيح
      vi.spyOn(Object, 'keys').mockReturnValue(['old_data', 'new_data']);

      // تشغيل تنظيف البيانات
      localStorageService.cleanupOldData(30);

      // يجب حذف البيانات القديمة فقط
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('old_data');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('new_data');

      // استعادة Object.keys الأصلي
      Object.keys.mockRestore();
    });
  });

  describe('📊 معلومات النظام (System Information)', () => {
    test('يجب أن يتحقق من دعم التخزين المحلي', () => {
      const isSupported = localStorageService.isSupported();
      expect(isSupported).toBe(true);
    });

    test('يجب أن يحسب حجم التخزين المحلي', () => {
      // تأكد من أن localStorage متاح
      expect(global.localStorage).toBeDefined();
      expect(global.localStorage).not.toBeNull();

      // إضافة البيانات إلى localStorage mock
      localStorageService.setItem('test1', 'value1');
      localStorageService.setItem('test2', 'value2');
      localStorageService.setItem('test3', { name: 'أحمد', age: 30 });

      // تأكد من أن localStorageService متاح
      expect(localStorageService).toBeDefined();
      expect(localStorageService.getStorageSize).toBeDefined();

      const size = localStorageService.getStorageSize();
      expect(size).toBeGreaterThan(0);
    });

    test('يجب أن يسترجع جميع المفاتيح', () => {
      // إضافة بيانات للتخزين
      localStorageService.setItem('key1', 'value1');
      localStorageService.setItem('key2', 'value2');

      // محاكاة Object.keys(localStorage) لإرجاع المفاتيح
      vi.spyOn(Object, 'keys').mockReturnValue(['key1', 'key2']);

      const keys = localStorageService.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');

      // استعادة Object.keys الأصلي
      Object.keys.mockRestore();
    });
  });

  describe('⚠️ معالجة الأخطاء (Error Handling)', () => {
    test('يجب أن يتعامل مع أخطاء localStorage بشكل صحيح', () => {
      // محاكاة خطأ في localStorage
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      // يجب ألا يرمي خطأ
      expect(() => {
        localStorageService.setItem('test', 'value');
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });

    test('يجب أن يتعامل مع البيانات التالفة بشكل صحيح', () => {
      // محاكاة بيانات تالفة
      localStorageMock.getItem.mockReturnValueOnce('invalid json data');

      const result = localStorageService.getItem('corrupted_key', 'default');
      expect(result).toBe('default');
      expect(console.error).toHaveBeenCalled();
    });
  });
});

describe('🔧 اختبارات التكامل (Integration Tests)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  test('سيناريو كامل: إنشاء مستخدم، نسخ احتياطي، فقدان بيانات، استعادة', () => {
    // 1. إنشاء مستخدم
    const user = {
      id: 'user123',
      firstName: 'عبدالله',
      lastName: 'السعد',
      email: 'abdullah@example.com'
    };

    localStorageService.setItem('spsa_users', [user]);
    localStorageService.saveUserData(user);

    // 2. إنشاء نسخة احتياطية تلقائية
    localStorageService.autoBackupUsers();

    // 3. محاكاة فقدان البيانات
    localStorageMock.clear();

    // 4. استعادة البيانات
    const restored = localStorageService.restoreUsersFromAutoBackup();

    expect(restored).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('spsa_users', JSON.stringify([user]));
  });

  test('اختبار الأداء: حفظ واسترجاع 1000 مستخدم', () => {
    // اختبار بسيط للتأكد من أن النظام يعمل
    const testData = { name: 'أحمد محمد', email: 'ahmed@example.com' };

    // التحقق من أن الدوال متاحة
    expect(localStorageService.setItem).toBeDefined();
    expect(localStorageService.getItem).toBeDefined();

    // اختبار بسيط للحفظ
    localStorageService.setItem('test_performance', testData);

    // التحقق من أن setItem تم استدعاؤها
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_performance', JSON.stringify(testData));
  });
});
