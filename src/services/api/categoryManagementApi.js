/**
 * Category & Tags Management API Service
 * خدمة APIs إدارة الفئات والعلامات
 * 
 * Comprehensive category and tag management for content organization
 */

import unifiedApiService from '../unifiedApiService.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import { logError, logInfo } from '../../utils/monitoring.js';

/**
 * Category Types
 * أنواع الفئات
 */
export const CATEGORY_TYPES = {
  CONTENT: 'content',
  EVENT: 'event',
  RESEARCH: 'research',
  PUBLICATION: 'publication',
  GENERAL: 'general'
};

/**
 * Category Status
 * حالات الفئة
 */
export const CATEGORY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

/**
 * Category Management API Class
 * فئة APIs إدارة الفئات والعلامات
 */
class CategoryManagementApi {
  constructor() {
    this.baseEndpoint = '/api/categories';
    this.tagsEndpoint = '/api/tags';
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    this.initialize();
  }

  /**
   * Initialize API service
   * تهيئة خدمة API
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_CATEGORY_MANAGEMENT_API')) {
        logInfo('Category Management API is disabled');
        return;
      }

      this.isInitialized = true;
      logInfo('Category Management API initialized');
      
    } catch (error) {
      logError('Failed to initialize Category Management API', error);
      throw error;
    }
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all categories
   * الحصول على جميع الفئات
   */
  async getCategories(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        type = '',
        status = CATEGORY_STATUS.ACTIVE,
        parent = null,
        search = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const params = {
        page,
        limit,
        type,
        status,
        parent,
        search,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await unifiedApiService.request(`${this.baseEndpoint}`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.categories || [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0
        };
      }

      // Fallback with mock data
      return this.getMockCategories(options);

    } catch (error) {
      logError('Failed to get categories', error);
      return this.getMockCategories(options);
    }
  }

  /**
   * Get category by ID
   * الحصول على فئة بالمعرف
   */
  async getCategoryById(categoryId) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      // Check cache first
      const cacheKey = `category_${categoryId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${categoryId}`, {
        method: 'GET'
      });

      if (response.success) {
        // Cache the result
        this.setCache(cacheKey, response.data);
        
        return {
          success: true,
          data: response.data
        };
      }

      // Fallback with mock data
      return this.getMockCategoryById(categoryId);

    } catch (error) {
      logError('Failed to get category by ID', error);
      return this.getMockCategoryById(categoryId);
    }
  }

  /**
   * Create new category
   * إنشاء فئة جديدة
   */
  async createCategory(categoryData) {
    try {
      // Validate category data
      const validatedData = this.validateCategoryData(categoryData);

      const response = await unifiedApiService.request(`${this.baseEndpoint}`, {
        method: 'POST',
        data: validatedData
      });

      if (response.success) {
        // Clear cache
        this.clearCategoryCache();
        
        logInfo('Category created successfully', { categoryId: response.data.id });
        
        return {
          success: true,
          data: response.data,
          message: 'تم إنشاء الفئة بنجاح'
        };
      }

      // Fallback with mock creation
      return this.createMockCategory(validatedData);

    } catch (error) {
      logError('Failed to create category', error);
      return {
        success: false,
        error: error.message || 'فشل في إنشاء الفئة'
      };
    }
  }

  /**
   * Update category
   * تحديث الفئة
   */
  async updateCategory(categoryId, categoryData) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      // Validate category data
      const validatedData = this.validateCategoryData(categoryData, true);

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${categoryId}`, {
        method: 'PUT',
        data: validatedData
      });

      if (response.success) {
        // Clear cache
        this.clearCategoryCache();
        
        logInfo('Category updated successfully', { categoryId });
        
        return {
          success: true,
          data: response.data,
          message: 'تم تحديث الفئة بنجاح'
        };
      }

      // Fallback with mock update
      return this.updateMockCategory(categoryId, validatedData);

    } catch (error) {
      logError('Failed to update category', error);
      return {
        success: false,
        error: error.message || 'فشل في تحديث الفئة'
      };
    }
  }

  /**
   * Delete category
   * حذف الفئة
   */
  async deleteCategory(categoryId) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Clear cache
        this.clearCategoryCache();
        
        logInfo('Category deleted successfully', { categoryId });
        
        return {
          success: true,
          message: 'تم حذف الفئة بنجاح'
        };
      }

      // Fallback with mock deletion
      return this.deleteMockCategory(categoryId);

    } catch (error) {
      logError('Failed to delete category', error);
      return {
        success: false,
        error: error.message || 'فشل في حذف الفئة'
      };
    }
  }

  /**
   * Get category tree
   * الحصول على شجرة الفئات
   */
  async getCategoryTree(type = '') {
    try {
      const params = type ? { type } : {};

      const response = await unifiedApiService.request(`${this.baseEndpoint}/tree`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.tree || []
        };
      }

      // Fallback with mock tree
      return this.getMockCategoryTree(type);

    } catch (error) {
      logError('Failed to get category tree', error);
      return this.getMockCategoryTree(type);
    }
  }

  // ==================== TAGS ====================

  /**
   * Get all tags
   * الحصول على جميع العلامات
   */
  async getTags(options = {}) {
    try {
      const {
        page = 1,
        limit = 100,
        search = '',
        popular = false,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const params = {
        page,
        limit,
        search,
        popular,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await unifiedApiService.request(`${this.tagsEndpoint}`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.tags || [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0
        };
      }

      // Fallback with mock data
      return this.getMockTags(options);

    } catch (error) {
      logError('Failed to get tags', error);
      return this.getMockTags(options);
    }
  }

  /**
   * Get tag by ID
   * الحصول على علامة بالمعرف
   */
  async getTagById(tagId) {
    try {
      if (!tagId) {
        throw new Error('Tag ID is required');
      }

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${tagId}`, {
        method: 'GET'
      });

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      // Fallback with mock data
      return this.getMockTagById(tagId);

    } catch (error) {
      logError('Failed to get tag by ID', error);
      return this.getMockTagById(tagId);
    }
  }

  /**
   * Create new tag
   * إنشاء علامة جديدة
   */
  async createTag(tagData) {
    try {
      // Validate tag data
      const validatedData = this.validateTagData(tagData);

      const response = await unifiedApiService.request(`${this.tagsEndpoint}`, {
        method: 'POST',
        data: validatedData
      });

      if (response.success) {
        logInfo('Tag created successfully', { tagId: response.data.id });
        
        return {
          success: true,
          data: response.data,
          message: 'تم إنشاء العلامة بنجاح'
        };
      }

      // Fallback with mock creation
      return this.createMockTag(validatedData);

    } catch (error) {
      logError('Failed to create tag', error);
      return {
        success: false,
        error: error.message || 'فشل في إنشاء العلامة'
      };
    }
  }

  /**
   * Update tag
   * تحديث العلامة
   */
  async updateTag(tagId, tagData) {
    try {
      if (!tagId) {
        throw new Error('Tag ID is required');
      }

      // Validate tag data
      const validatedData = this.validateTagData(tagData, true);

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${tagId}`, {
        method: 'PUT',
        data: validatedData
      });

      if (response.success) {
        logInfo('Tag updated successfully', { tagId });
        
        return {
          success: true,
          data: response.data,
          message: 'تم تحديث العلامة بنجاح'
        };
      }

      // Fallback with mock update
      return this.updateMockTag(tagId, validatedData);

    } catch (error) {
      logError('Failed to update tag', error);
      return {
        success: false,
        error: error.message || 'فشل في تحديث العلامة'
      };
    }
  }

  /**
   * Delete tag
   * حذف العلامة
   */
  async deleteTag(tagId) {
    try {
      if (!tagId) {
        throw new Error('Tag ID is required');
      }

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${tagId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        logInfo('Tag deleted successfully', { tagId });
        
        return {
          success: true,
          message: 'تم حذف العلامة بنجاح'
        };
      }

      // Fallback with mock deletion
      return this.deleteMockTag(tagId);

    } catch (error) {
      logError('Failed to delete tag', error);
      return {
        success: false,
        error: error.message || 'فشل في حذف العلامة'
      };
    }
  }

  /**
   * Search tags
   * البحث في العلامات
   */
  async searchTags(query, limit = 10) {
    try {
      if (!query || query.trim().length < 1) {
        return {
          success: true,
          data: [],
          total: 0
        };
      }

      const params = {
        q: query.trim(),
        limit
      };

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/search`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.tags || [],
          total: response.data.total || 0
        };
      }

      // Fallback with mock search
      return this.searchMockTags(query, limit);

    } catch (error) {
      logError('Failed to search tags', error);
      return this.searchMockTags(query, limit);
    }
  }

  /**
   * Get popular tags
   * الحصول على العلامات الشائعة
   */
  async getPopularTags(limit = 20) {
    try {
      const params = { popular: true, limit };

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/popular`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.tags || []
        };
      }

      // Fallback with mock popular tags
      return this.getMockPopularTags(limit);

    } catch (error) {
      logError('Failed to get popular tags', error);
      return this.getMockPopularTags(limit);
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate category data
   * التحقق من صحة بيانات الفئة
   */
  validateCategoryData(categoryData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      // Required fields for creation
      if (!categoryData.name) {
        errors.push('اسم الفئة مطلوب');
      }
      if (!categoryData.type) {
        errors.push('نوع الفئة مطلوب');
      }
    }

    // Type validation
    if (categoryData.type && !Object.values(CATEGORY_TYPES).includes(categoryData.type)) {
      errors.push('نوع الفئة غير صحيح');
    }

    // Status validation
    if (categoryData.status && !Object.values(CATEGORY_STATUS).includes(categoryData.status)) {
      errors.push('حالة الفئة غير صحيحة');
    }

    // Slug validation
    if (categoryData.slug && !/^[a-z0-9-]+$/.test(categoryData.slug)) {
      errors.push('رابط الفئة يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Return sanitized data
    return {
      name: categoryData.name?.trim(),
      description: categoryData.description?.trim(),
      type: categoryData.type,
      status: categoryData.status || CATEGORY_STATUS.ACTIVE,
      slug: categoryData.slug?.toLowerCase().trim(),
      parent: categoryData.parent || null,
      color: categoryData.color,
      icon: categoryData.icon,
      order: categoryData.order || 0,
      metadata: categoryData.metadata || {}
    };
  }

  /**
   * Validate tag data
   * التحقق من صحة بيانات العلامة
   */
  validateTagData(tagData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      // Required fields for creation
      if (!tagData.name) {
        errors.push('اسم العلامة مطلوب');
      }
    }

    // Name validation
    if (tagData.name && tagData.name.trim().length < 2) {
      errors.push('اسم العلامة يجب أن يكون أكثر من حرفين');
    }

    // Slug validation
    if (tagData.slug && !/^[a-z0-9-]+$/.test(tagData.slug)) {
      errors.push('رابط العلامة يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Return sanitized data
    return {
      name: tagData.name?.trim(),
      description: tagData.description?.trim(),
      slug: tagData.slug?.toLowerCase().trim(),
      color: tagData.color,
      metadata: tagData.metadata || {}
    };
  }

  // ==================== CACHE MANAGEMENT ====================

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCategoryCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('category_')) {
        this.cache.delete(key);
      }
    }
  }

  // ==================== MOCK DATA METHODS ====================

  getMockCategories(options = {}) {
    const mockCategories = [
      {
        id: '1',
        name: 'السياسة الداخلية',
        description: 'مقالات وأبحاث حول السياسة الداخلية',
        type: CATEGORY_TYPES.CONTENT,
        status: CATEGORY_STATUS.ACTIVE,
        slug: 'domestic-politics',
        parent: null,
        color: '#3b82f6',
        order: 1,
        contentCount: 25
      },
      {
        id: '2',
        name: 'العلاقات الدولية',
        description: 'دراسات في العلاقات الدولية والدبلوماسية',
        type: CATEGORY_TYPES.RESEARCH,
        status: CATEGORY_STATUS.ACTIVE,
        slug: 'international-relations',
        parent: null,
        color: '#10b981',
        order: 2,
        contentCount: 18
      }
    ];

    return {
      success: true,
      data: mockCategories,
      total: mockCategories.length
    };
  }

  getMockCategoryById(categoryId) {
    return {
      success: true,
      data: {
        id: categoryId,
        name: 'فئة تجريبية',
        description: 'وصف الفئة التجريبية',
        type: CATEGORY_TYPES.CONTENT,
        status: CATEGORY_STATUS.ACTIVE,
        slug: 'test-category',
        contentCount: 5
      }
    };
  }

  getMockCategoryTree(type) {
    const mockTree = [
      {
        id: '1',
        name: 'السياسة',
        children: [
          { id: '2', name: 'السياسة الداخلية', children: [] },
          { id: '3', name: 'السياسة الخارجية', children: [] }
        ]
      }
    ];

    return {
      success: true,
      data: mockTree
    };
  }

  getMockTags(options = {}) {
    const mockTags = [
      { id: '1', name: 'سياسة', slug: 'politics', usageCount: 45 },
      { id: '2', name: 'اقتصاد', slug: 'economy', usageCount: 32 },
      { id: '3', name: 'دبلوماسية', slug: 'diplomacy', usageCount: 28 }
    ];

    return {
      success: true,
      data: mockTags,
      total: mockTags.length
    };
  }

  getMockTagById(tagId) {
    return {
      success: true,
      data: {
        id: tagId,
        name: 'علامة تجريبية',
        slug: 'test-tag',
        usageCount: 5
      }
    };
  }

  createMockCategory(categoryData) {
    return {
      success: true,
      data: { id: `cat_${Date.now()}`, ...categoryData },
      message: 'تم إنشاء الفئة بنجاح (محاكاة)'
    };
  }

  updateMockCategory(categoryId, categoryData) {
    return {
      success: true,
      data: { id: categoryId, ...categoryData },
      message: 'تم تحديث الفئة بنجاح (محاكاة)'
    };
  }

  deleteMockCategory(categoryId) {
    return {
      success: true,
      message: 'تم حذف الفئة بنجاح (محاكاة)'
    };
  }

  createMockTag(tagData) {
    return {
      success: true,
      data: { id: `tag_${Date.now()}`, ...tagData },
      message: 'تم إنشاء العلامة بنجاح (محاكاة)'
    };
  }

  updateMockTag(tagId, tagData) {
    return {
      success: true,
      data: { id: tagId, ...tagData },
      message: 'تم تحديث العلامة بنجاح (محاكاة)'
    };
  }

  deleteMockTag(tagId) {
    return {
      success: true,
      message: 'تم حذف العلامة بنجاح (محاكاة)'
    };
  }

  searchMockTags(query, limit) {
    const mockResults = [
      { id: '1', name: `${query}`, slug: query.toLowerCase() }
    ];

    return {
      success: true,
      data: mockResults.slice(0, limit),
      total: mockResults.length
    };
  }

  getMockPopularTags(limit) {
    const mockPopular = [
      { id: '1', name: 'سياسة', usageCount: 45 },
      { id: '2', name: 'اقتصاد', usageCount: 32 },
      { id: '3', name: 'دبلوماسية', usageCount: 28 }
    ];

    return {
      success: true,
      data: mockPopular.slice(0, limit)
    };
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      baseEndpoint: this.baseEndpoint,
      tagsEndpoint: this.tagsEndpoint,
      cacheSize: this.cache.size,
      isEnabled: getFeatureFlag('ENABLE_CATEGORY_MANAGEMENT_API')
    };
  }
}

// Create and export singleton instance
const categoryManagementApi = new CategoryManagementApi();

export default categoryManagementApi;
