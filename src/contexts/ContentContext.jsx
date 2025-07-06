// src/contexts/ContentContext.jsx
/**
 * Content Management Context for SPSA
 * سياق إدارة المحتوى للجمعية السعودية للعلوم السياسية
 * 
 * Provides unified content management state and actions
 * يوفر حالة وإجراءات إدارة المحتوى الموحدة
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { unifiedContentService } from '../services/unifiedContentService.js';
import realtimeSyncService, { SYNC_EVENTS } from '../services/realtimeSyncService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { ENV } from '../config/environment.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

/**
 * Content Context
 */
const ContentContext = createContext(null);

/**
 * Initial State
 */
const initialState = {
  // Content Data
  content: [],
  categories: [],
  tags: [],
  
  // Current Content
  currentContent: null,
  
  // UI State
  loading: false,
  error: null,
  
  // Filters and Pagination
  filters: {
    contentType: '',
    status: '',
    category: '',
    search: '',
    featured: null
  },
  pagination: {
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  },
  
  // Statistics
  stats: {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    byType: {},
    totalViews: 0,
    totalLikes: 0
  },
  
  // Service Status
  serviceStatus: {
    isOnline: true,
    lastSync: null,
    syncInProgress: false
  },

  // Real-time Sync Status
  realtimeSync: {
    isEnabled: false,
    isConnected: false,
    lastUpdate: null,
    pendingUpdates: 0
  }
};

/**
 * Action Types
 */
const ACTION_TYPES = {
  // Loading States
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Content Actions
  SET_CONTENT: 'SET_CONTENT',
  ADD_CONTENT: 'ADD_CONTENT',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  REMOVE_CONTENT: 'REMOVE_CONTENT',
  SET_CURRENT_CONTENT: 'SET_CURRENT_CONTENT',
  
  // Categories and Tags
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_TAGS: 'SET_TAGS',
  
  // Filters and Pagination
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // Statistics
  SET_STATS: 'SET_STATS',
  
  // Service Status
  SET_SERVICE_STATUS: 'SET_SERVICE_STATUS',

  // Real-time Sync Actions
  SET_REALTIME_SYNC_STATUS: 'SET_REALTIME_SYNC_STATUS',
  REALTIME_CONTENT_UPDATED: 'REALTIME_CONTENT_UPDATED',
  REALTIME_CONTENT_CREATED: 'REALTIME_CONTENT_CREATED',
  REALTIME_CONTENT_DELETED: 'REALTIME_CONTENT_DELETED'
};

/**
 * Reducer Function
 */
function contentReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ACTION_TYPES.SET_CONTENT:
      return {
        ...state,
        content: action.payload,
        loading: false,
        error: null
      };

    case ACTION_TYPES.ADD_CONTENT:
      return {
        ...state,
        content: [action.payload, ...state.content],
        loading: false
      };

    case ACTION_TYPES.UPDATE_CONTENT:
      return {
        ...state,
        content: state.content.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        currentContent: state.currentContent?.id === action.payload.id 
          ? action.payload 
          : state.currentContent,
        loading: false
      };

    case ACTION_TYPES.REMOVE_CONTENT:
      return {
        ...state,
        content: state.content.filter(item => item.id !== action.payload),
        currentContent: state.currentContent?.id === action.payload 
          ? null 
          : state.currentContent,
        loading: false
      };

    case ACTION_TYPES.SET_CURRENT_CONTENT:
      return {
        ...state,
        currentContent: action.payload,
        loading: false
      };

    case ACTION_TYPES.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      };

    case ACTION_TYPES.SET_TAGS:
      return {
        ...state,
        tags: action.payload
      };

    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case ACTION_TYPES.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };

    case ACTION_TYPES.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        pagination: initialState.pagination
      };

    case ACTION_TYPES.SET_STATS:
      return {
        ...state,
        stats: action.payload
      };

    case ACTION_TYPES.SET_SERVICE_STATUS:
      return {
        ...state,
        serviceStatus: {
          ...state.serviceStatus,
          ...action.payload
        }
      };

    case ACTION_TYPES.SET_REALTIME_SYNC_STATUS:
      return {
        ...state,
        realtimeSync: {
          ...state.realtimeSync,
          ...action.payload
        }
      };

    case ACTION_TYPES.REALTIME_CONTENT_UPDATED:
      return {
        ...state,
        content: state.content.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
        realtimeSync: {
          ...state.realtimeSync,
          lastUpdate: Date.now(),
          pendingUpdates: Math.max(0, state.realtimeSync.pendingUpdates - 1)
        }
      };

    case ACTION_TYPES.REALTIME_CONTENT_CREATED:
      return {
        ...state,
        content: [action.payload, ...state.content],
        realtimeSync: {
          ...state.realtimeSync,
          lastUpdate: Date.now(),
          pendingUpdates: Math.max(0, state.realtimeSync.pendingUpdates - 1)
        }
      };

    case ACTION_TYPES.REALTIME_CONTENT_DELETED:
      return {
        ...state,
        content: state.content.filter(item => item.id !== action.payload.id),
        realtimeSync: {
          ...state.realtimeSync,
          lastUpdate: Date.now(),
          pendingUpdates: Math.max(0, state.realtimeSync.pendingUpdates - 1)
        }
      };

    default:
      return state;
  }
}

/**
 * Content Provider Component
 */
export const ContentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contentReducer, initialState);

  /**
   * Load content with current filters
   */
  const loadContent = useCallback(async (resetPagination = false) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

      const options = {
        ...state.filters,
        limit: state.pagination.limit,
        offset: resetPagination ? 0 : state.pagination.offset
      };

      const response = await unifiedContentService.getContent(options);

      if (response.success) {
        dispatch({ type: ACTION_TYPES.SET_CONTENT, payload: response.data });
        dispatch({ 
          type: ACTION_TYPES.SET_PAGINATION, 
          payload: {
            ...response.pagination,
            offset: resetPagination ? 0 : state.pagination.offset
          }
        });
      } else {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: response.error });
      }

    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.filters, state.pagination.limit, state.pagination.offset]);

  /**
   * Load content by ID
   */
  const loadContentById = useCallback(async (id) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

      const response = await unifiedContentService.getContentById(id);

      if (response.success) {
        dispatch({ type: ACTION_TYPES.SET_CURRENT_CONTENT, payload: response.data });
      } else {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: response.error });
      }

    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, []);

  /**
   * Create new content
   */
  const createContent = useCallback(async (contentData) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

      const response = await unifiedContentService.createContent(contentData);

      if (response.success) {
        dispatch({ type: ACTION_TYPES.ADD_CONTENT, payload: response.data });
        await loadStats(); // Refresh stats
        return response;
      } else {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: response.error || response.errors?.join(', ') });
        return response;
      }

    } catch (error) {
      const errorMessage = error.message;
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Update existing content
   */
  const updateContent = useCallback(async (id, updateData) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

      const response = await unifiedContentService.updateContent(id, updateData);

      if (response.success) {
        dispatch({ type: ACTION_TYPES.UPDATE_CONTENT, payload: response.data });
        await loadStats(); // Refresh stats
        return response;
      } else {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: response.error || response.errors?.join(', ') });
        return response;
      }

    } catch (error) {
      const errorMessage = error.message;
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Delete content
   */
  const deleteContent = useCallback(async (id) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

      const response = await unifiedContentService.deleteContent(id);

      if (response.success) {
        dispatch({ type: ACTION_TYPES.REMOVE_CONTENT, payload: id });
        await loadStats(); // Refresh stats
        return response;
      } else {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: response.error });
        return response;
      }

    } catch (error) {
      const errorMessage = error.message;
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Load categories
   */
  const loadCategories = useCallback(async () => {
    try {
      const response = await unifiedContentService.getCategories();
      if (response.success) {
        dispatch({ type: ACTION_TYPES.SET_CATEGORIES, payload: response.data });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  /**
   * Load tags
   */
  const loadTags = useCallback(async () => {
    try {
      const response = await unifiedContentService.getTags();
      if (response.success) {
        dispatch({ type: ACTION_TYPES.SET_TAGS, payload: response.data });
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }, []);

  /**
   * Load statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await unifiedContentService.getContentStats();
      if (response.success) {
        dispatch({ type: ACTION_TYPES.SET_STATS, payload: response.data });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: newFilters });
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_FILTERS });
  }, []);

  /**
   * Load more content (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!state.pagination.hasMore || state.loading) return;

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      const options = {
        ...state.filters,
        limit: state.pagination.limit,
        offset: state.pagination.offset + state.pagination.limit
      };

      const response = await unifiedContentService.getContent(options);

      if (response.success) {
        dispatch({
          type: ACTION_TYPES.SET_CONTENT,
          payload: [...state.content, ...response.data]
        });
        dispatch({
          type: ACTION_TYPES.SET_PAGINATION,
          payload: {
            ...response.pagination,
            offset: options.offset
          }
        });
      }

    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.content, state.filters, state.pagination, state.loading]);

  /**
   * Search content
   */
  const searchContent = useCallback(async (query) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

      const response = await unifiedContentService.searchContent(query, {
        limit: state.pagination.limit
      });

      if (response.success) {
        dispatch({ type: ACTION_TYPES.SET_CONTENT, payload: response.data });
        dispatch({
          type: ACTION_TYPES.SET_PAGINATION,
          payload: { ...response.pagination, offset: 0 }
        });
      } else {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: response.error });
      }

    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.pagination.limit]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  /**
   * Initialize real-time sync
   */
  const initializeRealtimeSync = useCallback(() => {
    if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
      return;
    }

    try {
      // Update sync status
      dispatch({
        type: ACTION_TYPES.SET_REALTIME_SYNC_STATUS,
        payload: {
          isEnabled: true,
          isConnected: false
        }
      });

      // Subscribe to content sync events
      const unsubscribeCreated = realtimeSyncService.subscribe(
        SYNC_EVENTS.CONTENT_CREATED,
        (event) => {
          dispatch({
            type: ACTION_TYPES.REALTIME_CONTENT_CREATED,
            payload: event.data.content
          });
        }
      );

      const unsubscribeUpdated = realtimeSyncService.subscribe(
        SYNC_EVENTS.CONTENT_UPDATED,
        (event) => {
          dispatch({
            type: ACTION_TYPES.REALTIME_CONTENT_UPDATED,
            payload: event.data.content
          });
        }
      );

      const unsubscribeDeleted = realtimeSyncService.subscribe(
        SYNC_EVENTS.CONTENT_DELETED,
        (event) => {
          dispatch({
            type: ACTION_TYPES.REALTIME_CONTENT_DELETED,
            payload: event.data.content
          });
        }
      );

      // Update connection status
      const syncStatus = realtimeSyncService.getStatus();
      dispatch({
        type: ACTION_TYPES.SET_REALTIME_SYNC_STATUS,
        payload: {
          isConnected: syncStatus.isInitialized,
          lastUpdate: syncStatus.lastSync
        }
      });

      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Real-time sync initialized for ContentContext');
      }

      // Return cleanup function
      return () => {
        unsubscribeCreated();
        unsubscribeUpdated();
        unsubscribeDeleted();
      };

    } catch (error) {
      console.error('❌ Failed to initialize real-time sync:', error);
      dispatch({
        type: ACTION_TYPES.SET_REALTIME_SYNC_STATUS,
        payload: {
          isEnabled: false,
          isConnected: false
        }
      });
    }
  }, []);

  /**
   * Sync content change to real-time service
   */
  const syncContentChange = useCallback(async (changeType, contentData) => {
    if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
      return true; // Skip sync but don't fail
    }

    try {
      // Increment pending updates counter
      dispatch({
        type: ACTION_TYPES.SET_REALTIME_SYNC_STATUS,
        payload: {
          pendingUpdates: state.realtimeSync.pendingUpdates + 1
        }
      });

      const success = await realtimeSyncService.syncContentChange(
        changeType,
        contentData,
        { source: 'content_context' }
      );

      if (!success) {
        // Decrement counter on failure
        dispatch({
          type: ACTION_TYPES.SET_REALTIME_SYNC_STATUS,
          payload: {
            pendingUpdates: Math.max(0, state.realtimeSync.pendingUpdates - 1)
          }
        });
      }

      return success;

    } catch (error) {
      console.error('❌ Failed to sync content change:', error);
      // Decrement counter on error
      dispatch({
        type: ACTION_TYPES.SET_REALTIME_SYNC_STATUS,
        payload: {
          pendingUpdates: Math.max(0, state.realtimeSync.pendingUpdates - 1)
        }
      });
      return false;
    }
  }, [state.realtimeSync.pendingUpdates]);

  /**
   * Enhanced create content with real-time sync
   */
  const createContentWithSync = useCallback(async (contentData) => {
    const result = await createContent(contentData);

    if (result && result.success) {
      await syncContentChange(SYNC_EVENTS.CONTENT_CREATED, result.data);
    }

    return result;
  }, [createContent, syncContentChange]);

  /**
   * Enhanced update content with real-time sync
   */
  const updateContentWithSync = useCallback(async (id, contentData) => {
    const result = await updateContent(id, contentData);

    if (result && result.success) {
      await syncContentChange(SYNC_EVENTS.CONTENT_UPDATED, result.data);
    }

    return result;
  }, [updateContent, syncContentChange]);

  /**
   * Enhanced delete content with real-time sync
   */
  const deleteContentWithSync = useCallback(async (id) => {
    const result = await deleteContent(id);

    if (result && result.success) {
      await syncContentChange(SYNC_EVENTS.CONTENT_DELETED, { id });
    }

    return result;
  }, [deleteContent, syncContentChange]);

  /**
   * Initialize content context
   */
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        loadContent(true),
        loadCategories(),
        loadTags(),
        loadStats()
      ]);
    };

    initialize();

    // Initialize real-time sync
    const cleanupSync = initializeRealtimeSync();

    // Cleanup function
    return () => {
      if (cleanupSync && typeof cleanupSync === 'function') {
        cleanupSync();
      }
    };
  }, []); // Only run once on mount

  /**
   * Reload content when filters change
   */
  useEffect(() => {
    loadContent(true);
  }, [state.filters]);

  /**
   * Context value
   */
  const contextValue = {
    // State
    ...state,

    // Actions
    loadContent,
    loadContentById,
    createContent,
    updateContent,
    deleteContent,

    // Real-time Sync Actions
    createContentWithSync,
    updateContentWithSync,
    deleteContentWithSync,
    syncContentChange,

    // Categories and Tags
    loadCategories,
    loadTags,

    // Filters and Search
    updateFilters,
    resetFilters,
    searchContent,

    // Pagination
    loadMore,

    // Statistics
    loadStats,

    // Utility
    clearError,

    // Service info
    isServiceAvailable: getFeatureFlag('ENABLE_CONTENT_MANAGEMENT'),
    isRealtimeSyncEnabled: getFeatureFlag('ENABLE_REAL_TIME_FEATURES'),

    // Constants
    CONTENT_TYPES,
    CONTENT_STATUS
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

/**
 * Custom hook to use content context
 */
export const useContent = () => {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }

  return context;
};

// Export default for better compatibility
export default ContentProvider;
