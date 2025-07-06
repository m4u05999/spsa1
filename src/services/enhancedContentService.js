/**
 * Enhanced Content Service - SPSA Phase 2
 * خدمة المحتوى المحسنة - المرحلة الثانية
 * 
 * Integrates with new backend APIs while maintaining fallback to existing service
 */

import contentApiService from './contentApiService.js';
import categoriesApiService from './categoriesApiService.js';
import userApiService from './userApiService.js';
import { contentService as legacyContentService } from './contentService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { monitoringService } from '../utils/monitoring.js';

/**
 * Enhanced Content Service Class
 */
class EnhancedContentService {
  constructor() {
    this.useNewApi = getFeatureFlag('USE_NEW_CONTENT_API');
    this.useNewCategories = getFeatureFlag('USE_NEW_CATEGORIES_API');
    this.useNewUsers = getFeatureFlag('USE_NEW_USER_API');
  }

  /**
   * Get content list with enhanced filtering
   */
  async getContentList(params = {}) {
    try {
      if (this.useNewApi) {
        const result = await contentApiService.getContentList(params);
        
        // Enhance with additional data if needed
        if (result.data && Array.isArray(result.data)) {
          result.data = await this.enhanceContentList(result.data);
        }
        
        return result;
      } else {
        // Fallback to legacy service
        return await legacyContentService.getContents(params);
      }
    } catch (error) {
      console.warn('Enhanced content service failed, falling back to legacy:', error);
      return await legacyContentService.getContents(params);
    }
  }

  /**
   * Get single content item with full details
   */
  async getContent(id) {
    try {
      if (this.useNewApi) {
        const result = await contentApiService.getContent(id);
        
        // Enhance with additional data
        if (result.data) {
          result.data = await this.enhanceContentItem(result.data);
        }
        
        return result;
      } else {
        return await legacyContentService.getContent(id);
      }
    } catch (error) {
      console.warn('Enhanced content get failed, falling back to legacy:', error);
      return await legacyContentService.getContent(id);
    }
  }

  /**
   * Create new content
   */
  async createContent(contentData) {
    try {
      if (this.useNewApi) {
        // Validate and prepare data
        const preparedData = await this.prepareContentData(contentData);
        return await contentApiService.createContent(preparedData);
      } else {
        return await legacyContentService.createContent(contentData);
      }
    } catch (error) {
      console.warn('Enhanced content creation failed, falling back to legacy:', error);
      return await legacyContentService.createContent(contentData);
    }
  }

  /**
   * Update content
   */
  async updateContent(id, updates) {
    try {
      if (this.useNewApi) {
        const preparedUpdates = await this.prepareContentData(updates);
        return await contentApiService.updateContent(id, preparedUpdates);
      } else {
        return await legacyContentService.updateContent(id, updates);
      }
    } catch (error) {
      console.warn('Enhanced content update failed, falling back to legacy:', error);
      return await legacyContentService.updateContent(id, updates);
    }
  }

  /**
   * Delete content
   */
  async deleteContent(id) {
    try {
      if (this.useNewApi) {
        return await contentApiService.deleteContent(id);
      } else {
        return await legacyContentService.deleteContent(id);
      }
    } catch (error) {
      console.warn('Enhanced content deletion failed, falling back to legacy:', error);
      return await legacyContentService.deleteContent(id);
    }
  }

  /**
   * Publish content
   */
  async publishContent(id) {
    try {
      if (this.useNewApi) {
        return await contentApiService.publishContent(id);
      } else {
        // Legacy service might not have publish endpoint
        return await this.updateContent(id, { status: 'published' });
      }
    } catch (error) {
      console.warn('Enhanced content publish failed, falling back to legacy:', error);
      return await this.updateContent(id, { status: 'published' });
    }
  }

  /**
   * Get categories
   */
  async getCategories(params = {}) {
    try {
      if (this.useNewCategories) {
        return await categoriesApiService.getCategories(params);
      } else {
        return await legacyContentService.getCategories();
      }
    } catch (error) {
      console.warn('Enhanced categories get failed, falling back to legacy:', error);
      return await legacyContentService.getCategories();
    }
  }

  /**
   * Get category tree
   */
  async getCategoryTree() {
    try {
      if (this.useNewCategories) {
        return await categoriesApiService.getCategoryTree();
      } else {
        // Build tree from flat categories
        const categories = await legacyContentService.getCategories();
        return this.buildCategoryTree(categories);
      }
    } catch (error) {
      console.warn('Enhanced category tree failed, falling back to legacy:', error);
      const categories = await legacyContentService.getCategories();
      return this.buildCategoryTree(categories);
    }
  }

  /**
   * Get tags
   */
  async getTags(params = {}) {
    try {
      if (this.useNewCategories) {
        return await categoriesApiService.getTags(params);
      } else {
        return await legacyContentService.getTags();
      }
    } catch (error) {
      console.warn('Enhanced tags get failed, falling back to legacy:', error);
      return await legacyContentService.getTags();
    }
  }

  /**
   * Get tag suggestions
   */
  async getTagSuggestions(query, limit = 10) {
    try {
      if (this.useNewCategories) {
        return await categoriesApiService.getTagSuggestions(query, limit);
      } else {
        // Simple filtering for legacy
        const tags = await legacyContentService.getTags();
        const filtered = tags.filter(tag => 
          tag.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, limit);
        return { data: filtered };
      }
    } catch (error) {
      console.warn('Enhanced tag suggestions failed, falling back to legacy:', error);
      const tags = await legacyContentService.getTags();
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      return { data: filtered };
    }
  }

  /**
   * Search content
   */
  async searchContent(query, filters = {}) {
    try {
      if (this.useNewApi) {
        return await contentApiService.searchContent(query, filters);
      } else {
        return await legacyContentService.searchContents(query, filters);
      }
    } catch (error) {
      console.warn('Enhanced content search failed, falling back to legacy:', error);
      return await legacyContentService.searchContents(query, filters);
    }
  }

  /**
   * Get featured content
   */
  async getFeaturedContent(limit = 5) {
    try {
      if (this.useNewApi) {
        return await contentApiService.getFeaturedContent(limit);
      } else {
        return await legacyContentService.getFeaturedContents(limit);
      }
    } catch (error) {
      console.warn('Enhanced featured content failed, falling back to legacy:', error);
      return await legacyContentService.getFeaturedContents(limit);
    }
  }

  /**
   * Get latest content
   */
  async getLatestContent(limit = 10) {
    try {
      if (this.useNewApi) {
        return await contentApiService.getLatestContent(limit);
      } else {
        return await legacyContentService.getLatestContents(limit);
      }
    } catch (error) {
      console.warn('Enhanced latest content failed, falling back to legacy:', error);
      return await legacyContentService.getLatestContents(limit);
    }
  }

  /**
   * Get content by category
   */
  async getContentByCategory(categoryId, params = {}) {
    try {
      if (this.useNewApi) {
        return await contentApiService.getContentByCategory(categoryId, params);
      } else {
        return await legacyContentService.getContentsByCategory(categoryId, params);
      }
    } catch (error) {
      console.warn('Enhanced content by category failed, falling back to legacy:', error);
      return await legacyContentService.getContentsByCategory(categoryId, params);
    }
  }

  /**
   * Get content statistics
   */
  async getContentStats() {
    try {
      if (this.useNewApi) {
        return await contentApiService.getContentStats();
      } else {
        // Generate basic stats from legacy data
        return await this.generateLegacyStats();
      }
    } catch (error) {
      console.warn('Enhanced content stats failed, falling back to legacy:', error);
      return await this.generateLegacyStats();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Enhance content list with additional data
   */
  async enhanceContentList(contentList) {
    try {
      // Add author details if using new user API
      if (this.useNewUsers && contentList.length > 0) {
        const authorIds = [...new Set(contentList.map(c => c.author_id).filter(Boolean))];
        const authors = {};
        
        for (const authorId of authorIds) {
          try {
            const author = await userApiService.getUser(authorId);
            authors[authorId] = author.data;
          } catch (error) {
            console.warn(`Failed to fetch author ${authorId}:`, error);
          }
        }

        return contentList.map(content => ({
          ...content,
          author_details: authors[content.author_id] || null
        }));
      }

      return contentList;
    } catch (error) {
      console.warn('Failed to enhance content list:', error);
      return contentList;
    }
  }

  /**
   * Enhance single content item
   */
  async enhanceContentItem(content) {
    try {
      const enhanced = { ...content };

      // Add author details
      if (this.useNewUsers && content.author_id) {
        try {
          const author = await userApiService.getUser(content.author_id);
          enhanced.author_details = author.data;
        } catch (error) {
          console.warn('Failed to fetch author details:', error);
        }
      }

      // Add related content
      if (this.useNewApi && content.category_id) {
        try {
          const related = await contentApiService.getContentByCategory(content.category_id, {
            limit: 5,
            exclude: content.id
          });
          enhanced.related_content = related.data || [];
        } catch (error) {
          console.warn('Failed to fetch related content:', error);
        }
      }

      return enhanced;
    } catch (error) {
      console.warn('Failed to enhance content item:', error);
      return content;
    }
  }

  /**
   * Prepare content data for API
   */
  async prepareContentData(data) {
    const prepared = { ...data };

    // Convert legacy field names to new API format
    if (prepared.type) {
      prepared.content_type = prepared.type;
      delete prepared.type;
    }

    if (prepared.categories && Array.isArray(prepared.categories)) {
      // Convert category names to IDs if needed
      if (this.useNewCategories) {
        // This would require category lookup - simplified for now
        prepared.category_id = prepared.categories[0]; // Use first category
      }
      delete prepared.categories;
    }

    return prepared;
  }

  /**
   * Build category tree from flat list
   */
  buildCategoryTree(categories, parentId = null) {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: this.buildCategoryTree(categories, cat.id)
      }));
  }

  /**
   * Generate basic statistics from legacy data
   */
  async generateLegacyStats() {
    try {
      const contents = await legacyContentService.getContents();
      const categories = await legacyContentService.getCategories();
      const tags = await legacyContentService.getTags();

      return {
        data: {
          total_content: contents.length,
          published_content: contents.filter(c => c.status === 'published').length,
          draft_content: contents.filter(c => c.status === 'draft').length,
          total_categories: categories.length,
          total_tags: tags.length,
          featured_content: contents.filter(c => c.featured).length
        }
      };
    } catch (error) {
      console.warn('Failed to generate legacy stats:', error);
      return { data: {} };
    }
  }

  /**
   * Check service availability
   */
  getServiceStatus() {
    return {
      newApi: this.useNewApi,
      newCategories: this.useNewCategories,
      newUsers: this.useNewUsers,
      fallbackAvailable: true
    };
  }
}

// Create singleton instance
const enhancedContentService = new EnhancedContentService();

export default enhancedContentService;
