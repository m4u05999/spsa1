/**
 * Search Analytics Component
 * مكون تحليلات البحث
 * 
 * Displays search analytics and insights
 */

import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';

/**
 * SearchAnalytics Component
 * مكون تحليلات البحث
 */
const SearchAnalytics = ({ showDetailedStats = false }) => {
  const { analytics, history } = useSearch();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if analytics are disabled
  if (!getFeatureFlag('ENABLE_SEARCH_ANALYTICS')) {
    return null;
  }

  // Don't render if no analytics data
  if (!analytics) {
    return null;
  }

  const {
    totalSearches,
    popularTerms,
    averageResponseTime
  } = analytics;

  return (
    <div className="search-analytics">
      <div className="analytics-header">
        <h3 className="analytics-title">إحصائيات البحث</h3>
        <button
          className={`analytics-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'إخفاء' : 'عرض التفاصيل'}
          <svg 
            className="chevron" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
      </div>

      <div className="analytics-summary">
        <div className="stat-item">
          <div className="stat-value">{totalSearches.toLocaleString('ar-SA')}</div>
          <div className="stat-label">إجمالي عمليات البحث</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{Math.round(averageResponseTime)}ms</div>
          <div className="stat-label">متوسط وقت الاستجابة</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{popularTerms.length}</div>
          <div className="stat-label">المصطلحات الشائعة</div>
        </div>
      </div>

      {isExpanded && (
        <div className="analytics-details">
          {/* Popular Search Terms */}
          {popularTerms.length > 0 && (
            <div className="analytics-section">
              <h4 className="section-title">المصطلحات الأكثر بحثاً</h4>
              <div className="popular-terms">
                {popularTerms.slice(0, 10).map(([term, count], index) => (
                  <div key={term} className="term-item">
                    <span className="term-rank">#{index + 1}</span>
                    <span className="term-text">{term}</span>
                    <span className="term-count">{count} مرة</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Search History */}
          {getFeatureFlag('ENABLE_SEARCH_HISTORY') && history.length > 0 && (
            <div className="analytics-section">
              <h4 className="section-title">عمليات البحث الأخيرة</h4>
              <div className="search-history">
                {history.slice(0, 5).map((search, index) => (
                  <div key={index} className="history-item">
                    <span className="history-query">"{search.query}"</span>
                    <span className="history-time">
                      {new Date(search.timestamp).toLocaleString('ar-SA')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {showDetailedStats && (
            <div className="analytics-section">
              <h4 className="section-title">مقاييس الأداء</h4>
              <div className="performance-metrics">
                <div className="metric-item">
                  <span className="metric-label">متوسط وقت الاستجابة:</span>
                  <span className="metric-value">{Math.round(averageResponseTime)}ms</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">إجمالي عمليات البحث:</span>
                  <span className="metric-value">{totalSearches.toLocaleString('ar-SA')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAnalytics;
