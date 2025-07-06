// vitest.setup.js
/**
 * Vitest setup configuration
 * إعدادات Vitest للاختبارات
 */

import { beforeAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Canvas API for HTMLCanvasElement tests
// محاكاة Canvas API لاختبارات HTMLCanvasElement
beforeAll(() => {
  // Mock HTMLCanvasElement.prototype.toDataURL
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock-canvas-data');
  
  // Mock HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
    if (contextType === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Array(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Array(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        fillText: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
      };
    }
    return null;
  });
});

// Mock environment variables for tests
// محاكاة متغيرات البيئة للاختبارات
beforeEach(() => {
  // Set up environment variables
  import.meta.env = {
    ...import.meta.env,
    VITE_APP_ENV: 'test',
    VITE_APP_URL: 'http://localhost:5173',
    VITE_API_URL: 'http://localhost:3001/api',
    VITE_SUPABASE_URL: 'https://dufvobubfjicrkygwyll.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.test-signature',
    VITE_ENABLE_SUPABASE_FALLBACK: 'true',
    VITE_USE_NEW_AUTH: 'false',
    VITE_ENABLE_NEW_BACKEND: 'false',
    VITE_ENABLE_DEBUG_MODE: 'true',
    VITE_ENABLE_REAL_TIME_FEATURES: 'false',
    VITE_ENABLE_WEBSOCKET: 'false',
    VITE_ENABLE_NOTIFICATION_SYSTEM: 'false',
    NODE_ENV: 'test',
  };

  // Mock ENV object for services
  global.ENV = {
    APP_ENV: 'test',
    VITE_APP_ENV: 'test',
    IS_DEVELOPMENT: true,
    IS_PRODUCTION: false,
    SESSION: {
      TIMEOUT: 30 * 60 * 1000, // 30 minutes
      REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
      REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
    },
    FEATURES: {
      USE_NEW_AUTH: false,
      ENABLE_DEBUG_MODE: true,
      ENABLE_REAL_TIME_FEATURES: false,
      ENABLE_WEBSOCKET: false,
      ENABLE_NOTIFICATION_SYSTEM: false,
    },
    API: {
      BASE_URL: 'http://localhost:3001/api',
      TIMEOUT: 10000,
      RETRY_ATTEMPTS: 3,
    },
    SUPABASE: {
      URL: 'https://dufvobubfjicrkygwyll.supabase.co',
      ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.test-signature',
      ENABLE_FALLBACK: true,
    },
  };

  // Mock window.matchMedia for responsive tests
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
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  });

  // Mock fetch for API calls
  global.fetch = vi.fn();

  // Mock WebSocket
  global.WebSocket = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }));

  // Mock Notification API
  global.Notification = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  
  // Mock Notification.permission
  Object.defineProperty(Notification, 'permission', {
    value: 'granted',
    writable: true,
  });
  
  // Mock Notification.requestPermission
  Notification.requestPermission = vi.fn().mockResolvedValue('granted');
});

// Clean up after each test
// تنظيف بعد كل اختبار
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Mock console methods to reduce noise in tests
// محاكاة console لتقليل الضوضاء في الاختبارات
const originalConsole = { ...console };
beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  // Restore console for debugging if needed
  if (process.env.VITEST_DEBUG) {
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});

// Mock environment module
vi.mock('./src/config/environment', () => ({
  ENV: {
    APP_ENV: 'test',
    VITE_APP_ENV: 'test',
    IS_DEVELOPMENT: true,
    IS_PRODUCTION: false,
    SESSION: {
      TIMEOUT: 30 * 60 * 1000, // 30 minutes
      REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
      REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
    },
    FEATURES: {
      USE_NEW_AUTH: false,
      ENABLE_DEBUG_MODE: true,
      ENABLE_REAL_TIME_FEATURES: false,
      ENABLE_WEBSOCKET: false,
      ENABLE_NOTIFICATION_SYSTEM: false,
    },
    API: {
      BASE_URL: 'http://localhost:3001/api',
      TIMEOUT: 10000,
      RETRY_ATTEMPTS: 3,
    },
    SUPABASE: {
      URL: 'https://dufvobubfjicrkygwyll.supabase.co',
      ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.test-signature',
      ENABLE_FALLBACK: true,
    },
  },
  getEnvVar: vi.fn((key, defaultValue) => {
    const envVars = {
      'VITE_APP_ENV': 'test',
      'VITE_USE_NEW_AUTH': 'false',
      'VITE_ENABLE_DEBUG_MODE': 'true',
      'VITE_ENABLE_REAL_TIME_FEATURES': 'false',
      'VITE_ENABLE_WEBSOCKET': 'false',
      'VITE_ENABLE_NOTIFICATION_SYSTEM': 'false',
    };
    return envVars[key] || defaultValue;
  }),
}));
