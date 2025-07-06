// src/utils/security.js
/**
 * أدوات الأمان والحماية
 * Security utilities and protection tools
 */

/**
 * Content Security Policy configuration
 * إعدادات سياسة أمان المحتوى
 */
export const CSP_CONFIG = {
  // Production CSP - strict security
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for React inline styles - will be removed in future
      "https://cdnjs.cloudflare.com",
      "https://unpkg.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS libraries
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdnjs.cloudflare.com",
      "data:"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https://images.unsplash.com",
      "https:",
      "blob:"
    ],
    'connect-src': [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com",
      "https://api.political-science-assoc.com"
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': true
  },
  
  // Development CSP - more permissive for development
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Required for development tools
      "https://cdnjs.cloudflare.com",
      "http://localhost:*",
      "ws://localhost:*"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdnjs.cloudflare.com",
      "data:"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https://images.unsplash.com",
      "https:",
      "http:",
      "blob:"
    ],
    'connect-src': [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com",
      "http://localhost:*",
      "ws://localhost:*",
      "https://api.political-science-assoc.com"
    ],
    'frame-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

/**
 * Generate CSP header string
 * إنشاء نص header لسياسة أمان المحتوى
 */
export const generateCSPHeader = (environment = 'production') => {
  const config = CSP_CONFIG[environment] || CSP_CONFIG.production;
  
  return Object.entries(config)
    .map(([directive, sources]) => {
      if (typeof sources === 'boolean') {
        return sources ? directive : '';
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
};

/**
 * Security headers configuration
 * إعدادات headers الأمان
 */
export const SECURITY_HEADERS = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

/**
 * Sanitize HTML content to prevent XSS
 * تنظيف محتوى HTML لمنع هجمات XSS
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return '';
  
  // Basic HTML sanitization - remove dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:(?!image\/)/gi, ''); // Allow only image data URLs
};

/**
 * Validate and sanitize user input
 * التحقق من صحة وتنظيف مدخلات المستخدم
 */
export const sanitizeInput = (input, type = 'text') => {
  if (typeof input !== 'string') return '';

  switch (type) {
    case 'email':
      return input.toLowerCase().trim().replace(/[^\w@.-]/g, '');

    case 'phone':
      return input.replace(/[^\d+()-\s]/g, '');

    case 'name':
      return input.trim().replace(/[<>\"'&]/g, '').replace(/<[^>]*>/g, '');

    case 'text':
    default:
      return input.trim().replace(/[<>\"'&]/g, (match) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[match];
      });
  }
};

/**
 * Generate secure random string
 * إنشاء نص عشوائي آمن
 */
export const generateSecureToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * CSRF token management
 * إدارة رموز CSRF
 */
export const CSRFManager = {
  TOKEN_KEY: 'csrf_token',

  // Generate CSRF token
  generateToken() {
    const token = generateSecureToken(32);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    return token;
  },

  // Get current CSRF token
  getToken() {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  },

  // Validate CSRF token
  validateToken(token) {
    const storedToken = this.getToken();
    return storedToken && storedToken === token;
  },

  // Clear CSRF token
  clearToken() {
    console.log('🔑 CSRFManager: Clearing CSRF token...');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
      console.log('✅ CSRFManager: CSRF token cleared from sessionStorage');
    } else {
      console.log('⚠️ CSRFManager: sessionStorage not available');
    }
  }
};

/**
 * Rate limiting utility
 * أداة تحديد معدل الطلبات
 */
export const RateLimiter = {
  attempts: new Map(),
  
  // Check if action is allowed
  isAllowed(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  },
  
  // Reset attempts for a key
  reset(key) {
    this.attempts.delete(key);
  }
};

/**
 * Password strength validator
 * مدقق قوة كلمة المرور
 */
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;
  
  return {
    isValid: score >= 4,
    score,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};
