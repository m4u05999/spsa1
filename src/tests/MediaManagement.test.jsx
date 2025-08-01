import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import MediaManagement from '../pages/dashboard/modules/MediaManagement.jsx';
import { checkPermission } from '../utils/permissions.js';

// Mock global alert
global.alert = vi.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

// Mock components to avoid import issues
vi.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: ({ className }) => <div data-testid="plus-icon" className={className}>+</div>,
  TrashIcon: ({ className }) => <div data-testid="trash-icon" className={className}>🗑</div>,
  DocumentIcon: ({ className }) => <div data-testid="document-icon" className={className}>📄</div>,
  PhotoIcon: ({ className }) => <div data-testid="photo-icon" className={className}>🖼</div>,
  VideoCameraIcon: ({ className }) => <div data-testid="video-icon" className={className}>🎥</div>
}));

// Mock hooks
const mockGetContent = vi.fn();
const mockCreateContent = vi.fn();
const mockUpdateContent = vi.fn();
const mockDeleteContent = vi.fn();

vi.mock('../hooks/useMasterData.js', () => ({
  useMasterData: vi.fn(() => ({
    data: [],
    loading: false,
    error: null,
    getContent: mockGetContent,
    createContent: mockCreateContent,
    updateContent: mockUpdateContent,
    deleteContent: mockDeleteContent
  }))
}));

vi.mock('../contexts/index.jsx.jsx', () => ({
  useAuth: vi.fn(() => ({
    user: { email: 'test@example.com', role: 'admin' }
  }))
}));

// Mock permissions utility
vi.mock('../utils/permissions.js', () => ({
  checkPermission: vi.fn(() => true)
}));

describe('MediaManagement Component', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    checkPermission.mockReturnValue(true);
    vi.clearAllMocks();
    global.alert.mockClear();
    
    // Default mock responses
    mockGetContent.mockResolvedValue([
      {
        id: 1,
        title: 'test-image.jpg',
        content: {
          name: 'test-image.jpg',
          type: 'image',
          url: '/test-image.jpg',
          size: '2.4 ميجابايت'
        },
        created_at: '2024-03-10T10:00:00Z',
        metadata: {}
      }
    ]);
    mockCreateContent.mockResolvedValue({ id: 2, success: true });
    mockDeleteContent.mockResolvedValue({ success: true });
  });

  test('renders media management interface correctly', async () => {
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('إدارة الوسائط')).toBeInTheDocument();
    });
    
    expect(screen.getByText('إدارة الصور والفيديوهات والمستندات')).toBeInTheDocument();
    expect(screen.getByText('رفع ملفات')).toBeInTheDocument();
    expect(screen.getByDisplayValue('جميع الملفات')).toBeInTheDocument();
  });

  test('loads media files from MasterDataService on mount', async () => {
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(mockGetContent).toHaveBeenCalledWith({
        contentType: 'media_file',
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
    });
  });

  test('displays loaded media files correctly', async () => {
    render(<MediaManagement />);

    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });

    expect(screen.getByText(/2\.4 ميجابايت/)).toBeInTheDocument();
    expect(screen.getByText(/صورة/)).toBeInTheDocument();
    expect(screen.getAllByText('عرض')[0]).toBeInTheDocument();
    expect(screen.getAllByText('حذف')[0]).toBeInTheDocument();
  });

  test('handles filter type changes correctly', async () => {
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('جميع الملفات')).toBeInTheDocument();
    });
    
    const filterSelect = screen.getByDisplayValue('جميع الملفات');
    fireEvent.change(filterSelect, { target: { value: 'image' } });
    
    expect(filterSelect.value).toBe('image');
  });

  test('opens upload modal when upload button clicked', async () => {
    // Mock permissions to allow upload
    checkPermission.mockImplementation((user, resource, action) => {
      if (action === 'create' || action === 'manage') return true;
      return false;
    });

    render(<MediaManagement />);

    await waitFor(() => {
      expect(screen.getByText('رفع ملفات')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('رفع ملفات');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('رفع ملفات جديدة')).toBeInTheDocument();
    });

    expect(screen.getByText('اختر الملفات للرفع')).toBeInTheDocument();
    expect(screen.getByText('اختر ملفات')).toBeInTheDocument();
  });

  test('handles file upload successfully', async () => {
    // Mock permissions to allow upload
    checkPermission.mockImplementation((user, resource, action) => {
      if (action === 'create' || action === 'manage') return true;
      return false;
    });

    render(<MediaManagement />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('إدارة الوسائط')).toBeInTheDocument();
    });

    // Open upload modal
    const uploadButton = screen.getByText('رفع ملفات');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('رفع ملفات جديدة')).toBeInTheDocument();
    });

    // Mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('اختر ملفات');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockCreateContent).toHaveBeenCalled();
    });
  });

  test('handles file selection for deletion', async () => {
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/حذف المحدد \(1\)/)).toBeInTheDocument();
    });
  });

  test('handles file deletion successfully', async () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByText('حذف');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteContent).toHaveBeenCalledWith(1);
    });
    
    window.confirm.mockRestore();
  });

  test('shows loading state while fetching data', async () => {
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });
    
    render(<MediaManagement />);
    
    expect(screen.getByText('جاري تحميل الملفات...')).toBeInTheDocument();
  });

  test('handles MasterDataService errors gracefully', async () => {
    const { useMasterData } = await import('../hooks/useMasterData.js');
    vi.mocked(useMasterData).mockReturnValue({
      data: [],
      loading: false,
      error: { message: 'Connection failed' },
      getContent: mockGetContent,
      createContent: mockCreateContent,
      updateContent: mockUpdateContent,
      deleteContent: mockDeleteContent
    });
    
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('خطأ في تحميل البيانات: Connection failed')).toBeInTheDocument();
    });
  });

  test('handles permission denied correctly', async () => {
    // Set NODE_ENV to production to enable permission check
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    checkPermission.mockReturnValue(false);

    render(<MediaManagement />);

    expect(screen.getByText('ليس لديك صلاحية للوصول إلى إدارة الوسائط')).toBeInTheDocument();

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  test('shows empty state when no files exist', async () => {
    mockGetContent.mockResolvedValue([]);

    // Mock permissions to allow upload
    checkPermission.mockImplementation((user, resource, action) => {
      if (action === 'create' || action === 'manage') return true;
      return false;
    });

    render(<MediaManagement />);

    await waitFor(() => {
      expect(screen.getByText('لا توجد ملفات')).toBeInTheDocument();
    });

    expect(screen.getByText('لم يتم رفع أي ملفات بعد')).toBeInTheDocument();
    expect(screen.getByText('رفع أول ملف')).toBeInTheDocument();
  });

  test('displays file type icons correctly', async () => {
    mockGetContent.mockResolvedValue([
      {
        id: 1,
        title: 'image.jpg',
        content: { name: 'image.jpg', type: 'image', url: '/image.jpg', size: '1MB' },
        created_at: '2024-03-10T10:00:00Z',
        metadata: {}
      },
      {
        id: 2,
        title: 'video.mp4',
        content: { name: 'video.mp4', type: 'video', url: '/video.mp4', size: '5MB' },
        created_at: '2024-03-10T10:00:00Z',
        metadata: {}
      },
      {
        id: 3,
        title: 'document.pdf',
        content: { name: 'document.pdf', type: 'document', url: '/document.pdf', size: '2MB' },
        created_at: '2024-03-10T10:00:00Z',
        metadata: {}
      }
    ]);
    
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByTestId('photo-icon')).toBeInTheDocument();
      expect(screen.getByTestId('video-icon')).toBeInTheDocument();
      expect(screen.getByTestId('document-icon')).toBeInTheDocument();
    });
  });

  test('shows statistics correctly', async () => {
    mockGetContent.mockResolvedValue([
      {
        id: 1,
        title: 'image.jpg',
        content: { name: 'image.jpg', type: 'image', url: '/image.jpg', size: '1MB' },
        created_at: '2024-03-10T10:00:00Z',
        metadata: {}
      },
      {
        id: 2,
        title: 'video.mp4',
        content: { name: 'video.mp4', type: 'video', url: '/video.mp4', size: '5MB' },
        created_at: '2024-03-10T10:00:00Z',
        metadata: {}
      }
    ]);

    render(<MediaManagement />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total files
      expect(screen.getByText('إجمالي الملفات')).toBeInTheDocument();

      // Check statistics section specifically using data-testid or more specific selectors
      const statisticsGrid = document.querySelector('.mt-6.bg-gray-50 .grid');
      expect(statisticsGrid).toBeTruthy();

      // Check for statistics values - use getAllByText for multiple occurrences
      const onesElements = screen.getAllByText('1');
      expect(onesElements).toHaveLength(2); // Should have 2 elements with "1" (images and videos)

      // Check for specific statistics labels - use more specific selectors
      const statisticsSection = document.querySelector('.mt-6.bg-gray-50');
      expect(statisticsSection).toBeTruthy();

      // Check that statistics section contains the labels
      expect(statisticsSection.textContent).toContain('الصور');
      expect(statisticsSection.textContent).toContain('الفيديوهات');
    });
  });

  test('shows data source and last update information', async () => {
    render(<MediaManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/مصدر البيانات: MasterDataService/)).toBeInTheDocument();
    });
  });
});
