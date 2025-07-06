/**
 * Categories & Tags API Service - SPSA
 * خدمة API الفئات والعلامات - الجمعية السعودية للعلوم السياسية
 * 
 * Handles all categories and tags related API operations
 */

import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { monitoringService } from '../utils/monitoring.js';

/**
 * Categories API Service Class
 */
class CategoriesApiService {
  constructor() {
    this.categoriesEndpoint = '/categories';
    this.tagsEndpoint = '/tags';
    this.isEnabled = getFeatureFlag('USE_NEW_CATEGORIES_API');
  }

  // ==================== CATEGORIES ====================

  /**
   * Get categories list
   */
  async getCategories(params = {}) {
    try {
      const {
        tree = false,
        include_inactive = false,
        parent_id
      } = params;

      const queryParams = new URLSearchParams();
      if (tree) queryParams.append('tree', tree.toString());
      if (include_inactive) queryParams.append('include_inactive', include_inactive.toString());
      if (parent_id) queryParams.append('parent_id', parent_id);

      const response = await unifiedApiService.request(`${this.categoriesEndpoint}?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      // Track successful request
      monitoringService.trackMetric('categories_list_success', 1, {
        tree,
        include_inactive,
        parent_id: !!parent_id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'categories_list_error',
        message: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Get single category
   */
  async getCategory(id) {
    try {
      const response = await unifiedApiService.request(`${this.categoriesEndpoint}/${id}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      // Track category view
      monitoringService.trackMetric('category_view', 1, {
        categoryId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'category_get_error',
        message: error.message,
        categoryId: id
      });
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(categoryData) {
    try {
      const response = await unifiedApiService.request(this.categoriesEndpoint, {
        method: 'POST',
        data: categoryData,
        requestType: 'AUTH'
      });

      // Track category creation
      monitoringService.trackMetric('category_created', 1, {
        hasParent: !!categoryData.parent_id,
        isActive: categoryData.is_active !== false
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'category_create_error',
        message: error.message,
        categoryData
      });
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id, updates) {
    try {
      const response = await unifiedApiService.request(`${this.categoriesEndpoint}/${id}`, {
        method: 'PUT',
        data: updates,
        requestType: 'AUTH'
      });

      // Track category update
      monitoringService.trackMetric('category_updated', 1, {
        categoryId: id,
        fieldsUpdated: Object.keys(updates).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'category_update_error',
        message: error.message,
        categoryId: id,
        updates: Object.keys(updates)
      });
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id, reassignTo = null) {
    try {
      const data = reassignTo ? { reassign_to: reassignTo } : {};
      
      const response = await unifiedApiService.request(`${this.categoriesEndpoint}/${id}`, {
        method: 'DELETE',
        data,
        requestType: 'AUTH'
      });

      // Track category deletion
      monitoringService.trackMetric('category_deleted', 1, {
        categoryId: id,
        hasReassignment: !!reassignTo
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'category_delete_error',
        message: error.message,
        categoryId: id,
        reassignTo
      });
      throw error;
    }
  }

  /**
   * Get content in category
   */
  async getCategoryContent(id, params = {}) {
    try {
      const { page = 1, limit = 10 } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await unifiedApiService.request(`${this.categoriesEndpoint}/${id}/content?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'category_content_error',
        message: error.message,
        categoryId: id,
        params
      });
      throw error;
    }
  }

  /**
   * Get categories statistics
   */
  async getCategoriesStats() {
    try {
      const response = await unifiedApiService.request(`${this.categoriesEndpoint}/stats`, {
        method: 'GET',
        requestType: 'AUTH'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'categories_stats_error',
        message: error.message
      });
      throw error;
    }
  }

  // ==================== TAGS ====================

  /**
   * Get tags list
   */
  async getTags(params = {}) {
    try {
      const {
        search,
        include_inactive = false,
        sort_by = 'usage_count',
        sort_order = 'desc',
        limit = 50
      } = params;

      const queryParams = new URLSearchParams({
        sort_by,
        sort_order,
        limit: limit.toString()
      });

      if (search) queryParams.append('search', search);
      if (include_inactive) queryParams.append('include_inactive', include_inactive.toString());

      const response = await unifiedApiService.request(`${this.tagsEndpoint}?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      // Track successful request
      monitoringService.trackMetric('tags_list_success', 1, {
        hasSearch: !!search,
        include_inactive,
        limit
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tags_list_error',
        message: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Get single tag
   */
  async getTag(id) {
    try {
      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${id}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      // Track tag view
      monitoringService.trackMetric('tag_view', 1, {
        tagId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tag_get_error',
        message: error.message,
        tagId: id
      });
      throw error;
    }
  }

  /**
   * Create new tag
   */
  async createTag(tagData) {
    try {
      const response = await unifiedApiService.request(this.tagsEndpoint, {
        method: 'POST',
        data: tagData,
        requestType: 'AUTH'
      });

      // Track tag creation
      monitoringService.trackMetric('tag_created', 1, {
        hasColor: !!tagData.color,
        isActive: tagData.is_active !== false
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tag_create_error',
        message: error.message,
        tagData
      });
      throw error;
    }
  }

  /**
   * Update tag
   */
  async updateTag(id, updates) {
    try {
      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${id}`, {
        method: 'PUT',
        data: updates,
        requestType: 'AUTH'
      });

      // Track tag update
      monitoringService.trackMetric('tag_updated', 1, {
        tagId: id,
        fieldsUpdated: Object.keys(updates).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tag_update_error',
        message: error.message,
        tagId: id,
        updates: Object.keys(updates)
      });
      throw error;
    }
  }

  /**
   * Delete tag
   */
  async deleteTag(id) {
    try {
      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${id}`, {
        method: 'DELETE',
        requestType: 'AUTH'
      });

      // Track tag deletion
      monitoringService.trackMetric('tag_deleted', 1, {
        tagId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tag_delete_error',
        message: error.message,
        tagId: id
      });
      throw error;
    }
  }

  /**
   * Get content with tag
   */
  async getTagContent(id, params = {}) {
    try {
      const { page = 1, limit = 10 } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/${id}/content?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tag_content_error',
        message: error.message,
        tagId: id,
        params
      });
      throw error;
    }
  }

  /**
   * Get tag suggestions for auto-complete
   */
  async getTagSuggestions(query, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/suggestions?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tag_suggestions_error',
        message: error.message,
        query,
        limit
      });
      throw error;
    }
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit = 20) {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await unifiedApiService.request(`${this.tagsEndpoint}/popular?${queryParams}`, {
        method: 'GET',
        requestType: 'PUBLIC'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'popular_tags_error',
        message: error.message,
        limit
      });
      throw error;
    }
  }

  /**
   * Get tags statistics
   */
  async getTagsStats() {
    try {
      const response = await unifiedApiService.request(`${this.tagsEndpoint}/stats`, {
        method: 'GET',
        requestType: 'AUTH'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'tags_stats_error',
        message: error.message
      });
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get category tree structure
   */
  async getCategoryTree() {
    return this.getCategories({ tree: true });
  }

  /**
   * Get active categories only
   */
  async getActiveCategories() {
    return this.getCategories({ include_inactive: false });
  }

  /**
   * Search categories and tags
   */
  async searchCategoriesAndTags(query) {
    try {
      const [categories, tags] = await Promise.all([
        this.getCategories({ search: query }),
        this.getTags({ search: query, limit: 20 })
      ]);

      return {
        categories: categories.data || [],
        tags: tags.data || []
      };

    } catch (error) {
      monitoringService.trackError({
        type: 'search_categories_tags_error',
        message: error.message,
        query
      });
      throw error;
    }
  }
}

// Create singleton instance
const categoriesApiService = new CategoriesApiService();

export default categoriesApiService;
