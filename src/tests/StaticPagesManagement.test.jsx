import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StaticPagesManagement from '../pages/dashboard/modules/StaticPagesManagement';

// Simplified mocks to avoid hoisting issues
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => ({
    data: [],
    loading: false,
    error: null,
    loadData: vi.fn().mockResolvedValue([]),
    createContent: vi.fn().mockResolvedValue({ success: true }),
    updateContent: vi.fn().mockResolvedValue({ success: true }),
    deleteContent: vi.fn().mockResolvedValue({ success: true })
  })
}));

vi.mock('../contexts/index.jsx', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', role: 'admin' },
    loading: false
  })
}));

vi.mock('../utils/permissions', () => ({
  checkPermission: () => true
}));

// Mock NotificationContext
vi.mock('../contexts/index.jsx', () => ({
  useNotification: () => ({
    showNotification: vi.fn()
  })
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div data-testid="plus-icon">Plus</div>,
  PencilIcon: () => <div data-testid="pencil-icon">Pencil</div>,
  TrashIcon: () => <div data-testid="trash-icon">Trash</div>,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon">Warning</div>
}));

// Mock Headless UI Switch
vi.mock('@headlessui/react', () => ({
  Switch: ({ checked, onChange, children, className, disabled }) => (
    <button
      data-testid="switch"
      className={className}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      {children}
    </button>
  )
}));

describe('StaticPagesManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component title correctly', async () => {
    render(<StaticPagesManagement />);

    // Wait for loading to complete and empty state to appear
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('إدارة الصفحات الثابتة')).toBeInTheDocument();
  });

  it('shows empty state when no pages exist', async () => {
    render(<StaticPagesManagement />);
    
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('لا توجد صفحات ثابتة')).toBeInTheDocument();
    });
  });

  it('displays create button in header', async () => {
    render(<StaticPagesManagement />);

    // Wait for loading to complete and empty state to appear
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    const createButtons = screen.getAllByRole('button', { name: /إنشاء صفحة جديدة/i });
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it('displays create button in empty state', async () => {
    render(<StaticPagesManagement />);
    
    await waitFor(() => {
      const createButtons = screen.getAllByRole('button', { name: /إنشاء صفحة جديدة/i });
      expect(createButtons.length).toBeGreaterThanOrEqual(2); // Header + Empty state
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<StaticPagesManagement />);
    expect(container).toBeInTheDocument();
  });
});
