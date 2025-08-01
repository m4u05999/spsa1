// src/utils/securityHelpers.js
// وظائف مساعدة للأمان والحماية

/**
 * تنظيف النص من HTML والسكريبت الضار
 * @param {string} input - النص المراد تنظيفه
 * @returns {string} - النص المنظف
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    // إزالة السكريبت
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // إزالة الأحداث JavaScript
    .replace(/\s*on\w+\s*=\s*[^>]*/gi, '')
    // إزالة javascript: protocols  
    .replace(/javascript:/gi, '')
    // إزالة data: protocols للصور المشبوهة
    .replace(/data:(?!image\/(png|jpe?g|gif|svg))[^;]*;/gi, '')
    // إزالة vbscript:
    .replace(/vbscript:/gi, '')
    // تنظيف عام للتاغات الضارة
    .replace(/<(script|object|embed|link|meta|style)[^>]*>/gi, '')
    .trim();
};

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - صحة البريد الإلكتروني
 */
export const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * التحقق من صحة معرف فريد
 * @param {any} id - المعرف
 * @returns {boolean} - صحة المعرف
 */
export const validateId = (id) => {
  if (typeof id === 'string') {
    // للمعرفات النصية (UUID, etc.)
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length >= 1 && id.length <= 50;
  }
  
  if (typeof id === 'number') {
    // للمعرفات الرقمية
    return Number.isInteger(id) && id > 0 && id <= Number.MAX_SAFE_INTEGER;
  }
  
  return false;
};

/**
 * التحقق من صحة الدور
 * @param {string} role - الدور
 * @returns {boolean} - صحة الدور
 */
export const validateRole = (role) => {
  const validRoles = ['admin', 'staff', 'member'];
  return typeof role === 'string' && validRoles.includes(role);
};

/**
 * تنظيف اسم الملف من الأحرف الضارة
 * @param {string} filename - اسم الملف
 * @returns {string} - اسم الملف المنظف
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return 'file';
  
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // إزالة الأحرف الضارة
    .replace(/^\.+/, '') // إزالة النقاط من البداية
    .replace(/\.+$/, '') // إزالة النقاط من النهاية
    .substring(0, 255) || 'file'; // الحد الأقصى لطول اسم الملف
};

/**
 * التحقق من أن القيمة رقم آمن
 * @param {any} value - القيمة
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأقصى
 * @returns {boolean} - صحة الرقم
 */
export const validateNumber = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max;
};

/**
 * تنظيف البيانات من الحقول الحساسة
 * @param {object} data - البيانات
 * @param {array} sensitiveFields - قائمة الحقول الحساسة
 * @returns {object} - البيانات المنظفة
 */
export const removeSensitiveFields = (data, sensitiveFields = []) => {
  if (!data || typeof data !== 'object') return {};
  
  const defaultSensitiveFields = [
    'password', 'passwordHash', 'salt', 'secret', 'token', 'accessToken',
    'refreshToken', 'apiKey', 'privateKey', 'sessionId', 'otp', 'twoFactorSecret',
    'socialSecurityNumber', 'nationalId', 'bankAccount', 'creditCard'
  ];
  
  const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
  const cleaned = { ...data };
  
  allSensitiveFields.forEach(field => {
    if (cleaned.hasOwnProperty(field)) {
      delete cleaned[field];
    }
  });
  
  return cleaned;
};

/**
 * تشفير بسيط للبيانات الحساسة في localStorage
 * @param {string} key - المفتاح
 * @param {string} value - القيمة
 */
export const setSecureLocalStorage = (key, value) => {
  try {
    // تشفير بسيط (لا يجب الاعتماد عليه للبيانات الحساسة جداً)
    const encrypted = btoa(encodeURIComponent(JSON.stringify(value)));
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('خطأ في حفظ البيانات الآمنة:', error);
  }
};

/**
 * قراءة البيانات المشفرة من localStorage
 * @param {string} key - المفتاح
 * @returns {any} - القيمة المفكوكة التشفير
 */
export const getSecureLocalStorage = (key) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = JSON.parse(decodeURIComponent(atob(encrypted)));
    return decrypted;
  } catch (error) {
    console.error('خطأ في قراءة البيانات الآمنة:', error);
    return null;
  }
};

/**
 * التحقق من أن URL آمن للإعادة التوجيه
 * @param {string} url - الرابط
 * @returns {boolean} - أمان الرابط
 */
export const isSafeRedirectUrl = (url) => {
  if (typeof url !== 'string') return false;
  
  // السماح بالروابط النسبية والمحلية فقط
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }
  
  // التحقق من أن الرابط من نفس النطاق
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * تحديد معدل الطلبات البسيط (Rate Limiting)
 */
class SimpleRateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // إزالة الطلبات القديمة
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

export const rateLimiter = new SimpleRateLimiter();

/**
 * فحص CSRF Token بسيط
 * @param {string} token - الرمز المميز
 * @returns {boolean} - صحة الرمز
 */
export const validateCSRFToken = (token) => {
  // هذا مثال بسيط - في الإنتاج يجب استخدام مكتبة CSRF مخصصة
  const storedToken = sessionStorage.getItem('csrf_token');
  return typeof token === 'string' && token === storedToken && token.length >= 32;
};

/**
 * إنشاء CSRF Token
 * @returns {string} - الرمز المميز
 */
export const generateCSRFToken = () => {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem('csrf_token', token);
  return token;
};