/**
 * Content Bridge Service
 * خدمة الجسر للمحتوى
 * 
 * Bridges the gap between dashboard content management and frontend display
 * يربط بين إدارة المحتوى في لوحة التحكم وعرضه في الواجهة الأمامية
 */

import { unifiedContentService } from './unifiedContentService.js';
import { ENV } from '../config/environment.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';
import { supabase } from '../config/supabase.js';

class ContentBridgeService {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the bridge service
   * تهيئة خدمة الجسر
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize unified content service
      await unifiedContentService.initialize();
      
      // Set up real-time listeners
      this.setupRealtimeSync();
      
      this.isInitialized = true;
      console.log('ContentBridge initialized successfully');
    } catch (error) {
      console.error('ContentBridge initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set up real-time synchronization
   * إعداد المزامنة الفورية
   */
  setupRealtimeSync() {
    if (!ENV.SUPABASE.ENABLED) return;

    // Listen for content changes
    supabase
      .channel('content_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'content' },
        (payload) => this.handleContentChange(payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => this.handleCategoryChange(payload)
      )
      .subscribe();
  }

  /**
   * Handle content changes from dashboard
   * معالجة تغييرات المحتوى من لوحة التحكم
   */
  handleContentChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Update cache
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      this.updateContentCache(newRecord);
    } else if (eventType === 'DELETE') {
      this.removeFromCache('content', oldRecord.id);
    }

    // Notify subscribers
    this.notifySubscribers('content', {
      type: eventType,
      data: newRecord || oldRecord
    });
  }

  /**
   * Handle category changes
   * معالجة تغييرات الفئات
   */
  handleCategoryChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Update cache
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      this.updateCategoryCache(newRecord);
    } else if (eventType === 'DELETE') {
      this.removeFromCache('categories', oldRecord.id);
    }

    // Notify subscribers
    this.notifySubscribers('categories', {
      type: eventType,
      data: newRecord || oldRecord
    });
  }

  /**
   * Get content for frontend display
   * الحصول على المحتوى لعرضه في الواجهة الأمامية
   */
  async getContentForDisplay(options = {}) {
    const {
      type = null,
      status = CONTENT_STATUS.PUBLISHED,
      featured = null,
      limit = 10,
      offset = 0,
      includeCategories = true,
      includeTags = true
    } = options;

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('content', options);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Get content from unified service
      const result = await unifiedContentService.getContent({
        contentType: type,
        status,
        featured,
        limit,
        offset,
        includeRelated: includeCategories || includeTags
      });

      // Transform for frontend
      const transformedContent = await this.transformContentForFrontend(result.content);
      
      const response = {
        content: transformedContent,
        total: result.total,
        hasMore: result.hasMore,
        categories: includeCategories ? result.categories || [] : [],
        tags: includeTags ? result.tags || [] : []
      };

      // Cache the result
      this.cache.set(cacheKey, response);
      
      return response;

    } catch (error) {
      console.error('Error getting content for display:', error);
      
      // Return fallback data
      return {
        content: [],
        total: 0,
        hasMore: false,
        categories: [],
        tags: []
      };
    }
  }

  /**
   * Transform content for frontend display
   * تحويل المحتوى لعرضه في الواجهة الأمامية
   */
  async transformContentForFrontend(content) {
    return content.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary || item.excerpt,
      content: item.content,
      featuredImage: item.featured_image_url || item.image_url,
      publishedAt: item.published_at || item.created_at,
      author: item.author_name || 'مجهول',
      category: item.category_name,
      tags: item.tags || [],
      slug: item.slug,
      isFeatured: item.is_featured || false,
      viewCount: item.view_count || 0,
      status: item.status,
      type: item.content_type,
      
      // Additional metadata
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      publishDate: item.publish_date,
      
      // SEO fields
      metaTitle: item.meta_title,
      metaDescription: item.meta_description,
      
      // Display helpers
      formattedDate: this.formatDate(item.published_at || item.created_at),
      isNew: this.isContentNew(item.created_at),
      readingTime: this.calculateReadingTime(item.content)
    }));
  }

  /**
   * Get categories for frontend
   * الحصول على الفئات للواجهة الأمامية
   */
  async getCategoriesForDisplay() {
    try {
      const cacheKey = 'categories_display';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const categories = await unifiedContentService.getCategories();
      
      const transformedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        contentCount: cat.content_count || 0,
        color: cat.color || '#3B82F6'
      }));

      this.cache.set(cacheKey, transformedCategories);
      return transformedCategories;

    } catch (error) {
      console.error('Error getting categories for display:', error);
      return [];
    }
  }

  /**
   * Subscribe to content changes
   * الاشتراك في تغييرات المحتوى
   */
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      const typeSubscribers = this.subscribers.get(type);
      if (typeSubscribers) {
        typeSubscribers.delete(callback);
      }
    };
  }

  /**
   * Notify subscribers of changes
   * إشعار المشتركين بالتغييرات
   */
  notifySubscribers(type, payload) {
    const typeSubscribers = this.subscribers.get(type);
    if (typeSubscribers) {
      typeSubscribers.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Update content cache
   * تحديث ذاكرة التخزين المؤقت للمحتوى
   */
  updateContentCache(content) {
    // Clear related cache entries
    this.clearCacheByPattern('content');
    
    // Update specific content if cached
    const contentKey = `content_${content.id}`;
    if (this.cache.has(contentKey)) {
      this.cache.set(contentKey, content);
    }
  }

  /**
   * Update category cache
   * تحديث ذاكرة التخزين المؤقت للفئات
   */
  updateCategoryCache(category) {
    this.clearCacheByPattern('categories');
  }

  /**
   * Remove from cache
   * إزالة من ذاكرة التخزين المؤقت
   */
  removeFromCache(type, id) {
    const key = `${type}_${id}`;
    this.cache.delete(key);
    this.clearCacheByPattern(type);
  }

  /**
   * Clear cache by pattern
   * مسح ذاكرة التخزين المؤقت حسب النمط
   */
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate cache key
   * توليد مفتاح ذاكرة التخزين المؤقت
   */
  generateCacheKey(type, options) {
    return `${type}_${JSON.stringify(options)}`;
  }

  /**
   * Format date for display
   * تنسيق التاريخ للعرض
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  }

  /**
   * Check if content is new (within last 7 days)
   * فحص ما إذا كان المحتوى جديد (خلال آخر 7 أيام)
   */
  isContentNew(createdAt) {
    if (!createdAt) return false;
    
    const now = new Date();
    const contentDate = new Date(createdAt);
    const diffInDays = (now - contentDate) / (1000 * 60 * 60 * 24);
    
    return diffInDays <= 7;
  }

  /**
   * Calculate reading time
   * حساب وقت القراءة
   */
  calculateReadingTime(content) {
    if (!content) return 0;
    
    const wordsPerMinute = 200; // Arabic reading speed
    const wordCount = content.split(/\s+/).length;
    
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Clear all cache
   * مسح جميع ذاكرة التخزين المؤقت
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * الحصول على إحصائيات ذاكرة التخزين المؤقت
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const contentBridge = new ContentBridgeService();
export default contentBridge;