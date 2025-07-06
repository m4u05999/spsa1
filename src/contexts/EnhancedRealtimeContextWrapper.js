/**
 * Enhanced Real-time Context Wrapper
 * غلاف سياق الميزات الفورية المحسنة
 * 
 * This wrapper exports the JSX context for compatibility with Vitest
 */

// Re-export everything from the JS file
export {
  default as EnhancedRealtimeContext,
  useEnhancedRealtime,
  EnhancedRealtimeProvider,
  ENHANCED_REALTIME_ACTIONS
} from './EnhancedRealtimeContext.js';
