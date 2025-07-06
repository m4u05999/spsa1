// src/hooks/useRealtimeSync.js
/**
 * Real-time Sync Hook - Phase 5
 * خطاف المزامنة الفورية - المرحلة الخامسة
 * 
 * Features:
 * - Easy integration with React components
 * - Automatic subscription management
 * - Content change notifications
 * - Performance optimized with memoization
 * - PDPL-compliant data handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import realtimeSyncService, { SYNC_EVENTS } from '../services/realtimeSyncService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { ENV } from '../config/environment.js';

/**
 * Real-time Sync Hook
 */
export const useRealtimeSync = (options = {}) => {
  const {
    autoConnect = true,
    events = Object.values(SYNC_EVENTS),
    onUpdate = null,
    onError = null,
    debounceMs = 100
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  // Refs for cleanup and debouncing
  const subscriptionsRef = useRef(new Map());
  const debounceTimerRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Handle sync update with debouncing
   */
  const handleSyncUpdate = useCallback((event) => {
    if (!mountedRef.current) return;

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce updates to prevent excessive re-renders
    debounceTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      setLastUpdate({
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
        source: event.source
      });

      // Call custom update handler if provided
      if (onUpdate && typeof onUpdate === 'function') {
        try {
          onUpdate(event);
        } catch (error) {
          console.error('❌ Error in sync update handler:', error);
          setError(error);
        }
      }

      if (ENV.IS_DEVELOPMENT) {
        console.log('🔄 Sync update received:', event.type, event.data);
      }
    }, debounceMs);
  }, [onUpdate, debounceMs]);

  /**
   * Handle sync error
   */
  const handleSyncError = useCallback((error) => {
    if (!mountedRef.current) return;

    setError(error);

    if (onError && typeof onError === 'function') {
      try {
        onError(error);
      } catch (handlerError) {
        console.error('❌ Error in sync error handler:', handlerError);
      }
    }

    if (ENV.IS_DEVELOPMENT) {
      console.error('❌ Sync error:', error);
    }
  }, [onError]);

  /**
   * Subscribe to sync events
   */
  const subscribe = useCallback((eventTypes = events) => {
    if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
      if (ENV.IS_DEVELOPMENT) {
        console.warn('⚠️ Real-time features disabled, skipping sync subscription');
      }
      return;
    }

    // Ensure eventTypes is an array
    const eventsToSubscribe = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    eventsToSubscribe.forEach(eventType => {
      if (!subscriptionsRef.current.has(eventType)) {
        try {
          const unsubscribe = realtimeSyncService.subscribe(
            eventType,
            handleSyncUpdate,
            { debounce: debounceMs }
          );

          subscriptionsRef.current.set(eventType, unsubscribe);

          if (ENV.IS_DEVELOPMENT) {
            console.log('✅ Subscribed to sync event:', eventType);
          }
        } catch (error) {
          console.error('❌ Failed to subscribe to sync event:', eventType, error);
          handleSyncError(error);
        }
      }
    });

    setIsConnected(subscriptionsRef.current.size > 0);
  }, [events, handleSyncUpdate, handleSyncError, debounceMs]);

  /**
   * Unsubscribe from sync events
   */
  const unsubscribe = useCallback((eventTypes = null) => {
    const eventsToUnsubscribe = eventTypes 
      ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes])
      : Array.from(subscriptionsRef.current.keys());

    eventsToUnsubscribe.forEach(eventType => {
      const unsubscribeFn = subscriptionsRef.current.get(eventType);
      if (unsubscribeFn) {
        try {
          unsubscribeFn();
          subscriptionsRef.current.delete(eventType);

          if (ENV.IS_DEVELOPMENT) {
            console.log('✅ Unsubscribed from sync event:', eventType);
          }
        } catch (error) {
          console.error('❌ Failed to unsubscribe from sync event:', eventType, error);
        }
      }
    });

    setIsConnected(subscriptionsRef.current.size > 0);
  }, []);

  /**
   * Trigger content sync
   */
  const syncContent = useCallback(async (changeType, contentData, syncOptions = {}) => {
    if (!getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
      if (ENV.IS_DEVELOPMENT) {
        console.warn('⚠️ Real-time features disabled, skipping content sync');
      }
      return false;
    }

    try {
      setError(null);
      
      const success = await realtimeSyncService.syncContentChange(
        changeType,
        contentData,
        syncOptions
      );

      if (!success) {
        throw new Error('Content sync failed');
      }

      if (ENV.IS_DEVELOPMENT) {
        console.log('✅ Content synced:', changeType, contentData.id);
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to sync content:', error);
      handleSyncError(error);
      return false;
    }
  }, [handleSyncError]);

  /**
   * Get current sync status
   */
  const getSyncStatus = useCallback(() => {
    try {
      const status = realtimeSyncService.getStatus();
      setSyncStatus(status);
      return status;
    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      return null;
    }
  }, []);

  /**
   * Force sync refresh
   */
  const refreshSync = useCallback(async () => {
    try {
      setError(null);
      
      // Unsubscribe and resubscribe to refresh connections
      unsubscribe();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Resubscribe
      subscribe();

      if (ENV.IS_DEVELOPMENT) {
        console.log('🔄 Sync refreshed');
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to refresh sync:', error);
      handleSyncError(error);
      return false;
    }
  }, [subscribe, unsubscribe, handleSyncError]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initialize sync on mount
   */
  useEffect(() => {
    if (autoConnect && getFeatureFlag('ENABLE_REAL_TIME_FEATURES')) {
      subscribe();
    }

    // Get initial sync status
    getSyncStatus();

    // Set up status polling
    const statusInterval = setInterval(() => {
      getSyncStatus();
    }, 30000); // Update status every 30 seconds

    return () => {
      clearInterval(statusInterval);
    };
  }, [autoConnect, subscribe, getSyncStatus]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Unsubscribe from all events
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    // State
    isConnected,
    syncStatus,
    lastUpdate,
    error,

    // Actions
    subscribe,
    unsubscribe,
    syncContent,
    refreshSync,
    clearError,
    getSyncStatus,

    // Utilities
    isRealtimeEnabled: getFeatureFlag('ENABLE_REAL_TIME_FEATURES'),
    isWebSocketEnabled: getFeatureFlag('ENABLE_WEBSOCKET')
  };
};

/**
 * Content-specific sync hook
 */
export const useContentSync = (contentType = null, options = {}) => {
  const contentEvents = contentType 
    ? [
        SYNC_EVENTS.CONTENT_CREATED,
        SYNC_EVENTS.CONTENT_UPDATED,
        SYNC_EVENTS.CONTENT_DELETED,
        SYNC_EVENTS.CONTENT_PUBLISHED,
        SYNC_EVENTS.CONTENT_UNPUBLISHED
      ]
    : Object.values(SYNC_EVENTS);

  const syncHook = useRealtimeSync({
    ...options,
    events: contentEvents
  });

  /**
   * Sync content creation
   */
  const syncContentCreated = useCallback(async (contentData) => {
    return await syncHook.syncContent(SYNC_EVENTS.CONTENT_CREATED, contentData);
  }, [syncHook.syncContent]);

  /**
   * Sync content update
   */
  const syncContentUpdated = useCallback(async (contentData) => {
    return await syncHook.syncContent(SYNC_EVENTS.CONTENT_UPDATED, contentData);
  }, [syncHook.syncContent]);

  /**
   * Sync content deletion
   */
  const syncContentDeleted = useCallback(async (contentData) => {
    return await syncHook.syncContent(SYNC_EVENTS.CONTENT_DELETED, contentData);
  }, [syncHook.syncContent]);

  /**
   * Sync content publication
   */
  const syncContentPublished = useCallback(async (contentData) => {
    return await syncHook.syncContent(SYNC_EVENTS.CONTENT_PUBLISHED, contentData);
  }, [syncHook.syncContent]);

  /**
   * Sync content unpublication
   */
  const syncContentUnpublished = useCallback(async (contentData) => {
    return await syncHook.syncContent(SYNC_EVENTS.CONTENT_UNPUBLISHED, contentData);
  }, [syncHook.syncContent]);

  return {
    ...syncHook,
    
    // Content-specific actions
    syncContentCreated,
    syncContentUpdated,
    syncContentDeleted,
    syncContentPublished,
    syncContentUnpublished,

    // Content type filter
    contentType
  };
};

export default useRealtimeSync;
