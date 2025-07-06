// src/tests/components/ContentManager.test.jsx
/**
 * ContentManager Component Tests
 * اختبارات مكون إدارة المحتوى
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContentManager from '../../components/content/ContentManager.jsx';
import { ContentProvider } from '../../contexts/ContentContext.jsx';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../schemas/contentManagementSchema.js';
import { useContentManagement } from '../../hooks/useContentManagement.js';

// Mock the hooks and services
vi.mock('../../hooks/useContentManagement.js', () => ({
  useContentManagement: vi.fn()
}));

// Default mock return value
const defaultMockReturn = {
  content: [
    {
      id: 'test-1',
      title: 'مقال تجريبي',
      titleAr: 'مقال تجريبي',
      excerpt: 'هذا مقال تجريبي للاختبار',
      contentType: CONTENT_TYPES.ARTICLE,
      status: CONTENT_STATUS.PUBLISHED,
      publishedAt: new Date().toISOString(),
      authorName: 'كاتب تجريبي',
      viewsCount: 100,
      isFeatured: true,
      tags: ['اختبار', 'مقال']
    },
    {
      id: 'test-2',
      title: 'خبر تجريبي',
      titleAr: 'خبر تجريبي',
      excerpt: 'هذا خبر تجريبي للاختبار',
      contentType: CONTENT_TYPES.NEWS,
      status: CONTENT_STATUS.DRAFT,
      publishedAt: new Date().toISOString(),
      authorName: 'محرر تجريبي',
      viewsCount: 50,
      isFeatured: false,
      tags: ['اختبار', 'خبر']
    }
  ],
  loading: false,
  error: null,
  filters: {},
  categories: [],
  tags: [],
  stats: { total: 2, published: 1, draft: 1 },
  selectedItems: [],
  hasSelection: false,
  selectionCount: 0,
  viewMode: 'list',

  // Mock functions
  loadContent: vi.fn(),
  createContent: vi.fn(),
  updateContent: vi.fn(),
  deleteContent: vi.fn(),
  updateFilters: vi.fn(),
  resetFilters: vi.fn(),
  searchContent: vi.fn(),
  toggleSelection: vi.fn(),
  selectAll: vi.fn(),
  clearSelection: vi.fn(),
  performBulkAction: vi.fn(),
  setViewMode: vi.fn(),
  sortContent: vi.fn(),
  applyQuickFilter: vi.fn(),
  createFromTemplate: vi.fn(),
  duplicateContent: vi.fn(),
  exportContent: vi.fn()
};

// Mock ContentListView and ContentGridView
vi.mock('../../components/content/ContentListView.jsx', () => ({
  default: ({ content }) => (
    <div data-testid="content-list-view">
      {content.map(item => (
        <div key={item.id} data-testid={`content-item-${item.id}`}>
          {item.titleAr || item.title}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../components/content/ContentGridView.jsx', () => ({
  default: ({ content }) => (
    <div data-testid="content-grid-view">
      {content.map(item => (
        <div key={item.id} data-testid={`content-card-${item.id}`}>
          {item.titleAr || item.title}
        </div>
      ))}
    </div>
  )
}));

describe('ContentManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return value
    vi.mocked(useContentManagement).mockReturnValue(defaultMockReturn);
  });

  const renderWithProvider = (component) => {
    return render(
      <ContentProvider>
        {component}
      </ContentProvider>
    );
  };

  it('should render content manager header', () => {
    renderWithProvider(<ContentManager />);
    
    expect(screen.getByText('إدارة المحتوى')).toBeInTheDocument();
    expect(screen.getByText(/إجمالي 2 عنصر/)).toBeInTheDocument();
  });

  it('should render content in list view by default', () => {
    renderWithProvider(<ContentManager />);
    
    expect(screen.getByTestId('content-list-view')).toBeInTheDocument();
    expect(screen.getByTestId('content-item-test-1')).toBeInTheDocument();
    expect(screen.getByTestId('content-item-test-2')).toBeInTheDocument();
  });

  it('should display content titles correctly', () => {
    renderWithProvider(<ContentManager />);
    
    expect(screen.getByText('مقال تجريبي')).toBeInTheDocument();
    expect(screen.getByText('خبر تجريبي')).toBeInTheDocument();
  });

  it('should render create content button', () => {
    renderWithProvider(<ContentManager />);
    
    expect(screen.getByText('إنشاء محتوى جديد')).toBeInTheDocument();
  });

  it('should render view mode toggle buttons', () => {
    renderWithProvider(<ContentManager />);
    
    // Check for list and grid view buttons (they contain SVG icons)
    const buttons = screen.getAllByRole('button');
    const viewModeButtons = buttons.filter(button => 
      button.querySelector('svg') && 
      (button.classList.contains('bg-white') || button.classList.contains('text-gray-600'))
    );
    
    expect(viewModeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should render filters section', () => {
    renderWithProvider(<ContentManager />);
    
    expect(screen.getByPlaceholderText('ابحث في المحتوى...')).toBeInTheDocument();
    expect(screen.getByText('الحالة')).toBeInTheDocument();
    expect(screen.getByText('التصنيف')).toBeInTheDocument();
  });

  it('should render quick filter buttons', () => {
    renderWithProvider(<ContentManager />);
    
    expect(screen.getByText('المميز')).toBeInTheDocument();
    expect(screen.getByText('الأحدث')).toBeInTheDocument();
    expect(screen.getByText('الأكثر مشاهدة')).toBeInTheDocument();
    expect(screen.getByText('إعادة تعيين')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // Mock loading state
    vi.mocked(useContentManagement).mockReturnValue({
      ...defaultMockReturn,
      content: [],
      loading: true,
      stats: { total: 0, published: 0, draft: 0 }
    });

    renderWithProvider(<ContentManager />);

    expect(screen.getByText('جاري تحميل المحتوى...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Mock error state
    vi.mocked(useContentManagement).mockReturnValue({
      ...defaultMockReturn,
      content: [],
      loading: false,
      error: 'خطأ في تحميل البيانات',
      stats: { total: 0, published: 0, draft: 0 }
    });

    renderWithProvider(<ContentManager />);

    expect(screen.getByText('خطأ في تحميل المحتوى')).toBeInTheDocument();
    expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
  });
});
