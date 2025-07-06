/**
 * File Upload Page
 * صفحة رفع الملفات
 * 
 * Main file upload interface combining upload and management components
 */

import React, { useEffect, useState } from 'react';
import { FileUploadProvider } from '../contexts/FileUploadContext.jsx';
import FileUpload from '../components/fileUpload/FileUpload.jsx';
import FileManager from '../components/fileUpload/FileManager.jsx';
import { getFeatureFlag } from '../config/featureFlags.js';
import './FileUploadPage.css';

/**
 * FileUploadPage Component
 * مكون صفحة رفع الملفات
 */
const FileUploadPage = () => {
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // Set page title
    document.title = 'رفع الملفات - الجمعية السعودية للعلوم السياسية';
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'رفع وإدارة الملفات في الجمعية السعودية للعلوم السياسية - وثائق، صور، فيديوهات، وأبحاث'
      );
    }
  }, []);

  // Check if file upload is enabled
  if (!getFeatureFlag('ENABLE_FILE_UPLOAD')) {
    return (
      <div className="file-upload-page">
        <div className="container">
          <div className="feature-disabled">
            <div className="disabled-icon">📁</div>
            <h2>رفع الملفات غير متاح</h2>
            <p>هذه الميزة غير مفعلة حالياً. يرجى المحاولة لاحقاً.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FileUploadProvider>
      <div className="file-upload-page">
        {/* Page Header */}
        <header className="file-upload-page-header">
          <div className="container">
            <div className="header-content">
              <h1 className="page-title">رفع وإدارة الملفات</h1>
              <p className="page-description">
                رفع الوثائق والملفات الأكاديمية وإدارتها بشكل آمن ومنظم
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="file-upload-page-main">
          <div className="container">
            {/* Tab Navigation */}
            <nav className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                رفع الملفات
              </button>
              
              <button
                className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13,2 13,9 20,9"/>
                </svg>
                إدارة الملفات
              </button>
            </nav>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'upload' && (
                <section className="upload-section">
                  <div className="section-header">
                    <h2>رفع ملفات جديدة</h2>
                    <p>يمكنك رفع الوثائق والملفات الأكاديمية هنا</p>
                  </div>
                  
                  <FileUpload
                    multiple={getFeatureFlag('ENABLE_MULTIPLE_FILE_UPLOAD')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                    maxSize={getFeatureFlag('ENABLE_LARGE_FILE_UPLOAD') ? 100 * 1024 * 1024 : 50 * 1024 * 1024}
                    category="academic"
                    onUploadComplete={(result) => {
                      console.log('Upload completed:', result);
                      // Switch to manage tab to show uploaded files
                      setActiveTab('manage');
                    }}
                    onUploadError={(error) => {
                      console.error('Upload error:', error);
                    }}
                  />

                  {/* Upload Guidelines */}
                  <div className="upload-guidelines">
                    <h3>إرشادات الرفع</h3>
                    <div className="guidelines-grid">
                      <div className="guideline-item">
                        <div className="guideline-icon">📄</div>
                        <div className="guideline-content">
                          <h4>الملفات المدعومة</h4>
                          <p>PDF, Word, Excel, PowerPoint, الصور، الفيديو، الصوت، والأرشيف</p>
                        </div>
                      </div>

                      <div className="guideline-item">
                        <div className="guideline-icon">📏</div>
                        <div className="guideline-content">
                          <h4>حجم الملف</h4>
                          <p>
                            الحد الأقصى: {getFeatureFlag('ENABLE_LARGE_FILE_UPLOAD') ? '100 MB' : '50 MB'} لكل ملف
                          </p>
                        </div>
                      </div>

                      <div className="guideline-item">
                        <div className="guideline-icon">🔒</div>
                        <div className="guideline-content">
                          <h4>الأمان والخصوصية</h4>
                          <p>جميع الملفات محمية ومشفرة وفقاً لمعايير الأمان العالية</p>
                        </div>
                      </div>

                      <div className="guideline-item">
                        <div className="guideline-icon">🏷️</div>
                        <div className="guideline-content">
                          <h4>التصنيف والوسوم</h4>
                          <p>يمكنك تصنيف الملفات وإضافة وسوم لسهولة البحث والتنظيم</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'manage' && (
                <section className="manage-section">
                  <div className="section-header">
                    <h2>إدارة الملفات</h2>
                    <p>تصفح وإدارة الملفات المرفوعة</p>
                  </div>
                  
                  <FileManager
                    showUpload={false}
                    showFilters={true}
                    viewMode="grid"
                    onFileSelect={(file) => {
                      console.log('File selected:', file);
                    }}
                  />
                </section>
              )}
            </div>
          </div>
        </main>

        {/* File Upload Tips */}
        <aside className="file-upload-tips">
          <div className="container">
            <FileUploadTips />
          </div>
        </aside>
      </div>
    </FileUploadProvider>
  );
};

/**
 * File Upload Tips Component
 * مكون نصائح رفع الملفات
 */
const FileUploadTips = () => {
  return (
    <div className="file-upload-tips-content">
      <h3 className="tips-title">نصائح مفيدة</h3>
      <div className="tips-grid">
        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
              <path d="M21 19c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>تنظيم الملفات</h4>
            <p>استخدم أسماء واضحة ومعبرة للملفات وصنفها في الفئات المناسبة</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>جودة الملفات</h4>
            <p>تأكد من جودة الملفات ووضوحها قبل الرفع لضمان أفضل تجربة للمستخدمين</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>النسخ الاحتياطية</h4>
            <p>احتفظ بنسخ احتياطية من ملفاتك المهمة في أماكن متعددة</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>المزامنة التلقائية</h4>
            <p>الملفات تتم مزامنتها تلقائياً مع الخادم عند توفر الاتصال</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
