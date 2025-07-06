/**
 * Audit Logging Middleware
 * PDPL Compliant audit trail for all operations
 */

import { v4 as uuidv4 } from 'uuid';
import { logger, auditLogger } from '../utils/logger.js';
import { query } from '../database/connection.js';
import { config } from '../config/environment.js';

/**
 * Audit log entry structure
 */
class AuditEntry {
  constructor({
    userId = null,
    sessionId = null,
    action,
    resourceType,
    resourceId = null,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
    success = true,
    errorMessage = null,
    metadata = {}
  }) {
    this.id = uuidv4();
    this.userId = userId;
    this.sessionId = sessionId;
    this.action = action;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.oldValues = oldValues;
    this.newValues = newValues;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.success = success;
    this.errorMessage = errorMessage;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Save audit entry to database
 */
const saveAuditEntry = async (entry) => {
  try {
    await query(`
      INSERT INTO audit_logs (
        id, user_id, session_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent, success,
        error_message, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      entry.id,
      entry.userId,
      entry.sessionId,
      entry.action,
      entry.resourceType,
      entry.resourceId,
      entry.oldValues ? JSON.stringify(entry.oldValues) : null,
      entry.newValues ? JSON.stringify(entry.newValues) : null,
      entry.ipAddress,
      entry.userAgent,
      entry.success,
      entry.errorMessage,
      JSON.stringify(entry.metadata),
      entry.timestamp
    ]);
  } catch (error) {
    logger.error('Failed to save audit entry:', error);
    // Don't throw error to avoid breaking the main request
  }
};

/**
 * Extract resource information from request
 */
const extractResourceInfo = (req) => {
  const path = req.route?.path || req.path;
  const method = req.method;
  
  // Extract resource type and ID from common patterns
  let resourceType = 'unknown';
  let resourceId = null;
  
  // Common API patterns
  const patterns = [
    { regex: /\/api\/users\/(\w+)/, type: 'user' },
    { regex: /\/api\/content\/(\w+)/, type: 'content' },
    { regex: /\/api\/categories\/(\w+)/, type: 'category' },
    { regex: /\/api\/events\/(\w+)/, type: 'event' },
    { regex: /\/api\/memberships\/(\w+)/, type: 'membership' },
    { regex: /\/api\/admin\/(\w+)/, type: 'admin' }
  ];
  
  for (const pattern of patterns) {
    const match = path.match(pattern.regex);
    if (match) {
      resourceType = pattern.type;
      resourceId = match[1];
      break;
    }
  }
  
  // Fallback to path-based detection
  if (resourceType === 'unknown') {
    const pathParts = path.split('/').filter(part => part && part !== 'api');
    if (pathParts.length > 0) {
      resourceType = pathParts[0];
      if (pathParts.length > 1 && pathParts[1] !== 'search') {
        resourceId = pathParts[1];
      }
    }
  }
  
  return { resourceType, resourceId };
};

/**
 * Determine action from request
 */
const determineAction = (req) => {
  const method = req.method;
  const path = req.route?.path || req.path;
  
  // Special actions
  if (path.includes('/login')) return 'login';
  if (path.includes('/logout')) return 'logout';
  if (path.includes('/register')) return 'register';
  if (path.includes('/password')) return 'password_change';
  if (path.includes('/search')) return 'search';
  if (path.includes('/export')) return 'export';
  if (path.includes('/import')) return 'import';
  
  // Standard CRUD operations
  switch (method) {
    case 'GET':
      return path.includes('/:id') ? 'read' : 'list';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return method.toLowerCase();
  }
};

/**
 * Sanitize sensitive data from audit logs
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password',
    'password_hash',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'credit_card',
    'ssn',
    'national_id',
    'bank_account'
  ];
  
  const sanitized = { ...data };
  
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      } else if (typeof obj[key] === 'string') {
        const isSensitive = sensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        );
        
        if (isSensitive) {
          obj[key] = '[REDACTED]';
        }
      }
    }
  };
  
  sanitizeObject(sanitized);
  return sanitized;
};

/**
 * Main audit middleware
 */
export const auditMiddleware = (req, res, next) => {
  // Skip audit for health checks and static files
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }
  
  const startTime = Date.now();
  const { resourceType, resourceId } = extractResourceInfo(req);
  const action = determineAction(req);
  
  // Store original body for comparison
  const originalBody = req.body ? { ...req.body } : null;
  
  // Capture response data
  const originalSend = res.send;
  let responseData = null;
  
  res.send = function(data) {
    responseData = data;
    originalSend.call(this, data);
  };
  
  // Log when response finishes
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    try {
      // Prepare audit entry
      const auditEntry = new AuditEntry({
        userId: req.user?.id || null,
        sessionId: req.sessionID || null,
        action,
        resourceType,
        resourceId,
        oldValues: null, // Will be populated for updates
        newValues: sanitizeData(originalBody),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage: success ? null : (responseData?.error || 'Unknown error'),
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          contentLength: res.get('Content-Length'),
          referer: req.get('Referer'),
          origin: req.get('Origin')
        }
      });
      
      // For update operations, try to get old values
      if (action === 'update' && resourceId && resourceType !== 'unknown') {
        try {
          const oldData = await getOldValues(resourceType, resourceId);
          auditEntry.oldValues = sanitizeData(oldData);
        } catch (error) {
          logger.debug('Could not retrieve old values for audit:', error.message);
        }
      }
      
      // Save audit entry
      await saveAuditEntry(auditEntry);
      
      // Log to application logs
      auditLogger.dataProcessing(
        auditEntry.userId,
        resourceType,
        action,
        'legitimate_interest', // Default legal basis
        {
          success,
          duration,
          statusCode: res.statusCode
        }
      );
      
    } catch (error) {
      logger.error('Audit logging failed:', error);
    }
  });
  
  next();
};

/**
 * Get old values for comparison in updates
 */
const getOldValues = async (resourceType, resourceId) => {
  const tableMap = {
    'user': 'users',
    'content': 'content',
    'category': 'categories',
    'event': 'events',
    'membership': 'memberships',
    'inquiry': 'inquiries'
  };
  
  const tableName = tableMap[resourceType];
  if (!tableName) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }
  
  const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [resourceId]);
  return result.rows[0] || null;
};

/**
 * Manual audit logging for specific events
 */
export const logAuditEvent = async (eventData) => {
  const auditEntry = new AuditEntry(eventData);
  await saveAuditEntry(auditEntry);
  
  auditLogger.dataProcessing(
    eventData.userId,
    eventData.resourceType,
    eventData.action,
    eventData.legalBasis || 'legitimate_interest',
    eventData.metadata || {}
  );
};

/**
 * Audit query builder for reports
 */
export const buildAuditQuery = (filters = {}) => {
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;
  
  if (filters.userId) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(filters.userId);
    paramIndex++;
  }
  
  if (filters.resourceType) {
    query += ` AND resource_type = $${paramIndex}`;
    params.push(filters.resourceType);
    paramIndex++;
  }
  
  if (filters.action) {
    query += ` AND action = $${paramIndex}`;
    params.push(filters.action);
    paramIndex++;
  }
  
  if (filters.startDate) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(filters.endDate);
    paramIndex++;
  }
  
  if (filters.success !== undefined) {
    query += ` AND success = $${paramIndex}`;
    params.push(filters.success);
    paramIndex++;
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }
  
  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }
  
  return { query, params };
};

/**
 * Cleanup old audit logs
 */
export const cleanupAuditLogs = async () => {
  const retentionDays = config.audit.retentionDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  try {
    const result = await query(
      'DELETE FROM audit_logs WHERE created_at < $1',
      [cutoffDate.toISOString()]
    );
    
    logger.info(`Cleaned up ${result.rowCount} old audit log entries`);
    return result.rowCount;
  } catch (error) {
    logger.error('Failed to cleanup audit logs:', error);
    throw error;
  }
};

export default {
  auditMiddleware,
  logAuditEvent,
  buildAuditQuery,
  cleanupAuditLogs,
  AuditEntry
};
