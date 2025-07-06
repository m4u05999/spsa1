/**
 * Security Middleware
 * PDPL Compliant security measures
 */

import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { body, validationResult } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import { logger, securityLogger } from '../utils/logger.js';
import { config } from '../config/environment.js';

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with '$' or contain '.'
  mongoSanitize()(req, res, () => {
    // XSS protection for string inputs
    const sanitizeObject = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key], {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
  });
};

/**
 * CSRF Protection
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and health checks
  if (req.method === 'GET' || req.path === '/health') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    securityLogger.violation('csrf_token_mismatch', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
};

/**
 * Generate CSRF token endpoint
 */
export const generateCSRFToken = (req, res) => {
  const token = require('crypto').randomBytes(32).toString('hex');
  req.session.csrfToken = token;
  
  res.json({ csrfToken: token });
};

/**
 * IP-based rate limiting with progressive delays
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = config.rateLimit.windowMs,
    max = config.rateLimit.maxRequests,
    message = 'Too many requests from this IP',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message, retryAfter: Math.ceil(windowMs / 1000) },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    
    handler: (req, res) => {
      securityLogger.violation('rate_limit_exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        limit: max,
        window: windowMs
      });

      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
        code: 'RATE_LIMIT_EXCEEDED'
      });
    },

    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
};

/**
 * Login-specific rate limiting
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: config.rateLimit.loginWindow,
  max: config.rateLimit.loginMax,
  message: 'Too many login attempts from this IP',
  skipSuccessfulRequests: true
});

/**
 * Speed limiting for suspicious behavior
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // max delay of 20 seconds
  
  onLimitReached: (req, res, options) => {
    securityLogger.violation('speed_limit_reached', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      delayMs: options.delay
    });
  }
});

/**
 * Request size limiting
 */
export const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = config.upload.maxSize;

  if (contentLength > maxSize) {
    securityLogger.violation('request_size_exceeded', {
      ip: req.ip,
      contentLength,
      maxSize,
      path: req.path
    });

    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: maxSize,
      code: 'REQUEST_TOO_LARGE'
    });
  }

  next();
};

/**
 * Suspicious activity detection
 */
const suspiciousPatterns = [
  /(\<|\%3C)script(.|\n)*?(\>|\%3E)/i, // Script injection
  /(\<|\%3C)iframe(.|\n)*?(\>|\%3E)/i, // Iframe injection
  /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i, // SQL injection
  /(\.\./|\.\.\\|\.\.%2f|\.\.%5c)/i, // Directory traversal
  /(eval|alert|confirm|prompt)\s*\(/i, // JavaScript injection
  /(\%27|\'|\%22|\")/i // Quote injection
];

export const detectSuspiciousActivity = (req, res, next) => {
  const checkString = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj, path = '') => {
    for (let key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof obj[key] === 'string') {
        if (checkString(obj[key])) {
          return currentPath;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = checkObject(obj[key], currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  // Check URL
  if (checkString(req.url)) {
    securityLogger.violation('suspicious_url', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });

    return res.status(400).json({
      error: 'Suspicious request detected',
      code: 'SUSPICIOUS_REQUEST'
    });
  }

  // Check headers
  for (let header in req.headers) {
    if (typeof req.headers[header] === 'string' && checkString(req.headers[header])) {
      securityLogger.violation('suspicious_header', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        header: header,
        path: req.path
      });

      return res.status(400).json({
        error: 'Suspicious request detected',
        code: 'SUSPICIOUS_REQUEST'
      });
    }
  }

  // Check body, query, and params
  const suspiciousField = 
    (req.body && checkObject(req.body)) ||
    (req.query && checkObject(req.query)) ||
    (req.params && checkObject(req.params));

  if (suspiciousField) {
    securityLogger.violation('suspicious_input', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      field: suspiciousField,
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      error: 'Suspicious request detected',
      code: 'SUSPICIOUS_REQUEST'
    });
  }

  next();
};

/**
 * User-Agent validation
 */
export const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent || userAgent.length < 10) {
    securityLogger.violation('invalid_user_agent', {
      ip: req.ip,
      userAgent: userAgent || 'missing',
      path: req.path
    });

    return res.status(400).json({
      error: 'Invalid or missing User-Agent header',
      code: 'INVALID_USER_AGENT'
    });
  }

  // Check for suspicious user agents
  const suspiciousAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /nmap/i,
    /masscan/i,
    /zap/i
  ];

  if (suspiciousAgents.some(pattern => pattern.test(userAgent))) {
    securityLogger.violation('suspicious_user_agent', {
      ip: req.ip,
      userAgent,
      path: req.path
    });

    return res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  }

  next();
};

/**
 * Content-Type validation
 */
export const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      
      if (!contentType) {
        return res.status(400).json({
          error: 'Content-Type header is required',
          code: 'MISSING_CONTENT_TYPE'
        });
      }

      const isAllowed = allowedTypes.some(type => 
        contentType.toLowerCase().includes(type.toLowerCase())
      );

      if (!isAllowed) {
        securityLogger.violation('invalid_content_type', {
          ip: req.ip,
          contentType,
          allowedTypes,
          path: req.path
        });

        return res.status(415).json({
          error: 'Unsupported Media Type',
          allowedTypes,
          code: 'UNSUPPORTED_MEDIA_TYPE'
        });
      }
    }

    next();
  };
};

/**
 * Combined security middleware
 */
export const securityMiddleware = [
  validateUserAgent,
  detectSuspiciousActivity,
  sanitizeInput,
  requestSizeLimit,
  validateContentType()
];

export default {
  sanitizeInput,
  csrfProtection,
  generateCSRFToken,
  createRateLimiter,
  loginRateLimiter,
  speedLimiter,
  requestSizeLimit,
  detectSuspiciousActivity,
  validateUserAgent,
  validateContentType,
  securityMiddleware
};
