/**
 * Search Context
 * سياق البحث
 * 
 * Provides search state management and functionality across the application
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import searchService from '../services/searchService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

// Search Context
const SearchContext = createContext();

// Search Actions
const SEARCH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_QUERY: 'SET_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT_BY: 'SET_SORT_BY',
  SET_RESULTS: 'SET_RESULTS',
  SET_ERROR: 'SET_ERROR',
  SET_SUGGESTIONS: 'SET_SUGGESTIONS',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_HISTORY: 'SET_HISTORY',
  CLEAR_RESULTS: 'CLEAR_RESULTS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PAGINATION: 'UPDATE_PAGINATION'
};

// Initial State
const initialState = {
  // Search query and filters
  query: '',
  filters: {},
  sortBy: 'relevance',
  
  // Results and pagination
  results: [],
  total: 0,
  page: 1,
  limit: 20,
  
  // UI state
  isLoading: false,
  error: null,
  
  // Advanced features
  suggestions: [],
  analytics: null,
  history: [],
  
  // Available options
  availableFilters: [],
  availableSortOptions: [],
  
  // Response metadata
  responseTime: 0,
  lastSearchTime: null
};

// Search Reducer
function searchReducer(state, action) {
  switch (action.type) {
    case SEARCH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };
      
    case SEARCH_ACTIONS.SET_QUERY:
      return {
        ...state,
        query: action.payload,
        page: 1 // Reset to first page when query changes
      };
      
    case SEARCH_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        page: 1 // Reset to first page when filters change
      };
      
    case SEARCH_ACTIONS.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload,
        page: 1 // Reset to first page when sort changes
      };
      
    case SEARCH_ACTIONS.SET_RESULTS:
      return {
        ...state,
        results: action.payload.results,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        responseTime: action.payload.responseTime,
        lastSearchTime: new Date().toISOString(),
        isLoading: false,
        error: null
      };
      
    case SEARCH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case SEARCH_ACTIONS.SET_SUGGESTIONS:
      return {
        ...state,
        suggestions: action.payload
      };
      
    case SEARCH_ACTIONS.SET_ANALYTICS:
      return {
        ...state,
        analytics: action.payload
      };
      
    case SEARCH_ACTIONS.SET_HISTORY:
      return {
        ...state,
        history: action.payload
      };
      
    case SEARCH_ACTIONS.CLEAR_RESULTS:
      return {
        ...state,
        results: [],
        total: 0,
        page: 1,
        error: null
      };
      
    case SEARCH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case SEARCH_ACTIONS.UPDATE_PAGINATION:
      return {
        ...state,
        page: action.payload.page,
        limit: action.payload.limit
      };
      
    default:
      return state;
  }
}

/**
 * Search Provider Component
 * مكون موفر البحث
 */
export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Initialize search service and load initial data
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        if (!getFeatureFlag('ENABLE_ADVANCED_SEARCH')) {
          logInfo('Advanced search is disabled');
          return;
        }

        // Load available filters and sort options
        const filters = searchService.getAvailableFilters();
        const sortOptions = searchService.getAvailableSortOptions();
        
        dispatch({
          type: 'SET_AVAILABLE_OPTIONS',
          payload: { filters, sortOptions }
        });

        // Load search history if enabled
        if (getFeatureFlag('ENABLE_SEARCH_HISTORY')) {
          const history = searchService.getSearchHistory();
          dispatch({ type: SEARCH_ACTIONS.SET_HISTORY, payload: history });
        }

        // Load analytics if enabled
        if (getFeatureFlag('ENABLE_SEARCH_ANALYTICS')) {
          const analytics = searchService.getSearchAnalytics();
          dispatch({ type: SEARCH_ACTIONS.SET_ANALYTICS, payload: analytics });
        }

        logInfo('Search context initialized');
        
      } catch (error) {
        logError('Failed to initialize search context', error);
        dispatch({ 
          type: SEARCH_ACTIONS.SET_ERROR, 
          payload: 'فشل في تهيئة نظام البحث' 
        });
      }
    };

    initializeSearch();
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery = state.query, searchOptions = {}) => {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        dispatch({ type: SEARCH_ACTIONS.CLEAR_RESULTS });
        return;
      }

      dispatch({ type: SEARCH_ACTIONS.SET_LOADING, payload: true });

      const options = {
        filters: state.filters,
        sortBy: state.sortBy,
        page: state.page,
        limit: state.limit,
        ...searchOptions
      };

      const results = await searchService.search(searchQuery, options);
      
      dispatch({ type: SEARCH_ACTIONS.SET_RESULTS, payload: results });

      // Update analytics if enabled
      if (getFeatureFlag('ENABLE_SEARCH_ANALYTICS')) {
        const analytics = searchService.getSearchAnalytics();
        dispatch({ type: SEARCH_ACTIONS.SET_ANALYTICS, payload: analytics });
      }

      // Update history if enabled
      if (getFeatureFlag('ENABLE_SEARCH_HISTORY')) {
        const history = searchService.getSearchHistory();
        dispatch({ type: SEARCH_ACTIONS.SET_HISTORY, payload: history });
      }

    } catch (error) {
      logError('Search failed', error);
      dispatch({ 
        type: SEARCH_ACTIONS.SET_ERROR, 
        payload: 'فشل في تنفيذ البحث. يرجى المحاولة مرة أخرى.' 
      });
    }
  }, [state.query, state.filters, state.sortBy, state.page, state.limit]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query) => {
    try {
      if (!getFeatureFlag('ENABLE_SEARCH_SUGGESTIONS') || !query || query.length < 2) {
        dispatch({ type: SEARCH_ACTIONS.SET_SUGGESTIONS, payload: [] });
        return;
      }

      const suggestions = await searchService.getSearchSuggestions(query);
      dispatch({ type: SEARCH_ACTIONS.SET_SUGGESTIONS, payload: suggestions });
      
    } catch (error) {
      logError('Failed to get search suggestions', error);
      dispatch({ type: SEARCH_ACTIONS.SET_SUGGESTIONS, payload: [] });
    }
  }, []);

  // Update query
  const updateQuery = useCallback((query) => {
    dispatch({ type: SEARCH_ACTIONS.SET_QUERY, payload: query });
    
    // Get suggestions for new query
    if (getFeatureFlag('ENABLE_SEARCH_SUGGESTIONS')) {
      getSuggestions(query);
    }
  }, [getSuggestions]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: SEARCH_ACTIONS.SET_FILTERS, payload: newFilters });
  }, []);

  // Update sort option
  const updateSortBy = useCallback((sortBy) => {
    dispatch({ type: SEARCH_ACTIONS.SET_SORT_BY, payload: sortBy });
  }, []);

  // Update pagination
  const updatePagination = useCallback((page, limit = state.limit) => {
    dispatch({ 
      type: SEARCH_ACTIONS.UPDATE_PAGINATION, 
      payload: { page, limit } 
    });
  }, [state.limit]);

  // Clear search results
  const clearResults = useCallback(() => {
    dispatch({ type: SEARCH_ACTIONS.CLEAR_RESULTS });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: SEARCH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    try {
      searchService.clearSearchHistory();
      dispatch({ type: SEARCH_ACTIONS.SET_HISTORY, payload: [] });
    } catch (error) {
      logError('Failed to clear search history', error);
    }
  }, []);

  // Clear search cache
  const clearCache = useCallback(() => {
    try {
      searchService.clearCache();
      logInfo('Search cache cleared');
    } catch (error) {
      logError('Failed to clear search cache', error);
    }
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    performSearch,
    updateQuery,
    updateFilters,
    updateSortBy,
    updatePagination,
    getSuggestions,
    clearResults,
    clearError,
    clearHistory,
    clearCache,
    
    // Service status
    serviceStatus: searchService.getServiceStatus(),
    
    // Feature flags
    features: {
      advancedSearch: getFeatureFlag('ENABLE_ADVANCED_SEARCH'),
      searchAnalytics: getFeatureFlag('ENABLE_SEARCH_ANALYTICS'),
      searchSuggestions: getFeatureFlag('ENABLE_SEARCH_SUGGESTIONS'),
      searchHistory: getFeatureFlag('ENABLE_SEARCH_HISTORY')
    }
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

/**
 * Hook to use search context
 * خطاف لاستخدام سياق البحث
 */
export function useSearch() {
  const context = useContext(SearchContext);
  
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  
  return context;
}

/**
 * Hook for search with automatic execution
 * خطاف للبحث مع التنفيذ التلقائي
 */
export function useSearchWithQuery(query, options = {}) {
  const search = useSearch();
  
  useEffect(() => {
    if (query && query.trim().length >= 2) {
      search.performSearch(query, options);
    }
  }, [query, JSON.stringify(options)]);
  
  return search;
}

/**
 * Hook for search suggestions
 * خطاف لاقتراحات البحث
 */
export function useSearchSuggestions(query, debounceMs = 300) {
  const { getSuggestions, suggestions } = useSearch();
  
  useEffect(() => {
    if (!query || query.length < 2) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      getSuggestions(query);
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, getSuggestions]);
  
  return suggestions;
}

export default SearchContext;
