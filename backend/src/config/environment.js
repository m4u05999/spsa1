/**
 * Environment Configuration and Validation
 * PDPL Compliant Configuration Management
 */

import { logger } from '../utils/logger.js';

/**
 * Validate required environment variables
 */
export const validateEnvironment = () => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate session secret length
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long');
  }

  // Validate encryption key length
  if (process.env.ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }

  // Validate database URL format
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    const productionRequiredVars = [
      'REDIS_URL',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS'
    ];

    const missingProdVars = productionRequiredVars.filter(varName => !process.env[varName]);
    
    if (missingProdVars.length > 0) {
      logger.warn(`Missing production environment variables: ${missingProdVars.join(', ')}`);
    }
  }

  logger.info('Environment validation passed');
};

/**
 * Environment configuration object
 */
export const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'SPSA Backend API',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3001,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'spsa_db',
    user: process.env.DB_USER || 'spsa_user',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 20
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET,
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000,
    rememberMeDuration: parseInt(process.env.REMEMBER_ME_DURATION) || 2592000000
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    csrfSecret: process.env.CSRF_SECRET,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    enableHsts: process.env.ENABLE_HSTS !== 'false',
    hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
    loginWindow: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW) || 900000
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, // 10MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ],
    path: process.env.UPLOAD_PATH || './uploads'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT) || 9090
  },

  // Audit
  audit: {
    retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 2555, // 7 years
    logLevel: process.env.AUDIT_LOG_LEVEL || 'info'
  },

  // Backup
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
  },

  // Development
  development: {
    enableDebug: process.env.ENABLE_DEBUG === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableMorganLogging: process.env.ENABLE_MORGAN_LOGGING === 'true'
  }
};

/**
 * Get configuration for specific environment
 */
export const getConfig = (section = null) => {
  if (section) {
    return config[section] || {};
  }
  return config;
};

/**
 * Validate configuration values
 */
export const validateConfig = () => {
  const errors = [];

  // Validate port range
  if (config.app.port < 1 || config.app.port > 65535) {
    errors.push('Port must be between 1 and 65535');
  }

  // Validate database pool settings
  if (config.database.pool.min > config.database.pool.max) {
    errors.push('Database pool min cannot be greater than max');
  }

  // Validate rate limit settings
  if (config.rateLimit.maxRequests < 1) {
    errors.push('Rate limit max requests must be at least 1');
  }

  // Validate upload settings
  if (config.upload.maxSize < 1024) {
    errors.push('Upload max size must be at least 1KB');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }

  logger.info('Configuration validation passed');
};

/**
 * Initialize configuration
 */
export const initializeConfig = () => {
  try {
    validateEnvironment();
    validateConfig();
    
    if (config.development.enableDebug) {
      logger.debug('Configuration initialized:', {
        app: config.app,
        database: { ...config.database, password: '[HIDDEN]' },
        security: { ...config.security, encryptionKey: '[HIDDEN]' }
      });
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize configuration:', error);
    return false;
  }
};

export default config;
