import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InquiryManagement from '../pages/dashboard/modules/InquiryManagement';

// Mock MasterDataService
const mockLoadData = vi.fn();
const mockUpdateContent = vi.fn();
const mockCreateContent = vi.fn();
const mockDeleteContent = vi.fn();
const mockSearchContent = vi.fn();

// Mock data for testing
const mockMasterData = [
  {
    id: 'inquiry-1',
    name: 'أحمد محمد',
    email: 'ahmed.m@example.com',
    subject: 'استفسار عن العضوية',
    message: 'أرغب في الاستفسار عن شروط وإجراءات الانضمام للجمعية وماهي المستندات المطلوبة للتقديم.',
    status: 'pending',
    date: '2023-11-15',
    priority: 'medium',
    category: 'membership',
    replies: [],
    contentType: 'inquiries',
    createdAt: '2023-11-15T00:00:00Z'
  },
  {
    id: 'inquiry-2',
    name: 'سارة الأحمدي',
    email: 'sara.a@example.com',
    subject: 'مشكلة في التسجيل',
    message: 'واجهت بعض المشكلات التقنية أثناء محاولة التسجيل في موقع الجمعية.',
    status: 'resolved',
    date: '2023-11-10',
    priority: 'high',
    category: 'technical',
    replies: [
      {
        id: 'reply-1',
        responder: 'مدير النظام',
        message: 'شكراً للتواصل معنا. يرجى تجربة استخدام متصفح آخر.',
        date: '2023-11-11'
      }
    ],
    contentType: 'inquiries',
    createdAt: '2023-11-10T00:00:00Z'
  },
  {
    id: 'inquiry-3',
    name: 'خالد العتيبي',
    email: 'khalid.o@example.com',
    subject: 'استفسار عن المؤتمر السنوي',
    message: 'متى سيقام المؤتمر السنوي لهذا العام؟',
    status: 'in-progress',
    date: '2023-11-12',
    priority: 'medium',
    category: 'events',
    replies: [
      {
        id: 'reply-2',
        responder: 'منسق الفعاليات',
        message: 'شكراً لاهتمامك بالمشاركة في المؤتمر.',
        date: '2023-11-13'
      }
    ],
    contentType: 'inquiries',
    createdAt: '2023-11-12T00:00:00Z'
  }
];

// Make functions return resolved promises
mockLoadData.mockResolvedValue(mockMasterData);
mockUpdateContent.mockResolvedValue({ success: true });
mockCreateContent.mockResolvedValue({ success: true });
mockDeleteContent.mockResolvedValue({ success: true });
mockSearchContent.mockResolvedValue(mockMasterData);

vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => ({
    data: mockMasterData,
    loading: false,
    error: null,
    loadData: mockLoadData,
    updateContent: mockUpdateContent,
    createContent: mockCreateContent,
    deleteContent: mockDeleteContent,
    searchContent: mockSearchContent
  })
}));

// Mock AuthContext
vi.mock('../contexts/index.jsx', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      name: 'مدير النظام',
      role: 'ADMIN',
      permissions: ['content.write', 'content.delete']
    }
  })
}));

// Mock permissions
vi.mock('../utils/permissions', () => ({
  checkPermission: () => true
}));



// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('InquiryManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock responses
    mockLoadData.mockResolvedValue(mockMasterData);
    mockUpdateContent.mockResolvedValue({ success: true });
    mockCreateContent.mockResolvedValue({ success: true });
    mockDeleteContent.mockResolvedValue({ success: true });
    mockSearchContent.mockResolvedValue(mockMasterData);

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders inquiry management interface correctly', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('إدارة الاستفسارات')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('البحث في الاستفسارات...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('جميع الاستفسارات')).toBeInTheDocument();
    });
  });

  it('loads inquiries data from MasterDataService on mount', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith({
        type: 'inquiries',
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });
  });

  it('displays inquiries correctly', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
      expect(screen.getByText('استفسار عن العضوية')).toBeInTheDocument();
      expect(screen.getByText('سارة الأحمدي')).toBeInTheDocument();
      expect(screen.getByText('مشكلة في التسجيل')).toBeInTheDocument();
      expect(screen.getByText('خالد العتيبي')).toBeInTheDocument();
      expect(screen.getByText('استفسار عن المؤتمر السنوي')).toBeInTheDocument();
    });
  });

  it('handles inquiry search using MasterDataService', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('البحث في الاستفسارات...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('البحث في الاستفسارات...');
    fireEvent.change(searchInput, { target: { value: 'أحمد' } });

    await waitFor(() => {
      expect(mockSearchContent).toHaveBeenCalledWith('أحمد', {});
    });
  });

  it('handles status filtering', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('جميع الاستفسارات')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('جميع الاستفسارات');
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(mockSearchContent).toHaveBeenCalledWith('', { status: 'pending' });
    });
  });

  it('opens inquiry detail modal when view button is clicked', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('عرض');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      // Use getAllByText for elements that appear multiple times
      const subjectElements = screen.getAllByText('استفسار عن العضوية');
      expect(subjectElements.length).toBeGreaterThan(0);
      expect(screen.getByText('أرغب في الاستفسار عن شروط وإجراءات الانضمام للجمعية وماهي المستندات المطلوبة للتقديم.')).toBeInTheDocument();
    });
  });

  it('handles marking inquiry as resolved with MasterDataService', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    });

    // Find all buttons and look for the resolve button specifically
    const allButtons = screen.getAllByRole('button');
    const resolveButton = allButtons.find(button =>
      button.textContent === 'تم الحل' &&
      button.className.includes('text-green-600')
    );

    expect(resolveButton).toBeDefined();

    // Click the resolve button
    fireEvent.click(resolveButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockUpdateContent).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify the call was made with correct parameters
    expect(mockUpdateContent).toHaveBeenCalledWith('inquiry-1', expect.objectContaining({
      status: 'resolved'
    }));
  });

  it('handles adding reply to inquiry with MasterDataService', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    });

    // Open inquiry detail modal
    const viewButtons = screen.getAllByText('عرض');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('اكتب ردك هنا...')).toBeInTheDocument();
    });

    // Add reply
    const replyTextarea = screen.getByPlaceholderText('اكتب ردك هنا...');
    fireEvent.change(replyTextarea, { target: { value: 'شكراً لتواصلك معنا' } });

    const sendButton = screen.getByText('إرسال الرد');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockUpdateContent).toHaveBeenCalledWith('inquiry-1', expect.objectContaining({
        status: 'in-progress',
        replies: expect.arrayContaining([
          expect.objectContaining({
            message: 'شكراً لتواصلك معنا'
          })
        ])
      }));
    });
  });

  it('shows loading state while fetching data', () => {
    // Mock loading state
    mockLoadData.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    // Look for loading spinner by its CSS classes
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows empty state when no inquiries exist', async () => {
    mockLoadData.mockResolvedValue([]);
    mockSearchContent.mockResolvedValue([]);

    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('لا توجد استفسارات')).toBeInTheDocument();
      expect(screen.getByText('لا توجد استفسارات تطابق معايير البحث الخاصة بك.')).toBeInTheDocument();
    });
  });

  it('displays inquiry status badges correctly', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('قيد الانتظار')).toBeInTheDocument();
      expect(screen.getByText('تم الحل')).toBeInTheDocument();
      expect(screen.getByText('قيد المعالجة')).toBeInTheDocument();
    });
  });

  it('displays inquiry priority badges correctly', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      // Use getAllByText for elements that appear multiple times
      const mediumPriority = screen.getAllByText('متوسطة');
      const highPriority = screen.getAllByText('عالية');
      expect(mediumPriority.length).toBeGreaterThan(0);
      expect(highPriority.length).toBeGreaterThan(0);
    });
  });

  it('shows inquiry count correctly', async () => {
    render(
      <TestWrapper>
        <InquiryManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('3 استفسار')).toBeInTheDocument();
    });
  });
});
