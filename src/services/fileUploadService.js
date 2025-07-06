/**
 * File Upload Service
 * خدمة رفع الملفات
 * 
 * Integrates with UnifiedApiService and provides file upload functionality
 */

import fileUploadCore from './fileUpload/fileUploadCore.js';
import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { logError, logInfo } from '../utils/monitoring.js';

/**
 * File Upload Service Class
 * فئة خدمة رفع الملفات
 */
class FileUploadService {
  constructor() {
    this.isInitialized = false;
    this.uploadCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    
    this.initialize();
  }

  /**
   * Initialize file upload service
   * تهيئة خدمة رفع الملفات
   */
  async initialize() {
    try {
      if (!getFeatureFlag('ENABLE_FILE_UPLOAD')) {
        logInfo('File upload service is disabled');
        return;
      }

      // Initialize file upload core
      await this.initializeUploadCore();
      
      // Set up cache cleanup
      this.setupCacheCleanup();
      
      this.isInitialized = true;
      logInfo('File upload service initialized successfully');
      
    } catch (error) {
      logError('Failed to initialize file upload service', error);
      throw error;
    }
  }

  /**
   * Initialize upload core
   * تهيئة نواة الرفع
   */
  async initializeUploadCore() {
    try {
      if (!fileUploadCore.isInitialized) {
        await fileUploadCore.initialize();
      }
      logInfo('File upload core ready');
    } catch (error) {
      logError('Failed to initialize upload core', error);
      throw error;
    }
  }

  /**
   * Upload single file
   * رفع ملف واحد
   */
  async uploadFile(file, options = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('File upload service not initialized');
      }

      // Validate file
      const validation = fileUploadCore.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check if backend is available
      const backendAvailable = await this.checkBackendAvailability();
      
      if (backendAvailable) {
        // Upload via backend
        return await this.uploadViaBackend(file, options);
      } else {
        // Upload via local storage (fallback)
        return await this.uploadViaLocalStorage(file, options);
      }

    } catch (error) {
      logError('File upload failed', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   * رفع ملفات متعددة
   */
  async uploadMultipleFiles(files, options = {}) {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadFile(file, options)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      return {
        successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
        failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
        total: files.length
      };

    } catch (error) {
      logError('Multiple file upload failed', error);
      throw error;
    }
  }

  /**
   * Upload via backend
   * الرفع عبر الخادم الخلفي
   */
  async uploadViaBackend(file, options) {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', options.category || 'general');
      formData.append('description', options.description || '');
      formData.append('isPublic', options.isPublic || false);
      formData.append('tags', JSON.stringify(options.tags || []));

      // Upload via UnifiedApiService
      const response = await unifiedApiService.request('/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        }
      });

      if (response.success) {
        // Cache the result
        this.cacheUploadResult(response.data.fileId, response.data);
        
        return {
          ...response.data,
          source: 'backend',
          uploadedAt: new Date().toISOString()
        };
      } else {
        throw new Error(response.error || 'Backend upload failed');
      }

    } catch (error) {
      logError('Backend upload failed, falling back to local storage', error);
      // Fallback to local storage
      return await this.uploadViaLocalStorage(file, options);
    }
  }

  /**
   * Upload via local storage (fallback)
   * الرفع عبر التخزين المحلي (احتياطي)
   */
  async uploadViaLocalStorage(file, options) {
    try {
      logInfo('Using local storage fallback for file upload');

      // Use file upload core for local processing
      const result = await fileUploadCore.uploadFile(file, options);
      
      // Store in local storage for later sync
      this.storeForLaterSync(result);
      
      return {
        ...result,
        source: 'local',
        needsSync: true,
        uploadedAt: new Date().toISOString()
      };

    } catch (error) {
      logError('Local storage upload failed', error);
      throw error;
    }
  }

  /**
   * Get upload progress
   * الحصول على تقدم الرفع
   */
  getUploadProgress(uploadId) {
    return fileUploadCore.getUploadProgress(uploadId);
  }

  /**
   * Cancel upload
   * إلغاء الرفع
   */
  cancelUpload(uploadId) {
    return fileUploadCore.cancelUpload(uploadId);
  }

  /**
   * Get uploaded files
   * الحصول على الملفات المرفوعة
   */
  async getUploadedFiles(filters = {}) {
    try {
      const backendAvailable = await this.checkBackendAvailability();
      
      if (backendAvailable) {
        return await this.getFilesFromBackend(filters);
      } else {
        return await this.getFilesFromLocalStorage(filters);
      }

    } catch (error) {
      logError('Failed to get uploaded files', error);
      return { files: [], total: 0, source: 'error' };
    }
  }

  /**
   * Get files from backend
   * الحصول على الملفات من الخادم
   */
  async getFilesFromBackend(filters) {
    try {
      const response = await unifiedApiService.request('/files', {
        method: 'GET',
        params: filters
      });

      if (response.success) {
        return {
          ...response.data,
          source: 'backend'
        };
      } else {
        throw new Error(response.error || 'Failed to fetch files from backend');
      }

    } catch (error) {
      logError('Backend file fetch failed, using local storage', error);
      return await this.getFilesFromLocalStorage(filters);
    }
  }

  /**
   * Get files from local storage
   * الحصول على الملفات من التخزين المحلي
   */
  async getFilesFromLocalStorage(filters) {
    try {
      const localFiles = this.getLocalFiles();
      
      // Apply filters
      let filteredFiles = localFiles;
      
      if (filters.category) {
        filteredFiles = filteredFiles.filter(f => f.category === filters.category);
      }
      
      if (filters.type) {
        filteredFiles = filteredFiles.filter(f => f.type === filters.type);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredFiles = filteredFiles.filter(f => 
          f.originalName.toLowerCase().includes(searchTerm) ||
          f.description.toLowerCase().includes(searchTerm)
        );
      }

      return {
        files: filteredFiles,
        total: filteredFiles.length,
        source: 'local'
      };

    } catch (error) {
      logError('Local file fetch failed', error);
      return { files: [], total: 0, source: 'error' };
    }
  }

  /**
   * Delete file
   * حذف ملف
   */
  async deleteFile(fileId) {
    try {
      const backendAvailable = await this.checkBackendAvailability();
      
      if (backendAvailable) {
        const response = await unifiedApiService.request(`/files/${fileId}`, {
          method: 'DELETE'
        });
        
        if (response.success) {
          // Remove from cache
          this.uploadCache.delete(fileId);
          return { success: true, source: 'backend' };
        }
      }
      
      // Fallback to local deletion
      return this.deleteLocalFile(fileId);

    } catch (error) {
      logError('File deletion failed', error);
      throw error;
    }
  }

  /**
   * Get file download URL
   * الحصول على رابط تحميل الملف
   */
  async getFileDownloadUrl(fileId) {
    try {
      const backendAvailable = await this.checkBackendAvailability();
      
      if (backendAvailable) {
        const response = await unifiedApiService.request(`/files/${fileId}/download`, {
          method: 'GET'
        });
        
        if (response.success) {
          return response.data.downloadUrl;
        }
      }
      
      // Fallback to local URL
      return this.getLocalFileUrl(fileId);

    } catch (error) {
      logError('Failed to get download URL', error);
      throw error;
    }
  }

  /**
   * Sync local files with backend
   * مزامنة الملفات المحلية مع الخادم
   */
  async syncLocalFiles() {
    try {
      const backendAvailable = await this.checkBackendAvailability();
      
      if (!backendAvailable) {
        logInfo('Backend not available, skipping sync');
        return { synced: 0, failed: 0 };
      }

      const localFiles = this.getLocalFiles().filter(f => f.needsSync);
      let synced = 0;
      let failed = 0;

      for (const file of localFiles) {
        try {
          await this.syncSingleFile(file);
          synced++;
        } catch (error) {
          logError(`Failed to sync file ${file.fileId}`, error);
          failed++;
        }
      }

      logInfo(`File sync completed: ${synced} synced, ${failed} failed`);
      return { synced, failed };

    } catch (error) {
      logError('File sync failed', error);
      throw error;
    }
  }

  /**
   * Helper methods
   * الطرق المساعدة
   */

  async checkBackendAvailability() {
    try {
      const status = await unifiedApiService.getServiceStatus();
      return status.newBackend.available;
    } catch (error) {
      return false;
    }
  }

  cacheUploadResult(fileId, result) {
    this.uploadCache.set(fileId, {
      ...result,
      cachedAt: Date.now()
    });
  }

  storeForLaterSync(result) {
    const localFiles = this.getLocalFiles();
    localFiles.push({
      ...result,
      needsSync: true,
      storedAt: Date.now()
    });
    this.saveLocalFiles(localFiles);
  }

  getLocalFiles() {
    try {
      const stored = localStorage.getItem('spsa_uploaded_files');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logError('Failed to get local files', error);
      return [];
    }
  }

  saveLocalFiles(files) {
    try {
      localStorage.setItem('spsa_uploaded_files', JSON.stringify(files));
    } catch (error) {
      logError('Failed to save local files', error);
    }
  }

  deleteLocalFile(fileId) {
    const localFiles = this.getLocalFiles();
    const updatedFiles = localFiles.filter(f => f.fileId !== fileId);
    this.saveLocalFiles(updatedFiles);
    return { success: true, source: 'local' };
  }

  getLocalFileUrl(fileId) {
    const localFiles = this.getLocalFiles();
    const file = localFiles.find(f => f.fileId === fileId);
    return file ? file.url : null;
  }

  async syncSingleFile(file) {
    // Implementation for syncing a single file with backend
    // This would re-upload the file to the backend
    logInfo(`Syncing file ${file.fileId} with backend`);
    // Implementation details would go here
  }

  setupCacheCleanup() {
    // Clean up cache every 10 minutes
    setInterval(() => {
      this.cleanupCache();
    }, this.cacheTimeout);
  }

  cleanupCache() {
    const now = Date.now();
    for (const [fileId, cached] of this.uploadCache.entries()) {
      if (now - cached.cachedAt > this.cacheTimeout) {
        this.uploadCache.delete(fileId);
      }
    }
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.uploadCache.size,
      localFilesCount: this.getLocalFiles().length,
      uploadStats: fileUploadCore.getUploadStats(),
      featuresEnabled: {
        fileUpload: getFeatureFlag('ENABLE_FILE_UPLOAD'),
        multipleUpload: getFeatureFlag('ENABLE_MULTIPLE_FILE_UPLOAD'),
        largeFileUpload: getFeatureFlag('ENABLE_LARGE_FILE_UPLOAD')
      }
    };
  }

  /**
   * Get upload history
   * الحصول على تاريخ الرفع
   */
  getUploadHistory(limit = 20) {
    return fileUploadCore.getUploadHistory(limit);
  }
}

// Create and export singleton instance
const fileUploadService = new FileUploadService();
export default fileUploadService;
