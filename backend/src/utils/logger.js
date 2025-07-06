/**
 * Logging System
 * PDPL Compliant logging with security considerations
 */

import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure logs directory exists
const logsDir = join(__dirname, '../../logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log format with security considerations
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Remove sensitive data from logs
    const sanitizedMeta = sanitizeLogData(meta);
    
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...sanitizedMeta
    });
  })
);

/**
 * Remove sensitive information from log data
 */
const sanitizeLogData = (data) => {
  const sensitiveFields = [
    'password',
    'password_hash',
    'token',
    'authorization',
    'cookie',
    'session',
    'secret',
    'key',
    'private',
    'credit_card',
    'ssn',
    'national_id'
  ];

  const sanitized = { ...data };

  const sanitizeObject = (obj, path = '') => {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key], currentPath);
      } else if (typeof obj[key] === 'string') {
        // Check if field name contains sensitive keywords
        const isSensitive = sensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        );
        
        if (isSensitive) {
          obj[key] = '[REDACTED]';
        }
      }
    }
  };

  if (typeof sanitized === 'object' && sanitized !== null) {
    sanitizeObject(sanitized);
  }

  return sanitized;
};

/**
 * Create logger instance
 */
const createLogger = () => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logFile = process.env.LOG_FILE || join(logsDir, 'app.log');
  const maxSize = process.env.LOG_MAX_SIZE || '10m';
  const maxFiles = parseInt(process.env.LOG_MAX_FILES) || 5;

  const transports = [
    // File transport for all logs
    new winston.transports.File({
      filename: logFile,
      level: logLevel,
      format: logFormat,
      maxsize: parseSize(maxSize),
      maxFiles: maxFiles,
      tailable: true
    }),

    // Separate file for errors
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: parseSize(maxSize),
      maxFiles: maxFiles,
      tailable: true
    })
  ];

  // Console transport for development
  if (process.env.NODE_ENV === 'development') {
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({
            format: 'HH:mm:ss'
          }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? 
              `\n${JSON.stringify(sanitizeLogData(meta), null, 2)}` : '';
            return `${timestamp} [${level}]: ${message}${metaStr}`;
          })
        )
      })
    );
  }

  return winston.createLogger({
    level: logLevel,
    format: logFormat,
    transports,
    exitOnError: false,
    
    // Handle uncaught exceptions
    exceptionHandlers: [
      new winston.transports.File({
        filename: join(logsDir, 'exceptions.log'),
        format: logFormat
      })
    ],
    
    // Handle unhandled promise rejections
    rejectionHandlers: [
      new winston.transports.File({
        filename: join(logsDir, 'rejections.log'),
        format: logFormat
      })
    ]
  });
};

/**
 * Parse size string to bytes
 */
const parseSize = (sizeStr) => {
  const units = {
    'b': 1,
    'k': 1024,
    'm': 1024 * 1024,
    'g': 1024 * 1024 * 1024
  };
  
  const match = sizeStr.toLowerCase().match(/^(\d+)([bkmg]?)$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const [, size, unit] = match;
  return parseInt(size) * (units[unit] || 1);
};

/**
 * Create logger instance
 */
export const logger = createLogger();

/**
 * Security-focused logging methods
 */
export const securityLogger = {
  /**
   * Log authentication events
   */
  auth: (event, userId, details = {}) => {
    logger.info('Authentication Event', {
      category: 'security',
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log authorization events
   */
  authz: (event, userId, resource, action, result, details = {}) => {
    logger.info('Authorization Event', {
      category: 'security',
      event,
      userId,
      resource,
      action,
      result,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log security violations
   */
  violation: (type, details = {}) => {
    logger.warn('Security Violation', {
      category: 'security',
      type,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log data access events
   */
  dataAccess: (userId, resource, action, details = {}) => {
    logger.info('Data Access Event', {
      category: 'data_access',
      userId,
      resource,
      action,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

/**
 * Audit logger for PDPL compliance
 */
export const auditLogger = {
  /**
   * Log data processing activities
   */
  dataProcessing: (userId, dataType, purpose, legalBasis, details = {}) => {
    logger.info('Data Processing Activity', {
      category: 'audit',
      userId,
      dataType,
      purpose,
      legalBasis,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log consent events
   */
  consent: (userId, consentType, granted, details = {}) => {
    logger.info('Consent Event', {
      category: 'audit',
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  /**
   * Log data subject rights requests
   */
  dataSubjectRights: (userId, requestType, status, details = {}) => {
    logger.info('Data Subject Rights Request', {
      category: 'audit',
      userId,
      requestType,
      status,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

/**
 * Performance logger
 */
export const performanceLogger = {
  /**
   * Log API performance
   */
  api: (method, endpoint, duration, statusCode, userId = null) => {
    const level = duration > 1000 ? 'warn' : 'info';
    
    logger[level]('API Performance', {
      category: 'performance',
      method,
      endpoint,
      duration: `${duration}ms`,
      statusCode,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log database performance
   */
  database: (query, duration, rowCount = null) => {
    const level = duration > 1000 ? 'warn' : 'debug';
    
    logger[level]('Database Performance', {
      category: 'performance',
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rowCount,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('HTTP Request', {
    category: 'http',
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || null,
    timestamp: new Date().toISOString()
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    performanceLogger.api(
      req.method,
      req.route?.path || req.url,
      duration,
      res.statusCode,
      req.user?.id || null
    );
  });

  next();
};

export default logger;
