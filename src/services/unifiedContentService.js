// src/services/unifiedContentService.js
/**
 * Unified Content Management Service for SPSA
 * خدمة إدارة المحتوى الموحدة للجمعية السعودية للعلوم السياسية
 * 
 * This service provides a unified interface for managing all content types
 * تقدم هذه الخدمة واجهة موحدة لإدارة جميع أنواع المحتوى
 */

import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { ENV } from '../config/environment.js';
import { 
  CONTENT_TYPES, 
  CONTENT_STATUS, 
  EVENT_STATUS,
  DEFAULT_TEMPLATES,
  VALIDATION_RULES 
} from '../schemas/contentManagementSchema.js';
import { localStorageService } from '../utils/localStorage.js';
import realtimeService from './realtimeService.js';

/**
 * Storage Keys for Local Data
 * مفاتيح التخزين للبيانات المحلية
 */
const STORAGE_KEYS = {
  CONTENT: 'spsa_unified_content',
  CATEGORIES: 'spsa_content_categories',
  TAGS: 'spsa_content_tags',
  MEDIA: 'spsa_content_media'
};

/**
 * Content Service Class
 * فئة خدمة المحتوى
 */
class UnifiedContentService {
  constructor() {
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.initializeStorage();
  }

  /**
   * Initialize the service
   * تهيئة الخدمة
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.initializeStorage();
      this.isInitialized = true;
      console.log('🚀 UnifiedContentService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize UnifiedContentService:', error);
      throw error;
    }
  }

  /**
   * Initialize local storage with default data
   * تهيئة التخزين المحلي بالبيانات الافتراضية
   */
  initializeStorage() {
    try {
      // Initialize content storage
      if (!localStorageService.getItem(STORAGE_KEYS.CONTENT)) {
        localStorageService.setItem(STORAGE_KEYS.CONTENT, this.getDefaultContent());
      }

      // Initialize categories
      if (!localStorageService.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorageService.setItem(STORAGE_KEYS.CATEGORIES, this.getDefaultCategories());
      }

      // Initialize tags
      if (!localStorageService.getItem(STORAGE_KEYS.TAGS)) {
        localStorageService.setItem(STORAGE_KEYS.TAGS, this.getDefaultTags());
      }

      this.isInitialized = true;
      
      if (ENV.IS_DEVELOPMENT) {
        console.log('🗂️ UnifiedContentService initialized with local storage');
      }
    } catch (error) {
      console.error('❌ Failed to initialize UnifiedContentService:', error);
    }
  }

  /**
   * Get default content data
   * الحصول على بيانات المحتوى الافتراضية
   */
  getDefaultContent() {
    return [
      // News Articles
      {
        id: 'news-001',
        title: 'الجمعية تطلق مبادرة جديدة للبحث العلمي',
        titleAr: 'الجمعية تطلق مبادرة جديدة للبحث العلمي',
        slug: 'new-research-initiative',
        excerpt: 'أطلقت الجمعية السعودية للعلوم السياسية مبادرة جديدة لدعم البحث العلمي',
        content: 'محتوى تفصيلي عن المبادرة الجديدة...',
        contentType: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.PUBLISHED,
        category: 'أخبار',
        tags: ['بحث علمي', 'مبادرات'],
        featuredImage: '/images/news/research-initiative.jpg',
        publishedAt: new Date().toISOString(),
        authorName: 'إدارة الجمعية',
        viewsCount: 245,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Events
      {
        id: 'event-001',
        title: 'محاضرة الأمير تركي الفيصل',
        titleAr: 'محاضرة الأمير تركي الفيصل',
        slug: 'prince-turki-lecture',
        excerpt: 'محاضرة مميزة بعنوان "مستقبل العلاقات الدولية"',
        content: 'تفاصيل المحاضرة والموضوعات التي ستتم مناقشتها...',
        contentType: CONTENT_TYPES.LECTURE,
        status: CONTENT_STATUS.PUBLISHED,
        eventStatus: EVENT_STATUS.UPCOMING,
        category: 'محاضرات',
        tags: ['محاضرة', 'علاقات دولية'],
        eventDate: '2024-02-15T19:00:00Z',
        eventTime: '7:00 مساءً',
        location: 'قاعة الملك فيصل للمؤتمرات',
        locationAr: 'قاعة الملك فيصل للمؤتمرات',
        speaker: 'الأمير تركي الفيصل',
        speakerBio: 'رئيس مجلس إدارة مركز الملك فيصل للبحوث والدراسات الإسلامية',
        registrationRequired: true,
        maxAttendees: 500,
        currentAttendees: 234,
        featuredImage: '/images/events/prince-turki-lecture.jpg',
        publishedAt: new Date().toISOString(),
        authorName: 'لجنة الفعاليات',
        viewsCount: 1250,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // About Page
      {
        id: 'page-about',
        title: 'عن الجمعية',
        titleAr: 'عن الجمعية',
        slug: 'about-us',
        content: 'الجمعية السعودية للعلوم السياسية هي منظمة علمية متخصصة...',
        contentType: CONTENT_TYPES.ABOUT,
        status: CONTENT_STATUS.PUBLISHED,
        category: 'صفحات',
        allowComments: false,
        isPublic: true,
        publishedAt: new Date().toISOString(),
        authorName: 'إدارة الموقع',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * Get default categories
   * الحصول على التصنيفات الافتراضية
   */
  getDefaultCategories() {
    return [
      { id: 'cat-001', name: 'أخبار', nameAr: 'أخبار', slug: 'news', color: '#3B82F6', isActive: true },
      { id: 'cat-002', name: 'فعاليات', nameAr: 'فعاليات', slug: 'events', color: '#10B981', isActive: true },
      { id: 'cat-003', name: 'محاضرات', nameAr: 'محاضرات', slug: 'lectures', color: '#8B5CF6', isActive: true },
      { id: 'cat-004', name: 'مقالات', nameAr: 'مقالات', slug: 'articles', color: '#F59E0B', isActive: true },
      { id: 'cat-005', name: 'صفحات', nameAr: 'صفحات', slug: 'pages', color: '#6B7280', isActive: true }
    ];
  }

  /**
   * Get default tags
   * الحصول على الكلمات المفتاحية الافتراضية
   */
  getDefaultTags() {
    return [
      { id: 'tag-001', name: 'بحث علمي', slug: 'research', usageCount: 15 },
      { id: 'tag-002', name: 'علاقات دولية', slug: 'international-relations', usageCount: 12 },
      { id: 'tag-003', name: 'سياسة', slug: 'politics', usageCount: 20 },
      { id: 'tag-004', name: 'مؤتمر', slug: 'conference', usageCount: 8 },
      { id: 'tag-005', name: 'ورشة عمل', slug: 'workshop', usageCount: 6 }
    ];
  }

  /**
   * Validate content data
   * التحقق من صحة بيانات المحتوى
   */
  validateContent(contentData) {
    const errors = [];

    // Required fields validation
    if (!contentData.title || contentData.title.length < VALIDATION_RULES.title.minLength) {
      errors.push('العنوان مطلوب ويجب أن يكون أكثر من 5 أحرف');
    }

    if (!contentData.content || contentData.content.length < VALIDATION_RULES.content.minLength) {
      errors.push('المحتوى مطلوب ويجب أن يكون أكثر من 50 حرف');
    }

    if (!contentData.slug || !VALIDATION_RULES.slug.pattern.test(contentData.slug)) {
      errors.push('الرابط المختصر مطلوب ويجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط');
    }

    // Event-specific validation
    if ([CONTENT_TYPES.EVENT, CONTENT_TYPES.LECTURE, CONTENT_TYPES.CONFERENCE].includes(contentData.contentType)) {
      if (!contentData.eventDate) {
        errors.push('تاريخ الفعالية مطلوب');
      }
      if (!contentData.location) {
        errors.push('مكان الفعالية مطلوب');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate unique slug
   * إنشاء رابط مختصر فريد
   */
  generateSlug(title, existingContent = []) {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (existingContent.some(content => content.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Get all content with filtering and pagination
   * الحصول على جميع المحتوى مع التصفية والترقيم
   */
  async getContent(options = {}) {
    try {
      const {
        contentType,
        status,
        category,
        featured,
        limit = 10,
        offset = 0,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Try to get from API first
      if (getFeatureFlag('USE_NEW_CONTENT')) {
        try {
          const response = await unifiedApiService.request('/content', {
            method: 'GET',
            requestType: 'CONTENT',
            params: options
          });

          if (response.success) {
            return response.data;
          }
        } catch (error) {
          if (ENV.IS_DEVELOPMENT) {
            console.warn('🟡 API request failed, using local storage:', error.message);
          }
        }
      }

      // Fallback to local storage
      let content = localStorageService.getItem(STORAGE_KEYS.CONTENT) || [];

      // Apply filters
      if (contentType) {
        content = content.filter(item => item.contentType === contentType);
      }

      if (status) {
        content = content.filter(item => item.status === status);
      }

      if (category) {
        content = content.filter(item => item.category === category);
      }

      if (featured !== undefined) {
        content = content.filter(item => item.isFeatured === featured);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        content = content.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }

      // Sort content
      content.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'desc') {
          return new Date(bValue) - new Date(aValue);
        } else {
          return new Date(aValue) - new Date(bValue);
        }
      });

      // Apply pagination
      const total = content.length;
      const paginatedContent = content.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedContent,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };

    } catch (error) {
      console.error('❌ Error getting content:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get content by ID
   * الحصول على المحتوى بالمعرف
   */
  async getContentById(id) {
    try {
      // Try API first
      if (getFeatureFlag('USE_NEW_CONTENT')) {
        try {
          const response = await unifiedApiService.request(`/content/${id}`, {
            method: 'GET',
            requestType: 'CONTENT'
          });

          if (response.success) {
            return response.data;
          }
        } catch (error) {
          if (ENV.IS_DEVELOPMENT) {
            console.warn('🟡 API request failed, using local storage:', error.message);
          }
        }
      }

      // Fallback to local storage
      const content = localStorageService.getItem(STORAGE_KEYS.CONTENT) || [];
      const item = content.find(c => c.id === id);

      if (!item) {
        throw new Error('المحتوى غير موجود');
      }

      // Increment view count
      item.viewsCount = (item.viewsCount || 0) + 1;
      item.updatedAt = new Date().toISOString();
      
      localStorageService.setItem(STORAGE_KEYS.CONTENT, content);

      return {
        success: true,
        data: item
      };

    } catch (error) {
      console.error('❌ Error getting content by ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create new content
   * إنشاء محتوى جديد
   */
  async createContent(contentData) {
    try {
      // Validate content
      const validation = this.validateContent(contentData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Generate ID and slug if not provided
      const content = localStorageService.getItem(STORAGE_KEYS.CONTENT) || [];
      const newId = contentData.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const slug = contentData.slug || this.generateSlug(contentData.title, content);

      const newContent = {
        ...contentData,
        id: newId,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewsCount: 0,
        likesCount: 0,
        sharesCount: 0
      };

      // Try API first
      if (getFeatureFlag('USE_NEW_CONTENT')) {
        try {
          const response = await unifiedApiService.request('/content', {
            method: 'POST',
            requestType: 'CONTENT',
            data: newContent
          });

          if (response.success) {
            // Broadcast real-time update
            await realtimeService.broadcastUpdate('content_created', {
              content: response.data,
              contentType: newContent.contentType
            });

            return response;
          }
        } catch (error) {
          if (ENV.IS_DEVELOPMENT) {
            console.warn('🟡 API request failed, using local storage:', error.message);
          }
        }
      }

      // Fallback to local storage
      content.push(newContent);
      localStorageService.setItem(STORAGE_KEYS.CONTENT, content);

      // Broadcast real-time update
      await realtimeService.broadcastUpdate('content_created', {
        content: newContent,
        contentType: newContent.contentType
      });

      return {
        success: true,
        data: newContent,
        message: 'تم إنشاء المحتوى بنجاح'
      };

    } catch (error) {
      console.error('❌ Error creating content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update existing content
   * تحديث المحتوى الموجود
   */
  async updateContent(id, updateData) {
    try {
      // Validate update data
      const validation = this.validateContent({ ...updateData, id });
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Try API first
      if (getFeatureFlag('USE_NEW_CONTENT')) {
        try {
          const response = await unifiedApiService.request(`/content/${id}`, {
            method: 'PUT',
            requestType: 'CONTENT',
            data: updateData
          });

          if (response.success) {
            // Broadcast real-time update
            await realtimeService.broadcastUpdate('content_updated', {
              content: response.data,
              contentType: response.data.contentType
            });

            return response;
          }
        } catch (error) {
          if (ENV.IS_DEVELOPMENT) {
            console.warn('🟡 API request failed, using local storage:', error.message);
          }
        }
      }

      // Fallback to local storage
      const content = localStorageService.getItem(STORAGE_KEYS.CONTENT) || [];
      const index = content.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('المحتوى غير موجود');
      }

      const updatedContent = {
        ...content[index],
        ...updateData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      content[index] = updatedContent;
      localStorageService.setItem(STORAGE_KEYS.CONTENT, content);

      // Broadcast real-time update
      await realtimeService.broadcastUpdate('content_updated', {
        content: updatedContent,
        contentType: updatedContent.contentType
      });

      return {
        success: true,
        data: updatedContent,
        message: 'تم تحديث المحتوى بنجاح'
      };

    } catch (error) {
      console.error('❌ Error updating content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete content (soft delete)
   * حذف المحتوى (حذف مؤقت)
   */
  async deleteContent(id) {
    try {
      // Try API first
      if (getFeatureFlag('USE_NEW_CONTENT')) {
        try {
          const response = await unifiedApiService.request(`/content/${id}`, {
            method: 'DELETE',
            requestType: 'CONTENT'
          });

          if (response.success) {
            // Broadcast real-time update
            await realtimeService.broadcastUpdate('content_deleted', {
              contentId: id
            });

            return response;
          }
        } catch (error) {
          if (ENV.IS_DEVELOPMENT) {
            console.warn('🟡 API request failed, using local storage:', error.message);
          }
        }
      }

      // Fallback to local storage
      const content = localStorageService.getItem(STORAGE_KEYS.CONTENT) || [];
      const index = content.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('المحتوى غير موجود');
      }

      // Soft delete
      content[index].status = CONTENT_STATUS.DELETED;
      content[index].deletedAt = new Date().toISOString();
      content[index].updatedAt = new Date().toISOString();

      localStorageService.setItem(STORAGE_KEYS.CONTENT, content);

      // Broadcast real-time update
      await realtimeService.broadcastUpdate('content_deleted', {
        contentId: id
      });

      return {
        success: true,
        message: 'تم حذف المحتوى بنجاح'
      };

    } catch (error) {
      console.error('❌ Error deleting content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get categories
   * الحصول على التصنيفات
   */
  async getCategories() {
    try {
      return {
        success: true,
        data: localStorageService.getItem(STORAGE_KEYS.CATEGORIES) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get tags
   * الحصول على الكلمات المفتاحية
   */
  async getTags() {
    try {
      return {
        success: true,
        data: localStorageService.getItem(STORAGE_KEYS.TAGS) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get content statistics
   * الحصول على إحصائيات المحتوى
   */
  async getContentStats() {
    try {
      const content = localStorageService.getItem(STORAGE_KEYS.CONTENT) || [];

      const stats = {
        total: content.length,
        published: content.filter(c => c.status === CONTENT_STATUS.PUBLISHED).length,
        draft: content.filter(c => c.status === CONTENT_STATUS.DRAFT).length,
        archived: content.filter(c => c.status === CONTENT_STATUS.ARCHIVED).length,
        byType: {},
        totalViews: content.reduce((sum, c) => sum + (c.viewsCount || 0), 0),
        totalLikes: content.reduce((sum, c) => sum + (c.likesCount || 0), 0)
      };

      // Count by content type
      Object.values(CONTENT_TYPES).forEach(type => {
        stats.byType[type] = content.filter(c => c.contentType === type).length;
      });

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * Search content
   * البحث في المحتوى
   */
  async searchContent(query, options = {}) {
    try {
      const searchOptions = {
        ...options,
        search: query,
        limit: options.limit || 20
      };

      return await this.getContent(searchOptions);

    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

// Create and export singleton instance
export const unifiedContentService = new UnifiedContentService();
export default unifiedContentService;
