/**
 * Content Management Routes - SPSA
 * مسارات إدارة المحتوى - الجمعية السعودية للعلوم السياسية
 * 
 * Features:
 * - CRUD operations for content
 * - Multi-language support (Arabic/English)
 * - Content categorization and tagging
 * - Publishing workflow
 * - Search and filtering
 * - PDPL compliant audit logging
 */

import express from 'express';
import { body, query, param } from 'express-validator';
import { query as dbQuery } from '../database/connection.js';
import { authenticate, authorize, PERMISSIONS } from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { auditMiddleware, logAuditEvent } from '../middleware/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const createContentValidation = [
  body('title')
    .isLength({ min: 5, max: 500 })
    .withMessage('Title must be between 5 and 500 characters'),
  body('title_ar')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Arabic title must be between 5 and 500 characters'),
  body('content')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('content_ar')
    .optional()
    .isLength({ min: 50 })
    .withMessage('Arabic content must be at least 50 characters'),
  body('content_type')
    .isIn(['article', 'news', 'publication', 'research', 'announcement'])
    .withMessage('Invalid content type'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('featured_image_url')
    .optional()
    .isURL()
    .withMessage('Invalid featured image URL'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be boolean'),
  body('is_pinned')
    .optional()
    .isBoolean()
    .withMessage('is_pinned must be boolean')
];

const updateContentValidation = [
  param('id').isUUID().withMessage('Invalid content ID'),
  ...createContentValidation.map(validation => validation.optional())
];

const contentQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('content_type')
    .optional()
    .isIn(['article', 'news', 'publication', 'research', 'announcement'])
    .withMessage('Invalid content type'),
  query('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  query('search')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Search term must be between 3 and 100 characters'),
  query('author_id')
    .optional()
    .isUUID()
    .withMessage('Invalid author ID'),
  query('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be boolean'),
  query('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'published_at', 'views_count', 'title'])
    .withMessage('Invalid sort field'),
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Helper function to generate slug
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Helper function to build search query
 */
const buildSearchQuery = (filters) => {
  let whereClause = 'WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.content_type) {
    whereClause += ` AND content_type = $${paramIndex}`;
    params.push(filters.content_type);
    paramIndex++;
  }

  if (filters.category_id) {
    whereClause += ` AND category_id = $${paramIndex}`;
    params.push(filters.category_id);
    paramIndex++;
  }

  if (filters.status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.author_id) {
    whereClause += ` AND author_id = $${paramIndex}`;
    params.push(filters.author_id);
    paramIndex++;
  }

  if (filters.is_featured !== undefined) {
    whereClause += ` AND is_featured = $${paramIndex}`;
    params.push(filters.is_featured);
    paramIndex++;
  }

  if (filters.search) {
    whereClause += ` AND (
      to_tsvector('english', title || ' ' || coalesce(content, '')) @@ plainto_tsquery('english', $${paramIndex})
      OR title ILIKE $${paramIndex + 1}
      OR content ILIKE $${paramIndex + 1}
    )`;
    params.push(filters.search);
    params.push(`%${filters.search}%`);
    paramIndex += 2;
  }

  return { whereClause, params, paramIndex };
};

/**
 * GET /api/content
 * Get content list with filtering and pagination
 */
router.get('/',
  contentQueryValidation,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
      ...filters
    } = req.query;

    const offset = (page - 1) * limit;
    const { whereClause, params, paramIndex } = buildSearchQuery(filters);

    // Build main query
    const mainQuery = `
      SELECT 
        c.*,
        u.name as author_name,
        cat.name as category_name,
        cat.name_ar as category_name_ar,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'name_ar', t.name_ar)
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as tags
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN content_tags ct ON c.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      ${whereClause}
      GROUP BY c.id, u.name, cat.name, cat.name_ar
      ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM content c
      LEFT JOIN categories cat ON c.category_id = cat.id
      ${whereClause}
    `;

    const [contentResult, countResult] = await Promise.all([
      dbQuery(mainQuery, [...params, limit, offset]),
      dbQuery(countQuery, params)
    ]);

    const content = contentResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Log data access
    await logAuditEvent({
      userId: req.user?.id || null,
      action: 'list',
      resourceType: 'content',
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
 * GET /api/content/:id
 * Get single content item
 */
router.get('/:id',
  param('id').isUUID().withMessage('Invalid content ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await dbQuery(`
      SELECT 
        c.*,
        u.name as author_name,
        u.email as author_email,
        cat.name as category_name,
        cat.name_ar as category_name_ar,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'name_ar', t.name_ar)
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as tags
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN content_tags ct ON c.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = $1
      GROUP BY c.id, u.name, u.email, cat.name, cat.name_ar
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Content not found');
    }

    const content = result.rows[0];

    // Increment view count
    await dbQuery('UPDATE content SET views_count = views_count + 1 WHERE id = $1', [id]);

    // Log data access
    await logAuditEvent({
      userId: req.user?.id || null,
      action: 'read',
      resourceType: 'content',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: content
    });
  })
);

/**
 * POST /api/content
 * Create new content
 */
router.post('/',
  authenticate,
  authorize([PERMISSIONS.CONTENT_WRITE]),
  createContentValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const {
      title,
      title_ar,
      content,
      content_ar,
      excerpt,
      excerpt_ar,
      content_type,
      category_id,
      tags = [],
      featured_image_url,
      is_featured = false,
      is_pinned = false
    } = req.body;

    // Generate slug
    const slug = generateSlug(title);

    // Check if slug already exists
    const existingSlug = await dbQuery('SELECT id FROM content WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      throw new ValidationError('Content with this title already exists');
    }

    // Create content
    const result = await dbQuery(`
      INSERT INTO content (
        title, title_ar, slug, content, content_ar, excerpt, excerpt_ar,
        content_type, category_id, featured_image_url, author_id,
        is_featured, is_pinned, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *
    `, [
      title, title_ar, slug, content, content_ar, excerpt, excerpt_ar,
      content_type, category_id, featured_image_url, req.user.id,
      is_featured, is_pinned, 'draft'
    ]);

    const newContent = result.rows[0];

    // Add tags if provided
    if (tags.length > 0) {
      const tagInserts = tags.map(tagId => 
        dbQuery('INSERT INTO content_tags (content_id, tag_id) VALUES ($1, $2)', [newContent.id, tagId])
      );
      await Promise.all(tagInserts);
    }

    logger.info('Content created successfully', {
      contentId: newContent.id,
      title,
      authorId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newContent,
      message: 'Content created successfully'
    });
  })
);

/**
 * PUT /api/content/:id
 * Update content
 */
router.put('/:id',
  authenticate,
  authorize([PERMISSIONS.CONTENT_WRITE]),
  updateContentValidation,
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Check if content exists
    const existing = await dbQuery('SELECT * FROM content WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Content not found');
    }

    const existingContent = existing.rows[0];

    // Check permissions (author or admin)
    if (existingContent.author_id !== req.user.id && 
        !req.user.permissions?.includes(PERMISSIONS.CONTENT_ADMIN)) {
      throw new AuthorizationError('You can only edit your own content');
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'tags') {
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
      UPDATE content 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await dbQuery(updateQuery, updateValues);
    const updatedContent = result.rows[0];

    // Update tags if provided
    if (updates.tags) {
      // Remove existing tags
      await dbQuery('DELETE FROM content_tags WHERE content_id = $1', [id]);
      
      // Add new tags
      if (updates.tags.length > 0) {
        const tagInserts = updates.tags.map(tagId => 
          dbQuery('INSERT INTO content_tags (content_id, tag_id) VALUES ($1, $2)', [id, tagId])
        );
        await Promise.all(tagInserts);
      }
    }

    logger.info('Content updated successfully', {
      contentId: id,
      updatedBy: req.user.id,
      changes: Object.keys(updates)
    });

    res.json({
      success: true,
      data: updatedContent,
      message: 'Content updated successfully'
    });
  })
);

/**
 * DELETE /api/content/:id
 * Delete content (soft delete)
 */
router.delete('/:id',
  authenticate,
  authorize([PERMISSIONS.CONTENT_DELETE]),
  param('id').isUUID().withMessage('Invalid content ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if content exists
    const existing = await dbQuery('SELECT * FROM content WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Content not found');
    }

    const existingContent = existing.rows[0];

    // Check permissions (author or admin)
    if (existingContent.author_id !== req.user.id && 
        !req.user.permissions?.includes(PERMISSIONS.CONTENT_ADMIN)) {
      throw new AuthorizationError('You can only delete your own content');
    }

    // Soft delete
    await dbQuery(`
      UPDATE content 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
    `, [id]);

    logger.info('Content deleted successfully', {
      contentId: id,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  })
);

/**
 * POST /api/content/:id/publish
 * Publish content
 */
router.post('/:id/publish',
  authenticate,
  authorize([PERMISSIONS.CONTENT_PUBLISH]),
  param('id').isUUID().withMessage('Invalid content ID'),
  auditMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await dbQuery(`
      UPDATE content 
      SET status = 'published', published_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status = 'draft'
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Content not found or already published');
    }

    logger.info('Content published successfully', {
      contentId: id,
      publishedBy: req.user.id
    });

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Content published successfully'
    });
  })
);

export default router;
