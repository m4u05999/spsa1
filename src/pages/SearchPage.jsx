/**
 * Advanced Search Page
 * صفحة البحث المتقدم
 * 
 * Main search interface combining all search components
 */

import React, { useEffect } from 'react';
import { SearchProvider } from '../contexts/SearchContext.jsx';
import SearchBar from '../components/search/SearchBar.jsx';
import SearchResults from '../components/search/SearchResults.jsx';
import AdvancedFilters from '../components/search/AdvancedFilters.jsx';
import SearchAnalytics from '../components/search/SearchAnalytics.jsx';
import { getFeatureFlag } from '../config/featureFlags.js';
import './SearchPage.css';

/**
 * SearchPage Component
 * مكون صفحة البحث
 */
const SearchPage = () => {
  useEffect(() => {
    // Set page title
    document.title = 'البحث المتقدم - الجمعية السعودية للعلوم السياسية';
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'ابحث في محتوى الجمعية السعودية للعلوم السياسية - مقالات، أبحاث، أخبار، وفعاليات'
      );
    }
  }, []);

  return (
    <SearchProvider>
      <div className="search-page">
        {/* Page Header */}
        <header className="search-page-header">
          <div className="container">
            <div className="header-content">
              <h1 className="page-title">البحث المتقدم</h1>
              <p className="page-description">
                ابحث في محتوى الجمعية السعودية للعلوم السياسية
              </p>
            </div>
          </div>
        </header>

        {/* Search Interface */}
        <main className="search-page-main">
          <div className="container">
            {/* Search Bar */}
            <section className="search-section">
              <SearchBar 
                placeholder="ابحث في المقالات، الأبحاث، الأخبار، والفعاليات..."
                showFilters={true}
                showSuggestions={true}
                autoFocus={true}
              />
            </section>

            {/* Advanced Filters */}
            <section className="filters-section">
              <AdvancedFilters 
                showResultsCount={true}
              />
            </section>

            {/* Search Results */}
            <section className="results-section">
              <SearchResults 
                showSortOptions={true}
                showPagination={true}
                showResultsCount={true}
                viewMode="list"
                onResultClick={(result) => {
                  // Handle result click - could navigate to detail page
                  console.log('Result clicked:', result);
                }}
              />
            </section>

            {/* Search Analytics (if enabled) */}
            {getFeatureFlag('ENABLE_SEARCH_ANALYTICS') && (
              <section className="analytics-section">
                <SearchAnalytics />
              </section>
            )}
          </div>
        </main>

        {/* Search Tips */}
        <aside className="search-tips">
          <div className="container">
            <SearchTips />
          </div>
        </aside>
      </div>
    </SearchProvider>
  );
};

/**
 * Search Tips Component
 * مكون نصائح البحث
 */
const SearchTips = () => {
  return (
    <div className="search-tips-content">
      <h3 className="tips-title">نصائح للبحث الفعال</h3>
      <div className="tips-grid">
        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>البحث الأساسي</h4>
            <p>استخدم كلمات مفتاحية واضحة ومحددة للحصول على أفضل النتائج</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>استخدم الفلاتر</h4>
            <p>ضيق نطاق البحث باستخدام فلاتر النوع، اللغة، والتاريخ</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-6 0v4"/>
              <rect x="2" y="9" width="20" height="11" rx="2" ry="2"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>البحث المتقدم</h4>
            <p>استخدم علامات التنصيص للبحث عن عبارة محددة "النظرية السياسية"</p>
          </div>
        </div>

        <div className="tip-item">
          <div className="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
          </div>
          <div className="tip-content">
            <h4>ترتيب النتائج</h4>
            <p>رتب النتائج حسب الصلة، التاريخ، أو العنوان للعثور على ما تبحث عنه</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
