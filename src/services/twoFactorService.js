/**
 * Two-Factor Authentication Service - Frontend
 * خدمة المصادقة الثنائية - الواجهة الأمامية
 * 
 * Handles 2FA operations and communicates with backend APIs
 */

import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

/**
 * Two-Factor Authentication Service Class
 * فئة خدمة المصادقة الثنائية
 */
class TwoFactorService {
  constructor() {
    this.baseUrl = '/api/auth/2fa';
    this.isEnabled = getFeatureFlag('ENABLE_2FA');
  }

  /**
   * Get user 2FA status
   * الحصول على حالة 2FA للمستخدم
   */
  async getStatus() {
    try {
      if (!this.isEnabled) {
        return {
          success: false,
          message: 'المصادقة الثنائية غير مفعلة'
        };
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/status`, {
        method: 'GET',
        requireAuth: true
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error getting 2FA status:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في الحصول على حالة 2FA'
      };
    }
  }

  /**
   * Setup 2FA for user
   * إعداد 2FA للمستخدم
   */
  async setup(method, phoneNumber = null) {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      if (!['app', 'sms'].includes(method)) {
        throw new Error('طريقة 2FA غير صحيحة');
      }

      if (method === 'sms' && !phoneNumber) {
        throw new Error('رقم الهاتف مطلوب للـ SMS');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/setup`, {
        method: 'POST',
        data: {
          method,
          phoneNumber
        },
        requireAuth: true
      });

      logInfo('2FA setup initiated', { method, hasPhoneNumber: !!phoneNumber });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error setting up 2FA:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في إعداد 2FA'
      };
    }
  }

  /**
   * Verify setup and enable 2FA
   * التحقق من الإعداد وتفعيل 2FA
   */
  async verifySetup(code) {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      if (!code || code.length !== 6) {
        throw new Error('رمز التحقق يجب أن يكون 6 أرقام');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/verify-setup`, {
        method: 'POST',
        data: { code },
        requireAuth: true
      });

      logInfo('2FA enabled successfully');

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error verifying 2FA setup:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في التحقق من إعداد 2FA'
      };
    }
  }

  /**
   * Verify 2FA code
   * التحقق من رمز 2FA
   */
  async verify(code, method = null) {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      if (!code || code.length !== 6) {
        throw new Error('رمز التحقق يجب أن يكون 6 أرقام');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/verify`, {
        method: 'POST',
        data: { 
          code,
          method
        },
        requireAuth: true
      });

      logInfo('2FA verification successful', { method });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error verifying 2FA code:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في التحقق من رمز 2FA'
      };
    }
  }

  /**
   * Disable 2FA
   * إلغاء تفعيل 2FA
   */
  async disable(code) {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      if (!code || code.length !== 6) {
        throw new Error('رمز التحقق يجب أن يكون 6 أرقام');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/disable`, {
        method: 'POST',
        data: { code },
        requireAuth: true
      });

      logInfo('2FA disabled successfully');

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error disabling 2FA:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في إلغاء تفعيل 2FA'
      };
    }
  }

  /**
   * Get backup codes
   * الحصول على رموز النسخ الاحتياطي
   */
  async getBackupCodes() {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/backup-codes`, {
        method: 'GET',
        requireAuth: true
      });

      logInfo('Backup codes generated');

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error getting backup codes:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في الحصول على رموز النسخ الاحتياطي'
      };
    }
  }

  /**
   * Send SMS code
   * إرسال رمز SMS
   */
  async sendSMSCode() {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/send-sms`, {
        method: 'POST',
        requireAuth: true
      });

      logInfo('SMS code sent');

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error sending SMS code:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في إرسال رمز SMS'
      };
    }
  }

  /**
   * Get QR code for app setup
   * الحصول على QR Code لإعداد التطبيق
   */
  async getQRCode() {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/qr-code`, {
        method: 'GET',
        requireAuth: true
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error getting QR code:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في الحصول على QR Code'
      };
    }
  }

  /**
   * Get recovery codes count
   * الحصول على عدد رموز النسخ الاحتياطي
   */
  async getRecoveryCodes() {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/recovery-codes`, {
        method: 'GET',
        requireAuth: true
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error getting recovery codes:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في الحصول على رموز النسخ الاحتياطي'
      };
    }
  }

  /**
   * Test verification (development only)
   * اختبار التحقق (للتطوير فقط)
   */
  async testVerify(code) {
    try {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('هذه الوظيفة متاحة فقط في بيئة التطوير');
      }

      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/test-verify`, {
        method: 'POST',
        data: { code },
        requireAuth: true
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error in test verification:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في اختبار التحقق'
      };
    }
  }

  /**
   * Enhanced login with 2FA support
   * تسجيل دخول محسن مع دعم 2FA
   */
  async enhancedLogin(credentials) {
    try {
      const response = await unifiedApiService.request('/api/auth/login', {
        method: 'POST',
        data: credentials,
        requireAuth: false
      });

      // إذا كان 2FA مطلوب
      if (response.requiresTwoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          method: response.method,
          sessionToken: response.sessionToken,
          message: response.message
        };
      }

      // تسجيل دخول ناجح
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error in enhanced login:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في تسجيل الدخول'
      };
    }
  }

  /**
   * Admin functions
   * وظائف إدارية
   */
  async getAdminStats() {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/admin/stats`, {
        method: 'GET',
        requireAuth: true
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error getting admin stats:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في الحصول على إحصائيات 2FA'
      };
    }
  }

  async getAdminUsers(page = 1, limit = 20) {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/admin/users`, {
        method: 'GET',
        params: { page, limit },
        requireAuth: true
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error getting admin users:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في الحصول على مستخدمي 2FA'
      };
    }
  }

  async forceDisable(userId) {
    try {
      if (!this.isEnabled) {
        throw new Error('المصادقة الثنائية غير مفعلة');
      }

      const response = await unifiedApiService.request(`${this.baseUrl}/admin/force-disable/${userId}`, {
        method: 'POST',
        requireAuth: true
      });

      logInfo('2FA force disabled by admin', { userId });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logError('Error force disabling 2FA:', error);
      return {
        success: false,
        error: error.message || 'حدث خطأ في إلغاء تفعيل 2FA'
      };
    }
  }

  /**
   * Utility functions
   * وظائف مساعدة
   */

  /**
   * Generate QR code URL for manual entry
   * إنشاء رابط QR Code للإدخال اليدوي
   */
  generateManualEntryUrl(secret, email, issuer = 'SPSA') {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }

  /**
   * Validate 2FA code format
   * التحقق من تنسيق رمز 2FA
   */
  validateCodeFormat(code) {
    return /^\d{6}$/.test(code);
  }

  /**
   * Format phone number for display
   * تنسيق رقم الهاتف للعرض
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // إخفاء الأرقام الوسطى
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return phoneNumber;
  }

  /**
   * Get supported 2FA methods
   * الحصول على طرق 2FA المدعومة
   */
  getSupportedMethods() {
    return [
      {
        id: 'app',
        name: 'تطبيق المصادقة',
        description: 'استخدم تطبيق مثل Google Authenticator أو Authy',
        icon: '📱',
        recommended: true
      },
      {
        id: 'sms',
        name: 'الرسائل النصية',
        description: 'استلم رمز التحقق عبر رسالة نصية',
        icon: '📨',
        recommended: false
      }
    ];
  }

  /**
   * Get 2FA method display info
   * الحصول على معلومات عرض طريقة 2FA
   */
  getMethodInfo(method) {
    const methods = this.getSupportedMethods();
    return methods.find(m => m.id === method) || null;
  }

  /**
   * Check if 2FA is enabled in system
   * التحقق من تفعيل 2FA في النظام
   */
  isSystemEnabled() {
    return this.isEnabled && getFeatureFlag('ENABLE_2FA_SYSTEM');
  }

  /**
   * Get time remaining for current TOTP code
   * الحصول على الوقت المتبقي لرمز TOTP الحالي
   */
  getTimeRemaining() {
    const now = Math.floor(Date.now() / 1000);
    const period = 30; // TOTP period in seconds
    const remaining = period - (now % period);
    return remaining;
  }

  /**
   * Format backup codes for display
   * تنسيق رموز النسخ الاحتياطي للعرض
   */
  formatBackupCodes(codes) {
    if (!Array.isArray(codes)) return [];
    
    return codes.map((code, index) => ({
      id: index + 1,
      code: code,
      formatted: code.replace(/(.{4})/g, '$1 ').trim() // Add space every 4 characters
    }));
  }

  /**
   * Get security recommendations
   * الحصول على توصيات الأمان
   */
  getSecurityRecommendations() {
    return [
      {
        id: 'backup_codes',
        title: 'احفظ رموز النسخ الاحتياطي',
        description: 'احفظ رموز النسخ الاحتياطي في مكان آمن',
        importance: 'high'
      },
      {
        id: 'multiple_devices',
        title: 'استخدم أكثر من جهاز',
        description: 'أضف تطبيق المصادقة على أكثر من جهاز',
        importance: 'medium'
      },
      {
        id: 'regular_check',
        title: 'راجع الإعدادات بانتظام',
        description: 'تحقق من إعدادات 2FA وأجهزتك المرتبطة',
        importance: 'medium'
      }
    ];
  }
}

// Create singleton instance
const twoFactorService = new TwoFactorService();

export default twoFactorService;
export { twoFactorService }; 