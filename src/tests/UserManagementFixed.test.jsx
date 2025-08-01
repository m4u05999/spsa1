/**
 * اختبارات مكون إدارة المستخدمين المهاجر
 * UserManagementFixed Component Tests
 *
 * @description اختبارات شاملة لمكون إدارة المستخدمين بعد الهجرة إلى MasterDataService
 * @author SPSA Development Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Simplified mocks to avoid hoisting issues
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => ({
    data: [],
    loading: false,
    error: null,
    loadData: vi.fn().mockResolvedValue([]),
    createContent: vi.fn().mockResolvedValue({ success: true }),
    updateContent: vi.fn().mockResolvedValue({ success: true }),
    deleteContent: vi.fn().mockResolvedValue({ success: true }),
    searchContent: vi.fn().mockResolvedValue([])
  })
}));

// Import the actual component
import UserManagementFixed from '../pages/dashboard/modules/UserManagementFixed.jsx';

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

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
Object.defineProperty(console, 'log', { value: consoleMock.log });
Object.defineProperty(console, 'warn', { value: consoleMock.warn });
Object.defineProperty(console, 'error', { value: consoleMock.error });



// Mock alert
global.alert = vi.fn();

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UserManagementFixed Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    // انتظار تحميل المكون
    await waitFor(() => {
      expect(screen.getByText('إدارة المستخدمين')).toBeInTheDocument();
    });
  });

  it('renders component title correctly', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('إدارة المستخدمين')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );
    // البحث عن spinner باستخدام class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('displays search input field', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('ابحث عن مستخدم...');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays role filter dropdown', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    const roleFilter = screen.getByDisplayValue('جميع الأدوار');
    expect(roleFilter).toBeInTheDocument();
  });

  it('displays status filter dropdown', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('جميع الحالات');
    expect(statusFilter).toBeInTheDocument();
  });

  it('displays add user button', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /إضافة مستخدم جديد/i });
    expect(addButton).toBeInTheDocument();
  });

  it('shows empty state when no users exist', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('لا توجد مستخدمين في النظام')).toBeInTheDocument();
  });

  it('opens add user modal when add button is clicked', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('جاري التحميل...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /إضافة مستخدم جديد/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'إضافة مستخدم جديد' })).toBeInTheDocument();
    });
  });

  it('logs MasterDataService integration messages', async () => {
    render(
      <TestWrapper>
        <UserManagementFixed />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('🔄 جاري تحميل بيانات المستخدمين من MasterDataService')
      );
    });
  });
});
