// src/components/content/ContentGridView.jsx
/**
 * Content Grid View Component for SPSA
 * مكون عرض شبكة المحتوى للجمعية السعودية للعلوم السياسية
 */

import React from 'react';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';

/**
 * Content Grid View Component
 */
const ContentGridView = ({ 
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

  /**
   * Get content type icon
   */
  const getContentTypeIcon = (type) => {
    const icons = {
      [CONTENT_TYPES.NEWS]: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
          <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
        </svg>
      ),
      [CONTENT_TYPES.ARTICLE]: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      [CONTENT_TYPES.EVENT]: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    };

    return icons[type] || (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {content.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
              selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onToggleSelection(item.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-3"
                  />
                  <div className="text-gray-600">
                    {getContentTypeIcon(item.contentType)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 space-x-reverse">
                  {item.isFeatured && (
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  {getStatusBadge(item.status)}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {item.featuredImage && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={item.featuredImage}
                  alt={item.titleAr || item.title}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Card Content */}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {getContentTypeLabel(item.contentType)}
                </span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.titleAr || item.title}
              </h3>
              
              {item.excerpt && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                  {item.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{formatDate(item.publishedAt)}</span>
                <span>{item.viewsCount || 0} مشاهدة</span>
              </div>

              {item.authorName && (
                <div className="text-xs text-gray-600 mb-3">
                  بواسطة: {item.authorName}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => onEdit && onEdit(item.id, item)}
                    className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                    title="تعديل"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDuplicate && onDuplicate(item)}
                    className="text-gray-600 hover:text-gray-800 text-sm p-1 rounded hover:bg-gray-50"
                    title="نسخ"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={() => onDelete && onDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm p-1 rounded hover:bg-red-50"
                  title="حذف"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentGridView;
