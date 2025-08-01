/**
 * Unified Content Hook
 * خطاف المحتوى الموحد
 * 
 * Provides unified interface for both dashboard and frontend content management
 * يوفر واجهة موحدة لإدارة المحتوى في لوحة التحكم والواجهة الأمامية
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { contentBridge } from '../services/contentBridge.js';
import { useUnifiedApp } from '../contexts/UnifiedAppContext.jsx';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

/**
 * Unified Content Hook
 */
export const useUnifiedContent = (options = {}) => {
  const {
    type = null,
    status = CONTENT_STATUS.PUBLISHED,
    featured = null,
    autoLoad = true,
    limit = 10,
    enableRealtime = true
  } = options;

  const { addNotification, setError } = useUnifiedApp();
  const [state, setState] = useState({
    content: [],
    categories: [],
    tags: [],
    loading: false,
    error: null,
    hasMore: false,
    total: 0,
    currentPage: 0
  });

  // Refs for managing subscriptions
  const subscriptionRefs = useRef([]);
  const mountedRef = useRef(true);

  /**
   * Load content with options
   * تحميل المحتوى مع الخيارات
   */
  const loadContent = useCallback(async (loadOptions = {}) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const finalOptions = {
        type,
        status,
        featured,
        limit,
        offset: loadOptions.page ? loadOptions.page * limit : 0,
        ...loadOptions
      };

      const result = await contentBridge.getContentForDisplay(finalOptions);

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        content: loadOptions.append ? [...prev.content, ...result.content] : result.content,
        categories: result.categories,
        tags: result.tags,
        hasMore: result.hasMore,
        total: result.total,
        currentPage: loadOptions.page || 0,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error loading content:', error);
      
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'فشل في تحميل المحتوى'
      }));

      setError({
        message: 'فشل في تحميل المحتوى',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }, [type, status, featured, limit, setError]);

  /**
   * Load more content (pagination)
   * تحميل المزيد من المحتوى (ترقيم الصفحات)
   */
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    await loadContent({
      page: state.currentPage + 1,
      append: true
    });
  }, [loadContent, state.loading, state.hasMore, state.currentPage]);

  /**
   * Refresh content
   * تحديث المحتوى
   */
  const refresh = useCallback(async () => {
    await loadContent({ page: 0 });
  }, [loadContent]);

  /**
   * Search content
   * البحث في المحتوى
   */
  const searchContent = useCallback(async (query, searchOptions = {}) => {
    await loadContent({
      search: query,
      page: 0,
      ...searchOptions
    });
  }, [loadContent]);

  /**
   * Filter content by category
   * تصفية المحتوى حسب الفئة
   */
  const filterByCategory = useCallback(async (categoryId) => {
    await loadContent({
      category: categoryId,
      page: 0
    });
  }, [loadContent]);

  /**
   * Filter content by type
   * تصفية المحتوى حسب النوع
   */
  const filterByType = useCallback(async (contentType) => {
    await loadContent({
      type: contentType,
      page: 0
    });
  }, [loadContent]);

  /**
   * Get content by ID
   * الحصول على المحتوى بالمعرف
   */
  const getContentById = useCallback(async (id) => {
    try {
      // First check if content is already in our state
      const existingContent = state.content.find(item => item.id === id);
      if (existingContent) {
        return existingContent;
      }

      // Load single content item
      const result = await contentBridge.getContentForDisplay({
        id,
        limit: 1
      });

      return result.content[0] || null;

    } catch (error) {
      console.error('Error getting content by ID:', error);
      setError({
        message: 'فشل في تحميل المحتوى',
        details: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }, [state.content, setError]);

  /**
   * Get featured content
   * الحصول على المحتوى المميز
   */
  const getFeaturedContent = useCallback(async (contentType = null) => {
    try {
      const result = await contentBridge.getContentForDisplay({
        type: contentType,
        featured: true,
        limit: 5
      });

      return result.content;

    } catch (error) {
      console.error('Error getting featured content:', error);
      return [];
    }
  }, []);

  /**
   * Get latest content
   * الحصول على أحدث المحتوى
   */
  const getLatestContent = useCallback(async (contentType = null, count = 5) => {
    try {
      const result = await contentBridge.getContentForDisplay({
        type: contentType,
        limit: count,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      return result.content;

    } catch (error) {
      console.error('Error getting latest content:', error);
      return [];
    }
  }, []);

  /**
   * Set up real-time subscriptions
   * إعداد الاشتراكات الفورية
   */
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!enableRealtime) return;

    // Subscribe to content changes
    const contentUnsubscribe = contentBridge.subscribe('content', (payload) => {
      if (!mountedRef.current) return;

      const { type: changeType, data } = payload;

      setState(prev => {
        let newContent = [...prev.content];

        switch (changeType) {
          case 'INSERT':
            // Add new content if it matches our filters
            if (shouldIncludeContent(data)) {
              newContent.unshift(data);
            }
            break;

          case 'UPDATE':
            // Update existing content
            const updateIndex = newContent.findIndex(item => item.id === data.id);
            if (updateIndex !== -1) {
              newContent[updateIndex] = data;
            }
            break;

          case 'DELETE':
            // Remove deleted content
            newContent = newContent.filter(item => item.id !== data.id);
            break;
        }

        return {
          ...prev,
          content: newContent,
          total: changeType === 'INSERT' ? prev.total + 1 : 
                 changeType === 'DELETE' ? prev.total - 1 : prev.total
        };
      });

      // Show notification for new content
      if (changeType === 'INSERT' && shouldIncludeContent(data)) {
        addNotification(
          `تم إضافة محتوى جديد: ${data.title}`,
          'info',
          { duration: 3000 }
        );
      }
    });

    // Subscribe to category changes
    const categoryUnsubscribe = contentBridge.subscribe('categories', () => {
      // Reload categories
      loadCategories();
    });

    subscriptionRefs.current = [contentUnsubscribe, categoryUnsubscribe];
  }, [enableRealtime, addNotification]);

  /**
   * Check if content should be included based on current filters
   * فحص ما إذا كان يجب تضمين المحتوى بناءً على المرشحات الحالية
   */
  const shouldIncludeContent = useCallback((content) => {
    if (type && content.content_type !== type) return false;
    if (status && content.status !== status) return false;
    if (featured !== null && content.is_featured !== featured) return false;
    return true;
  }, [type, status, featured]);

  /**
   * Load categories
   * تحميل الفئات
   */
  const loadCategories = useCallback(async () => {
    try {
      const categories = await contentBridge.getCategoriesForDisplay();
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          categories
        }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Initialize content bridge and load data
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        await contentBridge.initialize();
        
        if (autoLoad) {
          await loadContent();
        }

        setupRealtimeSubscriptions();
        
      } catch (error) {
        console.error('Failed to initialize content bridge:', error);
        setError({
          message: 'فشل في تهيئة نظام المحتوى',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };

    initializeAndLoad();

    // Cleanup subscriptions on unmount
    return () => {
      mountedRef.current = false;
      subscriptionRefs.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [autoLoad, loadContent, setupRealtimeSubscriptions, setError]);

  // Return hook interface
  return {
    // State
    content: state.content,
    categories: state.categories,
    tags: state.tags,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    total: state.total,
    currentPage: state.currentPage,

    // Actions
    loadContent,
    loadMore,
    refresh,
    searchContent,
    filterByCategory,
    filterByType,
    getContentById,
    getFeaturedContent,
    getLatestContent,

    // Utility functions
    isLoading: state.loading,
    isEmpty: state.content.length === 0 && !state.loading,
    hasContent: state.content.length > 0,
    canLoadMore: state.hasMore && !state.loading
  };
};

/**
 * Hook for dashboard content management
 * خطاف لإدارة المحتوى في لوحة التحكم
 */
export const useDashboardContent = (options = {}) => {
  const baseOptions = {
    status: null, // Include all statuses for dashboard
    autoLoad: true,
    enableRealtime: true,
    ...options
  };

  const contentHook = useUnifiedContent(baseOptions);

  // Additional dashboard-specific methods
  const createContent = useCallback(async (contentData) => {
    // Implement content creation logic
    // This would integrate with unifiedContentService
  }, []);

  const updateContent = useCallback(async (id, contentData) => {
    // Implement content update logic
  }, []);

  const deleteContent = useCallback(async (id) => {
    // Implement content deletion logic
  }, []);

  const publishContent = useCallback(async (id) => {
    // Implement content publishing logic
  }, []);

  const unpublishContent = useCallback(async (id) => {
    // Implement content unpublishing logic
  }, []);

  return {
    ...contentHook,
    
    // Dashboard-specific actions
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent
  };
};

export default useUnifiedContent;