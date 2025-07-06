/**
 * Advanced Filters Component
 * مكون الفلاتر المتقدمة
 * 
 * Provides comprehensive filtering options for search results
 */

import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext.jsx';

/**
 * AdvancedFilters Component
 * مكون الفلاتر المتقدمة
 */
const AdvancedFilters = ({ 
  isOpen = false,
  onToggle,
  showResultsCount = true,
  className = ''
}) => {
  const {
    filters,
    updateFilters,
    availableFilters,
    total,
    performSearch
  } = useSearch();

  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(isOpen);

  // Update local filters when global filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (filterKey, value, isMultiple = false) => {
    let newValue;
    
    if (isMultiple) {
      const currentValues = localFilters[filterKey] || [];
      if (currentValues.includes(value)) {
        newValue = currentValues.filter(v => v !== value);
      } else {
        newValue = [...currentValues, value];
      }
    } else {
      newValue = localFilters[filterKey] === value ? null : value;
    }

    const newFilters = {
      ...localFilters,
      [filterKey]: newValue
    };

    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    updateFilters(localFilters);
    performSearch();
  };

  // Reset filters
  const resetFilters = () => {
    setLocalFilters({});
    updateFilters({});
    performSearch();
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Check if filter has active values
  const hasActiveFilters = () => {
    return Object.values(localFilters).some(value => 
      value !== null && value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== null && value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <div className={`advanced-filters ${className}`}>
      {/* Filter Toggle Button */}
      <button
        className={`filters-toggle ${isExpanded ? 'expanded' : ''} ${hasActiveFilters() ? 'has-active' : ''}`}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-panel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
        </svg>
        <span>فلاتر متقدمة</span>
        {hasActiveFilters() && (
          <span className="active-count">{getActiveFiltersCount()}</span>
        )}
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

      {/* Filters Panel */}
      {isExpanded && (
        <div id="advanced-filters-panel" className="filters-panel">
          <div className="filters-content">
            {/* Content Type Filter */}
            <FilterSection
              title="نوع المحتوى"
              filterKey="type"
              options={[
                { value: 'article', label: 'مقالات' },
                { value: 'research', label: 'أبحاث' },
                { value: 'news', label: 'أخبار' },
                { value: 'event', label: 'فعاليات' },
                { value: 'publication', label: 'منشورات' }
              ]}
              selectedValues={localFilters.type}
              onChange={(value) => handleFilterChange('type', value, true)}
              isMultiple={true}
            />

            {/* Language Filter */}
            <FilterSection
              title="اللغة"
              filterKey="language"
              options={[
                { value: 'ar', label: 'العربية' },
                { value: 'en', label: 'الإنجليزية' }
              ]}
              selectedValues={localFilters.language}
              onChange={(value) => handleFilterChange('language', value, true)}
              isMultiple={true}
            />

            {/* Category Filter */}
            <FilterSection
              title="التصنيف"
              filterKey="category"
              options={[
                { value: 'political_theory', label: 'النظرية السياسية' },
                { value: 'international_relations', label: 'العلاقات الدولية' },
                { value: 'public_policy', label: 'السياسة العامة' },
                { value: 'comparative_politics', label: 'السياسة المقارنة' },
                { value: 'political_economy', label: 'الاقتصاد السياسي' }
              ]}
              selectedValues={localFilters.category}
              onChange={(value) => handleFilterChange('category', value, true)}
              isMultiple={true}
            />

            {/* Date Range Filter */}
            <DateRangeFilter
              title="النطاق الزمني"
              selectedValue={localFilters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />

            {/* Author Filter */}
            <AuthorFilter
              title="الكاتب/الباحث"
              selectedValue={localFilters.author}
              onChange={(value) => handleFilterChange('author', value)}
            />
          </div>

          {/* Filter Actions */}
          <div className="filters-actions">
            <button
              className="apply-filters-button"
              onClick={applyFilters}
              disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
            >
              تطبيق الفلاتر
              {showResultsCount && total > 0 && (
                <span className="results-count">({total.toLocaleString('ar-SA')})</span>
              )}
            </button>
            
            <button
              className="reset-filters-button"
              onClick={resetFilters}
              disabled={!hasActiveFilters()}
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Filter Section Component
 * مكون قسم الفلتر
 */
const FilterSection = ({ 
  title, 
  filterKey, 
  options, 
  selectedValues, 
  onChange, 
  isMultiple = false 
}) => {
  const isSelected = (value) => {
    if (isMultiple) {
      return Array.isArray(selectedValues) && selectedValues.includes(value);
    }
    return selectedValues === value;
  };

  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        {options.map((option) => (
          <label key={option.value} className="filter-option">
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={filterKey}
              value={option.value}
              checked={isSelected(option.value)}
              onChange={() => onChange(option.value)}
            />
            <span className="filter-label">{option.label}</span>
            {option.count && (
              <span className="filter-count">({option.count})</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

/**
 * Date Range Filter Component
 * مكون فلتر النطاق الزمني
 */
const DateRangeFilter = ({ title, selectedValue, onChange }) => {
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });

  const predefinedRanges = [
    { value: 'last_week', label: 'الأسبوع الماضي' },
    { value: 'last_month', label: 'الشهر الماضي' },
    { value: 'last_year', label: 'السنة الماضية' },
    { value: 'custom', label: 'نطاق مخصص' }
  ];

  const handleRangeChange = (value) => {
    if (value === 'custom') {
      onChange({ type: 'custom', ...customRange });
    } else {
      onChange(value);
    }
  };

  const handleCustomDateChange = (field, value) => {
    const newRange = { ...customRange, [field]: value };
    setCustomRange(newRange);
    
    if (selectedValue?.type === 'custom' || selectedValue === 'custom') {
      onChange({ type: 'custom', ...newRange });
    }
  };

  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        {predefinedRanges.map((range) => (
          <label key={range.value} className="filter-option">
            <input
              type="radio"
              name="dateRange"
              value={range.value}
              checked={
                selectedValue === range.value || 
                (range.value === 'custom' && selectedValue?.type === 'custom')
              }
              onChange={() => handleRangeChange(range.value)}
            />
            <span className="filter-label">{range.label}</span>
          </label>
        ))}
        
        {(selectedValue === 'custom' || selectedValue?.type === 'custom') && (
          <div className="custom-date-range">
            <div className="date-input-group">
              <label htmlFor="start-date">من تاريخ:</label>
              <input
                id="start-date"
                type="date"
                value={customRange.startDate}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="end-date">إلى تاريخ:</label>
              <input
                id="end-date"
                type="date"
                value={customRange.endDate}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Author Filter Component
 * مكون فلتر الكاتب
 */
const AuthorFilter = ({ title, selectedValue, onChange }) => {
  const [authorInput, setAuthorInput] = useState(selectedValue || '');

  const handleAuthorChange = (value) => {
    setAuthorInput(value);
    onChange(value.trim() || null);
  };

  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        <input
          type="text"
          placeholder="اكتب اسم الكاتب أو الباحث..."
          value={authorInput}
          onChange={(e) => handleAuthorChange(e.target.value)}
          className="author-input"
        />
      </div>
    </div>
  );
};

export default AdvancedFilters;
