// src/tests/MembershipStats.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MembershipStats from '../components/dashboard/MembershipStats';

// Mock the useMasterData hook
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: vi.fn()
}));

// Import the mocked hook
import { useMasterData } from '../hooks/useMasterData';

describe('MembershipStats Component', () => {
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

    render(<MembershipStats />);
    
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

    render(<MembershipStats />);
    
    expect(screen.getByText(/خطأ في تحميل البيانات/)).toBeInTheDocument();
  });

  it('should render membership statistics successfully', async () => {
    const mockGetContent = vi.fn()
      .mockResolvedValueOnce([
        { id: 1, level: 'platinum', status: 'active' },
        { id: 2, level: 'gold', status: 'active' },
        { id: 3, level: 'silver', status: 'inactive' },
        { id: 4, level: 'bronze', status: 'active' }
      ])
      .mockResolvedValueOnce([
        { id: 1, name: 'User 1', created_at: '2024-01-01' },
        { id: 2, name: 'User 2', created_at: '2024-01-15' },
        { id: 3, name: 'User 3', created_at: '2024-01-20' },
        { id: 4, name: 'User 4', created_at: '2024-01-25' }
      ]);

    // Mock successful state
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    render(<MembershipStats />);

    // Wait for the component to load and process data
    await waitFor(() => {
      expect(screen.getByText('حالة العضوية')).toBeInTheDocument();
    });

    // Check if membership levels are rendered
    expect(screen.getByText('عضوية بلاتينية')).toBeInTheDocument();
    expect(screen.getByText('عضوية ذهبية')).toBeInTheDocument();
    expect(screen.getByText('عضوية فضية')).toBeInTheDocument();
    expect(screen.getByText('عضوية برونزية')).toBeInTheDocument();

    // Check active/inactive chart
    expect(screen.getByText('نشط')).toBeInTheDocument();
    expect(screen.getByText('غير نشط')).toBeInTheDocument();

    // Verify getContent was called for membership and users data
    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'memberships',
      limit: 1000
    });

    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'users',
      limit: 1000
    });
  });

  it('should use fallback data when no membership data available', async () => {
    const mockGetContent = vi.fn()
      .mockResolvedValueOnce([]) // Empty membership data
      .mockResolvedValueOnce([]); // Empty users data

    // Mock successful state but with empty data
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    render(<MembershipStats />);

    // Wait for the component to load and use fallback data
    await waitFor(() => {
      expect(screen.getByText('حالة العضوية')).toBeInTheDocument();
    });

    // Should still render membership levels with fallback data
    expect(screen.getByText('عضوية بلاتينية')).toBeInTheDocument();
    expect(screen.getByText('عضوية ذهبية')).toBeInTheDocument();
    expect(screen.getByText('عضوية فضية')).toBeInTheDocument();
    expect(screen.getByText('عضوية برونزية')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const mockGetContent = vi.fn().mockRejectedValue(new Error('API Error'));

    // Mock error in getContent
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent,
      searchContent: vi.fn()
    });

    render(<MembershipStats />);

    // Wait for the component to handle the error and show fallback data
    await waitFor(() => {
      expect(screen.getByText('حالة العضوية')).toBeInTheDocument();
    });

    // Should still render the membership stats with fallback data
    expect(screen.getByText('عضوية بلاتينية')).toBeInTheDocument();
    expect(screen.getByText('عضوية ذهبية')).toBeInTheDocument();
    expect(screen.getByText('عضوية فضية')).toBeInTheDocument();
    expect(screen.getByText('عضوية برونزية')).toBeInTheDocument();
  });
});
