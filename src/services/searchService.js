/**
 * Advanced Search Service
 * خدمة البحث المتقدم
 * 
 * Integrates with UnifiedApiService and provides search functionality
 */

import searchEngineCore from './searchEngine/searchCore.js';
import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

/**
 * Search Service Class
 * فئة خدمة البحث
 */
class SearchService {
  constructor() {
    this.isInitialized = false;
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    this.initialize();
  }

  /**
   * Initialize search service
   * تهيئة خدمة البحث
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_ADVANCED_SEARCH')) {
        logInfo('Advanced search is disabled');
        return;
      }

      // Initialize search engine core
      await this.initializeSearchEngine();
      
      // Set up cache cleanup
      this.setupCacheCleanup();
      
      this.isInitialized = true;
      logInfo('Search service initialized successfully');
      
    } catch (error) {
      logError('Failed to initialize search service', error);
      throw error;
    }
  }

  /**
   * Initialize search engine
   * تهيئة محرك البحث
   */
  async initializeSearchEngine() {
    // The search engine core is already initialized
    // Here we can add any additional setup if needed
    logInfo('Search engine core ready');
  }

  /**
   * Setup cache cleanup interval
   * إعداد تنظيف التخزين المؤقت
   */
  setupCacheCleanup() {
    setInterval(() => {
      this.cleanupCache();
    }, this.cacheTimeout);
  }

  /**
   * Perform search with caching
   * تنفيذ البحث مع التخزين المؤقت
   */
  async search(query, options = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('Search service not initialized');
      }

      const {
        filters = {},
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        useCache = true
      } = options;

      // Generate cache key
      const cacheKey = this.generateCacheKey(query, filters, sortBy, page, limit);
      
      // Check cache first
      if (useCache && this.searchCache.has(cacheKey)) {
        const cachedResult = this.searchCache.get(cacheKey);
        if (Date.now() - cachedResult.timestamp < this.cacheTimeout) {
          logInfo('Returning cached search results');
          return cachedResult.data;
        }
      }

      // Perform search
      const searchResults = await this.performSearch(query, filters, sortBy, page, limit);
      
      // Cache results
      if (useCache) {
        this.searchCache.set(cacheKey, {
          data: searchResults,
          timestamp: Date.now()
        });
      }

      return searchResults;

    } catch (error) {
      logError('Search failed', error, { query, options });
      throw error;
    }
  }

  /**
   * Perform the actual search
   * تنفيذ البحث الفعلي
   */
  async performSearch(query, filters, sortBy, page, limit) {
    // Try to get real data from APIs first, fallback to search engine core
    try {
      const realData = await this.searchFromAPIs(query, filters, sortBy, page, limit);
      if (realData && realData.results.length > 0) {
        return realData;
      }
    } catch (error) {
      logError('API search failed, falling back to search engine core', error);
    }

    // Fallback to search engine core with mock data
    return await searchEngineCore.search(query, filters, sortBy, page, limit);
  }

  /**
   * Search from actual APIs
   * البحث من APIs الحقيقية
   */
  async searchFromAPIs(query, filters, sortBy, page, limit) {
    const searchPromises = [];

    // Search content if enabled
    if (getFeatureFlag('USE_NEW_CONTENT_API')) {
      searchPromises.push(this.searchContent(query, filters));
    }

    // Search users if enabled
    if (getFeatureFlag('USE_NEW_USER_API')) {
      searchPromises.push(this.searchUsers(query, filters));
    }

    // Search categories if enabled
    if (getFeatureFlag('USE_NEW_CATEGORIES_API')) {
      searchPromises.push(this.searchCategories(query, filters));
    }

    // Execute all searches in parallel
    const results = await Promise.allSettled(searchPromises);
    
    // Combine and process results
    const combinedResults = this.combineSearchResults(results);
    
    // Apply sorting and pagination
    const sortedResults = this.applySorting(combinedResults, sortBy);
    const total = sortedResults.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = sortedResults.slice(startIndex, startIndex + limit);

    return {
      results: paginatedResults,
      total,
      page,
      limit,
      query,
      filters,
      sortBy,
      responseTime: 0 // Will be calculated by search engine core
    };
  }

  /**
   * Search content
   * البحث في المحتوى
   */
  async searchContent(query, filters) {
    try {
      const contentService = await unifiedApiService.getContentService();
      const searchParams = {
        q: query,
        ...this.mapFiltersToContentParams(filters)
      };
      
      const response = await contentService.search(searchParams);
      return response.data?.map(item => ({
        ...item,
        type: 'content',
        searchType: 'content'
      })) || [];
      
    } catch (error) {
      logError('Content search failed', error);
      return [];
    }
  }

  /**
   * Search users
   * البحث في المستخدمين
   */
  async searchUsers(query, filters) {
    try {
      const userService = await unifiedApiService.getUserService();
      const searchParams = {
        q: query,
        ...this.mapFiltersToUserParams(filters)
      };
      
      const response = await userService.search(searchParams);
      return response.data?.map(item => ({
        ...item,
        type: 'user',
        searchType: 'user'
      })) || [];
      
    } catch (error) {
      logError('User search failed', error);
      return [];
    }
  }

  /**
   * Search categories
   * البحث في التصنيفات
   */
  async searchCategories(query, filters) {
    try {
      const categoryService = await unifiedApiService.getCategoryService();
      const searchParams = {
        q: query,
        ...this.mapFiltersToCategoryParams(filters)
      };
      
      const response = await categoryService.search(searchParams);
      return response.data?.map(item => ({
        ...item,
        type: 'category',
        searchType: 'category'
      })) || [];
      
    } catch (error) {
      logError('Category search failed', error);
      return [];
    }
  }

  /**
   * Map filters to content API parameters
   * تحويل الفلاتر إلى معاملات API المحتوى
   */
  mapFiltersToContentParams(filters) {
    const params = {};
    
    if (filters.type) {
      params.type = filters.type;
    }
    
    if (filters.language) {
      params.language = filters.language;
    }
    
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.dateRange) {
      params.dateRange = filters.dateRange;
    }
    
    return params;
  }

  /**
   * Map filters to user API parameters
   * تحويل الفلاتر إلى معاملات API المستخدمين
   */
  mapFiltersToUserParams(filters) {
    const params = {};
    
    if (filters.role) {
      params.role = filters.role;
    }
    
    if (filters.department) {
      params.department = filters.department;
    }
    
    return params;
  }

  /**
   * Map filters to category API parameters
   * تحويل الفلاتر إلى معاملات API التصنيفات
   */
  mapFiltersToCategoryParams(filters) {
    const params = {};
    
    if (filters.type) {
      params.type = filters.type;
    }
    
    return params;
  }

  /**
   * Combine search results from different sources
   * دمج نتائج البحث من مصادر مختلفة
   */
  combineSearchResults(results) {
    const combinedResults = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        combinedResults.push(...result.value);
      }
    });
    
    return combinedResults;
  }

  /**
   * Apply sorting to combined results
   * تطبيق الترتيب على النتائج المدمجة
   */
  applySorting(results, sortBy) {
    return searchEngineCore.applySorting(results, sortBy);
  }

  /**
   * Generate cache key for search results
   * توليد مفتاح التخزين المؤقت لنتائج البحث
   */
  generateCacheKey(query, filters, sortBy, page, limit) {
    const keyData = {
      query: query.toLowerCase().trim(),
      filters: JSON.stringify(filters),
      sortBy,
      page,
      limit
    };
    
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Clean up expired cache entries
   * تنظيف إدخالات التخزين المؤقت المنتهية الصلاحية
   */
  cleanupCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.searchCache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheTimeout) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.searchCache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      logInfo(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Get search suggestions
   * الحصول على اقتراحات البحث
   */
  async getSearchSuggestions(query, limit = 5) {
    if (!getFeatureFlag('ENABLE_SEARCH_SUGGESTIONS')) {
      return [];
    }

    try {
      // This would typically call a suggestions API
      // For now, return mock suggestions based on popular terms
      const analytics = searchEngineCore.getAnalytics();
      const popularTerms = analytics.popularTerms;
      
      const suggestions = popularTerms
        .filter(([term]) => term.includes(query.toLowerCase()))
        .slice(0, limit)
        .map(([term]) => term);
        
      return suggestions;
      
    } catch (error) {
      logError('Failed to get search suggestions', error);
      return [];
    }
  }

  /**
   * Get search analytics
   * الحصول على تحليلات البحث
   */
  getSearchAnalytics() {
    if (!getFeatureFlag('ENABLE_SEARCH_ANALYTICS')) {
      return null;
    }

    return searchEngineCore.getAnalytics();
  }

  /**
   * Get search history
   * الحصول على تاريخ البحث
   */
  getSearchHistory() {
    return searchEngineCore.getSearchHistory();
  }

  /**
   * Clear search history
   * مسح تاريخ البحث
   */
  clearSearchHistory() {
    searchEngineCore.clearSearchHistory();
  }

  /**
   * Get available filters
   * الحصول على الفلاتر المتاحة
   */
  getAvailableFilters() {
    return searchEngineCore.getAvailableFilters();
  }

  /**
   * Get available sort options
   * الحصول على خيارات الترتيب المتاحة
   */
  getAvailableSortOptions() {
    return searchEngineCore.getAvailableSortOptions();
  }

  /**
   * Clear search cache
   * مسح تخزين البحث المؤقت
   */
  clearCache() {
    this.searchCache.clear();
    logInfo('Search cache cleared');
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.searchCache.size,
      featuresEnabled: {
        advancedSearch: getFeatureFlag('ENABLE_ADVANCED_SEARCH'),
        searchAnalytics: getFeatureFlag('ENABLE_SEARCH_ANALYTICS'),
        searchSuggestions: getFeatureFlag('ENABLE_SEARCH_SUGGESTIONS'),
        searchHistory: getFeatureFlag('ENABLE_SEARCH_HISTORY')
      }
    };
  }
}

// Create singleton instance
const searchService = new SearchService();

export default searchService;
