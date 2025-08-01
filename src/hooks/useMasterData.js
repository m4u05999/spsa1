/**
 * useMasterData Hook - React Hook for MasterDataService
 * خطاف useMasterData - خطاف React لخدمة البيانات الرئيسية
 * 
 * @description
 * Hook مخصص لتسهيل استخدام MasterDataService في مكونات React
 * يوفر واجهة بسيطة وموحدة لجميع عمليات البيانات
 * 
 * @features
 * - State management تلقائي
 * - Loading states
 * - Error handling
 * - Real-time updates
 * - Caching optimization
 * - Offline support
 * 
 * @author SPSA Development Team
 * @version 1.0.0
 * @since 2024-12-29
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import MasterDataService from '../services/MasterDataService.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

/**
 * useMasterData Hook
 * 
 * @param {object} options - Hook options
 * @param {string} options.type - Content type to fetch
 * @param {object} options.filters - Filters to apply
 * @param {boolean} options.autoLoad - Auto load data on mount
 * @param {boolean} options.realtime - Enable real-time updates
 * @returns {object} Hook state and methods
 */
export const useMasterData = (options = {}) => {
  const {
    type = 'content',
    filters = {},
    autoLoad = true,
    realtime = true
  } = options;

  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Refs for cleanup
  const unsubscribeRefs = useRef([]);
  const mountedRef = useRef(true);

  /**
   * Load data from MasterDataService
   * تحميل البيانات من خدمة البيانات الرئيسية
   */
  const loadData = useCallback(async (customFilters = {}) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const mergedFilters = { ...filters, ...customFilters };
      const result = await MasterDataService.getContent(type, mergedFilters);

      if (mountedRef.current) {
        setData(result);
        setLastUpdate(Date.now());
      }

    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        console.error('❌ Error loading data:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [type, filters]);

  /**
   * Create new content
   * إنشاء محتوى جديد
   */
  const createContent = useCallback(async (contentData) => {
    try {
      setLoading(true);
      setError(null);

      const newContent = await MasterDataService.createContent(contentData);

      if (mountedRef.current) {
        setData(prevData => [newContent, ...prevData]);
        setLastUpdate(Date.now());
      }

      return newContent;

    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Update existing content
   * تحديث المحتوى الموجود
   */
  const updateContent = useCallback(async (id, contentData) => {
    try {
      setLoading(true);
      setError(null);

      const updatedContent = await MasterDataService.updateContent(id, contentData);

      if (mountedRef.current) {
        setData(prevData => 
          prevData.map(item => 
            item.id === id ? updatedContent : item
          )
        );
        setLastUpdate(Date.now());
      }

      return updatedContent;

    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Delete content
   * حذف المحتوى
   */
  const deleteContent = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await MasterDataService.deleteContent(id);

      if (mountedRef.current) {
        setData(prevData => prevData.filter(item => item.id !== id));
        setLastUpdate(Date.now());
      }

      return true;

    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Search content
   * البحث في المحتوى
   */
  const searchContent = useCallback(async (query, searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const results = await MasterDataService.searchContent(query, {
        ...filters,
        ...searchFilters
      });

      if (mountedRef.current) {
        setData(results);
        setLastUpdate(Date.now());
      }

      return results;

    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  /**
   * Get content by ID
   * الحصول على المحتوى بالمعرف
   */
  const getContentById = useCallback(async (id) => {
    try {
      const content = await MasterDataService.getContentById(id);
      return content;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  /**
   * Refresh data
   * تحديث البيانات
   */
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!realtime) return;

    const setupRealtimeSubscriptions = () => {
      // Subscribe to content created
      const unsubscribeCreated = MasterDataService.subscribeToRealtime(
        'content_created',
        (newContent) => {
          if (mountedRef.current && shouldIncludeContent(newContent)) {
            setData(prevData => [newContent, ...prevData]);
            setLastUpdate(Date.now());
          }
        }
      );

      // Subscribe to content updated
      const unsubscribeUpdated = MasterDataService.subscribeToRealtime(
        'content_updated',
        (updatedContent) => {
          if (mountedRef.current && shouldIncludeContent(updatedContent)) {
            setData(prevData =>
              prevData.map(item =>
                item.id === updatedContent.id ? updatedContent : item
              )
            );
            setLastUpdate(Date.now());
          }
        }
      );

      // Subscribe to content deleted
      const unsubscribeDeleted = MasterDataService.subscribeToRealtime(
        'content_deleted',
        (deletedContent) => {
          if (mountedRef.current) {
            setData(prevData =>
              prevData.filter(item => item.id !== deletedContent.id)
            );
            setLastUpdate(Date.now());
          }
        }
      );

      unsubscribeRefs.current = [
        unsubscribeCreated,
        unsubscribeUpdated,
        unsubscribeDeleted
      ];
    };

    setupRealtimeSubscriptions();

    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    };
  }, [realtime, type]);

  // Helper function to check if content should be included
  const shouldIncludeContent = (content) => {
    // Check content type
    if (type !== 'content' && type !== 'all' && content.contentType !== type) {
      return false;
    }

    // Check filters
    if (filters.status && content.status !== filters.status) {
      return false;
    }

    if (filters.category && content.category !== filters.category) {
      return false;
    }

    if (filters.featured !== undefined && content.isFeatured !== filters.featured) {
      return false;
    }

    return true;
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad]); // إزالة loadData من dependencies لتجنب infinite loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    // Data state
    data,
    loading,
    error,
    lastUpdate,
    isOnline,

    // Actions
    loadData,
    createContent,
    updateContent,
    deleteContent,
    searchContent,
    getContentById,
    refresh,
    clearError,

    // Service status
    serviceStatus: MasterDataService.getStatus()
  };
};

/**
 * useContent Hook - Specialized hook for content management
 * خطاف useContent - خطاف متخصص لإدارة المحتوى
 */
export const useContent = (contentType = 'content', options = {}) => {
  return useMasterData({
    type: contentType,
    ...options
  });
};

/**
 * useNews Hook - Specialized hook for news
 * خطاف useNews - خطاف متخصص للأخبار
 */
export const useNews = (options = {}) => {
  return useMasterData({
    type: 'news',
    filters: { status: CONTENT_STATUS.PUBLISHED },
    ...options
  });
};

/**
 * useEvents Hook - Specialized hook for events
 * خطاف useEvents - خطاف متخصص للفعاليات
 */
export const useEvents = (options = {}) => {
  return useMasterData({
    type: 'events',
    filters: { status: CONTENT_STATUS.PUBLISHED },
    ...options
  });
};

/**
 * useArticles Hook - Specialized hook for articles
 * خطاف useArticles - خطاف متخصص للمقالات
 */
export const useArticles = (options = {}) => {
  return useMasterData({
    type: 'articles',
    filters: { status: CONTENT_STATUS.PUBLISHED },
    ...options
  });
};

export default useMasterData;
