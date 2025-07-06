/**
 * Advanced Search Engine Core
 * محرك البحث المتقدم الأساسي
 * 
 * Provides comprehensive search functionality with filtering, sorting, and analytics
 */

import { getFeatureFlag } from '../../config/featureFlags.js';
import { logPerformance, logError } from '../../utils/monitoring.js';

/**
 * Search Engine Core Class
 * فئة محرك البحث الأساسي
 */
class SearchEngineCore {
  constructor() {
    this.searchIndex = new Map();
    this.searchHistory = [];
    this.searchAnalytics = {
      totalSearches: 0,
      popularTerms: new Map(),
      searchTrends: [],
      averageResponseTime: 0
    };
    this.filters = new Map();
    this.sortOptions = new Map();
    
    this.initializeSearchEngine();
  }

  /**
   * Initialize search engine with default configurations
   * تهيئة محرك البحث بالإعدادات الافتراضية
   */
  initializeSearchEngine() {
    // Initialize default sort options
    this.sortOptions.set('relevance', {
      name: 'الصلة',
      nameEn: 'Relevance',
      compareFn: this.sortByRelevance.bind(this),
      default: true
    });
    
    this.sortOptions.set('date_desc', {
      name: 'الأحدث أولاً',
      nameEn: 'Newest First',
      compareFn: this.sortByDateDesc.bind(this)
    });
    
    this.sortOptions.set('date_asc', {
      name: 'الأقدم أولاً',
      nameEn: 'Oldest First',
      compareFn: this.sortByDateAsc.bind(this)
    });
    
    this.sortOptions.set('title', {
      name: 'العنوان أبجدياً',
      nameEn: 'Title A-Z',
      compareFn: this.sortByTitle.bind(this)
    });

    // Initialize default filters
    this.initializeFilters();
    
    console.log('🔍 Search Engine Core initialized');
  }

  /**
   * Initialize search filters
   * تهيئة فلاتر البحث
   */
  initializeFilters() {
    this.filters.set('type', {
      name: 'النوع',
      nameEn: 'Type',
      options: [
        { value: 'article', label: 'مقالات', labelEn: 'Articles' },
        { value: 'research', label: 'أبحاث', labelEn: 'Research' },
        { value: 'news', label: 'أخبار', labelEn: 'News' },
        { value: 'event', label: 'فعاليات', labelEn: 'Events' },
        { value: 'publication', label: 'منشورات', labelEn: 'Publications' }
      ]
    });

    this.filters.set('language', {
      name: 'اللغة',
      nameEn: 'Language',
      options: [
        { value: 'ar', label: 'العربية', labelEn: 'Arabic' },
        { value: 'en', label: 'الإنجليزية', labelEn: 'English' }
      ]
    });

    this.filters.set('category', {
      name: 'التصنيف',
      nameEn: 'Category',
      options: [
        { value: 'political_theory', label: 'النظرية السياسية', labelEn: 'Political Theory' },
        { value: 'international_relations', label: 'العلاقات الدولية', labelEn: 'International Relations' },
        { value: 'public_policy', label: 'السياسة العامة', labelEn: 'Public Policy' },
        { value: 'comparative_politics', label: 'السياسة المقارنة', labelEn: 'Comparative Politics' },
        { value: 'political_economy', label: 'الاقتصاد السياسي', labelEn: 'Political Economy' }
      ]
    });

    this.filters.set('dateRange', {
      name: 'النطاق الزمني',
      nameEn: 'Date Range',
      type: 'dateRange',
      options: [
        { value: 'last_week', label: 'الأسبوع الماضي', labelEn: 'Last Week' },
        { value: 'last_month', label: 'الشهر الماضي', labelEn: 'Last Month' },
        { value: 'last_year', label: 'السنة الماضية', labelEn: 'Last Year' },
        { value: 'custom', label: 'نطاق مخصص', labelEn: 'Custom Range' }
      ]
    });
  }

  /**
   * Perform search with query and filters
   * تنفيذ البحث مع الاستعلام والفلاتر
   */
  async search(query, filters = {}, sortBy = 'relevance', page = 1, limit = 20) {
    const startTime = performance.now();
    
    try {
      // Validate and clean query
      const cleanQuery = this.sanitizeQuery(query);
      if (!cleanQuery || cleanQuery.length < 2) {
        return {
          results: [],
          total: 0,
          page,
          limit,
          query: cleanQuery,
          filters,
          sortBy,
          responseTime: 0
        };
      }

      // Record search analytics
      this.recordSearch(cleanQuery, filters);

      // Get search results
      let results = await this.performSearch(cleanQuery, filters);
      
      // Apply sorting
      results = this.applySorting(results, sortBy);
      
      // Apply pagination
      const total = results.length;
      const startIndex = (page - 1) * limit;
      const paginatedResults = results.slice(startIndex, startIndex + limit);
      
      // Calculate response time
      const responseTime = performance.now() - startTime;
      this.updateAnalytics(responseTime);
      
      // Log performance
      logPerformance('search', responseTime, {
        query: cleanQuery,
        resultsCount: total,
        filters: Object.keys(filters).length
      });

      return {
        results: paginatedResults,
        total,
        page,
        limit,
        query: cleanQuery,
        filters,
        sortBy,
        responseTime: Math.round(responseTime)
      };

    } catch (error) {
      logError('Search failed', error, { query, filters });
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Sanitize search query
   * تنظيف استعلام البحث
   */
  sanitizeQuery(query) {
    if (!query || typeof query !== 'string') return '';
    
    return query
      .trim()
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 200); // Limit length
  }

  /**
   * Perform the actual search
   * تنفيذ البحث الفعلي
   */
  async performSearch(query, filters) {
    // This would typically connect to a search service or database
    // For now, we'll use mock data that integrates with our existing services
    
    const mockResults = this.generateMockResults(query, filters);
    
    // Apply text search
    const searchTerms = query.toLowerCase().split(' ');
    const filteredResults = mockResults.filter(item => {
      const searchableText = `${item.title} ${item.content} ${item.author} ${item.tags?.join(' ') || ''}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });

    // Apply filters
    return this.applyFilters(filteredResults, filters);
  }

  /**
   * Apply filters to search results
   * تطبيق الفلاتر على نتائج البحث
   */
  applyFilters(results, filters) {
    let filteredResults = [...results];

    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return;
      }

      switch (filterKey) {
        case 'type':
          filteredResults = filteredResults.filter(item => 
            Array.isArray(filterValue) 
              ? filterValue.includes(item.type)
              : item.type === filterValue
          );
          break;
          
        case 'language':
          filteredResults = filteredResults.filter(item => 
            Array.isArray(filterValue)
              ? filterValue.includes(item.language)
              : item.language === filterValue
          );
          break;
          
        case 'category':
          filteredResults = filteredResults.filter(item => 
            Array.isArray(filterValue)
              ? filterValue.some(cat => item.categories?.includes(cat))
              : item.categories?.includes(filterValue)
          );
          break;
          
        case 'dateRange':
          filteredResults = this.applyDateFilter(filteredResults, filterValue);
          break;
          
        case 'author':
          if (filterValue) {
            filteredResults = filteredResults.filter(item => 
              item.author?.toLowerCase().includes(filterValue.toLowerCase())
            );
          }
          break;
      }
    });

    return filteredResults;
  }

  /**
   * Apply date range filter
   * تطبيق فلتر النطاق الزمني
   */
  applyDateFilter(results, dateFilter) {
    if (!dateFilter) return results;

    const now = new Date();
    let startDate, endDate;

    switch (dateFilter) {
      case 'last_week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        if (dateFilter.startDate && dateFilter.endDate) {
          startDate = new Date(dateFilter.startDate);
          endDate = new Date(dateFilter.endDate);
        }
        break;
    }

    if (startDate) {
      return results.filter(item => {
        const itemDate = new Date(item.publishedAt || item.createdAt);
        return itemDate >= startDate && (!endDate || itemDate <= endDate);
      });
    }

    return results;
  }

  /**
   * Apply sorting to results
   * تطبيق الترتيب على النتائج
   */
  applySorting(results, sortBy) {
    const sortOption = this.sortOptions.get(sortBy);
    if (!sortOption) {
      return results;
    }

    return [...results].sort(sortOption.compareFn);
  }

  /**
   * Sort by relevance (default)
   * ترتيب حسب الصلة
   */
  sortByRelevance(a, b) {
    // Simple relevance scoring based on title match, content match, etc.
    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
  }

  /**
   * Sort by date descending
   * ترتيب حسب التاريخ تنازلياً
   */
  sortByDateDesc(a, b) {
    const dateA = new Date(a.publishedAt || a.createdAt);
    const dateB = new Date(b.publishedAt || b.createdAt);
    return dateB - dateA;
  }

  /**
   * Sort by date ascending
   * ترتيب حسب التاريخ تصاعدياً
   */
  sortByDateAsc(a, b) {
    const dateA = new Date(a.publishedAt || a.createdAt);
    const dateB = new Date(b.publishedAt || b.createdAt);
    return dateA - dateB;
  }

  /**
   * Sort by title alphabetically
   * ترتيب حسب العنوان أبجدياً
   */
  sortByTitle(a, b) {
    return a.title.localeCompare(b.title, 'ar');
  }

  /**
   * Record search for analytics
   * تسجيل البحث للتحليلات
   */
  recordSearch(query, filters) {
    if (!getFeatureFlag('ENABLE_SEARCH_ANALYTICS')) return;

    this.searchAnalytics.totalSearches++;
    
    // Record popular terms
    const terms = query.toLowerCase().split(' ');
    terms.forEach(term => {
      if (term.length > 2) {
        const count = this.searchAnalytics.popularTerms.get(term) || 0;
        this.searchAnalytics.popularTerms.set(term, count + 1);
      }
    });

    // Record search history if enabled
    if (getFeatureFlag('ENABLE_SEARCH_HISTORY')) {
      this.searchHistory.unshift({
        query,
        filters,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 searches
      if (this.searchHistory.length > 100) {
        this.searchHistory = this.searchHistory.slice(0, 100);
      }
    }
  }

  /**
   * Update analytics with response time
   * تحديث التحليلات بوقت الاستجابة
   */
  updateAnalytics(responseTime) {
    const currentAvg = this.searchAnalytics.averageResponseTime;
    const totalSearches = this.searchAnalytics.totalSearches;
    
    this.searchAnalytics.averageResponseTime = 
      (currentAvg * (totalSearches - 1) + responseTime) / totalSearches;
  }

  /**
   * Generate mock search results for development
   * توليد نتائج بحث وهمية للتطوير
   */
  generateMockResults(query, filters) {
    // This will be replaced with actual data from APIs
    return [
      {
        id: '1',
        title: 'النظرية السياسية المعاصرة في المملكة العربية السعودية',
        content: 'دراسة شاملة حول تطور النظرية السياسية في المملكة...',
        author: 'د. أحمد محمد',
        type: 'research',
        language: 'ar',
        categories: ['political_theory'],
        publishedAt: '2024-01-15',
        relevanceScore: 95
      },
      {
        id: '2',
        title: 'International Relations in the Middle East',
        content: 'A comprehensive analysis of international relations...',
        author: 'Dr. Sarah Johnson',
        type: 'article',
        language: 'en',
        categories: ['international_relations'],
        publishedAt: '2024-02-20',
        relevanceScore: 88
      }
      // More mock data would be added here
    ];
  }

  /**
   * Get search analytics
   * الحصول على تحليلات البحث
   */
  getAnalytics() {
    return {
      ...this.searchAnalytics,
      popularTerms: Array.from(this.searchAnalytics.popularTerms.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };
  }

  /**
   * Get search history
   * الحصول على تاريخ البحث
   */
  getSearchHistory() {
    return getFeatureFlag('ENABLE_SEARCH_HISTORY') ? this.searchHistory : [];
  }

  /**
   * Clear search history
   * مسح تاريخ البحث
   */
  clearSearchHistory() {
    this.searchHistory = [];
  }

  /**
   * Get available filters
   * الحصول على الفلاتر المتاحة
   */
  getAvailableFilters() {
    return Array.from(this.filters.entries()).map(([key, filter]) => ({
      key,
      ...filter
    }));
  }

  /**
   * Get available sort options
   * الحصول على خيارات الترتيب المتاحة
   */
  getAvailableSortOptions() {
    return Array.from(this.sortOptions.entries()).map(([key, option]) => ({
      key,
      name: option.name,
      nameEn: option.nameEn,
      default: option.default || false
    }));
  }
}

// Create singleton instance
const searchEngineCore = new SearchEngineCore();

export default searchEngineCore;
