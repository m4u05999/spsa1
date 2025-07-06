/**
 * Authentication and Authorization Middleware
 * PDPL Compliant authentication system
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection.js';
import { logger, securityLogger } from '../utils/logger.js';
import { config } from '../config/environment.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';

/**
 * User roles and permissions
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  MEMBER: 'member',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  // User management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_ADMIN: 'users:admin',
  
  // Content management
  CONTENT_READ: 'content:read',
  CONTENT_WRITE: 'content:write',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_DELETE: 'content:delete',
  CONTENT_ADMIN: 'content:admin',
  
  // Event management
  EVENTS_READ: 'events:read',
  EVENTS_WRITE: 'events:write',
  EVENTS_DELETE: 'events:delete',
  EVENTS_ADMIN: 'events:admin',
  
  // Membership management
  MEMBERSHIP_READ: 'membership:read',
  MEMBERSHIP_WRITE: 'membership:write',
  MEMBERSHIP_DELETE: 'membership:delete',
  MEMBERSHIP_ADMIN: 'membership:admin',
  
  // System administration
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_ADMIN: 'system:admin'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.MEMBERSHIP_READ,
    PERMISSIONS.MEMBERSHIP_WRITE,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_AUDIT
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.MEMBERSHIP_READ
  ],
  
  [ROLES.MEMBER]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.MEMBERSHIP_READ
  ],
  
  [ROLES.GUEST]: [
    PERMISSIONS.CONTENT_READ
  ]
};

/**
 * Generate JWT token
 */
export const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn,
    issuer: 'spsa-backend',
    audience: 'spsa-frontend'
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, { 
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'spsa-backend',
    audience: 'spsa-frontend'
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token, secret = config.jwt.secret) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'spsa-backend',
      audience: 'spsa-frontend'
    });
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  const saltRounds = config.security.bcryptRounds;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Get user by ID with security checks
 */
const getUserById = async (userId) => {
  const result = await query(`
    SELECT 
      id, email, name, role, membership_status, 
      is_verified, is_active, last_login_at,
      failed_login_attempts, locked_until
    FROM users 
    WHERE id = $1
  `, [userId]);
  
  return result.rows[0] || null;
};

/**
 * Update user login information
 */
const updateUserLogin = async (userId, success = true) => {
  if (success) {
    await query(`
      UPDATE users 
      SET 
        last_login_at = NOW(),
        failed_login_attempts = 0,
        locked_until = NULL
      WHERE id = $1
    `, [userId]);
  } else {
    await query(`
      UPDATE users 
      SET 
        failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
        locked_until = CASE 
          WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 
          THEN NOW() + INTERVAL '15 minutes'
          ELSE locked_until
        END
      WHERE id = $1
    `, [userId]);
  }
};

/**
 * Authentication middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token required');
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await getUserById(decoded.id);
    
    if (!user) {
      securityLogger.auth('token_user_not_found', decoded.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('User not found');
    }
    
    // Check if user is active
    if (!user.is_active) {
      securityLogger.auth('inactive_user_access', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('Account is deactivated');
    }
    
    // Check if user is verified (for sensitive operations)
    if (!user.is_verified && req.path.includes('/admin')) {
      securityLogger.auth('unverified_user_admin_access', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('Account verification required');
    }
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      securityLogger.auth('locked_account_access', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        lockedUntil: user.locked_until
      });
      throw new AuthenticationError('Account is temporarily locked');
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      membershipStatus: user.membership_status,
      isVerified: user.is_verified,
      isActive: user.is_active
    };
    
    // Log successful authentication
    securityLogger.auth('token_validated', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      logger.error('Authentication error:', error);
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await getUserById(decoded.id);
      
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          membershipStatus: user.membership_status,
          isVerified: user.is_verified,
          isActive: user.is_active
        };
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Authorization middleware factory
 */
export const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    // Convert single permission to array
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // Check if user has any of the required permissions
    const hasAccess = permissions.length === 0 || 
      hasAnyPermission(req.user.role, permissions);
    
    if (!hasAccess) {
      securityLogger.authz('access_denied', req.user.id, req.path, 
        permissions.join(','), 'denied', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userRole: req.user.role
      });
      
      return next(new AuthorizationError('Insufficient permissions'));
    }
    
    // Log successful authorization
    securityLogger.authz('access_granted', req.user.id, req.path, 
      permissions.join(','), 'granted', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userRole: req.user.role
    });
    
    next();
  };
};

/**
 * Role-based authorization
 */
export const requireRole = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!roles.includes(req.user.role)) {
      securityLogger.authz('role_access_denied', req.user.id, req.path, 
        roles.join(','), 'denied', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userRole: req.user.role,
        requiredRoles: roles
      });
      
      return next(new AuthorizationError('Insufficient role privileges'));
    }
    
    next();
  };
};

/**
 * Resource ownership check
 */
export const requireOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;
    
    // Super admin and admin can access any resource
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
      return next();
    }
    
    // Check if user owns the resource or it's their own profile
    if (resourceId !== userId) {
      securityLogger.authz('ownership_check_failed', userId, req.path, 
        resourceId, 'denied', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        resourceId,
        ownerId: userId
      });
      
      return next(new AuthorizationError('Access denied: resource ownership required'));
    }
    
    next();
  };
};

/**
 * Membership status check
 */
export const requireMembership = (requiredStatuses = ['active']) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    const statuses = Array.isArray(requiredStatuses) ? requiredStatuses : [requiredStatuses];
    
    if (!statuses.includes(req.user.membershipStatus)) {
      securityLogger.authz('membership_check_failed', req.user.id, req.path, 
        statuses.join(','), 'denied', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        membershipStatus: req.user.membershipStatus,
        requiredStatuses: statuses
      });
      
      return next(new AuthorizationError('Valid membership required'));
    }
    
    next();
  };
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  generateToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  hasPermission,
  hasAnyPermission,
  authenticate,
  optionalAuth,
  authorize,
  requireRole,
  requireOwnership,
  requireMembership,
  updateUserLogin
};
