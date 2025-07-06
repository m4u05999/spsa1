/**
 * Categories Management Routes - SPSA
 * مسارات إدارة الفئات - الجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - Hierarchical categories
 * - Multi-language support (Arabic/English)
 * - Category statistics
 * - Content association
 * - CRUD operations with validation
 */

import express from 'express';
import { body, query, param } from 'express-validator';
import { query as dbQuery } from '../database/connection.js';
import { authenticate, authorize, PERMISSIONS } from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError, ConflictError } from '../middleware/errorHandler.js';
import { auditMiddleware, logAuditEvent } from '../middleware/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const createCategoryValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('name_ar')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Arabic name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Description must not exceed 500 characters'),
  body('description_ar')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Arabic description must not exceed 500 characters'),
  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('Invalid parent category ID'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .trim()
    .withMessage('Icon must not exceed 50 characters'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be boolean'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

const updateCategoryValidation = [
  param('id').isUUID().withMessage('Invalid category ID'),
  ...createCategoryValidation.map(validation => validation.optional())
];

/**
 * Helper function to generate slug
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Helper function to check for circular references
 */
const checkCircularReference = async (categoryId, parentId) => {
  if (!parentId) return false;
  
  let currentParentId = parentId;
  const visited = new Set();
  
  while (currentParentId) {
    if (visited.has(currentParentId) || currentParentId === categoryId) {
      return true; // Circular reference detected
    }
    
    visited.add(currentParentId);
    
    const result = await dbQuery('SELECT parent_id FROM categories WHERE id = $1', [currentParentId]);
    if (result.rows.length === 0) break;
    
    currentParentId = result.rows[0].parent_id;
  }
  
  return false;
};

/**
 * Helper function to build category tree
 */
const buildCategoryTree = (categories, parentId = null) => {
  return categories
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id)
    }));
};

/**
 * GET /api/categories
 * Get categories list with optional tree structure
 */
router.get('/',
  query('tree').optional().isBoolean().withMessage('tree must be boolean'),
  query('include_inactive').optional().isBoolean().withMessage('include_inactive must be boolean'),
  query('parent_id').optional().isUUID().withMessage('Invalid parent_id'),
  asyncHandler(async (req, res) => {
    const { tree = false, include_inactive = false, parent_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (!include_inactive) {
      whereClause += ` AND is_active = true`;
    }

    if (parent_id) {
      whereClause += ` AND parent_id = $${paramIndex}`;
      params.push(parent_id);
      paramIndex++;
    }

    const query = `
      SELECT 
        c.*,
        pc.name as parent_name,
        pc.name_ar as parent_name_ar,
        COUNT(content.id) as content_count
      FROM categories c
      LEFT JOIN categories pc ON c.parent_id = pc.id
      LEFT JOIN content ON c.id = content.category_id AND content.status = 'published'
      ${whereClause}
      GROUP BY c.id, pc.name, pc.name_ar
      ORDER BY c.sort_order ASC, c.name ASC
    `;

    const result = await dbQuery(query, params);
    let categories = result.rows;

    // Convert content_count to number
    categories = categories.map(cat => ({
      ...cat,
      content_count: parseInt(cat.content_count)
    }));

    // Build tree structure if requested
    if (tree && !parent_id) {
      categories = buildCategoryTree(categories);
    }

    // Log data access
    await logAuditEvent({
      userId: req.user?.id || null,
      action: 'list',
      resourceType: 'categories',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { tree, include_inactive, parent_id }
    });

    res.json({
      success: true,
      data: categories
    });
  })
);

/**
 * GET /api/categories/:id
 * Get single category with details
 */
router.get('/:id',
  param('id').isUUID().withMessage('Invalid category ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await dbQuery(`
      SELECT 
        c.*,
        pc.name as parent_name,
        pc.name_ar as parent_name_ar,
        COUNT(content.id) as content_count,
        COUNT(subcategories.id) as subcategories_count
      FROM categories c
      LEFT JOIN categories pc ON c.parent_id = pc.id
      LEFT JOIN content ON c.id = content.category_id AND content.status = 'published'
      LEFT JOIN categories subcategories ON c.id = subcategories.parent_id
      WHERE c.id = $1
      GROUP BY c.id, pc.name, pc.name_ar
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Category not found');
    }

    const category = {
      ...result.rows[0],
      content_count: parseInt(result.rows[0].content_count),
      subcategories_count: parseInt(result.rows[0].subcategories_count)
    };

    // Get subcategories
    const subcategoriesResult = await dbQuery(`
      SELECT id, name, name_ar, slug, description, description_ar, 
             color, icon, is_active, sort_order
      FROM categories 
      WHERE parent_id = $1 
      ORDER BY sort_order ASC, name ASC
    `, [id]);

    category.subcategories = subcategoriesResult.rows;

    // Log data access
    await logAuditEvent({
      userId: req.user?.id || null,
      action: 'read',
      resourceType: 'categories',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: category
    });
  })
);

/**
 * POST /api/categories
 * Create new category
 */
router.post('/',
  authenticate,
  authorize([PERMISSIONS.CONTENT_ADMIN]),
  createCategoryValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const {
      name,
      name_ar,
      description,
      description_ar,
      parent_id,
      color,
      icon,
      is_active = true,
      sort_order = 0
    } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const existingSlug = await dbQuery('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      throw new ConflictError('Category with this name already exists');
    }

    // Check for circular reference if parent_id is provided
    if (parent_id) {
      const parentExists = await dbQuery('SELECT id FROM categories WHERE id = $1', [parent_id]);
      if (parentExists.rows.length === 0) {
        throw new NotFoundError('Parent category not found');
      }
    }

    // Create category
    const result = await dbQuery(`
      INSERT INTO categories (
        name, name_ar, slug, description, description_ar, parent_id,
        color, icon, is_active, sort_order, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `, [
      name, name_ar, slug, description, description_ar, parent_id,
      color, icon, is_active, sort_order
    ]);

    const newCategory = result.rows[0];

    logger.info('Category created successfully', {
      categoryId: newCategory.id,
      name,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  })
);

/**
 * PUT /api/categories/:id
 * Update category
 */
router.put('/:id',
  authenticate,
  authorize([PERMISSIONS.CONTENT_ADMIN]),
  updateCategoryValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if category exists
    const existing = await dbQuery('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Category not found');
    }

    // Check for circular reference if parent_id is being updated
    if (updates.parent_id) {
      const isCircular = await checkCircularReference(id, updates.parent_id);
      if (isCircular) {
        throw new ValidationError('Cannot set parent category: would create circular reference');
      }
    }

    // Check slug uniqueness if name is being updated
    if (updates.name) {
      const newSlug = generateSlug(updates.name);
      const existingSlug = await dbQuery('SELECT id FROM categories WHERE slug = $1 AND id != $2', [newSlug, id]);
      if (existingSlug.rows.length > 0) {
        throw new ConflictError('Category with this name already exists');
      }
      updates.slug = newSlug;
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE categories 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await dbQuery(updateQuery, updateValues);
    const updatedCategory = result.rows[0];

    logger.info('Category updated successfully', {
      categoryId: id,
      updatedBy: req.user.id,
      changes: Object.keys(updates)
    });

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  })
);

/**
 * DELETE /api/categories/:id
 * Delete category (with content reassignment)
 */
router.delete('/:id',
  authenticate,
  authorize([PERMISSIONS.CONTENT_ADMIN]),
  param('id').isUUID().withMessage('Invalid category ID'),
  body('reassign_to').optional().isUUID().withMessage('Invalid reassign_to category ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reassign_to } = req.body;

    // Check if category exists
    const existing = await dbQuery('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Category not found');
    }

    // Check for subcategories
    const subcategories = await dbQuery('SELECT COUNT(*) as count FROM categories WHERE parent_id = $1', [id]);
    if (parseInt(subcategories.rows[0].count) > 0) {
      throw new ValidationError('Cannot delete category with subcategories. Delete or reassign subcategories first.');
    }

    // Check for associated content
    const contentCount = await dbQuery('SELECT COUNT(*) as count FROM content WHERE category_id = $1', [id]);
    const hasContent = parseInt(contentCount.rows[0].count) > 0;

    if (hasContent) {
      if (!reassign_to) {
        throw new ValidationError('Category has associated content. Provide reassign_to category ID or remove content first.');
      }

      // Verify reassign_to category exists
      const reassignCategory = await dbQuery('SELECT id FROM categories WHERE id = $1', [reassign_to]);
      if (reassignCategory.rows.length === 0) {
        throw new NotFoundError('Reassign target category not found');
      }

      // Reassign content
      await dbQuery('UPDATE content SET category_id = $1 WHERE category_id = $2', [reassign_to, id]);
    }

    // Delete category
    await dbQuery('DELETE FROM categories WHERE id = $1', [id]);

    logger.info('Category deleted successfully', {
      categoryId: id,
      deletedBy: req.user.id,
      contentReassignedTo: reassign_to || null
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  })
);

/**
 * GET /api/categories/:id/content
 * Get content in category
 */
router.get('/:id/content',
  param('id').isUUID().withMessage('Invalid category ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if category exists
    const categoryExists = await dbQuery('SELECT id FROM categories WHERE id = $1', [id]);
    if (categoryExists.rows.length === 0) {
      throw new NotFoundError('Category not found');
    }

    const [contentResult, countResult] = await Promise.all([
      dbQuery(`
        SELECT 
          c.id, c.title, c.title_ar, c.slug, c.excerpt, c.excerpt_ar,
          c.content_type, c.featured_image_url, c.is_featured, c.is_pinned,
          c.views_count, c.published_at, c.created_at,
          u.name as author_name
        FROM content c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.category_id = $1 AND c.status = 'published'
        ORDER BY c.is_pinned DESC, c.published_at DESC
        LIMIT $2 OFFSET $3
      `, [id, limit, offset]),
      dbQuery('SELECT COUNT(*) as total FROM content WHERE category_id = $1 AND status = \'published\'', [id])
    ]);

    const content = contentResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: content,
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
 * GET /api/categories/stats
 * Get categories statistics
 */
router.get('/stats',
  authenticate,
  authorize([PERMISSIONS.CONTENT_READ]),
  asyncHandler(async (req, res) => {
    const stats = await dbQuery(`
      SELECT 
        COUNT(*) as total_categories,
        COUNT(*) FILTER (WHERE is_active = true) as active_categories,
        COUNT(*) FILTER (WHERE parent_id IS NULL) as root_categories,
        COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as subcategories
      FROM categories
    `);

    const contentStats = await dbQuery(`
      SELECT 
        c.id,
        c.name,
        c.name_ar,
        COUNT(content.id) as content_count
      FROM categories c
      LEFT JOIN content ON c.id = content.category_id AND content.status = 'published'
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.name_ar
      ORDER BY content_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        top_categories: contentStats.rows.map(cat => ({
          ...cat,
          content_count: parseInt(cat.content_count)
        }))
      }
    });
  })
);

export default router;
