// src/tests/Statistics.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Statistics from '../pages/dashboard/modules/Statistics';

// Mock MasterDataService
const mockLoadData = vi.fn();
const mockSearchContent = vi.fn();

// Mock data structure for statistics
const mockMasterData = {
  users: [
    { id: '1', name: 'أحمد محمد', status: 'active', createdAt: '2024-06-01' },
    { id: '2', name: 'فاطمة أحمد', status: 'active', createdAt: '2024-07-01' },
    { id: '3', name: 'محمد علي', status: 'inactive', createdAt: '2024-05-01' }
  ],
  articles: [
    { id: '1', title: 'مقال تجريبي 1', type: 'article', likes: 25, shares: 10 },
    { id: '2', title: 'مقال تجريبي 2', type: 'article', likes: 15, shares: 5 }
  ],
  news: [
    { id: '1', title: 'خبر تجريبي 1', type: 'news', likes: 30, shares: 12 },
    { id: '2', title: 'خبر تجريبي 2', type: 'news', likes: 20, shares: 8 }
  ],
  events: [
    { id: '1', title: 'فعالية قادمة', startDate: '2024-12-01', participantsCount: 50 },
    { id: '2', title: 'فعالية سابقة', startDate: '2024-06-01', participantsCount: 30 }
  ],
  memberships: [
    { id: '1', applicantName: 'طالب عضوية 1', status: 'approved' },
    { id: '2', applicantName: 'طالب عضوية 2', status: 'pending' },
    { id: '3', applicantName: 'طالب عضوية 3', status: 'rejected' }
  ]
};

vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => ({
    data: mockMasterData,
    loading: false,
    error: null,
    loadData: mockLoadData,
    searchContent: mockSearchContent
  })
}));

// Mock AuthContext
const mockUser = {
  id: '1',
  name: 'Test Admin',
  role: 'admin',
  permissions: ['statistics:read']
};

vi.mock('../contexts/index.jsx', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true
  })
}));

// Mock permissions
vi.mock('../utils/permissions', () => ({
  checkPermission: vi.fn(() => true)
}));

// Mock Recharts components to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}));

// Test data (now moved to mockMasterData above)

describe('Statistics Component', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default permissions (allow access)
    const { checkPermission } = await import('../utils/permissions');
    vi.mocked(checkPermission).mockReturnValue(true);

    // Setup default mock responses for loadData
    mockLoadData.mockImplementation(({ type }) => {
      switch (type) {
        case 'users': return Promise.resolve(mockMasterData.users);
        case 'articles': return Promise.resolve(mockMasterData.articles);
        case 'news': return Promise.resolve(mockMasterData.news);
        case 'research': return Promise.resolve([]);
        case 'events': return Promise.resolve(mockMasterData.events);
        case 'memberships': return Promise.resolve(mockMasterData.memberships);
        case 'inquiries': return Promise.resolve([]);
        default: return Promise.resolve([]);
      }
    });
  });

  it('renders statistics interface correctly', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('الإحصائيات والتحليلات')).toBeInTheDocument();
    });
    
    // Check for main statistics cards
    expect(screen.getByText('المستخدمين')).toBeInTheDocument();
    expect(screen.getByText('المحتوى')).toBeInTheDocument();
    expect(screen.getByText('الفعاليات')).toBeInTheDocument();
  });

  it('loads statistics data from MasterDataService on mount', async () => {
    render(<Statistics />);

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith({ type: 'users', limit: 1000 });
      expect(mockLoadData).toHaveBeenCalledWith({ type: 'articles', limit: 1000 });
      expect(mockLoadData).toHaveBeenCalledWith({ type: 'news', limit: 1000 });
      expect(mockLoadData).toHaveBeenCalledWith({ type: 'events', limit: 1000 });
      expect(mockLoadData).toHaveBeenCalledWith({ type: 'memberships', limit: 1000 });
    });
  });

  it('displays calculated statistics correctly', async () => {
    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('الإحصائيات والتحليلات')).toBeInTheDocument();
    });

    // User statistics (3 total users) - use getAllByText since number appears multiple times
    const userStats = screen.getAllByText('3');
    expect(userStats.length).toBeGreaterThan(0);

    // Content statistics (2 articles + 2 news = 4 total content)
    // Use getAllByText for non-unique text content
    const contentStats = screen.getAllByText('4');
    expect(contentStats.length).toBeGreaterThan(0);

    // Event statistics (2 total events)
    const eventStats = screen.getAllByText('2');
    expect(eventStats.length).toBeGreaterThan(0);
  });

  it('handles time filter changes', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('الإحصائيات والتحليلات')).toBeInTheDocument();
    });
    
    // Test daily filter
    const dailyButton = screen.getByText('يومي');
    fireEvent.click(dailyButton);
    expect(dailyButton).toHaveClass('bg-blue-50', 'text-blue-700');
    
    // Test weekly filter
    const weeklyButton = screen.getByText('أسبوعي');
    fireEvent.click(weeklyButton);
    expect(weeklyButton).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('toggles detailed stats view', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('الإحصائيات والتحليلات')).toBeInTheDocument();
    });
    
    const toggleButton = screen.getByText('عرض تفصيلي');
    fireEvent.click(toggleButton);
    
    // Should show detailed charts
    await waitFor(() => {
      expect(screen.getByText('عرض موجز')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    // Mock loading state
    mockLoadData.mockImplementation(() => new Promise(() => {}));

    render(<Statistics />);

    expect(screen.getByText('جاري تحميل الإحصائيات...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles MasterDataService errors gracefully', async () => {
    // Clear localStorage to ensure fallback data is used
    localStorage.clear();

    // Mock error
    mockLoadData.mockRejectedValue(new Error('Service error'));

    render(<Statistics />);

    await waitFor(() => {
      // Should show fallback data
      expect(screen.getByText('150')).toBeInTheDocument(); // Fallback user count
      expect(screen.getByText('البيانات الاحتياطية')).toBeInTheDocument();
    });
  });

  it('displays membership applications correctly', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('طلبات العضوية')).toBeInTheDocument();
      expect(screen.getByText('إجمالي الطلبات')).toBeInTheDocument();
      
      // Check membership stats (1 approved, 1 pending, 1 rejected)
      expect(screen.getByText('مقبولة')).toBeInTheDocument();
      expect(screen.getByText('قيد المراجعة')).toBeInTheDocument();
      expect(screen.getByText('مرفوضة')).toBeInTheDocument();
    });
  });

  it('shows engagement statistics', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('التفاعل')).toBeInTheDocument();
      expect(screen.getByText('التعليقات')).toBeInTheDocument();
      expect(screen.getByText('الإعجابات')).toBeInTheDocument();
      expect(screen.getByText('المشاركات')).toBeInTheDocument();
    });
  });

  it('displays traffic statistics', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('حركة الزوار')).toBeInTheDocument();
      expect(screen.getByText('اليومي')).toBeInTheDocument();
      expect(screen.getByText('الأسبوعي')).toBeInTheDocument();
    });
  });

  it('shows data source indicator', async () => {
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('البيانات من MasterDataService')).toBeInTheDocument();
    });
  });

  it('handles permission denied correctly', async () => {
    // Mock permission check to return false
    const { checkPermission } = await import('../utils/permissions');
    vi.mocked(checkPermission).mockReturnValue(false);
    
    render(<Statistics />);
    
    expect(screen.getByText('غير مصرح لك بعرض الإحصائيات')).toBeInTheDocument();
    expect(screen.getByText('يرجى التواصل مع المدير للحصول على الصلاحيات المطلوبة.')).toBeInTheDocument();
  });

  it('shows detailed charts when enabled', async () => {
    // Ensure permissions are granted for this test
    const { checkPermission } = await import('../utils/permissions');
    vi.mocked(checkPermission).mockReturnValue(true);

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('الإحصائيات والتحليلات')).toBeInTheDocument();
    });

    // Enable detailed view
    const toggleButton = screen.getByText('عرض تفصيلي');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      // Should show chart components
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(2);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('calculates growth rates correctly', async () => {
    // Ensure permissions are granted for this test
    const { checkPermission } = await import('../utils/permissions');
    vi.mocked(checkPermission).mockReturnValue(true);

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('الإحصائيات والتحليلات')).toBeInTheDocument();
    });

    // Should calculate growth rate based on new users vs total users
    // Look for percentage text (0% in our test data) - use getAllByText for multiple matches
    expect(screen.getByText('0')).toBeInTheDocument();
    const percentageElements = screen.getAllByText(/0\s*%/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });
});
