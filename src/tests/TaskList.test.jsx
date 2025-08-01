// src/tests/TaskList.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskList from '../components/dashboard/TaskList';

// Mock useMasterData hook
const mockUseMasterData = vi.fn();
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => mockUseMasterData()
}));

describe('TaskList Component', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'مراجعة المقالات',
      description: 'مراجعة المقالات المقدمة للنشر',
      status: 'pending',
      dueDate: '2024-01-15T00:00:00Z',
      assignedTo: 'user1',
      assignedToName: 'أحمد محمد',
      priority: 'عالية',
      categoryId: 'cat1'
    },
    {
      id: '2',
      title: 'تحضير المؤتمر',
      description: 'تحضير فعاليات المؤتمر السنوي',
      status: 'in_progress',
      dueDate: '2024-02-01T00:00:00Z',
      assignedTo: 'user2',
      priority: 'متوسطة',
      categoryId: 'cat2'
    }
  ];

  const mockCategories = [
    { id: 'cat1', name: 'المحتوى' },
    { id: 'cat2', name: 'الفعاليات' }
  ];

  const mockGetContent = vi.fn();
  const mockUpdateContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseMasterData.mockReturnValue({
      data: {},
      loading: false,
      error: null,
      getContent: mockGetContent,
      updateContent: mockUpdateContent
    });

    // Mock successful API responses
    mockGetContent.mockImplementation(({ contentType }) => {
      switch (contentType) {
        case 'tasks':
          return Promise.resolve(mockTasks);
        case 'task-categories':
          return Promise.resolve(mockCategories);
        default:
          return Promise.resolve([]);
      }
    });
  });

  it('renders loading state correctly', () => {
    mockUseMasterData.mockReturnValue({
      data: {},
      loading: true,
      error: null,
      getContent: mockGetContent,
      updateContent: mockUpdateContent
    });

    render(<TaskList userId="1" userRole="admin" />);

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders tasks correctly for admin user', async () => {
    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText('قائمة المهام')).toBeInTheDocument();
      expect(screen.getByText('مراجعة المحتوى الجديد')).toBeInTheDocument();
      expect(screen.getByText('تحديث بيانات الأعضاء')).toBeInTheDocument();
      expect(screen.getByText('إضافة مهمة جديدة')).toBeInTheDocument();
    });
  });

  it('shows task details correctly', async () => {
    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText('مراجعة وتدقيق المحتوى المضاف حديثاً للموقع')).toBeInTheDocument();
      expect(screen.getByText('تحديث قاعدة بيانات الأعضاء وإضافة المعلومات الناقصة')).toBeInTheDocument();
      expect(screen.getByText('إعداد التقرير الشهري لأنشطة الجمعية')).toBeInTheDocument();
    });
  });

  it('shows correct task status colors', async () => {
    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      const pendingTask = screen.getByText('معلقة');
      const inProgressTask = screen.getByText('قيد التنفيذ');
      const completedTask = screen.getByText('مكتملة');

      expect(pendingTask).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(inProgressTask).toHaveClass('bg-blue-100', 'text-blue-800');
      expect(completedTask).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('shows management buttons for admin users', async () => {
    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getAllByText('حذف')).toHaveLength(3);
      expect(screen.getAllByText('إكمال')).toHaveLength(2);
      expect(screen.getByText('إعادة فتح')).toBeInTheDocument();
    });
  });

  it('hides management buttons for regular users', async () => {
    render(<TaskList userId="1" userRole="user" />);

    await waitFor(() => {
      expect(screen.queryByText('حذف')).not.toBeInTheDocument();
      expect(screen.queryByText('إكمال')).not.toBeInTheDocument();
      expect(screen.queryByText('إضافة مهمة جديدة')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no tasks', async () => {
    mockGetContent.mockImplementation(() => Promise.resolve({ data: [] }));

    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText('لا توجد مهام')).toBeInTheDocument();
      expect(screen.getByText('لم يتم تعيين أي مهام بعد')).toBeInTheDocument();
    });
  });

  it('shows different empty message for regular users', async () => {
    mockGetContent.mockImplementation(() => Promise.resolve({ data: [] }));

    render(<TaskList userId="1" userRole="user" />);

    await waitFor(() => {
      expect(screen.getByText('لا توجد مهام')).toBeInTheDocument();
      expect(screen.getByText('لم يتم تعيين أي مهام بعد')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockGetContent.mockImplementation(() => {
      throw new Error('خطأ في الشبكة');
    });

    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText('مهمة تجريبية')).toBeInTheDocument();
    });
  });

  it('fetches user-specific tasks for regular users', async () => {
    render(<TaskList userId="user1" userRole="user" />);

    await waitFor(() => {
      expect(mockGetContent).toHaveBeenCalledWith({
        contentType: 'tasks',
        filters: { assignedTo: 'user1' },
        limit: 20,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });
    });
  });

  it('fetches all tasks for admin users', async () => {
    render(<TaskList userId="1" userRole="admin" />);

    await waitFor(() => {
      expect(mockGetContent).toHaveBeenCalledWith({
        contentType: 'tasks',
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
    });
  });
});
