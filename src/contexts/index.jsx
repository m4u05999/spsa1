/**
 * Contexts Index File
 * ملف فهرس السياقات
 * 
 * Central export file for all context providers
 * ملف التصدير المركزي لجميع مقدمي السياق
 */

import React from 'react';

// Main unified context
export { UnifiedAppProvider, useUnifiedApp, useNotifications, useRealtime, useContentSync } from './UnifiedAppContext.jsx';

// Specialized contexts
export { default as AuthProvider, useAuth, AuthContext } from './AuthContext.jsx';
export { DashboardProvider, useDashboard } from './DashboardContext.jsx';
export { PaymentProvider, usePayment } from './PaymentContext.jsx';
export { ContentProvider, useContent } from './ContentContext.jsx';

// Utility contexts (kept for backward compatibility if needed)
export { SearchProvider, useSearch } from './SearchContext.jsx';
export { FileUploadProvider, useFileUpload } from './FileUploadContext.jsx';

// Content Bridge Integration
export { contentBridge } from '../services/contentBridge.js';
export { useUnifiedContent, useDashboardContent } from '../hooks/useUnifiedContent.js';

/**
 * HOC for combining multiple providers
 * مكون عالي المستوى لدمج عدة مقدمي خدمة
 */
export const CombinedProviders = ({ children }) => {
  return (
    <UnifiedAppProvider>
      <AuthProvider>
        <DashboardProvider>
          <PaymentProvider>
            <ContentProvider>
              {children}
            </ContentProvider>
          </PaymentProvider>
        </DashboardProvider>
      </AuthProvider>
    </UnifiedAppProvider>
  );
};

/**
 * App-level context configuration
 * تكوين السياق على مستوى التطبيق
 */
export const APP_CONTEXTS = {
  UNIFIED: 'unified',
  AUTH: 'auth', 
  DASHBOARD: 'dashboard',
  PAYMENT: 'payment',
  CONTENT: 'content',
  SEARCH: 'search',
  FILE_UPLOAD: 'fileUpload'
};

/**
 * Context loading states
 * حالات تحميل السياق
 */
export const CONTEXT_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  INITIALIZING: 'initializing'
};