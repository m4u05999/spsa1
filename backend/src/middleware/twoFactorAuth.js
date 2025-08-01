/**
 * Two-Factor Authentication Middleware
 * middleware المصادقة الثنائية
 * 
 * Handles 2FA verification requirements for protected routes
 */

import { query } from '../database/connection.js';
import { SecurityError, AuthenticationError } from './errorHandler.js';
import { securityLogger } from '../utils/logger.js';
import { twoFactorService } from '../services/twoFactorService.js';

/**
 * Check if user has 2FA enabled
 * التحقق من تفعيل 2FA للمستخدم
 */
export const checkTwoFactorEnabled = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    const settings = await twoFactorService.getUserTwoFactorSettings(userId);
    
    // إضافة معلومات 2FA إلى الطلب
    req.user.twoFactorEnabled = settings?.is_enabled || false;
    req.user.twoFactorMethod = settings?.method || null;
    req.user.twoFactorRequired = false;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require 2FA for sensitive operations
 * إجبار 2FA للعمليات الحساسة
 */
export const requireTwoFactor = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    const settings = await twoFactorService.getUserTwoFactorSettings(userId);
    
    if (!settings || !settings.is_enabled) {
      throw new SecurityError('المصادقة الثنائية مطلوبة للوصول إلى هذه الميزة');
    }
    
    // التحقق من التحقق الأخير
    const lastVerified = settings.last_verified_at;
    const now = new Date();
    const timeDiff = now - new Date(lastVerified);
    const sessionTimeout = 30 * 60 * 1000; // 30 دقيقة
    
    if (!lastVerified || timeDiff > sessionTimeout) {
      throw new SecurityError('يجب التحقق من رمز 2FA للمتابعة');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require 2FA for admin operations
 * إجبار 2FA للعمليات الإدارية
 */
export const requireTwoFactorForAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    // التحقق من الدور
    if (!['admin', 'super_admin'].includes(userRole)) {
      return next();
    }
    
    // التحقق من إعدادات النظام
    const systemSettings = await query(`
      SELECT value FROM settings 
      WHERE key = '2fa_required_for_admins'
    `);
    
    const requireAdminTwoFactor = systemSettings.rows[0]?.value === 'true';
    
    if (!requireAdminTwoFactor) {
      return next();
    }
    
    // التحقق من تفعيل 2FA للمشرف
    const settings = await twoFactorService.getUserTwoFactorSettings(userId);
    
    if (!settings || !settings.is_enabled) {
      throw new SecurityError('المصادقة الثنائية مطلوبة للمشرفين');
    }
    
    // التحقق من التحقق الأخير
    const lastVerified = settings.last_verified_at;
    const now = new Date();
    const timeDiff = now - new Date(lastVerified);
    const sessionTimeout = 15 * 60 * 1000; // 15 دقيقة للمشرفين
    
    if (!lastVerified || timeDiff > sessionTimeout) {
      throw new SecurityError('يجب التحقق من رمز 2FA للمتابعة');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enhanced login with 2FA support
 * تسجيل دخول محسن مع دعم 2FA
 */
export const enhancedLogin = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode, twoFactorMethod } = req.body;
    
    if (!email || !password) {
      throw new AuthenticationError('البريد الإلكتروني وكلمة المرور مطلوبان');
    }
    
    // التحقق من بيانات الاعتماد الأساسية
    const userResult = await query(`
      SELECT id, email, name, role, password_hash, is_active, is_verified,
             failed_login_attempts, locked_until, last_login_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);
    
    if (userResult.rows.length === 0) {
      throw new AuthenticationError('بيانات الاعتماد غير صحيحة');
    }
    
    const user = userResult.rows[0];
    
    // التحقق من قفل الحساب
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new SecurityError('الحساب مقفل مؤقتاً');
    }
    
    // التحقق من كلمة المرور
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      // تسجيل محاولة فاشلة
      await updateFailedLoginAttempts(user.id);
      
      securityLogger.auth('login_failed', user.id, {
        reason: 'invalid_password',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      throw new AuthenticationError('بيانات الاعتماد غير صحيحة');
    }
    
    // التحقق من إعدادات 2FA
    const twoFactorSettings = await twoFactorService.getUserTwoFactorSettings(user.id);
    
    if (twoFactorSettings && twoFactorSettings.is_enabled) {
      // 2FA مفعل - يجب التحقق من الرمز
      if (!twoFactorCode) {
        // إنشاء جلسة مؤقتة
        const tempSession = await twoFactorService.createTempSession(user.id, {
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }, twoFactorSettings.method);
        
        return res.json({
          success: false,
          requiresTwoFactor: true,
          method: twoFactorSettings.method,
          sessionToken: tempSession.data.sessionToken,
          message: 'مطلوب رمز التحقق الثنائي'
        });
      }
      
      // التحقق من رمز 2FA
      const verificationResult = await twoFactorService.verifyCode(
        user.id, 
        twoFactorCode, 
        twoFactorMethod || twoFactorSettings.method,
        true // isLogin
      );
      
      if (!verificationResult.success) {
        throw new SecurityError('رمز التحقق الثنائي غير صحيح');
      }
    }
    
    // تسجيل دخول ناجح
    await updateUserLogin(user.id, req.ip, req.get('User-Agent'));
    
    // إنشاء الرموز المميزة
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // تسجيل الحدث الأمني
    securityLogger.auth('login_success', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      twoFactorUsed: !!(twoFactorSettings && twoFactorSettings.is_enabled)
    });
    
    // إضافة معلومات إضافية للطلب
    req.loginResult = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified,
        lastLogin: user.last_login_at,
        twoFactorEnabled: !!(twoFactorSettings && twoFactorSettings.is_enabled)
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if 2FA is required for current user
 * التحقق من ضرورة 2FA للمستخدم الحالي
 */
export const checkTwoFactorRequired = async (userId, operation = 'general') => {
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    // التحقق من إعدادات النظام
    const systemSettings = await query(`
      SELECT key, value FROM settings 
      WHERE key IN ('2fa_required_for_admins', '2fa_enabled')
    `);
    
    const settings = {};
    systemSettings.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    if (settings['2fa_enabled'] !== 'true') {
      return false;
    }
    
    // التحقق من المشرفين
    if (['admin', 'super_admin'].includes(user.role) && 
        settings['2fa_required_for_admins'] === 'true') {
      return true;
    }
    
    // التحقق من العمليات الحساسة
    const sensitiveOperations = [
      'delete_user',
      'modify_permissions',
      'system_settings',
      'admin_actions'
    ];
    
    if (sensitiveOperations.includes(operation)) {
      return true;
    }
    
    return false;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate 2FA session token
 * التحقق من رمز جلسة 2FA
 */
export const validateTwoFactorSession = async (sessionToken) => {
  try {
    const sessionResult = await query(`
      SELECT id, user_id, login_data, verification_method, 
             attempts_count, max_attempts, expires_at, is_completed
      FROM user_2fa_temp_sessions
      WHERE session_token = $1 AND is_completed = false
    `, [sessionToken]);
    
    if (sessionResult.rows.length === 0) {
      throw new SecurityError('جلسة 2FA غير صحيحة');
    }
    
    const session = sessionResult.rows[0];
    
    // التحقق من انتهاء الصلاحية
    if (new Date(session.expires_at) < new Date()) {
      throw new SecurityError('انتهت صلاحية جلسة 2FA');
    }
    
    // التحقق من عدد المحاولات
    if (session.attempts_count >= session.max_attempts) {
      throw new SecurityError('تم تجاوز عدد المحاولات المسموح');
    }
    
    return session;
  } catch (error) {
    throw error;
  }
};

/**
 * Clean up expired 2FA sessions
 * تنظيف جلسات 2FA منتهية الصلاحية
 */
export const cleanupExpiredSessions = async () => {
  try {
    const result = await query(`
      DELETE FROM user_2fa_temp_sessions
      WHERE expires_at < NOW() OR is_completed = true
    `);
    
    return result.rowCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to get user by ID
 * دالة مساعدة للحصول على المستخدم
 */
const getUserById = async (userId) => {
  try {
    const result = await query(`
      SELECT id, email, name, role, is_active, is_verified
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to update failed login attempts
 * دالة مساعدة لتحديث محاولات تسجيل الدخول الفاشلة
 */
const updateFailedLoginAttempts = async (userId) => {
  try {
    await query(`
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
            ELSE locked_until
          END
      WHERE id = $1
    `, [userId]);
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to update user login
 * دالة مساعدة لتحديث تسجيل دخول المستخدم
 */
const updateUserLogin = async (userId, ipAddress, userAgent) => {
  try {
    await query(`
      UPDATE users 
      SET last_login_at = NOW(),
          failed_login_attempts = 0,
          locked_until = NULL
      WHERE id = $1
    `, [userId]);
    
    // تسجيل في سجل المراجعة
    await query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, user_agent)
      VALUES ($1, 'login', 'users', $1, $2, $3)
    `, [userId, ipAddress, userAgent]);
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to generate JWT token
 * دالة مساعدة لإنشاء رمز JWT
 */
const generateToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

/**
 * Helper function to generate refresh token
 * دالة مساعدة لإنشاء رمز التحديث
 */
const generateRefreshToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: user.id, 
      type: 'refresh' 
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
    }
  );
};

/**
 * Helper function to compare password
 * دالة مساعدة لمقارنة كلمة المرور
 */
const comparePassword = async (password, hash) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
}; 