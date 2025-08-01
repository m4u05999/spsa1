// src/tests/DashboardStats.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardStats from '../components/dashboard/DashboardStats';

// Mock the useMasterData hook
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: vi.fn()
}));

// Import the mocked hook
import { useMasterData } from '../hooks/useMasterData';

describe('DashboardStats Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    // Mock loading state
    useMasterData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      getContent: vi.fn(),
      searchContent: vi.fn()
    });

    render(<DashboardStats />);
    
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    // Mock error state
    useMasterData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      getContent: vi.fn(),
      searchContent: vi.fn()
    });

    render(<DashboardStats />);
    
    expect(screen.getByText(/خطأ في تحميل البيانات/)).toBeInTheDocument();
  });

  it('should render dashboard statistics successfully', async () => {
    const mockGetContent = vi.fn()
      .mockResolvedValueOnce([
        { id: 1, name: 'User 1', created_at: '2024-01-01' },
        { id: 2, name: 'User 2', created_at: '2024-01-15' }
      ])
      .mockResolvedValueOnce([
        { id: 1, level: 'gold', status: 'active' },
        { id: 2, level: 'silver', status: 'active' }
      ])
      .mockResolvedValueOnce([
        { id: 1, amount: '1000', created_at: '2024-01-01' },
        { id: 2, amount: '500', created_at: '2024-01-15' }
      ]);

    // Mock successful state
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    render(<DashboardStats />);

    // Wait for the component to load and process data
    await waitFor(() => {
      expect(screen.getByText('إجمالي الأعضاء')).toBeInTheDocument();
    });

    // Check if stat cards are rendered
    expect(screen.getByText('الأعضاء النشطين')).toBeInTheDocument();
    expect(screen.getByText('العضويات الجديدة')).toBeInTheDocument();
    expect(screen.getByText('إجمالي الإيرادات')).toBeInTheDocument();

    // Verify getContent was called for different data types
    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'users',
      limit: 1000,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'memberships',
      limit: 1000
    });

    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'payments',
      limit: 1000,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  });

  it('should use fallback data when API calls fail', async () => {
    const mockGetContent = vi.fn().mockRejectedValue(new Error('API Error'));

    // Mock error in getContent
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    render(<DashboardStats />);

    // Wait for the component to handle the error and show fallback data
    await waitFor(() => {
      expect(screen.getByText('إجمالي الأعضاء')).toBeInTheDocument();
    });

    // Should still render the stat cards with fallback data
    expect(screen.getByText('الأعضاء النشطين')).toBeInTheDocument();
    expect(screen.getByText('العضويات الجديدة')).toBeInTheDocument();
    expect(screen.getByText('إجمالي الإيرادات')).toBeInTheDocument();
  });
});
