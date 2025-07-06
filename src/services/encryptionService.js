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
   * Generate encryption key from password/secret
   * إنشاء مفتاح التشفير من كلمة المرور/السر
   */
  async generateKey(secret) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.encoder.encode('spsa-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data
   * تشفير البيانات
   */
  async encrypt(data, secret = ENV.SECURITY.ENCRYPTION_KEY) {
    try {
      if (!secret) {
        throw new Error('Encryption key not provided');
      }

      const key = await this.generateKey(secret);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = this.encoder.encode(JSON.stringify(data));

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   * فك تشفير البيانات
   */
  async decrypt(encryptedData, secret = ENV.SECURITY.ENCRYPTION_KEY) {
    try {
      if (!secret) {
        throw new Error('Encryption key not provided');
      }

      const key = await this.generateKey(secret);
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decodedData = this.decoder.decode(decrypted);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Decryption failed:', error);
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
      console.error('Password hashing failed:', error);
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
      console.error('Password verification failed:', error);
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
      console.error('Failed to store secure item:', error);
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
      console.error('Failed to retrieve secure item:', error);
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
    console.log('🧹 SecureStorage: Starting clearSecureStorage...');
    // Clear only our app's keys
    Object.values(SECURE_CONFIG.STORAGE_KEYS).forEach(key => {
      console.log(`🗑️ SecureStorage: Removing key: ${key}`);
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    console.log('✅ SecureStorage: All secure storage cleared');
  }
}

// Export singleton instances
export const encryptionService = new EncryptionService();
export const secureStorage = new SecureStorageService();

// Export classes for testing
export { EncryptionService, SecureStorageService };
