// src/tests/UserInfo.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserInfo from '../components/dashboard/UserInfo';

// Mock useMasterData hook
const mockUseMasterData = vi.fn();
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: () => mockUseMasterData()
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UserInfo Component', () => {
  const mockUser = {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    specialization: 'العلوم السياسية',
    bio: 'أستاذ في العلوم السياسية',
    joinDate: '2023-01-15T00:00:00Z'
  };

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
        case 'user-profiles':
          return Promise.resolve([{
            userId: '1',
            bio: 'أستاذ في العلوم السياسية',
            specialization: 'العلوم السياسية'
          }]);
        case 'posts':
          return Promise.resolve([
            { id: '1', authorId: '1', created_at: '2023-12-01T00:00:00Z' },
            { id: '2', authorId: '1', created_at: '2023-11-15T00:00:00Z' }
          ]);
        case 'comments':
          return Promise.resolve([
            { id: '1', userId: '1', created_at: '2023-12-05T00:00:00Z' }
          ]);
        case 'membership-history':
          return Promise.resolve([
            { userId: '1', created_at: '2023-01-15T00:00:00Z' }
          ]);
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

    render(
      <TestWrapper>
        <UserInfo user={{}} />
      </TestWrapper>
    );

    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders user information correctly', async () => {
    render(
      <TestWrapper>
        <UserInfo user={mockUser} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('معلومات الحساب')).toBeInTheDocument();
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
      expect(screen.getByText('ahmed@example.com')).toBeInTheDocument();
      expect(screen.getByText('+966501234567')).toBeInTheDocument();
      expect(screen.getByText('العلوم السياسية')).toBeInTheDocument();
    });
  });

  it('shows enhanced user statistics when expanded', async () => {
    render(
      <TestWrapper>
        <UserInfo user={mockUser} />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    });

    // Click to show more info
    const showMoreButton = screen.getByText('عرض المزيد من المعلومات');
    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(screen.getByText('2 منشور')).toBeInTheDocument();
      expect(screen.getByText('1 تعليق')).toBeInTheDocument();
      expect(screen.getByText('أستاذ في العلوم السياسية')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockGetContent.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <UserInfo user={mockUser} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    });

    // Should still show basic user info even with API errors
    expect(screen.getByText('ahmed@example.com')).toBeInTheDocument();
  });

  it('handles missing user data gracefully', () => {
    render(
      <TestWrapper>
        <UserInfo user={{}} />
      </TestWrapper>
    );

    expect(screen.getByText('معلومات الحساب')).toBeInTheDocument();
    expect(screen.getAllByText('غير محدد')).toHaveLength(4); // Name, email, phone, specialization
  });

  it('toggles additional information display', async () => {
    render(
      <TestWrapper>
        <UserInfo user={mockUser} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    });

    const toggleButton = screen.getByText('عرض المزيد من المعلومات');
    
    // Show more info
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('عرض معلومات أقل')).toBeInTheDocument();
    });

    // Hide info
    fireEvent.click(screen.getByText('عرض معلومات أقل'));
    expect(screen.getByText('عرض المزيد من المعلومات')).toBeInTheDocument();
  });
});
