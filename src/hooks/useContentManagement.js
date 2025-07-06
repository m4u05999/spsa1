// src/hooks/useContentManagement.js
/**
 * Content Management Hook for SPSA
 * خطاف إدارة المحتوى للجمعية السعودية للعلوم السياسية
 * 
 * Provides advanced content management functionality
 * يوفر وظائف إدارة المحتوى المتقدمة
 */

import { useState, useCallback, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext.jsx';
import { CONTENT_TYPES, CONTENT_STATUS, EVENT_STATUS } from '../schemas/contentManagementSchema.js';
import { ENV } from '../config/environment.js';

/**
 * Content Management Hook
 */
export const useContentManagement = (options = {}) => {
  const {
    autoLoad = true,
    contentType = null,
    initialFilters = {}
  } = options;

  const contentContext = useContent();
  const [localState, setLocalState] = useState({
    selectedItems: [],
    bulkActionInProgress: false,
    sortConfig: { field: 'createdAt', direction: 'desc' },
    viewMode: 'list' // list, grid, card
  });

  /**
   * Select/Deselect content items
   */
  const toggleSelection = useCallback((contentId) => {
    setLocalState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(contentId)
        ? prev.selectedItems.filter(id => id !== contentId)
        : [...prev.selectedItems, contentId]
    }));
  }, []);

  /**
   * Select all visible items
   */
  const selectAll = useCallback(() => {
    const allIds = contentContext.content.map(item => item.id);
    setLocalState(prev => ({
      ...prev,
      selectedItems: allIds
    }));
  }, [contentContext.content]);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      selectedItems: []
    }));
  }, []);

  /**
   * Bulk actions
   */
  const performBulkAction = useCallback(async (action, data = {}) => {
    if (localState.selectedItems.length === 0) {
      return { success: false, error: 'لم يتم تحديد أي عناصر' };
    }

    setLocalState(prev => ({ ...prev, bulkActionInProgress: true }));

    try {
      const results = [];
      
      for (const contentId of localState.selectedItems) {
        let result;
        
        switch (action) {
          case 'publish':
            result = await contentContext.updateContent(contentId, { 
              status: CONTENT_STATUS.PUBLISHED,
              publishedAt: new Date().toISOString()
            });
            break;
            
          case 'unpublish':
            result = await contentContext.updateContent(contentId, { 
              status: CONTENT_STATUS.DRAFT,
              publishedAt: null
            });
            break;
            
          case 'archive':
            result = await contentContext.updateContent(contentId, { 
              status: CONTENT_STATUS.ARCHIVED
            });
            break;
            
          case 'delete':
            result = await contentContext.deleteContent(contentId);
            break;
            
          case 'feature':
            result = await contentContext.updateContent(contentId, { 
              isFeatured: true
            });
            break;
            
          case 'unfeature':
            result = await contentContext.updateContent(contentId, { 
              isFeatured: false
            });
            break;
            
          case 'updateCategory':
            result = await contentContext.updateContent(contentId, { 
              category: data.category
            });
            break;
            
          case 'addTags':
            const currentContent = contentContext.content.find(c => c.id === contentId);
            const newTags = [...(currentContent.tags || []), ...data.tags];
            result = await contentContext.updateContent(contentId, { 
              tags: [...new Set(newTags)] // Remove duplicates
            });
            break;
            
          default:
            result = { success: false, error: 'إجراء غير مدعوم' };
        }
        
        results.push({ contentId, result });
      }

      const successCount = results.filter(r => r.result.success).length;
      const failureCount = results.length - successCount;

      clearSelection();

      return {
        success: failureCount === 0,
        message: `تم تنفيذ الإجراء على ${successCount} عنصر${failureCount > 0 ? ` وفشل في ${failureCount} عنصر` : ''}`,
        results
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLocalState(prev => ({ ...prev, bulkActionInProgress: false }));
    }
  }, [localState.selectedItems, contentContext, clearSelection]);

  /**
   * Sort content
   */
  const sortContent = useCallback((field, direction = null) => {
    const newDirection = direction || 
      (localState.sortConfig.field === field && localState.sortConfig.direction === 'asc' ? 'desc' : 'asc');
    
    setLocalState(prev => ({
      ...prev,
      sortConfig: { field, direction: newDirection }
    }));

    // Apply sorting to context filters
    contentContext.updateFilters({
      sortBy: field,
      sortOrder: newDirection
    });
  }, [localState.sortConfig, contentContext]);

  /**
   * Change view mode
   */
  const setViewMode = useCallback((mode) => {
    setLocalState(prev => ({
      ...prev,
      viewMode: mode
    }));
  }, []);

  /**
   * Quick filters
   */
  const applyQuickFilter = useCallback((filterType, value) => {
    const newFilters = { ...contentContext.filters };

    switch (filterType) {
      case 'status':
        newFilters.status = value;
        break;
      case 'contentType':
        newFilters.contentType = value;
        break;
      case 'category':
        newFilters.category = value;
        break;
      case 'featured':
        newFilters.featured = value;
        break;
      case 'recent':
        // Show content from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        newFilters.dateFrom = weekAgo.toISOString();
        break;
      case 'popular':
        // Sort by views
        newFilters.sortBy = 'viewsCount';
        newFilters.sortOrder = 'desc';
        break;
      default:
        break;
    }

    contentContext.updateFilters(newFilters);
  }, [contentContext]);

  /**
   * Content templates
   */
  const createFromTemplate = useCallback(async (templateType, customData = {}) => {
    const templates = {
      [CONTENT_TYPES.NEWS]: {
        title: 'خبر جديد',
        contentType: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.DRAFT,
        category: 'أخبار',
        allowComments: true,
        isPublic: true
      },
      
      [CONTENT_TYPES.EVENT]: {
        title: 'فعالية جديدة',
        contentType: CONTENT_TYPES.EVENT,
        status: CONTENT_STATUS.DRAFT,
        eventStatus: EVENT_STATUS.UPCOMING,
        category: 'فعاليات',
        registrationRequired: false,
        allowComments: true,
        isPublic: true,
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        location: 'مقر الجمعية'
      },
      
      [CONTENT_TYPES.ARTICLE]: {
        title: 'مقال جديد',
        contentType: CONTENT_TYPES.ARTICLE,
        status: CONTENT_STATUS.DRAFT,
        category: 'مقالات',
        allowComments: true,
        isPublic: true
      }
    };

    const template = templates[templateType];
    if (!template) {
      return { success: false, error: 'قالب غير موجود' };
    }

    const contentData = {
      ...template,
      ...customData,
      content: customData.content || 'محتوى المقال...',
      excerpt: customData.excerpt || 'مقتطف من المحتوى...'
    };

    return await contentContext.createContent(contentData);
  }, [contentContext]);

  /**
   * Duplicate content
   */
  const duplicateContent = useCallback(async (contentId) => {
    try {
      const original = contentContext.content.find(c => c.id === contentId);
      if (!original) {
        return { success: false, error: 'المحتوى غير موجود' };
      }

      const duplicatedData = {
        ...original,
        id: undefined, // Will be generated
        title: `${original.title} - نسخة`,
        slug: undefined, // Will be generated
        status: CONTENT_STATUS.DRAFT,
        publishedAt: null,
        viewsCount: 0,
        likesCount: 0,
        sharesCount: 0,
        createdAt: undefined, // Will be set by service
        updatedAt: undefined // Will be set by service
      };

      return await contentContext.createContent(duplicatedData);

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [contentContext]);

  /**
   * Export content
   */
  const exportContent = useCallback((format = 'json', selectedOnly = false) => {
    try {
      const contentToExport = selectedOnly 
        ? contentContext.content.filter(c => localState.selectedItems.includes(c.id))
        : contentContext.content;

      if (contentToExport.length === 0) {
        return { success: false, error: 'لا توجد بيانات للتصدير' };
      }

      let exportData;
      let filename;
      let mimeType;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(contentToExport, null, 2);
          filename = `spsa-content-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          const headers = ['ID', 'Title', 'Type', 'Status', 'Category', 'Created', 'Views'];
          const csvRows = [
            headers.join(','),
            ...contentToExport.map(item => [
              item.id,
              `"${item.title}"`,
              item.contentType,
              item.status,
              item.category,
              item.createdAt,
              item.viewsCount || 0
            ].join(','))
          ];
          exportData = csvRows.join('\n');
          filename = `spsa-content-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
          
        default:
          return { success: false, error: 'تنسيق غير مدعوم' };
      }

      // Create download
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { 
        success: true, 
        message: `تم تصدير ${contentToExport.length} عنصر بنجاح` 
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [contentContext.content, localState.selectedItems]);

  /**
   * Initialize with filters if provided
   */
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      contentContext.updateFilters(initialFilters);
    }
  }, []);

  /**
   * Auto-load content if specified
   */
  useEffect(() => {
    if (autoLoad && contentType) {
      contentContext.updateFilters({ contentType });
    }
  }, [autoLoad, contentType]);

  return {
    // Context state and actions
    ...contentContext,
    
    // Local state
    selectedItems: localState.selectedItems,
    bulkActionInProgress: localState.bulkActionInProgress,
    sortConfig: localState.sortConfig,
    viewMode: localState.viewMode,
    
    // Selection actions
    toggleSelection,
    selectAll,
    clearSelection,
    
    // Bulk actions
    performBulkAction,
    
    // Sorting and view
    sortContent,
    setViewMode,
    
    // Quick filters
    applyQuickFilter,
    
    // Templates and duplication
    createFromTemplate,
    duplicateContent,
    
    // Export
    exportContent,
    
    // Computed values
    hasSelection: localState.selectedItems.length > 0,
    selectionCount: localState.selectedItems.length,
    isAllSelected: localState.selectedItems.length === contentContext.content.length && contentContext.content.length > 0
  };
};

export default useContentManagement;
