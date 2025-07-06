/**
 * Content API Service - SPSA
 * خدمة API المحتوى - الجمعية السعودية للعلوم السياسية
 * 
 * Handles all content-related API operations with the new backend
 */

import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { monitoringService } from '../utils/monitoring.js';

/**
 * Content API Service Class
 */
class ContentApiService {
  constructor() {
    this.baseEndpoint = '/content';
    this.isEnabled = getFeatureFlag('USE_NEW_CONTENT_API');
  }

  /**
   * Get content list with filtering and pagination
   */
  async getContentList(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        content_type,
        category_id,
        status,
        search,
        author_id,
        is_featured,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order
      });

      // Add optional filters
      if (content_type) queryParams.append('content_type', content_type);
      if (category_id) queryParams.append('category_id', category_id);
      if (status) queryParams.append('status', status);
      if (search) queryParams.append('search', search);
      if (author_id) queryParams.append('author_id', author_id);
      if (is_featured !== undefined) queryParams.append('is_featured', is_featured.toString());

      const response = await unifiedApiService.request(`${this.baseEndpoint}?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      // Track successful request
      monitoringService.trackMetric('content_list_success', 1, {
        page,
        limit,
        filters: Object.keys(params).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_list_error',
        message: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Get single content item
   */
  async getContent(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      // Track content view
      monitoringService.trackMetric('content_view', 1, {
        contentId: id,
        contentType: response.data.data.content_type
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_get_error',
        message: error.message,
        contentId: id
      });
      throw error;
    }
  }

  /**
   * Create new content
   */
  async createContent(contentData) {
    try {
      const response = await unifiedApiService.request(this.baseEndpoint, {
        method: 'POST',
        data: contentData,
        requestType: 'AUTH'
      });

      // Track content creation
      monitoringService.trackMetric('content_created', 1, {
        contentType: contentData.content_type,
        hasCategory: !!contentData.category_id,
        tagCount: contentData.tags?.length || 0
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_create_error',
        message: error.message,
        contentData: { ...contentData, content: '[REDACTED]' }
      });
      throw error;
    }
  }

  /**
   * Update content
   */
  async updateContent(id, updates) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}`, {
        method: 'PUT',
        data: updates,
        requestType: 'AUTH'
      });

      // Track content update
      monitoringService.trackMetric('content_updated', 1, {
        contentId: id,
        fieldsUpdated: Object.keys(updates).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_update_error',
        message: error.message,
        contentId: id,
        updates: Object.keys(updates)
      });
      throw error;
    }
  }

  /**
   * Delete content
   */
  async deleteContent(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}`, {
        method: 'DELETE',
        requestType: 'AUTH'
      });

      // Track content deletion
      monitoringService.trackMetric('content_deleted', 1, {
        contentId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_delete_error',
        message: error.message,
        contentId: id
      });
      throw error;
    }
  }

  /**
   * Publish content
   */
  async publishContent(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}/publish`, {
        method: 'POST',
        requestType: 'AUTH'
      });

      // Track content publication
      monitoringService.trackMetric('content_published', 1, {
        contentId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_publish_error',
        message: error.message,
        contentId: id
      });
      throw error;
    }
  }

  /**
   * Get featured content
   */
  async getFeaturedContent(limit = 5) {
    return this.getContentList({
      is_featured: true,
      status: 'published',
      limit,
      sort_by: 'published_at',
      sort_order: 'desc'
    });
  }

  /**
   * Get latest content
   */
  async getLatestContent(limit = 10) {
    return this.getContentList({
      status: 'published',
      limit,
      sort_by: 'published_at',
      sort_order: 'desc'
    });
  }

  /**
   * Search content
   */
  async searchContent(query, filters = {}) {
    return this.getContentList({
      search: query,
      status: 'published',
      ...filters
    });
  }

  /**
   * Get content by category
   */
  async getContentByCategory(categoryId, params = {}) {
    return this.getContentList({
      category_id: categoryId,
      status: 'published',
      ...params
    });
  }

  /**
   * Get content by author
   */
  async getContentByAuthor(authorId, params = {}) {
    return this.getContentList({
      author_id: authorId,
      status: 'published',
      ...params
    });
  }

  /**
   * Get content statistics
   */
  async getContentStats() {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/stats`, {
        method: 'GET',
        requestType: 'AUTH'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'content_stats_error',
        message: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const contentApiService = new ContentApiService();

export default contentApiService;
