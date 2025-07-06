/**
 * Advanced Search Bar Component
 * مكون شريط البحث المتقدم
 * 
 * Provides an intuitive search interface with suggestions and filters
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSearch, useSearchSuggestions } from '../../contexts/SearchContext.jsx';
import { getFeatureFlag } from '../../config/featureFlags.js';
import './SearchBar.css';

/**
 * SearchBar Component
 * مكون شريط البحث
 */
const SearchBar = ({ 
  placeholder = 'ابحث في محتوى الجمعية...',
  placeholderEn = 'Search association content...',
  showFilters = true,
  showSuggestions = true,
  autoFocus = false,
  onSearch,
  className = ''
}) => {
  const {
    query,
    updateQuery,
    performSearch,
    isLoading,
    features
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isRTL, setIsRTL] = useState(true);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Get suggestions with debouncing
  const suggestions = useSearchSuggestions(localQuery, 300);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Detect text direction
  useEffect(() => {
    const detectDirection = (text) => {
      const arabicRegex = /[\u0600-\u06FF]/;
      return arabicRegex.test(text);
    };
    
    setIsRTL(detectDirection(localQuery));
  }, [localQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    updateQuery(value);
    
    if (features.searchSuggestions && showSuggestions) {
      setShowSuggestionsList(value.length >= 2);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery = localQuery) => {
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
      setShowSuggestionsList(false);
      
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setLocalQuery(suggestion);
    updateQuery(suggestion);
    handleSearch(suggestion);
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const handleClear = () => {
    setLocalQuery('');
    updateQuery('');
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`search-bar ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          {/* Search Icon */}
          <div className="search-icon">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (features.searchSuggestions && showSuggestions && localQuery.length >= 2) {
                setShowSuggestionsList(true);
              }
            }}
            placeholder={isRTL ? placeholder : placeholderEn}
            className={`search-input ${isRTL ? 'rtl' : 'ltr'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
            disabled={isLoading}
            aria-label="Search input"
            aria-expanded={showSuggestionsList}
            aria-haspopup="listbox"
            role="combobox"
          />

          {/* Clear Button */}
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || localQuery.trim().length < 2}
            aria-label="Search"
          >
            {isLoading ? (
              <div className="spinner small"></div>
            ) : (
              <span>{isRTL ? 'بحث' : 'Search'}</span>
            )}
          </button>
        </div>

        {/* Search Suggestions */}
        {features.searchSuggestions && showSuggestions && showSuggestionsList && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="suggestions-container">
            <ul className="suggestions-list" role="listbox">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  role="option"
                  aria-selected={index === selectedSuggestionIndex}
                >
                  <div className="suggestion-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <span className="suggestion-text">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Quick Filters (if enabled) */}
      {showFilters && features.advancedSearch && (
        <div className="quick-filters">
          <QuickFilters />
        </div>
      )}
    </div>
  );
};

/**
 * Quick Filters Component
 * مكون الفلاتر السريعة
 */
const QuickFilters = () => {
  const { filters, updateFilters } = useSearch();

  const quickFilterOptions = [
    { key: 'type', value: 'article', label: 'مقالات', labelEn: 'Articles' },
    { key: 'type', value: 'research', label: 'أبحاث', labelEn: 'Research' },
    { key: 'type', value: 'news', label: 'أخبار', labelEn: 'News' },
    { key: 'type', value: 'event', label: 'فعاليات', labelEn: 'Events' },
    { key: 'language', value: 'ar', label: 'عربي', labelEn: 'Arabic' },
    { key: 'language', value: 'en', label: 'English', labelEn: 'English' }
  ];

  const handleQuickFilter = (filterKey, filterValue) => {
    const currentFilter = filters[filterKey];
    let newFilterValue;

    if (Array.isArray(currentFilter)) {
      if (currentFilter.includes(filterValue)) {
        newFilterValue = currentFilter.filter(v => v !== filterValue);
      } else {
        newFilterValue = [...currentFilter, filterValue];
      }
    } else {
      newFilterValue = currentFilter === filterValue ? null : filterValue;
    }

    updateFilters({ [filterKey]: newFilterValue });
  };

  const isFilterActive = (filterKey, filterValue) => {
    const currentFilter = filters[filterKey];
    if (Array.isArray(currentFilter)) {
      return currentFilter.includes(filterValue);
    }
    return currentFilter === filterValue;
  };

  return (
    <div className="quick-filters-container">
      <span className="quick-filters-label">فلترة سريعة:</span>
      <div className="quick-filters-list">
        {quickFilterOptions.map((option, index) => (
          <button
            key={index}
            className={`quick-filter-button ${isFilterActive(option.key, option.value) ? 'active' : ''}`}
            onClick={() => handleQuickFilter(option.key, option.value)}
            aria-pressed={isFilterActive(option.key, option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
