// src/services/encryptionService.js
/**
 * Encryption and security service
 * خدمة التشفير والأمان
 */

import { ENV, SECURE_CONFIG } from '../config/environment.js';

/**
 * Encryption service for sensitive data
 * خدمة التشفير للبيانات الحساسة
 */
class EncryptionService {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  /**
   * ✅ Generate encryption key from password/secret with random salt
   * إنشاء مفتاح التشفير من كلمة المرور/السر مع ملح عشوائي
   */
  async generateKey(secret, salt = null) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // ✅ استخدام salt عشوائي لكل عملية تشفير - أمان أقوى
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16));
    }

    return {
      key: await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      ),
      salt: salt // إرجاع salt للاستخدام في فك التشفير
    };
  }

  /**
   * ✅ Encrypt data with random salt and IV
   * تشفير البيانات مع ملح و IV عشوائي
   */
  async encrypt(data, secret = ENV.SECURITY.ENCRYPTION_KEY) {
    try {
      if (!secret) {
        throw new Error('Encryption key not provided');
      }

      // ✅ إنشاء salt عشوائي لكل تشفير
      const { key, salt } = await this.generateKey(secret);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = this.encoder.encode(JSON.stringify(data));

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      // ✅ دمج Salt, IV والبيانات المشفرة
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);                              // أول 16 بايت: salt
      combined.set(iv, salt.length);                   // التالي 12 بايت: IV
      combined.set(new Uint8Array(encrypted), salt.length + iv.length); // الباقي: البيانات المشفرة

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      // ❌ REMOVED: console.error - لا نكشف تفاصيل فشل التشفير
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * ✅ Decrypt data with salt extraction
   * فك تشفير البيانات مع استخراج الملح
   */
  async decrypt(encryptedData, secret = ENV.SECURITY.ENCRYPTION_KEY) {
    try {
      if (!secret) {
        throw new Error('Encryption key not provided');
      }

      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // ✅ استخراج Salt, IV والبيانات المشفرة
      const salt = combined.slice(0, 16);        // أول 16 بايت: salt
      const iv = combined.slice(16, 28);         // التالي 12 بايت: IV
      const encrypted = combined.slice(28);      // الباقي: البيانات المشفرة

      // ✅ إعادة بناء المفتاح باستخدام salt المحفوظ
      const { key } = await this.generateKey(secret, salt);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decodedData = this.decoder.decode(decrypted);
      return JSON.parse(decodedData);
    } catch (error) {
      // ❌ REMOVED: console.error - لا نكشف تفاصيل فشل فك التشفير
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash password with salt
   * تشفير كلمة المرور مع الملح
   */
  async hashPassword(password, salt = null) {
    try {
      if (!salt) {
        salt = crypto.getRandomValues(new Uint8Array(16));
      }

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        this.encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      const hashArray = new Uint8Array(hashBuffer);
      const combined = new Uint8Array(salt.length + hashArray.length);
      combined.set(salt);
      combined.set(hashArray, salt.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      // ❌ REMOVED: console.error - لا نكشف تفاصيل فشل تشفير كلمات المرور
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against hash
   * التحقق من كلمة المرور مقابل التشفير
   */
  async verifyPassword(password, hashedPassword) {
    try {
      const combined = new Uint8Array(
        atob(hashedPassword).split('').map(char => char.charCodeAt(0))
      );

      const salt = combined.slice(0, 16);
      const hash = combined.slice(16);

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        this.encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const newHashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      const newHash = new Uint8Array(newHashBuffer);

      // Compare hashes
      if (hash.length !== newHash.length) {
        return false;
      }

      for (let i = 0; i < hash.length; i++) {
        if (hash[i] !== newHash[i]) {
          return false;
        }
      }

      return true;
    } catch (error) {
      // ❌ REMOVED: console.error - لا نكشف تفاصيل فشل التحقق من كلمات المرور
      return false;
    }
  }

  /**
   * Generate secure random token
   * إنشاء رمز عشوائي آمن
   */
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[+/]/g, '')
      .substring(0, length);
  }

  /**
   * Generate UUID v4
   * إنشاء UUID الإصدار 4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Secure storage service
 * خدمة التخزين الآمن
 */
class SecureStorageService {
  constructor() {
    this.encryption = new EncryptionService();
  }

  /**
   * Store encrypted data
   * تخزين البيانات المشفرة
   */
  async setSecureItem(key, data, useSessionStorage = false) {
    try {
      const encryptedData = await this.encryption.encrypt(data);
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.setItem(key, encryptedData);
      return true;
    } catch (error) {
      // ❌ REMOVED: console.error - لا نكشف تفاصيل فشل التخزين الآمن
      return false;
    }
  }

  /**
   * Retrieve and decrypt data
   * استرجاع وفك تشفير البيانات
   */
  async getSecureItem(key, useSessionStorage = false) {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const encryptedData = storage.getItem(key);
      
      if (!encryptedData) {
        return null;
      }

      return await this.encryption.decrypt(encryptedData);
    } catch (error) {
      // ❌ REMOVED: console.error - لا نكشف تفاصيل فشل استرجاع البيانات الآمنة
      // Remove corrupted data
      this.removeSecureItem(key, useSessionStorage);
      return null;
    }
  }

  /**
   * Remove secure item
   * إزالة العنصر الآمن
   */
  removeSecureItem(key, useSessionStorage = false) {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    storage.removeItem(key);
  }

  /**
   * Clear all secure storage
   * مسح جميع التخزين الآمن
   */
  clearSecureStorage() {
    // ❌ REMOVED: console.log - لا نكشف عمليات مسح التخزين الآمن في الإنتاج
    // Clear only our app's keys
    Object.values(SECURE_CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    // ✅ SecureStorage: All secure storage cleared
  }
}

// Export singleton instances
export const encryptionService = new EncryptionService();
export const secureStorage = new SecureStorageService();

// Export classes for testing
export { EncryptionService, SecureStorageService };
