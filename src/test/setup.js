import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// إعداد البيئة قبل جميع الاختبارات
beforeAll(() => {
  // Mock environment variables
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_APP_ENV: 'test',
      VITE_APP_URL: 'http://localhost:3000',
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_ENCRYPTION_KEY: 'test_32_character_encryption_key_123',
      VITE_CSRF_SECRET: 'test_csrf_secret_key_for_testing',
      VITE_ENABLE_ANALYTICS: 'false',
      VITE_ENABLE_DEBUG: 'false',
      VITE_ENABLE_MOCK_AUTH: 'true',
      VITE_RATE_LIMIT_REQUESTS: '1000',
      VITE_RATE_LIMIT_WINDOW: '900000',
      VITE_SESSION_TIMEOUT: '3600000',
      VITE_REMEMBER_ME_DURATION: '86400000'
    },
    writable: true
  });

  // Mock Canvas API
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
    if (contextType === '2d') {
      return {
        textBaseline: '',
        font: '',
        fillText: vi.fn(),
        toDataURL: vi.fn(() => 'data:image/png;base64,test')
      };
    }
    return null;
  });

  // Mock crypto API
  if (!global.crypto) {
    global.crypto = {
      getRandomValues: vi.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      subtle: {
        importKey: vi.fn(() => Promise.resolve({})),
        deriveKey: vi.fn(() => Promise.resolve({})),
        deriveBits: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
        encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
        decrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
      }
    };
  }
});

// تنظيف بعد كل اختبار
afterEach(() => {
  cleanup()
  // Clear storage mocks
  vi.clearAllMocks()
})

// Mock للـ localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; }),
}
global.localStorage = localStorageMock

// Mock للـ sessionStorage
const sessionStorageMock = {
  store: {},
  getItem: vi.fn((key) => sessionStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { sessionStorageMock.store[key] = value; }),
  removeItem: vi.fn((key) => { delete sessionStorageMock.store[key]; }),
  clear: vi.fn(() => { sessionStorageMock.store = {}; }),
}
global.sessionStorage = sessionStorageMock

// Mock للـ window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock للـ IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock للـ ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock للـ window.scrollTo
global.scrollTo = vi.fn()
