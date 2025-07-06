/**
 * File Manager Component
 * مكون إدارة الملفات
 * 
 * Browse, search, and manage uploaded files
 */

import React, { useState, useEffect } from 'react';
import { useFileUpload } from '../../contexts/FileUploadContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './FileManager.css';

/**
 * FileManager Component
 * مكون إدارة الملفات
 */
const FileManager = ({
  showUpload = true,
  showFilters = true,
  viewMode: initialViewMode = 'grid',
  onFileSelect,
  className = ''
}) => {
  const {
    files,
    total,
    loading,
    error,
    filters,
    updateFilters,
    loadFiles,
    deleteFile,
    getFileDownloadUrl,
    clearError
  } = useFileUpload();

  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load files on mount and when filters change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  /**
   * Handle search
   * التعامل مع البحث
   */
  const handleSearch = (term) => {
    setSearchTerm(term);
    updateFilters({ ...filters, search: term });
  };

  /**
   * Handle filter change
   * التعامل مع تغيير الفلتر
   */
  const handleFilterChange = (key, value) => {
    updateFilters({ ...filters, [key]: value });
  };

  /**
   * Handle file selection
   * التعامل مع اختيار الملف
   */
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    } else {
      // Toggle selection
      setSelectedFiles(prev => {
        const isSelected = prev.includes(file.fileId);
        if (isSelected) {
          return prev.filter(id => id !== file.fileId);
        } else {
          return [...prev, file.fileId];
        }
      });
    }
  };

  /**
   * Handle file download
   * التعامل مع تحميل الملف
   */
  const handleFileDownload = async (file) => {
    try {
      const downloadUrl = await getFileDownloadUrl(file.fileId);
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  /**
   * Handle file deletion
   * التعامل مع حذف الملف
   */
  const handleFileDelete = async (file) => {
    if (window.confirm(`هل أنت متأكد من حذف الملف "${file.originalName}"؟`)) {
      try {
        await deleteFile(file.fileId);
        setSelectedFiles(prev => prev.filter(id => id !== file.fileId));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  /**
   * Format file size
   * تنسيق حجم الملف
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Format date
   * تنسيق التاريخ
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get file icon
   * الحصول على أيقونة الملف
   */
  const getFileIcon = (file) => {
    const type = file.type || '';
    
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type.startsWith('video/')) {
      return '🎥';
    } else if (type.startsWith('audio/')) {
      return '🎵';
    } else if (type.includes('pdf')) {
      return '📄';
    } else if (type.includes('word') || type.includes('document')) {
      return '📝';
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      return '📊';
    } else if (type.includes('powerpoint') || type.includes('presentation')) {
      return '📽️';
    } else if (type.includes('zip') || type.includes('rar')) {
      return '📦';
    } else {
      return '📁';
    }
  };

  /**
   * Sort files
   * ترتيب الملفات
   */
  const sortedFiles = [...files].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'size') {
      aValue = parseInt(aValue) || 0;
      bValue = parseInt(bValue) || 0;
    } else if (sortBy === 'uploadedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className={`file-manager ${className}`}>
      {/* Header */}
      <div className="file-manager-header">
        <div className="header-left">
          <h2>إدارة الملفات</h2>
          <span className="files-count">
            {total} {total === 1 ? 'ملف' : 'ملفات'}
          </span>
        </div>
        
        <div className="header-right">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="عرض شبكي"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="عرض قائمة"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="file-manager-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="البحث في الملفات..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          <div className="filter-controls">
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">جميع الفئات</option>
              <option value="documents">وثائق</option>
              <option value="images">صور</option>
              <option value="videos">فيديوهات</option>
              <option value="audio">صوتيات</option>
              <option value="archives">أرشيف</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="uploadedAt">تاريخ الرفع</option>
              <option value="originalName">الاسم</option>
              <option value="size">الحجم</option>
              <option value="type">النوع</option>
            </select>

            <button
              className={`sort-order ${sortOrder}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 16 4 4 4-4"/>
                <path d="M7 20V4"/>
                <path d="m21 8-4-4-4 4"/>
                <path d="M17 4v16"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearError}>إغلاق</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الملفات...</p>
        </div>
      )}

      {/* Files Grid/List */}
      {!loading && (
        <div className={`files-container ${viewMode}`}>
          {sortedFiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>لا توجد ملفات</h3>
              <p>لم يتم العثور على أي ملفات مطابقة للبحث</p>
            </div>
          ) : (
            sortedFiles.map((file) => (
              <div
                key={file.fileId}
                className={`file-item ${selectedFiles.includes(file.fileId) ? 'selected' : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="file-icon">
                  {getFileIcon(file)}
                </div>
                
                <div className="file-info">
                  <div className="file-name" title={file.originalName}>
                    {file.originalName}
                  </div>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">{formatDate(file.uploadedAt)}</span>
                  </div>
                  {file.description && (
                    <div className="file-description">{file.description}</div>
                  )}
                </div>

                <div className="file-actions">
                  <button
                    className="action-button download"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDownload(file);
                    }}
                    title="تحميل"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  
                  <button
                    className="action-button delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDelete(file);
                    }}
                    title="حذف"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                  </button>
                </div>

                {file.needsSync && (
                  <div className="sync-indicator" title="يحتاج مزامنة">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23,4 23,10 17,10"/>
                      <polyline points="1,20 1,14 7,14"/>
                      <path d="m3.51,9a9,9 0 0,1,14.85-3.36L23,10M1,14l4.64,4.36A9,9 0 0,0,20.49,15"/>
                    </svg>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Files Actions */}
      {selectedFiles.length > 0 && (
        <div className="selected-actions">
          <span>{selectedFiles.length} ملف محدد</span>
          <div className="actions">
            <button
              onClick={() => setSelectedFiles([])}
              className="clear-selection"
            >
              إلغاء التحديد
            </button>
            <button
              onClick={() => {
                selectedFiles.forEach(fileId => {
                  const file = files.find(f => f.fileId === fileId);
                  if (file) handleFileDelete(file);
                });
              }}
              className="delete-selected"
            >
              حذف المحدد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
