/**
 * Content Bridge Integration Tests
 * اختبارات تكامل جسر المحتوى
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnifiedContent, useDashboardContent } from '../hooks/useUnifiedContent.js';
import { contentBridge } from '../services/contentBridge.js';
import { CONTENT_TYPES, CONTENT_STATUS } from '../schemas/contentManagementSchema.js';

// Mock dependencies
vi.mock('../services/contentBridge.js', () => ({
  contentBridge: {
    initialize: vi.fn(),
    getContentForDisplay: vi.fn(),
    getCategoriesForDisplay: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    clearCache: vi.fn()
  }
}));

vi.mock('../contexts/UnifiedAppContext.jsx', () => ({
  useUnifiedApp: () => ({
    addNotification: vi.fn(),
    setError: vi.fn()
  })
}));

describe('Content Bridge Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contentBridge.initialize.mockResolvedValue();
    contentBridge.getContentForDisplay.mockResolvedValue({
      content: [],
      categories: [],
      tags: [],
      total: 0,
      hasMore: false
    });
    contentBridge.getCategoriesForDisplay.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useUnifiedContent Hook', () => {
    test('should initialize content bridge on mount', async () => {
      const { result } = renderHook(() => 
        useUnifiedContent({ autoLoad: false })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(contentBridge.initialize).toHaveBeenCalled();
    });

    test('should load content when autoLoad is true', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'Test Article',
          type: CONTENT_TYPES.NEWS,
          status: CONTENT_STATUS.PUBLISHED
        }
      ];

      contentBridge.getContentForDisplay.mockResolvedValue({
        content: mockContent,
        categories: [],
        tags: [],
        total: 1,
        hasMore: false
      });

      const { result } = renderHook(() => 
        useUnifiedContent({ 
          autoLoad: true,
          type: CONTENT_TYPES.NEWS 
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenCalledWith({
        type: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.PUBLISHED,
        featured: null,
        limit: 10,
        offset: 0,
        includeCategories: true,
        includeTags: true
      });

      expect(result.current.content).toEqual(mockContent);
      expect(result.current.loading).toBe(false);
      expect(result.current.total).toBe(1);
    });

    test('should handle search functionality', async () => {
      const { result } = renderHook(() => 
        useUnifiedContent({ autoLoad: false })
      );

      await act(async () => {
        await result.current.searchContent('test query');
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenCalledWith({
        type: null,
        status: CONTENT_STATUS.PUBLISHED,
        featured: null,
        limit: 10,
        offset: 0,
        search: 'test query',
        page: 0,
        includeCategories: true,
        includeTags: true
      });
    });

    test('should handle category filtering', async () => {
      const { result } = renderHook(() => 
        useUnifiedContent({ autoLoad: false })
      );

      await act(async () => {
        await result.current.filterByCategory('category-1');
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenCalledWith({
        type: null,
        status: CONTENT_STATUS.PUBLISHED,
        featured: null,
        limit: 10,
        offset: 0,
        category: 'category-1',
        page: 0,
        includeCategories: true,
        includeTags: true
      });
    });

    test('should handle load more functionality', async () => {
      const { result } = renderHook(() => 
        useUnifiedContent({ autoLoad: false })
      );

      // Set initial state with hasMore = true
      await act(async () => {
        result.current.loadContent({ page: 0 });
      });

      // Mock hasMore response
      contentBridge.getContentForDisplay.mockResolvedValue({
        content: [{ id: '2', title: 'More content' }],
        categories: [],
        tags: [],
        total: 2,
        hasMore: false
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenLastCalledWith({
        type: null,
        status: CONTENT_STATUS.PUBLISHED,
        featured: null,
        limit: 10,
        offset: 10, // Second page
        page: 1,
        append: true,
        includeCategories: true,
        includeTags: true
      });
    });

    test('should setup real-time subscriptions when enabled', async () => {
      renderHook(() => 
        useUnifiedContent({ 
          autoLoad: false,
          enableRealtime: true 
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(contentBridge.subscribe).toHaveBeenCalledWith('content', expect.any(Function));
      expect(contentBridge.subscribe).toHaveBeenCalledWith('categories', expect.any(Function));
    });

    test('should handle errors gracefully', async () => {
      const error = new Error('Content loading failed');
      contentBridge.getContentForDisplay.mockRejectedValue(error);

      const { result } = renderHook(() => 
        useUnifiedContent({ autoLoad: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.error).toBe('Content loading failed');
      expect(result.current.loading).toBe(false);
      expect(result.current.content).toEqual([]);
    });
  });

  describe('useDashboardContent Hook', () => {
    test('should include all content statuses for dashboard', async () => {
      const { result } = renderHook(() => 
        useDashboardContent({ autoLoad: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenCalledWith({
        type: null,
        status: null, // Should be null for dashboard to include all statuses
        featured: null,
        limit: 10,
        offset: 0,
        includeCategories: true,
        includeTags: true
      });
    });

    test('should provide dashboard-specific methods', () => {
      const { result } = renderHook(() => 
        useDashboardContent({ autoLoad: false })
      );

      expect(result.current.createContent).toBeDefined();
      expect(result.current.updateContent).toBeDefined();
      expect(result.current.deleteContent).toBeDefined();
      expect(result.current.publishContent).toBeDefined();
      expect(result.current.unpublishContent).toBeDefined();
    });
  });

  describe('Real-time Updates', () => {
    test('should handle real-time content insertion', async () => {
      let contentChangeHandler;
      contentBridge.subscribe.mockImplementation((type, handler) => {
        if (type === 'content') {
          contentChangeHandler = handler;
        }
        return vi.fn();
      });

      const { result } = renderHook(() => 
        useUnifiedContent({ 
          autoLoad: false,
          enableRealtime: true,
          type: CONTENT_TYPES.NEWS
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Simulate real-time content insertion
      const newContent = {
        id: '3',
        title: 'New Real-time Content',
        content_type: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.PUBLISHED,
        is_featured: false
      };

      await act(() => {
        contentChangeHandler({
          type: 'INSERT',
          data: newContent
        });
      });

      expect(result.current.content).toContainEqual(newContent);
      expect(result.current.total).toBe(1);
    });

    test('should handle real-time content updates', async () => {
      let contentChangeHandler;
      contentBridge.subscribe.mockImplementation((type, handler) => {
        if (type === 'content') {
          contentChangeHandler = handler;
        }
        return vi.fn();
      });

      // Initial content
      const initialContent = [{
        id: '1',
        title: 'Original Title',
        content_type: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.PUBLISHED
      }];

      contentBridge.getContentForDisplay.mockResolvedValue({
        content: initialContent,
        categories: [],
        tags: [],
        total: 1,
        hasMore: false
      });

      const { result } = renderHook(() => 
        useUnifiedContent({ 
          autoLoad: true,
          enableRealtime: true 
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Simulate real-time content update
      const updatedContent = {
        id: '1',
        title: 'Updated Title',
        content_type: CONTENT_TYPES.NEWS,
        status: CONTENT_STATUS.PUBLISHED
      };

      await act(() => {
        contentChangeHandler({
          type: 'UPDATE',
          data: updatedContent
        });
      });

      expect(result.current.content[0].title).toBe('Updated Title');
    });

    test('should handle real-time content deletion', async () => {
      let contentChangeHandler;
      contentBridge.subscribe.mockImplementation((type, handler) => {
        if (type === 'content') {
          contentChangeHandler = handler;
        }
        return vi.fn();
      });

      // Initial content
      const initialContent = [
        { id: '1', title: 'Content 1' },
        { id: '2', title: 'Content 2' }
      ];

      contentBridge.getContentForDisplay.mockResolvedValue({
        content: initialContent,
        categories: [],
        tags: [],
        total: 2,
        hasMore: false
      });

      const { result } = renderHook(() => 
        useUnifiedContent({ 
          autoLoad: true,
          enableRealtime: true 
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Simulate real-time content deletion
      await act(() => {
        contentChangeHandler({
          type: 'DELETE',
          data: { id: '1' }
        });
      });

      expect(result.current.content).toHaveLength(1);
      expect(result.current.content[0].id).toBe('2');
      expect(result.current.total).toBe(1);
    });
  });

  describe('Content Filtering', () => {
    test('should filter content based on type and status', async () => {
      const { result } = renderHook(() => 
        useUnifiedContent({ 
          type: CONTENT_TYPES.ARTICLE,
          status: CONTENT_STATUS.DRAFT,
          autoLoad: true
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenCalledWith({
        type: CONTENT_TYPES.ARTICLE,
        status: CONTENT_STATUS.DRAFT,
        featured: null,
        limit: 10,
        offset: 0,
        includeCategories: true,
        includeTags: true
      });
    });

    test('should handle featured content filtering', async () => {
      const { result } = renderHook(() => 
        useUnifiedContent({ 
          featured: true,
          autoLoad: true
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(contentBridge.getContentForDisplay).toHaveBeenCalledWith({
        type: null,
        status: CONTENT_STATUS.PUBLISHED,
        featured: true,
        limit: 10,
        offset: 0,
        includeCategories: true,
        includeTags: true
      });
    });
  });
});

describe('Content Bridge Service', () => {
  test('should initialize successfully', async () => {
    await expect(contentBridge.initialize()).resolves.not.toThrow();
  });

  test('should handle content transformation', async () => {
    const mockRawContent = [{
      id: '1',
      title: 'Test Article',
      content: 'This is test content with multiple words to test reading time calculation.',
      created_at: '2024-01-01T00:00:00Z',
      featured_image_url: 'test.jpg',
      author_name: 'Test Author',
      category_name: 'Test Category'
    }];

    contentBridge.getContentForDisplay.mockResolvedValue({
      content: mockRawContent,
      categories: [],
      tags: [],
      total: 1,
      hasMore: false
    });

    const result = await contentBridge.getContentForDisplay();
    
    expect(result.content[0]).toEqual(
      expect.objectContaining({
        id: '1',
        title: 'Test Article',
        featuredImage: 'test.jpg',
        author: 'Test Author',
        category: 'Test Category',
        formattedDate: expect.any(String),
        readingTime: expect.any(Number),
        isNew: expect.any(Boolean)
      })
    );
  });
});