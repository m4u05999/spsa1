// src/tests/utils/TestWrapper.jsx
/**
 * Test wrapper component with all necessary providers
 * مكون التغليف للاختبارات مع جميع المزودين المطلوبين
 */

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/index.jsx';
import { vi } from 'vitest';

// Mock user data for tests
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  membershipStatus: 'active',
};

// Mock auth context value
const mockAuthContextValue = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  isInitialized: true,
  login: vi.fn().mockResolvedValue({ success: true, user: mockUser }),
  logout: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true, user: mockUser }),
  updateUser: vi.fn().mockResolvedValue({ success: true, user: mockUser }),
  checkAuthStatus: vi.fn().mockResolvedValue(true),
  refreshToken: vi.fn().mockResolvedValue(true),
};

// Mock AuthProvider for tests
const MockAuthProvider = ({ children, value = mockAuthContextValue }) => {
  // Create a mock context that bypasses the loading screen
  const AuthContext = React.createContext(value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Test wrapper with all providers
 * مكون التغليف مع جميع المزودين
 */
export const TestWrapper = ({ 
  children, 
  initialEntries = ['/'], 
  authValue = mockAuthContextValue,
  withRouter = true,
  withAuth = true 
}) => {
  let wrappedChildren = children;

  // Wrap with AuthProvider if needed
  if (withAuth) {
    wrappedChildren = (
      <MockAuthProvider value={authValue}>
        {wrappedChildren}
      </MockAuthProvider>
    );
  }

  // Wrap with Router if needed
  if (withRouter) {
    wrappedChildren = (
      <MemoryRouter initialEntries={initialEntries}>
        {wrappedChildren}
      </MemoryRouter>
    );
  }

  return wrappedChildren;
};

/**
 * Test wrapper for components that need authentication
 * مكون التغليف للمكونات التي تحتاج المصادقة
 */
export const AuthenticatedTestWrapper = ({ children, user = mockUser, ...props }) => {
  const authValue = {
    ...mockAuthContextValue,
    user,
    isAuthenticated: !!user,
  };

  return (
    <TestWrapper authValue={authValue} {...props}>
      {children}
    </TestWrapper>
  );
};

/**
 * Test wrapper for unauthenticated state
 * مكون التغليف للحالة غير المصادقة
 */
export const UnauthenticatedTestWrapper = ({ children, ...props }) => {
  const authValue = {
    ...mockAuthContextValue,
    user: null,
    isAuthenticated: false,
  };

  return (
    <TestWrapper authValue={authValue} {...props}>
      {children}
    </TestWrapper>
  );
};

/**
 * Test wrapper for loading state
 * مكون التغليف لحالة التحميل
 */
export const LoadingTestWrapper = ({ children, ...props }) => {
  const authValue = {
    ...mockAuthContextValue,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };

  return (
    <TestWrapper authValue={authValue} {...props}>
      {children}
    </TestWrapper>
  );
};

/**
 * Mock auth functions for testing
 * دوال المصادقة المحاكاة للاختبار
 */
export const mockAuthFunctions = {
  login: vi.fn().mockResolvedValue({ success: true, user: mockUser }),
  logout: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true, user: mockUser }),
  updateUser: vi.fn().mockResolvedValue({ success: true, user: mockUser }),
  checkAuthStatus: vi.fn().mockResolvedValue(true),
  refreshToken: vi.fn().mockResolvedValue(true),
};

/**
 * Reset all auth mocks
 * إعادة تعيين جميع محاكيات المصادقة
 */
export const resetAuthMocks = () => {
  Object.values(mockAuthFunctions).forEach(mockFn => {
    if (mockFn.mockReset) {
      mockFn.mockReset();
    }
  });
};

/**
 * Create custom auth context value
 * إنشاء قيمة سياق مصادقة مخصصة
 */
export const createMockAuthValue = (overrides = {}) => {
  return {
    ...mockAuthContextValue,
    ...overrides,
  };
};

export default TestWrapper;
