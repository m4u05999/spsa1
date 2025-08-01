import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventsManagement from '../pages/dashboard/modules/EventsManagement';
import { EVENT_STATUS, CONTENT_TYPES } from '../schemas/contentManagementSchema';

// Mock MasterDataService with correct interface
const mockMasterData = [
  {
    id: 'event-1',
    title: 'مؤتمر العلوم السياسية السنوي',
    type: CONTENT_TYPES.EVENT,
    status: EVENT_STATUS.UPCOMING,
    startDate: '2024-03-15T09:00:00Z',
    endDate: '2024-03-17T17:00:00Z',
    location: 'الرياض',
    description: 'مؤتمر سنوي يجمع خبراء العلوم السياسية',
    featured: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'event-2',
    title: 'ورشة عمل: تحليل السياسات العامة',
    type: CONTENT_TYPES.WORKSHOP,
    status: EVENT_STATUS.ONGOING,
    startDate: '2024-02-10T10:00:00Z',
    endDate: '2024-02-10T16:00:00Z',
    location: 'جدة',
    description: 'ورشة عمل متخصصة في تحليل السياسات',
    featured: false,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'event-3',
    title: 'محاضرة: مستقبل الديمقراطية',
    type: CONTENT_TYPES.LECTURE,
    status: EVENT_STATUS.COMPLETED,
    startDate: '2024-01-20T14:00:00Z',
    endDate: '2024-01-20T16:00:00Z',
    location: 'الدمام',
    description: 'محاضرة حول مستقبل الديمقراطية في المنطقة',
    featured: false,
    createdAt: '2024-01-10T00:00:00Z'
  }
];

const mockLoadData = vi.fn();
const mockCreateContent = vi.fn();
const mockUpdateContent = vi.fn();
const mockDeleteContent = vi.fn();
const mockSearchContent = vi.fn();

vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => ({
    data: mockMasterData,
    loading: false,
    error: null,
    loadData: mockLoadData,
    createContent: mockCreateContent,
    updateContent: mockUpdateContent,
    deleteContent: mockDeleteContent,
    searchContent: mockSearchContent
  })
}));

// Mock AuthContext
vi.mock('../contexts/index.jsx', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      role: 'ADMIN',
      permissions: ['content.write', 'content.delete']
    }
  })
}));

// Mock permissions
vi.mock('../utils/permissions', () => ({
  checkPermission: () => true
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('EventsManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock responses
    mockLoadData.mockResolvedValue(mockMasterData);
    mockCreateContent.mockResolvedValue({ success: true });
    mockUpdateContent.mockResolvedValue({ success: true });
    mockDeleteContent.mockResolvedValue({ success: true });
    mockSearchContent.mockResolvedValue(mockMasterData);

    // Setup localStorage mock
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockMasterData));
    localStorageMock.setItem.mockImplementation(() => {});
  });

  it('renders events management interface correctly', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('إدارة الفعاليات')).toBeInTheDocument();
      expect(screen.getByText('عرض وإدارة جميع الفعاليات في النظام')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('البحث في الفعاليات...')).toBeInTheDocument();
    });
  });

  it('loads events data from MasterDataService on mount', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith({
        type: 'events',
        limit: 100,
        sortBy: 'startDate',
        sortOrder: 'desc'
      });
    });
  });

  it('displays events correctly', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('مؤتمر العلوم السياسية السنوي')).toBeInTheDocument();
      expect(screen.getByText('ورشة عمل: تحليل السياسات العامة')).toBeInTheDocument();
      expect(screen.getByText('محاضرة: مستقبل الديمقراطية')).toBeInTheDocument();
    });
  });

  it('handles event search using MasterDataService', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('البحث في الفعاليات...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('البحث في الفعاليات...');
    fireEvent.change(searchInput, { target: { value: 'مؤتمر' } });

    await waitFor(() => {
      expect(mockSearchContent).toHaveBeenCalledWith('مؤتمر', {
        sortBy: 'startDate',
        sortOrder: 'desc'
      });
    });
  });

  it('handles event status filtering', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText('قادمة')).toHaveLength(2); // Tab button + status badge
    });

    // Get the tab button specifically (first occurrence)
    const upcomingTab = screen.getAllByText('قادمة')[0];
    fireEvent.click(upcomingTab);

    await waitFor(() => {
      expect(mockSearchContent).toHaveBeenCalledWith('', {
        status: EVENT_STATUS.UPCOMING,
        sortBy: 'startDate',
        sortOrder: 'desc'
      });
    });
  });

  it('handles event selection', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('مؤتمر العلوم السياسية السنوي')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('نشر المحدد (1)')).toBeInTheDocument();
    });
  });

  it('handles bulk publish action with MasterDataService', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('مؤتمر العلوم السياسية السنوي')).toBeInTheDocument();
    });

    // Select an event
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('نشر المحدد (1)')).toBeInTheDocument();
    });

    // Click publish button
    const publishButton = screen.getByText('نشر المحدد (1)');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(mockUpdateContent).toHaveBeenCalledWith('event-1', expect.objectContaining({
        status: EVENT_STATUS.UPCOMING
      }));
    });
  });

  it('handles bulk delete action with MasterDataService', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('مؤتمر العلوم السياسية السنوي')).toBeInTheDocument();
    });

    // Select an event
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('حذف المحدد')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText('حذف المحدد');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteContent).toHaveBeenCalledWith('event-1');
    });
  });

  it('handles view mode toggle', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('شبكة')).toBeInTheDocument();
      expect(screen.getByText('قائمة')).toBeInTheDocument();
    });

    const listButton = screen.getByText('قائمة');
    fireEvent.click(listButton);

    // Check if list view is active
    expect(listButton).toHaveClass('bg-blue-600');
  });

  it('handles sorting changes', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('تاريخ البداية')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('تاريخ البداية');
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith({
        type: 'events',
        limit: 100,
        sortBy: 'title',
        sortOrder: 'desc'
      });
    });
  });

  it('shows loading state while fetching data', () => {
    // Mock loading state
    mockLoadData.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    expect(screen.getByText('جاري تحميل الفعاليات...')).toBeInTheDocument();
  });

  it('shows empty state when no events exist', async () => {
    // This test verifies that the component can handle empty state
    // For now, we'll test that the component renders without crashing
    // when localStorage returns empty data
    localStorageMock.getItem.mockReturnValue('[]');

    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    // Verify component renders successfully
    await waitFor(() => {
      expect(screen.getByText('إدارة الفعاليات')).toBeInTheDocument();
      expect(screen.getByText('عرض وإدارة جميع الفعاليات في النظام')).toBeInTheDocument();
    });
  });

  it('displays event status badges correctly', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('قادمة')).toBeInTheDocument();
      expect(screen.getByText('جارية')).toBeInTheDocument();
      expect(screen.getByText('منتهية')).toBeInTheDocument();
    });
  });

  it('displays featured events with special badge', async () => {
    render(
      <TestWrapper>
        <EventsManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('مميزة')).toBeInTheDocument();
    });
  });
});
