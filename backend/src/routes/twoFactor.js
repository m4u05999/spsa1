/**
 * Two-Factor Authentication Routes
 * مسارات المصادقة الثنائية - متوافقة مع معايير OWASP
 * 
 * Features:
 * - Setup 2FA (app/SMS)
 * - Enable/Disable 2FA
 * - Verify 2FA codes
 * - Manage backup codes
 * - Rate limiting and security
 * - Comprehensive audit logging
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requireRole, ROLES } from '../middleware/auth.js';
import { 
  ValidationError, 
  SecurityError, 
  asyncHandler 
} from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { rateLimiter } from '../middleware/security.js';
import { auditMiddleware, logAuditEvent } from '../middleware/audit.js';
import { twoFactorService } from '../services/twoFactorService.js';
import { logger, securityLogger } from '../utils/logger.js';

const router = express.Router();

/**
 * Rate limiting configurations
 * إعدادات تحديد المعدل
 */
const twoFactorRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10, // 10 محاولات لكل IP
  message: {
    error: 'تم تجاوز عدد المحاولات المسموح',
    message: 'حاول مرة أخرى بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const verificationRateLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 5, // 5 محاولات للتحقق
  message: {
    error: 'تم تجاوز عدد محاولات التحقق',
    message: 'حاول مرة أخرى بعد 5 دقائق'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Validation schemas
 * مخططات التحقق
 */
const setupValidation = [
  body('method')
    .isIn(['app', 'sms'])
    .withMessage('طريقة 2FA يجب أن تكون app أو sms'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('رقم الهاتف غير صحيح'),
  body('phoneNumber')
    .if(body('method').equals('sms'))
    .notEmpty()
    .withMessage('رقم الهاتف مطلوب للـ SMS')
];

const verificationValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('رمز التحقق يجب أن يكون 6 أرقام'),
  body('method')
    .optional()
    .isIn(['app', 'sms', 'backup'])
    .withMessage('طريقة التحقق غير صحيحة')
];

/**
 * GET /api/auth/2fa/status
 * الحصول على حالة 2FA للمستخدم
 */
router.get('/status',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const status = await twoFactorService.getUserTwoFactorStatus(userId);
    
    res.json({
      success: true,
      data: status
    });
  })
);

/**
 * POST /api/auth/2fa/setup
 * إعداد 2FA للمستخدم
 */
router.post('/setup',
  authenticate,
  twoFactorRateLimiter,
  setupValidation,
  validateRequest,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { method, phoneNumber } = req.body;
    
    const result = await twoFactorService.setupTwoFactor(userId, method, phoneNumber);
    
    // تسجيل الحدث الأمني
    securityLogger.security('2fa_setup_initiated', userId, {
      method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: result.data,
      message: 'تم بدء إعداد المصادقة الثنائية'
    });
  })
);

/**
 * POST /api/auth/2fa/verify-setup
 * التحقق من إعداد 2FA وتفعيله
 */
router.post('/verify-setup',
  authenticate,
  verificationRateLimiter,
  verificationValidation,
  validateRequest,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;
    
    const result = await twoFactorService.enableTwoFactor(userId, code);
    
    // تسجيل الحدث الأمني
    securityLogger.security('2fa_enabled', userId, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: result.data,
      message: 'تم تفعيل المصادقة الثنائية بنجاح'
    });
  })
);

/**
 * POST /api/auth/2fa/verify
 * التحقق من رمز 2FA
 */
router.post('/verify',
  authenticate,
  verificationRateLimiter,
  verificationValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code, method } = req.body;
    
    const result = await twoFactorService.verifyCode(userId, code, method);
    
    // تسجيل الحدث الأمني
    securityLogger.security('2fa_verification_success', userId, {
      method: result.data.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: result.data,
      message: 'تم التحقق بنجاح'
    });
  })
);

/**
 * POST /api/auth/2fa/disable
 * إلغاء تفعيل 2FA
 */
router.post('/disable',
  authenticate,
  verificationRateLimiter,
  verificationValidation,
  validateRequest,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { code } = req.body;
    
    const result = await twoFactorService.disableTwoFactor(userId, code);
    
    // تسجيل الحدث الأمني
    securityLogger.security('2fa_disabled', userId, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: result.data,
      message: 'تم إلغاء تفعيل المصادقة الثنائية'
    });
  })
);

/**
 * GET /api/auth/2fa/backup-codes
 * الحصول على رموز النسخ الاحتياطي
 */
router.get('/backup-codes',
  authenticate,
  twoFactorRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // التحقق من تفعيل 2FA
    const status = await twoFactorService.getUserTwoFactorStatus(userId);
    if (!status.isEnabled) {
      throw new ValidationError('المصادقة الثنائية غير مفعلة');
    }
    
    const backupCodes = await twoFactorService.generateBackupCodes(userId);
    
    // تسجيل الحدث الأمني
    securityLogger.security('2fa_backup_codes_generated', userId, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: {
        backupCodes,
        count: backupCodes.length,
        message: 'احفظ هذه الرموز في مكان آمن - لن يتم عرضها مرة أخرى'
      }
    });
  })
);

/**
 * POST /api/auth/2fa/send-sms
 * إرسال رمز SMS
 */
router.post('/send-sms',
  authenticate,
  rateLimiter({
    windowMs: 60 * 1000, // دقيقة واحدة
    max: 3, // 3 رسائل في الدقيقة
    message: {
      error: 'تم تجاوز عدد رسائل SMS المسموح',
      message: 'حاول مرة أخرى بعد دقيقة'
    }
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await twoFactorService.sendSMSCode(userId);
    
    // تسجيل الحدث
    await logAuditEvent({
      userId,
      action: 'sms_code_sent',
      resourceType: 'user_2fa_settings',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: result.data,
      message: 'تم إرسال رمز التحقق'
    });
  })
);

/**
 * GET /api/auth/2fa/qr-code
 * الحصول على QR Code للتطبيق
 */
router.get('/qr-code',
  authenticate,
  twoFactorRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // التحقق من وجود إعدادات 2FA
    const settings = await twoFactorService.getUserTwoFactorSettings(userId);
    if (!settings || settings.is_enabled) {
      throw new ValidationError('لا يمكن الحصول على QR Code');
    }
    
    if (settings.method !== 'app') {
      throw new ValidationError('QR Code متاح فقط للتطبيقات');
    }
    
    // إنشاء QR Code جديد
    const result = await twoFactorService.setupTwoFactor(userId, 'app');
    
    res.json({
      success: true,
      data: {
        qrCodeUrl: result.data.qrCodeUrl,
        secret: result.data.secret,
        message: 'امسح الرمز بتطبيق المصادقة'
      }
    });
  })
);

/**
 * GET /api/auth/2fa/recovery-codes
 * الحصول على عدد رموز النسخ الاحتياطي المتبقية
 */
router.get('/recovery-codes',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const status = await twoFactorService.getUserTwoFactorStatus(userId);
    
    res.json({
      success: true,
      data: {
        hasBackupCodes: status.hasBackupCodes,
        backupCodesCount: status.backupCodesCount,
        isEnabled: status.isEnabled
      }
    });
  })
);

/**
 * POST /api/auth/2fa/test-verify
 * اختبار التحقق (للتطوير فقط)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test-verify',
    authenticate,
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
    validateRequest,
    asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const { code } = req.body;
      
      // للتطوير: قبول أي رمز صحيح
      const isValid = /^\d{6}$/.test(code);
      
      res.json({
        success: true,
        data: {
          isValid,
          code,
          message: isValid ? 'رمز صحيح' : 'رمز غير صحيح'
        }
      });
    })
  );
}

/**
 * Admin routes - إدارة 2FA للمستخدمين
 */

/**
 * GET /api/auth/2fa/admin/users
 * الحصول على إحصائيات 2FA للمستخدمين (للمشرفين)
 */
router.get('/admin/users',
  authenticate,
  requireRole([ROLES.ADMIN]),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        tfa.is_enabled,
        tfa.method,
        tfa.created_at as setup_date,
        tfa.last_verified_at,
        (
          SELECT COUNT(*) 
          FROM user_2fa_backup_codes bc 
          WHERE bc.user_id = u.id AND bc.is_used = false AND bc.expires_at > NOW()
        ) as backup_codes_count
      FROM users u
      LEFT JOIN user_2fa_settings tfa ON u.id = tfa.user_id
      WHERE u.is_active = true
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const totalResult = await query(`
      SELECT COUNT(*) as total FROM users WHERE is_active = true
    `);
    
    const total = parseInt(totalResult.rows[0].total);
    
    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * POST /api/auth/2fa/admin/force-disable/:userId
 * إجبار إلغاء تفعيل 2FA لمستخدم (للمشرفين)
 */
router.post('/admin/force-disable/:userId',
  authenticate,
  requireRole([ROLES.ADMIN]),
  param('userId').isUUID(),
  validateRequest,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const adminId = req.user.id;
    
    // إلغاء تفعيل 2FA
    await query(`
      UPDATE user_2fa_settings 
      SET is_enabled = false,
          last_modified_by = $1,
          updated_at = NOW()
      WHERE user_id = $2
    `, [adminId, userId]);
    
    // حذف رموز النسخ الاحتياطي
    await query(`
      DELETE FROM user_2fa_backup_codes 
      WHERE user_id = $1
    `, [userId]);
    
    // تسجيل الحدث الأمني
    await logAuditEvent({
      userId: adminId,
      action: 'admin_force_disable_2fa',
      resourceType: 'user_2fa_settings',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { targetUserId: userId }
    });
    
    securityLogger.security('2fa_force_disabled_by_admin', userId, {
      adminId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      message: 'تم إلغاء تفعيل المصادقة الثنائية للمستخدم'
    });
  })
);

/**
 * GET /api/auth/2fa/admin/stats
 * إحصائيات 2FA العامة (للمشرفين)
 */
router.get('/admin/stats',
  authenticate,
  requireRole([ROLES.ADMIN]),
  asyncHandler(async (req, res) => {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN tfa.is_enabled = true THEN 1 END) as enabled_2fa,
        COUNT(CASE WHEN tfa.method = 'app' THEN 1 END) as app_method,
        COUNT(CASE WHEN tfa.method = 'sms' THEN 1 END) as sms_method,
        COUNT(CASE WHEN tfa.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_setups
      FROM users u
      LEFT JOIN user_2fa_settings tfa ON u.id = tfa.user_id
      WHERE u.is_active = true
    `);
    
    const stats = statsResult.rows[0];
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(stats.total_users),
        enabled2FA: parseInt(stats.enabled_2fa),
        appMethod: parseInt(stats.app_method),
        smsMethod: parseInt(stats.sms_method),
        recentSetups: parseInt(stats.recent_setups),
        adoptionRate: stats.total_users > 0 ? 
          (stats.enabled_2fa / stats.total_users * 100).toFixed(2) : 0
      }
    });
  })
);

/**
 * Error handling middleware
 * middleware معالجة الأخطاء
 */
router.use((error, req, res, next) => {
  // تسجيل الخطأ
  logger.error('خطأ في مسارات 2FA:', {
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // إرجاع رسالة خطأ آمنة
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'بيانات غير صحيحة',
      message: error.message
    });
  }
  
  if (error instanceof SecurityError) {
    return res.status(403).json({
      success: false,
      error: 'خطأ أمني',
      message: error.message
    });
  }
  
  // خطأ عام
  res.status(500).json({
    success: false,
    error: 'خطأ في الخادم',
    message: 'حدث خطأ غير متوقع'
  });
});

export default router; 