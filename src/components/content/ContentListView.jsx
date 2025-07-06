// src/components/content/ContentListView.jsx
/**
 * Content List View Component for SPSA
 * مكون عرض قائمة المحتوى للجمعية السعودية للعلوم السياسية
 */

import React from 'react';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';

/**
 * Content List View Component
 */
const ContentListView = ({ 
  content, 
  selectedItems, 
  onToggleSelection, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  /**
   * Get content type label
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

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      [CONTENT_STATUS.PUBLISHED]: {
        label: 'منشور',
        className: 'bg-green-100 text-green-800'
      },
      [CONTENT_STATUS.DRAFT]: {
        label: 'مسودة',
        className: 'bg-yellow-100 text-yellow-800'
      },
      [CONTENT_STATUS.ARCHIVED]: {
        label: 'مؤرشف',
        className: 'bg-gray-100 text-gray-800'
      }
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => {
                // Handle select all
                if (e.target.checked) {
                  content.forEach(item => {
                    if (!selectedItems.includes(item.id)) {
                      onToggleSelection(item.id);
                    }
                  });
                } else {
                  content.forEach(item => {
                    if (selectedItems.includes(item.id)) {
                      onToggleSelection(item.id);
                    }
                  });
                }
              }}
            />
          </div>
          <div className="col-span-4">العنوان</div>
          <div className="col-span-2">النوع</div>
          <div className="col-span-1">الحالة</div>
          <div className="col-span-2">تاريخ النشر</div>
          <div className="col-span-1">المشاهدات</div>
          <div className="col-span-1">الإجراءات</div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="divide-y divide-gray-200">
        {content.map((item) => (
          <div
            key={item.id}
            className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
              selectedItems.includes(item.id) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => onToggleSelection(item.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Title */}
              <div className="col-span-4">
                <div className="flex items-center">
                  {item.isFeatured && (
                    <svg className="w-4 h-4 text-yellow-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.titleAr || item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Type */}
              <div className="col-span-2">
                <span className="text-sm text-gray-900">
                  {getContentTypeLabel(item.contentType)}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1">
                {getStatusBadge(item.status)}
              </div>

              {/* Published Date */}
              <div className="col-span-2">
                <span className="text-sm text-gray-600">
                  {formatDate(item.publishedAt)}
                </span>
              </div>

              {/* Views */}
              <div className="col-span-1">
                <span className="text-sm text-gray-600">
                  {item.viewsCount || 0}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => onEdit && onEdit(item.id, item)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="تعديل"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDuplicate && onDuplicate(item)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                    title="نسخ"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDelete && onDelete(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="حذف"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentListView;
