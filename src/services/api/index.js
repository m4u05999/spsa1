/**
 * API Services Index
 * فهرس خدمات APIs
 * 
 * Central export point for all API services
 */

// Import all API services
import userManagementApi, { USER_ROLES, USER_STATUS, MEMBERSHIP_TYPES } from './userManagementApi.js';
import contentManagementApi, { CONTENT_TYPES, CONTENT_STATUS, CONTENT_VISIBILITY } from './contentManagementApi.js';
import categoryManagementApi, { CATEGORY_TYPES, CATEGORY_STATUS } from './categoryManagementApi.js';
import basicOperationsApi, { SEARCH_TYPES, ANALYTICS_PERIODS } from './basicOperationsApi.js';

/**
 * API Manager Class
 * فئة مدير APIs
 * 
 * Central manager for all API services with unified interface
 */
class ApiManager {
  constructor() {
    this.services = {
      users: userManagementApi,
      content: contentManagementApi,
      categories: categoryManagementApi,
      operations: basicOperationsApi
    };
    
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  /**
   * Initialize all API services
   * تهيئة جميع خدمات API
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      console.log('🚀 Initializing API services...');

      // Initialize all services in parallel
      const initPromises = Object.entries(this.services).map(async ([name, service]) => {
        try {
          if (service.initialize && typeof service.initialize === 'function') {
            await service.initialize();
            console.log(`✅ ${name} API service initialized`);
          }
          return { name, success: true };
        } catch (error) {
          console.error(`❌ Failed to initialize ${name} API service:`, error);
          return { name, success: false, error };
        }
      });

      const results = await Promise.all(initPromises);
      
      // Check results
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.warn(`⚠️ Some API services failed to initialize:`, failed);
      }

      this.isInitialized = true;
      console.log('🎉 API Manager initialized successfully');
      
      return true;

    } catch (error) {
      console.error('💥 Failed to initialize API Manager:', error);
      throw error;
    }
  }

  /**
   * Get service status for all APIs
   * الحصول على حالة جميع خدمات API
   */
  getServicesStatus() {
    const status = {
      isInitialized: this.isInitialized,
      services: {}
    };

    Object.entries(this.services).forEach(([name, service]) => {
      if (service.getServiceStatus && typeof service.getServiceStatus === 'function') {
        status.services[name] = service.getServiceStatus();
      } else {
        status.services[name] = {
          isInitialized: service.isInitialized || false,
          isEnabled: true
        };
      }
    });

    return status;
  }

  /**
   * Get service by name
   * الحصول على خدمة بالاسم
   */
  getService(serviceName) {
    return this.services[serviceName] || null;
  }

  /**
   * Check if all services are healthy
   * التحقق من صحة جميع الخدمات
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    let hasUnhealthyService = false;

    for (const [name, service] of Object.entries(this.services)) {
      try {
        // Check if service has health check method
        if (service.healthCheck && typeof service.healthCheck === 'function') {
          const serviceHealth = await service.healthCheck();
          health.services[name] = serviceHealth;
          
          if (!serviceHealth.healthy) {
            hasUnhealthyService = true;
          }
        } else {
          // Basic health check
          health.services[name] = {
            healthy: service.isInitialized || false,
            status: service.isInitialized ? 'operational' : 'not_initialized'
          };
          
          if (!service.isInitialized) {
            hasUnhealthyService = true;
          }
        }
      } catch (error) {
        health.services[name] = {
          healthy: false,
          status: 'error',
          error: error.message
        };
        hasUnhealthyService = true;
      }
    }

    if (hasUnhealthyService) {
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * Get comprehensive statistics from all services
   * الحصول على إحصائيات شاملة من جميع الخدمات
   */
  async getComprehensiveStatistics() {
    try {
      const stats = {
        timestamp: new Date().toISOString(),
        services: {}
      };

      // Get statistics from each service
      const statsPromises = Object.entries(this.services).map(async ([name, service]) => {
        try {
          let serviceStats = null;

          // Try different methods to get statistics
          if (service.getStatistics && typeof service.getStatistics === 'function') {
            const result = await service.getStatistics();
            serviceStats = result.success ? result.data : null;
          } else if (service.getUserStatistics && typeof service.getUserStatistics === 'function') {
            const result = await service.getUserStatistics();
            serviceStats = result.success ? result.data : null;
          } else if (service.getContentStatistics && typeof service.getContentStatistics === 'function') {
            const result = await service.getContentStatistics();
            serviceStats = result.success ? result.data : null;
          } else if (service.getSystemStatistics && typeof service.getSystemStatistics === 'function') {
            const result = await service.getSystemStatistics();
            serviceStats = result.success ? result.data : null;
          }

          return { name, stats: serviceStats };
        } catch (error) {
          console.error(`Failed to get statistics for ${name}:`, error);
          return { name, stats: null, error: error.message };
        }
      });

      const results = await Promise.all(statsPromises);
      
      results.forEach(({ name, stats: serviceStats, error }) => {
        stats.services[name] = serviceStats || { error };
      });

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Failed to get comprehensive statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform global search across all services
   * تنفيذ بحث شامل عبر جميع الخدمات
   */
  async globalSearch(query, options = {}) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          data: {
            results: [],
            total: 0
          }
        };
      }

      // Use basic operations API for global search
      return await this.services.operations.globalSearch(query, options);

    } catch (error) {
      console.error('Failed to perform global search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clear all caches
   * مسح جميع ذاكرات التخزين المؤقت
   */
  clearAllCaches() {
    Object.values(this.services).forEach(service => {
      if (service.clearCache && typeof service.clearCache === 'function') {
        service.clearCache();
      } else if (service.clearUserCache && typeof service.clearUserCache === 'function') {
        service.clearUserCache();
      } else if (service.clearContentCache && typeof service.clearContentCache === 'function') {
        service.clearContentCache();
      } else if (service.clearCategoryCache && typeof service.clearCategoryCache === 'function') {
        service.clearCategoryCache();
      }
    });

    console.log('🧹 All API caches cleared');
  }
}

// Create singleton instance
const apiManager = new ApiManager();

// Export individual services
export {
  // Services
  userManagementApi,
  contentManagementApi,
  categoryManagementApi,
  basicOperationsApi,
  
  // Constants
  USER_ROLES,
  USER_STATUS,
  MEMBERSHIP_TYPES,
  CONTENT_TYPES,
  CONTENT_STATUS,
  CONTENT_VISIBILITY,
  CATEGORY_TYPES,
  CATEGORY_STATUS,
  SEARCH_TYPES,
  ANALYTICS_PERIODS,
  
  // Manager
  apiManager
};

// Export manager as default
export default apiManager;

/**
 * Convenience functions for common operations
 * دوال مساعدة للعمليات الشائعة
 */

/**
 * Initialize all APIs
 * تهيئة جميع APIs
 */
export const initializeApis = async () => {
  return await apiManager.initialize();
};

/**
 * Get API services status
 * الحصول على حالة خدمات API
 */
export const getApiServicesStatus = () => {
  return apiManager.getServicesStatus();
};

/**
 * Perform health check on all APIs
 * إجراء فحص صحة على جميع APIs
 */
export const performApiHealthCheck = async () => {
  return await apiManager.healthCheck();
};

/**
 * Get comprehensive statistics
 * الحصول على إحصائيات شاملة
 */
export const getComprehensiveStatistics = async () => {
  return await apiManager.getComprehensiveStatistics();
};

/**
 * Perform global search
 * تنفيذ بحث شامل
 */
export const performGlobalSearch = async (query, options = {}) => {
  return await apiManager.globalSearch(query, options);
};

/**
 * Clear all API caches
 * مسح جميع ذاكرات التخزين المؤقت لـ APIs
 */
export const clearAllApiCaches = () => {
  apiManager.clearAllCaches();
};

// Auto-initialize APIs when module is imported
if (typeof window !== 'undefined') {
  // Browser environment
  document.addEventListener('DOMContentLoaded', () => {
    initializeApis().catch(error => {
      console.error('Failed to auto-initialize APIs:', error);
    });
  });
} else {
  // Node.js environment
  initializeApis().catch(error => {
    console.error('Failed to auto-initialize APIs:', error);
  });
}

console.log('📦 API Services module loaded successfully');
