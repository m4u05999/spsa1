/**
 * اختبارات مبسطة لنظام إدارة المستخدمين
 * Simplified User Management System Tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import localStorageService from '../services/localStorageService.js';

// Mock localStorage بشكل مبسط
const createMockStorage = () => {
  const store = new Map();
  return {
    getItem: vi.fn((key) => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get length() { return store.size; },
    keys: () => Array.from(store.keys()),
    [Symbol.iterator]: () => store.keys()
  };
};

const mockLocalStorage = createMockStorage();
const mockSessionStorage = createMockStorage();

// إعداد global mocks
global.localStorage = mockLocalStorage;
global.sessionStorage = mockSessionStorage;

// Mock console
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

describe('🧪 اختبارات نظام التخزين المحلي المبسطة', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('📝 العمليات الأساسية', () => {
    test('حفظ واسترجاع البيانات', () => {
      const testData = { name: 'أحمد', email: 'ahmed@test.com' };
      
      localStorageService.setItem('test_user', testData);
      const result = localStorageService.getItem('test_user');
      
      expect(result).toEqual(testData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_user', JSON.stringify(testData));
    });

    test('إرجاع القيمة الافتراضية عند عدم وجود البيانات', () => {
      const defaultValue = { users: [] };
      const result = localStorageService.getItem('non_existent', defaultValue);
      
      expect(result).toEqual(defaultValue);
    });

    test('حذف البيانات', () => {
      localStorageService.setItem('test_key', 'test_value');
      localStorageService.removeItem('test_key');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    test('التحقق من وجود المفتاح', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('{"test": "value"}');
      expect(localStorageService.hasItem('existing_key')).toBe(true);
      
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      expect(localStorageService.hasItem('non_existing_key')).toBe(false);
    });
  });

  describe('👤 إدارة بيانات المستخدم', () => {
    test('حفظ واسترجاع بيانات المستخدم', () => {
      const userData = {
        id: 'user123',
        firstName: 'فاطمة',
        lastName: 'أحمد',
        email: 'fatima@test.com'
      };

      localStorageService.saveUserData(userData);
      
      // محاكاة الاسترجاع
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(userData));
      const result = localStorageService.getUserData();

      expect(result).toEqual(userData);
    });

    test('حفظ واسترجاع توكن المصادقة', () => {
      const token = 'test_token_123';

      localStorageService.saveAuthToken(token);

      // محاكاة الاسترجاع - التوكن يُحفظ كنص بسيط
      mockLocalStorage.getItem.mockReturnValueOnce(`"${token}"`);
      const result = localStorageService.getAuthToken();

      expect(result).toBe(token);
    });

    test('تسجيل الخروج', () => {
      localStorageService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('💾 النسخ الاحتياطي', () => {
    test('إنشاء نسخة احتياطية', () => {
      // إعداد بيانات تجريبية
      const testData = [{ id: 1, name: 'محمد' }];

      // إضافة البيانات للـ mock storage
      mockLocalStorage.setItem('users', JSON.stringify(testData));

      // محاكاة استرجاع البيانات
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const backup = localStorageService.createBackup(['users']);

      expect(backup).toBeDefined();
      expect(backup.timestamp).toBeDefined();
      expect(backup.data).toBeDefined();
    });

    test('استعادة النسخة الاحتياطية', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          users: [{ id: 1, name: 'علي' }]
        }
      };

      const result = localStorageService.restoreBackup(backup, true);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([{ id: 1, name: 'علي' }]));
    });

    test('حفظ النسخة الاحتياطية في sessionStorage', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: { users: [] }
      };

      localStorageService.saveBackupToSession(backup, 'test_backup');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test_backup', JSON.stringify(backup));
    });

    test('استرجاع النسخة الاحتياطية من sessionStorage', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: { users: [{ id: 1, name: 'سارة' }] }
      };

      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(backup));
      const result = localStorageService.getBackupFromSession('test_backup');

      expect(result).toEqual(backup);
    });
  });

  describe('🔄 النسخ الاحتياطي التلقائي', () => {
    test('إنشاء نسخة احتياطية تلقائية للمستخدمين', () => {
      // إعداد البيانات
      const users = [{ id: 1, name: 'خالد' }];
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(users))  // spsa_users
        .mockReturnValueOnce(JSON.stringify({ id: 'current' }))  // user
        .mockReturnValueOnce('token123');  // authToken

      localStorageService.autoBackupUsers();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'spsa_users_backup',
        expect.stringContaining('spsa_users')
      );
    });

    test('استعادة المستخدمين من النسخة الاحتياطية التلقائية', () => {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          spsa_users: [{ id: 1, name: 'نورا' }]
        }
      };

      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(backup));

      const result = localStorageService.restoreUsersFromAutoBackup();

      // التحقق من أن العملية تمت بنجاح
      expect(result).toBe(true);
      // التحقق من أن sessionStorage تم استدعاؤه
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('spsa_users_backup');
    });
  });

  describe('⚠️ معالجة الأخطاء', () => {
    test('التعامل مع أخطاء localStorage', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        localStorageService.setItem('test', 'value');
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });

    test('التعامل مع البيانات التالفة', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json');

      const result = localStorageService.getItem('corrupted_key', 'default');
      
      expect(result).toBe('default');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('🔧 اختبارات التكامل', () => {
    test('سيناريو كامل: إنشاء، نسخ احتياطي، فقدان، استعادة', () => {
      // 1. إنشاء مستخدم
      const user = {
        id: 'user123',
        firstName: 'عبدالله',
        lastName: 'السعد',
        email: 'abdullah@test.com'
      };

      localStorageService.setItem('spsa_users', [user]);
      localStorageService.saveUserData(user);

      // 2. إنشاء نسخة احتياطية تلقائية
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify([user]))
        .mockReturnValueOnce(JSON.stringify(user))
        .mockReturnValueOnce('token123');

      localStorageService.autoBackupUsers();

      // 3. محاكاة فقدان البيانات
      mockLocalStorage.clear();

      // 4. استعادة البيانات
      const backup = {
        timestamp: new Date().toISOString(),
        data: { spsa_users: [user] }
      };
      
      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(backup));
      const restored = localStorageService.restoreUsersFromAutoBackup();

      expect(restored).toBe(true);
    });

    test('اختبار الأداء: معالجة 100 مستخدم', () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        id: `user_${i}`,
        firstName: `مستخدم${i}`,
        email: `user${i}@test.com`
      }));

      const startTime = performance.now();
      
      localStorageService.setItem('performance_test', users);
      
      // محاكاة الاسترجاع
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(users));
      const retrieved = localStorageService.getItem('performance_test');
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(retrieved).toHaveLength(100);
      expect(duration).toBeLessThan(50); // يجب أن يكتمل في أقل من 50 مللي ثانية
    });
  });
});
