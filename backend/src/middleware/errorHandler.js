/**
 * Error Handling Middleware
 * Centralized error handling with security considerations
 */

import { logger, securityLogger } from '../utils/logger.js';
import { config } from '../config/environment.js';

/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Database error handler
 */
const handleDatabaseError = (error) => {
  logger.error('Database error:', error);

  // PostgreSQL specific errors
  switch (error.code) {
    case '23505': // Unique violation
      return new ConflictError('Resource already exists');
    
    case '23503': // Foreign key violation
      return new ValidationError('Referenced resource does not exist');
    
    case '23502': // Not null violation
      return new ValidationError('Required field is missing');
    
    case '23514': // Check violation
      return new ValidationError('Data validation failed');
    
    case '42P01': // Undefined table
      logger.error('Database schema error - table not found:', error);
      return new AppError('Database configuration error', 500, 'DATABASE_ERROR');
    
    case '42703': // Undefined column
      logger.error('Database schema error - column not found:', error);
      return new AppError('Database configuration error', 500, 'DATABASE_ERROR');
    
    case '28P01': // Invalid password
    case '28000': // Invalid authorization
      return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR');
    
    case '53300': // Too many connections
      return new AppError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE');
    
    default:
      return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  }
};

/**
 * JWT error handler
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }
  
  return new AuthenticationError('Token validation failed');
};

/**
 * Validation error handler
 */
const handleValidationError = (error) => {
  if (error.name === 'ValidationError' && error.details) {
    return error; // Already a ValidationError
  }
  
  // Express-validator errors
  if (error.array && typeof error.array === 'function') {
    const details = error.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    return new ValidationError('Validation failed', details);
  }
  
  // Joi validation errors
  if (error.isJoi) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return new ValidationError('Validation failed', details);
  }
  
  return new ValidationError(error.message || 'Validation failed');
};

/**
 * Format error response
 */
const formatErrorResponse = (error, req) => {
  const response = {
    error: error.message,
    code: error.code || 'INTERNAL_ERROR',
    timestamp: error.timestamp || new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add details for validation errors
  if (error instanceof ValidationError && error.details) {
    response.details = error.details;
  }

  // Add retry information for rate limit errors
  if (error instanceof RateLimitError) {
    response.retryAfter = error.retryAfter;
  }

  // Add stack trace in development
  if (config.app.isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  // Add request ID if available
  if (req.id) {
    response.requestId = req.id;
  }

  return response;
};

/**
 * Log error with appropriate level
 */
const logError = (error, req) => {
  const logData = {
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null,
    timestamp: new Date().toISOString()
  };

  // Log security-related errors
  if (error.statusCode === 401 || error.statusCode === 403) {
    securityLogger.violation('access_denied', {
      ...logData,
      reason: error.message
    });
  }

  // Log based on severity
  if (error.statusCode >= 500) {
    logger.error('Server Error:', { ...logData, stack: error.stack });
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error:', logData);
  } else {
    logger.info('Request Error:', logData);
  }
};

/**
 * Main error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  let processedError = error;

  // Convert known error types
  if (error.code && typeof error.code === 'string') {
    // Database errors
    if (error.code.match(/^[0-9A-Z]{5}$/)) {
      processedError = handleDatabaseError(error);
    }
  } else if (error.name && error.name.includes('JWT')) {
    // JWT errors
    processedError = handleJWTError(error);
  } else if (error.isJoi || (error.array && typeof error.array === 'function')) {
    // Validation errors
    processedError = handleValidationError(error);
  } else if (!(error instanceof AppError)) {
    // Generic errors
    processedError = new AppError(
      config.app.isProduction ? 'Internal server error' : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // Log the error
  logError(processedError, req);

  // Send error response
  const response = formatErrorResponse(processedError, req);
  
  res.status(processedError.statusCode || 500).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  
  logger.warn('Route not found:', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const response = formatErrorResponse(error, req);
  res.status(404).json(response);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation middleware wrapper
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return next(new ValidationError('Validation failed', error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))));
    }
    
    next();
  };
};

/**
 * Error monitoring and alerting
 */
export const monitorErrors = () => {
  // Track error rates
  const errorCounts = new Map();
  const alertThreshold = 10; // errors per minute
  const timeWindow = 60000; // 1 minute

  return (error, req, res, next) => {
    const now = Date.now();
    const minute = Math.floor(now / timeWindow);
    const key = `${minute}_${error.statusCode}`;
    
    const count = errorCounts.get(key) || 0;
    errorCounts.set(key, count + 1);
    
    // Clean old entries
    for (const [k, v] of errorCounts.entries()) {
      const [keyMinute] = k.split('_');
      if (parseInt(keyMinute) < minute - 5) { // Keep last 5 minutes
        errorCounts.delete(k);
      }
    }
    
    // Check for error spikes
    if (count + 1 >= alertThreshold && error.statusCode >= 500) {
      logger.error('High error rate detected:', {
        statusCode: error.statusCode,
        count: count + 1,
        timeWindow: `${timeWindow / 1000}s`,
        threshold: alertThreshold
      });
      
      // Here you could send alerts to monitoring systems
      // e.g., Slack, email, PagerDuty, etc.
    }
    
    next();
  };
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validate,
  monitorErrors
};
