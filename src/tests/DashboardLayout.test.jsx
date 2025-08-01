// src/tests/DashboardLayout.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

// Mock the hooks
vi.mock('../hooks/useMasterData', () => ({
  useMasterData: vi.fn()
}));

vi.mock('../contexts/index.jsx', () => ({
  useAuth: vi.fn()
}));

// Import the mocked hooks
import { useMasterData } from '../hooks/useMasterData';
import { useAuth } from '../contexts/index.jsx';

// Wrapper component for router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    // Mock loading state
    useMasterData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      getContent: vi.fn()
    });

    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', role: 'user' }
    });

    render(
      <RouterWrapper>
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      </RouterWrapper>
    );
    
    expect(screen.getByText('جاري تحميل لوحة التحكم...')).toBeInTheDocument();
  });

  it('should render dashboard layout for regular user', async () => {
    const mockGetContent = vi.fn()
      .mockResolvedValueOnce([]) // Empty navigation config
      .mockResolvedValueOnce([]); // Empty user permissions

    // Mock successful state
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent
    });

    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', role: 'user' }
    });

    render(
      <RouterWrapper>
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      </RouterWrapper>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });

    // Check if basic navigation items are rendered
    expect(screen.getByText('الرئيسية')).toBeInTheDocument();
    expect(screen.getByText('الملف الشخصي')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Check welcome message
    expect(screen.getByText('مرحباً Test User')).toBeInTheDocument();
  });

  it('should render admin navigation for admin user', async () => {
    const mockGetContent = vi.fn()
      .mockResolvedValueOnce([]) // Empty navigation config
      .mockResolvedValueOnce([]); // Empty user permissions

    // Mock successful state
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent
    });

    useAuth.mockReturnValue({
      user: { id: 1, name: 'Admin User', role: 'admin' }
    });

    render(
      <RouterWrapper>
        <DashboardLayout>
          <div>Admin Content</div>
        </DashboardLayout>
      </RouterWrapper>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });

    // Check if admin navigation items are rendered
    expect(screen.getByText('الرئيسية')).toBeInTheDocument();
    expect(screen.getByText('الملف الشخصي')).toBeInTheDocument();
    expect(screen.getByText('إدارة المستخدمين')).toBeInTheDocument();
    expect(screen.getByText('إدارة المحتوى')).toBeInTheDocument();
    expect(screen.getByText('إدارة الفعاليات')).toBeInTheDocument();

    // Check welcome message
    expect(screen.getByText('مرحباً Admin User')).toBeInTheDocument();
  });

  it('should render staff navigation for staff user', async () => {
    const mockGetContent = vi.fn()
      .mockResolvedValueOnce([]) // Empty navigation config
      .mockResolvedValueOnce([]); // Empty user permissions

    // Mock successful state
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent
    });

    useAuth.mockReturnValue({
      user: { id: 1, name: 'Staff User', role: 'staff' }
    });

    render(
      <RouterWrapper>
        <DashboardLayout>
          <div>Staff Content</div>
        </DashboardLayout>
      </RouterWrapper>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });

    // Check if staff navigation items are rendered
    expect(screen.getByText('الرئيسية')).toBeInTheDocument();
    expect(screen.getByText('الملف الشخصي')).toBeInTheDocument();
    expect(screen.getByText('المهام')).toBeInTheDocument();
    expect(screen.getByText('الفعاليات')).toBeInTheDocument();

    // Check welcome message
    expect(screen.getByText('مرحباً Staff User')).toBeInTheDocument();
  });

  it('should use dynamic navigation from MasterDataService', async () => {
    const mockNavConfig = [
      { name: 'لوحة المراقبة', path: '/monitoring', icon: '📊', roles: ['admin'], order: 1 },
      { name: 'التقارير', path: '/reports', icon: '📈', roles: ['admin', 'staff'], order: 2 }
    ];

    const mockGetContent = vi.fn()
      .mockResolvedValueOnce(mockNavConfig) // Navigation config
      .mockResolvedValueOnce([]); // User permissions

    // Mock successful state
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent
    });

    useAuth.mockReturnValue({
      user: { id: 1, name: 'Admin User', role: 'admin' }
    });

    render(
      <RouterWrapper>
        <DashboardLayout>
          <div>Dynamic Content</div>
        </DashboardLayout>
      </RouterWrapper>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });

    // Check if dynamic navigation items are rendered
    expect(screen.getByText('لوحة المراقبة')).toBeInTheDocument();
    expect(screen.getByText('التقارير')).toBeInTheDocument();

    // Verify getContent was called for navigation config
    expect(mockGetContent).toHaveBeenCalledWith({
      contentType: 'navigation-config',
      limit: 50
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockGetContent = vi.fn().mockRejectedValue(new Error('API Error'));

    // Mock error in getContent
    useMasterData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      getContent: mockGetContent
    });

    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', role: 'user' }
    });

    render(
      <RouterWrapper>
        <DashboardLayout>
          <div>Error Content</div>
        </DashboardLayout>
      </RouterWrapper>
    );

    // Wait for the component to handle the error and show fallback navigation
    await waitFor(() => {
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });

    // Should still render basic navigation with fallback data
    expect(screen.getByText('الرئيسية')).toBeInTheDocument();
    expect(screen.getByText('الملف الشخصي')).toBeInTheDocument();
  });
});
