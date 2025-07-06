/**
 * Vitest Setup File for SPSA Project
 * ملف إعداد Vitest لمشروع الجمعية السعودية للعلوم السياسية
 *
 * @description إعداد البيئة والـ mocks المطلوبة للاختبارات
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => Object.keys(store)[index] || null)
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();

// Set up global mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    url: '',
    redirected: false,
    statusText: 'OK',
    type: 'basic'
  })
);

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

// Mock console methods for cleaner test output
const originalConsole = { ...console };

global.console = {
  ...console,
  // Keep error and warn for debugging
  error: jest.fn(),
  warn: jest.fn(),
  // Mock info and log to reduce noise
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn()
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_ENABLE_USER_MANAGEMENT_API = 'true';

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  }
});

// Mock URL constructor
global.URL = class URL {
  constructor(url, base) {
    this.href = url;
    this.origin = base || 'http://localhost:5173';
    this.protocol = 'http:';
    this.host = 'localhost:5173';
    this.hostname = 'localhost';
    this.port = '5173';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }
};

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    })
  }
});

// Mock Date for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

// Setup and teardown helpers
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset fetch mock
  fetch.mockClear();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed.mohammed@example.com',
    role: 'member',
    status: 'active',
    membershipType: 'regular',
    phone: '+966501234567',
    specialization: 'علوم سياسية',
    workplace: 'جامعة الملك سعود',
    academicDegree: 'ماجستير',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create multiple mock users
  createMockUsers: (count = 3) => {
    return Array.from({ length: count }, (_, index) => 
      global.testUtils.createMockUser({
        id: `test-user-${index + 1}`,
        firstName: `مستخدم${index + 1}`,
        email: `user${index + 1}@example.com`
      })
    );
  },

  // Helper to wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to simulate localStorage quota exceeded
  simulateStorageQuotaExceeded: () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
  },

  // Helper to simulate network error
  simulateNetworkError: () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
  },

  // Helper to restore original console
  restoreConsole: () => {
    global.console = originalConsole;
  }
};

// Custom matchers
expect.extend({
  toBeValidUser(received) {
    const requiredFields = ['id', 'firstName', 'lastName', 'email', 'role', 'status'];
    const missingFields = requiredFields.filter(field => !received[field]);
    
    if (missingFields.length > 0) {
      return {
        message: () => `المستخدم يفتقد للحقول المطلوبة: ${missingFields.join(', ')}`,
        pass: false
      };
    }

    return {
      message: () => `المستخدم صالح ويحتوي على جميع الحقول المطلوبة`,
      pass: true
    };
  },

  toBeValidBackup(received) {
    const hasTimestamp = received && received.timestamp;
    const hasData = received && received.data && typeof received.data === 'object';
    
    if (!hasTimestamp || !hasData) {
      return {
        message: () => `النسخة الاحتياطية غير صالحة - يجب أن تحتوي على timestamp و data`,
        pass: false
      };
    }

    return {
      message: () => `النسخة الاحتياطية صالحة`,
      pass: true
    };
  }
});

// Error boundary for React components in tests
export class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>;
    }

    return this.props.children;
  }
}

console.log('🧪 Jest setup completed for SPSA project tests');
