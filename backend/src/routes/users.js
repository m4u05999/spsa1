/**
 * User Management Routes - SPSA
 * مسارات إدارة المستخدمين - الجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - User CRUD operations
 * - Role and permission management
 * - Membership management
 * - Profile management
 * - PDPL compliant data handling
 * - Advanced filtering and search
 */

import express from 'express';
import { body, query, param } from 'express-validator';
import { query as dbQuery } from '../database/connection.js';
import { 
  authenticate, 
  authorize, 
  requireRole, 
  requireOwnership,
  ROLES, 
  PERMISSIONS,
  hashPassword 
} from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError, ConflictError } from '../middleware/errorHandler.js';
import { auditMiddleware, logAuditEvent } from '../middleware/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const createUserValidation = [
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
  body('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Valid Saudi phone number is required'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role'),
  body('specialization')
    .optional()
    .isLength({ max: 255 })
    .trim(),
  body('academic_degree')
    .optional()
    .isLength({ max: 100 })
    .trim(),
  body('workplace')
    .optional()
    .isLength({ max: 255 })
    .trim(),
  body('membership_type')
    .optional()
    .isIn(['regular', 'student', 'honorary', 'associate'])
    .withMessage('Invalid membership type')
];

const updateUserValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Valid Saudi phone number is required'),
  body('specialization')
    .optional()
    .isLength({ max: 255 })
    .trim(),
  body('academic_degree')
    .optional()
    .isLength({ max: 100 })
    .trim(),
  body('workplace')
    .optional()
    .isLength({ max: 255 })
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .trim(),
  body('social_links')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object')
];

const userQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role'),
  query('membership_status')
    .optional()
    .isIn(['active', 'pending', 'suspended', 'expired'])
    .withMessage('Invalid membership status'),
  query('membership_type')
    .optional()
    .isIn(['regular', 'student', 'honorary', 'associate'])
    .withMessage('Invalid membership type'),
  query('is_verified')
    .optional()
    .isBoolean()
    .withMessage('is_verified must be boolean'),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be boolean'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  query('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'last_login_at', 'name', 'email'])
    .withMessage('Invalid sort field'),
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Helper function to build user search query
 */
const buildUserSearchQuery = (filters) => {
  let whereClause = 'WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.role) {
    whereClause += ` AND role = $${paramIndex}`;
    params.push(filters.role);
    paramIndex++;
  }

  if (filters.membership_status) {
    whereClause += ` AND membership_status = $${paramIndex}`;
    params.push(filters.membership_status);
    paramIndex++;
  }

  if (filters.membership_type) {
    whereClause += ` AND membership_type = $${paramIndex}`;
    params.push(filters.membership_type);
    paramIndex++;
  }

  if (filters.is_verified !== undefined) {
    whereClause += ` AND is_verified = $${paramIndex}`;
    params.push(filters.is_verified);
    paramIndex++;
  }

  if (filters.is_active !== undefined) {
    whereClause += ` AND is_active = $${paramIndex}`;
    params.push(filters.is_active);
    paramIndex++;
  }

  if (filters.search) {
    whereClause += ` AND (
      name ILIKE $${paramIndex} OR 
      email ILIKE $${paramIndex} OR 
      specialization ILIKE $${paramIndex} OR
      workplace ILIKE $${paramIndex}
    )`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  return { whereClause, params, paramIndex };
};

/**
 * GET /api/users
 * Get users list with filtering and pagination
 */
router.get('/',
  authenticate,
  authorize([PERMISSIONS.USERS_READ]),
  userQueryValidation,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
      ...filters
    } = req.query;

    const offset = (page - 1) * limit;
    const { whereClause, params, paramIndex } = buildUserSearchQuery(filters);

    // Build main query (exclude sensitive data)
    const mainQuery = `
      SELECT 
        id, email, name, role, membership_type, membership_status,
        is_verified, is_active, phone, specialization, academic_degree,
        workplace, profile_image_url, created_at, updated_at, last_login_at,
        membership_date
      FROM users
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      dbQuery(mainQuery, [...params, limit, offset]),
      dbQuery(countQuery, params)
    ]);

    const users = usersResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Log data access
    await logAuditEvent({
      userId: req.user.id,
      action: 'list',
      resourceType: 'users',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        filters,
        page,
        limit,
        total
      }
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  })
);

/**
 * GET /api/users/:id
 * Get single user
 */
router.get('/:id',
  authenticate,
  param('id').isUUID().withMessage('Invalid user ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check permissions (own profile or admin)
    if (id !== req.user.id && !req.user.permissions?.includes(PERMISSIONS.USERS_READ)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    const result = await dbQuery(`
      SELECT 
        id, email, name, role, membership_type, membership_status,
        is_verified, is_active, phone, specialization, academic_degree,
        workplace, profile_image_url, bio, social_links, preferences,
        created_at, updated_at, last_login_at, membership_date
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const user = result.rows[0];

    // Log data access
    await logAuditEvent({
      userId: req.user.id,
      action: 'read',
      resourceType: 'users',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: user
    });
  })
);

/**
 * POST /api/users
 * Create new user (admin only)
 */
router.post('/',
  authenticate,
  authorize([PERMISSIONS.USERS_ADMIN]),
  createUserValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const {
      email,
      name,
      password,
      phone,
      role = ROLES.MEMBER,
      specialization,
      academic_degree,
      workplace,
      membership_type = 'regular'
    } = req.body;

    // Check if user already exists
    const existingUser = await dbQuery('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await dbQuery(`
      INSERT INTO users (
        email, name, password_hash, phone, role, specialization,
        academic_degree, workplace, membership_type, membership_status,
        is_verified, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING id, email, name, role, membership_type, membership_status,
               is_verified, is_active, created_at
    `, [
      email, name, passwordHash, phone, role, specialization,
      academic_degree, workplace, membership_type, 'pending',
      false, true
    ]);

    const newUser = result.rows[0];

    logger.info('User created successfully', {
      userId: newUser.id,
      email: newUser.email,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  })
);

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id',
  authenticate,
  updateUserValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Check permissions (own profile or admin)
    if (id !== req.user.id && !req.user.permissions?.includes(PERMISSIONS.USERS_WRITE)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    // Check if user exists
    const existing = await dbQuery('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    // Check for email conflicts
    if (updates.email) {
      const emailCheck = await dbQuery('SELECT id FROM users WHERE email = $1 AND id != $2', [updates.email, id]);
      if (emailCheck.rows.length > 0) {
        throw new ConflictError('Email already in use');
      }
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, membership_type, membership_status,
               is_verified, is_active, phone, specialization, academic_degree,
               workplace, profile_image_url, bio, social_links, preferences,
               updated_at
    `;

    const result = await dbQuery(updateQuery, updateValues);
    const updatedUser = result.rows[0];

    logger.info('User updated successfully', {
      userId: id,
      updatedBy: req.user.id,
      changes: Object.keys(updates)
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  })
);

/**
 * DELETE /api/users/:id
 * Deactivate user (soft delete)
 */
router.delete('/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_DELETE]),
  param('id').isUUID().withMessage('Invalid user ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      throw new ValidationError('Cannot delete your own account');
    }

    // Check if user exists
    const existing = await dbQuery('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    // Soft delete (deactivate)
    await dbQuery(`
      UPDATE users 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `, [id]);

    logger.info('User deactivated successfully', {
      userId: id,
      deactivatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
);

/**
 * POST /api/users/:id/activate
 * Activate user
 */
router.post('/:id/activate',
  authenticate,
  authorize([PERMISSIONS.USERS_ADMIN]),
  param('id').isUUID().withMessage('Invalid user ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await dbQuery(`
      UPDATE users 
      SET is_active = true, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, is_active
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    logger.info('User activated successfully', {
      userId: id,
      activatedBy: req.user.id
    });

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User activated successfully'
    });
  })
);

/**
 * POST /api/users/:id/verify
 * Verify user
 */
router.post('/:id/verify',
  authenticate,
  authorize([PERMISSIONS.USERS_ADMIN]),
  param('id').isUUID().withMessage('Invalid user ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await dbQuery(`
      UPDATE users 
      SET is_verified = true, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, is_verified
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    logger.info('User verified successfully', {
      userId: id,
      verifiedBy: req.user.id
    });

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User verified successfully'
    });
  })
);

/**
 * PUT /api/users/:id/role
 * Update user role
 */
router.put('/:id/role',
  authenticate,
  authorize([PERMISSIONS.USERS_ADMIN]),
  param('id').isUUID().withMessage('Invalid user ID'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent changing own role
    if (id === req.user.id) {
      throw new ValidationError('Cannot change your own role');
    }

    const result = await dbQuery(`
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, role
    `, [role, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    logger.info('User role updated successfully', {
      userId: id,
      newRole: role,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User role updated successfully'
    });
  })
);

export default router;
