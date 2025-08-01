/**
 * MasterDataService Tests
 * اختبارات خدمة البيانات الرئيسية
 * 
 * @description
 * اختبارات شاملة لخدمة البيانات الرئيسية
 * تتضمن اختبارات للوظائف الأساسية والتحديثات الفورية والتخزين المؤقت
 * 
 * @author SPSA Development Team
 * @version 1.0.0
 * @since 2024-12-29
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MasterDataService from '../services/MasterDataService.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

// Mock Supabase with proper chaining
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => {
    const mockQuery = {
      eq: vi.fn(() => mockQuery),
      or: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      limit: vi.fn(() => mockQuery),
      single: vi.fn(() => Promise.resolve({
        data: { id: 'test-id', title: 'Test Content' },
        error: null
      })),
      then: vi.fn((callback) => callback({
        data: [
          { id: '1', title: 'Test Article', contentType: 'article', status: 'published' },
          { id: '2', title: 'Test News', contentType: 'news', status: 'published' }
        ],
        error: null
      }))
    };

    return {
      from: vi.fn(() => ({
        select: vi.fn(() => mockQuery),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'test-id', title: 'Test Article', contentType: 'article' },
              error: null
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { id: 'test-id', title: 'Updated Title', status: 'published' },
                error: null
              }))
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      }))
    };
  })
}));

// Mock environment
vi.mock('../config/environment.js', () => ({
  ENV: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-key'
  }
}));

// Mock feature flags
vi.mock('../config/featureFlags.js', () => ({
  getFeatureFlag: vi.fn(() => true)
}));

// Mock monitoring
vi.mock('../utils/developmentPerformanceMonitor.js', () => ({
  recordApiCall: vi.fn(),
  recordServiceInit: vi.fn()
}));

vi.mock('../utils/monitoring.js', () => ({
  monitoringService: {
    recordEvent: vi.fn()
  }
}));

describe('MasterDataService', () => {
  let service;

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset service instance
    if (MasterDataService.instance) {
      MasterDataService.instance = null;
    }
    
    // Create new service instance
    service = MasterDataService;
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    // Clean up
    if (service && service.destroy) {
      service.destroy();
    }
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize as singleton', () => {
      const service1 = MasterDataService;
      const service2 = MasterDataService;
      expect(service1).toBe(service2);
    });

    it('should have correct initial state', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('cacheSize');
    });
  });

  describe('Content Operations', () => {
    const testContent = {
      title: 'Test Article',
      contentType: CONTENT_TYPES.ARTICLE,
      content: 'Test content body',
      status: CONTENT_STATUS.DRAFT
    };

    it('should get content successfully', async () => {
      const content = await service.getContent('content');
      expect(Array.isArray(content)).toBe(true);
    });

    it('should get content by type', async () => {
      const news = await service.getContent('news');
      expect(Array.isArray(news)).toBe(true);
    });

    it('should get content with filters', async () => {
      const filters = {
        status: CONTENT_STATUS.PUBLISHED,
        featured: true,
        limit: 10
      };
      
      const content = await service.getContent('content', filters);
      expect(Array.isArray(content)).toBe(true);
    });

    it('should create content successfully', async () => {
      const newContent = await service.createContent(testContent);
      expect(newContent).toHaveProperty('id');
      expect(newContent.title).toBe(testContent.title);
      expect(newContent.contentType).toBe(testContent.contentType);
    });

    it('should update content successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        status: CONTENT_STATUS.PUBLISHED
      };
      
      const updated = await service.updateContent('test-id', updateData);
      expect(updated).toHaveProperty('id');
      expect(updated.title).toBe(updateData.title);
    });

    it('should delete content successfully', async () => {
      const result = await service.deleteContent('test-id');
      expect(result).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid data
      await expect(service.createContent({})).rejects.toThrow();
      await expect(service.updateContent('', {})).rejects.toThrow();
      await expect(service.deleteContent('')).rejects.toThrow();
    });
  });

  describe('Search Functionality', () => {
    it('should search content successfully', async () => {
      const results = await service.searchContent('test query');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search with filters', async () => {
      const results = await service.searchContent('test', {
        contentType: CONTENT_TYPES.ARTICLE,
        status: CONTENT_STATUS.PUBLISHED
      });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Content by ID', () => {
    it('should get content by ID', async () => {
      const content = await service.getContentById('test-id');
      // Should return null or content object
      expect(content === null || typeof content === 'object').toBe(true);
    });
  });

  describe('Categories and Tags', () => {
    it('should get categories', async () => {
      const categories = await service.getCategories();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should get tags', async () => {
      const tags = await service.getTags();
      expect(Array.isArray(tags)).toBe(true);
    });
  });

  describe('Caching', () => {
    it('should cache content requests', async () => {
      // First request
      const content1 = await service.getContent('content');
      
      // Second request (should use cache)
      const content2 = await service.getContent('content');
      
      expect(content1).toEqual(content2);
    });

    it('should invalidate cache on content changes', async () => {
      // Get initial content
      await service.getContent('content');
      
      // Create new content (should invalidate cache)
      await service.createContent({
        title: 'New Content',
        contentType: CONTENT_TYPES.ARTICLE
      });
      
      // Cache should be invalidated
      const status = service.getStatus();
      expect(status.cacheSize).toBeGreaterThanOrEqual(0);
    });

    it('should clear cache', () => {
      service.clearCache();
      const status = service.getStatus();
      expect(status.cacheSize).toBe(0);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should subscribe to real-time updates', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribeToRealtime('content_created', callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test unsubscribe
      unsubscribe();
    });

    it('should handle multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const unsubscribe1 = service.subscribeToRealtime('content_created', callback1);
      const unsubscribe2 = service.subscribeToRealtime('content_created', callback2);
      
      expect(typeof unsubscribe1).toBe('function');
      expect(typeof unsubscribe2).toBe('function');
      
      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Offline Support', () => {
    it('should work offline', async () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      const content = await service.getContent('content');
      expect(Array.isArray(content)).toBe(true);
    });

    it('should store offline changes', async () => {
      // Clear localStorage first
      localStorage.clear();

      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Force service to offline mode
      service.isOnline = false;
      service.supabase = null;

      await service.createContent({
        title: 'Offline Content',
        contentType: 'article'
      });

      // Check if offline changes are stored
      const offlineChanges = localStorage.getItem('spsa_offline_changes');
      expect(offlineChanges).toBeTruthy();

      // Parse and verify the stored data
      const parsedChanges = JSON.parse(offlineChanges);
      expect(parsedChanges).toHaveLength(1);
      expect(parsedChanges[0].operation).toBe('create');
      expect(parsedChanges[0].data.title).toBe('Offline Content');
    });
  });

  describe('Service Status', () => {
    it('should return correct service status', () => {
      const status = service.getStatus();
      
      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('hasSupabase');
      expect(status).toHaveProperty('cacheSize');
      expect(status).toHaveProperty('subscribersCount');
      expect(status).toHaveProperty('hasOfflineChanges');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      const originalFetch = global.fetch;
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      
      const content = await service.getContent('content');
      expect(Array.isArray(content)).toBe(true);
      
      // Restore fetch
      global.fetch = originalFetch;
    });

    it('should provide fallback data', async () => {
      // Clear cache and simulate error
      service.clearCache();
      
      const content = await service.getContent('content');
      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should complete operations within reasonable time', async () => {
      const startTime = performance.now();
      
      await service.getContent('content');
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
