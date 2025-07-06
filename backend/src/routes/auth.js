/**
 * Authentication Routes
 * PDPL Compliant authentication endpoints
 */

import express from 'express';
import { body } from 'express-validator';
import { query } from '../database/connection.js';
import { logger, securityLogger, auditLogger } from '../utils/logger.js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyToken, 
  hashPassword, 
  comparePassword,
  updateUserLogin,
  authenticate,
  optionalAuth
} from '../middleware/auth.js';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  asyncHandler 
} from '../middleware/errorHandler.js';
import { loginRateLimiter } from '../middleware/security.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = express.Router();

/**
 * Validation schemas
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be boolean')
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  body('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Valid Saudi phone number is required'),
  body('specialization')
    .optional()
    .isLength({ max: 255 })
    .trim(),
  body('workplace')
    .optional()
    .isLength({ max: 255 })
    .trim(),
  body('consentToDataProcessing')
    .isBoolean()
    .custom((value) => {
      if (!value) {
        throw new Error('Consent to data processing is required');
      }
      return true;
    })
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must meet security requirements'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password confirmation does not match');
      }
      return true;
    })
];

/**
 * Helper function to get user by email
 */
const getUserByEmail = async (email) => {
  const result = await query(`
    SELECT 
      id, email, name, password_hash, role, membership_status,
      is_verified, is_active, failed_login_attempts, locked_until,
      created_at, last_login_at
    FROM users 
    WHERE email = $1
  `, [email]);
  
  return result.rows[0] || null;
};

/**
 * POST /api/auth/login
 * User login with security measures
 */
router.post('/login', 
  loginRateLimiter,
  loginValidation,
  asyncHandler(async (req, res) => {
    const { email, password, rememberMe = false } = req.body;
    
    // Get user
    const user = await getUserByEmail(email);
    
    if (!user) {
      securityLogger.auth('login_failed_user_not_found', null, {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      securityLogger.auth('login_failed_account_locked', user.id, {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        lockedUntil: user.locked_until
      });
      
      throw new AuthenticationError('Account is temporarily locked due to multiple failed login attempts');
    }
    
    // Check if account is active
    if (!user.is_active) {
      securityLogger.auth('login_failed_account_inactive', user.id, {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      throw new AuthenticationError('Account is deactivated');
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      // Update failed login attempts
      await updateUserLogin(user.id, false);
      
      securityLogger.auth('login_failed_invalid_password', user.id, {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        failedAttempts: (user.failed_login_attempts || 0) + 1
      });
      
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const expiresIn = rememberMe ? '30d' : '24h';
    const accessToken = generateToken(tokenPayload, expiresIn);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Update successful login
    await updateUserLogin(user.id, true);
    
    // Log successful login
    securityLogger.auth('login_successful', user.id, {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      rememberMe
    });
    
    // Audit log
    await logAuditEvent({
      userId: user.id,
      action: 'login',
      resourceType: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { rememberMe }
    });
    
    // Log consent for data processing
    auditLogger.consent(user.id, 'login_data_processing', true, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipStatus: user.membership_status,
        isVerified: user.is_verified
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn
      }
    });
  })
);

/**
 * POST /api/auth/register
 * User registration with PDPL compliance
 */
router.post('/register',
  registerValidation,
  asyncHandler(async (req, res) => {
    const { 
      email, 
      name, 
      password, 
      phone, 
      specialization, 
      workplace,
      consentToDataProcessing 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const result = await query(`
      INSERT INTO users (
        email, name, password_hash, phone, specialization, workplace,
        role, membership_status, is_verified, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, email, name, role, membership_status, is_verified, created_at
    `, [
      email, 
      name, 
      passwordHash, 
      phone || null, 
      specialization || null, 
      workplace || null,
      'member', // Default role
      'pending', // Default membership status
      false, // Requires verification
      true // Active by default
    ]);
    
    const newUser = result.rows[0];
    
    // Log registration
    securityLogger.auth('registration_successful', newUser.id, {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Audit log
    await logAuditEvent({
      userId: newUser.id,
      action: 'register',
      resourceType: 'user',
      resourceId: newUser.id,
      newValues: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { consentToDataProcessing }
    });
    
    // Log consent
    auditLogger.consent(newUser.id, 'data_processing', consentToDataProcessing, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      purpose: 'membership_management'
    });
    
    res.status(201).json({
      message: 'Registration successful. Please verify your email address.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        membershipStatus: newUser.membership_status,
        isVerified: newUser.is_verified
      }
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }
    
    try {
      const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await getUserByEmail(decoded.email);
      
      if (!user || !user.is_active) {
        throw new AuthenticationError('Invalid refresh token');
      }
      
      // Generate new access token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      
      const accessToken = generateToken(tokenPayload);
      
      securityLogger.auth('token_refreshed', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        accessToken,
        expiresIn: '24h'
      });
      
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  })
);

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // Log logout
    securityLogger.auth('logout_successful', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Audit log
    await logAuditEvent({
      userId: req.user.id,
      action: 'logout',
      resourceType: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Logout successful' });
  })
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password',
  authenticate,
  changePasswordValidation,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Get current user data
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      securityLogger.auth('password_change_failed_invalid_current', userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      throw new AuthenticationError('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
    
    // Log password change
    securityLogger.auth('password_changed', userId, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Audit log
    await logAuditEvent({
      userId,
      action: 'password_change',
      resourceType: 'user',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Password changed successfully' });
  })
);

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(`
      SELECT 
        id, email, name, role, membership_status, 
        is_verified, is_active, created_at, last_login_at,
        phone, specialization, workplace, bio
      FROM users 
      WHERE id = $1
    `, [req.user.id]);
    
    const user = result.rows[0];
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipStatus: user.membership_status,
        isVerified: user.is_verified,
        isActive: user.is_active,
        phone: user.phone,
        specialization: user.specialization,
        workplace: user.workplace,
        bio: user.bio,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      }
    });
  })
);

export default router;
