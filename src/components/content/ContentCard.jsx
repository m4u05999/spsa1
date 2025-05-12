import React, { useState } from 'react';
import { 
  getContentTypeBadgeColor, 
  getContentStatusBadgeColor, 
  translateContentType,
  translateContentStatus
} from '../../models/Content';

// مصفوفة من الصور الافتراضية حسب نوع المحتوى
const DEFAULT_IMAGES = {
  article: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop',
  news: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=2070&auto=format&fit=crop',
  event: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
  research: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?q=80&w=2070&auto=format&fit=crop',
  press: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2070&auto=format&fit=crop',
  publication: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2070&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop'
};

/**
 * ContentCard - Card component for displaying content previews in lists
 * تم تحسينه لإضافة صور افتراضية عندما تكون الصورة غير متوفرة
 */
const ContentCard = ({ content, onClick, onEdit, onDelete, onToggleFeatured }) => {
  const [imageError, setImageError] = useState(false);
  
  // الحصول على الصورة الافتراضية المناسبة لنوع المحتوى
  const getDefaultImage = () => {
    return DEFAULT_IMAGES[content.type] || DEFAULT_IMAGES.default;
  };

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
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
      dir="rtl"
    >
      {/* Card image - صورة البطاقة مع دعم الصور الإفتراضية */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={imageError ? getDefaultImage() : (content.image || getDefaultImage())} 
          alt={content.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setImageError(true)}
        />
        {content.featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              مميز
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center space-x-2 space-x-reverse mb-2 flex-wrap">
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full shadow-sm ${getContentTypeBadgeColor(content.type)}`}>
            {translateContentType(content.type)}
          </span>
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full shadow-sm ${getContentStatusBadgeColor(content.status)}`}>
            {translateContentStatus(content.status)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors duration-200">{content.title}</h3>
        
        <div className="text-sm text-gray-600 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>بواسطة: {content.author}</span>
        </div>
        
        {content.excerpt && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">{content.excerpt}</p>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2 mt-auto">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(content.publishedAt || content.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors duration-200"
          >
            <span>عرض</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          <div className="flex space-x-3 space-x-reverse">
            {onEdit && (
              <button 
                onClick={() => onEdit(content.id)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors duration-200"
              >
                <span>تعديل</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onToggleFeatured && (
              <button 
                onClick={() => onToggleFeatured(content.id)}
                className={`text-sm font-medium flex items-center transition-colors duration-200 ${content.featured ? 'text-amber-600 hover:text-amber-800' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <span>{content.featured ? 'إلغاء التمييز' : 'تمييز'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            )}
            
            {onDelete && content.status !== 'published' && (
              <button 
                onClick={() => onDelete(content.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center transition-colors duration-200"
              >
                <span>حذف</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;