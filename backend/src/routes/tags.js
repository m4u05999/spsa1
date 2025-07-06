/**
 * Tags Management Routes - SPSA
 * مسارات إدارة العلامات - الجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - Tag CRUD operations
 * - Multi-language support (Arabic/English)
 * - Tag usage statistics
 * - Content association
 * - Tag suggestions and auto-complete
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
const createTagValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Name must be between 2 and 50 characters'),
  body('name_ar')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Arabic name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .withMessage('Description must not exceed 200 characters'),
  body('description_ar')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .withMessage('Arabic description must not exceed 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be boolean')
];

const updateTagValidation = [
  param('id').isUUID().withMessage('Invalid tag ID'),
  ...createTagValidation.map(validation => validation.optional())
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
 * GET /api/tags
 * Get tags list with filtering and search
 */
router.get('/',
  query('search').optional().isLength({ min: 1, max: 50 }).withMessage('Search term must be between 1 and 50 characters'),
  query('include_inactive').optional().isBoolean().withMessage('include_inactive must be boolean'),
  query('sort_by').optional().isIn(['name', 'usage_count', 'created_at']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  asyncHandler(async (req, res) => {
    const {
      search,
      include_inactive = false,
      sort_by = 'usage_count',
      sort_order = 'desc',
      limit = 50
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (!include_inactive) {
      whereClause += ` AND t.is_active = true`;
    }

    if (search) {
      whereClause += ` AND (t.name ILIKE $${paramIndex} OR t.name_ar ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const query = `
      SELECT 
        t.*,
        COUNT(ct.content_id) as usage_count
      FROM tags t
      LEFT JOIN content_tags ct ON t.id = ct.tag_id
      LEFT JOIN content c ON ct.content_id = c.id AND c.status = 'published'
      ${whereClause}
      GROUP BY t.id
      ORDER BY ${sort_by === 'usage_count' ? 'usage_count' : `t.${sort_by}`} ${sort_order.toUpperCase()}
      LIMIT $${paramIndex}
    `;

    const result = await dbQuery(query, [...params, limit]);
    
    const tags = result.rows.map(tag => ({
      ...tag,
      usage_count: parseInt(tag.usage_count)
    }));

    // Log data access
    await logAuditEvent({
      userId: req.user?.id || null,
      action: 'list',
      resourceType: 'tags',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { search, include_inactive, sort_by, sort_order, limit }
    });

    res.json({
      success: true,
      data: tags
    });
  })
);

/**
 * GET /api/tags/:id
 * Get single tag with details
 */
router.get('/:id',
  param('id').isUUID().withMessage('Invalid tag ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await dbQuery(`
      SELECT 
        t.*,
        COUNT(ct.content_id) as usage_count
      FROM tags t
      LEFT JOIN content_tags ct ON t.id = ct.tag_id
      LEFT JOIN content c ON ct.content_id = c.id AND c.status = 'published'
      WHERE t.id = $1
      GROUP BY t.id
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Tag not found');
    }

    const tag = {
      ...result.rows[0],
      usage_count: parseInt(result.rows[0].usage_count)
    };

    // Log data access
    await logAuditEvent({
      userId: req.user?.id || null,
      action: 'read',
      resourceType: 'tags',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: tag
    });
  })
);

/**
 * POST /api/tags
 * Create new tag
 */
router.post('/',
  authenticate,
  authorize([PERMISSIONS.CONTENT_WRITE]),
  createTagValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const {
      name,
      name_ar,
      description,
      description_ar,
      color,
      is_active = true
    } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if tag already exists (by name or slug)
    const existingTag = await dbQuery(
      'SELECT id FROM tags WHERE slug = $1 OR name = $2 OR name_ar = $3',
      [slug, name, name_ar]
    );
    
    if (existingTag.rows.length > 0) {
      throw new ConflictError('Tag with this name already exists');
    }

    // Create tag
    const result = await dbQuery(`
      INSERT INTO tags (
        name, name_ar, slug, description, description_ar, color, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [name, name_ar, slug, description, description_ar, color, is_active]);

    const newTag = result.rows[0];

    logger.info('Tag created successfully', {
      tagId: newTag.id,
      name,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newTag,
      message: 'Tag created successfully'
    });
  })
);

/**
 * PUT /api/tags/:id
 * Update tag
 */
router.put('/:id',
  authenticate,
  authorize([PERMISSIONS.CONTENT_WRITE]),
  updateTagValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if tag exists
    const existing = await dbQuery('SELECT * FROM tags WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Tag not found');
    }

    // Check slug uniqueness if name is being updated
    if (updates.name) {
      const newSlug = generateSlug(updates.name);
      const existingSlug = await dbQuery('SELECT id FROM tags WHERE slug = $1 AND id != $2', [newSlug, id]);
      if (existingSlug.rows.length > 0) {
        throw new ConflictError('Tag with this name already exists');
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
      UPDATE tags 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await dbQuery(updateQuery, updateValues);
    const updatedTag = result.rows[0];

    logger.info('Tag updated successfully', {
      tagId: id,
      updatedBy: req.user.id,
      changes: Object.keys(updates)
    });

    res.json({
      success: true,
      data: updatedTag,
      message: 'Tag updated successfully'
    });
  })
);

/**
 * DELETE /api/tags/:id
 * Delete tag (removes from all content)
 */
router.delete('/:id',
  authenticate,
  authorize([PERMISSIONS.CONTENT_ADMIN]),
  param('id').isUUID().withMessage('Invalid tag ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if tag exists
    const existing = await dbQuery('SELECT * FROM tags WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Tag not found');
    }

    // Remove tag from all content
    await dbQuery('DELETE FROM content_tags WHERE tag_id = $1', [id]);

    // Delete tag
    await dbQuery('DELETE FROM tags WHERE id = $1', [id]);

    logger.info('Tag deleted successfully', {
      tagId: id,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  })
);

/**
 * GET /api/tags/:id/content
 * Get content with specific tag
 */
router.get('/:id/content',
  param('id').isUUID().withMessage('Invalid tag ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if tag exists
    const tagExists = await dbQuery('SELECT id FROM tags WHERE id = $1', [id]);
    if (tagExists.rows.length === 0) {
      throw new NotFoundError('Tag not found');
    }

    const [contentResult, countResult] = await Promise.all([
      dbQuery(`
        SELECT 
          c.id, c.title, c.title_ar, c.slug, c.excerpt, c.excerpt_ar,
          c.content_type, c.featured_image_url, c.is_featured, c.is_pinned,
          c.views_count, c.published_at, c.created_at,
          u.name as author_name,
          cat.name as category_name,
          cat.name_ar as category_name_ar
        FROM content c
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        INNER JOIN content_tags ct ON c.id = ct.content_id
        WHERE ct.tag_id = $1 AND c.status = 'published'
        ORDER BY c.is_pinned DESC, c.published_at DESC
        LIMIT $2 OFFSET $3
      `, [id, limit, offset]),
      dbQuery(`
        SELECT COUNT(*) as total 
        FROM content c
        INNER JOIN content_tags ct ON c.id = ct.content_id
        WHERE ct.tag_id = $1 AND c.status = 'published'
      `, [id])
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
 * GET /api/tags/suggestions
 * Get tag suggestions for auto-complete
 */
router.get('/suggestions',
  query('q').isLength({ min: 1, max: 50 }).withMessage('Query must be between 1 and 50 characters'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  asyncHandler(async (req, res) => {
    const { q, limit = 10 } = req.query;

    const result = await dbQuery(`
      SELECT 
        id, name, name_ar, slug,
        COUNT(ct.content_id) as usage_count
      FROM tags t
      LEFT JOIN content_tags ct ON t.id = ct.tag_id
      WHERE t.is_active = true 
        AND (t.name ILIKE $1 OR t.name_ar ILIKE $1)
      GROUP BY t.id, t.name, t.name_ar, t.slug
      ORDER BY usage_count DESC, t.name ASC
      LIMIT $2
    `, [`%${q}%`, limit]);

    const suggestions = result.rows.map(tag => ({
      ...tag,
      usage_count: parseInt(tag.usage_count)
    }));

    res.json({
      success: true,
      data: suggestions
    });
  })
);

/**
 * GET /api/tags/popular
 * Get most popular tags
 */
router.get('/popular',
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const result = await dbQuery(`
      SELECT 
        t.id, t.name, t.name_ar, t.slug, t.color,
        COUNT(ct.content_id) as usage_count
      FROM tags t
      INNER JOIN content_tags ct ON t.id = ct.tag_id
      INNER JOIN content c ON ct.content_id = c.id
      WHERE t.is_active = true AND c.status = 'published'
      GROUP BY t.id, t.name, t.name_ar, t.slug, t.color
      HAVING COUNT(ct.content_id) > 0
      ORDER BY usage_count DESC, t.name ASC
      LIMIT $1
    `, [limit]);

    const popularTags = result.rows.map(tag => ({
      ...tag,
      usage_count: parseInt(tag.usage_count)
    }));

    res.json({
      success: true,
      data: popularTags
    });
  })
);

/**
 * GET /api/tags/stats
 * Get tags statistics
 */
router.get('/stats',
  authenticate,
  authorize([PERMISSIONS.CONTENT_READ]),
  asyncHandler(async (req, res) => {
    const stats = await dbQuery(`
      SELECT 
        COUNT(*) as total_tags,
        COUNT(*) FILTER (WHERE is_active = true) as active_tags,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_tags
      FROM tags
    `);

    const usageStats = await dbQuery(`
      SELECT 
        COUNT(*) FILTER (WHERE usage_count = 0) as unused_tags,
        COUNT(*) FILTER (WHERE usage_count BETWEEN 1 AND 5) as low_usage_tags,
        COUNT(*) FILTER (WHERE usage_count BETWEEN 6 AND 20) as medium_usage_tags,
        COUNT(*) FILTER (WHERE usage_count > 20) as high_usage_tags,
        AVG(usage_count) as avg_usage
      FROM (
        SELECT 
          t.id,
          COUNT(ct.content_id) as usage_count
        FROM tags t
        LEFT JOIN content_tags ct ON t.id = ct.tag_id
        LEFT JOIN content c ON ct.content_id = c.id AND c.status = 'published'
        GROUP BY t.id
      ) tag_usage
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        usage_distribution: {
          ...usageStats.rows[0],
          avg_usage: parseFloat(usageStats.rows[0].avg_usage || 0).toFixed(2)
        }
      }
    });
  })
);

export default router;
