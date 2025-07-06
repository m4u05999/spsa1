// src/tests/security.test.js
/**
 * Security tests for the application
 * اختبارات الأمان للتطبيق
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  sanitizeHTML, 
  sanitizeInput, 
  CSRFManager, 
  RateLimiter,
  validatePasswordStrength 
} from '../utils/security.js';
import { encryptionService, secureStorage } from '../services/encryptionService.js';
import { secureAuthService } from '../services/secureAuthService.js';

describe('Security Utils', () => {
  describe('HTML Sanitization', () => {
    it('should remove script tags', () => {
      const maliciousHTML = '<div>Hello <script>alert("XSS")</script> World</div>';
      const sanitized = sanitizeHTML(maliciousHTML);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert("XSS")');
    });

    it('should remove iframe tags', () => {
      const maliciousHTML = '<div>Content <iframe src="evil.com"></iframe></div>';
      const sanitized = sanitizeHTML(maliciousHTML);
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('evil.com');
    });

    it('should remove event handlers', () => {
      const maliciousHTML = '<div onclick="alert(\'XSS\')">Click me</div>';
      const sanitized = sanitizeHTML(maliciousHTML);
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove javascript: URLs', () => {
      const maliciousHTML = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const sanitized = sanitizeHTML(maliciousHTML);
      expect(sanitized).not.toContain('javascript:');
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize email input', () => {
      const email = 'TEST@EXAMPLE.COM<script>';
      const sanitized = sanitizeInput(email, 'email');
      expect(sanitized).toBe('test@example.comscript');
    });

    it('should sanitize phone input', () => {
      const phone = '+1-234-567-8900<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(phone, 'phone');
      expect(sanitized).toBe('+1-234-567-8900()');
    });

    it('should sanitize name input', () => {
      const name = 'John Doe<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(name, 'name');
      expect(sanitized).toBe('John Doescriptalert(XSS)/script');
    });

    it('should escape HTML entities in text', () => {
      const text = 'Hello <world> & "friends"';
      const sanitized = sanitizeInput(text, 'text');
      expect(sanitized).toBe('Hello &lt;world&gt; &amp; &quot;friends&quot;');
    });
  });

  describe('CSRF Protection', () => {
    beforeEach(() => {
      // Clear any existing tokens
      CSRFManager.clearToken();
    });

    it('should generate CSRF token', () => {
      const token = CSRFManager.generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should validate correct CSRF token', () => {
      const token = CSRFManager.generateToken();
      const isValid = CSRFManager.validateToken(token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      CSRFManager.generateToken();
      const isValid = CSRFManager.validateToken('invalid-token');
      expect(isValid).toBe(false);
    });

    it('should reject empty CSRF token', () => {
      CSRFManager.generateToken();
      const isValid = CSRFManager.validateToken('');
      expect(isValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Reset rate limiter
      RateLimiter.attempts.clear();
    });

    it('should allow requests within limit', () => {
      const key = 'test-user';
      const maxAttempts = 5;
      
      for (let i = 0; i < maxAttempts; i++) {
        const allowed = RateLimiter.isAllowed(key, maxAttempts, 60000);
        expect(allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-user';
      const maxAttempts = 3;
      
      // Make allowed attempts
      for (let i = 0; i < maxAttempts; i++) {
        RateLimiter.isAllowed(key, maxAttempts, 60000);
      }
      
      // Next attempt should be blocked
      const blocked = RateLimiter.isAllowed(key, maxAttempts, 60000);
      expect(blocked).toBe(false);
    });

    it('should reset attempts for a key', () => {
      const key = 'test-user';
      const maxAttempts = 2;
      
      // Exceed limit
      for (let i = 0; i < maxAttempts + 1; i++) {
        RateLimiter.isAllowed(key, maxAttempts, 60000);
      }
      
      // Reset and try again
      RateLimiter.reset(key);
      const allowed = RateLimiter.isAllowed(key, maxAttempts, 60000);
      expect(allowed).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const password = 'StrongP@ssw0rd123';
      const result = validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(5);
    });

    it('should reject weak password', () => {
      const password = 'weak';
      const result = validatePasswordStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(4);
    });

    it('should check minimum length requirement', () => {
      const password = 'Short1!';
      const result = validatePasswordStrength(password);
      expect(result.requirements.minLength).toBe(false);
    });

    it('should check uppercase requirement', () => {
      const password = 'lowercase123!';
      const result = validatePasswordStrength(password);
      expect(result.requirements.hasUpperCase).toBe(false);
    });

    it('should check special character requirement', () => {
      const password = 'NoSpecialChar123';
      const result = validatePasswordStrength(password);
      expect(result.requirements.hasSpecialChar).toBe(false);
    });
  });
});

describe('Encryption Service', () => {
  const testData = { message: 'Hello World', number: 123 };
  const testSecret = 'test-secret-key-32-characters-long';

  it('should encrypt and decrypt data successfully', async () => {
    const encrypted = await encryptionService.encrypt(testData, testSecret);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');

    const decrypted = await encryptionService.decrypt(encrypted, testSecret);
    expect(decrypted).toEqual(testData);
  });

  it('should fail to decrypt with wrong secret', async () => {
    const encrypted = await encryptionService.encrypt(testData, testSecret);
    
    await expect(
      encryptionService.decrypt(encrypted, 'wrong-secret')
    ).rejects.toThrow();
  });

  it('should generate secure tokens', () => {
    const token1 = encryptionService.generateSecureToken(32);
    const token2 = encryptionService.generateSecureToken(32);
    
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(32);
  });

  it('should generate valid UUIDs', () => {
    const uuid = encryptionService.generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(uuid).toMatch(uuidRegex);
  });
});

describe('Secure Storage', () => {
  const testKey = 'test-key';
  const testData = { user: 'test', role: 'admin' };
  const testSecret = 'test_32_character_encryption_key_123';

  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should store and retrieve data securely', async () => {
    // Mock encryption for testing
    vi.spyOn(encryptionService, 'encrypt').mockResolvedValue('encrypted-data');
    vi.spyOn(encryptionService, 'decrypt').mockResolvedValue(testData);

    const stored = await secureStorage.setSecureItem(testKey, testData);
    expect(stored).toBe(true);

    const retrieved = await secureStorage.getSecureItem(testKey);
    expect(retrieved).toEqual(testData);
  });

  it('should use session storage when specified', async () => {
    // Mock encryption for testing
    vi.spyOn(encryptionService, 'encrypt').mockResolvedValue('encrypted-data');
    vi.spyOn(encryptionService, 'decrypt').mockResolvedValue(testData);

    const stored = await secureStorage.setSecureItem(testKey, testData, true);
    expect(stored).toBe(true);

    // Should not be in localStorage
    expect(localStorage.getItem(testKey)).toBeNull();

    // Should be retrievable from sessionStorage
    const retrieved = await secureStorage.getSecureItem(testKey, true);
    expect(retrieved).toEqual(testData);
  });

  it('should remove secure items', async () => {
    // Mock encryption for testing
    vi.spyOn(encryptionService, 'encrypt').mockResolvedValue('encrypted-data');

    await secureStorage.setSecureItem(testKey, testData);
    secureStorage.removeSecureItem(testKey);

    const retrieved = await secureStorage.getSecureItem(testKey);
    expect(retrieved).toBeNull();
  });

  it('should handle corrupted data gracefully', async () => {
    // Manually set corrupted data
    localStorage.setItem(testKey, 'corrupted-data');

    const retrieved = await secureStorage.getSecureItem(testKey);
    expect(retrieved).toBeNull();

    // Should clean up corrupted data
    expect(localStorage.getItem(testKey)).toBeNull();
  });
});

describe('Secure Auth Service', () => {
  beforeEach(() => {
    // Clear storage and reset rate limiter
    localStorage.clear();
    sessionStorage.clear();
    RateLimiter.attempts.clear();
    CSRFManager.clearToken();
  });

  it('should handle login with valid credentials', async () => {
    const credentials = {
      email: 'admin@saudips.org',
      password: 'Admin@123'
    };

    const result = await secureAuthService.login(credentials);
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(credentials.email);
  });

  it('should reject invalid credentials', async () => {
    const credentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };

    await expect(
      secureAuthService.login(credentials)
    ).rejects.toThrow();
  });

  it('should enforce rate limiting on login attempts', async () => {
    const credentials = {
      email: 'admin@saudips.org',
      password: 'wrongpassword'
    };

    // Make multiple failed attempts
    for (let i = 0; i < 6; i++) {
      try {
        await secureAuthService.login(credentials);
      } catch (error) {
        // Expected to fail
      }
    }

    // Next attempt should be rate limited
    await expect(
      secureAuthService.login(credentials)
    ).rejects.toThrow('تم تجاوز عدد محاولات تسجيل الدخول المسموح');
  });

  it('should check authentication status', async () => {
    const isAuthenticated = await secureAuthService.isAuthenticated();
    expect(typeof isAuthenticated).toBe('boolean');
  });

  it('should logout successfully', async () => {
    const result = await secureAuthService.logout();
    expect(result).toBe(true);
  });
});
