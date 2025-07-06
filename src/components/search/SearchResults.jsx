/**
 * Search Results Component
 * مكون نتائج البحث
 * 
 * Displays search results with pagination and sorting options
 */

import React, { useState } from 'react';
import { useSearch } from '../../contexts/SearchContext.jsx';
// CSS will be imported separately

/**
 * SearchResults Component
 * مكون نتائج البحث
 */
const SearchResults = ({ 
  showSortOptions = true,
  showPagination = true,
  showResultsCount = true,
  viewMode: initialViewMode = 'list',
  onResultClick
}) => {
  const {
    results,
    total,
    page,
    limit,
    query,
    sortBy,
    updateSortBy,
    updatePagination,
    isLoading,
    error,
    responseTime
  } = useSearch();

  const [viewMode, setViewMode] = useState(initialViewMode);

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    updateSortBy(newSortBy);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    updatePagination(newPage, limit);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle result click
  const handleResultClick = (result) => {
    if (onResultClick) {
      onResultClick(result);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const startResult = (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, total);

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'الصلة', labelEn: 'Relevance' },
    { value: 'date_desc', label: 'الأحدث أولاً', labelEn: 'Newest First' },
    { value: 'date_asc', label: 'الأقدم أولاً', labelEn: 'Oldest First' },
    { value: 'title', label: 'العنوان أبجدياً', labelEn: 'Title A-Z' }
  ];

  if (error) {
    return (
      <div className="search-results-error">
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3>حدث خطأ في البحث</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>جاري البحث...</p>
      </div>
    );
  }

  if (!query || query.trim().length < 2) {
    return (
      <div className="search-results-empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3>ابدأ البحث</h3>
        <p>اكتب كلمة أو أكثر في شريط البحث للعثور على المحتوى</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results-no-results">
        <div className="no-results-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="12"/>
            <line x1="11" y1="16" x2="11.01" y2="16"/>
          </svg>
        </div>
        <h3>لا توجد نتائج</h3>
        <p>لم نجد أي نتائج تطابق بحثك عن "{query}"</p>
        <div className="search-suggestions">
          <p>جرب:</p>
          <ul>
            <li>التحقق من الإملاء</li>
            <li>استخدام كلمات مفتاحية أخرى</li>
            <li>تقليل عدد الفلاتر المطبقة</li>
            <li>البحث بمصطلحات أعم</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      {/* Results Header */}
      <div className="search-results-header">
        {/* Results Count and Info */}
        {showResultsCount && (
          <div className="results-info">
            <h2 className="results-count">
              {total.toLocaleString('ar-SA')} نتيجة للبحث عن "{query}"
            </h2>
            <p className="results-meta">
              عرض {startResult.toLocaleString('ar-SA')} - {endResult.toLocaleString('ar-SA')} من {total.toLocaleString('ar-SA')} نتيجة
              {responseTime > 0 && (
                <span className="response-time">
                  ({responseTime} مللي ثانية)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="results-controls">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              aria-label="عرض قائمة"
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
            <button
              className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              aria-label="عرض شبكي"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>

          {/* Sort Options */}
          {showSortOptions && (
            <div className="sort-options">
              <label htmlFor="sort-select" className="sort-label">
                ترتيب حسب:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className={`search-results-list ${viewMode}`}>
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id || index}
            result={result}
            viewMode={viewMode}
            query={query}
            onClick={() => handleResultClick(result)}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <SearchPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

/**
 * Search Result Item Component
 * مكون عنصر نتيجة البحث
 */
const SearchResultItem = ({ result, viewMode, query, onClick }) => {
  // Highlight search terms in text
  const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    
    const terms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 1);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      article: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      research: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      news: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/>
          <path d="M15 18h-5"/>
          <path d="M10 6h8v4h-8V6Z"/>
        </svg>
      ),
      event: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    };
    
    return icons[type] || icons.article;
  };

  // Get type label
  const getTypeLabel = (type) => {
    const labels = {
      article: 'مقال',
      research: 'بحث',
      news: 'خبر',
      event: 'فعالية',
      publication: 'منشور'
    };
    
    return labels[type] || 'محتوى';
  };

  return (
    <article 
      className={`search-result-item ${viewMode}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Result Header */}
      <div className="result-header">
        <div className="result-type">
          {getTypeIcon(result.type)}
          <span className="type-label">{getTypeLabel(result.type)}</span>
        </div>
        
        {result.language && (
          <span className="result-language">
            {result.language === 'ar' ? 'عربي' : 'English'}
          </span>
        )}
      </div>

      {/* Result Title */}
      <h3 
        className="result-title"
        dangerouslySetInnerHTML={{
          __html: highlightText(result.title, query)
        }}
      />

      {/* Result Content */}
      {result.content && (
        <p 
          className="result-content"
          dangerouslySetInnerHTML={{
            __html: highlightText(result.content.substring(0, 200) + '...', query)
          }}
        />
      )}

      {/* Result Meta */}
      <div className="result-meta">
        {result.author && (
          <span className="result-author">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {result.author}
          </span>
        )}
        
        {(result.publishedAt || result.createdAt) && (
          <span className="result-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {formatDate(result.publishedAt || result.createdAt)}
          </span>
        )}
        
        {result.categories && result.categories.length > 0 && (
          <div className="result-categories">
            {result.categories.slice(0, 2).map((category, index) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
            {result.categories.length > 2 && (
              <span className="category-more">
                +{result.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

/**
 * Search Pagination Component
 * مكون ترقيم البحث
 */
const SearchPagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="search-pagination" aria-label="نتائج البحث">
      <button
        className="pagination-button prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="الصفحة السابقة"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
        السابق
      </button>

      <div className="pagination-pages">
        {visiblePages.map((page, index) => (
          page === '...' ? (
            <span key={index} className="pagination-dots">...</span>
          ) : (
            <button
              key={index}
              className={`pagination-page ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`الصفحة ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button
        className="pagination-button next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="الصفحة التالية"
      >
        التالي
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      </button>
    </nav>
  );
};

export default SearchResults;
