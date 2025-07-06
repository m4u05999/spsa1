/**
 * File Upload Component
 * مكون رفع الملفات
 * 
 * Drag and drop file upload with progress tracking and validation
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFileUpload } from '../../contexts/FileUploadContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './FileUpload.css';

/**
 * FileUpload Component
 * مكون رفع الملفات
 */
const FileUpload = ({
  multiple = false,
  accept = '*/*',
  maxSize = 50 * 1024 * 1024, // 50MB
  category = 'general',
  onUploadComplete,
  onUploadError,
  className = ''
}) => {
  const {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    uploadProgress,
    error,
    clearError,
    canUpload
  } = useFileUpload();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Check if multiple upload is enabled
  const multipleEnabled = multiple && getFeatureFlag('ENABLE_MULTIPLE_FILE_UPLOAD');

  /**
   * Handle file selection
   * التعامل مع اختيار الملفات
   */
  const handleFileSelect = useCallback((files) => {
    const fileList = Array.from(files);
    
    // Validate files
    const validFiles = fileList.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    // Limit to single file if multiple is disabled
    const filesToUpload = multipleEnabled ? validFiles : [validFiles[0]];
    
    setSelectedFiles(filesToUpload);
    clearError();
  }, [maxSize, multipleEnabled, clearError]);

  /**
   * Handle file upload
   * التعامل مع رفع الملفات
   */
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !canUpload) {
      return;
    }

    try {
      const uploadOptions = {
        category,
        description: '',
        isPublic: false,
        tags: []
      };

      let result;
      if (selectedFiles.length === 1) {
        result = await uploadFile(selectedFiles[0], uploadOptions);
      } else {
        result = await uploadMultipleFiles(selectedFiles, uploadOptions);
      }

      // Clear selected files
      setSelectedFiles([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete(result);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      if (onUploadError) {
        onUploadError(error);
      }
    }
  }, [selectedFiles, canUpload, category, uploadFile, uploadMultipleFiles, onUploadComplete, onUploadError]);

  /**
   * Handle drag events
   * التعامل مع أحداث السحب
   */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  /**
   * Handle file input change
   * التعامل مع تغيير مدخل الملف
   */
  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  /**
   * Open file dialog
   * فتح حوار الملف
   */
  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Remove selected file
   * إزالة الملف المحدد
   */
  const removeSelectedFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

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

  // Don't render if file upload is disabled
  if (!canUpload) {
    return (
      <div className="file-upload-disabled">
        <p>رفع الملفات غير متاح حالياً</p>
      </div>
    );
  }

  return (
    <div className={`file-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multipleEnabled}
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Drop zone */}
      <div
        className={`file-upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="dropzone-content">
          <div className="dropzone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          
          <div className="dropzone-text">
            <h3>اسحب الملفات هنا أو انقر للاختيار</h3>
            <p>
              {multipleEnabled ? 'يمكنك رفع ملفات متعددة' : 'يمكنك رفع ملف واحد'}
              <br />
              الحد الأقصى: {formatFileSize(maxSize)}
            </p>
          </div>

          {dragActive && (
            <div className="dropzone-overlay">
              <p>اتركه هنا لرفع الملف</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>الملفات المحددة:</h4>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="selected-file">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => removeSelectedFile(index)}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="upload-actions">
            <button
              type="button"
              className="upload-button"
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? 'جاري الرفع...' : 'رفع الملفات'}
            </button>
            
            <button
              type="button"
              className="cancel-button"
              onClick={() => setSelectedFiles([])}
              disabled={uploading}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress">
          <h4>تقدم الرفع:</h4>
          {Object.entries(uploadProgress).map(([uploadId, progress]) => (
            <div key={uploadId} className="progress-item">
              <div className="progress-info">
                <span>رفع {uploadId}</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              {progress.error && (
                <div className="progress-error">{progress.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="upload-error">
          <p>{error}</p>
          <button onClick={clearError}>إغلاق</button>
        </div>
      )}

      {/* Upload tips */}
      <div className="upload-tips">
        <h5>نصائح الرفع:</h5>
        <ul>
          <li>الملفات المدعومة: PDF, Word, Excel, PowerPoint, الصور, الصوت, الفيديو</li>
          <li>الحد الأقصى لحجم الملف: {formatFileSize(maxSize)}</li>
          {multipleEnabled && <li>يمكنك رفع عدة ملفات في نفس الوقت</li>}
          <li>تأكد من أن أسماء الملفات لا تحتوي على أحرف خاصة</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
