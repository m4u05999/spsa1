// src/components/content/ContentManager.jsx
/**
 * Advanced Content Manager Component for SPSA
 * مكون إدارة المحتوى المتقدم للجمعية السعودية للعلوم السياسية
 * 
 * Provides comprehensive content management interface
 * يوفر واجهة إدارة محتوى شاملة
 */

import React, { useState, useCallback } from 'react';
import { useContentManagement } from '../../hooks/useContentManagement.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';
import ContentListView from './ContentListView.jsx';
import ContentGridView from './ContentGridView.jsx';

/**
 * Content Manager Component
 */
const ContentManager = ({ contentType = null, showFilters = true, showBulkActions = true }) => {
  const {
    content,
    loading,
    error,
    filters,
    categories,
    tags,
    stats,
    selectedItems,
    hasSelection,
    selectionCount,
    viewMode,
    
    // Actions
    loadContent,
    createContent,
    updateContent,
    deleteContent,
    updateFilters,
    resetFilters,
    searchContent,
    
    // Selection
    toggleSelection,
    selectAll,
    clearSelection,
    
    // Bulk actions
    performBulkAction,
    
    // View and sorting
    setViewMode,
    sortContent,
    
    // Quick actions
    applyQuickFilter,
    createFromTemplate,
    duplicateContent,
    exportContent
  } = useContentManagement({ contentType });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  /**
   * Handle search
   */
  const handleSearch = useCallback((query) => {
    if (query.trim()) {
      searchContent(query);
    } else {
      loadContent(true);
    }
  }, [searchContent, loadContent]);

  /**
   * Handle bulk action
   */
  const handleBulkAction = useCallback(async (action, data = {}) => {
    const result = await performBulkAction(action, data);
    
    if (result.success) {
      setShowBulkModal(false);
      setBulkAction('');
    }
    
    return result;
  }, [performBulkAction]);

  /**
   * Render loading state
   */
  if (loading && content.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-red-800">خطأ في تحميل المحتوى</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => loadContent(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            إدارة المحتوى
            {contentType && (
              <span className="text-lg font-normal text-gray-600 mr-2">
                - {getContentTypeLabel(contentType)}
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            إجمالي {stats.total} عنصر ({stats.published} منشور، {stats.draft} مسودة)
          </p>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse mt-4 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إنشاء محتوى جديد
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
              <input
                type="text"
                placeholder="ابحث في المحتوى..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Content Type Filter */}
            {!contentType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع المحتوى</label>
                <select
                  value={filters.contentType || ''}
                  onChange={(e) => updateFilters({ contentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع الأنواع</option>
                  {Object.entries(CONTENT_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {getContentTypeLabel(value)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع الحالات</option>
                <option value={CONTENT_STATUS.PUBLISHED}>منشور</option>
                <option value={CONTENT_STATUS.DRAFT}>مسودة</option>
                <option value={CONTENT_STATUS.ARCHIVED}>مؤرشف</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع التصنيفات</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.nameAr || category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => applyQuickFilter('featured', true)}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
            >
              المميز
            </button>
            <button
              onClick={() => applyQuickFilter('recent')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              الأحدث
            </button>
            <button
              onClick={() => applyQuickFilter('popular')}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              الأكثر مشاهدة
            </button>
            <button
              onClick={resetFilters}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && hasSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-800 font-medium">
                تم تحديد {selectionCount} عنصر
              </span>
              <button
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-800 mr-4 text-sm underline"
              >
                إلغاء التحديد
              </button>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => handleBulkAction('publish')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                نشر
              </button>
              <button
                onClick={() => handleBulkAction('unpublish')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                إلغاء النشر
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                أرشفة
              </button>
              <button
                onClick={() => exportContent('json', true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                تصدير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content List/Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        {content.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد محتوى</h3>
            <p className="text-gray-600 mb-4">لم يتم العثور على أي محتوى يطابق المعايير المحددة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إنشاء محتوى جديد
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <ContentListView
            content={content}
            selectedItems={selectedItems}
            onToggleSelection={toggleSelection}
            onEdit={updateContent}
            onDelete={deleteContent}
            onDuplicate={duplicateContent}
          />
        ) : (
          <ContentGridView
            content={content}
            selectedItems={selectedItems}
            onToggleSelection={toggleSelection}
            onEdit={updateContent}
            onDelete={deleteContent}
            onDuplicate={duplicateContent}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Helper function to get content type label
 */
const getContentTypeLabel = (type) => {
  const labels = {
    [CONTENT_TYPES.NEWS]: 'أخبار',
    [CONTENT_TYPES.ARTICLE]: 'مقالات',
    [CONTENT_TYPES.EVENT]: 'فعاليات',
    [CONTENT_TYPES.LECTURE]: 'محاضرات',
    [CONTENT_TYPES.CONFERENCE]: 'مؤتمرات',
    [CONTENT_TYPES.WORKSHOP]: 'ورش عمل',
    [CONTENT_TYPES.RESEARCH]: 'بحوث',
    [CONTENT_TYPES.PUBLICATION]: 'مطبوعات',
    [CONTENT_TYPES.PAGE]: 'صفحات',
    [CONTENT_TYPES.ABOUT]: 'عن الجمعية'
  };
  
  return labels[type] || type;
};

export default ContentManager;
