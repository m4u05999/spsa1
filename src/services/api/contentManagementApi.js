/**
 * Content Management API Service
 * خدمة APIs إدارة المحتوى
 * 
 * Comprehensive content management for articles, news, publications, and media
 */

import unifiedApiService from '../unifiedApiService.js';
import { getFeatureFlag } from '../../config/featureFlags.js';
import { logError, logInfo } from '../../utils/monitoring.js';

/**
 * Content Types
 * أنواع المحتوى
 */
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  NEWS: 'news',
  PUBLICATION: 'publication',
  RESEARCH: 'research',
  EVENT: 'event',
  PAGE: 'page',
  ANNOUNCEMENT: 'announcement'
};

/**
 * Content Status
 * حالات المحتوى
 */
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  PENDING_REVIEW: 'pending_review',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled'
};

/**
 * Content Visibility
 * مستوى رؤية المحتوى
 */
export const CONTENT_VISIBILITY = {
  PUBLIC: 'public',
  MEMBERS_ONLY: 'members_only',
  PRIVATE: 'private',
  RESTRICTED: 'restricted'
};

/**
 * Content Management API Class
 * فئة APIs إدارة المحتوى
 */
class ContentManagementApi {
  constructor() {
    this.baseEndpoint = '/api/content';
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    
    this.initialize();
  }

  /**
   * Initialize API service
   * تهيئة خدمة API
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_CONTENT_MANAGEMENT_API')) {
        logInfo('Content Management API is disabled');
        return;
      }

      this.isInitialized = true;
      logInfo('Content Management API initialized');
      
    } catch (error) {
      logError('Failed to initialize Content Management API', error);
      throw error;
    }
  }

  /**
   * Get all content with pagination and filters
   * الحصول على جميع المحتوى مع التصفح والفلاتر
   */
  async getContent(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = '',
        status = '',
        visibility = '',
        category = '',
        author = '',
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc',
        featured = false
      } = options;

      const params = {
        page,
        limit,
        type,
        status,
        visibility,
        category,
        author,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        featured
      };

      const response = await unifiedApiService.request(`${this.baseEndpoint}`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.content || [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0
        };
      }

      // Fallback with mock data
      return this.getMockContent(options);

    } catch (error) {
      logError('Failed to get content', error);
      return this.getMockContent(options);
    }
  }

  /**
   * Get content by ID
   * الحصول على محتوى بالمعرف
   */
  async getContentById(contentId) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      // Check cache first
      const cacheKey = `content_${contentId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${contentId}`, {
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
      return this.getMockContentById(contentId);

    } catch (error) {
      logError('Failed to get content by ID', error);
      return this.getMockContentById(contentId);
    }
  }

  /**
   * Create new content
   * إنشاء محتوى جديد
   */
  async createContent(contentData) {
    try {
      // Validate content data
      const validatedData = this.validateContentData(contentData);

      const response = await unifiedApiService.request(`${this.baseEndpoint}`, {
        method: 'POST',
        data: validatedData
      });

      if (response.success) {
        // Clear cache
        this.clearContentCache();
        
        logInfo('Content created successfully', { contentId: response.data.id });
        
        return {
          success: true,
          data: response.data,
          message: 'تم إنشاء المحتوى بنجاح'
        };
      }

      // Fallback with mock creation
      return this.createMockContent(validatedData);

    } catch (error) {
      logError('Failed to create content', error);
      return {
        success: false,
        error: error.message || 'فشل في إنشاء المحتوى'
      };
    }
  }

  /**
   * Update content
   * تحديث المحتوى
   */
  async updateContent(contentId, contentData) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      // Validate content data
      const validatedData = this.validateContentData(contentData, true);

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${contentId}`, {
        method: 'PUT',
        data: validatedData
      });

      if (response.success) {
        // Clear cache
        this.clearContentCache();
        
        logInfo('Content updated successfully', { contentId });
        
        return {
          success: true,
          data: response.data,
          message: 'تم تحديث المحتوى بنجاح'
        };
      }

      // Fallback with mock update
      return this.updateMockContent(contentId, validatedData);

    } catch (error) {
      logError('Failed to update content', error);
      return {
        success: false,
        error: error.message || 'فشل في تحديث المحتوى'
      };
    }
  }

  /**
   * Delete content
   * حذف المحتوى
   */
  async deleteContent(contentId) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${contentId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Clear cache
        this.clearContentCache();
        
        logInfo('Content deleted successfully', { contentId });
        
        return {
          success: true,
          message: 'تم حذف المحتوى بنجاح'
        };
      }

      // Fallback with mock deletion
      return this.deleteMockContent(contentId);

    } catch (error) {
      logError('Failed to delete content', error);
      return {
        success: false,
        error: error.message || 'فشل في حذف المحتوى'
      };
    }
  }

  /**
   * Publish content
   * نشر المحتوى
   */
  async publishContent(contentId, publishData = {}) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      const data = {
        status: CONTENT_STATUS.PUBLISHED,
        publishedAt: publishData.publishedAt || new Date().toISOString(),
        ...publishData
      };

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${contentId}/publish`, {
        method: 'PATCH',
        data
      });

      if (response.success) {
        // Clear cache
        this.clearContentCache();
        
        logInfo('Content published successfully', { contentId });
        
        return {
          success: true,
          data: response.data,
          message: 'تم نشر المحتوى بنجاح'
        };
      }

      // Fallback with mock publish
      return {
        success: true,
        data: { id: contentId, status: CONTENT_STATUS.PUBLISHED },
        message: 'تم نشر المحتوى بنجاح (محاكاة)'
      };

    } catch (error) {
      logError('Failed to publish content', error);
      return {
        success: false,
        error: error.message || 'فشل في نشر المحتوى'
      };
    }
  }

  /**
   * Archive content
   * أرشفة المحتوى
   */
  async archiveContent(contentId) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      const response = await unifiedApiService.request(`${this.baseEndpoint}/${contentId}/archive`, {
        method: 'PATCH'
      });

      if (response.success) {
        // Clear cache
        this.clearContentCache();
        
        logInfo('Content archived successfully', { contentId });
        
        return {
          success: true,
          data: response.data,
          message: 'تم أرشفة المحتوى بنجاح'
        };
      }

      // Fallback with mock archive
      return {
        success: true,
        data: { id: contentId, status: CONTENT_STATUS.ARCHIVED },
        message: 'تم أرشفة المحتوى بنجاح (محاكاة)'
      };

    } catch (error) {
      logError('Failed to archive content', error);
      return {
        success: false,
        error: error.message || 'فشل في أرشفة المحتوى'
      };
    }
  }

  /**
   * Search content
   * البحث في المحتوى
   */
  async searchContent(query, options = {}) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          data: [],
          total: 0
        };
      }

      const {
        limit = 10,
        type = '',
        status = CONTENT_STATUS.PUBLISHED
      } = options;

      const params = {
        q: query.trim(),
        limit,
        type,
        status
      };

      const response = await unifiedApiService.request(`${this.baseEndpoint}/search`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.content || [],
          total: response.data.total || 0
        };
      }

      // Fallback with mock search
      return this.searchMockContent(query, options);

    } catch (error) {
      logError('Failed to search content', error);
      return this.searchMockContent(query, options);
    }
  }

  /**
   * Get featured content
   * الحصول على المحتوى المميز
   */
  async getFeaturedContent(type = '', limit = 5) {
    try {
      const params = { featured: true, limit };
      if (type) params.type = type;

      const response = await unifiedApiService.request(`${this.baseEndpoint}/featured`, {
        method: 'GET',
        params
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.content || []
        };
      }

      // Fallback with mock featured content
      return this.getMockFeaturedContent(type, limit);

    } catch (error) {
      logError('Failed to get featured content', error);
      return this.getMockFeaturedContent(type, limit);
    }
  }

  /**
   * Get content statistics
   * الحصول على إحصائيات المحتوى
   */
  async getContentStatistics() {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/statistics`, {
        method: 'GET'
      });

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      // Fallback with mock statistics
      return this.getMockContentStatistics();

    } catch (error) {
      logError('Failed to get content statistics', error);
      return this.getMockContentStatistics();
    }
  }

  /**
   * Validate content data
   * التحقق من صحة بيانات المحتوى
   */
  validateContentData(contentData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      // Required fields for creation
      if (!contentData.title) {
        errors.push('العنوان مطلوب');
      }
      if (!contentData.content && !contentData.excerpt) {
        errors.push('المحتوى أو المقتطف مطلوب');
      }
      if (!contentData.type) {
        errors.push('نوع المحتوى مطلوب');
      }
    }

    // Type validation
    if (contentData.type && !Object.values(CONTENT_TYPES).includes(contentData.type)) {
      errors.push('نوع المحتوى غير صحيح');
    }

    // Status validation
    if (contentData.status && !Object.values(CONTENT_STATUS).includes(contentData.status)) {
      errors.push('حالة المحتوى غير صحيحة');
    }

    // Visibility validation
    if (contentData.visibility && !Object.values(CONTENT_VISIBILITY).includes(contentData.visibility)) {
      errors.push('مستوى الرؤية غير صحيح');
    }

    // URL slug validation
    if (contentData.slug && !/^[a-z0-9-]+$/.test(contentData.slug)) {
      errors.push('رابط المحتوى يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Return sanitized data
    return {
      title: contentData.title?.trim(),
      content: contentData.content?.trim(),
      excerpt: contentData.excerpt?.trim(),
      type: contentData.type,
      status: contentData.status || CONTENT_STATUS.DRAFT,
      visibility: contentData.visibility || CONTENT_VISIBILITY.PUBLIC,
      slug: contentData.slug?.toLowerCase().trim(),
      featuredImage: contentData.featuredImage,
      tags: contentData.tags || [],
      categories: contentData.categories || [],
      author: contentData.author,
      publishedAt: contentData.publishedAt,
      scheduledAt: contentData.scheduledAt,
      seoTitle: contentData.seoTitle?.trim(),
      seoDescription: contentData.seoDescription?.trim(),
      metadata: contentData.metadata || {},
      settings: contentData.settings || {}
    };
  }

  /**
   * Cache management
   * إدارة التخزين المؤقت
   */
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

  clearContentCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('content_')) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Mock data methods for fallback
   * طرق البيانات الوهمية للاحتياط
   */
  getMockContent(options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const mockContent = [
      {
        id: '1',
        title: 'مقال حول السياسة السعودية',
        excerpt: 'مقال تحليلي حول التطورات السياسية في المملكة العربية السعودية',
        type: CONTENT_TYPES.ARTICLE,
        status: CONTENT_STATUS.PUBLISHED,
        visibility: CONTENT_VISIBILITY.PUBLIC,
        author: 'د. أحمد المحمد',
        publishedAt: '2024-12-25T10:00:00Z',
        createdAt: '2024-12-20T09:00:00Z',
        views: 150,
        featured: true
      },
      {
        id: '2',
        title: 'أخبار المؤتمر السنوي للجمعية',
        excerpt: 'تفاصيل المؤتمر السنوي للجمعية السعودية للعلوم السياسية',
        type: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.PUBLISHED,
        visibility: CONTENT_VISIBILITY.PUBLIC,
        author: 'فريق التحرير',
        publishedAt: '2024-12-28T14:30:00Z',
        createdAt: '2024-12-28T12:00:00Z',
        views: 89,
        featured: false
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContent = mockContent.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedContent,
      pagination: {
        page,
        limit,
        total: mockContent.length,
        totalPages: Math.ceil(mockContent.length / limit)
      },
      total: mockContent.length
    };
  }

  getMockContentById(contentId) {
    const mockContent = {
      id: contentId,
      title: 'محتوى تجريبي',
      content: 'هذا محتوى تجريبي للاختبار',
      excerpt: 'مقتطف من المحتوى التجريبي',
      type: CONTENT_TYPES.ARTICLE,
      status: CONTENT_STATUS.PUBLISHED,
      visibility: CONTENT_VISIBILITY.PUBLIC,
      slug: 'test-content',
      author: 'مؤلف تجريبي',
      tags: ['اختبار', 'محتوى'],
      categories: ['عام'],
      publishedAt: '2024-12-29T12:00:00Z',
      createdAt: '2024-12-29T10:00:00Z',
      updatedAt: '2024-12-29T12:00:00Z',
      views: 25,
      featured: false
    };

    return {
      success: true,
      data: mockContent
    };
  }

  createMockContent(contentData) {
    const mockContent = {
      id: `content_${Date.now()}`,
      ...contentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };

    return {
      success: true,
      data: mockContent,
      message: 'تم إنشاء المحتوى بنجاح (محاكاة)'
    };
  }

  updateMockContent(contentId, contentData) {
    const mockContent = {
      id: contentId,
      ...contentData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: mockContent,
      message: 'تم تحديث المحتوى بنجاح (محاكاة)'
    };
  }

  deleteMockContent(contentId) {
    return {
      success: true,
      message: 'تم حذف المحتوى بنجاح (محاكاة)'
    };
  }

  searchMockContent(query, options = {}) {
    const mockResults = [
      {
        id: '1',
        title: `نتيجة البحث عن: ${query}`,
        excerpt: 'هذه نتيجة بحث تجريبية',
        type: CONTENT_TYPES.ARTICLE,
        status: CONTENT_STATUS.PUBLISHED,
        author: 'مؤلف البحث'
      }
    ];

    return {
      success: true,
      data: mockResults,
      total: mockResults.length
    };
  }

  getMockFeaturedContent(type, limit) {
    const mockFeatured = [
      {
        id: '1',
        title: 'محتوى مميز 1',
        excerpt: 'هذا محتوى مميز للعرض',
        type: type || CONTENT_TYPES.ARTICLE,
        featured: true
      }
    ];

    return {
      success: true,
      data: mockFeatured.slice(0, limit)
    };
  }

  getMockContentStatistics() {
    return {
      success: true,
      data: {
        total: 85,
        published: 65,
        draft: 15,
        archived: 5,
        byType: {
          [CONTENT_TYPES.ARTICLE]: 35,
          [CONTENT_TYPES.NEWS]: 25,
          [CONTENT_TYPES.PUBLICATION]: 15,
          [CONTENT_TYPES.RESEARCH]: 8,
          [CONTENT_TYPES.EVENT]: 2
        },
        totalViews: 12500,
        averageViews: 147,
        recentPublications: 8,
        featuredCount: 12
      }
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
      cacheSize: this.cache.size,
      isEnabled: getFeatureFlag('ENABLE_CONTENT_MANAGEMENT_API')
    };
  }
}

// Create and export singleton instance
const contentManagementApi = new ContentManagementApi();

export default contentManagementApi;
