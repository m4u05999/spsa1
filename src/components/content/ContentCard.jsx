import React from 'react';
import { 
  getContentTypeBadgeColor, 
  getContentStatusBadgeColor, 
  translateContentType,
  translateContentStatus
} from '../../models/Content';

/**
 * ContentCard - Card component for displaying content previews in lists
 */
const ContentCard = ({ content, onClick, onEdit, onDelete, onToggleFeatured }) => {
  // Format date to Arabic format
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Format view count with Arabic numerals
  const formatViewCount = (count) => {
    return count.toLocaleString('ar-EG');
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
      dir="rtl"
    >
      {/* Card image */}
      {content.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={content.image} 
            alt={content.title} 
            className="w-full h-full object-cover"
          />
          {content.featured && (
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                مميز
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center space-x-2 space-x-reverse mb-2">
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getContentTypeBadgeColor(content.type)}`}>
            {translateContentType(content.type)}
          </span>
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getContentStatusBadgeColor(content.status)}`}>
            {translateContentStatus(content.status)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{content.title}</h3>
        
        <div className="text-sm text-gray-600 mb-2">
          بواسطة: {content.author}
        </div>
        
        {content.excerpt && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">{content.excerpt}</p>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2">
          <div>
            <span>{formatDate(content.publishedAt || content.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{formatViewCount(content.viewCount || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Card actions */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex justify-between">
          <button 
            onClick={() => onClick(content.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            عرض
          </button>
          
          <div className="flex space-x-3 space-x-reverse">
            {onEdit && (
              <button 
                onClick={() => onEdit(content.id)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                تعديل
              </button>
            )}
            
            {onToggleFeatured && (
              <button 
                onClick={() => onToggleFeatured(content.id)}
                className={`text-sm font-medium ${content.featured ? 'text-amber-600 hover:text-amber-800' : 'text-gray-600 hover:text-gray-800'}`}
              >
                {content.featured ? 'إلغاء التمييز' : 'تمييز'}
              </button>
            )}
            
            {onDelete && content.status !== 'published' && (
              <button 
                onClick={() => onDelete(content.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                حذف
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;