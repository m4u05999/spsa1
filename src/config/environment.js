// src/config/environment.js
/**
 * Environment configuration and validation
 * إعدادات والتحقق من متغيرات البيئة
 */

/**
 * Get environment variable with validation
 * الحصول على متغير البيئة مع التحقق من صحته
 */
export const getEnvVar = (key, defaultValue = null, required = false) => {
  const value = import.meta.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
};

/**
 * Validate environment variables
 * التحقق من صحة متغيرات البيئة
 */
const validateEnvironment = () => {
  const errors = [];
  
  // Check required variables
  const requiredVars = [
    'VITE_APP_ENV',
    'VITE_APP_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Validate URLs
  const urlVars = ['VITE_APP_URL', 'VITE_API_URL', 'VITE_SUPABASE_URL'];
  urlVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value && !isValidUrl(value)) {
      errors.push(`Invalid URL format for ${varName}: ${value}`);
    }
  });
  
  // Validate environment
  const validEnvs = ['development', 'staging', 'production', 'test'];
  const currentEnv = import.meta.env.VITE_APP_ENV;
  if (currentEnv && !validEnvs.includes(currentEnv)) {
    errors.push(`Invalid environment: ${currentEnv}. Must be one of: ${validEnvs.join(', ')}`);
  }
  
  if (errors.length > 0) {
    console.error('Environment validation errors:', errors);
    if (import.meta.env.VITE_APP_ENV === 'production') {
      throw new Error('Environment validation failed in production');
    }
  }
  
  return errors.length === 0;
};

/**
 * Check if string is a valid URL
 * التحقق من صحة الرابط
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Environment configuration object
 * كائن إعدادات البيئة
 */
export const ENV = {
  // Application settings
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  APP_URL: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
  API_URL: getEnvVar('VITE_API_URL',
    // FIXED: Use Supabase URL instead of localhost to prevent connection errors
    getEnvVar('VITE_APP_ENV', 'development') === 'development'
      ? getEnvVar('VITE_SUPABASE_URL', 'https://dufvobubfjicrkygwyll.supabase.co') + '/rest/v1'
      : 'https://api.political-science-assoc.com'
  ),
  
  // Supabase configuration
  SUPABASE: {
    URL: getEnvVar('VITE_SUPABASE_URL', ''),
    ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
    SERVICE_ROLE_KEY: getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY', ''),
  },
  
  // Security configuration
  SECURITY: {
    ENCRYPTION_KEY: getEnvVar('VITE_ENCRYPTION_KEY', ''),
    CSRF_SECRET: getEnvVar('VITE_CSRF_SECRET', ''),
  },
  
  // Feature flags - UPDATED FOR SUPABASE FALLBACK
  FEATURES: {
    ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
    DEBUG: getEnvVar('VITE_ENABLE_DEBUG', 'false') === 'true',
    MOCK_AUTH: getEnvVar('VITE_ENABLE_MOCK_AUTH', 'true') === 'true',
    SUPABASE: getEnvVar('VITE_ENABLE_SUPABASE_FALLBACK', 'true') === 'true',
    MIGRATION: getEnvVar('VITE_ENABLE_MIGRATION', 'false') === 'true',
    ENABLE_NEW_BACKEND: getEnvVar('VITE_ENABLE_NEW_BACKEND', 'false') === 'true',
    USE_NEW_AUTH: getEnvVar('VITE_USE_NEW_AUTH', 'false') === 'true',
    ENABLE_DEBUG_MODE: getEnvVar('VITE_ENABLE_DEBUG_MODE', 'true') === 'true',
    ENABLE_SUPABASE_FALLBACK: getEnvVar('VITE_ENABLE_SUPABASE_FALLBACK', 'true') === 'true',
  },
  
  // External services
  EXTERNAL: {
    GOOGLE_ANALYTICS_ID: getEnvVar('VITE_GOOGLE_ANALYTICS_ID', ''),
    SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN', ''),
  },
  
  // Rate limiting
  RATE_LIMIT: {
    REQUESTS: parseInt(getEnvVar('VITE_RATE_LIMIT_REQUESTS', '100')),
    WINDOW: parseInt(getEnvVar('VITE_RATE_LIMIT_WINDOW', '900000')), // 15 minutes
  },
  
  // Session configuration
  SESSION: {
    TIMEOUT: parseInt(getEnvVar('VITE_SESSION_TIMEOUT', '3600000')), // 1 hour
    REMEMBER_ME_DURATION: parseInt(getEnvVar('VITE_REMEMBER_ME_DURATION', '2592000000')), // 30 days
  },
  
  // Computed properties
  get IS_DEVELOPMENT() {
    return this.APP_ENV === 'development';
  },
  
  get IS_PRODUCTION() {
    return this.APP_ENV === 'production';
  },
  
  get IS_STAGING() {
    return this.APP_ENV === 'staging';
  },
  
  get IS_BROWSER() {
    return typeof window !== 'undefined';
  }
};

/**
 * Secure configuration for sensitive data
 * إعدادات آمنة للبيانات الحساسة
 */
export const SECURE_CONFIG = {
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'spsa_auth_token',
    USER_DATA: 'spsa_user_data',
    CSRF_TOKEN: 'spsa_csrf_token',
    SESSION_ID: 'spsa_session_id',
  },
  
  // Encryption settings
  ENCRYPTION: {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12,
    TAG_LENGTH: 16,
  },
  
  // Security timeouts
  TIMEOUTS: {
    LOGIN_ATTEMPT: 5 * 60 * 1000, // 5 minutes
    PASSWORD_RESET: 15 * 60 * 1000, // 15 minutes
    SESSION_WARNING: 5 * 60 * 1000, // 5 minutes before expiry
  },
  
  // Password requirements
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>',
  },
  
  // Rate limiting rules
  RATE_LIMITS: {
    LOGIN: { attempts: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    REGISTER: { attempts: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    PASSWORD_RESET: { attempts: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    API_CALLS: { attempts: 100, window: 15 * 60 * 1000 }, // 100 calls per 15 minutes
  }
};

/**
 * Initialize environment validation
 * تهيئة التحقق من البيئة
 */
export const initializeEnvironment = () => {
  try {
    validateEnvironment();
    
    if (ENV.FEATURES.DEBUG) {
      console.log('Environment initialized:', {
        APP_ENV: ENV.APP_ENV,
        NODE_ENV: ENV.NODE_ENV,
        IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
        IS_PRODUCTION: ENV.IS_PRODUCTION,
        FEATURES: ENV.FEATURES,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize environment:', error);
    return false;
  }
};

/**
 * Get configuration for current environment
 * الحصول على إعدادات البيئة الحالية
 */
export const getEnvironmentConfig = () => {
  return {
    ...ENV,
    SECURE_CONFIG: ENV.IS_DEVELOPMENT ? SECURE_CONFIG : {}, // Hide secure config in production
  };
};

// Initialize environment on module load
initializeEnvironment();

// Debug logging for development
if (ENV.IS_DEVELOPMENT && ENV.FEATURES.ENABLE_DEBUG_MODE) {
  console.log('🔧 Environment Debug Info:', {
    APP_ENV: ENV.APP_ENV,
    NODE_ENV: ENV.NODE_ENV,
    API_URL: ENV.API_URL,
    IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
    VITE_API_URL_RAW: import.meta.env.VITE_API_URL, // Raw value from Vite
    ALL_VITE_VARS: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
}

export default ENV;
