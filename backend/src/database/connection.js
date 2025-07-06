/**
 * Database Connection Management
 * PostgreSQL connection with security and monitoring
 */

import pkg from 'pg';
const { Pool } = pkg;
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';

let pool = null;

/**
 * Create database connection pool
 */
const createPool = () => {
  const poolConfig = {
    connectionString: config.database.url,
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    
    // Pool configuration
    min: config.database.pool.min,
    max: config.database.pool.max,
    
    // Connection timeout
    connectionTimeoutMillis: 5000,
    
    // Idle timeout
    idleTimeoutMillis: 30000,
    
    // Query timeout
    query_timeout: 60000,
    
    // Statement timeout
    statement_timeout: 60000,
    
    // Application name for monitoring
    application_name: 'spsa_backend'
  };

  return new Pool(poolConfig);
};

/**
 * Connect to database
 */
export const connectDB = async () => {
  try {
    if (!pool) {
      pool = createPool();
      
      // Test connection
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      client.release();
      
      logger.info('✅ Database connected successfully', {
        timestamp: result.rows[0].current_time,
        version: result.rows[0].pg_version.split(' ')[0]
      });
      
      // Set up connection monitoring
      setupConnectionMonitoring();
      
      return pool;
    }
    
    return pool;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Get database pool instance
 */
export const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

/**
 * Execute query with error handling and logging
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        query: text.substring(0, 100) + '...',
        duration: `${duration}ms`,
        rowCount: result.rowCount
      });
    }
    
    // Log in development
    if (config.app.isDevelopment && config.development.enableDebug) {
      logger.debug('Query executed', {
        query: text.substring(0, 100) + '...',
        duration: `${duration}ms`,
        rowCount: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Query execution failed', {
      query: text.substring(0, 100) + '...',
      error: error.message,
      params: params.length
    });
    throw error;
  }
};

/**
 * Execute transaction
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    
    logger.debug('Transaction completed successfully');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check database health
 */
export const checkHealth = async () => {
  try {
    const result = await query('SELECT 1 as health_check');
    return {
      status: 'healthy',
      connected: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get connection pool statistics
 */
export const getPoolStats = () => {
  if (!pool) {
    return null;
  }
  
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    maxConnections: config.database.pool.max,
    minConnections: config.database.pool.min
  };
};

/**
 * Setup connection monitoring
 */
const setupConnectionMonitoring = () => {
  // Monitor pool events
  pool.on('connect', (client) => {
    logger.debug('New database client connected', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount
    });
  });
  
  pool.on('remove', (client) => {
    logger.debug('Database client removed', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount
    });
  });
  
  pool.on('error', (err, client) => {
    logger.error('Database pool error:', err);
  });
  
  // Log pool statistics periodically (every 5 minutes)
  if (config.development.enableDebug) {
    setInterval(() => {
      const stats = getPoolStats();
      logger.debug('Database pool statistics:', stats);
    }, 5 * 60 * 1000);
  }
};

/**
 * Close database connection
 */
export const closeDB = async () => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }
};

/**
 * Database migration helper
 */
export const migrate = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Check if migrations table exists
    const migrationTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    if (!migrationTableExists.rows[0].exists) {
      // Create migrations table
      await query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      logger.info('Migrations table created');
    }
    
    // Here you would implement your migration logic
    // For now, we'll just log that migrations are ready
    logger.info('Database migration completed');
    
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  }
};

/**
 * Seed database with initial data
 */
export const seed = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Check if data already exists
    const userCount = await query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) === 0) {
      // Insert initial admin user
      await query(`
        INSERT INTO users (
          email, name, password_hash, role, 
          membership_status, is_verified, is_active
        ) VALUES (
          'admin@sapsa.org', 
          'System Administrator',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.6', -- password: admin123
          'admin',
          'active',
          true,
          true
        )
      `);
      
      logger.info('Initial admin user created');
    }
    
    logger.info('Database seeding completed');
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

// Export pool for direct access if needed
export { pool };

export default {
  connectDB,
  getPool,
  query,
  transaction,
  checkHealth,
  getPoolStats,
  closeDB,
  migrate,
  seed
};
