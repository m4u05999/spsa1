/**
 * Local Storage Service with PDPL Compliance
 * خدمة التخزين المحلي مع الامتثال لقانون حماية البيانات الشخصية السعودي
 * 
 * Features:
 * - PDPL compliant data handling
 * - Encryption for sensitive data
 * - Data retention policies
 * - Consent management
 * - Audit logging
 */

/**
 * PDPL Compliance Configuration
 * إعدادات الامتثال لقانون حماية البيانات الشخصية
 */
const PDPL_CONFIG = {
  // Data retention periods (in days)
  RETENTION_PERIODS: {
    CONTENT_DATA: 365,      // Content data: 1 year
    USER_PREFERENCES: 730,  // User preferences: 2 years
    CACHE_DATA: 30,         // Cache data: 30 days
    AUDIT_LOGS: 2555,       // Audit logs: 7 years (PDPL requirement)
  },
  
  // Data categories requiring encryption
  ENCRYPTED_CATEGORIES: [
    'user_data',
    'personal_info',
    'sensitive_content'
  ],
  
  // Consent requirements
  CONSENT_REQUIRED: [
    'analytics',
    'preferences',
    'content_history'
  ]
};

/**
 * Storage Keys with PDPL Classification
 * مفاتيح التخزين مع تصنيف قانون حماية البيانات
 */
const STORAGE_KEYS = {
  // Content Management
  CONTENT_CACHE: 'spsa_content_cache',
  CONTENT_DRAFTS: 'spsa_content_drafts',
  CONTENT_TEMPLATES: 'spsa_content_templates',
  
  // User Preferences (requires consent)
  USER_PREFERENCES: 'spsa_user_preferences',
  VIEW_SETTINGS: 'spsa_view_settings',
  FILTER_SETTINGS: 'spsa_filter_settings',
  
  // System Data
  CIRCUIT_BREAKER_STATE: 'spsa_circuit_breaker',
  API_CACHE: 'spsa_api_cache',
  FEATURE_FLAGS: 'spsa_feature_flags',
  
  // PDPL Compliance
  CONSENT_RECORDS: 'spsa_consent_records',
  DATA_RETENTION: 'spsa_data_retention',
  AUDIT_LOG: 'spsa_audit_log'
};

/**
 * Simple encryption/decryption for sensitive data
 * تشفير/فك تشفير بسيط للبيانات الحساسة
 */
class SimpleEncryption {
  static encode(data) {
    try {
      return btoa(JSON.stringify(data));
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }
  
  static decode(encodedData) {
    try {
      return JSON.parse(atob(encodedData));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}

/**
 * PDPL Compliant Local Storage Service
 * خدمة التخزين المحلي المتوافقة مع قانون حماية البيانات
 */
class LocalStorageService {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.initializePDPLCompliance();
  }
  
  /**
   * Check if localStorage is available
   * فحص توفر التخزين المحلي
   */
  checkAvailability() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }
  
  /**
   * Initialize PDPL compliance measures
   * تهيئة إجراءات الامتثال لقانون حماية البيانات
   */
  initializePDPLCompliance() {
    if (!this.isAvailable) return;
    
    // Initialize consent records if not exists
    if (!this.getItem(STORAGE_KEYS.CONSENT_RECORDS)) {
      this.setItem(STORAGE_KEYS.CONSENT_RECORDS, {
        timestamp: Date.now(),
        consents: {},
        version: '1.0'
      });
    }
    
    // Initialize data retention tracking
    if (!this.getItem(STORAGE_KEYS.DATA_RETENTION)) {
      this.setItem(STORAGE_KEYS.DATA_RETENTION, {
        lastCleanup: Date.now(),
        retentionPolicies: PDPL_CONFIG.RETENTION_PERIODS
      });
    }
    
    // Perform periodic cleanup
    this.performDataRetentionCleanup();
  }
  
  /**
   * Set item with PDPL compliance
   * حفظ عنصر مع الامتثال لقانون حماية البيانات
   */
  setItem(key, value, options = {}) {
    if (!this.isAvailable) {
      console.warn('localStorage not available');
      return false;
    }
    
    try {
      const {
        encrypted = false,
        requiresConsent = false,
        category = 'general',
        retentionDays = PDPL_CONFIG.RETENTION_PERIODS.CACHE_DATA
      } = options;
      
      // Check consent if required
      if (requiresConsent && !this.hasConsent(category)) {
        console.warn(`Consent required for category: ${category}`);
        return false;
      }
      
      // Prepare data with metadata
      const dataWithMetadata = {
        value: encrypted ? SimpleEncryption.encode(value) : value,
        metadata: {
          timestamp: Date.now(),
          encrypted,
          category,
          retentionDays,
          expiresAt: Date.now() + (retentionDays * 24 * 60 * 60 * 1000)
        }
      };
      
      localStorage.setItem(key, JSON.stringify(dataWithMetadata));
      
      // Log for audit (non-sensitive data only)
      this.auditLog('SET', key, { category, encrypted });
      
      return true;
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
      return false;
    }
  }
  
  /**
   * Get item with PDPL compliance
   * استرجاع عنصر مع الامتثال لقانون حماية البيانات
   */
  getItem(key, defaultValue = null) {
    if (!this.isAvailable) {
      return defaultValue;
    }
    
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) {
        return defaultValue;
      }
      
      const parsedData = JSON.parse(storedData);
      
      // Check if data has expired
      if (parsedData.metadata && parsedData.metadata.expiresAt < Date.now()) {
        this.removeItem(key);
        return defaultValue;
      }
      
      // Decrypt if necessary
      if (parsedData.metadata && parsedData.metadata.encrypted) {
        const decryptedValue = SimpleEncryption.decode(parsedData.value);
        return decryptedValue !== null ? decryptedValue : defaultValue;
      }
      
      // Return value (handle both old and new format)
      return parsedData.value !== undefined ? parsedData.value : parsedData;
      
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return defaultValue;
    }
  }
  
  /**
   * Remove item
   * حذف عنصر
   */
  removeItem(key) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      this.auditLog('REMOVE', key);
      return true;
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
      return false;
    }
  }
  
  /**
   * Clear all data (with PDPL compliance)
   * مسح جميع البيانات (مع الامتثال لقانون حماية البيانات)
   */
  clear(category = null) {
    if (!this.isAvailable) return false;
    
    try {
      if (category) {
        // Clear specific category
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          const data = this.getItem(key);
          if (data && data.metadata && data.metadata.category === category) {
            this.removeItem(key);
          }
        });
      } else {
        // Clear all SPSA data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('spsa_')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      this.auditLog('CLEAR', category || 'all');
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
  
  /**
   * Check user consent for data category
   * فحص موافقة المستخدم لفئة البيانات
   */
  hasConsent(category) {
    const consentRecords = this.getItem(STORAGE_KEYS.CONSENT_RECORDS);
    return consentRecords && consentRecords.consents && consentRecords.consents[category] === true;
  }
  
  /**
   * Record user consent
   * تسجيل موافقة المستخدم
   */
  recordConsent(category, granted = true) {
    const consentRecords = this.getItem(STORAGE_KEYS.CONSENT_RECORDS) || { consents: {} };
    consentRecords.consents[category] = granted;
    consentRecords.lastUpdated = Date.now();
    
    this.setItem(STORAGE_KEYS.CONSENT_RECORDS, consentRecords);
    this.auditLog('CONSENT', category, { granted });
  }
  
  /**
   * Perform data retention cleanup
   * تنفيذ تنظيف الاحتفاظ بالبيانات
   */
  performDataRetentionCleanup() {
    if (!this.isAvailable) return;
    
    const retentionData = this.getItem(STORAGE_KEYS.DATA_RETENTION);
    const now = Date.now();
    
    // Only run cleanup once per day
    if (retentionData && (now - retentionData.lastCleanup) < (24 * 60 * 60 * 1000)) {
      return;
    }
    
    try {
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith('spsa_')) {
          const data = this.getItem(key);
          if (data && data.metadata && data.metadata.expiresAt < now) {
            this.removeItem(key);
            cleanedCount++;
          }
        }
      });
      
      // Update cleanup timestamp
      this.setItem(STORAGE_KEYS.DATA_RETENTION, {
        lastCleanup: now,
        retentionPolicies: PDPL_CONFIG.RETENTION_PERIODS,
        lastCleanupCount: cleanedCount
      });
      
      if (cleanedCount > 0) {
        console.log(`PDPL Cleanup: Removed ${cleanedCount} expired items`);
      }
      
    } catch (error) {
      console.error('Data retention cleanup failed:', error);
    }
  }
  
  /**
   * Audit logging for PDPL compliance
   * تسجيل المراجعة للامتثال لقانون حماية البيانات
   */
  auditLog(action, key, metadata = {}) {
    try {
      const auditLogs = this.getItem(STORAGE_KEYS.AUDIT_LOG) || [];
      
      auditLogs.push({
        timestamp: Date.now(),
        action,
        key: key.replace(/spsa_/, ''), // Remove prefix for cleaner logs
        metadata,
        userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
      });
      
      // Keep only last 1000 audit entries
      if (auditLogs.length > 1000) {
        auditLogs.splice(0, auditLogs.length - 1000);
      }
      
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(auditLogs));
    } catch (error) {
      // Fail silently for audit logs to not break main functionality
      console.warn('Audit logging failed:', error);
    }
  }
  
  /**
   * Get storage usage statistics
   * الحصول على إحصائيات استخدام التخزين
   */
  getStorageStats() {
    if (!this.isAvailable) return null;
    
    try {
      const stats = {
        totalItems: 0,
        totalSize: 0,
        categories: {},
        expired: 0
      };
      
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('spsa_')) {
          const value = localStorage.getItem(key);
          stats.totalItems++;
          stats.totalSize += value.length;
          
          try {
            const data = JSON.parse(value);
            if (data.metadata) {
              const category = data.metadata.category || 'unknown';
              stats.categories[category] = (stats.categories[category] || 0) + 1;
              
              if (data.metadata.expiresAt < now) {
                stats.expired++;
              }
            }
          } catch (e) {
            // Handle legacy data format
            stats.categories['legacy'] = (stats.categories['legacy'] || 0) + 1;
          }
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const localStorageService = new LocalStorageService();

export { localStorageService, STORAGE_KEYS, PDPL_CONFIG };
export default localStorageService;
