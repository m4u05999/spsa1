import React, { useState } from 'react';
import { CONTENT_TYPES, CONTENT_STATUS, translateContentType, translateContentStatus, Category, Tag } from '../../models/Content';

/**
 * ContentFilter - Component for filtering and searching content items
 */
const ContentFilter = ({
  searchTerm,
  selectedType,
  selectedStatus,
  selectedCategory,
  selectedTag,
  featuredOnly,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  dateFrom,
  dateTo,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onCategoryChange,
  onTagChange,
  onFeaturedChange,
  onSortChange,
  onDateFromChange,
  onDateToChange,
  availableCategories = [],
  availableTags = []
}) => {
  // Toggle advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6" dir="rtl">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">تصفية المحتوى</h3>
      </div>
      
      {/* Basic filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">بحث</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              placeholder="البحث بالعنوان أو اسم الكاتب"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        {/* Sorting */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">الترتيب حسب</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="sortBy"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={sortBy}
              onChange={(e) => onSortChange({ sortBy: e.target.value, sortOrder })}
            >
              <option value="createdAt">تاريخ الإنشاء</option>
              <option value="updatedAt">تاريخ التحديث</option>
              <option value="title">العنوان</option>
              <option value="author">الكاتب</option>
              <option value="type">النوع</option>
            </select>
            
            <select
              id="sortOrder"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={sortOrder}
              onChange={(e) => onSortChange({ sortBy, sortOrder: e.target.value })}
            >
              <option value="asc">تصاعدي</option>
              <option value="desc">تنازلي</option>
            </select>
          </div>
        </div>

        {/* Type filter */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">نوع المحتوى</label>
          <select
            id="type"
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="all">جميع الأنواع</option>
            {Object.entries(CONTENT_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {translateContentType(value)}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
          <select
            id="status"
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(CONTENT_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {translateContentStatus(value)}
              </option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
          <select
            id="category"
            className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">جميع التصنيفات</option>
            {availableCategories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag filter */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">الوسوم</label>
          <div className="relative">
            <select
              id="tag"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
            >
              <option value="all">جميع الوسوم</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1 pr-1">
              * يمكنك تصفية المحتوى حسب وسم واحد. للتصفية حسب وسوم متعددة، استخدم البحث المتقدم.
            </div>
          </div>
        </div>

        {/* Featured filter */}
        <div className="flex items-center h-full pt-6">
          <input
            id="featured"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={featuredOnly}
            onChange={(e) => onFeaturedChange(e.target.checked)}
          />
          <label htmlFor="featured" className="mr-2 block text-sm text-gray-700">
            المحتوى المميز فقط
          </label>
        </div>
      </div>
      
      {/* Advanced filters toggle */}
      <div className="mt-6 border-t pt-4 flex flex-wrap justify-between items-center">
        <button 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus:underline"
        >
          {showAdvanced ? 'إخفاء الفلاتر المتقدمة' : 'عرض الفلاتر المتقدمة'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 mr-1 transform ${showAdvanced ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            onSearchChange('');
            onTypeChange('all');
            onStatusChange('all');
            onCategoryChange('all');
            onTagChange('all');
            onFeaturedChange(false);
            if (onDateFromChange) onDateFromChange('');
            if (onDateToChange) onDateToChange('');
            if (onSortChange) onSortChange({ sortBy: 'createdAt', sortOrder: 'desc' });
          }}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إعادة ضبط الفلاتر
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">فلاتر متقدمة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date range filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">نطاق التاريخ</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dateFrom" className="block text-xs text-gray-500">من</label>
                  <input
                    type="date"
                    id="dateFrom"
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={dateFrom || ''}
                    onChange={(e) => onDateFromChange && onDateFromChange(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="dateTo" className="block text-xs text-gray-500">إلى</label>
                  <input
                    type="date"
                    id="dateTo"
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={dateTo || ''}
                    onChange={(e) => onDateToChange && onDateToChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Multi-tag selector */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">بحث متعدد الوسوم</label>
              <div className="border border-gray-300 rounded-md p-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTags.slice(0, 10).map(tag => (
                    <span 
                      key={tag.id} 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer
                        ${selectedTag === tag.name || selectedTag.includes(tag.name) ? 
                          'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                          'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                      `}
                      onClick={() => {
                        // If already selected exactly, deselect it
                        if (selectedTag === tag.name) {
                          onTagChange('all');
                        } 
                        // If it's part of a multi-selection, remove it from the selection
                        else if (typeof selectedTag === 'string' && selectedTag.includes(',') && selectedTag.includes(tag.name)) {
                          const tags = selectedTag.split(',').filter(t => t !== tag.name);
                          onTagChange(tags.length > 0 ? tags.join(',') : 'all');
                        } 
                        // If it's not selected, either select it alone or add to multi-selection
                        else {
                          if (selectedTag === 'all') {
                            onTagChange(tag.name);
                          } else {
                            // Add to multi-selection
                            const newSelection = selectedTag + ',' + tag.name;
                            onTagChange(newSelection);
                          }
                        }
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  *انقر على الوسوم للاختيار المتعدد. يمكنك اختيار أكثر من وسم واحد في وقت واحد.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentFilter;