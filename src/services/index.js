// src/services/index.js
/**
 * Services Export Index - SPSA
 * فهرس تصدير الخدمات - الجمعية السعودية للعلوم السياسية
 * 
 * Centralized export for all services including Phase 5 real-time sync
 */

// Core API Services
export { default as unifiedApiService } from './unifiedApiService.js';
export { default as realtimeService } from './realtimeService.js';
export { default as realtimeSyncService } from './realtimeSyncService.js';

// Content Services
export { unifiedContentService } from './unifiedContentService.js';

// Utility Services
export { localStorageService } from '../utils/localStorage.js';

// Export sync events and strategies for convenience
export { SYNC_EVENTS, SYNC_STRATEGIES } from './realtimeSyncService.js';
