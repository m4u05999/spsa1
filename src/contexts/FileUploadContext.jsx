/**
 * File Upload Context
 * سياق رفع الملفات
 * 
 * Provides file upload state management and functionality across the application
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import fileUploadService from '../services/fileUploadService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

// File Upload Context
const FileUploadContext = createContext();

// File Upload Actions
const FILE_UPLOAD_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_UPLOADING: 'SET_UPLOADING',
  SET_FILES: 'SET_FILES',
  ADD_FILE: 'ADD_FILE',
  UPDATE_FILE: 'UPDATE_FILE',
  REMOVE_FILE: 'REMOVE_FILE',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  SET_UPLOAD_HISTORY: 'SET_UPLOAD_HISTORY',
  SET_SERVICE_STATUS: 'SET_SERVICE_STATUS'
};

// Initial state
const initialState = {
  // Files state
  files: [],
  total: 0,
  loading: false,
  
  // Upload state
  uploading: false,
  uploadProgress: {},
  uploadQueue: [],
  
  // Filters and search
  filters: {
    category: '',
    type: '',
    search: '',
    dateRange: null
  },
  
  // History and analytics
  uploadHistory: [],
  serviceStatus: null,
  
  // Error handling
  error: null,
  
  // UI state
  selectedFiles: [],
  viewMode: 'grid', // 'grid' or 'list'
  sortBy: 'uploadedAt',
  sortOrder: 'desc'
};

// Reducer function
function fileUploadReducer(state, action) {
  switch (action.type) {
    case FILE_UPLOAD_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };

    case FILE_UPLOAD_ACTIONS.SET_UPLOADING:
      return {
        ...state,
        uploading: action.payload
      };

    case FILE_UPLOAD_ACTIONS.SET_FILES:
      return {
        ...state,
        files: action.payload.files || [],
        total: action.payload.total || 0,
        loading: false,
        error: null
      };

    case FILE_UPLOAD_ACTIONS.ADD_FILE:
      return {
        ...state,
        files: [action.payload, ...state.files],
        total: state.total + 1
      };

    case FILE_UPLOAD_ACTIONS.UPDATE_FILE:
      return {
        ...state,
        files: state.files.map(file =>
          file.fileId === action.payload.fileId
            ? { ...file, ...action.payload.updates }
            : file
        )
      };

    case FILE_UPLOAD_ACTIONS.REMOVE_FILE:
      return {
        ...state,
        files: state.files.filter(file => file.fileId !== action.payload),
        total: Math.max(0, state.total - 1),
        selectedFiles: state.selectedFiles.filter(id => id !== action.payload)
      };

    case FILE_UPLOAD_ACTIONS.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          [action.payload.uploadId]: action.payload.progress
        }
      };

    case FILE_UPLOAD_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        uploading: false
      };

    case FILE_UPLOAD_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case FILE_UPLOAD_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case FILE_UPLOAD_ACTIONS.SET_UPLOAD_HISTORY:
      return {
        ...state,
        uploadHistory: action.payload
      };

    case FILE_UPLOAD_ACTIONS.SET_SERVICE_STATUS:
      return {
        ...state,
        serviceStatus: action.payload
      };

    default:
      return state;
  }
}

/**
 * File Upload Provider Component
 * مكون موفر سياق رفع الملفات
 */
export const FileUploadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(fileUploadReducer, initialState);

  // Initialize service
  useEffect(() => {
    initializeService();
  }, []);

  // Set up progress listeners
  useEffect(() => {
    const handleProgressEvent = (event) => {
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_UPLOAD_PROGRESS,
        payload: {
          uploadId: event.detail.uploadId,
          progress: {
            status: event.detail.status,
            progress: event.detail.progress,
            error: event.detail.error
          }
        }
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('fileUploadProgress', handleProgressEvent);
      return () => {
        window.removeEventListener('fileUploadProgress', handleProgressEvent);
      };
    }
  }, []);

  /**
   * Initialize file upload service
   * تهيئة خدمة رفع الملفات
   */
  const initializeService = async () => {
    try {
      if (!getFeatureFlag('ENABLE_FILE_UPLOAD')) {
        logInfo('File upload is disabled');
        return;
      }

      await fileUploadService.initialize();
      
      // Get service status
      const status = fileUploadService.getServiceStatus();
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_SERVICE_STATUS,
        payload: status
      });

      // Load initial files
      await loadFiles();

      logInfo('File upload context initialized');
    } catch (error) {
      logError('Failed to initialize file upload context', error);
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_ERROR,
        payload: 'فشل في تهيئة نظام رفع الملفات'
      });
    }
  };

  /**
   * Load files with current filters
   * تحميل الملفات مع الفلاتر الحالية
   */
  const loadFiles = useCallback(async () => {
    try {
      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_LOADING, payload: true });

      const result = await fileUploadService.getUploadedFiles(state.filters);
      
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_FILES,
        payload: result
      });

    } catch (error) {
      logError('Failed to load files', error);
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_ERROR,
        payload: 'فشل في تحميل الملفات'
      });
    }
  }, [state.filters]);

  /**
   * Upload single file
   * رفع ملف واحد
   */
  const uploadFile = useCallback(async (file, options = {}) => {
    try {
      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_UPLOADING, payload: true });
      dispatch({ type: FILE_UPLOAD_ACTIONS.CLEAR_ERROR });

      const result = await fileUploadService.uploadFile(file, options);
      
      // Add to files list
      dispatch({
        type: FILE_UPLOAD_ACTIONS.ADD_FILE,
        payload: result
      });

      // Refresh upload history
      await loadUploadHistory();

      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_UPLOADING, payload: false });
      
      return result;

    } catch (error) {
      logError('File upload failed', error);
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_ERROR,
        payload: error.message || 'فشل في رفع الملف'
      });
      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_UPLOADING, payload: false });
      throw error;
    }
  }, []);

  /**
   * Upload multiple files
   * رفع ملفات متعددة
   */
  const uploadMultipleFiles = useCallback(async (files, options = {}) => {
    try {
      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_UPLOADING, payload: true });
      dispatch({ type: FILE_UPLOAD_ACTIONS.CLEAR_ERROR });

      const result = await fileUploadService.uploadMultipleFiles(files, options);
      
      // Add successful uploads to files list
      result.successful.forEach(file => {
        dispatch({
          type: FILE_UPLOAD_ACTIONS.ADD_FILE,
          payload: file
        });
      });

      // Show errors for failed uploads
      if (result.failed.length > 0) {
        const errorMessage = `فشل في رفع ${result.failed.length} من ${result.total} ملفات`;
        dispatch({
          type: FILE_UPLOAD_ACTIONS.SET_ERROR,
          payload: errorMessage
        });
      }

      // Refresh upload history
      await loadUploadHistory();

      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_UPLOADING, payload: false });
      
      return result;

    } catch (error) {
      logError('Multiple file upload failed', error);
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_ERROR,
        payload: error.message || 'فشل في رفع الملفات'
      });
      dispatch({ type: FILE_UPLOAD_ACTIONS.SET_UPLOADING, payload: false });
      throw error;
    }
  }, []);

  /**
   * Delete file
   * حذف ملف
   */
  const deleteFile = useCallback(async (fileId) => {
    try {
      await fileUploadService.deleteFile(fileId);
      
      dispatch({
        type: FILE_UPLOAD_ACTIONS.REMOVE_FILE,
        payload: fileId
      });

      return true;

    } catch (error) {
      logError('File deletion failed', error);
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_ERROR,
        payload: 'فشل في حذف الملف'
      });
      throw error;
    }
  }, []);

  /**
   * Get file download URL
   * الحصول على رابط تحميل الملف
   */
  const getFileDownloadUrl = useCallback(async (fileId) => {
    try {
      return await fileUploadService.getFileDownloadUrl(fileId);
    } catch (error) {
      logError('Failed to get download URL', error);
      throw error;
    }
  }, []);

  /**
   * Update filters
   * تحديث الفلاتر
   */
  const updateFilters = useCallback((newFilters) => {
    dispatch({
      type: FILE_UPLOAD_ACTIONS.SET_FILTERS,
      payload: newFilters
    });
  }, []);

  /**
   * Load upload history
   * تحميل تاريخ الرفع
   */
  const loadUploadHistory = useCallback(async () => {
    try {
      const history = fileUploadService.getUploadHistory();
      dispatch({
        type: FILE_UPLOAD_ACTIONS.SET_UPLOAD_HISTORY,
        payload: history
      });
    } catch (error) {
      logError('Failed to load upload history', error);
    }
  }, []);

  /**
   * Sync local files with backend
   * مزامنة الملفات المحلية مع الخادم
   */
  const syncFiles = useCallback(async () => {
    try {
      const result = await fileUploadService.syncLocalFiles();
      
      // Reload files after sync
      await loadFiles();
      
      return result;

    } catch (error) {
      logError('File sync failed', error);
      throw error;
    }
  }, [loadFiles]);

  /**
   * Cancel upload
   * إلغاء الرفع
   */
  const cancelUpload = useCallback((uploadId) => {
    return fileUploadService.cancelUpload(uploadId);
  }, []);

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    dispatch({ type: FILE_UPLOAD_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileDownloadUrl,
    loadFiles,
    updateFilters,
    loadUploadHistory,
    syncFiles,
    cancelUpload,
    clearError,
    
    // Service status
    isServiceAvailable: state.serviceStatus?.isInitialized || false,
    canUpload: getFeatureFlag('ENABLE_FILE_UPLOAD') && (state.serviceStatus?.isInitialized || false)
  };

  return (
    <FileUploadContext.Provider value={contextValue}>
      {children}
    </FileUploadContext.Provider>
  );
};

/**
 * Hook to use file upload context
 * خطاف لاستخدام سياق رفع الملفات
 */
export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  
  return context;
};

/**
 * Hook for upload progress
 * خطاف لتتبع تقدم الرفع
 */
export const useUploadProgress = (uploadId) => {
  const { uploadProgress } = useFileUpload();
  return uploadProgress[uploadId] || null;
};

export default FileUploadContext;
